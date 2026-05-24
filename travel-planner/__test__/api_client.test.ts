jest.mock("@sentry/react-native", () => ({
  startSpan: (_opts: unknown, fn: () => unknown) => fn(),
  setContext: jest.fn(),
  captureException: jest.fn(),
}));

jest.mock("@/lib/onboarding-store", () => ({
  getOnboardingState: () => ({
    destination: { id: "hanoi", name: "Hà Nội" },
    dates: { start: "2026-06-01", end: "2026-06-03", flexible: false },
    people: { adult: 2, child: 1, infant: 0, pet: 0 },
    budget: 6_000_000,
    interests: ["Văn hoá", "Ẩm thực"],
  }),
}));

jest.mock("@/lib/presentation", () => ({ PRESENT_MODE: false }));

import * as api from "@/lib/api-client";
import type {
  Activity,
  FixActivityRequest,
  TravelPreference,
} from "@/lib/types";

const samplePref: TravelPreference = {
  destinationId: "hanoi",
  destinationName: "Hà Nội",
  budget: { type: "exact", exactBudget: 5_000_000 },
  people: { adults: 2, children: 1, infants: 0, pets: 0 },
  travelTime: { type: "fixed", startDate: "2026-06-01", endDate: "2026-06-03" },
  personalOptions: [{ type: "interest", name: "Văn hoá" }],
};

const sampleActivity: Activity = {
  id: "place-1",
  type: "place",
  name: "Hồ Hoàn Kiếm",
  startTime: "08:30",
  endTime: "10:30",
  description: "Trung tâm Hà Nội.",
  address: "Hoàn Kiếm, Hà Nội",
  priceEstimate: 50_000,
  imageUrls: [],
  rating: 4.7,
  reviewCount: 12450,
  categories: ["Văn hoá"],
};

const isoLike = /^\d{4}-\d{2}-\d{2}/;

describe("api-client config", () => {
  it("USE_REAL_API defaults to false", () => {
    expect(api.USE_REAL_API).toBe(false);
  });

  it("BACKEND_BASE_URL is an http(s) url", () => {
    expect(api.BACKEND_BASE_URL).toMatch(/^https?:\/\/[^/]+/);
  });

  it("AI_BASE_URL is an http(s) url", () => {
    expect(api.AI_BASE_URL).toMatch(/^https?:\/\/[^/]+/);
  });

  it("BACKEND and AI urls are not equal (different services)", () => {
    expect(api.BACKEND_BASE_URL).not.toBe(api.AI_BASE_URL);
  });
});

describe("api-client auth", () => {
  it("login returns access + refresh tokens", async () => {
    const res = await api.login("traveler@example.com", "pw");
    expect(res.accessToken).toBeTruthy();
    expect(res.refreshToken).toBeTruthy();
  });

  it("login user.email matches input", async () => {
    const res = await api.login("traveler@example.com", "pw");
    expect(res.user.email).toBe("traveler@example.com");
  });

  it("login derives a fallback firstName from the email local part", async () => {
    const res = await api.login("alpha.beta@example.com", "pw");
    expect(res.user.firstName.length).toBeGreaterThan(0);
  });

  it("register sets first and last names exactly as given", async () => {
    const res = await api.register({
      email: "new1@example.com",
      password: "pw",
      firstName: "An",
      lastName: "Nguyễn",
    });
    expect(res.user.firstName).toBe("An");
    expect(res.user.lastName).toBe("Nguyễn");
  });

  it("register generates a fresh user id", async () => {
    const a = await api.register({
      email: "a@x.com",
      password: "pw",
      firstName: "A",
      lastName: "X",
    });
    const b = await api.register({
      email: "b@x.com",
      password: "pw",
      firstName: "B",
      lastName: "X",
    });
    expect(a.user.id).not.toBe(b.user.id);
  });

  it("register switches the current session (next createComment author reflects new user)", async () => {
    await api.register({
      email: "author@x.com",
      password: "pw",
      firstName: "Author",
      lastName: "Test",
    });
    const c = await api.createComment({
      activityId: "place-2",
      content: "kiểm tra tác giả",
    });
    expect(c.author).toContain("Author");
  });
});

describe("api-client trips - shape", () => {
  it("createTrip returns a tripId prefixed 'trip-'", async () => {
    const t = await api.createTrip();
    expect(t.tripId).toMatch(/^trip-/);
  });

  it("createTrip carries destination id + name from onboarding", async () => {
    const t = await api.createTrip();
    expect(t.destinationId).toBe("hanoi");
    expect(t.destinationName).toBe("Hà Nội");
  });

  it("createTrip status starts as 'draft'", async () => {
    const t = await api.createTrip();
    expect(t.status).toBe("draft");
  });

  it("createTrip budget mirrors onboarding budget", async () => {
    const t = await api.createTrip();
    expect(t.budget).toBe(6_000_000);
  });

  it("createTrip plan length equals the inclusive day count", async () => {
    const t = await api.createTrip();
    expect(t.planByDay.length).toBe(3);
  });

  it("createTrip plan dates are sequential ISO yyyy-mm-dd", async () => {
    const t = await api.createTrip();
    const dates = t.planByDay.map((d) => d.date);
    expect(dates).toEqual(["2026-06-01", "2026-06-02", "2026-06-03"]);
    for (const d of dates) expect(d).toMatch(isoLike);
  });

  it("each day has exactly three segments in morning/afternoon/evening order", async () => {
    const t = await api.createTrip();
    for (const day of t.planByDay) {
      expect(day.segments.map((s) => s.timeOfDay)).toEqual([
        "morning",
        "afternoon",
        "evening",
      ]);
    }
  });

  it("every segment has at least one activity", async () => {
    const t = await api.createTrip();
    for (const day of t.planByDay) {
      for (const seg of day.segments) {
        expect(seg.activities.length).toBeGreaterThan(0);
      }
    }
  });

  it("every activity has a unique activityId across the whole trip", async () => {
    const t = await api.createTrip();
    const ids = t.planByDay.flatMap((d) =>
      d.segments.flatMap((s) => s.activities.map((a) => a.activityId!)),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every activity declares a recognised type", async () => {
    const t = await api.createTrip();
    const allowed = new Set(["place", "restaurant", "accommodation"]);
    for (const day of t.planByDay)
      for (const seg of day.segments)
        for (const a of seg.activities) expect(allowed.has(a.type)).toBe(true);
  });

  it("createTrip writes a populated TravelPreference", async () => {
    const t = await api.createTrip();
    expect(t.preference.destinationId).toBe("hanoi");
    expect(t.preference.people.adults).toBe(2);
    expect(t.preference.people.children).toBe(1);
    expect(t.preference.budget.exactBudget).toBe(6_000_000);
    expect(t.preference.personalOptions.map((o) => o.name)).toEqual([
      "Văn hoá",
      "Ẩm thực",
    ]);
  });

  it("dailyTips is present on each day", async () => {
    const t = await api.createTrip();
    for (const d of t.planByDay) expect(typeof d.dailyTips).toBe("string");
  });
});

describe("api-client trips - listing + lookup", () => {
  it("getMyTrips returns newest first", async () => {
    const a = await api.createTrip();
    const b = await api.createTrip();
    const list = await api.getMyTrips();
    expect(list[0].tripId).toBe(b.tripId);
    expect(list[1].tripId).toBe(a.tripId);
  });

  it("getMyTrips length grows by 1 per createTrip", async () => {
    const before = (await api.getMyTrips()).length;
    await api.createTrip();
    const after = (await api.getMyTrips()).length;
    expect(after).toBe(before + 1);
  });

  it("getTripById returns the same object as createTrip", async () => {
    const t = await api.createTrip();
    const got = await api.getTripById(t.tripId);
    expect(got?.tripId).toBe(t.tripId);
    expect(got?.tripName).toBe(t.tripName);
  });

  it("getTripById returns null for unknown ids", async () => {
    expect(await api.getTripById("trip-missing-xyz")).toBeNull();
  });
});

describe("api-client trips - mutation", () => {
  it("saveTrip flips status from draft to saved", async () => {
    const t = await api.createTrip();
    expect(t.status).toBe("draft");
    const saved = await api.saveTrip(t.tripId);
    expect(saved?.status).toBe("saved");
  });

  it("saveTrip returns null for unknown tripId", async () => {
    expect(await api.saveTrip("nope")).toBeNull();
  });

  it("saveTrip persists across subsequent getTripById", async () => {
    const t = await api.createTrip();
    await api.saveTrip(t.tripId);
    expect((await api.getTripById(t.tripId))?.status).toBe("saved");
  });

  it("updateActivity returns the replacement and writes through to the trip", async () => {
    const t = await api.createTrip();
    const replacement: Activity = {
      ...sampleActivity,
      activityId: "act-replaced",
    };
    const result = await api.updateActivity(t.tripId, 0, 0, 0, replacement);
    expect(result?.activityId).toBe("act-replaced");
    const refreshed = await api.getTripById(t.tripId);
    expect(refreshed?.planByDay[0].segments[0].activities[0].activityId).toBe(
      "act-replaced",
    );
  });

  it("updateActivity returns null for unknown tripId", async () => {
    expect(
      await api.updateActivity("trip-missing", 0, 0, 0, sampleActivity),
    ).toBeNull();
  });

  it("updateActivity returns null for out-of-range segment index", async () => {
    const t = await api.createTrip();
    expect(
      await api.updateActivity(t.tripId, 0, 99, 0, sampleActivity),
    ).toBeNull();
  });

  it("updateActivity returns null for out-of-range day index", async () => {
    const t = await api.createTrip();
    expect(
      await api.updateActivity(t.tripId, 99, 0, 0, sampleActivity),
    ).toBeNull();
  });
});

describe("api-client activity detail", () => {
  it("returns a place by id", async () => {
    const a = await api.getActivityDetail("place-1");
    expect(a?.id).toBe("place-1");
    expect(a?.type).toBe("place");
  });

  it("returns a restaurant by id", async () => {
    const a = await api.getActivityDetail("rest-1");
    expect(a?.type).toBe("restaurant");
  });

  it("returns an accommodation by id", async () => {
    const a = await api.getActivityDetail("acc-1");
    expect(a?.type).toBe("accommodation");
  });

  it("returns null for unknown ids", async () => {
    expect(await api.getActivityDetail("ghost")).toBeNull();
  });

  it("detail includes name, address, price, rating", async () => {
    const a = await api.getActivityDetail("place-1");
    expect(a?.name.length).toBeGreaterThan(0);
    expect(a?.address.length).toBeGreaterThan(0);
    expect(typeof a?.priceEstimate).toBe("number");
    expect(typeof a?.rating).toBe("number");
  });
});

describe("api-client fixActivity", () => {
  const baseReq = (
    overrides: Partial<FixActivityRequest> = {},
  ): FixActivityRequest => ({
    activity: sampleActivity,
    comment: "tôi muốn nơi rẻ hơn",
    travelPreference: samplePref,
    ...overrides,
  });

  it("returns 3 suggestions of the same type", async () => {
    const res = await api.fixActivity(baseReq());
    expect(res.suggestionType).toBe("place");
    expect(res.suggestionList).toHaveLength(3);
    for (const s of res.suggestionList) expect(s.type).toBe("place");
  });

  it("never includes the original activity id", async () => {
    const res = await api.fixActivity(baseReq());
    for (const s of res.suggestionList)
      expect(s.id).not.toBe(sampleActivity.id);
  });

  it("each suggestion gets a fresh activityId prefixed 'act-'", async () => {
    const res = await api.fixActivity(baseReq());
    for (const s of res.suggestionList) expect(s.activityId).toMatch(/^act-/);
  });

  it("respects the activity type when fixing a restaurant", async () => {
    const restaurant: Activity = {
      ...sampleActivity,
      id: "rest-1",
      type: "restaurant",
    };
    const res = await api.fixActivity(baseReq({ activity: restaurant }));
    expect(res.suggestionType).toBe("restaurant");
    for (const s of res.suggestionList) expect(s.type).toBe("restaurant");
  });

  it("cheap hint biases toward cheaper alternatives on average", async () => {
    const expensive: Activity = { ...sampleActivity, priceEstimate: 500_000 };
    const cheapReq = baseReq({
      activity: expensive,
      comment: "rẻ hơn cheap budget",
    });
    const neutralReq = baseReq({ activity: expensive, comment: "" });
    const cheap = await api.fixActivity(cheapReq);
    const neutral = await api.fixActivity(neutralReq);
    const avg = (xs: Activity[]) =>
      xs.reduce((s, a) => s + a.priceEstimate, 0) / xs.length;
    expect(avg(cheap.suggestionList)).toBeLessThanOrEqual(
      avg(neutral.suggestionList) + 1,
    );
  });
});

describe("api-client comments", () => {
  it("createComment returns a record with id, author, date, content", async () => {
    const c = await api.createComment({
      activityId: "place-1",
      content: "tốt",
    });
    expect(c.id).toMatch(/^cmt-/);
    expect(c.activityId).toBe("place-1");
    expect(c.content).toBe("tốt");
    expect(c.date).toMatch(isoLike);
    expect(c.author.length).toBeGreaterThan(0);
  });

  it("getComments returns only comments for the requested activity", async () => {
    await api.createComment({ activityId: "place-1", content: "p1" });
    await api.createComment({ activityId: "rest-1", content: "r1" });
    const placeOnly = await api.getComments("place-1");
    expect(placeOnly.every((c) => c.activityId === "place-1")).toBe(true);
    expect(placeOnly.some((c) => c.content === "p1")).toBe(true);
  });

  it("getComments returns an empty array for an activity with no comments", async () => {
    const list = await api.getComments("never-commented-on-id");
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(0);
  });

  it("createComment increases the count for that activity by exactly 1", async () => {
    const before = (await api.getComments("place-3")).length;
    await api.createComment({ activityId: "place-3", content: "x" });
    const after = (await api.getComments("place-3")).length;
    expect(after).toBe(before + 1);
  });
});

describe("api-client expense users", () => {
  it("getExpenseUsers seeds the current user when none exist", async () => {
    const trip = await api.createTrip();
    const users = await api.getExpenseUsers(trip.tripId);
    expect(users.length).toBeGreaterThanOrEqual(1);
    expect(users[0].tripId).toBe(trip.tripId);
  });

  it("getExpenseUsers is idempotent (does not duplicate the seed user)", async () => {
    const trip = await api.createTrip();
    const a = (await api.getExpenseUsers(trip.tripId)).length;
    const b = (await api.getExpenseUsers(trip.tripId)).length;
    expect(b).toBe(a);
  });

  it("addExpenseUser appends a user scoped to the trip", async () => {
    const trip = await api.createTrip();
    await api.getExpenseUsers(trip.tripId);
    const before = await api.getExpenseUsers(trip.tripId);
    const u = await api.addExpenseUser(trip.tripId, "Bạn A");
    const after = await api.getExpenseUsers(trip.tripId);
    expect(after.length).toBe(before.length + 1);
    expect(u.tripId).toBe(trip.tripId);
    expect(u.name).toBe("Bạn A");
  });

  it("users from one trip do not appear in another trip", async () => {
    const t1 = await api.createTrip();
    const t2 = await api.createTrip();
    await api.addExpenseUser(t1.tripId, "Chỉ T1");
    const t2users = await api.getExpenseUsers(t2.tripId);
    expect(t2users.find((u) => u.name === "Chỉ T1")).toBeUndefined();
  });
});

describe("api-client expense items", () => {
  it("addExpense persists and getExpenses returns it", async () => {
    const trip = await api.createTrip();
    const [me] = await api.getExpenseUsers(trip.tripId);
    const exp = await api.addExpense({
      tripId: trip.tripId,
      expenseName: "Phở",
      expenseType: "food",
      amount: 90_000,
      paidByUserId: me.id,
      paidByName: me.name,
      splitBetween: [me.id],
    });
    const list = await api.getExpenses(trip.tripId);
    expect(list.some((e) => e.expenseId === exp.expenseId)).toBe(true);
  });

  it("expense createdAt is an ISO string", async () => {
    const trip = await api.createTrip();
    const [me] = await api.getExpenseUsers(trip.tripId);
    const exp = await api.addExpense({
      tripId: trip.tripId,
      expenseName: "x",
      expenseType: "other",
      amount: 1,
      paidByUserId: me.id,
      paidByName: me.name,
      splitBetween: [me.id],
    });
    expect(exp.createdAt).toMatch(isoLike);
  });

  it("getExpenses scopes by tripId", async () => {
    const t1 = await api.createTrip();
    const t2 = await api.createTrip();
    const [me1] = await api.getExpenseUsers(t1.tripId);
    await api.addExpense({
      tripId: t1.tripId,
      expenseName: "T1 only",
      expenseType: "food",
      amount: 10,
      paidByUserId: me1.id,
      paidByName: me1.name,
      splitBetween: [me1.id],
    });
    const t2list = await api.getExpenses(t2.tripId);
    expect(t2list.find((e) => e.expenseName === "T1 only")).toBeUndefined();
  });
});

describe("api-client expense balance math", () => {
  it("solo trip self-paid expense yields zero balance for the payer", async () => {
    const trip = await api.createTrip();
    const [me] = await api.getExpenseUsers(trip.tripId);
    await api.addExpense({
      tripId: trip.tripId,
      expenseName: "Cà phê",
      expenseType: "food",
      amount: 80_000,
      paidByUserId: me.id,
      paidByName: me.name,
      splitBetween: [me.id],
    });
    const balances = await api.getExpenseBalance(trip.tripId);
    expect(balances.find((b) => b.userId === me.id)?.balance).toBe(0);
  });

  it("2-way split: payer +half, friend -half", async () => {
    const trip = await api.createTrip();
    const [me] = await api.getExpenseUsers(trip.tripId);
    const friend = await api.addExpenseUser(trip.tripId, "Bạn B");
    await api.addExpense({
      tripId: trip.tripId,
      expenseName: "Taxi",
      expenseType: "transport",
      amount: 200_000,
      paidByUserId: me.id,
      paidByName: me.name,
      splitBetween: [me.id, friend.id],
    });
    const b = await api.getExpenseBalance(trip.tripId);
    expect(b.find((x) => x.userId === me.id)?.balance).toBe(100_000);
    expect(b.find((x) => x.userId === friend.id)?.balance).toBe(-100_000);
  });

  it("3-way split distributes shares evenly (within rounding)", async () => {
    const trip = await api.createTrip();
    const [me] = await api.getExpenseUsers(trip.tripId);
    const f1 = await api.addExpenseUser(trip.tripId, "F1");
    const f2 = await api.addExpenseUser(trip.tripId, "F2");
    await api.addExpense({
      tripId: trip.tripId,
      expenseName: "Hotel",
      expenseType: "accommodation",
      amount: 900_000,
      paidByUserId: me.id,
      paidByName: me.name,
      splitBetween: [me.id, f1.id, f2.id],
    });
    const b = await api.getExpenseBalance(trip.tripId);
    expect(b.find((x) => x.userId === me.id)?.balance).toBe(600_000);
    expect(b.find((x) => x.userId === f1.id)?.balance).toBe(-300_000);
    expect(b.find((x) => x.userId === f2.id)?.balance).toBe(-300_000);
    const sum = b.reduce((s, x) => s + x.balance, 0);
    expect(Math.abs(sum)).toBeLessThanOrEqual(1);
  });

  it("balances are returned as integers (rounded)", async () => {
    const trip = await api.createTrip();
    const [me] = await api.getExpenseUsers(trip.tripId);
    const f1 = await api.addExpenseUser(trip.tripId, "F1");
    const f2 = await api.addExpenseUser(trip.tripId, "F2");
    await api.addExpense({
      tripId: trip.tripId,
      expenseName: "odd",
      expenseType: "other",
      amount: 100,
      paidByUserId: me.id,
      paidByName: me.name,
      splitBetween: [me.id, f1.id, f2.id],
    });
    for (const b of await api.getExpenseBalance(trip.tripId)) {
      expect(Number.isInteger(b.balance)).toBe(true);
    }
  });

  it("two expenses paid by different users net out correctly", async () => {
    const trip = await api.createTrip();
    const [me] = await api.getExpenseUsers(trip.tripId);
    const friend = await api.addExpenseUser(trip.tripId, "B");
    await api.addExpense({
      tripId: trip.tripId,
      expenseName: "A pays",
      expenseType: "food",
      amount: 200_000,
      paidByUserId: me.id,
      paidByName: me.name,
      splitBetween: [me.id, friend.id],
    });
    await api.addExpense({
      tripId: trip.tripId,
      expenseName: "B pays",
      expenseType: "food",
      amount: 200_000,
      paidByUserId: friend.id,
      paidByName: friend.name,
      splitBetween: [me.id, friend.id],
    });
    const b = await api.getExpenseBalance(trip.tripId);
    expect(b.find((x) => x.userId === me.id)?.balance).toBe(0);
    expect(b.find((x) => x.userId === friend.id)?.balance).toBe(0);
  });
});

describe("api-client expense summary", () => {
  it("empty trip summary has zero total and zero counts", async () => {
    const trip = await api.createTrip();
    const s = await api.getExpenseSummary(trip.tripId);
    expect(s.total).toBe(0);
    expect(s.count).toBe(0);
    expect(s.byType.food).toBe(0);
    expect(s.byType.transport).toBe(0);
    expect(s.byType.accommodation).toBe(0);
    expect(s.byType.activity).toBe(0);
    expect(s.byType.other).toBe(0);
  });

  it("summary sums amounts by type", async () => {
    const trip = await api.createTrip();
    const [me] = await api.getExpenseUsers(trip.tripId);
    await api.addExpense({
      tripId: trip.tripId,
      expenseName: "Bún",
      expenseType: "food",
      amount: 50_000,
      paidByUserId: me.id,
      paidByName: me.name,
      splitBetween: [me.id],
    });
    await api.addExpense({
      tripId: trip.tripId,
      expenseName: "Bún 2",
      expenseType: "food",
      amount: 60_000,
      paidByUserId: me.id,
      paidByName: me.name,
      splitBetween: [me.id],
    });
    await api.addExpense({
      tripId: trip.tripId,
      expenseName: "Vé tàu",
      expenseType: "transport",
      amount: 300_000,
      paidByUserId: me.id,
      paidByName: me.name,
      splitBetween: [me.id],
    });
    const s = await api.getExpenseSummary(trip.tripId);
    expect(s.byType.food).toBe(110_000);
    expect(s.byType.transport).toBe(300_000);
    expect(s.total).toBe(410_000);
    expect(s.count).toBe(3);
  });

  it("summary.count matches getExpenses length", async () => {
    const trip = await api.createTrip();
    const [me] = await api.getExpenseUsers(trip.tripId);
    await api.addExpense({
      tripId: trip.tripId,
      expenseName: "x",
      expenseType: "activity",
      amount: 1,
      paidByUserId: me.id,
      paidByName: me.name,
      splitBetween: [me.id],
    });
    const s = await api.getExpenseSummary(trip.tripId);
    const list = await api.getExpenses(trip.tripId);
    expect(s.count).toBe(list.length);
  });
});

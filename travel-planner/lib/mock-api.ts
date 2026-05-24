import type {
  Activity,
  ActivityType,
  AuthResponse,
  Comment,
  DayPlan,
  Expense,
  ExpenseBalance,
  ExpenseSummary,
  ExpenseType,
  ExpenseUser,
  FixActivityRequest,
  FixActivityResponse,
  Segment,
  TravelPreference,
  Trip,
  User,
} from "./types";
import { getOnboardingState } from "./onboarding-store";
import { PRESENT_MODE } from "./presentation";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));
const uid = (prefix = "id") =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const PLACE_POOL: Activity[] = [
  {
    id: "place-1",
    type: "place",
    name: "Hồ Hoàn Kiếm & Đền Ngọc Sơn",
    startTime: "08:30",
    endTime: "10:30",
    description: "Trái tim lịch sử của Hà Nội với cầu Thê Húc đỏ rực và đền Ngọc Sơn linh thiêng.",
    address: "Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội",
    priceEstimate: 50000,
    imageUrls: [],
    rating: 4.7,
    reviewCount: 12450,
    categories: ["Văn hoá", "Lịch sử", "Cảnh quan"],
    openingHours: "07:00 - 18:00",
    duration: "1.5 - 2 giờ",
    priceRange: "Dưới 100.000đ",
    reviews: [
      { id: "r1", author: "Mai Lan", rating: 5, comment: "Không gian thanh bình giữa lòng thủ đô.", date: "2025-08-12" },
      { id: "r2", author: "Tuấn Anh", rating: 4, comment: "Buổi sáng sớm cực kỳ đẹp, nên đi dạo.", date: "2025-07-30" },
    ],
    mapQuery: "Hồ Hoàn Kiếm, Hà Nội",
  },
  {
    id: "place-2",
    type: "place",
    name: "Văn Miếu - Quốc Tử Giám",
    startTime: "09:00",
    endTime: "11:00",
    description: "Trường đại học đầu tiên của Việt Nam, kiến trúc nho học cổ kính.",
    address: "58 Quốc Tử Giám, Đống Đa, Hà Nội",
    priceEstimate: 70000,
    imageUrls: [],
    rating: 4.6,
    reviewCount: 8920,
    categories: ["Lịch sử", "Văn hoá"],
    openingHours: "08:00 - 17:00",
    duration: "1.5 giờ",
    priceRange: "Dưới 100.000đ",
    reviews: [
      { id: "r3", author: "Hà Linh", rating: 5, comment: "Đậm chất văn hoá, đáng để ghé thăm.", date: "2025-09-01" },
    ],
    mapQuery: "Văn Miếu Quốc Tử Giám",
  },
  {
    id: "place-3",
    type: "place",
    name: "Bảo tàng Dân tộc học Việt Nam",
    startTime: "14:00",
    endTime: "16:30",
    description: "Khám phá di sản văn hoá đặc sắc của 54 dân tộc anh em.",
    address: "Nguyễn Văn Huyên, Cầu Giấy, Hà Nội",
    priceEstimate: 200000,
    imageUrls: [],
    rating: 4.8,
    reviewCount: 5430,
    categories: ["Bảo tàng", "Văn hoá", "Giáo dục"],
    openingHours: "08:30 - 17:30 (Đóng cửa thứ 2)",
    duration: "2 - 3 giờ",
    priceRange: "100.000 - 300.000đ",
    reviews: [
      { id: "r4", author: "Quốc Bảo", rating: 5, comment: "Thông tin phong phú, không gian đẹp.", date: "2025-08-20" },
    ],
    mapQuery: "Bảo tàng Dân tộc học Việt Nam",
  },
  {
    id: "place-4",
    type: "place",
    name: "Phố Cổ Hà Nội",
    startTime: "16:00",
    endTime: "19:00",
    description: "Dạo bộ qua 36 phố phường với kiến trúc cổ và không khí sôi động.",
    address: "Hoàn Kiếm, Hà Nội",
    priceEstimate: 0,
    imageUrls: [],
    rating: 4.5,
    reviewCount: 22300,
    categories: ["Văn hoá", "Mua sắm", "Đi bộ"],
    openingHours: "Cả ngày",
    duration: "2 - 4 giờ",
    priceRange: "Miễn phí",
    mapQuery: "Phố Cổ Hà Nội",
  },
  {
    id: "place-5",
    type: "place",
    name: "Lăng Chủ tịch Hồ Chí Minh",
    startTime: "08:00",
    endTime: "10:00",
    description: "Di tích lịch sử quan trọng của dân tộc Việt Nam.",
    address: "Số 2 Hùng Vương, Ba Đình, Hà Nội",
    priceEstimate: 0,
    imageUrls: [],
    rating: 4.6,
    reviewCount: 15200,
    categories: ["Lịch sử", "Di tích"],
    openingHours: "07:30 - 10:30 (Thứ 2, 6 đóng cửa)",
    duration: "1 - 2 giờ",
    priceRange: "Miễn phí",
    mapQuery: "Lăng Bác Hà Nội",
  },
  {
    id: "place-6",
    type: "place",
    name: "Hồ Tây - Chùa Trấn Quốc",
    startTime: "16:30",
    endTime: "18:30",
    description: "Hồ nước ngọt lớn nhất Hà Nội với ngôi chùa cổ nhất thành phố.",
    address: "Thanh Niên, Tây Hồ, Hà Nội",
    priceEstimate: 0,
    imageUrls: [],
    rating: 4.7,
    reviewCount: 9870,
    categories: ["Tâm linh", "Cảnh quan"],
    openingHours: "07:30 - 11:30, 13:30 - 17:30",
    duration: "1.5 giờ",
    priceRange: "Miễn phí",
    mapQuery: "Chùa Trấn Quốc Hà Nội",
  },
];

const RESTAURANT_POOL: Activity[] = [
  {
    id: "rest-1",
    type: "restaurant",
    name: "Phở Bát Đàn",
    startTime: "08:00",
    endTime: "09:00",
    description: "Quán phở gia truyền hơn 60 năm, nước dùng đậm đà.",
    address: "49 Bát Đàn, Hoàn Kiếm, Hà Nội",
    priceEstimate: 80000,
    imageUrls: [],
    rating: 4.4,
    reviewCount: 3200,
    categories: ["Phở", "Truyền thống"],
    openingHours: "06:00 - 10:30, 18:00 - 20:30",
    duration: "30 - 45 phút",
    phone: "024 3823 5651",
    priceRange: "50.000 - 100.000đ",
    reviews: [
      { id: "r5", author: "Đức Minh", rating: 5, comment: "Phở chuẩn vị Hà Nội xưa.", date: "2025-09-15" },
    ],
    mapQuery: "Phở Bát Đàn Hà Nội",
  },
  {
    id: "rest-2",
    type: "restaurant",
    name: "Bún Chả Hương Liên",
    startTime: "12:00",
    endTime: "13:30",
    description: "Bún chả Obama nổi tiếng, vị thịt nướng đậm đà.",
    address: "24 Lê Văn Hưu, Hai Bà Trưng, Hà Nội",
    priceEstimate: 120000,
    imageUrls: [],
    rating: 4.3,
    reviewCount: 5600,
    categories: ["Bún chả", "Đặc sản"],
    openingHours: "08:00 - 21:00",
    duration: "45 phút - 1 giờ",
    phone: "024 3943 4106",
    priceRange: "100.000 - 200.000đ",
    mapQuery: "Bún chả Hương Liên",
  },
  {
    id: "rest-3",
    type: "restaurant",
    name: "Chả Cá Lã Vọng",
    startTime: "19:00",
    endTime: "20:30",
    description: "Đặc sản chả cá nổi tiếng từ thế kỷ 19.",
    address: "14 Chả Cá, Hoàn Kiếm, Hà Nội",
    priceEstimate: 350000,
    imageUrls: [],
    rating: 4.2,
    reviewCount: 2800,
    categories: ["Hải sản", "Truyền thống"],
    openingHours: "11:00 - 14:00, 17:00 - 21:00",
    duration: "1 - 1.5 giờ",
    priceRange: "300.000 - 500.000đ",
    mapQuery: "Chả Cá Lã Vọng",
  },
  {
    id: "rest-4",
    type: "restaurant",
    name: "Cà Phê Giảng",
    startTime: "10:00",
    endTime: "11:00",
    description: "Cà phê trứng gốc Hà Nội, hương vị đặc trưng béo ngậy.",
    address: "39 Nguyễn Hữu Huân, Hoàn Kiếm, Hà Nội",
    priceEstimate: 45000,
    imageUrls: [],
    rating: 4.5,
    reviewCount: 7100,
    categories: ["Cà phê", "Đặc sản"],
    openingHours: "07:00 - 22:00",
    duration: "30 - 45 phút",
    priceRange: "Dưới 100.000đ",
    mapQuery: "Cà phê Giảng Nguyễn Hữu Huân",
  },
  {
    id: "rest-5",
    type: "restaurant",
    name: "Quán Ăn Ngon",
    startTime: "18:30",
    endTime: "20:00",
    description: "Tổng hợp món ăn ba miền trong không gian xưa.",
    address: "18 Phan Bội Châu, Hoàn Kiếm, Hà Nội",
    priceEstimate: 280000,
    imageUrls: [],
    rating: 4.1,
    reviewCount: 4500,
    categories: ["Ba miền", "Gia đình"],
    openingHours: "06:30 - 22:00",
    duration: "1 - 1.5 giờ",
    priceRange: "200.000 - 400.000đ",
    mapQuery: "Quán Ăn Ngon Phan Bội Châu",
  },
];

const ACCOMMODATION_POOL: Activity[] = [
  {
    id: "acc-1",
    type: "accommodation",
    name: "Hanoi Old Quarter Boutique",
    startTime: "14:00",
    description: "Khách sạn boutique giữa phố cổ, view phố nhộn nhịp.",
    address: "30 Hàng Trống, Hoàn Kiếm, Hà Nội",
    priceEstimate: 1200000,
    imageUrls: [],
    rating: 4.6,
    reviewCount: 980,
    categories: ["Boutique", "Phố cổ"],
    openingHours: "Check-in 14:00, Check-out 12:00",
    priceRange: "1.000.000 - 1.500.000đ/đêm",
    mapQuery: "Hanoi Old Quarter Hotel",
  },
  {
    id: "acc-2",
    type: "accommodation",
    name: "Sofitel Legend Metropole",
    startTime: "14:00",
    description: "Khách sạn 5 sao lịch sử với kiến trúc Pháp cổ điển.",
    address: "15 Ngô Quyền, Hoàn Kiếm, Hà Nội",
    priceEstimate: 5800000,
    imageUrls: [],
    rating: 4.9,
    reviewCount: 3400,
    categories: ["5 sao", "Lịch sử", "Cao cấp"],
    openingHours: "Check-in 15:00, Check-out 12:00",
    priceRange: "5.000.000 - 10.000.000đ/đêm",
    mapQuery: "Sofitel Metropole Hanoi",
  },
];

const POOLS: Record<ActivityType, Activity[]> = {
  place: PLACE_POOL,
  restaurant: RESTAURANT_POOL,
  accommodation: ACCOMMODATION_POOL,
};

const trips: Trip[] = [];
const comments: Comment[] = [];
const expenseUsers: ExpenseUser[] = [];
const expenses: Expense[] = [];

let currentUser: User = {
  id: "user-1",
  email: "curator@editorial.com",
  firstName: "Curator",
  lastName: "Editorial",
};

function pickActivity(type: ActivityType, used: Set<string>, maxPrice: number): Activity {
  const pool = POOLS[type];
  const available = pool.filter((a) => !used.has(a.id) && a.priceEstimate <= maxPrice * 0.6);
  const choices = available.length ? available : pool.filter((a) => !used.has(a.id));
  const pick = (choices.length ? choices : pool)[Math.floor(Math.random() * (choices.length || pool.length))];
  used.add(pick.id);
  return { ...pick, activityId: uid("act") };
}

function buildSegments(used: Set<string>, dailyBudget: number): Segment[] {
  return [
    {
      timeOfDay: "morning",
      label: "SÁNG SỚM",
      timeLabel: "08:30",
      activities: [
        pickActivity("restaurant", used, dailyBudget),
        pickActivity("place", used, dailyBudget),
      ],
    },
    {
      timeOfDay: "afternoon",
      label: "BUỔI TRƯA",
      timeLabel: "13:00",
      activities: [
        pickActivity("restaurant", used, dailyBudget),
        pickActivity("place", used, dailyBudget),
      ],
    },
    {
      timeOfDay: "evening",
      label: "BUỔI TỐI",
      timeLabel: "19:00",
      activities: [
        pickActivity("restaurant", used, dailyBudget),
      ],
    },
  ];
}

function dateRange(start: string, end: string): string[] {
  const s = new Date(start);
  const e = new Date(end);
  const out: string[] = [];
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return out;
  let c = new Date(s);
  while (c <= e) {
    out.push(c.toISOString().slice(0, 10));
    c = new Date(c.getTime() + 86400000);
  }
  return out;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  await delay(250);
  if (!(currentUser.email === email && (currentUser.firstName || currentUser.lastName))) {
    currentUser = {
      id: currentUser.id || "user-1",
      email,
      firstName: email.split("@")[0] || "Du khách",
      lastName: "",
    };
  }
  return {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    user: currentUser,
  };
}

export async function register(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthResponse> {
  await delay(300);
  currentUser = {
    id: uid("user"),
    email: payload.email,
    firstName: payload.firstName || "Du khách",
    lastName: payload.lastName,
  };
  return {
    accessToken: "mock-access-token",
    refreshToken: "mock-refresh-token",
    user: currentUser,
  };
}

export async function getMyTrips(): Promise<Trip[]> {
  await delay(150);
  return trips.slice().reverse();
}

export async function getTripById(id: string): Promise<Trip | null> {
  await delay(150);
  return trips.find((t) => t.tripId === id) ?? null;
}

export async function createTrip(): Promise<Trip> {
  await delay(400);
  const ob = getOnboardingState();
  const days = dateRange(ob.dates.start, ob.dates.end);
  const totalBudget = ob.budget || 5000000;
  const dailyBudget = days.length ? totalBudget / days.length : totalBudget;
  const used = new Set<string>();
  const planByDay: DayPlan[] = days.map((date, idx) => ({
    date,
    dayTitle: `Ngày ${idx + 1}`,
    segments: buildSegments(used, dailyBudget),
    dailyTips: "Mang theo nước, mặc thoải mái và đi giày êm chân.",
  }));

  const preference: TravelPreference = {
    destinationId: ob.destination?.id ?? "hanoi",
    destinationName: ob.destination?.name ?? "Hà Nội",
    budget: { type: "exact", exactBudget: totalBudget },
    people: {
      adults: ob.people.adult,
      children: ob.people.child,
      infants: ob.people.infant,
      pets: ob.people.pet,
    },
    travelTime: { type: ob.dates.flexible ? "flexible" : "fixed", startDate: ob.dates.start, endDate: ob.dates.end },
    personalOptions: ob.interests.map((i) => ({ type: "interest", name: i })),
  };

  const trip: Trip = {
    tripId: uid("trip"),
    userId: currentUser.id,
    tripName: `${preference.destinationName} · ${days.length} ngày`,
    startDate: ob.dates.start,
    endDate: ob.dates.end,
    destinationId: preference.destinationId,
    destinationName: preference.destinationName,
    status: "draft",
    budget: totalBudget,
    planByDay,
    preference,
  };
  trips.push(trip);
  return trip;
}

export async function saveTrip(tripId: string): Promise<Trip | null> {
  await delay(200);
  const trip = trips.find((t) => t.tripId === tripId);
  if (!trip) return null;
  trip.status = "saved";
  return trip;
}

export async function updateActivity(
  tripId: string,
  dayIndex: number,
  segmentIndex: number,
  activityIndex: number,
  activity: Activity,
): Promise<Activity | null> {
  await delay(200);
  const trip = trips.find((t) => t.tripId === tripId);
  if (!trip) return null;
  const seg = trip.planByDay[dayIndex]?.segments[segmentIndex];
  if (!seg) return null;
  seg.activities[activityIndex] = activity;
  return activity;
}

export async function getActivityDetail(activityId: string): Promise<Activity | null> {
  await delay(180);
  const all = [...PLACE_POOL, ...RESTAURANT_POOL, ...ACCOMMODATION_POOL];
  return all.find((a) => a.id === activityId) ?? null;
}

export async function fixActivity(req: FixActivityRequest): Promise<FixActivityResponse> {
  await delay(450);
  const pool = POOLS[req.activity.type];
  const maxBudget = req.travelPreference.budget.exactBudget * 0.3;
  const commentLower = req.comment.toLowerCase();
  const cheapHint = /đắt|expensive|rẻ|cheap|budget|tiền|chi phí/.test(commentLower);
  const quietHint = /đông|crowd|yên|quiet|peaceful/.test(commentLower);
  const filtered = pool
    .filter((a) => a.id !== req.activity.id)
    .map((a) => {
      let score = 0;
      if (cheapHint && a.priceEstimate < req.activity.priceEstimate) score += 5;
      if (quietHint && (a.reviewCount ?? 0) < 5000) score += 3;
      if (a.priceEstimate <= maxBudget) score += 1;
      score += Math.random();
      return { activity: a, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((x) => ({ ...x.activity, activityId: uid("act") }));

  return {
    suggestionType: req.activity.type,
    suggestionList: filtered,
  };
}

export async function getComments(activityId: string): Promise<Comment[]> {
  await delay(150);
  return comments.filter((c) => c.activityId === activityId);
}

export async function createComment(payload: {
  activityId: string;
  content: string;
}): Promise<Comment> {
  await delay(180);
  const c: Comment = {
    id: uid("cmt"),
    activityId: payload.activityId,
    author: `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.email,
    content: payload.content,
    date: new Date().toISOString(),
  };
  comments.push(c);
  return c;
}

export async function getExpenseUsers(tripId: string): Promise<ExpenseUser[]> {
  await delay(120);
  const list = expenseUsers.filter((u) => u.tripId === tripId);
  if (list.length === 0) {
    const me: ExpenseUser = {
      id: currentUser.id,
      tripId,
      name: `${currentUser.firstName} ${currentUser.lastName}`.trim() || "Tôi",
      email: currentUser.email,
    };
    expenseUsers.push(me);
    return [me];
  }
  return list;
}

export async function addExpenseUser(tripId: string, name: string): Promise<ExpenseUser> {
  await delay(150);
  const u: ExpenseUser = { id: uid("eu"), tripId, name };
  expenseUsers.push(u);
  return u;
}

export async function getExpenses(tripId: string): Promise<Expense[]> {
  await delay(150);
  return expenses.filter((e) => e.tripId === tripId);
}

export async function addExpense(payload: {
  tripId: string;
  expenseName: string;
  expenseType: ExpenseType;
  amount: number;
  paidByUserId: string;
  paidByName: string;
  splitBetween: string[];
}): Promise<Expense> {
  await delay(200);
  const e: Expense = {
    expenseId: uid("exp"),
    ...payload,
    createdAt: new Date().toISOString(),
  };
  expenses.push(e);
  return e;
}

export async function getExpenseBalance(tripId: string): Promise<ExpenseBalance[]> {
  await delay(150);
  const users = await getExpenseUsers(tripId);
  const list = expenses.filter((e) => e.tripId === tripId);
  const balances = new Map<string, number>();
  users.forEach((u) => balances.set(u.id, 0));
  for (const exp of list) {
    const share = exp.amount / Math.max(1, exp.splitBetween.length);
    balances.set(exp.paidByUserId, (balances.get(exp.paidByUserId) ?? 0) + exp.amount);
    for (const uid of exp.splitBetween) {
      balances.set(uid, (balances.get(uid) ?? 0) - share);
    }
  }
  return users.map((u) => ({
    userId: u.id,
    userName: u.name,
    balance: Math.round(balances.get(u.id) ?? 0),
  }));
}

export async function getExpenseSummary(tripId: string): Promise<ExpenseSummary> {
  await delay(120);
  const list = expenses.filter((e) => e.tripId === tripId);
  const byType: Record<ExpenseType, number> = {
    food: 0, transport: 0, accommodation: 0, activity: 0, other: 0,
  };
  let total = 0;
  for (const e of list) {
    byType[e.expenseType] += e.amount;
    total += e.amount;
  }
  return { total, byType, count: list.length };
}

export function _getCurrentUser(): User {
  return currentUser;
}

// ----------------------------------------------------------------------------
// Presentation-mode seed
// ----------------------------------------------------------------------------
// Set EXPO_PUBLIC_PRESENT_MODE=1 to pre-populate the mock store with demo data
// so the app boots as if a real backend already has trips/expenses/comments.
// ----------------------------------------------------------------------------

function buildSeededTrip(opts: {
  name: string;
  destinationId: string;
  destinationName: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: "draft" | "saved";
}): Trip {
  const days = dateRange(opts.startDate, opts.endDate);
  const used = new Set<string>();
  const dailyBudget = days.length ? opts.budget / days.length : opts.budget;
  const planByDay: DayPlan[] = days.map((date, idx) => ({
    date,
    dayTitle: `Ngày ${idx + 1}`,
    segments: buildSegments(used, dailyBudget),
    dailyTips: "Mang theo nước, mặc thoải mái và đi giày êm chân.",
  }));
  const preference: TravelPreference = {
    destinationId: opts.destinationId,
    destinationName: opts.destinationName,
    budget: { type: "exact", exactBudget: opts.budget },
    people: { adults: 2, children: 0, infants: 0, pets: 0 },
    travelTime: { type: "fixed", startDate: opts.startDate, endDate: opts.endDate },
    personalOptions: [
      { type: "interest", name: "Văn hoá" },
      { type: "interest", name: "Ẩm thực" },
    ],
  };
  return {
    tripId: uid("trip"),
    userId: currentUser.id,
    tripName: opts.name,
    startDate: opts.startDate,
    endDate: opts.endDate,
    destinationId: opts.destinationId,
    destinationName: opts.destinationName,
    status: opts.status,
    budget: opts.budget,
    planByDay,
    preference,
  };
}

function seedDemo() {
  currentUser = {
    id: "user-demo",
    email: "curator@editorial.com",
    firstName: "An",
    lastName: "Nguyễn",
  };

  // Trip 1 — saved, recently completed-style
  const t1 = buildSeededTrip({
    name: "Hà Nội Hoài Cổ · 3 ngày",
    destinationId: "hanoi",
    destinationName: "Hà Nội",
    startDate: "2026-05-10",
    endDate: "2026-05-12",
    budget: 6500000,
    status: "saved",
  });
  trips.push(t1);

  // Trip 2 — saved, upcoming
  const t2 = buildSeededTrip({
    name: "Đà Nẵng Bãi Biển · 4 ngày",
    destinationId: "danang",
    destinationName: "Đà Nẵng",
    startDate: "2026-06-15",
    endDate: "2026-06-18",
    budget: 9000000,
    status: "saved",
  });
  trips.push(t2);

  // Trip 3 — current/draft (the one user resumes into)
  const t3 = buildSeededTrip({
    name: "Hà Nội · Cuối tuần này",
    destinationId: "hanoi",
    destinationName: "Hà Nội",
    startDate: "2026-05-29",
    endDate: "2026-05-31",
    budget: 5500000,
    status: "draft",
  });
  trips.push(t3);

  // Expense users on t3
  const me: ExpenseUser = { id: currentUser.id, tripId: t3.tripId, name: "An Nguyễn", email: currentUser.email };
  const friend1: ExpenseUser = { id: uid("eu"), tripId: t3.tripId, name: "Minh Trần" };
  const friend2: ExpenseUser = { id: uid("eu"), tripId: t3.tripId, name: "Linh Phạm" };
  expenseUsers.push(me, friend1, friend2);

  // Expenses
  const splitAll = [me.id, friend1.id, friend2.id];
  expenses.push(
    {
      expenseId: uid("exp"),
      tripId: t3.tripId,
      expenseName: "Vé tàu Hà Nội",
      expenseType: "transport",
      amount: 1200000,
      paidByUserId: me.id,
      paidByName: me.name,
      splitBetween: splitAll,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      expenseId: uid("exp"),
      tripId: t3.tripId,
      expenseName: "Ăn tối Chả Cá Lã Vọng",
      expenseType: "food",
      amount: 1050000,
      paidByUserId: friend1.id,
      paidByName: friend1.name,
      splitBetween: splitAll,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      expenseId: uid("exp"),
      tripId: t3.tripId,
      expenseName: "Khách sạn 2 đêm",
      expenseType: "accommodation",
      amount: 2400000,
      paidByUserId: friend2.id,
      paidByName: friend2.name,
      splitBetween: splitAll,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      expenseId: uid("exp"),
      tripId: t3.tripId,
      expenseName: "Cà phê Giảng",
      expenseType: "food",
      amount: 135000,
      paidByUserId: me.id,
      paidByName: me.name,
      splitBetween: splitAll,
      createdAt: new Date().toISOString(),
    },
  );

  // Comments — attach to a couple of well-known activity ids
  comments.push(
    {
      id: uid("cmt"),
      activityId: "place-1",
      author: "Minh Trần",
      content: "Sáng sớm cực kỳ đẹp, nhớ mang áo khoác mỏng nhé.",
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: uid("cmt"),
      activityId: "rest-2",
      author: "Linh Phạm",
      content: "Đông khách buổi trưa, nên đến trước 11:30.",
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  );
}

if (PRESENT_MODE) {
  seedDemo();
}


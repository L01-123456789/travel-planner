// ----------------------------------------------------------------------------
// API client facade
// ----------------------------------------------------------------------------
// Single switch to flip between the in-memory mock store and the real backend
// (Go BE on BACKEND_BASE_URL + Python AI on AI_BASE_URL).
//
//   USE_REAL_API = false  -> uses lib/mock-api.ts (current UI demo path)
//   USE_REAL_API = true   -> calls the real backend / AI service over HTTP
//
// For endpoints that don't yet have a real-BE mapping, the client falls back
// to the mock automatically (with a console.warn) so the UI never breaks.
// ----------------------------------------------------------------------------

import type {
  Activity,
  AuthResponse,
  Comment,
  Expense,
  ExpenseBalance,
  ExpenseSummary,
  ExpenseType,
  ExpenseUser,
  FixActivityRequest,
  FixActivityResponse,
  Trip,
  User,
} from "./types";
import * as mockApi from "./mock-api";
import { apiRequestJson } from "./api";
import { getToken } from "./auth-store";

// ----------------------------------------------------------------------------
// Config — flip this boolean to switch.
// ----------------------------------------------------------------------------
export const USE_REAL_API = false;

// Override via app.json extra / env if you want; defaults are sensible for
// "everything runs on my laptop".
export const BACKEND_BASE_URL =
  (process.env.EXPO_PUBLIC_BACKEND_URL as string | undefined) ?? "http://localhost:8080";
export const AI_BASE_URL =
  (process.env.EXPO_PUBLIC_AI_URL as string | undefined) ?? "http://localhost:8001";

// ----------------------------------------------------------------------------
// helpers
// ----------------------------------------------------------------------------
function authHeaders(): HeadersInit {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function be<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  return apiRequestJson<T>(BACKEND_BASE_URL, `/api/v1${path}`, {
    ...init,
    headers: { ...(init.headers ?? {}), ...authHeaders() },
  });
}

async function ai<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  return apiRequestJson<T>(AI_BASE_URL, `/api/v1${path}`, init);
}

function mockFallback(name: string) {
  if (USE_REAL_API) console.warn(`[api-client] No real-BE mapping for ${name}, using mock.`);
}

// ----------------------------------------------------------------------------
// Auth
// ----------------------------------------------------------------------------
export async function login(email: string, password: string): Promise<AuthResponse> {
  if (!USE_REAL_API) return mockApi.login(email, password);
  type Resp = { data?: { access_token?: string; refresh_token?: string; user?: User } };
  const res = await be<Resp>("/auth/login", { method: "POST", json: { email, password } });
  const data = res.data ?? {};
  return {
    accessToken: data.access_token ?? "",
    refreshToken: data.refresh_token ?? "",
    user: data.user ?? { id: "", email, firstName: "", lastName: "" },
  };
}

export async function register(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthResponse> {
  if (!USE_REAL_API) return mockApi.register(payload);
  type Resp = { data?: { access_token?: string; refresh_token?: string; user?: User } };
  const res = await be<Resp>("/auth/register", {
    method: "POST",
    json: {
      email: payload.email,
      password: payload.password,
      first_name: payload.firstName,
      last_name: payload.lastName,
    },
  });
  const data = res.data ?? {};
  return {
    accessToken: data.access_token ?? "",
    refreshToken: data.refresh_token ?? "",
    user: data.user ?? {
      id: "",
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    },
  };
}

// ----------------------------------------------------------------------------
// Trips
// ----------------------------------------------------------------------------
export async function getMyTrips(): Promise<Trip[]> {
  if (!USE_REAL_API) return mockApi.getMyTrips();
  const res = await be<{ data?: Trip[] }>("/trip/me", { method: "GET" });
  return res.data ?? [];
}

export async function getTripById(id: string): Promise<Trip | null> {
  if (!USE_REAL_API) return mockApi.getTripById(id);
  const res = await be<{ data?: Trip }>(`/trip/${encodeURIComponent(id)}`, { method: "GET" });
  return res.data ?? null;
}

export async function createTrip(): Promise<Trip> {
  // The real BE expects a full TripDTO body; the UI uses onboarding-store to
  // assemble one. Keeping mock-api's createTrip() behaviour (it reads
  // getOnboardingState() internally) so the call sites stay simple. When
  // USE_REAL_API is on we still build the trip via mock-api locally, then
  // POST it to /trip/create so it persists in the real DB.
  const trip = await mockApi.createTrip();
  if (!USE_REAL_API) return trip;
  try {
    await be<{ data?: string }>("/trip/create", { method: "POST", json: trip });
  } catch (e) {
    console.warn("[api-client] /trip/create failed, keeping local trip only", e);
  }
  return trip;
}

export async function saveTrip(tripId: string): Promise<Trip | null> {
  if (!USE_REAL_API) return mockApi.saveTrip(tripId);
  try {
    await be<unknown>("/trip/save", { method: "PUT", json: { trip_id: tripId } });
  } catch (e) {
    console.warn("[api-client] /trip/save failed", e);
  }
  return mockApi.saveTrip(tripId);
}

export async function updateActivity(
  tripId: string,
  dayIndex: number,
  segmentIndex: number,
  activityIndex: number,
  activity: Activity,
): Promise<Activity | null> {
  if (!USE_REAL_API)
    return mockApi.updateActivity(tripId, dayIndex, segmentIndex, activityIndex, activity);
  try {
    await be<unknown>("/trip/activity", {
      method: "PUT",
      json: { trip_id: tripId, day_index: dayIndex, segment_index: segmentIndex, activity_index: activityIndex, activity },
    });
  } catch (e) {
    console.warn("[api-client] /trip/activity failed", e);
  }
  return mockApi.updateActivity(tripId, dayIndex, segmentIndex, activityIndex, activity);
}

// ----------------------------------------------------------------------------
// Activity detail + AI fix
// ----------------------------------------------------------------------------
export async function getActivityDetail(activityId: string): Promise<Activity | null> {
  if (!USE_REAL_API) return mockApi.getActivityDetail(activityId);
  // Real BE has /detail/place/:id etc. but we don't know the type from the id
  // alone here. Fall back to mock for now.
  mockFallback("getActivityDetail");
  return mockApi.getActivityDetail(activityId);
}

export async function fixActivity(req: FixActivityRequest): Promise<FixActivityResponse> {
  if (!USE_REAL_API) return mockApi.fixActivity(req);
  try {
    const res = await ai<{ status: string; suggestion_type: string; suggestion_list: Activity[] }>(
      "/trip/fix_activity",
      { method: "POST", json: req },
    );
    if (res.status === "success" && res.suggestion_list?.length) {
      return { suggestionType: req.activity.type, suggestionList: res.suggestion_list };
    }
  } catch (e) {
    console.warn("[api-client] AI fix_activity failed, using mock", e);
  }
  return mockApi.fixActivity(req);
}

// ----------------------------------------------------------------------------
// Comments
// ----------------------------------------------------------------------------
export async function getComments(activityId: string): Promise<Comment[]> {
  if (!USE_REAL_API) return mockApi.getComments(activityId);
  try {
    const res = await be<{ data?: Comment[] }>(
      `/comment/activity/${encodeURIComponent(activityId)}`,
      { method: "GET" },
    );
    return res.data ?? [];
  } catch (e) {
    console.warn("[api-client] getComments failed, using mock", e);
    return mockApi.getComments(activityId);
  }
}

export async function createComment(payload: {
  activityId: string;
  content: string;
}): Promise<Comment> {
  if (!USE_REAL_API) return mockApi.createComment(payload);
  try {
    const res = await be<{ data?: Comment }>("/comment/create", {
      method: "POST",
      json: { activity_id: payload.activityId, content: payload.content },
    });
    if (res.data) return res.data;
  } catch (e) {
    console.warn("[api-client] createComment failed, using mock", e);
  }
  return mockApi.createComment(payload);
}

// ----------------------------------------------------------------------------
// Expenses
// ----------------------------------------------------------------------------
export async function getExpenseUsers(tripId: string): Promise<ExpenseUser[]> {
  if (!USE_REAL_API) return mockApi.getExpenseUsers(tripId);
  try {
    const res = await be<{ data?: ExpenseUser[] }>(
      `/expense/users/${encodeURIComponent(tripId)}`,
      { method: "GET" },
    );
    return res.data ?? [];
  } catch {
    return mockApi.getExpenseUsers(tripId);
  }
}

export async function addExpenseUser(tripId: string, name: string): Promise<ExpenseUser> {
  if (!USE_REAL_API) return mockApi.addExpenseUser(tripId, name);
  try {
    const res = await be<{ data?: ExpenseUser }>("/expense/user/add", {
      method: "POST",
      json: { trip_id: tripId, name },
    });
    if (res.data) return res.data;
  } catch {}
  return mockApi.addExpenseUser(tripId, name);
}

export async function getExpenses(tripId: string): Promise<Expense[]> {
  if (!USE_REAL_API) return mockApi.getExpenses(tripId);
  try {
    const res = await be<{ data?: Expense[] }>(`/expense/${encodeURIComponent(tripId)}`, {
      method: "GET",
    });
    return res.data ?? [];
  } catch {
    return mockApi.getExpenses(tripId);
  }
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
  if (!USE_REAL_API) return mockApi.addExpense(payload);
  try {
    const res = await be<{ data?: Expense }>("/expense/add", {
      method: "POST",
      json: {
        trip_id: payload.tripId,
        expense_name: payload.expenseName,
        expense_type: payload.expenseType,
        amount: payload.amount,
        paid_by_user_id: payload.paidByUserId,
        paid_by_name: payload.paidByName,
        split_between: payload.splitBetween,
      },
    });
    if (res.data) return res.data;
  } catch {}
  return mockApi.addExpense(payload);
}

export async function getExpenseBalance(tripId: string): Promise<ExpenseBalance[]> {
  if (!USE_REAL_API) return mockApi.getExpenseBalance(tripId);
  try {
    const res = await be<{ data?: ExpenseBalance[] }>(
      `/expense/balance/${encodeURIComponent(tripId)}`,
      { method: "GET" },
    );
    return res.data ?? [];
  } catch {
    return mockApi.getExpenseBalance(tripId);
  }
}

export async function getExpenseSummary(tripId: string): Promise<ExpenseSummary> {
  if (!USE_REAL_API) return mockApi.getExpenseSummary(tripId);
  try {
    const res = await be<{ data?: ExpenseSummary }>(
      `/expense/summary/${encodeURIComponent(tripId)}`,
      { method: "GET" },
    );
    if (res.data) return res.data;
  } catch {}
  return mockApi.getExpenseSummary(tripId);
}

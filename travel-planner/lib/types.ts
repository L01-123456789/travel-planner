export type ActivityType = "place" | "restaurant" | "accommodation";

export type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};

export type Activity = {
  id: string;
  activityId?: string;
  type: ActivityType;
  name: string;
  startTime: string;
  endTime?: string;
  description: string;
  address: string;
  priceEstimate: number;
  imageUrls: string[];
  rating?: number;
  reviewCount?: number;
  categories?: string[];
  openingHours?: string;
  duration?: string;
  phone?: string;
  priceRange?: string;
  reviews?: Review[];
  mapQuery?: string;
};

export type Segment = {
  timeOfDay: "morning" | "afternoon" | "evening";
  label: string;
  timeLabel: string;
  activities: Activity[];
};

export type DayPlan = {
  date: string;
  dayTitle: string;
  segments: Segment[];
  dailyTips?: string;
};

export type Trip = {
  tripId: string;
  userId: string;
  tripName: string;
  startDate: string;
  endDate: string;
  destinationId: string;
  destinationName: string;
  status: "draft" | "saved" | "completed";
  budget: number;
  coverImage?: string;
  planByDay: DayPlan[];
  preference: TravelPreference;
};

export type TravelPreference = {
  travelPreferenceId?: string;
  tripId?: string;
  destinationId: string;
  destinationName: string;
  budget: { type: "exact" | "range"; exactBudget: number };
  people: { adults: number; children: number; infants: number; pets: number };
  travelTime: { type: "fixed" | "flexible"; startDate: string; endDate: string };
  personalOptions: { type: string; name: string; description?: string }[];
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type Comment = {
  id: string;
  activityId: string;
  author: string;
  content: string;
  date: string;
};

export type ExpenseUser = {
  id: string;
  tripId: string;
  name: string;
  email?: string;
};

export type ExpenseType = "food" | "transport" | "accommodation" | "activity" | "other";

export type Expense = {
  expenseId: string;
  tripId: string;
  expenseName: string;
  expenseType: ExpenseType;
  amount: number;
  paidByUserId: string;
  paidByName: string;
  splitBetween: string[];
  createdAt: string;
};

export type ExpenseBalance = {
  userId: string;
  userName: string;
  balance: number;
};

export type ExpenseSummary = {
  total: number;
  byType: Record<ExpenseType, number>;
  count: number;
};

export type FixActivityRequest = {
  travelPreference: TravelPreference;
  activity: Activity;
  comment: string;
};

export type FixActivityResponse = {
  suggestionType: ActivityType;
  suggestionList: Activity[];
};

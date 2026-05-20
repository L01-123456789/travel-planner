export type OnboardingState = {
  people: {
    adult: number;
    child: number;
    infant: number;
    pet: number;
  };
  budget: number;
  dates: {
    start: string;
    end: string;
    flexible: boolean;
  };
  interests: string[];
};

const state: OnboardingState = {
  people: {
    adult: 2,
    child: 0,
    infant: 0,
    pet: 0,
  },
  budget: 5000000,
  dates: {
    start: "2023-10-15",
    end: "2023-10-18",
    flexible: false,
  },
  interests: ["nature", "hidden"],
};

export function getOnboardingState(): OnboardingState {
  return {
    ...state,
    people: { ...state.people },
    dates: { ...state.dates },
    interests: [...state.interests],
  };
}

export function updateOnboardingState(
  partial: Partial<OnboardingState>,
): OnboardingState {
  if (partial.people) {
    state.people = { ...state.people, ...partial.people };
  }
  if (partial.dates) {
    state.dates = { ...state.dates, ...partial.dates };
  }
  if (partial.budget !== undefined) {
    state.budget = partial.budget;
  }
  if (partial.interests) {
    state.interests = [...partial.interests];
  }
  return getOnboardingState();
}

export function resetOnboardingState(): OnboardingState {
  state.people = { adult: 2, child: 0, infant: 0, pet: 0 };
  state.budget = 5000000;
  state.dates = { start: "2023-10-15", end: "2023-10-18", flexible: false };
  state.interests = ["nature", "hidden"];
  return getOnboardingState();
}

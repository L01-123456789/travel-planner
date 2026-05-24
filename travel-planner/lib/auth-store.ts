import type { User } from "./types";

type Listener = (user: User | null) => void;

let currentUser: User | null = null;
let token: string | null = null;
const listeners = new Set<Listener>();

export function getUser(): User | null {
  return currentUser;
}

export function getToken(): string | null {
  return token;
}

export function setSession(user: User, accessToken: string) {
  currentUser = user;
  token = accessToken;
  listeners.forEach((l) => l(currentUser));
}

export function signOut() {
  currentUser = null;
  token = null;
  listeners.forEach((l) => l(null));
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

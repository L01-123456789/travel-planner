export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");

    const atobFn = (
      globalThis as unknown as { atob?: (input: string) => string }
    ).atob;
    if (typeof atobFn !== "function") return null;

    const json = atobFn(padded);
    const payload = JSON.parse(json);
    if (payload && typeof payload === "object") {
      return payload as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

export function getUserIdFromAccessToken(token: string): string | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  // Backend stores userId in a claim named "username" (see backend/internal/util/jwt.go)
  const value = payload.username;
  return typeof value === "string" && value.length > 0 ? value : null;
}

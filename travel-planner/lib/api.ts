import * as Sentry from "@sentry/react-native";

export type ApiErrorDetails = {
  status?: number;
  url?: string;
  body?: unknown;
};

export async function apiRequestJson<T>(
  baseUrl: string,
  path: string,
  init: RequestInit & { json?: unknown } = {},
  spanName?: string,
): Promise<T> {
  const url = `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? "" : "/"}${path}`;

  return Sentry.startSpan(
    {
      name: spanName ?? `HTTP ${init.method ?? "GET"} ${path}`,
      op: "http.client",
      attributes: {
        "http.url": url,
        "http.method": init.method ?? "GET",
      },
    },
    async () => {
      const headers = new Headers(init.headers);
      headers.set("Accept", "application/json");

      let body: BodyInit | undefined = init.body as BodyInit | undefined;
      if (init.json !== undefined) {
        headers.set("Content-Type", "application/json");
        body = JSON.stringify(init.json);
      }

      try {
        const res = await fetch(url, {
          ...init,
          headers,
          body,
        });

        const text = await res.text();
        const parsed = text ? safeJsonParse(text) : null;

        if (!res.ok) {
          const error = new Error(`API ${res.status} ${res.statusText}`);
          const details: ApiErrorDetails = {
            status: res.status,
            url,
            body: parsed ?? text,
          };
          Sentry.setContext("api_error", details);
          Sentry.captureException(error);
          throw error;
        }

        return parsed as T;
      } catch (err) {
        // Network or parsing failures
        Sentry.captureException(err);
        throw err;
      }
    },
  );
}

function safeJsonParse(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
}

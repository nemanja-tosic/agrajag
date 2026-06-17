// The adapter is auth-agnostic: it speaks JSON:API over an injected client and
// knows nothing about how requests are authenticated. Implement this to add
// cookies, bearer tokens, request signing, or any per-request state without
// that leaking into the generic mapping.
export interface HttpClient {
  request(url: string, init?: RequestInit): Promise<Response>;
}

/**
 * Minimal `HttpClient` over global `fetch`, optionally sending a fixed set of
 * headers on every request. Enough for unauthenticated or static-token use;
 * anything stateful (cookie sessions, refreshing tokens) is the caller's
 * concern — implement `HttpClient` directly.
 */
export function createFetchHttpClient(defaultHeaders: Record<string, string> = {}): HttpClient {
  return {
    request(url, init) {
      return fetch(url, {
        ...init,
        headers: { ...defaultHeaders, ...(init?.headers as Record<string, string> | undefined) },
      });
    },
  };
}

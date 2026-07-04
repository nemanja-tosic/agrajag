import type { HttpClient } from './HttpClient.js';

/**
 * A transport-ready request. `McpServerBuilder` fills in both representations;
 * each executor uses whichever its transport needs — HTTP executors use
 * `method`/`path`/`query`/`body`, the in-process executor uses `runInProcess`.
 */
export interface TransportRequest {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  /** Path relative to the API root, e.g. "/authors/a1". */
  path: string;
  /** Query string including the leading "?", or "". */
  query: string;
  /** JSON:API document for writes (absent for reads/deletes). */
  body?: unknown;
  /** Run the operation in-process via agrajag's endpoint handler. */
  runInProcess: () => Promise<{ body?: unknown; status: number }>;
}

/**
 * Fulfils a tool's request and returns the parsed JSON:API document (or
 * `undefined` for an empty body). Throws on transport/HTTP error. This is the
 * seam between agrajag's two adapter styles: an HTTP client (cross-process) or
 * an in-process handler call (co-deployed).
 */
export interface Executor {
  send(request: TransportRequest): Promise<unknown>;
}

/** Cross-process executor: speaks JSON:API over an injected HttpClient. */
export function httpExecutor(options: { baseUrl: string; http: HttpClient }): Executor {
  const baseUrl = options.baseUrl.replace(/\/$/, '');
  return {
    async send({ method, path, query, body }) {
      const response = await options.http.request(`${baseUrl}${path}${query}`, {
        method,
        ...(body === undefined
          ? {}
          : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }),
      });
      const text = await response.text();
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}: ${text}`);
      }
      return text ? JSON.parse(text) : undefined;
    },
  };
}

/**
 * Co-deployed executor: invokes agrajag's endpoint handler directly, no HTTP.
 * Runs inside the caller's context, so request-scoped concerns (transactions,
 * row-level scoping, request-scoped auth) apply ambiently.
 */
export function inProcessExecutor(): Executor {
  return {
    async send({ runInProcess }) {
      const { body, status } = await runInProcess();
      if (status >= 400) {
        throw new Error(`agrajag endpoint returned ${status}: ${JSON.stringify(body)}`);
      }
      return body;
    },
  };
}

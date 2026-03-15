/**
 * Centralized API client with consistent error handling.
 * All API calls go through this client to ensure uniform
 * error handling, response parsing, and type safety.
 *
 * Includes automatic token refresh: on 401 responses, the client
 * transparently calls /api/auth/refresh and retries the request.
 * Concurrent refresh attempts are deduplicated.
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

// Shared refresh promise to deduplicate concurrent 401 refresh attempts
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers: customHeaders, ...rest } = options;

  const headers: HeadersInit = {
    ...(body !== undefined && { "Content-Type": "application/json" }),
    ...customHeaders,
  };

  const fetchOptions: RequestInit = {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  let response = await fetch(url, fetchOptions);

  // On 401, attempt a transparent token refresh and retry once
  // Skip refresh for auth mutation endpoints to avoid infinite loops
  const skipRefreshUrls = ["/api/auth/refresh", "/api/auth/login", "/api/auth/logout"];
  const shouldSkipRefresh = skipRefreshUrls.some((u) => url.includes(u));
  if (response.status === 401 && !shouldSkipRefresh) {
    if (!refreshPromise) {
      refreshPromise = refreshTokens().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;

    if (refreshed) {
      response = await fetch(url, fetchOptions);
    }
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(
      data?.error || `Request failed with status ${response.status}`,
      response.status,
      data
    );
  }

  return data as T;
}

export const apiClient = {
  get: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "GET" }),

  post: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "POST", body }),

  put: <T>(url: string, body?: unknown, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "PUT", body }),

  delete: <T>(url: string, options?: RequestOptions) =>
    request<T>(url, { ...options, method: "DELETE" }),
};

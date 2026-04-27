import { QueryClient } from "@tanstack/react-query";

const EMPLOYEES_CACHE_MS = 5 * 60 * 1000;

/** Single QueryClient for the app — import here (not only from React) to clear on logout */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: EMPLOYEES_CACHE_MS,
      gcTime: EMPLOYEES_CACHE_MS,
    },
  },
});

function getAuthScopeKey() {
  if (typeof window === "undefined") return "ssr";
  const jwt = localStorage.getItem("jwt") || "";
  const oneId = localStorage.getItem("oneid") || "";
  const orgOneId = localStorage.getItem("org_oneid") || "";
  const roleDbId = localStorage.getItem("role_db_id") || "";
  return [oneId, orgOneId, roleDbId, jwt].join("|");
}

let lastAuthScopeKey = getAuthScopeKey();

/** Removes all query and mutation cache (call on logout / session expiry). */
export function clearReactQueryCache() {
  queryClient.clear();
  lastAuthScopeKey = getAuthScopeKey();
}

/**
 * Clears cache only when logged-in identity/org context changes.
 * Use on app bootstrap and on storage/auth transitions.
 */
export function clearReactQueryCacheIfAuthChanged() {
  const nextAuthScopeKey = getAuthScopeKey();
  if (lastAuthScopeKey !== nextAuthScopeKey) {
    queryClient.clear();
  }
  lastAuthScopeKey = nextAuthScopeKey;
}

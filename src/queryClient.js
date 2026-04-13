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

/** Removes all query and mutation cache (call on logout / session expiry). */
export function clearReactQueryCache() {
  queryClient.clear();
}

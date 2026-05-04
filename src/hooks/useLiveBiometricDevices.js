import { useQuery } from '@tanstack/react-query';
import attendanceApi from '../Model/Data/Attendance/Attendance';

/** React Query key for live biometric devices – use for invalidateQueries after update */
export const LIVE_BIOMETRIC_DEVICES_QUERY_KEY = 'liveBiometricDevices';

/** Cache duration: 5 minutes (same as employees list) */
const LIVE_BIOMETRIC_CACHE_MS = 5 * 60 * 1000;

const defaultData = { allCount: 0, liveCount: 0, liveDevices: [] };

/**
 * Fetches live biometric devices. Cached for 5 min via React Query.
 * Only runs when enabled is true (e.g. when Header should show machines pill).
 * @param {boolean} [enabled=true] – When false, query does not run (avoids extra calls on pages that skip header APIs)
 * @returns {{ data, refetch, isLoading, isFetching }}
 */
export function useLiveBiometricDevices(enabled = true) {
  const query = useQuery({
    queryKey: [LIVE_BIOMETRIC_DEVICES_QUERY_KEY],
    queryFn: async () => {
      try {
        const response = await attendanceApi.getLiveBiometricDevices();
        const data = response?.data;
        if (data?.STATUS === 'SUCCESSFUL' && data?.DB_DATA != null) {
          return data.DB_DATA;
        }
        return defaultData;
      } catch (error) {
        // Handle CORS errors and other network issues gracefully
        console.warn('Live biometric devices API call failed:', error?.message || 'Network error');
        return defaultData;
      }
    },
    enabled: Boolean(enabled),
    staleTime: LIVE_BIOMETRIC_CACHE_MS,
    gcTime: LIVE_BIOMETRIC_CACHE_MS,
    placeholderData: defaultData,
  });

  return {
    liveBiometricDevices: query.data ?? defaultData,
    getLiveBiometricDevices: query.refetch,
    isLoadingLiveBiometric: query.isLoading,
    isFetchingLiveBiometric: query.isFetching,
  };
}

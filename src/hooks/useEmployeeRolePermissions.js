import { useQuery } from "@tanstack/react-query";
import { getUserData, getDecodedToken } from "../Authentication/jwt_decode";
import { isFullAdmin } from "../Authentication/roleHelpers";
import { fetchRolePermissionsByName } from "../Model/Data/OneId/oneIdRolePermissionsApi";

const TEN_MIN_MS = 10 * 60 * 1000;

export const ONEID_ROLE_PERMISSIONS_QUERY_KEY = "oneid-role-permissions";

/**
 * On non–full-admin login: fetch role permissions by JWT `role_id` (role name string).
 * Cached 10 minutes via React Query.
 */
export function useEmployeeRolePermissions() {
  const userData = getUserData();
  const rawRoleId = userData?.roleId;
  const decoded = getDecodedToken();
  const appId =
    decoded?.app_id != null ? Number(decoded.app_id) : 10;

  const enabled =
    typeof window !== "undefined" &&
    !!rawRoleId &&
    !isFullAdmin(rawRoleId);

  return useQuery({
    queryKey: [ONEID_ROLE_PERMISSIONS_QUERY_KEY, rawRoleId, appId],
    queryFn: () => fetchRolePermissionsByName(rawRoleId, appId),
    enabled,
    staleTime: TEN_MIN_MS,
    gcTime: TEN_MIN_MS,
    retry: 1,
  });
}

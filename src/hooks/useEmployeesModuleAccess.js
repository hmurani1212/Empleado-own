import { useMemo } from "react";
import { getModuleAccessLevel } from "../utils/oneIdPermissionUtils";
import { useEmployeeRolePermissions } from "./useEmployeeRolePermissions";
import { isFullAdmin } from "../Authentication/roleHelpers";
import { getUserData } from "../Authentication/jwt_decode";

/**
 * Employees module: full (mutate), read-only (list/table only), or none.
 * Full admin always has full access; other roles use OneID role permissions API.
 */
export function useEmployeesModuleAccess() {
  const userData = getUserData();
  const rawRoleId = userData?.roleId;
  const { data, isSuccess, isPending } = useEmployeeRolePermissions();

  return useMemo(() => {
    if (isFullAdmin(rawRoleId)) {
      return {
        accessLevel: "full",
        canMutate: true,
        readOnlyEmployeeList: false,
      };
    }

    if (!isSuccess || !data || !Array.isArray(data.permissions)) {
      return {
        accessLevel: null,
        canMutate: null,
        readOnlyEmployeeList: null,
        permissionsPending: !!isPending,
      };
    }

    const accessLevel = getModuleAccessLevel(data.permissions, "EMPLOYEE");
    return {
      accessLevel,
      canMutate: accessLevel === "full",
      readOnlyEmployeeList: accessLevel === "read_only",
      permissionsPending: false,
    };
  }, [rawRoleId, isSuccess, data, isPending]);
}

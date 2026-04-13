import { useMemo } from "react";
import { SidebarTabs } from "../Components/SideMenu/data";
import { getUserData } from "../Authentication/jwt_decode";
import { isSidebarTabVisibleForPermissions } from "../utils/oneIdPermissionUtils";
import { useEmployeeRolePermissions } from "./useEmployeeRolePermissions";

export function useSidebarFilteredTabs() {
  const userData = getUserData();
  const { data, isSuccess } = useEmployeeRolePermissions();

  const rawRoleId = userData?.roleId;
  const uiShellRoleId = userData?.uiShellRoleId ?? userData?.roleId ?? "Employee";

  return useMemo(() => {
    const permissionTags = data?.permissions;
    const hasLoadedPermissions =
      isSuccess && data != null && Array.isArray(permissionTags);
    return SidebarTabs.filter((tab) =>
      isSidebarTabVisibleForPermissions(tab, {
        rawRoleId,
        uiShellRoleId,
        permissionTags,
        hasLoadedPermissions,
      })
    );
  }, [rawRoleId, uiShellRoleId, isSuccess, data]);
}

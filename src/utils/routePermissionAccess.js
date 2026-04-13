import { SIDEBAR_TAB_PERMISSION_PREFIXES } from "../constants/employeeSidebarPermissionMap";
import { permissionTagsGrantModule } from "./oneIdPermissionUtils";

/**
 * Route-level flags derived from OneID `permissions[]` (same prefixes as sidebar tab ids).
 */
export function buildRoutePermissionAccess(permissionTags) {
  const tags = Array.isArray(permissionTags) ? permissionTags : [];
  const has = (tabId) => {
    const prefixes = SIDEBAR_TAB_PERMISSION_PREFIXES[tabId];
    if (!prefixes?.length) return false;
    return permissionTagsGrantModule(tags, prefixes);
  };

  return {
    employees: has(3),
    departments: has(4),
    branches: has(5),
    hrPolicies: has(6),
    payroll: has(7),
    notices: has(8),
    attendanceAdmin: has(10),
    shiftPlanner: has(11),
    hire: has(12),
    application: has(13),
    leavesPlanner: has(14),
    formApproval: has(17),
  };
}

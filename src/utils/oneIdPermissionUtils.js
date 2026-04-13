import { SIDEBAR_TAB_PERMISSION_PREFIXES } from "../constants/employeeSidebarPermissionMap";
import { isFullAdmin } from "../Authentication/roleHelpers";

/** Backend typo in some responses */
export function normalizePermissionTag(tag) {
  if (!tag || typeof tag !== "string") return "";
  return tag.trim().replace(/^ATTEANDANCE/g, "ATTENDANCE");
}

function isGrantingPermissionTag(tag) {
  const t = normalizePermissionTag(tag);
  if (!t) return false;
  if (t.includes("_NO_ACCESS")) return false;
  return t.includes("_FULL_ACCESS") || t.includes("_READ_ONLY");
}

/**
 * True if any permission grants one of the module prefixes (e.g. EMPLOYEE_*).
 */
export function permissionTagsGrantModule(permissionTags, modulePrefixes) {
  if (!Array.isArray(permissionTags) || !permissionTags.length) return false;
  if (!Array.isArray(modulePrefixes) || !modulePrefixes.length) return false;
  const granting = permissionTags.filter(isGrantingPermissionTag).map(normalizePermissionTag);
  return modulePrefixes.some((prefix) =>
    granting.some((t) => t.startsWith(prefix + "_"))
  );
}

/**
 * Sidebar tab visibility when OneID role permissions are loaded.
 */
export function isSidebarTabVisibleForPermissions(tab, ctx) {
  const {
    rawRoleId,
    uiShellRoleId,
    permissionTags,
    hasLoadedPermissions,
  } = ctx;

  if (isFullAdmin(rawRoleId)) {
    return tab.roles.includes("Admin");
  }

  const roleBased =
    tab.roles.includes(uiShellRoleId) ||
    (rawRoleId && tab.roles.includes(rawRoleId));

  if (tab.id === 1 || tab.id === 22) {
    return roleBased || (hasLoadedPermissions && permissionTags?.length > 0);
  }

  if (!hasLoadedPermissions || !permissionTags?.length) {
    return roleBased;
  }

  const prefixes = SIDEBAR_TAB_PERMISSION_PREFIXES[tab.id];
  if (prefixes === undefined) {
    return roleBased;
  }
  if (permissionTagsGrantModule(permissionTags, prefixes)) {
    return true;
  }
  return roleBased;
}

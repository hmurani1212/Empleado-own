import { SIDEBAR_TAB_PERMISSION_PREFIXES } from "../constants/employeeSidebarPermissionMap";
import { isFullAdmin } from "../Authentication/roleHelpers";
import { SIDEBAR_TAB_ID_ATTENDANCE_ADMIN } from "../Components/SideMenu/data";

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
 * Effective access for one module prefix (e.g. "EMPLOYEE", "DEPARTMENT").
 * Precedence: *_FULL_ACCESS > *_READ_ONLY > *_NO_ACCESS (conflicting tags: full wins).
 *
 * @returns {"full"|"read_only"|"none"}
 */
export function getModuleAccessLevel(permissionTags, modulePrefix) {
  if (!Array.isArray(permissionTags) || !permissionTags.length) return "none";
  const p = String(modulePrefix || "").trim().toUpperCase();
  if (!p) return "none";
  const tags = permissionTags.map(normalizePermissionTag).filter((t) => t.startsWith(`${p}_`));
  if (!tags.length) return "none";
  if (tags.some((t) => t.includes("_FULL_ACCESS"))) return "full";
  if (tags.some((t) => t.includes("_READ_ONLY"))) return "read_only";
  if (tags.some((t) => t.includes("_NO_ACCESS"))) return "none";
  return "none";
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
    // Tabs 2 and 10 both use ATTENDANCE_* prefixes; permission grant must not show
    // the admin `/attendance` item (id 10) for non-Admin roles that already have self-service (id 2).
    if (tab.id === SIDEBAR_TAB_ID_ATTENDANCE_ADMIN) {
      const isAdminShell =
        isFullAdmin(rawRoleId) ||
        uiShellRoleId === "Admin" ||
        rawRoleId === "Admin";
      if (!isAdminShell) {
        return roleBased;
      }
    }
    return true;
  }
  return roleBased;
}

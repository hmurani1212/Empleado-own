/**
 * JWT role_id / scope helpers (e.g. Admin, Employee, Branch_Admin, Department_Admin).
 */

/** Full org admin dashboard and admin-only modules */
export const isFullAdmin = (roleId) => roleId === "Admin";

/** Branch-scoped admin: same self-service as Employee, plus Branches module */
export const isBranchAdmin = (roleId) => roleId === "Branch_Admin";

/** Department-scoped admin: same self-service as Employee, plus Departments module */
export const isDepartmentAdmin = (roleId) => roleId === "Department_Admin";

/**
 * Sidebar / mobile menu: only Admin, Branch_Admin, Department_Admin keep their token role;
 * any other role (e.g. Manager) is treated as Employee.
 */
export const getRoleForUiShell = (roleId) => {
  if (roleId == null || roleId === "") return "Employee";
  if (isFullAdmin(roleId) || isBranchAdmin(roleId) || isDepartmentAdmin(roleId)) {
    return roleId;
  }
  return "Employee";
};

/** Custom / employee shell roles (e.g. Manager) — same self-service bucket as Employee for routing */
export const usesEmployeeSelfServiceShell = (roleId) =>
  getRoleForUiShell(roleId) === "Employee";

/** Employee-style app (dashboard, attendance, profile, …) — includes scoped admins */
export const isEmployeeAppRole = (roleId) =>
  roleId === "Employee" ||
  isBranchAdmin(roleId) ||
  isDepartmentAdmin(roleId);

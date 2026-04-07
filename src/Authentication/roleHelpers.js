/**
 * JWT role_id / scope helpers (e.g. Admin, Employee, Branch_Admin, Department_Admin).
 */

/** Full org admin dashboard and admin-only modules */
export const isFullAdmin = (roleId) => roleId === "Admin";

/** Branch-scoped admin: same self-service as Employee, plus Branches module */
export const isBranchAdmin = (roleId) => roleId === "Branch_Admin";

/** Department-scoped admin: same self-service as Employee, plus Departments module */
export const isDepartmentAdmin = (roleId) => roleId === "Department_Admin";

/** Employee-style app (dashboard, attendance, profile, …) — includes scoped admins */
export const isEmployeeAppRole = (roleId) =>
  roleId === "Employee" ||
  isBranchAdmin(roleId) ||
  isDepartmentAdmin(roleId);

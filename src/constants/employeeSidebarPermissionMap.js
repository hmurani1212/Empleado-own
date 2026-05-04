/**
 * Maps sidebar tab `id` (see SideMenu/data.js) to permission name prefixes from
 * `ids_permission.txt` / API `permissions[]` (e.g. EMPLOYEE_FULL_ACCESS → prefix EMPLOYEE).
 *
 * `undefined` = no API-based gate (visibility stays role-based only).
 * One tab can require any of several prefixes (OR).
 */
export const SIDEBAR_TAB_PERMISSION_PREFIXES = Object.freeze({
  2: ["ATTENDANCE_DATA"],
  3: ["EMPLOYEE"],
  4: ["DEPARTMENT"],
  5: ["BRANCH_WISE_ATTENDANCE"],
  6: ["HR_POLICIES"],
  7: [
    "PAYROLL_SALARY_TEMPLATES",
    "PAYROLL_EMPLOYEES_SALARY",
    "PAYROLL_PAYSLIPS_MANAGEMENT",
    "PAYROLL_REPORTS_EXPORT",
  ],
  8: ["NOTICES"],
  9: ["TASKS"],
  10: [
    "ATTENDANCE_DATA",
    "ATTENDANCE_EXPORT",
    "BRANCH_WISE_ATTENDANCE",
    "ATTENDANCE_RAW_LOGS",
    "ATTEANDANCE_RAW_LOGS",
  ],
  /** Employee shell — same gate as tab 10 (`buildRoutePermissionAccess().attendanceAdmin`). */
  27: [
    "ATTENDANCE_DATA",
    "ATTENDANCE_EXPORT",
    "BRANCH_WISE_ATTENDANCE",
    "ATTENDANCE_RAW_LOGS",
    "ATTEANDANCE_RAW_LOGS",
  ],
  11: ["SHIFT_PLANNER"],
  12: ["HIRE2_0"],
  13: ["APPLICATIONS"],
  14: ["LEAVE_PLANNER"],
  17: ["FORMSANDAPPROVE"],
  18: ["ATTENDANCE_DATA", "FORMSANDAPPROVE", "APPLICATIONS"],
  19: ["APPLICATIONS"],
  20: [
    "PAYROLL_SALARY_TEMPLATES",
    "PAYROLL_EMPLOYEES_SALARY",
    "PAYROLL_PAYSLIPS_MANAGEMENT",
    "PAYROLL_REPORTS_EXPORT",
  ],
  23: undefined,
  24: undefined,
  25: undefined,
  26: undefined,
  15: undefined,
  16: undefined,
  21: undefined,
});

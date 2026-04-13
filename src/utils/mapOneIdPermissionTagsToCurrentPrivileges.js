import { normalizePermissionTag } from "./oneIdPermissionUtils";

/**
 * Same module→tag mapping as AddingPrivileges (keep in sync).
 * Values: "1" full, "2" read only, "0" no access (matches customPrivilegesData).
 */
const MODULE_PERMISSION_TAGS = {
  1: { full: "EMPLOYEE_FULL_ACCESS", read: "EMPLOYEE_READ_ONLY", none: "EMPLOYEE_NO_ACCESS" },
  2: { full: "DEPARTMENT_FULL_ACCESS", read: "DEPARTMENT_READ_ONLY", none: "DEPARTMENT_NO_ACCESS" },
  3: { full: "HR_POLICIES_FULL_ACCESS", read: "HR_POLICIES_READ_ONLY", none: "HR_POLICIES_NO_ACCESS" },
  5: { full: "PAYROLL_SALARY_TEMPLATES_FULL_ACCESS", read: "PAYROLL_SALARY_TEMPLATES_READ_ONLY", none: "PAYROLL_SALARY_TEMPLATES_NO_ACCESS" },
  6: { full: "PAYROLL_EMPLOYEES_SALARY_FULL_ACCESS", read: "PAYROLL_EMPLOYEES_SALARY_READ_ONLY", none: "PAYROLL_EMPLOYEES_SALARY_NO_ACCESS" },
  7: { full: "PAYROLL_PAYSLIPS_MANAGEMENT_FULL_ACCESS", read: "PAYROLL_PAYSLIPS_MANAGEMENT_READ_ONLY", none: "PAYROLL_PAYSLIPS_MANAGEMENT_NO_ACCESS" },
  8: { full: "PAYROLL_REPORTS_EXPORT_FULL_ACCESS", read: "PAYROLL_REPORTS_EXPORT_READ_ONLY", none: "PAYROLL_REPORTS_EXPORT_NO_ACCESS" },
  9: { full: "NOTICES_FULL_ACCESS", read: "NOTICES_READ_ONLY", none: "NOTICES_NO_ACCESS" },
  10: { full: "TASKS_FULL_ACCESS", read: "TASKS_READ_ONLY", none: "TASKS_NO_ACCESS" },
  12: { full: "ATTENDANCE_DATA_FULL_ACCESS", read: "ATTENDANCE_DATA_READ_ONLY", none: "ATTENDANCE_DATA_NO_ACCESS" },
  13: { full: "ATTENDANCE_EXPORT_FULL_ACCESS", read: "ATTENDANCE_EXPORT_READ_ONLY", none: "ATTENDANCE_EXPORT_NO_ACCESS" },
  14: { full: "BRANCH_WISE_ATTENDANCE_FULL_ACCESS", read: "BRANCH_WISE_ATTENDANCE_READ_ONLY", none: "BRANCH_WISE_ATTENDANCE_NO_ACCESS" },
  15: { full: "ATTENDANCE_RAW_LOGS_FULL_ACCESS", read: "ATTENDANCE_RAW_LOGS_READ_ONLY", none: "ATTENDANCE_RAW_LOGS_NO_ACCESS" },
  16: { full: "SHIFT_PLANNER_FULL_ACCESS", read: "SHIFT_PLANNER_READ_ONLY", none: "SHIFT_PLANNER_NO_ACCESS" },
  17: { full: "APPLICATIONS_FULL_ACCESS", read: "APPLICATIONS_READ_ONLY", none: "APPLICATIONS_NO_ACCESS" },
  18: { full: "LEAVE_PLANNER_FULL_ACCESS", read: "LEAVE_PLANNER_READ_ONLY", none: "LEAVE_PLANNER_NO_ACCESS" },
  19: { full: "HIRE2_0_FULL_ACCESS", read: "HIRE2_0_READ_ONLY", none: "HIRE2_0_NO_ACCESS" },
  20: { full: "FORMSANDAPPROVE_FULL_ACCESS", read: "FORMSANDAPPROVE_READ_ONLY", none: "FORMSANDAPPROVE_NO_ACCESS" },
};

/**
 * Maps OneID `permissions[]` strings to `currentPrivileges` shape for AddingPrivileges.
 * Precedence per module: FULL_ACCESS > READ_ONLY > NO_ACCESS.
 */
export function mapOneIdPermissionTagsToCurrentPrivileges(permissions) {
  const tagSet = new Set(
    (Array.isArray(permissions) ? permissions : []).map((t) => normalizePermissionTag(String(t)))
  );
  const out = {};
  Object.keys(MODULE_PERMISSION_TAGS).forEach((id) => {
    out[id] = "0";
  });
  Object.entries(MODULE_PERMISSION_TAGS).forEach(([mid, t]) => {
    if (tagSet.has(t.full)) out[mid] = "1";
    else if (tagSet.has(t.read)) out[mid] = "2";
    else if (tagSet.has(t.none)) out[mid] = "0";
  });
  const payrollChildren = ["5", "6", "7", "8"];
  const attChildren = ["12", "13", "14", "15"];
  out["4"] = payrollChildren.some((id) => out[id] !== "0") ? "1" : "0";
  out["11"] = attChildren.some((id) => out[id] !== "0") ? "1" : "0";
  return out;
}

/** Tree for `settingPrivilegesData` — same structure as handleGrantRole mock. */
export const DEFAULT_PRIVILEGES_TREE_FOR_DRAWER = {
  1: { id: "1", nice_name: "Employees", parent_id: "0" },
  2: { id: "2", nice_name: "Departments", parent_id: "0" },
  3: { id: "3", nice_name: "HR policies", parent_id: "0" },
  4: { id: "4", nice_name: "Payroll", parent_id: "0" },
  5: { id: "5", nice_name: "Salary Templates", parent_id: "4" },
  6: { id: "6", nice_name: "Employees salary", parent_id: "4" },
  7: { id: "7", nice_name: "Payslips Management", parent_id: "4" },
  8: { id: "8", nice_name: "Reports Export", parent_id: "4" },
  9: { id: "9", nice_name: "Notices", parent_id: "0" },
  10: { id: "10", nice_name: "Tasks", parent_id: "0" },
  11: { id: "11", nice_name: "Attendance", parent_id: "0" },
  12: { id: "12", nice_name: "Attendance Data", parent_id: "11" },
  13: { id: "13", nice_name: "Attendance export", parent_id: "11" },
  14: { id: "14", nice_name: "Branch wise attendance", parent_id: "11" },
  15: { id: "15", nice_name: "Attendance raw logs", parent_id: "11" },
  16: { id: "16", nice_name: "Shift planner", parent_id: "0" },
  17: { id: "17", nice_name: "Applications", parent_id: "0" },
  18: { id: "18", nice_name: "Leave planner", parent_id: "0" },
  19: { id: "19", nice_name: "Hire 2.0", parent_id: "0" },
  20: { id: "20", nice_name: "Forms and Approval", parent_id: "0" },
};

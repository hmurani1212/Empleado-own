/**
 * Module-level ref set during render when on Employees list page.
 * Used by Get_All_Employeefn to skip get_all_employee API before useLayoutEffect runs,
 * avoiding an extra network call when navigating to /employees/all_employess.
 */
export const employeesListPageRef = { current: false };

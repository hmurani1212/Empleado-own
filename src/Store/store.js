import { devtools } from "zustand/middleware";
import { create } from "zustand";
import dashboardViewModel from "../ViewModel/DashboardViewModel/Dashboard";
import employeeViewModel from "../ViewModel/EmployeeViewModel/Employees";
import departmentsViewModel from "../ViewModel/DepartmentsViewModel/Departments";
import branchesViewModel from "../ViewModel/BranchesViewModel/Branches";
import branchesViewModel2 from "../ViewModel/Brach2ViewModel/Branches2";
import utilsViewModel from "../ViewModel/ViewModelServices/utils";
import drawerServices from "../services/DrawerServices";
import noticeViewModel from "../ViewModel/NoticeViewModel/Notice";
import applicationsViewModel from "../ViewModel/ApplicationViewModel/Applications";
import CustomComponentService from "../ViewModel/CustomComponentSevice";
import leavesPlannerViewModel from "../ViewModel/LeavePlannerViewModel/LeavePlanner";
import hrPoliciesViewModel from "../ViewModel/HRPoliciesViewModel/HRPolicies";
import hireViewModel from "../ViewModel/HireViewModel/Hire";
import hireViewModel_2 from "../ViewModel/HireViewModel2/Hire";
import formApprovalViewModel from "../ViewModel/FormApprovalViewModel/FormApproval";
import payrollViewModel from "../ViewModel/PayrollViewModel/Payroll";
import shiftManagementViewModel from "../ViewModel/ShiftManagementViewModel/ShiftManagement";
import attendanceViewModel from "../ViewModel/AttendanceViewModel/Attendance";
import notesPoolViewModel from "../ViewModel/NotesPoolViewModel/NotesPool";
import performanceViewModel from "../ViewModel/PerformnaceViewModel/Performance";
import authenticationServices from "../services/authenticationServices";
import empDashboardViewModel from "../ViewModel/EmpViewModel/EmpDashboardViewModel/EmpDashboard";
import empAttendanceViewModel from "../ViewModel/EmpViewModel/EmpAttendanceViewModel/EmpAttendance";
import empTimeAdjustmentViewModel from "../ViewModel/EmpViewModel/EmpTimeAdjustment/EmpTimeAdjustment";
import empApplicationViewModel from "../ViewModel/EmpViewModel/EmpApplicationViewModel/EmpApplicationViewModel";
import empExpenseViewModel from "../ViewModel/EmpViewModel/EmpExpenseViewModel/EmpExpense";
import empDutiesViewModel from "../ViewModel/EmpViewModel/EmpDutiesViewModel/EmpDuties";
import empTrainingViewModel from "../ViewModel/EmpViewModel/EmpTrainingViewModel/EmpTraining";
// import empPerformanceViewModel from "../ViewModel/EmpViewModel/EmpPerformanceViewModel/EmpPerformance";
import set_hire_apis from "../ViewModel/CareerViewModel/hire";
import TrainingiewModel from "../ViewModel/TraingingViewModel/Training";
import InboxViewModel from "../ViewModel/InboxViewModel/Inbox";
import starredNotesService from "../services/StarredNotesService";
import notificationsViewModel from "../ViewModel/NotificationsViewModel/Notifications";
import remindersViewModel from "../ViewModel/RemindersViewModel/Reminders";
import expenseViewModel from "../ViewModel/ExpenseViewModel/Expense";
import reportsViewModel from "../ViewModel/ReportsViewModel/Reports";

const useStore = create(
  devtools((set, get) => ({
    // Authentication state management
    isAuthenticated: false,
    isAuthLoading: true,
    setAuthenticationState: (isAuthenticated, isAuthLoading = false) => set({ isAuthenticated, isAuthLoading }),

    ...dashboardViewModel(set, get),
    ...employeeViewModel(set, get),
    ...departmentsViewModel(set, get),
    ...branchesViewModel(set, get),
    ...utilsViewModel(set, get),
    ...drawerServices(set, get),
    ...noticeViewModel(set, get),
    ...applicationsViewModel(set, get),
    ...CustomComponentService(set, get),
    ...leavesPlannerViewModel(set, get),
    ...hrPoliciesViewModel(set, get),
    ...hireViewModel(set, get),
    ...formApprovalViewModel(set, get),
    ...payrollViewModel(set, get),
    ...shiftManagementViewModel(set, get),
    ...attendanceViewModel(set, get),
    ...notesPoolViewModel(set, get),
    ...performanceViewModel(set, get),
    ...authenticationServices(set, get),
    ...empDashboardViewModel(set, get),
    ...empAttendanceViewModel(set, get),
    ...empTimeAdjustmentViewModel(set, get),
    ...empApplicationViewModel(set, get),
    ...empExpenseViewModel(set, get),
    ...empDutiesViewModel(set, get),
    ...empTrainingViewModel(set, get),
    // ...empPerformanceViewModel(set, get),
    ...hireViewModel_2(set, get),
    ...branchesViewModel2(set, get),
    ...set_hire_apis(set, get),
    ...TrainingiewModel(set, get),
    ...InboxViewModel(set, get),
    ...starredNotesService(set, get),
    ...notificationsViewModel(set, get),
    ...remindersViewModel(set, get),
    ...expenseViewModel(set, get),
    ...reportsViewModel(set, get)
  }))
);

export default useStore;

import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import {
  Application,
  Attendance,
  Branches,
  Dashboard,
  Departments,
  Employees,
  EmployeeDashboard,
  Expense,
  ExpenseDashboard,
  FormApproval,
  HRPolicies,
  Hire,
  LeavesPlanner,
  NotesPool,
  Notices,
  Payroll,
  Performance,
  ShiftPlanners,
  Tasks,
} from "../View";
import { Login } from "../Components";
import IndividualPayslipPreview from "../View/Payroll/IndividualPayslipPreview";
import {
  AddBulkEmployee,
  AddNewEmployee,
  AllEmployess,
  EmployeeCheckList,
} from "../View/Employees";
import CreateNewBranch from "../View/Branches/CreateNewBranch";
import ListNotices from "../View/Notices/ListNotices";
import AddNotice from "../View/Notices/AddNotice";
import ApplicationsLists from "../View/Application/ApplicationsLists";
import NewApplication from "../View/Application/NewApplication";
import NoticesView from "../View/Notices/NoticesView";
import LeavesGroup from "../View/LeavesPlanner/LeavesGroup";
import PublicHoliday from "../View/LeavesPlanner/PublicHoliday";
import ViewLeaves from "../View/LeavesPlanner/ViewLeaves";
import ManagePolicies from "../View/HRPolicies/ManagePolicies";
import CreateNew from "../View/HRPolicies/CreateNew";
import SwapPolicies from "../View/HRPolicies/SwapPolicies";
import VacanciesList from "../View/Hire/VacanciesList";
import TalentPool from "../View/Hire/TalentPool";
import AllApplicants from "../View/Hire/AllApplicants";
import Shortlisted from "../View/Hire/Shortlisted";
import Applicants from "../View/Hire/Applicants";
import Interviewed from "../View/Hire/Interviewed";
import Accepted from "../View/Hire/Accepted";
import Rejected from "../View/Hire/Rejected";
// import ViewDetail from '../View/Hire/ViewDetail'
import ViewDetailApplicants from "../View/Hire/ViewDetailApplicants";
import Starred from "../View/Hire/Starred";
// import AllApplicantsCardData from '../View/Hire/AllApplicantsCardData'
import CreateVacancy from "../View/Hire/CreateVacancy";
import CustomForm from "../View/FormApproval/CustomForm";
import ApprovalFlow from "../View/FormApproval/ApprovalFlow";
import PayrollOverview from "../View/Payroll/PayrollOverview";
import ManageSalaryTemplate from "../View/Payroll/ManageSalaryTemplate";
import DepartmentsMain from "../View/Departments/DepartmentsMain";
import ManageSubDepartments from "../View/Departments/ManageSubDepartments";
import CreateNewDepartment from "../View/Departments/CreateNewDepartment";
import ManageEmployeesSalary from "../View/Payroll/ManageEmployeesSalary";
import AttReportArchive from "../View/Attendance/AttReportArchive";
import BranchWiseListReporting from "../View/Attendance/BranchWiseListReporting";
import RawAttendanceLogs from "../View/Attendance/RawAttendanceLogs";
// import AttAdjustRequest from '../View/Application/AttAdjustRequest'
import AttAdustmentRequest from "../View/Attendance/AttAdustmentRequest";
// import CustomDetailCard from '../Components/CustomDetailCard/CustomDetailCard'
import DetailTimeAdjRequest from "../View/Attendance/DetailTimeAdjRequest";
import ManagePayslips from "../View/Payroll/ManagePayslips";
import ExportReports from "../View/Payroll/ExportReports";
import SettingPayroll from "../View/Payroll/SettingPayroll";
import IncentivesDeductions from "../View/Payroll/IncentivesDeductions";
import ManageIncDeduct from "../View/Payroll/ManageIncDeduct";
import HistoryIncDeduct from "../View/Payroll/HistoryIncDeduct";
import IncentiveList from "../View/Payroll/IncentiveList";
import DeductionList from "../View/Payroll/DeductionList";
import Notesbook from "../View/NotesPool/Notesbook";
import MySharedNotesbook from "../View/NotesPool/MySharedNotesbook";
import SharedNotebooks from "../View/NotesPool/SharedNotebooks";
import StarredNotes from "../View/NotesPool/StarredNotes";
import PRC from "../View/Performance/PRC";
import Goals from "../View/Performance/Goals";
import Competency from "../View/Performance/Competency";
import History from "../View/Performance/History";
import Feedback from "../View/Performance/Feedback";
import Inbox from "../View/Inobx/Inbox";
import IndividualAttendance from "../View/Attendance/IndividualAttendance";
import SubComptency from "../View/Performance/SubComptency";
import SubGoals from "../View/Performance/SubGoals";
import useStore from "../Store/store";
import { getUserData } from "../Authentication/jwt_decode";
import EmpDashboard from "../View/EmployeeView/EmpDashboard/EmpDashboard";
import EmpAttendance from "../View/EmployeeView/EmpAttendance/EmpAttendance";
import EmpNotices from "../View/EmployeeView/EmpNotices/EmpNotices";
// import EmpTask from "../View/EmployeeView/EmpTask/EmpTask"; // Removed - Tasks now redirects to external URL
import EmpTimeAdjustment from "../View/EmployeeView/EmpTimeAdjustment/EmpTimeAdjustment";
import EmpApplication from "../View/EmployeeView/EmpApplication/EmpApplication";
import EmployeeTraining from "../View/EmployeeView/EmpTraining/EmployeeTraining";
import CourseDetailPage from "../View/EmployeeView/EmpTraining/CourseDetailPage";
import AssessmentPage from "../View/EmployeeView/EmpTraining/AssessmentPage";
import EmpPayslip from "../View/EmployeeView/EmpPayslip/EmpPayslip";
import EmpDuties from "../View/EmployeeView/EmpDuties/EmpDuties";
import EmpPerformance from "../View/EmployeeView/EmpPerformance/EmpPerformance";
import EmpProfile from "../View/EmployeeView/EmpProfile/EmpProfile";
import EmpExpense from "../View/EmployeeView/EmpExpense/EmpExpense";
import EditDepartment from "../View/Departments/EditDepartment";
// import HiringPage from "../View/Career/HiringPage";
// import Profile from "../View/Career/profile";
// import Header from "../View/Career/header";
// import EmployeeProfile from
import TrainingDash from "../View/Training/TrainingDash";
import QuestionBank from "../View/Training/QuestionBank";
import AddQuestionForm from "../View/Training/AddQuestionForm";
import AddQuestionInBank from "../View/Training/AddQuestionInBank";
import CourseCompletion from "../View/Training/CourseCompletion";
import AdminEmployeeProfile from "../View/Employees/AdminEmployeeProfile";
import AdminEmployeePayslip from "../View/Employees/AdminEmployeePayslip";
// import EmployeeTraining from "../View/EmployeeView/Training/EmployeeTraining"
import Test from "../View/Employees/Test"
import Settings from "../View/Settings/Settings"
import ViewPolicy from "../View/HRPolicies/ViewPolicy";
import TrackPolicy from "../View/Attendance/TrackPolicy";
import IndividualAttendanceReport from "../View/Attendance/IndividualAttendanceReport";
import CurrentHRPolicy from "../View/Attendance/CurrentHRPolicy";
import RawLogs from "../View/Attendance/RawLogs";
import AttendanceTrackPolicy from "../View/Attendance/AttendanceTrackPolicy";
import RawAttendanceLog from "../View/Attendance/RawAttendanceLog";

const Routers = () => {
  const location = useLocation();
  const jwt = typeof localStorage !== "undefined" ? localStorage.getItem("jwt") : null;
  // Legacy `/login` URL: client-side only to `/` so login always uses root (matches static hosting)
  if (location.pathname === "/login") {
    return <Navigate to="/" replace />;
  }

  // Show login shell only at `/` when unauthenticated; authenticated `/` uses dashboard routes below
  const isLoginRoute = location.pathname === "/" && !jwt;

  // Get role from JWT token directly
  const userData = getUserData();
  const authRole = userData?.roleId || 'Employee';


  return (
    <Routes>
      {isLoginRoute ? (
        <Route path="/" element={<Login />} />
      ) : (
        <>
          {/* Individual Payslip Preview Route */}
          <Route path="/individual-payslip-preview/:id" element={<IndividualPayslipPreview />} />

          {/* Career Page Routes - These should be accessible without authentication */}
          {/* <Route path="/career/:id" element={<HiringPage />} />
          <Route path="/career/:id/profile" element={<Profile />} /> */}

          {/* Public Career Routes */}
          {/* <Route path="/vacancy/:id" element={<HiringPage />} />
          <Route path="/vacancy/:id/profile" element={<Profile />} /> */}

          {authRole === "Admin" ? (
            <Route exact path="/" element={<Dashboard />} />
          ) : (
            <Route exact path="/" element={<EmployeeDashboard />} />
          )}

          {/* Dashboard route for both roles */}
          {authRole === "Admin" ? (
            <Route exact path="/dashboard" element={<Dashboard />} />
          ) : (
            <Route exact path="/dashboard" element={<EmployeeDashboard />} />
          )}
          {authRole !== "Admin" && (
            <Route path="/attendance" element={<EmpAttendance />} />
          )}
          {authRole === "Admin" && (
            <Route path="/employees/" element={<Employees />}>
              <Route path="all_employess" element={<AllEmployess />}>
                <Route
                  path="individual-attendance"
                  element={<IndividualAttendance />}
                ></Route>
              </Route>
              <Route path="add_emp" element={<AddNewEmployee />}></Route>
              <Route path="add_bulk_emp" element={<AddBulkEmployee />}></Route>
              <Route
                path="emp_checkList"
                element={<EmployeeCheckList />}
              ></Route>
            </Route>
          )}
          <Route path="/employee-profile/:employeeId" element={<AdminEmployeeProfile />}></Route>
          <Route path="employee-payslip/:employeeId" element={<AdminEmployeePayslip />}></Route>
          <Route path="/departments/" element={<DepartmentsMain />}>
            <Route path="edit/:id" element={<EditDepartment />} />
            <Route path="manageDept/:id" element={<Departments />}>
              <Route
                path="manage_sub_dep/:subDeptid"
                element={<ManageSubDepartments />}
              ></Route>
            </Route>
            <Route
              path="createNewDept/:id"
              element={<CreateNewDepartment />}
            ></Route>
            <Route
              path="createNewDeptManage/:id"
              element={<CreateNewDepartment />}
            ></Route>
          </Route>

          <Route path="/branches" element={<Branches />} />
          <Route
            path="/branches/create_new_branch"
            element={<CreateNewBranch />}
          />

          {/* Training module routes */}
          {authRole === "Admin" && (
            <>
              <Route path="/trainingDash" element={<TrainingDash />} />
              <Route path="/courseCompletion" element={<CourseCompletion />} />
              <Route path="/questionBank" element={<QuestionBank />} />
              <Route path="/addQuestion" element={<AddQuestionForm />} />
              <Route path="/addQuestionInBank" element={<AddQuestionInBank />} />
            </>
          )}

          <Route path="/hrpolicies/" element={<HRPolicies />}>
            <Route path="manage_policies" element={<ManagePolicies />}></Route>
            <Route path="create_new" element={<CreateNew />}></Route>

            <Route path="swap_policies" element={<SwapPolicies />}></Route>
          </Route>

          <Route path="/payroll" element={<Payroll />}>
            <Route
              path="payroll_overview"
              element={<PayrollOverview />}
            ></Route>
            <Route
              path="manage_salary_template"
              element={<ManageSalaryTemplate />}
            ></Route>
            <Route
              path="manage_employees_salary"
              element={<ManageEmployeesSalary />}
            ></Route>
            <Route path="manage_payslip" element={<ManagePayslips />}></Route>
            <Route path="export_Reports" element={<ExportReports />}></Route>
            <Route path="settings" element={<SettingPayroll />}></Route>
          </Route>
          <Route
            path="/payroll/manage_employees_salary/incentive_deduction/"
            element={<IncentivesDeductions />}
          >
            <Route
              path="manage_Incent_deduct"
              element={<ManageIncDeduct />}
            ></Route>
            <Route
              path="history_Inc_deduct"
              element={<HistoryIncDeduct />}
            ></Route>
            <Route path="incentive_list" element={<IncentiveList />}></Route>
            <Route path="deduct_list" element={<DeductionList />}></Route>
          </Route>

          {authRole === "Admin" ? (
            <Route path="/notices/" element={<Notices />}>
              <Route path="list_notices" element={<ListNotices />}></Route>
              <Route path="add_notice" element={<AddNotice />}></Route>
              <Route
                path="list_notices/notices_view"
                element={<NoticesView />}
              ></Route>
            </Route>
          ) : (
            <Route path="/notices/list_notices" element={<EmpNotices />} />
          )}
          {/* Tasks route removed - now redirects to external URL https://accelerate.veevotech.com/ */}

          {/* <Route path='/attendance' element={<Attendance />}/> */}
          {authRole === "Admin" && (
            <Route path="/attendance/" element={<Attendance />}>
              <Route
                path="individual-attendance"
                element={<IndividualAttendance />}
              >
                <Route path="individual_attendance_report" element={<IndividualAttendanceReport />}></Route>
                <Route path="current_hr_policy" element={<CurrentHRPolicy />}></Route>
                <Route path="raw_attendance_logs" element={<RawLogs />}></Route>
                <Route path="track_policy" element={<AttendanceTrackPolicy />}></Route>
              </Route>
              <Route
                path="att_report_archive"
                element={<AttReportArchive />}
              ></Route>
              <Route
                path="branch_wise_list_rep"
                element={<BranchWiseListReporting />}
              ></Route>
              <Route
                path="raw_att_logs"
                element={<RawAttendanceLogs />}
              ></Route>
              <Route
                path="attendance_adjust_req/"
                element={<AttAdustmentRequest />}
              >
                <Route
                  path="detail_card/:id"
                  element={<DetailTimeAdjRequest />}
                ></Route>
              </Route>
            </Route>
          )}

          <Route path="/shiftPlanners" element={<ShiftPlanners />} />

          <Route path="/hire/" element={<Hire />}>
            <Route path="vacancies_list" element={<VacanciesList />}></Route>
            <Route path="talent_pool" element={<TalentPool />}></Route>
          </Route>
          <Route
            path="/hire/create_vacancy"
            element={<CreateVacancy />}
          ></Route>

          <Route
            path="/hire/vacancies_list/all_applicants/:vacancyId"
            element={<AllApplicants />}
          >
            <Route path="applicant" element={<Applicants />}>
              <Route
                path="view_detail/:id"
                element={<ViewDetailApplicants />}
              ></Route>
            </Route>
            <Route path="shortlisted" element={<Shortlisted />}>
              <Route
                path="view_detail/:id"
                element={<ViewDetailApplicants />}
              ></Route>
            </Route>
            <Route path="interviewed" element={<Interviewed />}>
              <Route
                path="view_detail/:id"
                element={<ViewDetailApplicants />}
              ></Route>
            </Route>
            <Route path="accepted" element={<Accepted />}>
              <Route
                path="view_detail/:id"
                element={<ViewDetailApplicants />}
              ></Route>
            </Route>
            <Route path="rejected" element={<Rejected />}>
              <Route
                path="view_detail/:id"
                element={<ViewDetailApplicants />}
              ></Route>
            </Route>

            <Route path="starred" element={<Starred />}>
              <Route
                path="view_detail/:id"
                element={<ViewDetailApplicants />}
              ></Route>
            </Route>
          </Route>

          <Route path="/application/" element={<Application />}>
            <Route
              path="application_list"
              element={<ApplicationsLists />}
            ></Route>
            <Route path="new_applications" element={<NewApplication />}></Route>
          </Route>

          <Route path="/leavesPlanner" element={<LeavesPlanner />}>
            <Route path="leaves_group" element={<LeavesGroup />}>
              <Route path="viewLeaves/:id" element={<ViewLeaves />} />
            </Route>
            <Route path="public_holiday" element={<PublicHoliday />} />
          </Route>
          {
            authRole === "Admin" || "Employee" ? (
              <Route path="/notespool/" element={<NotesPool />}>
                <Route path="" element={<Notesbook />} />
                <Route
                  path="mysharednotebooks"
                  element={<MySharedNotesbook />}
                />
                <Route path="sharednotebooks" element={<SharedNotebooks />} />
                <Route path="starrednotes" element={<StarredNotes />} />
              </Route>
            ) : (
              <Route path="/notespool/" element={<NotesPool />}>
                <Route path="" element={<Notesbook />} />
                <Route
                  path="mysharednotebooks"
                  element={<MySharedNotesbook />}
                />
                <Route path="sharednotebooks" element={<SharedNotebooks />} />
              </Route>
            )
            // <Route path='/notespool' element={<EmpNotices />} />
          }

          {authRole === "Admin" ? (
            <Route path="/performance/" element={<Performance />}>
              <Route path="" element={<PRC />} />
              <Route path="goals" element={<Goals />}>
                <Route path="sub-goals" element={<SubGoals />} />
              </Route>
              <Route path="competency" element={<Competency />}>
                <Route path="sub-competency" element={<SubComptency />} />
              </Route>
              <Route path="history" element={<History />}></Route>
              <Route path="feedback" element={<Feedback />} />
            </Route>
          ) : (
            <Route path="/performance" element={<EmpPerformance />} />
          )}

          <Route path="/formApproval/" element={<FormApproval />}>
            <Route path="custom_form" element={<CustomForm />}></Route>
            <Route path="approval_flow" element={<ApprovalFlow />}></Route>
          </Route>

          {/* Expense Management Route for Admin */}
          {authRole === "Admin" && (
            <Route path="/expense" element={<Expense />}>
              <Route index element={<ExpenseDashboard />} />
            </Route>
          )}
          {authRole !== "Admin" && (
            <>
              <Route path="/time-adjustment" element={<EmpTimeAdjustment />} />
              <Route path="/applications" element={<EmpApplication />} />
              <Route path="/payslip" element={<EmpPayslip />} />
              <Route path="/duties" element={<EmpDuties />} />
            </>
          )}

          <Route path="/inbox" element={<Inbox />}></Route>
          {authRole !== "Admin" && (
            <Route path="/profile" element={<EmpProfile />} />
          )}
          {authRole !== "Admin" && (
            <Route path="/expense" element={<EmpExpense />} />
          )}
          {/* Employee Training routes */}
          {authRole !== "Admin" && (
            <>
              <Route path="/EmployeeTraining" element={<EmployeeTraining />} />
              <Route path="/EmployeeTraining/course/:courseIndex" element={<CourseDetailPage />} />
              <Route path="/EmployeeTraining/assessment" element={<AssessmentPage />} />
            </>
          )}
          
          {/* Settings Route - Available for Admin users */}
          {authRole === "Admin" && (
            <Route path="/settings" element={<Settings />} />
          )}
        </>
      )}
    </Routes>
  );
};

export default Routers;

import useStore from '../../Store/store'
import { useState } from 'react'

const useSideMenu = ()=>{

    // Removed unused dashboardDataFunc and getEmployeesList - these are now handled by individual components
    const handleEmpMount = useStore((state)=> state.handleEmpMount)
    const getAllDepartments = useStore((state)=> state.getAllDepartments)
    const mobilevToggleFalse = useStore((state)=> state.mobilevToggleFalse)
    const gettingAllBranches = useStore((state)=> state.gettingAllBranches)
    const handleMountBranch = useStore((state)=> state.handleMountBranch)
    const handleMountApplication = useStore((state)=> state.handleApplicationsMount)
    // const gettingApplicationsList = useStore((state)=> state.gettingApplicationsList)
    const getAllNoticesList = useStore((state)=> state.getAllNoticesList)
    const handleNoticeMount = useStore((state)=> state.handleNoticeMount)
    const getLeavesList = useStore ((state) => state.getLeavesList)
    const handleMountLeave = useStore ((state)=>state.handleMountLeave)
    // const getPoliciesList = useStore ((state) => state.getPoliciesList)
    const getAllHrPolicies = useStore((state)=>state.getAllHrPolicies)
    const handleMountPolicies = useStore((state) => state.handleMountPolicies)
    const gettingAllVacanciesList = useStore((state) => state.gettingAllVacanciesList)
    const handleMountHire = useStore((state) => state.handleMountHire)
    // const gettingDashboardRecuirment = useStore((state) => state.gettingDashboardRecuirment)
    const gettingCustomForm = useStore((state) => state.gettingCustomForm )
    const handleMountCustomForm = useStore((state) => state.handleMountCustomForm)
    const gettingAllShift = useStore((state) => state.gettingAllShift)
    const handleMountShift = useStore((state) => state.handleMountShift)   
    const gettingLateComers = useStore((state) => state.gettingLateComers)   
    const handleMountDept = useStore((state) => state.handleMountDept)
    const getAllDepartmentsLeaves = useStore((state) => state.getAllDepartmentsLeaves)
    const getDataGrossNet = useStore((state) => state.getDataGrossNet)
    const getAnnualGrossSalary = useStore((state) => state.getAnnualGrossSalary)
    const getGrossSalary = useStore((state) => state.getGrossSalary)
    const gettingNoteBooks = useStore((state) => state.gettingNoteBooks)
    const handleMountNotesPool = useStore((state) => state.handleMountNotesPool)
    const authRole = useStore((state) => state.authRole)
    
    
    
    // Removed unused gettingEmpDashboardData - dashboard API is now handled by individual components
    // Removed gettingEmpAttendanceData - EmpAttendance.jsx fetches once on mount with correct month/year

    const [activeTab, setActiveTab] = useState(1)


    const handleSideMenuTab = (id)=>{    
        // console.log('id', id)
        setActiveTab(id)
        mobilevToggleFalse()
        if(authRole === 'Admin'){

        
            switch (id) {
                case 1:
                    // Dashboard data is now handled by individual components
                    // Removed duplicate dashboardDataFunc call
                    break;
                case 2:
                    // Employee Attendance (for Employee role)
                    break;
                case 3:
                    // Employees (id: 3) - no extra API; list page uses getEmployeesWithFilters only
                    break;
                case 4:
                    // Departments (id: 4) - don't call getBranchEmployeeList here; DepartmentsMain.jsx fetches on mount (avoids duplicate get_branch_employee)
                    handleMountDept()
                    break;
                case 5:
                    // Branches (id: 5) - don't call gettingAllBranches here; Branches.jsx fetches via gettingAllBranchesNew on mount (avoids duplicate get_branches)
                    handleMountBranch()
                    break;

                case 6:
                    // HR Policies (id: 6) — ManagePolicies.jsx loads branches via getAllBranchesHrPolicy (get_branches), not get_branch_employee
                    const branch_id = 0
                    const status = 1
                    handleMountPolicies()
                    getAllHrPolicies(branch_id, status)
                    break;

                case 7:
                    // Payroll (id: 7) - don't call dashboard-data here; PayrollOverview fetches on mount (avoids 3 duplicate API calls)
                    break;

                case 8:
                    // Notices (id: 8) - don't call getAllNoticesList here; ListNotices.jsx fetches on mount (avoids duplicate notices API)
                    handleNoticeMount()
                    getAllDepartments()
                    break;

                case 9:
                    gettingLateComers()
                    // gettingAttReportArchive()
                    
                break;

                case 10:
                    // Attendance (Admin) – no shift planners API; only Shift Planners page (case 11) needs it
                    break;

                case 11:
                    handleMountShift()
                    gettingAllShift()
                break;

                case 12:
                    handleMountHire()
                    gettingAllVacanciesList({statusFilter : 2})
                break;

                case 13:
                    handleMountApplication()
                break;

                case 14:
                    handleMountLeave()
                    getLeavesList()
                    getAllDepartmentsLeaves()
                break;

                case 15:
                    handleMountNotesPool()
                    gettingNoteBooks()
                break;

                case 16:
                    // Performance (id: 16) – no get_dynamic_Form here; Performance page uses get_performance_review only
                    break;

                case 17:
                    // Form & Approval (id: 17) – don't call gettingCustomForm here; CustomForm.jsx fetches on mount (avoids duplicate get_dynamic_Form)
                    handleMountCustomForm()
                    break;

                default:
                    break;
            }
        }else{
            switch(id){
                case 1:
                    // Dashboard data is now handled by individual components
                    // Removed duplicate gettingEmpDashboardData call
                    break;
                case 2:
                    // Attendance: do not call gettingEmpAttendanceData() here (no args = empty month/year).
                    // EmpAttendance.jsx fetches once on mount with correct month/year.
                    break;
                default:
                    break
            }
        }
    }

    return { handleSideMenuTab, activeTab }
}

export default useSideMenu
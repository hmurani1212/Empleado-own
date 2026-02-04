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
    const getAllBranchesHrPolicy = useStore((state) => state.getAllBranchesHrPolicy)
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
    const gettingEmpAttendanceData = useStore((state) => state.gettingEmpAttendanceData)
    

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
                    handleEmpMount()
                    break;
                case 3:
                    handleMountDept()
                    getAllDepartments()
                    break;
                case 4:
                    
                    const data = {status: 1}
                    gettingAllBranches(data)
                    handleMountBranch()

                    break;

                case 5:
                    const branch_id = 0
                    const status = 1
                    
                    handleMountPolicies()
                    getAllHrPolicies(branch_id, status)
                    getAllBranchesHrPolicy()
                    
                    break;
                
                case 6:
                    getAnnualGrossSalary()
                    getDataGrossNet()
                    getGrossSalary()
                break;
                
                case 7:
                    handleNoticeMount()
                    getAllDepartments()
                    getAllNoticesList()
                break;

                case 9:
                    gettingLateComers()
                    // gettingAttReportArchive()
                    
                break;

                case 10:
                    handleMountShift()
                    gettingAllShift()
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
                    handleMountCustomForm()
                    gettingCustomForm()
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
                    gettingEmpAttendanceData()
                    break;
                default:
                    break
            }
        }
    }

    return { handleSideMenuTab, activeTab }
}

export default useSideMenu
import { FaBook } from "react-icons/fa6";
import { BiShare } from "react-icons/bi";
import { FaTrash  } from "react-icons/fa6";
import { IoCopy,IoCut   } from 'react-icons/io5'
import employeesApi from "../Model/Data/Employees/Employees"

export const notbookMenuList =[
    {id:1, name:'Edit', icon:<FaBook className="text-green-500" />},
    {id:2, name:'Delete', icon: <FaTrash className="text-red-500" />},
    {id:3, name:'Share', icon:<BiShare className="text-yellow-500" />}
]
export const notMenuList =[
    {id:1, name:'Edit Title', icon:<FaBook className="text-green-500" />},
    {id:2, name:'Edit Note', icon:<FaBook className="text-green-500" />},
    {id:3, name:'Copy', icon:<IoCopy className="text-[#8bc9f8]" />},
    {id:4, name:'Cut', icon:<IoCut  className="text-indigo-500" />},
    {id:5, name:'Delete', icon: <FaTrash className="text-red-500" />},
    {id:6, name:'Share', icon:<BiShare className="text-yellow-500" />}
]


export const mysharenotesMenuList = [
    {id:2, name:'Edit', icon:<FaBook className="text-green-500" />},
]

export const sharednotesMenuList = [
    {id:2, name:'Edit', icon:<FaBook className="text-green-500" />},
]

export const sharedNotebookMenuList = [
    {id:1, name:'Share', icon:<BiShare className="text-yellow-500" />},
]
export const mysharenoteBookenuList = [
    {id:2, name:'Delete', icon: <FaTrash className="text-red-500" />},

]

export const notebookShareData = [
    {id: 1, title :'Add notes to already shared pool notebook'},
    {id: 2, title :'Add this NoteBook to Shared Pool'}
]


export const sharenotbookPermissionData = [
    {id:1, title:'Download', fieldName: 'download'},
    {id:2, title:'Sharing', fieldName: 'allow_sharing'},
    {id:3, title:'Notes Addition', fieldName: 'notes_addition'},
    {id:4, title:'Read', fieldName: 'read'},
    {id:5, title:'Write', fieldName: 'write'},

]


export const sharenotebookShareWithData = [
    {id:1, title:'Whole Organization', value:'whole_organization'},
    {id:2, title:'Branch',value:'branch'},
    {id:3, title:'Departments', value:'dept'},
    {id:4, title:'Employee', value:'employee'},
]


export const noteShareData = [
    {id: 1, title :'Add notes to already shared pool notebook'},
    {id: 2, title :'Add this NoteBook to Shared Pool'},
    {id: 3, title :'Share Publicly'},
]

/** Departments for a branch: match branch_id, plus company-wide rows (branch_id 0). */
export const filterDepartmentsForBranch = (departments, branchId) => {
    if (branchId === undefined || branchId === null || branchId === '') return []
    const sel = Number(branchId)
    return (departments || []).filter(
        (dept) => Number(dept.branch_id) === sel || Number(dept.branch_id) === 0
    )
}

/** Active employees only (`status=1`), for Notes Pool share branch + department pickers. */
export const fetchActiveEmployeesForBranchDept = async (branchId, deptId) => {
    if (branchId === undefined || branchId === null || branchId === '' || deptId === undefined || deptId === null || deptId === '') {
        return []
    }
    try {
        const res = await employeesApi.getEmployeesWithFilters({
            branch_id: branchId,
            dept_id: deptId,
            status: '1',
            pages: 'all',
        })
        const data = res?.data
        if (data?.STATUS !== 'SUCCESSFUL' || !Array.isArray(data.DB_DATA?.employees)) {
            return []
        }
        return data.DB_DATA.employees.map((e) => ({
            id: e.id,
            name: e.name ?? e.emp_name ?? '',
        }))
    } catch {
        return []
    }
}

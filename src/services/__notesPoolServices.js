import { FaBook, FaTrash } from "react-icons/fa6";
import { BiShare, BiDownload } from "react-icons/bi";
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

/** True when a sharing permission field from the API is granted. */
export function isSharingPermissionGranted(val) {
  return val === 1 || val === '1' || val === true;
}

/**
 * Shared notebook **card** overflow menu (Shared Notebooks list only).
 * Add note / edit are not shown here; users open the notebook from the card and those actions follow allow_notes_addition / allow_edit inside the notebook view.
 * `permKey` maps to `notebook.shared_links[0].permissions`.
 */
export const sharedNotebookMenuList = [
    { id: 1, name: 'Share',    icon: <BiShare    className="text-yellow-500" />, permKey: 'allow_sharing'  },
    { id: 3, name: 'Download', icon: <BiDownload className="text-blue-500"   />, permKey: 'allow_download' },
]
export const mysharenoteBookenuList = [
    {id:2, name:'Delete', icon: <FaTrash className="text-red-500" />},

]

export const notebookShareData = [
    {id: 1, title :'Add notes to already shared pool notebook'},
    {id: 2, title :'Add this NoteBook to Shared Pool'}
]


export const sharenotbookPermissionData = [
    {id:1, title:'Download',        fieldName: 'allow_download'        },
    {id:2, title:'Sharing',         fieldName: 'allow_sharing'         },
    {id:3, title:'Notes Addition',  fieldName: 'allow_notes_addition'  },
    {id:4, title:'View',            fieldName: 'allow_view'            },
    {id:5, title:'Edit',            fieldName: 'allow_edit'            },
]

/**
 * @param {string[]} allowPermission - `fieldName` values from UI checkboxes that are selected
 * @returns {{ allow_download: number, allow_view: number, allow_sharing: number, allow_notes_addition: number, allow_edit: number }}
 */
export function buildSharingPermission(allowPermission = []) {
    const selected = new Set(allowPermission)
    return {
        allow_download: selected.has('allow_download') ? 1 : 0,
        allow_view: selected.has('allow_view') ? 1 : 0,
        allow_sharing: selected.has('allow_sharing') ? 1 : 0,
        allow_notes_addition: selected.has('allow_notes_addition') ? 1 : 0,
        allow_edit: selected.has('allow_edit') ? 1 : 0,
    }
}


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

/**
 * getMySharedNotebooks response: DB_DATA may be a notebook array or { shared_notebooks: [...] }.
 * Same shape as NotesPool store `gettingMySharedNoteBooks`.
 * @param {{ DB_DATA?: unknown }} responseData - axios `response.data`
 * @returns {unknown[]}
 */
export const normalizeMySharedNotebooksFromApi = (responseData) => {
  const db = responseData?.DB_DATA;
  if (db == null) return [];
  if (Array.isArray(db)) return db;
  if (Array.isArray(db.shared_notebooks)) return db.shared_notebooks;
  return [];
};

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

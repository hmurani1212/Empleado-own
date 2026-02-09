import React, { useEffect, useState } from "react"
import useStore from "../../Store/store"
import noticesApi from "../../Model/Data/Notices/Notices"
import { showToast } from "../../Components/Toaster/Toaster"
import { useNavigate } from "react-router-dom";
import { validateAddNoticeFormData } from '../../Validation/Validation'
import { FaEye, FaTrash } from "react-icons/fa6";
import { BiEditAlt } from "react-icons/bi";
import departmentsApi from "../../Model/Data/Departments/Departments";



const useNotice = () => {

    const noticesBranches = useStore((state) => state.noticesBranches)
    const getBranchesOnly = useStore((state) => state.getBranchesOnly)
    const getDepartmentsByBranch = useStore((state) => state.getDepartmentsByBranch)
    const getAllDepartmentsNotices = useStore((state) => state.getAllDepartmentsNotices)
    const noticesFilterBranches = useStore((state) => state.noticesFilterBranches)
    const noticesDepartment = useStore((state) => state.noticesDepartment)
    const filterDepartmentsNotices = useStore ((state)=> state.filterDepartmentsNotices)
    const allNoticesList = useStore ((state)=> state.allNoticesList)
    const getAllNoticesList = useStore ((state) => state.getAllNoticesList)
    const addNewNoticeState = useStore((state) => state.addNewNoticeState)
    const noticeMount = useStore ((state) => state.noticeMount)
    const getViewNotice = useStore ((state) => state.getViewNotice)
    const deleteNotice = useStore ((state) => state.deleteNotice)
    const viewNoticeData = useStore ((state) => state.viewNoticeData)
    const getFilterNotice = useStore ((state) => state.getFilterNotice)
    const noticesPagination = useStore ((state) => state.noticesPagination)

    
    const navigate = useNavigate();
 
    
    const noticeTitles = [
        {id:1, title:'List Notices', link:'/notices/list_notices'},
        {id:2, title:'Add Notice', link:'/notices/add_notice'}
    ]

    const noticesMenuItems = [
        {id:1, title:'View', icon:<BiEditAlt className="text-green-500" />, link:'/notices/list_notices/notices_view'},
        {id:2, title:'Edit',icon:<FaEye  className="text-indigo-500" />},
        {id:3, title:'Delete',  icon: <FaTrash className="text-red-500" />}
    ]

    const [noticeId, setNoticeId] = useState('')

    const [loading, setLoading] = useState(false)

    const handleChangeDept = (branch_id) => {
        console.log(branch_id)

    }

    const [addNoticeValue, setAddNoticeValue] = useState({
        branch_id: '',
        deptt_id: '',
        emp_id : '',
        send_sms_notice : false, 
        send_email_notice : false,  
        title : '',
        notice: '',
        show:false, 
        update:false, 
        loading:false,

    })

    const handleAddNoticeBranch = (name, event) => {
        const value = event?.value !== undefined ? event.value : event;
        setAddNoticeValue((prevState) => ({
            ...prevState,
            [name]: event,
        }));
        if (name === 'branch_id') {
            setAddNoticeValue((prevState) => ({
                ...prevState,
                emp_id: '',
                deptt_id: '',
            }));
            setEmployeeOptions([]);
            setEmployeeOptionsFull([]);
            getDepartmentsByBranch(value);
        }
        if (name === 'deptt_id') {
            setAddNoticeValue((prevState) => ({
                ...prevState,
                emp_id: '',
            }));
            setEmployeeOptions([]);
            setEmployeeOptionsFull([]);
            if (showEmployeeName) {
                fetchEmployeesByDepartment(value || '0');
            }
        }
    }

    const [showEmployeeName, setShowEmployeeName] = useState(false);

    const handleCheckboxChange = (event) => {
      setShowEmployeeName(event.target.checked);
      // Clear employee selection when checkbox is unchecked
      if (!event.target.checked) {
        setAddNoticeValue((prevState) => ({
          ...prevState,
          emp_id: ''
        }));
        setEmployeeOptions([]);
        setEmployeeOptionsFull([]);
      }
    };

    const [employeeOptions, setEmployeeOptions] = useState([]);
    // Full list for current department; search filters this on the frontend (no API on type)
    const [employeeOptionsFull, setEmployeeOptionsFull] = useState([]);

    // Function to fetch employees from selected department (called once when department is selected)
    const fetchEmployeesByDepartment = async (deptId) => {
        setEmployeeOptionsFull([]);
        setEmployeeOptions([]);
        try {
            const response = await departmentsApi.getDeptEmployees(deptId);
            const data = response.data;

            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                const departmentEmployees = data.DB_DATA.employees || [];
                const employeeData = departmentEmployees.map((employee) => ({
                    label: employee.name || 'Unknown Employee',
                    value: Number(employee.id) || 0,
                }));
                setEmployeeOptionsFull(employeeData);
                setEmployeeOptions(employeeData);
            } else {
                setEmployeeOptions([]);
                setEmployeeOptionsFull([]);
            }
        } catch (error) {
            setEmployeeOptions([]);
            setEmployeeOptionsFull([]);
        }
    };

    // Function to validate if department has employees
    const validateDepartmentHasEmployees = async (deptId) => {
        try {
            // Skip validation for "All Departments" (id === '0')
            if (deptId === '0' || deptId === 0) {
                return true;
            }

            const response = await departmentsApi.getDeptEmployees(deptId);
            const data = response.data;
            
            if (response.status === 200 && data.STATUS === "SUCCESSFUL") {
                const departmentEmployees = data.DB_DATA.employees || [];
                const hasEmployees = departmentEmployees.length > 0;
                
                return hasEmployees;
            } else {
                return false;
            }
            
        } catch (error) {
            return false;
        }
    };
    const handleNoticesSearchEmp = (searchTerm, actionMeta) => {
        if (actionMeta.action === 'input-change') {
            filterEmployeeOptionsBySearch(searchTerm);
        }
    };

    // Filter employee dropdown by search text on the frontend (no API call)
    const filterEmployeeOptionsBySearch = (searchTerm) => {
        const term = (searchTerm || '').toString().trim().toLowerCase();
        if (!term) {
            setEmployeeOptions(employeeOptionsFull);
            return;
        }
        const filtered = employeeOptionsFull.filter((opt) => {
            const label = (opt.label || '').toString().toLowerCase();
            const valueStr = (opt.value != null ? String(opt.value) : '').toLowerCase();
            return label.includes(term) || valueStr.includes(term);
        });
        setEmployeeOptions(filtered);
    };

    const handleNewNotice = (e) => {
        const { name, value, type, checked } = e.target;
    
        if (type === 'checkbox') {
            setAddNoticeValue((prevState) => ({
                ...prevState,
                [name]: checked
            }));
        } else {
            setAddNoticeValue((prevState) => ({
                ...prevState,
                [name]: value
            }));
        }
    };
    

    const handleChangeEmpName = (emp_name, event) => {
        setAddNoticeValue((prevState) => ({
            ...prevState,
            [emp_name]: event
        }));
    }

    const handleDeptChange = (dept_name, event) => {

            setAddNoticeValue ((prevState)=>({
                ...prevState,
                [dept_name] : event,
            }))
    }

    const [openMenu, setOpenMenu] = useState({});
    const toggleMenuNotices = (index, isOpen) => {
        setOpenMenu((prevOpenMenus) => ({
            ...prevOpenMenus,
            [index]: isOpen,
        }));
    };

    const [openViewDialog, setOpenViewDialog] = useState("")
    const handleView = () => {
        setOpenViewDialog(!openViewDialog);
    };


    const handleMenuItemsNotices = (id, ele) => {
        
        switch (id) {
            case 1:
                handleView(ele.id);
                getViewNotice(ele.id)
                setNoticeId(ele.id)
            break;

            case 2:
                getForNoticeEdit(ele);
            break;

            case 3:
                handleDelete();
                setNoticeId(ele.id)
                break;
            default:
                break;
        }
    };
    

    const [openDialog, setOpenDialog] = useState(false)
    const handleDelete = () => {
        setOpenDialog(!openDialog);
    };

    
    const deleteNotices = async() => {
        setLoading(true)

        const data = {id: noticeId} 
    

        try{
            const response = await noticesApi.deleteNotice(data)
            const resData = response.data


            if(response.status === 200  && resData.STATUS === "SUCCESSFUL"){

                setOpenDialog(false)
                deleteNotice(noticeId)
                setLoading(false)
                showToast('Notice Deleted Successfully', 'success');
                // Refresh the notices list to ensure consistency
                getAllNoticesList({ page: 1, limit: 10 }, true, false);

            }

        } catch(err) {

        }
    };


    const addNewNotice = async(e)=> {
        e.preventDefault();
        
        const data = {
            title: addNoticeValue.title,
            notice: addNoticeValue.notice,
        }

        // Add notification methods separately based on selections
        if(addNoticeValue.send_sms_notice) {
            data.send_sms_notice = "sms"
        }
        if(addNoticeValue.send_email_notice) {
            data.send_email_notice = "email"
        }

        // Handle branch selection
        const branchVal = addNoticeValue.branch_id?.value !== undefined ? addNoticeValue.branch_id.value : addNoticeValue.branch_id;
        if(branchVal) {
            if(String(branchVal) === '0') {
                // For "All Branches", send 0
                data.branch_id = 0;
            } else {
                data.branch_id = branchVal;
            }
        }

        // Handle department selection
        const deptVal = addNoticeValue.deptt_id?.value !== undefined ? addNoticeValue.deptt_id.value : addNoticeValue.deptt_id;
        if(deptVal) {
            if(String(deptVal) === '0') {
                // For "All Departments", send 0
                data.deptt_id = 0;
            } else {
                // For specific department
                data.deptt_id = deptVal;
            }
        }

        // Add employee_id if provided
        if(addNoticeValue.emp_id && addNoticeValue.emp_id.value) {
            data.emp_id = Number(addNoticeValue.emp_id.value);
        }

        // Validate required fields
        if (!addNoticeValue.title || addNoticeValue.title.trim() === '') {
            showToast('Please enter the notice title', 'error');
            return;
        }

        if (!addNoticeValue.notice || addNoticeValue.notice.trim() === '') {
            showToast('Please enter the notice details', 'error');
            return;
        }

        // Validate branch selection
        if (!branchVal || branchVal === '') {
            showToast('Please select the branch', 'error');
            return;
        }

        // Validate department selection
        if (!deptVal || deptVal === '') {
            showToast('Please select the department', 'error');
            return;
        }

        // Validate if department has employees (only for specific departments, not "All Departments")
        // Skip this validation if user is targeting a specific employee
        if (deptVal !== '0' && deptVal !== 0 && 
            (!addNoticeValue.emp_id || !addNoticeValue.emp_id.value)) {
            const hasEmployees = await validateDepartmentHasEmployees(deptVal);
            if (!hasEmployees) {
                showToast('Notice are not created for this department', 'error');
                return;
            }
        }

        try{
            setLoading(true)
            await validateAddForm(data, addNoticeValue);
            const response = await noticesApi.addNotice(data)
            const  respData = response.data  
            
            if((response.status === 201 || response.status === 200) && respData.STATUS === 'SUCCESSFUL'){
                showToast('Notice added Successfully!', 'success');
                // Refresh list so List Notices shows the new notice when user navigates there
                await getAllNoticesList({ page: 1, limit: 10 }, true, false);
                // Add new notice to list without calling list API - use API response or build from form data
                const createdNotice = respData.DB_DATA;
                const noticeId = createdNotice?.notice_ids?.[0] ?? createdNotice?.id ?? createdNotice?.notice_id ?? respData.id;
                const branchNameFromForm = addNoticeValue.branch_id === '0' || addNoticeValue.branch_id === 0
                    ? 'All Branches'
                    : (noticesBranches?.find((b) => String(b.id) === String(addNoticeValue.branch_id))?.branch_name || '');
                const noticeForList = {
                    id: noticeId,
                    title: createdNotice?.title || addNoticeValue.title,
                    timestamp: createdNotice?.timestamp || Math.floor(Date.now() / 1000),
                    branch_name: createdNotice?.branch_name || branchNameFromForm,
                    description: createdNotice?.description || addNoticeValue.notice,
                };
                addNewNoticeState(noticeForList);
                navigate('/notices/list_notices')
                setAddNoticeValue({
                    branch_id: '',
                    deptt_id:'',
                    emp_id : '',
                    send_sms_notice : false, 
                    send_email_notice : false, 
                    title : '',
                    notice: ''
                });
            } else {
                // Handle specific error cases with user-friendly messages
                if (respData.ERROR_CODE === 'VTAPP-015' && respData.ERROR_DESCRIPTION?.includes('no active employees')) {
                    showToast('Cannot create notice for department with no active employees. Please select a department that has employees or select individual employees.', 'error');
                } else {
                    showToast(`${respData.ERROR_DESCRIPTION || 'Failed to create notice'}`, 'error');   
                }
            }
        } catch(error){
            if (error.name === 'ValidationError') {
                showToast(error.message, 'error');
            } else if (error.response && error.response.data) {
                // Handle API error responses
                const errorData = error.response.data;
                if (errorData.ERROR_CODE === 'VTAPP-015' && errorData.ERROR_DESCRIPTION?.includes('no active employees')) {
                    showToast('Cannot create notice for this department', 'error');
                } else {
                    showToast(`${errorData.ERROR_DESCRIPTION || 'Failed to create notice'}`, 'error');
                }
            } else {
                showToast('An error occurred while creating the notice', 'error');
            } 
        }finally {
            setLoading(false)
        }
    }


    const validateAddForm = async (formData, originalData) => {
        const requiredFields = ['title', 'notice'];
        
        // Validate required fields
        for (const field of requiredFields) {
            try {
                await validateAddNoticeFormData.validateAt(field, formData);
            } catch (error) {
                throw error;
            }
        }
        
        // Accept: branch_id (specific branch or 0 for all), emp_id (specific employee)
        const hasValidTarget = formData.branch_id !== undefined || formData.emp_id;
        if (!hasValidTarget) {
            throw new Error('Please specify either a branch or an employee');
        }
        
        // If department is specified, branch must also be specified
        if (formData.deptt_id !== undefined && formData.branch_id === undefined) {
            throw new Error('Branch is required when selecting a department');
        }
        
    };

    const [showNoticeDrawer, setShowNoticeDrawer] = useState(false)


    const getForNoticeEdit = async (notice) => {
        // Ensure branches and departments are loaded for the dropdowns
        await getAllDepartmentsNotices();

        const data = { id: notice.id };
        const response = await noticesApi.singleNotice(data);
        const resData = response.data;

        if (response.status === 200 && resData.STATUS === "SUCCESSFUL") {
            const dbData = resData.DB_DATA;
            const storeState = useStore.getState();
            const branches = storeState.noticesBranches || [];
            const allDepartments = storeState.noticesDepartment || [];

            // Resolve branch: find matching branch in our list (by id or name) - use exact id from list for Option match
            const rawBranchId = dbData.branch_id ?? dbData.branch_name ?? '';
            const isAllBranches = rawBranchId === 0 || rawBranchId === '0' || rawBranchId === 'All Branches' || rawBranchId === '';
            const matchedBranch = isAllBranches
                ? branches.find((b) => b.id === '0' || b.id === 0)
                : branches.find(
                    (b) =>
                        String(b.id) === String(rawBranchId) ||
                        String(b.branch_name) === String(dbData.branch_name)
                );
            // Use exact id from our list so Select Option value matches (Option uses value={ele.id})
            const branchId = matchedBranch ? matchedBranch.id : (isAllBranches ? '0' : rawBranchId);

            // Populate department dropdown based on selected branch first
            noticesFilterBranches(branchId);

            // Get updated filterDepartmentsNotices after branch filter (use getState for fresh data)
            const updatedState = useStore.getState();
            const departmentsForBranch = updatedState.filterDepartmentsNotices || [];

            // Resolve department: find matching department by id or name - use exact id from list for Option match
            const rawDeptId = dbData.deptt_id ?? dbData.deptt_name ?? dbData.department ?? '';
            const isAllDepts = rawDeptId === 0 || rawDeptId === '0' || rawDeptId === 'All Departments' || rawDeptId === '';
            const matchedDept = isAllDepts
                ? departmentsForBranch.find((d) => d.id === '0' || d.id === 0)
                : departmentsForBranch.find(
                    (d) => {
                        const deptName = (d.name || d.department_name || '').toString().trim();
                        const apiDeptName = (dbData.department || rawDeptId || '').toString().trim();
                        return (
                            String(d.id) === String(rawDeptId) ||
                            (apiDeptName && deptName && deptName === apiDeptName)
                        );
                    }
                );
            const depttId = matchedDept ? matchedDept.id : (isAllDepts ? '0' : rawDeptId);

            setAddNoticeValue((prevState) => ({
                ...prevState,
                show: true,
                id: dbData.id,
                title: dbData.title,
                notice: dbData.description,
                branch_id: branchId,
                deptt_id: depttId,
                emp_id: dbData.emp_id || '',
                send_sms_notice: dbData.send_sms_notice || false,
                send_email_notice: dbData.send_email_notice || false,
            }));
        }
    }

    const  closeNoticeDrawer = () => {
        setShowNoticeDrawer(false)
    }



    const handleEditNoticeToggle = ()=>{
        setAddNoticeValue((prevState)=>({
            ...prevState,
            show:false
        }))
    }


     const handleEditNotice = async (e) => {
        e.preventDefault();
        
        const editNoticeData = {}

        // Only add fields that have values
        if(addNoticeValue.title) {
            editNoticeData.title = addNoticeValue.title;
        }
        
        if(addNoticeValue.notice) {
            editNoticeData.notice = addNoticeValue.notice;
        }

        // Add branch_id if provided
        if(addNoticeValue.branch_id !== undefined) {
            editNoticeData.branch_id = addNoticeValue.branch_id === '0' ? 0 : addNoticeValue.branch_id;
        }

        // Add department_id if provided
        if(addNoticeValue.deptt_id !== undefined) {
            editNoticeData.deptt_id = addNoticeValue.deptt_id === '0' ? 0 : addNoticeValue.deptt_id;
        }

        // Add employee_id if provided
        if(addNoticeValue.emp_id && addNoticeValue.emp_id.value) {
            editNoticeData.emp_id = Number(addNoticeValue.emp_id.value);
        }

        try {
            setLoading(true)
            const response = await noticesApi.editNotice({...editNoticeData, id: addNoticeValue.id});

            if (response.status === 200 && response.data.STATUS === 'SUCCESSFUL') {
                handleEditNoticeToggle()
                showToast('Notice Updated Successfully', 'success');
                // Refresh the notices list to show updated data
                getAllNoticesList({ page: 1, limit: 10 }, true, false);
            } else {
                showToast(`${response.data.ERROR_DESCRIPTION}`, 'error');
            }    
        }catch(err) {
            console.log(err)
        }finally {
            setLoading(false)
        }
    }
    

    const [filterNoticeValue, setNoticeFilterValue] = useState({
        branch_id: null, 
        branchesList: [],
        dept_id: null,
        departmentList: [],
        year: null
    })
    
    // Update branches list when noticesBranches changes
    useEffect(() => {
        if(noticesBranches && noticesBranches.length > 0) {
            setNoticeFilterValue(prev => ({
                ...prev,
                branchesList: noticesBranches
            }))
        }
    }, [noticesBranches])



    const handleSelectFilterNotice = async(selected, field)=>{
        const {branch_id,dept_id,year} = filterNoticeValue
        if(field === 'branch_id'){
            setNoticeFilterValue((prevState)=>({
                ...prevState,
                [field]: selected,
                dept_id: null,
                departmentList: []
            }))
            
            // If "All Branches" is selected, ensure departments are loaded and use cached data
            if(selected && selected.value === '0') {
                // Ensure departments are loaded (in case they weren't loaded yet)
                if (!noticesDepartment || noticesDepartment.length === 0) {
                    await getAllDepartmentsNotices();
                }

                // Use the loaded departments from the store
                    setNoticeFilterValue((prevState)=>({
                        ...prevState,
                    departmentList: noticesDepartment
                    }))
                getAllNoticesList({ page: 1, limit: 10 }, true, false)
            } else if(selected && selected.value) {
                const branchDepartments = noticesDepartment.filter(dept =>
                    dept.branch_id === selected.value || dept.id === '0'
                );

                       setNoticeFilterValue((prevState)=>({
                            ...prevState,
                    departmentList: branchDepartments
                }))
                getFilterNotice(selected?.value, "", year?.value || "", 1, 10, false)
            }
        }
        
        if(field === 'dept_id'){
            setNoticeFilterValue((prevState)=>({
                ...prevState,
                [field]: selected,
            }))
            getFilterNotice(branch_id?.value || "", selected?.value || "", year?.value || "", 1, 10, false)
        }
        
        if(field === 'year'){
            setNoticeFilterValue((prevState)=>({
                ...prevState,
                [field]: selected,
            }))
            getFilterNotice(branch_id?.value || "", dept_id?.value || "", selected?.value || "", 1, 10, false)
        }
    }
    
    // Function to reset all filters
    const resetFilters = () => {
        setNoticeFilterValue({
            branch_id: null,
            branchesList: noticesBranches,
            dept_id: null,
            departmentList: [],
            year: null
        })
        getAllNoticesList({ page: 1, limit: 10 }, true, false)
    }
    
 return {
    noticeTitles, noticesBranches, noticesDepartment, getBranchesOnly, getDepartmentsByBranch, getAllDepartmentsNotices, noticesFilterBranches, handleChangeDept, addNoticeValue, handleAddNoticeBranch,
    filterDepartmentsNotices, employeeOptions, handleDeptChange, setAddNoticeValue, handleNewNotice, handleCheckboxChange, showEmployeeName, handleChangeEmpName, addNewNotice, allNoticesList,
    getAllNoticesList, noticeMount, noticesMenuItems, toggleMenuNotices, openMenu, openDialog, handleDelete, handleMenuItemsNotices, deleteNotices, viewNoticeData, getViewNotice, openViewDialog, setOpenViewDialog,
    handleView, handleNoticesSearchEmp, loading, showNoticeDrawer, closeNoticeDrawer, loading,
    handleEditNotice,
    handleEditNoticeToggle,
    filterNoticeValue,
    handleSelectFilterNotice,
    resetFilters,
    noticesPagination,
    getFilterNotice
}

}

export default useNotice
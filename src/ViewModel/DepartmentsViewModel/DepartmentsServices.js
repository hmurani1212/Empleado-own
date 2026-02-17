// import React, { useState } from "react"
// import useStore from "../../Store/store";
// import { useNavigate } from "react-router";
// import { showToast } from "../../Components/Toaster/Toaster";
// import departmentsApi from "../../Model/Data/Departments/Departments";
// import ViewDesignations from "../../View/Departments/ViewDesignations";
// import ChangeHod from "../../View/Departments/ChangeHod";
// import EmployeeDetails from "../../View/Departments/EmployeeDetails";
// import { FaPencilAlt, FaTrash, FaUserCog } from "react-icons/fa";
// import EditDepartmentModal from "../../View/Departments/EditDepartmentModal";
// import AddNewDesignation from "../../View/Departments/AddNewDesignation";

// const useDepartments = () => {
//     const getAllDepartments = useStore((state) => state.getAllDepartments)
//     const departments_b = useStore((state) => state.departments_b)
//     const allBranches = useStore((state) => state.allBranches)
//     const setNewDepartment = useStore((state) => state.setNewDepartment)
//     const getManageDept = useStore((state) => state.getManageDept)
//     const allDeptDetails = useStore((state) => state.allDeptDetails)
//     const openDrawer = useStore((state) => state.openDrawer)
//     const closeDrawer = useStore((state) => state.closeDrawer)
//     const settingDrawerTitle = useStore((state) => state.settingDrawerTitle)
//     const settingComponent = useStore((state) => state.settingComponent)
//     const settingDrawerSize = useStore((state) => state.settingDrawerSize)
//     const handleDeletionDept = useStore((state) => state.handleDeletionDept)
//     const deletionDesignation = useStore((state) => state.deletionDesignation)
//     const getEmployeeDetails = useStore((state) => state.getEmployeeDetails)
//     const empDetailDept = useStore((state) => state.empDetailDept)
//     const empDetailDeptLoading = useStore((state) => state.empDetailDeptLoading)
//     const settingBranchId = useStore((state) => state.settingBranchId)
//     const branchIdset = useStore((state) => state.branchIdset)
//     const handleDesignationEdit = useStore((state) => state.handleDesignationEdit)
//     const settingDesignations = useStore((state) => state.settingDesignations)
//     const designations = useStore((state) => state.designations)
//     const designationPagination = useStore((state) => state.designationPagination)
//     const settingDesignationPagination = useStore((state) => state.settingDesignationPagination)
//     const settingDeptId = useStore((state) => state.settingDeptId)
//     const deptIdset = useStore((state) => state.deptIdset)
//     const allSuggestionsEmp = useStore((state) => state.allSuggestionsEmp)
//     const getEmployeeSuggDept = useStore((state) => state.getEmployeeSuggDept)
//     const getEmployeesByDeptId = useStore((state) => state.getEmployeesByDeptId);
//     const setMyBranchId = useStore((state) => state.getEmployeesByDeptId);
//     const getAllEmployees = useStore((state) => state.getAllEmployees)
//     const getEmployeesOptimized = useStore((state) => state.getEmployeesOptimized)
//     const handleHodEdit = useStore((state) => state.handleHodEdit)
//     const handleDeptUpdate = useStore((state) => state.handleDeptUpdate)
//     const handleDesginationAddition = useStore((state) => state.handleDesginationAddition)
//     const mountBranch = useStore((state) => state.mountBranch);
//     const get_all_department_fn = useStore((state) => state.get_all_department_fn);
//     const get_all_department = useStore((state) => state.get_all_department);

//     const [showDrawer, setShowDrawer] = useState(false);
//     const [showAddDesignationForm, setShowAddDesignationForm] = useState(false);
//     const [newDesigValue, setNewDesigValue] = useState({
//         designations: [{ id: 1, value: '' }]
//     });
//     const [editDesignation, setEditDesignation] = useState(false);
//     const [editDesValue, setEditDesValue] = useState({});
//     const [openDialogDesig, setOpenDialogDesig] = useState(false);
//     const [isLoadingMoreDesignations, setIsLoadingMoreDesignations] = useState(false);
//     const navigate = useNavigate()

//     const deptActionTitle = [
//         { id: 1, title: 'Edit', link: "/EditDepartment", icon: <FaPencilAlt className="text-green-500" /> },
//         { id: 2, title: 'Change HOD', icon: <FaUserCog className="text-[#3DA5F4]" /> },
//         { id: 3, title: 'Delete', icon: <FaTrash className="text-red-500" /> },
//     ]

//     const [openDialogDept, setOpenDialogDept] = useState(false)
//     const [deptId, setDeptId] = useState('')

//     const handleDialogDept = (id) => {
//         setOpenDialogDept(!openDialogDept)
//         setDeptId(id)
//     }

//     const handleMenuDept = (id, ele) => {
//         console.log("idid", id);
//         switch (id) {
//             case 1:
//                 handleEditDepartment(ele)
//                 break;
//             case 2:
//                 handleHOD(ele)
//                 break;
//             case 3:
//                 handleDialogDept(ele.id)
//                 break;
//             default:
//                 console.log('Default case')
//         }
//     }

//     const handleDeleteDept = async (e) => {
//         e.preventDefault()
//         const deleteData = {
//             id: deptId
//         }

//         try {
//             const response = await departmentsApi.deleteDepartments(deleteData)
//             const data = response.data

//             console.log("Delete data", data)

//             if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
//                 showToast('Data Deleted Successfully', 'success')
//                 handleDeletionDept(deptId)
//                 setOpenDialogDept(false)
//             } else {
//                 showToast(`${data.ERROR_DESCRIPTION}`, 'error')
//                 setOpenDialogDept(false)
//             }

//         } catch (error) {
//             showToast(error.response.data.ERROR_DESCRIPTION);
//         }
//     }

//     const handleEditDepartment = async (ele) => {
//         settingDeptId(ele.id)
//         openDrawer()
//         settingDrawerSize('45vw')
//         settingDrawerTitle('Edit Department');
//         const data = await getManageDept(ele.branch_id);
//         settingComponent(React.createElement(EditDepartmentModal, {
//             departmentData: ele,
//             data: data,
//             onSuccess: (updatedData) => {
//                 handleDeptUpdate(updatedData, false)
//                 closeDrawer()
//             }
//         }))
//     }

//     const handleHOD = (data) => {
//         openDrawer()
//         settingDeptId(data.id)
//         getEmployeesByDeptId(data.id);
//         settingDrawerSize('45vw')
//         settingDrawerTitle('Change HOD')
//         settingComponent(React.createElement(ChangeHod))
//     };

//     const [branchId, setBranchId] = useState('')

//     const handleBranchDept = (value) => {
//         setBranchId(value);
//         settingBranchId(value);
//         if (value) {
//             getManageDept(value);
//         }
//     }

//     const handleManageDept = () => {
//         settingBranchId(branchId)
//         if (!branchId) {
//             showToast('Please select branch', 'error')
//         } else {
//             navigate(`/departments/manageDept/${branchId}`)
//             getManageDept(branchId)
//         }
//         setBranchId('')
//     }

//     const handleNavigateNewDept = () => {
//         if (!branchIdset) {
//             showToast('Please select branch', 'error')
//         }
//         else {
//             navigate(`/departments/createNewDept/${branchIdset}`)
//             getManageDept(branchIdset)
//         }
//         setBranchId('')
//     }

//     const handleNavigateCreateNewDept = () => {
//         console.log(branchIdset)
//         if (!branchIdset) {
//             showToast('Please select branch', 'error')
//         }
//         else {
//             navigate(`/departments/createNewDept/${branchIdset}`)
//         }
//     }

//     const addNewDepartment = () => {
//         setShowDrawer(true)
//     }

//     const closeDeptDrawer = () => {
//         setShowDrawer(false)
//     }

//     const [openMenuDept, setOpenMenuDept] = useState({});
//     const toggleMenuDept = (index, isOpen) => {
//         setOpenMenuDept((prevOpenMenu) => ({
//             ...prevOpenMenu,
//             [index]: isOpen
//         }))
//     }

//     const handleBackDept = () => {
//         const id = ''
//         settingBranchId(id)
//         navigate('/departments')
//     }

//     const gettingDesignation = async (id, isBranch = false, page = 1, append = false) => {
//         const data = isBranch ? { branch_id: id } : { d_id: id, page: page, limit: 10 };
//         // console.log('11111111111', data)
//         try {
//             const response = await departmentsApi.getDesignations(data)
//             const resData = response.data
//             console.log('Designations API response:', resData?.DB_DATA?.designations);
//             if (resData.STATUS === "SUCCESSFUL") {
//                 // Handle different response structures
//                 let designationsData = [];

//                 if (resData?.DB_DATA?.designations) {
//                     // Direct designations array
//                     designationsData = resData.DB_DATA.designations;
//                 } else if (resData?.DB_DATA?.departments) {
//                     // Designations nested in departments
//                     designationsData = resData.DB_DATA.departments.flatMap(dept => dept.designations || []);
//                 }

//                 // Set pagination data - use the page we requested, not necessarily what API returns
//                 if (resData?.DB_DATA?.pagination) {
//                     const paginationData = {
//                         ...resData.DB_DATA.pagination,
//                         // Ensure we use the page number we actually requested
//                         page: page || resData.DB_DATA.pagination.page || 1,
//                         hasMore: (page || resData.DB_DATA.pagination.page || 1) < (resData.DB_DATA.pagination.pages || 1)
//                     };
//                     console.log('Setting pagination data:', paginationData, 'Requested page:', page);
//                     settingDesignationPagination(paginationData);
//                 } else if (append) {
//                     // If no pagination in response but we're appending, update page manually
//                     const currentPagination = useStore.getState().designationPagination;
//                     if (currentPagination) {
//                         const updatedPagination = {
//                             ...currentPagination,
//                             page: page,
//                             hasMore: page < (currentPagination.pages || 1)
//                         };
//                         settingDesignationPagination(updatedPagination);
//                     }
//                 }

//                 if (append) {
//                     // Append to existing designations for load more
//                     const currentDesignations = useStore.getState().designations;
//                     settingDesignations([...currentDesignations, ...designationsData]);
//                 } else {
//                     // Replace designations for initial load
//                     settingDesignations(designationsData);
//                 }

//                 console.log('Designations set:', designationsData);
//                 return designationsData;
//             } else {
//                 if (!append) {
//                     settingDesignations([])
//                 }
//                 return [];
//             }
//         } catch (err) {
//             console.error("Error fetching designations:", err)
//             if (!append) {
//                 settingDesignations([])
//             }
//             return [];
//         }
//     }

//     const handleDesignation = async (designations, departmentId) => {
//         openDrawer()
//         settingDeptId(departmentId)
//         settingDrawerSize('45vw')
//         settingDrawerTitle('View Designations')
//         // Call the API to fetch designations for this department
//         await gettingDesignation(departmentId, false); // false indicates it's a dept_id
//         settingComponent(React.createElement(ViewDesignations, {
//             deptId: departmentId
//         }))
//     }

//     const newDesignation = () => {
//         setShowAddDesignationForm(true);
//     }

//     const closeAddDesignationForm = () => {
//         setShowAddDesignationForm(false);
//     }

//     const handleLoadMoreDesignations = async () => {
//         // Prevent multiple simultaneous calls
//         if (isLoadingMoreDesignations) {
//             return;
//         }

//         const currentPagination = useStore.getState().designationPagination;
//         const currentDeptId = useStore.getState().deptIdset;

//         if (currentPagination && currentPagination.hasMore && currentDeptId) {
//             // Get the current page from pagination and increment it
//             const currentPage = currentPagination.page || 1;
//             const nextPage = currentPage + 1;

//             // Ensure we don't exceed total pages
//             if (nextPage <= (currentPagination.pages || 1)) {
//                 setIsLoadingMoreDesignations(true);
//                 try {
//                     console.log('Loading more designations - Page:', nextPage, 'Current page:', currentPage);
//                     await gettingDesignation(currentDeptId, false, nextPage, true);
//                 } catch (error) {
//                     console.error('Error loading more designations:', error);
//                 } finally {
//                     setIsLoadingMoreDesignations(false);
//                 }
//             }
//         }
//     }

//     const editInput = (designation) => {
//         setEditDesignation(true);
//         setEditDesValue({
//             d_id: designation.id,
//             d_title: designation.title || designation.designation
//         });
//     }

//     const handleChangeEditDes = (event) => {
//         const { name, value } = event.target;
//         setEditDesValue(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     }

//     const handleEditDesignation = async (event) => {
//         event.preventDefault();
//         try {
//             const response = await departmentsApi.editDeptDesignation(editDesValue);
//             const data = response.data;

//             if (data.STATUS === "SUCCESSFUL") {
//                 showToast('Designation updated successfully', 'success');
//                 setEditDesignation(false);
//                 setEditDesValue({});

//                 // Refresh designations list
//                 const currentDeptId = useStore.getState().deptIdset;
//                 await gettingDesignation(currentDeptId, false, 1, false);
//             } else {
//                 showToast(data.ERROR_DESCRIPTION || 'Failed to update designation', 'error');
//             }
//         } catch (err) {
//             console.error('Error updating designation:', err);
//             showToast('Failed to update designation', 'error');
//         }
//     }

//     const handleDialogDesig = (designationId, deptId) => {
//         setOpenDialogDesig(!openDialogDesig);
//         // Store the designation ID and department ID for deletion
//         if (!openDialogDesig) {
//             setEditDesValue({ d_id: designationId, dept_id: deptId });
//         }
//     }

//     const handleDeleteDesignation = async () => {
//         try {
//             const response = await departmentsApi.deleteDesignations({ id: editDesValue.d_id });
//             const data = response.data;

//             if (data.STATUS === "SUCCESSFUL") {
//                 showToast('Designation deleted successfully', 'success');
//                 setOpenDialogDesig(false);
//                 setEditDesValue({});

//                 // Refresh designations list
//                 const currentDeptId = useStore.getState().deptIdset;
//                 await gettingDesignation(currentDeptId, false, 1, false);
//             } else {
//                 showToast(data.ERROR_DESCRIPTION || 'Failed to delete designation', 'error');
//             }
//         } catch (err) {
//             console.error('Error deleting designation:', err);
//             showToast('Failed to delete designation', 'error');
//         }
//     }

//     const handleNewDesignations = () => {
//         const newId = Math.max(...newDesigValue.designations.map(d => d.id)) + 1;
//         setNewDesigValue(prev => ({
//             ...prev,
//             designations: [...prev.designations, { id: newId, value: '' }]
//         }));
//     }

//     const handleInputChangeDes = (index, event) => {
//         const { name, value } = event.target;
//         setNewDesigValue(prev => ({
//             ...prev,
//             designations: prev.designations.map((designation, i) =>
//                 i === index ? { ...designation, [name]: value } : designation
//             )
//         }));
//     }

//     const handleRemoveNewDesignation = (index) => {
//         if (newDesigValue.designations.length > 1) {
//             setNewDesigValue(prev => ({
//                 ...prev,
//                 designations: prev.designations.filter((_, i) => i !== index)
//             }));
//         }
//     }

//     const handleAddDesig = async () => {
//         try {
//             // Get the current department ID
//             const currentDeptId = useStore.getState().deptIdset;

//             // Filter out empty designations
//             const validDesignations = newDesigValue.designations.filter(des => des.value.trim() !== '');

//             if (validDesignations.length === 0) {
//                 showToast('Please enter at least one designation', 'error');
//                 return;
//             }

//             // Prepare data for API - single payload with array of designation names
//             const designationsData = {
//                 deptt_id: currentDeptId,
//                 des: validDesignations.map(des => des.value.trim())
//             };

//             // Call API to add designations in single call
//             const response = await departmentsApi.addNewDesignation(designationsData);
//             const data = response.data;

//             if (data.STATUS === "SUCCESSFUL") {
//                 showToast('Designations added successfully', 'success');
//                 // Reset form
//                 setNewDesigValue({
//                     designations: [{ id: 1, value: '' }]
//                 });
//                 // Close form and refresh designations
//                 setShowAddDesignationForm(false);
//                 await gettingDesignation(currentDeptId, false);
//             } else {
//                 showToast(data.ERROR_DESCRIPTION || 'Failed to add designations', 'error');
//             }
//         } catch (err) {
//             console.error('Error adding designations:', err);
//             showToast('Failed to add designations', 'error');
//         }
//     }

//     return {
//         addNewDepartment,
//         allDeptDetails,
//         handleDeleteDept,
//         showDrawer,
//         setShowDrawer,
//         closeDeptDrawer,
//         departments_b,
//         getAllDepartments,
//         allBranches,
//         setNewDepartment,
//         handleBranchDept,
//         getManageDept,
//         branchId,
//         handleManageDept,
//         openMenuDept,
//         toggleMenuDept,
//         deptActionTitle,
//         handleMenuDept,
//         openDialogDept,
//         handleDialogDept,
//         handleNavigateNewDept,
//         handleNavigateCreateNewDept,
//         mountBranch,
//         setBranchId,
//         handleBackDept,
//         handleDesignation,
//         gettingDesignation,
//         designations,
//         designationPagination,
//         newDesignation,
//         closeAddDesignationForm,
//         showAddDesignationForm,
//         handleNewDesignations,
//         handleInputChangeDes,
//         handleRemoveNewDesignation,
//         newDesigValue,
//         handleAddDesig,
//         handleLoadMoreDesignations,
//         isLoadingMoreDesignations,
//         editInput,
//         handleEditDesignation,
//         editDesValue,
//         editDesignation,
//         handleChangeEditDes,
//         handleDeleteDesignation,
//         openDialogDesig,
//         handleDialogDesig,
//         branchId,
//         empDetailDept,
//         empDetailDeptLoading,
//         getEmployeesByDeptId,
//         get_all_department,
//         get_all_department_fn,
//         // Employee details function
//         handleEmpDetails: useStore((state) => state.handleEmpDetails),
//         // HOD-related functions
//         allSuggestionsEmp: useStore((state) => state.allSuggestionsEmp),
//         empIdHod: useStore((state) => state.empIdHod),
//         onChangeEmpHod: useStore((state) => state.onChangeEmpHod),
//         handleUpdatingHod: useStore((state) => state.handleUpdatingHod)
//     }
// }

// export default useDepartments


import React, { useState } from "react"
import useStore from "../../Store/store";
import { useNavigate } from "react-router";
import { showToast } from "../../Components/Toaster/Toaster";
import departmentsApi from "../../Model/Data/Departments/Departments";
import ViewDesignations from "../../View/Departments/ViewDesignations";
import ChangeHod from "../../View/Departments/ChangeHod";
import EmployeeDetails from "../../View/Departments/EmployeeDetails";
import { FaPencilAlt, FaTrash, FaUserCog } from "react-icons/fa";
import EditDepartmentModal from "../../View/Departments/EditDepartmentModal";
import AddNewDesignation from "../../View/Departments/AddNewDesignation";

const useDepartments = () => {
    const getAllDepartments = useStore((state) => state.getAllDepartments)
    const departments_b = useStore((state) => state.departments_b)
    const allBranches = useStore((state) => state.allBranches)
    const getBranchEmployeeList = useStore((state) => state.getBranchEmployeeList)
    const setNewDepartment = useStore((state) => state.setNewDepartment)
    const getManageDept = useStore((state) => state.getManageDept)
    const allDeptDetails = useStore((state) => state.allDeptDetails)
    const deptPagination = useStore((state) => state.deptPagination)
    const openDrawer = useStore((state) => state.openDrawer)
    const closeDrawer = useStore((state) => state.closeDrawer)
    const settingDrawerTitle = useStore((state) => state.settingDrawerTitle)
    const settingComponent = useStore((state) => state.settingComponent)
    const settingDrawerSize = useStore((state) => state.settingDrawerSize)
    const handleDeletionDept = useStore((state) => state.handleDeletionDept)
    const deletionDesignation = useStore((state) => state.deletionDesignation)
    const getEmployeeDetails = useStore((state) => state.getEmployeeDetails)
    const empDetailDept = useStore((state) => state.empDetailDept)
    const empDetailDeptLoading = useStore((state) => state.empDetailDeptLoading)
    const settingBranchId = useStore((state) => state.settingBranchId)
    const branchIdset = useStore((state) => state.branchIdset)
    const handleDesignationEdit = useStore((state) => state.handleDesignationEdit)
    const settingDesignations = useStore((state) => state.settingDesignations)
    const designations = useStore((state) => state.designations)
    const designationPagination = useStore((state) => state.designationPagination)
    const settingDesignationPagination = useStore((state) => state.settingDesignationPagination)
    const settingDeptId = useStore((state) => state.settingDeptId)
    const deptIdset = useStore((state) => state.deptIdset)
    const allSuggestionsEmp = useStore((state) => state.allSuggestionsEmp)
    const getEmployeeSuggDept = useStore((state) => state.getEmployeeSuggDept)
    const getEmployeesByDeptId = useStore((state) => state.getEmployeesByDeptId);
    const setMyBranchId = useStore((state) => state.getEmployeesByDeptId);
    const getAllEmployees = useStore((state) => state.getAllEmployees)
    const getEmployeesOptimized = useStore((state) => state.getEmployeesOptimized)
    const handleHodEdit = useStore((state) => state.handleHodEdit)
    const handleDeptUpdate = useStore((state) => state.handleDeptUpdate)
    const handleDesginationAddition = useStore((state) => state.handleDesginationAddition)
    const mountBranch = useStore((state) => state.mountBranch);
    const get_all_department_fn = useStore((state) => state.get_all_department_fn);
    const get_all_department = useStore((state) => state.get_all_department);

    const [showDrawer, setShowDrawer] = useState(false);
    const [showAddDesignationForm, setShowAddDesignationForm] = useState(false);
    const [newDesigValue, setNewDesigValue] = useState({
        designations: [{ id: 1, value: '' }]
    });
    const [editDesignation, setEditDesignation] = useState(false);
    const [editDesValue, setEditDesValue] = useState({});
    const [openDialogDesig, setOpenDialogDesig] = useState(false);
    const [isLoadingMoreDesignations, setIsLoadingMoreDesignations] = useState(false);
    const navigate = useNavigate()

    const deptActionTitle = [
        { id: 1, title: 'Edit', link: "/EditDepartment", icon: <FaPencilAlt className="text-green-500" /> },
        { id: 2, title: 'Change HOD', icon: <FaUserCog className="text-[#3DA5F4]" /> },
        { id: 3, title: 'Delete', icon: <FaTrash className="text-red-500" /> },
    ]

    const [openDialogDept, setOpenDialogDept] = useState(false)
    const [deptId, setDeptId] = useState('')

    const handleDialogDept = (id) => {
        setOpenDialogDept(!openDialogDept)
        setDeptId(id)
    }

    const handleMenuDept = (id, ele) => {
        console.log("idid", id);
        switch (id) {
            case 1:
                handleEditDepartment(ele)
                break;
            case 2:
                handleHOD(ele)
                break;
            case 3:
                handleDialogDept(ele.id)
                break;
            default:
                console.log('Default case')
        }
    }

    const handleDeleteDept = async (e) => {
        e.preventDefault()
        const deleteData = {
            id: deptId
        }

        try {
            const response = await departmentsApi.deleteDepartments(deleteData)
            const data = response.data

            console.log("Delete data", data)

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                showToast('Data Deleted Successfully', 'success')
                handleDeletionDept(deptId)
                setOpenDialogDept(false)
            } else {
                showToast(`${data.ERROR_DESCRIPTION}`, 'error')
                setOpenDialogDept(false)
            }

        } catch (error) {
            showToast(error.response.data.ERROR_DESCRIPTION);
        }
    }

    const handleEditDepartment = async (ele) => {
        settingDeptId(ele.id)
        openDrawer()
        settingDrawerSize('45vw')
        settingDrawerTitle('Edit Department');
        const data = await getManageDept(ele.branch_id, 1, 10);
        settingComponent(React.createElement(EditDepartmentModal, {
            departmentData: ele,
            data: data,
            onSuccess: (updatedData) => {
                handleDeptUpdate(updatedData, false)
                closeDrawer()
            }
        }))
    }

    const handleHOD = (data) => {
        openDrawer()
        settingDeptId(data.id)
        getEmployeesByDeptId(data.id);
        settingDrawerSize('45vw')
        settingDrawerTitle('Change HOD')
        settingComponent(React.createElement(ChangeHod))
    };

    const [branchId, setBranchId] = useState('')

    const handleBranchDept = (value) => {
        setBranchId(value);
        settingBranchId(value);
        if (value) {
            getManageDept(value, 1, 10);
        }
    }

    const handleManageDept = () => {
        settingBranchId(branchId)
        if (!branchId) {
            showToast('Please select branch', 'error')
        } else {
            navigate(`/departments/manageDept/${branchId}`)
            getManageDept(branchId, 1, 10)
        }
        setBranchId('')
    }

    const handleNavigateNewDept = () => {
        if (!branchIdset) {
            showToast('Please select branch', 'error')
        }
        else {
            navigate(`/departments/createNewDept/${branchIdset}`)
            getManageDept(branchIdset, 1, 10)
        }
        setBranchId('')
    }

    const handleNavigateCreateNewDept = () => {
        console.log(branchIdset)
        if (!branchIdset) {
            showToast('Please select branch', 'error')
        }
        else {
            navigate(`/departments/createNewDept/${branchIdset}`)
        }
    }

    const addNewDepartment = () => {
        setShowDrawer(true)
    }

    const closeDeptDrawer = () => {
        setShowDrawer(false)
    }

    const [openMenuDept, setOpenMenuDept] = useState({});
    const toggleMenuDept = (index, isOpen) => {
        setOpenMenuDept((prevOpenMenu) => ({
            ...prevOpenMenu,
            [index]: isOpen
        }))
    }

    const handleBackDept = () => {
        const id = ''
        settingBranchId(id)
        navigate('/departments')
    }

    const gettingDesignation = async (id, isBranch = false, page = 1, append = false) => {
        const data = isBranch ? { branch_id: id } : { d_id: id, page: page, limit: 10 };
        // console.log('11111111111', data)
        try {
            const response = await departmentsApi.getDesignations(data)
            const resData = response.data
            console.log('Designations API response:', resData?.DB_DATA?.designations);
            if (resData.STATUS === "SUCCESSFUL") {
                // Handle different response structures
                let designationsData = [];

                if (resData?.DB_DATA?.designations) {
                    // Direct designations array
                    designationsData = resData.DB_DATA.designations;
                } else if (resData?.DB_DATA?.departments) {
                    // Designations nested in departments
                    designationsData = resData.DB_DATA.departments.flatMap(dept => dept.designations || []);
                }

                // Set pagination data - use the page we requested, not necessarily what API returns
                if (resData?.DB_DATA?.pagination) {
                    const paginationData = {
                        ...resData.DB_DATA.pagination,
                        // Ensure we use the page number we actually requested
                        page: page || resData.DB_DATA.pagination.page || 1,
                        hasMore: (page || resData.DB_DATA.pagination.page || 1) < (resData.DB_DATA.pagination.pages || 1)
                    };
                    console.log('Setting pagination data:', paginationData, 'Requested page:', page);
                    settingDesignationPagination(paginationData);
                } else if (append) {
                    // If no pagination in response but we're appending, update page manually
                    const currentPagination = useStore.getState().designationPagination;
                    if (currentPagination) {
                        const updatedPagination = {
                            ...currentPagination,
                            page: page,
                            hasMore: page < (currentPagination.pages || 1)
                        };
                        settingDesignationPagination(updatedPagination);
                    }
                }

                if (append) {
                    // Append to existing designations for load more
                    const currentDesignations = useStore.getState().designations;
                    settingDesignations([...currentDesignations, ...designationsData]);
                } else {
                    // Replace designations for initial load
                    settingDesignations(designationsData);
                }

                console.log('Designations set:', designationsData);
                return designationsData;
            } else {
                if (!append) {
                    settingDesignations([])
                }
                return [];
            }
        } catch (err) {
            console.error("Error fetching designations:", err)
            if (!append) {
                settingDesignations([])
            }
            return [];
        }
    }

    const handleDesignation = async (designations, departmentId) => {
        openDrawer()
        settingDeptId(departmentId)
        settingDrawerSize('45vw')
        settingDrawerTitle('View Designations')
        // Call the API to fetch designations for this department
        await gettingDesignation(departmentId, false); // false indicates it's a dept_id
        settingComponent(React.createElement(ViewDesignations, {
            deptId: departmentId
        }))
    }

    const newDesignation = () => {
        setShowAddDesignationForm(true);
    }

    const closeAddDesignationForm = () => {
        setShowAddDesignationForm(false);
    }

    const handleLoadMoreDesignations = async () => {
        // Prevent multiple simultaneous calls
        if (isLoadingMoreDesignations) {
            return;
        }

        const currentPagination = useStore.getState().designationPagination;
        const currentDeptId = useStore.getState().deptIdset;

        if (currentPagination && currentPagination.hasMore && currentDeptId) {
            // Get the current page from pagination and increment it
            const currentPage = currentPagination.page || 1;
            const nextPage = currentPage + 1;
            
            // Ensure we don't exceed total pages
            if (nextPage <= (currentPagination.pages || 1)) {
                setIsLoadingMoreDesignations(true);
                try {
                    console.log('Loading more designations - Page:', nextPage, 'Current page:', currentPage);
                    await gettingDesignation(currentDeptId, false, nextPage, true);
                } catch (error) {
                    console.error('Error loading more designations:', error);
                } finally {
                    setIsLoadingMoreDesignations(false);
                }
            }
        }
    }

    const editInput = (designation) => {
        setEditDesignation(true);
        setEditDesValue({
            d_id: designation.id,
            d_title: designation.title || designation.designation
        });
    }

    const handleChangeEditDes = (event) => {
        const { name, value } = event.target;
        setEditDesValue(prev => ({
            ...prev,
            [name]: value
        }));
    }

    const handleEditDesignation = async (event) => {
        event.preventDefault();
        try {
            const response = await departmentsApi.editDeptDesignation(editDesValue);
            const data = response.data;

            if (data.STATUS === "SUCCESSFUL") {
                showToast('Designation updated successfully', 'success');
                setEditDesignation(false);
                setEditDesValue({});

                // Refresh designations list
                const currentDeptId = useStore.getState().deptIdset;
                await gettingDesignation(currentDeptId, false, 1, false);
            } else {
                showToast(data.ERROR_DESCRIPTION || 'Failed to update designation', 'error');
            }
        } catch (err) {
            console.error('Error updating designation:', err);
            showToast('Failed to update designation', 'error');
        }
    }

    const handleDialogDesig = (designationId, deptId) => {
        setOpenDialogDesig(!openDialogDesig);
        // Store the designation ID and department ID for deletion
        if (!openDialogDesig) {
            setEditDesValue({ d_id: designationId, dept_id: deptId });
        }
    }

    const handleDeleteDesignation = async () => {
        try {
            const response = await departmentsApi.deleteDesignations({ id: editDesValue.d_id });
            const data = response.data;

            if (data.STATUS === "SUCCESSFUL") {
                showToast('Designation deleted successfully', 'success');
                setOpenDialogDesig(false);
                setEditDesValue({});

                // Refresh designations list
                const currentDeptId = useStore.getState().deptIdset;
                await gettingDesignation(currentDeptId, false, 1, false);
            } else {
                showToast(data.ERROR_DESCRIPTION || 'Failed to delete designation', 'error');
            }
        } catch (err) {
            console.error('Error deleting designation:', err);
            showToast('Failed to delete designation', 'error');
        }
    }

    const handleNewDesignations = () => {
        const newId = Math.max(...newDesigValue.designations.map(d => d.id)) + 1;
        setNewDesigValue(prev => ({
            ...prev,
            designations: [...prev.designations, { id: newId, value: '' }]
        }));
    }

    const handleInputChangeDes = (index, event) => {
        const { name, value } = event.target;
        setNewDesigValue(prev => ({
            ...prev,
            designations: prev.designations.map((designation, i) =>
                i === index ? { ...designation, [name]: value } : designation
            )
        }));
    }

    const handleRemoveNewDesignation = (index) => {
        if (newDesigValue.designations.length > 1) {
            setNewDesigValue(prev => ({
                ...prev,
                designations: prev.designations.filter((_, i) => i !== index)
            }));
        }
    }

    const handleAddDesig = async () => {
        try {
            // Get the current department ID
            const currentDeptId = useStore.getState().deptIdset;

            // Filter out empty designations
            const validDesignations = newDesigValue.designations.filter(des => des.value.trim() !== '');

            if (validDesignations.length === 0) {
                showToast('Please enter at least one designation', 'error');
                return;
            }

            // Prepare data for API - single payload with array of designation names
            const designationsData = {
                deptt_id: currentDeptId,
                des: validDesignations.map(des => des.value.trim())
            };

            // Call API to add designations in single call
            const response = await departmentsApi.addNewDesignation(designationsData);
            const data = response.data;

            if (data.STATUS === "SUCCESSFUL") {
                showToast('Designations added successfully', 'success');
                // Reset form
                setNewDesigValue({
                    designations: [{ id: 1, value: '' }]
                });
                // Close form and refresh designations
                setShowAddDesignationForm(false);
                await gettingDesignation(currentDeptId, false);
            } else {
                showToast(data.ERROR_DESCRIPTION || 'Failed to add designations', 'error');
            }
        } catch (err) {
            console.error('Error adding designations:', err);
            showToast('Failed to add designations', 'error');
        }
    }

    return {
        addNewDepartment,
        allDeptDetails,
        deptPagination,
        handleDeleteDept,
        showDrawer,
        setShowDrawer,
        closeDeptDrawer,
        departments_b,
        getAllDepartments,
        allBranches,
        getBranchEmployeeList,
        setNewDepartment,
        handleBranchDept,
        getManageDept,
        branchId,
        branchIdset,
        settingBranchId,
        handleManageDept,
        openMenuDept,
        toggleMenuDept,
        deptActionTitle,
        handleMenuDept,
        openDialogDept,
        handleDialogDept,
        handleNavigateNewDept,
        handleNavigateCreateNewDept,
        mountBranch,
        setBranchId,
        handleBackDept,
        handleDesignation,
        gettingDesignation,
        designations,
        designationPagination,
        newDesignation,
        closeAddDesignationForm,
        showAddDesignationForm,
        handleNewDesignations,
        handleInputChangeDes,
        handleRemoveNewDesignation,
        newDesigValue,
        handleAddDesig,
        handleLoadMoreDesignations,
        isLoadingMoreDesignations,
        editInput,
        handleEditDesignation,
        editDesValue,
        editDesignation,
        handleChangeEditDes,
        handleDeleteDesignation,
        openDialogDesig,
        handleDialogDesig,
        empDetailDept,
        empDetailDeptLoading,
        getEmployeesByDeptId,
        get_all_department,
        get_all_department_fn,
        // Employee details function
        handleEmpDetails: useStore((state) => state.handleEmpDetails),
        // HOD-related functions
        allSuggestionsEmp: useStore((state) => state.allSuggestionsEmp),
        empIdHod: useStore((state) => state.empIdHod),
        onChangeEmpHod: useStore((state) => state.onChangeEmpHod),
        handleUpdatingHod: useStore((state) => state.handleUpdatingHod)
    }
}

export default useDepartments

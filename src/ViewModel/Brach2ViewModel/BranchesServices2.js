import { useRef, useState, useCallback } from "react"
import useStore from "../../Store/store"
// import { CiEdit } from 'react-icons/ci'
import { getBranchesService, getEmployeeSuggestionsService, deleteBranchService } from "../../services/branchServices";
import { useDebounce } from "../../services/__debounceServices";
import { showToast } from "../../Components/Toaster/Toaster"
import { newBranchFormValidation, editBranchFormValidaion } from '../../Validation/Validation';
import { FaCheck, FaPencil, FaBuilding } from "react-icons/fa6"
import { MdDelete } from "react-icons/md"
import CreateNewBranch from "../../View/Branches/CreateNewBranch"
import Premisis from "../../View/Branches/Premisis"
// import BranchAdmin from "../../View/Branches/BranchAdmin"
import MarkBranchAdmin from "../../View/Branches/MarkBranchAdmin"
import EditBranchForm from "../../View/Branches/EditBranchForm"
import branch2Api from "../../Model/Data/Branches/Branch2"
import { parseBranchEmployeesPayload } from "../../utils/branchEmployeeSelect"
import mainBranchApi from "../../Model/Data/Branches/Branches"  // Renamed for clarity
// import Branches from "../../"
const useBranches2 = () => {
    const gettingAllBranchesNew = useStore((state) => state.gettingAllBranchesNew)
    const branchesAllnew = useStore((state) => state.branchesAllNew)
    const branchesListLoading = useStore((state) => state.branchesListLoading)
    const allCountries = useStore((state) => state.allCountries)
    const gettingCountries = useStore((state) => state.gettingCountries)
    const mountBranch = useStore((state) => state.mountBranch)
    const handleMountBranch = useStore((state) => state.handleMountBranch)
    const newBranch = useStore((state) => state.newBranch)
    const statusChangeBranch = useStore((state) => state.statusChangeBranch)
    const updateBranch = useStore((state) => state.updateBranch)
    const openDrawer = useStore((state) => state.openDrawer)
    const settingDrawerTitle = useStore((state) => state.settingDrawerTitle)
    const settingComponent = useStore((state) => state.settingComponent)
    const settingDrawerSize = useStore((state) => state.settingDrawerSize)
    const closeDrawer = useStore((state) => state.closeDrawer)
    // const getEmployeesAll = useStore ((state) => state.getEmployeesAll)
    const empSuggestions = useStore((state) => state.empSuggestions)
    const settingBranchAdminData = useStore((state) => state.settingBranchAdminData)
    const brnachAdminData = useStore((state) => state.brnachAdminData)
    const newBranchAdmin = useStore((state) => state.newBranchAdmin)
    const deleteBranchAdmin = useStore((state) => state.deleteBranchAdmin);
    const deleteBranch = useStore((state) => state.deleteBranch);
    // const get_rejected_app = useStore ((state) => state.get_rejected_app);
    // const get_rejected_app_data = useStore((state) => state.get_rejected_app_data);


    const [branchStatusValue, setBranchStatusValue] = useState({
        id: '',
        status: '',
    })

    const branchFilterStatus = useStore((state) => state.branchFilterStatus ?? 1)
    const setBranchFilterStatus = useStore((state) => state.setBranchFilterStatus)



    const [openMenu, setOpenMenu] = useState({});
    const menuItems = [
        { id: 1, title: 'Edit', icon: <FaPencil className="text-green-500" /> },
        { id: 4, title: 'Premises', icon: <FaBuilding className='text-blue-500' /> },
        { id: 5, title: 'Branch Admin', icon: <FaPencil className="text-green-500" /> },
        { id: 2, title: 'Deactivate', icon: <MdDelete className='text-red-500' /> },
        { id: 3, title: 'Activate', icon: <FaCheck className='text-green-500' /> }
    ]

    const branchStatus = [
        { id: 1, title: 'Active Branches', status: 1 },
        { id: 2, title: 'Inactive Branches', status: 0 },
    ]

    const [branchValues, setBranchValues] = useState({
        branch_name: '',
        searchBranch: '',
    })

    const BRANCH_SEARCH_DEBOUNCE_MS = 2000

    const debouncedBranchSearch = useDebounce(
        useCallback((searchValue) => {
            return gettingAllBranchesNew({
                status: branchFilterStatus,
                page: 1,
                limit: 10,
                text: String(searchValue ?? '').trim()
            })
        }, [branchFilterStatus, gettingAllBranchesNew]),
        BRANCH_SEARCH_DEBOUNCE_MS
    )

    const statusBranch = (val) => {
        const statusNum = parseInt(val, 10)
        setBranchFilterStatus(statusNum)
        gettingAllBranchesNew({
            status: statusNum,
            page: 1,
            limit: 10
        })
    }

    // Function to go to next page (always send current filter: 1 active, 0 inactive)
    const goToNextPage = () => {
        const currentPage = branchesAllnew?.pagination?.page || 1;
        const totalPages = branchesAllnew?.pagination?.pages || 1;
        if (currentPage < totalPages) {
            gettingAllBranchesNew({
                status: branchFilterStatus,
                page: currentPage + 1,
                limit: 10,
            });
        }
    };

    // Function to go to previous page
    const goToPreviousPage = () => {
        const currentPage = branchesAllnew?.pagination?.page || 1;
        if (currentPage > 1) {
            gettingAllBranchesNew({
                status: branchFilterStatus,
                page: currentPage - 1,
                limit: 10,
            });
        }
    };

    // Function to go to a specific page
    const goToPage = (pageNumber) => {
        const targetPage = parseInt(pageNumber, 10);
        const totalPages = branchesAllnew?.pagination?.pages || 1;
        if (targetPage >= 1 && targetPage <= totalPages) {
            gettingAllBranchesNew({
                status: branchFilterStatus,
                page: targetPage,
                limit: 10,
            });
        }
    };

    const handleChangeBranch = useCallback((e) => {
        const { name, value } = e.target
        setBranchValues((prevState) => ({
            ...prevState,
            [name]: value
        }))

        if (name !== 'searchBranch') return
        debouncedBranchSearch(value)
    }, [debouncedBranchSearch])

    const triggerRefs = useRef([]);

    const toggleMenu = (index, isOpen) => {
        setOpenMenu((prevOpenMenus) => ({
            ...prevOpenMenus,
            [index]: isOpen,
        }));
    };

    const getDropdownPosition = (index) => {
        const triggerElement = triggerRefs.current[index];
        if (triggerElement) {
            const triggerRect = triggerElement.getBoundingClientRect();
            const dropdownHeight = 200; // Assume the height of your dropdown

            return window.innerHeight - triggerRect.bottom < dropdownHeight ? 'top' : 'bottom';
        }
        return 'bottom';
    };

    // Function to check if menu is open for a specific row
    const isMenuOpen = () => {
        // return !!openMenu[index];

    };

    const [showDrawer, setShowDrawer] = useState(false);

    const OpenAddBranchDrawer = () => {
        setShowDrawer(true)
        gettingCountries()

    }

    const closeBranchDrawer = () => {
        setShowDrawer(false)
        // Clear branch admin data when closing drawer
        settingBranchAdminData(null)
    }

    const creatingNewBranch = () => {
        openDrawer()
        gettingCountries()
        settingDrawerSize(620)
        settingDrawerTitle('Create New Branch')
        settingComponent(<CreateNewBranch
        />)
    }

    const [newBranchValues, setNewBranchValues] = useState({
        currency: '',
        country_code: '',
        email_address: '',
        phone_no: '',
        branch_address: '',
        branch_name: '',
        time_zone: ''
    })

    const handleNewBranch = (e) => {
        const { name, value } = e.target
        console.log('name, value', name, value)

        setNewBranchValues((prevState) => ({
            ...prevState,
            [name]: value
        }))


    }


    const [isLoading, setIsLoading] = useState(false);

    const addNewBranch = async (e, closeBranchDrawer) => {

        e.preventDefault();
        setIsLoading(true);

        const data = {
            branch_name: newBranchValues.branch_name,
            branch_address: newBranchValues.branch_address,
            phone_no: newBranchValues.phone_no,
            email_address: newBranchValues.email_address,
            country: newBranchValues.country_code.value,
            currency: newBranchValues.currency,
        }

        // console.log(data)

        try {
            await validateFormData(data);
            const response = await mainBranchApi.createNewBranch(data)
            const respData = response.data
            console.log('respData', respData)


            // Accept both 200 (OK) and 201 (Created) status codes as success
            if ((response.status === 200 || response.status === 201) && respData.STATUS === 'SUCCESSFUL') {
                // Show success toast first
                showToast('Branch Added Successfully', 'success');
                
                // Always add the new branch at the TOP of the list immediately
                // This ensures the newly created branch appears at the top right away
                if (respData.INSERTED_DATA) {
                    newBranch(respData.INSERTED_DATA);
                } else if (respData.DB_DATA) {
                    newBranch(respData.DB_DATA);
                }
                
                // Reset form values
                setNewBranchValues({
                    branch_name: '',
                    branch_address: '',
                    phone_no: '',
                    email_address: '',
                    country_code: '',
                    currency: ''
                });
                
                // Close drawer after a short delay to allow user to see the success message
                setTimeout(() => {
                    if (closeBranchDrawer) {
                        closeBranchDrawer();
                    } else {
                        closeDrawer();
                    }
                }, 1500); // 1.5 second delay
                
            } else {
                // Show error message only if there's an actual error description
                const errorMessage = respData?.ERROR_DESCRIPTION || 'Failed to create branch';
                showToast(errorMessage, 'error');
            }

        } catch (error) {
            if (error.name === 'ValidationError') {
                // Validation error from form data
                showToast(error.message, 'error');
            } else {
                // Other errors (e.g., network error, API error response)
                const errorMessage = error?.response?.data?.ERROR_DESCRIPTION || error?.message || 'Failed to create branch. Please try again.';
                showToast(errorMessage, 'error');
                console.error('Error creating branch:', error);
            }
        }
        setIsLoading(false);

    }

    const validateFormData = async (formData) => {
        const fields = Object.keys(formData);

        for (const field of fields) {
            try {
                await newBranchFormValidation.validateAt(field, formData);
            } catch (error) {
                throw error; // Throw the first validation error encountered
            }
        }
    };



    const [selectedCountry, setSelectedCountry] = useState(null);

    const handleCountryChange = (selectedOption) => {
        setSelectedCountry(selectedOption);

        const selectedCountryOption = allCountries.find((country) => country.id === selectedOption.value);

        if (selectedCountryOption) {
            const { country_code, currency } = selectedCountryOption;

            setNewBranchValues((prevState) => ({
                ...prevState,
                country_code,
                currency,
            }));
        }
    };

    const onChangeCountry = (selectedOption, field) => {
        console.log('selectedOption, field', selectedOption, field);

        const selectedCountryOption = allCountries.find((country) => country.id === selectedOption.value);

        if (selectedCountryOption) {
            const { currency } = selectedCountryOption;

            setNewBranchValues((prevState) => ({
                ...prevState,
                [field]: selectedOption, // This sets the selected country in the specified field
                // country_code,
                currency,
            }));
        }
        else {
            setNewBranchValues((prevState) => ({
                ...prevState,
                [field]: selectedOption,
            }));
        }
    };




    const [openDialog, setOpenDialog] = useState(false)
    const handleStatus = () => {
        setOpenDialog(!openDialog)
    }


    // const [editBranchId, setEditBranchId] = useState('');

    const handleMenuItems = (id, branchID, bStatus) => {
        switch (id) {
            case 1:
                // Clear branch admin data to show EditBranchForm
                settingBranchAdminData(null);
                gettingCountries();
                openDrawer();
                settingDrawerSize(620);
                settingDrawerTitle('Edit Branch');
                settingComponent(
                    <EditBranchForm
                        data={bStatus}
                        branchID={branchID}
                    />
                );
                break;

            case 2:
                setBranchStatusValue((prevState) => ({
                    ...prevState,
                    id: branchID,
                    status: bStatus,
                }));
                handleStatus();
                break;

            case 4:
                gettingPremisis(branchID);
                break;

            case 5:
                if (bStatus && branchID) {
                    // Pass the branch ID and branch data to markBranchAdmin
                    const branchData = { id: branchID, ...bStatus };
                    markBranchAdmin(branchData);
                } else {
                    showToast('Invalid branch data', 'error');
                }
                break;

            default:
                break;
        }
    };


    // const getForEdit = async (branch) => {

    //     setNewBranchValues((prevState)=>({
    //         ...prevState,
    //         branch_name:branch.branch_name,
    //         branch_address: branch.address,
    //         phone_no:  branch.phone_no,
    //         email_address: branch.email_add,
    //         country_code: branch.country_id,
    //         currency: branch.currency

    //     })); 
    //     setShowDrawer(true)

    // };


    const handleChangeStatus = async () => {
        try {
            await deleteBranch(branchStatusValue.id);
            // Dialog will close regardless of success or failure
            setOpenDialog(false);
            setBranchStatusValue({ id: '', status: '' });
        } catch (error) {
            console.error('Error deleting branch:', error);
            // Still close the dialog even if there's an error
            setOpenDialog(false);
            setBranchStatusValue({ id: '', status: '' });
            showToast('Failed to delete branch', 'error');
        } finally {
            // Ensure dialog closes in any case
            setOpenDialog(false);
            setBranchStatusValue({ id: '', status: '' });
        }
    };

    const validateEditData = async (formData) => {
        const fields = Object.keys(formData);

        for (const field of fields) {
            try {
                await editBranchFormValidaion.validateAt(field, formData);
            } catch (error) {
                throw error;
            }
        }

    }

    const handleEditBranch = async (eOrEditData) => {
        // Support both: (1) form submit event from inline form, (2) edit payload from EditBranchForm drawer
        const isEvent = eOrEditData?.preventDefault && typeof eOrEditData.preventDefault === 'function';
        if (isEvent) {
            eOrEditData.preventDefault();
        }

        const editData = isEvent
            ? {
                id: branchStatusValue.id,
                branch_name: newBranchValues.branch_name,
                branch_address: newBranchValues.branch_address,
                phone_no: newBranchValues.phone_no,
                email_address: newBranchValues.email_address,
                country_id: newBranchValues.country_code,
                currency: newBranchValues.currency,
                time_zone: newBranchValues.time_zone
            }
            : (eOrEditData && typeof eOrEditData === 'object' && eOrEditData.id != null
                ? eOrEditData
                : null);

        if (!editData || editData.id == null) {
            showToast('Invalid branch data', 'error');
            return;
        }

        try {
            await validateEditData(editData);
            const response = await mainBranchApi.editBranch(editData);
            const respEditData = await response.data;

            console.log("this is test", respEditData);

            if (response.status === 200 && respEditData.STATUS === 'SUCCESSFUL') {
                updateBranch(respEditData.DB_DATA);
                showToast('Branch data successfully updated', 'success');
                setShowDrawer(false);
                closeDrawer(); // close store drawer when Edit Branch was opened via settingComponent
            } else {
                showToast(`${respEditData.ERROR_DESCRIPTION}`, 'error');

            }
        } catch (error) {
            if (error.name === 'ValidationError') {
                showToast(error.message, 'error');
            } else {
                console.log(error)
            }
        }
    };




    const handleSelect = (selectedOption, field) => {
        const fieldValue = selectedOption.value || selectedOption;
        console.log('selectedOption', selectedOption)
        handleBranchTimeZone(selectedOption.value)

        if (field === 'country_code') {
            const selectedCountry = allCountries.find(country => country.id === fieldValue);
            const currency = selectedCountry ? selectedCountry.currency : '';
            const timeZone = selectedCountry ? selectedCountry.zone_name : '';
            console.log('timeZone', timeZone)
            setNewBranchValues(prevState => ({
                ...prevState,
                [field]: fieldValue,
                currency: currency,
                time_zone: timeZone
            }));

        } else {
            setNewBranchValues(prevState => ({
                ...prevState,
                [field]: fieldValue
            }));
        }
    };



    const [timeZoneData, setTimeZoneData] = useState([]);
    const handleBranchTimeZone = async (id) => {
        const data = { id: id }
        console.log('id', id)

        try {
            const response = await mainBranchApi.getBranchTimeZone(data);

            const respTimeZoneData = await response.data;
            console.log('time zone', respTimeZoneData)

            if (response.status === 200 && respTimeZoneData.STATUS === 'SUCCESSFUL') {
                setTimeZoneData(respTimeZoneData.TIME_ZONE);
                const timeZone = respTimeZoneData.TIME_ZONE[0]?.zone_name || '';
                setNewBranchValues((prevState) => ({
                    ...prevState,
                    time_zone: timeZone,
                }));
                // setTimeZoneData(data.TIME_ZONE)
            }


        } catch (error) {
            console.log(error);
        }
    };

    const formatPhoneNumber = (name, value) => {
        if (name === 'phone_no') {
            if (value.startsWith('0')) {
                return '+92' + value.slice(1);
            } else if (!value.startsWith('+')) {
                return '+92' + value;
            }
        }
        return value;
    };

    const formatPhoneNumberTable = (value) => {
        if (!value || typeof value !== 'string') {
            return 'N/A';
        }
        if (value.startsWith('0')) {
            return '+92' + value.slice(1);
        } else if (!value.startsWith('+')) {
            return '+92' + value;
        }
        return value;
    };



    const gettingPremisis = (branchID) => {
        openDrawer();
        settingDrawerSize(1200);
        settingDrawerTitle('Set Premises');
        settingComponent(
            <Premisis
                data={{ branch_id: branchID }}
                handleSelectChange={handleSelectChange}
            />
        );
    };



    const [premisisValue, setPremisisValues] = useState({
        premisis: '',
        branch: ''
    })


    const handleSelectChange = (selectedOption, name, data) => {
        // console.log(selectedOption, name, data.branch_id)

        setPremisisValues((prevState) => ({
            ...prevState,
            branch: data.branch_id,
            [name]: selectedOption
        }))
    }


    const deleteSinglePremisis = async (polygons, setPolygons) => {
        console.log("deleteSinglePremisisdeleteSinglePremisis")
        const data = { branch: premisisValue.branch, index: premisisValue?.premisis.value }
        if (premisisValue.premisis !== '') {


            try {
                const response = await mainBranchApi.deletePremisis(data)
                const resData = response.data;
                console.log("resData", resData);
                if (response.status === 200 && resData.STATUS === 'SUCCESSFUL') {
                    showToast('Premisis Deleted Successfully', 'success')
                    setPolygons(polygons.filter((polygon, i) => i !== data.index))
                    setPremisisValues((prevState) => ({
                        ...prevState,
                        premisis: ''
                    }))
                }
                // console.log('response', response)
            } catch (err) {
                console.log(err)
            }
        } else {
            showToast('Select Premisis', 'error')
        }

    }

    const createGeoJSON = (coordsArray) => {
        return coordsArray.map(coords => ({
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: coords
            },
            properties: {}
        }));
    };

    const addPremsis = async (data, branchData) => {
        const geoJSON = {
            branch_id: branchData.branch_id,
            geoGeson: createGeoJSON(data)
        };
        console.log('geoJSON', geoJSON)

        if (geoJSON.geoGeson.length > 0) {
            try {
                const response = await branch2Api.addPremisis(geoJSON)
                console.log('response', response)
                const data = response.data
                if (data.STATUS === 'SUCCESSFUL') {
                    showToast('Premisis Added Successfully', 'success')
                    closeDrawer() // Close the drawer on success
                }
            } catch (err) {

            }
        } else {
            showToast('Select Premisis', 'error')
        }
    }


    const resetPremisis = async (bData, polygons, setPolygons) => {
        const data = { branch_id: bData.branch_id }
        try {
            const response = await branch2Api.resetPremis(data)
            console.log('response', response)
            const resData = response.data
            if (response.status === 200 && resData.STATUS === 'SUCCESSFUL') {
                setPolygons([])
                showToast('Branch Premisis Successfully Reset', 'success')
            }
        } catch (err) {

        }
    }



    // sarmad





    const openBranchAdminDrawer = () => {
        gettingCountries();
        openDrawer();
        settingDrawerSize(620);
        settingDrawerTitle('Branch Admin');
        settingComponent(<MarkBranchAdmin />);
    };

    const markBranchAdmin = async (branchData) => {
        if (!branchData || !branchData.id) {
            showToast('Invalid branch data', 'error');
            return;
        }

        const branchId = branchData.id;
        const basePayload = {
            BRANCH_ADMIN_DATA: [],
            DB_DATA: [],
            branchId,
            employeesFetchError: null,
        };

        try {
            const response = await branch2Api.getBranchEmployees(branchId);
            const responseData = response.data;

            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                const { employees, admins } = parseBranchEmployeesPayload(responseData);
                const newData = {
                    BRANCH_ADMIN_DATA: admins,
                    DB_DATA: employees,
                    branchId,
                    employeesFetchError: null,
                };
                settingBranchAdminData(newData);
                openBranchAdminDrawer();
                return;
            }

            const errMsg =
                responseData?.ERROR_DESCRIPTION || 'Failed to get branch employees';
            settingBranchAdminData({
                ...basePayload,
                employeesFetchError: errMsg,
            });
            openBranchAdminDrawer();
        } catch (err) {
            console.log('Error in mark branch admin:', err);
            const msg =
                err?.response?.data?.ERROR_DESCRIPTION ||
                err?.message ||
                'Failed to get branch employees';
            settingBranchAdminData({
                ...basePayload,
                employeesFetchError: msg,
            });
            openBranchAdminDrawer();
        }
    };



    const [empIdBranchAdmin, setEmpIdBranchAdmin] = useState({
        emp_Id: '',
        loading: false,
        id: ''

    })

    const [grantRole, setRoleGrant] = useState(false)
    const [deleteAdminConfirm, setDeleteAdminConfirm] = useState(false)

    const onChangeEmpBranc = (selectedOption, field) => {
        setEmpIdBranchAdmin((prevState) => ({
            ...prevState,
            [field]: selectedOption,
        }));
        console.log('selectedOption', selectedOption)
        // Don't set grantRole to true here - only when Submit is clicked
    }

    const handleGrantRoleClose = () => {
        setRoleGrant(false)
    }


    const handleAssingRole = async () => {
        // console.log('data', empIdBranchAdmin)
        const data = {
            emp_id: empIdBranchAdmin.emp_Id.value,
            privileges: "2", // this 2 is for Branch Admin You can pass 2 only,
            // id:'',
        }

        const updatedData = {
            id: empIdBranchAdmin.emp_Id.value,
            name: empIdBranchAdmin.emp_Id.label
        }



        setEmpIdBranchAdmin((prevState) => ({
            ...prevState,
            loading: true,
        }));
        try {
            const response = await branch2Api.assignRole(data)
            const responseData = response.data
            console.log('admin response', response)
            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                handleGrantRoleClose()
                newBranchAdmin(updatedData)
                showToast('Admin Role Assign Successfully', 'success')
            } else {
                const error = responseData.ERROR_DESCRIPTION
                handleGrantRoleClose()
                showToast(error, 'error')
            }
        } finally {
            setEmpIdBranchAdmin((prevState) => ({
                ...prevState,
                emp_Id: '',
                loading: false,
            }));
        }
    }


    const handleDeleteBranchAdmin = (data) => {
        console.log('data', data)
        setDeleteAdminConfirm(true)
        setRoleGrant(true)
        setEmpIdBranchAdmin((prevState) => ({
            ...prevState,
            id: data.id,
        }));

    }

    const confirmAdminDeleteHandler = async () => {
        const data = {
            emp_id: empIdBranchAdmin.id,
            role_id: "Branch_Admin", // this 2 is for Branch Admin You can pass 2 only,

        }
        setEmpIdBranchAdmin((prevState) => ({
            ...prevState,
            loading: true,
        }));
        try {
            const response = await branch2Api.deletBranchEmpAdmin(data)
            const responseData = response.data
            console.log(' delete admin response', response)
            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                deleteBranchAdmin(data.emp_id)
                handleGrantRoleClose()
                showToast('Admin Role Deleted Successfully', 'success')
                // newBranchAdmin(updatedData)
            } else {
                // const error = responseData.ERROR_DESCRIPTION
                // handleGrantRoleClose()
                // showToast(error, 'error')
            }
        } finally {
            setEmpIdBranchAdmin((prevState) => ({
                ...prevState,
                id: '',
                loading: false,
            }));
            setDeleteAdminConfirm(false)
        }
    }

    const getBranchEmployees = async (branchId) => {
        try {
            const response = await branch2Api.getBranchEmployees(branchId);
            const responseData = response.data;

            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                return responseData.DB_DATA;
            } else {
                throw new Error(responseData.ERROR_DESCRIPTION || 'Failed to fetch branch employees');
            }
        } catch (err) {
            console.log('Error fetching branch employees:', err);
            throw err;
        }
    };

    const getAdministrativePermissions = async () => {
        try {
            const response = await branch2Api.getAdministrativePermissions();
            const responseData = response.data;

            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                return responseData.DB_DATA;
            } else {
                throw new Error(responseData.ERROR_DESCRIPTION || 'Failed to fetch administrative permissions');
            }
        } catch (err) {
            console.log('Error fetching administrative permissions:', err);
            throw err;
        }
    };

    const assignAdministrativePermission = async (empId, privileges) => {
        try {
            const data = {
                emp_id: empId,
                privileges: privileges
            };

            const response = await branch2Api.assignAdministrativePermission(data);
            const responseData = response.data;

            if (responseData.STATUS === 'SUCCESSFUL') {
                // Extract employee data from API response
                const employeeData = responseData.DB_DATA.employee;
                
                // Update the drawer's local state
                const updatedData = {
                    id: employeeData.id,
                    name: employeeData.name
                };
                newBranchAdmin(updatedData);
                
                // Refresh the branch data by calling the main branch API
                const refreshData = {
                    status: branchFilterStatus,
                    page: 1,
                    limit: 10
                };
                await gettingAllBranchesNew(refreshData);
                
                showToast('Branch Admin role has been assigned successfully', 'success');
                return true;
            } else {
                const error = responseData.ERROR_DESCRIPTION || 'Failed to assign administrative permission';
                showToast(error, 'error');
                return false;
            }
        } catch (err) {
            console.log('Error assigning administrative permission:', err);
            showToast('Error assigning administrative permission', 'error');
            return false;
        }
    };

    const removeAdministrativePermission = async (empId) => {
        try {
            const data = {
                emp_id: empId
            };

            const response = await branch2Api.removeAdministrativePermission(data);
            const responseData = response.data;

            if (responseData.STATUS === 'SUCCESSFUL') {
                // Update the drawer's local state
                deleteBranchAdmin(empId);
                
                // Refresh the branch data by calling the main branch API
                const refreshData = {
                    status: branchFilterStatus,
                    page: 1,
                    limit: 10
                };
                await gettingAllBranchesNew(refreshData);
                
                return true;
            } else {
                const error = responseData.ERROR_DESCRIPTION || 'Failed to remove administrative permission';
                showToast(error, 'error');
                return false;
            }
        } catch (err) {
            console.log('Error removing administrative permission:', err);
            showToast('Error removing administrative permission', 'error');
            return false;
        }
    };

    return {
        isMenuOpen, toggleMenu, branchStatus, statusBranch, gettingAllBranchesNew, branchValues, branchesAllnew, handleChangeBranch, openMenu, setOpenMenu, menuItems, showDrawer, setShowDrawer, OpenAddBranchDrawer, closeBranchDrawer, allCountries,
        newBranchValues, setNewBranchValues, handleSelect, handleCountryChange, handleMenuItems, openDialog, handleStatus, handleChangeStatus, handleNewBranch, selectedCountry, mountBranch, handleMountBranch, addNewBranch, isLoading, setIsLoading, handleEditBranch,
        branchStatusValue, handleBranchTimeZone, creatingNewBranch, timeZoneData, formatPhoneNumber, formatPhoneNumberTable, onChangeCountry, handleSelectChange, premisisValue, deleteSinglePremisis,
        addPremsis, resetPremisis,
        empSuggestions, empIdBranchAdmin, onChangeEmpBranc, grantRole,
        handleGrantRoleClose, handleAssingRole, brnachAdminData,
        handleDeleteBranchAdmin, closeDrawer, markBranchAdmin, settingBranchAdminData, settingComponent, openDrawer, settingDrawerSize, settingDrawerTitle,
        confirmAdminDeleteHandler, deleteAdminConfirm, triggerRefs, getDropdownPosition, deleteBranch, getBranchEmployees, showToast,
        getAdministrativePermissions, assignAdministrativePermission, removeAdministrativePermission, setEmpIdBranchAdmin, setRoleGrant,
        currentFilterStatus: branchFilterStatus, goToNextPage, goToPreviousPage, goToPage,
        branchesListLoading,

    }
}

export default useBranches2
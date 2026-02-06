import { useRef, useState } from "react"
import useStore from "../../Store/store"
// import { CiEdit } from 'react-icons/ci'
import branchesApi from "../../Model/Data/Branches/Branches"
import { showToast } from "../../Components/Toaster/Toaster"
import { newBranchFormValidation, editBranchFormValidaion } from '../../Validation/Validation';
import { FaCheck, FaPencil, FaBuilding } from "react-icons/fa6"
import { MdDelete } from "react-icons/md"
import CreateNewBranch from "../../View/Branches/CreateNewBranch"
import Premisis from "../../View/Branches/Premisis"
// import BranchAdmin from "../../View/Branches/BranchAdmin"
import MarkBranchAdmin from "../../View/Branches/MarkBranchAdmin"
import EditBranchForm from "../../View/Branches/EditBranchForm"

const useBranches = () => {
    const gettingAllBranches = useStore((state) => state.gettingAllBranches)
    const branchesAll = useStore((state) => state.branchesAll)
    const filterBranches = useStore((state) => state.FilterBranchesSearch)
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
    const deleteBranchAdmin = useStore((state) => state.deleteBranchAdmin)


    const [branchStatusValue, setBranchStatusValue] = useState({
        id: '',
        status: '',
    })



    const [openMenu, setOpenMenu] = useState({});
    const menuItems = [
        { id: 1, title: 'Edit', icon: <FaPencil className="text-green-500" /> },
        { id: 2, title: 'Deactivate', icon: <MdDelete className='text-red-500' /> },
        { id: 3, title: 'Activate', icon: <FaCheck className='text-green-500' /> },
        { id: 4, title: 'Premises', icon: <FaBuilding className='text-blue-500' /> },
        { id: 5, title: 'Mark Branch Admin', icon: <FaPencil className="text-green-500" /> }
    ]

    const branchStatus = [
        { id: 1, title: 'Active Branches', status: 1 },
        { id: 2, title: 'Inactive Branches', status: 0 },
    ]

    const [branchValues, setBranchValues] = useState({
        branch_name: '',
        searchBranch: '',
    })

    const statusBranch = (val) => {
        const data = { status: val }

        gettingAllBranches(data)

        console.log("val", val)
    }

    const handleChangeBranch = (e) => {
        const { name, value } = e.target
        setBranchValues((prevState) => ({
            ...prevState,
            [name]: value
        }))

        filterBranches(value)
    }

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
    }

    const creatingNewBranch = () => {
        openDrawer()
        gettingCountries()
        settingDrawerSize(500)
        settingDrawerTitle('Create New Branch')
        settingComponent(<CreateNewBranch

        />)
    }

    const [newBranchValues, setNewBranchValues] = useState({
        // branch_id: '0',
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
            country_id: newBranchValues.country_code.value,
            currency: newBranchValues.currency,
        };

        try {
            await validateFormData(data);
            const response = await branchesApi.createNewBranch(data);

            if (response?.data?.STATUS === 'SUCCESSFUL') {
                // Check if we should add the branch to state in real-time
                // Get the new pagination data from the new service
                const newBranchesData = useStore.getState().branchesAllNew;
                
                if (newBranchesData && newBranchesData.pagination) {
                    // Use the new pagination logic
                    const currentPagination = newBranchesData.pagination;
                    const loadMoreButtonVisible = currentPagination.page < currentPagination.pages;
                    
                    // Only add to state if Load More button is NOT visible (no more pages to load)
                    if (!loadMoreButtonVisible) {
                        // Add the new branch to the current state
                        if (response.data.INSERTED_DATA) {
                            newBranch(response.data.INSERTED_DATA);
                        } else if (response.data.DB_DATA) {
                            newBranch(response.data.DB_DATA);
                        }
                    }
                    // If Load More button would be visible, don't add to state - let them load more to see it
                } else {
                    // Fallback: Add the new branch to state immediately for real-time update
                    if (response.data.INSERTED_DATA) {
                        newBranch(response.data.INSERTED_DATA);
                    } else if (response.data.DB_DATA) {
                        newBranch(response.data.DB_DATA);
                    } else {
                        // If no specific data returned, refresh the entire list
                        console.log('No branch data in response, refreshing list...');
                        gettingAllBranches({ status: 1 }); // Refresh active branches
                    }
                }
                
                // Show success toast first
                showToast('Branch Added Successfully', 'success');
                
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
                showToast(response?.data?.ERROR_DESCRIPTION || 'Failed to add branch', 'error');
            }
        } catch (error) {
            console.error('Error adding branch:', error);
            // Check if it's a validation error
            if (error.name === 'ValidationError') {
                showToast(error.message, 'error'); // Show the validation error message
            } else {
                showToast(error?.response?.data?.ERROR_DESCRIPTION || 'Failed to add branch', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const validateFormData = async (formData) => {
        try {
            await newBranchFormValidation.validate(formData, { abortEarly: false });
        } catch (error) {
            // Get the first validation error
            const firstError = error.inner[0];
            //  throw new Error(firstError.message);
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
        // console.log(id)
        // console.log('bStatus',bStatus)



        switch (id) {
            case 1:
                // console.log('branchID', branchID)
                // setBranchStatusValue((prevState)=>({

                //     ...prevState,
                //     id: branchID,
                // }))
                // getForEdit(bStatus)
                // handleBranchTimeZone(bStatus.country_id)
                gettingCountries()
                openDrawer()
                settingDrawerSize(500)
                settingDrawerTitle('Edit Branch')
                settingComponent(
                    <EditBranchForm
                        data={bStatus}
                        branchID={branchID}
                    />
                )

                break;

            case 2:
                setBranchStatusValue((prevState) => ({

                    ...prevState,
                    id: branchID,
                    status: bStatus,
                }))
                handleStatus()
                break;

            case 4:
                gettingPremisis(branchID)
                break;

            case 5:
                markBranchAdmin(bStatus.BRANCH_DATA)
                break;

            default:
                break;
        }
    }


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


        const statusData = {
            id: branchStatusValue.id,
            branch_status: branchStatusValue.status

        }

        try {
            const response = await branchesApi.statusBranch(statusData)
            const responseData = await response.data

            // console.log("responseData", responseData)


            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                statusChangeBranch(statusData);
                showToast(`${responseData.DESCRIPTION}`, 'success');
                setOpenDialog(false)
            } else {
                showToast(`${responseData.ERROR_DESCRIPTION}`, 'error');

            }

        } catch (error) {
            console.log(error)
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

    const handleEditBranch = async (data) => {
        ///console.log('branchID', data)
        // e.preventDefault();

        const editData = {
            id: data.id,
            branch_name: data.branch_name,
            branch_address: data.branch_address,
            phone_no: data.phone_no,
            email_address: data.email_address,
            country_id: data.country_id,
            currency: data.currency,
            time_zone: data.time_zone
        }
        try {
           // await validateEditData(editData);
            const response = await branchesApi.editBranch(editData);
            const respEditData = await response.data;
            // console.log('response response response', response)
            if (respEditData.STATUS === 'SUCCESSFUL') {
                updateBranch(respEditData.DB_DATA)
                // showToast(`${respEditData.DESCRIPTION}`, 'success');
                showToast('Branch data successfully updated', 'success');
                closeDrawer();
                
            } else {
                showToast(`${respEditData.ERROR_DESCRIPTION}`, 'error');

            }
        } catch (error) {
            showToast(error?.response?.data?.ERROR_DESCRIPTION, 'error');
            if (error.name === 'ValidationError') {
                showToast(error?.response?.data?.ERROR_DESCRIPTION, 'error');
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
            const response = await branchesApi.getBranchTimeZone(data);

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
        id: "",
        premisis: '',
        branch: ''
    })


    const handleSelectChange = (selectedOption, name, data) => {
        console.log(selectedOption, name, data)

        setPremisisValues((prevState) => ({
            ...prevState,
            id: data.id,
            branch: data.branch_id,
            [name]: selectedOption
        }))
    }


    const deleteSinglePremisis = async (premisesId) => {
        if (!premisesId) {
            showToast('Premises ID not found for deletion', 'error');
            return;
        }
        try {
            const response = await branchesApi.deletePremisisById(premisesId);
            const resData = response.data;
            if (response.status === 200 && resData.STATUS === 'SUCCESSFUL') {
                showToast('Premises Deleted Successfully', 'success');
            }
        } catch (err) {
            console.log(err);
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
                const response = await branchesApi.addPremisis(geoJSON)
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
            const response = await branchesApi.resetPremis(data)
            console.log('response', response)
            const resData = response.data
            if (response.status === 200 && resData.STATUS === 'SUCCESSFUL') {
                setPolygons([])
                showToast('Branch Premisis Successfully Reset', 'success')
            }
        } catch (err) {
            console.error('Error resetting premises:', err)
        }
    }



    // sarmad

    const [showDialog, setShowDialog] = useState(false)
    const [moreAdmin, setMoreAdmin] = useState([])

    const handleOpen = () => {
        setShowDialog(!showDialog)
    }

    const handleMoreAdmin = (data) => {
        handleOpen()
        setMoreAdmin(data)
    }

    const markBranchAdmin = async (branchData) => {
        console.log('branchData', branchData)
        const data = { id: branchData.id, status: 1 }
        try {
            const response = await branchesApi.getBranchEmpAdmin(data)
            console.log('response', response)
            const responseData = await response.data
            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                const newData = { BRANCH_ADMIN_DATA: responseData.BRANCH_ADMIN_DATA, DB_DATA: responseData.DB_DATA }
                settingBranchAdminData(newData)
                settingComponent(<MarkBranchAdmin />)
                openDrawer()
                settingDrawerSize(500)
                settingDrawerTitle('Mark Branch Admin')
            } else {
                const error = responseData.ERROR_DESCRIPTION
                showToast(error, 'error')
            }
        } catch (err) {

        }



    }



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
        setRoleGrant(true)
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
            const response = await branchesApi.assignRole(data)
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
            const response = await branchesApi.deletBranchEmpAdmin(data)
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


    return {
        isMenuOpen, toggleMenu, branchStatus, statusBranch, gettingAllBranches, branchValues, branchesAll, handleChangeBranch, openMenu, setOpenMenu, menuItems, showDrawer, setShowDrawer, OpenAddBranchDrawer, closeBranchDrawer, allCountries,
        newBranchValues, setNewBranchValues, handleSelect, handleCountryChange, handleMenuItems, openDialog, handleStatus, handleChangeStatus, handleNewBranch, selectedCountry, mountBranch, handleMountBranch, addNewBranch, isLoading, setIsLoading, handleEditBranch,
        branchStatusValue, handleBranchTimeZone, creatingNewBranch, timeZoneData, formatPhoneNumber, formatPhoneNumberTable, onChangeCountry, handleSelectChange, premisisValue, deleteSinglePremisis,
        addPremsis, resetPremisis, handleMoreAdmin,
        moreAdmin, showDialog, handleOpen, empSuggestions, empIdBranchAdmin, onChangeEmpBranc, grantRole,
        handleGrantRoleClose, handleAssingRole, brnachAdminData,
        handleDeleteBranchAdmin,
        confirmAdminDeleteHandler, deleteAdminConfirm, triggerRefs, getDropdownPosition,
        closeDrawer
    }
}

export default useBranches
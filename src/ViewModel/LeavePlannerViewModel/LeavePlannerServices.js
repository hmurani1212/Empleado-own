import { useEffect, useRef, useState } from "react";
import useStore from "../../Store/store"
import AddNewLeaveGroup from "../../View/LeavesPlanner/AddNewLeaveGroup";
import leavesPlannerApi from "../../Model/Data/LeavesPlanner/LeavesPlanner";
import { showToast } from "../../Components/Toaster/Toaster";
import { useNavigate } from "react-router";
import { validateAddLeaveGroupForm, validateDefineLeaveType, validateGoogleHoliday } from "../../Validation/Validation";
import DefineLeaveType from "../../View/LeavesPlanner/DefineLeaveType";
import branchesApi from "../../Model/Data/Branches/Branches";
import EditLeavesGroup from "../../View/LeavesPlanner/EditLeavesGroup";
import ImportGoogleHolidays from "../../View/LeavesPlanner/ImportGoogleHolidays";
import { FaPencil } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import ImportEmpLeaves from "../../View/LeavesPlanner/ImportEmpLeaves";

const useLeavesPlanner = () => {
    const allLeavesGroup = useStore ((state) => state.allLeavesGroup)
    const openDrawer = useStore ((state) => state.openDrawer)
    const settingDrawerTitle = useStore ((state) => state.settingDrawerTitle)
    const settingComponent = useStore ((state) => state.settingComponent)
    const settingDrawerSize = useStore ((state) => state.settingDrawerSize)
    const leavesBranches = useStore ((state) => state.leavesBranches)
    const getAllDepartmentsLeaves = useStore ((state) => state.getAllDepartmentsLeaves)
    const handleMountLeave = useStore ((state)=>state.handleMountLeave)
    const mountLeave = useStore ((state)=>state.mountLeave)
    const leavesGroupTableLoading = useStore((state) => state.leavesGroupTableLoading)
    const getLeavesList = useStore ((state)=>state.getLeavesList)
    const getPaidLeavesConfig = useStore ((state)=>state.getPaidLeavesConfig)
    const addNewLeaveGroupState = useStore((state)=>state.addNewLeaveGroupState)
    const closeDrawer = useStore ((state) => state.closeDrawer)
    const allViewLeave = useStore ((state) => state.allViewLeave)
    const viewLeavesLoading = useStore ((state) => state.viewLeavesLoading)
    const getViewLeavesList = useStore ((state) => state.getViewLeavesList)
    const leavesPlannerSearch = useStore ((state) => state.leavesPlannerSearch)
    const deleteLeaves = useStore ((state) => state.deleteLeaves)
    const deleteSpecificLeaves = useStore ((state) => state.deleteSpecificLeaves)
    const addDefineLeavesType = useStore ((state) => state.addDefineLeavesType)
    const incrementLeaveGroupCount = useStore ((state) => state.incrementLeaveGroupCount)
    const defineLeaveTypeSearch = useStore ((state) => state.defineLeaveTypeSearch)
    const policiesList = useStore ((state) => state.policiesList)
    const allCountries = useStore ((state) => state.allCountries)
    const gettingCountries = useStore((state) => state.gettingCountries)
    const settingLeavePlannerByBranch = useStore ((state) => state.settingLeavePlannerByBranch)
    const UpdateLeaveGroup = useStore ((state) => state.UpdateLeaveGroup)
    const getPoliciesList = useStore ((state) => state.getPoliciesList)
    const type = useStore((state) => state.type)
    const updatePaidToggle = useStore((state) => state.updatePaidToggle)
    const gettingGoogleForms = useStore((state) => state.gettingGoogleForms)
    const countriesGoogleForm = useStore((state) => state.countriesGoogleForm)
    const branchesGoogleForm = useStore((state) => state.branchesGoogleForm)
    const googleFormsLoading = useStore((state) => state.googleFormsLoading)
    const leavesBranchesLoading = useStore((state) => state.leavesBranchesLoading)
    const googleFormPoliciesLoading = useStore((state) => state.googleFormPoliciesLoading)
    const settingGoogleHolidays = useStore((state) => state.settingGoogleHolidays)
    const googleHolidays = useStore((state) => state.googleHolidays)
    const showGoogleForm = useStore((state) => state.showGoogleForm)
    const handleGoogleModal = useStore((state) => state.handleGoogleModal)
    const getAllLeaveGroupsForPolicy = useStore((state) => state.getAllLeaveGroupsForPolicy)
    const settingbranch = useStore((state) => state.settingbranch)
    const settingPolicyId = useStore((state) => state.settingPolicyId)
    
    
    const navigate = useNavigate()
    const leavesPlannerTitles = [
        {id:1, title: 'Leave Groups', link:'/leavesPlanner/leaves_group'},
        {id:2, title:'Public Holiday', link:'/leavesPlanner/public_holiday'}
    ]

    const leavesNoticesItems = [
        {id: 1, title:'Edit', icon:<FaPencil className="text-green-500"/>},
        {id:2, title:'Delete',icon:<MdDelete className='text-red-500'/> }
    ]

    const addLeaveGroupDrawer = async() =>{
        getAllDepartmentsLeaves()
        setAddGroupValues({
            branch_id: 0,
            group_title: '',
            title: '',
            name: '',
            id: ''
        })
        openDrawer()
        settingDrawerSize('45vw')
        settingDrawerTitle('Add Leave Group')
        settingComponent(<AddNewLeaveGroup />)
    }

    const [addGroupValues, setAddGroupValues] = useState ({
        branch_id: 0,
        group_title: '',
        title:'',
        name: '',
        id: ''
    })

    const handleLeave = (e) => {
        
        
        const {name, value} = e.target
        // console.log('name', name)
        // console.log('value', value)
        setAddGroupValues((prevState) => ({
            ...prevState,
            [name] : value
        })) 
    }

    const handleLeaveBranch = (name, event) => {
        
        // console.log('Leave name, event', name, event)

        setAddGroupValues((prevState) => ({
            ...prevState,
            [name] : event
        })) 
    }
    
    const [isLoading, setIsLoading] = useState(false);
    const [isDeletingGroup, setIsDeletingGroup] = useState(false);
    const [isDeletingSpecificLeave, setIsDeletingSpecificLeave] = useState(false);
    const [isSubmittingGoogleForm, setIsSubmittingGoogleForm] = useState(false);

    const addNewLeaveGroup = async(e) => {

        e.preventDefault();
        setIsLoading(true);

        const data = {
            branch_id: Number(addGroupValues.branch_id),
            group_title: addGroupValues.name
        }

        try{
            await validateLeavesFormData(data);
            const response = await leavesPlannerApi.addLeavesGroup(data)
            const respData = response.data

            if(response.status === 201 && respData.STATUS === 'SUCCESSFUL'){
                showToast('Group Added Successfully', 'success')
                setAddGroupValues({
                    branch_id: 0,
                    group_title: '',
                    name: '',
                    title: '',
                    id: ''
                });
                
                addNewLeaveGroupState(respData.DB_DATA)
                closeDrawer()
            } else {
                showToast(`${respData.ERROR_DESCRIPTION}`, 'error')
            }

        } catch(error){
            if (error.name === 'ValidationError') {
                showToast(error.message, 'error');
            } else {
                console.log(error)
            }
        }
        setIsLoading(false);

    }

    const validateLeavesFormData = async (formData) => {
        const fieldsToValidate = ['branch_id', 'group_title'];
        for ( const field of fieldsToValidate) {
            try{
                await validateAddLeaveGroupForm.validateAt(field, formData)
            } catch (error) {
                throw error;
            }
        }
    }

    const handleLeaveView = async(groupId) => {
        console.log('groupId', groupId)

        navigate(`/leavesPlanner/leaves_group/viewLeaves/${groupId}`);
        getViewLeavesList({ group_id: groupId });
    }

    const [leavesSearch, setLeavesSearch] = useState([]);

    const handleLeavesChange = (e) =>{
        const {name, value} = e.target
        setLeavesSearch((prevState) => ({
            ...prevState,
            [name] : value
        }))

        leavesPlannerSearch(value)
    }


    


    const selectBranchHandler = async(searchTerm) => {
        const data = { branch_id: searchTerm, search:'' };
        console.log("data of the filter ", data)
        useStore.setState({ leavesGroupTableLoading: true })

        try{
            const response = await leavesPlannerApi.getLeavesGroupByBranch(data)

            console.log("leave Search", response)

            if(response.status === 200 && Array.isArray(response.data)){
                settingLeavePlannerByBranch(response.data || [])
            } else {
                settingLeavePlannerByBranch([])
            }

        } catch(err) {
            console.log('Branch filter error:', err)
            settingLeavePlannerByBranch([])
        } finally {
            useStore.setState({ leavesGroupTableLoading: false })
        }
        
    }


    const [openMenu, setOpenMenu] = useState({});
    const triggerRefs = useRef([]);
    const toggleMenuLeaves = (index, isOpen) => {
        setOpenMenu((prevOpenMenu) => ({
            ...prevOpenMenu,
            [index]: isOpen
        }))

    }
    const getDropdownPosition = (index) => {
        const triggerElement = triggerRefs.current[index];
        if (triggerElement) {
        const triggerRect = triggerElement.getBoundingClientRect();
        const dropdownHeight = 200; // Assume the height of your dropdown

        return window.innerHeight - triggerRect.bottom < dropdownHeight ? 'top' : 'bottom';
        }
        return 'bottom';
    };

    const [leaveId, setLeaveId] = useState('')
    const handleMenuItemsLeaves = (id, ele) => {
        console.log('Clicked', id, ele)
        
        switch (id) {
            case 1:
                setAddLeaveTypeValues((prevState) => ({
                    ...prevState,
                    group_id : ele.id 
                }))

                // console.log("i am edit", ele)
                setAddGroupValues((prevState)=>({
                    ...prevState,
                    group_title: ele.name,
                   
                    id: ele.id

                }))
                getEditLeaves(ele);
                setLeaveId(ele.id)

            break;
            
            case 2:
                console.log("I am delete")
                handleDeleteLeavesDialog()
                setLeaveId(ele.id)
            break;

        default: 
        console.log("Default case")
        }
    };

    const [openDialogLeaves, setOpenDialogLeaves] = useState(false)
    

    const handleDeleteLeavesDialog = () => {
        setOpenDialogLeaves(!openDialogLeaves)
    }



    const handleDeleteGroups = async() => {
        setIsDeletingGroup(true)

        const data = {dt : (`${leaveId}`)}

        try {
            const response = await leavesPlannerApi.deleteLeaveGroup(data)
            const respData = response.data
            console.log('Delete rep', response)

            if (response.status === 200 && respData.message === "ok"){
                setOpenDialogLeaves(false)
                deleteLeaves(leaveId)
                showToast("Leave Group Deleted Successfully", 'success')

            }
        } catch(err){
            console.log(err)
        } finally {
            setIsDeletingGroup(false)
        }
    }

    const [openDialogSpecific, setopenDialogSpecific] = useState(false)

    const [viewId, setViewId] = useState('')
    const handleDeleteSpecificLeaves = (id) => {

        // console.log('specific leave', id)
        setopenDialogSpecific(!openDialogSpecific)
        setViewId(id)  
    }

    
    const handleDeleteLeaves = async() => {
        setIsDeletingSpecificLeave(true)

        const data = {dt : (`${viewId}`)}

        try {
            const response = await leavesPlannerApi.deleteSpecificLeave(data)
            const respData = response.data
            console.log('Delete rep', respData)

            if (response.status === 200 || respData.STATUS === "SUCCESSFUL"){
                showToast("Leave Deleted Successfully", 'success')
                setopenDialogSpecific(false)
                deleteSpecificLeaves(viewId)

            }
        } catch(err){
            console.log(err)
        } finally {
            setIsDeletingSpecificLeave(false)
        }
    }



    const addDefineLeave = async(id) =>{
        console.log('id', id)

        openDrawer()
        settingDrawerSize('45vw')
        settingDrawerTitle('Define Leave Type')
        settingComponent(<DefineLeaveType
            groupId={id}
            />)
        
    }


    // <-- Define Leave Type -->
    const validateDefineLeaveTypeForm = async(formData) => {
        const fields = Object.keys(formData);
        for (const field of fields) {
            try {
                await validateDefineLeaveType.validateAt(field, formData)
            } catch (error) {
                throw error;
            }
        }
    }
    const [addLeaveTypeValues, setAddLeaveTypeValues] = useState ({
        group_id : '',
        leave_title : '',
        paid : '',
        new_joiners_after_months : '3', // Default to 3 months
        new_joiners_after_year : '0', // Default to 0 years
        consecutive : '',
        carry_forward : '',
        leave_unit : 'day', // Default to 'day' (Days)
        quantity : '',
        calendar_upto : '',
        calendar_from : '',
        prorated :'',
        encashable:''
    })

    const addDefineLeaveType = async (e, id) => {
        e.preventDefault()
        
        const typeData =  {
            group_id: id,
            leave_title: addLeaveTypeValues.leave_title,
            calendar_from: addLeaveTypeValues.calendar_from,
            calendar_upto: addLeaveTypeValues.calendar_upto,
            quantity: addLeaveTypeValues.quantity,
            leave_unit: addLeaveTypeValues.leave_unit,
            carry_forward: addLeaveTypeValues.carry_forward,
            consecutive: addLeaveTypeValues.consecutive,
            prorated: addLeaveTypeValues.prorated,
            encashable: addLeaveTypeValues.encashable,
            new_joiners_after_year: addLeaveTypeValues.new_joiners_after_year,
            new_joiners_after_months: addLeaveTypeValues.new_joiners_after_months,
            paid: addLeaveTypeValues.paid,            
        }
        
        try {
            setIsLoading(true); 
            await validateDefineLeaveTypeForm(typeData)
            const response = await leavesPlannerApi.addLeaveType(typeData)

            if (response.status === 201 || response.data.STATUS === "SUCCESSFUL"){
                showToast(`Leave Added Successfully`, 'success')
                setAddLeaveTypeValues({
                    group_id : '',
                    leave_title : '',
                    calendar_from : '',
                    calendar_upto : '',
                    quantity : '',
                    leave_unit : '',
                    carry_forward : '',
                    consecutive : '',
                    prorated :'',
                    encashable:'',
                    new_joiners_after_months : '',
                    new_joiners_after_year : '',
                    paid : '',
                });

                addDefineLeavesType(response.data)
                incrementLeaveGroupCount(id)
                closeDrawer() 
            } else {
                showToast(response.data.ERROR_DESCRIPTION || 'An error occurred', 'error')
            }

        } catch (error) {
            if(error.name === 'ValidationError') {
                showToast(error.message, 'error')
            } else {
                console.log(error)
                showToast('An error occurred', 'error')
            }
        } finally {
            setIsLoading(false);
        }

    }

 
    const handleLeaveTypesValue = (e) => {
        const {name, value} = e.target
        // console.log('Type', name, value)

        // Validation for quantity (no negative values)
        if (name === 'quantity' && parseInt(value) < 0) {
            return; // Don't update if negative
        }
        
        // Validation for consecutive (minimum 1)
        if (name === 'consecutive' && parseInt(value) < 1 && value !== '') {
            return; // Don't update if less than 1
        }

        setAddLeaveTypeValues((prevState) => ({
            ...prevState,
            [name] : value
        }))

    }

    const handleSelectChangeMonth = (field, value)=>{
        setAddLeaveTypeValues((prevState)=>({
            ...prevState,
            [field]: value
        }))
    }

    const [importHolidays, setImportHolidays] = useState({
        branch_id : ''
    })
    const handleSelectChangeBranch = (field, value)=>{
        console.log(field, value)
        getPoliciesList(value)

        setImportHolidays((prevState)=>({
            ...prevState,
            [field]: value
        }))
    }

    const [typeSearch, setTypeSearch] = useState([])
    const handleLeaveTypeSearch = (e) => {
        const {name, value} = e.target
        setTypeSearch((prevState) => ({
            ...prevState,
            [name] : value
        }))

        defineLeaveTypeSearch(value)
    }

    // <-- Edit -->
  
    const getEditLeaves = async(leave) => {
        openDrawer()
        settingDrawerSize('45vw')
        settingDrawerTitle('Edit Leave Group')
        settingComponent(<EditLeavesGroup 
            data = {leave}
            closeDrawer = {closeDrawer}
            UpdateLeaveGroup = {UpdateLeaveGroup}
        />)
    }
    

    const [paidLeaveValues, setPaidLeaveValues] = useState({
        paid_leave: type
    })

    // Update paidLeaveValues when type changes from the store
    useEffect(() => {
        setPaidLeaveValues(prevState => ({
            ...prevState,
            paid_leave: type
        }));
    }, [type])


    const handlePaidLeaves = async(newPaidLeaveStatus) => {
        const org_id = localStorage.getItem('org_id');
        const paidData = {
            paid_leave: newPaidLeaveStatus,
            org_id: org_id
        }

        console.log('paidData',paidData)
        try{
            const response = await leavesPlannerApi.paidToggle(paidData)
            const data = response.data

            console.log('data', data)
            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                showToast(data.DESCRIPTION || 'Paid leaves status updated successfully', 'success')
                setPaidLeaveValues(prevState => ({
                    ...prevState,
                    paid_leave: newPaidLeaveStatus
                }));
                updatePaidToggle(newPaidLeaveStatus)

            } else {
                showToast(data.ERROR_DESCRIPTION || 'Failed to update paid leaves status', 'error')
            }
        } catch(error){
            console.log('Error updating paid leaves status:', error)
            showToast('Failed to update paid leaves status', 'error')
        }
    }

    const handleChangeToggle = () => {
        const newPaidLeaveStatus = !paidLeaveValues.paid_leave;
        
        console.log(newPaidLeaveStatus)
        setPaidLeaveValues(prevState => ({
            ...prevState,
            paid_leave: newPaidLeaveStatus
        }));

        handlePaidLeaves(newPaidLeaveStatus);
    };

    

    const importEmpLeaves  = async()=>{
        openDrawer();
        settingDrawerSize(500)
        settingDrawerTitle('Import Employee Leaves')
        settingComponent(<ImportEmpLeaves />)
    }

    // <-- Public Holidays -->
    const googleCalenderHolidays  = async()=>{
        gettingGoogleForms()
        getAllDepartmentsLeaves()
        openDrawer();
        settingDrawerSize('45vw')
        settingDrawerTitle('Import Google Holiday')
        settingComponent(<ImportGoogleHolidays />)
    }

    const [holidayValues, setHolidayValues] = useState({
        branch_id : '',
        policy_id:'',
        country_code: '',
        lang : '',
        loading:false
    })

    useEffect(() => {
        const detectUserCountry = async () => {
            try {
                const response = await fetch('https://api.country.is/');
                const data = await response.json();
                const countryCode = data.country?.toLowerCase();
                console.log('Detected country code:', countryCode);
                if (countryCode && countriesGoogleForm.length > 0) {
                    const userCountry = countriesGoogleForm.find(
                        country => country.prefix?.toLowerCase() === countryCode
                    );
                    console.log('Found user country:', userCountry);
                    if (userCountry) {
                        const selectedCountry = { 
                            value: userCountry.prefix?.toLowerCase(), 
                            label: `${userCountry.country_name} (${userCountry.phonecode})` 
                        };
                        console.log('Setting country:', selectedCountry);
                        setHolidayValues(prev => ({
                            ...prev,
                            country_code: selectedCountry
                        }));
                    }
                }
            } catch (error) {
                console.log('Could not detect country:', error);
            }
        };
        
        if (countriesGoogleForm.length > 0 && !holidayValues.country_code) {
            detectUserCountry();
        }
    }, [countriesGoogleForm])

    const handleSelectChange = (field, value)=>{
        if(field === 'branch_id'){
            getPoliciesList(value)
            setHolidayValues((prevState)=>({
                ...prevState,
                [field]: value
            }))
        } else{
            setHolidayValues((prevState)=>({
                ...prevState,
                [field]: value
            }))

        }
        
    }

    const [googleFormHoliday, setGoogleFormHolidays] = useState([])

    const handleGoogleHoliday = async(e) => {
        e.preventDefault()
        const dataHoliday = {
            branch_id : holidayValues.branch_id,
            policy_id : holidayValues.policy_id,
            county_id : holidayValues.country_code?.value || holidayValues.country_code,
            language : 'en',
        }


        // console.log('dataHoliday', dataHoliday)

        try{
            await validateFormData(dataHoliday);
            setHolidayValues((prevState)=>({
                ...prevState,
                loading: true
            }))
            const response = await leavesPlannerApi.getGoogleHolidays(dataHoliday)
            const data = response.data
            console.log('response', response)

            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                settingGoogleHolidays(data.DB_DATA.holidays)
                settingbranch(holidayValues.branch_id === 'all' ? 0 : holidayValues.branch_id)
                settingPolicyId(holidayValues.policy_id)
                closeDrawer()
            }else{
                showToast('No Data Found', 'error')
            }

            // console.log('resposne google form', response)
        } catch(error){
            if (error.name === 'ValidationError') {
                // Validation error from form data
                showToast(error.message, 'error');

            } else {
                // Other errors (e.g., network error, API error response)
                console.log(error)
            }
        }finally{
            setHolidayValues((prevState)=>({
                ...prevState,
                loading: false
            }))
        }

    }
    
    const validateFormData = async (formData) => {
        const fields = Object.keys(formData);

        for (const field of fields) {
            try {
                await validateGoogleHoliday.validateAt(field, formData);
            } catch (error) {
                throw error; // Throw the first validation error encountered
            }
        }
    };



    // OLD (incoming branch):
    // return { leavesPlannerTitles, allLeavesGroup, getLeavesList, getPaidLeavesConfig, addLeaveGroupDrawer, leavesBranches, getAllDepartmentsLeaves, isLoading, handleMountLeave, mountLeave,
    return { leavesPlannerTitles, allLeavesGroup, leavesGroupTableLoading, getLeavesList, getPaidLeavesConfig, addLeaveGroupDrawer, leavesBranches, getAllDepartmentsLeaves, isLoading, handleMountLeave, mountLeave,
        addGroupValues, handleLeaveBranch, handleLeave, addNewLeaveGroup, handleLeaveView, allViewLeave, viewLeavesLoading, getViewLeavesList, handleLeavesChange, leavesSearch, openMenu, toggleMenuLeaves,
        leavesNoticesItems, handleMenuItemsLeaves, openDialogLeaves, handleDeleteLeavesDialog, handleDeleteGroups, handleDeleteLeaves, viewId, handleDeleteSpecificLeaves,
        openDialogSpecific, addDefineLeave, addLeaveTypeValues, handleLeaveTypesValue, handleSelectChangeMonth, addDefineLeaveType, handleLeaveTypeSearch, handleChangeToggle, type,
        policiesList, googleCalenderHolidays, holidayValues, allCountries,setAddGroupValues,getDropdownPosition,triggerRefs,selectBranchHandler,UpdateLeaveGroup, importEmpLeaves, handleSelectChangeBranch, paidLeaveValues, 
        gettingCountries, countriesGoogleForm, branchesGoogleForm, googleFormsLoading, leavesBranchesLoading, googleFormPoliciesLoading, handleGoogleHoliday, handleSelectChange,
        googleHolidays,
        showGoogleForm,
        handleGoogleModal,
        getAllLeaveGroupsForPolicy,
        isDeletingGroup,
        isDeletingSpecificLeave,
        isSubmittingGoogleForm,
        setIsSubmittingGoogleForm

    }
}

export default useLeavesPlanner
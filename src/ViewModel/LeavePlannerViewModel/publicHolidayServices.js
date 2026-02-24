import { useCallback, useEffect, useState } from "react";
import { getAllMonths } from "../../services/__appServicesData";
import { getPoliciesListFrequentByBranchId, gettingBranchesFrequentHit } from "../../services/__frequentApiServices";
import leavesPlannerApi from "../../Model/Data/LeavesPlanner/LeavesPlanner";
import { showToast } from "../../Components/Toaster/Toaster";

const usePublicHolidayServices = ()=>{
    const months = getAllMonths()
    const currentMonthIndex = new Date().getMonth();
    const currentYearIndex = new Date().getFullYear();
    const updateMonth = months[currentMonthIndex]
    let date  = new Date()

    const [publicHolidayValue, setPublicHolidayValue] = useState({
        currentDate:getCurrentMonthObject(new Date()),
        daysArray:generateDays(date.getFullYear(), date.getMonth()),
        month:{value:updateMonth.id, label:updateMonth.title},
        year:{value:currentYearIndex, label:currentYearIndex},
        chartData:[],
        branchesList:[],
        branchId:{ value: 0, label: 'All Branches' },
        policyList:[],
        policyId:null,
        selectedPolicy:[],
        attendanceAttr:[],
    })

    const [showSingleHoliday, setShowSingleHoliday] = useState({
        showHoliday:false,
        assignHoliday:false,
        data:{},
        loading:false
    })

    function getCurrentMonthObject(currentDate){
        // Get the month index (0-11)
        const monthIndex = currentDate.getMonth(); 

        // Array of month names
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        // Create the desired object
        return {
            value: monthIndex + 1,
            label: monthNames[monthIndex]
        };
    };

    function generateDays(year, month) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
      
        let daysArray = [];
      
        // Fill in blank spaces for days of the previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
          daysArray.push(null);
        }
      
        // Fill in the days of the current month
        for (let i = 1; i <= daysInMonth; i++) {
          daysArray.push(i);
        }
      
        return daysArray;
    }

     const handleNextMonth = () => {
        const currentMonth = publicHolidayValue.month.value - 1;
        const currentYear = publicHolidayValue.year.value;
        
        // Create a new Date object to handle month/year calculation
        const nextMonthDate = new Date(currentYear, currentMonth + 1);
        
        const newMonth = nextMonthDate.getMonth();
        const newYear = nextMonthDate.getFullYear();

        // Get the updated month object (assuming `getAllMonths()` is the function that returns month info)
        const updatedMonth = months.find((m) => m.id === newMonth + 1);

        setPublicHolidayValue((prevState) => ({
            ...prevState,
            month: { value: newMonth + 1, label: updatedMonth.title },
            year: { value: newYear, label: newYear },
            daysArray:generateDays(newYear, newMonth)
        }));
    };
    
    const handlePreviousMonth = () => {
        const currentMonth = publicHolidayValue.month.value - 1;
        const currentYear = publicHolidayValue.year.value;

        // Create a new Date object to handle month/year calculation
        const prevMonthDate = new Date(currentYear, currentMonth - 1);
        
        const newMonth = prevMonthDate.getMonth();
        const newYear = prevMonthDate.getFullYear();

        // Get the updated month object (assuming `getAllMonths()` is the function that returns month info)
        const updatedMonth = months.find((m) => m.id === newMonth + 1);
        setPublicHolidayValue((prevState) => ({
            ...prevState,
            month: { value: newMonth + 1, label: updatedMonth.title },
            year: { value: newYear, label: newYear },
            daysArray:generateDays(newYear, newMonth)
        }));
        
    };

    const gettingBranchesForLeavePlanner = async()=>{
        try{
            const response = await gettingBranchesFrequentHit()
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                const dbData = responseData.DB_DATA.branches

                setPublicHolidayValue((prevState)=>({
                    ...prevState,
                    branchesList:dbData
                }))
                
                // Since "All Branches" is selected by default, load all policies
                setTimeout(() => {
                    gettingAllPoliciesForAllBranches(dbData)
                }, 100)
            }else{
                setPublicHolidayValue((prevState)=>({
                    ...prevState,
                    branchesList:[]
                }))
            }
        }catch(err){
            console.log('err', err)
        }
    }

    const handleSelectLeavePlanner = (selected, field)=>{
        if(field === 'branchId'){
            setPublicHolidayValue((prevState)=>({
                ...prevState,
                [field]: selected,
                policyId:null,
                selectedPolicy:[]
            }))
            
            // If "All Branches" is selected, get all policies from all branches
            if(selected.value === 0){
                gettingAllPoliciesForAllBranches(publicHolidayValue.branchesList)
            } else {
                gettingHRPolicyLeavePlanner(selected.value)
            }
        }else{
            setPublicHolidayValue((prevState) => {
                const isAlreadySelected = prevState.selectedPolicy.some(
                    (policy) => policy.value === selected.value
                );

                if (isAlreadySelected) {
                    showToast("Policy is already in the list.", 'error');
                    return prevState;
                }

                return {
                    ...prevState,
                    [field]: selected,
                    selectedPolicy: [...prevState.selectedPolicy, selected],
                };
            });
        }
    }

    const gettingHRPolicyLeavePlanner = async(id)=>{
        try {
            const response = await getPoliciesListFrequentByBranchId(id)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                const dbData = responseData.DB_DATA.policies || []
                if(dbData.length === 0){
                    showToast('No HR policies found for this branch', 'info')
                }
                setPublicHolidayValue((prevState)=>({
                    ...prevState,
                    policyList:dbData
                }))
            }else{
                setPublicHolidayValue((prevState)=>({
                    ...prevState,
                    policyList:[]
                }))
            }
        } catch (error) {
            console.log('Error fetching policies:', error)
            setPublicHolidayValue((prevState)=>({
                ...prevState,
                policyList:[]
            }))
        }
    }

    const gettingAllPoliciesForAllBranches = async(branches = null)=>{
        try {
            // Get policies from all branches
            // Instead of looping through all branches which causes multiple API calls,
            // we call the API once with branch_id = 0 to fetch all policies
            const response = await getPoliciesListFrequentByBranchId(0)
            const responseData = response.data
            
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                const policies = responseData.DB_DATA.policies || []
                
                // Remove duplicates based on policy id
                const uniquePolicies = policies.filter((policy, index, self) => 
                    index === self.findIndex(p => p.id === policy.id)
                )
                
                setPublicHolidayValue((prevState)=>({
                    ...prevState,
                    policyList: uniquePolicies
                }))
            } else {
                setPublicHolidayValue((prevState)=>({
                    ...prevState,
                    policyList:[]
                }))
            }

        } catch (error) {
            setPublicHolidayValue((prevState)=>({
                ...prevState,
                policyList:[]
            }))
        }
    }

    useEffect(()=>{
        if(publicHolidayValue.branchId){
            gettingPublicHoliday()
        }
    },[publicHolidayValue.branchId, publicHolidayValue.policyId])

    const gettingPublicHoliday = async()=>{
        const branchVal = publicHolidayValue.branchId?.value;
        const policyVal = publicHolidayValue.policyId?.value;
        const apiData = {
           branch: (branchVal === 'all' || branchVal === 0) ? 0 : (branchVal ?? 0),
           policy_id: (policyVal === 'all' || policyVal === 0) ? 0 : (policyVal ?? 0),
        }

        try {
            const response = await leavesPlannerApi.getPublicHoliday(apiData)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                setPublicHolidayValue((prevState)=>({
                    ...prevState,
                    attendanceAttr:responseData.DB_DATA
                }))
            }
        } catch (error) {
            console.error('Error fetching holidays:', error)
        }
    }

    const today = new Date();
    const todayFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const [addPublicHolidaysValue, setAddPublicHolidaysValue] = useState({
        description:'',
        start_date:todayFormatted,
        end_date:todayFormatted,
        loading:false
    })
    const handleSingleDayPublicHoliday = (data, holiday)=>{
        const {branchId} = publicHolidayValue
        if(branchId){
            
            if(data){
                setShowSingleHoliday((prevState)=>({
                    ...prevState,
                    showHoliday:true,
                    assignHoliday:false,
                    data:data,
                    loading:false
                }))
            }else{
                const { day, currentMonth, currentYear } = holiday;
                const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                setShowSingleHoliday((prevState) => ({
                    ...prevState,
                    showHoliday: false,
                    assignHoliday: true,
                    data: data,
                    loading: false,
                }));
                setAddPublicHolidaysValue((prevState) => ({
                    ...prevState,
                    start_date: formattedDate,
                    end_date: formattedDate,
                }));
                
            }
        }else{
            showToast('Select Branch', 'error')
        } 
    }

    const toggleHandleSingleDayPublicHoliday=()=>{
        setShowSingleHoliday((prevState)=>({
            ...prevState,
            showHoliday:false,
            assignHoliday:false,
            data:{},
            loading:false
        }))
        setAddPublicHolidaysValue((prevState)=>({
            ...prevState,
            description:'',
            loading:false
        }))
    }

    const handleRemovePolicyList = (data)=>{
        setPublicHolidayValue((prevState)=>({
            ...prevState,
            selectedPolicy:prevState.selectedPolicy.filter((ele)=> ele.value !== data.value)
        }))

        
    }

    useEffect(()=>{
        findingLastObjectPolicy()
    },[publicHolidayValue.selectedPolicy])

    const findingLastObjectPolicy = ()=>{
        const {branchId} = publicHolidayValue 
        const findLastPolciy = publicHolidayValue?.selectedPolicy.at(-1)
        if(findLastPolciy){
            setPublicHolidayValue((prevState)=>({
                ...prevState,
                policyId:findLastPolciy
            }))
        }else{
            setPublicHolidayValue((prevState)=>({
                ...prevState,
                policyId:null,
                branchId:branchId
            }))
        }
    }

    const handleRemovePublicHoliday = async(id) => {
        const apiData = {
            id:id
        }
        setShowSingleHoliday((prevState)=>({
            ...prevState,
            loading:true
        }))
        try {
            const response = await leavesPlannerApi.removePublicHoliday(apiData)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS ==="SUCCESSFUL"){
                showToast("Public holiday removed successfully.", 'success');
                setPublicHolidayValue((prevState)=>({
                    ...prevState,
                    attendanceAttr: prevState.attendanceAttr.filter((ele)=> ele.id !== id)
                }))
                toggleHandleSingleDayPublicHoliday()
            }
        } catch (error) {
            console.error('err', error)
        }finally{
            setShowSingleHoliday((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
    };

    


    const handleChangeAddPublicHoliday = (e)=>{
        const {name, value} = e.target
        setAddPublicHolidaysValue((prevState)=>({
            ...prevState,
            [name]: value
        }))
    }



  
    const handleAddPublicHoliday = async(e)=>{
        e.preventDefault()
        const {description, start_date, end_date} = addPublicHolidaysValue
        const {branchId, selectedPolicy} = publicHolidayValue
        const apiData = {
            description:description,
            branch: (branchId.value === 'all' || branchId.value === 0) ? 0 : branchId.value,
            selected_policy_ids: selectedPolicy.length > 0 ? selectedPolicy.map((ele)=> (ele.value === 'all' || ele.value === 0) ? 0 : ele.value) : [0],
            start_date: start_date,
            end_date: end_date
        }

        if(description === ''){
            showToast('Description is required', 'error')
            return
        }else{
            setAddPublicHolidaysValue((prevState)=>({
                ...prevState,
                loading:true
            }))
            try {
                const response = await leavesPlannerApi.addPublicHoliday(apiData)
                const responseData = response.data
                if(response.status === 200 && responseData.message === "ok"){
                    toggleHandleSingleDayPublicHoliday()
                    showToast('Holiday Added Successfully', 'success')
                    gettingPublicHoliday()

                }else{
                    const error = responseData.ERROR_DESCRIPTION
                    showToast(error, 'error')
                }
            } catch (error) {
                showToast(error, 'error')
            }finally{
                setAddPublicHolidaysValue((prevState)=>({
                    ...prevState,
                    loading:false
                }))
            }
        } 
    }



    return {
        publicHolidayValue,handleNextMonth,handlePreviousMonth,
        gettingBranchesForLeavePlanner,
        handleSelectLeavePlanner,
        handleSingleDayPublicHoliday,
        toggleHandleSingleDayPublicHoliday,
        showSingleHoliday,
        handleRemovePolicyList,
        handleRemovePublicHoliday,
        addPublicHolidaysValue,
        handleChangeAddPublicHoliday,
        handleAddPublicHoliday
    }

}



export default usePublicHolidayServices
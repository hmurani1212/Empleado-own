import { useState, useCallback } from "react"
import performanceApi from "../../Model/Data/Performance/Performance"
import useStore from "../../Store/store"
import { validateInput } from "../../Validation/CustomValidation"
import { showToast } from "../../Components/Toaster/Toaster"
import { useNavigate } from "react-router"
import { getPerformance } from "../../services/__performanceServices"
import { unixToDMY } from "../../services/__dateTimeServices"
import { formatTimestampToDate } from '../../services/__dateTimeServices'
import { useDebounce } from "../../services/__debounceServices"


const useGoalServices = ()=>{

    const gettingGoals = useStore((state)=> state.gettingGoals)
    const goalsData = useStore((state)=> state.goalsData)
    const addNewGoal = useStore((state)=> state.addNewGoal)
    const updateGoalSummaryByEmployee = useStore((state)=> state.updateGoalSummaryByEmployee)
    const updateGoal = useStore((state)=> state.updateGoal)
    const gettingSubGoals = useStore((state)=> state.gettingSubGoals)
    const subGoalsData = useStore((state)=> state.subGoalsData)
    const deleteSingleGoal = useStore((state)=> state.deleteSingleGoal)
    const goalsLoading = useStore((state) => state.goalsLoading)
    const subGoalsLoading = useStore((state) => state.subGoalsLoading)
    
    // New employee goals functions
    const gettingGoalsByEmployeeId = useStore((state)=> state.gettingGoalsByEmployeeId)
    const gettingNextEmployeeGoals = useStore((state)=> state.gettingNextEmployeeGoals)
    const clearEmployeeGoals = useStore((state)=> state.clearEmployeeGoals)
    const refreshEmployeeGoals = useStore((state)=> state.refreshEmployeeGoals)
    const employeeGoalsData = useStore((state)=> state.employeeGoalsData)
    const employeeGoalsNext = useStore((state)=> state.employeeGoalsNext)
    const currentEmployeeId = useStore((state)=> state.currentEmployeeId)
    
    const navigate = useNavigate()

    const [openMenuValue, setOpenMenuValue] = useState({});
    const toggleMenuValue = (index, isOpen) => {
        setOpenMenuValue((prevOpenMenu) => ({
            ...prevOpenMenu,
            [index]: isOpen
        }))
    }







    const [goalsValue, setGoalsValue] = useState({
        performance:[],
        performance_id:null,
        id:'',
        show:false,
        loading:false,
        searchText:'',
        searchLoading:false
    })

     const [addGoalValue, setAddGoalValue]=useState({
        show:false,
        update:false, 
        pID:null,
        employees:[],
        employee_id:null,
        goal_name:'',
        start_date:'',
        end_date:'',
        description:'',
        priority:null,
        selectedEmp:[],
        loading:false,
        goal_id:''


    })


    const handleSelectGoals = (select, field)=>{
        if(field === 'performance_id'){
            setGoalsValue((prevState)=>({
                ...prevState,
                [field]:select
            }))
            // If "All" is selected (value is null), pass null to get all goals
            // Otherwise, pass the selected performance review name (label) instead of ID
            gettingGoals(select.value ? select.label : null)
        }
        if(field === 'pID'){
            setAddGoalValue((prevState)=>({
                ...prevState,
                [field]:select
            }))
            gettingEmp(select.label) // Pass the name instead of ID
        }
        if(field === 'employee_id'){
                const filterData = addGoalValue.selectedEmp?.find((ele) => ele.value === select.value);
                

                // Check if value is 0 and if there are other selected employees
                const isZeroSelected = addGoalValue.selectedEmp?.some((ele) => ele.value == 0);
                
                if (select.value == 0 && addGoalValue.selectedEmp.length > 0) {
                    // If 0 is selected and there are other items in the array
                    showToast('Please remove other employees before adding "All Employees"', 'error');
                } else if (isZeroSelected && select.value !== 0) {
                    // If 0 is already in the array, prevent adding other employees
                    showToast('Please remove "All Employees" before selecting other employees', 'error');
                } else if (filterData) {
                    // If the selected employee is already in the list
                    showToast('Employee Already in Selected Employee List', 'error');
                } else {
                    // Add the selected employee to the array
                    setAddGoalValue((prevState) => ({
                        ...prevState,
                        selectedEmp: [...prevState.selectedEmp, select]
                    }));
                    showToast('Employee Added', 'success');
                }
        }
        else{
            setAddGoalValue((prevState)=>({
                ...prevState,
                [field]:select
            }))
        }
    }


    const gettingPRCSelect = useCallback(async()=>{
        try {
            const response = await performanceApi.getPRCForSelect()
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                // console.log('response',response)
                setGoalsValue((prevState)=>({
                    ...prevState,
                    performance:responseData.DB_DATA,
                    performance_id:{value: null, label: 'All'} // Set to "All" initially
                }))
                // Load all goals initially (pass null)
                gettingGoals(null)
            }
        } catch (error) {
            console.log(error)
        }
    }, [gettingGoals])

    // Search goals function
    const searchGoals = async (searchText) => {
        if (!searchText.trim()) {
            // If search is empty, get all goals
            gettingGoals(null);
            return;
        }

        try {
            setGoalsValue((prevState) => ({
                ...prevState,
                searchLoading: true
            }));

            // Use the modified gettingGoals function with search text
            gettingGoals(null, searchText);
            
        } catch (error) {
            console.log("Error searching goals:", error);
            showToast("Error searching goals", "error");
        } finally {
            setGoalsValue((prevState) => ({
                ...prevState,
                searchLoading: false
            }));
        }
    };

    // Debounced search function
    const debouncedSearchGoals = useDebounce(searchGoals, 500);

    const handleGoalsSearch = (e) => {
        const searchText = e.target.value;
        setGoalsValue((prevState) => ({
            ...prevState,
            searchText: searchText
        }));
        
        // Trigger debounced search
        debouncedSearchGoals(searchText);
    };

    const gettingEmp = async(name)=>{
        try{
            const response = await performanceApi.getEmpGoal(name)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                const dbData = responseData.DB_DATA
                // Handle new response structure - array of objects with employee_id and employee_name
                const combinedArray = dbData?.map((emp) => ({
                    value: emp.employee_id,
                    label: emp.employee_name
                })) || [];
                
                setAddGoalValue((prevState)=>({
                    ...prevState,
                    employees:[{value:0, label:'All Employee'}, ...combinedArray]

                }))   
            }
        }catch(err){
            console.log(err)
        }
    }


   



    const handleAddGoal = ()=>{
        setAddGoalValue((prevState)=>({
            ...prevState,
            show:true,
            pID:null,
            employees:[],
            employee_id:null,
            goal_name:'',
            start_date:'',
            end_date:'',
            description:'',
            priority:null,
            selectedEmp:[]
        }))
    }



    
    
    const toggleAddGoal = ()=>{
        
        setAddGoalValue((prevState)=>({
            ...prevState,
            show:false
        }))
    }



    const handleChangeAddGoal = (e)=>{
        const {name, value} = e.target
        setAddGoalValue((prevState)=>({
            ...prevState,
            [name]: value
        }))

    }


    const validateAddGoalForm = ()=>{
        const {goal_name, start_date, end_date, pID, selectedEmp, priority} = addGoalValue
        const nameValidation = validateInput('Goal Name', goal_name)
        if(!nameValidation.isValid){
            return { isValid: false, message: nameValidation.message}
        }        
        if(pID === null){
            return { isValid:false, message:"Select Performance"}
        }
        if(start_date === ''){
            return { isValid:false, message:"Select Start Date"}
             
        }
        if(end_date === ''){
            return { isValid:false, message:"Select End Date"}
        }
        if(selectedEmp.length == 0){
            return { isValid:false, message:"Select at least one Employee"}
        }
        if(priority === null){
            return { isValid:false, message:"Select Priority"}

        }

       

        return {isValid: true, message:''}
    }


    const handleRemoveEmp = (data)=>{
        setAddGoalValue((prevState)=>({
            ...prevState,
            selectedEmp: prevState.selectedEmp.filter((ele)=> ele.value !== data.value)
        }))
    }


    const getValue = (val) => (typeof val === 'object' && val !== null ? val.value : val);


    const handleNewGoal = async(e)=>{
        e.preventDefault()
        const validation =  validateAddGoalForm()
        if(!validation.isValid){
            showToast(validation.message, 'error');
            return
        }
        const {goal_name, description, start_date, end_date, priority,selectedEmp, pID, goal_id} = addGoalValue
        
        // Get review cycle name (label) instead of ID (value)
        const reviewCycleName = pID?.label || pID?.name || (typeof pID === 'object' && pID !== null ? null : pID);
        
        // If pID is an object but doesn't have label, try to get it from the value
        let finalReviewCycleName = reviewCycleName;
        if (!finalReviewCycleName && pID && typeof pID === 'object') {
            // If we only have the value (ID), we can't convert it to name here
            // This should not happen if the form is working correctly
            console.warn('Review cycle name not found in pID object:', pID);
            finalReviewCycleName = pID.value; // Fallback to value, but log warning
        }
        
        console.log('Review cycle info:', { pID, reviewCycleName: finalReviewCycleName });
        
        const apiData = {
            title:goal_name,
            description:description,
            start_period:start_date,
            end_period:end_date,
            priority:priority?.label,
            assigned_to:selectedEmp.map((ele)=> ele.label),
            employee:selectedEmp.map((ele)=> ele.value.toString()),
            review_cycle:finalReviewCycleName // Send name instead of ID
        }

        const updateApiData = {
            Goal_id: goal_id,
            name: goal_name,
            review_cycle: finalReviewCycleName, // Send name instead of ID
            startDate: start_date,
            endDate: end_date,
            descriptions: description,
            employee_id: selectedEmp[0]?.value,
            employee_name: selectedEmp[0]?.label,
            priority: priority?.label
        }

        console.log('updateApiData', updateApiData)

        setAddGoalValue((prevState)=>({
            ...prevState,
            loading:true
        }))

        try{


            if(addGoalValue.update){
                const response = await performanceApi.updateSubGoal(updateApiData)
                const responseData = response.data
                console.log('Update goal response:', responseData)
                if(responseData.STATUS === "SUCCESSFUL"){
                    showToast('Goal updated successfully', 'success')
                    toggleAddGoal()
                    
                    // Refresh the employee goals data
                    if (currentEmployeeId) {
                        refreshEmployeeGoals(currentEmployeeId)
                    }
                }
            }else{

                const response = await performanceApi.createGoal(apiData)
                const responseData = response.data
                console.log('Goal creation response222222222:', responseData);
                
                if( responseData.STATUS === "SUCCESSFUL"){
                    
                    // Handle the new response format that includes goal summary by employee
                    // The backend now returns an array of employee goal summaries instead of a single goal object
                    // This allows us to update the goals list with the latest counts for each employee
                    if (responseData.DB_DATA && Array.isArray(responseData.DB_DATA)) {
                        // This is the new format with goal summary by employee
                        console.log('Using new goal summary format:', responseData.DB_DATA);
                        updateGoalSummaryByEmployee(responseData.DB_DATA)
                        showToast('Goal added successfully', 'success')
                    } else {
                        // Fallback to old format if needed
                        console.log('Using fallback format:', responseData.DB_DATA);
                        addNewGoal(responseData.DB_DATA)
                        showToast('Goal added successfully', 'success')
                    }
                    toggleAddGoal()
                    
                }
            }
            

        }catch(err){
            const error = err.response.data.ERROR_DESCRIPTION
            showToast(error, 'error')
        }finally{
            setAddGoalValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
        
    }



    const handleSubGoals=(data)=>{
        navigate(`/performance/goals/sub-goals`)
        gettingSubGoals(data)
    }

    // New function to handle viewing employee goals
    const handleViewEmployeeGoals = (employeeId, employeeName) => {
        console.log('Viewing goals for employee:', employeeId, employeeName)
        console.log('Fetching employee goals from API...')
        gettingGoalsByEmployeeId(employeeId)
        // You can navigate to a specific route for employee goals if needed
        // navigate(`/performance/goals/employee/${employeeId}`)
    }

    const handleLoadMoreEmployeeGoals = () => {
        if (employeeGoalsNext) {
            gettingNextEmployeeGoals()
        }
    }


    const handleSubGoalList = async(data, menuItem)=>{
        // console.log('data', data)
        switch (menuItem.id) {
            case 2:
                gettingSingleGoal(data._id)
                gettingEmp(data.review_cycle)
                const allPerfomance = await getPerformance()
                const performanceData = allPerfomance.data
                if(allPerfomance.status === 200 && performanceData.STATUS === "SUCCESSFUL"){
                    const dbData = performanceData.DB_DATA
                    setAddGoalValue((prevState)=>({
                        ...prevState,
                        update:true,
                        show:true,
                        
                        

                    }))
                    setGoalsValue((prevState)=>({
                        ...prevState,
                        performance:dbData,
                        
                    }))

                    
                }

            break;
            case 3:
                setGoalsValue((prevState)=>({
                    ...prevState,
                    show:true,
                    id:data._id,
                }))
                break;
        
            default:
                break;
        
        }   
    }


    const gettingSingleGoal = async(id)=>{
        try {
            const response = await performanceApi.getSingleGoal(id)
            // console.log('response', response)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                const data = responseData.DB_DATA
                setAddGoalValue((prevState)=>({
                    ...prevState,
                    pID:data.review_cycle,
                    goal_id:data._id,
                    goal_name:data?.title,
                    selectedEmp:data?.assigned_to?.map((label, index) => ({
                        value: data.employee[index],
                        label: label
                    })),
                    priority:{value:data.priority, label:data.priority},
                    start_date:unixToDMY(data.start_period),
                    end_date:unixToDMY(data.end_period),
                    description:data?.description
                }))
            }
        } catch (error) {
            
        }
    }


    const handleToggleSubGoalDelete = ()=>{
        setGoalsValue((prevState)=>({
            ...prevState,
            show:false,
            id:''
        }))
    }

// 

    const deleteSubGoal = async()=>{
        setGoalsValue((prevState)=>({
                ...prevState,
                loading:true,
            }))
        try{
            const response  = await performanceApi.deleteSubGoal(goalsValue.id)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                handleToggleSubGoalDelete()
                showToast('Goal Delete Successfully', 'success')
                deleteSingleGoal(goalsValue.id)
            }
        }catch(err){
            const error = err.response.data.ERROR_DESCRIPTION
            showToast(error, 'error')
        }finally{
            setGoalsValue((prevState)=>({
                ...prevState,
                loading:false,
            }))
        }
    }

    // New function to delete a goal from employee goals view
    const deleteEmployeeGoal = async (goalId) => {
        console.log('Deleting goal with ID:', goalId)
        try {
            const response = await performanceApi.deleteSubGoal(goalId)
            const responseData = response.data
            console.log('Delete goal response:', responseData)
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                showToast('Goal deleted successfully', 'success')
                // Refresh the employee goals data by calling the API again
                if (currentEmployeeId) {
                    console.log('Refreshing employee goals for ID:', currentEmployeeId)
                    refreshEmployeeGoals(currentEmployeeId)
                }
                return true
            }
        } catch (err) {
            console.error('Error deleting goal:', err)
            const error = err.response?.data?.ERROR_DESCRIPTION || 'Failed to delete goal'
            showToast(error, 'error')
            throw err
        }
    }

    // Function to handle editing a goal
    const handleEditGoal = async (goal) => {
        console.log('Editing goal:', goal)
        
        // Set the add goal modal to edit mode
        setAddGoalValue((prevState) => ({
            ...prevState,
            show: true,
            update: true,
            goal_id: goal._id,
            goal_name: goal.name,
            description: goal.descriptions,
            start_date: formatTimestampToDate(goal.startDate),
            end_date: formatTimestampToDate(goal.endDate),
            priority: { value: goal.priority, label: goal.priority },
            selectedEmp: [{ value: goal.employee_id, label: goal.employee_name }],
            pID: { value: goal.review_cycle, label: goal.review_cycle }
        }))
    }

    // Function to handle goal update
    const handleUpdateGoal = async (goalData) => {
        console.log('Updating goal with data:', goalData)
        
        // Get review cycle name (label) instead of ID (value)
        const reviewCycleName = goalData.pID?.label || goalData.pID?.name || goalData.pID?.value;
        console.log('Update - Review cycle name:', reviewCycleName);
        
        const updateApiData = {
            Goal_id: goalData.goal_id,
            name: goalData.goal_name,
            review_cycle: reviewCycleName, // Send name instead of ID
            startDate: goalData.start_date,
            endDate: goalData.end_date,
            descriptions: goalData.description,
            employee_id: goalData.selectedEmp[0].value,
            employee_name: goalData.selectedEmp[0].label,
            priority: goalData.priority.label
        }

        console.log('Update API data:', updateApiData)

        try {
            const response = await performanceApi.updateSubGoal(updateApiData)
            const responseData = response.data
            console.log('Update goal response:', responseData)
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                showToast('Goal updated successfully', 'success')
                toggleAddGoal()
                
                // Refresh the employee goals data
                if (currentEmployeeId) {
                    refreshEmployeeGoals(currentEmployeeId)
                }
                return true
            }
        } catch (err) {
            console.error('Error updating goal:', err)
            const error = err.response?.data?.ERROR_DESCRIPTION || 'Failed to update goal'
            showToast(error, 'error')
            throw err
        }
    }

    // Function to handle viewing a goal
    const handleViewGoal = async (goal) => {
        console.log('Viewing goal:', goal)
        
        try {
            const response = await performanceApi.getGoalById(goal._id)
            const responseData = response.data
            console.log('View goal response:', responseData)
            
            if (responseData.STATUS === "SUCCESSFUL") {
                const goalData = responseData.DB_DATA
                
                // Use rating from the original goal object if available, otherwise use API response
                // This ensures we get the correct rating from the list data
                const rating = goal?.rating !== undefined && goal?.rating !== null 
                    ? goal.rating 
                    : (goalData.rating !== undefined && goalData.rating !== null ? goalData.rating : 0)
                
                console.log('Rating from goal object:', goal?.rating, 'Rating from API:', goalData.rating, 'Final rating:', rating)
                
                // Set the add goal modal to view mode with fetched data
                setAddGoalValue((prevState) => ({
                    ...prevState,
                    show: true,
                    update: false, // Set to false for view mode
                    view: true, // Add view mode flag
                    goal_id: goalData._id,
                    goal_name: goalData.name || '',
                    description: goalData.descriptions || '',
                    start_date: goalData.startDate ? formatTimestampToDate(goalData.startDate) : '',
                    end_date: goalData.endDate ? formatTimestampToDate(goalData.endDate) : '',
                    priority: goalData.priority 
                        ? { value: goalData.priority, label: goalData.priority }
                        : null,
                    selectedEmp: goalData.employee_id && goalData.employee_name
                        ? [{ value: goalData.employee_id, label: goalData.employee_name }]
                        : [],
                    pID: goalData.review_cycle 
                        ? { value: goalData.review_cycle._id, label: goalData.review_cycle.name }
                        : null,
                    // Additional data for view mode
                    progress: goalData.progress || 0,
                    score: goalData.score || 0,
                    status: goalData.status || '0',
                    comment: goalData.comment || '',
                    rating: rating, // Use the correctly resolved rating
                    createdAt: goalData.createdAt
                }))
            }
        } catch (err) {
            console.error('Error fetching goal details:', err)
            const error = err.response?.data?.ERROR_DESCRIPTION || 'Failed to fetch goal details'
            showToast(error, 'error')
        }
    }




    



    return { 
        gettingPRCSelect, 
        goalsValue, 
        handleSelectGoals,
        goalsData , 
        handleAddGoal, 
        addGoalValue,
        setAddGoalValue,
        handleChangeAddGoal,
        handleNewGoal,
        handleRemoveEmp,
        toggleAddGoal,
        gettingEmp,
        handleSubGoals,
        handleSubGoalList,
        handleToggleSubGoalDelete,
        deleteSubGoal,
        deleteEmployeeGoal,
        handleEditGoal,
        handleUpdateGoal,
        handleViewGoal,
        handleViewEmployeeGoals,
        handleLoadMoreEmployeeGoals,
        // New employee goals data
        employeeGoalsData,
        employeeGoalsNext,
        currentEmployeeId,
        clearEmployeeGoals,
        // Search functionality
        gettingGoals,
        handleGoalsSearch,
        searchGoals,
        goalsLoading,
        subGoalsLoading
    }
    
}



export default useGoalServices
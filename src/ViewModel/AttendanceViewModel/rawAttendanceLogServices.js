import { useState } from "react"
import { showToast } from "../../Components/Toaster/Toaster"
import attendanceApi from "../../Model/Data/Attendance/Attendance"
import { useDebounce } from "../../services/__debounceServices"
import { getRawAttendanceLogs } from "../../services/__attendanceServices"
import useStore from "../../Store/store"

const useRawAttendanceLog = ()=>{

    // Employee store functions
    const Get_All_Employeefn = useStore((state)=> state.Get_All_Employeefn)
    const Get_All_Employee = useStore((state)=> state.Get_All_Employee)
    const setRawAttendanceLogParams = useStore((state)=> state.setRawAttendanceLogParams)

    const [rawAttendanceValue, setRawAttendanceValue] = useState({
        show:false, 
        empId:null,
        month:null,
        year:null,
        empList:[],
        rawAttendanceData:[],
        loading:false,
    })

    const [loading, setLoading] = useState(false)



    const toggleRawAttendance = ()=>{
        setRawAttendanceValue((prevState)=>({
            ...prevState,
            show:false
        }))
    }



    const handleRawAttendanceLog = async(data)=>{
        setLoading(true)
        // Validate employee selection first
        if(!data.empId || data.empId === null || !data.empId.value){
            showToast('Please select employee', 'error')
            return
        }

        // Load employees when opening drawer
        await loadEmployees()

        // Store params in store for route access
        setRawAttendanceLogParams({ empId: data.empId, month: data.month, year: data.year })

        // Set initial state and open drawer
        setRawAttendanceValue((prevState)=>({
            ...prevState,
            empId:data.empId,
            month:data.month,
            year:data.year,
            show:true,
        }))

        // Fetch data automatically
        const apiData= {
            empId: data.empId.value,
            month:data.month.value,
            year:data.year.value
        }

        try{
            const response = await getRawAttendanceLogs(apiData)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESS"){
                setRawAttendanceValue((prevState)=>({
                    ...prevState,
                    rawAttendanceData:responseData.DB_DATA

                }))
            }else{
                showToast('No Record Found', 'error')
                setRawAttendanceValue((prevState)=>({
                    ...prevState,
                    rawAttendanceData:[]

                }))

            }
        }catch(err){
            showToast('Failed to fetch raw attendance logs', 'error')
            setRawAttendanceValue((prevState)=>({
                ...prevState,
                rawAttendanceData:[]
            }))
        }finally{
            setLoading(false)
        }
    }

    // Load employees function
    const loadEmployees = async() => {
        try {
            // Ensure we have employee data loaded
            if (!Get_All_Employee || Get_All_Employee.length === 0) {
                await Get_All_Employeefn();
            }

            // Set all employees initially
            setRawAttendanceValue((prevState)=>({
                ...prevState,
                empList: Get_All_Employee || []
            }))
        } catch(err) {
            showToast('Error loading employees', 'error')
        }
    }

    const handleSearchEmpRaw = (value, actionMeta)=>{
        if (actionMeta.action === 'input-change') {
            debounceEmpList(value)
        }
    }



    const debounceEmpList = useDebounce(async(value) => {
        
        const apiData = {
            search:value ,
            emp_status :'active'
        }
        await getEmpSuggestedList(apiData)
       
    }, 500); // 500ms debounce time



    const getEmpSuggestedList  = async(data)=>{
        try{
            // First, ensure we have employee data loaded
            if (!Get_All_Employee || Get_All_Employee.length === 0) {
                await Get_All_Employeefn();
            }

            // Filter employees based on search term and active status
            let filteredEmployees = Get_All_Employee || [];
            
            if (data.search && data.search.trim() !== '') {
                filteredEmployees = filteredEmployees.filter(emp => 
                    emp.name && emp.name.toLowerCase().includes(data.search.toLowerCase())
                );
            }
            
            // Filter by active status if specified
            if (data.emp_status === 'active') {
                filteredEmployees = filteredEmployees.filter(emp => 
                    emp.status === 1 || emp.status === 'active'
                );
            }

            setRawAttendanceValue((prevState)=>({
                ...prevState,
                empList: filteredEmployees
            }))

        }catch(err){
            showToast('Error fetching employees', 'error')
        }
    }


    const handleSelectRawAttendance = (select, field)=>{
        setRawAttendanceValue((prevState)=>({
            ...prevState,
            [field]: select
        }))
    }


    const getRawAttendance = async()=>{
        if(!rawAttendanceValue.empId || rawAttendanceValue.empId === null || !rawAttendanceValue.empId.value){
            showToast('Please select employee', 'error')
            return
        }

        const apiData= {
            empId: rawAttendanceValue.empId.value,
            month:rawAttendanceValue.month.value,
            year:rawAttendanceValue.year.value
        }
        setRawAttendanceValue((prevState)=>({
            ...prevState,
            loading:true
        }))
        
        try {
            const response = await getRawAttendanceLogs(apiData)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESS"){
                setRawAttendanceValue((prevState)=>({
                    ...prevState,
                    rawAttendanceData:responseData.DB_DATA

                }))
            }else{
                showToast('No Record Found', 'error')
                setRawAttendanceValue((prevState)=>({
                    ...prevState,
                    rawAttendanceData:[]

                }))

            }
            
        } catch (error) {
            showToast('Failed to fetch raw attendance logs', 'error')
            setRawAttendanceValue((prevState)=>({
                ...prevState,
                rawAttendanceData:[]
            }))
        }finally{
            setRawAttendanceValue((prevState)=>({
                ...prevState,
                loading:false
            }))

        }
    }



    return { rawAttendanceValue, toggleRawAttendance, handleRawAttendanceLog, handleSearchEmpRaw, handleSelectRawAttendance,getRawAttendance, loading, setLoading}

}


export default useRawAttendanceLog
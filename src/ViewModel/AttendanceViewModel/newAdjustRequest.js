import { useState } from "react"
import { showToast } from "../../Components/Toaster/Toaster"
import empTimeAdjustmentApi from "../../Model/Data/EmpData/EmpTimeAdjustment/EmpTimeAdjunstment"
import useStore from "../../Store/store"
import { getUserData } from "../../Authentication/jwt_decode"

const useNewAdjustRequest = ()=>{

    const addnewTimeAdjustment = useStore((state)=> state.addnewTimeAdjustment)
    const gettingRequestAdj = useStore((state)=> state.gettingRequestAdj)


    const [formValue, setFormValue] = useState({
        show:false,
        date:'',
        inTime:'',
        outTime:'',
        reason:'',
        loading:false,
        isAdminSide:false,
        selectedEmployee:null
    })


    const NewAdjustRequest = (isAdminSide = false) => {

        setFormValue((prevState)=>({
            ...prevState,
            show: true,
            isAdminSide: isAdminSide
        }))
    }

    const handleEmployeeChange = (employee) => {
        setFormValue((prevState)=>({
            ...prevState,
            selectedEmployee: employee
        }))
    }


    const toggleAddNewAdjustRequest = ()=>{
        setFormValue((prevState)=>({
            ...prevState,
            show:false,
            date:'',
            inTime:'',
            outTime:'',
            reason:'',
            selectedEmployee:null,
            isAdminSide:false

        }))
    }



    const handleChangeAdjustRequest = (e)=>{
        const { name, value } = e.target

        setFormValue((prevState)=>({
            ...prevState,
            [name]: value
        }))
    }


    const addTimeAdjustmentValidation = ()=>{
        const {date, inTime, outTime, reason, isAdminSide, selectedEmployee} = formValue

        // Get user role from JWT token to determine if validation is needed
        const userData = getUserData()
        const userRole = userData?.roleId || 'Employee'

        // Only validate employee selection for Admin users
        // For Employee role users, skip employee validation completely
        if(userRole === 'Admin' && isAdminSide && !selectedEmployee){
            showToast('Please select an employee', 'error')
            return false
        }
        else if(date === ''){
            showToast('Select Date', 'error')
            return false
        }
        else if(inTime ===''){
            showToast('Select In Time', 'error')
            return false
        }
        else if(outTime ===''){
            showToast('Select Out Time', 'error')
            return false
        }
        else if(reason ===''){
            showToast("Reason can't be empty", 'error')
            return false
        }

        return true
    }


    const handleNewTimeRequest = async(e)=>{
        e.preventDefault()
        const validation = addTimeAdjustmentValidation()
        const {date, inTime, outTime, reason, isAdminSide, selectedEmployee} = formValue
        if(validation){
            const apiData = {
                date:date,
                in_time:inTime,
                out_time: outTime,
                reason: reason,
                custom_form_id:"44"
            }

            // Get user role from JWT token
            const userData = getUserData()
            const userRole = userData?.roleId || 'Employee'

            // Only send employee ID for Admin users who selected an employee
            // For Employee role users, don't send emp_id - backend will get it from JWT token
            if(userRole === 'Admin' && isAdminSide && selectedEmployee){
                apiData.emp_id = selectedEmployee.id
            }
            // For Employee role users, we don't send emp_id - backend handles it from JWT

            try {

                setFormValue((prevState)=>({
                    ...prevState, 
                    loading:true
                }))
                const response = await empTimeAdjustmentApi.addNewTimeRequest(apiData)
                const responseData = response.data 
                if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                    // Inbox API returns the created row in DB_DATA; older handlers used INSERTED_DATA
                    const newData = responseData.DB_DATA ?? responseData.INSERTED_DATA
                    if (newData) {
                        addnewTimeAdjustment(newData)
                    }
                    toggleAddNewAdjustRequest()
                    showToast('Request Submitted Successfully', 'success')
                    
                    // Refresh the adjustment requests list based on user role
                    // Get user role from JWT token
                    const currentUserData = getUserData()
                    const currentUserRole = currentUserData?.roleId || 'Employee'
                    
                    if(currentUserRole === 'Admin' && isAdminSide){
                        // For Admin users, call the admin API
                        gettingRequestAdj()
                    } else if(currentUserRole === 'Employee'){
                        // For Employee role users, call the employee-specific API
                        // This API gets only the single employee's data who submitted the request
                        const getTimeAjustmentData = useStore.getState().getTimeAjustmentData
                        if(getTimeAjustmentData){
                            getTimeAjustmentData()
                        }
                    }
                }
                
            } catch (error) {
                showToast(error?.response?.data?.ERROR_DESCRIPTION, 'error')
            }
            finally{
                setFormValue((prevState)=>({
                    ...prevState, 
                    loading:false
                }))
            }

        }
        
    }




    return { formValue, NewAdjustRequest, toggleAddNewAdjustRequest, handleChangeAdjustRequest, handleNewTimeRequest, handleEmployeeChange}
}


export default useNewAdjustRequest
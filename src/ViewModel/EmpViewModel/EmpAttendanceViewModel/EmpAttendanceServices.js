import { useState } from "react"
import { empSecondsIntoHrs } from "../../../services/__dateTimeServices"
import useStore from "../../../Store/store"
import empAttendanceApi from "../../../Model/Data/EmpData/EmpAttendance/EmpAttendance"
import empDashboardApi from "../../../Model/Data/EmpData/EmpDashboard/EmpDashboard"
import { showToast } from "../../../Components/Toaster/Toaster"

const useEmpAttendanceServices = ()=>{
    const gettingEmpAttendanceData = useStore((state)=> state.gettingEmpAttendanceData)
    const empAttendancData = useStore((state)=> state.empAttendancData)
    const settingNewAttendanceData = useStore((state)=> state.settingNewAttendanceData)
    const gettingEmpDashboardData = useStore((state) => state.gettingEmpDashboardData)


    const calculateEarlyLeave = (expected, earned, early)=>{

        const expctedEarned = expected - earned 
        const minutes = Math.floor(expctedEarned / 60);
        const totalEarlyLeave = minutes - early 
        const totalSeconds =  totalEarlyLeave * 60 
        return empSecondsIntoHrs(totalSeconds)

    }



    const currentMonth = new Date().getMonth(); // returns 0-11 (0 = January)
    const currentYear = new Date().getFullYear(); // returns the full year, e.g., 2024

    const [selectedValue, setSelectedValue] = useState({
        month: {
            value: currentMonth + 1, // to match the typical 1-12 month format
            label: new Date().toLocaleString('default', { month: 'long' }) // gets the full month name
        },
        year: {
            value: currentYear,
            label: currentYear
        }
    });


    const handleSelectAttendance = (select, value)=>{
        setSelectedValue((prevState)=>({
            ...prevState,
            [value]:select
        }))

        getAttendanceData(select, value)
    }



    const getAttendanceData = async(select, value)=>{
        let apiData = {
            month:'',
            year:''
        }

        if(value === 'month'){
            apiData={
                month:select.value, 
                year:selectedValue.year.value
            }
        }else if(value === 'year'){
            apiData={
                month:selectedValue.month.value,
                year:select.value
            }
        }else{
            // Handle direct data object (for initial load)
            apiData = select || {
                month: selectedValue.month.value,
                year: selectedValue.year.value
            }
        }

        try{
            const response = await empAttendanceApi.getEmpAttendanceData(apiData)
            const responseData = response.data
            if(response.status === 200 && responseData.STATUS === "SUCCESS"){
                const dbData = responseData.DB_DATA
                settingNewAttendanceData(dbData)
            }
        }catch(err){
            console.log('err', err)
        }
    };

    const handleMobileBaseAttendance = async (data) => {
        try {
            const userId = data?.user_id ?? data?.userId ?? data?.emp_id ?? data?.empId
            if (!userId) {
                showToast('Employee ID is missing', 'error')
                return { ok: false, data: null }
            }

            const payload = { ...data, user_id: userId }
            const response = await empDashboardApi.mobileBaseAttendance(payload)
            const responseData = response.data
            if (response.status === 200 && responseData.STATUS === 'SUCCESSFUL') {
                const action = String(data?.action || '').toLowerCase()
                const successMsg =
                    action === 'checkout' || action === 'check_out' || action === 'out'
                        ? 'Checked out successfully'
                        : 'Checked in successfully'

                showToast(responseData?.ERROR_DESCRIPTION || responseData?.message || successMsg, 'success')

                await Promise.allSettled([
                    gettingEmpDashboardData(),
                    gettingEmpAttendanceData({
                        month: selectedValue?.month?.value,
                        year: selectedValue?.year?.value,
                    }),
                ])

                return { ok: true, data: responseData }
            }

            showToast(responseData?.ERROR_DESCRIPTION || 'Failed to update attendance', 'error')
            return { ok: false, data: responseData }
        } catch (err) {
            console.log('err', err)
            showToast(err?.response?.data?.ERROR_DESCRIPTION || 'Failed to update attendance', 'error')
            return { ok: false, error: err }
        }
    }





    return {
        gettingEmpAttendanceData,
        empAttendancData,
        calculateEarlyLeave,
        selectedValue,
        handleSelectAttendance,
        handleMobileBaseAttendance
    }
}


export default useEmpAttendanceServices
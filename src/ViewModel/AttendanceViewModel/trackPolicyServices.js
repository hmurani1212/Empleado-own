import { useState } from "react"
import { showToast } from "../../Components/Toaster/Toaster"
import useStore from "../../Store/store"

const useTrackPolicy = ()=>{
    const setTrackPolicyParams = useStore((state)=> state.setTrackPolicyParams)

    const [trackPolicyValue, setTrackPolicyValue] = useState({
        show:false, 
        empId:null,
        month:null,
        year:null,
        trackPolicyData:[],
        loading:false,
    })

    const toggleTrackPolicy = ()=>{
        setTrackPolicyValue((prevState)=>({
            ...prevState,
            show:false
        }))
    }

    const handleTrackPolicyOpen = (data)=>{
        // Validate employee selection first
        if(!data.empId || data.empId === null || !data.empId.value){
            showToast('Please select employee', 'error')
            return
        }

        // Store params in store for route access
        setTrackPolicyParams({ empId: data.empId, month: data.month, year: data.year })

        // Set initial state and open drawer
        setTrackPolicyValue((prevState)=>({
            ...prevState,
            empId:data.empId,
            month:data.month,
            year:data.year,
            show:true,
            trackPolicyData:[]
        }))

        // Extract track policy data from stored attendance data
        extractTrackPolicyFromAttendance()
    }

    const extractTrackPolicyFromAttendance = ()=>{
        setTrackPolicyValue((prevState)=>({
            ...prevState,
            loading:true
        }))

        try {
            // Get current calendarData from store directly (reactive)
            const currentCalendarData = useStore.getState().calendarData
            // Get attendance array from calendarData stored in Zustand
            const attendance = currentCalendarData?.attendance || []
            
            if (!attendance || attendance.length === 0) {
                showToast('No attendance data found. Please view an employee\'s attendance first.', 'info')
                setTrackPolicyValue((prevState)=>({
                    ...prevState,
                    trackPolicyData:[],
                    loading:false
                }))
                return
            }

            // Transform attendance records to track policy format
            const trackPolicyData = attendance
                .map((record) => {
                    // Get policy value, convert "0" to null
                    let policyValue = record.policy
                    if (policyValue === "0" || policyValue === 0 || !policyValue) {
                        policyValue = null
                    }

                    // Use date_string (DD-MM-YYYY) or calendar_date if available
                    const dateValue = record.date_string || record.calendar_date || null

                    return {
                        date: dateValue,
                        policy: policyValue,
                        att_label: record.att_label || null
                    }
                })
                .filter((record) => record.date !== null) // Filter out records without dates
                .sort((a, b) => {
                    // Sort by date - parse DD-MM-YYYY format for comparison
                    if (!a.date || !b.date) return 0
                    const parseDate = (dateStr) => {
                        if (dateStr.includes('-')) {
                            const [day, month, year] = dateStr.split('-')
                            return new Date(year, month - 1, day)
                        }
                        return new Date(dateStr)
                    }
                    return parseDate(a.date) - parseDate(b.date)
                })

            setTrackPolicyValue((prevState)=>({
                ...prevState,
                trackPolicyData: trackPolicyData,
                loading:false
            }))
        } catch (error) {
            console.error('Error extracting track policy data:', error)
            showToast('Failed to extract track policy data', 'error')
            setTrackPolicyValue((prevState)=>({
                ...prevState,
                trackPolicyData:[],
                loading:false
            }))
        }
    }

    const getTrackPolicy = ()=>{
        // Check if we have calendarData, if yes, extract directly
        const currentCalendarData = useStore.getState().calendarData
        if (currentCalendarData?.attendance && currentCalendarData.attendance.length > 0) {
            extractTrackPolicyFromAttendance()
            return
        }

        // If no calendarData, check for empId
        if(!trackPolicyValue.empId || trackPolicyValue.empId === null || !trackPolicyValue.empId.value){
            showToast('No attendance data found. Please view an employee\'s attendance first.', 'info')
            return
        }

        extractTrackPolicyFromAttendance()
    }

    return { trackPolicyValue, toggleTrackPolicy, handleTrackPolicyOpen, getTrackPolicy}

}

export default useTrackPolicy


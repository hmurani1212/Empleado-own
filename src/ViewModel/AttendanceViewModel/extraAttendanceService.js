import { useState } from "react"
import { showToast } from "../../Components/Toaster/Toaster"
import useStore from "../../Store/store"

import { FaClock, FaMapMarkerAlt, FaBan, FaFile, FaFingerprint, FaExchangeAlt, FaCalendarAlt, FaIdCardAlt } from "react-icons/fa";
import { FaBriefcase } from "react-icons/fa6";
import { BiSolidStopwatch } from "react-icons/bi";
import { PiClockCountdownFill } from "react-icons/pi";
import { FaFileLines } from "react-icons/fa6";
import { IoLogOut } from "react-icons/io5";
import { FaShoppingBasket } from "react-icons/fa";
import { FaMoneyBill } from "react-icons/fa";
import { FaFileCircleCheck } from "react-icons/fa6";
import { FaUsers } from "react-icons/fa";
import { TbRotateClockwise } from "react-icons/tb";
import { MdWatchLater } from "react-icons/md";
import { HiCalendar } from "react-icons/hi";
import { MdStackedBarChart } from "react-icons/md";
import { IoCalendar } from "react-icons/io5";

const useExtraAttendanceServices = ()=>{

    const gettingPolicyView = useStore((state)=> state.gettingPolicyView)
    const viewPolicy =  useStore((state)=> state.viewPolicy)

    const [currentHRPolicyShow, setCurrentHRPolicyShow] = useState({
        id:null,
        show:false, 

    })


    const viewPolicyData = [
        {id:1, title:'Force Time out', icon: <FaClock />, data: `${viewPolicy.force_timeout} minutes after closing time` },
        {id:2, title:'Leniency Time', icon: <FaCalendarAlt />, data: `${viewPolicy.leniency_time} min` },
        {id:3, title:'Early Arrival Policy', icon: <BiSolidStopwatch />, data: viewPolicy.early_arrival === '1'? 'Shifting Time' : 'Count Actual Time' },
        {id:4, title:'Max Early Arrival Time', icon: <PiClockCountdownFill />, data: `${viewPolicy.early_arrival_max_time} min` },
        {id:5, title:'Working Days', icon: <FaFileLines />, data: viewPolicy.working_days },
        {id:6, title:'Timeout Policy', icon: <IoLogOut />, data: viewPolicy.timeout_policy === '0' ? 'Mark as absent' : viewPolicy.timeout_policy === '1' ? 'Present' : viewPolicy.timeout_policy === '2' ? 'Count Half Day' : 'Count one hour'  },
        {id:7, title:'Late Min Monthly Bucket', icon: <FaShoppingBasket />, data: `${viewPolicy.late_time_in_minutes} min`},
        {id:8, title:'Late Comers Penalty', icon: <FaMoneyBill />, data: `Late minutes x ${viewPolicy.late_comers_penalty}` },
        {id:9, title:'Allowed Leaves', icon: <FaFileCircleCheck />, data: `${viewPolicy.allowed_offs} day(s)` },
        {id:10, title:'Leave Assigned Group Name', icon: <FaUsers />, data: viewPolicy.leave_group_name ?? viewPolicy.leave_group ?? '-' },
        {id:11, title:'Duty Duration', icon: <FaBriefcase />, data: `${viewPolicy.working_hours} hrs` },
        {id:12, title:'Biometric Machine', icon: <FaFingerprint />, data: viewPolicy.use_multi_devices === '1' ? 'Multiple Machines' : 'Single Machine' },
        {id:13, title:'Minimum Overtime required', icon: <MdWatchLater />, data: `${viewPolicy.overtime_min_minutes} minutes(s)` },
        {id:14, title:'Daily Overtime', icon: <HiCalendar />, data: viewPolicy.overtime_pay === '0' ? 'Unpaid' : 'Paid' },
        {id:15, title:'Daily Overtime Rate', icon: <TbRotateClockwise />, data: viewPolicy.overtime_rules && viewPolicy.overtime_rules.daily_ot_rate },
        {id:16, title:'Policy Swap', icon: <FaExchangeAlt />, data: viewPolicy.policy_swapped_from != null ? `${viewPolicy.id ?? viewPolicy.policy_name ?? '-'} ⇄ ${viewPolicy.policy_swapped_from}` : (viewPolicy.swap_policy && viewPolicy.swap_policy !== '[]' ? viewPolicy.swap_policy : '-') },
        {id:17, title:'Holiday Overtime', icon: <MdStackedBarChart />, data: viewPolicy.overtime_rules && viewPolicy.overtime_rules.holiday_ot_rate === "0" ? 'Unpaid' : 'Paid' },
        {id:18, title:'Holiday Overtime Rate', icon: <FaIdCardAlt />, data: viewPolicy.overtime_rules && viewPolicy.overtime_rules.holiday_ot_rate === "0" ? 'Unpaid' : viewPolicy.overtime_rules && viewPolicy.overtime_rules.holiday_ot_rate === "1" ? 'Rate Salary/hour' : viewPolicy.overtime_rules && viewPolicy.overtime_rules.holiday_ot_rate === "2" ? 'Fixed rate/hr' : viewPolicy.overtime_rules && viewPolicy.overtime_rules.holiday_ot_rate === "3" ? 'Fixed rate/day' : viewPolicy.overtime_rules && viewPolicy.overtime_rules.holiday_ot_rate === "4" ? 'Salaray/hour * X' : 'Full Salary/day' },
        {id:19, title:'Pay Schedule', icon: <IoCalendar />, data: viewPolicy.pay_month },
        {id:20, title:'Overtime Due Minutes', icon: <FaFile />, data: `${viewPolicy.overtime_due_minutes} min` },
    ]



    const toggleHRPolicy = ()=>{
        setCurrentHRPolicyShow((prevState)=>({
            ...prevState,
            show:false
        }))
    }


    const handleViewHRPolicy = (data)=>{
        const id =  data?.attendanceAttr?.last_policy?.id
        if(!id){
            showToast('No HR Policy found for this employee', 'error')
        }else{
            gettingPolicyView(id)
            setCurrentHRPolicyShow((prevState)=>({
                ...prevState,
                show:true
            }))
        }
    }

    return { currentHRPolicyShow, handleViewHRPolicy,viewPolicyData, viewPolicy, toggleHRPolicy}

}


export default useExtraAttendanceServices
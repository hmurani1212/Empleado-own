import React, { useEffect } from 'react'
import useEmpDashboard from '../../ViewModel/EmpViewModel/EmpDashboardViewModel/EmpDashboardServices';
import { FaBan, FaBriefcase, FaClock, FaFile, FaFingerprint } from 'react-icons/fa6';
import { FaExchangeAlt, FaMapMarkerAlt } from 'react-icons/fa';

const ViewPolicy = () => {
    const { empDashboardData } = useEmpDashboard();
    const viewPolicy = empDashboardData?.view_policy;
    useEffect(() => {
        console.log('viewPolicy', viewPolicy);
    });

    function formatDate(timestamp) {
        if (!timestamp) return "--";
      
        const ts = Number(timestamp);
      
        if (Number.isNaN(ts)) return "--";
      
        // detect seconds vs milliseconds
        const date = new Date(ts < 1e12 ? ts * 1000 : ts);
      
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      };

      function timeToMinutes(timeStr) {
        if (!timeStr) return 0;
      
        const [time, modifier] = timeStr.split(" "); // "6:00", "PM"
        let [hours, minutes] = time.split(":").map(Number);
      
        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
      
        return hours * 60 + minutes;
      }
      

      const viewPolicyData = [
        { id: 1, title: 'Force Time out', icon: <FaBan />, data: `${parseInt(viewPolicy.force_timeout || 0) * 60} minutes after closing time` },
        { id: 2, title: 'Leniency Time', icon: <FaClock />, data: `${viewPolicy.leniency_time} min` },
        { id: 3, title: 'Early Arrival Policy', icon: <FaMapMarkerAlt />, data: viewPolicy.early_arrival === '1' || viewPolicy.early_arrival === 'ONE' ? 'Shifting Time' : 'Count Actual Time' },
        { id: 4, title: 'Max Early Arrival Time', icon: <FaClock />, data: `${viewPolicy.early_arrival_max_time} min` },
        { id: 5, title: 'Working Days', icon: <FaBriefcase />, data: viewPolicy.working_days ? viewPolicy.working_days?.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ') : '' },
        { id: 6, title: 'Timeout Policy', icon: <FaBan />, data: viewPolicy.timeout_policy === '0' || viewPolicy.timeout_policy === 'ZERO' ? 'Mark as absent' : viewPolicy.timeout_policy === '1' || viewPolicy.timeout_policy === 'ONE' ? 'Present' : viewPolicy.timeout_policy === '2' || viewPolicy.timeout_policy === 'TWO' ? 'Count Half Day' : viewPolicy.timeout_policy === '3' || viewPolicy.timeout_policy === 'THREE' ? 'Count one hour' : 'Unknown' },
        { id: 7, title: 'Late Min Monthly Bucket', icon: <FaClock />, data: `${viewPolicy.late_time_in_minutes} min` },
        { id: 8, title: 'Late Comers Penalty', icon: <FaClock />, data: `Late minutes x ${viewPolicy.late_comers_penalty}` },
        { id: 9, title: 'Allowed Leaves', icon: <FaClock />, data: `${viewPolicy.allowed_offs} day(s)` },
        { id: 10, title: 'Leave Assigned Group', icon: <FaFile />, data: viewPolicy?.leave_group?.group_title || 'Not Assigned' },
        {
            id: 11,
            title: "Duty Duration",
            icon: <FaClock />,
            data: (() => {
              if (!viewPolicy.starting_time || !viewPolicy.closing_time)
                return "0 hrs";
          
              const startMinutes = timeToMinutes(viewPolicy.starting_time);
              const endMinutes = timeToMinutes(viewPolicy.closing_time);
          
              let diffMinutes = endMinutes - startMinutes;
          
              // handle overnight shifts
              if (diffMinutes < 0) diffMinutes += 24 * 60;
          
              const hours = Math.floor(diffMinutes / 60);
              const minutes = diffMinutes % 60;
          
              return minutes
                ? `${hours}.${Math.round(minutes / 6)} hrs`
                : `${hours} hrs`;
            })(),
        },          
        { id: 12, title: 'Biometric Machine', icon: <FaFingerprint />, data: viewPolicy.use_multi_devices === '1' ? 'Multiple Machines' : 'Single Machine' },
        { id: 13, title: 'Minimum Overtime required', icon: <FaClock />, data: `${viewPolicy.overtime_min_minutes} minutes(s)` },
        {
            id: 14, title: 'Daily Overtime', icon: <FaClock />, data: (() => {
                const otPay = viewPolicy.overtime_pay?.toLowerCase() || '';
                return (otPay === 'unpaid' || otPay === '0' || otPay === 'no' || viewPolicy.overtime_pay === 0) ? 'Unpaid' : 'Paid';
            })()
        },
        {
            id: 15, title: 'Daily Overtime Rate', icon: <FaClock />, data: (() => {
                const rate = viewPolicy.OTRules?.daily_ot_rate;
                // 0 = Fixed Rate, 1 = Equal Salary/Hour, 2 = Salary/Hour * X, 3 = unpaid, 4 = Salary/Day
                if (rate === 0 || rate === '0') return 'Fixed Rate';
                if (rate === 1 || rate === '1') return 'Equal Salary/Hour';
                if (rate === 2 || rate === '2') return 'Salary/Hour * X';
                if (rate === 3 || rate === '3') return 'Unpaid';
                if (rate === 4 || rate === '4') return 'Salary/Day';
                return rate !== undefined && rate !== null ? rate : 'Not Set';
            })()
        },
        { id: 16, title: 'Policy Swap', icon: <FaExchangeAlt />, data: viewPolicy.swap_policy === '[]' ? viewPolicy.swap_policy : 'null' },
        {
            id: 17, title: 'Holiday Overtime', icon: <FaClock />, data: (() => {
                const rate = viewPolicy.overtime_rules?.holiday_ot_rate;
                // 0 = Unpaid, anything else = Paid
                if (rate === 0 || rate === '0' || rate === null || rate === undefined || rate === '') return 'Unpaid';
                return 'Paid';
            })()
        },
        {
            id: 18, title: 'Holiday Overtime Rate', icon: <FaClock />, data: (() => {
                const rate = viewPolicy.OTRules?.holiday_ot_rate;
                // 0 = Unpaid, 1 = Equal Salary/Hour, 2 = Fixed Rate/Hour, 3 = Fixed Rate/Day, 4 = Salary/Hour * X, 5 = Equal Salary/Day
                if (rate === 0 || rate === '0') return 'Unpaid';
                if (rate === 1 || rate === '1') return 'Equal Salary/Hour';
                if (rate === 2 || rate === '2') return 'Fixed Rate/Hour';
                if (rate === 3 || rate === '3') return 'Fixed Rate/Day';
                if (rate === 4 || rate === '4') return 'Salary/Hour * X';
                if (rate === 5 || rate === '5') return 'Equal Salary/Day';
                return 'Not Set';
            })()
        },
        { id: 19, title: 'Pay Schedule', icon: <FaFile />, data: viewPolicy.pay_schedule?.pay_month || viewPolicy.pay_month || '-' },
        { id: 20, title: 'Overtime Due Minutes', icon: <FaFile />, data: `${viewPolicy.overtime_due_minutes} min` },
    ]
      

      
  return (
    <div className='p-6 bg-white'>
        <div className='flex flex-col'>
            <div className=' font-semibold text-[#3da5f4] text-center pb-4'>
                <span className='text-[20px]'>{viewPolicy.policy_name}</span>
            </div>

            <div className='w-full min-w-max text-left text-[14px]' >
                
                <div className='flex flex-col gap-2 text-left'>
                    <div className="bg-[#f3f6fb] py-2 flex items-center justify-between rounded-[7px] px-4">
                        <span className='font-medium text-left'>Policy ID</span>
                        <span>{viewPolicy.id}</span>
                    </div>

                    <div className="bg-[#f3f6fb] py-2 flex items-center justify-between rounded-[7px] px-4">
                        <span className='font-medium'>Shift Timings</span>
                        <span>{(viewPolicy.starting_time)} - {(viewPolicy.closing_time)}</span>
                    </div>

                    <div className="bg-[#f3f6fb] py-2 flex items-center justify-between rounded-[7px] px-4">
                        <span className='font-medium'>Status</span>
                        <span>
                          {viewPolicy.status === '0' ? 'Expiry' : 'Valid'}  
                        </span>
                    </div>

                    <div className="bg-[#f3f6fb] py-2 flex items-center justify-between rounded-[7px] px-4">
                        <span className='font-medium'>Payroll Generation Type</span>
                        <span>
                            {viewPolicy.payroll === 1 || viewPolicy.payroll === '1' || viewPolicy.payroll === 'ONE' ? 'Time Base' : 
                             viewPolicy.payroll === 2 || viewPolicy.payroll === '2' || viewPolicy.payroll === 'TWO' ? 'Attendance Base' : 
                             viewPolicy.payroll === 3 || viewPolicy.payroll === '3' || viewPolicy.payroll === 'THREE' ? 'Hourly Base' : 'Unknown'}  
                        </span>
                    </div>

                    <div className="bg-[#f3f6fb] py-2 flex items-center justify-between rounded-[7px] px-4">
                        <span className='font-medium'>Overtime</span>
                        <span>
                            {viewPolicy.overtime_pay === '0' ? 'Unpaid' : 'Paid'}  
                        </span>
                    </div>

                    <div className="bg-[#f3f6fb] py-2 flex items-center justify-between rounded-[7px] px-4">
                        <span className='font-medium'>Created Date</span>
                        <span>{formatDate(viewPolicy.creation_time)}</span>
                    </div>
                </div>
                
            </div>
        </div>

        <div className='grid grid-cols-1 gap-2 pt-[20px]'>
            {viewPolicyData.map((item) => (
                <div key={item.id}>
                    <div className="bg-[#3da5f4] py-1 flex flex-col text-left rounded-bl-full rounded-tr-full px-8">
                        <span className='font-medium text-left text-white text-[11px]'>{item.title}</span>
                        <span className='font-normal text-left text-white text-[11px]'>{item.data}</span>
                    </div>
                </div>

            ))}

        </div>
    </div>
  )
}

export default ViewPolicy
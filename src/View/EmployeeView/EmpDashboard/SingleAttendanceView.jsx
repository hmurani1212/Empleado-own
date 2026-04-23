import React from 'react'
import { convertTimeAMPM, secondsIntoHrs } from '../../../services/__dateTimeServices'

const truthyHalf = (v) =>
    v === true ||
    v === 1 ||
    v === '1' ||
    String(v).toLowerCase() === 'true'

const isHalfDayAttendance = (data) => {
    if (!data) return false
    const label = String(data.att_label ?? '').trim().toUpperCase()
    if (label === 'HD' || label === 'HALF' || label === 'H.D') return true
    const extra = String(data.extra ?? '').toLowerCase()
    if (extra.includes('half day') || extra.includes('half-day')) return true
    return (
        truthyHalf(data.half_day) ||
        truthyHalf(data.is_half_day) ||
        truthyHalf(data.isHalfDay)
    )
}

const SingleAttendanceView = (props) => {
    const {data} = props 
    
    // Handle different attendance statuses
    const renderAttendanceDetails = () => {
        if (!data) {
            return <div className="text-center text-gray-500">No attendance data available</div>
        }

        // If it's a holiday
        if (data.att_label === "H") {
            return (
                <div className="text-center bg-white rounded-[10px] p-2">
                    <div className="text-lg font-semibold text-yellow-600 mb-2">Holiday</div>
                    <div className="text-sm text-gray-600 font-medium">{data.extra || "Weekly Holiday"}</div>
                </div>
            )
        }

        // If it's absent
        if (data.att_label === "A") {
            return (
                <div className="text-center bg-white rounded-[10px] p-2">
                    <div className="text-lg font-semibold text-red-600 mb-2">Absent</div>
                    <div className="text-sm text-gray-600 font-medium">No attendance recorded for this day</div>
                </div>
            )
        }

        // If it's a leave
        if (data.att_label === "CL" || data.att_label === "AL" || data.att_label === "L") {
            return (
                <div className="text-center bg-white rounded-[10px] p-2">
                    <div className="text-lg font-semibold text-purple-600 mb-2">{data?.extra}</div>
                    <div className="text-sm text-gray-600 font-medium">Leave taken on this day</div>
                </div>
            )
        }

        // Present or half day (same detail layout; half day may use att_label HD or P + half flags)
        if (data.att_label === "P" || isHalfDayAttendance(data)) {
            const halfDay = isHalfDayAttendance(data)
            return (
                <div className='flex flex-col items-center justify-center gap-3 bg-white rounded-[10px] p-2 font-medium'>
                    <div className='flex flex-col items-center justify-center gap-4 bg-white w-full text-gray-500 '>
                    {halfDay && (
                        <div className="text-lg font-semibold text-emerald-600 w-full text-center">
                            Half Day
                        </div>
                    )}
                    <div className='text-md mt-2 flex justify-center w-full font-medium'>
                        Policy: {data.daliy_policy_starting} - {data.daliy_policy_closing}
                    </div>
                    <div className='flex flex-wrap items-center gap-4 text-[13px] justify-center w-full font-medium'>
                        {/* <div className='flex items-center gap-2 w-full'> */}
                            <span className='whitespace-nowrap'>Expected Hours: {secondsIntoHrs(data?.expected || 0)}</span>
                            {/* <span>{secondsIntoHrs(data?.expected || 0)}</span> */}
                        {/* </div> */}
                        {/* <div className='flex items-center gap-2 w-full'> */}
                            <span className='whitespace-nowrap'>Earned Hours: {secondsIntoHrs(data?.earned || 0)}</span>
                            {/* <span>{secondsIntoHrs(data?.earned || 0)}</span> */}
                        {/* </div> */}
                        {/* <div className='flex items-center gap-2 w-full'> */}
                            <span className='whitespace-nowrap'>Overtime: {secondsIntoHrs(data?.overtime || 0)}</span>
                            {/* <span>{secondsIntoHrs(data?.overtime || 0)}</span> */}
                        {/* </div> */}
                    </div>
                        {data?.timings && data.timings.length > 0 ? (
                            <div className='flex items-center gap-2 text-[13px] justify-center w-full font-medium'>
                                <div className='flex items-center justify-center gap-2'>
                                    <span>In :</span>
                                    <span>{convertTimeAMPM(data.timings[0])}</span>
                                </div>
                                <div className='flex items-center justify-center gap-2 font-medium'>
                                    <span>Out :</span>
                                    <span>{data.timings[1] ? convertTimeAMPM(data.timings[1]) : 'Not logged out'}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-500">No timing data available</div>
                        )}
                        {data.late_minutes > 0 && (
                            <div className='flex items-center gap-2 text-[13px] text-red-600 text-center font-medium' >
                                <span>Late Minutes :</span>
                                <span>{data.late_minutes} minutes</span>
                            </div>
                        )}
                    </div>
                </div>
            )
        }

        // Default case
        return (
            <div className="text-center text-gray-500 bg-white rounded-[10px] p-2">
                <div className="text-lg font-semibold mb-2">Status: {data.att_label}</div>
                <div className="text-sm">{data.extra || "No additional information"}</div>
            </div>
        )
    }

    return (
        <div className=''>
            {renderAttendanceDetails()}
        </div>
    )
}

export default SingleAttendanceView
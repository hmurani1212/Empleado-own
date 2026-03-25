import React, { useState } from 'react'
import { BiCalendar } from 'react-icons/bi'
import { FaBullseye, FaSignature } from 'react-icons/fa6'
import { LiaTasksSolid } from 'react-icons/lia'

const ASSIGNED_TO_VIEW_MORE_THRESHOLD = 3

const ViewPRC = (props) => {
    const { data } = props
    const [showAllAssigned, setShowAllAssigned] = useState(false)

    const formatTimestampToDate = (timestamp) => {
        if (!timestamp) return ''
        let date
        if (typeof timestamp === 'number') {
            date = timestamp.toString().length === 10 ? new Date(timestamp * 1000) : new Date(timestamp)
        } else {
            date = new Date(timestamp)
        }
        if (isNaN(date.getTime())) return ''
        const y = date.getFullYear()
        const m = String(date.getMonth() + 1).padStart(2, '0')
        const d = String(date.getDate()).padStart(2, '0')
        return `${y}-${m}-${d}`
    }

    // Format manage-by value for display (API: Admin, Custom employee, reporting manager, self)
    const formatManageBy = (value) => {
        if (value == null || value === '') return '—'
        const v = String(value).trim()
        if (v === 'reporting manager') return 'Reporting Manager'
        if (v === 'Custom employee' || v === 'Custom Employee') return 'Employee'
        if (v === 'self') return 'Self'
        return v
    }

    if (!data) {
        return <div className="p-4 text-center text-gray-500">No data available</div>
    }

    const employees = data.employees && Array.isArray(data.employees) ? data.employees : []
    const assignedCount = employees.length
    const assignedTwoOrMore = assignedCount >= 2
    const showViewMore = assignedCount > ASSIGNED_TO_VIEW_MORE_THRESHOLD
    const displayedEmployees = showViewMore && !showAllAssigned
        ? employees.slice(0, ASSIGNED_TO_VIEW_MORE_THRESHOLD)
        : employees
    const remainingCount = showViewMore ? employees.length - ASSIGNED_TO_VIEW_MORE_THRESHOLD : 0

    const renderEmployeeCard = (emp, index) => {
        let employeeName = emp.employee_name || emp.name || `Employee ${emp.employee_id}`
        employeeName = employeeName.replace(/\s*\(ID:\s*\d+\)/gi, '').trim()
        const displayName = employeeName + (emp.employee_id ? ` (ID: ${emp.employee_id})` : '')
        return (
            <div key={emp.employee_id || index} className="flex flex-col gap-1 border border-blue-500 rounded-md p-2">
                <span className="text-customBlack-100 text-[12px]">{displayName}</span>
                <span className="text-[11px] text-gray-600">
                    Score: {emp.score !== undefined && emp.score !== null ? emp.score : 0}/10
                </span>
            </div>
        )
    }

    const assignedToBlock = (
        <div className="flex gap-3 border border-blue-500 rounded-md p-3">
            <div className="mt-1">
                <span className="text-primary-100"><LiaTasksSolid /></span>
            </div>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
                <span className="text-nowrap text-customBlack-100 text-[14px]">Assigned To</span>
                <div className="flex flex-col gap-2">
                    {displayedEmployees.length > 0
                        ? displayedEmployees.map((emp, index) => renderEmployeeCard(emp, index))
                        : <span className="text-customBlack-100 text-[12px]">Not Assigned</span>}
                    {showViewMore && (
                        <button
                            type="button"
                            onClick={() => setShowAllAssigned((prev) => !prev)}
                            className="text-left text-[12px] text-blue-600 hover:underline mt-1"
                        >
                            {showAllAssigned ? 'View only three' : `View more (${remainingCount} more)`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )

    const modulesBlock = (
        <div className="flex gap-3 border border-blue-500 rounded-md p-3">
            <div className="mt-1">
                <span className="text-primary-100"><FaBullseye /></span>
            </div>
            <div className="flex flex-col gap-2">
                <span className="text-nowrap text-customBlack-100 text-[14px]">Modules</span>
                <span className="text-customBlack-100 text-[12px]">Goals & Competency</span>
            </div>
        </div>
    )

    const competencyBlock = (
        <div className="flex gap-3 border border-blue-500 rounded-md p-3">
            <div className="mt-1">
                <span className="text-primary-100"><LiaTasksSolid /></span>
            </div>
            <div className="flex flex-col gap-2">
                <span className="text-nowrap text-customBlack-100 text-[14px]">Competency</span>
                <span className="text-customBlack-100 text-[12px]">
                    {data.competency && Array.isArray(data.competency) && data.competency.length > 0
                        ? data.competency.join(', ')
                        : 'No competency'}
                </span>
            </div>
        </div>
    )

    const goalBlock = (
        <div className="flex gap-3 border border-blue-500 rounded-md p-3">
            <div className="mt-1">
                <span className="text-primary-100"><FaBullseye /></span>
            </div>
            <div className="flex flex-col gap-2">
                <span className="text-nowrap text-customBlack-100 text-[14px]">Goal</span>
                <span className="text-customBlack-100 text-[12px]">
                    {data.Goal && Array.isArray(data.Goal) && data.Goal.length > 0
                        ? data.Goal.join(', ')
                        : 'No Goal'}
                </span>
            </div>
        </div>
    )

    return (
        <div className="p-2 space-y-2">
            {/* Row 0: Goal Manage by, Competency Manage by (at top) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-3 border border-blue-500 rounded-md p-3">
                    <div className="mt-1">
                        <span className="text-primary-100"><FaBullseye /></span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-nowrap text-customBlack-100 text-[14px]">Goal Manage by</span>
                        <span className="text-customBlack-100 text-[12px]">{formatManageBy(data.goal_manage_by)}</span>
                    </div>
                </div>
                <div className="flex gap-3 border border-blue-500 rounded-md p-3">
                    <div className="mt-1">
                        <span className="text-primary-100"><LiaTasksSolid /></span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-nowrap text-customBlack-100 text-[14px]">Competency Manage by</span>
                        <span className="text-customBlack-100 text-[12px]">{formatManageBy(data.competency_manage_by)}</span>
                    </div>
                </div>
            </div>

            {/* Row 1: Name, Start Date */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-5 border border-blue-500 rounded-md p-3">
                    <div className="mt-1">
                        <span className="text-primary-100"><FaSignature /></span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-nowrap text-customBlack-100 text-[14px]">Name Of Performance Review Cycle</span>
                        <span className="text-customBlack-100 text-[12px]">{data.name}</span>
                    </div>
                </div>
                <div className="flex gap-3 border border-blue-500 rounded-md p-3">
                    <div>
                        <span className="text-primary-100"><BiCalendar /></span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-nowrap text-customBlack-100 text-[14px]">Start Date</span>
                        <span className="text-customBlack-100 text-[12px]">{formatTimestampToDate(data.startDate)}</span>
                    </div>
                </div>
            </div>
            {/* Row 2: End Date, Closing Date */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-5 border border-blue-500 rounded-md p-3">
                    <div className="mt-1">
                        <span className="text-primary-100"><BiCalendar /></span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-nowrap text-customBlack-100 text-[14px]">End Date</span>
                        <span className="text-customBlack-100 text-[12px]">{formatTimestampToDate(data.endDate)}</span>
                    </div>
                </div>
                <div className="flex gap-3 border border-blue-500 rounded-md p-3">
                    <div className="mt-1">
                        <span className="text-primary-100"><BiCalendar /></span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-nowrap text-customBlack-100 text-[14px]">Closing Date</span>
                        <span className="text-customBlack-100 text-[12px]">{formatTimestampToDate(data.closing_date)}</span>
                    </div>
                </div>
            </div>

            {/* Layout: when Assigned To is 2+ show Competency and Goal under Modules in the right column */}
            {assignedTwoOrMore ? (
                <>
                    {/* Assigned To (left) | Modules, then Competency, then Goal stacked (right) */}
                    <div className="grid grid-cols-2 gap-4 items-start">
                        {assignedToBlock}
                        <div className="flex flex-col gap-4">
                            {modulesBlock}
                            {competencyBlock}
                            {goalBlock}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    {/* Assigned To length 0 or 1: Assigned To | Modules, then Competency | Goal (side by side) */}
                    <div className="grid grid-cols-2 gap-4 items-start">
                        {assignedToBlock}
                        {modulesBlock}
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-start">
                        {competencyBlock}
                        {goalBlock}
                    </div>
                </>
            )}
        </div>
    )
}

export default ViewPRC

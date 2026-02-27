import React from 'react'
import { Button } from '@material-tailwind/react'
import { formatTimestampToDate } from '../../services/__dateTimeServices'
import { BiCalendar } from 'react-icons/bi'
import { FaSignature, FaUser, FaFlag, FaClipboardCheck, FaBullseye, FaChartLine, FaStar, FaComment } from 'react-icons/fa6'
import { LiaTasksSolid } from 'react-icons/lia'

const ViewGoal = ({ goalData, onClose, onEdit, onUpdate }) => {
    const getStatusText = (status) => {
        switch (status) {
            case "0": return "Not Started"
            case "1": return "In Progress"
            case "2": return "Completed"
            default: return "Unknown"
        }
    }


    // Helper function to format dates consistently
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        // If it's already in YYYY-MM-DD format, return as is
        if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            return dateString
        }
        // Otherwise try to format it
        try {
            return formatTimestampToDate(dateString)
        } catch {
            return dateString
        }
    }

    return (
        <div className="p-2 space-y-2">
            {/* Header with action buttons */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">View Goal</h3>
                <div className="flex gap-2">
                    {onUpdate && (
                        <Button
                            variant="outlined"
                            color="blue"
                            onClick={onUpdate}
                            className="text-xs px-4 py-2"
                        >
                            UPDATE GOAL
                        </Button>
                    )}
                    <Button
                        variant="outlined"
                        color="blue"
                        onClick={onEdit}
                        className="text-xs px-4 py-2"
                    >
                        EDIT GOAL
                    </Button>
                </div>
            </div>

            {/* Goal Information in Box Layout */}
            <div className='grid grid-cols-2 gap-4'>
                {/* Goal Name */}
                <div className='flex gap-3 border border-blue-500 rounded-md p-3 items-center'>
                    <div>
                        <span className='text-primary-100'>
                            <FaSignature />
                        </span>
                    </div>
                    <div className='flex items-center gap-2 flex-1'>
                        <span className='text-nowrap text-customBlack-100 text-[14px] font-medium'>Goal Name:</span>
                        <span className='text-customBlack-100 text-[12px]'>{goalData.goal_name || 'N/A'}</span>
                    </div>
                </div>

                {/* Description */}
                <div className='flex gap-3 border border-blue-500 rounded-md p-3 items-center'>
                    <div>
                        <span className='text-primary-100'>
                            <FaClipboardCheck />
                        </span>
                    </div>
                    <div className='flex items-center gap-2 flex-1'>
                        <span className='text-nowrap text-customBlack-100 text-[14px] font-medium'>Description:</span>
                        <span className='text-customBlack-100 text-[12px]'>{goalData.description || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
                {/* Priority */}
                <div className='flex gap-3 border border-blue-500 rounded-md p-3 items-center'>
                    <div>
                        <span className='text-primary-100'>
                            <FaFlag />
                        </span>
                    </div>
                    <div className='flex items-center gap-2 flex-1'>
                        <span className='text-nowrap text-customBlack-100 text-[14px] font-medium'>Priority:</span>
                        <span className='text-customBlack-100 text-[12px]'>
                            {goalData.priority?.label || goalData.priority?.value || goalData.priority || 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Status */}
                <div className='flex gap-3 border border-blue-500 rounded-md p-3 items-center'>
                    <div>
                        <span className='text-primary-100'>
                            <FaBullseye />
                        </span>
                    </div>
                    <div className='flex items-center gap-2 flex-1'>
                        <span className='text-nowrap text-customBlack-100 text-[14px] font-medium'>Status:</span>
                        <span className='text-customBlack-100 text-[12px]'>{getStatusText(goalData.status)}</span>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
                {/* Assigned Employee */}
                <div className='flex gap-3 border border-blue-500 rounded-md p-3 items-center'>
                    <div>
                        <span className='text-primary-100'>
                            <FaUser />
                        </span>
                    </div>
                    <div className='flex items-center gap-2 flex-1'>
                        <span className='text-nowrap text-customBlack-100 text-[14px] font-medium'>Assigned Employee:</span>
                        <span className='text-customBlack-100 text-[12px]'>
                            {goalData.selectedEmp?.[0]?.label 
                                ? `${goalData.selectedEmp[0].label} (${goalData.selectedEmp[0].value})`
                                : 'N/A'}
                        </span>
                    </div>
                </div>

                {/* Created At */}
                <div className='flex gap-3 border border-blue-500 rounded-md p-3 items-center'>
                    <div>
                        <span className='text-primary-100'>
                            <BiCalendar />
                        </span>
                    </div>
                    <div className='flex items-center gap-2 flex-1'>
                        <span className='text-nowrap text-customBlack-100 text-[14px] font-medium'>Created At:</span>
                        <span className='text-customBlack-100 text-[12px]'>
                            {goalData.createdAt ? formatDate(goalData.createdAt) : 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
                {/* Start Date */}
                <div className='flex gap-3 border border-blue-500 rounded-md p-3 items-center'>
                    <div>
                        <span className='text-primary-100'>
                            <BiCalendar />
                        </span>
                    </div>
                    <div className='flex items-center gap-2 flex-1'>
                        <span className='text-nowrap text-customBlack-100 text-[14px] font-medium'>Start Date:</span>
                        <span className='text-customBlack-100 text-[12px]'>{formatDate(goalData.start_date)}</span>
                    </div>
                </div>

                {/* End Date */}
                <div className='flex gap-3 border border-blue-500 rounded-md p-3 items-center'>
                    <div>
                        <span className='text-primary-100'>
                            <BiCalendar />
                        </span>
                    </div>
                    <div className='flex items-center gap-2 flex-1'>
                        <span className='text-nowrap text-customBlack-100 text-[14px] font-medium'>End Date:</span>
                        <span className='text-customBlack-100 text-[12px]'>{formatDate(goalData.end_date)}</span>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
                {/* Progress */}
                <div className='flex gap-3 border border-blue-500 rounded-md p-3 items-center'>
                    <div>
                        <span className='text-primary-100'>
                            <FaChartLine />
                        </span>
                    </div>
                    <div className='flex items-center gap-2 flex-1'>
                        <span className='text-nowrap text-customBlack-100 text-[14px] font-medium'>Progress:</span>
                        <div className='flex items-center gap-2 flex-1'>
                            <div className='flex-1 bg-gray-200 rounded-full h-2 overflow-hidden'>
                                <div 
                                    className={`h-full ${
                                        (goalData.progress || 0) >= 80 ? 'bg-green-500' :
                                        (goalData.progress || 0) >= 50 ? 'bg-yellow-500' :
                                        (goalData.progress || 0) >= 20 ? 'bg-blue-500' : 'bg-gray-400'
                                    }`}
                                    style={{ width: `${goalData.progress || 0}%` }}
                                ></div>
                            </div>
                            <span className='text-customBlack-100 text-[12px] whitespace-nowrap'>{goalData.progress || 0}%</span>
                        </div>
                    </div>
                </div>

                {/* Rating */}
                <div className='flex gap-3 border border-blue-500 rounded-md p-3 items-center'>
                    <div>
                        <span className='text-primary-100'>
                            <FaStar />
                        </span>
                    </div>
                    <div className='flex items-center gap-2 flex-1'>
                        <span className='text-nowrap text-customBlack-100 text-[14px] font-medium'>Rating:</span>
                        <div className='flex items-center gap-1'>
                            {(() => {
                                const rating = goalData.rating !== undefined && goalData.rating !== null 
                                    ? Number(goalData.rating) 
                                    : 0;
                                return [1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        className={`text-sm ${
                                            star <= rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                    >
                                        ★
                                    </span>
                                ));
                            })()}
                            <span className='text-customBlack-100 text-[12px] ml-1'>
                                ({goalData.rating !== undefined && goalData.rating !== null ? Number(goalData.rating) : 0}/5)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
                {/* Review Cycle */}
                <div className='flex gap-3 border border-blue-500 rounded-md p-3 items-center'>
                    <div>
                        <span className='text-primary-100'>
                            <LiaTasksSolid />
                        </span>
                    </div>
                    <div className='flex items-center gap-2 flex-1'>
                        <span className='text-nowrap text-customBlack-100 text-[14px] font-medium'>Review Cycle:</span>
                        <span className='text-customBlack-100 text-[12px]'>{goalData.pID?.label || 'N/A'}</span>
                    </div>
                </div>

                {/* Additional fields can go here if needed */}
                {goalData.comment && (
                    <div className='flex gap-3 border border-blue-500 rounded-md p-3 items-center'>
                        <div>
                            <span className='text-primary-100'>
                                <FaComment />
                            </span>
                        </div>
                        <div className='flex items-center gap-2 flex-1'>
                            <span className='text-nowrap text-customBlack-100 text-[14px] font-medium'>Comment:</span>
                            <span className='text-customBlack-100 text-[12px]'>{goalData.comment}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ViewGoal

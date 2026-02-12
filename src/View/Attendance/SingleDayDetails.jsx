import React, { useState, useEffect } from 'react'
import useStore from '../../Store/store'
import { showToast } from '../../Components/Toaster/Toaster'
import attendanceApi from '../../Model/Data/Attendance/Attendance'

const SingleDayDetails = (props) => {
    const { singleDayService, addMoreInput, updateSingleDayData, onDataRefreshed, searchingEmpValue, attendanceData } = props
    const data = singleDayService?.data

    // Get the attendance functions from the store
    const dailyAttAdjust = useStore((state) => state.dailyAttAdjust)
    const setManualAttendance = useStore((state) => state.setManualAttendance)

    // State for editable times - now supports infinite entries
    const [timePairs, setTimePairs] = useState([{ in: '', out: '' }])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [dataUpdateKey, setDataUpdateKey] = useState(0) // Force re-render when data updates
    const [userSubmitted, setUserSubmitted] = useState(false) // Track if user just submitted

    // Check if timings array is empty or null
    const hasTimings = data?.timings && data.timings.length > 0;

    // Function to convert Unix timestamp to time-only format (HH:MM)
    const convertTimestampToTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp * 1000);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }


    // Function to convert time to HH:MM format for API
    const convertTimeToHHMM = (timeString) => {
        if (!timeString) return '';
        return timeString; // Already in HH:MM format
    };

    // Helper: seconds -> "X Hours, Y Minutes"
    const secondsToHoursMinutesVerbose = (seconds) => {
        const total = Number(seconds) || 0;
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        return `${hours} Hours, ${minutes} Minutes`;
    };


    // Initialize state when data changes - ALWAYS get fresh data from main attendance data
    useEffect(() => {
        // Don't update modal times if user just submitted - keep their selected times
        if (userSubmitted) {
            return;
        }
        
        // Get the current day's data from the main attendance data (always fresh)
        const currentDateString = data?.date_string;
        let freshData = data;
        
        if (currentDateString && attendanceData?.attendanceAttr?.attendance) {
            const freshDayData = attendanceData.attendanceAttr.attendance.find(day => 
                day.date_string === currentDateString
            );
            if (freshDayData) {
                freshData = freshDayData;
            }
        }
        
        const timings = freshData?.timings || [];
        
        // Create pairs of In/Out from timings array
        // timings[0] = in_1, timings[1] = out_1, timings[2] = in_2, timings[3] = out_2, etc.
        const pairs = [];
        for (let i = 0; i < timings.length; i += 2) {
            const inTime = timings[i] ? convertTimestampToTime(timings[i]) : '';
            const outTime = timings[i + 1] ? convertTimestampToTime(timings[i + 1]) : '';
            pairs.push({ in: inTime, out: outTime });
        }
        
        // If no timings, start with one empty pair
        if (pairs.length === 0) {
            pairs.push({ in: '', out: '' });
        }

        setTimePairs(pairs);
    }, [data, dataUpdateKey, attendanceData, userSubmitted]);

    // Function to refresh individual attendance data
    const refreshIndividualAttendanceData = async () => {
        try {
            ////console.log('Refreshing individual attendance data...');

            // Get employee and month/year from searchingEmpValue
            let empId = searchingEmpValue?.empId?.value || searchingEmpValue?.empId || searchingEmpValue?.emp_id || data?.emp_id || data?.id || 9119528;
            
            // If empId is still an object, try to extract the value
            if (typeof empId === 'object' && empId !== null) {
                empId = empId.value || empId.id || empId.emp_id;
            }
            
            const year = searchingEmpValue?.year?.value || searchingEmpValue?.year || new Date().getFullYear();
            const month = searchingEmpValue?.month?.value || searchingEmpValue?.month || new Date().getMonth() + 1;

            // Prepare API data - unify payload for both calls
            const apiData = {
                empId: empId,
                emp_id: empId,
                month: month,
                year: year,
                filter: 'specific_month'
            };

            // Call both APIs in parallel
            const [individualRes, graphRes] = await Promise.all([
                attendanceApi.getIndividualDetail(apiData),
                attendanceApi.getAttendanceGraph(apiData)
            ]);

            if (individualRes && individualRes.data) {
                if (onDataRefreshed) {
                    // Pass both responses so parent can update calendar and chart together
                    onDataRefreshed(individualRes, graphRes);
                }
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    };

    // Handle Mark Present/Holiday actions
    const handleMarkAction = async (action) => {
        setIsSubmitting(true);
        setUserSubmitted(true);

        try {
            // Get employee ID and validate it
            let empId = searchingEmpValue?.empId?.value || searchingEmpValue?.empId || searchingEmpValue?.emp_id || data?.emp_id || data?.id;
            
            // If empId is still an object, try to extract the value
            if (typeof empId === 'object' && empId !== null) {
                empId = empId.value || empId.id || empId.emp_id;
            }
            
            // Check if employee is selected
            if (!empId || empId === '' || (typeof empId === 'object' && Object.keys(empId).length === 0)) {
                showToast('Please select an employee first', 'error');
                setIsSubmitting(false);
                setUserSubmitted(false);
                return;
            }
            
            const dateString = data?.date_string; // Format: "01-08-2025"
            
            // Convert date format from "01-08-2025" to "2025-08-01"
            const [day, month, year] = dateString.split('-');
            const formattedDate = `${year}-${month}-${day}`;

            let result;

            if (action === 'absent') {
                // Use MarkAbsent API for absent action
                const payload = {
                    emp_id: parseInt(empId),
                    date: formattedDate,
                    reason: "unauthorized_absence",
                    admin_notes: "Marked absent by admin",
                    penalty_applicable: true,
                    notify_employee: true
                };

                // console.log('Sending MarkAbsent payload:', payload);
                
                const response = await attendanceApi.MarkAbsent(payload);
                result = {
                    success: response.status === 200,
                    error: response.data?.ERROR_DESCRIPTION || 'Failed to mark absent'
                };
            } else {
                // Use existing setManualAttendance for present/holiday
                const payload = {
                    emp_id: empId,
                    date: formattedDate,
                    att_status: action === 'present' ? 'present' : 'holiday',
                    reason: action === 'holiday' ? 'National holiday' : undefined
                };

                // console.log('Sending payload:', payload);
                result = await setManualAttendance(payload);
            }

            if (result.success) {
                showToast('Attendance marked successfully', 'success');

                // Update the singleDayService data
                if (updateSingleDayData) {
                    const updatedData = {
                        ...data,
                        att_label: action === 'present' ? 'P' : action === 'holiday' ? 'H' : 'A',
                        timings: [] // Empty for marked attendance
                    };
                    updateSingleDayData(updatedData);
                    setDataUpdateKey(prev => prev + 1);
                }

                // Refresh attendance data
                setTimeout(async () => {
                    await refreshIndividualAttendanceData();
                }, 300);

                // Close modal after a short delay
                setTimeout(() => {
                    setUserSubmitted(false);
                    addMoreInput();
                }, 1000);

            } else {
                // Handle specific error cases
                if (result.error && result.error.includes('person bio ID is not registered')) {
                    showToast('person bio ID is not registered Please update employee information.', 'error');
                } else {
                    showToast(result.error || `Failed to mark as ${action}`, 'error');
                }
            }
        } catch (error) {
            showToast(error.response.data.ERROR_DESCRIPTION, 'error');
            // showToast(`An error occurred while marking as ${action}`, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle form submission
    const handleSubmit = async () => {

        // Check if employee is selected
        let empId = searchingEmpValue?.empId?.value || searchingEmpValue?.empId || searchingEmpValue?.emp_id || data?.emp_id || data?.id;
        
        // If empId is still an object, try to extract the value
        if (typeof empId === 'object' && empId !== null) {
            empId = empId.value || empId.id || empId.emp_id;
        }
        
        // Check if employee is selected
        if (!empId || empId === '' || (typeof empId === 'object' && Object.keys(empId).length === 0)) {
            showToast('Please select an employee first', 'error');
            return;
        }

        setIsSubmitting(true);
        setUserSubmitted(true); // Mark that user has submitted

        try {
            // Build payload dynamically from all time pairs
            const payload = {
                id: data?.id || 12345, // Use the ID from the data or fallback
            };

            // Add time pairs that exist - in_time, out_time, in_time2, out_time2, etc.
            timePairs.forEach((pair, index) => {
                const inTimeFormatted = convertTimeToHHMM(pair.in);
                const outTimeFormatted = convertTimeToHHMM(pair.out);
                const inTime = inTimeFormatted && inTimeFormatted.trim() !== '' ? inTimeFormatted : 0;
                const outTime = outTimeFormatted && outTimeFormatted.trim() !== '' ? outTimeFormatted : 0;

                if (index === 0) {
                    payload.in_time = inTime;
                    payload.out_time = outTime;
                } else {
                    payload[`in_time${index + 1}`] = inTime;
                    payload[`out_time${index + 1}`] = outTime;
                }
            });

            // Explicitly send 0 for removed time pairs so backend clears them
            const maxPairsToClear = 4;
            for (let i = timePairs.length; i < maxPairsToClear; i++) {
                const suffix = i + 1;
                payload[`in_time${suffix}`] = 0;
                payload[`out_time${suffix}`] = 0;
            }

            // Call the API
            const result = await dailyAttAdjust(payload);

            if (result.success) {
                // Show success message first
                showToast('Attendance updated successfully!', 'success');

                // Update the singleDayService data with new timings from API response
                if (result.data && result.data.DB_DATA) {
                    const { in_1, out_1 } = result.data.DB_DATA;

                    // Update the singleDayService data so it persists when modal reopens
                    if (updateSingleDayData) {
                        const updatedData = {
                            ...data,
                            timings: [in_1, out_1]
                        };
                        updateSingleDayData(updatedData);
                        
                        // Force the useEffect to trigger by updating the key
                        setDataUpdateKey(prev => prev + 1);
                    }

                    // Call refreshIndividualAttendanceData() with a delay to ensure server has processed the update
                    setTimeout(async () => {
                        await refreshIndividualAttendanceData();
                    }, 2000);
                }

                // Close modal after a short delay
                setTimeout(() => {
                    setUserSubmitted(false); // Reset the flag when modal closes
                    addMoreInput(); // Close the modal
                }, 1000);

            } else {
                showToast(result.error || 'Failed to adjust attendance', 'error');
            }
        } catch (error) {
            showToast('An error occurred while adjusting attendance', 'error');
        } finally {
            setIsSubmitting(false);
            // Don't reset userSubmitted here - let it reset when modal closes
        }
    };


    // Handle time input change
    const handleTimeChange = (index, field, value) => {
        const newPairs = [...timePairs];
        newPairs[index][field] = value;
        setTimePairs(newPairs);
    };

    // Add a new time pair
    const handleAddTimePair = () => {
        setTimePairs([...timePairs, { in: '', out: '' }]);
    };

    // Remove a time pair
    const handleRemoveTimePair = (index) => {
        if (timePairs.length > 1) {
            const newPairs = timePairs.filter((_, i) => i !== index);
            setTimePairs(newPairs);
        }
    };
    
    // Format time for display
    const formatTimeDisplay = (time24) => {
        if (!time24) return '--:-- --';
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${String(hour12).padStart(2, '0')}:${minutes} ${ampm}`;
    };

    return (
        <div className='flex flex-col h-full'>
            {/* Attendance Summary Info - Only show when there are timings */}
            {hasTimings && (
                <div className='flex flex-col items-center justify-center px-2 py-3 bg-gray-50 text-xs text-gray-700 border-b rounded-md'>
                    <div className='flex items-center justify-center gap-x-4'>
                        {timePairs.map((pair, idx) => (
                            <div key={idx} className='flex flex-nowrap items-center gap-x-3 whitespace-nowrap'>
                                <span>
                                    <strong>In{timePairs.length > 1 ? ` ${idx + 1}` : ''}:</strong> {formatTimeDisplay(pair.in)}
                                </span>
                                <span>
                                    <strong>Out{timePairs.length > 1 ? ` ${idx + 1}` : ''}:</strong> {formatTimeDisplay(pair.out)}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className='mt-2 flex items-center justify-center gap-x-4'>
                        <span><strong>Expected Hours:</strong> {secondsToHoursMinutesVerbose(data?.expected)}</span>
                        <span><strong>Earned&nbsp;Hours:</strong> {secondsToHoursMinutesVerbose(data?.earned)}</span>
                        <span><strong>Overtime:</strong> {secondsToHoursMinutesVerbose(data?.overtime)}</span>
                    </div>
                </div>
            )}

            {!hasTimings ? (
                // Show action buttons when no timings
                <div className='flex flex-col justify-center items-center gap-6 pb-6'>
                    <span className='border-b-2 border-white text-white px-4 text-center font-medium '>
                        {data?.att_label === "MAL" ? "Monthly Allowed Leave" 
                        : data?.att_label === "H" && data?.extra ? data.extra
                        : data?.att_label === "H" && data?.extra === null ? "Weekly Holiday" 
                        : data?.att_label === "A" ? "Absent" 
                        : data?.att_label === "CL" ? "Casual Leave" 
                        : data?.att_label === "AL" ? "Annual Leave" 
                        : data?.att_label === "L" ? data?.extra 
                        : data?.extra === "Manually marked holiday" ? "Manually Marked holiday" 
                        : data?.extra ? data.extra 
                        : ""}
                    </span>
                    <div className='flex justify-center gap-4'>
                        <button
                            onClick={() => handleMarkAction('present')}
                            disabled={isSubmitting}
                            className='px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-w-[120px] shadow-sm'
                        >
                            {isSubmitting ? 'Processing...' : 'Mark Present'}
                        </button>
                        <button
                            onClick={() => handleMarkAction('holiday')}
                            disabled={isSubmitting}
                            className='px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-w-[120px] shadow-sm'
                        >
                            {isSubmitting ? 'Processing...' : 'Mark as Holiday'}
                        </button>
                    </div>
                </div>
            ) : (
                // Show time input fields based on number of pairs
                <div className='flex flex-col flex-1 overflow-hidden'>
                    <div className='flex-1 overflow-y-auto px-6 py-4'>
                        {/* Render input fields based on number of time pairs */}
                        {timePairs.map((pair, index) => (
                            <div key={index} className='mb-4 border border-gray-200 rounded-lg p-4 bg-white'>
                                <div className='flex items-center justify-between mb-3'>
                                    <h4 className='text-sm font-semibold text-gray-700'>Time Pair {index + 1}</h4>
                                    {timePairs.length > 1 && (
                                        <button
                                            type='button'
                                            onClick={() => handleRemoveTimePair(index)}
                                            className='text-red-600 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors'
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                
                                {/* In X */}
                                <div className='flex items-center gap-2 mb-3'>
                                    <label className='text-sm font-medium w-16 text-gray-700'>
                                        In {index + 1}
                                    </label>
                                    <input
                                        className='flex-1 text-sm text-gray-700 rounded-md py-2.5 px-3 border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white'
                                        type='time'
                                        value={pair.in}
                                        onChange={(e) => handleTimeChange(index, 'in', e.target.value)}
                                        placeholder='--:--'
                                    />
                                </div>

                                {/* Out X */}
                                <div className='flex items-center gap-2'>
                                    <label className='text-sm font-medium w-16 text-gray-700'>
                                        Out {index + 1}
                                    </label>
                                    <input
                                        className='flex-1 text-sm text-gray-700 rounded-md py-2.5 px-3 border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white'
                                        type='time'
                                        value={pair.out}
                                        onChange={(e) => handleTimeChange(index, 'out', e.target.value)}
                                        placeholder='--:--'
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Add New Time Pair Button */}
                        <div className='flex justify-center mb-4'>
                            <button
                                type='button'
                                onClick={handleAddTimePair}
                                className='px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors duration-200 shadow-sm flex items-center gap-2'
                            >
                                <span>+</span>
                                <span>Add Time Pair</span>
                            </button>
                        </div>

                    </div>

                    {/* Action Buttons - Fixed at bottom */}
                    <div className='flex justify-center gap-3 px-6 py-4 bg-gray-50 border-t mt-auto rounded-md'>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className='px-10 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm'
                        >
                            {isSubmitting ? 'Saving...' : 'Adjust Timings'}
                        </button>
                        <button
                            onClick={() => handleMarkAction('absent')}
                            disabled={isSubmitting}
                            className='px-10 py-3 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm'
                        >
                            {isSubmitting ? 'Processing...' : 'Mark Absent'}
                        </button>
                        <button
                            onClick={() => handleMarkAction('holiday')}
                            disabled={isSubmitting}
                            className='px-10 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm'
                        >
                            {isSubmitting ? 'Processing...' : 'Mark Holiday'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SingleDayDetails
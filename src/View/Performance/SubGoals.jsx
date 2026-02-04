import React, { useState } from 'react'
import useGoalServices from '../../ViewModel/PerformnaceViewModel/goalServices'
import { Button, MenuItem, Typography } from '@material-tailwind/react'
import { FaStar } from 'react-icons/fa'

import useDropdownService from '../../services/__dropDownHoverService'
import usePerformanceServices from '../../ViewModel/PerformnaceViewModel/performanceServices'
import { FaChevronDown, FaArrowLeft } from 'react-icons/fa6'
import { subGoalsActionList } from '../../services/__performanceServices'

import { motion } from 'framer-motion'
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog'
import AddEditGoal from './AddEditGoal'
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer'
import { useOutletContext, useParams, useNavigate } from 'react-router'
import useStore from '../../Store/store'
import ProfileManagement from './ProfileManagement'
import EmployeeSubFeed from './EmployeeSubFeed'

const SubGoals = () => {
    const { handleSubGoalList, goalsValue, handleToggleSubGoalDelete, deleteSubGoal, addGoalValue, toggleAddGoal, performance, handleSelectGoals,
        handleChangeAddGoal, handleNewGoal, handleRemoveEmp

    } = useGoalServices();

    // Get context from parent component
    const { handleProfileView, setShowReviewCycle, handleOpenRatingModal } = useOutletContext() || {}

    // Get data from store
    const { subComptencyData, subGoalsData, gettingSubCompetency } = useStore()

    // Get URL parameters and navigation
    const params = useParams()
    const navigate = useNavigate()

    console.log('subGoalsData from store:', subGoalsData)
    console.log('subComptencyData from store:', subComptencyData)
    console.log('employeeProfile state:', employeeProfile)
    console.log('URL params:', params)
    console.log('Profile data for ProfileManagement:', getProfileData())

    const [currentView, setCurrentView] = useState('goals') // 'goals', 'competency', or 'feedback'
    const [employeeProfile, setEmployeeProfile] = useState(null)

    // Extract employee profile from sub goals data
    React.useEffect(() => {
        if (subGoalsData && subGoalsData.length > 0) {
            const firstGoal = subGoalsData[0];
            setEmployeeProfile({
                employee_id: firstGoal.employee_id,
                employee_name: firstGoal.employee_name
            });
        }
    }, [subGoalsData]);

    // Extract employee profile from competency data (when coming directly from competency tab)
    React.useEffect(() => {
        if (subComptencyData?.emp_DATA) {
            // Always update employee profile from competency data when available
            setEmployeeProfile({
                employee_id: params.employeeId || 'N/A', // Get from URL params
                employee_name: subComptencyData.emp_DATA.name
            });
        }
    }, [subComptencyData, params.employeeId]);

    // Auto-switch to competency view if coming directly from competency tab
    React.useEffect(() => {
        if (!subGoalsData || subGoalsData.length === 0) {
            if (subComptencyData && subComptencyData.length > 0) {
                setCurrentView('competency')
            }
        }
    }, [subGoalsData, subComptencyData]);

    // Auto-fetch competency data when coming directly from competency tab
    React.useEffect(() => {
        const fetchCompetencyData = async () => {
            if ((!subGoalsData || subGoalsData.length === 0) && params.employeeId) {
                try {
                    await gettingSubCompetency(params.employeeId)
                    setCurrentView('competency')
                    console.log('Auto-fetched competency data for employee:', params.employeeId)
                } catch (error) {
                    console.error('Error auto-fetching competency data:', error)
                }
            }
        }
        
        fetchCompetencyData()
    }, [params.employeeId, subGoalsData, gettingSubCompetency])

    const handleCompetencyTabClick = async () => {
        try {
            setCurrentView('competency')
            // Fetch competency data for the current employee
            if (employeeProfile?.employee_id) {
                await gettingSubCompetency(employeeProfile.employee_id)
                console.log('Competency data fetched for employee:', employeeProfile.employee_id)
            } else if (params.employeeId) {
                // If no employee profile but we have employee ID from URL, fetch competency data
                await gettingSubCompetency(params.employeeId)
                console.log('Competency data fetched for employee from URL:', params.employeeId)
            }
        } catch (error) {
            console.error('Error fetching competency data:', error)
        }
    }

    const handleGoalsTabClick = () => {
        setCurrentView('goals')
    }

    const handleFeedbackTabClick = () => {
        setCurrentView('feedback')
    }

    const handleBackToMain = () => {
        navigate('/performance/goals')
    }

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FaStar
                    key={i}
                    className={`text-lg ${i <= rating ? 'text-yellow-400 fill-current' : 'text-yellow-300'}`}
                />
            );
        }
        return stars;
    };



    const tableHeader = [
        'Emp ID', 'Employee Name', 'Title', 'Score', 'Status', 'Rating', 'Actions'
    ]

    const { getDropdownPosition, triggerRefs } = useDropdownService()
    const { toggleMenuValue, openMenuValue, } = usePerformanceServices()

    // Format profile data for ProfileManagement component
    const getProfileData = () => {
        if (subComptencyData?.emp_DATA) {
            return {
                name: subComptencyData.emp_DATA.name,
                dp: subComptencyData.emp_DATA.dp,
                designationObj: subComptencyData.emp_DATA.designationObj
            };
        } else if (employeeProfile) {
            return {
                name: employeeProfile.employee_name,
                dp: null,
                designationObj: subComptencyData?.emp_DATA?.designationObj || null
            };
        }
        return null;
    };







    return (
        <>
            <div className='flex flex-col gap-6 py-2 pb-1 pl-2 pr-4'>
                {/* Employee Profile Management Component */}
                <ProfileManagement 
                    profileData={getProfileData()}
                    onClose={null} // No close functionality needed here
                />

                {/* Back Navigation */}
                <div className="flex items-center mb-4">
                    <button
                        onClick={handleBackToMain}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                        <FaArrowLeft className="text-sm" />
                        Back to Goals
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={handleGoalsTabClick}
                        className={`px-6 py-3 font-medium transition-colors ${currentView === 'goals'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Goals
                    </button>
                    <button
                        onClick={handleCompetencyTabClick}
                        className={`px-6 py-3 font-medium transition-colors ${currentView === 'competency'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Competency
                    </button>
                    <button
                        onClick={handleFeedbackTabClick}
                        className={`px-6 py-3 font-medium transition-colors ${currentView === 'feedback'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Feedback
                    </button>
                </div>

                {/* Content based on current view */}
                {currentView === 'goals' ? (
                    /* Sub Goals Table */
                    <table className="w-full min-w-max text-left h-full">
                    <thead className='sticky top-[-9px]'>
                    <tr>
                        {tableHeader?.map((head, i) => (
                            <th
                                key={i}
                                className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                            >
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-normal leading-none opacity-70 capitalize"
                                >
                                    {head}
                                </Typography>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {subGoalsData?.map((ele, i) => {
                        const isLast = i === subGoalsData?.length - 1;
                        const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                        return (
                            <tr key={i}>
                                <td className={classes}>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                    >
                                        {ele.employee_id}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                    >
                                        {ele.employee_name}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                    >
                                        {ele.name}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                    >
                                        {ele.score}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-normal"
                                    >
                                        {ele.status === '0' ? 'Not Started' : ele.status === '1' ? 'In Progress' : 'Completed'}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleOpenRatingModal(ele)}>
                                        {renderStars(ele.rating || 0)}
                                    </div>
                                </td>
                                <td className={classes} >
                                    <div
                                        ref={(el) => (triggerRefs.current[i] = el)}
                                        onMouseEnter={() => toggleMenuValue(i, true)} onMouseLeave={() => toggleMenuValue(i, false)}
                                        className='relative'>
                                        <Button

                                            className='flex items-center gap-2 capitalize font-normal text-[13px] border border-[#3da5f4] text-[#3da5f4] px-[10px] py-[5px]'
                                            variant="outlined"
                                        >
                                            Action
                                            <FaChevronDown
                                                strokeWidth={2.5}
                                                className={`transition-transform transform ${openMenuValue[i] ? "rotate-180" : ""}`}
                                            />
                                        </Button>
                                        {openMenuValue[i] && (

                                            <div
                                                className={`border border-gray-200 rounded-lg absolute z-10 bg-white w-[200px] left-[-120px] shadow-md ${getDropdownPosition(i) === 'top' ? 'bottom-full' : 'top-full'
                                                    }`}
                                            >
                                                <motion.div
                                                    initial={{ opacity: 0, y: getDropdownPosition(i) === 'top' ? -50 : 50 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: getDropdownPosition(i) === 'top' ? -50 : 50 }}
                                                    transition={{ duration: 0.2 }}
                                                >

                                                    <ul className="flex w-full flex-col gap-1">
                                                        {subGoalsActionList.map(menuItem => (
                                                            <MenuItem className='flex items-center justify-between' key={menuItem.id}
                                                                onClick={(e) => {
                                                                    e.stopPropagation(); // Prevent the event from bubbling up
                                                                    if (menuItem.name === 'Start') {
                                                                        handleOpenRatingModal(ele);
                                                                    } else {
                                                                        handleSubGoalList(ele, menuItem);
                                                                    }
                                                                }}
                                                            >
                                                                <Typography variant="small">{menuItem.name}</Typography>
                                                                <span>{menuItem.icon}</span>
                                                            </MenuItem>
                                                        ))}
                                                    </ul>
                                                </motion.div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        ) : (
            /* Competency Table */
            <table className="w-full min-w-max text-left h-full">
                <thead className='sticky top-[-9px]'>
                    <tr>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                Competency Name
                            </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                Rating
                            </Typography>
                        </th>
                        <th className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                            <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                Actions
                            </Typography>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {subComptencyData?.map((competency, i) => {
                        const isLast = i === subComptencyData?.length - 1;
                        const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                        return (
                            <tr key={i}>
                                <td className={classes}>
                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                        {competency.competency}
                                    </Typography>
                                </td>
                                <td className={classes}>
                                    <div className="flex">
                                        {renderStars(competency.rating)}
                                    </div>
                                </td>
                                <td className={classes}>
                                    <div className="flex gap-2">
                                        <button className="text-blue-500 hover:text-blue-700">
                                            <FaStar className="text-sm" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        )}

        {/* Empty state messages */}
        {subGoalsData?.length === 0 && currentView === 'goals' && (
            <div className="text-center py-8">
                <Typography variant="h6" color="gray" className="font-normal">
                    No goals found for this employee
                </Typography>
            </div>
        )}

        {subComptencyData?.length === 0 && currentView === 'competency' && (
            <div className="text-center py-8">
                <Typography variant="h6" color="gray" className="font-normal">
                    No competencies found for this employee
                </Typography>
            </div>
        )}

        {/* Feedback View */}
        {currentView === 'feedback' && (
            <EmployeeSubFeed />
        )}

            </div>
            {
                goalsValue.show &&

                <ConfirmationDialog
                    openDialog={goalsValue.show}
                    handleOpen={handleToggleSubGoalDelete}
                    handleConfirm={deleteSubGoal}
                    title='Delete Goal'
                    message={`Are you sure to Delete this Goal`}

                />
            }

            {addGoalValue.show &&
                <PortalDrawer
                    open={addGoalValue.show}
                    compo={
                        <AddEditGoal
                            performance={goalsValue.performance}
                            handleSelectGoals={handleSelectGoals}
                            addGoalValue={addGoalValue}
                            handleChangeAddGoal={handleChangeAddGoal}
                            handleNewGoal={handleNewGoal}
                            handleRemoveEmp={handleRemoveEmp}
                        />
                    }
                    title='Edit Goal'
                    closeDrawer={toggleAddGoal}
                    widthSize={550}
                />
            }
        </>
    )
}

export default SubGoals
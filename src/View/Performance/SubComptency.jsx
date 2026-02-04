import { Typography, Button } from '@material-tailwind/react';
import React, { useState, useEffect } from 'react'
import { FaTrash, FaArrowLeft, FaStar, FaUser, FaCheck, FaEye } from 'react-icons/fa6';
import useCometencyServices from '../../ViewModel/PerformnaceViewModel/competencyServices';
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog';
import { useNavigate, useOutletContext } from 'react-router';
import useStore from '../../Store/store';
import ProfileManagement from "./ProfileManagement"
import EmployeeSubFeed from './EmployeeSubFeed'
const SubComptency = () => {
    const { subComptencyData, handleDeleteSubCompetency, handleDeleteSubCompetencyToggle, competencyDeleteValue, confirmDeleteCompetency, gettingSubComptency } = useCometencyServices()
    const navigate = useNavigate()
    const { handleProfileView, handleOpenRatingModal, handleOpenProgressModal, setShowReviewCycle } = useOutletContext() || {}

    // Get current employee data from store
    const { currentEmployeeId, gettingGoalsByEmployeeId } = useStore()

    const [currentView, setCurrentView] = useState('competencies') // 'competencies', 'goals', or 'feedback'
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)

    const handleBackToCompetencies = () => {
        if (currentView === 'goals') {
            setCurrentView('competencies')
            setShowReviewCycle && setShowReviewCycle(true)
        } else {
            navigate('/performance/competency')
        }
    }

    const handleEyeClick = async (employeeId) => {
        try {
            setSelectedEmployeeId(employeeId)
            setCurrentView('goals')

            // Hide the Performance Review Cycle when viewing goals
            if (setShowReviewCycle) {
                setShowReviewCycle(false)
            }

            // Fetch goals for this employee
            await gettingGoalsByEmployeeId(employeeId)

            // Trigger profile view
            if (handleProfileView) {
                handleProfileView(employeeId)
            }
        } catch (error) {
            console.error('Error fetching employee goals:', error)
        }
    }

        const handleCompetencyClick = async (employeeId) => {
        try {
            setSelectedEmployeeId(employeeId)
            setCurrentView('competencies')
            
            // Show the Performance Review Cycle when viewing competencies
            if (setShowReviewCycle) {
                setShowReviewCycle(true)
            }
            
            // Fetch sub-competencies for this employee
            await gettingSubComptency(employeeId)
            
            // Trigger profile view
            if (handleProfileView) {
                handleProfileView(employeeId)
            }
        } catch (error) {
            console.error('Error fetching employee competencies:', error)
        }
    }

    const handleFeedbackTabClick = () => {
        setCurrentView('feedback')
    }

    const handleBackToMain = () => {
        navigate('/performance/competency')
    }

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FaStar
                    key={i}
                    className={`text-lg ${i <= rating ? 'text-yellow-400 fill-current' : 'text-yellow-300'
                        }`}
                />
            );
        }
        return stars;
    };



    // console.log('This is test')


    return (
        <>
            <div className='flex flex-col gap-6 py-2 pb-1 pl-2 pr-4'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <Button
                            variant="text"
                            className="flex items-center gap-2"
                            onClick={handleBackToMain}
                        >
                            <FaArrowLeft className="h-4 w-4" />
                            Back to Competency
                        </Button>
                        <div>
                            {/* <Typography variant="h5" color="blue-gray">
                                {currentView === 'goals' ? 'Employee Goals' : 'Employee Competencies'}
                            </Typography> */}
                            {subComptencyData?.[0] && (
                                <Typography variant="small" color="gray" className="font-normal">
                                    Employee: {subComptencyData[0].employee_name} ({subComptencyData[0].employee_id})
                                </Typography>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setCurrentView('competencies')}
                        className={`px-6 py-3 font-medium transition-colors ${currentView === 'competencies'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Competency
                    </button>
                    <button
                        onClick={() => setCurrentView('goals')}
                        className={`px-6 py-3 font-medium transition-colors ${currentView === 'goals'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Goals
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
                {currentView === 'competencies' && (
                    <div className="bg-white rounded-lg p-6">
                    {subComptencyData?.map((ele, index) => (
                        <div key={index}>
                            <div className="flex items-center justify-between py-4">
                                {/* Left side - Icon and Skill Name */}
                                <div className="flex items-center gap-4">
                                    {/* Blue icon with user silhouette and checkmark */}
                                    <div className="relative">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <FaUser className="text-blue-600 text-lg" />
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                                <FaCheck className="text-white text-xs" />
                                            </div>
                                        </div>
                                    </div>

                                    <Typography variant="body1" color="gray" className="font-normal">
                                        {ele?.competency}
                                    </Typography>
                                </div>



                                {/* Right side - Star Rating and Action Icons */}
                                <div className="flex items-center gap-3">
                                    {/* Star Rating */}
                                    <div className="flex items-center gap-1">
                                        {renderStars(ele?.rating || 0)}
                                    </div>
                                    {/* <div className="flex items-center gap-1">
                                        {renderStars(ele?.rating || 0)}
                                    </div> */}

                                    {/* Action Icons */}
                                    <div className="flex items-center gap-2">
                                        {/* Eye icon for viewing goals */}
                                        <button
                                            onClick={() => handleEyeClick(ele?.employee_id)}
                                            className="text-blue-500 hover:text-blue-700 transition-colors"
                                            title="View Goals"
                                        >
                                            <FaEye className="text-lg" />
                                        </button>

                                        {/* Competency icon for viewing sub-competencies */}
                                        <button
                                            onClick={() => handleCompetencyClick(ele?.employee_id)}
                                            className="text-green-500 hover:text-green-700 transition-colors"
                                            title="View Sub-Competencies"
                                        >
                                            <FaUser className="text-lg" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Dashed separator line (except for last item) */}
                            {index < subComptencyData.length - 1 && (
                                <div className="border-b border-dashed border-gray-300"></div>
                            )}
                        </div>
                    ))}
                    </div>
                )}

                {/* Goals View */}
                {currentView === 'goals' && (
                    <div className="text-center py-8">
                        <Typography variant="h6" color="gray" className="font-normal">
                            Goals view will be handled by SubGoals component
                        </Typography>
                    </div>
                )}

                {/* Feedback View */}
                {currentView === 'feedback' && (
                    <EmployeeSubFeed />
                )}
            </div>

            <ConfirmationDialog
                openDialog={competencyDeleteValue.show}
                handleOpen={handleDeleteSubCompetencyToggle}
                handleConfirm={confirmDeleteCompetency}
                title='Delete Competency'
                message={`Are you sure to Delete this Competency`}
            />
        </>
    )
}

export default SubComptency
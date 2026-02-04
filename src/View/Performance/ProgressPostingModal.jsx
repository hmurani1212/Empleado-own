import React, { useState, useEffect } from 'react';
import { Typography, Button } from '@material-tailwind/react';
import { FaChevronDown, FaChevronUp, FaChartLine, FaStar } from 'react-icons/fa';
import performanceApi from '../../Model/Data/Performance/Performance';
import { showToast } from '../../Components/Toaster/Toaster';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';

const ProgressPostingModal = ({ open, onClose, goal, onProgressUpdate }) => {
    const [comment, setComment] = useState('');
    const [progress, setProgress] = useState(goal?.progress || 0);
    const [rating, setRating] = useState(goal?.rating || 0);
    const [expandedUpdates, setExpandedUpdates] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previousUpdates, setPreviousUpdates] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (open && goal) {
            setProgress(goal.progress || 0);
            setRating(goal.rating || 0);
            setComment('');
            loadProgressHistory();
        }
    }, [open, goal]);

    const loadProgressHistory = async () => {
        if (!goal?._id) return;
        
        setLoadingHistory(true);
        try {
            const response = await performanceApi.getGoalProgressHistory(goal._id);
            if (response.status === 200 && response.data.STATUS === "SUCCESSFUL") {
                setPreviousUpdates(response.data.DB_DATA || []);
            } else {
                // Fallback to mock data if API is not ready
                setPreviousUpdates([
                    {
                        id: 1,
                        date: '14-Jun-2034',
                        comment: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
                        progress: 50
                    },
                    {
                        id: 2,
                        date: '10-Jun-2034',
                        comment: 'Making good progress on the implementation phase',
                        progress: 30
                    },
                    {
                        id: 3,
                        date: '05-Jun-2034',
                        comment: 'Initial setup completed successfully',
                        progress: 15
                    }
                ]);
            }
        } catch (error) {
            console.error('Error loading progress history:', error);
            // Fallback to mock data
            setPreviousUpdates([
                {
                    id: 1,
                    date: '14-Jun-2034',
                    comment: 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
                    progress: 50
                },
                {
                    id: 2,
                    date: '10-Jun-2034',
                    comment: 'Making good progress on the implementation phase',
                    progress: 30
                },
                {
                    id: 3,
                    date: '05-Jun-2034',
                    comment: 'Initial setup completed successfully',
                    progress: 15
                }
            ]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSubmit = async () => {
        if (!comment.trim()) {
            showToast('Please enter a comment', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const updateData = {
                goal_id: goal._id,
                comment: comment.trim(),
                progress: progress,
                employee_id: goal.employee_id || goal.employeeId
            };

            const response = await performanceApi.rateGoal({
                ...updateData,
                rating: rating
            });
            
            if (response.status === 200 && response.data.STATUS === "SUCCESSFUL") {
                showToast('Progress updated successfully', 'success');
                
                // Call the parent callback
                if (onProgressUpdate) {
                    onProgressUpdate({
                        ...updateData,
                        rating,
                        goalId: goal._id,
                        timestamp: new Date().toISOString()
                    });
                }

                // Close modal
                onClose();
            } else {
                showToast(response.data?.ERROR_DESCRIPTION || 'Failed to update progress', 'error');
            }
        } catch (error) {
            console.error('Error updating progress:', error);
            showToast('Failed to update progress. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRatingSelect = (value) => {
        setRating(value);
    };

    const toggleUpdate = (updateId) => {
        setExpandedUpdates(prev => ({
            ...prev,
            [updateId]: !prev[updateId]
        }));
    };

    const handleProgressChange = (e) => {
        const value = parseInt(e.target.value);
        setProgress(Math.max(0, Math.min(100, value)));
    };

    if (!open) return null;

    const drawerContent = (
        <div className="space-y-6 py-2">
                    {/* Comment Input */}
                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-2 block">
                            Comment
                        </Typography>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Enter Comment"
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Rating Input */}
                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-2 block">
                            Rating
                        </Typography>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleRatingSelect(value)}
                                    className="focus:outline-none"
                                    disabled={isSubmitting}
                                    title={`Rate ${value} star${value > 1 ? 's' : ''}`}
                                >
                                    <FaStar
                                        className={`text-2xl ${
                                            value <= rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Progress Input */}
                    <div>
                        <Typography variant="small" color="blue-gray" className="font-medium mb-2 block">
                            Edit progress
                        </Typography>
                        <div className="space-y-2">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress}
                                onChange={handleProgressChange}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                disabled={isSubmitting}
                            />
                            <div className="text-right">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    {progress}%
                                </Typography>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        variant="filled"
                        color="blue"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !comment.trim()}
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>

                    {/* Previous Updates */}
                    <div className="space-y-3">
                        <Typography variant="h6" color="blue-gray" className="font-semibold">
                            Previous Updates
                        </Typography>
                        {loadingHistory ? (
                            <div className="text-center py-4">
                                <Typography variant="small" color="gray" className="font-normal">
                                    Loading history...
                                </Typography>
                            </div>
                        ) : previousUpdates.length === 0 ? (
                            <div className="text-center py-4">
                                <Typography variant="small" color="gray" className="font-normal">
                                    No previous updates found
                                </Typography>
                            </div>
                        ) : (
                            previousUpdates.map((update) => (
                            <div key={update.id} className="border border-gray-200 rounded-lg">
                                <button
                                    onClick={() => toggleUpdate(update.id)}
                                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
                                >
                                    <Typography variant="small" color="blue-gray" className="font-medium">
                                        Last Modified {update.date}
                                    </Typography>
                                    {expandedUpdates[update.id] ? (
                                        <FaChevronUp className="text-gray-500" />
                                    ) : (
                                        <FaChevronDown className="text-gray-500" />
                                    )}
                                </button>
                                
                                {expandedUpdates[update.id] && (
                                    <div className="px-3 pb-3 space-y-3">
                                        <div className="flex items-start gap-2">
                                            <span className="text-blue-500 mt-1 flex-shrink-0">💬</span>
                                            <Typography variant="small" color="gray" className="font-normal">
                                                {update.comment}
                                            </Typography>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FaChartLine className="text-green-500" />
                                            <Typography variant="small" color="gray" className="font-normal">
                                                {update.progress}%
                                            </Typography>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                        )}
                    </div>
                    
                </div>
    );

    return (
        <PortalDrawer
            open={open}
            closeDrawer={onClose}
            title="Progress Posting"
            widthSize={520}
            compo={drawerContent}
        />
    );
};

export default ProgressPostingModal;

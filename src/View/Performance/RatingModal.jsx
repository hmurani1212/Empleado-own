import React, { useState, useEffect } from "react";
import { Typography, Button, IconButton } from "@material-tailwind/react";
import { FaStar } from "react-icons/fa";
import performanceApi from "../../Model/Data/Performance/Performance";
import { showToast } from "../../Components/Toaster/Toaster";
import AccordionCustomIcon from "../../Components/Accordian/Accordian";

const RatingModal = ({ open, onClose, goal, onRatingUpdate, lastWeekComments = [] }) => {
  // console.log('data is redirecting here', lastWeekComments)
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [progress, setProgress] = useState(goal?.progress || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && goal) {
      setRating(goal.rating || 0);
      setComment("");
      setProgress(goal.progress || 0);
    }
  }, [open, goal]);

  const handleStarClick = (starRating) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating) => {
    setHoverRating(starRating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleProgressChange = (e) => {
    const value = parseInt(e.target.value);
    setProgress(Math.max(0, Math.min(100, value)));
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      showToast("Please enter a comment", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the progress payload with rating included
      const progressData = {
        comment: comment.trim(),
        progress: progress,
        rating: rating, // Include rating in the progress data
        goal_id: goal._id,
        entry_time: new Date().toISOString().split('T')[0] // Format as YYYY-MM-DD
      };

      // Only call the create_progress endpoint
      const progressResponse = await performanceApi.createProgress(progressData);

      if (progressResponse.status === 200 && progressResponse.data.STATUS === "SUCCESSFUL") {
        showToast("Progress and rating updated successfully", "success");

        // Call the parent callback
        if (onRatingUpdate) {
          onRatingUpdate({
            ...progressData,
            goalId: goal._id,
            timestamp: new Date().toISOString(),
          });
        }

        // Close modal
        onClose();
      } else {
        showToast(
          progressResponse.data?.ERROR_DESCRIPTION || "Failed to update progress and rating",
          "error"
        );
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      showToast("Failed to update progress. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => handleStarClick(star)}
        onMouseEnter={() => handleStarHover(star)}
        onMouseLeave={handleStarLeave}
        className="text-lg transition-colors duration-200 focus:outline-none"
      >
        <FaStar
          className={`${
            star <= (hoverRating || rating)
              ? "text-yellow-400"
              : "text-gray-300"
          } hover:text-yellow-400`}
        />
      </button>
    ));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end z-50">
      <div className="bg-white shadow-xl w-[500px] h-[500px] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Typography variant="h6" color="blue-gray" className="font-semibold">
            Proress Posting
          </Typography>
          <IconButton
            variant="text"
            color="blue-gray"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </IconButton>
        </div>

        {/* Content */}
        <div className="mx-6 mt-2">
          <label
            htmlFor="message"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Comment
          </label>
          <textarea
            id="message"
            rows={4}
            className="block p-2.5  w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Write your thoughts here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={isSubmitting}
          />
          <div className="mt-5">
            <div className="mb-1 text-base font-medium dark:text-white">
              Progress
            </div>
            <div className="relative w-[300px]">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider relative z-10"
                disabled={isSubmitting}
                style={{
                  background: `linear-gradient(to right, #2563eb ${progress}%, #e5e7eb ${progress}%)`
                }}
              />
            </div>
            <div className="mt-1 text-sm text-gray-600">
              {progress}% progress
            </div>
          </div>
          <button
            type="button"
            className="text-white bg-blue-300 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isSubmitting || !comment.trim()}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
          {/* Last Week Comments Section */}
          {lastWeekComments && lastWeekComments.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Previous Comments</h3>
              {lastWeekComments.map((commentData, index) => (
                <div key={commentData._id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start gap-3">
                    {/* Comment Icon */}
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-800">Comment</h4>
                        <div className="flex items-center gap-2">
                          {/* Rating Stars */}
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= (commentData.rating || 0)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {commentData.comment}
                      </p>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        {commentData.entry_time && new Date(commentData.entry_time * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RatingModal;

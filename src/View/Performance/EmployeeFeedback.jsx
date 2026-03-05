import React from 'react';
import { Typography, Badge } from '@material-tailwind/react';
import { FaThumbsUp, FaThumbsDown, FaTrophy, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { useOutletContext } from 'react-router';

const EmployeeFeedback = () => {
  // Get data from context
  const { feedbackData, profileData } = useOutletContext() || {};
  
  console.log('EmployeeFeedback - feedbackData:', feedbackData);
  console.log('EmployeeFeedback - profileData:', profileData);

  const getFeedbackIcon = (thumbType) => {
    switch (thumbType) {
      case '1':
        return <FaThumbsUp className="text-green-500 text-lg" />;
      case '0':
        return <FaThumbsDown className="text-red-500 text-lg" />;
      case '2':
        return <FaTrophy className="text-yellow-500 text-lg" />;
      default:
        return null;
    }
  };

  const getFeedbackColor = (thumbType) => {
    switch (thumbType) {
      case '1':
        return 'green';
      case '0':
        return 'red';
      case '2':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getFeedbackText = (thumbType) => {
    switch (thumbType) {
      case '1':
        return 'Thumbs Up';
      case '0':
        return 'Thumbs Down';
      case '2':
        return 'Award';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!feedbackData || (!feedbackData.given_feedback && !feedbackData.recived_employee)) {
    return (
      <div className="text-center py-8">
        <Typography variant="h6" color="gray" className="font-normal">
          No feedback found for this employee
        </Typography>
      </div>
    );
  }

  const givenFeedback = feedbackData.given_feedback || [];
  const receivedFeedback = feedbackData.recived_employee || [];

  return (
    <div className='flex flex-col gap-6 py-2 pb-1 pl-2 pr-4'>
      <div className='flex items-center justify-between'>
        <Typography variant="h5" color="blue-gray" className="font-bold">
          Employee Feedback
        </Typography>
      </div>

      {/* Given Feedback Section */}
      {givenFeedback.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <Typography variant="h6" color="blue-gray" className="mb-4 font-semibold">
            Feedback Given by Employee
          </Typography>
          <div className="space-y-4">
            {givenFeedback.map((feedback, index) => (
              <div key={feedback._id || index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-blue-600 text-sm" />
                      </div>
                      <div>
                        <Typography variant="body1" color="blue-gray" className="font-medium">
                          To: {feedback.employee_to}
                        </Typography>
                        <Typography variant="small" color="gray" className="flex items-center gap-1">
                          <FaCalendarAlt className="text-xs" />
                          {formatDate(feedback.entry_time)}
                        </Typography>
                      </div>
                    </div>
                    <Typography variant="body2" color="gray" className="ml-11">
                      <span className="font-bold underline">Comment:</span> {feedback.comment}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    {getFeedbackIcon(feedback.thumb)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Received Feedback Section */}
      {receivedFeedback.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <Typography variant="h6" color="blue-gray" className="mb-4 font-semibold">
            Feedback Received by Employee
          </Typography>
          <div className="space-y-4">
            {receivedFeedback.map((feedback, index) => (
              <div key={feedback._id || index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <FaUser className="text-green-600 text-sm" />
                      </div>
                      <div>
                        <Typography variant="body1" color="blue-gray" className="font-medium">
                          From: {feedback.Given_name}
                        </Typography>
                        <Typography variant="small" color="gray" className="flex items-center gap-1">
                          <FaCalendarAlt className="text-xs" />
                          {formatDate(feedback.entry_time)}
                        </Typography>
                      </div>
                    </div>
                    <Typography variant="body2" color="gray" className="ml-11">
                      <span className="font-bold underline">Comment:</span> {feedback.comment}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-2">
                    {getFeedbackIcon(feedback.thumb)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state if no feedback */}
      {givenFeedback.length === 0 && receivedFeedback.length === 0 && (
        <div className="bg-white rounded-lg p-6 shadow-lg text-center">
          <Typography variant="h6" color="gray" className="font-normal">
            No feedback data available for this employee
          </Typography>
        </div>
      )}
    </div>
  );
};

export default EmployeeFeedback;

import React, { useState, useEffect } from "react";
import { Typography, Badge, Button } from "@material-tailwind/react";
import {
  FaThumbsUp,
  FaThumbsDown,
  FaTrophy,
  FaUser,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
  FaArrowLeft,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import useStore from "../../Store/store";
import { showToast } from "../../Components/Toaster/Toaster";

const EmployeeSubFeed = ({
  handleCloseProfile,
  feedbackData,
  profileData,
  selectedEmployeeId,
}) => {
  // Get data from store
  const { employeeFeedbackData, gettingFeedbackByEmployeeId } = useStore();

  // Get URL parameters and navigation
  const params = useParams();
  const navigate = useNavigate();

  // Use feedbackData from context (for main Performance component) or employeeFeedbackData from store (for SubGoals/SubCompetency)
  const actualFeedbackData = feedbackData || employeeFeedbackData;

  // Get employee ID from params or context
  const employeeId = params.employeeId || selectedEmployeeId;

  // State for collapsible sections
  const [givenFeedbackExpanded, setGivenFeedbackExpanded] = useState(true);
  const [receivedFeedbackExpanded, setReceivedFeedbackExpanded] =
    useState(false);

  //   console.log('EmployeeSubFeed - feedbackData from context:', feedbackData);
  //   console.log('EmployeeSubFeed - employeeFeedbackData from store:', employeeFeedbackData);
  //   console.log('EmployeeSubFeed - actualFeedbackData:', actualFeedbackData);
  //   console.log('EmployeeSubFeed - params:', params);

  // Fetch feedback data if not available and we have employee ID
  useEffect(() => {
    const fetchFeedbackData = async () => {
      if (!actualFeedbackData && employeeId) {
        try {
          await gettingFeedbackByEmployeeId(employeeId);
          console.log("Fetched feedback data for employee:", employeeId);
        } catch (error) {
          console.error("Error fetching feedback data:", error);
          showToast("Failed to fetch feedback data", "error");
        }
      }
    };

    fetchFeedbackData();
  }, [employeeId, actualFeedbackData, gettingFeedbackByEmployeeId]);

  const getFeedbackIcon = (thumbType) => {
    switch (thumbType) {
      case "1":
        return <FaThumbsUp className="text-green-500 text-lg" />;
      case "0":
        return <FaThumbsDown className="text-red-500 text-lg" />;
      case "2":
        return <FaTrophy className="text-yellow-500 text-lg" />;
      default:
        return null;
    }
  };

  const getFeedbackColor = (thumbType) => {
    switch (thumbType) {
      case "1":
        return "green";
      case "0":
        return "red";
      case "2":
        return "yellow";
      default:
        return "gray";
    }
  };

  const getFeedbackText = (thumbType) => {
    switch (thumbType) {
      case "1":
        return "Thumbs Up";
      case "0":
        return "Thumbs Down";
      case "2":
        return "Award";
      default:
        return "Unknown";
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleBackToMain = () => {
    console.log(
      "EmployeeSubFeed: Clearing profile and returning to feedback table"
    );
    try {
      // Clear the profile state to return to the main feedback table
      if (handleCloseProfile) {
        handleCloseProfile();
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  if (
    !actualFeedbackData ||
    (!actualFeedbackData.given_feedback && !actualFeedbackData.recived_employee)
  ) {
    return (
      <div className="text-center py-8">
        <Typography variant="h6" color="gray" className="font-normal">
          No feedback found for this employee
        </Typography>
      </div>
    );
  }

  const givenFeedback = actualFeedbackData.given_feedback || [];
  const receivedFeedback = actualFeedbackData.recived_employee || [];

  return (
    <div className="flex flex-col gap-4 py-2 pb-1">
      {/* Back Navigation */}
      <div className="flex items-center mb-4">
        <Button
          variant="text"
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors p-2 cursor-pointer"
          onClick={handleBackToMain}
        >
          <FaArrowLeft className="text-sm" />
        </Button>
      </div>

      {/* Feedback Given Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => setGivenFeedbackExpanded(!givenFeedbackExpanded)}
        >
          <Typography className="font-medium text-[14px] text-[#474747] font-Urbanist">
            Feedback Given
          </Typography>
          {givenFeedbackExpanded ? (
            <FaChevronDown className="text-gray-500" />
          ) : (
            <FaChevronUp className="text-gray-500" />
          )}
        </div>

        {/* Content */}
        {givenFeedbackExpanded && (
          <div className="px-4 pb-4">
            {givenFeedback.length > 0 ? (
              givenFeedback.map((feedback, index) => (
                <div
                  key={feedback._id || index}
                  className="border-t border-gray-100 pt-4 first:border-t-0"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        {getFeedbackIcon(feedback.thumb)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Typography className="font-medium text-[14px] font-Urbanist text-[#474747]">
                          Me to {feedback.employee_to}
                        </Typography>
                        <Typography className="font-normal flex items-center gap-2 text-[12px] font-Urbanist text-[#474747]">
                          <FaCalendarAlt className="text-xs" />
                          {formatDate(feedback.entry_time)}
                        </Typography>
                      </div>

                      <Typography className="font-medium text-[12px] font-Urbanist text-[#474747]">
                        {getFeedbackText(feedback.thumb)}
                      </Typography>

                      <Typography className="font-normal text-[12px] font-Urbanist text-[#474747]">
                        {feedback.comment}
                      </Typography>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Typography
                  variant="body1"
                  color="gray"
                  className="font-normal"
                >
                  No feedback is given
                </Typography>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feedback Received Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => setReceivedFeedbackExpanded(!receivedFeedbackExpanded)}
        >
          <Typography className="font-medium text-[14px] text-[#474747] font-Urbanist">
            Feedback Received
          </Typography>
          {receivedFeedbackExpanded ? (
            <FaChevronDown className="text-gray-500" />
          ) : (
            <FaChevronUp className="text-gray-500" />
          )}
        </div>

        {/* Content */}
        {receivedFeedbackExpanded && (
          <div className="px-4 pb-4">
            {receivedFeedback.length > 0 ? (
              receivedFeedback.map((feedback, index) => (
                <div
                  key={feedback._id || index}
                  className="border-t border-gray-100 pt-4 first:border-t-0"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        {getFeedbackIcon(feedback.thumb)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Typography className="font-medium text-[#474747] font-Urbanist text-[14px]">
                          {feedback.Given_name} to Me
                        </Typography>
                        <Typography className="font-normal text-[12px] flex items-center gap-2 text-[#474747] font-Urbanist">
                          <FaCalendarAlt className="text-xs" />
                          {formatDate(feedback.entry_time)}
                        </Typography>
                      </div>

                      <Typography className="font-medium text-[12px] text-[#474747] font-Urbanist">
                        {getFeedbackText(feedback.thumb)}
                      </Typography>

                      <Typography className="font-normal text-[12px] text-[#474747] font-Urbanist">
                        {feedback.comment}
                      </Typography>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Typography
                  variant="body1"
                  color="gray"
                  className="font-normal"
                >
                  No feedback is received
                </Typography>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeSubFeed;
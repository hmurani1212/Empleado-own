import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { Typography, Badge, Progress, Button } from "@material-tailwind/react";
import usePerformanceServices from "../../ViewModel/PerformnaceViewModel/performanceServices";
import useStore from "../../Store/store";
import ProfileManagement from "./ProfileManagement";
import RatingModal from "./RatingModal";
import CompetencyRatingModal from "./CompetencyRatingModal";
import ProgressPostingModal from "./ProgressPostingModal";
import GoalCommentsDrawer from "./GoalCommentsDrawer";
import EmployeeSubFeed from "./EmployeeSubFeed";
import History from "./History";

const Performance = () => {
  const { performanceTitles, handleNavLinkClick } = usePerformanceServices();
  const [showProfile, setShowProfile] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [goalsData, setGoalsData] = useState([]);
  const [competencyData, setCompetencyData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [currentView, setCurrentView] = useState("goals"); // 'goals', 'competency', or 'feedback'

  // Modal states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showCompetencyRatingModal, setShowCompetencyRatingModal] =
    useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [selectedGoalForRating, setSelectedGoalForRating] = useState(null);
  const [selectedCompetencyForRating, setSelectedCompetencyForRating] =
    useState(null);
  const [selectedGoalForProgress, setSelectedGoalForProgress] = useState(null);
  const [selectedGoalForComments, setSelectedGoalForComments] = useState(null);
  const [showCommentsDrawer, setShowCommentsDrawer] = useState(false);
  const [showReviewCycle, setShowReviewCycle] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  // Get data from store
  const storeData = useStore((state) => ({
    employeeGoalsData: state.employeeGoalsData,
    employeeCompetencyData: state.employeeCompetencyData,
    employeeFeedbackData: state.employeeFeedbackData,
    setProfileData: state.setProfileData,
    currentEmployeeId: state.currentEmployeeId,
    lastWeekComments: state.lastWeekComments,
    gettingGoalsByEmployeeId: state.gettingGoalsByEmployeeId,
    gettingCompetencyByEmployeeId: state.gettingCompetencyByEmployeeId,
    gettingFeedbackByEmployeeId: state.gettingFeedbackByEmployeeId,
  }));

  const handleProfileView = (employeeId, viewType = "goals") => {
    setSelectedEmployeeId(employeeId);
    setShowProfile(true);
    setCurrentView(viewType);

    // Fetch data based on view type
    if (viewType === "goals") {
      storeData.gettingGoalsByEmployeeId(employeeId);
    } else if (viewType === "competency") {
      storeData.gettingCompetencyByEmployeeId(employeeId);
    } else if (viewType === "feedback") {
      storeData.gettingFeedbackByEmployeeId(employeeId);
    }
  };

  const handleCloseProfile = () => {
    // Reset all profile-related state
    setShowProfile(false);
    setSelectedEmployeeId(null);
    setProfileData(null);
    setGoalsData([]);
    setCompetencyData([]);
    setFeedbackData([]);
    setCurrentView("goals"); // Reset to default view

    // Navigate to the appropriate main page based on current view
    if (currentView === "history") {
      navigate("/performance/history");
    } else if (currentView === "feedback") {
      navigate("/performance/feedback");
    } else if (currentView === "competency") {
      navigate("/performance/competency");
    } else if (currentView === "goals") {
      navigate("/performance/goals");
    } else {
      navigate("/performance");
    }
  };

  // Handle tab navigation while profile is open
  const handleTabChange = (tabName) => {
    if (showProfile && selectedEmployeeId) {
      setCurrentView(tabName);
      // Fetch data for the new tab
      if (tabName === "goals") {
        storeData.gettingGoalsByEmployeeId(selectedEmployeeId);
      } else if (tabName === "competency") {
        storeData.gettingCompetencyByEmployeeId(selectedEmployeeId);
      } else if (tabName === "feedback") {
        storeData.gettingFeedbackByEmployeeId(selectedEmployeeId);
      }
    }
  };

  // Update local state when store data changes
  useEffect(() => {
    if (storeData.employeeGoalsData && storeData.setProfileData) {
      setGoalsData(storeData.employeeGoalsData);
      setProfileData(storeData.setProfileData);
    }
  }, [storeData.employeeGoalsData, storeData.setProfileData]);

  // Update competency data when store data changes
  useEffect(() => {
    if (storeData.employeeCompetencyData) {
      setCompetencyData(storeData.employeeCompetencyData);
    }
  }, [storeData.employeeCompetencyData]);

  // Update feedback data when store data changes
  useEffect(() => {
    if (storeData.employeeFeedbackData) {
      setFeedbackData(storeData.employeeFeedbackData);
    }
  }, [storeData.employeeFeedbackData]);

  // Modal handlers
  const handleOpenRatingModal = (item) => {
    // Check if it's a competency or goal based on the item structure
    // Competencies typically have 'name' or 'competency' field, goals have 'goal_name' or 'title'
    if (
      item?.name ||
      item?.competency ||
      (item && !item.goal_name && !item.title)
    ) {
      // It's a competency
      setSelectedCompetencyForRating(item);
      setShowCompetencyRatingModal(true);
    } else {
      // It's a goal
      setSelectedGoalForRating(item);
      setShowRatingModal(true);
    }
  };

  const handleCloseRatingModal = () => {
    setShowRatingModal(false);
    setSelectedGoalForRating(null);
  };

  const handleCloseCompetencyRatingModal = () => {
    setShowCompetencyRatingModal(false);
    setSelectedCompetencyForRating(null);
  };

  const handleOpenProgressModal = (goal) => {
    setSelectedGoalForProgress(goal);
    setShowProgressModal(true);
  };

  const handleCloseProgressModal = () => {
    setShowProgressModal(false);
    setSelectedGoalForProgress(null);
  };

  const handleRatingUpdate = (ratingData) => {
    // Handle rating update logic here
    console.log("Rating updated:", ratingData);

    // Refresh the employee goals data to show updated rating
    if (storeData.currentEmployeeId) {
      storeData.gettingGoalsByEmployeeId(storeData.currentEmployeeId);
    }

    handleCloseRatingModal();
  };

  const handleCompetencyRatingUpdate = (ratingData) => {
    // Handle competency rating update logic here
    console.log("Competency rating updated:", ratingData);

    // Refresh the employee competency data to show updated rating
    if (selectedEmployeeId) {
      storeData.gettingCompetencyByEmployeeId(selectedEmployeeId);
    }

    handleCloseCompetencyRatingModal();
  };

  const handleProgressUpdate = (progressData) => {
    // Handle progress update logic here
    console.log("Progress updated:", progressData);

    // Refresh the employee goals data to show updated progress
    if (storeData.currentEmployeeId) {
      storeData.gettingGoalsByEmployeeId(storeData.currentEmployeeId);
    }

    handleCloseProgressModal();
  };

  const handleOpenCommentsDrawer = (goal) => {
    setSelectedGoalForComments(goal);
    setShowCommentsDrawer(true);
  };

  const handleCloseCommentsDrawer = () => {
    setShowCommentsDrawer(false);
    setSelectedGoalForComments(null);
  };

  return (
    <div className="flex flex-col gap-4 py-2 px-2">
      {!showProfile && (
        <div className="">
          <span className="text-[20px] font-Urbanist font-semibold text-[#474747]">
            Performance
          </span>
        </div>
      )}

      {/* Profile Management Section - Displayed at top when employee is selected */}
      {showProfile && profileData && (
        <ProfileManagement
          profileData={profileData}
          onClose={handleCloseProfile}
        />
      )}

      <div className="flex flex-col gap-2 pb-3">
        {/* Review Cycle Section - Inside main content div */}
        {/* TODO: Implement Review Cycle functionality for Competency view later */}
        {/* {showProfile && currentView !== 'competency' && (
          <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200">
            <Typography variant="h6" color="blue-gray" className="font-semibold">
              Review Cycle
            </Typography>
            <div className="flex-1 max-w-xs">
              <select className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select Review Cycle</option>
                <option value="cycle1">self - for leader</option>
                <option value="cycle2">start date 2023-08-22 → deadline 2023-09-01</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Typography variant="small" color="blue-gray" className="font-normal">
                self - for leader
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-500" />
              <Typography variant="small" color="gray" className="font-normal">
                start date 2023-08-22 → deadline 2023-09-01
              </Typography>
            </div>
          </div>
        )} */}

        <div className="flex justify-between items-center gap-5 py-5">
          <div className="flex items-center gap-5">
            {performanceTitles
              .filter((ele) => {
                // Hide "Performance Review Cycle" tab when viewing individual employee details
                if (showProfile && selectedEmployeeId) {
                  return ele.title !== "Performance Review Cycle";
                }
                return true;
              })
              .map((ele) => (
                <NavLink
                  key={ele.id}
                  className={`${
                    showProfile && selectedEmployeeId
                      ? currentView === ele.title.toLowerCase()
                        ? "text-white"
                        : "hover:text-[#474747]/60 text-[#474747]"
                      : location.pathname === ele.link
                      ? "text-white"
                      : "hover:text-[#474747]/60 text-[#474747]"
                  } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition focus-visible:outline-2`}
                  style={{
                    WebkitTapHighlightColor: "transparent",
                  }}
                  // to={ele.link}
                  onClick={() => {
                    // If profile is open, handle tab change
                    if (showProfile && selectedEmployeeId) {
                      if (ele.title === "Goals") {
                        handleTabChange("goals");
                      } else if (ele.title === "Competency") {
                        handleTabChange("competency");
                      } else if (ele.title === "Feedback") {
                        handleTabChange("feedback");
                      } else if (ele.title === "History") {
                        handleTabChange("history");
                      }
                    } else {
                      // If no profile is open, use the service navigation
                      handleNavLinkClick(ele);
                    }
                  }}
                >
                  {((showProfile &&
                    selectedEmployeeId &&
                    currentView === ele.title.toLowerCase()) ||
                    (!showProfile && location.pathname === ele.link)) && (
                    <motion.span
                      layoutId="bubble"
                      className="absolute inset-0 z-10 bg-[#8bc9f8]"
                      style={{ borderRadius: 9999 }}
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <span className="relative cursor-pointer text-[14px] z-20">
                    {ele.title}
                  </span>
                </NavLink>
              ))}
          </div>
        </div>
        <div>
          {/* Show EmployeeSubFeed when profile is active and feedback tab is selected */}
          {showProfile && currentView === "feedback" ? (
            <EmployeeSubFeed
              handleCloseProfile={handleCloseProfile}
              feedbackData={feedbackData}
              profileData={profileData}
              selectedEmployeeId={selectedEmployeeId}
            />
          ) : showProfile && currentView === "history" ? (
            <History
              handleCloseProfile={handleCloseProfile}
              profileData={profileData}
              selectedEmployeeId={selectedEmployeeId}
            />
          ) : (
            <Outlet
              context={{
                handleProfileView,
                handleTabChange,
                currentView,
                showProfile,
                selectedEmployeeId,
                goalsData,
                competencyData,
                feedbackData,
                profileData,
                handleOpenRatingModal,
                handleOpenProgressModal,
                handleOpenCommentsDrawer,
                setShowReviewCycle,
                handleCloseProfile,
              }}
            />
          )}
        </div>
      </div>

      {/* Modal Components */}
      {showRatingModal && (
        <RatingModal
          open={showRatingModal}
          onClose={handleCloseRatingModal}
          goal={selectedGoalForRating}
          onRatingUpdate={handleRatingUpdate}
          lastWeekComments={storeData.lastWeekComments}
        />
      )}

      {showCompetencyRatingModal && (
        <CompetencyRatingModal
          open={showCompetencyRatingModal}
          onClose={handleCloseCompetencyRatingModal}
          competency={selectedCompetencyForRating}
          onRatingUpdate={handleCompetencyRatingUpdate}
        />
      )}

      {showProgressModal && (
        <ProgressPostingModal
          open={showProgressModal}
          onClose={handleCloseProgressModal}
          goal={selectedGoalForProgress}
          onProgressUpdate={handleProgressUpdate}
        />
      )}

      {showCommentsDrawer && (
        <GoalCommentsDrawer
          open={showCommentsDrawer}
          onClose={handleCloseCommentsDrawer}
          goal={selectedGoalForComments}
        />
      )}
    </div>
  );
};

export default Performance;
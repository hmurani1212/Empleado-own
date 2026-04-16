import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import { createContext } from "react";
import EmployeeGoals from "./EmployeeGoals";
import { showToast } from "../../Components/Toaster/Toaster";

// Create a context for EmployeeGoals when rendered outside of outlet
export const EmployeeGoalsContext = createContext(null);

// Wrapper component that provides context to EmployeeGoals
const EmployeeGoalsWithContext = ({ context }) => {
  return (
    <EmployeeGoalsContext.Provider value={context}>
      <EmployeeGoals />
    </EmployeeGoalsContext.Provider>
  );
};

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
    // Validate that goal is completed before allowing progress posting/rating
    if (!goal) {
      showToast('Goal not found', 'error');
      return;
    }

    // Check if goal status is "Not Started" (0) or "In Progress" (1)
    if (goal.status === '0' || goal.status === '1' || goal.status === 0 || goal.status === 1) {
      showToast('Goal is not completed yet, you can not rate it', 'error');
      return;
    }

    // Only allow if status is "Completed" (2)
    if (goal.status !== '2' && goal.status !== 2) {
      showToast('Goal is not completed yet, you can not rate it', 'error');
      return;
    }

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

  const renderTabs = () => (
    <div className='bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-sm border border-gray-100 inline-flex flex-wrap gap-1'>
      {performanceTitles
        .filter((ele) => {
          // Hide "Performance Review Cycle" tab when viewing individual employee details
          if (showProfile && selectedEmployeeId) {
            return ele.title !== "Performance Review Cycle";
          }
          return true;
        })
        .map((ele) => (
          <button
            key={ele.id}
            onClick={(e) => {
              e.preventDefault();
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
            className={`
              relative px-4 py-2 rounded-xl cursor-pointer text-sm font-medium transition-all duration-300 ease-out z-10
              ${((showProfile && selectedEmployeeId && currentView === ele.title.toLowerCase()) ||
                 (!showProfile && location.pathname === ele.link))
                  ? "text-white shadow-md shadow-blue-500/20" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }
            `}
          >
            {((showProfile && selectedEmployeeId && currentView === ele.title.toLowerCase()) ||
              (!showProfile && location.pathname === ele.link)) && (
              <motion.span
                layoutId="activeTab"
                className="absolute inset-0 bg-bgBlue rounded-xl -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            {ele.title}
          </button>
        ))}
    </div>
  );

  return (
    
    <div className='min-h-screen font-poppins'>
      <div className=' mx-auto space-y-6'>
        
        {/* Header Section */}
        {!showProfile && (
          <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Performance</h1>
              <p className='text-sm text-gray-500 mt-1'>Manage goals, competencies, and reviews</p>
            </div>
            {/* Tabs moved inside header for main view */}
            {renderTabs()}
          </div>
        )}

        {/* Profile Management Section - Displayed at top when employee is selected */}
        <AnimatePresence>
          {showProfile && profileData && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileManagement
                profileData={profileData}
                onClose={handleCloseProfile}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Render Tabs separately only when profile is shown (since header is hidden) */}
        {showProfile && (
          <div className="flex justify-start">
            {renderTabs()}
          </div>
        )}

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
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
        </motion.div>
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
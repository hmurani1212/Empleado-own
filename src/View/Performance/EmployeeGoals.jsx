import { Typography, Badge, Progress, Button, Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaChevronDown,
  FaUser,
  FaCalendarAlt,
  FaArrowRight,
  FaStar,
  FaClipboardList
} from "react-icons/fa";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useContext } from "react";
import useStore from "../../Store/store";

// Import the context from Performance.jsx (for when rendered outside outlet)
import { EmployeeGoalsContext } from "./Performance";
import useGoalServices from "../../ViewModel/PerformnaceViewModel/goalServices";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import AddEditGoal from "./AddEditGoal";
import ViewGoal from "./ViewGoal";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import EmployeeFeedback from "./EmployeeFeedback";
import CustomButton from "../../Components/CustomButton/CustomButton";
import performanceApi from "../../Model/Data/Performance/Performance";
import { showToast } from "../../Components/Toaster/Toaster";
import { motion, AnimatePresence } from "framer-motion";
import { SubGoalsSkeleton } from "./PerformanceSkeletons";

const EmployeeGoals = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    employeeGoalsData,
    gettingGoalsByEmployeeId,
    gettingNextEmployeeGoals,
    clearEmployeeGoals,
    refreshEmployeeGoals,
    currentEmployeeId,
    subGoalsLoading,
    setProfileData: profileDataFromStore,
  } = useStore();
  // Try to get context from either outlet context or direct context provider
  const outletContext = useOutletContext();
  const directContext = EmployeeGoalsContext ? useContext(EmployeeGoalsContext) : null;
  const context = outletContext || directContext || {};
  
  const {
    handleOpenRatingModal,
    handleOpenProgressModal,
    handleOpenCommentsDrawer,
    setShowReviewCycle,
    currentView: contextCurrentView,
    handleTabChange,
    handleCloseProfile,
  } = context;

  // Use context currentView or default to "goals" since this component is only rendered for goals
  const currentView = contextCurrentView || "goals";

  // Debug: Log current view and data
  useEffect(() => {
    console.log('EmployeeGoals - currentView:', currentView);
    console.log('EmployeeGoals - employeeGoalsData:', employeeGoalsData);
    console.log('EmployeeGoals - employeeGoalsData length:', employeeGoalsData?.length);
    console.log('EmployeeGoals - profileDataFromStore:', profileDataFromStore);
    console.log('EmployeeGoals - subGoalsLoading:', subGoalsLoading);
  }, [currentView, employeeGoalsData, profileDataFromStore, subGoalsLoading]);
  const {
    handleAddGoal,
    gettingPRCSelect,
    goalsValue,
    handleSelectGoals,
    addGoalValue,
    handleChangeAddGoal,
    handleNewGoal,
    handleRemoveEmp,
    setAddGoalValue,
    handleEditGoal,
    handleViewGoal,
    handleUpdateFromView,
    toggleAddGoal,
    gettingGoals,
  } = useGoalServices();

  const [openMenu, setOpenMenu] = useState({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [employeeProfile, setEmployeeProfile] = useState(null);

  const toggleMenu = (index, isOpen) => {
    setOpenMenu((prevOpenMenu) => ({
      ...prevOpenMenu,
      [index]: isOpen,
    }));
  };

  useEffect(() => {
    if (goalsValue.performance.length === 0) {
      gettingPRCSelect();
    }
  }, [gettingPRCSelect, goalsValue.performance.length]);

  useEffect(() => {
    // Extract employee profile data from store (setProfileData) or from first goal
    if (profileDataFromStore) {
      setEmployeeProfile(profileDataFromStore);
    } else if (
      employeeGoalsData &&
      employeeGoalsData.length > 0 &&
      employeeGoalsData[0].emp_DATA
    ) {
      setEmployeeProfile(employeeGoalsData[0].emp_DATA);
    }
  }, [employeeGoalsData, profileDataFromStore]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideDropdown = event.target.closest(".dropdown-menu");
      if (!isClickInsideDropdown) {
        setOpenMenu({});
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBackToGoals = () => {
    clearEmployeeGoals();
    // Navigate to main Goals table
    navigate("/performance/goals");
    // Also call handleCloseProfile if available (for profile view context)
    if (handleCloseProfile) {
      handleCloseProfile();
    }
  };

  const handleDeleteGoal = (goal) => {
    setGoalToDelete(goal);
    setShowDeleteDialog(true);
  };

  const toggleDeleteDialog = () => setShowDeleteDialog((prev) => !prev);

  const confirmDelete = async () => {
    if (!goalToDelete?._id) return;
    try {
      const response = await performanceApi.deleteSubGoal(goalToDelete._id);
      if (response?.data?.STATUS === "SUCCESSFUL") {
        if (currentEmployeeId) {
          await gettingGoalsByEmployeeId(currentEmployeeId);
        } else {
          await refreshEmployeeGoals();
        }
        await gettingGoals();
        showToast("Goal deleted successfully", "success");
      } else {
        showToast(
          response?.data?.ERROR_DESCRIPTION || "Failed to delete goal",
          "error"
        );
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      showToast("Failed to delete goal", "error");
    } finally {
      setShowDeleteDialog(false);
      setGoalToDelete(null);
    }
  };

  const handleSwitchToEdit = () => {
    setAddGoalValue((prevState) => ({
      ...prevState,
      update: true,
      view: false,
    }));
  };

  const handleCloseModal = () => {
    toggleAddGoal();
  };

  const handleRatingClick = (goal) => {
    handleOpenProgressModal(goal);
  };

  const handleEyeIconClick = () => {
    if (setShowReviewCycle) {
      setShowReviewCycle(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "0": return "red";
      case "1": return "blue";
      case "2": return "green";
      default: return "gray";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "0": return "Not Started";
      case "1": return "In Progress";
      case "2": return "Completed";
      default: return "Unknown";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "0": return "⭕";
      case "1": return "⏳";
      case "2": return "✅";
      default: return "❓";
    }
  };

  const renderStars = (rating, goal) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`cursor-pointer transition-colors text-lg ${
            i <= rating ? "text-yellow-400" : "text-gray-300"
          } hover:text-yellow-400`}
          onClick={() =>
            handleOpenProgressModal
              ? handleOpenProgressModal(goal)
              : handleRatingClick(goal)
          }
          title="Click to update progress"
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const tableHeader = [
    "Goal Name",
    "Goal Description",
    "Progress",
    "Comment",
    "Status",
    "Actions",
    "Rating",
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Employee Profile Header - Removed duplicate tabs, filters, and date range */}

      {/* Content based on current view */}
      {/* Always show goals table when this component is rendered (it's only rendered for goals view) */}
      {/* Since this component is only rendered for goals view, always show the goals table */}
      {(currentView === "goals" || !currentView) && (
        <>
          {/* Back Navigation and Add Goal Button */}
          <div className="flex items-center justify-between">
            <Button
              variant="text"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 normal-case font-medium p-2"
              onClick={handleBackToGoals}
            >
              <FaArrowRight className="text-sm rotate-180" /> Back to list
            </Button>

            <Button
              className="bg-bgBlue text-white shadow-blue-500/20 hover:shadow-blue-500/40 capitalize font-medium text-sm px-6 py-2.5 rounded-xl transition-all flex items-center gap-2"
              onClick={handleAddGoal}
            >
              Add Goal
            </Button>
          </div>

          {/* Goals Table */}
          {subGoalsLoading ? (
            <SubGoalsSkeleton />
          ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="min-h-[calc(100vh-250px)] overflow-auto customScroll">
              <table className="min-w-full table-auto text-center">
                <thead className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
                  <tr>
                    {tableHeader?.map((head, i) => (
                      <th key={i} className="p-4 first:pl-6 last:pr-6 whitespace-nowrap">
                        <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {employeeGoalsData?.map((goal, i) => (
                    <motion.tr 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="p-4">
                        <Typography className="text-sm font-semibold text-gray-900 font-poppins">
                          {goal.name}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <Typography className="text-sm text-gray-600 font-poppins max-w-xs truncate mx-auto">
                          {goal.descriptions}
                        </Typography>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col items-center gap-1 w-32 mx-auto">
                          <Progress value={goal.progress} color="blue" size="sm" className="bg-blue-50" />
                          <span className="text-xs font-medium text-blue-600">{goal.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          type="button"
                          className="text-gray-400 hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-50"
                          onClick={() => handleOpenCommentsDrawer && handleOpenCommentsDrawer(goal)}
                          title="View comments"
                        >
                          💬
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Badge color={getStatusColor(goal.status)} className="px-2 py-1 rounded-md shadow-none">
                            {getStatusText(goal.status)}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4 relative">
                        <Menu placement="bottom-end">
                          <MenuHandler>
                            <Button
                              variant="text"
                              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-all shadow-sm normal-case text-gray-700"
                            >
                              Action <FaChevronDown className="text-[10px]" />
                            </Button>
                          </MenuHandler>
                          <MenuList className="min-w-[140px] p-1 border border-gray-100 rounded-xl shadow-xl z-[9999]">
                            <MenuItem 
                              onClick={() => handleRatingClick(goal)} 
                              className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-gray-900"
                            >
                              <FaStar className="text-yellow-500" /> Rating
                            </MenuItem>
                            <MenuItem 
                              onClick={() => handleEditGoal(goal)} 
                              className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-gray-900"
                            >
                              <FaEdit className="text-blue-500" /> Edit
                            </MenuItem>
                            <MenuItem 
                              onClick={() => { handleViewGoal(goal); handleEyeIconClick(); }} 
                              className="flex items-center gap-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-gray-900"
                            >
                              <FaEye className="text-green-500" /> View
                            </MenuItem>
                            <MenuItem 
                              onClick={() => handleDeleteGoal(goal)} 
                              className="flex items-center gap-2 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <FaTrash /> Delete
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-0.5">
                          {renderStars(goal.rating, goal)}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  
                  {employeeGoalsData?.length === 0 && (
                    <tr>
                      <td colSpan={tableHeader.length} className="p-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                            <FaClipboardList className="text-3xl text-gray-300" />
                          </div>
                          <Typography className="font-medium font-poppins">No goals found for this employee</Typography>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </>
      )}

      {currentView === "competency" && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Typography color="gray" className="font-medium font-poppins">
            Competency view will be handled by EmployeeCompetency component
          </Typography>
        </div>
      )}

      {currentView === "feedback" && <EmployeeFeedback />}

      {addGoalValue.show && (
        <PortalDrawer
          open={addGoalValue.show}
          compo={
            addGoalValue.view ? (
              <ViewGoal
                goalData={addGoalValue}
                onClose={handleCloseModal}
                onEdit={handleSwitchToEdit}
                onUpdate={handleUpdateFromView}
              />
            ) : (
              <AddEditGoal
                performance={goalsValue.performance}
                handleSelectGoals={handleSelectGoals}
                addGoalValue={addGoalValue}
                handleChangeAddGoal={handleChangeAddGoal}
                handleNewGoal={handleNewGoal}
                handleRemoveEmp={handleRemoveEmp}
              />
            )
          }
          title={addGoalValue.view ? "View Goal" : addGoalValue.update ? "Edit Goal" : "Add Goal"}
          closeDrawer={toggleAddGoal}
          widthSize={addGoalValue.view ? 700 : 550}
        />
      )}

      <ConfirmationDialog
        openDialog={showDeleteDialog}
        handleOpen={toggleDeleteDialog}
        handleConfirm={confirmDelete}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
      />
    </div>
  );
};

export default EmployeeGoals;
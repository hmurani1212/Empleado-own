import { Typography, Progress, Button, Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";
import React, { useEffect, useLayoutEffect, useState } from "react";
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
import useStore from "../../Store/store";
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
import GoalDescriptionModal from "./GoalDescriptionModal";

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
  } = useStore();
  const {
    handleOpenRatingModal,
    handleOpenProgressModal,
    handleOpenCommentsDrawer,
    setShowReviewCycle,
    currentView,
    handleTabChange,
    handleCloseProfile,
  } = useOutletContext() || {};
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
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [selectedGoalForDescription, setSelectedGoalForDescription] = useState(null);
  
  // Description truncation length
  const DESCRIPTION_MAX_LENGTH = 50;

  const handleOpenDescriptionModal = (goal) => {
    setSelectedGoalForDescription(goal);
    setShowDescriptionModal(true);
  };

  const handleCloseDescriptionModal = () => {
    setShowDescriptionModal(false);
    setSelectedGoalForDescription(null);
  };

  const truncateDescription = (text) => {
    if (!text) return '';
    if (text.length <= DESCRIPTION_MAX_LENGTH) return text;
    return text.substring(0, DESCRIPTION_MAX_LENGTH);
  };

  const isDescriptionLong = (text) => {
    return text && text.length > DESCRIPTION_MAX_LENGTH;
  };

  const toggleMenu = (index, isOpen) => {
    setOpenMenu((prevOpenMenu) => ({
      ...prevOpenMenu,
      [index]: isOpen,
    }));
  };

  useLayoutEffect(() => {
    if (goalsValue.performance.length === 0) {
      gettingPRCSelect();
    }
  }, [gettingPRCSelect, goalsValue.performance.length]);

  useEffect(() => {
    // Extract employee profile data from the first goal if available
    if (
      employeeGoalsData &&
      employeeGoalsData.length > 0 &&
      employeeGoalsData[0].emp_DATA
    ) {
      setEmployeeProfile(employeeGoalsData[0].emp_DATA);
    }
  }, [employeeGoalsData]);

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

    if (handleOpenProgressModal) {
      handleOpenProgressModal(goal);
    }
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
    // Check if goal is completed - only allow clicking if completed
    const isCompleted = goal?.status === '2' || goal?.status === 2;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`transition-colors text-lg ${
            i <= rating ? "text-yellow-400" : "text-gray-300"
          } ${isCompleted ? "cursor-pointer hover:text-yellow-400" : "cursor-not-allowed opacity-50"}`}
          onClick={() => {
            if (!isCompleted) {
              showToast('Goal is not completed yet, you can not rate it', 'error');
              return;
            }
            if (handleOpenProgressModal) {
              handleOpenProgressModal(goal);
            } else {
              handleRatingClick(goal);
            }
          }}
          title={isCompleted ? "Click to update progress" : "Goal must be completed to rate"}
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
    "Score",
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Employee Profile Header */}
      {employeeProfile && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Review Cycle Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4">
               <div className="w-64">
                 <CustomSelect
                    placeHolderTitle={goalsValue.performanceListLoading ? "Loading cycles..." : "Select Review Cycle"}
                    value={goalsValue.performance_id}
                    options={goalsValue.performance?.map((ele) => ({
                      value: ele._id,
                      label: ele.name,
                    }))}
                    onChangeHandler={handleSelectGoals}
                    customStyles={false}
                    menuLoading={goalsValue.performanceListLoading}
                    menuLoadingLabel="Loading review cycles..."
                  />
               </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" />
                  <span className="font-medium">Start: 2023-01-02</span>
                </div>
                <FaArrowRight className="text-gray-300" size={12} />
                <div className="flex items-center gap-2">
                  <span className="font-medium">Deadline: 2023-06-01</span>
                </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 border-b border-gray-100 pb-1">
            {["goals", "competency", "feedback", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange && handleTabChange(tab)}
                className={`px-6 py-2.5 text-sm font-medium rounded-t-xl transition-all relative ${
                  currentView === tab
                    ? "text-blue-600 bg-blue-50/50 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                } capitalize`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content based on current view */}
      {currentView === "goals" && (
        <>
          {/* Back Navigation and Add Goal Button */}
          <div className="flex items-center justify-between">
            <Button
              variant="text"
              className="flex items-center cursor-pointer gap-2 text-gray-600 hover:text-gray-900 normal-case font-medium p-2"
              onClick={handleBackToGoals}
            >
              <FaArrowRight className="text-sm rotate-180" /> Back to List
            </Button>

            <Button
              className="bg-bgBlue text-white cursor-pointer shadow-blue-500/20 hover:shadow-blue-500/40 capitalize font-medium text-sm px-6 py-2.5 rounded-xl transition-all flex items-center gap-2"
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
                        <div className="text-sm text-gray-600 font-poppins max-w-xs mx-auto">
                          {isDescriptionLong(goal.descriptions) ? (
                            <Typography className="text-sm text-gray-600 font-poppins">
                              {truncateDescription(goal.descriptions)}{' '}
                              <button
                                type="button"
                                onClick={() => handleOpenDescriptionModal(goal)}
                                className="text-blue-600 hover:text-blue-800 font-medium underline"
                              >
                                read more
                              </button>
                            </Typography>
                          ) : (
                            <Typography className="text-sm text-gray-600 font-poppins">
                              {goal.descriptions || '—'}
                            </Typography>
                          )}
                        </div>
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
                          className="text-gray-400 cursor-pointer hover:text-blue-500 transition-colors p-2 rounded-full hover:bg-blue-50"
                          onClick={() => handleOpenCommentsDrawer && handleOpenCommentsDrawer(goal)}
                          title="View comments"
                        >
                          💬
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                            goal.status === '0' || goal.status === 0 ? 'bg-gray-50 text-gray-600' :
                            goal.status === '1' || goal.status === 1 ? 'bg-blue-50 text-blue-600' :
                            goal.status === '2' || goal.status === 2 ? 'bg-green-50 text-green-600' :
                            'bg-gray-50 text-gray-600'
                          }`}>
                            {getStatusText(goal.status)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 relative">
                        <Menu placement="bottom-end">
                          <MenuHandler>
                            <Button
                              variant="text"
                              className="flex items-center cursor-pointer gap-2 px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-all shadow-sm normal-case text-gray-700"
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
                      <td className="p-4">
                        <Typography className="text-sm font-normal text-gray-600 font-poppins">
                          {goal.score !== undefined && goal.score !== null ? goal.score : 0}
                        </Typography>
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

      <PortalDrawer
        open={addGoalValue.show}
        compo={
          addGoalValue.show ? (
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
                performanceListLoading={goalsValue.performanceListLoading}
                employeesLoading={addGoalValue.employeesLoading}
                handleSelectGoals={handleSelectGoals}
                addGoalValue={addGoalValue}
                handleChangeAddGoal={handleChangeAddGoal}
                handleNewGoal={handleNewGoal}
                handleRemoveEmp={handleRemoveEmp}
              />
            )
          ) : null
        }
        title={addGoalValue.show ? (addGoalValue.view ? "View Goal" : addGoalValue.update ? "Edit Goal" : "Add Goal") : ""}
        closeDrawer={addGoalValue.show ? toggleAddGoal : () => {}}
        widthSize={addGoalValue.show ? (addGoalValue.view ? 760 : 620) : 550}
        // widthSize={addGoalValue.show ? (addGoalValue.view ? 760 : 550) : 550}
        // widthSize={addGoalValue.show ? (addGoalValue.view ? 760 : 550) : 550}
        // widthSize={620}
      />

      <ConfirmationDialog
        openDialog={showDeleteDialog}
        handleOpen={toggleDeleteDialog}
        handleConfirm={confirmDelete}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? This action cannot be undone."
      />

      {showDescriptionModal && (
        <GoalDescriptionModal
          open={showDescriptionModal}
          onClose={handleCloseDescriptionModal}
          goal={selectedGoalForDescription}
        />
      )}
    </div>
  );
};

export default EmployeeGoals;
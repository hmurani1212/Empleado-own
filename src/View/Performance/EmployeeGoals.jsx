import { Typography, Badge, Progress, Button } from "@material-tailwind/react";
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
  const [selectedGoal, setSelectedGoal] = useState(null);

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
      // Check if click is outside any dropdown menu
      const isClickInsideDropdown = event.target.closest(".dropdown-menu");
      if (!isClickInsideDropdown) {
        // Close all open menus
        setOpenMenu({});
      }
    };

    // Add event listener to document
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBackToGoals = () => {
    clearEmployeeGoals();
    // Clear the profile state to return to the main goals table
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
    // Hide the Performance Review Cycle when eye icon is clicked
    if (setShowReviewCycle) {
      setShowReviewCycle(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "0":
        return "red";
      case "1":
        return "blue";
      case "2":
        return "green";
      default:
        return "gray";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "0":
        return "Not Started";
      case "1":
        return "In Progress";
      case "2":
        return "Completed";
      default:
        return "Unknown";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "0":
        return "⭕";
      case "1":
        return "✅";
      case "2":
        return "✅";
      default:
        return "❓";
    }
  };

  const renderStars = (rating, goal) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`cursor-pointer transition-colors ${
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
    <div className="flex flex-col gap-6 py-2 pb-1">
      {/* Employee Profile Header */}
      {employeeProfile && (
        <div className="bg-white rounded-lg  shadow-lg border">
          {/* Top Header */}
          {/* <div className="flex items-center justify-between mb-6">
                        <Typography variant="h4" color="blue-gray" className="font-bold">
                            Performance Management
                        </Typography>
                        <button 
                            onClick={handleBackToGoals}
                            className="text-gray-500 hover:text-gray-700 text-xl"
                        >
                            ✕
                        </button>
                    </div> */}

          {/* Employee Info Section */}

          {/* Review Cycle Section */}
          <div className="flex items-center gap-4 mb-6">
            <Typography
              variant="h6"
              color="blue-gray"
              className="font-semibold"
            >
              Review Cycle
            </Typography>
            <div className="flex-1 max-w-xs">
              <CustomSelect
                placeHolderTitle="Select Review Cycle"
                cStyle={true}
                value={goalsValue.performance_id}
                options={goalsValue.performance?.map((ele) => ({
                  value: ele._id,
                  label: ele.name,
                }))}
                onChangeHandler={handleSelectGoals}
              />
            </div>
            <div className="flex items-center gap-2">
              <FaUser className="text-blue-500" />
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal"
              >
                Goal - for {employeeProfile.name}
              </Typography>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-500" />
              <Typography variant="small" color="gray" className="font-normal">
                Start Date: 2023-01-02
              </Typography>
              <FaArrowRight className="text-gray-400" />
              <Typography variant="small" color="gray" className="font-normal">
                Deadline: 2003-06-0
              </Typography>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => handleTabChange && handleTabChange("goals")}
              className={`px-6 py-3 font-medium transition-colors ${
                currentView === "goals"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Goals
            </button>
            <button
              onClick={() => handleTabChange && handleTabChange("competency")}
              className={`px-6 py-3 font-medium transition-colors ${
                currentView === "competency"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Competency
            </button>
            <button
              onClick={() => handleTabChange && handleTabChange("feedback")}
              className={`px-6 py-3 font-medium transition-colors ${
                currentView === "feedback"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Feedback
            </button>
            <button className="px-6 py-3 text-gray-500 hover:text-gray-700 font-medium">
              History
            </button>
          </div>
        </div>
      )}

      {/* Content based on current view */}
      {currentView === "goals" && (
        <>
          {/* Back Navigation and Add Goal Button */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="text"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              onClick={handleBackToGoals}
            >
              <FaArrowRight className="text-sm rotate-180" />
            </Button>

            <CustomButton
              title="Add Goal"
              onClick={() => {
                handleAddGoal();
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            />
            {/* <Button
                            variant="filled"
                            color="blue"
                            onClick={() => {
                                console.log('Add Goal button clicked');
                                console.log('Current addGoalValue:', addGoalValue);
                                toggleAddGoal();
                            }}
                            className="bg-blue-400 hover:bg-blue-500"
                        >
                            Add Goal
                        </Button> */}
          </div>

          {/* Goals Table */}
          <div className="bg-white rounded-[10px] drop-shadow-md p-2">
            <div className="h-[calc(100vh-100px)] overflow-auto customScroll">
              <table className="w-full text-center">
                <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
                  <tr>
                    {tableHeader?.map((head, i) => (
                      <th key={i} className="bg-[#F8F9FA] p-4">
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-medium leading-none text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employeeGoalsData?.map((goal, i) => {
                    const isLast = i === employeeGoalsData?.length - 1;
                    const classes = isLast
                      ? "p-4"
                      : "p-4 border-b border-[#F2F2F9]";

                    return (
                      <tr key={i}>
                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {goal.name}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {goal.descriptions}
                          </Typography>
                        </td>
                        <td className={classes}>
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-20">
                              <Progress value={goal.progress} color="blue" />
                            </div>
                            <Typography className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize">
                              {goal.progress}% progress
                            </Typography>
                          </div>
                        </td>
                        <td className={classes}>
                          <button
                            type="button"
                            className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors text-[clamp(12px,0.9vw,14px)]"
                            onClick={() =>
                              handleOpenCommentsDrawer &&
                              handleOpenCommentsDrawer(goal)
                            }
                            title="View comments"
                          >
                            💬
                          </button>
                        </td>
                        <td className={classes}>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-[clamp(10px,0.8vw,12px)] text-[#474747] font-Urbanist font-normal">
                              {getStatusIcon(goal.status)}
                            </span>
                            <Badge color={getStatusColor(goal.status)}>
                              {getStatusText(goal.status)}
                            </Badge>
                          </div>
                        </td>
                        <td className={classes}>
                          <div className="relative flex items-center justify-center">
                            <button
                              onClick={() => toggleMenu(i, !openMenu[i])}
                              className="flex items-center gap-2 px-3 py-1 text-[clamp(10px,0.9vw,12px)] bg-gray-100 hover:bg-gray-200 rounded border"
                            >
                              Action
                              <FaChevronDown className="text-xs" />
                            </button>
                            {openMenu[i] && (
                              <div className={`dropdown-menu absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg z-30 ${i<=5 ? "top-full" : "bottom-full"}`}>
                                <button
                                  onClick={() => handleRatingClick(goal)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <FaStar className="text-yellow-500" />
                                  Rating
                                </button>
                                <button
                                  onClick={() => handleEditGoal(goal)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <FaEdit className="text-blue-500" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    handleViewGoal(goal);
                                    handleEyeIconClick();
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <FaEye className="text-green-500" />
                                  View
                                </button>
                                <button
                                  onClick={() => handleDeleteGoal(goal)}
                                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <FaTrash className="text-red-500" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className={classes}>
                          <div className="flex items-center justify-center">
                            {renderStars(goal.rating, goal)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {employeeGoalsData?.length === 0 && (
                <div className="text-center py-8">
                  <Typography variant="h6" color="gray" className="font-normal">
                    No goals found for this employee
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Competency View */}
      {currentView === "competency" && (
        <div className="text-center py-8">
          <Typography variant="h6" color="gray" className="font-normal">
            Competency view will be handled by EmployeeCompetency component
          </Typography>
        </div>
      )}

      {/* Feedback View */}
      {currentView === "feedback" && <EmployeeFeedback />}

      {/* Modals */}
      {console.log(
        "Modal rendering check - addGoalValue.show:",
        addGoalValue.show
      )}
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
          title={
            addGoalValue.view
              ? "View Goal"
              : addGoalValue.update
              ? "Edit Goal"
              : "Add Goal"
          }
          closeDrawer={toggleAddGoal}
          widthSize={addGoalValue.view ? 700 : 550}
        />
      )}

      {/* Delete Confirmation Dialog */}
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
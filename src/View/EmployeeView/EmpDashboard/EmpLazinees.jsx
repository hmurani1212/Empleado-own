import React, { useState, useEffect, useMemo } from "react";
import catGif from "../../../assets/images/cat.gif";
import { motion } from "framer-motion";
import AddTaskModal from "../../../Components/AddTaskModal/AddTaskModal";
import ConfirmationDialog from "../../../Components/ConfirmationDialog/ConfirmationDialog";
import useEmpDashboard from "../../../ViewModel/EmpViewModel/EmpDashboardViewModel/EmpDashboardServices";
import useStore from "../../../Store/store";
// Removed react-datepicker - using native HTML date input instead

// Reusable infinite typing component (type -> pause -> reset -> type again)
const TypingTextInfinite = ({
  text = "Kill Laziness",
  className = "",
  typingSpeed = 0.06, // seconds per character
  pauseAfter = 1200, // ms pause after finished typing
  restartDelay = 200, // ms before restarting
}) => {
  const [cycle, setCycle] = useState(0);

  const container = useMemo(
    () => ({
      hidden: { opacity: 1 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: typingSpeed,
          delayChildren: 0.2,
        },
      },
    }),
    [typingSpeed]
  );

  const letter = useMemo(
    () => ({
      hidden: { opacity: 0, y: 6 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.12 } },
    }),
    []
  );

  useEffect(() => {
    const typingTimeMs = Math.ceil(text.length * typingSpeed * 1000);
    const total = typingTimeMs + pauseAfter + restartDelay;

    const t = setTimeout(() => setCycle((c) => c + 1), total);
    return () => clearTimeout(t);
  }, [cycle, text, typingSpeed, pauseAfter, restartDelay]);

  return (
    <motion.span
      key={cycle} // force remount so the "typing" restarts
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
      aria-label={text}
    >
      {text.split("").map((ch, i) => (
        <motion.span key={i} variants={letter} className="inline-block">
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </motion.span>
  );
};

const EmpLazinees = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState(null);
  const [isReminderDetailOpen, setIsReminderDetailOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [localReminders, setLocalReminders] = useState([]);

  const { empDashboardData, handleLeaveBalance, handleLateMinutes } = useEmpDashboard();
  const { updateReminderStatus, deleteReminder, loading } = useStore();

  // Get attendance data
  const attendanceData = empDashboardData?.attendance;

  // Get reminders from dashboard data and sync with local state
  const dashboardReminders = useMemo(() => {
    return empDashboardData?.reminders || [];
  }, [empDashboardData?.reminders]);

  // Update local reminders when dashboard data changes
  useEffect(() => {
    setLocalReminders(dashboardReminders);
  }, [dashboardReminders]);

  // Use local reminders for display
  const reminders = localReminders;
  const hasReminders = reminders.length > 0;

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle when a new reminder is added (called from AddTaskModal)
  const handleReminderAdded = (newReminder) => {
    if (newReminder) {
      setLocalReminders((prevReminders) => [newReminder, ...prevReminders]);
    }
  };

  // Format reminder time
  const formatReminderTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays < 0) return "Overdue";

    return date.toLocaleDateString();
  };

  // Format date for display (DD, MMM, YY)
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    return `${day}, ${month}, ${year}`;
  };

  // Check if notification was sent (any method has value 2 or 3)
  const isNotificationSent = (reminder) => {
    const methods = reminder.notification_methods;
    return (
      methods &&
      (methods.via_web === 2 ||
        methods.via_web === 3 ||
        methods.via_email === 2 ||
        methods.via_email === 3 ||
        methods.via_push_app === 2 ||
        methods.via_push_app === 3)
    );
  };

  // Filter state: no date by default so "All" shows all reminders on first load
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedDate, setSelectedDate] = useState(""); // Format: YYYY-MM-DD when set; empty = no date filter

  // Filter reminders based on selected filter and date
  const getFilteredReminders = () => {
    if (!reminders || reminders.length === 0) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    // Get start and end of current week (Sunday to Saturday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Get start and end of next week
    const startOfNextWeek = new Date(endOfWeek);
    startOfNextWeek.setDate(endOfWeek.getDate() + 1);
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);

    return reminders.filter((reminder) => {
      const reminderDate = new Date(reminder.entry_time * 1000);
      const reminderDateOnly = new Date(
        reminderDate.getFullYear(),
        reminderDate.getMonth(),
        reminderDate.getDate()
      );

      // If a specific date is selected, filter by that date
      if (selectedDate) {
        const selectedDateObj = new Date(selectedDate);
        const selectedDateOnly = new Date(
          selectedDateObj.getFullYear(),
          selectedDateObj.getMonth(),
          selectedDateObj.getDate()
        );

        if (reminderDateOnly.getTime() !== selectedDateOnly.getTime()) {
          return false;
        }
      }

      switch (selectedFilter) {
        case "All":
          return true;
        case "Today":
          return reminderDateOnly.getTime() === today.getTime();
        case "Tomorrow":
          return reminderDateOnly.getTime() === tomorrow.getTime();
        case "Day after tomorrow":
          return reminderDateOnly.getTime() === dayAfterTomorrow.getTime();
        case "This week":
          return (
            reminderDateOnly >= startOfWeek && reminderDateOnly <= endOfWeek
          );
        case "Next week":
          return (
            reminderDateOnly >= startOfNextWeek &&
            reminderDateOnly <= endOfNextWeek
          );
        default:
          return true;
      }
    });
  };

  // Get filtered reminders
  const filteredReminders = getFilteredReminders();

  const filterOptions = [
    "All",
    "Today",
    "Tomorrow",
    "Day after tomorrow",
    "This week",
    "Next week",
  ];

  // Handle filter button click
  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
    // Clear date selection when using filter buttons (except when manually selecting a date)
    if (filter !== "All") {
      setSelectedDate("");
    }
  };

  // Handle date input change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    // When manually selecting a date, set filter to 'All' to show all reminders for that date
    setSelectedFilter("All");
  };

  // Handle reminder status update (tick button)
  const handleReminderStatusUpdate = async (reminderId) => {
    try {
      await updateReminderStatus(reminderId);
    } catch (error) {
      console.error("Error updating reminder status:", error);
    }
  };

  // Handle reminder deletion confirmation (cross button)
  const handleReminderDeleteClick = (reminder) => {
    setReminderToDelete(reminder);
    setIsDeleteConfirmOpen(true);
  };

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (reminderToDelete) {
      try {
        const result = await deleteReminder(reminderToDelete.id);

        // If deletion was successful, remove from local state immediately
        if (result && result.success) {
          setLocalReminders((prevReminders) =>
            prevReminders.filter(
              (reminder) => reminder.id !== reminderToDelete.id
            )
          );
        }

        // Close confirmation dialog
        setIsDeleteConfirmOpen(false);
        setReminderToDelete(null);
      } catch (error) {
        console.error("Error deleting reminder:", error);
        setIsDeleteConfirmOpen(false);
        setReminderToDelete(null);
      }
    }
  };

  // Handle cancel deletion
  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setReminderToDelete(null);
  };

  // Handle reminder detail modal
  const handleReminderClick = (reminder) => {
    setSelectedReminder(reminder);
    setIsReminderDetailOpen(true);
  };

  const handleCloseReminderDetail = () => {
    setIsReminderDetailOpen(false);
    setSelectedReminder(null);
  };

  // Handle click outside modal to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseReminderDetail();
    }
  };

  useEffect(() => {
    console.log('what is the attendanceData', attendanceData)
  }, [attendanceData])

  return (
    <>
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
        {/* Left Card: Kill Laziness - 2/3 width */}
        <div className="col-span-2 bg-white rounded-[10px] drop-shadow-md p-6">
          {!hasReminders ? (
            // Show cat illustration when no tasks - centered
            <div className="flex items-center justify-center gap-16 h-[200px]">
              {/* Cat Illustration */}
              <div className="flex-shrink-0">
                <img className="lg:h-[150px] md:h-[130px] h-[100px] w-auto" src={catGif} alt="cat" />
              </div>

              {/* Text and Button */}
              <div className="flex flex-col gap-3 items-center">
                <div className="flex flex-col gap-1 items-center">
                  <TypingTextInfinite
                    text="Kill Laziness"
                    className="text-[#3DA5F4] text-[24px] font-semibold font-Urbanist inline-block drop-shadow-md"
                  />
                  <span className="text-[#292929] lg:text-[24px] md:text-[22px] text-[20px] text-center font-Urbanist font-medium">
                    Start working today!
                  </span>
                </div>

                <button
                  onClick={handleOpenModal}
                  className="bg-bgBlue text-white px-6 py-2 rounded-lg text-[14px] font-medium hover:opacity-90 transition-opacity w-fit"
                >
                  Add Task
                </button>
              </div>
            </div>
          ) : (
            // Show tasks when they exist
            <div className="flex flex-col gap-4 h-full">
              {/* Header with Add Task button */}
              <div className="flex items-center justify-between flex-shrink-0">
                <div className="flex flex-col gap-1">
                  <TypingTextInfinite
                    text="Kill Laziness"
                    className="text-[#3DA5F4] lg:text-[20px] md:text-[18px] text-[16px] font-semibold inline-block"
                  />
                  <span className="text-[#212529] lg:text-[14px] md:text-[14px] text-[12px]">
                    Start working today!
                  </span>
                </div>

                <button
                  onClick={handleOpenModal}
                  className="bg-bgBlue text-white px-6 py-2 rounded-lg text-[14px] font-medium hover:opacity-90 transition-opacity"
                >
                  Add Task
                </button>
              </div>

              {/* Tasks List - Scrollable on Y-axis */}
              <div
                className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0 max-h-[150px]"
              >
                {filteredReminders.length > 0 ? (
                  filteredReminders.map((reminder, index) => (
                    <div
                      key={reminder.id || index}
                      className="bg-gray-50 rounded-lg border border-gray-200 p-4 flex-shrink-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handleReminderClick(reminder)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="text-white px-3 py-1 rounded-md text-[12px] font-medium"
                              style={{
                                backgroundColor: isNotificationSent(reminder)
                                  ? "#fbb100"
                                  : "#4ade80",
                              }}
                            >
                              {reminder.title}
                            </span>
                            <span className="text-gray-500 text-[12px]">
                              {formatDate(reminder.reminder_time)}
                            </span>
                          </div>

                          <div className="text-gray-600 text-[13px] line-clamp-2">
                            {reminder.text || "No description"}
                          </div>

                          <div className="text-green-500 text-[12px] mt-1">
                            {formatReminderTime(reminder.reminder_time)}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            className="text-green-500 hover:text-green-600 text-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReminderStatusUpdate(reminder.id);
                            }}
                            disabled={loading}
                            title="Mark as sent"
                          >
                            ✓
                          </button>

                          <button
                            className="text-red-500 hover:text-red-600 text-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReminderDeleteClick(reminder);
                            }}
                            disabled={loading}
                            title="Delete reminder"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 flex-shrink-0">
                    No tasks match the current filter
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Card: Leave Balance - 1/3 width */}
        <div className="col-span-1 flex items-center justify-between w-full bg-white rounded-[10px] p-2 shadow-md">
          <div className="grid grid-cols-2 gap-2 w-full">
            {/* Annual Leaves Circular Progress */}
            <div className="flex flex-col items-center bg-[#EFF8FF] p-4 rounded-[8px] shadow-md">
              <div className="mb-2">
                <span className="text-[#292929] text-[14px] font-semibold font-Urbanist truncate">
                  Leave Balance
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-3 cursor-pointer rounded-full" onClick={handleLeaveBalance}>
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="52"
                      stroke="white"
                      strokeWidth="12"
                      fill="none"
                    />
                    {(() => {
                      const availed = attendanceData?.availed || 0;
                      const total = attendanceData?.leaves || 1;
                      const percentage = Math.min(100, (availed / total) * 100);
                      const circumference = 2 * Math.PI * 52;
                      const offset = circumference * (1 - percentage / 100);

                      return (
                        <motion.circle
                          cx="64"
                          cy="64"
                          r="52"
                          stroke="#8770ff"
                          strokeWidth="12"
                          fill="none"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset: offset }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      );
                    })()}
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[16px] font-bold text-[#212529]">
                      {attendanceData?.availed || 0}/
                      {attendanceData?.leaves || 0}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      (Availed/Total)
                    </span>
                  </div>
                </div>
                <span className="text-[12px] text-[#212529]">
                  Annual Leaves
                </span>
              </div>
            </div>

            {/* Late Minutes Circular Progress */}
            <div className="flex flex-col items-center bg-[#FEF2F2] p-4 rounded-[8px] shadow-md">
              <div className="mb-2">
                <span className="text-[#292929] text-[14px] font-semibold font-Urbanist truncate">
                  Late Minutes
                </span>
              </div>
              <div className="relative w-32 h-32 mb-3 cursor-pointer rounded-full" onClick={handleLateMinutes}>
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="white"
                    strokeWidth="12"
                    fill="none"
                  />
                  {(() => {
                    const usedLateMin = attendanceData?.total_late_minutes || 0;
                    const allowedLateMin =
                      attendanceData?.allowed_late_min || 1;
                      const percentage = Math.min(
                        100,
                        ((usedLateMin > 0 ? usedLateMin : attendanceData?.total_used_late_min) / allowedLateMin) * 100
                      );
                    // const percentage = Math.min(
                    //   100,
                    //   (usedLateMin > 0 ? usedLateMin : attendanceData?.total_used_late_min / allowedLateMin) * 100
                    // );
                    const circumference = 2 * Math.PI * 52;
                    const offset = circumference * (1 - percentage / 100);
                    const strokeColor =
                      attendanceData?.total_late_minutes > 0 ? "#FC563B" : "#0acf97";

                    return (
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="52"
                        stroke={strokeColor}
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                    );
                  })()}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className={`text-[16px] font-bold ${
                      attendanceData?.total_late_minutes < 0
                        ? "text-red-500"
                        : "text-[#212529]"
                    }`}
                  >
                    {Math.abs(attendanceData?.total_late_minutes > 0 ? attendanceData?.total_late_minutes : attendanceData?.total_used_late_min || 0)}/
                    {attendanceData?.allowed_late_min || 0}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    (Used/Allowed)
                  </span>
                </div>
              </div>

              <span className="text-[12px] text-[#212529]">
                {attendanceData?.total_late_minutes > 0
                  ? "Deducted Minutes"
                  : "Late Minutes"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section - Show when there are reminders */}
      {hasReminders && (
        <div className="bg-white rounded-[10px] drop-shadow-md p-4 mt-1">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Input */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-32 text-[#333333] text-[12px] rounded-md py-[8px] px-[12px] border border-gray-500 outline-none focus:border-customBlue focus:ring-1 focus:ring-customBlue"
              />
              <svg
                className="w-4 h-4 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {filterOptions.map((filter) => (
                <button
                  key={filter}
                  onClick={() => handleFilterClick(filter)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedFilter === filter
                      ? "bg-cyan-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onReminderAdded={handleReminderAdded}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        openDialog={isDeleteConfirmOpen}
        handleOpen={handleCancelDelete}
        title="Delete Reminder"
        message={`Are you sure you want to delete the reminder "${
          reminderToDelete?.title || "this reminder"
        }"? This action cannot be undone.`}
        handleConfirm={handleConfirmDelete}
        loading={loading}
        size="xs"
      />

      {/* Reminder Detail Modal */}
      {isReminderDetailOpen && selectedReminder && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center pt-20 z-50"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-xl w-[480px] h-[360px] max-w-[90vw] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Blue Header */}
            <div className="bg-cyan-500 text-white px-8 py-6 rounded-t-lg flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Reminder</h2>
              <button
                onClick={handleCloseReminderDetail}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* White Body */}
            <div className="px-8 py-8 text-center">
              {/* Title */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                  {selectedReminder.title}
                </h3>
              </div>

              {/* Text */}
              <div>
                <p className="text-base text-gray-800 leading-relaxed">
                  {selectedReminder.text}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default EmpLazinees;
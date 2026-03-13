import { Typography, Card, CardBody, Avatar, Progress } from '@material-tailwind/react'
import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { FlagIcon, LightBulbIcon, ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/solid'
import noRecordFound from '../../../assets/employee_side_images/no record found.gif';

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-100">
    <td className="py-4 px-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
    <td className="py-4 px-4"><div className="h-4 w-40 bg-gray-200 rounded"></div></td>
    <td className="py-4 px-4"><div className="h-2 w-full bg-gray-200 rounded-full"></div></td>
    <td className="py-4 px-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
    <td className="py-4 px-4"><div className="h-6 w-16 bg-gray-200 rounded-full"></div></td>
    <td className="py-4 px-4"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
    <td className="py-4 pl-4"><div className="h-8 w-16 bg-gray-200 rounded"></div></td>
  </tr>
);
import { gettingEmployeePerformance, deleteEmployeeGoal, toggleEmployeeGoalStatus } from "../../../ViewModel/EmpViewModel/EmpPerformanceViewModel/EmpPerformance"
import CustomSelect from "../../../Components/CustomSelect/CustomSelect"
import CustomDrawer from "../../../Components/CustomDrawer/CustomDrawer"
import AddGoalForm from "./AddGoalForm"
import ConfirmationDialog from "../../../Components/ConfirmationDialog/ConfirmationDialog"
import GoalDescriptionModal from "../../Performance/GoalDescriptionModal"

const EmpPerformance = () => {
  const [activeTab, setActiveTab] = useState("goals");
  const [perfData, setPerfData] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState({ label: "All Review Cycles", value: "" });
  const [feedbackGivenOpen, setFeedbackGivenOpen] = useState(true);
  const [feedbackReceivedOpen, setFeedbackReceivedOpen] = useState(false);
  const [addGoalDrawerOpen, setAddGoalDrawerOpen] = useState(false);

  // Pagination states for load more functionality
  const [pagination, setPagination] = useState({
    goals: { current_page: 1, total_pages: 1, has_next_page: false },
    competencies: { current_page: 1, total_pages: 1, has_next_page: false },
    feedback: { current_page: 1, total_pages: 1, has_next_page: false },
    history: { current_page: 1, total_pages: 1, has_next_page: false }
  });

  // Loading state
  const [loading, setLoading] = useState(false);

  // Action dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);

  // Delete confirmation states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Edit states
  const [editItem, setEditItem] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [actionGoalLoadingId, setActionGoalLoadingId] = useState(null);
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

  const get_Performence_data = async (params = {}) => {
    try {
      setLoading(true);
      const res = await gettingEmployeePerformance(params);
      if (res && res.STATUS === "SUCCESSFUL") {
        setPerfData(res.DB_DATA || null);
        if (res.pagination) {
          setPagination(prevPagination => ({
            ...prevPagination,
            ...res.pagination
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    get_Performence_data()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const employeeName = perfData?.emp_data?.name || "";
  const designation = perfData?.emp_data?.designationObj?.title || "";
  const department = perfData?.emp_data?.department?.name || "";
  const avatarSrc = perfData?.emp_data?.dp || "https://emp.veevotech.com/images/icons/empf.jpg";

  const cycles = useMemo(() => {
    return (perfData?.Performence || [])
      .filter(c => c?.name)
      .map((c) => ({
        label: c.name,
        value: c._id || c.name
      }));
  }, [perfData]);

  // Use all goals directly from API (no frontend filtering)
  const goalsForCycle = useMemo(() => {
    const allGoals = perfData?.Goal || [];
    console.log('All goals available:', allGoals.length);
    return allGoals;
  }, [perfData?.Goal]);

  const { startText, endText } = useMemo(() => {
    // First, try to get dates from goals
    const dates = goalsForCycle
      .map((g) => ({
        start: g?.start_period || (g?.startDate ? new Date(g.startDate * 1000).toISOString() : null),
        end: g?.end_period || (g?.endDate ? new Date(g.endDate * 1000).toISOString() : null),
      }))
      .filter((d) => d.start || d.end);

    // If we have dates from goals, use them
    if (dates.length > 0) {
      const starts = dates.map((d) => d.start).filter(Boolean).map((s) => new Date(s).getTime());
      const ends = dates.map((d) => d.end).filter(Boolean).map((e) => new Date(e).getTime());
      const minStart = starts.length ? new Date(Math.min(...starts)) : null;
      const maxEnd = ends.length ? new Date(Math.max(...ends)) : null;
      return { startText: minStart ? minStart.toLocaleDateString() : "N/A", endText: maxEnd ? maxEnd.toLocaleDateString() : "N/A" };
    }

    // If no goals found, check if a specific performance review cycle is selected
    if (selectedCycle?.value && perfData?.Performence) {
      const selectedCycleData = perfData.Performence.find(
        (cycle) => cycle._id === selectedCycle.value || cycle.name === selectedCycle.value
      );

      if (selectedCycleData) {
        const startDate = selectedCycleData.startDate
          ? new Date(selectedCycleData.startDate * 1000).toLocaleDateString()
          : "N/A";
        const endDate = selectedCycleData.endDate
          ? new Date(selectedCycleData.endDate * 1000).toLocaleDateString()
          : "N/A";
        return { startText: startDate, endText: endDate };
      }
    }

    // Default fallback
    return { startText: "N/A", endText: "N/A" };
  }, [goalsForCycle, selectedCycle, perfData?.Performence]);

  const tabsData = [
    { label: "Goals", value: "goals" },
    { label: "Competency", value: "competency" },
    { label: "Feedback", value: "feedback" },
    { label: "History", value: "history" }
  ]

  // Handle goal form submission
  const handleGoalSubmit = (formData) => {
    console.log('Goal form submitted:', formData);
    // Close drawer only after successful API call (handled in AddGoalForm)
    setAddGoalDrawerOpen(false);
    setIsEditMode(false);
    setEditItem(null);
    // Refresh data after submission
    get_Performence_data({
      goal_page: 1,
      feedback_page: 1,
      history_page: 1,
      performance_id: selectedCycle?.value || undefined
    });
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    setAddGoalDrawerOpen(false);
    setIsEditMode(false);
    setEditItem(null);
  };

  // Handle cycle selection change - send performance_id to API for filtering
  const handleCycleChange = (cycle) => {
    console.log('Cycle changed to:', cycle);
    setSelectedCycle(cycle);

    // Reset pagination and fetch data with the selected performance_id
    const params = cycle?.value ? { performance_id: cycle.value } : {};

    // Reset to first page when changing cycle
    if (cycle?.value) {
      params.goal_page = 1;
      params.competency_page = 1;
      params.feedback_page = 1;
      params.history_page = 1;
    }

    get_Performence_data(params);
  };

  // Pagination key and param map for current tab
  const paginationKeyMap = {
    'goals': 'goals',
    'competency': 'competencies',
    'feedback': 'feedback',
    'history': 'history'
  };
  const paramMap = {
    'goals': 'goal_page',
    'competency': 'competency_page',
    'feedback': 'feedback_page',
    'history': 'history_page'
  };

  const getCurrentTabPagination = () => {
    const key = paginationKeyMap[activeTab] || activeTab;
    return pagination[key] || { current_page: 1, total_pages: 1, has_next_page: false };
  };

  const goToEmpPerfPage = (page) => {
    const apiParamName = paramMap[activeTab] || 'goal_page';
    const params = { [apiParamName]: page };
    if (selectedCycle?.value) params.performance_id = selectedCycle.value;
    get_Performence_data(params);
  };

  const goToPreviousEmpPerfPage = () => {
    const current = getCurrentTabPagination();
    const prevPage = Math.max(1, (current.current_page || 1) - 1);
    if (prevPage !== current.current_page) goToEmpPerfPage(prevPage);
  };

  const goToNextEmpPerfPage = () => {
    const current = getCurrentTabPagination();
    const nextPage = Math.min(current.total_pages || 1, (current.current_page || 1) + 1);
    if (nextPage !== current.current_page) goToEmpPerfPage(nextPage);
  };

  // Handle action dropdown toggle
  const handleDropdownToggle = (goalId) => {
    setOpenDropdown(openDropdown === goalId ? null : goalId);
  };

  // Handle edit goal
  const handleEditGoal = (goal) => {
    setEditItem(goal);
    setIsEditMode(true);
    setAddGoalDrawerOpen(true);
    setOpenDropdown(null);
  };

  // Handle delete goal
  const handleDeleteGoal = (goal) => {
    setDeleteItem(goal);
    setShowDeleteConfirm(true);
    setOpenDropdown(null);
  };

  // Handle started goal
  const handleStartedGoal = async (goal) => {
    if (!goal?._id || actionGoalLoadingId) return;
    setActionGoalLoadingId(goal._id);
    try {
      const result = await toggleEmployeeGoalStatus(goal._id);
      if (result) {
        await get_Performence_data({
          goal_page: 1,
          feedback_page: 1,
          history_page: 1,
          performance_id: selectedCycle?.value || undefined
        });
      }
    } catch (error) {
      console.error('Error toggling goal status:', error);
    } finally {
      setActionGoalLoadingId(null);
      setOpenDropdown(null);
    }
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    setDeleteLoading(true);
    try {
      const result = await deleteEmployeeGoal(deleteItem._id);
      if (result) {
        // Refresh the data after successful deletion
        await get_Performence_data({
          goal_page: 1,
          feedback_page: 1,
          history_page: 1,
          performance_id: selectedCycle?.value || undefined
        });
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    } finally {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
      setDeleteItem(null);
    }
  };

  // Handle cancel delete
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteItem(null);
  };

  const getStatusActionLabel = (status) => {
    switch (status) {
      case '0':
        return 'Start';
      case '1':
        return 'Mark Completed';
      case '2':
        return 'Completed';
      default:
        return 'Start';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-dropdown')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className='flex flex-col gap-6 p-4'>
      {/* Employee Info Card */}
      <Card className="w-full">
        <CardBody className="p-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/50 via-white to-transparent p-6 mb-8 border border-blue-50/50">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-100/30 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                <div className="p-1 bg-white rounded-full shadow-sm">
                  <Avatar
                    src={avatarSrc}
                    alt="Employee Photo"
                    size="xl"
                    className="border-2 border-white shadow-sm"
                  />
                </div>
                <div>
                  <Typography variant="h4" className="font-bold text-gray-900 text-[22px] mb-1">
                    {employeeName || "—"}
                  </Typography>
                  <div className="flex items-center gap-2 flex-wrap">
                    {designation && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[12px] font-medium border border-blue-100">
                        {designation}
                      </span>
                    )}
                    {designation && department && <span className="text-gray-400 text-sm">•</span>}
                    <Typography variant="small" className="font-normal text-gray-500">
                      {department || "—"}
                    </Typography>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 lg:gap-8 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/60 relative z-10">
                <div className="flex items-center gap-3 relative z-[9999]">
                  <Typography variant="small" color="blue-gray" className="font-medium text-xs uppercase tracking-wide opacity-70">
                    Review Cycle
                  </Typography>
                  <div className="w-48 relative z-[9999]">
                    <CustomSelect
                      placeHolderTitle="All Review Cycles"
                      value={selectedCycle}
                      options={[{ label: "All Review Cycles", value: "" }, ...cycles]}
                      onChangeHandler={handleCycleChange}
                      isSearchable={false}
                      menuPortalTarget={document.body}
                      customStyles={{
                        control: (base) => ({
                          ...base,
                          minHeight: '32px',
                          fontSize: '13px',
                          border: '1px solid #e5e7eb',
                          boxShadow: 'none',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          cursor: 'pointer',
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 9999,
                          fontSize: '13px',
                        }),
                        menuPortal: (base) => ({
                          ...base,
                          zIndex: 9999,
                        }),
                        menuList: (base) => ({
                          ...base,
                          maxHeight: '200px',
                          padding: '4px',
                        }),
                        option: (base, state) => ({
                          ...base,
                          fontSize: '13px',
                          padding: '8px 12px',
                          cursor: 'pointer',
                          backgroundColor: state.isSelected
                            ? '#3DA5F4'
                            : state.isFocused
                              ? '#E3F1FF'
                              : 'white',
                          color: state.isSelected ? 'white' : '#333',
                          '&:hover': {
                            backgroundColor: state.isSelected ? '#2B8FD4' : '#F0F8FF',
                          },
                        }),
                      }}
                    />
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-200 hidden md:block"></div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <Typography variant="small" className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
                      Timeline
                    </Typography>
                    <Typography variant="small" color="blue-gray" className="font-medium text-xs">
                      {startText} <span className="text-gray-400 mx-1">→</span> {endText}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 mt-2">
            {/* Performance Review Cycles (PRC) */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/30 border border-blue-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 rounded-lg bg-white text-blue-500 shadow-sm">
                <FlagIcon className="w-5 h-5" />
              </div>
              <div>
                <Typography variant="small" className="font-bold text-gray-900 text-lg leading-none mb-0.5">
                  {perfData?.total_performance_review_cycles || perfData?.Performence?.length || 0}
                </Typography>
                <Typography variant="small" className="font-medium text-gray-500 text-xs">
                  Total PRC
                </Typography>
              </div>
            </div>
            {/* Goals Stat */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/30 border border-blue-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 rounded-lg bg-white text-blue-500 shadow-sm">
                <FlagIcon className="w-5 h-5" />
              </div>
              <div>
                <Typography variant="small" className="font-bold text-gray-900 text-lg leading-none mb-0.5">
                  {pagination?.goals?.total_items || perfData?.Goal?.length || 0}
                </Typography>
                <Typography variant="small" className="font-medium text-gray-500 text-xs">
                  Total Goals
                </Typography>
              </div>
            </div>

            {/* Competency Stat */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/30 border border-amber-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 rounded-lg bg-white text-amber-500 shadow-sm">
                <LightBulbIcon className="w-5 h-5" />
              </div>
              <div>
                <Typography variant="small" className="font-bold text-gray-900 text-lg leading-none mb-0.5">
                  {pagination?.competencies?.total_items || perfData?.competency?.length || 0}
                </Typography>
                <Typography variant="small" className="font-medium text-gray-500 text-xs">
                  Competencies
                </Typography>
              </div>
            </div>

            {/* Feedback Stat */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50/30 border border-purple-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 rounded-lg bg-white text-purple-500 shadow-sm">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
              </div>
              <div>
                <Typography variant="small" className="font-bold text-gray-900 text-lg leading-none mb-0.5">
                  {pagination?.feedback?.total_items || perfData?.Feedback?.length || 0}
                </Typography>
                <Typography variant="small" className="font-medium text-gray-500 text-xs">
                  Feedback
                </Typography>
              </div>
            </div>

            {/* History Stat */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-50/30 border border-teal-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="p-2.5 rounded-lg bg-white text-teal-500 shadow-sm">
                <ClockIcon className="w-5 h-5" />
              </div>
              <div>
                <Typography variant="small" className="font-bold text-gray-900 text-lg leading-none mb-0.5">
                  {pagination?.history?.total_items || perfData?.history?.length || 0}
                </Typography>
                <Typography variant="small" className="font-medium text-gray-500 text-xs">
                  History
                </Typography>
              </div>
            </div>
          </div>

          {/* Add Goals Button - Only show on Goals tab */}
          {activeTab === "goals" && (
            <div className="flex justify-end">
              <button
                onClick={() => setAddGoalDrawerOpen(true)}
                className="bg-bgBlue text-white px-3 py-1.5 text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Goals
              </button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Performance Tabs */}
      <Card className="w-full relative z-0 overflow-visible">
        <CardBody className="p-6 overflow-visible">
          <div className="w-full overflow-visible">
            <div className='flex items-center gap-5 mb-6'>
              {tabsData.map(({ label, value }) => (
                <div
                  key={value}
                  className={`${activeTab === value ? "text-white" : "hover:text-black/60 text-black"
                    } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition focus-visible:outline-2`}
                  style={{
                    WebkitTapHighlightColor: "transparent",
                  }}
                  onClick={() => setActiveTab(value)}
                >
                  {activeTab === value && (
                    <motion.span
                      layoutId="bubble"
                      className="absolute inset-0 z-10 bg-bgBlue"
                      style={{ borderRadius: 9999 }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className='relative cursor-pointer text-[14px] z-20'>{label}</span>
                </div>
              ))}
            </div>

            {activeTab === "goals" && (
              <div className="p-0 mt-6 overflow-visible">
                {/* Goals Table */}
                <div className="w-full overflow-visible">
                  {loading ? (
                    <div className="w-full">
                      <table className="w-full text-center">
                        <thead>
                          <tr>
                            {['Goal', 'Goal Description', 'Progress', 'Comment', 'Status', 'Rating', 'Action'].map((h, i) => (
                              <th key={h} className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 px-4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">{h}</Typography>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <>
                      <div className="w-full overflow-visible">
                        <table className="w-full text-center table-auto relative">
                          <thead>
                            <tr>
                              <th className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 px-2 text-left">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Goal</Typography>
                              </th>
                              <th className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 px-2 text-left">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Descriptions</Typography>
                              </th>
                              <th className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 px-2">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Progress</Typography>
                              </th>
                              <th className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 px-2">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Comment</Typography>
                              </th>
                              <th className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 px-2">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Status</Typography>
                              </th>
                              <th className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 px-2">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Rating</Typography>
                              </th>
                              <th className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 px-2">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Action</Typography>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {goalsForCycle && goalsForCycle.length ? (
                              (() => {
                                console.log('Rendering goals in table:', goalsForCycle.length);
                                return goalsForCycle.map((g, idx) => {
                                  const getStatusText = (status) => {
                                    switch (status) {
                                      case '0': return 'Pending';
                                      case '1': return 'In Progress';
                                      case '2': return 'Completed';
                                      default: return status || '—';
                                    }
                                  };

                                  const getStatusColor = (status) => {
                                    switch (status) {
                                      case '0': return 'text-yellow-600';
                                      case '1': return 'text-blue-600';
                                      case '2': return 'text-green-600';
                                      default: return 'text-gray-600';
                                    }
                                  };

                                  const rowsRemaining = goalsForCycle.length - idx - 1;
                                  const shouldOpenUp = rowsRemaining < 2;

                                  return (
                                    <tr key={g._id || idx} className={openDropdown === g._id ? 'relative z-[100]' : ''}>
                                      <td className="py-4 px-2 border-b border-blue-gray-50 text-left">
                                        <Typography variant="small" color="blue-gray" className="font-medium">
                                          {g.name || g.title || '—'}
                                        </Typography>
                                      </td>
                                      <td className="py-4 px-2 border-b border-blue-gray-50 text-left">
                                        <div className="flex items-center gap-2">
                                          <Typography variant="small" color="blue-gray" className="text-sm">
                                            Descriptions,
                                          </Typography>
                                          <button
                                            type="button"
                                            onClick={() => handleOpenDescriptionModal(g)}
                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                                          >
                                            read
                                          </button>
                                        </div>
                                      </td>
                                      <td className="py-4 px-2 border-b border-blue-gray-50 text-center">
                                        <div className="flex flex-col items-center gap-2">
                                          <Progress value={g.progress || 0} className="w-full max-w-20" />
                                          <Typography variant="small" color="blue-gray" className="opacity-70 text-xs">
                                            {g.progress || 0}%
                                          </Typography>
                                        </div>
                                      </td>
                                      <td className="py-4 px-2 border-b border-blue-gray-50 text-center">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                          {g.comment || '—'}
                                        </Typography>
                                      </td>
                                      <td className="py-4 px-2 border-b border-blue-gray-50 text-center">
                                        <div className="flex justify-center">
                                          <div className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${g.status === '0' ? 'bg-amber-50 text-amber-600' :
                                              g.status === '1' ? 'bg-blue-50 text-blue-600' :
                                                g.status === '2' ? 'bg-green-50 text-green-600' :
                                                  'bg-gray-50 text-gray-600'
                                            }`}>
                                            {getStatusText(g.status)}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-4 px-2 border-b border-blue-gray-50 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          {Array.from({ length: 5 }).map((_, starIdx) => (
                                            <span
                                              key={starIdx}
                                              className={`text-lg ${starIdx < (Number(g.rating) || 0) ? 'text-yellow-400' : 'text-gray-300'
                                                }`}
                                            >
                                              ★
                                            </span>
                                          ))}
                                        </div>
                                      </td>
                                      <td className={`py-4 px-2 border-b border-blue-gray-50 text-center relative ${openDropdown === g._id ? 'z-[100]' : 'z-10'}`}>
                                        <div className="relative action-dropdown flex justify-center">
                                          <button
                                            onClick={() => handleDropdownToggle(g._id)}
                                            className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 relative z-10"
                                          >
                                            Action
                                            <ChevronDownIcon className="w-3 h-3" />
                                          </button>

                                          {openDropdown === g._id && (
                                            <div className={`absolute ${shouldOpenUp ? 'bottom-full mb-0' : 'top-full mt-0'} right-0 w-32 bg-white border border-gray-200 rounded-md shadow-xl min-w-[120px] z-[9999]`}>
                                              <button
                                                onClick={() => handleEditGoal(g)}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 first:rounded-t-md"
                                              >
                                                Edit
                                              </button>
                                              <button
                                                onClick={() => handleStartedGoal(g)}
                                                disabled={g.status === '2' || actionGoalLoadingId === g._id}
                                                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b ${g.status === '2' ? 'text-gray-400 cursor-not-allowed' : ''} ${g.added_by === 'Employee' ? 'border-gray-100' : ''}`}
                                              >
                                                {actionGoalLoadingId === g._id ? 'Updating...' : getStatusActionLabel(g.status)}
                                              </button>
                                              {g.added_by === 'Employee' && (
                                                <button
                                                  onClick={() => handleDeleteGoal(g)}
                                                  className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 last:rounded-b-md"
                                                >
                                                  Delete
                                                </button>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                });
                              })()
                            ) : (
                              <tr>
                                <td colSpan={7} className="py-12 text-center text-gray-400">
                                  <div className="flex flex-col items-center justify-center">
                                    <img src={noRecordFound} alt="No record found" className='w-40 opacity-70 mix-blend-multiply mb-4' />
                                    <Typography color="gray" className="font-medium">No goals found</Typography>
                                    <Typography variant="small" color="blue-gray" className="opacity-60 mt-1">
                                      Add your first goal to get started
                                    </Typography>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === "competency" && (
              <div className="p-0 mt-6">
                {/* Competency Table */}
                <div className="w-full overflow-x-auto">
                  {loading ? (
                    <div className="w-full overflow-x-auto">
                      <table className="min-w-full text-center table-fixed">
                        <thead>
                          <tr>
                            {['Competency', 'Rating', 'Score'].map((h, i) => (
                              <th key={h} className={`border-b border-blue-gray-50 bg-blue-gray-50 py-4 px-4 ${i === 0 ? 'w-1/2' : 'w-1/4'}`}>
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">{h}</Typography>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...Array(5)].map((_, i) => (
                            <tr key={i} className="animate-pulse border-b border-gray-100">
                              <td className="py-4 px-4"><div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div></td>
                              <td className="py-4 px-4"><div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div></td>
                              <td className="py-4 px-4"><div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <>
                      <div className="w-full overflow-visible">
                        <table className="min-w-full text-center table-fixed">
                          <thead>
                            <tr>
                              <th className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 px-4 w-1/2 text-left pl-8">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Competency</Typography>
                              </th>
                              <th className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 px-4 w-1/4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Rating</Typography>
                              </th>
                              <th className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 px-4 w-1/4">
                                <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Score</Typography>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {perfData?.competency?.length ? (
                              perfData.competency.map((c, i) => (
                                <tr key={c._id || i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                  <td className="py-4 px-4 text-left pl-8">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-blue-50 rounded-lg">
                                        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </div>
                                      <div>
                                        <Typography variant="small" color="blue-gray" className="font-medium">
                                          {c.competency || '—'}
                                        </Typography>
                                        <Typography variant="small" className="text-gray-400 text-[10px]">
                                          Competency Assessment
                                        </Typography>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex items-center justify-center gap-1">
                                      {Array.from({ length: 5 }).map((_, idx) => (
                                        <span key={idx} className={`text-lg ${idx < (Number(c.rating) || 0) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="py-4 px-4">
                                    <div className="flex items-center justify-center gap-3">
                                      <Progress value={(Number(c.rating) || 0) * 20} size="sm" color="blue" className="bg-blue-50 w-24" />
                                      <Typography variant="small" className="text-xs font-medium text-blue-600 w-8">
                                        {(Number(c.rating) || 0) * 20}%
                                      </Typography>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} className="py-12 text-center text-gray-400">
                                  <div className="flex flex-col items-center justify-center">
                                    <img src={noRecordFound} alt="No record found" className='w-40 opacity-70 mix-blend-multiply mb-4' />
                                    <Typography color="gray" className="font-medium">No competency items found</Typography>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === "feedback" && (
              <div className="p-0 mt-6 w-full">
                <div className="w-full overflow-x-auto">
                  {loading ? (
                    <div className="w-full">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-200 bg-gray-50">
                            {['From', 'Date', 'Type', 'Comment'].map((h, i) => (
                              <th key={h} className={`py-5 px-6 text-left ${i === 1 || i === 2 ? 'text-center' : ''}`}>
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-600">{h}</span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[...Array(5)].map((_, i) => (
                            <tr key={i} className="animate-pulse border-b border-gray-100">
                              <td className="py-4 px-6"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                              <td className="py-4 px-6"><div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div></td>
                              <td className="py-4 px-6"><div className="h-6 w-16 bg-gray-200 rounded-full mx-auto"></div></td>
                              <td className="py-4 px-6"><div className="h-4 w-40 bg-gray-200 rounded"></div></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <>
                      <div className="w-full">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b-2 border-gray-200 bg-gray-50">
                              <th className="py-5 px-6 text-left"><span className="text-xs font-semibold uppercase tracking-wide text-gray-600">From</span></th>
                              <th className="py-5 px-6 text-center"><span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Date</span></th>
                              <th className="py-5 px-6 text-center"><span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Type</span></th>
                              <th className="py-5 px-6 text-left"><span className="text-xs font-semibold uppercase tracking-wide text-gray-600">Comment</span></th>
                            </tr>
                          </thead>
                          <tbody>
                            {perfData?.Feedback?.length ? (
                              perfData.Feedback.map((feedback, index) => {
                                const formatDate = (timestamp) => {
                                  if (!timestamp) return '—';
                                  try {
                                    const date = new Date(timestamp * 1000);
                                    const y = date.getFullYear();
                                    const m = String(date.getMonth() + 1).padStart(2, '0');
                                    const d = String(date.getDate()).padStart(2, '0');
                                    return `${y}-${m}-${d}`;
                                  } catch {
                                    return '—';
                                  }
                                };

                                return (
                                  <tr key={feedback._id || index} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6 text-left align-middle">
                                      <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-50 rounded-lg shrink-0">
                                          <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-500" />
                                        </div>
                                        <Typography variant="small" color="blue-gray" className="font-medium">
                                          {feedback.employee_name || 'Unknown'}
                                        </Typography>
                                      </div>
                                    </td>
                                    <td className="py-4 px-6 text-center align-middle">
                                      <Typography variant="small" color="blue-gray" className="font-normal">
                                        {formatDate(feedback.entry_time)}
                                      </Typography>
                                    </td>
                                    <td className="py-4 px-6 align-middle">
                                      <div className="flex justify-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${feedback.thumb === '1'
                                            ? 'bg-green-50 text-green-600 border-green-100'
                                            : 'bg-red-50 text-red-600 border-red-100'
                                          }`}>
                                          <span className={`w-2 h-2 rounded-full shrink-0 ${feedback.thumb === '1' ? 'bg-green-500' : 'bg-red-500'}`} />
                                          {feedback.thumb === '1' ? 'Positive' : 'Negative'}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-4 px-6 text-left align-middle">
                                      <Typography variant="small" color="blue-gray" className="font-normal text-gray-600 line-clamp-2">
                                        {feedback.comment || '—'}
                                      </Typography>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan={4} className="py-12 text-center text-gray-400">
                                  <div className="flex flex-col items-center justify-center">
                                    <img src={noRecordFound} alt="No record found" className='w-40 opacity-70 mix-blend-multiply mb-4' />
                                    <Typography color="gray" className="font-medium">No feedback received</Typography>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="p-0 mt-6">
                {/* History Table */}
                <div className="w-full overflow-x-auto">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Typography variant="small" color="blue-gray" className="opacity-70">
                        Loading history...
                      </Typography>
                    </div>
                  ) : (
                    <>
                      <table className="min-w-full text-left table-fixed">
                        <thead>
                          <tr>
                            <th className="border-b border-blue-gray-50 bg-blue-gray-50 p-3 w-[25%]">
                              <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                Name of Review Cycle
                              </Typography>
                            </th>
                            <th className="border-b border-blue-gray-50 bg-blue-gray-50 p-3 w-[15%]">
                              <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                Start Date
                              </Typography>
                            </th>
                            <th className="border-b border-blue-gray-50 bg-blue-gray-50 p-3 w-[15%]">
                              <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                End Date
                              </Typography>
                            </th>
                            <th className="border-b border-blue-gray-50 bg-blue-gray-50 p-3 w-[22.5%]">
                              <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                Goal Progress
                              </Typography>
                            </th>
                            <th className="border-b border-blue-gray-50 bg-blue-gray-50 p-3 w-[22.5%]">
                              <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                                Competency Progress
                              </Typography>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {perfData?.history?.length ? (
                            perfData.history.map((item, idx) => {
                              const formatDate = (timestamp) => {
                                if (!timestamp) return '—';
                                try {
                                  const date = new Date(timestamp * 1000);
                                  if (isNaN(date.getTime())) return '—';
                                  return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
                                } catch {
                                  return '—';
                                }
                              };

                              return (
                                <tr key={idx}>
                                  <td className="p-3 border-b border-blue-gray-50">
                                    <Typography variant="small" color="blue-gray" className="font-normal truncate">
                                      {item.name || '—'}
                                    </Typography>
                                  </td>
                                  <td className="p-3 border-b border-blue-gray-50">
                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                      {formatDate(item.startDate)}
                                    </Typography>
                                  </td>
                                  <td className="p-3 border-b border-blue-gray-50">
                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                      {formatDate(item.endDate)}
                                    </Typography>
                                  </td>
                                  <td className="p-3 border-b border-blue-gray-50">
                                    <div className="flex flex-col gap-1">
                                      <Typography variant="small" color="blue-gray" className="font-medium text-xs">
                                        {typeof item.goal_progress === 'number'
                                          ? (item.goal_progress % 1 === 0 ? item.goal_progress : item.goal_progress.toFixed(2))
                                          : 0}%
                                      </Typography>
                                      <Progress
                                        value={item.goal_progress || 0}
                                        className="w-full"
                                        color="blue"
                                      />
                                    </div>
                                  </td>
                                  <td className="p-3 border-b border-blue-gray-50">
                                    <div className="flex flex-col gap-1">
                                      <Typography variant="small" color="blue-gray" className="font-medium text-xs">
                                        {typeof item.competency_progress === 'number'
                                          ? (item.competency_progress % 1 === 0 ? item.competency_progress : item.competency_progress.toFixed(2))
                                          : 0}%
                                      </Typography>
                                      <Progress
                                        value={item.competency_progress || 0}
                                        className="w-full"
                                        color="blue"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-gray-400">
                                <div className="flex flex-col items-center justify-center">
                                  <img src={noRecordFound} alt="No record found" className='w-40 opacity-70 mix-blend-multiply mb-4' />
                                  <Typography color="gray" className="font-medium">No history records found</Typography>
                                </div>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Pagination - same style as employee list / PRC */}
          {(() => {
            const currentPagination = getCurrentTabPagination();
            const totalPages = currentPagination.total_pages || 1;
            const currentPage = currentPagination.current_page || 1;
            if (totalPages <= 1) return null;
            return (
              <div className="w-full flex justify-center items-center gap-2 mt-6 mb-2">
                <button
                  title="Previous Page"
                  disabled={currentPage <= 1 || loading}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                    currentPage > 1 && !loading
                      ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                      : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                  onClick={goToPreviousEmpPerfPage}
                >
                  ‹
                </button>
                <div className="flex items-center gap-1.5">
                  {(() => {
                    const renderPageButton = (page) => (
                      <button
                        key={page}
                        onClick={() => goToEmpPerfPage(page)}
                        disabled={loading}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                          page === currentPage
                            ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                        } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {page}
                      </button>
                    );
                    if (totalPages <= 7) {
                      return Array.from({ length: totalPages }, (_, i) => i + 1).map(renderPageButton);
                    }
                    const pages = [];
                    pages.push(renderPageButton(1));
                    if (currentPage > 3) {
                      pages.push(<span key="start-ellipsis" className="text-gray-400 px-1">...</span>);
                    }
                    const startPage = Math.max(2, currentPage - 1);
                    const endPage = Math.min(totalPages - 1, currentPage + 1);
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(renderPageButton(i));
                    }
                    if (currentPage < totalPages - 2) {
                      pages.push(<span key="end-ellipsis" className="text-gray-400 px-1">...</span>);
                    }
                    pages.push(renderPageButton(totalPages));
                    return pages;
                  })()}
                </div>
                <button
                  title="Next Page"
                  disabled={currentPage >= totalPages || loading}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                    currentPage < totalPages && !loading
                      ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                      : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                  onClick={goToNextEmpPerfPage}
                >
                  ›
                </button>
              </div>
            );
          })()}
        </CardBody>
      </Card>

      {/* Add/Edit Goal Drawer */}
      <CustomDrawer
        open={addGoalDrawerOpen}
        closeDrawer={handleDrawerClose}
        title={isEditMode ? "Edit Goal" : "Add Goal"}
        direction="right"
        widthSize={620}
        compo={
          <AddGoalForm
            onSubmit={handleGoalSubmit}
            onCancel={handleDrawerClose}
            reviewCycles={cycles}
            selectedCycle={selectedCycle}
            editData={editItem}
            isEdit={isEditMode}
          />
        }
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        openDialog={showDeleteConfirm}
        handleOpen={setShowDeleteConfirm}
        title="Delete Goal"
        message="Are you sure you want to delete the goal ?"
        handleConfirm={handleConfirmDelete}
        loading={deleteLoading}
        size="sm"
      />

      {showDescriptionModal && (
        <GoalDescriptionModal
          open={showDescriptionModal}
          onClose={handleCloseDescriptionModal}
          goal={selectedGoalForDescription}
        />
      )}
    </div>
  )
}

export default EmpPerformance
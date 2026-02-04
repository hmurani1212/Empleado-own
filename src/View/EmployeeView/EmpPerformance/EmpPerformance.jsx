import { Typography, Card, CardBody, Avatar, Progress } from '@material-tailwind/react'
import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { gettingEmployeePerformance, deleteEmployeeGoal, toggleEmployeeGoalStatus } from "../../../ViewModel/EmpViewModel/EmpPerformanceViewModel/EmpPerformance"
import CustomSelect from "../../../Components/CustomSelect/CustomSelect"
import CustomDrawer from "../../../Components/CustomDrawer/CustomDrawer"
import AddGoalForm from "./AddGoalForm"
import ConfirmationDialog from "../../../Components/ConfirmationDialog/ConfirmationDialog"

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
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
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

  const get_Performence_data = async (params = {}, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      console.log('Fetching performance data with params:', params);
      
      const res = await gettingEmployeePerformance(params);
      console.log('Full API Response:', res);
      
      if (res && res.STATUS === "SUCCESSFUL") {
        if (isLoadMore) {
          // Append new data to existing data
          setPerfData(prevData => ({
            ...prevData,
            Goal: [...(prevData?.Goal || []), ...(res.DB_DATA?.Goal || [])],
            competency: [...(prevData?.competency || []), ...(res.DB_DATA?.competency || [])],
            Feedback: [...(prevData?.Feedback || []), ...(res.DB_DATA?.Feedback || [])],
            history: [...(prevData?.history || []), ...(res.DB_DATA?.history || [])],
            Performence: res.DB_DATA?.Performence || prevData?.Performence,
            emp_data: res.DB_DATA?.emp_data || prevData?.emp_data
          }));
        } else {
          // Replace all data
        setPerfData(res.DB_DATA || null);
        }
        
        setPagination(res.pagination || pagination);
        
        console.log('Performance Data:', res.DB_DATA);
        console.log('Goals:', res.DB_DATA?.Goal);
        console.log('Competency:', res.DB_DATA?.competency);
        console.log('Performance Cycles:', res.DB_DATA?.Performence);
        
        // Set cycles for dropdown only on initial load
        if (!isLoadMore) {
        const cycles = (res.DB_DATA?.Performence || [])
          .filter(c => c?.name)
          .map((c) => ({ label: c.name, value: c._id || c.name }));
          
          // Keep "All Review Cycles" as default, don't auto-select a specific cycle
          ///console.log('Available cycles:', cycles);
        }
      }
    } catch (err) {
      console.error('Error fetching performance data:', err);
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
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
    const dates = goalsForCycle
      .map((g) => ({
        start: g?.start_period || (g?.startDate ? new Date(g.startDate * 1000).toISOString() : null),
        end: g?.end_period || (g?.endDate ? new Date(g.endDate * 1000).toISOString() : null),
      }))
      .filter((d) => d.start || d.end);
    if (!dates.length) return { startText: "N/A", endText: "N/A" };
    const starts = dates.map((d) => d.start).filter(Boolean).map((s) => new Date(s).getTime());
    const ends = dates.map((d) => d.end).filter(Boolean).map((e) => new Date(e).getTime());
    const minStart = starts.length ? new Date(Math.min(...starts)) : null;
    const maxEnd = ends.length ? new Date(Math.max(...ends)) : null;
    return { startText: minStart ? minStart.toLocaleDateString() : "N/A", endText: maxEnd ? maxEnd.toLocaleDateString() : "N/A" };
  }, [goalsForCycle]);

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

  // Load more data for current active tab
  const loadMore = () => {
    const currentPage = pagination[activeTab]?.current_page || 1;
    const nextPage = currentPage + 1;
    
    if (nextPage <= pagination[activeTab]?.total_pages) {
      const params = {
        [`${activeTab}_page`]: nextPage
      };
      
      // Include performance_id if a specific cycle is selected
      if (selectedCycle?.value) {
        params.performance_id = selectedCycle.value;
      }
      
      get_Performence_data(params, true);
    }
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
          <div className="flex items-center gap-4 mb-6">
            <Avatar
              src={avatarSrc}
              alt="Employee Photo"
              size="lg"
              className="border border-gray-300"
            />
            <div>
              <Typography variant="h4" color="[#292929]" className="font-medium text-[18px]">
                {employeeName || "—"}
              </Typography>
              <Typography variant="h6" color="[#292929]" className="font-normal opacity-70 text-[14px]">
                {[designation, department].filter(Boolean).join(" (") + (designation && department ? ")" : "") || "—"}
              </Typography>
            </div>
          </div>

          {/* Review Cycle Section */}
          <div className="flex items-center gap-4 mb-6">
            <Typography variant="h6" color="[#292929]" className="font-medium text-[16px]">
              Review Cycle
            </Typography>
            <div className="flex items-center gap-2">
              <div className="w-52">
                <CustomSelect
                  placeHolderTitle="All Review Cycles"
                  value={selectedCycle}
                  options={[{ label: "All Review Cycles", value: "" }, ...cycles]}
                  onChangeHandler={handleCycleChange}
                  isSearchable={false}
                />
              </div>
              <div className="flex items-center gap-2">
                <Typography variant="small" color="blue-gray">
                  {selectedCycle?.label || "All Review Cycles"}
                </Typography>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="mb-6">
            <Typography variant="small" color="blue-gray" className="opacity-70">
              Start Date: {startText} → Deadline: {endText}
            </Typography>
          </div>

          {/* Performance Stats (placeholders for now) */}
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <Typography variant="small" color="blue-gray" className="font-semibold">0</Typography>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <Typography variant="small" color="blue-gray" className="font-semibold">0</Typography>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <Typography variant="small" color="blue-gray" className="font-semibold">0</Typography>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
              <Typography variant="small" color="blue-gray" className="font-semibold">0</Typography>
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
      <Card className="w-full">
        <CardBody className="p-6">
          <div className="w-full">
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
              <div className="p-0 mt-6">
                {/* Goals Table */}
                <div className="w-full overflow-visible">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <Typography variant="small" color="blue-gray" className="opacity-70">
                        Loading goals...
                      </Typography>
                    </div>
                  ) : (
                    <>
                      <div className="w-full overflow-x-auto">
                      <table className="min-w-full text-center table-fixed">
                    <thead>
                      <tr>
                            <th className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 pr-4 w-1/4">
                          <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Goal</Typography>
                        </th>
                            <th className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 px-4 w-1/6">
                          <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Progress</Typography>
                        </th>
                            <th className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 px-4 w-1/4">
                          <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Comment</Typography>
                        </th>
                            <th className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 px-4 w-1/8">
                          <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Status</Typography>
                        </th>
                            <th className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 px-4 w-1/8">
                              <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">Rating</Typography>
                            </th>
                            <th className="border-b border-blue-gray-50 bg-blue-gray-50 py-4 pl-4 w-1/8">
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
                            switch(status) {
                              case '0': return 'Pending';
                              case '1': return 'In Progress';
                              case '2': return 'Completed';
                              default: return status || '—';
                            }
                          };

                          const getStatusColor = (status) => {
                            switch(status) {
                              case '0': return 'text-yellow-600';
                              case '1': return 'text-blue-600';
                              case '2': return 'text-green-600';
                              default: return 'text-gray-600';
                            }
                          };

                          const rowsRemaining = goalsForCycle.length - idx - 1;
                          const shouldOpenUp = rowsRemaining < 2;

                          return (
                            <tr key={g._id || idx}>
                               <td className="py-4 pr-4 border-b border-blue-gray-50 text-center">
                                     <Typography variant="small" color="blue-gray" className="font-medium">
                                   {g.name || g.title || '—'}
                                 </Typography>
                               </td>
                               <td className="py-4 px-4 border-b border-blue-gray-50 text-center">
                                     <div className="flex flex-col items-center gap-2">
                                       <Progress value={g.progress || 0} className="w-full max-w-20" />
                                   <Typography variant="small" color="blue-gray" className="opacity-70 text-xs">
                                     {g.progress || 0}%
                                   </Typography>
                                 </div>
                               </td>
                               <td className="py-4 px-4 border-b border-blue-gray-50 text-center">
                                     <Typography variant="small" color="blue-gray" className="font-normal">
                                   {g.comment || '—'}
                                 </Typography>
                               </td>
                               <td className="py-4 px-4 border-b border-blue-gray-50 text-center">
                                 <Typography variant="small" className={`font-normal ${getStatusColor(g.status)}`}>
                                   {getStatusText(g.status)}
                                 </Typography>
                               </td>
                               <td className="py-4 px-4 border-b border-blue-gray-50 text-center">
                                     <div className="flex items-center justify-center gap-1">
                                       {Array.from({ length: 5 }).map((_, starIdx) => (
                                         <span 
                                           key={starIdx} 
                                           className={`text-lg ${
                                             starIdx < (Number(g.rating) || 0) ? 'text-yellow-400' : 'text-gray-300'
                                           }`}
                                         >
                                           ★
                                         </span>
                                       ))}
                                     </div>
                               </td>
                               <td className="py-4 pl-4 border-b border-blue-gray-50 text-center relative">
                                    <div className="relative action-dropdown flex justify-center">
                                      <button
                                        onClick={() => handleDropdownToggle(g._id)}
                                        className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                                      >
                                        Action
                                        <ChevronDownIcon className="w-3 h-3" />
                                      </button>
                                      
                                      {openDropdown === g._id && (
                                        <div className={`absolute ${shouldOpenUp ? 'bottom-full mb-1' : 'top-full mt-1'} right-0 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-[9999]`}>
                                          <button
                                            onClick={() => handleEditGoal(g)}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => handleDeleteGoal(g)}
                                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 text-red-600"
                                          >
                                            Delete
                                          </button>
                                          <button
                                            onClick={() => handleStartedGoal(g)}
                                            disabled={g.status === '2' || actionGoalLoadingId === g._id}
                                            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${g.status === '2' ? 'text-gray-400 cursor-not-allowed' : ''}`}
                                          >
                                            {actionGoalLoadingId === g._id ? 'Updating...' : getStatusActionLabel(g.status)}
                                          </button>
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
                          <td colSpan={6} className="p-8 text-center text-gray-500">
                            No goals found
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
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Typography variant="small" color="blue-gray" className="opacity-70">
                      Loading competencies...
                    </Typography>
                  </div>
                ) : (
                  <>
                {perfData?.competency?.length ? (
                  <div className="flex flex-col gap-3">
                    {perfData.competency.map((c, i) => (
                      <div key={c._id || i} className="flex items-center justify-between border-b pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-500">🔎</span>
                          <Typography variant="small" color="#292929" className="font-medium">{c.competency || '—'}</Typography>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500">
                          {/* simple star visualization based on rating (0-5 expected), fallback 0 */}
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <span key={idx}>{idx < (Number(c.rating) || 0) ? '★' : '☆'}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Typography color="blue-gray" className="text-center py-8">No competency items</Typography>
                    )}
                    
                  </>
                )}
              </div>
            )}
            
            {activeTab === "feedback" && (
              <div className="p-0 mt-6">
                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <Typography variant="small" color="blue-gray" className="opacity-70">
                      Loading feedback...
                              </Typography>
                            </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {/* Feedback Items */}
                      {perfData?.Feedback?.length ? (
                        <div className="space-y-3">
                          {perfData.Feedback.map((feedback, index) => {
                            const formatDate = (timestamp) => {
                              if (!timestamp) return '—';
                              try {
                                const date = new Date(timestamp * 1000);
                                return date.toLocaleDateString();
                              } catch {
                                return '—';
                              }
                            };

                            return (
                              <div key={feedback._id || index} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Typography variant="small" color="blue-gray" className="font-medium">
                                        {feedback.employee_name || 'Unknown'} to Me
                              </Typography>
                              <Typography variant="small" color="blue-gray" className="opacity-60 text-xs">
                                        {formatDate(feedback.entry_time)}
                              </Typography>
                            </div>
                            <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${feedback.thumb === '1' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <Typography variant="small" color="blue-gray" className="text-sm">
                                        {feedback.comment || '—'}
                              </Typography>
                            </div>
                          </div>
                        </div>
                      </div>
                            );
                          })}
                      </div>
                      ) : (
                        <Typography color="blue-gray" className="text-center py-8">No feedback found</Typography>
                    )}
                  </div>

                  </>
                )}
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
                  <table className="minw-full text-left table-fixed">
                    <thead>
                      <tr>
                        <th className="border-b border-blue-gray-50 bg-blue-gray-50 p-3 w-1/4">
                          <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                            Name of Review Cycle
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-50 bg-blue-gray-50 p-3 w-1/6">
                          <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                            Start Date
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-50 bg-blue-gray-50 p-3 w-1/6">
                          <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                            End Date
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-50 bg-blue-gray-50 p-3 w-1/4">
                          <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                            Goal Progress
                          </Typography>
                        </th>
                        <th className="border-b border-blue-gray-50 bg-blue-gray-50 p-3 w-1/4">
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
                                  {formatDate(item.endDate)}
                                </Typography>
                              </td>
                              <td className="p-3 border-b border-blue-gray-50">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                  {formatDate(item.closing_date)}
                                </Typography>
                              </td>
                              <td className="p-3 border-b border-blue-gray-50">
                                <div className="flex items-center gap-2">
                                  <Progress 
                                    value={item.goal_progress || 0} 
                                    className="w-full"
                                    color="blue"
                                  />
                                  <Typography variant="small" color="blue-gray" className="opacity-70 text-xs min-w-fit">
                                    {item.goal_progress || 0}%
                                  </Typography>
                                </div>
                              </td>
                              <td className="p-3 border-b border-blue-gray-50">
                                <div className="flex items-center gap-2">
                                  <Progress 
                                    value={item.competency_progress || 0} 
                                    className="w-full"
                                    color="green"
                                  />
                                  <Typography variant="small" color="blue-gray" className="opacity-70 text-xs min-w-fit">
                                    {item.competency_progress || 0}%
                                  </Typography>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-500">
                            No history records found
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
          
          {/* Load More Button - Centered at bottom */}
          {pagination[activeTab] && pagination[activeTab].has_next_page && (
            <div className="flex justify-center mt-6 pb-4">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Goal Drawer */}
      <CustomDrawer
        open={addGoalDrawerOpen}
        closeDrawer={handleDrawerClose}
        title={isEditMode ? "Edit Goal" : "Add Goal"}
        direction="right"
        widthSize={600}
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
        message={`Are you sure you want to delete the goal "${deleteItem?.title || ''}"? This action cannot be undone.`}
        handleConfirm={handleConfirmDelete}
        loading={deleteLoading}
        size="sm"
      />
    </div>
  )
}

export default EmpPerformance
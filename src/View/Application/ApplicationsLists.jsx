import React, { useEffect, useState } from 'react'
import { Typography, Button } from '@material-tailwind/react'
import ApplicationDetails from './ApplicationDetails';
import useApplication from '../../ViewModel/ApplicationViewModel/ApplicationServices'
import { formatTimestamp } from '../Branches/utils'
import { customStatus } from '../../services/__applicationServices'
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices';
import useInboxServives from '../../ViewModel/InboxViewModel/inboxServices';
import { FaRegEye } from "react-icons/fa";
import { useLocation } from 'react-router-dom';
import CustomSelect from '../../Components/CustomSelect/CustomSelect';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineDocumentText } from "react-icons/hi";

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-100">
    <td className="p-4"><div className="h-4 w-16 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-6 w-20 bg-gray-200 rounded-full mx-auto"></div></td>
    <td className="p-4"><div className="h-8 w-8 bg-gray-200 rounded-full mx-auto"></div></td>
  </tr>
);

function ApplicationsLists() {
  const location = useLocation();
  const [showComponent, setShowComponent] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const handleButtonClick = (applicationId) => {
    if (!applicationId) return;
    setSelectedApplicationId(applicationId);
    setShowComponent(true);
  };

  const handleCloseDetails = () => {
    setShowComponent(false);
    setSelectedApplicationId(null);
  };

  // Function to get current filters
  const getCurrentFilters = () => {
    const filters = { page: 1 };
    if (selectedBranch?.value && selectedBranch.value !== '0' && selectedBranch.value !== 0) {
      filters.branch = selectedBranch.value;
    }
    if (selectedDepartment?.value && selectedDepartment.value !== '0' && selectedDepartment.value !== 0) {
      filters.deptt = selectedDepartment.value;
    }
    if (selectedStatus?.value && selectedStatus.value !== '0' && selectedStatus.value !== 0) {
      filters.status = selectedStatus.value;
    }
    if (selectedEmployee?.value) {
      filters.user_id = selectedEmployee.value;
    }
    return filters;
  };

  // Function to get pagination data
  const getPaginationData = () => {
    const pagination = applicationsList?.pagination || {};
    return {
      currentPage: pagination.current_page || 1,
      totalPages: pagination.total_pages || Math.ceil((pagination.total_records || 0) / (pagination.per_page || 10)),
      hasMore: pagination.has_next || false
    };
  };

  // Pagination Handlers
  const handlePageChange = async (newPage) => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const filters = getCurrentFilters();
      filters.page = newPage;
      await gettingFilteredApplicationsList(filters);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // State for cascading dropdowns
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const data = ['Emp ID', 'Name', 'Subject', 'Apply For', 'Submission Date', 'Status', 'Action']

  const { applicationsList, gettingApplicationsList, gettingFilteredApplicationsList } = useApplication()
  const { empBranches, fetchingAllBranches, gettingSubBranches, dept_subDept, Get_All_Employeefn, Get_All_Employee, orgLogo, getOrgLogo } = useEmployees()
  const { application_data, isLoadingApplicationDetails, getFormDetailsByTypeRef } = useInboxServives()

  useEffect(() => {
    getOrgLogo();
  }, [getOrgLogo]);

  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      await Promise.all([
        gettingApplicationsList(),
        fetchingAllBranches(),
        Get_All_Employeefn()
      ]);
      setInitialLoading(false);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle employee filter from location state
  useEffect(() => {
    const filterEmployeeId = location.state?.filterEmployeeId;
    const filterEmployeeName = location.state?.filterEmployeeName;

    if (filterEmployeeId && !selectedEmployee) {
        const empOption = {
             value: filterEmployeeId,
             label: filterEmployeeName ? `${filterEmployeeName} (ID: ${filterEmployeeId})` : `ID: ${filterEmployeeId}`
        };
        setSelectedEmployee(empOption);
        
        const filters = { page: 1, user_id: filterEmployeeId };
        gettingFilteredApplicationsList(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    if (selectedApplicationId && showComponent) {
      getFormDetailsByTypeRef(selectedApplicationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApplicationId, showComponent]);

  const handleBranchChange = async (selectedOption) => {
    setSelectedBranch(selectedOption);
    setSelectedStatus(null);
    setSelectedEmployee(null);
    // setEmployeeSearchInput('');

    const filters = { page: 1 };
    
    if (selectedOption?.value) {
       const branchVal = selectedOption.value === '0' || selectedOption.value === 0 ? 0 : selectedOption.value;
       filters.branch = branchVal;
       
       if (branchVal !== 0) {
         await gettingSubBranches(branchVal);
         setSelectedDepartment(null);
       } else {
         await gettingSubBranches(0);
         setSelectedDepartment({ value: 0, label: 'All Departments' });
         filters.deptt = 0;
       }
       
       if (selectedStatus?.value) filters.status = selectedStatus.value;
       gettingFilteredApplicationsList(filters);
    } else {
       gettingApplicationsList();
    }
  };

  const handleDepartmentChange = (selectedOption) => {
    setSelectedDepartment(selectedOption);
    setSelectedEmployee(null);

    const filters = { page: 1 };
    if (selectedBranch?.value) filters.branch = selectedBranch.value;
    if (selectedOption?.value) filters.deptt = selectedOption.value;
    if (selectedStatus?.value) filters.status = selectedStatus.value;

    gettingFilteredApplicationsList(filters);
  };

  const handleStatusChange = (selectedOption) => {
    setSelectedStatus(selectedOption);
    setSelectedEmployee(null);

    const filters = { page: 1 };
    if (selectedBranch?.value) filters.branch = selectedBranch.value;
    if (selectedDepartment?.value) filters.deptt = selectedDepartment.value;
    if (selectedOption?.value) filters.status = selectedOption.value;

    gettingFilteredApplicationsList(filters);
  };

  const handleEmployeeChange = async (selectedOption) => {
    setSelectedEmployee(selectedOption);

    if (!selectedOption && !selectedBranch && !selectedDepartment && !selectedStatus) {
      await gettingApplicationsList();
      return;
    }

    const filters = { page: 1 };
    if (selectedBranch?.value) filters.branch = selectedBranch.value;
    if (selectedDepartment?.value) filters.deptt = selectedDepartment.value;
    if (selectedStatus?.value) filters.status = selectedStatus.value;
    if (selectedOption?.value) filters.user_id = selectedOption.value;

    await gettingFilteredApplicationsList(filters);
  };

  // Filter employee options
  const employeeOptions = Array.isArray(Get_All_Employee)
    ? Get_All_Employee.filter(emp => {
        if (selectedBranch?.value && selectedBranch.value !== 0 && selectedBranch.value !== '0') {
           const bVal = Number(selectedBranch.value);
           const empBVal = Number(emp.branch_id || emp.branch?.id || emp.branch);
           if (empBVal !== bVal) return false;
        }
        if (selectedDepartment?.value && selectedDepartment.value !== 0 && selectedDepartment.value !== '0') {
           const dVal = Number(selectedDepartment.value);
           const empDVal = Number(emp.department_id || emp.dept_id || emp.department?.id || emp.department);
           if (empDVal !== dVal) return false;
        }
        return true;
      }).map(emp => ({
        value: emp.id || emp.emp_id || emp.employee_id,
        label: `${emp.name} (ID: ${emp.id || emp.emp_id || emp.employee_id})`
      }))
    : [];

  const handlePrintAll = () => {
     alert("Print functionality to be implemented/migrated if needed.");
  };

  const getStatusStyle = (status) => {
    const statusStr = String(status).toLowerCase();
    if (status === 1 || statusStr === "approved" || statusStr === "1") return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    if (status === 2 || statusStr === "rejected" || statusStr === "2") return "bg-red-50 text-red-600 border border-red-100";
    if (status === 0 || status === 3 || statusStr === "pending" || statusStr === "0" || statusStr === "3") return "bg-amber-50 text-amber-600 border border-amber-100";
    return "bg-gray-50 text-gray-600 border border-gray-100";
  };

  const getStatusText = (status) => {
    if (status === 1 || String(status) === '1') return "Approved";
    if (status === 2 || String(status) === '2') return "Rejected";
    if (status === 0 || status === 3 || String(status) === '0' || String(status) === '3') return "Pending";
    return "N/A";
  };

  return (
    <>
      <AnimatePresence mode="wait">
      {!showComponent ? (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6 w-full h-full relative"
        >
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row items-center gap-4 flex-wrap">
              <div className="w-full md:w-56">
                <CustomSelect
                  placeHolderTitle="Filter by Branch"
                  value={selectedBranch}
                  options={[
                    { value: 0, label: 'All Branches' },
                    ...(empBranches?.map((branch) => ({ value: branch.id, label: branch.branch_name })) || [])
                  ]}
                  onChangeHandler={handleBranchChange}
                  customStyles={false}
                />
              </div>
              <div className="w-full md:w-56">
                <CustomSelect
                  placeHolderTitle="Filter by Department"
                  value={selectedDepartment}
                  options={[
                    { value: 0, label: 'All Departments' },
                    ...(dept_subDept?.departments?.map((dept) => ({ value: dept.id, label: dept.name })) || [])
                  ]}
                  onChangeHandler={handleDepartmentChange}
                  customStyles={false}
                />
              </div>
              <div className="w-full md:w-40">
                <CustomSelect
                  placeHolderTitle="Filter by Status"
                  value={selectedStatus}
                  options={[
                    { value: 0, label: 'All' },
                    { value: '1', label: 'Approved' },
                    { value: '2', label: 'Rejected' },
                    { value: '3', label: 'Pending' }
                  ]}
                  onChangeHandler={handleStatusChange}
                  customStyles={false}
                />
              </div>
              <div className="w-full md:w-64">
                <CustomSelect
                  placeHolderTitle="Search Employee"
                  value={selectedEmployee}
                  options={employeeOptions}
                  onChangeHandler={handleEmployeeChange}
                  isSearchable={true}
                  isClearable={true}
                  customStyles={false}
                />
              </div>
               {/* Print button removed or can be added back if essential */}
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="relative w-full min-h-[calc(100vh-250px)] overflow-auto customScroll">
              <table className="min-w-full table-auto text-center">
                <thead className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
                  <tr>
                    {data?.map((head, i) => (
                      <th key={i} className={`p-4 first:pl-6 last:pr-6 whitespace-nowrap ${head === 'Subject' ? 'text-left' : 'text-center'}`}>
                        <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {initialLoading ? (
                    Array.from({ length: 8 }).map((_, index) => <SkeletonRow key={index} />)
                  ) : applicationsList?.data && applicationsList.data.length > 0 ? (
                    applicationsList.data.map((ele, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        <td className="p-4">
                          <span className="text-xs font-medium text-gray-500 font-poppins bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                             #{ele?.emp_id}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col items-center">
                             <Typography className="text-sm font-medium text-gray-900 font-poppins">
                                {ele?.emp_name}
                             </Typography>
                          </div>
                        </td>
                        <td className="p-4 text-left">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-blue-100 transition-colors">
                                  <HiOutlineDocumentText size={16} />
                                </div>
                                <Typography className="text-sm font-semibold text-gray-900 font-poppins line-clamp-1" title={ele?.subject}>
                                    {ele?.subject}
                                </Typography>
                            </div>
                        </td>
                        <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600 border border-purple-100">
                                {ele?.form_name}
                            </span>
                        </td>
                        <td className="p-4">
                          <Typography className="text-xs text-gray-500 font-poppins">
                            {formatTimestamp(ele.entry_time).slice(0, 12)}
                          </Typography>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(ele?.status)}`}>
                            {getStatusText(ele?.status)}
                          </span>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="text"
                            onClick={() => handleButtonClick(ele?.id)}
                            className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                          >
                            <FaRegEye size={18} />
                          </Button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={data.length} className="p-12 text-center text-gray-400">
                         <div className="flex flex-col items-center justify-center">
                            <Typography color="gray" className="font-medium font-poppins">No Applications Found</Typography>
                         </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Pagination */}
              {applicationsList?.data && applicationsList.data.length > 0 && (() => {
                  const paginationData = getPaginationData();
                  if (paginationData.totalPages <= 1) return null;
                  
                  return (
                    <div className="w-full flex justify-center items-center gap-2 mt-6 mb-2">
                        <button
                            onClick={() => handlePageChange(paginationData.currentPage - 1)}
                            disabled={paginationData.currentPage === 1 || isLoadingMore}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            ‹
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {(() => {
                                const { currentPage, totalPages } = paginationData;
                                let pages = [];
                                if (totalPages <= 7) {
                                    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                                } else {
                                    if (currentPage <= 4) {
                                        pages = [1, 2, 3, 4, 5, '...', totalPages];
                                    } else if (currentPage >= totalPages - 3) {
                                        pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                                    } else {
                                        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
                                    }
                                }
                                
                                return pages.map((page, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                                        disabled={page === '...' || isLoadingMore}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                                            page === currentPage 
                                            ? 'bg-bgBlue text-white shadow-md shadow-blue-500/20' 
                                            : page === '...' 
                                                ? 'text-gray-400 cursor-default' 
                                                : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ));
                            })()}
                        </div>

                        <button
                            onClick={() => handlePageChange(paginationData.currentPage + 1)}
                            disabled={paginationData.currentPage === paginationData.totalPages || isLoadingMore}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            ›
                        </button>
                    </div>
                  );
              })()}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div 
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
        >
             <div className="mb-4">
                <Button variant="text" onClick={handleCloseDetails} className="flex items-center gap-2 text-gray-600 hover:bg-gray-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to List
                </Button>
            </div>
            <ApplicationDetails
                applicationData={application_data}
                isLoading={isLoadingApplicationDetails}
                applicationId={selectedApplicationId}
                onClose={handleCloseDetails}
            />
        </motion.div>
      )}
      </AnimatePresence>
    </>
  )
}

export default ApplicationsLists
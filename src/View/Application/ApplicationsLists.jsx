import React, { useEffect } from 'react'
import { useState } from 'react'
// import { Button } from '@material-tailwind/react'
// import { BiSearch } from 'react-icons/bi'
import { Typography } from '@material-tailwind/react'
// import { GrFormView } from "react-icons/gr";
import ApplicationDetails from './ApplicationDetails';
import useApplication from '../../ViewModel/ApplicationViewModel/ApplicationServices'
import { formatTimestamp } from '../Branches/utils'
import { customStatus } from '../../services/__applicationServices'
// import { FaRegCircleXmark, FaRegCircleCheck } from "react-icons/fa6";
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices';
import SearchReactSelect from '../../Components/CustomSelect/SearchReactSelect';
import useInboxServives from '../../ViewModel/InboxViewModel/inboxServices';
import { FaRegEye } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import CustomButton from '../../Components/CustomButton/CustomButton';
import { useLocation } from 'react-router-dom';


function ApplicationsLists() {
  const location = useLocation();
  const [showComponent, setShowComponent] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const handleButtonClick = (applicationId) => {
    if (!applicationId) {
      return;
    }

    setSelectedApplicationId(applicationId);
    setShowComponent(true);
  };

  const handleCloseDetails = () => {
    setShowComponent(false);
    setSelectedApplicationId(null);
    // Reset application data when closing
    if (getFormDetailsByTypeRef) {
      // Clear the application data by setting it to null
      // This will be handled by the inboxServices hook
    }
  };

  // Function to get current filters
  const getCurrentFilters = () => {
    const filters = { page: 1 };

    if (selectedBranch?.value !== undefined && selectedBranch.value !== null) {
      filters.branch = selectedBranch.value === 0 || selectedBranch.value === '0' ? 0 : selectedBranch.value;
    }
    if (selectedDepartment?.value !== undefined && selectedDepartment.value !== null) {
      filters.deptt = selectedDepartment.value === 0 || selectedDepartment.value === '0' ? 0 : selectedDepartment.value;
    }
    if (selectedStatus?.value !== undefined && selectedStatus.value !== null && selectedStatus.value !== 0 && selectedStatus.value !== '0') {
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

  // Function to go to next page
  const goToNextPage = async () => {
    if (isLoadingMore) return;

    const paginationData = getPaginationData();
    if (paginationData.currentPage < paginationData.totalPages) {
      setIsLoadingMore(true);
      try {
        const filters = getCurrentFilters();
        filters.page = paginationData.currentPage + 1;
        await gettingFilteredApplicationsList(filters);
      } catch (error) {
        // Handle error silently
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  // Function to go to previous page
  const goToPreviousPage = async () => {
    if (isLoadingMore) return;

    const paginationData = getPaginationData();
    if (paginationData.currentPage > 1) {
      setIsLoadingMore(true);
      try {
        const filters = getCurrentFilters();
        filters.page = paginationData.currentPage - 1;
        await gettingFilteredApplicationsList(filters);
      } catch (error) {
        // Handle error silently
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  // Function to go to a specific page
  const goToPage = async (pageNumber) => {
    if (isLoadingMore) return;

    const targetPage = parseInt(pageNumber);
    const paginationData = getPaginationData();
    if (targetPage >= 1 && targetPage <= paginationData.totalPages) {
      setIsLoadingMore(true);
      try {
        const filters = getCurrentFilters();
        filters.page = targetPage;
        await gettingFilteredApplicationsList(filters);
      } catch (error) {
        // Handle error silently
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  // Deprecated - kept for backward compatibility
  const handleLoadMore = async () => {
    await goToNextPage();
  };

  // State for cascading dropdowns
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const data = ['Emp ID', 'Name', 'Subject', 'Apply For', 'Submission Date', 'Status', 'Action']

  const { applicationsList, gettingApplicationsList, gettingFilteredApplicationsList } = useApplication()

  const { empBranches, fetchingAllBranches, gettingSubBranches, dept_subDept, Get_All_Employeefn, Get_All_Employee, orgLogo, getOrgLogo } = useEmployees()

  const { application_data, isLoadingApplicationDetails, getFormDetailsByTypeRef, applicationDetailsCache } = useInboxServives()


  useEffect(() => {
    getOrgLogo();
  }, [getOrgLogo]);

  useEffect(() => {
    // Call API to load applications list
    gettingApplicationsList()
    // Fetch branch data using the get_branches API
    fetchingAllBranches()
    // Fetch all employees
    Get_All_Employeefn()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //  console.log("fetchingAllBranches",empBranches)

  // Handle employee filter from location state (when navigating from employee actions)
  useEffect(() => {
    const filterEmployeeId = location.state?.filterEmployeeId;
    const filterEmployeeName = location.state?.filterEmployeeName;

    // Only apply filter if we have an employee ID and haven't already set it
    if (filterEmployeeId && !selectedEmployee) {
      if (Get_All_Employee && Array.isArray(Get_All_Employee) && Get_All_Employee.length > 0) {
        // Find the employee in the list
        const employee = Get_All_Employee.find(
          (emp) => emp.id === filterEmployeeId || emp.emp_id === filterEmployeeId || emp.employee_id === filterEmployeeId
        );

        if (employee) {
          const employeeOption = {
            value: employee.id || employee.emp_id || employee.employee_id,
            label: `${employee.name} (ID: ${employee.id || employee.emp_id || employee.employee_id})`
          };

          // Set the selected employee
          setSelectedEmployee(employeeOption);

          // Apply the filter
          const filters = {
            page: 1,
            user_id: employeeOption.value
          };

          gettingFilteredApplicationsList(filters);
        } else if (filterEmployeeName) {
          // If employee not found in list, still apply filter with the ID
          const employeeOption = {
            value: filterEmployeeId,
            label: `${filterEmployeeName} (ID: ${filterEmployeeId})`
          };

          setSelectedEmployee(employeeOption);

          const filters = {
            page: 1,
            user_id: filterEmployeeId
          };

          gettingFilteredApplicationsList(filters);
        }
      } else if (filterEmployeeName) {
        // If employees list not loaded yet, still apply filter with the ID
        const employeeOption = {
          value: filterEmployeeId,
          label: `${filterEmployeeName} (ID: ${filterEmployeeId})`
        };

        setSelectedEmployee(employeeOption);

        const filters = {
          page: 1,
          user_id: filterEmployeeId
        };

        gettingFilteredApplicationsList(filters);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, Get_All_Employee]);

  // Call API when application is selected for viewing
  useEffect(() => {
    if (selectedApplicationId && showComponent) {
      getFormDetailsByTypeRef(selectedApplicationId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedApplicationId, showComponent]);

  // Handle branch selection - now uses onChange with selectedOption
  const handleBranchChange = async (selectedOption) => {
    setSelectedBranch(selectedOption);
    setSelectedStatus(null);
    setSelectedEmployee(null);
    setEmployeeSearchInput('');
    setIsEmployeeMenuOpen(false);

    // Build filters object
    const filters = {};

    if (selectedOption && selectedOption.value !== undefined && selectedOption.value !== null) {
      // If "All Branches" is selected (value is 0), send 0, otherwise send the branch value
      const branchValue = selectedOption.value === 0 || selectedOption.value === '0' ? 0 : selectedOption.value;
      filters.branch = branchValue;

      if (branchValue !== 0) {
        // When a specific branch is selected, fetch departments for that branch
        await gettingSubBranches(selectedOption.value);
        setSelectedDepartment(null); // Clear department selection
      } else {
        // When "All Branches" is selected (branch_id=0)
        // Fetch all departments by calling with branch_id=0
        await gettingSubBranches(0);
        // Auto-select "All Departments" (dep_id=0)
        setSelectedDepartment({ value: 0, label: 'All Departments' });
        // Automatically pass dep_id=0 when branch_id=0
        filters.deptt = 0;
      }

      // Reset pagination when branch changes
      filters.page = 1;

      // Keep status filter if it was already selected and not "All" (value is not 0)
      if (selectedStatus?.value !== undefined && selectedStatus.value !== null && selectedStatus.value !== 0 && selectedStatus.value !== '0') {
        filters.status = selectedStatus.value;
      }

      // Filter applications
      gettingFilteredApplicationsList(filters);
    } else {
      // If no branch selected, show all applications
      gettingApplicationsList();
    }
  };

  // Handle department selection
  const handleDepartmentChange = (selectedOption) => {
    setSelectedDepartment(selectedOption);
    setSelectedEmployee(null);
    setEmployeeSearchInput('');
    setIsEmployeeMenuOpen(false);

    // Build filters object with only actual values
    // Reset pagination when department changes
    const filters = {
      page: 1  // Reset to first page when department filter changes
    };

    if (selectedBranch?.value !== undefined && selectedBranch.value !== null) {
      // If "All Branches" is selected (value is 0), send 0, otherwise send the branch value
      filters.branch = selectedBranch.value === 0 || selectedBranch.value === '0' ? 0 : selectedBranch.value;
    }
    if (selectedOption?.value !== undefined && selectedOption.value !== null) {
      // If "All Departments" is selected (value is 0), send 0, otherwise send the department value
      filters.deptt = selectedOption.value === 0 || selectedOption.value === '0' ? 0 : selectedOption.value;
    }
    // Keep status filter if it was already selected and not "All" (value is not 0)
    if (selectedStatus?.value !== undefined && selectedStatus.value !== null && selectedStatus.value !== 0 && selectedStatus.value !== '0') {
      filters.status = selectedStatus.value;
    }

    gettingFilteredApplicationsList(filters);
  };

  // Handle status selection
  const handleStatusChange = (selectedOption) => {
    setSelectedStatus(selectedOption);
    setSelectedEmployee(null);

    // Build filters object with only actual values
    // Reset pagination when status changes
    const filters = {
      page: 1  // Reset to first page when status filter changes
    };

    if (selectedBranch?.value !== undefined && selectedBranch.value !== null) {
      // If "All Branches" is selected (value is 0), send 0, otherwise send the branch value
      filters.branch = selectedBranch.value === 0 || selectedBranch.value === '0' ? 0 : selectedBranch.value;
    }
    if (selectedDepartment?.value !== undefined && selectedDepartment.value !== null) {
      // If "All Departments" is selected (value is 0), send 0, otherwise send the department value
      filters.deptt = selectedDepartment.value === 0 || selectedDepartment.value === '0' ? 0 : selectedDepartment.value;
    }
    // Only add status filter if "All" is not selected (value is not 0)
    if (selectedOption?.value !== undefined && selectedOption.value !== null && selectedOption.value !== 0 && selectedOption.value !== '0') {
      filters.status = selectedOption.value;
    }

    gettingFilteredApplicationsList(filters);
  };

  // State for employee search
  const [employeeSearchInput, setEmployeeSearchInput] = useState('');
  const [isEmployeeMenuOpen, setIsEmployeeMenuOpen] = useState(false);

  // Handle employee selection
  const handleEmployeeChange = async (selectedOption) => {
    setSelectedEmployee(selectedOption || null);

    const hasBranchSelection = selectedBranch?.value !== undefined && selectedBranch?.value !== null;
    const hasDepartmentSelection = selectedDepartment?.value !== undefined && selectedDepartment?.value !== null;
    const hasStatusSelection = selectedStatus?.value !== undefined && selectedStatus.value !== null && selectedStatus.value !== 0 && selectedStatus.value !== '0';

    // Always reset search UI helpers when a selection (or clear) happens
    setEmployeeSearchInput('');
    setIsEmployeeMenuOpen(false);

    // If employee cleared and no other filters are applied, revert to full list
    if (!selectedOption && !hasBranchSelection && !hasDepartmentSelection && !hasStatusSelection) {
      await gettingApplicationsList();
      return;
    }

    // Build filters object with only actual values - reset pagination to first page
    const filters = {
      page: 1
    };

    if (hasBranchSelection) {
      filters.branch = selectedBranch.value === 0 || selectedBranch.value === '0' ? 0 : selectedBranch.value;
    }
    if (hasDepartmentSelection) {
      filters.deptt = selectedDepartment.value === 0 || selectedDepartment.value === '0' ? 0 : selectedDepartment.value;
    }
    if (hasStatusSelection) {
      filters.status = selectedStatus.value;
    }
    if (selectedOption?.value) {
      // Send employee ID as user_id (will be converted to emp_id in the API layer)
      filters.user_id = selectedOption.value;
    }

    await gettingFilteredApplicationsList(filters);
  };


  // Create employee options from employee store data, filtered by branch and department
  const employeeOptions = Array.isArray(Get_All_Employee)
    ? Get_All_Employee
      .filter(emp => {
        // Filter by branch if selected and not "All Branches" (value 0)
        if (selectedBranch?.value && selectedBranch.value !== 0 && selectedBranch.value !== '0') {
          const branchValue = Number(selectedBranch.value) || selectedBranch.value;
          const branchId = Number(selectedBranch.id) || selectedBranch.id;
          const empBranchId = Number(emp.branch_id) || emp.branch_id;
          const empBranchObjId = Number(emp.branch?.id) || emp.branch?.id;

          if (empBranchId !== branchValue &&
            empBranchId !== branchId &&
            empBranchObjId !== branchValue &&
            empBranchObjId !== branchId &&
            emp.branch !== branchValue &&
            emp.branch !== branchId) {
            return false;
          }
        }

        // Filter by department if selected and not "All Departments" (value 0)
        if (selectedDepartment?.value && selectedDepartment.value !== 0 && selectedDepartment.value !== '0') {
          const deptValue = Number(selectedDepartment.value) || selectedDepartment.value;
          const deptId = Number(selectedDepartment.id) || selectedDepartment.id;
          const empDeptId = Number(emp.department_id) || Number(emp.dept_id) || emp.department_id || emp.dept_id;
          const empDeptObjId = Number(emp.department?.id) || emp.department?.id;

          if (empDeptId !== deptValue &&
            empDeptId !== deptId &&
            empDeptObjId !== deptValue &&
            empDeptObjId !== deptId &&
            emp.department !== deptValue &&
            emp.department !== deptId) {
            return false;
          }
        }

        return true;
      })
      .map((emp) => ({
        value: emp.id || emp.emp_id || emp.employee_id,
        label: `${emp.name} (ID: ${emp.id || emp.emp_id || emp.employee_id})`
      }))
    : [];

  const DEFAULT_NOTE_CONTENT = `During in my absence I can be contacted (If very Urgent).

Telephone#: 03439902848`;

  // Generate print HTML for one application (same layout as ApplicationLeave: logo top right, centered title, sections)
  const generateApplicationPrintHTML = (data, logoUrl) => {
    const d = data?.DB_DATA || data?.data || data;
    const logoHtml = logoUrl
      ? `<div class="print-header-logo"><img class="print-logo" src="${logoUrl}" alt="" onerror="this.style.display=\'none\'" /></div>`
      : '';
    const noteText = d?.form_data?.note || DEFAULT_NOTE_CONTENT;
    const leaveGroup = d?.form_data?.leave_group || d?.leave_group || "N/A";
    const leaveType = d?.form_data?.leave_type || d?.leave_type || "N/A";

    return `
      <div class="print-page">
        <header class="print-header">
          ${logoHtml}
          <h1>Leave Application</h1>
          <p>Official leave request document</p>
        </header>

        <section class="print-section">
          <h2 class="print-section-title">Employee Information</h2>
          <div class="print-card">
            <div class="emp-grid">
              <div class="emp-item"><label>Employee Name</label><span>${d?.name || d?.emp_name || "N/A"}</span></div>
              <div class="emp-item"><label>Employee ID</label><span>${d?.form_data?.emp_id || d?.emp_id || "N/A"}</span></div>
              <div class="emp-item"><label>Employee Oneid</label><span>${d?.one_id || "N/A"}</span></div>
              <div class="emp-item"><label>Branch</label><span>${d?.employee_details?.branch_name?.branch_name || "N/A"}</span></div>
              <div class="emp-item"><label>Department</label><span>${d?.employee_details?.department?.name || "N/A"}</span></div>
              <div class="emp-item"><label>Designation</label><span>${d?.employee_details?.designation_name || "N/A"}</span></div>
            </div>
          </div>
        </section>

        <section class="print-section">
          <h2 class="print-section-title">Subject</h2>
          <div class="print-card"><div class="print-card-body">${(d?.form_data?.subject || d?.subject || "N/A").replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div></div>
        </section>

        <section class="print-section">
          <h2 class="print-section-title">Application Detail</h2>
          <div class="print-card"><div class="print-card-body">${(d?.Application_detail || d?.application_detail || d?.form_data?.application_detail || "N/A").replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div></div>
        </section>

        <section class="print-section">
          <h2 class="print-section-title">Leave Period</h2>
          <div class="date-grid">
            <div class="date-item"><label>Leave From</label><span class="date-value">${d?.form_data?.leave_app_start_date || "N/A"}</span></div>
            <div class="date-item"><label>Leave Upto</label><span class="date-value">${d?.form_data?.leave_app_end_date || "N/A"}</span></div>
          </div>
        </section>

        <section class="print-section">
          <h2 class="print-section-title">Leave Group &amp; Leave Type</h2>
          <div class="date-grid">
            <div class="date-item"><label>Leave Group</label><span class="date-value">${leaveGroup}</span></div>
            <div class="date-item"><label>Leave Type</label><span class="date-value">${leaveType}</span></div>
          </div>
        </section>

        <section class="print-section">
          <h2 class="print-section-title">Note</h2>
          <div class="note-card"><div class="print-card-body">${(noteText).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div></div>
        </section>

        <div class="signature-row">
          <div class="signature-block"><div class="signature-line"></div><span>Employee Signature</span></div>
          <div class="signature-block"><div class="signature-line"></div><span>Office Authority</span></div>
        </div>
      </div>
    `;
  };

  // Print All: use list data from store only (same technique as MakingPayments - no API call)
  const handlePrintAll = () => {
    const listData = applicationsList?.data || applicationsList;
    const listArray = Array.isArray(listData) ? listData : (listData?.data ? listData.data : []);
    if (!listArray.length) {
      alert('No applications to print');
      return;
    }

    try {
      const logoUrl = orgLogo?.logo || '';
      const printHTML = listArray.map(app => generateApplicationPrintHTML(app, logoUrl)).join('');

      const win = window.open('', '_blank');
      if (!win) {
        return;
      }

      win.document.documentElement.innerHTML = `
        <html>
          <head>
            <title>Leave Application</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

              @page { size: A4; margin: 12mm 15mm; }
              @media print {
                html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
                .print-page { page-break-after: always !important; page-break-inside: avoid !important; }
                .print-page:last-child { page-break-after: avoid !important; }
              }

              .print-page {
                max-width: 700px;
                margin: 0 auto;
                padding: 12px 24px 24px;
                background: #ffffff;
              }
              .print-header {
                position: relative;
                text-align: center;
                margin-bottom: 16px;
                padding-top: 4px;
                padding-bottom: 10px;
                border-bottom: 3px solid #3b82f6;
              }
              .print-header-logo { position: absolute; top: 0; right: 0; }
              .print-logo { display: block; max-height: 44px; max-width: 130px; object-fit: contain; }
              .print-logo[data-hidden="true"] { display: none !important; }
              .print-header h1 { font-size: 20px; font-weight: 700; color: #111827; letter-spacing: -0.02em; margin-bottom: 2px; }
              .print-header p { font-size: 11px; color: #6b7280; font-weight: 500; }
              .print-section { margin-bottom: 14px; page-break-inside: avoid; }
              .print-section-title {
                font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.04em;
                margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb;
              }
              .print-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 14px; }
              .print-card-body { font-size: 14px; line-height: 1.6; color: #1f2937; white-space: pre-wrap; word-wrap: break-word; }
              .emp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 32px; }
              .emp-item { display: flex; flex-direction: column; gap: 2px; }
              .emp-item label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.03em; }
              .emp-item span { font-size: 14px; font-weight: 500; color: #111827; }
              .date-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .date-item label { display: block; font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 6px; }
              .date-item .date-value { display: block; padding: 10px 14px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 14px; color: #1f2937; }
              .note-card { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px 20px; }
              .note-card .print-card-body { font-size: 13px; color: #92400e; line-height: 1.65; }
              .signature-row { margin-top: 20px; padding-top: 14px; border-top: 1px dashed #d1d5db; display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; }
              .signature-block { flex: 1; max-width: 200px; }
              .signature-line { height: 1px; border-bottom: 2px solid #9ca3af; margin-bottom: 8px; min-height: 36px; }
              .signature-block span { font-size: 10px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.06em; }
              .signature-block:last-child { text-align: right; }
              .signature-block:last-child .signature-line { margin-left: auto; }
            </style>
            <script>
              window.onbeforeprint = function() {};
              document.addEventListener('DOMContentLoaded', function() {
                var imgs = document.querySelectorAll('.print-logo');
                imgs.forEach(function(img) { img.onerror = function() { this.style.display = 'none'; }; });
              });
            </script>
          </head>
          <body>
            ${printHTML}
          </body>
        </html>
      `;

      win.document.title = ' ';
      win.focus();
      setTimeout(() => { win.print(); }, 300);
    } catch (error) {
      console.error('Error printing applications:', error);
      alert('Error printing applications');
    }
  };

  return (
    <>
      <style>
        {`
          /* Force branch dropdown width and height - AGGRESSIVE OVERRIDE */
          .react-select__menu {
            min-width: 200px !important;
            width: max-content !important;
            max-width: 250px !important;
            border-radius: 10px !important;
            box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1) !important;
            border: none !important;
          }
          .react-select__menu-list {
            max-height: 300px !important;
            height: auto !important;
            min-height: 200px !important;
            border-radius: 10px !important;
          }
          .react-select__option {
            white-space: nowrap !important;
            padding: 12px 16px !important;
            font-size: 14px !important;
            min-height: 40px !important;
          }
          /* Target all react-select menus in this component */
          div[class*="react-select"] .react-select__menu {
            min-width: 200px !important;
            width: max-content !important;
            border-radius: 10px !important;
            box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1) !important;
            border: none !important;
          }
          div[class*="react-select"] .react-select__menu-list {
            max-height: 300px !important;
            height: auto !important;
            border-radius: 10px !important;
          }
          div[class*="react-select"] .react-select__control {
            border: none !important;
            box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1) !important;
            border-radius: 10px !important;
          }
          div[class*="react-select"] .react-select__control:hover {
            box-shadow: 0px 0px 12px 0px rgba(61, 165, 244, 0.3) !important;
          }
          /* Ensure text cursor for employee search field */
          .employee-search-select > div > div {
            cursor: text !important;
          }
          .employee-search-select > div > div > * {
            cursor: text !important;
          }
          .employee-search-select > div > div * {
            cursor: text !important;
          }
        `}
      </style>
      {!showComponent &&
        <>
          {/* Filter Section */}
          <div className="flex flex-wrap justify-between items-center">
            <div className='flex flex-wrap items-center gap-3 mb-4'>
              <div className="lg:w-52 md:w-52 w-full">
                <SearchReactSelect
                  placeHolderTitle="Branch"
                  value={selectedBranch}
                  options={[
                    { value: 0, label: 'All Branches' },
                    ...(empBranches?.map((branch) => ({
                      value: branch.id,
                      label: branch.branch_name,
                    })) || [])
                  ]}
                  onChangeHandler={handleBranchChange}
                  cStyle={true}
                  customStyles={{
                    control: (base) => ({
                      ...base,
                      fontSize: '14px',
                      minHeight: '36px',
                      border: 'none',
                      borderRadius: '10px',
                      backgroundColor: 'white',
                      boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0px 0px 12px 0px rgba(61, 165, 244, 0.3)',
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                      borderRadius: '10px',
                      boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
                      border: 'none'
                    }),
                    menuList: (base) => ({
                      ...base,
                      maxHeight: '200px !important',
                      height: 'auto !important',
                      borderRadius: '10px',
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? '#3DA5F4'
                        : state.isFocused
                          ? '#E3F1FF'
                          : 'transparent',
                      color: state.isSelected ? 'white' : '#333',
                      '&:hover': {
                        backgroundColor: state.isSelected ? '#2B8FD4' : '#F0F8FF',
                      }
                    }),
                    singleValue: (base) => ({
                      ...base,
                      fontSize: '14px',
                      color: '#474747',
                    }),
                    placeholder: (base) => ({
                      ...base,
                      fontSize: '14px',
                      color: '#999',
                    })
                  }}
                />
              </div>
              <div className="lg:w-52 md:w-52 w-full">
                <SearchReactSelect
                  placeHolderTitle="Department"
                  value={selectedDepartment}
                  options={[
                    { value: 0, label: 'All Departments' },
                    ...(dept_subDept?.departments?.map((dept) => ({
                      value: dept.id,
                      label: dept.name,
                    })) || [])
                  ]}
                  onChangeHandler={handleDepartmentChange}
                  // disabled={!selectedBranch || selectedBranch?.value === null || selectedBranch?.value === undefined}
                  cStyle={true}
                  customStyles={{
                    control: (base) => ({
                      ...base,
                      fontSize: '14px',
                      minHeight: '36px',
                      border: 'none',
                      borderRadius: '10px',
                      backgroundColor: 'white',
                      boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: '0px 0px 12px 0px rgba(61, 165, 244, 0.3)',
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                      borderRadius: '10px',
                      boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
                      border: 'none'
                    }),
                    menuList: (base) => ({
                      ...base,
                      borderRadius: '10px',
                    }),
                    singleValue: (base) => ({
                      ...base,
                      fontSize: '14px',
                      color: '#474747',
                    }),
                    placeholder: (base) => ({
                      ...base,
                      fontSize: '14px',
                      color: '#999',
                    })
                  }}
                />
              </div>
              <div className="lg:w-52 md:w-52 w-full">
                <SearchReactSelect
                  placeHolderTitle="Status"
                  value={selectedStatus}
                  options={[
                    { value: 0, label: 'All' },
                    { value: '1', label: 'Approved' },
                    { value: '2', label: 'Rejected' },
                    { value: '3', label: 'Pending' }
                  ]}
                  onChangeHandler={handleStatusChange}
                  cStyle={true}
                  customStyles={{
                    control: (base) => ({
                      ...base,
                      fontSize: '14px',
                      minHeight: '36px',
                      border: 'none',
                      borderRadius: '10px',
                      backgroundColor: 'white',
                      boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease-in-out',
                      width: '100%',
                      '&:hover': {
                        boxShadow: '0px 0px 12px 0px rgba(61, 165, 244, 0.3)',
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                      width: '100%',
                      minWidth: '150px',
                      borderRadius: '10px',
                      boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
                      border: 'none'
                    }),
                    menuList: (base) => ({
                      ...base,
                      maxHeight: '200px !important',
                      height: 'auto !important',
                      borderRadius: '10px',
                    }),
                    container: (base) => ({
                      ...base,
                      width: '100%',
                    }),
                    option: (base, state) => {
                      // Determine text color based on option value
                      let textColor = '#333';
                      if (!state.isSelected) {
                        if (state.data?.value === '1' || state.data?.value === 1) {
                          textColor = '#16A34A'; // Green for Approved
                        } else if (state.data?.value === '2' || state.data?.value === 2) {
                          textColor = '#DC2626'; // Red for Rejected
                        } else if (state.data?.value === '3' || state.data?.value === 3) {
                          textColor = '#F59E0B'; // Yellow for Pending
                        }
                      }

                      return {
                        ...base,
                        backgroundColor: state.isSelected
                          ? '#3DA5F4'
                          : state.isFocused
                            ? '#E3F1FF'
                            : 'transparent',
                        color: state.isSelected ? 'white' : textColor,
                        '&:hover': {
                          backgroundColor: state.isSelected ? '#2B8FD4' : '#F0F8FF',
                          color: state.isSelected ? 'white' : textColor,
                        }
                      };
                    },
                    singleValue: (base, state) => {
                      // Determine text color based on selected value
                      let textColor = '#474747';
                      if (state.data?.value === '1' || state.data?.value === 1) {
                        textColor = '#16A34A'; // Green for Approved
                      } else if (state.data?.value === '2' || state.data?.value === 2) {
                        textColor = '#DC2626'; // Red for Rejected
                      }

                      return {
                        ...base,
                        fontSize: '14px',
                        color: textColor,
                      };
                    },
                    placeholder: (base) => ({
                      ...base,
                      fontSize: '14px',
                      color: '#999',
                    })
                  }}
                />
              </div>
              <div className="lg:w-52 md:w-52 w-full relative employee-search-select">
                <SearchReactSelect
                  placeHolderTitle="Search Employee"
                  value={selectedEmployee}
                  options={employeeOptions}
                  onChangeHandler={(selectedOption) => {
                    handleEmployeeChange(selectedOption);
                    setEmployeeSearchInput('');
                    setIsEmployeeMenuOpen(false);
                  }}
                  isSearchable={true}
                  isClearable={true}
                  hideDropdownIndicator={true}
                  menuIsOpen={isEmployeeMenuOpen && employeeSearchInput.length > 0}
                  onMenuOpen={() => {
                    // Only open menu if there's a search term
                    if (employeeSearchInput.length > 0) {
                      setIsEmployeeMenuOpen(true);
                    }
                  }}
                  onMenuClose={() => setIsEmployeeMenuOpen(false)}
                  onInputChange={(inputValue, { action }) => {
                    setEmployeeSearchInput(inputValue);
                    // Open menu when user types, close when input is cleared
                    if (action === 'input-change') {
                      if (inputValue && inputValue.length > 0) {
                        setIsEmployeeMenuOpen(true);
                      } else {
                        setIsEmployeeMenuOpen(false);
                      }
                    }
                  }}
                  filterOption={(option, inputValue) => {
                    // Don't show any options if there's no search input
                    if (!inputValue || inputValue.trim() === '') return false;
                    const searchLower = inputValue.toLowerCase();
                    const label = option.label?.toLowerCase() || '';
                    const value = String(option.value || '').toLowerCase();
                    // Search in both name and ID
                    return label.includes(searchLower) || value.includes(searchLower);
                  }}
                  cStyle={true}
                  customStyles={{
                    control: (base) => ({
                      ...base,
                      fontSize: '14px',
                      minHeight: '36px',
                      width: '100%',
                      border: 'none',
                      borderRadius: '10px',
                      backgroundColor: 'white',
                      boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
                      transition: 'all 0.2s ease-in-out',
                      cursor: 'text',
                      paddingRight: '35px',
                      '&:hover': {
                        boxShadow: '0px 0px 12px 0px rgba(61, 165, 244, 0.3)',
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                      borderRadius: '10px',
                      boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
                      border: 'none'
                    }),
                    menuList: (base) => ({
                      ...base,
                      maxHeight: '200px !important',
                      height: 'auto !important',
                      borderRadius: '10px',
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? '#3DA5F4'
                        : state.isFocused
                          ? '#E3F1FF'
                          : 'transparent',
                      color: state.isSelected ? 'white' : '#333',
                      '&:hover': {
                        backgroundColor: state.isSelected ? '#2B8FD4' : '#F0F8FF',
                      }
                    }),
                    singleValue: (base) => ({
                      ...base,
                      fontSize: '14px',
                      color: '#474747',
                    }),
                    placeholder: (base) => ({
                      ...base,
                      fontSize: '14px',
                      color: '#999',
                    }),
                    input: (base) => ({
                      ...base,
                      cursor: 'text',
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      cursor: 'text',
                    }),
                    indicatorsContainer: (base) => ({
                      ...base,
                      cursor: 'text',
                      paddingRight: '0px',
                    })
                  }}
                />
                <div style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CiSearch style={{ fontSize: '18px', color: '#B3B3B3', display: 'block' }} />
                </div>
              </div>

            </div>
            <button className="bg-bgBlue text-white px-4 text-xs py-2 font-medium rounded-md hover:drop-shadow-md" onClick={handlePrintAll}>Print All</button>
          </div>

          {/* TABLE */}
          <div className='bg-white rounded-[10px] p-2 drop-shadow-md z-20'>
            <div className=''>
              <div className="customScroll overflow-auto">
                <table className="w-full text-center">
                  <thead className="sticky top-0 z-20 bg-[#F8F9FA] rounded-[8px]">
                    <tr>
                      {data?.map((head, i) => (
                        <th
                          key={i}
                          className="bg-[#F8F9FA] p-4 text-center"
                        >
                          <Typography
                            className="font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist"
                          >
                            {head}
                          </Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {applicationsList?.data && applicationsList.data.length > 0 &&
                      applicationsList?.pagination?.total_records > 0 ? (
                      applicationsList.data.map((ele, index) => {
                        const statusData = customStatus(ele.status);

                        const getStatusStyle = () => {
                          const status = ele?.status;
                          const statusStr = String(status).toLowerCase();

                          if (status === 1 || statusStr === "approved" || statusStr === "1") {
                            return "bg-[#DBFFF5] text-[#0ACF97]";
                          }
                          else if (status === 2 || statusStr === "rejected" || statusStr === "2") {
                            return "bg-[#FFF0F4] text-[#FF4979]";
                          }
                          else if (status === 0 || status === 3 || statusStr === "pending" || statusStr === "0" || statusStr === "3") {
                            return "bg-[#FFF1D9] text-[#FDA006]";
                          }
                          return "bg-gray-100 text-gray-800";
                        };

                        const getStatusText = () => {
                          if (statusData?.title) {
                            return statusData.title;
                          }
                          const status = ele?.status;
                          if (typeof status === 'string') {
                            return status;
                          }
                          if (status === 1) return "Approved";
                          if (status === 2) return "Rejected";
                          if (status === 0 || status === 3) return "Pending";
                          return "N/A";
                        };

                        const isLast = index === applicationsList.data.length - 1;
                        const classes = isLast
                          ? "p-4 text-center"
                          : "p-4 border-b border-[#F2F2F9] text-center";

                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className={classes}>
                              <Typography
                                className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal"
                              >
                                {ele?.emp_id}
                              </Typography>
                            </td>
                            <td className={classes}>
                              <Typography
                                className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal"
                              >
                                {ele?.emp_name}
                              </Typography>
                            </td>
                            <td className={classes}>
                              <Typography
                                className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal"
                              >
                                {ele?.subject}
                              </Typography>
                            </td>
                            <td className={classes}>
                              <Typography
                                className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal"
                              >
                                {ele?.form_name}
                              </Typography>
                            </td>
                            <td className={classes}>
                              <Typography
                                className="text-[clamp(12px,0.9vw,14px)] text-[#474747] font-Urbanist font-normal"
                              >
                                {formatTimestamp(ele.entry_time).slice(0, 12)}
                              </Typography>
                            </td>
                            <td className={classes}>
                              <span
                                className={`px-4 py-1 text-xs rounded-[7px] w-[110px] font-medium inline-flex items-center justify-center ${getStatusStyle()}`}
                              >
                                {getStatusText()}
                              </span>
                            </td>
                            <td className={classes}>
                              <button
                                type="button"
                                onClick={() => handleButtonClick(ele?.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors cursor-pointer bg-transparent p-0 outline-none focus:outline-none"
                                title="View Details"
                                aria-label="View application details"
                              >
                                <FaRegEye className='text-blue-500' size={18} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={data?.length || 7} className="p-4">
                          <div className="flex flex-col items-center justify-center gap-2 text-center">
                            <span className="text-[#292929] font-medium text-[16px]">
                              No details found!
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {/* Google-style Pagination */}
                    {applicationsList?.data && applicationsList.data.length > 0 && (() => {
                      const paginationData = getPaginationData();
                      return paginationData.totalPages > 1 && (
                        <tr>
                          <td colSpan={data?.length || 7} className="p-4">
                            <div className="w-full flex justify-center items-center gap-1">
                              {/* Previous Button */}
                              {paginationData.currentPage > 1 ? (
                                <button
                                  title="Previous Page"
                                  className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  onClick={goToPreviousPage}
                                  disabled={isLoadingMore}
                                >
                                  <span>‹</span>
                                  <span>Previous</span>
                                </button>
                              ) : (
                                <div className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-gray-400 cursor-not-allowed flex items-center gap-1">
                                  <span>‹</span>
                                  <span>Previous</span>
                                </div>
                              )}

                              {/* Page Numbers */}
                              <div className="flex items-center gap-1">
                                {(() => {
                                  const currentPage = paginationData.currentPage;
                                  const totalPages = paginationData.totalPages;

                                  // If 10 or fewer pages, show all pages (like Google)
                                  if (totalPages <= 10) {
                                    return Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                      <button
                                        key={pageNum}
                                        onClick={() => goToPage(pageNum)}
                                        disabled={isLoadingMore}
                                        className={`px-3 py-1.5 text-[clamp(12px,1vw,14px)] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${pageNum === currentPage
                                            ? 'bg-[#1a73e8] text-white font-medium'
                                            : 'text-[#1a73e8] hover:bg-gray-100'
                                          }`}
                                      >
                                        {pageNum}
                                      </button>
                                    ));
                                  }

                                  // For more than 10 pages, show with ellipsis
                                  const pages = [];
                                  pages.push(1);

                                  if (currentPage > 3) {
                                    pages.push('ellipsis-start');
                                  }

                                  const startPage = Math.max(2, currentPage - 1);
                                  const endPage = Math.min(totalPages - 1, currentPage + 1);

                                  for (let i = startPage; i <= endPage; i++) {
                                    if (i !== 1 && i !== totalPages) {
                                      pages.push(i);
                                    }
                                  }

                                  if (currentPage < totalPages - 2) {
                                    pages.push('ellipsis-end');
                                  }

                                  pages.push(totalPages);

                                  // Remove duplicates
                                  const uniquePages = [];
                                  const seen = new Set();
                                  pages.forEach(page => {
                                    if (typeof page === 'number' && !seen.has(page)) {
                                      seen.add(page);
                                      uniquePages.push(page);
                                    } else if (typeof page === 'string') {
                                      uniquePages.push(page);
                                    }
                                  });

                                  return uniquePages.map((page, index) => {
                                    if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                                      return (
                                        <span key={`ellipsis-${index}`} className="px-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8]">
                                          ...
                                        </span>
                                      );
                                    }

                                    return (
                                      <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        disabled={isLoadingMore}
                                        className={`px-3 py-1.5 text-[clamp(12px,1vw,14px)] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${page === currentPage
                                            ? 'bg-[#1a73e8] text-white font-medium'
                                            : 'text-[#1a73e8] hover:bg-gray-100'
                                          }`}
                                      >
                                        {page}
                                      </button>
                                    );
                                  });
                                })()}
                              </div>

                              {/* Next Button */}
                              {paginationData.currentPage < paginationData.totalPages ? (
                                <button
                                  title="Next Page"
                                  className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                  onClick={goToNextPage}
                                  disabled={isLoadingMore}
                                >
                                  <span>Next</span>
                                  <span>›</span>
                                </button>
                              ) : (
                                <div className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-gray-400 cursor-not-allowed flex items-center gap-1">
                                  <span>Next</span>
                                  <span>›</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      }


      {showComponent && <ApplicationDetails
        applicationData={application_data}
        isLoading={isLoadingApplicationDetails}
        applicationId={selectedApplicationId}
        onClose={handleCloseDetails}
      />}


    </>
  )
}

export default ApplicationsLists
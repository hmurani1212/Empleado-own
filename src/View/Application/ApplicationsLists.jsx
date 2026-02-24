import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Typography, Button } from '@material-tailwind/react'
import ApplicationDetails from './ApplicationDetails';
import useApplication from '../../ViewModel/ApplicationViewModel/ApplicationServices'
import { formatTimestamp } from '../Branches/utils'
import { customStatus } from '../../services/__applicationServices'
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices';
import useInboxServives from '../../ViewModel/InboxViewModel/inboxServices';
import { FaRegEye, FaPrint } from "react-icons/fa";
import { useLocation } from 'react-router-dom';
import CustomSelect from '../../Components/CustomSelect/CustomSelect';
import { motion, AnimatePresence } from 'framer-motion';
import { showToast } from '../../Components/Toaster/Toaster';
import useStore from '../../Store/store';

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

  // Function to get current filters - send branch_id 0 when All Branches, include from_date/to_date when set
  const getCurrentFilters = () => {
    const filters = { page: 1 };
    if (selectedBranch != null && selectedBranch.value !== undefined) {
      filters.branch = selectedBranch.value === '0' || selectedBranch.value === 0 ? 0 : selectedBranch.value;
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
    if (printFromDate && String(printFromDate).trim() !== '') {
      filters.from_date = printFromDate;
    }
    if (printToDate && String(printToDate).trim() !== '') {
      filters.to_date = printToDate;
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

  const [printFromDate, setPrintFromDate] = useState('');
  const [printToDate, setPrintToDate] = useState('');
  const [isPrintLoading, setIsPrintLoading] = useState(false);

  const data = ['Emp ID', 'Name', 'Subject', 'Apply For', 'Submission Date', 'Status', 'Action']

  const { applicationsList, gettingApplicationsList, gettingFilteredApplicationsList } = useApplication()
  const { empBranches, fetchingAllBranches, gettingSubBranches, dept_subDept, Get_All_Employeefn, Get_All_Employee, orgLogo, getOrgLogo } = useEmployees()
  const { application_data, isLoadingApplicationDetails, getFormDetailsByTypeRef } = useInboxServives()

  const isLeaveApplication = (app) =>
    Number(app?.form_id) === 7 || String(app?.form_name || '').toLowerCase().includes('leave');

  // Filter list by From/To date (entry_time in range) when both dates are set - so table shows only applications in that range
  const displayedList = useMemo(() => {
    const list = applicationsList?.data || [];
    const hasFrom = printFromDate && String(printFromDate).trim() !== '';
    const hasTo = printToDate && String(printToDate).trim() !== '';
    if (!hasFrom || !hasTo) return list;
    const fromStart = Math.floor(new Date(printFromDate).setHours(0, 0, 0, 0) / 1000);
    const toEnd = Math.floor(new Date(printToDate).setHours(23, 59, 59, 999) / 1000);
    return list.filter((ele) => {
      const t = ele?.entry_time ?? ele?.timestamp ?? 0;
      return t >= fromStart && t <= toEnd;
    });
  }, [applicationsList?.data, printFromDate, printToDate]);

  const showPrintSection = displayedList.some(isLeaveApplication);

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

  // When From/To date changes, refetch list with date filter so table shows applications in that range
  const isDateFilterMounted = useRef(false);
  useEffect(() => {
    if (!isDateFilterMounted.current) {
      isDateFilterMounted.current = true;
      return;
    }
    const filters = getCurrentFilters();
    gettingFilteredApplicationsList(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printFromDate, printToDate]);

  const handleBranchChange = async (selectedOption) => {
    setSelectedBranch(selectedOption);
    setSelectedStatus(null);
    setSelectedEmployee(null);

    const filters = { page: 1 };
    if (selectedOption == null) {
      gettingApplicationsList();
      return;
    }
    const branchVal = selectedOption.value === '0' || selectedOption.value === 0 ? 0 : selectedOption.value;
    filters.branch = branchVal;

    await gettingSubBranches(branchVal);
    if (branchVal !== 0) {
      setSelectedDepartment(null);
    } else {
      setSelectedDepartment({ value: 0, label: 'All Departments' });
      // Do not set filters.deptt when All Branches - API should receive branch_id=0 only, not dep_id
    }

    if (selectedStatus?.value) filters.status = selectedStatus.value;
    gettingFilteredApplicationsList(filters);
  };

  const handleDepartmentChange = (selectedOption) => {
    setSelectedDepartment(selectedOption);
    setSelectedEmployee(null);

    const filters = { page: 1 };
    if (selectedBranch != null && selectedBranch.value !== undefined) {
      filters.branch = selectedBranch.value === '0' || selectedBranch.value === 0 ? 0 : selectedBranch.value;
    }
    if (selectedOption?.value !== undefined && selectedOption?.value !== '0' && selectedOption?.value !== 0) {
      filters.deptt = selectedOption.value;
    }
    if (selectedStatus?.value) filters.status = selectedStatus.value;

    gettingFilteredApplicationsList(filters);
  };

  const handleStatusChange = (selectedOption) => {
    setSelectedStatus(selectedOption);
    setSelectedEmployee(null);

    const filters = getCurrentFilters();
    if (selectedOption?.value) filters.status = selectedOption.value;
    gettingFilteredApplicationsList(filters);
  };

  const handleEmployeeChange = async (selectedOption) => {
    setSelectedEmployee(selectedOption);

    if (!selectedOption && !selectedBranch && !selectedDepartment && !selectedStatus) {
      await gettingApplicationsList();
      return;
    }

    const filters = getCurrentFilters();
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

  const handlePrintAll = async () => {
    const hasFrom = printFromDate && String(printFromDate).trim() !== '';
    const hasTo = printToDate && String(printToDate).trim() !== '';
    if (hasFrom !== hasTo) {
      showToast('Please select both From Date and To Date, or leave both empty to print all.', 'error');
      return;
    }
    let fromStart = null;
    let toEnd = null;
    if (hasFrom && hasTo) {
      const from = new Date(printFromDate);
      const to = new Date(printToDate);
      if (from > to) {
        showToast('From Date cannot be after To Date', 'error');
        return;
      }
      fromStart = Math.floor(new Date(printFromDate).setHours(0, 0, 0, 0) / 1000);
      toEnd = Math.floor(new Date(printToDate).setHours(23, 59, 59, 999) / 1000);
    }

    setIsPrintLoading(true);
    const savedPage = getCurrentFilters().page || 1;
    try {
      const filters = { ...getCurrentFilters(), getall: true };
      await gettingFilteredApplicationsList(filters);
      const list = useStore.getState().applicationsList?.data || [];
      const filtered = fromStart != null && toEnd != null
        ? list.filter((ele) => {
            const t = ele?.entry_time ?? ele?.timestamp ?? 0;
            return t >= fromStart && t <= toEnd;
          })
        : list;

      const leaveOnly = filtered.filter((app) => isLeaveApplication(app));
      if (leaveOnly.length === 0) {
        showToast(
          filtered.length === 0
            ? (fromStart != null && toEnd != null
                ? 'No applications found in the selected date range (with current filters).'
                : 'No applications found for the current filters.')
            : 'No leave applications to print. Print is only available for leave applications.',
          'info'
        );
        setIsPrintLoading(false);
        await gettingFilteredApplicationsList({ ...getCurrentFilters(), page: savedPage });
        return;
      }

      const defaultNoteFallback = 'During in my absence I can be contacted (If very Urgent).\n\nTelephone#: 03439902848';
      const logoUrl = orgLogo?.logo ? orgLogo.logo : '';

      const emptyStr = (v) => (v != null && String(v).trim() !== '' ? String(v).trim() : '--');
      /** Normalize line endings and collapse multiple newlines to one — used only for Application Detail to remove blank lines (\r\n\r\n etc.) */
      const collapseNewlinesApplicationDetail = (s) => {
        if (s == null) return '';
        const normalized = String(s).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        return normalized.replace(/\n{2,}/g, '\n').trim();
      };
      const renderOneLeavePrintPage = (app) => {
        const name = emptyStr(app?.name || app?.emp_name);
        const empId = emptyStr(app?.form_data?.emp_id ?? app?.emp_id);
        const oneId = emptyStr(app?.one_id);
        const branch = emptyStr(app?.employee_details?.branch_name?.branch_name ?? app?.branch_name);
        const dept = emptyStr(app?.employee_details?.department?.name ?? app?.department ?? app?.department_name);
        const designation = emptyStr(app?.employee_details?.designation_name ?? app?.designation_name);
        const subject = emptyStr(app?.form_data?.subject ?? app?.subject);
        const appDetail = app?.Application_detail ?? app?.application_detail ?? app?.form_data?.application_detail ?? app?.app_body ?? app?.form_data?.app_body;
        const appDetailStr = appDetail != null && String(appDetail).trim() !== '' ? collapseNewlinesApplicationDetail(String(appDetail).trim()) : '--';
        const leaveFrom = emptyStr(app?.form_data?.leave_app_start_date ?? app?.leave_app_start_date);
        const leaveUpto = emptyStr(app?.form_data?.leave_app_end_date ?? app?.leave_app_end_date);
        const leaveTypeFromApi = Array.isArray(app?.leave_types) && app.leave_types.length > 0
          ? app.leave_types.map((lt) => lt?.title || lt?.leave_type).filter(Boolean).join(', ')
          : (app?.form_data?.leave_type ?? app?.leave_type);
        const leaveType = emptyStr(leaveTypeFromApi);
        const empPhone = app?.emp_phone ?? app?.form_data?.emp_phone ?? app?.employee_details?.emp_phone;
        const defaultNote = (empPhone != null && String(empPhone).trim() !== '') ? `During in my absence I can be contacted (If very Urgent).\n\nTelephone#: ${String(empPhone).trim()}` : defaultNoteFallback;
        const note = (app?.form_data?.note != null && String(app?.form_data?.note).trim() !== '') ? String(app?.form_data?.note).trim() : defaultNote;
        const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const escPre = (s) => esc(s).replace(/\n/g, '<br/>');
        return `
        <div class="print-page">
          <header class="print-header">
            <div class="print-header-logo">${logoUrl ? `<img class="print-logo" src="${esc(logoUrl)}" alt="" onerror="this.style.display='none'" />` : ''}</div>
            <h1>Leave Application</h1>
            <p>Official leave request document</p>
          </header>
          <section class="print-section">
            <h2 class="print-section-title">EMPLOYEE INFORMATION</h2>
            <div class="print-card">
              <div class="emp-grid">
                <div class="emp-item"><label>EMPLOYEE NAME</label><span>${esc(name)}</span></div>
                <div class="emp-item"><label>EMPLOYEE ID</label><span>${esc(empId)}</span></div>
                <div class="emp-item"><label>EMPLOYEE ONEID</label><span>${esc(oneId)}</span></div>
                <div class="emp-item"><label>BRANCH</label><span>${esc(branch)}</span></div>
                <div class="emp-item"><label>DEPARTMENT</label><span>${esc(dept)}</span></div>
                <div class="emp-item"><label>DESIGNATION</label><span>${esc(designation)}</span></div>
              </div>
            </div>
          </section>
          <section class="print-section">
            <h2 class="print-section-title">SUBJECT</h2>
            <div class="print-card"><div class="print-card-body">${esc(subject)}</div></div>
          </section>
          <section class="print-section">
            <h2 class="print-section-title">APPLICATION DETAIL</h2>
            <div class="print-card"><div class="print-card-body">${escPre(appDetailStr)}</div></div>
          </section>
          <section class="print-section">
            <h2 class="print-section-title">LEAVE PERIOD</h2>
            <div class="date-flex">
              <div class="date-item"><label>FROM</label><span class="date-value">${esc(leaveFrom)}</span></div>
              <div class="date-item"><label>UPTO</label><span class="date-value">${esc(leaveUpto)}</span></div>
              <div class="date-item"><label>LEAVE TYPE</label><span class="date-value">${esc(leaveType)}</span></div>
            </div>
          </section>
          <section class="print-section">
            <h2 class="print-section-title">NOTE</h2>
            <div class="note-card"><div class="print-card-body">${escPre(note)}</div></div>
          </section>
          <div class="signature-row">
            <div class="signature-block"><div class="signature-line"></div><span>EMPLOYEE SIGNATURE</span></div>
            <div class="signature-block"><div class="signature-line"></div><span>APPROVAL AUTHORITY</span></div>
          </div>
        </div>`;
      };

      const printPagesHTML = leaveOnly.map((ele) => renderOneLeavePrintPage(ele)).join('');

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Leave Applications - Print</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #fff; }
            @page { size: A4; margin: 12mm 15mm; }
            @media print {
              html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
              .print-page { page-break-after: always; }
              .print-page:last-child { page-break-after: avoid; }
            }
            .print-page { max-width: 700px; margin: 0 auto 24px; padding: 12px 24px 24px; background: #ffffff; }
            .print-header { position: relative; text-align: center; margin-bottom: 16px; padding-top: 4px; padding-bottom: 10px; border-bottom: 3px solid #3b82f6; }
            .print-header-logo { position: absolute; top: 0; right: 0; }
            .print-logo { display: block; max-height: 44px; max-width: 130px; object-fit: contain; }
            .print-header h1 { font-size: 20px; font-weight: 700; color: #111827; letter-spacing: -0.02em; margin-bottom: 2px; }
            .print-header p { font-size: 11px; color: #6b7280; font-weight: 500; }
            .print-section { margin-bottom: 14px; page-break-inside: avoid; }
            .print-section-title { font-size: 12px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 6px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
            .print-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 14px; }
            .print-card-body { font-size: 14px; line-height: 1.6; color: #1f2937; white-space: pre-wrap; word-wrap: break-word; }
            .emp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 32px; }
            .emp-item { display: flex; flex-direction: column; gap: 2px; }
            .emp-item label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.03em; }
            .emp-item span { font-size: 14px; font-weight: 500; color: #111827; }
            .date-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .date-flex { display: flex; flex-wrap: wrap; gap: 12px 24px; }
            .date-flex .date-item { flex: 1; min-width: 100px; }
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
        </head>
        <body>
        ${printPagesHTML}
        </body>
        </html>
      `;
      const win = window.open('', '_blank');
      win.document.write(printContent);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
        win.close();
      }, 300);
      showToast(`Printing ${leaveOnly.length} leave application(s)`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to load applications for print', 'error');
    } finally {
      setIsPrintLoading(false);
      const filters = { ...getCurrentFilters(), page: savedPage };
      gettingFilteredApplicationsList(filters);
    }
  };

  const getStatusStyle = (status) => {
    const statusStr = String(status ?? '').toLowerCase().trim();
    if (status === 1 || statusStr === "approved" || statusStr === "1") return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    if (status === 2 || statusStr === "rejected" || statusStr === "2") return "bg-red-50 text-red-600 border border-red-100";
    if (status === 0 || status === 3 || statusStr === "pending" || statusStr === "0" || statusStr === "3") return "bg-amber-50 text-amber-600 border border-amber-100";
    return "bg-gray-50 text-gray-600 border border-gray-100";
  };

  const getStatusText = (status) => {
    if (status == null || status === '') return "--";
    const s = String(status).toLowerCase().trim();
    if (status === 1 || s === '1' || s === 'approved') return "Approved";
    if (status === 2 || s === '2' || s === 'rejected') return "Rejected";
    if (status === 0 || status === 3 || s === '0' || s === '3' || s === 'pending') return "Pending";
    return String(status);
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
          <div className="flex flex-col gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="w-full min-w-0">
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
                <div className="w-full min-w-0">
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
                <div className="w-full min-w-0">
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
                <div className="w-full min-w-0">
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
              </div>
            </div>
            {showPrintSection && (
            <div className="flex flex-wrap items-end justify-end gap-3">
              <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                <input
                  type="date"
                  value={printFromDate}
                  onChange={(e) => setPrintFromDate(e.target.value)}
                  className="w-full min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                />
              </div>
              <div className="min-w-0">
                <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                <input
                  type="date"
                  value={printToDate}
                  onChange={(e) => setPrintToDate(e.target.value)}
                  className="w-full min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                />
              </div>
              <Button
                variant="outlined"
                size="sm"
                className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-white"
                onClick={handlePrintAll}
                disabled={isPrintLoading}
              >
                <FaPrint className="w-4 h-4" />
                {isPrintLoading ? 'Loading...' : 'Print All'}
              </Button>
            </div>
            )}
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
                  ) : displayedList && displayedList.length > 0 ? (
                    displayedList.map((ele, index) => (
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
                            <Typography className="text-sm font-semibold text-gray-900 font-poppins line-clamp-1" title={ele?.subject}>
                                {ele?.subject}
                            </Typography>
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
                            onClick={() => handleButtonClick(ele?.id, ele)}
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
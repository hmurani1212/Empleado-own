import { Button, Typography } from "@material-tailwind/react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useFormApproval from "../../ViewModel/FormApprovalViewModel/FormApprovalServices";
import { FaSpinner } from "react-icons/fa";
import { PiEyeLight, PiSignature } from "react-icons/pi";
import useCustomFormService from "../../ViewModel/FormApprovalViewModel/customFormService";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import ViewAssignAF from "./ViewAssignAF";
import ViewOnlyEmpLeaveApplication from "./ViewOnlyEmpLeaveApplication";
import ViewOnlyCreateNewRequest from "./ViewOnlyCreateNewRequest";
import ViewOnlyEmpLoanApplication from "./ViewOnlyEmpLoanApplication";
import useEmpLeaveApplication from "../../ViewModel/EmpViewModel/EmpApplicationViewModel/EmpLeaveApplicationServices";
import useNewAdjustRequest from "../../ViewModel/AttendanceViewModel/newAdjustRequest";
import useEmpLoanApplication from "../../ViewModel/EmpViewModel/EmpApplicationViewModel/EmpLoanApplicationServices";
import { motion } from "framer-motion";
import FormApprovalSkeleton from "./FormApprovalSkeleton";
import { FaChevronDown } from "react-icons/fa6";

const CustomForm = () => {
  const { mountCustomForm, gettingCustomForm, allCustomForm, customFormLoading } =
    useFormApproval();

  const {
    approvalFlowValue,
    toggleAssignAF,
    viewAssignAF,
    assingApprovalFlow,
    handlesSelectAAF,
    formModal,
    handleViewForm,
    closeFormModal,
    assignAFLoadingId
  } = useCustomFormService();

  // Leave application hook for modal functionality
  const {
    leaveApplcationValue,
    handleApplicationChange,
    generateLeaveDays,
    handleLeaveTypeChange,
    handleHalfDayChange,
    employeeDefinedLeaves,
    paidLeaveConfigEnabled,
  } = useEmpLeaveApplication();

  // Time adjustment hook for modal functionality
  const { formValue, handleChangeAdjustRequest } =
    useNewAdjustRequest();

  // Loan application hook for modal functionality
  const {
    loanApplicationValue,
    handleApplicationChange: handleLoanApplicationChange,
  } = useEmpLoanApplication();

  const customHead = [
    "S.No",
    "Form Name",
    "Assigned To",
    "Creation Time",
    "Action",
  ];

  const hasFetchedRef = useRef(false);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const actionButtonRefs = useRef({});
  const menuRef = useRef(null);
  const closeMenuTimeoutRef = useRef(null);
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    gettingCustomForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateMenuPosition = (index) => {
    const btn = actionButtonRefs.current[index];
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setMenuPosition({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    });
  };

  const clearCloseMenuTimeout = () => {
    if (closeMenuTimeoutRef.current) {
      clearTimeout(closeMenuTimeoutRef.current);
      closeMenuTimeoutRef.current = null;
    }
  };

  const openMenuOnHover = (index) => {
    clearCloseMenuTimeout();
    updateMenuPosition(index);
    setOpenMenuIndex(index);
  };

  const closeMenuWithDelay = () => {
    clearCloseMenuTimeout();
    closeMenuTimeoutRef.current = setTimeout(() => {
      setOpenMenuIndex(null);
    }, 120);
  };

  useEffect(() => {
    if (openMenuIndex == null) return;

    const handleOutsideClick = (event) => {
      const btn = actionButtonRefs.current[openMenuIndex];
      if (
        menuRef.current?.contains(event.target) ||
        btn?.contains(event.target)
      ) {
        return;
      }
      setOpenMenuIndex(null);
    };

    const handleReposition = () => updateMenuPosition(openMenuIndex);

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("resize", handleReposition);
    document.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("resize", handleReposition);
      document.removeEventListener("scroll", handleReposition, true);
    };
  }, [openMenuIndex]);

  function formatTimeStamp(unixTimestamp) {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    // Convert seconds to milliseconds for JS Date
    const date = new Date(unixTimestamp * 1000);

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month}, ${year}`;
  }

  // Function to format form labels - replace underscores with spaces and handle special cases
  function formatFormLabel(formLabel) {
    if (!formLabel) return "";

    // Remove "ATT_" prefix if present
    let formatted = formLabel.replace(/^ATT_/i, "");

    // Replace underscores with spaces
    formatted = formatted.replace(/_/g, " ");

    return formatted;
  }

  function normalizeAssignedTo(value) {
    const raw = value == null ? "" : String(value).trim();
    if (!raw) return "";
    const colonIdx = raw.indexOf(":");
    if (colonIdx >= 0) {
      return raw.slice(colonIdx + 1).trim();
    }
    return raw;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100, damping: 15 } },
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-4"
    >
      {customFormLoading ? (
        <FormApprovalSkeleton headers={customHead} />
      ) : (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto overflow-y-visible customScroll">
          <table className="min-w-[960px] w-full table-fixed border-collapse">
            <thead className="sticky top-0 z-20 bg-gray-50 shadow-sm">
              <tr>
                {customHead?.map((head, i) => (
                  <th key={i} className="w-1/5 px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider font-poppins whitespace-nowrap">
                    <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {allCustomForm?.length > 0 ? (
                allCustomForm.map((data, index) => (
                  <motion.tr 
                    key={index}
                    variants={itemVariants}
                    className={`hover:bg-brand-50/30 transition-colors duration-200 group ${openMenuIndex === index ? "relative z-[40] isolate" : ""}`}
                  >
                    <td className="px-4 py-4 text-xs text-center">
                        {index + 1}
                    
                    </td>

                    <td className="p-4 text-center align-middle">
                      <Typography className="font-medium text-gray-900 text-sm font-poppins capitalize">
                        {formatFormLabel(data.form_name)}
                      </Typography>
                    </td>

                    <td className="p-4 text-center align-middle">
                      <Typography className="text-sm font-medium text-gray-700 font-poppins capitalize">
                        {normalizeAssignedTo(data.assigned_to)}
                      </Typography>
                    </td>

                    <td className="p-4 text-center align-middle">
                      <Typography className="text-sm text-gray-500 font-poppins bg-gray-50 px-2 py-1 rounded-md inline-block border border-gray-100">
                        {formatTimeStamp(data.entry_time)}
                      </Typography>
                    </td>

                    <td className={`p-4 text-center align-middle relative ${openMenuIndex === index ? "z-[30]" : ""}`}>
                      <div
                        className="relative inline-flex justify-center"
                        onMouseEnter={() => openMenuOnHover(index)}
                        onMouseLeave={closeMenuWithDelay}
                      >
                        <Button
                          ref={(el) => {
                            actionButtonRefs.current[index] = el;
                          }}
                          className="flex items-center cursor-pointer gap-2 capitalize font-medium bg-white hover:bg-brand-50 text-brand-500 border border-brand-200 hover:border-brand-300 rounded-lg text-xs px-3 py-1.5 shadow-sm transition-all"
                        >
                          Action
                          <FaChevronDown
                            className={`w-3 h-3 transition-transform duration-200 ${openMenuIndex === index ? "rotate-180" : ""}`}
                          />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100" />
                      </div>
                      <Typography className="font-medium font-poppins">No forms found</Typography>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {openMenuIndex != null &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[9999] -translate-x-1/2 -translate-y-full"
            style={{ top: menuPosition.top, left: menuPosition.left }}
            onMouseEnter={() => clearCloseMenuTimeout()}
            onMouseLeave={closeMenuWithDelay}
          >
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-xs font-medium text-amber-600"
              onClick={() => {
                const row = allCustomForm?.[openMenuIndex];
                if (row) viewAssignAF(row);
                setOpenMenuIndex(null);
                clearCloseMenuTimeout();
              }}
              disabled={assignAFLoadingId === (allCustomForm?.[openMenuIndex]?.id || allCustomForm?.[openMenuIndex]?._id)}
            >
              <span>Assign AF</span>
              {assignAFLoadingId === (allCustomForm?.[openMenuIndex]?.id || allCustomForm?.[openMenuIndex]?._id) ? (
                <FaSpinner className="text-sm animate-spin" />
              ) : (
                <PiSignature className="text-sm" />
              )}
            </button>
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-xs font-medium text-blue-600"
              onClick={() => {
                const row = allCustomForm?.[openMenuIndex];
                if (row) handleViewForm(row);
                setOpenMenuIndex(null);
                clearCloseMenuTimeout();
              }}
            >
              <span>View</span>
              <PiEyeLight className="text-sm" />
            </button>
          </div>,
          document.body
        )}

      {approvalFlowValue.show && (
        <PortalDrawer
          open={approvalFlowValue.show}
          closeDrawer={toggleAssignAF}
          compo={
            <ViewAssignAF
              data={approvalFlowValue}
              assingApprovalFlow={assingApprovalFlow}
              handlesSelectAAF={handlesSelectAAF}
            />
          }
          widthSize={620}
          title="Assign Approval Flow"
        />
      )}

      {/* Conditional Form Modal */}
      {formModal.show && (
        <PortalDrawer
          open={formModal.show}
          closeDrawer={closeFormModal}
          compo={
            <div className="p-6 font-poppins">
              <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700 font-medium">
                Info only: this preview is read-only and fields cannot be edited.
              </div>
              {formModal.formType === "time_adjustment" && (
                <ViewOnlyCreateNewRequest
                  formValue={formValue}
                  handleChangeAdjustRequest={handleChangeAdjustRequest}
                  isReadOnly
                />
              )}
              {formModal.formType === "leave" && (
                <ViewOnlyEmpLeaveApplication
                  leaveApplcationValue={leaveApplcationValue}
                  handleApplicationChange={handleApplicationChange}
                  generateLeaveDays={generateLeaveDays}
                  handleLeaveTypeChange={handleLeaveTypeChange}
                  handleHalfDayChange={handleHalfDayChange}
                  employeeDefinedLeaves={employeeDefinedLeaves}
                  paidLeaveConfigEnabled={paidLeaveConfigEnabled}
                  isReadOnly
                />
              )}
              {formModal.formType === "loan" && (
                <ViewOnlyEmpLoanApplication
                  loanApplicationValue={loanApplicationValue}
                  handleApplicationChange={handleLoanApplicationChange}
                  isReadOnly
                />
              )}
              {formModal.formType === "default" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-gray-600 text-xs font-medium uppercase tracking-wide">
                      Subject
                    </label>
                    <input
                      className="w-full text-gray-800 text-sm rounded-xl py-3 px-4 border border-gray-200 bg-gray-50 outline-none font-medium"
                      type="text"
                      name="subject"
                      placeholder="Subject"
                      disabled
                    />
                  </div>
                  <div className="flex-1 flex flex-col space-y-2">
                    <label className="text-gray-600 text-xs font-medium uppercase tracking-wide">
                      Application Body
                    </label>
                    <textarea
                      rows="7"
                      className="text-gray-800 text-sm rounded-xl py-3 px-4 border border-gray-200 bg-gray-50 outline-none resize-none leading-relaxed"
                      placeholder="Application Detail"
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-gray-600 text-xs font-medium uppercase tracking-wide">
                        Leave From
                      </label>
                      <input
                        className="w-full text-gray-800 text-sm rounded-xl py-3 px-4 border border-gray-200 bg-gray-50 outline-none font-medium"
                        type="date"
                        name="leaveFrom"
                        disabled
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-gray-600 text-xs font-medium uppercase tracking-wide">
                        Leave Upto
                      </label>
                      <input
                        className="w-full text-gray-800 text-sm rounded-xl py-3 px-4 border border-gray-200 bg-gray-50 outline-none font-medium"
                        type="date"
                        name="leaveUpto"
                        disabled
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          }
          widthSize={620}
          title="View Form"
        />
      )}
    </motion.div>
  );
};

export default CustomForm;
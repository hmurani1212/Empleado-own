import { Button, Typography } from "@material-tailwind/react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useFormApproval from "../../ViewModel/FormApprovalViewModel/FormApprovalServices";
import { FaTrash } from "react-icons/fa";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import { motion } from "framer-motion";
import { PiEyeLight } from "react-icons/pi";
import FormApprovalSkeleton from "./FormApprovalSkeleton";
import { FaChevronDown } from "react-icons/fa6";

const ApprovalFlow = () => {
  const {
    mountApprovalFlow,
    gettingFormApproval,
    allApprovalFlow,
    viewFormApproval,
    handleDeleteApproval,
    openDialogForm,
    deleteApproval,
    approvalFlowLoading,
  } = useFormApproval();
  
  // Updated headers to match modern style
  const approvalData = ["S.No", "Title", "Creation Time", "Action"];
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const actionButtonRefs = useRef({});
  const menuRef = useRef(null);
  const closeMenuTimeoutRef = useRef(null);

  useEffect(() => {
    if (!mountApprovalFlow) {
      gettingFormApproval();
    }
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
      {approvalFlowLoading ? (
        <FormApprovalSkeleton headers={approvalData} />
      ) : (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto overflow-y-visible customScroll">
          <table className="min-w-[960px] w-full table-fixed border-collapse">
            <thead className="sticky top-0 z-20 bg-gray-50 shadow-sm">
              <tr>
                {approvalData?.map((head, i) => (
                  <th key={i} className="w-1/4 px-4 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider font-poppins whitespace-nowrap">
                    <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {allApprovalFlow?.length > 0 ? (
                allApprovalFlow.map((data, index) => (
                  <motion.tr 
                    key={index}
                    variants={itemVariants}
                    className={`hover:bg-brand-50/30 transition-colors duration-200 group ${openMenuIndex === index ? "relative z-[40] isolate" : ""}`}
                  >
                    <td className="px-4 py-4 text-xs text-center">
                      {index + 1}
                    </td>

                    <td className="p-4 text-center align-middle">
                      <Typography className="font-medium text-gray-900 text-sm font-poppins">
                        {data.title}
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
                  <td colSpan={4} className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100" />
                      </div>
                      <Typography className="font-medium font-poppins">No approval flows found</Typography>
                      <p className="text-sm text-gray-400 max-w-xs mx-auto">Create a new approval flow to manage your processes efficiently.</p>
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
            className="fixed w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[9999] -translate-x-1/2 -translate-y-full"
            style={{ top: menuPosition.top, left: menuPosition.left }}
            onMouseEnter={() => clearCloseMenuTimeout()}
            onMouseLeave={closeMenuWithDelay}
          >
            <button
              type="button"
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-xs font-medium text-blue-600"
              onClick={() => {
                const row = allApprovalFlow?.[openMenuIndex];
                if (row) viewFormApproval(row);
                setOpenMenuIndex(null);
                clearCloseMenuTimeout();
              }}
            >
              <span>View</span>
              <PiEyeLight className="text-sm" />
            </button>
            {(allApprovalFlow?.[openMenuIndex]?.org_id === 0 || allApprovalFlow?.[openMenuIndex]?.org_id === "0") ? null : (
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors text-xs font-medium text-red-500"
                onClick={() => {
                  const row = allApprovalFlow?.[openMenuIndex];
                  if (row) handleDeleteApproval(row.id);
                  setOpenMenuIndex(null);
                  clearCloseMenuTimeout();
                }}
              >
                <span>Delete</span>
                <FaTrash className="text-xs" />
              </button>
            )}
          </div>,
          document.body
        )}
      
      <ConfirmationDialog
        openDialog={openDialogForm}
        handleOpen={handleDeleteApproval}
        handleConfirm={(e) => deleteApproval(e)}
        title={"Confirm Delete"}
        message={
          "You are attempting to delete this approval flow. Please note that it is an irreversible process. Are you sure to Delete this Approval Flow?"
        }
      />
    </motion.div>
  );
};

export default ApprovalFlow;
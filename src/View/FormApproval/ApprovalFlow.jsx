import { Button, Typography, IconButton } from "@material-tailwind/react";
import React, { useEffect } from "react";
import useFormApproval from "../../ViewModel/FormApprovalViewModel/FormApprovalServices";
import { formatTimestamp } from "../../services/__formApprovalServices";
import { FaEye, FaTrashAlt, FaClipboardCheck, FaTrash } from "react-icons/fa";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import { motion } from "framer-motion";
import { PiEyeLight } from "react-icons/pi";
import FormApprovalSkeleton from "./FormApprovalSkeleton";

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

  useEffect(() => {
    if (!mountApprovalFlow) {
      gettingFormApproval();
    }
  }, []);

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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto customScroll">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
              <tr>
                {approvalData?.map((head, i) => (
                  <th key={i} className="p-4 first:pl-6 last:pr-6 whitespace-nowrap">
                    <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {allApprovalFlow?.length > 0 ? (
                allApprovalFlow.map((data, index) => (
                  <motion.tr 
                    key={index}
                    variants={itemVariants}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="p-4 first:pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center text-sm font-bold shadow-sm border border-blue-100">
                          {index + 1}
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FaClipboardCheck className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <Typography className="font-medium text-gray-900 text-sm font-poppins">
                          {data.title}
                        </Typography>
                      </div>
                    </td>

                    <td className="p-4">
                      <Typography className="text-sm text-gray-500 font-poppins bg-gray-50 px-2 py-1 rounded-md inline-block border border-gray-100">
                        {formatTimeStamp(data.entry_time)}
                      </Typography>
                    </td>

                    <td className="p-4 last:pr-6">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="text"
                          className="flex items-center gap-2 cursor-pointer text-blue-600 hover:bg-blue-50 normal-case font-medium px-3 py-2 rounded-lg"
                          onClick={() => viewFormApproval(data)}
                        >
                          <PiEyeLight className="text-lg" />
                          View
                        </Button>

                        {/* Hide delete button for global approval flows (org_id === 0) */}
                        {data.org_id === 0 || data.org_id === "0" ? null : (
                          <Button
                            variant="text"
                            className="flex items-center gap-2 cursor-pointer text-red-500 hover:bg-red-50 normal-case font-medium px-3 py-2 rounded-lg"
                            onClick={() => handleDeleteApproval(data.id)}
                          >
                            <FaTrash className="text-sm" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <FaClipboardCheck className="text-3xl text-gray-300" />
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
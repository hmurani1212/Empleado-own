import { Button, Typography, IconButton } from "@material-tailwind/react";
import React, { useEffect } from "react";
import useFormApproval from "../../ViewModel/FormApprovalViewModel/FormApprovalServices";
import { formatTimestamp } from "../../services/__formApprovalServices";
import { FaEye, FaFileSignature, FaClipboardList, FaUser } from "react-icons/fa";
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

const CustomForm = () => {
  const { mountCustomForm, gettingCustomForm, allCustomForm } =
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
  } = useCustomFormService();

  // Leave application hook for modal functionality
  const {
    leaveApplcationValue,
    handleApplicationChange,
    generateLeaveDays,
    handleLeaveTypeChange,
    handleHalfDayChange,
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

  useEffect(() => {
    // if(!mountCustomForm){
    gettingCustomForm();
    // }
  }, []);

  // Debug logging for form modal
  useEffect(() => {
    if (formModal.show) {
      console.log("Form modal opened:", formModal.formType, formModal.formData);
    }
  }, [formModal.show, formModal.formType, formModal.formData]);

  console.log("Data is coming", allCustomForm);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } },
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-4"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto customScroll">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
              <tr>
                {customHead?.map((head, i) => (
                  <th key={i} className="p-4 first:pl-6 last:pr-6 whitespace-nowrap">
                    <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {allCustomForm?.length > 0 ? (
                allCustomForm.map((data, index) => (
                  <motion.tr 
                    key={index}
                    variants={itemVariants}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="p-4 first:pl-6 text-xs text-center">
                        {index + 1}
                    
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <FaClipboardList className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        <Typography className="font-medium text-gray-900 text-sm font-poppins capitalize">
                          {formatFormLabel(data.form_name)}
                        </Typography>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs">
                          <FaUser />
                        </div>
                        <Typography className="text-sm font-medium text-gray-700 font-poppins capitalize">
                          {data.assigned_to}
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
                          className="flex items-center gap-2 text-amber-600 hover:bg-amber-50 normal-case font-medium px-3 py-2 rounded-lg"
                          onClick={() => viewAssignAF(data)}
                        >
                          <PiSignature className="text-lg" />
                          Assign AF
                        </Button>
                        <Button
                          variant="text"
                          className="flex items-center gap-2 text-blue-600 hover:bg-blue-50 normal-case font-medium px-3 py-2 rounded-lg"
                          onClick={() => handleViewForm(data)}
                        >
                          <PiEyeLight className="text-lg" />
                          View
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
                        <FaClipboardList className="text-3xl text-gray-300" />
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
          widthSize={500}
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
              {formModal.formType === "time_adjustment" && (
                <ViewOnlyCreateNewRequest
                  formValue={formValue}
                  handleChangeAdjustRequest={handleChangeAdjustRequest}
                />
              )}
              {formModal.formType === "leave" && (
                <ViewOnlyEmpLeaveApplication
                  leaveApplcationValue={leaveApplcationValue}
                  handleApplicationChange={handleApplicationChange}
                  generateLeaveDays={generateLeaveDays}
                  handleLeaveTypeChange={handleLeaveTypeChange}
                  handleHalfDayChange={handleHalfDayChange}
                />
              )}
              {formModal.formType === "loan" && (
                <ViewOnlyEmpLoanApplication
                  loanApplicationValue={loanApplicationValue}
                  handleApplicationChange={handleLoanApplicationChange}
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
          widthSize={600}
          title="View Form"
        />
      )}
    </motion.div>
  );
};

export default CustomForm;
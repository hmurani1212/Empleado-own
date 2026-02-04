import { Button, Typography } from "@material-tailwind/react";
import React, { useEffect } from "react";
import useFormApproval from "../../ViewModel/FormApprovalViewModel/FormApprovalServices";
import { formatTimestamp } from "../../services/__formApprovalServices";
import { FaEye, FaFileSignature } from "react-icons/fa";
import useCustomFormService from "../../ViewModel/FormApprovalViewModel/customFormService";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import ViewAssignAF from "./ViewAssignAF";
import ViewOnlyEmpLeaveApplication from "./ViewOnlyEmpLeaveApplication";
import ViewOnlyCreateNewRequest from "./ViewOnlyCreateNewRequest";
import ViewOnlyEmpLoanApplication from "./ViewOnlyEmpLoanApplication";
import useEmpLeaveApplication from "../../ViewModel/EmpViewModel/EmpApplicationViewModel/EmpLeaveApplicationServices";
import useNewAdjustRequest from "../../ViewModel/AttendanceViewModel/newAdjustRequest";
import useEmpLoanApplication from "../../ViewModel/EmpViewModel/EmpApplicationViewModel/EmpLoanApplicationServices";

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
    handleToggleLeaveApplication,
    addEmpLeaveApplication,
    handleApplicationChange,
    generateLeaveDays,
    handleLeaveTypeChange,
    handleHalfDayChange,
  } = useEmpLeaveApplication();

  // Time adjustment hook for modal functionality
  const { formValue, handleChangeAdjustRequest, handleNewTimeRequest } =
    useNewAdjustRequest();

  // Loan application hook for modal functionality
  const {
    loanApplicationValue,
    handleToggleLoanApplication,
    addEmpLoanApplication,
    handleApplicationChange: handleLoanApplicationChange,
  } = useEmpLoanApplication();

  const customHead = [
    "#",
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
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
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

  return (
    <>
      <div className="bg-white rounded-[10px] drop-shadow-md p-2">
        <div className="h-[calc(100vh-100px)] overflow-auto customScroll">
          <table className="w-full text-center">
            <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
              <tr>
                {customHead?.map((head, i) => (
                  <th key={i} className="bg-[#F8F9FA] p-4">
                    <Typography
                      // variant='small'
                      // color='blue-gray'
                      className="font-medium leading-none text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {allCustomForm?.map((data, index) => {
                const isLast = index === allCustomForm.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-[#F2F2F9]";

                return (
                  <tr key={index}>
                    <td className={classes}>
                      <Typography
                        // variant='small'
                        // color='blue-gray'
                        className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                      >
                        {index + 1}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography
                        // variant='small'
                        // color='blue-gray'
                        className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                      >
                        {formatFormLabel(data.form_name)}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography
                        // variant='small'
                        // color='blue-gray'
                        className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                      >
                        {data.assigned_to}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography
                        // variant='small'
                        // color='blue-gray'
                        className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                      >
                        {formatTimeStamp(data.entry_time)}
                      </Typography>
                    </td>

                    {/* Tooba */}
                    {/* In Actions, Assign AF & View */}
                    <td className={classes}>
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          className="capitalize font-medium text-[12px] bg-[#ffc107] p-2 flex items-center gap-1"
                          onClick={() => viewAssignAF(data)}
                        >
                          <span>
                            <FaFileSignature />
                          </span>
                          Assign AF
                        </Button>
                        <Button
                          className="capitalize font-medium text-[12px] bg-[#8bc9f8] p-2 flex items-center gap-1"
                          onClick={() => handleViewForm(data)}
                        >
                          <span>
                            <FaEye />
                          </span>
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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
            <>
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
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <label className="text-[#698592] text-[12px]">
                      Subject*
                    </label>
                    <input
                      className="w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none"
                      type="text"
                      name="subject"
                      placeholder="Subject"
                      disabled
                    />
                  </div>
                  <div className="flex-1 flex flex-col px-2 space-y-1">
                    <label className="text-[#698592] text-[12px]">
                      Application Body*
                    </label>
                    <textarea
                      rows="7"
                      className="text-[#333333] text-[12px] rounded-md py-[10px] px-[17px] border border-[#cccccc] outline-none resize-none"
                      placeholder="Application Detail"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[#698592] text-[12px]">
                      Leave From*
                    </label>
                    <input
                      className="w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none"
                      type="date"
                      name="leaveFrom"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[#698592] text-[12px]">
                      Leave Upto*
                    </label>
                    <input
                      className="w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none"
                      type="date"
                      name="leaveUpto"
                      disabled
                    />
                  </div>
                </div>
              )}
            </>
          }
          widthSize={600}
          title="View Form"
        />
      )}
    </>
  );
};

export default CustomForm;
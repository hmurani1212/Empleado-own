import {
  Button,
  MenuItem,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import React, { useEffect } from "react";
import useHire from "../../ViewModel/HireViewModel/HireServices";
import { FaEye } from "react-icons/fa";
import { Outlet, useLocation } from "react-router";
import { motion } from "framer-motion";
import RejectAppForm from "./RejectAppForm";
import AcceptForm from "./AcceptForm";
import AcceptanceConfirmationModal from "./AcceptanceConfirmationModal";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import ReInterview from "./ReInterview";
import useHire_2 from "../../ViewModel/HireViewModel2/hireServices_2";
import { formatTimestampToDate } from "../../services/__dateTimeServices";
const Interviewed = () => {
  const shortlistData = [
    "Applicant Name",
    "Applied For",
    "Applied Location",
    "Phone",
    "CV",
    "Interview Time",
    "Score",
    "Interview Rounds",
    "Action",
  ];

  // Helper function to calculate interview rounds progress
  const getInterviewRoundsProgress = (processStatus) => {
    if (!processStatus || typeof processStatus !== "object") {
      return "0/0";
    }

    // Get all rounds from process_status
    const allRounds = Object.keys(processStatus);
    const completedRounds = allRounds.filter(
      (round) => processStatus[round] === 1
    ).length;
    const totalRounds = allRounds.length;

    return totalRounds > 0 ? `${completedRounds}/${totalRounds}` : "0/0";
  };

  const {
    handleNavigateView,
    toggleMenuShare,
    openMenuShare,
    actionInterviewedMenu,
    handleInterviewItems,
    openDialogReject,
    handleActionReject,
    setOpenDialogReject,
    handleRejectApp,
    rejectValues,
    handleChangeShortlist,
    reInterviewData,
    openReInterview,
    setopenReInterview,
    handleReInterDialog,
    handleChangeRound,
    viewAppId,
    handleReInterviewData,
    acceptDialog,
    handleAcceptDialog,
    setAcceptDialog,
    handleAcceptApp,
    acceptValues,
    acceptFormErrors,
    vacRounds,
    acceptanceConfirmationDialog,
    handleAcceptanceConfirmationDialog,
    acceptedApplicantData,
    handleSendAcceptanceLetter,
    handleCloseAcceptanceConfirmation,
  } = useHire();

  const { get_applicants_data } = useHire_2();
  const location = useLocation();
  // console.log("get_applicants_data", get_applicants_data);
  return (
    <>
      <div className="flex flex-col gap-3">
        {location.pathname.includes("view_detail") ? (
          <div className="pt-[12px] px-[30px]">
            <Outlet />
          </div>
        ) : (
          <div className="bg-white rounded-[10px] drop-shadow-md p-2">
            <div className="min-h-[calc(100vh-100px)] overflow-auto customScroll">
              <table className="w-full text-center">
                <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
                  <tr>
                    {shortlistData?.map((head, i) => (
                      <th key={i} className="bg-[#F8F9FA] p-4">
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-medium leading-none text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {get_applicants_data?.length > 0 ? (
                    get_applicants_data?.map((hire, index) => {
                      const isLast = index === get_applicants_data.length - 1;
                      const classes = isLast
                        ? "p-4"
                        : "p-4 border-b border-[#F2F2F9]";

                      return (
                        <tr key={index}>
                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal cursor-pointer text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <img
                                  className="rounded-full w-[35px] h-[35px] object-cover"
                                  src={hire?.candidate?.photo}
                                />
                                <span
                                  className="text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                                  onClick={() => handleNavigateView(hire)}
                                >
                                  {hire?.candidate?.name}
                                </span>
                              </div>
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                            >
                              {hire?.vacancy?.title}
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                            >
                              {hire?.city?.city_name || "none"}
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                            >
                              {hire?.candidate?.cellnum}
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                            >
                              <a
                                href={hire?.candidate?.cv_file_path}
                                target="_blank"
                              >
                                <FaEye className="text-[#3DA5F4] text-[20px]" />
                              </a>
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                            >
                              {formatTimestampToDate(hire?.interview_time) ||
                                "Not scheduled"}
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                            >
                              {hire.interview_score !== null
                                ? hire.interview_score
                                : "Not scored"}
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                            >
                              {getInterviewRoundsProgress(hire?.process_status)}
                            </Typography>
                          </td>

                          {/* Tooba */}
                          {/* In Action Drop down Accept is not implemented */}
                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                            >
                              <td>
                                <div
                                  onMouseEnter={() =>
                                    toggleMenuShare(index, true)
                                  }
                                  onMouseLeave={() =>
                                    toggleMenuShare(index, false)
                                  }
                                  className="relative flex items-center justify-center"
                                >
                                  <Button
                                    className="flex items-center gap-2 capitalize font-normal text-[clamp(10px,0.9vw,12px)] bg-[#EFF8FF] border border-[#3da5f4] text-[#3da5f4] px-[10px] py-[5px]"
                                    variant="outlined"
                                  >
                                    Action
                                  </Button>
                                  {openMenuShare[index] && (
                                    <div
                                      className={`border border-gray-200 rounded-lg absolute z-30 bg-white left-[-95px] w-[200px] shadow-md ${
                                        index <= 5 ? "top-full" : "bottom-full"
                                      }`}
                                    >
                                      <motion.div
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 50 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <ul className="flex flex-col w-full gap-1">
                                          {actionInterviewedMenu.map(
                                            (menuItem) => (
                                              <MenuItem
                                                className="flex items-center justify-between bg-[#F2F9FF] m-[3px] text-[#3DA5F4]"
                                                key={menuItem.id}
                                                onClick={() =>
                                                  handleInterviewItems(
                                                    menuItem.id,
                                                    hire
                                                  )
                                                }
                                              >
                                                <Typography variant="small">
                                                  {menuItem.title}
                                                </Typography>
                                              </MenuItem>
                                            )
                                          )}
                                        </ul>
                                      </motion.div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </Typography>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center py-4">
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        >
                          Interviewd not found
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
                <CustomDialog
                  openDialog={openDialogReject}
                  handleOpenDialog={handleActionReject}
                  handleOpen={() => setOpenDialogReject(false)}
                  handleConfirm={handleRejectApp}
                  title={"Reject Application"}
                  compo={
                    <RejectAppForm
                      rejectValues={rejectValues}
                      handleChangeShortlist={handleChangeShortlist}
                    />
                  }
                  showBtns={true}
                />

                <CustomDialog
                  openDialog={openReInterview}
                  handleOpenDialog={handleReInterDialog}
                  handleOpen={() => setopenReInterview(false)}
                  handleConfirm={handleReInterviewData}
                  title={"Shortlist"}
                  compo={
                    <ReInterview
                      viewAppId={viewAppId}
                      reInterviewData={reInterviewData}
                      handleChangeShortlist={handleChangeShortlist}
                      handleChangeRound={handleChangeRound}
                    />
                  }
                  showBtns={true}
                />

                <CustomDialog
                  openDialog={acceptDialog}
                  handleOpenDialog={handleAcceptDialog}
                  handleOpen={() => setAcceptDialog(false)}
                  handleConfirm={handleAcceptApp}
                  title={"Accept Application"}
                  compo={
                    <AcceptForm
                      acceptValues={acceptValues}
                      handleChangeShortlist={handleChangeShortlist}
                      errors={acceptFormErrors}
                      processStatus={
                        get_applicants_data?.find((app) => app.id === viewAppId)
                          ?.process_status
                      }
                      handleReInterDialog={handleReInterDialog}
                      setopenReInterview={setopenReInterview}
                      setAcceptDialog={setAcceptDialog}
                    />
                  }
                  showBtns={true}
                />
                <AcceptanceConfirmationModal
                  openDialog={acceptanceConfirmationDialog}
                  handleOpenDialog={handleAcceptanceConfirmationDialog}
                  applicantData={acceptedApplicantData}
                  onSend={handleSendAcceptanceLetter}
                  onClose={handleCloseAcceptanceConfirmation}
                  get_applicants_data={get_applicants_data}
                />
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Interviewed;
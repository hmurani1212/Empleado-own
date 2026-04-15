import {
  Button,
  MenuItem,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import React from "react";
import useHire from "../../ViewModel/HireViewModel/HireServices";
import { FaEye } from "react-icons/fa";
import { Outlet, useLocation } from "react-router";
import { motion } from "framer-motion";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import ShortlistForm from "./ShortlistForm";
import RejectAppForm from "./RejectAppForm";
import ShortlistTemplateModal from "./ShortlistTemplateModal";
// import { TiStarFullOutline } from "react-icons/ti"; // Star by name — hidden for now
import TalentPoolForm from "./TalentPoolForm";
import useHire_2 from "../../ViewModel/HireViewModel2/hireServices_2";
import { formatTimestamp } from "../Branches/utils";
import { Link } from "react-router-dom";
import useStore from "../../Store/store";
import { ApplicantsTableSkeleton } from "./HireSkeletons";

const Applicants = (data) => {
  const {
    allPendingApp,
    hanldeActionsItems,
    handleActionShortlist,
    addToShortlist,
    setOpenDialogShortlist,
    handleNavigateView,
    toggleMenuShare,
    openMenuShare,
    actionHireMenu,
    openDialogShortlist,
    addShortlistValues,
    handleChangeShortlist,
    handleChangeRound,
    openDialogReject,
    setOpenDialogReject,
    handleActionReject,
    rejectValues,
    handleRejectApp,
    // handleStarClick,
    // starred,
    // starredIndexes,
    openTalentPool,
    setOpenTalentPool,
    handleActionTalentPool,
    // starredIndex,
    handleAddTalentPool,
    addTalentPoolValues,
    shortlistTemplateDialog,
    handleShortlistTemplateDialog,
    shortlistedApplicantData,
    handleSendShortlistTemplate,
    handleCloseShortlistTemplate,
  } = useHire();

  const { get_applicants_data } = useHire_2();
  const allApplicantsLoading = useStore((state) => state.allApplicantsLoading);

  const applicantsData = [
    "Applicant Name",
    "Apply For",
    "City",
    "Applied Location",
    "CV",
    "Gender",
    "Age",
    "Apply Date",
    "Action",
  ];
  const location = useLocation();
  return (
    <>
      {location.pathname.includes("view_detail") ? (
        <div className="pt-[12px] px-[30px]">
          <Outlet />
        </div>
      ) : (
        <div className="px-2 flex flex-col gap-3 bg-white rounded-[10px] drop-shadow-md p-2">
          <div className="min-h-[calc(100vh-100px)] overflow-auto customScroll">
            <table className="w-full text-left">
              <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
                <tr>
                  {applicantsData?.map((head, i) => (
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
                {allApplicantsLoading ? (
                  <ApplicantsTableSkeleton rows={8} colCount={9} />
                ) : get_applicants_data?.length > 0 ? (
                  get_applicants_data?.map((hire, index) => {
                    const isLast = index === allPendingApp.length - 1;
                    const classes = isLast
                      ? "p-4"
                      : "p-4 border-b border-[#F2F2F9]";

                    return (
                      <tr key={index}>
                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] capitalize relative"
                          >
                            <div className="flex items-center justify-left gap-2">
                              <img
                                className="rounded-full w-[35px] h-[35px] object-cover"
                                src={hire?.candidate?.photo}
                              />
                              <span
                                className="text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] capitalize"
                                onClick={() => handleNavigateView(hire)}
                              >
                                {hire?.candidate?.name}
                              </span>
                            </div>
                            {/* Star next to applicant name — temporarily hidden
                            <motion.span
                              whileHover={{ scale: 1.5 }}
                              className={`absolute top-0 left-[-7px]`}
                              onClick={() => handleStarClick(hire, index)}
                              style={{
                                color: hire.status === "5" ? "yellow" : "gray",
                              }}
                            >
                              <TiStarFullOutline className="text-[18px]" />
                            </motion.span>
                            */}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {hire.vacancy?.title}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {hire.candidate?.permanent_address}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {hire?.city?.city_name || "Remote"}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {/* {hire?.candidate?.cv_file_path} */}
                            <Link
                              to={hire?.candidate?.cv_file_path}
                              target="_blank"
                            >
                              <FaEye className="text-[#3DA5F4] text-[20px]" />
                            </Link>
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {hire?.candidate.gender == 0
                              ? "Female"
                              : hire?.candidate?.gender == 1
                              ? "Male"
                              : "Other"}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {hire?.candidate?.age}
                          </Typography>
                        </td>

                        <td className={classes}>
                          <Typography
                            // variant="small"
                            // color="blue-gray"
                            className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                          >
                            {formatTimestamp(hire?.timestamp)}
                          </Typography>
                        </td>

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
                                    className={`border border-gray-200 rounded-lg absolute z-[99999] bg-white w-[200px] left-[-100px] shadow-lg mt-0 ${index <= 5 ? "top-full" : "bottom-full"}`}
                                  >
                                    <motion.div
                                      initial={{ opacity: 0, y: 50 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: 50 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <ul className="flex flex-col w-full gap-1">
                                        {actionHireMenu.map((menuItem) => (
                                          <MenuItem
                                            className="flex items-center justify-between bg-[#F2F9FF] m-[3px] text-[#3DA5F4]"
                                            key={menuItem.id}
                                            onClick={() =>
                                              hanldeActionsItems(
                                                menuItem.id,
                                                hire
                                              )
                                            }
                                          >
                                            <Typography variant="small">
                                              {menuItem.title}
                                            </Typography>
                                          </MenuItem>
                                        ))}
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
                        Application not found
                      </Typography>
                    </td>
                  </tr>
                )}
              </tbody>

              <CustomDialog
                openDialog={openDialogShortlist}
                handleOpenDialog={handleActionShortlist}
                handleOpen={() => setOpenDialogShortlist(false)}
                handleConfirm={addToShortlist}
                title={"Shortlist"}
                compo={
                  <ShortlistForm
                    addShortlistValues={addShortlistValues}
                    handleChangeShortlist={handleChangeShortlist}
                    handleChangeRound={handleChangeRound}
                  />
                }
                showBtns={true}
              />

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
                openDialog={openTalentPool}
                handleOpenDialog={handleActionTalentPool}
                handleOpen={() => setOpenTalentPool(false)}
                handleConfirm={handleAddTalentPool}
                title={"Talent Pool"}
                compo={
                  <TalentPoolForm
                    addTalentPoolValues={addTalentPoolValues}
                    handleChangeShortlist={handleChangeShortlist}
                  />
                }
                showBtns={true}
              />

              <ShortlistTemplateModal
                openDialog={shortlistTemplateDialog}
                handleOpenDialog={handleShortlistTemplateDialog}
                applicantData={shortlistedApplicantData}
                onSend={handleSendShortlistTemplate}
                onClose={handleCloseShortlistTemplate}
              />
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default Applicants;
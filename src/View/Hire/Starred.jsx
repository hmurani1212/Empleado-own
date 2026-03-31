import {
  Button,
  MenuItem,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import React from "react";
import { motion } from "framer-motion";
import useHire from "../../ViewModel/HireViewModel/HireServices";
import { Outlet, useLocation } from "react-router";
import { TiStarFullOutline } from "react-icons/ti";
import { FaEye } from "react-icons/fa";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import ShortlistForm from "./ShortlistForm";
import RejectAppForm from "./RejectAppForm";
import ShortlistTemplateModal from "./ShortlistTemplateModal";
import useHire_2 from "../../ViewModel/HireViewModel2/hireServices_2";
import { formatTimestamp } from "../Branches/utils";
const Starred = () => {
  const {
    allStarredApp,
    handleNavigateView,
    toggleMenuShare,
    hanldeActionsItems,
    openMenuShare,
    actionHireMenu,
    addShortlistValues,
    handleChangeShortlist,
    handleChangeRound,
    openDialogReject,
    setOpenDialogReject,
    handleActionReject,
    rejectValues,
    handleRejectApp,
    openDialogShortlist,
    handleStarClick,
    handleActionShortlist,
    setOpenDialogShortlist,
    addToShortlist,
    shortlistTemplateDialog,
    handleShortlistTemplateDialog,
    shortlistedApplicantData,
    handleSendShortlistTemplate,
    handleCloseShortlistTemplate,
  } = useHire();
  const { get_applicants_data } = useHire_2();

  const applicantsData = [
    "Applicant Name",
    "Apply For",
    "City",
    "Applied Location",
    "CV",
    "Gender",
    "Age",
    "Apply Data",
    "Action",
  ];
  const location = useLocation();
  get_applicants_data.map((data) => {
    console.log("data", data?.candidate?.name);
  });
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
                  {get_applicants_data.length > 0 ? (
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
                              className="font-normal cursor-pointer text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize relative"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <img
                                  className="rounded-full w-[35px] h-[35px] object-cover"
                                  src={
                                    hire?.candidate?.photo ||
                                    "/assets/images/user.png"
                                  }
                                />
                                <span
                                  className="  text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                                  onClick={() => handleNavigateView(hire)}
                                >
                                  {hire?.candidate?.name || "No Name Provided"}
                                </span>
                              </div>

                              <motion.span
                                whileHover={{ scale: 1.5 }}
                                className={`absolute top-0 left-[-7px] ${
                                  hire.status === "5"
                                    ? "text-yellow-500"
                                    : "text-gray-500"
                                }`}
                                onClick={() => handleStarClick(hire, index)}
                              >
                                <TiStarFullOutline className="text-[18px]" />
                              </motion.span>
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
                              {hire?.city?.city_name || "Remote"}
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
                              <a
                                href={hire?.candidate?.cv_name}
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
                                              // onClick={() => handleMenuItemsHire(menuItem.id, hire)}
                                            >
                                              <Typography variant="small">
                                                {menuItem.title}
                                              </Typography>
                                              {/* <span>{menuItem.icon}</span> */}
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
                          Starred not found
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
      </div>
    </>
  );
};

export default Starred;
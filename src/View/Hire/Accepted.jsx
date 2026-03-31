import {
  Option,
  Select,
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import React, { useState } from "react";
import useHire from "../../ViewModel/HireViewModel/HireServices";
import useHire_2 from "../../ViewModel/HireViewModel2/hireServices_2";
import { FaEye, FaEllipsisV, FaEnvelope, FaUser } from "react-icons/fa";
import { Outlet, useLocation, useNavigate } from "react-router";
import AcceptanceConfirmationModal from "./AcceptanceConfirmationModal";

const Accepted = () => {
  const { handleNavigateView } = useHire();
  const { get_applicants_data } = useHire_2();
  const accpetData = [
    "Candidate",
    "Applied For",
    "Applied Location",
    "Phone",
    "CV",
    "Profile",
  ];
  const location = useLocation();
  const navigate = useNavigate();

  // console.log("Accepted Applicants Data:", get_applicants_data);

  // State for acceptance confirmation modal
  const [acceptanceModalOpen, setAcceptanceModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // Handler functions
  const handleSendEmail = (applicant) => {
    setSelectedApplicant(applicant);
    setAcceptanceModalOpen(true);
  };

  const handleViewAppData = (applicant) => {
    navigate(
      `/hire/vacancies_list/all_applicants/0/applicant/view_detail/${applicant.id}`
    );
  };

  const handleCloseAcceptanceModal = () => {
    setAcceptanceModalOpen(false);
    setSelectedApplicant(null);
  };

  const handleSendAcceptanceLetter = (formData) => {
    ////console.log('Sending acceptance letter for:', selectedApplicant?.candidate?.name, formData)
    setAcceptanceModalOpen(false);
    setSelectedApplicant(null);
  };

  return (
    <>
      <div className=" flex flex-col gap-3">
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
                    {accpetData?.map((head, i) => (
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
                                <span>
                                  <img
                                    className="rounded-full w-[35px] h-[35px] object-cover"
                                    src={hire?.candidate?.photo}
                                  />
                                </span>
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
                              {hire?.city?.city_name || "Remote"}
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

                          {/* <td className={classes}> */}
                          {/* <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-normal"
                        > */}

                          {/* view */}
                          {/* {hire.app_submission_time} */}
                          {/* </Typography> */}
                          {/* </td> */}

                          <td className={classes}>
                            <Menu>
                              <MenuHandler>
                                <Button
                                  variant="text"
                                  size="sm"
                                  className="p-1"
                                >
                                  <FaEllipsisV className="h-4 w-4" />
                                </Button>
                              </MenuHandler>
                              <MenuList>
                                <MenuItem
                                  onClick={() => handleSendEmail(hire)}
                                  className="flex items-center justify-center gap-2"
                                >
                                  <FaEnvelope className="h-4 w-4" />
                                  Send Email
                                </MenuItem>
                                <MenuItem
                                  onClick={() => handleViewAppData(hire)}
                                  className="flex items-center gap-2"
                                >
                                  <FaUser className="h-4 w-4" />
                                  App Data
                                </MenuItem>
                              </MenuList>
                            </Menu>
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
                          Accepted not found
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Acceptance Confirmation Modal */}
        <AcceptanceConfirmationModal
          openDialog={acceptanceModalOpen}
          handleOpenDialog={() => setAcceptanceModalOpen(!acceptanceModalOpen)}
          //// populateData={get_applicants_data}
          applicantData={selectedApplicant}
          vacancyId={selectedApplicant?.vacancy?.id}
          onSend={handleSendAcceptanceLetter}
          onClose={handleCloseAcceptanceModal}
        />
      </div>
    </>
  );
};

export default Accepted;
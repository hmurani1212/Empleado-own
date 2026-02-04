import {
  Accordion,
  AccordionBody,
  AccordionHeader,
} from "@material-tailwind/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ApplyHistory = (props) => {
  const { viewPending } = props;
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);

  const handleOpen = (value) => setOpen(open === value ? null : value);

  // Function to get status text based on status number
  const getStatusText = (status) => {
    switch (status) {
      case 0:
        return "Rejected";
      case 1:
        return "Shortlisted";
      case 2:
        return "Interview";
      case 3:
        return "Accepted";
      case 4:
        return "Pending";
      case 5:
        return "Starred";
      default:
        return "Unknown";
    }
  };

  // Function to handle application click based on status
  const handleApplicationClick = (item) => {
    // Get vacancy ID and app ID from the main viewPending data
    const vacancyId = viewPending?.vacancy?.id;
    const appId = item.application_id || viewPending?.answers?.[0]?.app_id;
    console.log("itemitem", item.status === "Rejected");
    // Convert status string to number for routing
    let statusNumber = 4; // Default to pending
    if (item.status === "Rejected") statusNumber = 0;
    else if (item.status === "Shortlisted") statusNumber = 1;
    else if (item.status === "Interview") statusNumber = 2;
    else if (item.status === "Accepted") statusNumber = 3;
    else if (item.status === "Pending") statusNumber = 4;
    else if (item.status === "Starred") statusNumber = 5;

    switch (statusNumber) {
      // console.log("")
      case 0: // Rejected
        // console.log("yes this is true");
        //  navigate(
        //   `http://localhost:3000/`
        // );
        navigate(
          `/hire/vacancies_list/all_applicants/${vacancyId}/rejected`
        );
        break;
      case 1: // Shortlisted
        navigate(
          `/hire/vacancies_list/all_applicants/${vacancyId}/shortlisted`
        );
        break;
      case 2: // Interview
        navigate(
          `/hire/vacancies_list/all_applicants/${vacancyId}/interviewed`
        );
        break;
      case 3: // Accepted
        navigate(
          `/hire/vacancies_list/all_applicants/${vacancyId}/accepted`
        );
        break;
      case 4: // Pending - use applicant route since there's no pending route
        navigate(
          `/hire/vacancies_list/all_applicants/${vacancyId}/applicant`
        );
        break;
      case 5: // Starred
        navigate(
          `/hire/vacancies_list/all_applicants/${vacancyId}/starred/view_detail/${appId}`
        );
        break;
      default:
        // Default to applicant route if status is unknown
        navigate(
          `/`
        );
        break;
    }
  };

  return (
    <div className="p-4">
      {viewPending?.app_history?.map((item, index) => (
        <Accordion
          key={index}
          open={open === index}
          className="mb-2 rounded-lg border border-blue-gray-100"
        >
          <AccordionHeader
            onClick={() => handleOpen(index)}
            className="text-[14px] rounded-lg border-b-0 bg-[#F8F9FF]"
          >
            <span className="px-4">{item.vacancy_name}</span>
          </AccordionHeader>
          <AccordionBody>
            <div className="grid grid-cols-3 px-[10px]">
              <div className="text-[12px] font-semibold">
                <div className="mt-3">
                  <span>Post</span>
                </div>
                <div className="mt-3">
                  <span>Date</span>
                </div>
                <div className="mt-3">
                  <span>Status</span>
                </div>
                <div className="mt-3">
                  <span>Application</span>
                </div>
              </div>
              <div className="col-span-2 text-[12px]">
                <div className="mt-3">
                  <span>{item.vacancy_name}</span>
                </div>
                <div className="mt-3">
                  <span>{item.post_date}</span>
                </div>
                <div className="mt-3">
                  <span>{item.status}</span>
                </div>
                <div className="mt-3">
                  <span
                    className="text-blue-600 cursor-pointer hover:text-blue-800 underline"
                    onClick={() => handleApplicationClick(item)}
                  >
                    Open Application
                  </span>
                </div>
              </div>
            </div>
          </AccordionBody>
        </Accordion>
      ))}
    </div>
  );
};

export default ApplyHistory;

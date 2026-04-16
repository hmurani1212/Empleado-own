import { Button, Option, Select } from "@material-tailwind/react";
import React, { useEffect, useState } from "react";
import useHire from "../../ViewModel/HireViewModel/HireServices";
import useHire_2 from "../../ViewModel/HireViewModel2/hireServices_2";
import {
  NavLink,
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
// import { Link } from "react-router-dom";
import { motion } from "framer-motion";
// import { Link } from "react-router-dom";

import { getUserData } from "../../Authentication/jwt_decode";
import CustomButton from "../../Components/CustomButton/CustomButton";
const AllApplicants = () => {
  const {
    handleBackVacancies,
    allApplicantsMenu,
    get_record,
    get_rejected_app, allVacanciesList_data,
    getVacanciesWithFilters,
  } = useHire();

  const {
    get_vacanc_filter,
    get_vacanc_filter_data,
    get_allApplicants,
  } = useHire_2();



  const location = useLocation();
  const navigate = useNavigate();
  const { vacancyId } = useParams();

  const [filters, setFilters] = useState({
    gender: "",
    vacancy_id: "",
    status: "4", // Default to pending status
  });

  const genderLabelFromCode = (g) => {
    if (g === "1" || g === 1) return "Male";
    if (g === "0" || g === 0) return "Female";
    if (g === "2" || g === 2) return "Other";
    return "";
  };

  const rejectedRequestPayload = (f) => {
    const payload = {};
    // const vid = f.vacancy_id || (vacancyId && vacancyId !== "0" ? vacancyId : "");
    // if (vid) payload.vacancy_id = vid;
    if (f.vacancy_id !== undefined && f.vacancy_id !== null && f.vacancy_id !== "")
      payload.vacancy_id = f.vacancy_id;
    if (f.gender !== undefined && f.gender !== null && f.gender !== "")
      payload.gender = f.gender;
    return payload;
  };

  const handleFilterChange = (type, value) => {
    const newFilters = {
      ...filters,
      [type]: value ?? "",
    };
  
    setFilters(newFilters);
  
    const currentPath = location.pathname;
  
    if (currentPath.includes("/rejected")) {
      get_rejected_app(rejectedRequestPayload(newFilters));
      return;
    }
  
    let status = newFilters.status;
    let locationName = "Applicants";
  
    if (currentPath.includes("/starred")) {
      status = "5";
      locationName = "Starred";
    } else if (currentPath.includes("/shortlisted")) {
      status = "1";
      locationName = "Shortlisted";
    } else if (currentPath.includes("/interviewed")) {
      status = "2";
      locationName = "Interviewed";
    } else if (currentPath.includes("/accepted")) {
      status = "3";
      locationName = "Accepted";
    }
  
    get_allApplicants(vacancyId, newFilters, status, locationName);
  };
  // const handleFilterChange = (type, value) => {
  //   const newFilters = { ...filters };

  //   console.log("newFilters", newFilters);
  //   console.log("value", value);
  //   console.log("type", type);

  //   switch (type) {
  //     case "gender":
  //       newFilters.gender = String(value) ?? "";
  //       break;
  //     case "vacancy_id":
  //       newFilters.vacancy_id = String(value) ?? "";
  //       break;
  //     case "status":
  //       newFilters.status = value;
  //       break;
  //     default:
  //       break;
  //   }

  //   setFilters((prev) => ({
  //     ...prev,
  //     [type]: value ?? "",
  //   }));
  //   // Apply filters with current status and location
  //   const currentPath = location.pathname;
  //   let currentStatus = newFilters.status;
  //   let currentLocation = "Applicants";

  //   if (currentPath.includes("/starred")) {
  //     currentStatus = "5";
  //     currentLocation = "Starred";
  //   } else if (currentPath.includes("/shortlisted")) {
  //     currentStatus = "1";
  //     currentLocation = "Shortlisted";
  //   } else if (currentPath.includes("/interviewed")) {
  //     currentStatus = "2";
  //     currentLocation = "Interviewed";
  //   } else if (currentPath.includes("/accepted")) {
  //     currentStatus = "3";
  //     currentLocation = "Accepted";
  //   } else if (currentPath.includes("/rejected")) {
  //     get_rejected_app(rejectedRequestPayload(newFilters));
  //     return;
  //   } else {
  //     currentStatus = "4";
  //     currentLocation = "Applicants";
  //   };

  //   get_allApplicants(vacancyId, newFilters, currentStatus, currentLocation);
  //   // Removed get_record() call - no need to refresh counts when filters change
  // };

  const handleApplicationClick = (e, link, id, ele) => {
    e.preventDefault();
    navigate(link);

    // If clicking on Rejected (id = 6), use the rejected endpoint
    if (id === 6) {
      get_rejected_app(rejectedRequestPayload(filters));
      return;
    }

    // For all other cases, use the existing logic
    let status = null;
    let location = null;
    switch (id) {
      case 1: // Applicants
        status = "4"; // pending
        location = "Applicants";
        break;
      case 2: // Starred
        status = "5";
        location = "Starred";
        break;
      case 3: // Shortlisted
        status = "1";
        location = "Shortlisted";
        break;
      case 4: // Interviewed
        status = "2";
        location = "Interviewed";
        break;
      case 5: // Accepted
        status = "3";
        location = "Accepted";
        break;
      default:
        break;
    }

    // Only call get_allApplicants if it's not the rejected tab
    if (status !== null) {
      get_allApplicants(vacancyId, { ...filters, status }, status, location);
      // Removed get_record() call - no need to refresh counts when navigating between tabs
    }
  };

  useEffect(() => {
    get_vacanc_filter();

    // Determine the correct status based on the current path
    let initialStatus = "4"; // Default to Applicants
    let initialLocation = "Applicants";

    if (location.pathname.includes("/rejected")) {
      get_rejected_app(rejectedRequestPayload(filters));
      return;
    } else if (location.pathname.includes("/accepted")) {
      initialStatus = "3";
      initialLocation = "Accepted";
    } else if (location.pathname.includes("/interviewed")) {
      initialStatus = "2";
      initialLocation = "Interviewed";
    } else if (location.pathname.includes("/shortlisted")) {
      initialStatus = "1";
      initialLocation = "Shortlisted";
    } else if (location.pathname.includes("/starred")) {
      initialStatus = "5";
      initialLocation = "Starred";
    }

    get_allApplicants(
      vacancyId,
      { ...filters, status: initialStatus },
      initialStatus,
      initialLocation
    );
    get_record(); // Fetch application counts
  }, []);

  const token_data = getUserData();

  let org_id;
  if (token_data !== undefined) {
    org_id = token_data?.org_id
  } else {
    org_id = 123
  }
  const jwt = localStorage.getItem("jwt");
  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Top Actions */}
        <div className="flex justify-end gap-3">
          <CustomButton
            className="bg-[#8bc9f8] capitalize p-2 font-medium shadow-sm"
            title="Back"
            onClick={handleBackVacancies}
          />
          <Link to={`https://hiring.veevotech.com/company/${org_id}/veevo-tech`} target="_blank">
            <Button className="bg-[#0ACF97] capitalize p-3 font-medium shadow-sm cursor-pointer">
              Career Page
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          {/* Sub Navigation */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-5 px-3 py-2">
            {allApplicantsMenu.map((ele) => (
              <NavLink
                key={ele.id}
                className={`${
                  location.pathname === ele.link
                    ? "text-white"
                    : "hover:text-[#474747]/60 text-[#474747]"
                } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition focus-visible:outline-2`}
                style={{ WebkitTapHighlightColor: "transparent" }}
                onClick={(e) =>
                  handleApplicationClick(e, ele.link, ele.id, ele.vacancyId)
                }
              >
                {location.pathname === ele.link && (
                  <motion.span
                    layoutId="bubble"
                    className="absolute inset-0 z-10 bg-[#8bc9f8]"
                    style={{ borderRadius: 9999 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative flex cursor-pointer text-[14px] z-20">
                  {ele.title}
                  <span className="text-[10px] pt-[2px] ml-[4px]">{`(${ele.allcount})`}</span>
                </span>
              </NavLink>
            ))}
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-soft p-4 border border-gray-100">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">Filter by Jobs</label>
                <Select
                  labelProps={{ className: "hidden" }}
                  color="blue"
                  className="bg-white text-[12px] font-Urbanist font-medium px-2 text-gray-400 w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                  value={get_vacanc_filter_data?.length ? filters.vacancy_id : ""}
                  selected={(element) => {
                    const selected = get_vacanc_filter_data?.find(
                      (item) => String(item.id) === String(filters.vacancy_id)
                    );
                    return selected?.title || "All Applicants";
                  }}
                  onChange={(value) => handleFilterChange("vacancy_id", value)}
                >
                  <Option value="">All Applicants</Option>
                  {get_vacanc_filter_data?.map((item, index) => (
                    <Option key={index} value={String(item.id)}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">Filter by Gender</label>
                <Select
                  labelProps={{ className: "hidden" }}
                  color="blue"
                  className="bg-white text-[12px] font-Urbanist font-medium px-2 text-gray-400 w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                  value={filters.gender}
                  onChange={(value) => handleFilterChange("gender", value)}
                >
                  <Option value="">All</Option>
                  <Option value="1">Male</Option>
                  <Option value="0">Female</Option>
                  <Option value="2">Other</Option>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default AllApplicants;

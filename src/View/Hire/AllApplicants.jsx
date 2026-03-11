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
    get_city,
    get_city_data,
    get_allApplicants,
  } = useHire_2();



  const location = useLocation();
  const navigate = useNavigate();
  const { vacancyId } = useParams();

  const [filters, setFilters] = useState({
    gender: "",
    city: "",
    vacancy_id: "",
    status: "4", // Default to pending status
  });

  const handleFilterChange = (type, value) => {
    const newFilters = { ...filters };

    switch (type) {
      case "gender":
        newFilters.gender =
          value === "Male" ? "1" : value === "Female" ? "0" : "2";
        break;
      case "city":
        newFilters.city = value;
        break;
      case "vacancy":
        newFilters.vacancy_id = value;
        break;
      case "status":
        newFilters.status = value;
        break;
      default:
        break;
    }

    setFilters(newFilters);
    // Apply filters with current status and location
    const currentPath = location.pathname;
    let currentStatus = newFilters.status;
    let currentLocation = "Applicants";

    if (currentPath.includes("/starred")) {
      currentStatus = "5";
      currentLocation = "Starred";
    } else if (currentPath.includes("/shortlisted")) {
      currentStatus = "1";
      currentLocation = "Shortlisted";
    } else if (currentPath.includes("/interviewed")) {
      currentStatus = "2";
      currentLocation = "Interviewed";
    } else if (currentPath.includes("/accepted")) {
      currentStatus = "3";
      currentLocation = "Accepted";
    } else if (currentPath.includes("/rejected")) {
      // Don't apply filters for rejected as it uses a different endpoint
      return;
    } else {
      currentStatus = "4";
      currentLocation = "Applicants";
    };

    get_allApplicants(vacancyId, newFilters, currentStatus, currentLocation);
    // Removed get_record() call - no need to refresh counts when filters change
  };

  const handleApplicationClick = (e, link, id, ele) => {
    e.preventDefault();
    navigate(link);

    // If clicking on Rejected (id = 6), use the rejected endpoint
    if (id === 6) {
      // Using a static app_id as requested in the previous conversation
      get_rejected_app("10824961");
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
    // Initial load of data
    get_vacanc_filter();
    get_city();

    // Determine the correct status based on the current path
    let initialStatus = "4"; // Default to Applicants
    let initialLocation = "Applicants";

    if (location.pathname.includes("/rejected")) {
      get_rejected_app("10824961");
      return; // Exit early for rejected
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

  console.log('what is the testttt', token_data)

  let org_id;
  if (token_data !== undefined) {
    org_id = token_data?.org_id
  } else {
    org_id = 123
  }
  const jwt = localStorage.getItem("jwt");
  return (
    <>
      <div className="pl-2 flex flex-col gap-3">
        <div className="flex justify-end mt-[40px] gap-4">
          <CustomButton className="bg-[#8bc9f8]" title="Back" onClick={handleBackVacancies}>
            Back
          </CustomButton>
          <Link to={`http://172.18.0.44:6180?token=${jwt}`} target="_blank">
            <Button className="bg-[#0ACF97] capitalize p-3  font-medium">
              Career Page
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-2 pb-3 mt-[20px]">
          <div className="flex justify-between items-center gap-5 px-3 py-5">
            <div className="flex items-center gap-5">
              {allApplicantsMenu.map((ele) => (
                <NavLink
                  key={ele.id}
                  className={`${location.pathname === ele.link
                    ? "text-white"
                    : "hover:text-[#474747]/60 text-[#474747]"
                    } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition focus-visible:outline-2`}
                  style={{
                    WebkitTapHighlightColor: "transparent",
                  }}
                  onClick={(e) =>
                    handleApplicationClick(e, ele.link, ele.id, ele.vacancyId)
                  }
                >
                  {location.pathname === ele.link && (
                    <motion.span
                      layoutId="bubble"
                      className="absolute inset-0 z-10 bg-[#8bc9f8]"
                      style={{ borderRadius: 9999 }}
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}
                  <span className="relative flex cursor-pointer text-[14px] z-20">
                    {ele.title}
                    <div className="text-[10px] pt-[2px] ml-[4px]">{`(${ele.allcount})`}</div>
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <Select
                  label="Filter by Jobs"
                  color="blue"
                  className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                  onChange={(value) => handleFilterChange("vacancy", value)}
                  disabled={location.pathname.includes("/rejected")}
                >
                  {get_vacanc_filter_data?.map((item, index) => (
                    <Option value={item.id} key={index}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Select
                  label="Filter by Gender"
                  color="blue"
                  className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                  onChange={(value) => handleFilterChange("gender", value)}
                  disabled={location.pathname.includes("/rejected")}
                >
                  <Option value="Male">Male</Option>
                  <Option value="Female">Female</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </div>

              <div>
                <Select
                  label="Filter by City"
                  color="blue"
                  className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                  onChange={(value) => handleFilterChange("city", value)}
                  disabled={location.pathname.includes("/rejected")}
                >
                  {get_city_data?.map((item, index) => (
                    <Option value={item.id} key={index}>
                      {item.city_name}
                    </Option>
                  ))}
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

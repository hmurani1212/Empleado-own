import { Button, Option, Select } from "@material-tailwind/react";
import React, { useEffect } from "react";
import useHire from "../../ViewModel/HireViewModel/HireServices";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  Link
} from "react-router-dom";
import { motion } from "framer-motion";
import { getUserData } from "../../Authentication/jwt_decode";
const AllApplicantsCardData = () => {
  const {
    handleBackVacancies,
    gettingAllShortlistedApp,
    gettingAllInterviewApp,
    ///gettingAcceptedApp,
    gettingRejectedApp,
    // gettingAllPendingApp,
    gettingStarredApp,
    allApplicantsMenuCards,
    allApplicantsMenu,
  } = useHire();

  const location = useLocation();
  const navigate = useNavigate();
  const { vacancyId } = useParams();
  const vacId = 0;
  const handleApplicationClick = (e, link, id) => {
    e.preventDefault();
    navigate(link);

    if (id === 1) {
      // gettingAllPendingApp(vacId);
    } else if (id === 2) {
      gettingStarredApp(vacId);
    } else if (id === 3) {
      gettingAllShortlistedApp(vacId);
    } else if (id === 4) {
      gettingAllInterviewApp(vacId);
    } else if (id === 5) {
      /// gettingAcceptedApp(vacId);
    } else if (id === 6) {
      gettingRejectedApp(vacId);
    }
  };

  const token_data = getUserData();
  // console.log('what is the testttt', token_data)

  let org_id;
  if (token_data !== undefined) {
    org_id = token_data?.org_id
  } else {
    org_id = 123
  }

  return (
    <>
      <div className="pl-2 flex flex-col gap-3">
        <div className="flex justify-end mt-[40px] gap-4">
          <Button className="bg-[#8bc9f8]" onClick={handleBackVacancies}>
            Back
          </Button>
          {/* <Link to={`http://172.18.0.44:8080/${org_id}`} target="_blank">
            <Button className="bg-[#0ACF97] capitalize p-2 font-medium">
              Career Page
            </Button>
            </Link> */}
        </div>

        <div className="flex flex-col gap-2 pb-3  bg-white rounded-lg drop-shadow mt-[20px]">
          <div className="flex justify-between items-center gap-5 px-3 py-5">
            <div className="flex items-center gap-5">
              {/* <h1>TEST1234</h1> */}
              {allApplicantsMenu.map((ele) => (
                <NavLink
                  key={ele.id}
                  className={`${location.pathname === ele.link
                    ? "text-white"
                    : "hover:text-black/60 text-black"
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
                    {ele.title}{" "}
                    <div className="text-[10px] pt-[2px] ml-[4px]">{`(${ele.allcount})`}</div>
                  </span>
                </NavLink>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between pl-2">
            <div className="flex items-center gap-3">
              <div>
                <Select label="Filter by Jobs" color="blue" className="h-9">
                  <Option>
                    {get_vacanc_filter_data?.length > 0
                      ? get_vacanc_filter_data[0]?.job_title
                      : "No Jobs Available"}
                  </Option>
                </Select>
              </div>

              <div>
                <Select label="Filter by Gender" color="blue" className="h-9">
                  <Option>Male</Option>
                  <Option>Female</Option>
                </Select>
              </div>

              <div>
                <Select label="Filter by City" color="blue" className="h-9">
                  <Option>1</Option>
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

export default AllApplicantsCardData;

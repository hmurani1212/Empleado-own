import { Button } from "@material-tailwind/react";
import React, { useEffect } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAttendance from "../../ViewModel/AttendanceViewModel/AttendanceServices";

const IndividualAttendance = () => {
  const {
    AttendanceNavTitles,
  } = useAttendance();

  const location = useLocation();
  const navigate = useNavigate();

  const handleNavLinksAttendance = (e, link, id) => {
    e.preventDefault();
    navigate(link);
  };

  return (
    <>
      <div className="flex flex-col gap-2 pb-3 rounded-[10px]">
        <div className="flex justify-between items-center gap-5 py-5">
          <div className="flex items-center gap-5 w-full flex-wrap">
            {AttendanceNavTitles.map((ele) => (
              <NavLink
                key={ele.id}
                className={`${
                  location.pathname === ele.link
                    ? "text-white"
                    : "hover:text-black/60 text-[#474747]"
                } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition focus-visible:outline-2`}
                style={{
                  WebkitTapHighlightColor: "transparent",
                }}
                onClick={(e) => handleNavLinksAttendance(e, ele.link, ele.id)}
              >
                {location.pathname === ele.link && (
                  <motion.span
                    layoutId="bubble"
                    className="absolute inset-0 z-10 bg-[#8bc9f8]"
                    style={{ borderRadius: 9999 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative cursor-pointer text-[14px] z-20 font-Urbanist">
                  {ele.title}
                </span>
              </NavLink>
            ))}
          </div>
        </div>

        <div>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default IndividualAttendance;
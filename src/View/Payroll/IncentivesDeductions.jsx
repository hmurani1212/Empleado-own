import React from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useManageEmpSalary from "../../ViewModel/PayrollViewModel/ManageEmpSalaryServices";
import CustomButton from "../../Components/CustomButton/CustomButton";

const IncentivesDeductions = () => {
  const {
    incentDeductTitles,
    handleClose,
    idSet,
    gettingIncentiveList,
    gettingAllIncentList,
    gettingAllDeductList,
    gettingManageIncDeduct,
    gettingHistory,
    gettingDeductionList,
  } = useManageEmpSalary();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavLinkActions = (e, link, id) => {
    console.log(id);
    e.preventDefault();
    navigate(link);

    if (id === 1) {
      // Removed gettingManageIncDeduct call - it's already called in ManageIncDeduct component's useEffect
      gettingIncentiveList();
    }

    if (id === 2) {
      gettingHistory(idSet);
    }

    if (id === 3) {
      gettingAllIncentList();
    }

    if (id === 4) {
      gettingAllDeductList();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 pb-3">
        <div className="flex justify-between items-center gap-5 px-3 py-5">
          <div className="flex items-center gap-5">
            {incentDeductTitles.map((ele) => (
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
                onClick={(e) => handleNavLinkActions(e, ele.link, ele.id)}
              >
                {location.pathname === ele.link && (
                  <motion.span
                    layoutId="bubble"
                    className="absolute inset-0 z-10 bg-[#8bc9f8]"
                    style={{ borderRadius: 9999 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative cursor-pointer text-[14px] z-20">
                  {ele.title}
                </span>
              </NavLink>
            ))}
          </div>

          <div>
            <CustomButton title="Close" onClick={() => handleClose()} />
          </div>
        </div>

        <div>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default IncentivesDeductions;
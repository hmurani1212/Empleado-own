import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import useFormApproval from "../../ViewModel/FormApprovalViewModel/FormApprovalServices";
import { Button } from "@material-tailwind/react";
import useDefineApprovalFlow from "../../ViewModel/FormApprovalViewModel/defineApprovalFlow";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import ApprovalFlowTemp from "./ApprovalFlowTemp";
import CustomButton from "../../Components/CustomButton/CustomButton";

const FormApproval = () => {
  const { formApprovalTitles } = useFormApproval();
  const {
    defineApprovalFlowForm,
    defineApprovalFlowValue,
    setDefineApprovalFlowValue,
    toggleDefApprovalFlow,
    handleSelectDefAppFlow,
    handleDragEnd,
    handleChangeApprovalFlow,
    handleAddMoreAccordian,
    removeApprovalStage,
  } = useDefineApprovalFlow();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavLinksForms = (e, link) => {
    e.preventDefault();
    navigate(link);
  };

  return (
    <>
      <div className="py-2 px-2">
        <span className="text-[20px] font-Urbanist font-semibold text-[#474747]">
          Form & Approval
        </span>
      </div>

      <div className="flex flex-col gap-2 pb-3">
        <div className="flex justify-between items-center gap-5 px-3 py-5">
          <div className="flex items-center gap-5">
            {formApprovalTitles.map((ele) => (
              <NavLink
                key={ele.id}
                className={`${
                  location.pathname === ele.link
                    ? "text-white"
                    : "hover:text-[#474747]/60 text-[#474747]"
                } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition focus-visible:outline-2`}
                style={{
                  WebkitTapHighlightColor: "transparent",
                }}
                onClick={(e) => handleNavLinksForms(e, ele.link)}
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
            <CustomButton
              className="capitalize font-medium text-[12px] bg-[#8bc9f8] p-2"
              onClick={() => defineApprovalFlowForm()}
              title="Define Approval Flow Template"
            >
              {/* Define Approval Flow Template */}
            </CustomButton>
          </div>
        </div>

        <div>
          <Outlet />
        </div>
      </div>

      {defineApprovalFlowValue.show && (
        <PortalDrawer
          open={defineApprovalFlowValue.show}
          compo={
            <ApprovalFlowTemp
              defineApprovalFlowValue={defineApprovalFlowValue}
              setDefineApprovalFlowValue={setDefineApprovalFlowValue}
              handleSelectDefAppFlow={handleSelectDefAppFlow}
              handleDragEnd={handleDragEnd}
              handleChangeApprovalFlow={handleChangeApprovalFlow}
              handleAddMoreAccordian={handleAddMoreAccordian}
              removeApprovalStage={removeApprovalStage}
              toggleDefApprovalFlow={toggleDefApprovalFlow}
            />
          }
          closeDrawer={toggleDefApprovalFlow}
          title="Define Approval Flow"
          widthSize={600}
        />
      )}
    </>
  );
};

export default FormApproval;
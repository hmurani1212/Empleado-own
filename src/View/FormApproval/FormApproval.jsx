import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useFormApproval from "../../ViewModel/FormApprovalViewModel/FormApprovalServices";
import { Button } from "@material-tailwind/react";
import useDefineApprovalFlow from "../../ViewModel/FormApprovalViewModel/defineApprovalFlow";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import ApprovalFlowTemp from "./ApprovalFlowTemp";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { FaPlus } from "react-icons/fa";

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
    <div className="min-h-screen  font-poppins">
      <div className="mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Form & Approval</h1>
            <p className="text-sm text-gray-500 mt-1">Manage approval workflows and form assignments</p>
          </div>
          
          <Button
            className="flex items-center gap-2 bg-bgBlue hover:bg-blue-600 shadow-blue-500/20 hover:shadow-blue-500/40 rounded-xl py-2.5 px-6 normal-case font-medium"
            onClick={() => defineApprovalFlowForm()}
          >
            <FaPlus className="text-sm" /> Define Approval Flow
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 bg-white rounded-xl w-fit shadow-sm border border-gray-100">
          {formApprovalTitles.map((ele) => (
            <button
              key={ele.id}
              onClick={(e) => handleNavLinksForms(e, ele.link)}
              className={`relative px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                location.pathname === ele.link
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {location.pathname === ele.link && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-bgBlue rounded-lg shadow-sm"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{ele.title}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="mt-6">
          <Outlet />
        </div>
      </div>

      {/* Define Approval Flow Drawer */}
      <AnimatePresence>
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
            widthSize={620}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FormApproval;
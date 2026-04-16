import { Button } from "@material-tailwind/react";
import React, { useState } from "react";
import { FaPhone, FaEnvelope } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { HiExternalLink } from "react-icons/hi";

const CustomDetailCard = ({
  name,
  number,
  cvLink,
  emailId,
  image,
  viewPending,
  handleClose,
  actions,
  steps,
}) => {
  const [activeStep, setActiveStep] = useState(steps && steps.length > 0 ? steps[0].id : "");
  const [titleStep, setTitleStep] = useState(steps && steps.length > 0 ? steps[0].title : "");

  const handleStepChange = (stepId, title) => {
    setActiveStep(stepId);
    setTitleStep(title);
  };

  const renderComp = () => {
    const activeStepComponent = steps.find((step) => step.id === activeStep);
    return activeStepComponent ? activeStepComponent.component : null;
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-3 min-h-[520px]">

        {/* ── Left Panel ─────────────────────────────────────── */}
        <div className="border-r border-gray-100 flex flex-col bg-white">

          {/* Profile block */}
          <div className="px-5 pt-6 pb-5 bg-gradient-to-b from-[#EFF8FF] to-white">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {image ? (
                  <img
                    className="rounded-full w-[52px] h-[52px] object-cover ring-2 ring-[#3da5f4]/30"
                    alt="profile"
                    src={image}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`rounded-full w-[52px] h-[52px] bg-gradient-to-br from-[#3da5f4] to-[#8bc9f8] text-white items-center justify-center text-xl font-bold ring-2 ring-[#3da5f4]/20 ${
                    image ? "hidden" : "flex"
                  }`}
                >
                  {name ? name.charAt(0).toUpperCase() : "U"}
                </div>
              </div>

              {/* Contact details */}
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-[13px] font-bold text-[#3da5f4] truncate font-Urbanist leading-tight">
                  {name}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <FaPhone className="text-[#3da5f4] flex-shrink-0" size={9} />
                  <span className="truncate">{number}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <FaEnvelope className="text-[#3da5f4] flex-shrink-0" size={9} />
                  <span className="truncate">{emailId}</span>
                </div>
                <div className="pt-0.5">
                  {cvLink && cvLink !== "#" ? (
                    <a
                      href={cvLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3da5f4] hover:text-[#2a8fd4] underline underline-offset-2 transition-colors font-Urbanist"
                    >
                      <HiExternalLink size={12} />
                      View CV
                    </a>
                  ) : (
                    <span className="text-[11px] text-gray-400 font-Urbanist">No CV Available</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 mx-4" />

          {/* Section navigation */}
          <div className="flex-1 px-4 py-4">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-3 px-1 font-Urbanist">
              Sections
            </p>
            <nav className="space-y-0.5">
              {steps && steps.length > 0 ? (
                steps.map((step) => {
                  const isActive = activeStep === step.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => handleStepChange(step.id, step.title)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 group cursor-pointer ${
                        isActive
                          ? "bg-[#EFF8FF] text-[#3da5f4]"
                          : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-2 h-2 rounded-full transition-all duration-150 ${
                          isActive
                            ? "bg-[#3da5f4] ring-2 ring-[#3da5f4]/25"
                            : "bg-gray-300 group-hover:bg-gray-400"
                        }`}
                      />
                      <span
                        className={`text-[12px] font-Urbanist leading-tight ${
                          isActive ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {step.title}
                      </span>
                    </button>
                  );
                })
              ) : (
                <span className="text-gray-400 text-sm px-3">No steps available</span>
              )}
            </nav>
          </div>
        </div>

        {/* ── Right Panel ────────────────────────────────────── */}
        <div className="col-span-2 flex flex-col">

          {/* Right panel header */}
          <div className="flex justify-between items-center border-b border-gray-100 px-6 py-[14px] bg-white flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-1 h-5 rounded-full bg-[#3da5f4] inline-block" />
              <span className="text-[14px] font-semibold text-gray-800 font-Urbanist tracking-tight">
                {titleStep}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {actions && actions.length > 0 &&
                actions.map((action, index) => (
                  <Button
                    key={index}
                    className="bg-[#8bc9f8] px-4 py-2 text-[11px] capitalize font-medium cursor-pointer shadow-none"
                    onClick={action.onClick}
                  >
                    {action.label}
                  </Button>
                ))}
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                title="Close"
              >
                <IoMdCloseCircleOutline className="text-red-400 hover:text-red-500 text-[22px] transition-colors" />
              </button>
            </div>
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 overflow-auto bg-[#FAFBFC]">
            {renderComp()}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomDetailCard;

import React, { useEffect } from "react";
import { applicationIconData } from "../../services/__inboxServices";
import { motion } from "framer-motion";
import { Step, Stepper, Tooltip, Typography } from "@material-tailwind/react";
import useInboxServives from "../../ViewModel/InboxViewModel/inboxServices";
import Applications from "./Applications";
import Chat from "./Chat";

const InboxDetails = (props) => {
  const { stepsValue, handleStepActive,  } = useInboxServives();


  return (
    <div className="flex flex-col h-full space-y-4 border border-indigo-60">
      <div className="">
        <div className="flex items-center justify-between text-customBlack-100 text-[16px] py-4 px-3">
          <span>Request Type</span>
          <div className="space-y-1">
            <span className="text-[13px] text-customGray-100">
              Requested on:{" "}
            </span>
            <div className="flex items-center gap-2 mr-5">
              {applicationIconData?.map((ele) => (
                <Tooltip content={ele.content} key={ele.id}>
                  <motion.span
                    key={ele.id}
                    style={{ backgroundColor: ele.color }}
                    className="flex items-center justify-center text-white h-8 w-8 rounded-full cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                  >
                    {ele.icon}
                  </motion.span>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-[300px] py-2 px-4">
        <Stepper
          activeStep={stepsValue.activeStep}
          lineClassName="bg-gray-600"
          activeLineClassName="bg-black"
        >
          {["Application", "Chat"].map((label, index) => (
            <Step
              key={index}
              onClick={() => handleStepActive(index)}
              activeClassName="bg-[#61ADFF]"
              completedClassName="border border-blue-500 rounded-full text-black"
              className="cursor-pointer"
            >
              <div className="flex items-center">
                <div className="w-5 h-5 bg-white rounded-full"></div>
                <div className="absolute top-11 inset-x-0 w-full flex items-center justify-center">
                  <Typography
                    variant={"span"}
                    className="text-[#818a90] text-[11px] text-center"
                  >
                    {label}
                  </Typography>
                </div>
              </div>
            </Step>
          ))}
        </Stepper>
      </div>
      {stepsValue.activeStep === 0 && <Applications />}
      {stepsValue.activeStep === 1 && <Chat />}
    </div>
  );
};

export default InboxDetails;

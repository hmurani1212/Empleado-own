import { Button, Card, CardBody } from "@material-tailwind/react";
import React, { useState } from "react";
import { FaPhone, FaEnvelope, FaEye } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";

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
  // console.log("CustomDetailCard props:", {
  //   name,
  //   number,
  //   cvLink,
  //   emailId,
  //   image,
  //   viewPending,
  //   handleClose,
  //   actions,
  //   steps
  // });
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
    // <h1>Test</h1>
    <Card className="w-full border-2 border-gray">
      <CardBody className="p-0">
        <div className="grid grid-cols-3">
          <div className="bg-[#F8F9FF] py-[5px] pl-[6px]">
            <div className="flex">
              <div className="p-[14px]">
                <span>
                  {image ? (
                    <img
                      className="rounded-full w-[50px] h-[50px] object-cover"
                      alt="profile"
                      src={image}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`rounded-full w-[50px] h-[50px] bg-[#3da5f4] text-white flex items-center justify-center text-lg font-semibold ${image ? 'hidden' : 'flex'}`}
                  >
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </span>
              </div>
              <div className="py-[15px] px-[26px] space-y-2 ">
                <div className="text-[14px] font-semibold text-[#3da5f4]">
                  {name}
                </div>
                <div className="flex items-center text-[14px] space-x-2">
                  <span className="text-[#3da5f4] ">
                    <FaPhone />
                  </span>
                  <span className="">{number}</span>
                </div>
                <div className="flex items-center text-[14px] space-x-2">
                  <span className="text-[#3da5f4]">
                    <FaEnvelope />
                  </span>
                  <span className="">{emailId}</span>
                </div>
                <div className="flex items-center text-[#3da5f4] text-[14px] space-x-2">
                  <span className="">
                    <FaEye />
                  </span>
                  <span className="">
                    {cvLink && cvLink !== "#" ? (
                      <a href={cvLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        View CV
                      </a>
                    ) : (
                      <span className="text-gray-400 cursor-not-allowed">No CV Available</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-[22px] py-[10px]">
              <ol className="relative text-gray-500 border-s-[3px] border-[#007bff] dark:border-gray-700 dark:text-gray-400 text-[14px]">
                {steps && steps.length > 0 ? (
                  steps.map((step) => (
                    <li key={step.id} className="mb-5 ms-6 cursor-pointer">
                      <span className="bg-white absolute flex items-center justify-center w-3 h-3 rounded-full -start-4 ring-4 ring-[#007bff] dark:ring-gray-900 dark:bg-white-500 ml-[5px] mt-[3px] text-md"></span>
                      <h3
                        onClick={() => handleStepChange(step.id, step.title)}
                        className={
                          activeStep === step.id ? "active text-[#3da5f4]" : ""
                        }
                      >
                       <span className="text-lg">{step.title}</span> 
                      </h3>
                    </li>
                  ))
                ) : (
                  <li className="mb-10 ms-6">
                    <span className="text-gray-400">No steps available</span>
                  </li>
                )}
              </ol>
            </div>
          </div>
          <div className="col-span-2">
            <div className="flex justify-between items-center border-b p-[18px]">
              <div>
                <span className="text-[16px] font-semibold text-[#3da5f4]">
                  {titleStep}
                </span>
              </div>
              <div className="flex items-center">
                {actions && actions.length > 0 ? (
                  actions.map((action, index) => (
                    <Button
                      key={index}
                      className="mx-2 bg-[#8bc9f8] px-[18px] py-[9px]"
                      onClick={action.onClick}
                    >
                      {action.label}
                    </Button>
                  ))
                ) : null}

                <span onClick={handleClose}>
                  <IoMdCloseCircleOutline className="text-red-500 cursor-pointer mx-2 text-[20px]" />
                </span>
              </div>
            </div>
            {renderComp()}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default CustomDetailCard;

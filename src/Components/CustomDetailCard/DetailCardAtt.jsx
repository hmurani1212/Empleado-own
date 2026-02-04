import { Button, Card, CardBody, Timeline, TimelineItem, TimelineConnector, TimelineHeader, TimelineBody, Typography } from '@material-tailwind/react'
import React, { useState } from 'react'
import { IoMdCloseCircleOutline } from "react-icons/io";
import { FaTimes } from "react-icons/fa";

const DetailCardAtt = ({ 
  steps, 
  image,
  name,
  empName,
  handleClose

}) => {
  const [activeStep, setActiveStep] = useState(steps[0].id);
  const [titleStep, setTitleStep] = useState(steps[0].title);

  const handleStepChange = (stepId, title) => {
    setActiveStep(stepId);
    setTitleStep(title);
  };

  const renderComp = () => {
    const activeStepComponent = steps.find(step => step.id === activeStep);
    return activeStepComponent ? activeStepComponent.component : null;
  };

  return (
    <Card className='w-full border-2 border-gray'>
      <CardBody className='p-0'>
        <div className='flex flex-col md:flex-row'>
          <div className='w-full md:w-[25%] lg:w-[25%] bg-[#F8F9FF] p-3 sm:p-4 flex-shrink-0'>
            <div className='flex gap-[50px] mb-4'>
              {/* <div>{image}</div> */}
              {/* <div className='flex flex-col'>
                <div className='text-[#3DA5F4] font-semibold mt-2'>{name}</div>
                <div className='text-[#3DA5F4] text-sm'>{empName}</div>
              </div> */}
            </div>

            <div className=" sm:mt-4 w-full">
              <Timeline>
                {steps.map((step, index) => (
                  <TimelineItem key={step.id}>
                    <TimelineConnector className='!w-1 bg-[#3DA5F4]' />
                    <TimelineHeader 
                      className={`h-auto py-1.5 sm:py-2 px-2 sm:px-4 rounded-lg cursor-pointer transition-all w-full flex items-center gap-2 sm:gap-3 ${
                        activeStep === step.id 
                          ? 'bg-[#3DA5F4] shadow-sm' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => handleStepChange(step.id, step.title)}
                    >
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activeStep === step.id 
                          ? 'bg-white' 
                          : 'bg-white border-2 border-[#3DA5F4]'
                      }`}>
                        {activeStep === step.id && (
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#3DA5F4] rounded-full"></div>
                        )}
                      </div>
                      <Typography 
                        variant="h6" 
                        className={`leading-none text-xs sm:text-sm font-medium whitespace-nowrap ${
                          activeStep === step.id 
                            ? 'text-white' 
                            : 'text-gray-600'
                        }`}
                      >
                        {step.title}
                      </Typography>
                    </TimelineHeader>
                    <TimelineBody className={index === steps.length - 1 ? "pb-1" : "pb-1 sm:pb-1.5"}></TimelineBody>
                  </TimelineItem>
                ))}
              </Timeline>
            </div>
          </div>
          <div className='w-full md:w-[75%] flex-shrink-0 overflow-hidden min-h-[600px] flex flex-col'>
            <div className='flex justify-between items-center border-b py-4 px-4 flex-shrink-0'>
              <div>
                <span className='text-[16px] font-semibold text-[#3da5f4]'>{titleStep}</span>
              </div>
              <div className='flex items-center'>
              <button
            onClick={handleClose}
            className="w-6 h-6 flex justify-center items-center rounded-full border-2 border-blue-500 hover:bg-blue-50 transition-colors"
            title="Close"
          >
            <FaTimes className="text-blue-500" size={14} />
          </button>
              </div>
            </div>
            <div className='flex-1 overflow-y-auto'>
              {renderComp()}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default DetailCardAtt;

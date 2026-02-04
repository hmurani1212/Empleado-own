import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  Button,
  IconButton,
  Input,
  Radio,
  Step,
  Stepper,
  Textarea,
} from "@material-tailwind/react";
import React, { useState } from "react";
import useCreateNewDeptServices from "../../ViewModel/DepartmentsViewModel/CreateNewDeptServices";
import { TbListDetails } from "react-icons/tb";
import { RiQuestionnaireLine } from "react-icons/ri";
import { BiSearch } from "react-icons/bi";
import { FaXmark } from "react-icons/fa6";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { FaWindowClose } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";

const CreateNewDepartment = () => {
  const {
    activeStepDept,
    isFirstStepDept,
    isDragActive,
    isLastStepDept,
    handleStepActive,
    handlePrev,
    handleNextDept,
    handleLastStepDept,
    handleFirstStepDept,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleBackDept,
    handleAddDesignations,
    handleInputChange,
    handleRemoveDesignation,
    handleAddDepartment,
    addNewDeptValues,
    handleChangeAddDept,
    handleRadioChange,
    allDeptDetails,
    handleChangeDept,
    allSuggestionsEmp,
    handleDragStart,
    draggedData,
    handleChangeInput,
    searchSuggestions,
    handleClose,
    isStep0Valid,
  } = useCreateNewDeptServices();

  // console.log("allDeptDetailsallDeptDetails", allDeptDetails)
  // console.log('allDeptDetails', allDeptDetails)
  const [open, setOpen] = useState(null);

  const handleOpen = (value) => setOpen(open === value ? null : value);
  return (
    <>
      <div className="px-2 flex flex-col gap-3">
        <div className="flex justify-end text-12px">
          <IconButton
            className="bg-[#FF4979] hover:bg-[#e6395a] p-2 rounded-full"
            onClick={handleBackDept}
            title="Close and return to Manage Departments"
          >
            <FaXmark className="h-5 w-5 text-white" />
          </IconButton>
        </div>

        <div className="gap-2 pb-3 lg:px-2 md:px-2 px-0 w-full">
          <form>
            <div className="w-full flex flex-col gap-4  py-4 lg:px-[40px] md:px-[30px] px-0">
              <div className="w-full px-10">
                <Stepper
                  activeStep={activeStepDept}
                  isLastStep={(value) => handleLastStepDept(value)}
                  isFirstStep={(value) => handleFirstStepDept(value)}
                  lineClassName="bg-white"
                  activeLineClassName="bg-[#3DA5F4]"
                >
                  <Step
                    onClick={() => handleStepActive(0)}
                    activeClassName="bg-[#61ADFF]"
                    completedClassName="text-white"
                  >
                    <div className="flex items-center">
                      <TbListDetails className="h-4 w-4" />
                      <div className="absolute top-10 inset-x-0 w-full flex items-center justify-center">
                        <span className="text-[#474747] text-[13px] text-center font-Urbanist font-medium whitespace-nowrap">
                          Department Details
                        </span>
                      </div>
                    </div>
                  </Step>

                  <Step
                    onClick={() =>
                      isStep0Valid() ? handleStepActive(1) : null
                    }
                    activeClassName="bg-[#61ADFF] relative"
                    completedClassName="text-white"
                    className={
                      !isStep0Valid()
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  >
                    <div className="flex items-center">
                      <RiQuestionnaireLine className="h-4 w-4" />
                      <div className="absolute top-10 inset-x-0 w-full flex items-center justify-center">
                        <span className="text-[#474747] text-[13px] text-center font-Urbanist font-medium whitespace-nowrap">
                          Head of Department
                        </span>
                      </div>
                    </div>
                  </Step>
                </Stepper>

                <div className="mt-10">
                  {activeStepDept === 0 ? (
                    <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-6 text-[12px]">
                      <div className="flex flex-col gap-4">
                        <div>
                          <div
                            className={`flex justify-center items-center lg:w-96 md:w-96 w-full h-48 border-2 border-dashed rounded-lg p-5 bg-white drop-shadow-sm ${
                              isDragActive
                                ? "bg-sky-50 border-sky-400"
                                : "border-gray-300"
                            }`}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                          >
                            {draggedData ? (
                              <div className="flex gap-3 items-center">
                                <div>
                                  <Accordion
                                    key={draggedData.id}
                                    open={open === draggedData.id}
                                    className="mb-2 rounded-lg border border-blue-gray-100"
                                  >
                                    <AccordionHeader
                                      onClick={() => handleOpen(draggedData.id)}
                                      className="text-[14px] rounded-lg border-b-0 py-2 bg-[#F8F9FF]"
                                    >
                                      <span className="px-4">
                                        {draggedData.name}
                                      </span>
                                    </AccordionHeader>
                                    <AccordionBody className="px-4">
                                      <div className="flex flex-col space-y-4">
                                        <div className="text-[12px]">
                                          <span className="font-medium text-[12px] text-[#474747] font-Urbanist">
                                            Description
                                          </span>
                                          <div className="text-[12px] text-[#474747] font-Urbanist">
                                            {draggedData.description}
                                          </div>
                                        </div>
                                        <div className="flex gap-3 grid grid-cols-5">
                                          {draggedData.designation?.map(
                                            (designation, i) => (
                                              <div key={i}>
                                                <Button className="p-1 bg-[#8bc9f8] capitalize text-white text-[9px] align-center font-medium rounded-lg">
                                                  {designation.title}
                                                </Button>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </AccordionBody>
                                  </Accordion>
                                </div>

                                <div>
                                  <FaWindowClose
                                    className="text-red-500 text-[20px]"
                                    onClick={handleClose}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400">
                                Drag Department here
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="lg:w-96 md:w-96 w-full">
                          <label className="text-[12px] text-[#474747] font-Urbanist font-medium px-2">
                            Department Name
                          </label>
                          <Input
                            labelProps={{ className: "hidden" }}
                            placeholder="Enter Department Name"
                            value={addNewDeptValues.dept_name}
                            className="text-[12px] text-[#474747] font-Urbanist bg-white outline-none border-none drop-shadow-sm"
                            name="dept_name"
                            onChange={handleChangeInput}
                          />
                        </div>

                        <div>
                          <span className="lg:text-[12px] md:text-[11px] text-[10px] text-[#474747] font-Urbanist font-medium">
                            Whether this new department be visible in all
                            branches (global) or for the selected branch only
                          </span>
                          <div className="flex lg:flex-row md:flex-row flex-col lg:items-center md:items-center items-start justify-start">
                            <Radio
                              className="text-[12px] text-[#474747] font-Urbanist font-medium"
                              color="blue"
                              name="isGlobal"
                              value="0"
                              label="For the selected branch only"
                              checked={!addNewDeptValues.is_global}
                              onChange={handleRadioChange}
                            />

                            <Radio
                              className="text-[12px] text-[#474747] font-Urbanist font-medium"
                              name="isGlobal"
                              value="1"
                              color="blue"
                              label="Global (all branches)"
                              checked={addNewDeptValues.is_global}
                              onChange={handleRadioChange}
                            />
                          </div>
                        </div>

                        <div className="lg:w-96 md:w-96 w-full">
                          <label className="text-[12px] text-[#474747] font-Urbanist font-medium px-2">
                            Description
                          </label>
                          <Textarea
                            labelProps={{ className: "hidden" }}
                            value={addNewDeptValues.description}
                            className="text-[12px] text-[#474747] font-Urbanist bg-white outline-none border-none drop-shadow-sm"
                            placeholder="Description"
                            name="description"
                            onChange={handleChangeAddDept}
                          />
                        </div>

                        {addNewDeptValues.designations?.length > 0 &&
                          addNewDeptValues.designations?.map(
                            (designation, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between mb-4"
                              >
                                <div className="lg:w-96 md:w-96 w-full">
                                  <Input
                                    label={`Designation ${index + 1}`}
                                    value={designation.value}
                                    color="blue"
                                    onChange={(event) =>
                                      handleInputChange(index, event)
                                    }
                                    name="value"
                                  />
                                </div>
                                {addNewDeptValues.designations?.length > 1 && (
                                  <div>
                                    <IconButton
                                      color="red"
                                      onClick={() =>
                                        handleRemoveDesignation(index)
                                      }
                                    >
                                      <FaXmark />
                                    </IconButton>
                                  </div>
                                )}
                              </div>
                            )
                          )}

                        <div>
                          <CustomButton
                            className="bg-[#8bc9f8] capitalize p-2 font-medium"
                            title="Add New Designation"
                            type="button"
                            onClick={handleAddDesignations}
                          >
                            Add New Designation
                          </CustomButton>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-4">
                        <div className="font-medium text-[12px] text-[#474747] font-Urbanist">
                          Suggested Departments
                        </div>
                        {searchSuggestions &&
                        allDeptDetails &&
                        allDeptDetails.length > 0 ? (
                          <div>
                            {allDeptDetails?.map((item, index) => (
                              <Accordion
                                key={index}
                                open={open === index}
                                icon={<FaPlus id={index} open={open} />}
                                className="mb-2 rounded-lg border border-blue-gray-100"
                                draggable
                                onDragStart={handleDragStart(item)}
                              >
                                <AccordionHeader
                                  onClick={() => handleOpen(index)}
                                  className="text-[14px] px-4 rounded-lg py-2 border-b-0 bg-[#F8F9FF]"
                                >
                                  <div>{item.name}</div>
                                </AccordionHeader>

                                <AccordionBody className="px-4">
                                  <div className="flex flex-col space-y-4">
                                    <div>
                                      <span className="font-medium text-[12px] text-[#474747] font-Urbanist">
                                        Description
                                      </span>
                                      <div>
                                        {item.description ||
                                          "No description available"}
                                      </div>
                                    </div>

                                    <label className="font-medium text-[12px] text-[#474747] font-Urbanist">
                                      Designations
                                    </label>
                                    <div className="flex gap-3">
                                      {item.designations &&
                                      item.designations.length > 0 ? (
                                        item.designations?.map(
                                          (designation, i) => (
                                            <div key={i}>
                                              <Button className="p-1 bg-[#8bc9f8] text-white text-[9px] align-center font-medium rounded-lg capitalize">
                                                {designation.title}
                                              </Button>
                                            </div>
                                          )
                                        )
                                      ) : (
                                        <div className="text-gray-500 text-[12px]">
                                          No designations available
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </AccordionBody>
                              </Accordion>
                            ))}
                          </div>
                        ) : searchSuggestions ? (
                          <div className="text-gray-500 text-[12px]">
                            No departments found
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center flex-col space-y-4">
                      <div className="w-96">
                        <CustomSelect
                          placeHolderTitle="Department"
                          value={addNewDeptValues?.parent_deptt}
                          options={allDeptDetails?.map((dept) => ({
                            value: dept.id,
                            label: dept.name,
                          }))}
                          onChangeHandler={(selectedOption, e) =>
                            handleChangeDept(selectedOption, "parent_deptt", e)
                          }
                          cStyle={true}
                        />
                      </div>

                      <div className="w-96">
                        <CustomSelect
                          placeHolderTitle="Employee"
                          value={addNewDeptValues?.hod}
                          options={allSuggestionsEmp?.map((employee) => ({
                            value: employee.id,
                            label: employee.name,
                          }))}
                          onChangeHandler={(selectedOption, e) =>
                            handleChangeDept(selectedOption, "hod", e)
                          }
                          cStyle={true}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className={`mt-16 flex ${isFirstStepDept ? 'justify-end' : 'justify-between'}`}>
                  {!isFirstStepDept && (
                    <CustomButton
                      title="Prev"
                      type="button"
                      onClick={handlePrev}
                      className="capitalize bg-[#8bc9f8]"
                    >
                      Prev
                    </CustomButton>
                  )}
                  <CustomButton
                    title={isLastStepDept ? "Submit" : "Next"}
                    type={isLastStepDept ? "submit" : "button"}
                    onClick={
                      isLastStepDept ? handleAddDepartment : handleNextDept
                    }
                    className={`capitalize cursor-pointer ${
                      isLastStepDept ? "bg-[#0acf97]" : "bg-[#8bc9f8]"
                    }`}
                  >
                    {isLastStepDept ? "Submit" : "Next"}
                  </CustomButton>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateNewDepartment;
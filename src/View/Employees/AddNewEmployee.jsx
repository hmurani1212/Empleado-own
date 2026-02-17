import {
  Stepper,
  Step,
  Button,
  Input,
  Popover,
  PopoverHandler,
  PopoverContent,
  Radio,
} from "@material-tailwind/react";
import React, { useMemo, useState, useEffect } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { FaUser } from "react-icons/fa";
import { FaBuildingUser } from "react-icons/fa6";
import { MdOutlineFindReplace } from "react-icons/md";
import useEmployees from "../../ViewModel/EmployeeViewModel/EmployeeServices";
import { DayPicker } from "react-day-picker";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import { GrHide } from "react-icons/gr";
import { BiShow } from "react-icons/bi";
import { contractData, mobileNetwroks } from "../../services/EmpServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import Calendar from "react-calendar";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import usePayroll from "../../ViewModel/PayrollViewModel/PayrollServices";
import { showToast } from "../../Components/Toaster/Toaster";
import CustomButton from "../../Components/CustomButton/CustomButton";

export const UserVerifyComp = (props) => {
  const { findingEmp } = props;
  const userProfile = findingEmp?.userProfile;
  const oneid = findingEmp?.oneid;

  // If we have userProfile from new API response, display it
  if (userProfile && findingEmp.userFind) {
    return (
      <div className="flex flex-col gap-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-blue-600 text-[14px] font-medium mb-3">
            This account belongs to
          </div>

          {userProfile.full_name && (
            <div className="flex items-center gap-2 text-[14px] mb-2">
              <span className="font-semibold text-gray-700">Full Name:</span>
              <span className="text-gray-900">{userProfile.full_name}</span>
            </div>
          )}

          {oneid && (
            <div className="flex items-center gap-2 text-[14px]">
              <span className="font-semibold text-gray-700">OneID:</span>
              <span className="text-gray-900">{oneid}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback to old display format for backward compatibility
  const email = findingEmp?.email;
  const phone = findingEmp?.phone;
  return (
    <div className="flex flex-col gap-3">
      {!findingEmp.userFind && (
        <div className="text-red-600 flex items-center gap-5">
          <span className="font-semibold">ERROR</span>
          <span>Email and mobile doesnot belong to same person</span>
        </div>
      )}
      {email?.STATUS === "SUCCESSFUL" && (
        <div className="flex items-center gap-2 text-[14px]">
          <span className="font-semibold">{email.DB_DATA.email} : </span>
          <span>Belong to {email.DB_DATA?.full_name}</span>
        </div>
      )}
      {phone?.STATUS === "SUCCESSFUL" && (
        <div className="flex items-center gap-2 text-[13px]">
          <span className="font-semibold">{phone.DB_DATA.phone} :</span>
          <span>Belong to {phone.DB_DATA?.full_name}</span>
        </div>
      )}
      {!findingEmp?.userFind && (
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-indigo-600">Note !</span>
          <span>Please change either Email or Phone Number</span>
        </div>
      )}
    </div>
  );
};

const AddNewEmployee = () => {
  const {
    newEmpValues,
    handleNewEmpChange,
    getFindEmp,
    verfiyUser,
    handleDOB,
    handleVerifyUserModalClose,
    findingEmp,
    handleStepActive,
    activeStep,
    isFirstStep,
    isLastStep,
    handlePrev,
    handleNext,
    handleLastStep,
    handleFirstStep,
    allCountries,
    handleSelectChange,
    passwordToggle,
    validateAge,
    empBranches,
    dept_subDept,
    flattenOptions,
    customStyles,
    designations,
    empManager,
    policies,
    salaryTemplate,
    addEmpHandler,
    fetchingAllBranches,
    completedSteps,
    findEmployeeCompleted,
    employee_exicute,
    createSalaryTemplateFromEmployee,
    gettingSalayTemplate,
    hrPolicyDropdown,
    get_all_department,
    loading,
    isAddingEmployee,
    isCreatingSalaryTemplate
  } = useEmployees();



  // console.log('what is the data here', get_all_department)


  // console.log('Please tell me why are you here', hrPolicyDropdown)

  const { copyBranchesData, getAllBranchesPayroll } = usePayroll();

  // State for salary template drawer
  const [showSalaryTemplateDrawer, setShowSalaryTemplateDrawer] =
    useState(false);
  const [salaryTemplateForm, setSalaryTemplateForm] = useState({
    template_name: "",
    salary_amount: "",
    branch_option: "selected", // 'selected' or 'all'
  });
  const [newlyCreatedTemplateId, setNewlyCreatedTemplateId] = useState(null);

  // Load branches when drawer opens
  useEffect(() => {
    if (
      showSalaryTemplateDrawer &&
      (!copyBranchesData || copyBranchesData.length === 0)
    ) {
      getAllBranchesPayroll();
    }
  }, [showSalaryTemplateDrawer, copyBranchesData, getAllBranchesPayroll]);

  // Auto-select newly created template when salaryTemplate updates
  useEffect(() => {
    if (newlyCreatedTemplateId && salaryTemplate && salaryTemplate.length > 0) {
      // Try to find template by ID (handle both string and number comparisons)
      const newTemplate = salaryTemplate.find(
        (template) =>
          template.id === newlyCreatedTemplateId ||
          template.id === Number(newlyCreatedTemplateId) ||
          String(template.id) === String(newlyCreatedTemplateId)
      );

      if (newTemplate) {
        // Select the newly created template
        handleSelectChange(
          { value: newTemplate.id, label: newTemplate.name },
          "salary_template"
        );
        setNewlyCreatedTemplateId(null); // Reset after selection
      } else {
        // Fallback: if exact match not found, select the last template (most likely the new one)
        const lastTemplate = salaryTemplate[salaryTemplate.length - 1];
        if (lastTemplate) {
          handleSelectChange(
            { value: lastTemplate.id, label: lastTemplate.name },
            "salary_template"
          );
          setNewlyCreatedTemplateId(null);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salaryTemplate, newlyCreatedTemplateId]);

  // Handle salary template form input changes
  const handleSalaryTemplateChange = (e) => {
    const { name, value } = e.target;
    setSalaryTemplateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle branch option radio change
  const handleBranchOptionChange = (value) => {
    setSalaryTemplateForm((prev) => ({
      ...prev,
      branch_option: value,
    }));
  };

  // Handle form submission
  const handleSalaryTemplateSubmit = async (e) => {
    e.preventDefault();

    // Prepare form data for createSalaryTemplateFromEmployee
    const formData = {
      template_name: salaryTemplateForm.template_name,
      salary_amount: salaryTemplateForm.salary_amount,
      branch_option: salaryTemplateForm.branch_option,
      selected_branch_id:
        salaryTemplateForm.branch_option === "selected"
          ? newEmpValues.branch
            ? newEmpValues.branch.value || newEmpValues.branch
            : null
          : null,
    };

    // Call the API function from EmployeeServices
    const result = await createSalaryTemplateFromEmployee(formData);

    // If successful, reset form and close drawer
    if (result && result.success) {
      setSalaryTemplateForm({
        template_name: "",
        salary_amount: "",
        branch_option: "selected",
      });
      setShowSalaryTemplateDrawer(false);

      // Store the newly created template ID for auto-selection
      if (result.template_id) {
        setNewlyCreatedTemplateId(result.template_id);
      }

      // Fetch templates again to refresh the list
      if (newEmpValues.branch) {
        const branchId = newEmpValues.branch.value || newEmpValues.branch;
        if (branchId && gettingSalayTemplate) {
          // Fetch templates for the branch - useEffect will handle selection
          await gettingSalayTemplate(branchId);
        }
      }
    }
  };

  // Open salary template drawer
  const handleOpenSalaryTemplateDrawer = (e) => {
    e.preventDefault();

    // Check if branch is selected
    if (!newEmpValues.branch) {
      showToast("Please select a branch first", "error");
      return;
    }

    setShowSalaryTemplateDrawer(true);
  };

  // Close salary template drawer
  const handleCloseSalaryTemplateDrawer = () => {
    setShowSalaryTemplateDrawer(false);
    setSalaryTemplateForm({
      template_name: "",
      salary_amount: "",
      branch_option: "selected",
    });
  };

  // console.log("what is your value here:", employee_exicute);

  // Validation functions for each step
  const isStep0Valid = useMemo(() => {
    return newEmpValues.mobile; // Email is now optional on first step
  }, [newEmpValues.mobile]);

  const isStep1Valid = useMemo(() => {
    const isPakistan =
      newEmpValues.country_code && newEmpValues.country_code.value === "162";
    const baseValidation =
      newEmpValues.full_name &&
      newEmpValues.father_name &&
      newEmpValues.country_code &&
      newEmpValues.dob &&
      newEmpValues.passport &&
      newEmpValues.password &&
      newEmpValues.gender;
    // Only require network if Pakistan is selected
    const networkValidation = isPakistan ? newEmpValues.network : true;
    return baseValidation && networkValidation;
  }, [newEmpValues]);

  const isStep2Valid = useMemo(() => {
    return (
      newEmpValues.branch &&
      newEmpValues.department &&
      newEmpValues.designation &&
      newEmpValues.work_policy &&
      newEmpValues.empStatus &&
      newEmpValues.salary_template &&
      newEmpValues.empID &&
      newEmpValues.joing_date
    );
  }, [newEmpValues]);

  // Function to determine if the current step is valid
  const isCurrentStepValid = useMemo(() => {
    switch (activeStep) {
      case 0:
        return isStep0Valid;
      case 1:
        return isStep1Valid;
      case 2:
        return isStep2Valid;
      default:
        return false;
    }
  }, [activeStep, isStep0Valid, isStep1Valid, isStep2Valid]);

  return (
    <form>
      <div className="w-full flex flex-col gap-4 py-4 px-[40px] bg-white drop-shadow-md rounded-[10px]">
        <div className="px-4">
          <Stepper
            activeStep={activeStep}
            isLastStep={(value) => handleLastStep(value)}
            isFirstStep={(value) => handleFirstStep(value)}
            lineClassName="bg-gray-200"
            activeLineClassName="bg-bgBlue"
          >
            <Step
              onClick={() => handleStepActive(0)}
              activeClassName="bg-[#8bc9f8]"
              completedClassName="text-white bg-bgBlue"
              className="cursor-pointer bg-red-500"
            >
              <div className="flex items-center">
                <MdOutlineFindReplace className="h-4 w-4" />
                <div className={`absolute top-10 inset-x-0 w-full flex items-center justify-center`}>
                  <span className="text-[#474747] text-[13px] text-center font-Urbanist font-medium whitespace-nowrap">
                    Find Employee
                  </span>
                </div>
              </div>
            </Step>
            <Step
              onClick={
                findEmployeeCompleted ? () => handleStepActive(1) : undefined
              }
              activeClassName="bg-[#8bc9f8] relative"
              completedClassName="text-white bg-bgBlue"
              className={
                findEmployeeCompleted
                  ? "cursor-pointer "
                  : "cursor-not-allowed border border-[#8bc9f8] bg-[#f2f6f9]"
              }
            >
              <div className="flex items-center">
                <FaUser className="h-4 w-4" />
                <div className="absolute top-10 inset-x-0 w-full flex items-center justify-center">
                  <span className="text-[#474747] text-[13px] text-center font-Urbanist font-medium whitespace-nowrap">
                    Personal Information
                  </span>
                </div>
              </div>
            </Step>
            <Step
              onClick={
                completedSteps?.has(1) ? () => handleStepActive(2) : undefined
              }
              activeClassName="bg-[#8bc9f8]"
              completedClassName="text-white bg-bgBlue"
              className={
                completedSteps?.has(1)
                  ? "cursor-pointer"
                  : "cursor-not-allowed border border-[#8bc9f8] bg-[#f2f6f9]"
              }
            >
              <div className="flex items-center">
                <FaBuildingUser className="h-4 w-4" />
                <div className="absolute top-10 inset-x-0 w-full flex items-center justify-center">
                  <span className="text-[#474747] text-[13px] text-center font-Urbanist font-medium whitespace-nowrap">
                    Official Information
                  </span>
                </div>
              </div>
            </Step>
          </Stepper>
        </div>
        <div className="w-full flex flex-col items-center justify-center">
          <div className="mt-10 lg:w-2/5 md:w-1/2 w-full">
            <div className="pb-4">
              <span className="text-[#474747] text-[16px] font-Urbanist font-medium">Employee Account Credentials</span>
            </div>
            {activeStep === 0 ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="w-full flex flex-col gap">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Mobile No</label>
                  <input
                    // color="white"
                    // label="Mobile No"
                    value={newEmpValues.mobile}
                    name="mobile"
                    onChange={handleNewEmpChange}
                    placeholder="+92XXXXXXXXX"
                    className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                  />
                </div>
                <div className="w-full flex flex-col gap">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Email (Optional)</label>
                  <input
                    // label="Email (Optional)"
                    type="email"
                    name="email"
                    value={newEmpValues.email}
                    onChange={handleNewEmpChange}
                    placeholder="Enter Email (Optional)"
                    className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                  />
                </div>
              </div>
            ) : activeStep === 1 ? (
              <div className="flex flex-col items-center gap-4">
                <div className="w-full flex flex-col">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Full Name</label>
                  <input
                    // label="Full Name"
                    value={newEmpValues.full_name}
                    name="full_name"
                    onChange={handleNewEmpChange}
                    placeholder="Enter Full Name"
                    className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Father Name</label>
                  <input
                    // label="Father Name"
                    name="father_name"
                    value={newEmpValues.father_name}
                    onChange={handleNewEmpChange}
                    placeholder="Enter Father Name"
                    className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Select Country</label>
                  <CustomSelect
                    placeHolderTitle="Country"
                    className="text-[0.90vw]"
                    value={
                      allCountries?.find(
                        (country) => country.id == newEmpValues.country_code
                      )
                        ? {
                          value: `${allCountries.find(
                            (country) =>
                              country.id == newEmpValues.country_code
                          ).country_code
                            }#${newEmpValues.country_code}`,
                          label: allCountries.find(
                            (country) =>
                              country.id == newEmpValues.country_code
                          ).country_name,
                        }
                        : newEmpValues.country_code
                    }
                    options={allCountries?.map((country) => ({
                      // value: `${country.country_code}#${country.id}`,
                      value: `${country.id}`,
                      label: country.country_name,
                    }))}
                    onChangeHandler={(selectedOption) =>
                      handleSelectChange(selectedOption, "country_code")
                    }
                    cStyle={true}
                    customStyles={{
                      control: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the control (input box)
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the selected value
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the placeholder text
                      }),
                      option: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for each option in the dropdown
                        padding: "1px 3px", // Reduce padding for smaller options
                      }),
                      menu: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for the dropdown menu
                      }),
                      menuList: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for the menu list
                      }),
                    }}
                  />
                </div>
                {/* Show network selection by default, hide only for non-Pakistan countries */}
                {(!newEmpValues.country_code ||
                  newEmpValues.country_code.value === "162") && (
                    <div className="w-full flex flex-col">
                      <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Select Network</label>
                      <CustomSelect
                        className="text-[0.90vw]"
                        placeHolderTitle="Mobile Network"
                        value={newEmpValues?.network}
                        options={mobileNetwroks?.map((network) => ({
                          value: `${network.networkName}-PK`,
                          label: network.networkName,
                        }))}
                        onChangeHandler={(selectedOption) =>
                          handleSelectChange(selectedOption, "network")
                        }
                        cStyle={true}
                        customStyles={{
                          control: (base) => ({
                            ...base,
                            fontSize: "0.175rem", // Font size for the control (input box)
                          }),
                          singleValue: (base) => ({
                            ...base,
                            fontSize: "0.175rem", // Font size for the selected value
                          }),
                          placeholder: (base) => ({
                            ...base,
                            fontSize: "0.175rem", // Font size for the placeholder text
                          }),
                          option: (base) => ({
                            ...base,
                            fontSize: "0.14rem", // Font size for each option in the dropdown
                            padding: "1px 3px", // Reduce padding for smaller options
                          }),
                          menu: (base) => ({
                            ...base,
                            fontSize: "0.14rem", // Font size for the dropdown menu
                          }),
                          menuList: (base) => ({
                            ...base,
                            fontSize: "0.14rem", // Font size for the menu list
                          }),
                        }}
                      />
                    </div>
                  )}

                <div className="w-full flex flex-col">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Date of Birth</label>
                  <input
                    className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                    type="date"
                    // label="Date of Birth"
                    name="dob"
                    value={newEmpValues.dob}
                    onChange={handleNewEmpChange}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">CNIC/Passport Number</label>
                  <input
                    className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                    // label="CNIC/Passport Number"
                    value={newEmpValues.passport}
                    name="passport"
                    onChange={handleNewEmpChange}
                    placeholder="Enter CNIC/Passport Number"
                  />
                </div>

                <div className="w-full flex flex-col relative">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">OneID Empleado password</label>
                  <div className="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-2/4 right-3 -translate-y-2/4">
                    <span className="cursor-pointer" onClick={passwordToggle}>
                      {newEmpValues.showPassword ? <GrHide  className="relative top-3"/> : <BiShow className="relative top-3" />}
                    </span>
                  </div>
                  <input
                    className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                    placeholder=""
                    name="password"
                    onChange={handleNewEmpChange}
                    value={newEmpValues.password}
                    type={newEmpValues.showPassword ? "text" : "password"}
                  />
                  {/* <label className="flex w-full h-full select-none pointer-events-none absolute left-0 !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                    OneID Empleado password
                  </label> */}
                </div>

                <div className="flex flex-col w-full">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Select Gender</label>
                  <div className="flex items-center gap-6">
                    <Radio
                      className="text-[0.90vw] bg-gray-300 drop-shadow-md p-2 rounded-[8px] text-[#474747] w-full outline-none border-none rounded-full aspect-square"
                      label="Male"
                      value="1"
                      name="gender"
                      onChange={handleNewEmpChange}
                    />
                    <Radio
                      className="text-[0.90vw] bg-gray-300 drop-shadow-md p-2 rounded-[8px] text-[#474747] w-full outline-none border-none rounded-full aspect-square"
                      label="Female"
                      value="0"
                      name="gender"
                      onChange={handleNewEmpChange}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-full flex flex-col">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
                    Select Branch
                  </label>
                  <CustomSelect
                    placeHolderTitle="Branch"
                    value={newEmpValues?.branch}
                    options={empBranches?.map((branch) => ({
                      value: branch.id,
                      label: branch.branch_name,
                    }))}
                    onChangeHandler={(selectedOption) =>
                      handleSelectChange(selectedOption, "branch")
                    }
                    cStyle={true}
                    customStyles={{
                      control: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the control (input box)
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the selected value
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the placeholder text
                      }),
                      option: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for each option in the dropdown
                        padding: "1px 3px", // Reduce padding for smaller options
                      }),
                      menu: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for the dropdown menu
                      }),
                      menuList: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for the menu list
                      }),
                    }}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
                    Select Department
                  </label>
                  <CustomSelect
                    placeHolderTitle="Department"
                    value={newEmpValues?.department}
                    options={(get_all_department || []).map((dep) => ({
                      value: dep.id,
                      label: dep.name,
                    }))}
                    onChangeHandler={(selectedOption) =>
                      handleSelectChange(selectedOption, "department")
                    }
                    cStyle={true}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
                    Select Designation
                  </label>
                  <CustomSelect
                    placeHolderTitle="Designation"
                    value={newEmpValues?.designation}
                    options={designations?.map((ele) => ({
                      value: ele.id,
                      label: ele.title,
                    }))}
                    onChangeHandler={(selectedOption) =>
                      handleSelectChange(selectedOption, "designation")
                    }
                    cStyle={true}
                    customStyles={{
                      control: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the control (input box)
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the selected value
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the placeholder text
                      }),
                      option: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for each option in the dropdown
                        padding: "1px 3px", // Reduce padding for smaller options
                      }),
                      menu: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for the dropdown menu
                      }),
                      menuList: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for the menu list
                      }),
                    }}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
                    Select Reporting Manager (Optional)
                  </label>
                  <CustomSelect
                    placeHolderTitle="Reporting Manager (Optional)"
                    value={newEmpValues?.reporting_manager}
                    options={
                      Array.isArray(empManager)
                        ? empManager.map((ele) => ({
                          value: ele.id,
                          label: ele.name,
                        }))
                        : []
                    }
                    onChangeHandler={(selectedOption) =>
                      handleSelectChange(selectedOption, "reporting_manager")
                    }
                    cStyle={true}
                    customStyles={{
                      control: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the control (input box)
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the selected value
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the placeholder text
                      }),
                      option: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for each option in the dropdown
                        padding: "1px 3px", // Reduce padding for smaller options
                      }),
                      menu: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for the dropdown menu
                      }),
                      menuList: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for the menu list
                      }),
                    }}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
                    Select Work Policy
                  </label>
                  <CustomSelect
                    placeHolderTitle="Work Policy"
                    value={newEmpValues?.work_policy}
                    options={hrPolicyDropdown?.map((ele) => ({
                      value: ele.id,
                      label: ele.name,
                    }))}
                    onChangeHandler={(selectedOption) =>
                      handleSelectChange(selectedOption, "work_policy")
                    }
                    cStyle={true}
                    customStyles={{
                      control: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the control (input box)
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the selected value
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the placeholder text
                      }),
                      option: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for each option in the dropdown
                        padding: "1px 3px", // Reduce padding for smaller options
                      }),
                      menu: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for the dropdown menu
                      }),
                      menuList: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for the menu list
                      }),
                    }}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
                    Select Employement Status
                  </label>
                  <CustomSelect
                    placeHolderTitle="Employement Status"
                    value={newEmpValues?.empStatus}
                    options={contractData?.map((ele) => ({
                      value: ele.id,
                      label: ele.name,
                    }))}
                    onChangeHandler={(selectedOption) =>
                      handleSelectChange(selectedOption, "empStatus")
                    }
                    cStyle={true}
                    customStyles={{
                      control: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the control (input box)
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the selected value
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "0.175rem", // Font size for the placeholder text
                      }),
                      option: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for each option in the dropdown
                        padding: "1px 3px", // Reduce padding for smaller options
                      }),
                      menu: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for the dropdown menu
                      }),
                      menuList: (base) => ({
                        ...base,
                        fontSize: "0.14rem", // Font size for the menu list
                      }),
                    }}
                  />
                </div>
                <div className="flex items-center space-x-2 w-full">
                  <div className="flex-1 flex-col">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
                      Select Salary Template
                    </label>
                    <CustomSelect
                      placeHolderTitle="Salary Template"
                      value={newEmpValues?.salary_template}
                      options={salaryTemplate?.map((ele) => ({
                        value: ele.id,
                        label: ele.name,
                      }))}
                      onChangeHandler={(selectedOption) =>
                        handleSelectChange(selectedOption, "salary_template")
                      }
                      customStyles={false}
                    />
                  </div>
                  <div className="pt-6">
                    <button
                      className="text-2xl bg-bgBlue text-white rounded-md w-10 h-10 flex items-center justify-center hover:bg-blue-500 transition-colors"
                      onClick={handleOpenSalaryTemplateDrawer}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="w-full flex flex-col">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Employee ID</label>
                  <input
                    // label="Employee ID"
                    value={newEmpValues.empID}
                    name="empID"
                    onChange={handleNewEmpChange}
                    placeholder="Employee ID"
                    className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Joining Date</label>
                  {/* <Popover placement="bottom">
                  <PopoverHandler> */}
                  <input
                    type="date"
                    // label="Select a Joining Date"
                    onChange={handleNewEmpChange}
                    value={newEmpValues.joing_date}
                    name="joing_date"
                   className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                  // placeholder="September 6th, 2025"
                  />
                  {/* </PopoverHandler>
                  <PopoverContent>
                    <Calendar
                      onChange={(selected) => handleDOB(selected, "joing_date")}
                    />
                  </PopoverContent>
                </Popover> */}
                </div>
              </div>
            )}
          <div
            className={`mt-5 flex w-full ${activeStep > 0 ? "justify-between" : "justify-start"
              }`}
          >
            {activeStep > 0 && (
              <Button 
                onClick={handlePrev} 
                className="capitalize"
                disabled={loading || isAddingEmployee}
              >
                Prev
              </Button>
            )}
            <Button
              onClick={isLastStep ? addEmpHandler : handleNext}
              className={`capitalize cursor-pointer bg-[#2196f3] ${isLastStep ? "bg-bgBlue" : ""
                } ${!isCurrentStepValid ? "" : ""}`}
              disabled={
                !isCurrentStepValid || 
                (employee_exicute === 1 && isLastStep) ||
                loading ||
                isAddingEmployee
              }
              loading={isLastStep ? isAddingEmployee : (isFirstStep ? loading : false)}
              >
              {isLastStep ? "Submit" : isFirstStep ? "Find User" : "Next"}
            </Button>
          </div>
          </div>

        </div>
      </div>
      <CustomDialog
        openDialog={verfiyUser}
        handleOpen={handleVerifyUserModalClose}
        showBtns={false}
        title="Employee Registration"
        switchBtn={findingEmp.userFind}
        compo={<UserVerifyComp findingEmp={findingEmp} />}
      />

      {/* Salary Template Drawer */}
      {showSalaryTemplateDrawer && (
        <PortalDrawer
          open={showSalaryTemplateDrawer}
          closeDrawer={handleCloseSalaryTemplateDrawer}
          title="New Salary Template"
          // widthSize={620}
          compo={
            <form
              onSubmit={handleSalaryTemplateSubmit}
              className="pt-4 px-[1.1vw]"
            >
              <div className="flex flex-col space-y-4">
                {/* Template Name */}
                <div className="block">
                  <Input
                    size="sm"
                    label="Template Name"
                    color="blue"
                    name="template_name"
                    value={salaryTemplateForm.template_name}
                    onChange={handleSalaryTemplateChange}
                  />
                </div>

                {/* Branch Selection */}
                <div className="flex flex-col">
                  <label className="text-[#698592] text-sm block">Branch</label>
                  <div className="flex gap-6">
                    <Radio
                      size="sm"
                      label="Selected Branch"
                      name="branch_option"
                      value="selected"
                      checked={salaryTemplateForm.branch_option === "selected"}
                      onChange={(e) => handleBranchOptionChange(e.target.value)}
                      color="blue"
                    />
                    <Radio
                      size="sm"
                      label="All Branch"
                      name="branch_option"
                      value="all"
                      checked={salaryTemplateForm.branch_option === "all"}
                      onChange={(e) => handleBranchOptionChange(e.target.value)}
                      color="blue"
                    />
                  </div>
                </div>

                {/* Salary Amount */}
                <div className="block text-sm">
                  <Input
                    size="sm"
                    label="Salary Amount"
                    color="blue"
                    name="salary_amount"
                    type="number"
                    value={salaryTemplateForm.salary_amount}
                    onChange={handleSalaryTemplateChange}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-start pt-4">
                  <Button 
                    type="submit" 
                    color="blue" 
                    className="capitalize"
                    disabled={isCreatingSalaryTemplate}
                    loading={isCreatingSalaryTemplate}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </form>
          }
        />
      )}
    </form>
  );
};

export default AddNewEmployee;

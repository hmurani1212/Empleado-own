import {
  Button,
  Input,
  Popover,
  PopoverHandler,
  PopoverContent,
  Radio,
} from "@material-tailwind/react";
import ThreeSegmentStepper from "../../Components/ThreeSegmentStepper/ThreeSegmentStepper";
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { FaAngleLeft, FaAngleRight, FaChevronDown, FaChevronRight } from "react-icons/fa6";
import { FaUser, FaInfoCircle } from "react-icons/fa";
import { FaBuildingUser } from "react-icons/fa6";
import { MdOutlineFindReplace } from "react-icons/md";
import { components as selectComponents } from "react-select";
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
import useDashboard from "../../ViewModel/DashboardViewModel/DashboardServices";
import { showToast } from "../../Components/Toaster/Toaster";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { getContentByLabel } from "../../services/getContentService";
import { useLocation } from "react-router-dom";
import departmentsApi from "../../Model/Data/Departments/Departments";
import employeesApi from "../../Model/Data/Employees/Employees";

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

const DepartmentOption = (props) => {
  const { data, selectProps } = props;
  const toggleDepartment = selectProps?.onDepartmentToggle;
  const loadingMap = selectProps?.subDepartmentsLoadingByDepartment || {};
  const isLoading = Boolean(data?.isParent && loadingMap[data.departmentId]);

  const handleArrowMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!data?.isParent || !data?.hasSubDepartments || typeof toggleDepartment !== "function") {
      return;
    }
    toggleDepartment(data.departmentId);
  };

  const handleArrowClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <selectComponents.Option {...props}>
      <div className="flex items-center justify-between gap-2">
        <span className={data?.isChild ? "pl-4 text-[12px] text-gray-600" : ""}>{data.label}</span>
        {data?.isParent && data?.hasSubDepartments ? (
          <button
            type="button"
            onMouseDown={handleArrowMouseDown}
            onClick={handleArrowClick}
            className="shrink-0 rounded p-1 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Toggle sub-departments"
            title="Toggle sub-departments"
          >
            {isLoading ? (
              <span className="inline-block h-3 w-3 animate-spin rounded-full border border-[#3DA5F4] border-t-transparent" />
            ) : data?.isExpanded ? (
              <FaChevronDown size={12} />
            ) : (
              <FaChevronRight size={12} />
            )}
          </button>
        ) : null}
      </div>
    </selectComponents.Option>
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
    isCreatingSalaryTemplate,
    prefillFromHiringCandidate
  } = useEmployees();

  const location = useLocation();

  const { adminDashboardData, getAdminDashboardData } = useDashboard();
  const activeEmployees = adminDashboardData?.TOTAL_EMPLOYEES ?? 0;
  const employeeLimit = adminDashboardData?.ALLOWED_EMPLOYEES ?? 0;
  const [lastEnrolledEmployeeIdFallback, setLastEnrolledEmployeeIdFallback] = useState("N/A");
  const lastEnrolledEmployeeId =
    adminDashboardData?.LAST_ENROLLED_EMP_ID ??
    adminDashboardData?.last_enrolled_emp_id ??
    lastEnrolledEmployeeIdFallback ??
    "N/A";

  // Content drawer (info icon) – right-side panel with ENGLISH/URDU
  const [contentDrawerOpen, setContentDrawerOpen] = useState(false);
  const [contentData, setContentData] = useState(null);
  const [contentLang, setContentLang] = useState("ENGLISH");
  const [contentLoading, setContentLoading] = useState(false);

  const openContentDrawer = async (contentLabel) => {
    setContentDrawerOpen(true);
    setContentLang("ENGLISH");
    setContentLoading(true);
    setContentData(null);
    try {
      const res = await getContentByLabel(contentLabel);
      if (res?.STATUS === "SUCCESSFUL" && res?.DATA?.[0]?.contents?.length) {
        setContentData(res.DATA[0]);
      } else {
        showToast("Content not available", "error");
        setContentDrawerOpen(false);
      }
    } catch (err) {
      showToast("Failed to load content", "error");
      setContentDrawerOpen(false);
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    getAdminDashboardData();
  }, [getAdminDashboardData]);

  // Fallback: if dashboard didn't provide LAST_ENROLLED_EMP_ID, try a lightweight fetch.
  useEffect(() => {
    const hasDashboardValue =
      adminDashboardData?.LAST_ENROLLED_EMP_ID != null ||
      adminDashboardData?.last_enrolled_emp_id != null;
    if (hasDashboardValue) return;

    let cancelled = false;
    (async () => {
      try {
        const response = await employeesApi.getEmployeesWithFilters({ page: 1, status: 1, limit: 1 });
        const data = response?.data;
        if (cancelled) return;
        if (data?.STATUS === "SUCCESSFUL") {
          const lastEnrolled = data?.lastEnrolledEmployee ?? data?.DB_DATA?.lastEnrolledEmployee;
          const empId = lastEnrolled?.emp_id;
          setLastEnrolledEmployeeIdFallback(empId != null && empId !== "" ? String(empId) : "N/A");
        } else {
          setLastEnrolledEmployeeIdFallback("N/A");
          // OLD (incoming branch):
          // if (data?.STATUS === 'SUCCESSFUL') {
          //   const lastEnrolled = data?.lastEnrolledEmployee ?? data?.DB_DATA?.lastEnrolledEmployee;
          //   const empId = lastEnrolled?.emp_id;
          //   if (empId != null && empId !== '') {
          //     setLastEnrolledEmployeeId(String(empId));
          //   } else {
          //     setLastEnrolledEmployeeId('N/A');
          //   }
          // } else {
          //   setLastEnrolledEmployeeId('N/A');
          // }
        }
      } catch {
        if (!cancelled) setLastEnrolledEmployeeIdFallback("N/A");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [adminDashboardData?.LAST_ENROLLED_EMP_ID, adminDashboardData?.last_enrolled_emp_id]);

  // Fetch branches once on mount for branch dropdown (only required API for this page; avoids global get_branch_employee from hook)
  useEffect(() => {
    fetchingAllBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hiring → Add Employee: skip step 0 and prefill from candidate payload
  useEffect(() => {
    const stateCandidate = location?.state?.prefillCandidate
    const stored = (() => {
      try {
        return JSON.parse(localStorage.getItem("hire_prefill_candidate") || "null")
      } catch {
        return null
      }
    })()

    const candidate = stateCandidate || stored
    if (candidate) {
      prefillFromHiringCandidate(candidate)
      try {
        localStorage.removeItem("hire_prefill_candidate")
      } catch { }
    }
    // Only run on first mount for this route
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
  const [expandedDepartments, setExpandedDepartments] = useState({});
  const [subDepartmentsByDepartment, setSubDepartmentsByDepartment] = useState({});
  const [subDepartmentsLoadingByDepartment, setSubDepartmentsLoadingByDepartment] = useState({});
  const subDepartmentRequestIdRef = useRef({});

  // Load branches when drawer opens
  useEffect(() => {
    if (
      showSalaryTemplateDrawer &&
      (!copyBranchesData || copyBranchesData.length === 0)
    ) {
      getAllBranchesPayroll();
    }
  }, [showSalaryTemplateDrawer, copyBranchesData, getAllBranchesPayroll]);

  useEffect(() => {
    setExpandedDepartments({});
    setSubDepartmentsByDepartment({});
    setSubDepartmentsLoadingByDepartment({});
    subDepartmentRequestIdRef.current = {};
  }, [newEmpValues?.branch?.value]);

  const getSubDepartmentsFromResponse = useCallback((responseData, departmentId) => {
    const dbData = responseData?.DB_DATA;
    const targetDepartmentId = String(departmentId);

    const normalizeSubDepartment = (item) => {
      if (!item || typeof item !== "object") return null;
      const id = item.id ?? item.dept_id ?? item.department_id;
      const name = item.name ?? item.dept_name ?? item.department_name ?? "";
      if (id == null || !name) return null;
      return { id, name };
    };

    const extractFromDepartmentRecord = (departmentRecord) => {
      const rawSub =
        departmentRecord?.sub_departments ||
        departmentRecord?.subDepartments ||
        departmentRecord?.children ||
        [];
      if (!Array.isArray(rawSub)) return [];
      return rawSub.map(normalizeSubDepartment).filter(Boolean);
    };

    const findSubDepartmentsInDepartmentList = (departmentList) => {
      if (!Array.isArray(departmentList)) return [];
      const matchedDepartment = departmentList.find((item) => {
        const currentId = item?.id ?? item?.dept_id ?? item?.department_id;
        return String(currentId) === targetDepartmentId;
      });

      if (matchedDepartment) {
        return extractFromDepartmentRecord(matchedDepartment);
      }

      // Some responses send only one department object for this endpoint.
      if (departmentList.length === 1) {
        return extractFromDepartmentRecord(departmentList[0]);
      }

      return [];
    };

    const fromDepartmentUpper = findSubDepartmentsInDepartmentList(dbData?.DEPARTMENT);
    if (fromDepartmentUpper.length > 0) {
      return fromDepartmentUpper;
    }
    const fromDepartmentLower = findSubDepartmentsInDepartmentList(dbData?.departments);
    if (fromDepartmentLower.length > 0) {
      return fromDepartmentLower;
    }

    if (Array.isArray(dbData?.sub_departments)) {
      return dbData.sub_departments.map(normalizeSubDepartment).filter(Boolean);
    }
    if (Array.isArray(dbData?.subDepartments)) {
      return dbData.subDepartments.map(normalizeSubDepartment).filter(Boolean);
    }
    if (Array.isArray(dbData)) {
      const fromDbArray = findSubDepartmentsInDepartmentList(dbData);
      if (fromDbArray.length > 0) return fromDbArray;
      return dbData.map(normalizeSubDepartment).filter(Boolean);
    }

    return [];
  }, []);

  const handleDepartmentToggle = useCallback(
    async (departmentId) => {
      if (!departmentId) return;
      if (subDepartmentsLoadingByDepartment[departmentId]) return;

      const isAlreadyExpanded = Boolean(expandedDepartments[departmentId]);
      if (isAlreadyExpanded) {
        setExpandedDepartments((prev) => ({ ...prev, [departmentId]: false }));
        return;
      }

      const cachedSubDepartments = subDepartmentsByDepartment[departmentId];
      if (Array.isArray(cachedSubDepartments)) {
        setExpandedDepartments((prev) => ({ ...prev, [departmentId]: true }));
        return;
      }

      setSubDepartmentsLoadingByDepartment((prev) => ({ ...prev, [departmentId]: true }));
      const requestId = `${departmentId}-${Date.now()}-${Math.random()}`;
      subDepartmentRequestIdRef.current[departmentId] = requestId;
      try {
        const response = await departmentsApi.getSubDept({ parent_id: departmentId });
        const responseData = response?.data;
        const subDepartments = getSubDepartmentsFromResponse(responseData, departmentId);

        if (subDepartmentRequestIdRef.current[departmentId] !== requestId) {
          return;
        }

        setSubDepartmentsByDepartment((prev) => ({ ...prev, [departmentId]: subDepartments }));
        if (subDepartments.length > 0) {
          setExpandedDepartments((prev) => ({ ...prev, [departmentId]: true }));
        }
      } catch (error) {
        console.error("Error loading sub-departments:", error);
        showToast("Failed to load sub-departments", "error");
      } finally {
        setSubDepartmentsLoadingByDepartment((prev) => ({ ...prev, [departmentId]: false }));
      }
    },
    [
      expandedDepartments,
      getSubDepartmentsFromResponse,
      subDepartmentsByDepartment,
      subDepartmentsLoadingByDepartment,
    ]
  );

  const departmentOptions = useMemo(() => {
    const departments = Array.isArray(get_all_department) ? get_all_department : [];
    const options = [];

    departments.forEach((department) => {
      const departmentId = department?.id;
      if (departmentId == null) return;

      const initialSubDepartments = Array.isArray(department?.sub_departments)
        ? department.sub_departments
        : [];
      const hasSubDepartments =
        initialSubDepartments.length > 0 ||
        Boolean(department?.has_sub_departments) ||
        Number(department?.children_count || 0) > 0;
      const cachedSubDepartments = subDepartmentsByDepartment[departmentId];
      const resolvedSubDepartments = Array.isArray(cachedSubDepartments)
        ? cachedSubDepartments
        : initialSubDepartments;
      const isExpanded = Boolean(expandedDepartments[departmentId]);

      options.push({
        value: departmentId,
        label: department?.name || "",
        isParent: true,
        isChild: false,
        hasSubDepartments,
        isExpanded,
        departmentId,
      });

      if (isExpanded) {
        resolvedSubDepartments.forEach((subDepartment) => {
          if (subDepartment?.id == null) return;
          options.push({
            value: subDepartment.id,
            label: subDepartment.name || "",
            isParent: false,
            isChild: true,
            parentDepartmentId: departmentId,
          });
        });
      }
    });

    return options;
  }, [expandedDepartments, get_all_department, subDepartmentsByDepartment]);

  const departmentSelectComponents = useMemo(
    () => ({ Option: DepartmentOption }),
    []
  );

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

  /** Personal Information (step 1): show one toast per missing field; used on Next instead of disabling the button */
  const validatePersonalInformation = () => {
    const v = newEmpValues;
    if (!v.country_code) {
      showToast("Please select Country", "error");
      return false;
    }
    if (!v.full_name || !String(v.full_name).trim()) {
      showToast("Please enter full name", "error");
      return false;
    }
    if (!v.father_name || !String(v.father_name).trim()) {
      showToast("Please enter father name", "error");
      return false;
    }
    if (!v.dob) {
      showToast("Please select date of birth", "error");
      return false;
    }
    if (!v.passport || !String(v.passport).trim()) {
      showToast("Please enter CNIC / Passport number", "error");
      return false;
    }
    if (!v.password || !String(v.password).trim()) {
      showToast("Please enter OneID Empleado password", "error");
      return false;
    }
    if (!v.gender) {
      showToast("Please select gender", "error");
      return false;
    }
    const isPakistan = v.country_code?.value === "162";
    if (isPakistan && !v.network) {
      showToast("Please select mobile network", "error");
      return false;
    }
    const ageValidation = validateAge(v.dob);
    if (!ageValidation.isValid) {
      showToast(ageValidation.message, "error");
      return false;
    }
    return true;
  };

  /** Official Information (step 2): show one toast per missing field; used on Submit instead of disabling the button */
  const validateOfficialInformation = () => {
    const v = newEmpValues;
    if (!v.branch) {
      showToast("Please select branch", "error");
      return false;
    }
    if (!v.department) {
      showToast("Please select department", "error");
      return false;
    }
    if (!v.designation) {
      showToast("Please select designation", "error");
      return false;
    }
    if (!v.work_policy) {
      showToast("Please select work policy", "error");
      return false;
    }
    if (!v.salary_template) {
      showToast("Please select salary template", "error");
      return false;
    }
    if (!v.empStatus) {
      showToast("Please select employment status", "error");
      return false;
    }
    if (!v.empID || !String(v.empID).trim()) {
      showToast("Please enter employee ID", "error");
      return false;
    }
    if (!v.joing_date) {
      showToast("Please select joining date", "error");
      return false;
    }
    return true;
  };

  const handleNextClick = () => {
    if (activeStep === 0) {
      handleNext();
      return;
    }
    if (activeStep === 1) {
      if (!validatePersonalInformation()) return;
      handleNext();
    }
  };

  const handleSubmitClick = () => {
    if (!validateOfficialInformation()) return;
    addEmpHandler();
  };

  useEffect(() => {
    handleFirstStep(activeStep === 0);
    handleLastStep(activeStep === 2);
  }, [activeStep, handleFirstStep, handleLastStep]);

  const employeeStepCircleClass = (index) => {
    const locked1 = index === 1 && !findEmployeeCompleted;
    const locked2 = index === 2 && !completedSteps?.has(1);
    if (locked1 || locked2) {
      return "cursor-not-allowed border border-[#8bc9f8] bg-[#f2f6f9] text-[#474747]";
    }
    if (activeStep === index) return "bg-[#8bc9f8] text-white cursor-pointer";
    if (activeStep > index) return "bg-bgBlue text-white cursor-pointer";
    return "bg-gray-300 text-gray-900 cursor-pointer";
  };

  /** Only step 0 (Find Employee) keeps Next disabled until mobile is present */
  const isPrimaryActionDisabled =
    (activeStep === 0 && !isStep0Valid) ||
    (employee_exicute === 1 && isLastStep) ||
    loading ||
    isAddingEmployee;

  return (
    <form>
      <div className="w-full flex flex-col gap-4 py-4 px-[40px] bg-white drop-shadow-md rounded-[10px]">
        <div className="px-4">
          <ThreeSegmentStepper
            variant="employee"
            activeStep={activeStep}
            steps={[
              {
                key: "find",
                icon: <MdOutlineFindReplace className="h-4 w-4" />,
                label: "Find Employee",
                onClick: () => handleStepActive(0),
                circleClassName: employeeStepCircleClass(0),
              },
              {
                key: "personal",
                icon: <FaUser className="h-4 w-4" />,
                label: "Personal Information",
                onClick: () => {
                  if (findEmployeeCompleted) handleStepActive(1);
                },
                circleClassName: employeeStepCircleClass(1),
              },
              {
                key: "official",
                icon: <FaBuildingUser className="h-4 w-4" />,
                label: "Official Information",
                onClick: () => {
                  if (completedSteps?.has(1)) handleStepActive(2);
                },
                circleClassName: employeeStepCircleClass(2),
              },
            ]}
          />
        </div>
        <div className="w-full flex flex-col items-center justify-center">
          <p className="w-full mb-1 mt-10 text-center text-[#474747] text-[12px] font-Urbanist font-semibold px-2 whitespace-nowrap overflow-x-auto">
            You have {activeEmployees} active employee{activeEmployees !== 1 ? 's' : ''}. The available limit is {employeeLimit}. The last enrolled employee ID is {lastEnrolledEmployeeId}.
          </p>
          <div className="mt-2 lg:w-2/5 md:w-1/2 w-full">
            <div className="pb-4">
              <span className="text-[#474747] text-[16px] font-Urbanist font-medium">Employee Account Credentials</span>
            </div>
            {activeStep === 0 ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="w-full flex flex-col gap">
                  <div className="flex items-center gap-2">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Mobile No</label>
                    <FaInfoCircle
                      className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0"
                      onClick={() => openContentDrawer("MOBILENO_EMPLOYEES_EMP")}
                    />
                  </div>
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
                  <div className="flex items-center gap-2">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Email (Optional)</label>
                    <FaInfoCircle
                      className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0"
                      onClick={() => openContentDrawer("PERSONALEMAIL_EMPLOYEES_EMP")}
                    />
                  </div>
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
                  <div className="flex items-center gap-2">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Full Name</label>
                    <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("FULLNAME_EMPLOYEES_EMP")} />
                  </div>
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
                  <div className="flex items-center gap-2">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Father Name</label>
                    <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("FATHERNAME_EMPLOYEES_EMP")} />
                  </div>
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
                  <div className="flex items-center gap-2">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Select Country</label>
                    <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("COUNTRY_EMPLOYEES_EMP")} />
                  </div>
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
                        fontSize: "12px", // Font size for the control (input box)
                        minHeight: "38px",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: "12px", // Font size for the selected value
                        color: "#474747",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "12px", // Font size for the placeholder text
                        color: "#698592",
                      }),
                      option: (base, state) => ({
                        ...base,
                        fontSize: "14px", // Font size for each option in the dropdown
                        padding: "10px 12px", // Proper padding for readable options
                        backgroundColor: state.isSelected 
                          ? "#f3f4f6" 
                          : state.isFocused 
                          ? "#f9fafb" 
                          : base.backgroundColor,
                        color: state.isSelected ? "#111827" : "#495057",
                        cursor: "pointer",
                        ":active": {
                          backgroundColor: "#e5e7eb",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        fontSize: "14px", // Font size for the dropdown menu
                        zIndex: 9999,
                        boxShadow: "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      }),
                      menuList: (base) => ({
                        ...base,
                        fontSize: "14px", // Font size for the menu list
                        maxHeight: "300px",
                        padding: "4px 0",
                      }),
                    }}
                  />
                </div>
                {/* Show network selection by default, hide only for non-Pakistan countries */}
                {(!newEmpValues.country_code ||
                  newEmpValues.country_code.value === "162") && (
                    <div className="w-full flex flex-col">
                      <div className="flex items-center gap-2">
                        <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Select Network</label>
                        <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("MOBILENETWORK_EMPLOYEES_EMP")} />
                      </div>
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
                            fontSize: "12px", // Font size for the control (input box)
                            minHeight: "38px",
                          }),
                          singleValue: (base) => ({
                            ...base,
                            fontSize: "12px", // Font size for the selected value
                            color: "#474747",
                          }),
                          placeholder: (base) => ({
                            ...base,
                            fontSize: "12px", // Font size for the placeholder text
                            color: "#698592",
                          }),
                          option: (base, state) => ({
                            ...base,
                            fontSize: "14px", // Font size for each option in the dropdown
                            padding: "10px 12px", // Proper padding for readable options
                            backgroundColor: state.isSelected 
                              ? "#f3f4f6" 
                              : state.isFocused 
                              ? "#f9fafb" 
                              : base.backgroundColor,
                            color: state.isSelected ? "#111827" : "#495057",
                            cursor: "pointer",
                            ":active": {
                              backgroundColor: "#e5e7eb",
                            },
                          }),
                          menu: (base) => ({
                            ...base,
                            fontSize: "14px", // Font size for the dropdown menu
                            zIndex: 9999,
                            boxShadow: "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          }),
                          menuList: (base) => ({
                            ...base,
                            fontSize: "14px", // Font size for the menu list
                            maxHeight: "300px",
                            padding: "4px 0",
                          }),
                        }}
                      />
                    </div>
                  )}

                <div className="w-full flex flex-col">
                  <div className="flex items-center gap-2">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Date of Birth</label>
                    <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("DOB_EMPLOYEES_EMP")} />
                  </div>
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
                  <div className="flex items-center gap-2">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">CNIC/Passport Number</label>
                    <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("PASSPORTCNIC_EMPLOYEES_EMP")} />
                  </div>
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
                  <div className="flex items-center gap-2">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">OneID Empleado password</label>
                    <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("ONEIDPASSWORD_EMPLOYEES_EMP")} />
                  </div>
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
                  <div className="flex items-center gap-2">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
                      Select Branch
                    </label>
                    <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("BRANCH_EMPLOYEES_EMP")} />
                  </div>
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
                        fontSize: "12px",
                        minHeight: "38px",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: "12px",
                        color: "#474747",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "12px",
                        color: "#698592",
                      }),
                      option: (base, state) => ({
                        ...base,
                        fontSize: "14px",
                        padding: "10px 12px",
                        backgroundColor: state.isSelected 
                          ? "#f3f4f6" 
                          : state.isFocused 
                          ? "#f9fafb" 
                          : base.backgroundColor,
                        color: state.isSelected ? "#111827" : "#495057",
                        cursor: "pointer",
                        ":active": {
                          backgroundColor: "#e5e7eb",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        fontSize: "14px",
                        zIndex: 9999,
                        boxShadow: "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      }),
                      menuList: (base) => ({
                        ...base,
                        fontSize: "14px",
                        maxHeight: "300px",
                        padding: "4px 0",
                      }),
                    }}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <div className="flex items-center gap-2">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
                      Select Department
                    </label>
                    <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("DEPARTMENT_EMPLOYEES_EMP")} />
                  </div>
                  <CustomSelect
                    placeHolderTitle="Department"
                    value={newEmpValues?.department}
                    options={departmentOptions}
                    onChangeHandler={(selectedOption) =>
                      handleSelectChange(selectedOption, "department")
                    }
                    cStyle={true}
                    components={departmentSelectComponents}
                    onDepartmentToggle={handleDepartmentToggle}
                    subDepartmentsLoadingByDepartment={subDepartmentsLoadingByDepartment}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <div className="flex items-center gap-2">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
                      Select Designation
                    </label>
                    <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("DESIGNATION_EMPLOYEES_EMP")} />
                  </div>
                  <CustomSelect
                    placeHolderTitle="Designation"
                    value={newEmpValues?.designation}
                    options={designations?.map((ele) => ({
                      value: ele.id ?? ele.designation_id ?? ele.d_id,
                      label: ele.title ?? ele.name ?? ele.designation ?? ele.d_title ?? '',
                    })) ?? []}
                    onChangeHandler={(selectedOption) =>
                      handleSelectChange(selectedOption, "designation")
                    }
                    cStyle={true}
                    customStyles={{
                      control: (base) => ({
                        ...base,
                        fontSize: "12px",
                        minHeight: "38px",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: "12px",
                        color: "#474747",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "12px",
                        color: "#698592",
                      }),
                      option: (base, state) => ({
                        ...base,
                        fontSize: "14px",
                        padding: "10px 12px",
                        backgroundColor: state.isSelected 
                          ? "#f3f4f6" 
                          : state.isFocused 
                          ? "#f9fafb" 
                          : base.backgroundColor,
                        color: state.isSelected ? "#111827" : "#495057",
                        cursor: "pointer",
                        ":active": {
                          backgroundColor: "#e5e7eb",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        fontSize: "14px",
                        zIndex: 9999,
                        boxShadow: "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      }),
                      menuList: (base) => ({
                        ...base,
                        fontSize: "14px",
                        maxHeight: "300px",
                        padding: "4px 0",
                      }),
                    }}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <div className="flex items-center gap-2">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
                      Select Reporting Manager (Optional)
                    </label>
                    <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("REPORTING_MANAGER_EMPLOYEES_EMP")} />
                  </div>
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
                        fontSize: "12px",
                        minHeight: "38px",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: "12px",
                        color: "#474747",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "12px",
                        color: "#698592",
                      }),
                      option: (base, state) => ({
                        ...base,
                        fontSize: "14px",
                        padding: "10px 12px",
                        backgroundColor: state.isSelected 
                          ? "#f3f4f6" 
                          : state.isFocused 
                          ? "#f9fafb" 
                          : base.backgroundColor,
                        color: state.isSelected ? "#111827" : "#495057",
                        cursor: "pointer",
                        ":active": {
                          backgroundColor: "#e5e7eb",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        fontSize: "14px",
                        zIndex: 9999,
                        boxShadow: "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      }),
                      menuList: (base) => ({
                        ...base,
                        fontSize: "14px",
                        maxHeight: "300px",
                        padding: "4px 0",
                      }),
                    }}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <div className="flex items-center gap-2">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
                      Select Work Policy
                    </label>
                    <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("WORKPOLICY_EMPLOYEES_EMP")} />
                  </div>
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
                        fontSize: "12px",
                        minHeight: "38px",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: "12px",
                        color: "#474747",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "12px",
                        color: "#698592",
                      }),
                      option: (base, state) => ({
                        ...base,
                        fontSize: "14px",
                        padding: "10px 12px",
                        backgroundColor: state.isSelected 
                          ? "#f3f4f6" 
                          : state.isFocused 
                          ? "#f9fafb" 
                          : base.backgroundColor,
                        color: state.isSelected ? "#111827" : "#495057",
                        cursor: "pointer",
                        ":active": {
                          backgroundColor: "#e5e7eb",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        fontSize: "14px",
                        zIndex: 9999,
                        boxShadow: "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      }),
                      menuList: (base) => ({
                        ...base,
                        fontSize: "14px",
                        maxHeight: "300px",
                        padding: "4px 0",
                      }),
                    }}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <div className="flex items-center gap-2">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
                      Select Employement Status
                    </label>
                    <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("EMPLOYMENTSTATUS_EMPLOYEES_EMP")} />
                  </div>
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
                        fontSize: "12px",
                        minHeight: "38px",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontSize: "12px",
                        color: "#474747",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        fontSize: "12px",
                        color: "#698592",
                      }),
                      option: (base, state) => ({
                        ...base,
                        fontSize: "14px",
                        padding: "10px 12px",
                        backgroundColor: state.isSelected 
                          ? "#f3f4f6" 
                          : state.isFocused 
                          ? "#f9fafb" 
                          : base.backgroundColor,
                        color: state.isSelected ? "#111827" : "#495057",
                        cursor: "pointer",
                        ":active": {
                          backgroundColor: "#e5e7eb",
                        },
                      }),
                      menu: (base) => ({
                        ...base,
                        fontSize: "14px",
                        zIndex: 9999,
                        boxShadow: "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      }),
                      menuList: (base) => ({
                        ...base,
                        fontSize: "14px",
                        maxHeight: "300px",
                        padding: "4px 0",
                      }),
                    }}
                  />
                </div>
                <div className="flex items-center space-x-2 w-full">
                  <div className="flex-1 flex-col">
                    <div className="flex items-center gap-2">
                      <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
                        Select Salary Template
                      </label>
                      <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("SALARYTEMPLATE_EMPLOYEES_EMP")} />
                    </div>
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
                      className="text-2xl cursor-pointer bg-bgBlue text-white rounded-md w-10 h-10 flex items-center justify-center hover:bg-blue-500 transition-colors"
                      onClick={handleOpenSalaryTemplateDrawer}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="w-full flex flex-col">
                  <div className="flex items-center gap-2">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Employee ID</label>
                    <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("EMPLOYEEID_EMPLOYEES_EMP")} />
                  </div>
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
                  <div className="flex items-center gap-2">
                    <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Joining Date</label>
                    <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("JOININGDATE_EMPLOYEES_EMP")} />
                  </div>
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
                className="capitalize cursor-pointer"
                disabled={loading || isAddingEmployee}
              >
                Prev
              </Button>
            )}
            <Button
              onClick={isLastStep ? handleSubmitClick : handleNextClick}
              className={`capitalize cursor-pointer bg-[#2196f3] ${isLastStep ? "bg-bgBlue" : ""
                }`}
              disabled={isPrimaryActionDisabled}
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

      {/* Content info drawer (right side) – ENGLISH / URDU */}
      <PortalDrawer
        open={contentDrawerOpen}
        closeDrawer={() => setContentDrawerOpen(false)}
        direction="right"
        widthSize="45vw"
        title={
          contentData?.contents?.find((c) => c.lang === contentLang)?.main_heading ?? ""
        }
        compo={
          <div className="flex flex-col gap-4">
            {contentLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#3DA5F4] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : contentData?.contents?.length ? (
              <>
                <div
                  className="text-gray-800 text-sm font-Urbanist leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      contentData.contents.find((c) => c.lang === contentLang)?.content ??
                      contentData.contents.find((c) => c.lang === "ENGLISH")?.content ??
                      "",
                  }}
                />
                <div className="flex gap-2 mt-4 border-t border-gray-200 pt-4">
                  <Button
                    size="sm"
                    className={`flex-1 font-Urbanist text-[12px] ${
                      contentLang === "ENGLISH" ? "bg-[#3DA5F4] text-white" : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setContentLang("ENGLISH")}
                  >
                    ENGLISH
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 font-Urbanist text-[12px] ${
                      contentLang === "URDU" ? "bg-[#3DA5F4] text-white" : "bg-gray-200 text-gray-700"
                    }`}
                    onClick={() => setContentLang("URDU")}
                  >
                    URDU
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        }
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

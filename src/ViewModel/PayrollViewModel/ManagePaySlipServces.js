import { useReducer, useEffect, useRef, useState } from "react";
import useStore from "../../Store/store";
import { gettingDepartmentsServices } from "../../services/__frequentApiServices";
import payrollApi from "../../Model/Data/Payroll/Payroll";

// localStorage key for persisting Generate Payslip filters
const GENERATE_PAYSLIP_FILTERS_KEY = "generatePayslipFilters";

export const ALL_BRANCH_OPTION = { value: "all", label: "All Branch" };

// Helper function to load filters from localStorage
const loadFiltersFromStorage = () => {
  try {
    const savedFilters = localStorage.getItem(GENERATE_PAYSLIP_FILTERS_KEY);
    if (savedFilters) {
      return JSON.parse(savedFilters);
    }
  } catch (error) {
    console.error("Error loading Generate Payslip filters from localStorage:", error);
  }
  return null;
};

// Helper function to save filters to localStorage (department only — branch always defaults to All Branch on load)
const saveFiltersToStorage = (filters) => {
  try {
    const filtersToSave = {
      department_id: filters.department_id,
    };
    localStorage.setItem(GENERATE_PAYSLIP_FILTERS_KEY, JSON.stringify(filtersToSave));
  } catch (error) {
    console.error("Error saving Generate Payslip filters to localStorage:", error);
  }
};

const getDefaultInitialState = () => ({
  view: 0,
  departments: [],
  department_id: null,
  branch_id: ALL_BRANCH_OPTION,
  type: null,
  empSalary: [],
  originalEmpSalary: [],
  search_emp: "",
  showFilter: true,
  loading: true,
});

const buildInitialState = () => {
  const defaults = getDefaultInitialState();
  const saved = loadFiltersFromStorage();
  if (!saved) return defaults;
  const merged = { ...defaults, ...saved };
  // Always open this page with "All Branch" — do not restore a previously selected branch from storage
  merged.branch_id = ALL_BRANCH_OPTION;
  if (!merged.department_id || typeof merged.department_id !== "object") {
    merged.department_id = null;
  }
  return merged;
};

const useManagePaySlip = () => {
  const getAllBranchesPayroll = useStore((state) => state.getAllBranchesPayroll);
  const branches_payroll = useStore((state) => state.branches_payroll);
  const branchesLoaded = useStore((state) => state.branchesLoaded);

  const [departmentMenuLoading, setDepartmentMenuLoading] = useState(false);

  const managePyaSlipReducer = (state, action) => {
    switch (action.type) {
      case 1:
        getAllBranchesPayroll();
        return { ...state, view: action.payload };

      case 2:
        return { ...state, view: action.payload };

      case "BRANCH":
        return {
          ...state,
          branch_id: action.value,
          showFilter: true,
          departments: action.payload,
          department_id: null,
        };

      case "SET_DEPARTMENTS":
        return { ...state, departments: action.payload };

      case "SELECTION":
        return { ...state, [action.field]: action.value };

      case "EMP_SALARY":
        return {
          ...state,
          empSalary: action.payload,
          originalEmpSalary: action.payload,
          loading: false,
        };

      case "SET_LOADING":
        return { ...state, loading: action.payload };

      default:
        return state;
    }
  };

  const [managePaySlipState, dispatch] = useReducer(managePyaSlipReducer, undefined, buildInitialState);

  const initEmployeesRan = useRef(false);

  // Single initial load: branches list + departments for current branch + employee list (no duplicate fetch from the view)
  useEffect(() => {
    if (initEmployeesRan.current) return;
    initEmployeesRan.current = true;

    getAllBranchesPayroll();

    const branch = managePaySlipState.branch_id ?? ALL_BRANCH_OPTION;
    const savedDept = managePaySlipState.department_id;

    const run = async () => {
      setDepartmentMenuLoading(true);
      try {
        let depts = [];
        if (!branch?.value || branch.value === "all") {
          depts = await gettingDepartmentsServices(0);
        } else {
          depts = await gettingDepartmentsServices(branch.value);
        }
        if (!Array.isArray(depts)) depts = [];
        dispatch({ type: "SET_DEPARTMENTS", payload: depts });

        let deptToUse = savedDept;
        if (
          savedDept &&
          savedDept.value !== "all" &&
          !depts.some((d) => String(d.value) === String(savedDept.value))
        ) {
          deptToUse = null;
          dispatch({ type: "SELECTION", field: "department_id", value: null });
        }

        const deptId =
          deptToUse && deptToUse.value !== "all" ? deptToUse.value : null;

        if (!branch?.value || branch.value === "all") {
          await gettingAllEmpSalary(deptId);
        } else {
          await gettingEmpSalary(branch, deptId);
        }
      } finally {
        setDepartmentMenuLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save filters to localStorage whenever branch_id or department_id changes
  useEffect(() => {
    saveFiltersToStorage({
      branch_id: managePaySlipState.branch_id,
      department_id: managePaySlipState.department_id,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managePaySlipState.branch_id, managePaySlipState.department_id]);

  const managePaySlip = (data) => {
    dispatch({ type: data.id, payload: data.id });
  };

  const handleSelectManagePaySlip = async (selected, field) => {
    if (field === "branch_id") {
      dispatch({ type: "EMP_SALARY", payload: [] });

      if (selected.value === "all") {
        dispatch({ type: "BRANCH", value: selected, payload: [] });
        setDepartmentMenuLoading(true);
        try {
          const data = await gettingDepartmentsServices(0);
          dispatch({ type: "SET_DEPARTMENTS", payload: Array.isArray(data) ? data : [] });
        } finally {
          setDepartmentMenuLoading(false);
        }
        gettingAllEmpSalary(null);
      } else {
        setDepartmentMenuLoading(true);
        try {
          const data = await gettingDepartmentsServices(selected.value);
          dispatch({
            type: "BRANCH",
            value: selected,
            payload: Array.isArray(data) ? data : [],
          });
        } finally {
          setDepartmentMenuLoading(false);
        }
        gettingEmpSalary(selected, null);
      }
    } else if (field === "department_id") {
      const branchSnap = managePaySlipState.branch_id;
      dispatch({ type: "EMP_SALARY", payload: [] });
      dispatch({ type: "SELECTION", field, value: selected });

      const deptId = selected && selected.value !== "all" ? selected.value : null;

      if (!branchSnap || branchSnap.value === "all") {
        gettingAllEmpSalary(deptId);
      } else {
        gettingEmpSalary(branchSnap, deptId);
      }
    } else {
      dispatch({ type: "SELECTION", field, value: selected });
    }
  };

  const gettingEmpSalary = async (branchData, deptId = null) => {
    dispatch({ type: "SET_LOADING", payload: true });
    const apiData = {
      bid: branchData?.value || branchData,
      did: deptId && deptId !== "all" ? deptId : "",
      get_all: true,
    };
    try {
      const response = await payrollApi.empPaySlip(apiData);
      const responseData = response.data;

      if (
        response.status === 200 &&
        (responseData.STATUS === "SUCCESSFUL" || responseData.STATUS === "SUCCESS")
      ) {
        let employeeData = [];

        if (responseData.DATA?.data && Array.isArray(responseData.DATA.data)) {
          employeeData = responseData.DATA.data;
        } else if (responseData.DB_DATA && Array.isArray(responseData.DB_DATA)) {
          employeeData = responseData.DB_DATA;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          employeeData = responseData.data;
        } else if (Array.isArray(responseData)) {
          employeeData = responseData;
        }

        dispatch({ type: "EMP_SALARY", payload: employeeData });
      } else {
        dispatch({ type: "EMP_SALARY", payload: [] });
      }
    } catch (err) {
      dispatch({ type: "EMP_SALARY", payload: [] });
    }
  };

  const gettingAllEmpSalary = async (deptId = null) => {
    dispatch({ type: "SET_LOADING", payload: true });
    const apiData = {
      bid: 0,
      did: deptId && deptId !== "all" ? deptId : "",
      get_all: true,
    };
    try {
      const response = await payrollApi.empPaySlip(apiData);
      const responseData = response.data;

      if (
        response.status === 200 &&
        (responseData.STATUS === "SUCCESSFUL" || responseData.STATUS === "SUCCESS")
      ) {
        let employeeData = [];

        if (responseData.DATA?.data && Array.isArray(responseData.DATA.data)) {
          employeeData = responseData.DATA.data;
        } else if (responseData.DB_DATA && Array.isArray(responseData.DB_DATA)) {
          employeeData = responseData.DB_DATA;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          employeeData = responseData.data;
        } else if (Array.isArray(responseData)) {
          employeeData = responseData;
        }

        dispatch({ type: "EMP_SALARY", payload: employeeData });
      } else {
        dispatch({ type: "EMP_SALARY", payload: [] });
      }
    } catch (err) {
      dispatch({ type: "EMP_SALARY", payload: [] });
    }
  };

  return {
    managePaySlip,
    managePaySlipState,
    branches_payroll,
    branchesLoaded,
    departmentMenuLoading,
    handleSelectManagePaySlip,
  };
};

// Export function to clear Generate Payslip filters from localStorage
export const clearGeneratePayslipFilters = () => {
  try {
    localStorage.removeItem(GENERATE_PAYSLIP_FILTERS_KEY);
  } catch (error) {
    console.error("Error clearing Generate Payslip filters from localStorage:", error);
  }
};

export default useManagePaySlip;

import payrollApi from "../../Model/Data/Payroll/Payroll";
import React, { useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import { FaListUl } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import usePayroll from "../../ViewModel/PayrollViewModel/PayrollServices";
import GridManageEmpSalary from "./GridManageEmpSalary";
import ManageEmpSalaryList from "./ManageEmpSalaryList";
import { ManageEmployeesSalarySkeleton, EmployeeSalaryTableSkeleton } from "./PayrollSkeletons";
import { gettingDepartmentsServices } from "../../services/__frequentApiServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";

const ManageEmployeesSalary = () => {
  const {
    listViewPayroll,
    gettingManageEmpSalary,
    handleEmpSalaryChange,
    handleListTogglePayroll,
    handleGridTogglePayroll,
    allEmpSalary,
    empSalaryTemplate,
    copyBranchesData,
    getAllBranchesPayroll,
    empSalaryLoaded,
    branchesLoaded,
  } = usePayroll();

  const [filters, setFilters] = React.useState({
    branch: { id: 0, name: "All Branches" },
    department: { id: 0, name: "All Departments" },
    template: { id: "", name: "" },
  });

  const [departments, setDepartments] = React.useState([]);
  const [templates, setTemplates] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState("");
  // const [departmentsWithEmployees, setDepartmentsWithEmployees] = React.useState({});

  useEffect(() => {
    getAllBranchesPayroll();
    // Initial load with All Branches (branch_id=0), no template filter
    gettingManageEmpSalary(0, null, "", false, null, true);
  }, [getAllBranchesPayroll, gettingManageEmpSalary]);

  // Ensure filters are properly initialized only once on mount
  useEffect(() => {
    setFilters((prev) => ({
      branch:
        prev.branch && typeof prev.branch === "object"
          ? prev.branch
          : { id: 0, name: "All Branches" },
      department:
        prev.department && typeof prev.department === "object"
          ? prev.department
          : { id: 0, name: "All Departments" },
      template:
        prev.template && typeof prev.template === "object"
          ? prev.template
          : { id: "", name: "" },
    }));
  }, []); // Empty dependency array - only run once on mount

  const fetchTemplatesByBranchDept = async (branchId, deptId) => {
    try {
      const response = await payrollApi.getSalaryTemp(
        branchId,
        "",
        0,
        100,
        deptId
      );
      const data = response.data;

      if (data && data.success === true && data.data?.salary_data) {
        setTemplates(data.data.salary_data);
      } else {
        setTemplates([]);
      }
    } catch (error) {
      setTemplates([]);
    }
  };

  const handleFilterChange = async (value, field) => {
    // Handle null, undefined values - use 0 for "All" options
    const val =
      value === null || value === undefined
        ? field === "branch" || field === "department"
          ? 0
          : ""
        : value;

    if (field === "branch") {
      setTemplates([]);
      setDepartments([]);
      setSearchValue(""); // Clear search when branch changes
      // setDepartmentsWithEmployees({});

      // Find the branch name from copyBranchesData (guard: ensure it's an array)
      const selectedBranch = Array.isArray(copyBranchesData)
        ? copyBranchesData.find((branch) => String(branch.id) === String(val))
        : undefined;
      const branchName = selectedBranch
        ? selectedBranch.branch_name
        : val === 0
        ? "All Branches"
        : "";

      const newFilters = {
        branch: { id: val, name: branchName },
        department: { id: 0, name: "All Departments" },
        template: { id: "", name: "" },
      };
      setFilters(newFilters);

      // Always send branch_id, even if it's 0 (for All Branches)
      if (val !== null && val !== undefined && val !== "") {
        try {
          const branchId = val === 0 ? 0 : parseInt(val);
          // Get template_id from filters if template is selected, otherwise null
          const templateId = filters.template && filters.template.id && filters.template.id !== ""
            ? parseInt(filters.template.id)
            : null;
          await gettingManageEmpSalary(branchId, null, "", false, templateId, true);
        } catch (error) {
          // Error handling
        }

        try {
          const branchId = val === 0 ? 0 : val;
          const departmentsData = await gettingDepartmentsServices(branchId);
          if (departmentsData && departmentsData.length > 0) {
            // const employeeDeptMap = {};
            // departmentsData.forEach((dept) => {
            //   if (dept.employees && dept.employees.length > 0) {
            //     dept.employees.forEach((emp) => {
            //       employeeDeptMap[emp.id] = dept.id;
            //     });
            //   }
            // });
            // setDepartmentsWithEmployees(employeeDeptMap);
          }
          setDepartments(departmentsData || []);
        } catch (error) {
          setDepartments([]);
        }

        try {
          const branchId = val === 0 ? 0 : parseInt(val);
          // When All Branches is selected, also send deptt_id=0 for All Departments
          const response = await payrollApi.getSalaryTemp(
            branchId,
            "",
            0,
            1000,
            0
          );
          const data = response.data;
          if (data && data.success === true && data.data?.salary_data) {
            setTemplates(data.data.salary_data);
          } else {
            setTemplates([]);
          }
        } catch (error) {
          setTemplates([]);
        }
      } else {
        // Get template_id from filters if template is selected, otherwise null
        const templateId = filters.template && filters.template.id && filters.template.id !== ""
          ? parseInt(filters.template.id)
          : null;
        await gettingManageEmpSalary(0, null, "", false, templateId, true);
      }
    } else if (field === "department") {
      setSearchValue(""); // Clear search when department changes
      // Find the department name from departments array
      const selectedDepartment = departments?.find(
        (dept) => String(dept.value) === String(val)
      );
      const departmentName = selectedDepartment
        ? selectedDepartment.label
        : val === 0
        ? "All Departments"
        : "";

      const newFilters = {
        ...filters,
        department: { id: val, name: departmentName },
        template: { id: "", name: "" },
      };
      setFilters(newFilters);

      // Always send branch_id if selected, even if it's 0 (for All Branches)
      // Always send deptt_id if selected, even if it's 0 (for All Departments)
      if (
        filters.branch &&
        (filters.branch.id === 0 ||
          (filters.branch.id && filters.branch.id !== ""))
      ) {
        try {
          const branchId =
            filters.branch.id === 0 ? 0 : parseInt(filters.branch.id);
          const deptId = val === 0 ? 0 : val ? parseInt(val) : null;
          // Get template_id from filters if template is selected, otherwise null
          const templateId = filters.template && filters.template.id && filters.template.id !== ""
            ? parseInt(filters.template.id)
            : null;
          await gettingManageEmpSalary(
            branchId,
            deptId,
            "",
            false, // forceReload
            templateId, // template_id from filters, not hardcoded
            true, // get_all
            null
          );
        } catch (error) {
          // Error handling
        }
      }

      // Always send deptt_id when department is selected, even if it's 0 (for All Departments)
      if (
        val !== null &&
        val !== undefined &&
        val !== "" &&
        filters.branch &&
        (filters.branch.id === 0 ||
          (filters.branch.id && filters.branch.id !== ""))
      ) {
        const branchId =
          filters.branch.id === 0 ? 0 : parseInt(filters.branch.id);
        const deptId = val === 0 ? 0 : parseInt(val);
        await fetchTemplatesByBranchDept(branchId, deptId);
      } else if (
        filters.branch &&
        (filters.branch.id === 0 ||
          (filters.branch.id && filters.branch.id !== ""))
      ) {
        try {
          const branchId =
            filters.branch.id === 0 ? 0 : parseInt(filters.branch.id);
          // When All Departments is selected, send deptt_id=0
          const response = await payrollApi.getSalaryTemp(
            branchId,
            "",
            0,
            100,
            0
          );
          const data = response.data;
          if (data && data.success === true && data.data?.salary_data) {
            setTemplates(data.data.salary_data);
          } else {
            setTemplates([]);
          }
        } catch (error) {
          setTemplates([]);
        }
      }
    } else if (field === "template") {
      setSearchValue(""); // Clear search when template changes
      // Find the template name from templates array
      const selectedTemplate = templates?.find(
        (temp) => String(temp.id) === String(val)
      );
      const templateName = selectedTemplate ? selectedTemplate.name : "";

      const newFilters = {
        ...filters,
        template: { id: val, name: templateName },
      };
      setFilters(newFilters);

      // Always send branch_id if selected, even if it's 0 (for All Branches)
      // Always send deptt_id if selected, even if it's 0 (for All Departments)
      if (
        filters.branch &&
        (filters.branch.id === 0 ||
          (filters.branch.id && filters.branch.id !== ""))
      ) {
        try {
          const branchId =
            filters.branch.id === 0 ? 0 : parseInt(filters.branch.id);
          const deptId =
            filters.department &&
            (filters.department.id === 0 || filters.department.id)
              ? filters.department.id === 0
                ? 0
                : parseInt(filters.department.id)
              : null;
          // Use the newly selected template ID (val) instead of filters.template.id
          // because setFilters is asynchronous and filters.template.id still has the old value
          const templateId = val && val !== "" && val !== null && val !== undefined
            ? parseInt(val) 
            : null;
          
          await gettingManageEmpSalary(
            branchId,
            deptId,
            "",
            false, // forceReload
            templateId, // template_id from newly selected value
            true // get_all
          );
        } catch (error) {
          // Error handling
        }
      }
    } else {
      setFilters((prev) => ({
        ...prev,
        [field]: val,
      }));
    }
  };

  const filteredEmployees = React.useMemo(() => {
    return allEmpSalary || [];
  }, [allEmpSalary, filters]);

  const templatesForChild =
    empSalaryTemplate && empSalaryTemplate.length > 0
      ? empSalaryTemplate
      : templates;

  return (
    <>
      {!branchesLoaded ? (
        <ManageEmployeesSalarySkeleton />
      ) : (
        <div className="flex flex-col gap-4 lg:px-2 md:px-2 px-0">
          <div className="font-medium text-[16px] text-[#474747] font-Poppins">
            Manage Employees Salary
          </div>

          <div className="flex lg:flex-row md:flex-row flex-col lg:items-end md:items-end items-start gap-5 justify-between">
            <div className="flex flex-wrap gap-2">
              {/* Branch Filter */}
              <div className="lg:w-48 md:w-48 w-full">
                <label className="text-[#474747] text-[12px] font-medium px-2">
                  Branch
                </label>
                <CustomSelect
                  placeHolderTitle="Filter by Branch"
                  value={
                    filters.branch?.id !== undefined &&
                    filters.branch?.id !== null &&
                    filters.branch?.id !== ""
                      ? { value: filters.branch.id, label: filters.branch.name }
                      : null
                  }
                  options={[
                    { value: 0, label: "All Branches" },
                    ...(Array.isArray(copyBranchesData) ? copyBranchesData.map((branch) => ({
                      value: branch.id,
                      label: branch.branch_name,
                    })) : []),
                  ]}
                  onChangeHandler={(selectedOption) =>
                    handleFilterChange(
                      selectedOption?.value !== undefined
                        ? selectedOption.value
                        : 0,
                      "branch"
                    )
                  }
                  customStyles={false}
                />
              </div>

              {/* Department Filter */}
              <div className="lg:w-48 md:w-48 w-full">
                <label className="text-[#474747] text-[12px] font-medium px-2">
                  Department
                </label>
                <CustomSelect
                  placeHolderTitle="Filter by Department"
                  value={
                    filters.department?.id !== undefined &&
                    filters.department?.id !== null &&
                    filters.department?.id !== ""
                      ? {
                          value: filters.department.id,
                          label: filters.department.name,
                        }
                      : null
                  }
                  options={[
                    { value: 0, label: "All Departments" },
                    ...(departments || []),
                  ]}
                  onChangeHandler={(selectedOption) =>
                    handleFilterChange(
                      selectedOption?.value !== undefined
                        ? selectedOption.value
                        : 0,
                      "department"
                    )
                  }
                  customStyles={false}
                />
              </div>

              {/* Template Filter */}
              <div className="lg:w-48 md:w-48 w-full">
                <label className="text-[#474747] text-[12px] font-medium px-2">
                  Salary Template
                </label>
                <CustomSelect
                  placeHolderTitle="Salary Template"
                  value={
                    filters.template?.id
                      ? {
                          value: filters.template.id,
                          label: filters.template.name,
                        }
                      : null
                  }
                  options={[
                    { value: "", label: "All Templates" },
                    ...(templates?.map((temp) => ({
                      value: temp.id,
                      label: temp.name,
                    })) || []),
                  ]}
                  onChangeHandler={(selectedOption) =>
                    handleFilterChange(selectedOption?.value || "", "template")
                  }
                  customStyles={false}
                />
              </div>

              {/* Search Input */}
              <div className="lg:w-48 md:w-48 w-full">
                <label className="text-[#474747] text-[12px] font-medium px-2">
                  Search Employees
                </label>
                <div className="relative w-full min-w-[200px] h-9">
                  <div className="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-2/4 right-3 -translate-y-2/4">
                    <span>
                      <BiSearch />
                    </span>
                  </div>
                  <input
                    className="w-full h-[39px] px-3 text-black shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)] py-2 text-[12px] border-none outline-none rounded-[10px] bg-white text-left"
                    placeholder="Search Employees"
                    name="searchEmployee"
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                      handleEmpSalaryChange(e);
                    }}
                  />
                  {/* <label className="flex w-full h-full select-none pointer-events-none absolute left-0 !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-blue-400 after:border-blue-gray-200 peer-focus:after:!border-blue-400">
                  Search Employees
                </label> */}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pr-2">
              <span
                className="cursor-pointer text-[#9B9B9B]"
                style={{ color: listViewPayroll ? "#3DA5F4" : "" }}
                onClick={handleListTogglePayroll}
              >
                <FaListUl />
              </span>
              <span
                className="cursor-pointer text-[#9B9B9B]"
                style={{ color: listViewPayroll ? "" : "#3DA5F4" }}
                onClick={handleGridTogglePayroll}
              >
                <IoGrid />
              </span>
            </div>
          </div>

          {/* Employee List or Grid */}
          {!empSalaryLoaded ? (
            <EmployeeSalaryTableSkeleton />
          ) : allEmpSalary?.length === 0 ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
                fontSize: "18px",
                color: "#666",
              }}
            >
              No data found
            </div>
          ) : listViewPayroll ? (
            <ManageEmpSalaryList
              allEmpSalary={filteredEmployees}
              templates={templatesForChild}
              onRefresh={async () => {
                // Always send branch_id if selected, even if it's 0 (for All Branches)
                // Always send deptt_id if selected, even if it's 0 (for All Departments)
                if (
                  filters.branch &&
                  (filters.branch.id === 0 ||
                    (filters.branch.id && filters.branch.id !== ""))
                ) {
                  const branchId =
                    filters.branch.id === 0 ? 0 : parseInt(filters.branch.id);
                  const deptId =
                    filters.department &&
                    (filters.department.id === 0 || filters.department.id)
                      ? filters.department.id === 0
                        ? 0
                        : parseInt(filters.department.id)
                      : null;
                  // Get template_id from filters if template is selected, otherwise null
                  const templateId = filters.template && filters.template.id && filters.template.id !== ""
                    ? parseInt(filters.template.id)
                    : null;
                  
                  await gettingManageEmpSalary(
                    branchId,
                    deptId,
                    "",
                    false, // forceReload
                    templateId, // template_id from filters, not hardcoded
                    true // get_all
                  );
                } else {
                  // Get template_id from filters if template is selected, otherwise null
                  const templateId = filters.template && filters.template.id && filters.template.id !== ""
                    ? parseInt(filters.template.id)
                    : null;
                  
                  await gettingManageEmpSalary(0, null, "", false, templateId, true);
                }
              }}
            />
          ) : (
            <GridManageEmpSalary allEmpSalary={filteredEmployees} />
          )}
        </div>
      )}
    </>
  );
};

export default ManageEmployeesSalary;
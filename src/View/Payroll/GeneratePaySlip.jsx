import React, { useCallback, useEffect, useState, useMemo } from "react";
import useManagePaySlip from "../../ViewModel/PayrollViewModel/ManagePaySlipServces";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { customSelectData } from "../../services/__payrollServices";
import { BiSearch } from "react-icons/bi";
import { Button, Checkbox, Typography } from "@material-tailwind/react";
import PaySlipGenerationSelection from "./PaySlipGenerationSelection";
import useManagePaySlipGeneration from "../../ViewModel/PayrollViewModel/ManagePaySlipGeneration";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import { getContentByLabel } from "../../services/getContentService";
import { showToast } from "../../Components/Toaster/Toaster";

const empListTableHeader = ["All", "Name", "Designation", "Employee ID", "Salary"];

// localStorage key for persisting Generate Payslip search and filter state
const GENERATE_PAYSLIP_SEARCH_FILTER_KEY = "generatePayslipSearchFilter";

// Helper function to load search and filter state from localStorage
const loadSearchFilterFromStorage = () => {
  try {
    const savedState = localStorage.getItem(GENERATE_PAYSLIP_SEARCH_FILTER_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.error(
      "Error loading Generate Payslip search/filter from localStorage:",
      error
    );
  }
  return null;
};

// Helper function to save search and filter state to localStorage
const saveSearchFilterToStorage = (searchTerm, typeFilter) => {
  try {
    const stateToSave = {
      searchTerm: searchTerm || "",
      typeFilter: typeFilter,
    };
    localStorage.setItem(
      GENERATE_PAYSLIP_SEARCH_FILTER_KEY,
      JSON.stringify(stateToSave)
    );
  } catch (error) {
    console.error(
      "Error saving Generate Payslip search/filter to localStorage:",
      error
    );
  }
};

const GeneratePaySlip = () => {
  const {
    branches_payroll,
    managePaySlipState,
    handleSelectManagePaySlip,
    handleInputChange,
  } = useManagePaySlip();

  // Load saved search and filter state from localStorage
  const savedSearchFilter = loadSearchFilterFromStorage();
  const initialSearchTerm = savedSearchFilter?.searchTerm || "";
  const initialTypeFilter = savedSearchFilter?.typeFilter || null;

  // Search state
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [typeFilter, setTypeFilter] = useState(initialTypeFilter);

  // Content drawer (info icon) – right-side panel with ENGLISH/URDU
  const [contentDrawerOpen, setContentDrawerOpen] = useState(false);
  const [contentData, setContentData] = useState(null);
  const [contentLang, setContentLang] = useState("ENGLISH");
  const [contentLoading, setContentLoading] = useState(false);

  const openContentDrawer = useCallback(async (contentLabel) => {
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
  }, []); // For All/Selected/Unselected filter

  const {
    addMoreOverTime,
    managePaySlipGeneration,
    removeOverTime,
    handleOnChangePaySlipGeneration,
    handleOvertimeChange,
    handleBonusTypeChange,
    handleBonusFieldChange,
    setSelectedEmployees,
    generateBulkPayroll,
  } = useManagePaySlipGeneration(managePaySlipState);

  // Restore branch data when component mounts and branch_id is restored from localStorage
  useEffect(() => {
    // If branch_id is restored but employees are not loaded, fetch them
    if (
      managePaySlipState.branch_id &&
      (!managePaySlipState.empSalary ||
        managePaySlipState.empSalary.length === 0)
    ) {
      // Re-trigger the branch selection to fetch departments and employees
      if (managePaySlipState.branch_id.value === "all") {
        handleSelectManagePaySlip(managePaySlipState.branch_id, "branch_id");
      } else if (managePaySlipState.branch_id.value) {
        handleSelectManagePaySlip(managePaySlipState.branch_id, "branch_id");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Filter and search employees based on multiple criteria
  // Note: Department filtering is now handled by the API, so we don't filter by department client-side
  const employeeData = useMemo(() => {
    let filtered = managePaySlipState.empSalary || [];

    // Department filtering is now done by the API, so we skip client-side department filtering
    // The API already returns filtered data based on the selected department

    // Apply type filter (All/Selected/Unselected)
    if (typeFilter?.value === 2) {
      // Selected employees only
      filtered = filtered.filter((emp) =>
        managePaySlipGeneration.selectedEmployees.some(
          (selected) => selected.id === emp.id
        )
      );
    } else if (typeFilter?.value === 3) {
      // Unselected employees only
      filtered = filtered.filter(
        (emp) =>
          !managePaySlipGeneration.selectedEmployees.some(
            (selected) => selected.id === emp.id
          )
      );
    }

    // If typeFilter is null or value === 1, show all (no additional filtering)
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((emp) => {
        const nameMatch = emp.name?.toLowerCase().includes(searchLower);
        const idMatch =
          emp.id?.toString().includes(searchTerm) ||
          emp.empid?.toString().includes(searchTerm);
        return nameMatch || idMatch;
      });
    }

    return filtered;
  }, [
    managePaySlipState.empSalary,
    // Removed managePaySlipState.department_id from dependencies since API handles filtering
    typeFilter,
    searchTerm,
    managePaySlipGeneration.selectedEmployees,
  ]);

  // Determine if all displayed employees are selected
  const allSelected =
    employeeData.length > 0 &&
    employeeData.every((emp) =>
      managePaySlipGeneration.selectedEmployees.some(
        (selected) => selected.id === emp.id
      )
    );

  // Determine if some employees are selected (for indeterminate state)
  const someSelected = employeeData.some((emp) =>
    managePaySlipGeneration.selectedEmployees.some(
      (selected) => selected.id === emp.id
    )
  );

  // Save search and filter state to localStorage whenever they change
  useEffect(() => {
    saveSearchFilterToStorage(searchTerm, typeFilter);
  }, [searchTerm, typeFilter]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle type filter change
  const handleTypeFilterChange = (selectedOption) => {
    setTypeFilter(selectedOption);
  };

  // Handle select all employees (only affects currently displayed/filtered employees)
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      // Add all displayed employees to selection (avoiding duplicates)
      const currentlySelected = managePaySlipGeneration.selectedEmployees;
      const newSelections = employeeData.filter(
        (emp) => !currentlySelected.some((selected) => selected.id === emp.id)
      );
      setSelectedEmployees([...currentlySelected, ...newSelections]);
    } else {
      // Remove all displayed employees from selection
      const displayedIds = employeeData.map((emp) => emp.id);
      setSelectedEmployees(
        managePaySlipGeneration.selectedEmployees.filter(
          (emp) => !displayedIds.includes(emp.id)
        )
      );
    }
  };

  // Handle individual employee selection
  const handleRowSelect = (employee, e) => {
    if (e.target.checked) {
      setSelectedEmployees([
        ...managePaySlipGeneration.selectedEmployees,
        employee,
      ]);
    } else {
      setSelectedEmployees(
        managePaySlipGeneration.selectedEmployees.filter(
          (emp) => emp.id !== employee.id
        )
      );
    }
  };
  return (
    <div className="flex flex-col gap-4 pt-4 lg:px-2 md:px-2 px-0">
      <div className="font-medium text-[18px] text-[#474747] font-Poppins">
        Generate Payslip
      </div>
      <div className="flex lg:flex-row md:flex-row flex-col items-center gap-4">
        <div className="lg:w-64 md:w-64 w-full">
          <label className="text-[#474747] text-[12px] font-medium px-2">
            Branch
          </label>
          <CustomSelect
            placeHolderTitle="All Branch"
            value={managePaySlipState?.branch_id}
            options={[
              { value: "all", label: "All Branch" },
              ...(branches_payroll?.map((type) => ({
                value: type.id,
                label: type.branch_name,
              })) || []),
            ]}
            onChangeHandler={(selectedOption) =>
              handleSelectManagePaySlip(selectedOption, "branch_id")
            }
            customStyles={false}
          />
        </div>
        <div className="lg:w-64 md:w-64 w-full">
          <label className="text-[#474747] text-[12px] font-medium px-2">
            Department
          </label>
          <CustomSelect
            placeHolderTitle="All Department"
            value={managePaySlipState?.department_id}
            options={[
              { value: "all", label: "All Department" },
              ...(managePaySlipState.departments || []),
            ]}
            onChangeHandler={(selectedOption) => {
              handleSelectManagePaySlip(selectedOption, "department_id");
            }}
            cStyle={true}
            disabled={!managePaySlipState?.branch_id || managePaySlipState?.branch_id?.value === "all"}
          />
        </div>
        {managePaySlipState.showFilter && (
          <>
            <div className="lg:w-64 md:w-64 w-full">
              <label className="text-[#474747] text-[12px] font-medium px-2">
                Filter by Type
              </label>
              <CustomSelect
                placeHolderTitle="Select Type"
                value={typeFilter}
                options={customSelectData?.map((type) => ({
                  value: type.id,
                  label: type.title,
                }))}
                onChangeHandler={handleTypeFilterChange}
                customStyles={false}
              />
            </div>
            <div className="lg:w-64 md:w-64 w-full flex flex-col items-start justify-start">
              <label className="text-[#474747] text-[12px] font-medium px-2">
                Search Employee
              </label>
              <div className="relative w-full min-w-[200px] h-8">
                <div className="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-2/4 right-3 -translate-y-2/4">
                  <span>
                    <BiSearch />
                  </span>
                </div>
                <input
                  className="w-full h-[39px] px-3 text-black shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)] py-2 text-[12px] border-none outline-none rounded-[10px] bg-white text-left"
                  type="text"
                  onChange={handleSearchChange}
                  value={searchTerm}
                  placeholder="Search by name or ID"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-[10px] p-2 drop-shadow-md">
        <div className="relative w-full overflow-auto customScroll">
          {(managePaySlipState.branch_id || employeeData.length > 0) && (
            <table className="min-w-full table-fixed text-center">
                     <colgroup>
    <col style={{ width: '20%' }} />
    <col style={{ width: '20%' }} />
    <col style={{ width: '20%' }} />
    <col style={{ width: '20%' }} />
    <col style={{ width: '20%' }} />
  </colgroup>
              <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
                <tr className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                  {empListTableHeader?.map((head, i) => (
                    <th
                      key={i}
                      className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                    >
                      <div className="leading-none capitalize flex items-center justify-center ">
                        {i === 0 && (
                          <Checkbox
                            color="blue"
                            size="sm"
                            containerProps={{ className: "" }}
                            onChange={handleSelectAll}
                            checked={allSelected}
                            indeterminate={
                              someSelected && !allSelected ? true : undefined
                            }
                            disabled={employeeData.length === 0}
                          />
                        )}
                        {head}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employeeData?.map((ele, index) => {
                  const isLast = index === employeeData.length - 1;
                  const classes = isLast
                    ? "px-[clamp(4px,0.8vw,12px)] py-4"
                    : "px-[clamp(4px,0.8vw,12px)] py-4 border-b border-[#F2F2F9]";

                  return (
                    <tr key={ele.id}>
                      <td className={classes}>
                        <div>
                          <Checkbox
                            color="blue"
                            size="sm"
                            containerProps={{ className: "" }}
                            checked={managePaySlipGeneration.selectedEmployees.some(
                              (selected) => selected.id === ele.id
                            )}
                            onChange={(e) => handleRowSelect(ele, e)}
                          />
                        </div>
                      </td>
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="#474747"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {ele.name || "N/A"}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="#474747"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {ele.wf_designation?.title || "N/A"}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="#474747"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {ele.id || "N/A"}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="#474747"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {ele.salary_with_increaments || "N/A"}
                        </Typography>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {managePaySlipState.showFilter && (
        <PaySlipGenerationSelection
          addMoreOverTime={addMoreOverTime}
          managePaySlipGeneration={managePaySlipGeneration}
          removeOverTime={removeOverTime}
          handleOnChangePaySlipGeneration={handleOnChangePaySlipGeneration}
          handleOvertimeChange={handleOvertimeChange}
          handleBonusTypeChange={handleBonusTypeChange}
          handleBonusFieldChange={handleBonusFieldChange}
          generateBulkPayroll={generateBulkPayroll}
          openContentDrawer={openContentDrawer}
        />
      )}

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
    </div>
  );
};

export default GeneratePaySlip;
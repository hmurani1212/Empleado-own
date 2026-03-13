import React, { useEffect, useState, useRef } from "react";
import { includeModuleData } from "../../services/__performanceServices";
import { Checkbox, Typography, Button } from "@material-tailwind/react";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import SearchReactSelect from "../../Components/CustomSelect/SearchReactSelect";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { FaXmark, FaChevronDown, FaChevronRight } from "react-icons/fa6";
import useEmployees from "../../ViewModel/EmployeeViewModel/EmployeeServices";
import { getContentByLabel } from "../../services/getContentService";
import { showToast } from "../../Components/Toaster/Toaster";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import { FaInfoCircle } from "react-icons/fa";

const AddEditPRC = (props) => {
  const {
    PRCAddValue,
    handleChangeRPC,
    handleSelectAddPRC,
    handleSubmitPRC,
    handleRemoveEmp,
    handleUpdatePRC,
    fetchPermissionEmployees,
  } = props;
  //   console.log("handleSelectAddPRChandleSelectAddPRC", PRCAddValue);
  const { empBranches, fetchingAllBranches, gettingSubBranches, dept_subDept } = useEmployees();
  
  // State for cascading dropdowns
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

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
  
  // Use ref to track if data has been fetched to prevent duplicate calls
  const hasFetchedDataRef = useRef(false);
  const previousShowStateRef = useRef(false);
  const lastFetchedBranchIdRef = useRef(null);
  
  // Only fetch branches when modal opens; do NOT call employee API here (employees load after department selection)
  useEffect(() => {
    const modalJustOpened = PRCAddValue.show && !previousShowStateRef.current;

    if (modalJustOpened && !hasFetchedDataRef.current) {
      fetchingAllBranches();
      hasFetchedDataRef.current = true;
    }

    previousShowStateRef.current = PRCAddValue.show;

    if (!PRCAddValue.show) {
      hasFetchedDataRef.current = false;
      lastFetchedBranchIdRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PRCAddValue.show]);
  
  // Sync local state with PRCAddValue when it changes
  useEffect(() => {
    if (PRCAddValue.branch_id) {
      setSelectedBranch(PRCAddValue.branch_id);
      // Load departments when branch is set - only if branch_id actually changed
      if (PRCAddValue.branch_id.value !== undefined) {
        const branchValue = PRCAddValue.branch_id.value === 0 || PRCAddValue.branch_id.value === '0' ? 0 : PRCAddValue.branch_id.value;
        
        // Only fetch if this is a different branch than the last one we fetched
        if (lastFetchedBranchIdRef.current !== branchValue) {
          lastFetchedBranchIdRef.current = branchValue;
          gettingSubBranches(branchValue);
        }
      }
    } else {
      setSelectedBranch(null);
      lastFetchedBranchIdRef.current = null;
    }
    
    if (PRCAddValue.department_id) {
      setSelectedDepartment(PRCAddValue.department_id);
    } else {
      setSelectedDepartment(null);
    }
    
    // Reset employee selection when branch or department changes
    if (!PRCAddValue.branch_id || !PRCAddValue.department_id) {
      setSelectedEmployee(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [PRCAddValue.branch_id, PRCAddValue.department_id]);

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <label className="text-[#698592] text-[12px]">
              Name of Review Cycle
            </label>
            <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("CYCLE_NAME_PERFORMANCE_EMP")} />
          </div>
          <input
            className="w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none"
            type="text"
            value={PRCAddValue.name}
            name="name"
            onChange={handleChangeRPC}
            placeholder="Enter Name of Review Cycle"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <label className="text-[#698592] text-[12px]">Start Date</label>
            <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("STARTDATE_PERFORMANCE_EMP")} />
          </div>
          <input
            className="w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none"
            type="date"
            value={PRCAddValue.start_date}
            name="start_date"
            onChange={handleChangeRPC}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <label className="text-[#698592] text-[12px]">End Date</label>
            <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("ENDDATE_PERFORMANCE_EMP")} />
          </div>
          <input
            className="w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none"
            type="date"
            value={PRCAddValue.end_date}
            name="end_date"
            onChange={handleChangeRPC}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[#698592] text-[12px]">
            Modules to be included
          </label>
          <div>
            {includeModuleData.map((ele) => (
              <Checkbox
                name="modulesType"
                key={ele.id}
                value={ele.id}
                label={
                  <Typography className="text-[12px]">{ele.title}</Typography>
                }
                checked={PRCAddValue.modulesType.includes(ele.id)}
                onChange={handleChangeRPC}
              />
            ))}
          </div>
        </div>

      </div>
      {PRCAddValue.modulesType.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <label className="text-[#698592] text-[12px]">Result Ratio</label>
            <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("RATIO_PERFORMANCE_EMP")} />
          </div>
          <div className="flex justify-between items-center gap-3">
            {PRCAddValue.modulesType.includes(1) && (
              <div className="space-y-2">
                <label className="text-[#698592] text-[12px]">Goal </label>
                <input
                  className="w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none"
                  type="number"
                  value={PRCAddValue.goal_rate}
                  name="goal_rate"
                  onChange={handleChangeRPC}
                />
              </div>
            )}
            {PRCAddValue.modulesType.includes(2) && (
              <div className="space-y-2">
                <label className="text-[#698592] text-[12px]">Competency</label>
                <input
                  className="w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none"
                  type="number"
                  value={PRCAddValue.competancy_rate}
                  name="competancy_rate"
                  onChange={handleChangeRPC}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Permissions: Who Can Assign Goals / Competencies */}
      <div className="space-y-2 border-t border-gray-100 pt-4">
        <button
          type="button"
          className="flex items-center gap-2 w-full text-left text-[#698592] text-[12px] font-medium hover:text-[#3DA5F4] focus:outline-none"
          onClick={() => handleSelectAddPRC(!PRCAddValue.permissionsSectionOpen, "permissionsSectionOpen")}
        >
          {PRCAddValue.permissionsSectionOpen ? <FaChevronDown className="text-sm" /> : <FaChevronRight className="text-sm" />}
          Permissions
        </button>
        {PRCAddValue.permissionsSectionOpen && (
          <div className="space-y-4 pl-4 border-l-2 border-gray-100">
            {/* Who Can Assign Goals - show when Goal module is included */}
            {PRCAddValue.modulesType.includes(1) && (
              <div className="space-y-2">
                <label className="text-[#698592] text-[12px] font-medium block">Who Can Assign Goals</label>
                <div className="flex flex-wrap gap-3">
                  {['Admin', 'reporting manager', 'Self', 'custom'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="allow_goal_type"
                        checked={PRCAddValue.allow_goal_type === opt}
                        onChange={() => {
                          handleSelectAddPRC(opt, 'allow_goal_type');
                          if (opt === 'custom' && PRCAddValue.permissionEmployeesOptions.length === 0) {
                            const deptId = PRCAddValue.department_id?.value ?? null;
                            fetchPermissionEmployees(deptId);
                          }
                        }}
                        className="rounded border-gray-300 text-[#3DA5F4] focus:ring-[#3DA5F4]"
                      />
                      <span className="text-[12px] text-gray-700 capitalize">
                        {opt === 'custom' ? 'Custom Employee Selection' : opt === 'reporting manager' ? 'Reporting Manager' : opt}
                      </span>
                    </label>
                  ))}
                </div>
                {PRCAddValue.allow_goal_type === 'custom' && (
                  <div className="mt-2 space-y-1">
                    <SearchReactSelect
                      placeHolderTitle={PRCAddValue.permissionEmployeesLoading ? "Loading employees..." : "Select employees"}
                      value={PRCAddValue.allow_goal_custom_employees}
                      options={PRCAddValue.permissionEmployeesOptions}
                      onChangeHandler={(selected) => handleSelectAddPRC(selected, 'allow_goal_custom_employees')}
                      disabled={PRCAddValue.permissionEmployeesLoading}
                      isMulti
                      isClearable
                      cStyle={true}
                      customStyles={{
                        control: (base) => ({ ...base, fontSize: '12px', minHeight: '36px', borderRadius: '10px' }),
                        menu: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                    {PRCAddValue.allow_goal_custom_employees?.length > 0 && (
                      <p className="text-[11px] text-gray-600 mt-1">
                        Selected: {PRCAddValue.allow_goal_custom_employees.map((e) => e?.label ?? e?.name ?? e).join(', ')}
                      </p>
                    )}
                  </div>
                )}
                {PRCAddValue.allow_goal_type !== 'custom' && (
                  <p className="text-[11px] text-gray-600">
                    Selected: {PRCAddValue.allow_goal_type === 'reporting manager' ? 'Reporting Manager' : PRCAddValue.allow_goal_type === 'Self' ? 'Self' : 'Admin'}
                  </p>
                )}
              </div>
            )}
            {/* Who Can Assign Competencies - show when Competency module is included */}
            {PRCAddValue.modulesType.includes(2) && (
              <div className="space-y-2">
                <label className="text-[#698592] text-[12px] font-medium block">Who Can Assign Competencies</label>
                <div className="flex flex-wrap gap-3">
                  {['Admin', 'reporting manager', 'custom'].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="allow_competency_type"
                        checked={PRCAddValue.allow_competency_type === opt}
                        onChange={() => {
                          handleSelectAddPRC(opt, 'allow_competency_type');
                          if (opt === 'custom' && PRCAddValue.permissionEmployeesOptions.length === 0) {
                            const deptId = PRCAddValue.department_id?.value ?? null;
                            fetchPermissionEmployees(deptId);
                          }
                        }}
                        className="rounded border-gray-300 text-[#3DA5F4] focus:ring-[#3DA5F4]"
                      />
                      <span className="text-[12px] text-gray-700 capitalize">
                        {opt === 'custom' ? 'Custom Selection' : opt === 'reporting manager' ? 'Reporting Manager' : opt}
                      </span>
                    </label>
                  ))}
                </div>
                {PRCAddValue.allow_competency_type === 'custom' && (
                  <div className="mt-2 space-y-1">
                    <SearchReactSelect
                      placeHolderTitle={PRCAddValue.permissionEmployeesLoading ? "Loading employees..." : "Select employees"}
                      value={PRCAddValue.allow_competency_custom_employees}
                      options={PRCAddValue.permissionEmployeesOptions}
                      onChangeHandler={(selected) => handleSelectAddPRC(selected, 'allow_competency_custom_employees')}
                      disabled={PRCAddValue.permissionEmployeesLoading}
                      isMulti
                      isClearable
                      cStyle={true}
                      customStyles={{
                        control: (base) => ({ ...base, fontSize: '12px', minHeight: '36px', borderRadius: '10px' }),
                        menu: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                    {PRCAddValue.allow_competency_custom_employees?.length > 0 && (
                      <p className="text-[11px] text-gray-600 mt-1">
                        Selected: {PRCAddValue.allow_competency_custom_employees.map((e) => e?.label ?? e?.name ?? e).join(', ')}
                      </p>
                    )}
                  </div>
                )}
                {PRCAddValue.allow_competency_type !== 'custom' && (
                  <p className="text-[11px] text-gray-600">
                    Selected: {PRCAddValue.allow_competency_type === 'reporting manager' ? 'Reporting Manager' : 'Admin'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-[#698592] text-[12px]">Branch</label>
        <SearchReactSelect
          placeHolderTitle="Branch"
          value={selectedBranch}
          options={[
            { value: 0, label: 'All Branches' },
            ...(empBranches?.map((branch) => ({
              value: branch.id,
              label: branch.branch_name,
            })) || [])
          ]}
          onChangeHandler={async (selectedOption) => {
            setSelectedBranch(selectedOption);
            setSelectedDepartment(null);
            setSelectedEmployee(null);
            
            // Load departments for the selected branch
            const branchValue = selectedOption?.value === 0 || selectedOption?.value === '0' ? 0 : selectedOption?.value;
            
            // Update ref before calling API to prevent duplicate calls from useEffect
            if (branchValue !== undefined && branchValue !== null && lastFetchedBranchIdRef.current !== branchValue) {
              lastFetchedBranchIdRef.current = branchValue;
              await gettingSubBranches(branchValue);
            }
            
            // Call handleSelectAddPRC which will handle the state update
            await handleSelectAddPRC(selectedOption, "branch_id");
            
            // If "All Branches" is selected, auto-select "All Departments"
            if (branchValue === 0) {
              const allDeptOption = { value: 0, label: 'All Departments' };
              setSelectedDepartment(allDeptOption);
              // Small delay to ensure departments are loaded before setting
              setTimeout(async () => {
                await handleSelectAddPRC(allDeptOption, "department_id");
              }, 200);
            }
          }}
          cStyle={true}
          customStyles={{
            control: (base) => ({
              ...base,
              fontSize: '14px',
              minHeight: '36px',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: 'white',
              boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0px 0px 12px 0px rgba(61, 165, 244, 0.3)',
              }
            }),
            menu: (base) => ({
              ...base,
              zIndex: 9999,
              borderRadius: '10px',
              boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
              border: 'none'
            }),
            menuList: (base) => ({
              ...base,
              maxHeight: '200px !important',
              height: 'auto !important',
              borderRadius: '10px',
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected
                ? '#3DA5F4'
                : state.isFocused
                  ? '#E3F1FF'
                  : 'transparent',
              color: state.isSelected ? 'white' : '#333',
              '&:hover': {
                backgroundColor: state.isSelected ? '#2B8FD4' : '#F0F8FF',
              }
            }),
            singleValue: (base) => ({
              ...base,
              fontSize: '14px',
              color: '#474747',
            }),
            placeholder: (base) => ({
              ...base,
              fontSize: '14px',
              color: '#999',
            })
          }}
        />
      </div>
      <div className="space-y-2">
        <label className="text-[#698592] text-[12px]">Departments</label>
        <SearchReactSelect
          placeHolderTitle="Department"
          value={selectedDepartment}
          options={[
            { value: 0, label: 'All Departments' },
            ...(Array.isArray(dept_subDept?.departments) 
              ? dept_subDept.departments.map((dept) => ({
                  value: dept.id,
                  label: dept.name,
                }))
              : Array.isArray(dept_subDept)
                ? dept_subDept.map((dept) => ({
                    value: dept.value || dept.id,
                    label: dept.label || dept.name,
                  }))
                : [])
          ]}
          onChangeHandler={async (selectedOption) => {
            setSelectedDepartment(selectedOption);
            setSelectedEmployee(null);
            await handleSelectAddPRC(selectedOption, "department_id");
          }}
          cStyle={true}
          customStyles={{
            control: (base) => ({
              ...base,
              fontSize: '14px',
              minHeight: '36px',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: 'white',
              boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0px 0px 12px 0px rgba(61, 165, 244, 0.3)',
              }
            }),
            menu: (base) => ({
              ...base,
              zIndex: 9999,
              borderRadius: '10px',
              boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
              border: 'none'
            }),
            menuList: (base) => ({
              ...base,
              borderRadius: '10px',
            }),
            singleValue: (base) => ({
              ...base,
              fontSize: '14px',
              color: '#474747',
            }),
            placeholder: (base) => ({
              ...base,
              fontSize: '14px',
              color: '#999',
            })
          }}
        />
      </div>
      <div className="space-y-2">
        <label className="text-[#698592] text-[12px]">Employee</label>
        <SearchReactSelect
          placeHolderTitle={selectedDepartment ? "Select Employee" : "Select department first"}
          value={selectedEmployee}
          options={[
            { value: 0, label: 'All Employees' },
            ...(Array.isArray(PRCAddValue.employees)
              ? PRCAddValue.employees.map((emp) => ({
                  value: emp.value ?? emp.id ?? emp.emp_id ?? emp.employee_id,
                  label: emp.label ?? `${emp.name ?? ''} (ID: ${emp.id ?? emp.emp_id ?? emp.employee_id ?? ''})`
                }))
              : [])
          ]}
          onChangeHandler={async (selectedOption) => {
            setSelectedEmployee(selectedOption);
            // If "All Employees" is selected, handle it differently
            if (selectedOption && (selectedOption.value === 0 || selectedOption.value === '0')) {
              await handleSelectAddPRC(selectedOption, "emp_id");
            } else if (selectedOption) {
              // For specific employee selection, it will be added to selectedEmp array
              await handleSelectAddPRC(selectedOption, "emp_id");
            } else {
              // If cleared, reset
              setSelectedEmployee(null);
            }
          }}
          cStyle={true}
          isClearable={true}
          customStyles={{
            control: (base) => ({
              ...base,
              fontSize: '14px',
              minHeight: '36px',
              border: 'none',
              borderRadius: '10px',
              backgroundColor: 'white',
              boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0px 0px 12px 0px rgba(61, 165, 244, 0.3)',
              }
            }),
            menu: (base) => ({
              ...base,
              zIndex: 9999,
              borderRadius: '10px',
              boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
              border: 'none'
            }),
            menuList: (base) => ({
              ...base,
              maxHeight: '200px !important',
              height: 'auto !important',
              borderRadius: '10px',
            }),
            option: (base, state) => ({
              ...base,
              backgroundColor: state.isSelected
                ? '#3DA5F4'
                : state.isFocused
                  ? '#E3F1FF'
                  : 'transparent',
              color: state.isSelected ? 'white' : '#333',
              '&:hover': {
                backgroundColor: state.isSelected ? '#2B8FD4' : '#F0F8FF',
              }
            }),
            singleValue: (base) => ({
              ...base,
              fontSize: '14px',
              color: '#474747',
            }),
            placeholder: (base) => ({
              ...base,
              fontSize: '14px',
              color: '#999',
            })
          }}
        />
        <small className="text-gray-500 text-[10px]">
          {PRCAddValue.isMultipleEmployeeMode 
            ? "Select multiple employees for this performance review cycle" 
            : "Select one employee for this performance review cycle"
          }
        </small>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <label className="text-[#698592] text-[12px]">Closing Date</label>
          <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("CLOSINGDATE_PERFORMANCE_EMP")} />
        </div>
        <input
          className="w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none"
          type="date"
          value={PRCAddValue.review_day}
          name="review_day"
          onChange={handleChangeRPC}
          min={PRCAddValue.end_date || ''}
          title={PRCAddValue.end_date ? `Closing date must be on or after the end date (${PRCAddValue.end_date})` : 'Please select an end date first'}
        />
        {PRCAddValue.end_date && PRCAddValue.review_day && PRCAddValue.review_day < PRCAddValue.end_date && (
          <small className="text-red-500 text-[10px] block mt-1">
            Closing date cannot be before the end date. Please select a date on or after {PRCAddValue.end_date}.
          </small>
        )}
      </div>

      {PRCAddValue.selectedEmp && PRCAddValue.selectedEmp.length > 0 && (
        <div className="space-y-2">
          <label className="text-[#698592] text-[12px]">
            {PRCAddValue.isMultipleEmployeeMode ? "Selected Employees" : "Selected Employee"}
          </label>
          <div className="space-y-2">
            {PRCAddValue.selectedEmp.map((emp, index) => (
              <div key={emp.value} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-[12px] font-medium text-blue-800">
                  {emp.label}
                </span>
                <span
                  className="h-5 w-5 text-[12px] flex items-center justify-center rounded-full bg-red-500 text-white cursor-pointer hover:bg-red-600"
                  onClick={() => handleRemoveEmp(emp)}
                >
                  <FaXmark />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <CustomButton
          title={PRCAddValue.update ? "Update" : "Submit"}
          onClick={PRCAddValue.update ? handleUpdatePRC : handleSubmitPRC}
          loading={PRCAddValue.loading}
        />
      </div>

      <PortalDrawer
        open={contentDrawerOpen}
        closeDrawer={() => setContentDrawerOpen(false)}
        direction="right"
        widthSize={620}
        title={contentData?.contents?.find((c) => c.lang === contentLang)?.main_heading ?? ""}
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
                    className={`flex-1 font-Urbanist text-[12px] ${contentLang === "ENGLISH" ? "bg-[#3DA5F4] text-white" : "bg-gray-200 text-gray-700"}`}
                    onClick={() => setContentLang("ENGLISH")}
                  >
                    ENGLISH
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 font-Urbanist text-[12px] ${contentLang === "URDU" ? "bg-[#3DA5F4] text-white" : "bg-gray-200 text-gray-700"}`}
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

export default AddEditPRC;

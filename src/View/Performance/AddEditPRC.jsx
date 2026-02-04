import React, { useEffect } from "react";
import { includeModuleData } from "../../services/__performanceServices";
import { Checkbox, Typography } from "@material-tailwind/react";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { FaXmark } from "react-icons/fa6";
import useEmployees from "../../ViewModel/EmployeeViewModel/EmployeeServices";

const AddEditPRC = (props) => {
  const {
    PRCAddValue,
    handleChangeRPC,
    handleSelectAddPRC,
    handleSubmitPRC,
    handleRemoveEmp,
    handleUpdatePRC,
  } = props;
  //   console.log("handleSelectAddPRChandleSelectAddPRC", PRCAddValue);
  const { empBranches, fetchingAllBranches } = useEmployees();
  // const { getEmployeesByDeptId } = useDepartments();
  ///console.log("empBranchesempBranches", empBranches)
  useEffect(() => {
    fetchingAllBranches();
  }, []);

  return (
    <div className="space-y-2">
      <div className="space-y-2">
        <div className="space-y-2">
          <label className="text-[#698592] text-[12px]">
            Name of Review Cycle
          </label>
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
          <label className="text-[#698592] text-[12px]">Start Date</label>
          <input
            className="w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none"
            type="date"
            value={PRCAddValue.start_date}
            name="start_date"
            onChange={handleChangeRPC}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[#698592] text-[12px]">End Date</label>
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
          <label className="text-[#698592] text-[12px]">Result Ratio</label>
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
      <div className="space-y-2">
        <label className="text-[#698592] text-[12px]">Branch</label>
        <CustomSelect
          placeHolderTitle="Branch"
          value={PRCAddValue.branch_id}
          options={empBranches?.map((branch) => ({
            value: branch.id,
            label: branch.branch_name,
          }))}
          onChangeHandler={(selectedOption) =>
            handleSelectAddPRC(selectedOption, "branch_id")
          }
          customStyles={false}
        />
      </div>
      <div className="space-y-2">
        <label className="text-[#698592] text-[12px]">Departments</label>
        <CustomSelect
          placeHolderTitle="Department"
          options={PRCAddValue?.departments}
          cStyle={true}
          value={PRCAddValue.department_id}
          onChangeHandler={(selectedOption) =>
            handleSelectAddPRC(selectedOption, "department_id")
          }
        />
      </div>
      <div className="space-y-2">
        <label className="text-[#698592] text-[12px]">Employee</label>
        <CustomSelect
          placeHolderTitle="Select Employee"
          value={PRCAddValue?.emp_id}
          options={PRCAddValue?.employees?.map((employee) => ({
            value: employee?.id,
            label: employee?.name,
          }))}
          onChangeHandler={(selectedOption) =>
            handleSelectAddPRC(selectedOption, "emp_id")
          }
          customStyles={false}
          isClearable={true}
        />
        <small className="text-gray-500 text-[10px]">
          {PRCAddValue.isMultipleEmployeeMode 
            ? "Select multiple employees for this performance review cycle" 
            : "Select one employee for this performance review cycle"
          }
        </small>
      </div>
      <div className="space-y-2">
        <label className="text-[#698592] text-[12px]">Closing Date</label>
        <input
          className="w-full text-[#333333] text-[12px] rounded-md   py-[8px] px-[17px] border border-gray-500 outline-none"
          type="date"
          value={PRCAddValue.review_day}
          name="review_day"
          onChange={handleChangeRPC}
        />
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
    </div>
  );
};

export default AddEditPRC;

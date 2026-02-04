import React from "react";
import { Checkbox, Input, Typography } from "@material-tailwind/react";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { elements } from "chart.js";
import { FaXmark } from "react-icons/fa6";

const EmpMapping = (props) => {
  const {
    policyBranches,
    newhrPolicesValues,
    handleSelectChange,
    flattenOptions,
    dept_subDept,
    handleChange,
    handleCheckbox,
    handleRemoveSubDept,
    empBranches,
  } = props;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-96">
        <label className="text-[12px] font-Urbanist font-medium px-2 text-[#474747]">
          Policy Name
        </label>
        <input
          name="name"
          // labelProps={{ className: "hidden" }}
          className='bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]'
          // placeholder='Policy Name'
          // placeHolderTitle='Policy Name'
          placeholder="Enter Policy Name"
          // value={}
          value={newhrPolicesValues.name}
          label="Policy Name"
          onChange={handleChange}
        />
      </div>
      <div className="w-96">
        <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
          Select Branch
        </label>

        <CustomSelect
          placeHolderTitle="Branch"
          value={newhrPolicesValues?.branch}
          options={[
            { value: 0, label: "All Branches" },
            ...(empBranches?.map((branch) => ({
              value: branch.id,
              label: branch.branch_name,
            })) || []),
          ]}
          onChangeHandler={(selectedOption) =>
            handleSelectChange(selectedOption, "branch")
          }
          // onChangeHandler={handleSelectChange}
          customStyles={false}
        />
      </div>
      <div className="w-96">
        <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
          Select Department
        </label>
        <CustomSelect
          placeHolderTitle="Select Department"
          value={newhrPolicesValues?.department}
          options={[
            { value: 0, label: "All Departments" },
            ...(flattenOptions(dept_subDept) || []),
          ]}
          onChangeHandler={(selectedOption) =>
            handleSelectChange(selectedOption, "department")
          }
          cStyle={true}
        />
      </div>
      <div className="w-96">
        <Checkbox
          color="blue"
          size="sm"
          name="checkBox"
          checked={newhrPolicesValues.checkBox === 1}
          onChange={handleCheckbox}
          label={
            <Typography className="text-[12px] text-blue-500">
              Assign This HR Policy To Department(s) (Optional)
            </Typography>
          }
        />
      </div>
      {newhrPolicesValues.checkBox === 1 && (
        <>
          <div className="w-96 flex items-center gap-2 flex-wrap">
            {newhrPolicesValues.deptArray?.map((ele) => (
              <div
                className="bg-gray-200 border border-blue-500 p-2 rounded-md "
                key={ele.value}
              >
                <div className="flex items-center gap-2 text-[12px]">
                  <span>{ele.label}</span>
                  <span
                    className="cursor-pointer bg-[#F55E67] text-white rounded-full"
                    onClick={() => handleRemoveSubDept(ele)}
                  >
                    <FaXmark />
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="w-96">
            <CustomSelect
              placeHolderTitle="Select Department"
              // value={newhrPolicesValues?.department}
              options={[
                { value: 0, label: "All Departments" },
                ...(flattenOptions(dept_subDept) || []),
              ]}
              onChangeHandler={(selectedOption) =>
                handleSelectChange(selectedOption, "moredepartment")
              }
              cStyle={true}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default EmpMapping;
import React from "react";
import { Checkbox, Input, Typography } from "@material-tailwind/react";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
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
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 font-poppins">
            Policy Name
          </label>
          <input
            name="name"
            className='w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400'
            placeholder="Enter Policy Name"
            value={newhrPolicesValues.name}
            onChange={handleChange}
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 font-poppins">
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
            customStyles={false}
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 font-poppins">
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
      </div>

      <div className="pt-2 border-t border-gray-100">
        <div className="mb-4">
          <Checkbox
            color="blue"
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
            containerProps={{ className: "p-0 mr-3" }}
            name="checkBox"
            checked={newhrPolicesValues.checkBox === 1}
            onChange={handleCheckbox}
            label={
              <Typography className="text-sm font-medium text-blue-600 font-poppins">
                Assign This HR Policy To Additional Department(s) (Optional)
              </Typography>
            }
          />
        </div>
        
        {newhrPolicesValues.checkBox === 1 && (
          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 animate-fade-in-up">
            <div className="flex flex-wrap gap-2 mb-4">
              {newhrPolicesValues.deptArray?.length > 0 ? (
                newhrPolicesValues.deptArray?.map((ele) => (
                  <div
                    className="flex items-center gap-2 bg-white border border-blue-100 px-3 py-1.5 rounded-lg shadow-sm"
                    key={ele.value}
                  >
                    <span className="text-xs font-medium text-gray-700 font-poppins">{ele.label}</span>
                    <button
                      className="w-4 h-4 flex items-center justify-center bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                      onClick={() => handleRemoveSubDept(ele)}
                    >
                      <FaXmark size={10} />
                    </button>
                  </div>
                ))
              ) : (
                <span className="text-xs text-gray-400 font-poppins italic">No additional departments selected</span>
              )}
            </div>
            
            <div className="w-full md:w-1/2">
              <CustomSelect
                placeHolderTitle="Add Department"
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
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpMapping;
import React from "react";
import { Typography } from "@material-tailwind/react";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { FaXmark } from "react-icons/fa6";
import { FaInfoCircle } from "react-icons/fa";

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
    openContentDrawer,
  } = props;
  
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-xl">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <div className="flex flex-col gap-5 max-w-md mx-auto">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium text-gray-700 font-poppins">
                  Policy Name
                </label>
                {openContentDrawer && (
                  <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("NAME_HRPOLICY_EMP")} />
                )}
              </div>
              <input
                name="name"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400"
                placeholder="Enter Policy Name"
                value={newhrPolicesValues.name}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium text-gray-700 font-poppins">
                  Select Branch
                </label>
                {openContentDrawer && (
                  <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("BRANCHSELECTION_HRPOLICY_EMP")} />
                )}
              </div>
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
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium text-gray-700 font-poppins">
                  Select Department
                </label>
                {openContentDrawer && (
                  <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("DEPARTMENTSELECTION_HRPOLICY_EMP")} />
                )}
              </div>
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

          <div className="mt-5 pt-4 border-t border-gray-100">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="checkBox"
                className="mt-0.5 h-4 w-4 rounded-sm border border-gray-200 text-blue-600 focus:ring-blue-500/20"
                checked={newhrPolicesValues.checkBox === 1}
                onChange={handleCheckbox}
              />
              <Typography className="text-sm font-medium text-blue-600 font-poppins">
                Assign This HR Policy To Additional Department(s) (Optional)
              </Typography>
            </label>
        
            {newhrPolicesValues.checkBox === 1 && (
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 animate-fade-in-up mt-4 max-w-md mx-auto">
                <div className="flex flex-wrap gap-2 mb-4">
                  {newhrPolicesValues.deptArray?.length > 0 ? (
                    newhrPolicesValues.deptArray?.map((ele) => (
                      <div
                        className="flex items-center gap-2 bg-white border border-blue-100 px-3 py-1.5 rounded-lg shadow-sm"
                        key={ele.value}
                      >
                        <span className="text-xs font-medium text-gray-700 font-poppins">{ele.label}</span>
                        <button
                          type="button"
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
                
                <div className="w-full">
                  <CustomSelect
                    placeHolderTitle="Add Department"
                    options={[
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
      </div>
    </div>
  );
};

export default EmpMapping;
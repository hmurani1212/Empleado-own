import { Button, Option, Select } from "@material-tailwind/react";
import React, { useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import { FaListUl } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import usePayroll from "../../ViewModel/PayrollViewModel/PayrollServices";
import ManageSalaryTempList from "./ManageSalaryTempList";
import GridManageSalary from "./GridManageSalary";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";

const ManageSalaryTemplate = () => {
  const {
    allSalaryTemp,
    listViewPayroll,
    handleSalaryTempSearch,
    gettingSalaryTemp,
    mountEmpSalary,
    handleListTogglePayroll,
    handleGridTogglePayroll,
    branches_payroll,
    copyBranchesData,
    getAllBranchesPayroll,
    branchFilter,
    handleBranchFilterPayroll,
    handleCreateTemplateDrawer,
  } = usePayroll();

  // Handle data loading for direct navigation/page reload
  useEffect(() => {
    // Only load data if no branches are available (handles direct navigation/page reload)
    if (
      !copyBranchesData ||
      !Array.isArray(copyBranchesData) ||
      copyBranchesData.length === 0
    ) {
      getAllBranchesPayroll();
    }
  }, []); // Empty dependency array to run only once on mount
  return (
    <>
      <div className="flex flex-col gap-4 lg:px-2 md:px-2 px-0">
        <div className="flex lg:flex-row md:flex-row flex-col lg:items-end md:items-end items-start gap-5 justify-between">
          <div className="font-medium text-[16px] text-[#474747] font-Poppins">
            Manage Salary Template
          </div>
          {/* Tooba */}
          {/* Manage Salary Temp -> Create New Template */}
          <div>
            <Button
              className="bg-bgBlue capitalize p-2 font-medium"
              onClick={handleCreateTemplateDrawer}
            >
              Create New Template
            </Button>
          </div>
        </div>

        <div className="flex lg:flex-row md:flex-row flex-col lg:items-end md:items-end items-start gap-5 justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="lg:w-64 md:w-64 w-full">
              <label className="text-[#474747] text-[12px] font-medium px-2">
                Branch
              </label>
              <CustomSelect
                placeHolderTitle="Branch"
                value={branchFilter?.branch_id}
                options={[
                  { value: 0, label: "All Branches" },
                  ...(copyBranchesData && Array.isArray(copyBranchesData)
                    ? copyBranchesData.map((branch) => ({
                        value: branch.id,
                        label: branch.branch_name,
                      }))
                    : []),
                ]}
                onChangeHandler={(selectedOption) =>
                  handleBranchFilterPayroll(selectedOption, "branch_id")
                }
                customStyles={false}
              />
            </div>
            <div className="lg:w-64 md:w-64 w-full">
              <label className="text-[#474747] text-[12px] font-medium px-2">
                Search Payroll
              </label>
              <div className="relative w-full min-w-[200px] h-[38px]">
                <div className="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-2/4 right-3 -translate-y-2/4">
                  <span>
                    <BiSearch />
                  </span>
                </div>
                <input
                  className="w-full h-[39px] px-3 text-black shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)] py-2 text-[12px] border-none outline-none rounded-[10px] bg-white text-left"
                  placeholder="Search Payroll"
                  name="searchPayroll"
                  onChange={handleSalaryTempSearch}
                />
                {/* <label className="flex text-[8px] w-full select-none pointer-events-none absolute left-0 !overflow-visible truncate peer-placeholder-shown:text-[#474747] leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                                    Search Payroll
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

        {listViewPayroll ? (
          <div className="">
            <ManageSalaryTempList allSalaryTemp={allSalaryTemp} />
          </div>
        ) : (
          <div>
            <GridManageSalary allSalaryTemp={allSalaryTemp} />
          </div>
        )}
      </div>
    </>
  );
};

export default ManageSalaryTemplate;
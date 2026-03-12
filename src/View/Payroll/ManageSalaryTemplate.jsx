import { Button, Option, Select } from "@material-tailwind/react";
import React, { useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import { FaListUl } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import usePayroll from "../../ViewModel/PayrollViewModel/PayrollServices";
import ManageSalaryTempList from "./ManageSalaryTempList";
import GridManageSalary from "./GridManageSalary";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { ManageSalaryTemplateSkeleton, SalaryTemplateTableSkeleton } from "./PayrollSkeletons";

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
    salaryTemplatesLoaded,
    branchesLoaded,
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
      {!branchesLoaded ? (
        <ManageSalaryTemplateSkeleton />
      ) : (
        <div className="flex flex-col gap-5 lg:px-2 md:px-2 px-0">
          {/* Modern Header Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Title Section */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 font-Poppins">
                    Manage Salary Template
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure and manage salary structures
                  </p>
                </div>
              </div>

              {/* Create Button */}
              <Button
                className="bg-bgBlue hover:bg-blue-600 normal-case px-5 py-3 font-medium text-sm rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 flex items-center gap-2"
                onClick={handleCreateTemplateDrawer}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Template
              </Button>
            </div>
          </div>

          {/* Modern Toolbar Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Filters Section */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                {/* Filter Icon/Label */}
                <div className="flex items-center gap-2 text-gray-400 min-w-fit">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="text-xs font-medium uppercase tracking-wider">Filters</span>
                </div>

                {/* Filters Grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
                  {/* Branch Select */}
                  <CustomSelect
                    placeHolderTitle="All Branches"
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
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                  />

                  {/* Search Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BiSearch className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      className="w-full h-[38px] pl-10 pr-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                      placeholder="Search templates..."
                      name="searchPayroll"
                      onChange={handleSalaryTempSearch}
                    />
                  </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={handleListTogglePayroll}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      listViewPayroll
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FaListUl className="w-4 h-4" />
                    <span className="hidden sm:inline">List</span>
                  </button>
                  <button
                    onClick={handleGridTogglePayroll}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      !listViewPayroll
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <IoGrid className="w-4 h-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="bg-gray-50/50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-semibold text-gray-700">{allSalaryTemp?.length || 0}</span>
                <span>templates found</span>
              </div>
              
              {allSalaryTemp?.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>View as:</span>
                  <span className="font-medium text-gray-600">
                    {listViewPayroll ? 'List View' : 'Grid View'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="min-h-[400px]">
            {salaryTemplatesLoaded ? (
              listViewPayroll ? (
                <ManageSalaryTempList allSalaryTemp={allSalaryTemp} />
              ) : (
                <GridManageSalary allSalaryTemp={allSalaryTemp} />
              )
            ) : (
              <SalaryTemplateTableSkeleton />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ManageSalaryTemplate;
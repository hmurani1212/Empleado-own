import { Button, Option, Select } from "@material-tailwind/react";
import React, { useEffect } from "react";
import useDepartments from "../../ViewModel/DepartmentsViewModel/DepartmentsServices";
import { Outlet, useLocation } from "react-router";
import useEmployees from "../../ViewModel/EmployeeViewModel/EmployeeServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import CustomButton from "../../Components/CustomButton/CustomButton";
const DepartmentsMain = () => {
  const {
    mountBranch,
    getAllDepartments,
    handleBranchDept,
    handleManageDept,
    handleNavigateNewDept,
    branchId,
  } = useDepartments();
  // useEffect(() => {
  //   if (!mountBranch) {
  //     getAllDepartments();
  //   }
  // }, []);

  const { empBranches } = useEmployees();
  const { allBranches, getBranchEmployeeList } = useDepartments();

  // On /departments we don't run global get_branch_employee; load branches here so Select Branch has data
  useEffect(() => {
    if ((!allBranches || allBranches.length === 0) && (!empBranches || empBranches.length === 0)) {
      getBranchEmployeeList();
    }
  }, []);

  const location = useLocation();

  // console.log('branchId', branchId)
  // console.log("allBranches", empBranches)

  return (
    <>
      {location.pathname.includes("manageDept") ? (
        <Outlet />
      ) : location.pathname.includes("createNewDept") ? (
        <Outlet />
      ) : (
        <div className="flex flex-col space-y-4 items-center mt-10 min-h-[60vh] justify-center">
          <div className="text-center space-y-2 mb-6">
             <h1 className="text-3xl font-bold text-gray-900 font-poppins">
              Manage Departments
            </h1>
            <p className="text-gray-500 font-poppins">
              Select a branch to view and manage its departments
            </p>
          </div>

          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="mb-6">
                <CustomSelect
                placeHolderTitle="Select Branch"
                value={
                    branchId
                    ? (allBranches && allBranches.length > 0 ? allBranches : empBranches)?.find((branch) => branch.id === branchId)
                        ? {
                            value: branchId,
                            label: (allBranches && allBranches.length > 0 ? allBranches : empBranches).find(
                            (branch) => branch.id === branchId
                            ).branch_name,
                        }
                        : null
                    : null
                }
                options={[
                    { value: "", label: "Select Branch" },
                    ...((allBranches && allBranches.length > 0 
                      ? allBranches 
                      : empBranches)?.map((branch) => ({
                    value: branch.id,
                    label: branch.branch_name,
                    })) || []),
                ]}
                onChangeHandler={(selectedOption) =>
                    handleBranchDept(selectedOption?.value || "")
                }
                cStyle={false}
                isSearchable={true}
                />
            </div>

            <div className="flex flex-col gap-3">
                <CustomButton
                className="w-full bg-bgBlue text-white hover:bg-blue-600 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20"
                onClick={handleNavigateNewDept}
                title="Create Department"
                >
                Create Department
                </CustomButton>
                
                <CustomButton
                className="w-full bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 py-3 rounded-xl font-medium transition-all"
                onClick={handleManageDept}
                title="Manage Department"
                >
                Manage Department
                </CustomButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DepartmentsMain;
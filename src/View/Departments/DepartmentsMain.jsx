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

  const { empBranches, fetchingAllBranches } = useEmployees();

  useEffect(() => {
    if (empBranches.length === 0) {
      fetchingAllBranches();
    }
  }, []);

  const location = useLocation();

  // console.log('branchId', branchId)
  // console.log("allBranches", empBranches)

  return (
    <>
      <div className="flex justify-between py-2 lg:px-2 md:px-2 px-0">
        <span className="text-[20px] font-Urbanist font-semibold text-[#474747]">
          Manage Departments
        </span>
      </div>

      {location.pathname.includes("manageDept") ? (
        <Outlet />
      ) : location.pathname.includes("createNewDept") ? (
        <Outlet />
      ) : (
        <div className="flex flex-col space-y-4 items-center mt-4">
          <span className="lg:text-[16px] md:text-[15px] text-[14px] font-Urbanist font-medium text-[#474747]">
            Choose your branch office from the list below
          </span>

          <div className="lg:w-96 md:w-96 w-full">
            <CustomSelect
              placeHolderTitle="Select Branch"
              value={
                branchId
                  ? empBranches?.find((branch) => branch.id === branchId)
                    ? {
                        value: branchId,
                        label: empBranches.find(
                          (branch) => branch.id === branchId
                        ).branch_name,
                      }
                    : null
                  : null
              }
              options={[
                { value: "", label: "Select Branch" },
                ...(empBranches?.map((branch) => ({
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

          <div className="text-[12px] flex gap-3">
            <CustomButton
              className="bg-bgBlue capitalize p-2 font-medium"
              onClick={handleNavigateNewDept}
              title="Create Department"
            >
              {/* Create Department */}
            </CustomButton>
            <CustomButton
              className="bg-[#8bc9f8] capitalize p-2 font-medium"
              onClick={handleManageDept}
              title="Manage Department"
            >
              {/* Manage Department */}
            </CustomButton>
          </div>
          <div></div>
        </div>
      )}
    </>
  );
};

export default DepartmentsMain;
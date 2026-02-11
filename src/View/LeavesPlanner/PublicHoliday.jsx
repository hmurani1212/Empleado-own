import React, { useEffect, useState } from "react";
import { Button, Option, Select } from "@material-tailwind/react";
import useLeavesPlanner from "../../ViewModel/LeavePlannerViewModel/LeavePlannerServices";
import CustomButton from "../../Components/CustomButton/CustomButton";
import GoogleForm from "./GoogleForm";
import GoogleFormDialog from "../../Components/GoogleFormDialog/GoogleFormDialog";
import PublicHolidayCalendar from "./PublicHolidayCalendar";
import usePublicHolidayServices from "../../ViewModel/LeavePlannerViewModel/publicHolidayServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { FaXmark } from "react-icons/fa6";
import { PublicHolidayCalendarSkeleton, PublicHolidayControlsSkeleton } from "./LeavesPlannerSkeletons";

const PublicHoliday = () => {
  const {
    policiesList,
    googleCalenderHolidays,
    handleSelectChangeBranch,
    showGoogleForm,
    handleGoogleModal,
    googleHolidays,
  } = useLeavesPlanner();

  const {
    publicHolidayValue,
    handleNextMonth,
    handlePreviousMonth,
    gettingBranchesForLeavePlanner,
    handleSelectLeavePlanner,
    showSingleHoliday,
    handleSingleDayPublicHoliday,
    toggleHandleSingleDayPublicHoliday,
    handleRemovePolicyList,
    handleRemovePublicHoliday,
    handleChangeAddPublicHoliday,
    addPublicHolidaysValue,
    handleAddPublicHoliday,
  } = usePublicHolidayServices();

  const [publicHolidayLoading, setPublicHolidayLoading] = useState(true);

  useEffect(() => {
    setPublicHolidayLoading(true);
    gettingBranchesForLeavePlanner().finally(() => setPublicHolidayLoading(false));
  }, []);

  return (
    <>
      <div className="flex flex-col gap-3">
        {publicHolidayLoading ? (
          <PublicHolidayControlsSkeleton />
        ) : (
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <div className="w-52">
              <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
                Select Branch
              </label>
              <CustomSelect
                placeHolderTitle="Branch"
                value={publicHolidayValue.branchId}
                options={[
                  { value: "all", label: "All Branches" },
                  ...(publicHolidayValue?.branchesList?.map((branch) => ({
                    value: branch.id,
                    label: branch.branch_name,
                  })) || []),
                ]}
                onChangeHandler={(selectedOption) =>
                  handleSelectLeavePlanner(selectedOption, "branchId")
                }
                customStyles={false}
              />
            </div>
            <div className="w-52">
              <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">
                Policy
              </label>
              <CustomSelect
                placeHolderTitle="Policy"
                value={publicHolidayValue.policyId}
                options={[
                  { value: "all", label: "All Policies" },
                  ...(publicHolidayValue.policyList?.map((policy) => ({
                    value: policy.id,
                    label: policy.policy_name + " (" + policy.id + ")",
                  })) || []),
                ]}
                onChangeHandler={(selectedOption) =>
                  handleSelectLeavePlanner(selectedOption, "policyId")
                }
                customStyles={false}
              />
            </div>
            {publicHolidayValue?.selectedPolicy.length > 0 && (
              <div className="flex flex-col gap-1 border border-customGray-100 rounded-lg h-fit max-h-[100px] w-[300px] customScroll overflow-y-auto mt-8">
                {publicHolidayValue?.selectedPolicy?.map((ele) => (
                  <div
                    key={ele.value}
                    className="flex flex-row items-center gap-4 bg-customBlue py-1 px-3"
                  >
                    <span
                      className="h-4 w-4 flex items-center justify-center bg-customRed-100 text-[10px] text-white rounded-full cursor-pointer"
                      onClick={() => handleRemovePolicyList(ele)}
                    >
                      <FaXmark />
                    </span>
                    <span className="text-white text-[12px]">
                      {ele.label} (#{ele.value})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pr-2">
            <span>
              <CustomButton
                className="bg-[#8bc9f8]"
                title="Integrate with Google Calender"
                onClick={() => googleCalenderHolidays()}
              ></CustomButton>
            </span>
          </div>
        </div>
        )}
        <div>
          {publicHolidayLoading ? (
            <PublicHolidayCalendarSkeleton />
          ) : (
            <PublicHolidayCalendar
              publicHolidayValue={publicHolidayValue}
              handlePreviousMonth={handlePreviousMonth}
              handleNextMonth={handleNextMonth}
              handleSingleDayPublicHoliday={handleSingleDayPublicHoliday}
              showSingleHoliday={showSingleHoliday}
              toggleHandleSingleDayPublicHoliday={
                toggleHandleSingleDayPublicHoliday
              }
              handleRemovePublicHoliday={handleRemovePublicHoliday}
              addPublicHolidaysValue={addPublicHolidaysValue}
              handleChangeAddPublicHoliday={handleChangeAddPublicHoliday}
              handleAddPublicHoliday={handleAddPublicHoliday}
            />
          )}
        </div>
      </div>

      {showGoogleForm && (
        <GoogleFormDialog
          compo={
            <GoogleForm
              data={googleHolidays}
              handleGoogleModal={handleGoogleModal}
            />
          }
          openDialog={showGoogleForm}
          handleOpen={handleGoogleModal}
          size="xl"
          title="Import Google Holiday"
        />
      )}
    </>
  );
};

export default PublicHoliday;
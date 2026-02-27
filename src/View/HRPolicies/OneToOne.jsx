import { Checkbox, Typography, Button } from "@material-tailwind/react";
import React, { useEffect } from "react";
import useHRPolicies from "../../ViewModel/HRPoliciesViewModel/HRPoliciesServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { FaInfoCircle } from "react-icons/fa";

const OneToOne = (props) => {
  const {
    handleSelectChange,
    swapPolicyValue,
    handleChange,
    handleCheckbox,
    handleOneToOnePolicy,
    openContentDrawer,
  } = props;
  const { gettingPolicyForSwap, allPoliciesForSwap } = useHRPolicies();

  useEffect(() => {
    gettingPolicyForSwap();
  }, []);

  return (
    <form onSubmit={handleOneToOnePolicy} className="flex flex-col gap-6">
      
      {/* Policy Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-gray-700 font-poppins">
              Choose Current Policy
            </label>
            {openContentDrawer && (
              <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("CHOOSE_CURRENT_HR_POLICY_TO_BE_SWAPPED")} />
            )}
          </div>
          <CustomSelect
            placeHolderTitle="Select HR Policy"
            value={swapPolicyValue?.currentPolicy}
            options={allPoliciesForSwap?.map((policy) => ({
              value: policy.id,
              label: policy.policy_name,
            }))}
            onChangeHandler={(selectedOption) =>
              handleSelectChange(selectedOption, "currentPolicy")
            }
            customStyles={false}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 font-poppins">
            Choose Policy to Swap with
          </label>
          <CustomSelect
            placeHolderTitle="Select HR Policy"
            value={swapPolicyValue?.swapPolicy}
            options={allPoliciesForSwap?.map((policy) => ({
              value: policy.id,
              label: policy.policy_name,
            }))}
            onChangeHandler={(selectedOption) =>
              handleSelectChange(selectedOption, "swapPolicy")
            }
            customStyles={false}
          />
        </div>
      </div>

      {/* Swap Scheduling */}
      <div className="border-t border-gray-100 pt-6">
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-semibold text-gray-900 font-poppins">
                Swap Scheduling <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              {openContentDrawer && (
                <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("SWAPSCHEDULING_HRPOLICIES_EMP")} />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-600 font-poppins">Effective From</label>
                    <input
                        type="date"
                        name="effectiveFromDate"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                        value={swapPolicyValue.effectiveFromDate}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-gray-600 font-poppins">Time</label>
                    <input
                        type="time"
                        name="effectiveFromTime"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                        value={swapPolicyValue.effectiveFromTime}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Rollback Section */}
      <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
        <div className="flex flex-col gap-1 mb-4">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-semibold text-blue-600 font-poppins">Rollback Configuration</label>
              {openContentDrawer && (
                <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("ROLLBACK_HRPOLICIES_EMP")} />
              )}
            </div>
            <span className="text-xs text-gray-500 font-poppins">
            Specify a rollback date/time to automatically revert the policy swap after a period.
            </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-600 font-poppins">Rollback Date</label>
            <input
                type="date"
                name="rollBackDate"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                onChange={handleChange}
                value={swapPolicyValue.rollBackDate}
            />
            </div>
            <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-600 font-poppins">Rollback Time</label>
            <input
                type="time"
                name="rollBackTime"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                onChange={handleChange}
                value={swapPolicyValue.rollBackTime}
            />
            </div>
        </div>
      </div>

      {/* Recursive Options */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
            <Checkbox
            color="blue"
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
            containerProps={{ className: "p-0 mr-2" }}
            name="checkBox"
            checked={swapPolicyValue.checkBox === 1}
            onChange={handleCheckbox}
            label={
                <span className="flex items-center gap-1.5">
                  <Typography className="text-sm font-medium text-gray-700 font-poppins">Make Swap Policy Recursive</Typography>
                  {openContentDrawer && (
                    <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={(e) => { e.preventDefault(); e.stopPropagation(); openContentDrawer("MAKE_SWAP_POLICY_RECURSIVE"); }} />
                  )}
                </span>
            }
            />
        </div>
        
        {swapPolicyValue.checkBox == 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
                <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-600 font-poppins">Recursive After (Days)</label>
                <input
                    placeholder="e.g. 7"
                    type="number"
                    name="days"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    onChange={handleChange}
                    value={swapPolicyValue.days}
                />
                </div>
            </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex justify-end">
        {swapPolicyValue.loading ? (
          <Button
            className="bg-bgBlue/80 px-8 py-2.5 rounded-xl capitalize font-poppins text-sm flex items-center gap-2"
            disabled
          >
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </Button>
        ) : (
          <CustomButton
            type="submit"
            title="Confirm Swap"
            className="bg-bgBlue px-8 py-2.5 rounded-xl capitalize font-poppins text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
          />
        )}
      </div>
    </form>
  );
};

export default OneToOne;
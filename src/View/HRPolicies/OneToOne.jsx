import {
  Button,
  Checkbox,
  Input,
  Option,
  Select,
  Typography,
} from "@material-tailwind/react";
import React, { useEffect } from "react";
import useHRPolicies from "../../ViewModel/HRPoliciesViewModel/HRPoliciesServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import CustomButton from "../../Components/CustomButton/CustomButton";

const OneToOne = (props) => {
  const {
    handleSelectChange,
    swapPolicyValue,
    handleChange,
    handleCheckbox,
    handleOneToOnePolicy,
  } = props;
  const { gettingPolicyForSwap, allPoliciesForSwap } = useHRPolicies();
  console.log("allPoliciesForSwap", allPoliciesForSwap);
  useEffect(() => {
    gettingPolicyForSwap();
  }, []);
  return (
    <form onSubmit={handleOneToOnePolicy} className="flex flex-col gap-4 p-3">
      <div className="flex items-center gap-10 w-full">
        <div className="w-[450px] flex flex-col">
          <label className="text-[#474747] font-medium font-Urbanist text-[12px] px-2">
            Choose Current Policy
          </label>
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
        <div className="w-[450px] flex flex-col">
          <label className="text-[#474747] font-medium font-Urbanist text-[12px] px-2">
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
            // onChangeHandler={handleSelectChange}
            customStyles={false}
          />
        </div>
      </div>
      <div className="flex gap-10">
        <div className="w-[450px] flex flex-col">
          <label className="text-[#474747] font-medium font-Urbanist text-[12px] px-2">
            Swap Scheduling (Optional)
          </label>
          <input
            type="date"
            placeholder="Effective From"
            color="blue"
            name="effectiveFromDate"
            className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
            value={swapPolicyValue.effectiveFromDate}
            onChange={handleChange}
          />
        </div>
        <div className="w-[450px] flex flex-col">
          <label className="text-[#474747] font-medium font-Urbanist text-[12px] px-2">
            Time
          </label>
          <input
            type="time"
            label="Time"
            color="blue"
            name="effectiveFromTime"
            className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
            value={swapPolicyValue.effectiveFromTime}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="flex flex-col">
        <label className="text-blue-500">Rollback (Optional)</label>
        <span className="text-[11px] overflow-hidden">
          If you want the policy to be reverted back after a time period, then
          specify the rollback date and time below
        </span>
      </div>
      <div className="flex gap-10">
        <div className="w-[450px] flex flex-col">
          <label className="text-[#474747] font-medium font-Urbanist px-2 text-[12px]">
            Rollback Date
          </label>
          <input
            type="date"
            placeholder="Rollback Date"
            color="blue"
            className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
            name="rollBackDate"
            onChange={handleChange}
            value={swapPolicyValue.rollBackDate}
          />
        </div>
        <div className="w-[450px] flex flex-col">
          <label className="text-[#474747] font-medium font-Urbanist text-[12px] px-2">
            Time
          </label>
          <input
            type="time"
            placeholder="Time"
            color="blue"
            name="rollBackTime"
            className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
            onChange={handleChange}
            value={swapPolicyValue.rollBackTime}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-blue-500">Make Swap Policy Recursive</label>
        <Checkbox
          color="blue"
          size="sm"
          name="checkBox"
          checked={swapPolicyValue.checkBox === 1}
          onChange={handleCheckbox}
          label={
            <Typography className="text-[12px]">Is Recursive Swap</Typography>
          }
        />
      </div>
      {swapPolicyValue.checkBox == 1 && (
        <div className="w-[450px] flex flex-col">
          <label className="text-[#474747] text-[12px] font-medium font-Urbanist px-2">
            Recursive After
          </label>
          <input
            placeholder="Number of Days to"
            color="blue"
            className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
            type="number"
            name="days"
            onChange={handleChange}
            value={swapPolicyValue.days}
            containerProps={{ className: "min-w-[320px]" }}
          />
        </div>
      )}
      <div>
        {swapPolicyValue.loading ? (
          <Button
            className="px-2 py-2 text-[13px] text-semibold capitalize bg-[#8bc9f8] text-white"
            loading
          >
            Loading
          </Button>
        ) : (
          <CustomButton
            type="submit"
            title="Swap Policy"
            className="px-2 py-2 text-[13px] text-semibold capitalize bg-[#8bc9f8] text-white"
          >
            Swap Policy
          </CustomButton>
        )}
      </div>
    </form>
  );
};

export default OneToOne;
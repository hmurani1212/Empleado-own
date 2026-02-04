import React from "react";
import {
  days,
  generationTypeData,
  MonthSelection,
  shortDays,
} from "../../services/__hrPoliciesServices";
import { Input, Option, Select } from "@material-tailwind/react";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";

// Floating Label Wrapper for Input fields
const FloatingLabelInput = ({
  label,
  value,
  onChange,
  name,
  type = "text",
  placeholder,
  className = "",
  min,
  max,
  step,
  required,
  ...props
}) => {
  // Check if input has a value
  const hasValue = value !== undefined && value !== null && value !== "";
  // Only show floating label when there's a value (not when placeholder is shown)
  const showLabel = hasValue;

  return (
    <div className="relative">
      {showLabel && (
        <label
          className="absolute left-3 top-0 text-[10px] text-blue-500 bg-white px-1 -translate-y-1/2 z-10 transition-all duration-200 pointer-events-none"
        >
          {label}
        </label>
      )}
      <div className={showLabel ? "pt-2" : ""}>
        <input
          type={type}
          placeholder={showLabel ? "" : placeholder}
          name={name}
          value={value || ""}
          onChange={onChange}
          className={className}
          min={min}
          max={max}
          step={step}
          required={required}
          {...props}
        />
      </div>
    </div>
  );
};

// Floating Label Wrapper for CustomSelect
const FloatingLabelSelect = ({
  label,
  value,
  options,
  onChangeHandler,
  placeHolderTitle,
  cStyle = false,
}) => {
  return (
    <div className="relative">
      <CustomSelect
        placeHolderTitle={placeHolderTitle}
        value={value}
        options={options}
        onChangeHandler={onChangeHandler}
        cStyle={cStyle}
      />
    </div>
  );
};

const PayrollSettings = (props) => {
  const { handleSelectChange, newhrPolicesValues, handleChange } = props;
  console.log("newhrPolicesValues", newhrPolicesValues);
  return (
    <div className="flex flex-col items-center gap-3 space-y-2">
      <div className="w-[34rem]">
        <label className="text-[12px] font-Urbanist font-medium px-2 text-[#474747]">
          Payslip Generation Type
        </label>
        <FloatingLabelSelect
          label="Payslip Generation Type"
          placeHolderTitle="Select Payslip Generation Type"
          value={newhrPolicesValues?.generationType}
          options={generationTypeData?.map((ele) => ({
            value: ele.id,
            label: ele.title,
          }))}
          onChangeHandler={(selectedOption) =>
            handleSelectChange(selectedOption, "generationType")
          }
          cStyle={false}
        />
      </div>
      <div className="flex items-center justify-center gap-1">
        <div>
          <span className="text-[11px]">From</span>
        </div>
        <div className="w-24">
          <FloatingLabelSelect
            label="Select Day"
            placeHolderTitle="Select Day"
            value={newhrPolicesValues?.dayFrom}
            options={days?.map((ele) => ({ value: ele, label: ele }))}
            onChangeHandler={(selectedOption) =>
              handleSelectChange(selectedOption, "dayFrom")
            }
            cStyle={false}
          />
        </div>
        <div>
          <span className="text-[11px]">Of</span>
        </div>
        <div className="w-32">
          <FloatingLabelSelect
            label="Select Month"
            placeHolderTitle="Select Month"
            value={newhrPolicesValues?.selectedMonth}
            options={MonthSelection?.map((ele) => ({
              value: ele.value,
              label: ele.title,
            }))}
            onChangeHandler={(selectedOption) =>
              handleSelectChange(selectedOption, "selectedMonth")
            }
            cStyle={false}
          />
        </div>
        <div>
          <span className="text-[11px]">To</span>
        </div>
        <div className="w-24">
          <FloatingLabelSelect
            label="Select Day"
            placeHolderTitle="Select Day"
            value={newhrPolicesValues?.dayTo}
            options={(newhrPolicesValues.selectedMonth?.value === "current"
              ? shortDays
              : days
            ).map((ele) => ({ value: ele, label: ele }))}
            onChangeHandler={(selectedOption) =>
              handleSelectChange(selectedOption, "dayTo")
            }
            cStyle={false}
          />
        </div>
        <div>
          <span className="text-[11px]">
            of{" "}
            {newhrPolicesValues.selectedMonth?.value === "current"
              ? "Next"
              : "Current"}{" "}
            Month
          </span>
        </div>
      </div>
      {/* Show Off Days input - always visible on step 2, not conditional on generationType */}
      <div className="w-[34rem]">
        <FloatingLabelInput
          label="Off Days Allowed Per Month"
          placeholder="Off Days Allowed Per Month"
          name="offDayAllowedMonth"
          type="number"
          value={newhrPolicesValues.offDayAllowedMonth}
          onChange={handleChange}
          required
          min="0"
          className='bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]'
        />
      </div>

      {/* Show additional fields only for Hourly Base (3) */}
      {newhrPolicesValues.generationType?.value === 3 && (
        <>
          <div className="w-[34rem]">
            <FloatingLabelInput
              label="Required Working Hours"
              placeholder="Required Working Hours"
              name="reqWorkingHrs"
              type="number"
              value={newhrPolicesValues.reqWorkingHrs}
              onChange={handleChange}
              required
              min="0"
              className='bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]'
            />
          </div>
          <div className="w-[34rem]">
            <FloatingLabelInput
              label="Required Minutes"
              placeholder="Required Working Minutes"
              name="reqMinutes"
              type="number"
              value={newhrPolicesValues.reqMinutes}
              onChange={handleChange}
              required
              min="0"
              className='bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]'
            />
          </div>
          <div className="w-[34rem]">
            <FloatingLabelInput
              label="Max Shift Retaining Hours"
              placeholder="Max Shift Retaining Hours"
              name="shiftRetHrs"
              type="number"
              value={newhrPolicesValues.shiftRetHrs}
              onChange={handleChange}
              required
              min="0"
              className='bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]'
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PayrollSettings;
import { Checkbox, Input, Option, Select } from "@material-tailwind/react";
import React from "react";
import {
  earlyArivalData,
  forceTimeOutHrs,
  timeOutPlicy,
} from "../../services/__hrPoliciesServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";

// Floating Label Wrapper for CustomSelect
const FloatingLabelSelect = ({
  label,
  value,
  options,
  onChangeHandler,
  placeHolderTitle,
  cStyle = false,
}) => {
  // More robust value checking
  const hasValue =
    value &&
    ((typeof value === "object" &&
      (value.value !== undefined || value.label !== undefined)) ||
      (typeof value === "string" && value.trim() !== "") ||
      (typeof value === "number" && value !== 0));

  return (
    <div className={`relative ${hasValue ? "bottom-1" : ""}`}>
      <label
        className={`absolute left-3 transition-all duration-200 pointer-events-none ${
          hasValue
            ? "top-0 text-[10px] text-blue-500 bg-white px-1 -translate-y-1/2"
            : "top-3 text-[12px] text-[#698592]"
        }`}
      >
        {label}
      </label>
      <div className={hasValue ? "pt-2" : ""}>
        <CustomSelect
          placeHolderTitle={placeHolderTitle}
          value={value}
          options={options}
          onChangeHandler={onChangeHandler}
          cStyle={cStyle}
        />
      </div>
    </div>
  );
};

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
  containerProps,
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
          {...props}
        />
      </div>
    </div>
  );
};

const WorkingHours = (props) => {
  const {
    newhrPolicesValues,
    handleChange,
    handleCheckboxChange,
    handleTimeChange,
    handleSelectChange,
    rangeValues,
    handleRangeChange,
  } = props;

  // Custom handler for Late Comers Penalty to skip 0.5
  const handleLateComerPenaltyChange = (e) => {
    const value = parseFloat(e.target.value);
    const currentValue = parseFloat(newhrPolicesValues.lateComerPenalty) || 0;

    if (value === 0.5) {
      // Skip 0.5 based on direction
      if (currentValue === 0) {
        // Going up from 0 → skip 0.5 and go to 1
        e.target.value = "1";
      } else if (currentValue === 1) {
        // Going down from 1 → skip 0.5 and go to 0
        e.target.value = "0";
      } else {
        // For any other value, if we land on 0.5, go to 1
        e.target.value = "1";
      }
    }
    handleChange(e);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-2 w-full">
        <div className="md:col-span-4 lg:col-span-4">
          <FloatingLabelInput
            label="Shift Start Time"
            type="time"
            placeholder="Shift Start Time"
            name="startTime"
            onChange={handleChange}
            value={newhrPolicesValues.startTime}
            className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
          />
        </div>
        <div className="md:col-span-4 lg:col-span-4">
          <FloatingLabelInput
            label="Late Coming Leniency Time"
            type="number"
            placeholder="Late Coming Leniency Time"
            name="leniencyTime"
            value={newhrPolicesValues.leniencyTime}
            onChange={handleChange}
            min="0"
            className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
          />
        </div>
        <div className="md:col-span-4 lg:col-span-4">
          <FloatingLabelSelect
            label="Early Arrival Policy"
            placeHolderTitle="Select Arrival Policy"
            value={newhrPolicesValues?.arivalPolicy}
            options={earlyArivalData?.map((ele) => ({
              value: ele.id,
              label: ele.title,
            }))}
            onChangeHandler={(selectedOption) =>
              handleSelectChange(selectedOption, "arivalPolicy")
            }
            cStyle={false}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-2 w-full">
        <div className="md:col-span-4 lg:col-span-4">
          <FloatingLabelInput
            label="Shift Closing Time"
            type="time"
            placeholder="Shift Closing Time"
            name="endTime"
            value={newhrPolicesValues.endTime}
            onChange={handleChange}
            className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
          />
        </div>
        <div className="md:col-span-4  lg:col-span-4">
          <FloatingLabelSelect
            label="Force Timeout"
            placeHolderTitle="Force Timeout"
            value={newhrPolicesValues?.forceTimeOut}
            options={forceTimeOutHrs?.map((ele) => ({
              value: ele.id,
              label: ele.title,
            }))}
            onChangeHandler={(selectedOption) =>
              handleSelectChange(selectedOption, "forceTimeOut")
            }
            cStyle={false}
          />
        </div>
        <div className="md:col-span-4 lg:col-span-4">
          <FloatingLabelSelect
            label="Timeout Policy"
            placeHolderTitle="Timeout Policy"
            value={newhrPolicesValues?.timeOutPolicy}
            options={timeOutPlicy?.map((ele) => ({
              value: ele.value,
              label: ele.title,
            }))}
            onChangeHandler={(selectedOption) =>
              handleSelectChange(selectedOption, "timeOutPolicy")
            }
            cStyle={false}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-2 w-full">
        <div className="md:col-span-4 lg:col-span-4">
          <FloatingLabelInput
            label="Late Minute Monthly Bucket"
            type="number"
            placeholder="Late Minute Monthly Bucket"
            name="lateMinutBuket"
            onChange={handleChange}
            value={newhrPolicesValues.lateMinutBuket}
            min="0"
            max={999}
            className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
          />
        </div>
        <div className="md:col-span-4 lg:col-span-4">
          <FloatingLabelInput
            label="Late Comers Penalty"
            type="number"
            placeholder="Late Comers Penalty"
            name="lateComerPenalty"
            onChange={handleLateComerPenaltyChange}
            value={newhrPolicesValues.lateComerPenalty}
            min="0"
            max="4"
            step="0.5"
            className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
          />
        </div>
      </div>

      <div>
        <div className="flex flex-col items-center gap-3">
          <table className="table-auto w-full border-0">
            <thead>
              <tr>
                <th className="px-4 py-2 text-[13px] font-medium font-Urbanist text-[#474747]">
                  Day
                </th>
                <th className="px-4 py-2 text-[13px] font-medium font-Urbanist text-[#474747]">
                  Start Time
                </th>
                <th className="px-4 py-2 text-[13px] font-medium font-Urbanist text-[#474747]">
                  End Time
                </th>
              </tr>
            </thead>
            <tbody>
              {newhrPolicesValues?.schedule?.map((item, index) => (
                <tr key={index} className="">
                  <td className="flex items-center">
                    <Checkbox
                      type="checkbox"
                      color="blue"
                      checked={item.isChecked}
                      onChange={() => handleCheckboxChange(item, index)}
                      // className='mr-2'
                    />
                    <span className="text-[12px] font-Urbanist font-medium text-[#474747]">
                      {item.day}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                      type="time"
                      placeholder="Start Time"
                      color="blue"
                      value={item.startTime}
                      onChange={(e) =>
                        handleTimeChange(index, "startTime", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                      type="time"
                      placeholder="End Time"
                      color="blue"
                      value={item.endTime}
                      onChange={(e) =>
                        handleTimeChange(index, "endTime", e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* {newhrPolicesValues?.generationType.id !== 3 &&
        <div>
            
            <div className="flex items-center">
            <input
                type="range"
                min="0"
                max="100"
                value={rangeValues[0]}
                onChange={handleRangeChange}
                className="range-thumb appearance-none h-3 w-full bg-gray-300 rounded-full outline-none"
            />
            <input
                type="range"
                min="0"
                max="100"
                value={rangeValues[1]}
                onChange={handleRangeChange}
                className="range-thumb appearance-none h-3 w-full bg-gray-300 rounded-full outline-none"
            />
        </div>
        </div>
      } */}
    </div>
  );
};

export default WorkingHours;
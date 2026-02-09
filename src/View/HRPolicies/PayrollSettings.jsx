import React from "react";
import {
  days,
  generationTypeData,
  MonthSelection,
  shortDays,
} from "../../services/__hrPoliciesServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";

const PayrollSettings = (props) => {
  const { handleSelectChange, newhrPolicesValues, handleChange } = props;
  
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="w-full">
        <label className="text-sm font-medium text-gray-700 font-poppins mb-2 block">
          Payslip Generation Type
        </label>
        <CustomSelect
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

      <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
        <label className="text-sm font-medium text-gray-700 font-poppins mb-4 block text-center">
            Payroll Cycle
        </label>
        <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs font-medium text-gray-500 font-poppins">From</span>
            <div className="w-24">
            <CustomSelect
                placeHolderTitle="Day"
                value={newhrPolicesValues?.dayFrom}
                options={days?.map((ele) => ({ value: ele, label: ele }))}
                onChangeHandler={(selectedOption) =>
                handleSelectChange(selectedOption, "dayFrom")
                }
                cStyle={false}
            />
            </div>
            <span className="text-xs font-medium text-gray-500 font-poppins">Of</span>
            <div className="w-36">
            <CustomSelect
                placeHolderTitle="Month"
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
            <span className="text-xs font-medium text-gray-500 font-poppins">To</span>
            <div className="w-24">
            <CustomSelect
                placeHolderTitle="Day"
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
            <span className="text-xs font-medium text-gray-500 font-poppins bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
            of {newhrPolicesValues.selectedMonth?.value === "current" ? "Next" : "Current"} Month
            </span>
        </div>
      </div>

      <div className="w-full">
        <label className="text-sm font-medium text-gray-700 font-poppins mb-2 block">
          Off Days Allowed Per Month
        </label>
        <input
          placeholder="e.g. 2"
          name="offDayAllowedMonth"
          type="number"
          value={newhrPolicesValues.offDayAllowedMonth}
          onChange={handleChange}
          required
          min="0"
          className='w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400'
        />
      </div>

      {/* Show additional fields only for Hourly Base (3) */}
      {newhrPolicesValues.generationType?.value === 3 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up border-t border-gray-100 pt-6">
          <div className="w-full">
            <label className="text-sm font-medium text-gray-700 font-poppins mb-2 block">
              Required Working Hours
            </label>
            <input
              placeholder="e.g. 8"
              name="reqWorkingHrs"
              type="number"
              value={newhrPolicesValues.reqWorkingHrs}
              onChange={handleChange}
              required
              min="0"
              className='w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400'
            />
          </div>
          <div className="w-full">
            <label className="text-sm font-medium text-gray-700 font-poppins mb-2 block">
              Required Minutes
            </label>
            <input
              placeholder="e.g. 30"
              name="reqMinutes"
              type="number"
              value={newhrPolicesValues.reqMinutes}
              onChange={handleChange}
              required
              min="0"
              className='w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400'
            />
          </div>
          <div className="w-full md:col-span-2">
            <label className="text-sm font-medium text-gray-700 font-poppins mb-2 block">
              Max Shift Retaining Hours
            </label>
            <input
              placeholder="e.g. 12"
              name="shiftRetHrs"
              type="number"
              value={newhrPolicesValues.shiftRetHrs}
              onChange={handleChange}
              required
              min="0"
              className='w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400'
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollSettings;
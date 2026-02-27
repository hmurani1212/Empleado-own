import React from "react";
import {
  overTimeCounter,
  overTimeRate,
  weekendoverTimeRate,
} from "../../services/__hrPoliciesServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { FaInfoCircle } from "react-icons/fa";

const OverTimeLeave = (props) => {
  const {
    handleSelectChange,
    newhrPolicesValues,
    leavesGroupOptionList,
    handleChange,
    openContentDrawer,
  } = props;
  
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="w-full">
        <div className="flex items-center gap-1.5 mb-2">
          <label className="text-sm font-medium text-gray-700 font-poppins block">
            Daily Overtime Counter
          </label>
          {openContentDrawer && (
            <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("DAILYOVERTIME_HRPOLICY_EMP")} />
          )}
        </div>
        <CustomSelect
          placeHolderTitle="Select Daily Overtime Counter"
          value={newhrPolicesValues?.overTimeCounter}
          options={overTimeCounter?.map((ele) => ({
            value: ele.value,
            label: ele.title,
          }))}
          onChangeHandler={(selectedOption) =>
            handleSelectChange(selectedOption, "overTimeCounter")
          }
          cStyle={false}
        />
      </div>

      {newhrPolicesValues.overTimeCounter?.value === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up border-t border-gray-100 pt-6">
          <div className="w-full">
            <label className="text-sm font-medium text-gray-700 font-poppins mb-2 block">
              Overtime Start Threshold
            </label>
            <input
              className='w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400'
              placeholder="Minutes after duty closing"
              type="number"
              name="workingDaysdutyClosingMinutesOT"
              value={newhrPolicesValues.workingDaysdutyClosingMinutesOT}
              onChange={handleChange}
            />
          </div>
          <div className="w-full">
            <label className="text-sm font-medium text-gray-700 font-poppins mb-2 block">
              Minimum Overtime Required
            </label>
            <input
              className='w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400'
              placeholder="Minimum minutes"
              type="number"
              value={newhrPolicesValues.minReqOT}
              onChange={handleChange}
              name="minReqOT"
            />
          </div>
          <div className="w-full">
            <label className="text-sm font-medium text-gray-700 font-poppins mb-2 block">
              Overtime Rate Type
            </label>
            <CustomSelect
              placeHolderTitle="Select Overtime Rate"
              value={newhrPolicesValues?.overTime}
              options={overTimeRate?.map((ele) => ({
                value: ele.value,
                label: ele.title,
              }))}
              onChangeHandler={(selectedOption) =>
                handleSelectChange(selectedOption, "overTime")
              }
              cStyle={false}
            />
          </div>

          {(newhrPolicesValues.overTime.value === 0 ||
            newhrPolicesValues.overTime.value === 2) && (
            <div className="w-full">
              <label className="text-sm font-medium text-gray-700 font-poppins mb-2 block">
                Overtime Rate Value
              </label>
              <input
                className='w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400'
                placeholder="Rate"
                type="number"
                name="workingDaysOTRate"
                value={newhrPolicesValues.workingDaysOTRate}
                onChange={handleChange}
              />
            </div>
          )}
        </div>
      )}

      <div className="border-t border-gray-100 pt-6">
        <div className="w-full mb-6">
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-sm font-medium text-gray-700 font-poppins block">
                Holiday/Weekend Overtime
              </label>
              {openContentDrawer && (
                <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("HOLIDAYOVERTIME_HRPOLICY_EMP")} />
              )}
            </div>
            <CustomSelect
            placeHolderTitle="Select Holiday/Weekend Overtime"
            value={newhrPolicesValues?.weekendoverTime}
            options={weekendoverTimeRate?.map((ele) => ({
                value: ele.value,
                label: ele.title,
            }))}
            onChangeHandler={(selectedOption) =>
                handleSelectChange(selectedOption, "weekendoverTime")
            }
            cStyle={false}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(newhrPolicesValues.weekendoverTime.value === 1 ||
                newhrPolicesValues.weekendoverTime.value === 5) && (
                <div className="w-full animate-fade-in-up">
                <label className="text-sm font-medium text-gray-700 font-poppins mb-2 block">
                    Holiday Overtime Rate
                </label>
                <input
                    className='w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400'
                    placeholder="Rate"
                    type="number"
                    name="holidayOTRate"
                    value={newhrPolicesValues.holidayOTRate}
                    onChange={handleChange}
                />
                </div>
            )}
            {(newhrPolicesValues.weekendoverTime.value === 2 ||
                newhrPolicesValues.weekendoverTime.value === 3 ||
                newhrPolicesValues.weekendoverTime.value === 4) && (
                <>
                <div className="w-full animate-fade-in-up">
                    <label className="text-sm font-medium text-gray-700 font-poppins mb-2 block">
                    {newhrPolicesValues.weekendoverTime.value === 4 ? "Multiplier (X)" : "Rate"}
                    </label>
                    <input
                    className='w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400'
                    placeholder={newhrPolicesValues.weekendoverTime.value === 4 ? "e.g. 1.5" : "Rate"}
                    type="number"
                    name="holidayOTRatex"
                    value={newhrPolicesValues.holidayOTRatex}
                    onChange={handleChange}
                    />
                </div>
                <div className="w-full animate-fade-in-up">
                    <label className="text-sm font-medium text-gray-700 font-poppins mb-2 block">
                    Amount
                    </label>
                    <input
                    className='w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400'
                    placeholder="Amount"
                    type="number"
                    name="holidayOTAmount"
                    value={newhrPolicesValues.holidayOTAmount}
                    onChange={handleChange}
                    />
                </div>
                </>
            )}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <div className="w-full">
            <div className="flex items-center gap-1.5 mb-2">
              <label className="text-sm font-medium text-gray-700 font-poppins block">
                Leave Management Group
              </label>
              {openContentDrawer && (
                <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("LEAVEMANAGMENT_HRPOLICY_EMP")} />
              )}
            </div>
            <CustomSelect
            placeHolderTitle="Leave Management Group"
            value={newhrPolicesValues?.leaveManagementGroup}
            options={leavesGroupOptionList?.map((group) => ({
                value: group.value,
                label: group.label,
            }))}
            onChangeHandler={(selectedOption) =>
                handleSelectChange(selectedOption, "leaveManagementGroup")
            }
            customStyles={false}
            />
        </div>
      </div>
    </div>
  );
};

export default OverTimeLeave;
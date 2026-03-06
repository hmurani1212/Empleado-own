import { Checkbox } from "@material-tailwind/react";
import React from "react";
import {
  earlyArivalData,
  forceTimeOutHrs,
  timeOutPlicy,
} from "../../services/__hrPoliciesServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { FaInfoCircle } from "react-icons/fa";

// CSS to hide --:-- placeholder in time inputs
const timeInputStyle = `
  input[type="time"]:invalid::-webkit-datetime-edit-text,
  input[type="time"]:invalid::-webkit-datetime-edit-hour-field,
  input[type="time"]:invalid::-webkit-datetime-edit-minute-field {
    color: transparent;
  }
  input[type="time"]:focus::-webkit-datetime-edit-text,
  input[type="time"]:focus::-webkit-datetime-edit-hour-field,
  input[type="time"]:focus::-webkit-datetime-edit-minute-field {
    color: #474747;
  }
`;

const WorkingHours = (props) => {
  const {
    newhrPolicesValues,
    handleChange,
    handleCheckboxChange,
    handleTimeChange,
    handleSelectChange,
    rangeValues,
    handleRangeChange,
    openContentDrawer,
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
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      <style>{timeInputStyle}</style>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-gray-700 font-poppins">Shift Start Time</label>
            {openContentDrawer && (
              <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("SHIFTSTARTTIME_HRPOLICY_EMP")} />
            )}
          </div>
          <input
            type="time"
            name="startTime"
            onChange={handleChange}
            value={newhrPolicesValues.startTime}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-gray-700 font-poppins">Late Coming Leniency Time</label>
            {openContentDrawer && (
              <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("LATECOMINGLEINIENCYTIME_HRPOLICY_EMP")} />
            )}
          </div>
          <input
            type="number"
            placeholder="e.g. 15"
            name="leniencyTime"
            value={newhrPolicesValues.leniencyTime}
            onChange={handleChange}
            min="0"
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-gray-700 font-poppins">Early Arrival Policy</label>
            {openContentDrawer && (
              <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("EARLYARRIVAL_HRPOLICY_EMP")} />
            )}
          </div>
          <CustomSelect
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-gray-700 font-poppins">Shift Closing Time</label>
            {openContentDrawer && (
              <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("SHIFTCLOSING_HRPOLICY_EMP")} />
            )}
          </div>
          <input
            type="time"
            name="endTime"
            value={newhrPolicesValues.endTime}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-gray-700 font-poppins">Force Timeout</label>
            {openContentDrawer && (
              <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("FORCETIMEOUT_HRPOLICY_EMP")} />
            )}
          </div>
          <CustomSelect
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-gray-700 font-poppins">Timeout Policy</label>
            {openContentDrawer && (
              <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("TIMEOUT_HRPOLICY_EMP")} />
            )}
          </div>
          <CustomSelect
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-gray-700 font-poppins">Monthly Bucket</label>
            {openContentDrawer && (
              <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("LATEMINUTE_HRPOLICY_EMP")} />
            )}
          </div>
          <input
            type="number"
            placeholder="e.g. 60"
            name="lateMinutBuket"
            onChange={handleChange}
            value={newhrPolicesValues.lateMinutBuket}
            min="0"
            max={999}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400"
          />
          <div className="flex flex-col gap-2 mt-2">
            <label className="text-xs font-medium text-gray-500 font-poppins">Bucket type (optional)</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  color="blue"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
                  containerProps={{ className: "p-0" }}
                  checked={newhrPolicesValues.monthlyBucketType === 'late_minutes'}
                  disabled={!newhrPolicesValues.lateMinutBuket || newhrPolicesValues.lateMinutBuket === ''}
                  onChange={() => handleChange({ target: { name: 'monthlyBucketType', value: newhrPolicesValues.monthlyBucketType === 'late_minutes' ? '' : 'late_minutes' } })}
                />
                <span className={`text-sm font-poppins ${!newhrPolicesValues.lateMinutBuket ? 'text-gray-400' : 'text-gray-700'}`}>Late minutes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  color="blue"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
                  containerProps={{ className: "p-0" }}
                  checked={newhrPolicesValues.monthlyBucketType === 'early_leave'}
                  disabled={!newhrPolicesValues.lateMinutBuket || newhrPolicesValues.lateMinutBuket === ''}
                  onChange={() => handleChange({ target: { name: 'monthlyBucketType', value: newhrPolicesValues.monthlyBucketType === 'early_leave' ? '' : 'early_leave' } })}
                />
                <span className={`text-sm font-poppins ${!newhrPolicesValues.lateMinutBuket ? 'text-gray-400' : 'text-gray-700'}`}>Early Leave</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <label className="text-sm font-medium text-gray-700 font-poppins">Late Comers Penalty</label>
            {openContentDrawer && (
              <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("LATECOMERSPENALTY_HRPOLICY_EMP")} />
            )}
          </div>
          <input
            type="number"
            placeholder="e.g. 1"
            name="lateComerPenalty"
            onChange={handleLateComerPenaltyChange}
            value={newhrPolicesValues.lateComerPenalty}
            min="0"
            max="4"
            step="0.5"
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-poppins text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-1.5 mb-4">
          <label className="text-sm font-semibold text-gray-900 font-poppins block uppercase tracking-wider">Weekly Schedule</label>
          {openContentDrawer && (
            <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("WEEKDAYS_HRPOLICY_EMP")} />
          )}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full table-auto">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider font-poppins">
                  <span className="flex items-center gap-1.5">
                    Day
                    {openContentDrawer && (
                      <FaInfoCircle className="text-gray-400 text-sm cursor-pointer hover:text-[#3DA5F4] shrink-0" onClick={() => openContentDrawer("PERDAYPERCENTAGE_HRPOLICY_EMP")} />
                    )}
                  </span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider font-poppins">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider font-poppins">
                  End Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {newhrPolicesValues?.schedule?.map((item, index) => (
                <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                        <Checkbox
                        color="blue"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/20"
                        containerProps={{ className: "p-0" }}
                        checked={item.isChecked}
                        onChange={() => handleCheckboxChange(item, index)}
                        />
                        <span className={`text-sm font-medium font-poppins ${item.isChecked ? 'text-gray-900' : 'text-gray-400'}`}>
                        {item.day}
                        </span>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="time"
                      className={`w-full px-3 py-1.5 bg-white border rounded-lg text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${!item.isChecked ? 'bg-gray-50 text-gray-400 border-gray-100' : 'border-gray-200 text-gray-700 focus:border-blue-400'}`}
                      value={item.startTime}
                      disabled={!item.isChecked}
                      onChange={(e) =>
                        handleTimeChange(index, "startTime", e.target.value)
                      }
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="time"
                      className={`w-full px-3 py-1.5 bg-white border rounded-lg text-sm font-poppins focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${!item.isChecked ? 'bg-gray-50 text-gray-400 border-gray-100' : 'border-gray-200 text-gray-700 focus:border-blue-400'}`}
                      value={item.endTime}
                      disabled={!item.isChecked}
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
    </div>
  );
};

export default WorkingHours;
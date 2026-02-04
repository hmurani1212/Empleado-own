import { Input, Option, Select } from "@material-tailwind/react";
import React from "react";
import {
  overTimeCounter,
  overTimeRate,
  weekendoverTimeRate,
} from "../../services/__hrPoliciesServices";
import useCreatePolicies from "../../ViewModel/HRPoliciesViewModel/createHrPoliciesServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";

const OverTimeLeave = (props) => {
  const {
    handleSelectChange,
    newhrPolicesValues,
    leavesGroupOptionList,
    handleChange,
  } = props;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-[26rem]">
        <label className="text-[12px] text-[#474747] font-Urbanist font-medium px-2">
          Daily Overtime Counter
        </label>
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
        {/* <Select label='Daily Overtime Counter' color='blue' value={newhrPolicesValues.overTimeCounter} 
          onChange={(selected)=>handleSelectChange(selected, 'overTimeCounter')}
          name='overTimeCounter' 
            // renderValue={(selected) => selected.title}
          >
          {overTimeCounter.map((ele)=>(
            <Option key={ele.id} value={ele}>
              {ele.title}
            </Option>
          ))}
        </Select> */}
      </div>
      {newhrPolicesValues.overTimeCounter?.value === 1 && (
        <>
          <div className="w-[26rem]">
            <input
              className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
              placeholder="Overtime starts after following min of duty closing"
              color="blue"
              type="number"
              name="workingDaysdutyClosingMinutesOT"
              value={newhrPolicesValues.workingDaysdutyClosingMinutesOT}
              onChange={handleChange}
            />
          </div>
          <div className="w-[26rem]">
            <input
              className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
              placeholder="Minimum minute(s) required for overtime"
              // label='Minimum minute(s) required for overtime'
              color="blue"
              type="number"
              value={newhrPolicesValues.minReqOT}
              onChange={handleChange}
              name="minReqOT"
            />
          </div>
          <div className="w-[26rem]">
            <label className="text-[12px] text-[#474747] font-Urbanist font-medium px-2">
              Overtime Rate
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
            {/* <Select label='Overtime Rate' color='blue' value={newhrPolicesValues.overTime} 
            onChange={(selected)=>handleSelectChange(selected, 'overTime')}
            name='overTime' 
              // renderValue={(selected) => selected.title}
              
            >
            {overTimeRate.map((ele)=>(
              <Option key={ele.id} value={ele}>
                {ele.title}
              </Option>
            ))}
          </Select> */}
          </div>

          {(newhrPolicesValues.overTime.value === 0 ||
            newhrPolicesValues.overTime.value === 2) && (
            <div className="w-[26rem]">
              <input
                className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                placeholder="Overtime Rate"
                color="blue"
                type="number"
                name="workingDaysOTRate"
                value={newhrPolicesValues.workingDaysOTRate}
                onChange={handleChange}
              />
            </div>
          )}
        </>
      )}
      <div className="w-[26rem]">
        <label className="text-[12px] text-[#474747] font-Urbanist font-medium px-2">
          Holiday/Weekend Overtime
        </label>
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
        {/* <Select label='Holiday/Weekend Overtime' color='blue' value={newhrPolicesValues.weekendoverTime} 
          onChange={(selected)=>handleSelectChange(selected, 'weekendoverTime')}
          name='weekendoverTime' 
            // renderValue={(selected) => selected.title}
          >
          {weekendoverTimeRate.map((ele)=>(
            <Option key={ele.id} value={ele}>
              {ele.title}
            </Option>
          ))}
        </Select> */}
      </div>

      {(newhrPolicesValues.weekendoverTime.value === 1 ||
        newhrPolicesValues.weekendoverTime.value === 5) && (
        <div className="w-[26rem]">
          <input
            className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
            placeholder="Holiday Overtime Rate"
            color="blue"
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
          <div className="w-[26rem]">
            <input
              className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
              placeholder={
                newhrPolicesValues.weekendoverTime.value === 4
                  ? "Holiday Overtime Multiply X"
                  : "Holiday Overtime Rate"
              }
              color="blue"
              type="number"
              name="holidayOTRatex"
              value={newhrPolicesValues.holidayOTRatex}
              onChange={handleChange}
            />
          </div>
          <div className="w-[26rem]">
            <input
              className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
              placeholder="Holiday Overtime Amount"
              color="blue"
              type="number"
              name="holidayOTAmount"
              value={newhrPolicesValues.holidayOTAmount}
              onChange={handleChange}
            />
          </div>
        </>
      )}

      <div className="w-[26rem]">
        <label className="text-[12px] text-[#474747] font-Urbanist font-medium px-2">
          Leave Management Group
        </label>
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
  );
};

export default OverTimeLeave;
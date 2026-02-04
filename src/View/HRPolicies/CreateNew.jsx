import React, { useEffect } from 'react';
import useCreatePolicies from '../../ViewModel/HRPoliciesViewModel/createHrPoliciesServices';
import { Button, Step, Stepper, Typography } from '@material-tailwind/react';
import EmpMapping from './EmpMapping';
import PayrollSettings from './PayrollSettings';
import WorkingHours from './WorkingHours';
import OverTimeLeave from './OverTimeLeave';
import useHRPolicies from '../../ViewModel/HRPoliciesViewModel/HRPoliciesServices';
import { useLocation } from 'react-router';
import { earlyArivalData, forceTimeOutHrs, generationTypeData, MonthSelection, overTimeCounter, timeOutPlicy, weekendoverTimeRate, weekdays } from '../../services/__hrPoliciesServices';
import CustomButton from '../../Components/CustomButton/CustomButton';

const CreateNew = () => {
  const {
    stepsValue,
    handlePrev,
    handleNext,
    handleStepActive,
    handleSelectChange,newhrPolicesValues, flattenOptions,dept_subDept,
    handleChange,
    leavesGroupOptionList,
    handlePolicySubmit,
    handleCheckboxChange,
    handleTimeChange,
    rangeValues,
    handleRangeChange,
    handleCheckbox,
    handleRemoveSubDept,
    setnewHrPolicesValues,
    gettingSubBranches,
    empBranches
  } = useCreatePolicies();

  const { 
    policyBranches ,

  } = useHRPolicies()

  const location = useLocation()



  useEffect(() => {
    if (location.state && location.state.formData) {
      console.log('Copy Policy Data:', location.state.formData)
      const data = location.state.formData;
      
      // Get department ID from either dept_id or deptt_id (for backward compatibility)
      const departmentId = data.dept_id || data.deptt_id;
      
      // Load departments for the selected branch
      gettingSubBranches(departmentId);
      
      // console.log('data.overtime_pay', data.overtime_pay)
      const branch = policyBranches.find((ele) => ele.id === data.branch_id);
      const gentype = generationTypeData.find((ele) => ele.id == data.payroll);
      const selectMonth = MonthSelection.find((ele) => ele.value === data.pay_month?.pay_month);
      const arivalPolicy = earlyArivalData.find((ele) => ele.id == data.early_arrival);
      // Convert database value (1-12) to 0-indexed array id (0-11)
      const forceTimeOut = forceTimeOutHrs.find((ele) => ele.id == (parseInt(data.force_timeout) - 1));
      const tOPolicy = timeOutPlicy.find((ele) => ele.value == data.timeout_policy);
      const otCounter = overTimeCounter.find((ele) => ele.value == data.overtime_pay || ele.value == data.vertime_pay);
      const weekendotCounter = weekendoverTimeRate.find((ele) => ele.value == data.overtime_rules?.holidays_overtime_type);

      // Debug logging for dropdown selections
      // console.log('Dropdown Selections:', {
      //   gentype,
      //   selectMonth,
      //   arivalPolicy,
      //   forceTimeOut,
      //   tOPolicy,
      //   otCounter,
      //   weekendotCounter,
      //   payroll: data.payroll,
      //   force_timeout: data.force_timeout,
      //   timeout_policy: data.timeout_policy,
      //   overtime_pay: data.overtime_pay,
      //   vertime_pay: data.vertime_pay
      // });

      // Process daily_timings to populate schedule
      // Create mapping between abbreviated and full day names
      const dayMapping = {
        'Mon': 'Monday',
        'Tue': 'Tuesday', 
        'Wed': 'Wednesday',
        'Thu': 'Thursday',
        'Fri': 'Friday',
        'Sat': 'Saturday',
        'Sun': 'Sunday'
      };

      const processedSchedule = weekdays.map(day => {
        // Find matching timing by checking both full and abbreviated day names
        const dayTiming = data.daily_timings?.find(timing => {
          const apiDay = timing.day;
          const fullDayName = dayMapping[apiDay] || apiDay;
          return fullDayName.toLowerCase() === day.toLowerCase() || 
                 apiDay.toLowerCase() === day.toLowerCase();
        });
        
        if (dayTiming) {
          return {
            day,
            isChecked: true,
            startTime: dayTiming.starting_time || '',
            endTime: dayTiming.closing_time || ''
          };
        } else {
          return {
            day,
            isChecked: false,
            startTime: '',
            endTime: ''
          };
        }
      });

      // console.log('Processed Schedule:', processedSchedule);
      // console.log('Daily Timings from API:', data.daily_timings);
      // console.log('Day Mapping:', dayMapping);
      
      // Create checkedDay array for validation
      const checkedDays = processedSchedule.filter(day => day.isChecked).map(day => day.day);
      // console.log('Checked Days for validation:', checkedDays);

      setnewHrPolicesValues((prevState) => ({
        ...prevState,
        name: data?.policy_name || '',
        // Set branch with proper ID and name, fallback to create object if not found in policyBranches
        branch: branch ? { value: branch?.id, label: branch?.branch_name } : 
                data.branch_id ? { value: data.branch_id, label: data.branch_name || 'Branch' } : null,
        // Set department with proper ID and name
        department: departmentId ? { value: departmentId, label: data?.dept_name || 'Department' } : null,
        leaveManagementGroup: {value: data.leave_group_id, label: data.leave_group},
        generationType: gentype ? { value: gentype.id, label: gentype.title } : null,
        selectedMonth: selectMonth ? { value: selectMonth?.value, label: selectMonth?.title } : null,
        dayFrom: {value: data?.pay_month?.pay_period_from, label: data?.pay_month?.pay_period_from},
        dayTo: {value: data?.pay_month?.pay_period_upto, label: data?.pay_month?.pay_period_upto},
        offDayAllowedMonth: data?.allowed_offs || '',
        startTime: data.starting_time || '',
        endTime: data.closing_time || '',
        leniencyTime: data.leniency_time || '',
        arivalPolicy: arivalPolicy ? { value: arivalPolicy.value, label: arivalPolicy.title } : null,
        forceTimeOut: forceTimeOut ? { value: forceTimeOut.id, label: forceTimeOut.title } : null,
        timeOutPolicy: tOPolicy ? { value: tOPolicy.value, label: tOPolicy.title } : null,
        lateMinutBuket: data.late_time_in_minutes || '',
        lateComerPenalty: data.late_comers_penalty || '',
        overTimeCounter: otCounter ? { value: otCounter.value, label: otCounter.title } : null,
        workingDaysdutyClosingMinutesOT: data.overtime_due_minutes || '',
        minReqOT: data.overtime_min_minutes || '',
        workingDaysOTRate: data.overtime_rules?.daily_overtime_val || '',
        weekendoverTime: weekendotCounter ? { value: weekendotCounter.value, label: weekendotCounter.title } : null,
        holidayOTRate: weekendotCounter?.value === 1 || weekendotCounter?.value === 5 ? data.overtime_rules?.holiday_overtime_other_amount : '',
        holidayOTRatex: weekendotCounter?.value === 2 || weekendotCounter?.value === 3 || weekendotCounter?.value === 4 ? data.overtime_rules?.holidays_overtime_val : '',
        holidayOTAmount: weekendotCounter?.value === 2 || weekendotCounter?.value === 3 || weekendotCounter?.value === 4 ? data.overtime_rules?.holiday_overtime_other_amount : '',
        reqWorkingHrs: data.working_hours || '',
        reqMinutes: data.working_min || '',
        shiftRetHrs: data.min_rest_period || '',
        earlyArrivalMaxTime: data.early_arrival_max_time || '',
        // Set the processed schedule for working days
        schedule: processedSchedule,
        // Update checkedDay array for validation
        checkedDay: checkedDays,
        // Additional fields that might be needed
        checkBox: data.use_multi_devices === "1" ? 1 : 0,
      }));
    }
  }, [location.state]);
  return (
    <div className='w-full px-2'>
      <div className='flex flex-col gap-4 bg-white rounded-[10px] drop-shadow-md py-4 px-[40px]'>
        <div>
          <Stepper
            activeStep={stepsValue.activeStep}
            lineClassName="bg-gray-300"
            activeLineClassName="bg-[#3DA5F4]"
          >
            {['Policy Mapping', 'Payroll setting', 'Working Hours', 'Overtime & Leave Setting'].map((label, index) => {
              // Disable steps that are more than one step ahead of current step
              const isDisabled = index > stepsValue.activeStep + 1;
              const isClickable = !isDisabled;
              
              return (
                <Step
                  key={index}
                  onClick={() => isClickable && handleStepActive(index)}
                  activeClassName="bg-[#61ADFF]"
                  completedClassName="bg-white border border-blue-500 rounded-full text-[#474747]"
                  className={isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"}
                >
                  <div className="flex items-center">
                    <Typography variant="small">{index + 1}</Typography>
                    <div className='absolute top-11 inset-x-0 w-fit flex items-center justify-center'>
                      <Typography variant="small" className={`text-[11px] text-center font-Urbanist font-medium ${isClickable ? 'text-[#818a90]' : 'text-gray-400'}`}>
                        {label}
                      </Typography>
                    </div>
                  </div>
                </Step>
              );
            })}
          </Stepper>
        </div>

        <div className='mt-10'>
          {stepsValue.activeStep === 0 && <EmpMapping 
            policyBranches = {policyBranches}
            handleSelectChange = { handleSelectChange }
            newhrPolicesValues= {newhrPolicesValues}
            dept_subDept= {dept_subDept}
            flattenOptions = {flattenOptions}
            handleChange = {handleChange}
            handleCheckbox = {handleCheckbox}
            handleRemoveSubDept = {handleRemoveSubDept}
            empBranches = {empBranches}
          />}
          {stepsValue.activeStep === 1 && <PayrollSettings 
          
            handleSelectChange = { handleSelectChange }
            newhrPolicesValues= {newhrPolicesValues}
            handleChange= {handleChange}

          />}
          {stepsValue.activeStep === 2 && <WorkingHours 
            newhrPolicesValues = { newhrPolicesValues }
            handleChange= {handleChange}
            handleCheckboxChange = { handleCheckboxChange }
            handleTimeChange = { handleTimeChange }
            handleSelectChange = {handleSelectChange}
            handleRangeChange= {handleRangeChange}
            rangeValues= { rangeValues }
          />}
          {stepsValue.activeStep === 3 && <OverTimeLeave 
            handleChange= {handleChange}
            handleSelectChange = { handleSelectChange }
            newhrPolicesValues= {newhrPolicesValues}
            leavesGroupOptionList= {leavesGroupOptionList}
          />}
        </div>
        <div className="mt-16 flex justify-between">
          <div>
            {!stepsValue.isFirstStep && 
              <CustomButton title='Prev' onClick={handlePrev} disabled={stepsValue.isFirstStep} className='capitalize '>
                {/* Prev */}
              </CustomButton>
            }
          </div>
          <div>
            <CustomButton title={stepsValue.isLastStep ? 'Submit' : 'Next'} onClick={stepsValue.isLastStep ? handlePolicySubmit : handleNext} className={`capitalize cursor-pointer ${stepsValue.isLastStep ? 'bg-[#0acf97]' : ''}`}>
              {/* {stepsValue.isLastStep ? 'Submit' : 'Next'} */}
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNew;

import React, { useEffect } from 'react';
import useCreatePolicies from '../../ViewModel/HRPoliciesViewModel/createHrPoliciesServices';
import { Step, Stepper, Typography } from '@material-tailwind/react';
import EmpMapping from './EmpMapping';
import PayrollSettings from './PayrollSettings';
import WorkingHours from './WorkingHours';
import OverTimeLeave from './OverTimeLeave';
import useHRPolicies from '../../ViewModel/HRPoliciesViewModel/HRPoliciesServices';
import { useLocation } from 'react-router';
import { earlyArivalData, forceTimeOutHrs, generationTypeData, MonthSelection, overTimeCounter, timeOutPlicy, weekendoverTimeRate, weekdays } from '../../services/__hrPoliciesServices';
import CustomButton from '../../Components/CustomButton/CustomButton';
import { motion, AnimatePresence } from 'framer-motion';

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

      // Create checkedDay array for validation
      const checkedDays = processedSchedule.filter(day => day.isChecked).map(day => day.day);

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
    <div className='w-full max-w-7xl mx-auto'>
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[600px] flex flex-col'>
        <div className="mb-8">
          <Stepper
            activeStep={stepsValue.activeStep}
            lineClassName="bg-gray-100 h-1"
            activeLineClassName="bg-bgBlue"
          >
            {['Policy Mapping', 'Payroll Settings', 'Working Hours', 'Overtime & Leave'].map((label, index) => {
              const isDisabled = index > stepsValue.activeStep + 1;
              const isClickable = !isDisabled;
              
              return (
                <Step
                  key={index}
                  onClick={() => isClickable && handleStepActive(index)}
                  activeClassName="bg-bgBlue ring-4 ring-blue-50"
                  completedClassName="bg-bgBlue text-white"
                  className={`w-8 h-8 flex items-center justify-center transition-all duration-300 ${
                    isClickable ? "cursor-pointer" : "cursor-not-allowed bg-gray-200 text-gray-400"
                  }`}
                >
                  <span className="text-xs font-bold font-poppins">{index + 1}</span>
                  <div className='absolute -bottom-8 w-32 text-center'>
                    <Typography 
                      className={`text-xs font-medium font-poppins transition-colors duration-300 ${
                        index === stepsValue.activeStep ? 'text-bgBlue' : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </Typography>
                  </div>
                </Step>
              );
            })}
          </Stepper>
        </div>

        <div className='mt-8 flex-1'>
          <AnimatePresence mode="wait">
            <motion.div
              key={stepsValue.activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
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
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 flex justify-between items-center">
          <div>
            {!stepsValue.isFirstStep && 
              <CustomButton 
                title='Previous' 
                onClick={handlePrev} 
                disabled={stepsValue.isFirstStep} 
                className='bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm px-6'
              />
            }
          </div>
          <div>
            <CustomButton 
              title={stepsValue.isLastStep ? 'Submit Policy' : 'Next Step'} 
              onClick={stepsValue.isLastStep ? handlePolicySubmit : handleNext} 
              className={`px-8 ${stepsValue.isLastStep ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-bgBlue hover:bg-blue-600 shadow-blue-500/20'}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNew;

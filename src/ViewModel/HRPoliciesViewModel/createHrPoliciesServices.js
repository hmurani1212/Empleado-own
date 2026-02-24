import { useCallback, useEffect, useState } from "react";
import employeesApi from "../../Model/Data/Employees/Employees";
import { weekdays } from "../../services/__hrPoliciesServices";
import leavesPlannerApi from "../../Model/Data/LeavesPlanner/LeavesPlanner";
import { validateInput } from "../../Validation/CustomValidation";
import { showToast } from "../../Components/Toaster/Toaster";
// import { isValid } from "date-fns";
import hrPoliciesApi from "../../Model/Data/HRPolicies/HRPolicies";
import { useNavigate } from "react-router";
import useEmployees from "../EmployeeViewModel/EmployeeServices";

const useCreatePolicies = () => {

  const navigate = useNavigate()

  // Import necessary functions from useEmployees
  const {
    empBranches,
    dept_subDept,
    flattenOptions,
    gettingSubBranches,
    fetchingAllBranches
  } = useEmployees();

  // Load branches when component mounts
  useEffect(() => {
    fetchingAllBranches();
  }, []);




  const [stepsValue, setStepsValue] = useState({
    activeStep: 0,
    isFirstStep: true,
    isLastStep: false,
  });

  const handleStepActive = (step) => {
    setStepsValue((prevState) => ({
      ...prevState,
      activeStep: step,
      isFirstStep: step === 0,
      isLastStep: step === 3, // Assuming there are 4 steps (0 to 3)
    }));
  };

  const handlePrev = () => {
    setStepsValue((prevState) => {
      const newStep = prevState.activeStep - 1;
      return {
        ...prevState,
        activeStep: newStep,
        isFirstStep: newStep === 0,
        isLastStep: false,
      };
    });
  };

  const handleNext = async () => {
    if (stepsValue.activeStep === 0) {
      const validation = validateFirstStep();
      if (!validation.isValid) {
        showToast(validation.message, 'error'); // Display the validation message to the user
        return;
      }
    }

    if (stepsValue.activeStep === 1) {
      const secondValidation = validateSecondStep();
      if (!secondValidation.isValid) {
        showToast(secondValidation.message, 'error'); // Display the validation message to the user
        return;
      }
    }
    if (stepsValue.activeStep === 2) {
      const thirdValidation = validateThirdStep();
      if (!thirdValidation.isValid) {
        showToast(thirdValidation.message, 'error'); // Display the validation message to the user
        return;
      }

      // When moving from step 3 (Working Hours) to step 4 (Overtime & Leave Setting)
      // Call the leave groups API
      console.log('Moving from step 3 to step 4, fetching leave groups...');
      await gettingLeaveGroupsOptionList();
    }

    setStepsValue((prevState) => {
      const newStep = prevState.activeStep + 1;
      return {
        ...prevState,
        activeStep: newStep,
        isFirstStep: false,
        isLastStep: newStep === 3, // Assuming there are 4 steps (0 to 3)
      };
    });
  };




  const [newhrPolicesValues, setnewHrPolicesValues] = useState({
    name: '',
    department: null,
    branch: null,
    selectedMonth: { value: 'current', label: 'Current' },
    generationType: '',
    schedule: weekdays.map(day => ({ day, isChecked: false, startTime: '', endTime: '' })),
    overTimeCounter: '',
    overTime: '',
    weekendoverTime: '',
    dayFrom: { value: 1, label: 1 },
    dayTo: { value: 1, label: 1 },
    leaveManagementGroup: null,
    offDayAllowedMonth: '',
    reqWorkingHrs: '',
    reqMinutes: '',
    shiftRetHrs: '',
    startTime: '',
    endTime: '',
    checkedDay: [],
    leniencyTime: '',
    arivalPolicy: '',
    forceTimeOut: '',
    timeOutPolicy: '',
    lateMinutBuket: '',
    lateComerPenalty: '',
    workingDaysdutyClosingMinutesOT: '',
    minReqOT: '',
    workingDaysOTRate: '',
    holidayOTRate: '',
    holidayOTAmount: '',
    checkBox: '',
    moredepartment: null,
    deptArray: [],
    holidayOTRatex: '',
    earlyArrivalMaxTime: '' // Added missing field for early arrival max time
  })

  // Move useEffect here after newhrPolicesValues is initialized
  useEffect(() => {
    if (stepsValue.isLastStep && newhrPolicesValues.branch && newhrPolicesValues.branch.value) {
      gettingLeaveGroupsOptionList()
    }
  }, [stepsValue.activeStep, newhrPolicesValues.branch])

  const [leavesGroupOptionList, setGroupOptionList] = useState([])

  const gettingLeaveGroupsOptionList = async () => {
    try {
      const response = await leavesPlannerApi.getAllLeaveGroups()
      const resData = response.data
      console.log('Leave Groups API Response:', resData)

      if (response.status === 200 && resData.STATUS === 'SUCCESSFUL') {
        const groups = resData.DB_DATA?.groups || []
        // Transform the data to match the expected format
        const transformedGroups = groups.map(group => ({
          value: group.id,
          label: group.group_title
        }))
        setGroupOptionList(transformedGroups)
        console.log('Leave Groups loaded:', transformedGroups)
      } else {
        console.error('Failed to fetch leave groups:', resData.ERROR_DESCRIPTION)
        setGroupOptionList([])
      }
    } catch (err) {
      console.error('Error fetching leave groups:', err)
      setGroupOptionList([])
    }
  }



  const handleSelectChange = (selectedOption, field) => {
    console.log('selectedoptions', selectedOption, field)
    // console.log('field')

    if (field === 'branch') {
      // If "All Branches" is selected (value: 0), fetch all departments
      // Otherwise, fetch departments for the specific branch
      // Only call gettingSubBranches if selectedOption.value is defined and not null
      if (selectedOption && selectedOption.value !== undefined && selectedOption.value !== null) {
        gettingSubBranches(selectedOption.value)
      }
      setnewHrPolicesValues((prevState) => ({
        ...prevState,
        [field]: selectedOption
      }));

    } else if (field === 'department') {
      setnewHrPolicesValues((prevState) => ({
        ...prevState,
        [field]: selectedOption
      }));

    } else if (field === 'selectedMonth') {
      setnewHrPolicesValues((prevState) => ({
        ...prevState,
        [field]: selectedOption
      }));
    } else if (field === 'generationType') {
      if (selectedOption.value === 2) {
        setnewHrPolicesValues((prevState) => ({
          ...prevState,
          [field]: selectedOption,
          // Keep existing values for hourly fields
        }));

      } else {
        // Clear hourly fields when switching away from hourly base
        setnewHrPolicesValues((prevState) => ({
          ...prevState,
          [field]: selectedOption,
          reqWorkingHrs: '',
          reqMinutes: '',
          shiftRetHrs: ''
        }));
      }


    } else if (field === 'overTimeCounter') {
      setnewHrPolicesValues((prevState) => ({
        ...prevState,
        [field]: selectedOption
      }));

    } else if (field === 'overTime') {
      setnewHrPolicesValues((prevState) => ({
        ...prevState,
        [field]: selectedOption
      }));
    }
    else if (field === 'weekendoverTime') {
      setnewHrPolicesValues((prevState) => ({
        ...prevState,
        [field]: selectedOption
      }));
    }
    else if (field === 'dayFrom') {
      setnewHrPolicesValues((prevState) => ({
        ...prevState,
        [field]: selectedOption
      }));
    }
    else if (field === 'dayTo') {
      setnewHrPolicesValues((prevState) => ({
        ...prevState,
        [field]: selectedOption
      }));
    }
    else if (field === 'leaveManagementGroup') {
      setnewHrPolicesValues((prevState) => ({
        ...prevState,
        [field]: selectedOption
      }));
    }
    else if (field === 'arivalPolicy') {
      setnewHrPolicesValues((prevState) => ({
        ...prevState,
        [field]: selectedOption
      }));
    }
    else if (field === 'forceTimeOut') {
      setnewHrPolicesValues((prevState) => ({
        ...prevState,
        [field]: selectedOption
      }));
    }
    else if (field === 'timeOutPolicy') {
      setnewHrPolicesValues((prevState) => ({
        ...prevState,
        [field]: selectedOption
      }));
    }
    else if (field === 'moredepartment') {
      const sameData = newhrPolicesValues.deptArray?.filter((ele) => ele.value === selectedOption.value)
      console.log('sameData', sameData)
      if (sameData.length > 0) {
        showToast('Department Already Selected', 'error')
      } else {

        setnewHrPolicesValues((prevState) => ({
          ...prevState,
          [field]: selectedOption,
          deptArray: [...prevState?.deptArray, selectedOption]
        }));

        console.log(newhrPolicesValues.deptArray)
      }
    }


  };








  // const [selectedMonth, setSelectedMonth] = useState('Current');

  // const handleMonthChange = (selected) => {
  //   setSelectedMonth(selected);
  // };



  const handleChange = (e) => {
    const { name, value } = e.target

    // Validate Late Comers Penalty (0 to 4, but not 0.5)
    if (name === 'lateComerPenalty' && value !== '' && value !== undefined) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        showToast('Late Comers Penalty cannot be negative', 'error');
        return;
      }
      if (numValue === 0.5) {
        showToast('0.5 is not allowed, use 0 or 1', 'error');
        return;
      }
      if (numValue > 4) {
        showToast('Maximum value of Late Comers Penalty is 4', 'error');
        return;
      }
    }

    // Validate Late Coming Leniency Time (no negative values)
    if (name === 'leniencyTime' && value !== '' && value !== undefined) {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) {
        showToast('Late Coming Leniency Time cannot be negative', 'error');
        return;
      }
    }

    setnewHrPolicesValues((prevState) => ({
      ...prevState,
      [name]: value
    }))

    if (name === 'startTime') {
      setnewHrPolicesValues((prevState) => ({
        ...prevState,
        schedule: prevState.schedule.map((item) => ({
          ...item,
          startTime: value,
        })),
      }));
    }
    else if (name === 'endTime') {
      // console.log(value)
      setnewHrPolicesValues((prevState) => ({
        ...prevState,
        schedule: prevState.schedule.map((item) => ({
          ...item,
          endTime: value,
        })),
      }));
    }

  }

  const handleCheckbox = (e) => {
    const { name, checked } = e.target;
    setnewHrPolicesValues((prevState) => ({
      ...prevState,
      [name]: checked ? 1 : 0,
    }));
  }

  const handleRemoveSubDept = (data) => {
    setnewHrPolicesValues((prevState) => ({
      ...prevState,
      deptArray: prevState.deptArray.filter((ele) => ele.value !== data.value)
    }));
  }


  const handleCheckboxChange = (item, index) => {
    setnewHrPolicesValues(prevState => {
      const newSchedule = [...prevState.schedule];
      newSchedule[index].isChecked = !newSchedule[index].isChecked;

      const newCheckedDay = newSchedule[index].isChecked
        ? [...prevState.checkedDay, newSchedule[index]]
        : prevState.checkedDay.filter(day => day.day !== item.day);

      return {
        ...prevState,
        schedule: newSchedule,
        checkedDay: newCheckedDay
      };
    });
  };


  const handleTimeChange = (index, field, value) => {
    setnewHrPolicesValues(prevState => {
      const newSchedule = [...prevState.schedule];
      newSchedule[index][field] = value;

      return {
        ...prevState,
        schedule: newSchedule
      };
    });
  };




  const validateFirstStep = () => {
    const { name, department, branch, checkBox, deptArray } = newhrPolicesValues;

    const nameValidation = validateInput('Policy', name);
    if (!nameValidation.isValid) {
      return { isValid: false, message: nameValidation.message };
    }
    if (branch === null) {
      return { isValid: false, message: "Select Branch" };
    }
    if (department === null) {
      return { isValid: false, message: "Select Department" };
    }
    if (checkBox === 1) {
      if (deptArray.length === 0) {
        return { isValid: false, message: "Select Department Or Uncheck Assing This Policy" };
      }
    }

    return { isValid: true }

  }

  const validateSecondStep = () => {
    const { generationType, dayFrom, dayTo, offDayAllowedMonth, reqWorkingHrs, reqMinutes, shiftRetHrs } = newhrPolicesValues

    if (!generationType) {
      return { isValid: false, message: "Select Generation Type" };
    }
    if (dayFrom === '') {
      return { isValid: false, message: "Select Start Day" };
    }
    if (dayTo === '') {
      return { isValid: false, message: "Select End Day" };
    }

    // Validate Off Days Allowed Per Month (0 to 20 days allowed)
    if (offDayAllowedMonth === '' || offDayAllowedMonth === null || offDayAllowedMonth === undefined) {
      return { isValid: false, message: "Off Days Allowed Per Month is required" };
    }

    const offDaysValue = parseInt(offDayAllowedMonth);
    if (isNaN(offDaysValue)) {
      return { isValid: false, message: "Off Days must be a valid number" };
    }
    if (offDaysValue < 0) {
      return { isValid: false, message: "Off Days cannot be negative" };
    }
    if (offDaysValue > 20) {
      return { isValid: false, message: "Maximum 20 days allowed off per month" };
    }

    // Validate hourly base fields when generationType is Hourly Base (id: 3)
    if (generationType.value === 3) {
      const { reqWorkingHrs, reqMinutes, shiftRetHrs } = newhrPolicesValues;

      if (reqWorkingHrs === '' || reqWorkingHrs === null || reqWorkingHrs === undefined) {
        return { isValid: false, message: "Missing Required Working Hours" };
      }
      if (parseFloat(reqWorkingHrs) < 0) {
        return { isValid: false, message: "Required Working Hours cannot be negative" };
      }

      if (reqMinutes === '' || reqMinutes === null || reqMinutes === undefined) {
        return { isValid: false, message: "Missing Required Minutes" };
      }
      if (parseFloat(reqMinutes) < 0) {
        return { isValid: false, message: "Required Minutes cannot be negative" };
      }
      // Validate as minutes (0-60), not hours
      if (parseFloat(reqMinutes) > 60) {
        return { isValid: false, message: "Required Minutes cannot exceed 60 minutes" };
      }

      // Maximum Hours Per Day is optional, but if provided must be greater than minimum hours
      if (shiftRetHrs !== '' && shiftRetHrs !== null && shiftRetHrs !== undefined) {
        if (parseFloat(shiftRetHrs) < 0) {
          return { isValid: false, message: "Maximum Hours Per Day cannot be negative if provided" };
        }
        if (parseFloat(shiftRetHrs) > 24) {
          return { isValid: false, message: "Maximum Hours Per Day cannot exceed 24 hours" };
        }
        // if (parseFloat(maxHoursPerDay) < parseFloat(minHoursPerDay)) {
        //   return { isValid: false, message: "Maximum Hours Per Day must be greater than or equal to Minimum Hours Per Day" };
        // }
      }
    }

    return { isValid: true }
  }
  const validateThirdStep = () => {
    const { startTime, leniencyTime, arivalPolicy, endTime, forceTimeOut, timeOutPolicy, lateMinutBuket, lateComerPenalty, checkedDay } = newhrPolicesValues

    if (startTime === '') {
      return { isValid: false, message: "Select Start Time" };
    }
    if (leniencyTime === '') {
      return { isValid: false, message: "Leniency Time can't be empty" };
    }
    const leniencyValue = parseFloat(leniencyTime);
    if (isNaN(leniencyValue) || leniencyValue < 0) {
      return { isValid: false, message: "Leniency Time cannot be negative" };
    }
    if (!arivalPolicy) {
      return { isValid: false, message: "Select Arival Ploicy" };
    }
    if (endTime === '') {
      return { isValid: false, message: "Select End Time" };
    }
    if (!forceTimeOut) {
      return { isValid: false, message: "Select Forced Timeout" };
    }
    if (!timeOutPolicy) {
      return { isValid: false, message: "Select Timeout Policy" };
    }
    if (lateMinutBuket === '') {
      return { isValid: false, message: "Late Minutes Bucket can't be empty" };
    }
    if (parseFloat(lateMinutBuket) < 0) {
      return { isValid: false, message: "Late Minutes Bucket cannot be negative" };
    }
    if (lateMinutBuket > 999) {
      return { isValid: false, message: "Maxium Vlaue of late minutes bucket is 999" };
    }
    if (lateComerPenalty === '') {
      return { isValid: false, message: "Later Comers penalty can't be empty" };
    }
    const penaltyValue = parseFloat(lateComerPenalty);
    if (isNaN(penaltyValue) || penaltyValue < 0) {
      return { isValid: false, message: "Late Comers penalty cannot be negative" };
    }
    if (penaltyValue === 0.5) {
      return { isValid: false, message: "0.5 is not allowed" };
    }
    if (penaltyValue > 4) {
      return { isValid: false, message: "Maximum value of Late Comers penalty is 4" };
    }
    if (checkedDay.length === 0) {
      return { isValid: false, message: "At least Select one day of week" };
    }
    return { isValid: true }
  }

  const validateFourthStep = () => {
    const { overTimeCounter, workingDaysdutyClosingMinutesOT, minReqOT, overTime, workingDaysOTRate, weekendoverTime, holidayOTRate, holidayOTAmount, holidayOTRatex } = newhrPolicesValues

    if (!overTimeCounter) {
      return { isValid: false, message: "Select Daily Overtime Counter" };
    }
    if (overTimeCounter.value === 1) {
      if (workingDaysdutyClosingMinutesOT === '') {
        return { isValid: false, message: "Overtime Start Minutes can't be empty" };
      }
      if (minReqOT === '') {
        return { isValid: false, message: "Minimum Required Overtime Minutes can't be empty" };
      }
      if (!overTime) {
        return { isValid: false, message: "Select Daily Overtime Counter" };
      }
      if ((overTime.value === 0 || overTime.value === 2)) {
        if (workingDaysOTRate === '') {
          return { isValid: false, message: "Working Days Overtime can't be empty" };

        }
      }

    }
    if (!weekendoverTime) {
      return { isValid: false, message: "Select Weekend Overtime Counter" };
    }
    if ((weekendoverTime.value === 1 || weekendoverTime.value === 5)) {
      if (holidayOTRate === '') {
        return { isValid: false, message: "Holiday overtime rate can't be empty" };
      }
    }
    if ((weekendoverTime.value === 2 || weekendoverTime.value === 3 || weekendoverTime.value === 4)) {

      if (holidayOTRatex === '') {
        return { isValid: false, message: "Holiday overtime rate can't be empty" };
      }
      if (holidayOTAmount === '') {
        return { isValid: false, message: "Holiday overtime amount can't be empty" };
      }
    }
    return { isValid: true }
  }


  const settingFormData = async (data) => {
    console.log(' policy data', data)
    setnewHrPolicesValues((prevState) => ({
      ...prevState,
      name: data?.policy_name
    }));
    // 
    // await navigate('/hrpolicies/create_new')


  }


  // useEffect(()=>{
  //   console.log(newhrPolicesValues)
  // },[newhrPolicesValues])


  const [rangeValues, setRangeValues] = useState([20, 80]); // Initial range values

  const handleRangeChange = (event) => {
    const newValue = event.target.value;
    // Update the rangeValues array based on which handle is being moved
    // You can customize this logic based on your requirements
    setRangeValues(newValue);
  };


  let employee_exicute = 0



  const handlePolicySubmit = async () => {
    const fourthValidation = validateFourthStep();
    if (!fourthValidation.isValid) {
      showToast(fourthValidation.message, 'error'); // Display the validation message to the user
      return;
    }

    // Build payload using EXACT BACKEND DATABASE FIELD NAMES
    const data = {
      // === CORE POLICY FIELDS (wf_policies table) ===
      policy_name: newhrPolicesValues.name || '',
      branch_id: parseInt(newhrPolicesValues.branch?.value) || 0,
      deptt_id: parseInt(newhrPolicesValues.department?.value) || 0,
      leave_group_id: parseInt(newhrPolicesValues.leaveManagementGroup?.value) || 0,

      // === PAYROLL SETTINGS ===
      Payslip_type: parseInt(newhrPolicesValues.generationType?.value) || 0, // Use value field for correct mapping: 1=Time Base, 2=Attendance Base, 3=Hourly Base
      p_ps_from: parseInt(newhrPolicesValues.dayFrom?.value) || 0,
      p_ps_to: parseInt(newhrPolicesValues.dayTo?.value) || 0,
      ps_month: newhrPolicesValues.selectedMonth?.value || 'current',
      allowed_offs: newhrPolicesValues.offDayAllowedMonth !== '' && newhrPolicesValues.offDayAllowedMonth !== null && newhrPolicesValues.offDayAllowedMonth !== undefined 
        ? parseInt(newhrPolicesValues.offDayAllowedMonth) 
        : 0,

      // === TIME BASE SPECIFIC FIELDS (for generationType = 1) ===
      req_working_hours: newhrPolicesValues.generationType?.value === 1 ? parseFloat(newhrPolicesValues.reqWorkingHrs) || 0 : 0,
      req_minutes: newhrPolicesValues.generationType?.value === 1 ? parseInt(newhrPolicesValues.reqMinutes) || 0 : 0,
      max_shift_retaining_hours: newhrPolicesValues.generationType?.value === 1 ? parseFloat(newhrPolicesValues.shiftRetHrs) || 0 : 0,

      // === HOURLY BASE SPECIFIC FIELDS (for generationType = 3) ===
      hourly_rate: newhrPolicesValues.generationType?.value === 3 ? parseFloat(newhrPolicesValues.hourlyRate) || 0 : 0,
      min_hours_per_day: newhrPolicesValues.generationType?.value === 3 ? parseFloat(newhrPolicesValues.minHoursPerDay) || 0 : 0,
      max_hours_per_day: newhrPolicesValues.generationType?.value === 3 ? parseFloat(newhrPolicesValues.maxHoursPerDay) || 0 : 0,

      // === WORKING HOURS SETTINGS ===
      starting_time: newhrPolicesValues.startTime || '',
      closing_time: newhrPolicesValues.endTime || '',
      working_days: newhrPolicesValues.schedule?.filter(day => day.isChecked).map(day => {
        const d = day.day.slice(0, 3).toLowerCase();
        return d.charAt(0).toUpperCase() + d.slice(1);
      }) || [],
      day_start_time: newhrPolicesValues.schedule?.filter(day => day.isChecked).map(day => day.startTime) || [],
      day_close_time: newhrPolicesValues.schedule?.filter(day => day.isChecked).map(day => day.endTime) || [],

      // === ATTENDANCE SETTINGS ===
      leniency_time: parseInt(newhrPolicesValues.leniencyTime) || 0,
      early_arrival: parseInt(newhrPolicesValues.arivalPolicy?.id) || 0, // Use id field since earlyArivalData doesn't have value field
      early_arrival_max_time: parseInt(newhrPolicesValues.earlyArrivalMaxTime) || 0,
      force_timeout: String((newhrPolicesValues.forceTimeOut?.id ?? 0) + 1), // Convert 0-indexed id to actual hour value (id:0→1hour, id:1→2hours, etc.)
      timeout_policy: parseInt(newhrPolicesValues.timeOutPolicy?.value) || 0,
      late_time_in_minutes: parseInt(newhrPolicesValues.lateMinutBuket) || 0,
      late_comers_penalty: parseFloat(newhrPolicesValues.lateComerPenalty) || 0,

      // === OVERTIME SETTINGS ===
      overtime_pay: newhrPolicesValues.overTimeCounter?.value === 1 ? 1 : 0, // Ensure only 0 or 1, no parseInt needed
      overtime_due_minutes: parseInt(newhrPolicesValues.workingDaysdutyClosingMinutesOT) || 0,
      overtime_min_minutes: parseInt(newhrPolicesValues.minReqOT) || 0,
      discart_prev_ot: 0, // Default value

      // === HOURLY POLICY SETTINGS ===
      working_hours: parseFloat(newhrPolicesValues.reqWorkingHrs) || 0,
      working_min: parseInt(newhrPolicesValues.reqMinutes) || 0,
      min_rest_period: parseInt(newhrPolicesValues.shiftRetHrs) || 0,

      // === OVERTIME RATES (for wf_policy_ot table) ===
      //overtime_val    overtime_rate    holiday_ot_rate
      holiday_ot_rate: parseInt(newhrPolicesValues.overTime?.value) || 0,
      overtime_rate: parseFloat(newhrPolicesValues.workingDaysOTRate) || 0,
      overtime_val: parseInt(newhrPolicesValues.weekendoverTime?.value) || 0,
      holiday_ot_val: parseFloat(newhrPolicesValues.holidayOTRatex) || 0,
      h_ot_other_amount: parseFloat(newhrPolicesValues.holidayOTAmount) || 0,



      // === POLICY ASSIGNMENT ===
      assignPolicyToDeptt: newhrPolicesValues.checkBox === 1,
      department_ids: newhrPolicesValues.checkBox === 1
        ? (newhrPolicesValues.deptArray?.map(e => parseInt(e.value)) || [])
        : [],

      // === SYSTEM FIELDS ===
      use_multi_devices: 1, // Default value
    };




    if (employee_exicute === 1) {
      ////showToast('Employee addition is already in progress. Please wait.', 'info');
      return;
    }
    employee_exicute = employee_exicute + 1;
    // console.log('Submitting HR Policy data:', data);

    try {
      const response = await hrPoliciesApi.setHrPolicy(data)
      // console.log('response', response)
      const resData = await response.data
      if (response.status === 200 && resData.STATUS === 'SUCCESSFUL') {
        showToast('HR Policy created successfully', 'success');
        employee_exicute = 0;
        navigate('/hrpolicies/manage_policies')
      } else {
        showToast(resData.ERROR_DESCRIPTION || 'Failed to create HR Policy', 'error')
      }
    } catch (err) {
      employee_exicute = 0;
      console.error('Error creating HR Policy:', err)
      showToast(err?.response?.data?.ERROR_DESCRIPTION, 'error')
    }
  }


  return {
    stepsValue,
    handleStepActive,
    handlePrev,
    handleNext,
    handleSelectChange,
    newhrPolicesValues,
    dept_subDept,
    flattenOptions,
    handleChange,
    leavesGroupOptionList,
    handlePolicySubmit,
    handleCheckboxChange,
    handleTimeChange,
    rangeValues,
    handleRangeChange,
    handleCheckbox,
    handleRemoveSubDept,
    settingFormData,
    setnewHrPolicesValues,
    gettingSubBranches,
    empBranches
  };
};

export default useCreatePolicies;

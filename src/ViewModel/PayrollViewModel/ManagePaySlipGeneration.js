import { useReducer, useEffect } from "react";
import payrollApi from "../../Model/Data/Payroll/Payroll";
import { showToast } from "../../Components/Toaster/Toaster";

// localStorage key for persisting payslip generation options
const PAYSLIP_GENERATION_OPTIONS_KEY = 'payslipGenerationOptions';

// Helper function to load options from localStorage
const loadOptionsFromStorage = () => {
    try {
        const savedOptions = localStorage.getItem(PAYSLIP_GENERATION_OPTIONS_KEY);
        if (savedOptions) {
            return JSON.parse(savedOptions);
        }
    } catch (error) {
        console.error('Error loading payslip generation options from localStorage:', error);
    }
    return null;
};

// Helper function to save options to localStorage
const saveOptionsToStorage = (options) => {
    try {
        // Save form options, exclude loading state
        const optionsToSave = {
            payslipGenType: options.payslipGenType,
            dateRangeFrom: options.dateRangeFrom,
            dateRangeTo: options.dateRangeTo,
            year: options.year,
            month: options.month,
            calculationFormula: options.calculationFormula,
            dontConsiderAttendance: options.dontConsiderAttendance,
            leaveEncashment: options.leaveEncashment,
            monthlyReward: options.monthlyReward,
            dontDoDeductionsAttendance: options.dontDoDeductionsAttendance,
            dontDoDeductionsLateComing: options.dontDoDeductionsLateComing,
            doNotPayOvertime: options.doNotPayOvertime,
            adjustOvertimeInLateComings: options.adjustOvertimeInLateComings,
            doNotConsiderThisMonthOvertime: options.doNotConsiderThisMonthOvertime,
            doNotConsiderThisMonthOvertimeDate: options.doNotConsiderThisMonthOvertimeDate,
            bonusType: options.bonusType,
            amountPerDays: options.amountPerDays,
            noOfDays: options.noOfDays,
            oneTimeAmount: options.oneTimeAmount,
            overTime: options.overTime,
            selectedEmployees: options.selectedEmployees // Include selected employees
        };
        localStorage.setItem(PAYSLIP_GENERATION_OPTIONS_KEY, JSON.stringify(optionsToSave));
    } catch (error) {
        console.error('Error saving payslip generation options to localStorage:', error);
    }
};

const useManagePaySlipGeneration  = (managePaySlipState = null)=>{

    const getDefaultInitialState = () => ({
        // Payslip Generation Type (null: not selected, 1: Monthly, 2: Date Range)
        payslipGenType: null,
        
        // Date Range (for type 2)
        dateRangeFrom: '',
        dateRangeTo: '',
        
        // Year and Month
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        
        // Calculation Formula (1: 30_days, 2: month_total_days, 3: empleado_standard)
        calculationFormula: 1,
        
        // Checkbox options
        dontConsiderAttendance: false,
        leaveEncashment: false,
        monthlyReward: false,
        dontDoDeductionsAttendance: false,
        dontDoDeductionsLateComing: false,
        doNotPayOvertime: false,
        adjustOvertimeInLateComings: false,
        doNotConsiderThisMonthOvertime: false,
        doNotConsiderThisMonthOvertimeDate: '', // Date field for "Do not consider this month overtime"
        
        // Monthly Reward bonus type fields
        bonusType: null, // null: not selected, 1: One Day Salary, 2: Fixed Amount X No of Days, 3: One Time Amount
        amountPerDays: '',
        noOfDays: '',
        oneTimeAmount: '',
        
        // Overtime settings
        overTime: [{date:'', value: null}],
        
        // Selected employees
        selectedEmployees: [],
        
        // Loading state
        isGenerating: false
    });

    // Load saved options from localStorage or use defaults
    const savedOptions = loadOptionsFromStorage();
    let generationTypeInitial;
    if (savedOptions) {
        generationTypeInitial = { ...getDefaultInitialState(), ...savedOptions };
        // Ensure overTime always has at least one entry
        if (!generationTypeInitial.overTime || !Array.isArray(generationTypeInitial.overTime) || generationTypeInitial.overTime.length === 0) {
            generationTypeInitial.overTime = [{date:'', value: null}];
        }
        // Restore selectedEmployees if available, otherwise use empty array
        if (!generationTypeInitial.selectedEmployees || !Array.isArray(generationTypeInitial.selectedEmployees)) {
            generationTypeInitial.selectedEmployees = [];
        }
        // If "Do not consider this month overtime" is checked but date is empty, set to current month/year
        if (generationTypeInitial.doNotConsiderThisMonthOvertime && !generationTypeInitial.doNotConsiderThisMonthOvertimeDate) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            generationTypeInitial.doNotConsiderThisMonthOvertimeDate = `${year}-${month}`;
        }
    } else {
        generationTypeInitial = getDefaultInitialState();
    }

    // Always default month/year to previous month on load (overrides any saved value)
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    generationTypeInitial.year = currentMonth === 1 ? now.getFullYear() - 1 : now.getFullYear();
    generationTypeInitial.month = currentMonth === 1 ? 12 : currentMonth - 1;

    const PaySlipGenerationReducer =(state, action)=>{
        switch (action.type) {
            case 'ADD_OVERTIME':
                return {
                    ...state,
                    overTime: [...state.overTime, { date: '', value: null }],
                };
            case 'REMOVE_OVERTIME':
                return { 
                    ...state, 
                    overTime: state.overTime.filter((_, index) => index !== action.payload) 
                };
            case 'SET_CALCULATION_FORMULA':
                return {
                    ...state,
                    calculationFormula: action.payload,
                };
            case 'SET_PAYSLIP_GEN_TYPE':
                return {
                    ...state,
                    payslipGenType: action.payload,
                };
            case 'SET_DATE_RANGE':
                return {
                    ...state,
                    dateRangeFrom: action.payload.from,
                    dateRangeTo: action.payload.to,
                };
            case 'SET_YEAR_MONTH':
                return {
                    ...state,
                    year: action.payload.year,
                    month: action.payload.month,
                };
            case 'TOGGLE_CHECKBOX':
                const newState = {
                    ...state,
                    [action.payload.field]: action.payload.value,
                };
                // When "Don't do Deductions (for attendance)" is checked, uncheck "Don't do Deductions (for late coming & early leaving)"
                if (action.payload.field === 'dontDoDeductionsAttendance' && action.payload.value === true) {
                    newState.dontDoDeductionsLateComing = false;
                    newState.adjustOvertimeInLateComings = false;
                }
                // When "Don't do Deductions (for late coming & early leaving)" is checked, uncheck "Adjust overtime in late comings"
                if (action.payload.field === 'dontDoDeductionsLateComing' && action.payload.value === true) {
                    newState.adjustOvertimeInLateComings = false;
                }
                // When "Monthly Reward" is unchecked, reset all bonus fields
                if (action.payload.field === 'monthlyReward' && action.payload.value === false) {
                    newState.bonusType = null;
                    newState.amountPerDays = '';
                    newState.noOfDays = '';
                    newState.oneTimeAmount = '';
                }
                // When "Do not consider this month overtime" is checked, set default to current month/year
                if (action.payload.field === 'doNotConsiderThisMonthOvertime' && action.payload.value === true) {
                    // Set to current month/year in YYYY-MM format
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    newState.doNotConsiderThisMonthOvertimeDate = `${year}-${month}`;
                }
                // When "Do not consider this month overtime" is unchecked, reset the date field
                if (action.payload.field === 'doNotConsiderThisMonthOvertime' && action.payload.value === false) {
                    newState.doNotConsiderThisMonthOvertimeDate = '';
                }
                return newState;
            case 'UPDATE_OVERTIME':
                return {
                    ...state,
                    overTime: state.overTime.map((item, index) => 
                        index === action.payload.index 
                            ? { ...item, [action.payload.field]: action.payload.value }
                            : item
                    ),
                };
            case 'SET_SELECTED_EMPLOYEES':
                return {
                    ...state,
                    selectedEmployees: action.payload,
                };
            case 'SET_LOADING':
                return {
                    ...state,
                    isGenerating: action.payload,
                };
            case 'SET_BONUS_TYPE':
                return {
                    ...state,
                    bonusType: action.payload,
                    // Reset bonus amount fields when bonus type changes
                    amountPerDays: '',
                    noOfDays: '',
                    oneTimeAmount: ''
                };
            case 'SET_BONUS_FIELD':
                return {
                    ...state,
                    [action.payload.field]: action.payload.value,
                };
            default:
                return state;
        }
    }

    const [managePaySlipGeneration, dispatch] = useReducer(PaySlipGenerationReducer, generationTypeInitial);

    // Save options to localStorage whenever state changes (excluding isGenerating)
    useEffect(() => {
        saveOptionsToStorage(managePaySlipGeneration);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        managePaySlipGeneration.payslipGenType,
        managePaySlipGeneration.dateRangeFrom,
        managePaySlipGeneration.dateRangeTo,
        managePaySlipGeneration.year,
        managePaySlipGeneration.month,
        managePaySlipGeneration.calculationFormula,
        managePaySlipGeneration.dontConsiderAttendance,
        managePaySlipGeneration.leaveEncashment,
        managePaySlipGeneration.monthlyReward,
        managePaySlipGeneration.dontDoDeductionsAttendance,
        managePaySlipGeneration.dontDoDeductionsLateComing,
        managePaySlipGeneration.doNotPayOvertime,
        managePaySlipGeneration.adjustOvertimeInLateComings,
        managePaySlipGeneration.doNotConsiderThisMonthOvertime,
        managePaySlipGeneration.doNotConsiderThisMonthOvertimeDate,
        managePaySlipGeneration.bonusType,
        managePaySlipGeneration.amountPerDays,
        managePaySlipGeneration.noOfDays,
        managePaySlipGeneration.oneTimeAmount,
        // overTime array reference will change when updated in reducer, triggering the effect
        managePaySlipGeneration.overTime,
        // selectedEmployees array reference will change when updated, triggering the effect
        managePaySlipGeneration.selectedEmployees
    ]);

    const addMoreOverTime = () => {
        dispatch({ type: 'ADD_OVERTIME' });
    }

    const removeOverTime = (index) => {
        dispatch({ type: 'REMOVE_OVERTIME', payload: index });
    };

    const handleOnChangePaySlipGeneration = (e) => {
        const { type, name, value, checked } = e.target;
        
        if (type === "radio") {
            if (name === 'calculationFormula') {
                dispatch({ type: 'SET_CALCULATION_FORMULA', payload: parseInt(value) });
            } else if (name === 'payslipGenType') {
                dispatch({ type: 'SET_PAYSLIP_GEN_TYPE', payload: parseInt(value) });
            }
        } else if (type === "checkbox") {
            dispatch({ 
                type: 'TOGGLE_CHECKBOX', 
                payload: { field: name, value: checked } 
            });
        } else if (type === "date" || type === "month") {
            if (name === 'dateRangeFrom') {
                dispatch({ 
                    type: 'SET_DATE_RANGE', 
                    payload: { from: value, to: managePaySlipGeneration.dateRangeTo } 
                });
            } else if (name === 'dateRangeTo') {
                dispatch({ 
                    type: 'SET_DATE_RANGE', 
                    payload: { from: managePaySlipGeneration.dateRangeFrom, to: value } 
                });
            } else if (name === 'doNotConsiderThisMonthOvertimeDate') {
                dispatch({ 
                    type: 'SET_BONUS_FIELD', 
                    payload: { field: name, value: value } 
                });
            }
        } else if (name === 'year' || name === 'month') {
            // Handle year and month select inputs (type is "select-one", not "number")
            dispatch({ 
                type: 'SET_YEAR_MONTH', 
                payload: { 
                    year: name === 'year' ? parseInt(value) : managePaySlipGeneration.year,
                    month: name === 'month' ? parseInt(value) : managePaySlipGeneration.month
                } 
            });
        }
    }

    const handleOvertimeChange = (index, field, value) => {
        dispatch({ 
            type: 'UPDATE_OVERTIME', 
            payload: { index, field, value } 
        });
    }

    const handleBonusTypeChange = (selectedOption) => {
        dispatch({ 
            type: 'SET_BONUS_TYPE', 
            payload: selectedOption ? selectedOption.value : null 
        });
    }

    const handleBonusFieldChange = (field, value) => {
        dispatch({ 
            type: 'SET_BONUS_FIELD', 
            payload: { field, value } 
        });
    }

    const setSelectedEmployees = (employees) => {
        dispatch({ type: 'SET_SELECTED_EMPLOYEES', payload: employees });
    }

    // Map formula IDs to API values
    const getFormulaValue = (formulaId) => {
        switch (formulaId) {
            case 1: return 'empleado_standard';
            case 2: return '30_days';
            case 3: return 'month_total_days';
            default: return 'empleado_standard';
        }
    }

    // Generate the API payload based on current state
    const generatePayload = () => {
        let year = managePaySlipGeneration.year;
        let month = managePaySlipGeneration.month;
        
        // For date range type, extract year and month from the date range
        if (managePaySlipGeneration.payslipGenType === 2 && managePaySlipGeneration.dateRangeFrom) {
            const fromDate = new Date(managePaySlipGeneration.dateRangeFrom);
            year = fromDate.getFullYear();
            month = fromDate.getMonth() + 1;
        }
        
        // Get branch_id from managePaySlipState - send 0 if "All Branch" is selected
        let branchId = null;
        if (managePaySlipState && managePaySlipState.branch_id) {
            if (managePaySlipState.branch_id.value === 'all') {
                branchId = 0; // Send 0 when "All Branch" is selected
            } else {
                branchId = managePaySlipState.branch_id.value;
            }
        }
        
        const payload = {
            emp_ids: managePaySlipGeneration.selectedEmployees.map(emp => emp.id),
            year: year,
            month: month,
            branch_id: branchId, // Include branch_id in payload
            limit: 15, // Set limit to 15
            options: {
                payslip_gen_type: managePaySlipGeneration.payslipGenType,
                formula: getFormulaValue(managePaySlipGeneration.calculationFormula),
            }
        };

        // Add date range for type 2
        if (managePaySlipGeneration.payslipGenType === 2) {
            payload.options.date_range_from = managePaySlipGeneration.dateRangeFrom;
            payload.options.date_range_to = managePaySlipGeneration.dateRangeTo;
        }

        // Add checkbox options
        if (managePaySlipGeneration.dontConsiderAttendance) {
            payload.options.dont_consider_attendace = true;
        }
        if (managePaySlipGeneration.doNotPayOvertime) {
            payload.options.no_overtime = true;
            payload.options.overtime_month_year = `${managePaySlipGeneration.year}-${String(managePaySlipGeneration.month).padStart(2, '0')}`;
        }
        if (managePaySlipGeneration.dontDoDeductionsAttendance) {
            payload.options.absentees_no_deduction = true;
        }
        if (managePaySlipGeneration.dontDoDeductionsLateComing) {
            payload.options.no_deduction = true;
        }
        if (managePaySlipGeneration.adjustOvertimeInLateComings) {
            payload.options.adj_ot_in_late_comings = true;
        }

        return payload;
    }

    const generateBulkPayroll = async () => {
        // Validate required fields
        if (managePaySlipGeneration.selectedEmployees.length === 0) {
            showToast('Please select at least one employee', 'error');
            return;
        }

        // Validate payslip generation type is selected
        if (!managePaySlipGeneration.payslipGenType) {
            showToast('Please select Payslip Generation Type', 'error');
            return;
        }

        // Validate based on payslip generation type
        if (managePaySlipGeneration.payslipGenType === 1) {
            // Monthly type validation
            if (!managePaySlipGeneration.year || !managePaySlipGeneration.month) {
                showToast('Please select both Year and Month for payroll generation', 'error');
                return;
            }
        } else if (managePaySlipGeneration.payslipGenType === 2) {
            // Date Range type validation
            if (!managePaySlipGeneration.dateRangeFrom || !managePaySlipGeneration.dateRangeTo) {
                showToast('Please select both From Date and To Date for payroll generation', 'error');
                return;
            }
        }

        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            const payload = generatePayload();
            console.log('Generating payroll with payload:', payload);
            
            const response = await payrollApi.generateBulkPayroll(payload);
            const data = response.data;

            if (response.status === 200 && (data.STATUS === 'SUCCESS' || data.STATUS === 'SUCCESSFUL')) {
                if(data.SUMMARY.duplicate_invoices > 0){
                    showToast(`${data.SUMMARY.duplicate_invoices } Duplicate invoice`, 'error');
                } else {
                    showToast('Payslips generated successfully!', 'success');
                }
                // showToast('Payslips generated successfully!', 'success');
                // console.log('Payslip generation response:', data);
            } else {
                showToast(data.ERROR_DESCRIPTION || data.MESSAGE || 'Failed to generate payslips', 'error');
            }
        } catch (error) {
            console.error('Error generating payslips:', error);
            showToast('Error generating payslips. Please try again.', 'error');
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }

    return { 
        addMoreOverTime, 
        managePaySlipGeneration, 
        removeOverTime, 
        handleOnChangePaySlipGeneration,
        handleOvertimeChange,
        handleBonusTypeChange,
        handleBonusFieldChange,
        setSelectedEmployees,
        generateBulkPayroll
    }
}

export default useManagePaySlipGeneration
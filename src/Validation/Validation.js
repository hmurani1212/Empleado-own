import { all } from 'axios';
import { object, string, array, number } from 'yup';


const newBranchFormValidation = object().shape({
        branch_id: string().required('Branch ID is required'),
        branch_name: string()
                .required('Branch name  is required')
                .test('not-empty', "Branch name can't be empty", value => !/^\s*$/.test(value))
                .test('no-leading-spaces', 'Remove spaces from the start of Branch name', value => !/^[\s]+/.test(value))
                .test('no-leading-special-characters', "Group name can't start with special characters", value => !/^[!@#$%^&*(),.?":{}|<>]/.test(value)),
        branch_address: string()
                .required('Branch Address  is required')
                .test('not-empty', "Branch Address can't be empty", value => !/^\s*$/.test(value))
                .test('no-leading-spaces', 'Remove spaces from the start of Branch Address', value => !/^[\s]+/.test(value))
                .test('no-leading-special-characters', "Group Address can't start with special characters", value => !/^[!@#$%^&*(),.?":{}|<>]/.test(value)),
        phone_no: string().required('Phone number is required')
                .test('phone-format', 'Phone number must be in format +92xxxxxxxxxx or 0xxxxxxxxxx', (value) => {
                        if (!value) return false;
                        // Accept: +92 followed by exactly 10 digits (total 13 characters)
                        // Accept: 0 followed by exactly 10 digits (total 11 characters)
                        const validFormat1 = /^\+92\d{10}$/.test(value); // +923047949332
                        const validFormat2 = /^0\d{10}$/.test(value); // 03047949332
                        return validFormat1 || validFormat2;
                }),
        email_address: string().required('Email is required')
                .matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Invalid Email'),
        country: string().required('Country Required'),
        currency: string().required('Currency Required')

});

const editBranchFormValidaion = object().shape({
        id: string().required('ID is required'),
        branch_name: string()
                .required('Branch name  is required')
                .test('not-empty', "Branch name can't be empty", value => !/^\s*$/.test(value))
                .test('no-leading-spaces', 'Remove spaces from the start of Branch name', value => !/^[\s]+/.test(value))
                .test('no-leading-special-characters', "Group name can't start with special characters", value => !/^[!@#$%^&*(),.?":{}|<>]/.test(value)),
        branch_address: string().required('Branch Address is required')
                .required('Branch Address  is required')
                .test('not-empty', "Branch Address can't be empty", value => !/^\s*$/.test(value))
                .test('no-leading-spaces', 'Remove spaces from the start of Branch Address', value => !/^[\s]+/.test(value))
                .test('no-leading-special-characters', "Group Address can't start with special characters", value => !/^[!@#$%^&*(),.?":{}|<>]/.test(value)),
        phone_no: string().required('Phone number is required')
                .test('phone-format', 'Phone number must be in format +92xxxxxxxxxx or 0xxxxxxxxxx', (value) => {
                        if (!value) return false;
                        // Accept: +92 followed by exactly 10 digits (total 13 characters)
                        // Accept: 0 followed by exactly 10 digits (total 11 characters)
                        const validFormat1 = /^\+92\d{10}$/.test(value); // +923047949332
                        const validFormat2 = /^0\d{10}$/.test(value); // 03047949332
                        return validFormat1 || validFormat2;
                }),
        country_id: string().required('Country ID is Required'),
        email_address: string().required('Country Required')
                .matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Invalid Email'),
        currency: string().required('Currency Required'),
        time_zone: string().required('Time Zone is required')

});

const addNoticeFormValidation = object().shape({
        branch_id: string().required('Branch ID is required'),
        deptt_id: string().required("Department ID is required"),
        title: string().required("Title is required"),



})

const validateAddNoticeFormData = object().shape({
        branch_id: string().required('Branch is required'),
        deptt_id: string().required('Department is required'),

        title: string().required('Title is Required'),
        notice: string().required('Notice is  Required')

});

// const validateAddLeaveGroupForm = object().shape({
//         branch_id: string().required('Branch Name is required'),
//         group_title: string().required('Group Title is required')

// });

const validateAddLeaveGroupForm = object().shape({
        branch_id: string().required('Branch Name is required'),
        group_title: string()
                .required('Group Title is required')
                .test('not-empty', "Group name can't be empty", value => !/^\s*$/.test(value))
                .test('no-leading-spaces', 'Remove spaces from the start of group name', value => !/^[\s]+/.test(value))
                .test('no-leading-special-characters', "Group name can't start with special characters", value => !/^[!@#$%^&*(),.?":{}|<>]/.test(value))
});


const validateDefineLeaveType = object().shape({
        group_id: string().required('Group ID is required'),
        leave_title: string().required('Leave title is required'),
        paid: string().required('Leave paid type is required'),
        new_joiners_after_months: string().required('Month for new joiners is required'),
        new_joiners_after_year: string().required('Year for new joiners is required'),
        consecutive: string().required('No. of consecutive is required').test('min-value', 'Consecutive allowed must be at least 1', value => parseInt(value) >= 1),
        carry_forward: string().required('Carry forward is required'),
        leave_unit: string().required('Leave Unit is required'),
        quantity: string().required('Quantity(No. of leaves) is required').test('non-negative', 'Quantity cannot be negative', value => parseInt(value) >= 0),
        calendar_upto: string().required('Calender upto is required'),
        calendar_from: string().required('Calender from is required'),
        prorated: string().required('Select prorated'),
        encashable: string().required('Select Encashable')
});

const validateShortlistHire = object().shape({
        // app_id: string().required('App id is required'),
        round_id: string().required('Round_id is required'),
        label: string().required('Label is required'),
        interviewTime: string().required('Time and Date is required')
        // comment: optional, no validation needed

})

const validateCreatePlanner = object().shape({
        branch: string().required('Branch ID is required'),
        planner_name: string().required('Planner Name is reuired')
})

/** Comma-separated Goal_Manage_by / competency_Manage_by (multi-select permissions). */
const manageByMultiField = string().test(
        'manage-by-tokens',
        'Goal / competency manage-by must be valid permission tokens',
        (val) => {
                if (val == null || val === '') return false
                const allowed = ['Admin', 'Custom employee', 'reporting manager', 'self']
                const parts = String(val).split(',').map((s) => s.trim()).filter(Boolean)
                return parts.length > 0 && parts.every((p) => allowed.includes(p))
        }
)

// New validation schemas for performance review
const validateMultipleEmployeePRC = object().shape({
        name: string()
                .required('Review cycle name is required')
                .test('not-empty', "Review cycle name can't be empty", value => !/^\s*$/.test(value))
                .test('no-leading-spaces', 'Remove spaces from the start of review cycle name', value => !/^[\s]+/.test(value))
                .test('no-leading-special-characters', "Review cycle name can't start with special characters", value => !/^[!@#$%^&*(),.?":{}|<>]/.test(value)),
        start_date: string().required('Start date is required'),
        end_date: string().required('End date is required'),
        goal_rate: string()
                .required('Goal percentage is required')
                .test('is-number', 'Goal must be a number', value => !isNaN(value))
                .test('range', 'Goal must be between 0 and 100', value => {
                        const num = parseInt(value);
                        return num >= 0 && num <= 100;
                }),
        competency_rate: string()
                .required('Competency percentage is required')
                .test('is-number', 'Competency must be a number', value => !isNaN(value))
                .test('range', 'Competency must be between 0 and 100', value => {
                        const num = parseInt(value);
                        return num >= 0 && num <= 100;
                }),
        branch: string().required('Branch is required'),
        department: string().required('Department is required'),
        employee: array()
                .of(string().required('Employee ID is required'))
                .min(1, 'At least one employee is required'),
        assigned_to: array()
                .of(string().required('Employee name is required'))
                .min(1, 'At least one employee name is required'),
        review_day: string().required('Review day is required'),
        competency_Manage_by: manageByMultiField,
        Goal_Manage_by: manageByMultiField,
});

const validateSingleEmployeePRCUpdate = object().shape({
        name: string()
                .required('Review cycle name is required')
                .test('not-empty', "Review cycle name can't be empty", value => !/^\s*$/.test(value))
                .test('no-leading-spaces', 'Remove spaces from the start of review cycle name', value => !/^[\s]+/.test(value))
                .test('no-leading-special-characters', "Review cycle name can't start with special characters", value => !/^[!@#$%^&*(),.?":{}|<>]/.test(value)),
        start_date: string().required('Start date is required'),
        end_date: string().required('End date is required'),
        goal_rate: string()
                .required('Goal percentage is required')
                .test('is-number', 'Goal must be a number', value => !isNaN(value))
                .test('range', 'Goal must be between 0 and 100', value => {
                        const num = parseInt(value);
                        return num >= 0 && num <= 100;
                }),
        competency_rate: string()
                .required('Competency percentage is required')
                .test('is-number', 'Competency must be a number', value => !isNaN(value))
                .test('range', 'Competency must be between 0 and 100', value => {
                        const num = parseInt(value);
                        return num >= 0 && num <= 100;
                }),
        branch: string().required('Branch is required'),
        department: string().required('Department is required'),
        employee: string().required('Employee is required'),
        assigned_to: string().required('Assigned to is required'),
        review_day: string().required('Review day is required'),
        competency_Manage_by: manageByMultiField,
        Goal_Manage_by: manageByMultiField,
});

const validateAddSubDepartment = object().shape({
        dept_name: string()
                .required('Department name is required')
                .test('not-empty', "Department name can't be empty", value => !/^\s*$/.test(value))
                .test('no-leading-spaces', 'Remove spaces from the start of Department name', value => !/^[\s]+/.test(value))
                .test('no-leading-special-characters', "Department name can't start with special characters", value => !/^[!@#$%^&*(),.?":{}|<>]/.test(value)),
        description: string()
                .required('Description  is required')
                .test('not-empty', "Description can't be empty", value => !/^\s*$/.test(value))
                .test('no-leading-spaces', 'Remove spaces from the start of Description', value => !/^[\s]+/.test(value))
                .test('no-leading-special-characters', "Description can't start with special characters", value => !/^[!@#$%^&*(),.?":{}|<>]/.test(value)),
        designation: array()
                .of(
                        string()
                                .required('Designation is required')
                                .test('not-empty', "Designation can't be empty", value => !/^\s*$/.test(value))
                                .test('no-leading-spaces', 'Remove spaces from the start of Designation', value => !/^[\s]+/.test(value))
                                .test('no-leading-special-characters', "Designation can't start with special characters", value => !/^[!@#$%^&*(),.?":{}|<>]/.test(value))
                )
        // .min(1, 'At least one designation is required')

});
const validateStepDepartmentForm = object().shape({
        dept_name: string()
                .required('Department name is required')
                .test('not-empty', "Department name can't be empty", value => !/^\s*$/.test(value))
                .test('no-leading-spaces', 'Remove spaces from the start of Department name', value => !/^[\s]+/.test(value))
                .test('no-leading-special-characters', "Department name can't start with special characters", value => !/^[!@#$%^&*(),.?":{}|<>]/.test(value)),
        description: string()
                .required('Description  is required')
                .test('not-empty', "Description can't be empty", value => !/^\s*$/.test(value))
                .test('no-leading-spaces', 'Remove spaces from the start of Description', value => !/^[\s]+/.test(value))
                .test('no-leading-special-characters', "Description can't start with special characters", value => !/^[!@#$%^&*(),.?":{}|<>]/.test(value)),
        designation: array()
                .of(
                        string()
                                .required('Designation is required')
                                .test('not-empty', "Designation can't be empty", value => !/^\s*$/.test(value))
                                .test('no-leading-spaces', 'Remove spaces from the start of Designation', value => !/^[\s]+/.test(value))
                                .test('no-leading-special-characters', "Designation can't start with special characters", value => !/^[!@#$%^&*(),.?":{}|<>]/.test(value))
                )
                .min(1, 'At least one designation is required')

});
const validateEditPolicyForm = object().shape({
        name: string()
                .required('Policy name is required')
                .test('not-empty', "Policy name can't be empty", value => !/^\s*$/.test(value))
                .test('no-leading-spaces', 'Remove spaces from the start of Policy name', value => !/^[\s]+/.test(value))
                .test('no-leading-special-characters', "Policy name can't start with special characters", value => !/^[!@#$%^&*(),.?":{}|<>]/.test(value)),


});

const validateIncrementForm = object().shape({
        salary_inc_type: string().required('Increment type is required'),

        inc_amount: string()
                .required('Incremnt amount is required')
                .test('not-empty', "Increment amount can't be empty", value => !/^\s*$/.test(value)),

        effective_from: string().required('Effective date is required'),
        increment_detail: string().required('Increment Detail is required')


});


const validateGoogleHoliday = object().shape({
        branch_id: string().required('Branch is Required'),
        policy_id: string().required('Ploicy is Required'),
        county_id: string().required('Country is Required'),
        language: string().required('language is Required')
})

const validateAcceptApplication = object().shape({
        // No validation needed for accept application since we removed Label and Reason fields
})

const validateAcceptanceConfirmation = object().shape({
        position: string()
                .required('Position is Required'),
        positionType: string()
                .required('Position Type is Required'),
        startDate: string()
                .required('Start Date is Required'),
        email: string()
                .required('Email is Required')
                .matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Invalid Email'),
        phone: string()
                .required('Phone is Required')
})

const validateShortlistTemplate = object().shape({
        position: string()
                .required('Position is Required'),
        interviewDate: string()
                .required('Interview Date is Required'),
        startTime: string()
                .required('Start Time is Required'),
        endTime: string()
                .required('End Time is Required'),
        details: string()
                .required('Details is Required'),
        address: string()
                .required('Address is Required'),
        email: string()
                .required('Email is Required')
                .matches(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Invalid Email'),
        phone: string()
                .required('Phone is Required')
})

const validateShortlistForm = object().shape({
        round_id: string()
                .required('Please select the round')
                .test('not-empty', 'Please select the round', value => value && value !== ''),
        label: string()
                .required('Data Label is required'),
        interviewTime: string()
                .required('Interview Time is required')
                .test('future-date', 'Interview time must be in the future', function (value) {
                        if (!value) return false;
                        const selectedDate = new Date(value);
                        const now = new Date();
                        return selectedDate > now;
                }),
        ///Comment: string().optional(allow )
        // Comments are optional, no validation needed
})





export {
        newBranchFormValidation, editBranchFormValidaion, addNoticeFormValidation,
        validateAddNoticeFormData, validateAddLeaveGroupForm, validateDefineLeaveType, validateShortlistHire, validateCreatePlanner, validateAddSubDepartment,
        validateStepDepartmentForm, validateGoogleHoliday, validateEditPolicyForm, validateIncrementForm,
        validateMultipleEmployeePRC, validateSingleEmployeePRCUpdate, validateAcceptApplication, validateAcceptanceConfirmation, validateShortlistTemplate, validateShortlistForm
}
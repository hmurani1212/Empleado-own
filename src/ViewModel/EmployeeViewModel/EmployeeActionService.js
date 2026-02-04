import { useEffect, useState } from "react"
import {
    Input,
    Popover,
    PopoverHandler,
    PopoverContent,
    Radio,
    Select,
    Option,
    Textarea,
    Button,
} from "@material-tailwind/react";
import { gettingEmployeeFrequentSalaryDetails } from "../../services/__frequentApiServices"
import usePayroll from "../PayrollViewModel/PayrollServices"
import payrollApi from "../../Model/Data/Payroll/Payroll"
import { showToast } from "../../Components/Toaster/Toaster"
// import { showToast } from "../../Components/Toaster/Toaster";
import { useNavigate } from "react-router-dom";
import useIndividualAttendanceServices from '../AttendanceViewModel/IndividualAttendanceServices'
import useStore from "../../Store/store";
import useEmployees from "../EmployeeViewModel/EmployeeServices"
import { format } from "date-fns"
import employeesApi from "../../Model/Data/Employees/Employees"
const useEmployeeActionService = () => {

    const { gettingAtData } = useIndividualAttendanceServices()
    const { handleIncrementDrawer } = usePayroll()
    const authRole = useStore((state) => state.authRole);

    const { deactive_employeefn, Active_employeefn, getEmployeesWithFilters, currentEmployeeStatus } = useEmployees();

    // Get drawer functions from store
    const openDrawer = useStore((state) => state.openDrawer);
    const settingDrawerTitle = useStore((state) => state.settingDrawerTitle);
    const settingDrawerSize = useStore((state) => state.settingDrawerSize);
    const settingComponent = useStore((state) => state.settingComponent);
    const closeDrawer = useStore((state) => state.closeDrawer);

    const [salaryDetailsValue, setSalaryDetailsValue] = useState({
        data: {},
        show: false,
        showDialog: false,
        id: '',
        reason: '',
        loading: false,

    })

    const handleOnChangeCancelInc = (e) => {
        const { name, value } = e.target

        setSalaryDetailsValue((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }

    const ToggleCancelIncDialog = (id) => {

        if (salaryDetailsValue.showDialog) {

            setSalaryDetailsValue((prevState) => ({
                ...prevState,
                id: '',
                reason: '',
                showDialog: false
            }))
        }

        setSalaryDetailsValue((prevState) => ({
            ...prevState,
            id: id,
            showDialog: !prevState.showDialog
        }))
    }

    const handleToggleSalaryDetails = () => {
        setSalaryDetailsValue((prevState) => ({
            ...prevState,
            show: false
        }))
    }

    const navigate = useNavigate();

    const handleEmpActionList = (data, list) => {
        console.log('what is the data here', data);

       //// 
       // 
      // console.log('list list', list);
        // console.log('employee data:', data);
        const listId = list?.id

        switch (listId) {
            case 1:
                // Profile action - handle based on user role
                if (authRole === "Admin") {
                    // For admin users, navigate to admin employee profile view
                    // Use the correct employee ID field based on the data structure
                    const employeeId = data?.id || data?.emp_id || data?.employee_id;
                    // Use route employeeId for navigation; the profile page will fetch API
                    const userId = employeeId || data?.user_id || data?.oneid || data?.one_id || data?.oneId || data?.oneID;
                    // console.log('Employee data:', data);
                    // console.log('Extracted employeeId:', employeeId);
                    if (employeeId) {
                        // Do not prefetch here to avoid duplicate calls; page will load data
                        // Pass the complete employee data through router state
                        navigate(`/employee-profile/${employeeId}`, { 
                            state: { employeeData: data } 
                        });
                    } else {
                        showToast('Employee ID not found', 'error');
                    }
                } else {
                    // For non-admin users, navigate to their own profile
                    navigate('/profile');
                }
                break;
            case 2:
                // Attendance action
                gettingAtData(data);
                console.log('what is the data here', data);
                break;
            case 3:
                // Salary Details action
                gettingSalaryDetails({ data: data });
                break;
            case 4:
                // View Payslip action
                if (authRole === "Admin") {
                    // Redirect to payroll manage payslip page
                    navigate('/payroll/manage_payslip');
                } else {
                    navigate('/payslip');
                }
                break;
            case 5:
                // Send SMS action - Open SMS Drawer
                openDrawer();
                settingDrawerTitle('Send SMS');
                settingDrawerSize('45vw');
                settingComponent(<SmsDrawerContent employeeData={data} />);
                break;
            case 6:
                // Leave Application action - Navigate to application list with employee filter
                const employeeId = data?.id || data?.emp_id || data?.employee_id;
                if (employeeId) {
                    navigate('/application/application_list', {
                        state: { filterEmployeeId: employeeId, filterEmployeeName: data?.name || 'Employee' }
                    });
                } else {
                    showToast('Employee ID not found', 'error');
                }
                break;
            case 7:
                // Deactivate action - Check employee status first
                ///console.log('are you landing here or not', data)
                const employeeStatus = data?.status;
                if (employeeStatus === "0") {
                    // Employee is already deactivated
                    showToast('Employee is already deactivated3333', 'warning');
                } else {
                    ///console.log('what is the employye status', employeeStatus)
                    // Employee is active, proceed with deactivation
                    openDrawer();
                    settingDrawerTitle('Deactivate Employee');
                    settingDrawerSize('45vw');
                    settingComponent(<DeactivateDrawerContent employeeData={data} />);
                    break;
                }
            case 8:
                // Deactivate action - Check employee status first
                ///console.log('are you landing here or not', data)
                const Status = data?.status;
                ///console.log('what is the status', Status)
                if (Status === "1") {
                    // Employee is already deactivated
                    showToast('Employee is already activated111', 'warning');
                } else {
                    ///console.log('what is the employye status', employeeStatus)
                    // Employee is active, proceed with deactivation
                    openDrawer();
                    settingDrawerTitle('Deactivate Employee');
                    settingDrawerSize('45vw');
                    settingComponent(<ActiveDrawerContent employeeData={data} />);
                }
                break;
            default:
                console.log('Action not implemented:', listId);
                break;
        }
    }

    // SMS Drawer Content Component
    const SmsDrawerContent = ({ employeeData }) => {
        return (
            <div className="flex flex-col items-center justify-center px-4">
                <div className="mb-6">
                    <svg className="w-[100px] h-[100px] text-[#0ACF97]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </div>

                <div className="text-center">
                    <h3 className="text-[1.38vw] font-semibold text-gray-800 mb-4">
                        SMS Functionality
                    </h3>

                    <p className="text-gray-600 mb-6 text-[1.10vw]">
                        SMS functionality will be launched soon!
                    </p>

                    {employeeData && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-[0.90vw] font-medium text-gray-700 mb-2">
                                Employee Details:
                            </h4>
                            <div className="text-gray-600 text-left">
                                <p className="text-[0.90vw]"><strong>Name:</strong> {employeeData?.name || 'N/A'}</p>
                                <p className="text-[0.90vw]"><strong>ID:</strong> {employeeData?.id || employeeData?.emp_id || 'N/A'}</p>
                                <p className="text-[0.90vw]"><strong>Mobile:</strong> {employeeData?.contacts?.id || 'No contact info'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };


     const AddEmploye = ({ employeeData }) => {
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <div className="mb-6">
                    <svg className="w-16 h-16 text-[#0ACF97]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </div>

                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        SMS Functionality
                    </h3>

                    <p className="text-gray-600 mb-6">
                        SMS functionality will be launched soon!
                    </p>

                    {employeeData && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Employee Details:
                            </h4>
                            <div className="text-sm text-gray-600 text-left">
                                <p><strong>Name:</strong> {employeeData?.name || 'N/A'}</p>
                                <p><strong>ID:</strong> {employeeData?.id || employeeData?.emp_id || 'N/A'}</p>
                                <p><strong>Mobile:</strong> {employeeData?.contacts?.id || 'No contact info'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Leave Application Drawer Content Component
    const LeaveApplicationDrawerContent = ({ employeeData }) => {
        ///console.log('testtttttt', employeeData)
        return (
            <div className="flex flex-col items-center justify-center p-8">
                <div className="mb-6">
                    <svg className="w-16 h-16 text-[#3DA5F4]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                </div>

                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Leave Applications
                    </h3>

                    <p className="text-gray-600 mb-6">
                        We will keep here Leave applications soon
                    </p>
                    {employeeData && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">
                                Employee Details:
                            </h4>
                            <div className="text-sm text-gray-600 text-left">
                                <p><strong>Name:</strong> {employeeData?.name || 'N/A'}</p>
                                <p><strong>ID:</strong> {employeeData?.id || employeeData?.emp_id || 'N/A'}</p>
                                <p><strong>Department:</strong> {employeeData?.departmen?.name || 'N/A'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Deactivate Drawer Content Component
    const DeactivateDrawerContent = ({ employeeData }) => {

        // console.log('employeeData', employeeData)
        // Local state for the form
        const [formData, setFormData] = useState({
            emp_id: '',
            emp_status: '',
            leaving_reason: '',
            clearance_status: '',
            leave_reason_detail: '',
            leave_date: '',
            notif_in_time: "1",
            hr_comments: ''
        });

        const [loading, setLoading] = useState(false);

        // Set employee ID when component mounts
        useEffect(() => {
            if (employeeData) {
                const empId = employeeData?.id || employeeData?.emp_id || employeeData?.employee_id;
                setFormData(prev => ({
                    ...prev,
                    emp_id: empId
                }));
            }
        }, [employeeData]);

        const handleInputChange = (field, value) => {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            ///alert('what')

            // Validate required fields
            if (!formData.leaving_reason || !formData.clearance_status || !formData.leave_date) {
                showToast('Please fill all required fields', 'error');
                return;
            }

            try {
                setLoading(true);

                // Prepare payload according to the required structure
                const payload = {
                    emp_id: parseInt(formData.emp_id),
                    type: "employee_status",
                    log_data: {
                        emp_status: "Left",
                        leaving_reason: formData.leaving_reason,
                        clearance_status: formData.clearance_status,
                        leave_reason_detail: formData.leave_reason_detail,
                        leave_date: formData.leave_date,
                        notif_in_time: parseInt(formData.notif_in_time),
                        hr_comments: formData.hr_comments
                    }
                };

                //console.log('Deactivate payload:', payload);

                // Use the store function instead of direct API call
                const responseData = await deactive_employeefn(payload);

                // console.log('Deactivate response:', responseData.STATUS === "SUCCESSFUL");

                if (responseData && responseData.STATUS === "SUCCESSFUL") {
                    showToast('Employee Successfully Deactivated', 'success');

                    // Reset form data
                    setFormData({
                        emp_id: '',
                        emp_status: '',
                        leaving_reason: '',
                        clearance_status: '',
                        leave_reason_detail: '',
                        leave_date: '',
                        notif_in_time: "1",
                        hr_comments: ''
                    });

                    // Close the drawer/modal
                    closeDrawer();

                    // Refresh employee list to update UI in real-time while maintaining current filter
                    await getEmployeesWithFilters({ status: currentEmployeeStatus }, false);

                } else {
                    showToast(responseData?.ERROR_DESCRIPTION || 'Failed to deactivate employee', 'error');
                }

            } catch (error) {
                console.error('Deactivate employee error:', error);
                showToast('Failed to deactivate employee', 'error');
            } finally {
                setLoading(false);
            }
        };

        return (
            <form onSubmit={handleSubmit} className='flex flex-col gap-[30px] px-4'>
                {/* Leaving Reason & Clearance Status - Flex Layout */}
                <div className='flex justify-between'>
                    <div className='w-[47%]'>
                        <Select
                            label="Leaving Reason"
                            color="blue"
                            value={formData.leaving_reason}
                            onChange={(value) => handleInputChange('leaving_reason', value)}
                            required
                        >
                            <Option value="resign">Resign</Option>
                            <Option value="terminate">Terminate</Option>
                            <Option value="other">Other</Option>
                        </Select>
                    </div>
                    <div className='w-[47%]'>
                        <Select
                            label="Clearance Status"
                            color="blue"
                            value={formData.clearance_status}
                            onChange={(value) => handleInputChange('clearance_status', value)}
                            required
                        >
                            <Option value="pending">Pending</Option>
                            <Option value="clear">Clear</Option>
                            <Option value="partial">Partial Clear</Option>
                        </Select>
                    </div>
                </div>

                {/* Leave Reason Detail */}
                <div>
                    <Textarea
                        color="blue"
                        label="Leave Reason Detail"
                        value={formData.leave_reason_detail}
                        onChange={(e) => handleInputChange('leave_reason_detail', e.target.value)}
                        ////placeholder="Write your thoughts here..."
                    />
                </div>

                {/* Leave Date */}
                <div>
                    <Input
                        type="date"
                        color="blue"
                        label="Leave Date"
                        value={formData.leave_date}
                        onChange={(e) => handleInputChange('leave_date', e.target.value)}
                        required
                    />
                </div>

                {/* Notification Submitted */}
                <div>
                    <span className='text-[#3DA5F4] font-semibold'>Notification submitted</span>
                    <div className="flex gap-4 mt-2">
                        <Radio
                            name="notification"
                            label="Yes"
                            value="1"
                            checked={formData.notif_in_time === "1"}
                            onChange={(e) => handleInputChange('notif_in_time', e.target.value)}
                            color="blue"
                        />
                        <Radio
                            name="notification"
                            label="No"
                            value="0"
                            checked={formData.notif_in_time === "0"}
                            onChange={(e) => handleInputChange('notif_in_time', e.target.value)}
                            color="blue"
                        />
                    </div>
                </div>

                {/* HR Comments */}
                <div>
                    <span className='text-[#3DA5F4] font-semibold'>HR Comments</span>
                    <div className="mt-2">
                        <Textarea
                            color="blue"
                            label="HR Comments"
                            value={formData.hr_comments}
                            onChange={(e) => handleInputChange('hr_comments', e.target.value)}
                            //placeholder="Write your thoughts here..."
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div>
                    <Button
                        color="blue"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Submit'}
                    </Button>
                </div>
            </form>
        );
    };

    const ActiveDrawerContent = ({ employeeData }) => {
        const [formData, setFormData] = useState({
            emp_id: '',
            emp_status: '',
            joinig_reason: '',
            joining_date: "",
        });

        const [loading, setLoading] = useState(false);

        // Set employee ID when component mounts
        useEffect(() => {
            if (employeeData) {
                const empId = employeeData?.id || employeeData?.emp_id || employeeData?.employee_id;
                setFormData(prev => ({
                    ...prev,
                    emp_id: empId
                }));
            }
        }, [employeeData]);

        const handleInputChange = (field, value) => {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        };


        const handleSubmit = async (e) => {
            e.preventDefault();

            /// alert('what is the reason')
            // Validate required fields
            if (!formData.joinig_reason || !formData.joining_date) {
                showToast('Please fill all required fields', 'error');
                return;
            }

            try {
                setLoading(true);

                // Prepare payload according to the required structure
                const payload = {
                    emp_id: parseInt(formData.emp_id),
                    type: "employee_status",
                    log_data: {
                        emp_status: "Active",
                        joinig_reason: formData.joinig_reason,
                        joining_date: formData.joining_date
                    }
                };

                //console.log('Deactivate payload:', payload);

                // Use the store function instead of direct API call
                const responseData = await Active_employeefn(payload);
                ///console.log('what is the response', responseData)

                // console.log('Deactivate response:', responseData.STATUS === "SUCCESSFUL");

                if (responseData && responseData.STATUS === "SUCCESSFUL") {
                    showToast('Employee Successfully Activated', 'success');

                    // Reset form data
                    setFormData({
                        emp_id: '',
                        joinig_reason: '',
                        joining_date: "",
                    });

                    // Close the drawer/modal
                    closeDrawer();

                    // Refresh employee list to update UI in real-time while maintaining current filter
                    await getEmployeesWithFilters({ status: "0" }, false);

                } else {
                    showToast(responseData?.ERROR_DESCRIPTION || 'Failed to activate employee', 'error');
                }

            } catch (error) {
                console.error('Activate employee error:', error);
                showToast('Failed to activate employee', 'error');
            } finally {
                setLoading(false);
            }
        };

        return (
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Leaving Reason & Clearance Status - Flex Layout */}

                    <div className="w-full max-w-sm min-w-[200px]">
                        <label
                            htmlFor="joining-reason"
                            className="block mb-2 text-sm font-medium text-gray-900"
                        >
                            Joining Reason
                        </label>
                        <input
                            id="joining-reason"
                            className="md:w-[470px]   w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-[#383736] hover:border-slate-300 shadow-sm focus:shadow"
                            placeholder="Enter the joining reason"
                            value={formData.joinig_reason}
                            onChange={(e) => handleInputChange('joinig_reason', e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="joining-date"
                            className="block mb-2 text-sm font-medium text-gray-900"
                        >
                            Joining Date
                        </label>
                        <input
                            id="joining-date"
                            type="date"
                            className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow"
                            value={formData.joining_date}
                            onChange={(e) => handleInputChange('joining_date', e.target.value)}
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                </>
                            ) : (
                                'Submit'
                            )}
                        </button>
                    </div>
                </div>
            </form>
        );
    };

    async function gettingSalaryDetails(empData) {

        const apiData = empData.data

        const response = await gettingEmployeeFrequentSalaryDetails(apiData)
        const responseData = response.data
        if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
            setSalaryDetailsValue((prevState) => ({
                ...prevState,
                data: responseData.DB_DATA,
                show: true
            }))
        }
    }

    // Function to open salary increment drawer using existing payroll component
    const handleSalaryIncrement = (empData) => {
        // Close the current salary details modal
        setSalaryDetailsValue((prevState) => ({
            ...prevState,
            show: false
        }))
        
        // Use the existing payroll increment drawer
        handleIncrementDrawer(empData)
    }

    const handleSubmitCancelInc = async (e) => {
        e.preventDefault()

        const apiData = {
            id: salaryDetailsValue.id,
            reason: salaryDetailsValue.reason
        }

        try {
            setSalaryDetailsValue((prevState) => ({
                ...prevState,
                loading: true
            }))

            const response = await payrollApi.cancelincDeductHistory(apiData)
            const responseData = response.data
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                const newData = responseData.INSERTED_DATA
                const cancelledId = salaryDetailsValue.id
                showToast("Incremenet Cancel Successfully", 'success')
                setSalaryDetailsValue((prevState) => {
                    // SalaryDetails UI reads data.increments and shows "Cancelled" when ele.status === "0"
                    const increments = prevState.data?.increments ?? []
                    return {
                        ...prevState,
                        data: {
                            ...prevState.data,
                            increments: increments.map((ele) => {
                                const isCancelledRow = String(ele.id) === String(cancelledId)
                                if (!isCancelledRow) return ele
                                // Merge API response and force status "0" so UI updates immediately
                                return { ...ele, ...newData, status: "0" }
                            }),
                        },
                        id: '',
                        showDialog: false,
                        reason: '',
                        loading: false
                    }
                })
            } else {
                const error = responseData.ERROR_DESCRIPTION
                showToast(error, 'error')
            }

        } catch (err) {

        } finally {
            setSalaryDetailsValue((prevState) => ({
                ...prevState,
                loading: false,

            }))
        }
    }

    return {
        handleToggleSalaryDetails,
        handleEmpActionList,
        salaryDetailsValue,
        ToggleCancelIncDialog,
        handleOnChangeCancelInc,
        handleSubmitCancelInc,
        handleSalaryIncrement,
    }

}

export default useEmployeeActionService
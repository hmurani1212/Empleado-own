import { useState, useEffect } from "react"
import { showToast } from "../../../Components/Toaster/Toaster"
import empApplicationApi from "../../../Model/Data/EmpData/EmpApplication/EmpApplication"
import applicationApi from "../../../Model/Data/Applications/Applications"
import leavesPlannerApi from "../../../Model/Data/LeavesPlanner/LeavesPlanner"
import { getDecodedToken } from "../../../Authentication/jwt_decode"
import axios from "axios"
const MAKE_URL_ENDPOINT = 'https://emp.veevotech.com/empleado_app/hiring/api/v1/organizations/make_url';

const useEmpLeaveApplication = ()=>{

    const [leaveApplcationValue, setLeaveApplicationValue] = useState({
        show:false,
        subject:'',
        application:'',
        leaveFrom:'',
        leaveUpto:'',
        file:'',
        leaveDays:[],
        loading:false,

    })

    // State for employee-defined leaves from API
    const [employeeDefinedLeaves, setEmployeeDefinedLeaves] = useState({})
    // Paid leave option visibility: when PAID_LEAVES config_value is 1, show "Paid leave" in Adjust In
    const [paidLeaveConfigEnabled, setPaidLeaveConfigEnabled] = useState(false)


    const handleToggleLeaveApplication = ()=>{
        setLeaveApplicationValue((prevState)=>({
            ...prevState,
            show:!prevState.show
        }))
    }


    const handleApplicationChange = (e)=>{
        const {name, value, type, files} = e.target
        
        // Handle file inputs
        const inputValue = type === 'file' ? (files[0] ? files[0] : null) : value;
        
        setLeaveApplicationValue((prevState)=>({
            ...prevState,
            [name]: inputValue
        }))
    }

    const generateLeaveDays = () => {
        console.log('Generating leave days for:', leaveApplcationValue);
        const { leaveFrom, leaveUpto } = leaveApplcationValue;
    
        if (leaveFrom === '' || leaveUpto === '') {
            showToast("Please provide both 'leaveFrom' and 'leaveUpto' dates.", 'error');
            return;
        }
    
        // Validate date format and order
        const startDate = new Date(leaveFrom);
        const endDate = new Date(leaveUpto);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            showToast("Please provide valid dates.", 'error');
            return;
        }
        
        if (startDate > endDate) {
            showToast("Leave start date cannot be after end date.", 'error');
            return;
        }
    
        const leaveArray = [];
    
        // Create a copy of startDate to avoid mutating the original
        const currentDate = new Date(startDate);
        
        // Loop from start date to end date
        while (currentDate <= endDate) {
            leaveArray.push({
                date: currentDate.toISOString().split('T')[0], // Format date as YYYY-MM-DD
                selectedLeaveType: null,
                isHalfDay: false,
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
    
        console.log('Generated leave days:', leaveArray);
        
        // Update state with the generated leave days
        setLeaveApplicationValue((prevState) => ({
            ...prevState,
            leaveDays: leaveArray
        }));
        
        showToast(`Generated ${leaveArray.length} leave days successfully.`, 'success');
    };

    const handleLeaveTypeChange = (index, selectedOption) => {
        setLeaveApplicationValue((prevState) => ({
            ...prevState,
            leaveDays: prevState.leaveDays.map((day, i) => 
                i === index ? { ...day, selectedLeaveType: selectedOption } : day
            )
        }));
    };

    const handleHalfDayChange = (index, isHalfDay) => {
        setLeaveApplicationValue((prevState) => ({
            ...prevState,
            leaveDays: prevState.leaveDays.map((day, i) => 
                i === index ? { ...day, isHalfDay } : day
            )
        }));
    };

    // Function to fetch PAID_LEAVES config; when config_value is 1, show "Paid leave" option
    const fetchPaidLeavesConfig = async () => {
        try {
            const response = await leavesPlannerApi.getPaidLeavesConfig();
            const resData = response?.data;
            const configValue = resData?.DB_DATA?.config_value;
            setPaidLeaveConfigEnabled(configValue === "1" || configValue === 1);
        } catch (err) {
            console.error('Error fetching PAID_LEAVES config:', err);
            setPaidLeaveConfigEnabled(false);
        }
    };

    // Function to fetch employee-defined leaves (without emp_id for employee side)
    const fetchEmployeeDefinedLeaves = async () => {
        try {
            console.log('Fetching employee defined leaves (employee side - no emp_id)');
            const response = await applicationApi.getEmployeeDefinedLeaves(null);
            const resData = response.data;
            console.log('Employee defined leaves response:', resData);

            if (resData.STATUS === "SUCCESSFUL") {
                setEmployeeDefinedLeaves(resData.DB_DATA || {});
                console.log('Employee defined leaves set:', resData.DB_DATA);
                return resData.DB_DATA || {};
            } else {
                console.log('Failed to fetch employee defined leaves:', resData.ERROR_DESCRIPTION);
                setEmployeeDefinedLeaves({});
                return {};
            }
        } catch (err) {
            console.error('Error fetching employee defined leaves:', err);
            setEmployeeDefinedLeaves({});
            return {};
        }
    };

    // Fetch employee-defined leaves and PAID_LEAVES config when form is shown
    useEffect(() => {
        if (leaveApplcationValue.show) {
            fetchEmployeeDefinedLeaves();
            fetchPaidLeavesConfig();
        }
    }, [leaveApplcationValue.show]);

    


    const addEmpLeaveApplication = async(e)=>{
        e.preventDefault()
        console.log('leave application', leaveApplcationValue)
        
        // Form validation
        const { subject, application, leaveFrom, leaveUpto, file, leaveDays } = leaveApplcationValue;
        
        if (!subject.trim()) {
            showToast('Subject is required', 'error');
            return;
        }
        
        if (!application.trim()) {
            showToast('Application Body is required', 'error');
            return;
        }
        
        if (!leaveFrom) {
            showToast('Leave From is required', 'error');
            return;
        }
        
        if (!leaveUpto) {
            showToast('Leave Upto is required', 'error');
            return;
        }
        
        if (leaveDays.length === 0) {
            showToast('Please generate leave days first', 'error');
            return;
        }
        
        // Validate that all leave days have Adjust In selected
        const hasUnselectedAdjustIn = leaveDays.some(day => !day.selectedLeaveType);
        if (hasUnselectedAdjustIn) {
            showToast('Adjust In is required for all leave days', 'error');
            return;
        }
        
        const formData = new FormData();

        // Upload file and get URL if attachment exists
        let attachmentUrl = '';
        if (file && file.name) {
            try {
                const uploadFormData = new FormData();
                uploadFormData.append('fileInput', file);
                
                console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
                
                const uploadResponse = await axios.post(MAKE_URL_ENDPOINT, uploadFormData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                console.log('Upload response:', uploadResponse.data);
                
                if (uploadResponse.data && (uploadResponse.data.url || uploadResponse.data.FILE_URL)) {
                    attachmentUrl = uploadResponse.data.url || uploadResponse.data.FILE_URL;
                    console.log('File uploaded successfully, URL:', attachmentUrl);
                } else {
                    console.error('No FILE_URL in response:', uploadResponse.data);
                    showToast('File upload failed - no URL returned', 'error');
                    return;
                }
            } catch (error) {
                console.error('File upload error:', error);
                console.error('Error response:', error.response?.data);
                showToast('File upload failed: ' + (error.response?.data?.ERROR_DESCRIPTION || error.message), 'error');
                return;
            }
        }

        // Prepare arrays for leave data
        const leaveDates = leaveDays.map(day => day.date);
        // Send the leave ID (value) from selectedLeaveType, not the label
        // Send leave_adjust_in: 2 = Leave without pay, 1 = Paid leave, or leave type ID from API
        const leaveAdjustIn = leaveDays.map(day => {
            const val = day.selectedLeaveType?.value ?? day.selectedLeaveType;
            return val !== undefined && val !== null && val !== '' ? String(val) : '2';
        });
        const halfDay = leaveDays.map(day => day.isHalfDay ? '1' : '0');
        const fileUrls = attachmentUrl ? [attachmentUrl] : [];

        // Append each field to the FormData with correct structure
        formData.append('operation', 'set_application');
        formData.append('appType', 'leave');
        formData.append('form_type', 'Leave_Application');
        formData.append('af_template', '12');
        formData.append('form_id', '7');
        
        // Main form data
        formData.append('subject', subject);
        formData.append('app_body', application);
        formData.append('leave_app_start_date', leaveFrom);
        formData.append('leave_app_end_date', leaveUpto);
        formData.append('emp_available_leaves', 'without_pay'); // Default value
        
        // Arrays for leave days
        leaveDates.forEach(date => {
            formData.append('leave_date[]', date);
        });
        
        leaveAdjustIn.forEach(adjust => {
            formData.append('leave_adjust_in[]', adjust);
        });
        
        halfDay.forEach(half => {
            formData.append('half_day[]', half);
        });
        
        fileUrls.forEach(url => {
            formData.append('file_url[]', url);
        });
        
        // Employee data (keep empty for employee side)
        formData.append('emp_id', '');
        formData.append('emp_name', '');

        try {
            setLeaveApplicationValue((prevState) => ({
                ...prevState,
                loading: true
            }));

            const response = await empApplicationApi.addMedicalAllowance(formData);
            const responseData = response.data;
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                showToast('Leave Application Submitted Successfully', 'success');
                setLeaveApplicationValue({
                    show: false,
                    subject: '',
                    application: '',
                    leaveFrom: '',
                    leaveUpto: '',
                    file: '',
                    leaveDays: [],
                    loading: false,
                });
            } else {
                const error = responseData.ERROR_DESCRIPTION;
                showToast(error, 'error');
            }
        } catch (err) {
            console.error('Leave application error:', err);
            showToast('Failed to submit leave application', 'error');
        } finally {
            setLeaveApplicationValue((prevState) => ({
                ...prevState,
                loading: false
            }));
        }
    }



    return {
        leaveApplcationValue,
        handleToggleLeaveApplication,
        addEmpLeaveApplication,
        handleApplicationChange,
        generateLeaveDays,
        handleLeaveTypeChange,
        handleHalfDayChange,
        employeeDefinedLeaves,
        paidLeaveConfigEnabled,
        fetchEmployeeDefinedLeaves
    }

}


export default useEmpLeaveApplication
import React, { useState, useEffect } from 'react';
import useStore from "../../Store/store"
import { showToast } from "../../Components/Toaster/Toaster"
import {
    Input,
    Button,
    Textarea,
    Popover,
    PopoverHandler,
    PopoverContent,
} from "@material-tailwind/react";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/24/outline";
import Calendar from 'react-calendar';
import leavesPlannerApi from '../../Model/Data/LeavesPlanner/LeavesPlanner';

const useNewApplication = () => {

    const gettingAllEmpApplication = useStore((state) => state.gettingAllEmpApplication)
    const applicationEmpList = useStore((state) => state.applicationEmpList)
    const SubmitApplcationsFn = useStore((state) => state.SubmitApplcationsFn)
    const uploadFileToElephant = useStore((state) => state.uploadFileToElephant)

    // Global drawer functions
    const openDrawer = useStore((state) => state.openDrawer);
    const closeDrawer = useStore((state) => state.closeDrawer);
    const settingDrawerTitle = useStore((state) => state.settingDrawerTitle);
    const settingDrawerSize = useStore((state) => state.settingDrawerSize);
    const settingComponent = useStore((state) => state.settingComponent);

    const [applicationType, setApplicationType] = useState('')
    const [medicalAppValue, setMedicalAppValue] = useState({

        appType: "med_allowance",
        subject: "",
        app_body: "",
        amount: "",
        claim_month: "",
        claim_year: "",
        attachment: "",
        emp_id: "",
        emp_name: ""
    })

    const [uploadedFileUrl, setUploadedFileUrl] = useState("")
    const [isUploading, setIsUploading] = useState(false)

    // TA/DA Application state
    const [taDaAppValue, setTaDaAppValue] = useState({
        visit_locations: "",
        visit_purpose: "",
        leaving_date: "",
        leaving_time: "",
        return_date: "",
        return_time: "",
        fuel_expense: "",
        fuel_exp_voucher: "",
        toll_tax: "",
        toll_tax_voucher: "",
        misc: "",
        misc_voucher: "",
        hotel_charges: "",
        DA_rate: "",
        DA_claimed_days: "",
        DA_approved_days: "",
        emp_id: "",
        emp_name: ""
    })

    const [taDaUploadedFiles, setTaDaUploadedFiles] = useState({
        fuel_voucher: "",
        toll_voucher: "",
        misc_voucher: ""
    })

    // Leave Application state
    const [leaveAppValue, setLeaveAppValue] = useState({
        leave_type: "",
        subject: "",
        description: "",
        start_date: "", // Will store date string like "2025-09-03"
        end_date: "",   // Will store date string like "2025-09-24"
        total_days: "",
        emergency_contact: "",
        work_handover: "",
        supporting_docs: "",
        emp_id: "",
        emp_name: ""
    })

    // Separate state for date inputs to ensure they update
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    // State for generated leave days
    const [leaveDays, setLeaveDays] = useState([])

    // State for employee-defined leaves
    const [employeeDefinedLeaves, setEmployeeDefinedLeaves] = useState({})

    // Leave Encashment state
    const [leaveEncashValue, setLeaveEncashValue] = useState({
        subject: "",
        application_body: "",
        leaves_count: "",
        emp_id: "",
        emp_name: ""
    })

    // Get employee defined leaves from store
    const getEmployeeDefinedLeaves = useStore((state) => state.getEmployeeDefinedLeaves)

    // Function to fetch employee-specific leave types
    const fetchEmployeeDefinedLeaves = async (empId) => {
        try {
            console.log('Fetching employee defined leaves for empId:', empId)
            const response = await getEmployeeDefinedLeaves(empId)
            console.log('Employee defined leaves response:', response)

            if (response.success && response.data) {
                setEmployeeDefinedLeaves(response.data)
                console.log('Employee defined leaves set:', response.data)
                return response.data // Return the data for immediate use
            } else {
                // Default to empty if API fails
                setEmployeeDefinedLeaves({})
                console.log('Failed to fetch employee defined leaves, using default')
                return {}
            }
        } catch (err) {
            console.error('Error fetching employee defined leaves:', err)
            // Default to empty if API fails
            setEmployeeDefinedLeaves({})
            return {}
        }
    }

    // Leave type options for dropdown - dynamically created from employee-defined leaves
    const leaveTypeOptions = [
        { value: "", label: "-- Choose leave adjustment --" },
        ...Object.entries(employeeDefinedLeaves).map(([id, name]) => ({
            value: id,
            label: name
        }))
    ]

    const handleApplicationChange = async (val) => {

        // Handle Leave Encashment (id: 4) - Check employee selection FIRST
        if (val.id === 4 || val.id === '4') {

            // Check if employee is selected before allowing Leave Encashment
            const selectedEmpId = medicalAppValue.emp_id || taDaAppValue.emp_id;

            if (!selectedEmpId) {
                showToast('Please select an employee from the dropdown above before selecting Leave Encashment', 'error');
                return; // Don't proceed if no employee selected - don't set applicationType
            }
        }

        // Set application type only after validation passes
        setApplicationType(val.id)

        // Handle Leave Application (id: 3) - Open drawer if employee already selected
        if (val.id === 3 || val.id === '3') {
            const selectedEmpId = medicalAppValue.emp_id || taDaAppValue.emp_id;
            if (!selectedEmpId) {
                showToast('Please select an employee', 'error');
                return;
            }
            await openLeaveApplicationDrawer(selectedEmpId, medicalAppValue.emp_name || taDaAppValue.emp_name || "");
        }
    };

    // Open Leave Application drawer for a given employee (used when type is already Leave Application and user selects employee)
    const openLeaveApplicationDrawer = async (selectedEmpId, selectedEmpName) => {
        if (!selectedEmpId) {
            showToast('Please select an employee', 'error');
            return;
        }
        const empName = selectedEmpName || medicalAppValue.emp_name || taDaAppValue.emp_name || "";

        const fetchedLeaves = await fetchEmployeeDefinedLeaves(selectedEmpId);
        let paidLeaveEnabled = false;
        try {
            const configRes = await leavesPlannerApi.getPaidLeavesConfig();
            const configValue = configRes?.data?.DB_DATA?.config_value;
            paidLeaveEnabled = configValue === "1" || configValue === 1;
        } catch (err) {
            console.error('Error fetching PAID_LEAVES config:', err);
        }

        setLeaveAppValue({
            leave_type: "",
            subject: "",
            description: "",
            start_date: "",
            end_date: "",
            total_days: "",
            emergency_contact: "",
            work_handover: "",
            supporting_docs: "",
            emp_id: selectedEmpId,
            emp_name: empName
        });
        setStartDate("");
        setEndDate("");
        setLeaveDays([]);

        const currentLeaveOptions = [
            { value: "", label: "-- Choose leave adjustment --" },
            ...Object.entries(fetchedLeaves || {}).map(([id, name]) => ({ value: id, label: name })),
            { value: "2", label: "Leave without pay" },
            ...(paidLeaveEnabled ? [{ value: "1", label: "Paid leave" }] : [])
        ];

        settingComponent(<LeaveApplicationDrawerContent
            selectedEmpId={selectedEmpId}
            selectedEmpName={empName}
            leaveTypeOptions={currentLeaveOptions}
        />);
        settingDrawerTitle('Leave Application');
        settingDrawerSize(600);
        openDrawer();
    };

    const handleChangeMedicalApp = (e) => {
        const { name, value } = e.target

        setMedicalAppValue((prevState) => ({
            ...prevState,
            [name]: value
        }))

    }
    const handleSelectChangeMedicalApp = (field, value) => {
        setMedicalAppValue((prevState) => {
            const newState = {
                ...prevState,
                [field]: value
            };
            return newState;
        })
    }


    const handleChangeEmpName = (value, actionMeta) => {
        if (actionMeta.action === 'input-change') {
            gettingAllEmpApplication(value)
            // console.log('value',value)
        }
    }

    // TA/DA Application handlers
    const handleChangeTaDaApp = (e) => {
        const { name, value } = e.target
        setTaDaAppValue((prevState) => {
            const newState = {
                ...prevState,
                [name]: value
            }

            // Auto-set return time to same as leaving time
            if (name === 'leaving_time' && value) {
                newState.return_time = value
            }

            return newState
        })
    }

    const handleSelectChangeTaDaApp = (field, value) => {
        setTaDaAppValue((prevState) => {
            const newState = {
                ...prevState,
                [field]: value
            };
            return newState;
        })
    }

    const handleTaDaDateChange = (date, field) => {
        const timestamp = Math.floor(date.getTime() / 1000) // Convert to Unix timestamp
        setTaDaAppValue((prevState) => ({
            ...prevState,
            [field]: timestamp
        }))
    }

    // Leave Application handlers
    const handleChangeLeaveApp = (e) => {
        const { name, value } = e.target

        setLeaveAppValue((prevState) => {
            const newState = {
                ...prevState,
                [name]: value
            };
            return newState;
        })
    }

    const handleSelectChangeLeaveApp = (field, value) => {
        setLeaveAppValue((prevState) => ({
            ...prevState,
            [field]: value
        }))
    }

    const handleLeaveDateChange = (date, field) => {
        const timestamp = Math.floor(date.getTime() / 1000) // Convert to Unix timestamp
        setLeaveAppValue((prevState) => ({
            ...prevState,
            [field]: timestamp
        }))
    }

    // Function to generate leave days between start and end date
    const generateLeaveDays = () => {

        if (!startDate || !endDate) {
            showToast('Please select both start and end dates first', 'warning')
            return
        }

        const start = new Date(startDate)
        const end = new Date(endDate)


        if (start > end) {
            showToast('End date cannot be before start date. Same day leave is allowed.', 'error')
            return
        }

        const days = []
        const currentDate = new Date(start)

        while (currentDate <= end) {
            days.push({
                id: Date.now() + Math.random(), // Unique ID for each day
                date: currentDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
                leaveType: "",
                isHalfDay: false
            })
            currentDate.setDate(currentDate.getDate() + 1)
        }

        setLeaveDays(days)
        showToast(`${days.length} leave days generated successfully`, 'success')
    }

    // Function to handle leave type change for a specific day
    const handleLeaveTypeChange = (dayId, leaveType) => {
        setLeaveDays(prevDays =>
            prevDays.map(day =>
                day.id === dayId ? { ...day, leaveType } : day
            )
        )
    }

    // Function to handle half day checkbox change
    const handleHalfDayChange = (dayId, isHalfDay) => {
        setLeaveDays(prevDays =>
            prevDays.map(day =>
                day.id === dayId ? { ...day, isHalfDay } : day
            )
        )
    }

    // Leave Encashment handlers
    const handleChangeLeaveEncash = (e) => {
        const { name, value } = e.target
        setLeaveEncashValue((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }

    // Function to create Leave Encashment payload
    const createLeaveEncashPayload = (formData) => {
        return {
            "form_type": "Leave_Encashement",
            "emp_id": parseInt(formData.emp_id),
            "emp_name": formData.emp_name,
            "Subject": formData.subject,
            "application_body": formData.application_body,
            "leaves_count": parseInt(formData.leaves_count)
        }
    }

    // Function to handle Leave Encashment submission
    const handleLeaveEncashment = async (e) => {
        e.preventDefault()

        try {
            // Get employee ID from the existing employee selection
            const selectedEmpId = medicalAppValue.emp_id || taDaAppValue.emp_id;

            // Validate that employee is selected
            if (!selectedEmpId) {
                showToast('Please select an employee from the dropdown above', 'error')
                return
            }

            // Validate form
            if (!leaveEncashValue.subject || !leaveEncashValue.application_body || !leaveEncashValue.leaves_count) {
                showToast('Please fill all required fields', 'error')
                return
            }

            // Create payload with selected employee ID
            const formDataWithEmp = {
                ...leaveEncashValue,
                emp_id: selectedEmpId
            };

            const payload = await createLeaveEncashPayload(formDataWithEmp)
            // console.log("Leave Encashment Payload:", payload)

            // Submit application using existing endpoint
            const response = await SubmitApplcationsFn(payload)

            // Check if submission was successful
            if (response?.STATUS === "SUCCESSFUL") {
                // Reset form after successful submission
                setLeaveEncashValue({
                    subject: "",
                    application_body: "",
                    leaves_count: "",
                    emp_id: "",
                    emp_name: ""
                })

                showToast('Leave encashment application submitted successfully!', 'success')
            }

        } catch (error) {
            console.error("Error submitting leave encashment:", error)
            showToast('Failed to submit leave encashment application. Please try again.', 'error')
        }
    }

    // Function to combine date and time into Unix timestamp
    const combineDateTime = (dateTimestamp, timeString) => {
        if (!dateTimestamp || !timeString) return dateTimestamp

        const date = new Date(dateTimestamp * 1000)
        const [hours, minutes] = timeString.split(':')

        date.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        return Math.floor(date.getTime() / 1000)
    }

    // Function to handle file upload
    const handleFileUpload = async (file) => {
        if (!file) return;

        setIsUploading(true);
        try {
            const uploadResult = await uploadFileToElephant(file);
            if (uploadResult.success) {
                setUploadedFileUrl(uploadResult.fileUrl);
                showToast('File uploaded successfully!', 'success');
                return uploadResult.fileUrl;
            } else {
                throw new Error('File upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            showToast('Failed to upload file. Please try again.', 'error');
            return null;
        } finally {
            setIsUploading(false);
        }
    }

    // Function to handle TA/DA file uploads
    const handleTaDaFileUpload = async (file, voucherType) => {
        if (!file) return;

        setIsUploading(true);
        try {
            const uploadResult = await uploadFileToElephant(file);
            if (uploadResult.success) {
                setTaDaUploadedFiles((prevState) => ({
                    ...prevState,
                    [voucherType]: uploadResult.fileUrl
                }));
                showToast(`${voucherType} uploaded successfully!`, 'success');
                return uploadResult.fileUrl;
            } else {
                throw new Error('File upload failed');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            showToast(`Failed to upload ${voucherType}. Please try again.`, 'error');
            return null;
        } finally {
            setIsUploading(false);
        }
    }

    // Function to create medical allowance payload
    const createMedicalAllowancePayload = (formData, fileUrl = "") => {
        return {
            "form_type": "Medical_Allownce",
            "Subject": formData.subject,
            "application_body": formData.app_body,
            "emp_id": parseInt(formData.emp_id),
            "emp_name": formData.emp_name,
            "amount": parseFloat(formData.amount),
            "claim_month": formData.claim_month,
            "claim_year": formData.claim_year,
            "attachments": fileUrl || formData.attachment
        }
    }

    // Function to create TA/DA payload
    const createTaDaPayload = (formData, uploadedFiles) => {
        // Combine date and time for leaving and return dates
        const leavingDateTime = combineDateTime(formData.leaving_date, formData.leaving_time)
        const returnDateTime = combineDateTime(formData.return_date, formData.return_time)

        return {
            "form_type": "DA Applications",
            "emp_id": parseInt(formData.emp_id),
            "emp_name": formData.emp_name,
            "visit_locations": formData.visit_locations,
            "visit_purpose": formData.visit_purpose,
            "leaving_date": leavingDateTime,
            "return_date": returnDateTime,
            "fuel_expense": parseFloat(formData.fuel_expense) || 0,
            "fuel_exp_voucher": uploadedFiles.fuel_voucher || "",
            "toll_tax": parseFloat(formData.toll_tax) || 0,
            "toll_tax_voucher": uploadedFiles.toll_voucher || "",
            "misc": parseFloat(formData.misc) || 0,
            "misc_voucher": uploadedFiles.misc_voucher || "",
            "hotel_charges": parseFloat(formData.hotel_charges) || 0,
            "DA_rate": parseFloat(formData.DA_rate) || 0,
            "DA_claimed_days": parseInt(formData.DA_claimed_days) || 0,
            "DA_approved_days": parseInt(formData.DA_approved_days) || 0
        }
    }

    // Function to validate medical allowance form
    const validateMedicalForm = (formData) => {
        const errors = []

        if (!formData.emp_id) errors.push("Please Select the employee")
        if (!formData.subject || formData.subject.trim() === "") errors.push("Subject is required")
        if (!formData.app_body || formData.app_body.trim() === "") errors.push("Application body is required")
        if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) errors.push("Valid amount is required")
        if (!formData.claim_month) errors.push("Claim month is required")
        if (!formData.claim_year) errors.push("Claim year is required")

        return {
            isValid: errors.length === 0,
            errors: errors
        }
    }

    const handleMedicalApplication = async (e) => {
        e.preventDefault()

        // Validate form data
        const validation = validateMedicalForm(medicalAppValue)

        if (!validation.isValid) {
            // Show validation errors using toast notifications
            console.error("Validation errors:", validation.errors)
            showToast(`Please fix the following errors: ${validation.errors.join(", ")}`, 'error')
            return
        }

        try {
            // Create payload with uploaded file URL
            const payload = createMedicalAllowancePayload(medicalAppValue, uploadedFileUrl)

            // Submit application
            await SubmitApplcationsFn(payload)

            // Reset form after successful submission
            setMedicalAppValue({
                appType: "med_allowance",
                subject: "",
                app_body: "",
                amount: "",
                claim_month: "",
                claim_year: "",
                attachment: "",
                emp_id: "",
                emp_name: ""
            })
            setUploadedFileUrl("")

            // Also reset the employee selection in the main forms
            setMedicalAppValue(prev => ({
                ...prev,
                emp_id: "",
                emp_name: ""
            }))
            setTaDaAppValue(prev => ({
                ...prev,
                emp_id: "",
                emp_name: ""
            }))

            showToast('Medical allowance application submitted successfully!', 'success')

        } catch (error) {
            console.error("Error submitting medical application:", error)
            showToast('Failed to submit medical allowance application. Please try again.', 'error')
        }
    }

    // Function to validate TA/DA form
    const validateTaDaForm = (formData) => {
        const errors = []

        if (!formData.emp_id) errors.push("Please Select the employee")
        if (!formData.visit_locations || formData.visit_locations.trim() === "") errors.push("Visit locations are required")
        if (!formData.visit_purpose || formData.visit_purpose.trim() === "") errors.push("Visit purpose is required")
        if (!formData.leaving_date) errors.push("Leaving date is required")
        if (!formData.return_date) errors.push("Return date is required")
        if (!formData.leaving_time) errors.push("Leaving time is required")
        if (!formData.return_time) errors.push("Return time is required")

        // Validate that leaving date is before return date
        if (formData.leaving_date && formData.return_date && formData.leaving_time && formData.return_time) {
            const leavingDateTime = combineDateTime(formData.leaving_date, formData.leaving_time)
            const returnDateTime = combineDateTime(formData.return_date, formData.return_time)

            if (leavingDateTime >= returnDateTime) {
                errors.push("Leaving date and time must be before return date and time")
            }
        }

        return { isValid: errors.length === 0, errors }
    }

    // Function to handle TA/DA application submission
    const handleTaDaApplication = async (e) => {
        e.preventDefault()

        try {
            // Validate form
            const validation = validateTaDaForm(taDaAppValue)
            if (!validation.isValid) {
                console.error("Validation errors:", validation.errors)
                showToast(`Please fix the following errors: ${validation.errors.join(", ")}`, 'error')
                return
            }

            // Create payload
            const payload = createTaDaPayload(taDaAppValue, taDaUploadedFiles)
            ///console.log("TA/DA Payload:", payload)

            // Submit application
            await SubmitApplcationsFn(payload)

            // Reset form after successful submission
            setTaDaAppValue({
                visit_locations: "",
                visit_purpose: "",
                leaving_date: "",
                leaving_time: "",
                return_date: "",
                return_time: "",
                fuel_expense: "",
                fuel_exp_voucher: "",
                toll_tax: "",
                toll_tax_voucher: "",
                misc: "",
                misc_voucher: "",
                hotel_charges: "",
                DA_rate: "",
                DA_claimed_days: "",
                DA_approved_days: "",
                emp_id: "",
                emp_name: ""
            })

            setTaDaUploadedFiles({
                fuel_voucher: "",
                toll_voucher: "",
                misc_voucher: ""
            })

            // Also reset the employee selection in the main forms
            setMedicalAppValue(prev => ({
                ...prev,
                emp_id: "",
                emp_name: ""
            }))
            setTaDaAppValue(prev => ({
                ...prev,
                emp_id: "",
                emp_name: ""
            }))

            showToast('TA/DA application submitted successfully!', 'success')

        } catch (error) {
            console.error("Error submitting TA/DA application:", error)
            showToast('Failed to submit TA/DA application. Please try again.', 'error')
        }
    }

    // Function to validate Leave Application form
    const validateLeaveForm = (formData) => {
        const errors = []

        // Only validate the fields that are actually used in the new form structure
        if (!formData.subject || formData.subject.trim() === "") errors.push("Subject is required")
        if (!formData.description || formData.description.trim() === "") errors.push("Application body is required")

        return { isValid: errors.length === 0, errors }
    }

    // Function to create Leave Application payload
    const createLeavePayload = (formData) => {
        // Extract leave dates and adjust types from generated leave days
        const leaveDates = leaveDays.map(day => day.date);
        const leaveAdjustIn = leaveDays.map(day => day.leaveType); // Send the actual leave ID selected by user
        const halfDay = leaveDays.map(day => day.isHalfDay ? "1" : "0");


        return {
            "form_type": "Leave_Application",
            "af_template": 12,
            "form_id": 7,
            "form_data": {
                "file_url": formData.supporting_docs ? [formData.supporting_docs] : [],
                "subject": formData.subject,
                "app_body": formData.description,
                "leave_app_start_date": startDate,
                "leave_app_end_date": endDate,
                "leave_date": leaveDates,
                "leave_adjust_in": leaveAdjustIn,
                "emp_id": formData.emp_id, // Dynamic employee ID from selected employee
                "emp_name": formData.emp_name,
                "half_day": halfDay,
                "emp_available_leaves": "without_pay" // Static as requested
            }
        }
    }

    // Function to handle Leave Application submission
    const handleLeaveApplication = async (e) => {
        e.preventDefault()


        try {
            // Get employee ID from the existing employee selection
            // Since we already validated employee selection before opening drawer, we can safely get it here
            const selectedEmpId = leaveAppValue.emp_id || medicalAppValue.emp_id || taDaAppValue.emp_id;
            const selectedEmpName = leaveAppValue.emp_name || medicalAppValue.emp_name || taDaAppValue.emp_name;

            // Update leaveAppValue with the selected employee information
            const updatedLeaveAppValue = {
                ...leaveAppValue,
                emp_id: selectedEmpId,
                emp_name: selectedEmpName
            };


            // Validate that dates are selected
            if (!startDate || !endDate) {
                showToast('Please select both start and end dates', 'error')
                return
            }

            // Validate that leave days are generated
            if (leaveDays.length === 0) {
                showToast('Please click "Adjust In" to generate leave days', 'error')
                return
            }

            // Validate that all leave days have leave type selected
            const incompleteDays = leaveDays.filter(day => !day.leaveType);
            if (incompleteDays.length > 0) {
                showToast('Please select leave type for all days', 'error')
                return
            }

            // Validate form
            const validation = validateLeaveForm(updatedLeaveAppValue)
            if (!validation.isValid) {
                console.error("Validation errors:", validation.errors)
                showToast(`Please fix the following errors: ${validation.errors.join(", ")}`, 'error')
                return
            }

            // Handle file upload if supporting documents are provided
            let fileUrl = "";
            if (updatedLeaveAppValue.supporting_docs && updatedLeaveAppValue.supporting_docs !== "") {
                try {
                    // Assuming supporting_docs contains file URL or file object
                    // You may need to adjust this based on how files are handled
                    fileUrl = updatedLeaveAppValue.supporting_docs;
                } catch (fileError) {
                    console.error("Error handling file upload:", fileError);
                    showToast('Error uploading supporting documents', 'error');
                    return;
                }
            }

            // Create payload with file URL and selected employee ID
            const formDataWithFile = {
                ...updatedLeaveAppValue,
                supporting_docs: fileUrl
            };

            const payload = createLeavePayload(formDataWithFile)

            // Submit application using existing endpoint
            const response = await SubmitApplcationsFn(payload)

            // Check if submission was successful (status 201 or SUCCESSFUL)
            if (response?.STATUS === "SUCCESSFUL") {
                // Reset form after successful submission
                setLeaveAppValue({
                    leave_type: "",
                    subject: "",
                    description: "",
                    start_date: "",
                    end_date: "",
                    total_days: "",
                    emergency_contact: "",
                    work_handover: "",
                    supporting_docs: "",
                    emp_id: "",
                    emp_name: ""
                })

                // Reset separate date states
                setStartDate("");
                setEndDate("");

                // Reset generated leave days
                setLeaveDays([]);

                // Also reset the employee selection in the main forms
                setMedicalAppValue(prev => ({
                    ...prev,
                    emp_id: "",
                    emp_name: ""
                }))
                setTaDaAppValue(prev => ({
                    ...prev,
                    emp_id: "",
                    emp_name: ""
                }))

                // Close the drawer after successful submission
                closeDrawer();

                showToast('Leave application submitted successfully!', 'success')
            }

        } catch (error) {
            console.error("Error submitting leave application:", error)
            showToast('Failed to submit leave application. Please try again.', 'error')
        }
    }


    return {
        handleApplicationChange, applicationType,
        handleMedicalApplication, handleChangeMedicalApp, medicalAppValue,
        handleSelectChangeMedicalApp, handleChangeEmpName, applicationEmpList,
        createMedicalAllowancePayload, validateMedicalForm, handleFileUpload,
        uploadedFileUrl, isUploading,
        // TA/DA functions
        handleTaDaApplication, handleChangeTaDaApp, taDaAppValue,
        handleSelectChangeTaDaApp, handleTaDaDateChange, handleTaDaFileUpload,
        taDaUploadedFiles, createTaDaPayload, validateTaDaForm, combineDateTime,
        // Leave Application functions
        handleLeaveApplication, handleChangeLeaveApp, leaveAppValue, setLeaveAppValue,
        handleSelectChangeLeaveApp, handleLeaveDateChange, createLeavePayload, validateLeaveForm,
        openLeaveApplicationDrawer,
        // Leave days generation functions
        generateLeaveDays, leaveDays, handleLeaveTypeChange, handleHalfDayChange, leaveTypeOptions,
        // Date states
        startDate, endDate, setStartDate, setEndDate,
        // Leave Encashment functions
        handleLeaveEncashment, handleChangeLeaveEncash, leaveEncashValue, createLeaveEncashPayload,
        // Leave Application Drawer Component
        LeaveApplicationDrawerContent
    }
}

// Leave Application Drawer Content Component - Uses hook directly for state access
const LeaveApplicationDrawerContent = ({ selectedEmpId, selectedEmpName, leaveTypeOptions: passedLeaveTypeOptions }) => {
    // Use the hook to get all the state and functions
    const {
        leaveAppValue,
        setLeaveAppValue,
        handleChangeLeaveApp,
        handleLeaveApplication,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        generateLeaveDays,
        leaveDays,
        handleLeaveTypeChange,
        handleHalfDayChange,
        isUploading
    } = useNewApplication();

    // Use the passed leave type options instead of the hook's options
    const leaveTypeOptions = passedLeaveTypeOptions || [
        { value: "", label: "-- Choose leave adjustment --" }
    ];

    // Update leaveAppValue with the selected employee information when component mounts
    React.useEffect(() => {
        if (selectedEmpId && selectedEmpName) {
            setLeaveAppValue(prev => ({
                ...prev,
                emp_id: selectedEmpId,
                emp_name: selectedEmpName
            }));
        }
    }, [selectedEmpId, selectedEmpName, setLeaveAppValue]);
    return (
        <div className="p-6">
            <form onSubmit={handleLeaveApplication} className="flex flex-col gap-4">
                {/* Subject */}
                <div className="w-full">
                    <Input
                        color="blue"
                        className="!h-11 !rounded-6"
                        label="Subject"
                        name="subject"
                        value={leaveAppValue.subject}
                        onChange={handleChangeLeaveApp}
                        required
                    />
                </div>

                <div className="w-full">
                    <Textarea
                        color="blue"
                        label="Application Body"
                        name="description"
                        value={leaveAppValue.description}
                        onChange={handleChangeLeaveApp}
                        required
                    />
                </div>

                {/* Supporting Documents Upload */}
                <div className="w-full">
                    <label className='text-[#698592] text-[12px] mb-1 block'>Supporting Documents (Optional)</label>
                    <input
                        type="file"
                        className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none'
                        name="supporting_docs"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                // For now, just store the file name
                                // In a real implementation, you would upload the file using uploadFileToElephant
                                setLeaveAppValue(prev => ({
                                    ...prev,
                                    supporting_docs: file.name
                                }));
                            }
                        }}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                </div>

                {/* Date Inputs - Simple HTML inputs */}
                <div className="w-full space-y-3">
                    <div className="w-full space-y-1">
                        <label className='text-[#698592] text-[12px]'>Leave From <span className='text-red-800'>*</span></label>
                        <input
                            className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none'
                            type='date'
                            value={startDate || ''}
                            onChange={(e) => {
                                const newDate = e.target.value;
                                setStartDate(newDate);
                            }}
                            required
                        />
                    </div>

                    <div className="w-full space-y-1">
                        <label className='text-[#698592] text-[12px]'>Leave Upto  <span className='text-red-800'>*</span></label>
                        <input
                            className='w-full text-[#333333] text-[12px] rounded-md py-[8px] px-[17px] border border-gray-500 outline-none'
                            type='date'
                            value={endDate || ''}
                            onChange={(e) => {
                                const newDate = e.target.value;

                                // Validation: End date cannot be before start date
                                if (startDate && newDate && newDate < startDate) {
                                    showToast('End date cannot be before start date. Same day leave is allowed.', 'error');
                                    return;
                                }

                                setEndDate(newDate);
                            }}
                            min={startDate}
                            required
                        />
                    </div>
                </div>

                {/* Generated Leave Days Section */}
                {leaveDays.length > 0 && (
                    <div className="w-full space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">Leave Days</h4>
                        {leaveDays.map((day) => (
                            <div key={day.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
                                {/* Date Display */}
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                                    <input
                                        type="text"
                                        value={day.date}
                                        readOnly
                                        className="w-full h-9 px-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700 text-sm"
                                    />
                                </div>

                                {/* Leave Type Dropdown */}
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Adjust In</label>
                                    <select
                                        value={day.leaveType}
                                        onChange={(e) => handleLeaveTypeChange(day.id, e.target.value)}
                                        className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    >
                                        {leaveTypeOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Half Day Checkbox */}
                                <div className="flex items-center gap-2">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Half Day</label>
                                    <input
                                        type="checkbox"
                                        checked={day.isHalfDay}
                                        onChange={(e) => handleHalfDayChange(day.id, e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Buttons Section */}
                <div className="w-full flex justify-end gap-3 pt-4">
                    <button
                        onClick={generateLeaveDays}
                        className="bg-blue-500 text-white text-sm py-2 px-6 rounded-md hover:bg-blue-600 font-medium"
                        type="button"
                    >
                        Adjust In
                    </button>
                    <Button
                        color="blue"
                        type="submit"
                        disabled={isUploading}
                        className="px-6 py-2 rounded-lg font-medium text-sm"
                    >
                        {isUploading ? 'Submitting...' : 'Submit'}
                    </Button>
                </div>


            </form>
        </div>
    );
};



export { LeaveApplicationDrawerContent };
export default useNewApplication
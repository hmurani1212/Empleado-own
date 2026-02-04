import React, { useState, useEffect } from 'react';
import { Button } from '@material-tailwind/react';
import { FaClock, FaCalendarAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import CustomDialog from '../../Components/CustomDialog/CustomDialog';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { validateAcceptanceConfirmation } from '../../Validation/Validation';

const AcceptanceConfirmationModal = ({ 
  openDialog, 
  handleOpenDialog, 
  applicantData = null,
  vacancyId = null,
  onSend,
  ///populateData,
  ///get_applicants_data,
  onClose 
}) => {
  const [candidateData, setCandidateData] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showResponseDatePicker, setShowResponseDatePicker] = useState(false);



  ///console.log('Applicant Data in Modal:', get_applicants_data);
  
  const [formData, setFormData] = useState({
    position: "",
    positionType: "", 
    timePosition: "",
    department: "",
    salary: "",
    benefits: "Benefits",
    vacationDays: "5",
    startDate: "",
    responseDate: "",
    email: "hr@veevotech.com",
    phone: ""
  });

  // Update form data when applicant data is passed through props
  useEffect(() => {
    if (applicantData && openDialog) {
      const candidate = applicantData.candidate;
      const vacancy = applicantData.vacancy;
      
      console.log('AcceptanceConfirmationModal - Applicant data from props:', {
        candidateName: candidate?.name,
        vacancyTitle: vacancy?.title,
        candidateEmail: candidate?.email,
        candidatePhone: candidate?.cellnum,
        applicantData: applicantData
      });
      
      setCandidateData(applicantData);
      
      setFormData(prev => ({
        ...prev,
        position: vacancy?.title || "",
        positionType: vacancy?.title || "",
        timePosition: applicantData.interview_time ? formatTimestampToTime(applicantData.interview_time) : "",
        department: vacancy?.title || "",
        salary: "25000", // Default salary, can be made configurable
        phone: candidate?.cellnum || "",
        email: candidate?.email || "hr@veevotech.com"
      }));
    }
  }, [applicantData, openDialog]);

  // No need for API call since data is passed through props

  const formatTimestampToTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (date) => {
    if (!date) return '';
    if (typeof date === 'string') {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTimeChange = (time) => {
    setFormData(prev => ({
      ...prev,
      timePosition: time
    }));
    setShowTimePicker(false);
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: formatDateForInput(date)
    }));
    if (field === 'startDate') {
      setShowStartDatePicker(false);
    } else if (field === 'responseDate') {
      setShowResponseDatePicker(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
  };

  // Validation function for acceptance confirmation form
  const validateFormData = async (data) => {
    try {
      await validateAcceptanceConfirmation.validate(data, { abortEarly: false });
      return true;
    } catch (error) {
      // Show toast for the first validation error
      const firstError = error.inner[0];
      let toastMessage = '';
      
      switch (firstError.path) {
        case 'position':
          toastMessage = 'Enter the position';
          break;
        case 'positionType':
          toastMessage = 'Enter the position type';
          break;
        case 'startDate':
          toastMessage = 'Enter the start date';
          break;
        case 'email':
          toastMessage = 'Please enter supportive email';
          break;
        case 'phone':
          toastMessage = 'Enter the phone number';
          break;
        default:
          toastMessage = firstError.message;
      }
      
      // Show toast notification
      const { showToast } = await import('../../Components/Toaster/Toaster');
      showToast(toastMessage, 'error');
      
      return false;
    }
  };

  // Close pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showTimePicker || showStartDatePicker || showResponseDatePicker) {
        const target = event.target;
        if (!target.closest('.time-picker-container') && 
            !target.closest('.date-picker-container')) {
          setShowTimePicker(false);
          setShowStartDatePicker(false);
          setShowResponseDatePicker(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTimePicker, showStartDatePicker, showResponseDatePicker]);

  const handleSend = async () => {
    // Validate form data before sending
    const isValid = await validateFormData(formData);
    if (!isValid) {
      // Don't show toast, just return to let field-specific errors show
      return;
    }

    if (onSend) {
      onSend({
        ...formData,
        candidateData: candidateData
      });
    }
    handleOpenDialog();
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
    handleOpenDialog();
  };


  return (
    <CustomDialog
      openDialog={openDialog}
      handleOpenDialog={handleOpenDialog}
      handleOpen={handleClose}
      title="Accepted"
      size="h-[90vh] w-[50vw]"
      showBtns={false}
      footer={false}
      compo={
        <div className="p-6 min-h-[720px] overflow-hidden">
          <div className="space-y-4">
            <p className="text-gray-700">
              Dear <span className="font-semibold">{candidateData?.candidate?.name || applicantData?.candidate?.name || "Candidate"}</span>
            </p>
            
            <p className="text-gray-700">
              We were all very excited to meet and get to know you over the past few days. 
              We have been impressed with your background and would like to formally offer you the position of
            </p>

             <div className="mb-5">
               <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Position</label>
               <input
                 type="text"
                 value={formData.position}
                 onChange={(e) => handleInputChange('position', e.target.value)}
                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                 placeholder="Position"
               />
             </div>

             <div className="mb-5">
               <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Position Type</label>
               <input
                 type="text"
                 value={formData.positionType}
                 onChange={(e) => handleInputChange('positionType', e.target.value)}
                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                 placeholder="Position Type"
               />
             </div>

             <div className="mb-5">
               <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Time Position</label>
               <div className="relative">
                 <input
                   type="text"
                   value={formData.timePosition}
                   onClick={() => setShowTimePicker(!showTimePicker)}
                   readOnly
                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 cursor-pointer"
                   placeholder="Click to select time"
                 />
                 <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => setShowTimePicker(!showTimePicker)} />
                 
                 {showTimePicker && (
                   <div className="time-picker-container absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 max-h-80 overflow-y-auto">
                     <div className="grid grid-cols-3 gap-2">
                       {[
                         '12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM', '2:30 AM',
                         '3:00 AM', '3:30 AM', '4:00 AM', '4:30 AM', '5:00 AM', '5:30 AM',
                         '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '8:30 AM',
                         '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
                         '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
                         '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
                         '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM',
                         '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'
                       ].map((time) => (
                         <button
                           key={time}
                           type="button"
                           onClick={() => handleTimeChange(time)}
                           className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                         >
                           {time}
                         </button>
                       ))}
                     </div>
                     <div className="mt-3 flex justify-end">
                       <button
                         type="button"
                         onClick={() => setShowTimePicker(false)}
                         className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                       >
                         Cancel
                       </button>
                     </div>
                   </div>
                 )}
               </div>
             </div>

             <div className="mb-5">
               <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Department</label>
               <input
                 type="text"
                 value={formData.department}
                 onChange={(e) => handleInputChange('department', e.target.value)}
                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                 placeholder="Department"
               />
             </div>

             <div className="mb-5">
               <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Annual Salary</label>
               <input
                 type="number"
                 value={formData.salary}
                 onChange={(e) => handleInputChange('salary', e.target.value)}
                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                 placeholder="25000"
               />
             </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Benefits</label>
              <select
                value={formData.benefits}
                onChange={(e) => handleInputChange('benefits', e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option value="Benefits">Benefits</option>
                <option value="Health Insurance">Health Insurance</option>
                <option value="Dental">Dental</option>
                <option value="Vision">Vision</option>
              </select>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Vacation Days</label>
              <input
                type="number"
                value={formData.vacationDays}
                onChange={(e) => handleInputChange('vacationDays', e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="5"
              />
            </div>

             <div className="mb-5">
               <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Start Date</label>
               <div className="relative">
                 <input
                   type="text"
                   value={formData.startDate ? formatDateForDisplay(formData.startDate) : ''}
                   onClick={() => setShowStartDatePicker(!showStartDatePicker)}
                   readOnly
                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 cursor-pointer"
                   placeholder="Click to select start date"
                 />
                 <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => setShowStartDatePicker(!showStartDatePicker)} />
                 
                 {showStartDatePicker && (
                   <div className="date-picker-container absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
                     <DayPicker
                       mode="single"
                       selected={formData.startDate ? new Date(formData.startDate) : undefined}
                       onSelect={(date) => handleDateChange(date, 'startDate')}
                       className="rdp"
                     />
                     <div className="mt-3 flex justify-end">
                       <button
                         type="button"
                         onClick={() => setShowStartDatePicker(false)}
                         className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                       >
                         Cancel
                       </button>
                     </div>
                   </div>
                 )}
               </div>
             </div>

             <div className="mb-5">
               <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Response Date</label>
               <div className="relative">
                 <input
                   type="text"
                   value={formData.responseDate ? formatDateForDisplay(formData.responseDate) : ''}
                   onClick={() => setShowResponseDatePicker(!showResponseDatePicker)}
                   readOnly
                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 cursor-pointer"
                   placeholder="Click to select response date"
                 />
                 <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => setShowResponseDatePicker(!showResponseDatePicker)} />
                 
                 {showResponseDatePicker && (
                   <div className="date-picker-container absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
                     <DayPicker
                       mode="single"
                       selected={formData.responseDate ? new Date(formData.responseDate) : undefined}
                       onSelect={(date) => handleDateChange(date, 'responseDate')}
                       className="rdp"
                     />
                     <div className="mt-3 flex justify-end">
                       <button
                         type="button"
                         onClick={() => setShowResponseDatePicker(false)}
                         className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                       >
                         Cancel
                       </button>
                     </div>
                   </div>
                 )}
               </div>
             </div>

             <div className="mb-5">
               <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
               <div className="relative">
                 <input
                   type="email"
                   value={formData.email}
                   onChange={(e) => handleInputChange('email', e.target.value)}
                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder="hr@veevotech.com"
                 />
                 <FaEnvelope className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
               </div>
             </div>

             <div className="mb-5">
               <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone</label>
               <div className="relative">
                 <input
                   type="tel"
                   value={formData.phone}
                   onChange={(e) => handleInputChange('phone', e.target.value)}
                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder="0304-11833"
                 />
                 <FaPhone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
               </div>
             </div>

            <p className="text-gray-700 mt-4">Best regards,</p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outlined"
              color="red"
              onClick={handleClose}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={handleSend}
              className="px-6"
              disabled={!candidateData && !applicantData}
            >
              Send
            </Button>
          </div>
        </div>
      }
    />
  );
};

export default AcceptanceConfirmationModal;

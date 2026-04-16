import React, { useState, useEffect } from 'react';
import { Button } from '@material-tailwind/react';
import { FaClock, FaCalendarAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import CustomDialog from '../../Components/CustomDialog/CustomDialog';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { validateShortlistTemplate } from '../../Validation/Validation';

const ShortlistTemplateModal = ({
  openDialog,
  handleOpenDialog,
  applicantData = null,
  onSend,
  onClose
}) => {
  const [candidateData, setCandidateData] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [formData, setFormData] = useState({
    candidateName: "",
    position: "",
    interviewDate: "",
    startTime: "",
    endTime: "",
    details: "",
    address: "",
    email: "hr@veevotech.com",
    phone: "03047949332"
  });

  // Update form data when applicant data is passed through props
  useEffect(() => {
    if (applicantData && openDialog) {
      const candidate = applicantData.candidate;
      const vacancy = applicantData.vacancy;

      console.log('ShortlistTemplateModal - Applicant data from props:', {
        candidateName: candidate?.name,
        vacancyTitle: vacancy?.title,
        candidateEmail: candidate?.email,
        candidatePhone: candidate?.cellnum,
        applicantData: applicantData
      });

      setCandidateData(applicantData);

      setFormData(prev => ({
        ...prev,
        candidateName: candidate?.name || "",
        position: vacancy?.title || "",
        interviewDate: applicantData.interviewTime ? formatTimestampToDate(applicantData.interviewTime) : "",
        startTime: applicantData.interviewTime ? formatTimestampToTime(applicantData.interviewTime) : "",
        endTime: applicantData.interviewTime ? formatTimestampToEndTime(applicantData.interviewTime) : "",
        details: applicantData.comment || "",
        address: "Office Address", // Default address, can be made configurable
        email: candidate?.email || "hr@veevotech.com",
        phone: candidate?.cellnum || "03047949332"
      }));
    }
  }, [applicantData, openDialog]);

  const formatTimestampToDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toISOString().split('T')[0];
  };

  const formatTimestampToTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimestampToEndTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    // Add 1 hour to start time for end time
    date.setHours(date.getHours() + 1);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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

  const handleTimeChange = (time, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: time
    }));
    if (field === 'startTime') {
      setShowStartTimePicker(false);
    } else if (field === 'endTime') {
      setShowEndTimePicker(false);
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      interviewDate: formatDateForInput(date)
    }));
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

  };

  // Validation function for shortlist template form
  const validateFormData = async (data) => {
    try {
      await validateShortlistTemplate.validate(data, { abortEarly: false });
      return true;
    } catch (error) {
      // Show toast for the first validation error
      const firstError = error.inner[0];
      let toastMessage = '';
      
      switch (firstError.path) {
        case 'position':
          toastMessage = 'Enter the position';
          break;
        case 'interviewDate':
          toastMessage = 'Enter the interview date';
          break;
        case 'startTime':
          toastMessage = 'Enter the start time';
          break;
        case 'endTime':
          toastMessage = 'Enter the end time';
          break;
        case 'details':
          toastMessage = 'Enter the details';
          break;
        case 'address':
          toastMessage = 'Enter the address';
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
      if (showTimePicker || showStartTimePicker || showEndTimePicker) {
        const target = event.target;
        if (!target.closest('.time-picker-container') &&
          !target.closest('.date-picker-container')) {
          setShowTimePicker(false);
          setShowStartTimePicker(false);
          setShowEndTimePicker(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTimePicker, showStartTimePicker, showEndTimePicker]);

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
      title="Shortlist Template"
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
              You've been shortlisted for the position of
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

            <p className="text-gray-700">
              Your interview would be commenced on
            </p>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Interview Date</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.interviewDate ? formatDateForDisplay(formData.interviewDate) : ''}
                  onClick={() => setShowTimePicker(!showTimePicker)}
                  readOnly
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 cursor-pointer"
                  placeholder="Click to select interview date"
                />
                <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => setShowTimePicker(!showTimePicker)} />

                {showTimePicker && (
                  <div className="date-picker-container absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
                    <DayPicker
                      mode="single"
                      selected={formData.interviewDate ? new Date(formData.interviewDate) : undefined}
                      onSelect={handleDateChange}
                      className="rdp"
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowTimePicker(false)}
                        className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 mb-5">
              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Start Time</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.startTime}
                    onClick={() => setShowStartTimePicker(!showStartTimePicker)}
                    readOnly
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 cursor-pointer"
                    placeholder="Click to select time"
                  />
                  <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => setShowStartTimePicker(!showStartTimePicker)} />

                  {showStartTimePicker && (
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
                            onClick={() => handleTimeChange(time, 'startTime')}
                            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowStartTimePicker(false)}
                          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-end mb-2">
                <span className="text-gray-700">to</span>
              </div>

              <div className="flex-1">
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">End Time</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.endTime}
                    onClick={() => setShowEndTimePicker(!showEndTimePicker)}
                    readOnly
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 cursor-pointer"
                    placeholder="Click to select time"
                  />
                  <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => setShowEndTimePicker(!showEndTimePicker)} />

                  {showEndTimePicker && (
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
                            onClick={() => handleTimeChange(time, 'endTime')}
                            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-blue-50 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowEndTimePicker(false)}
                          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Details</label>
              <textarea
                value={formData.details}
                onChange={(e) => handleInputChange('details', e.target.value)}
                rows={4}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Interview details and instructions"
              />
            </div>

            <div className="mb-5">
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Interview location address"
              />
            </div>

            <p className="text-gray-700">
              If you have any concerns, feel free to engage with us over this email{" "}
              {/* <span className="font-semibold">{formData.email}</span> or call us at{" "}
              <span className="font-semibold">{formData.phone}</span>. */}
            </p>

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
            or Call us on this number
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

            <p className="text-gray-700 mt-4">Kind regards, HR</p>
            {/* <p className="text-gray-700">HR</p> */}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outlined"
              color="red"
              onClick={handleClose}
              className="px-6 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              color="blue"
              onClick={handleSend}
              className="px-6 cursor-pointer"
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

export default ShortlistTemplateModal;

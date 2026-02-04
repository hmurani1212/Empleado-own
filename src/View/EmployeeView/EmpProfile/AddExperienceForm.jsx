import React, { useState } from 'react';
import { Typography, Input, Textarea, Button } from '@material-tailwind/react';
import useEmpProfileServices from '../../../ViewModel/EmpViewModel/EmpProfileViewModel/EmpProfileServices';

const AddExperienceForm = ({ onSubmit, onCancel }) => {
  // Use ViewModel
  const { isSubmittingExperience, addExperienceInfo } = useEmpProfileServices();
  
  const [formData, setFormData] = useState({
    organizationName: '',
    designation: '',
    fromDate: '',
    toDate: '',
    salary: '',
    reasonForLeaving: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Sequential validation - check fields in order and stop at first error
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = 'Organization/Institute Name is required';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.fromDate) {
      newErrors.fromDate = 'From date is required';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.toDate) {
      newErrors.toDate = 'To date is required';
      setErrors(newErrors);
      return false;
    }
    
    // Validate date range
    if (formData.fromDate && formData.toDate) {
      const fromDate = new Date(formData.fromDate);
      const toDate = new Date(formData.toDate);
      if (fromDate >= toDate) {
        newErrors.toDate = 'To date must be after from date';
        setErrors(newErrors);
        return false;
      }
    }
    
    if (!formData.salary) {
      newErrors.salary = 'Salary is required';
      setErrors(newErrors);
      return false;
    }
    
    // Validate salary is a number
    if (formData.salary && isNaN(formData.salary)) {
      newErrors.salary = 'Salary must be a number';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.reasonForLeaving.trim()) {
      newErrors.reasonForLeaving = 'Reason for leaving is required';
      setErrors(newErrors);
      return false;
    }
    
    // If all validations pass, clear errors
    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Call ViewModel function
    const result = await addExperienceInfo(formData);
    
    if (result.success) {
      // Clear form after successful submission
      setFormData({
        organizationName: '',
        designation: '',
        fromDate: '',
        toDate: '',
        salary: '',
        reasonForLeaving: ''
      });
      
      // Clear any existing errors
      setErrors({});
      
      onSubmit(formData); // Call parent callback
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Organization/Institute Name */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Org/Institute Name *
          </Typography>
          <Input
            type="text"
            value={formData.organizationName}
            onChange={(e) => handleInputChange('organizationName', e.target.value)}
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "hidden",
            }}
            placeholder="Enter organization or institute name"
          />
          {errors.organizationName && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.organizationName}
            </Typography>
          )}
        </div>

        {/* Designation */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Designation *
          </Typography>
          <Input
            type="text"
            value={formData.designation}
            onChange={(e) => handleInputChange('designation', e.target.value)}
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "hidden",
            }}
            placeholder="Enter designation"
          />
          {errors.designation && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.designation}
            </Typography>
          )}
        </div>

        {/* Date Range: From and To */}
        <div className="grid grid-cols-2 gap-4">
          {/* From Date */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              From *
            </Typography>
            <Input
              type="date"
              value={formData.fromDate}
              onChange={(e) => handleInputChange('fromDate', e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "hidden",
              }}
            />
            {errors.fromDate && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.fromDate}
              </Typography>
            )}
          </div>

          {/* To Date */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              To *
            </Typography>
            <Input
              type="date"
              value={formData.toDate}
              onChange={(e) => handleInputChange('toDate', e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "hidden",
              }}
            />
            {errors.toDate && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.toDate}
              </Typography>
            )}
          </div>
        </div>

        {/* Salary */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Salary *
          </Typography>
          <Input
            type="number"
            step="0.01"
            value={formData.salary}
            onChange={(e) => handleInputChange('salary', e.target.value)}
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "hidden",
            }}
            placeholder="Enter salary amount"
          />
          {errors.salary && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.salary}
            </Typography>
          )}
        </div>

        {/* Reason for Leaving */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Reason of Leaving *
          </Typography>
          <Textarea
            value={formData.reasonForLeaving}
            onChange={(e) => handleInputChange('reasonForLeaving', e.target.value)}
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "hidden",
            }}
            placeholder="Enter reason for leaving"
            rows={3}
          />
          {errors.reasonForLeaving && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.reasonForLeaving}
            </Typography>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmittingExperience}
          >
            {isSubmittingExperience ? 'Adding Experience...' : 'Add Experience'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddExperienceForm;

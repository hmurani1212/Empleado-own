import React, { useState } from 'react';
import { Typography, Input, Textarea, Button } from '@material-tailwind/react';
import CustomSelect from '../../../Components/CustomSelect/CustomSelect';
import useEmpProfileServices from '../../../ViewModel/EmpViewModel/EmpProfileViewModel/EmpProfileServices';

const AddLicenseForm = ({ onSubmit, onCancel }) => {
  // Use ViewModel
  const { isSubmittingLicense, addLicenseInfo } = useEmpProfileServices();
  
  const [formData, setFormData] = useState({
    licenseTitle: '',
    licenseType: '',
    licenseNumber: '',
    issuingAuthorityDetail: '',
    issueDate: '',
    expiryDate: ''
  });

  const [errors, setErrors] = useState({});

  // Sample license types - these will be replaced with API data later
  const licenseTypeOptions = [
    { label: 'Driving License', value: 'driving_license' },
    { label: 'Professional License', value: 'professional_license' },
    { label: 'Medical License', value: 'medical_license' },
    { label: 'Teaching License', value: 'teaching_license' },
    { label: 'Business License', value: 'business_license' }
  ];

  const handleInputChange = (field, value) => {
    // For CustomSelect, extract the value from the selected option
    const actualValue = value && typeof value === 'object' ? value.value : value;
    
    setFormData(prev => ({
      ...prev,
      [field]: actualValue
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
    if (!formData.licenseTitle.trim()) {
      newErrors.licenseTitle = 'License Title is required';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.licenseType) {
      newErrors.licenseType = 'License Type is required';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License Number is required';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.issuingAuthorityDetail.trim()) {
      newErrors.issuingAuthorityDetail = 'Issuing Authority Detail is required';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.issueDate) {
      newErrors.issueDate = 'Issue Date is required';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry Date is required';
      setErrors(newErrors);
      return false;
    }
    
    // Validate date range
    if (formData.issueDate && formData.expiryDate) {
      const issueDate = new Date(formData.issueDate);
      const expiryDate = new Date(formData.expiryDate);
      if (issueDate >= expiryDate) {
        newErrors.expiryDate = 'Expiry date must be after issue date';
        setErrors(newErrors);
        return false;
      }
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
    const result = await addLicenseInfo(formData);
    
    if (result.success) {
      // Clear form after successful submission
      setFormData({
        licenseTitle: '',
        licenseType: '',
        licenseNumber: '',
        issuingAuthorityDetail: '',
        issueDate: '',
        expiryDate: ''
      });
      
      // Clear any existing errors
      setErrors({});
      
      onSubmit(formData); // Call parent callback
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* License Title */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            License Title *
          </Typography>
          <Input
            type="text"
            value={formData.licenseTitle}
            onChange={(e) => handleInputChange('licenseTitle', e.target.value)}
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "hidden",
            }}
            placeholder="Enter license title"
          />
          {errors.licenseTitle && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.licenseTitle}
            </Typography>
          )}
        </div>

        {/* License Type */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            License Type *
          </Typography>
          <CustomSelect
            value={licenseTypeOptions.find(option => option.value === formData.licenseType) || null}
            onChangeHandler={(value) => handleInputChange('licenseType', value)}
            options={licenseTypeOptions}
            placeHolderTitle="Select license type"
          />
          {errors.licenseType && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.licenseType}
            </Typography>
          )}
        </div>

        {/* License Number */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            License Number *
          </Typography>
          <Input
            type="text"
            value={formData.licenseNumber}
            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "hidden",
            }}
            placeholder="Enter license number"
          />
          {errors.licenseNumber && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.licenseNumber}
            </Typography>
          )}
        </div>

        {/* Issuing Authority Detail */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Issuing Authority Detail *
          </Typography>
          <Textarea
            value={formData.issuingAuthorityDetail}
            onChange={(e) => handleInputChange('issuingAuthorityDetail', e.target.value)}
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "hidden",
            }}
            placeholder="Enter issuing authority details"
            rows={3}
          />
          {errors.issuingAuthorityDetail && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.issuingAuthorityDetail}
            </Typography>
          )}
        </div>

        {/* Date Range: Issue Date and Expiry Date */}
        <div className="grid grid-cols-2 gap-4">
          {/* Issue Date */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Issue Date *
            </Typography>
            <Input
              type="date"
              value={formData.issueDate}
              onChange={(e) => handleInputChange('issueDate', e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "hidden",
              }}
            />
            {errors.issueDate && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.issueDate}
              </Typography>
            )}
          </div>

          {/* Expiry Date */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Expiry Date *
            </Typography>
            <Input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "hidden",
              }}
            />
            {errors.expiryDate && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.expiryDate}
              </Typography>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmittingLicense}
          >
            {isSubmittingLicense ? 'Adding License...' : 'Add License'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddLicenseForm;

import React, { useState } from 'react';
import { Typography, Input, Button } from '@material-tailwind/react';
import useEmpProfileServices from '../../../ViewModel/EmpViewModel/EmpProfileViewModel/EmpProfileServices';

const AddDocumentForm = ({ onSubmit, onCancel }) => {
  // Use ViewModel
  const { isSubmittingDocument, addDocumentInfo } = useEmpProfileServices();
  
  const [formData, setFormData] = useState({
    documentTitle: '',
    file: null
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      file: file
    }));
    
    // Clear file error when user selects a file
    if (errors.file) {
      setErrors(prev => ({
        ...prev,
        file: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Sequential validation - check fields in order and stop at first error
    if (!formData.documentTitle.trim()) {
      newErrors.documentTitle = 'Document Title is required';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.file) {
      newErrors.file = 'File is required';
      setErrors(newErrors);
      return false;
    }
    
    // Validate file size (optional - e.g., max 10MB)
    if (formData.file && formData.file.size > 10 * 1024 * 1024) {
      newErrors.file = 'File size must be less than 10MB';
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
    const result = await addDocumentInfo(formData);
    
    if (result.success) {
      // Clear form after successful submission
      setFormData({
        documentTitle: '',
        file: null
      });
      
      // Clear file input
      const fileInput = document.getElementById('document-file-input');
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Clear any existing errors
      setErrors({});
      
      onSubmit(formData); // Call parent callback
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Title */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Document Title *
          </Typography>
          <Input
            type="text"
            value={formData.documentTitle}
            onChange={(e) => handleInputChange('documentTitle', e.target.value)}
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "hidden",
            }}
            placeholder="Max 50 Character"
            maxLength={50}
          />
          {errors.documentTitle && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.documentTitle}
            </Typography>
          )}
        </div>

        {/* File Upload */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            File *
          </Typography>
          <div className="relative">
            <input
              id="document-file-input"
              type="file"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
              <div className="flex flex-col items-center space-y-2">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="text-sm text-gray-600">
                  {formData.file ? (
                    <span className="text-green-600 font-medium">{formData.file.name}</span>
                  ) : (
                    <>
                      <span className="text-blue-600 font-medium cursor-pointer">Choose file</span>
                      <span className="text-gray-500"> or drag and drop</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  PDF, DOC, DOCX, JPG, PNG, GIF, TXT (Max 10MB)
                </div>
              </div>
            </div>
          </div>
          {errors.file && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.file}
            </Typography>
          )}
        </div>

        {/* File Info Display */}
        {formData.file && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="small" className="font-medium text-gray-700">
                  Selected File:
                </Typography>
                <Typography variant="small" className="text-gray-600">
                  {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, file: null }));
                  const fileInput = document.getElementById('document-file-input');
                  if (fileInput) fileInput.value = '';
                }}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmittingDocument}
          >
            {isSubmittingDocument ? 'Adding Document...' : 'Add Document'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddDocumentForm;

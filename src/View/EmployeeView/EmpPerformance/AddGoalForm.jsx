import React, { useState, useEffect } from 'react';
import { Typography, Input, Textarea, Button } from '@material-tailwind/react';
import CustomSelect from '../../../Components/CustomSelect/CustomSelect';
import Emp_Performence from '../../../Model/Data/EmpData/EmpPerfemence/EmpPerfemenec';
import { updateEmployeeGoal } from '../../../ViewModel/EmpViewModel/EmpPerformanceViewModel/EmpPerformance';
import { toast } from 'react-toastify';

const AddGoalForm = ({ onSubmit, onCancel, reviewCycles, selectedCycle, editData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    goalName: '',
    dueDate: '',
    priority: '',
    description: '',
    review_cycle: selectedCycle?.value || ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to convert Unix timestamp to date string
  const convertUnixToDate = (timestamp) => {
    if (!timestamp) return '';
    // If it's already a string, return as is
    if (typeof timestamp === 'string') {
      return timestamp.includes('T') ? timestamp.split('T')[0] : timestamp;
    }
    // If it's a Unix timestamp (number), convert it
    if (typeof timestamp === 'number') {
      const date = new Date(timestamp * 1000); // Convert to milliseconds
      return date.toISOString().split('T')[0];
    }
    return '';
  };

  // Populate form data when in edit mode
  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        startDate: convertUnixToDate(editData.startDate || editData.start_date),
        goalName: editData.name || editData.title || '',
        dueDate: convertUnixToDate(editData.endDate || editData.end_date),
        priority: editData.priority || '',
        description: editData.descriptions || editData.description || '',
        review_cycle: editData.review_cycle || selectedCycle?.value || ''
      });
    }
  }, [isEdit, editData, selectedCycle]);

  const priorityOptions = [
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' }
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
    
    if (!formData.goalName.trim()) {
      newErrors.goalName = 'Goal name is required';
    }
    
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!isEdit && !formData.review_cycle) {
      newErrors.review_cycle = 'Review cycle is required';
    }
    
    // Validate date range
    if (formData.startDate && formData.dueDate) {
      const startDate = new Date(formData.startDate);
      const dueDate = new Date(formData.dueDate);
      if (startDate >= dueDate) {
        newErrors.dueDate = 'Due date must be after start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (isEdit && editData) {
        // Update existing goal
        const payload = {
          goal_id: editData._id,
          name: formData.goalName,
          startDate: formData.startDate,
          endDate: formData.dueDate,
          descriptions: formData.description,
          priority: formData.priority
        };
        
        const response = await updateEmployeeGoal(payload);
        
        if (response && response.STATUS === 'SUCCESSFUL') {
          ////toast.success('Goal updated successfully!');
          onSubmit(payload); // Call parent callback
        } else {
          toast.error('Failed to update goal');
        }
      } else {
        // Create new goal
        const payload = {
          name: formData.goalName,
          review_cycle: formData.review_cycle,
          startDate: formData.startDate,
          endDate: formData.dueDate,
          descriptions: formData.description,
          priority: formData.priority
        };
        
        const response = await Emp_Performence.createGoal(payload);
        
        if (response.data && response.data.STATUS === 'SUCCESSFUL') {
          toast.success('Goal created successfully!');
          // Clear form after successful submission
          setFormData({
            startDate: '',
            goalName: '',
            dueDate: '',
            priority: '',
            description: '',
            review_cycle: selectedCycle?.value || ''
          });
          // Clear any existing errors
          setErrors({});
          onSubmit(payload); // Call parent callback
        } else {
          toast.error(response.data?.MESSAGE || 'Failed to create goal');
        }
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} goal:`, error);
      toast.error(error.response?.data?.MESSAGE || `Failed to ${isEdit ? 'update' : 'create'} goal. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Review Cycle - Only show for create mode */}
        {!isEdit && (
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Review Cycle *
            </Typography>
            <CustomSelect
              value={reviewCycles?.find(option => option.value === formData.review_cycle) || null}
              onChangeHandler={(value) => handleInputChange('review_cycle', value)}
              options={reviewCycles || []}
              placeHolderTitle="Select review cycle"
              error={errors.review_cycle}
            />
            {errors.review_cycle && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.review_cycle}
              </Typography>
            )}
          </div>
        )}

        {/* Start Date */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Start Date *
          </Typography>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => handleInputChange('startDate', e.target.value)}
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "hidden",
            }}
            error={errors.startDate}
          />
          {errors.startDate && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.startDate}
            </Typography>
          )}
        </div>

        {/* Goal Name */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Goal Name *
          </Typography>
          <Input
            type="text"
            value={formData.goalName}
            onChange={(e) => handleInputChange('goalName', e.target.value)}
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "hidden",
            }}
            placeholder="Enter goal name"
            error={errors.goalName}
          />
          {errors.goalName && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.goalName}
            </Typography>
          )}
        </div>

        {/* Due Date */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Due Date *
          </Typography>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "hidden",
            }}
            error={errors.dueDate}
          />
          {errors.dueDate && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.dueDate}
            </Typography>
          )}
        </div>

        {/* Priority */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Priority *
          </Typography>
          <CustomSelect
            value={priorityOptions.find(option => option.value === formData.priority) || null}
            onChangeHandler={(value) => handleInputChange('priority', value)}
            options={priorityOptions}
            placeHolderTitle="Select priority"
            error={errors.priority}
          />
          {errors.priority && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.priority}
            </Typography>
          )}
        </div>

        {/* Description */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Description *
          </Typography>
          <Textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "hidden",
            }}
            placeholder="Enter goal description"
            rows={4}
            error={errors.description}
          />
          {errors.description && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.description}
            </Typography>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Goal' : 'Create Goal')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddGoalForm;

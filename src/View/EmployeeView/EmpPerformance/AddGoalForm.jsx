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
  
  // Store the selected review cycle option to access both value and label
  const [selectedReviewCycleOption, setSelectedReviewCycleOption] = useState(selectedCycle || null);
  
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
    } else if (!isEdit && selectedCycle) {
      // Set the selected review cycle option when not in edit mode
      setSelectedReviewCycleOption(selectedCycle);
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
        // Get the review cycle name (label) - MUST be name, not ID
        console.log('=== GOAL CREATION DEBUG ===');
        console.log('Selected review cycle option:', selectedReviewCycleOption);
        console.log('Form data review_cycle (ID):', formData.review_cycle);
        console.log('Available review cycles:', reviewCycles);
        console.log('Selected cycle prop:', selectedCycle);
        
        let reviewCycleName = null;
        
        // Priority 1: Get from stored selected option
        if (selectedReviewCycleOption?.label) {
          reviewCycleName = selectedReviewCycleOption.label;
          console.log('Using name from selectedReviewCycleOption:', reviewCycleName);
        } 
        // Priority 2: Get from selectedCycle prop if it matches
        else if (selectedCycle?.value === formData.review_cycle && selectedCycle?.label) {
          reviewCycleName = selectedCycle.label;
          console.log('Using name from selectedCycle prop:', reviewCycleName);
        }
        // Priority 3: Find it in reviewCycles array by matching the ID
        else if (formData.review_cycle && reviewCycles && Array.isArray(reviewCycles)) {
          const foundCycle = reviewCycles.find(cycle => {
            // Match by value (ID)
            return cycle.value === formData.review_cycle || 
                   cycle.value?.toString() === formData.review_cycle?.toString();
          });
          
          if (foundCycle?.label) {
            reviewCycleName = foundCycle.label;
            console.log('Found name in reviewCycles array:', reviewCycleName);
          } else {
            console.warn('Cycle not found in reviewCycles. Searched for:', formData.review_cycle);
            console.warn('Available cycle values:', reviewCycles.map(c => ({ value: c.value, label: c.label })));
          }
        }
        
        // Final validation - ensure we have a name, not a 24-char hex ID (e.g. MongoDB ObjectId)
        const looksLikeId = reviewCycleName && !reviewCycleName.includes(' ') && /^[a-f0-9]{24}$/i.test(reviewCycleName.trim());
        if (!reviewCycleName || looksLikeId) {
          if (looksLikeId) {
            console.error('ERROR: reviewCycleName looks like an ID:', reviewCycleName);
            console.error('This should not happen. Available cycles:', reviewCycles);
          }
          // Try one more time to find it
          if (formData.review_cycle && reviewCycles) {
            const lastAttempt = reviewCycles.find(c => c.value === formData.review_cycle || c.value?.toString() === formData.review_cycle?.toString());
            if (lastAttempt?.label) {
              reviewCycleName = lastAttempt.label;
              console.log('Last attempt successful, using:', reviewCycleName);
            }
          }
        }
        
        // If we still don't have a valid name, show error (allow long names; only reject empty or 24-char hex ID)
        const hasValidName = reviewCycleName && reviewCycleName.trim() && !/^[a-f0-9]{24}$/i.test(reviewCycleName.trim());
        if (!hasValidName) {
          const errorMsg = `Cannot create goal: Review cycle name not found for ID: ${formData.review_cycle}`;
          console.error(errorMsg);
          toast.error('Error: Could not find review cycle name. Please select a review cycle again.');
          setIsSubmitting(false);
          return;
        }
        
        console.log('✅ Final review cycle NAME to send:', reviewCycleName);
        console.log('=== END DEBUG ===');
        
        const payload = {
          name: formData.goalName,
          review_cycle: reviewCycleName, // MUST be name, not ID
          startDate: formData.startDate,
          endDate: formData.dueDate,
          descriptions: formData.description,
          priority: formData.priority
        };
        
        console.log('📤 Goal payload being sent to API:', JSON.stringify(payload, null, 2));
        
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
          // Reset selected review cycle option
          setSelectedReviewCycleOption(selectedCycle || null);
          // Clear any existing errors
          setErrors({});
          onSubmit(payload); // Call parent callback
        } else {
          toast.error(response.data?.ERROR_DESCRIPTION || 'Failed to create goal');
        }
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} goal:`, error);
      toast.error(error.response?.data?.ERROR_DESCRIPTION );
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
              onChangeHandler={(value) => {
                console.log('CustomSelect onChange value:', value);
                
                // CustomSelect returns the full option object {label, value}
                const selectedOption = value && typeof value === 'object' && value.label && value.value 
                  ? value 
                  : reviewCycles?.find(option => option.value === (value?.value || value)) || null;
                
                console.log('Selected option object:', selectedOption);
                
                // Store the full option object to access the label later
                setSelectedReviewCycleOption(selectedOption);
                
                // Then update formData with the value (ID) for validation
                const cycleValue = selectedOption?.value || (value && typeof value === 'object' ? value.value : value);
                handleInputChange('review_cycle', cycleValue);
              }}
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

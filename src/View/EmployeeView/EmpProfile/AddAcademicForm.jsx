import React, { useState, useEffect } from 'react';
import { Typography, Input, Textarea, Button } from '@material-tailwind/react';
import CustomSelect from '../../../Components/CustomSelect/CustomSelect';
import useEmpProfileServices from '../../../ViewModel/EmpViewModel/EmpProfileViewModel/EmpProfileServices';
import useStore from '../../../Store/store';

const AddAcademicForm = ({ onSubmit, onCancel }) => {
  // Use ViewModel
  const { isSubmittingAcademic, addAcademicInfo } = useEmpProfileServices();
  
  // Get degrees from store
  const degrees = useStore((state) => state.degrees);
  const isLoadingDegrees = useStore((state) => state.isLoadingDegrees);
  const getDegrees = useStore((state) => state.getDegrees);
  
  const [formData, setFormData] = useState({
    degree: '',
    passingYear: '',
    degreeTitle: '',
    studyType: 'Regular',
    obtainedMarks: '',
    totalMarks: '',
    grade: '',
    division: '',
    boardUniversity: '',
    remarks: ''
  });

  const [errors, setErrors] = useState({});

  // Fetch degrees on component mount
  useEffect(() => {
    if (degrees.length === 0) {
      getDegrees();
    }
  }, [degrees.length, getDegrees]);

  // Transform degrees from API to select options format
  const degreeOptions = degrees.map(degree => ({
    label: degree.program_name,
    value: String(degree.id)
  }));

  const gradeOptions = [
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' },
    { label: 'D', value: 'D' },
    { label: 'E', value: 'E' },
    { label: 'F', value: 'F' }
  ];

  const divisionOptions = [
    { label: '1st division', value: '1' },
    { label: '2nd division', value: '2' },
    { label: '3rd division', value: '3' }
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
    if (!formData.degree) {
      newErrors.degree = 'Degree is required';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.passingYear) {
      newErrors.passingYear = 'Passing year is required';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.degreeTitle.trim()) {
      newErrors.degreeTitle = 'Degree title/Major subjects is required';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.obtainedMarks) {
      newErrors.obtainedMarks = 'Obtained marks/CGPA is required';
      setErrors(newErrors);
      return false;
    }
    
    // Validate obtained marks is a number
    if (formData.obtainedMarks && isNaN(formData.obtainedMarks)) {
      newErrors.obtainedMarks = 'Obtained marks must be a number';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.totalMarks) {
      newErrors.totalMarks = 'Total marks/GPA is required';
      setErrors(newErrors);
      return false;
    }
    
    // Validate total marks is a number
    if (formData.totalMarks && isNaN(formData.totalMarks)) {
      newErrors.totalMarks = 'Total marks must be a number';
      setErrors(newErrors);
      return false;
    }
    
    // Validate obtained marks <= total marks
    if (formData.obtainedMarks && formData.totalMarks && 
        parseFloat(formData.obtainedMarks) > parseFloat(formData.totalMarks)) {
      newErrors.obtainedMarks = 'Obtained marks cannot be greater than total marks';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.grade) {
      newErrors.grade = 'Grade is required';
      setErrors(newErrors);
      return false;
    }
    
    if (!formData.boardUniversity.trim()) {
      newErrors.boardUniversity = 'Board/University is required';
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
    const result = await addAcademicInfo(formData);
    
    if (result.success) {
      // Clear form after successful submission
      setFormData({
        degree: '',
        passingYear: '',
        degreeTitle: '',
        studyType: 'Regular',
        obtainedMarks: '',
        totalMarks: '',
        grade: '',
        division: '',
        boardUniversity: '',
        remarks: ''
      });
      
      // Clear any existing errors
      setErrors({});
      
      onSubmit(formData); // Call parent callback
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Degree and Passing Year */}
        <div className="grid grid-cols-2 gap-4">
          {/* Degree */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Degree *
            </Typography>
            {isLoadingDegrees ? (
              <div className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5">
                Loading degrees...
              </div>
            ) : (
              <CustomSelect
                value={degreeOptions.find(option => option.value === formData.degree) || null}
                onChangeHandler={(value) => handleInputChange('degree', value)}
                options={degreeOptions}
                placeHolderTitle="Select Degree"
              />
            )}
            {errors.degree && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.degree}
              </Typography>
            )}
          </div>

          {/* Passing Year */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Passing Year *
            </Typography>
            <Input
              type="number"
              value={formData.passingYear}
              onChange={(e) => handleInputChange('passingYear', e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "hidden",
              }}
              placeholder="Enter passing year"
              min="1950"
              max="2030"
            />
            {errors.passingYear && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.passingYear}
              </Typography>
            )}
          </div>
        </div>

        {/* Degree Title/Major Subjects */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Degree Title/Major Subjects *
          </Typography>
          <Input
            type="text"
            value={formData.degreeTitle}
            onChange={(e) => handleInputChange('degreeTitle', e.target.value)}
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "hidden",
            }}
            placeholder="Enter degree title or major subjects"
          />
          {errors.degreeTitle && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.degreeTitle}
            </Typography>
          )}
        </div>

        {/* Study Type */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Study Type
          </Typography>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="studyType"
                value="Regular"
                checked={formData.studyType === 'Regular'}
                onChange={(e) => handleInputChange('studyType', e.target.value)}
                className="mr-2"
              />
              Regular
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="studyType"
                value="Private"
                checked={formData.studyType === 'Private'}
                onChange={(e) => handleInputChange('studyType', e.target.value)}
                className="mr-2"
              />
              Private
            </label>
          </div>
        </div>

        {/* Row 2: Obtained Marks and Total Marks */}
        <div className="grid grid-cols-2 gap-4">
          {/* Obtained Marks/CGPA */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Obtained Marks/CGPA *
            </Typography>
            <Input
              type="number"
              step="0.01"
              value={formData.obtainedMarks}
              onChange={(e) => handleInputChange('obtainedMarks', e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "hidden",
              }}
              placeholder="Enter obtained marks"
            />
            {errors.obtainedMarks && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.obtainedMarks}
              </Typography>
            )}
          </div>

          {/* Total Marks/GPA */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Total Marks/GPA *
            </Typography>
            <Input
              type="number"
              step="0.01"
              value={formData.totalMarks}
              onChange={(e) => handleInputChange('totalMarks', e.target.value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "hidden",
              }}
              placeholder="Enter total marks"
            />
            {errors.totalMarks && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.totalMarks}
              </Typography>
            )}
          </div>
        </div>

        {/* Row 3: Grade and Division */}
        <div className="grid grid-cols-2 gap-4">
          {/* Grade */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Grade *
            </Typography>
            <CustomSelect
              value={gradeOptions.find(option => option.value === formData.grade) || null}
              onChangeHandler={(value) => handleInputChange('grade', value)}
              options={gradeOptions}
              placeHolderTitle="Select Grade"
            />
            {errors.grade && (
              <Typography variant="small" color="red" className="mt-1">
                {errors.grade}
              </Typography>
            )}
          </div>

          {/* Division */}
          <div>
            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
              Division
            </Typography>
            <CustomSelect
              value={divisionOptions.find(option => option.value === formData.division) || null}
              onChangeHandler={(value) => handleInputChange('division', value)}
              options={divisionOptions}
              placeHolderTitle="Select Division"
            />
          </div>
        </div>

        {/* Board/University */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Board/University *
          </Typography>
          <Input
            type="text"
            value={formData.boardUniversity}
            onChange={(e) => handleInputChange('boardUniversity', e.target.value)}
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "hidden",
            }}
            placeholder="Enter board or university name"
          />
          {errors.boardUniversity && (
            <Typography variant="small" color="red" className="mt-1">
              {errors.boardUniversity}
            </Typography>
          )}
        </div>

        {/* Remarks */}
        <div>
          <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
            Remarks
          </Typography>
          <Textarea
            value={formData.remarks}
            onChange={(e) => handleInputChange('remarks', e.target.value)}
            className="!border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "hidden",
            }}
            placeholder="Enter any additional remarks"
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmittingAcademic}
          >
            {isSubmittingAcademic ? 'Adding Academic...' : 'Add Academic'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddAcademicForm;

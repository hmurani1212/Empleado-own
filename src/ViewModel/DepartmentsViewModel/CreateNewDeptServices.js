import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { showToast } from '../../Components/Toaster/Toaster';
import departmentsApi from '../../Model/Data/Departments/Departments';
import useStore from "../../Store/store";
import { validateStepDepartmentForm } from '../../Validation/Validation';

const useCreateNewDeptServices = () => {
  const branchIdset = useStore((state) => state.branchIdset);
  const allDeptDetails = useStore((state) => state.allDeptDetails)
  const allSuggestionsEmp = useStore((state) => state.allSuggestionsEmp)

  const getManageDept = useStore((state) => state.getManageDept)
  const getEmployeesByDeptId = useStore((state) => state.getEmployeesByDeptId)

  // const getEmployeeSuggDept = useStore((state) => state.getEmployeeSuggDept)
  const handleNewDept = useStore((state) => state.handleNewDept)
  const filterDeptSuggestion = useStore((state) => state.filterDeptSuggestion)
  const settingBranchId = useStore((state) => state.settingBranchId)

  const [searchSuggestions, setSearchSuggestions] = useState(false)

  // Don't show suggestions initially - only when user types
  // useEffect removed - searchSuggestions will be controlled by user input only


  
  const [activeStepDept, setActiveStepDept] = useState(0);
  const [isFirstStepDept, setIsFirstStepDept] = useState(true);
  const [isLastStepDept, setIsLastStepDept] = useState(false);
  const navigate = useNavigate()
  const handleStepActive = (step) => {
    // If trying to move to step 1 (Head of Department), check if step 0 is valid
    if (step === 1) {
      if (!isStep0Valid()) {
        return; // Don't allow navigation if validation fails (no error message)
      }
    }
    setActiveStepDept(step)
  }

  // Silent validation for tab clicks (no error messages)
  const isStep0Valid = () => {
    // Check if department name is filled
    if (!addNewDeptValues.dept_name || addNewDeptValues.dept_name.trim() === '') {
      return false;
    }

    // Check if at least one designation is filled
    if (!addNewDeptValues.designations || addNewDeptValues.designations.length === 0) {
      return false;
    }

    // Check if all designations have values
    const hasEmptyDesignation = addNewDeptValues.designations.some(designation => 
      !designation.value || designation.value.trim() === ''
    );
    if (hasEmptyDesignation) {
      return false;
    }

    // Check if description is filled
    if (!addNewDeptValues.description || addNewDeptValues.description.trim() === '') {
      return false;
    }

    // is_global is always defined (boolean), no need to check

    return true;
  }

  // Validation with error messages for Next button
  const validateStep0 = () => {
    // Check if department name is filled
    if (!addNewDeptValues.dept_name || addNewDeptValues.dept_name.trim() === '') {
      showToast('Department Name is required', 'error');
      return false;
    }

    // Check if at least one designation is filled
    if (!addNewDeptValues.designations || addNewDeptValues.designations.length === 0) {
      showToast('At least one designation is required', 'error');
      return false;
    }

    // Check if all designations have values
    const hasEmptyDesignation = addNewDeptValues.designations.some(designation => 
      !designation.value || designation.value.trim() === ''
    );
    if (hasEmptyDesignation) {
      showToast('All designation fields must be filled', 'error');
      return false;
    }

    // Check if description is filled
    if (!addNewDeptValues.description || addNewDeptValues.description.trim() === '') {
      showToast('Description is required', 'error');
      return false;
    }

    // is_global is always defined (boolean), no need to check

    return true;
  }

  const handlePrev = () => {
    if (activeStepDept > 0) {
      setActiveStepDept(activeStepDept - 1);
    }
  };

  const params = useParams();
  // console.log("useParams", params.id)

  const handleNextDept = async () => {
    // Validate step 0 before moving to step 1
    if (activeStepDept === 0) {
      if (!validateStep0()) {
        return; // Don't proceed if validation fails
      }
    }

    try {
      const data = {
        dept_name: addNewDeptValues.dept_name,
        description: addNewDeptValues.description,
        designation: addNewDeptValues.designations.map(designation => designation.value)
      };

      // Validate the current step's data
      await validateFormData(data);

      // If validation passes, move to the next step
      setActiveStepDept(activeStepDept + 1);

      // Optionally call a function if not on the first or last step
      getManageDept(branchIdset);
      // Don't show suggestions automatically - only when user types
      if (!isFirstStepDept && !isLastStepDept) {
      }

    } catch (error) {
      if (error.name === 'ValidationError') {
        // Handle validation errors
        showToast(error.message, 'error');
      } else {
        // Handle other types of errors
        console.log(error);
      }
    }
  };
  const validateFormData = async (formData) => {
    const fields = Object.keys(formData);

    for (const field of fields) {
      try {
        await validateStepDepartmentForm.validateAt(field, formData);
      } catch (error) {
        throw error; // Throw the first validation error encountered
      }
    }
  };


  const handleLastStepDept = (value) => {
    setIsLastStepDept(value)
  }

  const handleFirstStepDept = (value) => {
    setIsFirstStepDept(value)
  }
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragEnter = () => {
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };


  const handleBackDept = () => {
    const id = ''
    settingBranchId(id)
    navigate('/departments')
  }


  const [addNewDeptValues, setAddNewDeptValues] = useState({
    addDesigntions: 0,
    branch_id: '',
    parent_deptt: 0,
    hod: '',
    designations: [],
    description: '',
    is_global: false,
    dept_name: ''
  })
  const handleAddDesignations = () => {
    if (addNewDeptValues.addDesigntions >= 5) {
      showToast('You can only add up to 5 designations', 'error');
      return;
    }

    // Check if any existing designation field is empty
    const hasEmptyDesignation = addNewDeptValues.designations.some(designation => 
      !designation.value || designation.value.trim() === ''
    );

    if (hasEmptyDesignation) {
      showToast('Please fill the current designation field before adding a new one', 'error');
      return;
    }

    setAddNewDeptValues((prevState) => ({
      ...prevState,
      addDesigntions: prevState.addDesigntions + 1,
      designations: [
        ...prevState.designations,
        { name: `Designation ${prevState.addDesigntions + 1}`, value: '' }
      ]
    }));
  };



  const handleInputChange = (index, event) => {
    const { value } = event.target;
    const newDesignations = [...addNewDeptValues.designations];
    newDesignations[index] = { ...newDesignations[index], value };
    setAddNewDeptValues((prevState) => ({
      ...prevState,
      designations: newDesignations
    }));
  };

  const handleRemoveDesignation = (index) => {
    const newDesignations = addNewDeptValues.designations.filter((_, i) => i !== index);
    setAddNewDeptValues((prevState) => ({
      ...prevState,
      addDesigntions: prevState.addDesigntions - 1,
      designations: newDesignations
    }));
  };




  const validateNewDept = () => {

    if (branchIdset === '') {
      showToast('Select Branch ID', 'error')
      return;

    } else if (/^\s*$/.test(addNewDeptValues.dept_name)) {
      showToast('Department Name is required', 'error')
      return;

    } else if (addNewDeptValues.designations.length === 0) {
      showToast('Designation is required', 'error')
      return;
    }
    else if (addNewDeptValues.designations) {

    }
    else if (/^\s*$/.test(addNewDeptValues.description)) {
      showToast('Description is required', 'error')
      return;
    }
    return true;
  };

  // console.log("branchIdset", branchIdset);
  const handleAddDepartment = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!addNewDeptValues.dept_name || addNewDeptValues.dept_name.trim() === '') {
      showToast('Department Name is required', 'error')
      return
    }
    
    if (!addNewDeptValues.description || addNewDeptValues.description.trim() === '') {
      showToast('Description is required', 'error')
      return
    }
    
    if (!addNewDeptValues.designations || addNewDeptValues.designations.length === 0) {
      showToast('At least one designation is required', 'error')
      return
    }

    const addData = {
      branch_id: parseInt(params.id),
      parent_deptt: addNewDeptValues.parent_deptt || 0,
      hod: addNewDeptValues.hod && addNewDeptValues.hod.value ? addNewDeptValues.hod.value : null,
      designation: addNewDeptValues.designations.map(designation => designation.value).filter(Boolean),
      description: addNewDeptValues.description,
      is_global: addNewDeptValues.is_global ? '1' : '0',
      dept_name: addNewDeptValues.dept_name,
    }

    console.log('Sending data:', addData)
    
    const newData = {
      hod_name: addNewDeptValues.hod && addNewDeptValues.hod.label ? addNewDeptValues.hod.label : '',
      designation: addNewDeptValues.designations.map(designation => ({
        title: designation?.value || ''
      })).filter(designation => designation.title !== ''),
    }

    console.log('New data:', newData)

    try {

      const response = await departmentsApi.createNewDept(addData)
      console.log('API Response:', response)
      
      if (response && response.data) {
        const data = response.data
        console.log('added data', data.STATUS)

        if (data.STATUS === 'SUCCESSFUL') {
          showToast('Department created successfully', 'success')
          // Use DB_DATA instead of INSERTED_DATA based on the API response
          handleNewDept(data.DB_DATA, newData)
          setAddNewDeptValues({
            addDesigntions: 0,
            branch_id: params.id,
            parent_deptt: 0,
            hod: '',
            designations: [],
            description: '',
            is_global: false,
            dept_name: ''
          })
          navigate(`/departments/manageDept/${branchIdset}`)
        } else {
          showToast(data.ERROR_DESCRIPTION || 'Failed to create department', 'error')
        }
      } else {
        showToast('Invalid response from server', 'error')
      }

    } catch (error) {
      console.error('Error creating department:', error)
      if (error.response && error.response.data) {
        showToast(error.response.data.ERROR_DESCRIPTION || 'Failed to create department', 'error')
      } else {
        showToast('Failed to create department', 'error')
      }
    }

  }

  const handleChangeAddDept = (e) => {
    const { name, value } = e.target
    setAddNewDeptValues((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleChangeInput = (e) => {
    const { name, value } = e.target
    setAddNewDeptValues((prevState) => ({
      ...prevState,
      [name]: value
    }))

    if (value.trim() === "") {
      setSearchSuggestions(false);
    } else {
      setSearchSuggestions(true);
      filterDeptSuggestion(value);
    }
  }

  const handleRadioChange = (e) => {
    const is_global = e.target.value === '1';
    setAddNewDeptValues((prevState) => ({
      ...prevState,
      is_global: is_global,
    }));
  }

  const handleChangeDept = (selectedOption, field) => {
    console.log('selectedOption', selectedOption)
    setAddNewDeptValues((prevState) => ({
      ...prevState,
      [field]: selectedOption
    }))

    // If department is selected, fetch employees for that department
    if (field === 'parent_deptt' && selectedOption && selectedOption.value) {
      // Clear the current HOD selection when department changes
      setAddNewDeptValues((prevState) => ({
        ...prevState,
        hod: ''
      }))
      
      // Fetch employees for the selected department
      getEmployeesByDeptId(selectedOption.value)
    }
  }


  const [draggedData, setDraggedData] = useState(null);
  const handleDragStart = (item) => (e) => {
    setDraggedData(item);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    console.log('draggedData', draggedData)
    
    // Clear existing designations first
    setAddNewDeptValues((prevState) => ({
      ...prevState,
      designations: [],
      addDesigntions: 0,
    }))

    handleDragLeave();
    
    // Map designations properly - check if designations exist and have the right structure
    const newDesignations = draggedData?.designations?.map((designation, index) => ({
      name: `Designation ${index + 1}`,
      value: designation.title || designation // Handle both cases: {title: "..."} or just "string"
    })) || [];

    console.log('newDesignations', newDesignations);

    setAddNewDeptValues((prevState) => ({
      ...prevState,
      addDesigntions: newDesignations.length,
      dept_name: draggedData.name,
      description: draggedData.description,
      designations: newDesignations
    }));
  };

  const handleClose = () => {
    setDraggedData(null);
    setAddNewDeptValues({
      designations: [],
      addDesigntions: 0,
      dept_name: '',
      description: '',
    });
  };




  return {
    activeStepDept, isFirstStepDept, isDragActive, isLastStepDept, handleStepActive, handlePrev, handleNextDept, handleLastStepDept, handleFirstStepDept, handleDragEnter, handleDragLeave, handleDrop, handleBackDept, handleAddDesignations,
    handleInputChange, handleRemoveDesignation, handleChangeAddDept, handleRadioChange, handleChangeInput,
    handleAddDepartment, addNewDeptValues, allDeptDetails, handleChangeDept, allSuggestionsEmp, handleDragStart, draggedData, searchSuggestions, handleClose, getEmployeesByDeptId, validateStep0, isStep0Valid

  }
}

export default useCreateNewDeptServices
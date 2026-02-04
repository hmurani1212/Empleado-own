import React, { useState, useEffect } from 'react';
import { Input, Button, Radio } from '@material-tailwind/react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { BiShow } from 'react-icons/bi';
import { GrHide } from 'react-icons/gr';
import CustomSelect from '../../Components/CustomSelect/CustomSelect';
import Calendar from 'react-calendar';
import { Popover, PopoverHandler, PopoverContent } from '@material-tailwind/react';
import { mobileNetwroks } from '../../services/EmpServices';
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices';

const EmployeeDataTable = () => {
  const {
    allCountries,
    empBranches,
    dept_subDept,
    flattenOptions,
    designations,
    policies,
    salaryTemplate,
    handleBulkEmployeeSubmit,
    gettingSubBranches,
    gettingPolicies,
    gettingSalayTemplate,
    gettingDesignation,
    fetchingAllBranches
  } = useEmployees();

  // Load branches when component mounts
  useEffect(() => {
    fetchingAllBranches();
  }, []);

  const [employees, setEmployees] = useState([{
    mobile: '',
    email: '',
    full_name: '',
    father_name: '',
    country_code: null,
    network: null,
    dob: '',
    showPassword: false,
    password: '',
    passport: '',
    gender: '',
    branch: null,
    department: null,
    designation: null,
    work_policy: null,
    salary_template: null,
    empStatus: null,
    empID: '',
    joining_date: '',
  }]);

  const handleAddRow = () => {
    setEmployees([...employees, {
      mobile: '',
      email: '',
      full_name: '',
      father_name: '',
      country_code: null,
      network: null,
      dob: '',
      showPassword: false,
      password: '',
      passport: '',
      gender: '',
      branch: null,
      department: null,
      designation: null,
      work_policy: null,
      salary_template: null,
      empStatus: null,
      empID: '',
      joining_date: '',
    }]);
  };

  const handleRemoveRow = (index) => {
    const newEmployees = employees.filter((_, i) => i !== index);
    setEmployees(newEmployees);
  };

  const handleInputChange = (index, field, value) => {
    // console.log('handleInputChange called:', { index, field, value });
    // console.log('Current employees state:', employees);
    
    const newEmployees = [...employees];
    
    // Handle date formatting
    let formattedValue = value;
    if (field === 'dob' || field === 'joining_date') {
      if (value instanceof Date) {
        formattedValue = value.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      } else {
        formattedValue = value;
      }
    }
    
    // Ensure the value is properly set
    newEmployees[index] = {
      ...newEmployees[index],
      [field]: formattedValue
    };
    
    // Handle dependent dropdowns
    if (field === 'branch' && value) {
      // console.log('Branch selected, clearing dependent fields');
      // Clear dependent fields when branch changes
      newEmployees[index] = {
        ...newEmployees[index],
        department: null,
        designation: null
      };
      // Trigger API calls for the selected branch
      gettingSubBranches(value.value);
      gettingPolicies(value.value);
      gettingSalayTemplate(value.value);
    } else if (field === 'department' && value) {
      // console.log('Department selected, clearing designation');
      // Clear designation when department changes
      newEmployees[index] = {
        ...newEmployees[index],
        designation: null
      };
      // Trigger API call for designations
      gettingDesignation(value.value);
    } else if (field === 'country_code' && value) {
      // If country is selected and it's not Pakistan (ID: 162), reset network to null
      if (value.value !== "162") {
        newEmployees[index] = {
          ...newEmployees[index],
          network: null // Reset network when country is not Pakistan
        };
      }
    }
    
    // console.log('Updated employee state:', newEmployees[index]);
    // console.log('New employees array:', newEmployees);
    setEmployees(newEmployees);
  };

  const handlePasswordToggle = (index) => {
    const newEmployees = [...employees];
    newEmployees[index] = {
      ...newEmployees[index],
      showPassword: !newEmployees[index].showPassword
    };
    setEmployees(newEmployees);
  };

  const validateData = () => {
    for (let emp of employees) {
      const isPakistan = emp.country_code && emp.country_code.value === "162";
      const baseValidation = emp.mobile && emp.email && emp.full_name && emp.father_name && 
          emp.country_code && emp.dob && emp.password && 
          emp.passport && emp.gender && emp.branch && emp.department && 
          emp.designation && emp.work_policy && emp.salary_template && 
          emp.empStatus && emp.empID && emp.joining_date;
      
      // Only require network if Pakistan is selected
      const networkValidation = isPakistan ? emp.network : true;
      
      if (!baseValidation || !networkValidation) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateData()) {
      alert('Please fill all fields in all rows');
      return;
    }
    
    const success = await handleBulkEmployeeSubmit(employees);
    if (success) {
      // Reset form
      setEmployees([{
        mobile: '',
        email: '',
        full_name: '',
        father_name: '',
        country_code: null,
        network: null,
        dob: '',
        showPassword: false,
        password: '',
        passport: '',
        gender: '',
        branch: null,
        department: null,
        designation: null,
        work_policy: null,
        salary_template: null,
        empStatus: null,
        empID: '',
        joining_date: '',
      }]);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Mobile No</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Full Name</th>
              <th className="px-4 py-2">Father Name</th>
              <th className="px-4 py-2">Country Code</th>
              <th className="px-4 py-2">Mobile Network</th>
              <th className="px-4 py-2">Date of Birth</th>
              <th className="px-4 py-2">Passport/CNIC</th>
              <th className="px-4 py-2">Password</th>
              <th className="px-4 py-2">Gender</th>
              <th className="px-4 py-2">Branch</th>
              <th className="px-4 py-2">Department</th>
              <th className="px-4 py-2">Designation</th>
              <th className="px-4 py-2">Work Policy</th>
              <th className="px-4 py-2">Salary Template</th>
              <th className="px-4 py-2">Employee Status</th>
              <th className="px-4 py-2">Employee ID</th>
              <th className="px-4 py-2">Joining Date</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-2">
                  <Input
                    value={employee.mobile}
                    onChange={(e) => handleInputChange(index, 'mobile', e.target.value)}
                    placeholder="+93419898070"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="email"
                    value={employee.email}
                    onChange={(e) => handleInputChange(index, 'email', e.target.value)}
                    placeholder="Enter Email"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={employee.full_name}
                    onChange={(e) => handleInputChange(index, 'full_name', e.target.value)}
                    placeholder="Full Name"
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={employee.father_name}
                    onChange={(e) => handleInputChange(index, 'father_name', e.target.value)}
                    placeholder="Father Name"
                  />
                </td>
                <td className="px-4 py-2">
                  <CustomSelect
                    placeHolderTitle="Country"
                    value={employee.country_code}
                    options={allCountries?.map((country) => ({
                      value: country.id,
                      label: country.country_name
                    }))}
                    onChangeHandler={(selectedOption) => handleInputChange(index, 'country_code', selectedOption)}
                    customStyle={false}
                  />
                </td>
                <td className="px-4 py-2">
                  {/* Only show network selection when Pakistan is selected */}
                  {employee.country_code && employee.country_code.value === "162" ? (
                    <CustomSelect
                      placeHolderTitle="Mobile Network"
                      value={employee.network}
                      options={mobileNetwroks?.map((network) => ({
                        value: `${network.networkName}-PK`,
                        label: network.networkName
                      }))}
                      onChangeHandler={(selectedOption) => handleInputChange(index, 'network', selectedOption)}
                      customStyle={false}
                    />
                  ) : (
                    <div className="text-gray-400 text-sm px-3 py-2">Not applicable</div>
                  )}
                </td>
                <td className="px-4 py-2">
                  <Popover placement="bottom">
                    <PopoverHandler>
                      <Input
                        value={employee.dob}
                        readOnly
                        placeholder="Date of Birth"
                      />
                    </PopoverHandler>
                    <PopoverContent>
                      <Calendar
                        onChange={(selected) => handleInputChange(index, 'dob', selected)}
                        className="border-0"
                      />
                    </PopoverContent>
                  </Popover>
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={employee.passport}
                    onChange={(e) => handleInputChange(index, 'passport', e.target.value)}
                    placeholder="CNIC/Passport Number"
                  />
                </td>
                <td className="px-4 py-2">
                  <div className="relative">
                    <Input
                      type={employee.showPassword ? "text" : "password"}
                      value={employee.password}
                      onChange={(e) => handleInputChange(index, 'password', e.target.value)}
                      placeholder="Password"
                    />
                    <div
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                      onClick={() => handlePasswordToggle(index)}
                    >
                      {employee.showPassword ? <GrHide /> : <BiShow />}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-4">
                    <Radio
                      name={`gender-${index}`}
                      label="Male"
                      value="1"
                      onChange={(e) => handleInputChange(index, 'gender', e.target.value)}
                      checked={employee.gender === '1'}
                    />
                    <Radio
                      name={`gender-${index}`}
                      label="Female"
                      value="0"
                      onChange={(e) => handleInputChange(index, 'gender', e.target.value)}
                      checked={employee.gender === '0'}
                    />
                  </div>
                </td>
                <td className="px-4 py-2">
                  {/* {console.log(`Row ${index} - Branch value:`, employee.branch)}
                  {console.log(`Row ${index} - Branch options:`, empBranches?.map((branch) => ({
                    value: branch.id,
                    label: branch.branch_name
                  })))} */}
                  <CustomSelect
                    key={`branch-${index}-${empBranches?.length || 0}`}
                    placeHolderTitle="Branch"
                    value={employee.branch}
                    options={empBranches?.map((branch) => ({
                      value: branch.id,
                      label: branch.branch_name
                    }))}
                    onChangeHandler={(selectedOption) => handleInputChange(index, 'branch', selectedOption)}
                    customStyle={false}
                  />
                </td>
                <td className="px-4 py-2">
                  {/* {console.log(`Row ${index} - Department value:`, employee.department)}
                  {console.log(`Row ${index} - Department options:`, flattenOptions(dept_subDept))} */}
                  <CustomSelect
                    key={`department-${index}-${dept_subDept?.length || 0}`}
                    placeHolderTitle="Department"
                    value={employee.department}
                    options={flattenOptions(dept_subDept)}
                    onChangeHandler={(selectedOption) => handleInputChange(index, 'department', selectedOption)}
                    customStyle={true}
                  />
                </td>
                <td className="px-4 py-2">
                  {/* {console.log(`Row ${index} - Designation value:`, employee.designation)} */}
                  {/* {console.log(`Row ${index} - Designation options:`, designations?.map((ele) => ({
                    value: ele.id,
                    label: ele.title
                  })))} */}
                  <CustomSelect
                    key={`designation-${index}-${designations?.length || 0}`}
                    placeHolderTitle="Designation"
                    value={employee.designation}
                    options={designations?.map((ele) => ({
                      value: ele.id,
                      label: ele.title
                    }))}
                    onChangeHandler={(selectedOption) => handleInputChange(index, 'designation', selectedOption)}
                    customStyle={false}
                  />
                </td>
                <td className="px-4 py-2">
                  <CustomSelect
                    placeHolderTitle="Work Policy"
                    value={employee.work_policy}
                    options={policies?.map((ele) => ({
                      value: ele.id,
                      label: ele.policy_name
                    }))}
                    onChangeHandler={(selectedOption) => handleInputChange(index, 'work_policy', selectedOption)}
                    customStyle={false}
                  />
                </td>
                <td className="px-4 py-2">
                  <CustomSelect
                    placeHolderTitle="Salary Template"
                    value={employee.salary_template}
                    options={salaryTemplate?.map((ele) => ({
                      value: ele.id,
                      label: ele.name
                    }))}
                    onChangeHandler={(selectedOption) => handleInputChange(index, 'salary_template', selectedOption)}
                    customStyle={false}
                  />
                </td>
                <td className="px-4 py-2">
                  <CustomSelect
                    placeHolderTitle="Employee Status"
                    value={employee.empStatus}
                    options={[
                      { value: '1', label: 'Active' },
                      { value: '0', label: 'Inactive' }
                    ]}
                    onChangeHandler={(selectedOption) => handleInputChange(index, 'empStatus', selectedOption)}
                    customStyle={false}
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    value={employee.empID}
                    onChange={(e) => handleInputChange(index, 'empID', e.target.value)}
                    placeholder="Employee ID"
                  />
                </td>
                <td className="px-4 py-2">
                  <Popover placement="bottom">
                    <PopoverHandler>
                      <Input
                        value={employee.joining_date}
                        readOnly
                        placeholder="Joining Date"
                      />
                    </PopoverHandler>
                    <PopoverContent>
                      <Calendar
                        onChange={(selected) => handleInputChange(index, 'joining_date', selected)}
                        className="border-0"
                      />
                    </PopoverContent>
                  </Popover>
                </td>
                <td className="px-4 py-2">
                  <Button
                    color="red"
                    className="p-2"
                    onClick={() => handleRemoveRow(index)}
                    disabled={employees.length === 1}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between">
        <Button
          color="blue"
          className="flex items-center gap-2"
          onClick={handleAddRow}
        >
          <FaPlus /> Add Row
        </Button>
        <Button
          color="green"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default EmployeeDataTable;
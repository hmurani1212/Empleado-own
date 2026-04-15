import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Radio } from '@material-tailwind/react';
import { FaDownload, FaFileExcel, FaUpload } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { showToast } from '../../Components/Toaster/Toaster';
import employeesApi from '../../Model/Data/Employees/Employees';
import useStore from '../../Store/store';
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices';
import { contractData } from '../../services/EmpServices';
import PortalDrawer from '../../Components/CustomDrawer/PortalDrawer';
import usePayroll from '../../ViewModel/PayrollViewModel/PayrollServices';
import { FaTrashCan } from "react-icons/fa6"
const AddBulkEmployee = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("No file chosen");
  const [isUploading, setIsUploading] = useState(false);
  const [importedData, setImportedData] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [fileImported, setFileImported] = useState(false);
  const fileInputRef = useRef(null);
  const [branchCheckboxes, setBranchCheckboxes] = useState({}); // Track which rows have checkbox checked
  const [departmentCheckboxes, setDepartmentCheckboxes] = useState({}); // Track which rows have department checkbox checked
  const [designationCheckboxes, setDesignationCheckboxes] = useState({}); // Track which rows have designation checkbox checked
  const [reportingManagerCheckboxes, setReportingManagerCheckboxes] = useState({}); // Track which rows have reporting manager checkbox checked
  const [workPolicyCheckboxes, setWorkPolicyCheckboxes] = useState({}); // Track which rows have work policy checkbox checked
  const [salaryTemplateCheckboxes, setSalaryTemplateCheckboxes] = useState({}); // Track which rows have salary template checkbox checked

  // Get all the functions and state from EmployeeServices
  const {
    empBranches,
    fetchingAllBranches,
    dept_subDept,
    designations,
    empManager,
    policies,
    salaryTemplate,
    gettingSubBranches,
    gettingDesignation,
    gettingSalayTemplate,
    flattenOptions,
    createSalaryTemplateFromEmployee,
    isCreatingSalaryTemplate,
  } = useEmployees();

  const { copyBranchesData, getAllBranchesPayroll } = usePayroll();

  // State for salary template drawer
  const [showSalaryTemplateDrawer, setShowSalaryTemplateDrawer] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState(null);
  const [salaryTemplateForm, setSalaryTemplateForm] = useState({
    template_name: '',
    salary_amount: '',
    branch_option: 'selected', // 'selected' or 'all'
  });
  const [newlyCreatedTemplateId, setNewlyCreatedTemplateId] = useState(null);

  // Load branches on component mount
  useEffect(() => {
    fetchingAllBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load branches when drawer opens
  useEffect(() => {
    if (showSalaryTemplateDrawer && (!copyBranchesData || copyBranchesData.length === 0)) {
      getAllBranchesPayroll();
    }
  }, [showSalaryTemplateDrawer, copyBranchesData, getAllBranchesPayroll]);

  // Auto-select newly created template when salaryTemplate updates
  useEffect(() => {
    if (newlyCreatedTemplateId && salaryTemplate && salaryTemplate.length > 0 && currentRowIndex !== null) {
      // Try to find template by ID (handle both string and number comparisons)
      const newTemplate = salaryTemplate.find(template =>
        template.id === newlyCreatedTemplateId ||
        template.id === Number(newlyCreatedTemplateId) ||
        String(template.id) === String(newlyCreatedTemplateId)
      );

      if (newTemplate) {
        // Update the specific row's salary template
        handleCellChange(currentRowIndex, 'Salary Template', newTemplate.name);
        setNewlyCreatedTemplateId(null);
        setCurrentRowIndex(null);
      } else {
        // Fallback: if exact match not found, select the last template (most likely the new one)
        const lastTemplate = salaryTemplate[salaryTemplate.length - 1];
        if (lastTemplate) {
          handleCellChange(currentRowIndex, 'Salary Template', lastTemplate.name);
          setNewlyCreatedTemplateId(null);
          setCurrentRowIndex(null);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salaryTemplate, newlyCreatedTemplateId, currentRowIndex]);


  // Monitor importedData changes
  useEffect(() => {
  }, [importedData]);


  // Handle branch change for a specific row
  const handleBranchChange = async (branchName, rowIndex) => {
    try {

      // Find the branch ID from the name
      const selectedBranch = empBranches.find(branch => branch.branch_name === branchName);
      const branchId = selectedBranch ? selectedBranch.id : null;

      // Directly update the state without using handleCellChange
      setImportedData(prevData => {
        const newData = [...prevData];
        newData[rowIndex] = {
          ...newData[rowIndex],
          'Branch': branchName,
          'Department': '',
          'Designation': '',
          'Reporting Manager': '',
          'Work Policy': '',
          'Salary Template': ''
        };

        // If checkbox is checked for this row, apply branch to all rows below
        if (branchCheckboxes[rowIndex] && branchName) {
          for (let i = rowIndex + 1; i < newData.length; i++) {
            newData[i] = {
              ...newData[i],
              'Branch': branchName,
              'Department': '',
              'Designation': '',
              'Reporting Manager': '',
              'Work Policy': '',
              'Salary Template': ''
            };
          }
        }

        return newData;
      });

      // Departments, reporting managers, HR policies (aggregated) + salary templates
      if (branchId) {
        await gettingSubBranches(branchId);
        await gettingSalayTemplate(branchId);
      }
    } catch (error) {
      console.error('Error loading branch data:', error);
    }
  };

  // Handle branch checkbox change
  const handleBranchCheckboxChange = async (rowIndex, isChecked) => {
    setBranchCheckboxes(prev => ({
      ...prev,
      [rowIndex]: isChecked
    }));

    // If checked, apply current branch to all rows below
    if (isChecked) {
      const currentRow = importedData[rowIndex];
      const branchName = currentRow?.['Branch'];

      if (branchName) {
        // Find the branch ID from the name
        const selectedBranch = empBranches.find(branch => branch.branch_name === branchName);
        const branchId = selectedBranch ? selectedBranch.id : null;

        setImportedData(prevData => {
          const newData = [...prevData];
          // Apply branch to all rows below
          for (let i = rowIndex + 1; i < newData.length; i++) {
            newData[i] = {
              ...newData[i],
              'Branch': branchName,
              'Department': '',
              'Designation': '',
              'Reporting Manager': '',
              'Work Policy': '',
              'Salary Template': ''
            };
          }
          return newData;
        });

        // Load data for the branch if needed
        if (branchId) {
          await gettingSubBranches(branchId);
          await gettingSalayTemplate(branchId);
        }
      }
    }
  };

  // Handle department change for a specific row
  const handleDepartmentChange = async (deptName, rowIndex) => {
    try {
      // Find the department ID from the name
      const deptOptions = flattenOptions(dept_subDept);
      const selectedDept = deptOptions.find(dept => dept.label === deptName);
      const deptId = selectedDept ? selectedDept.value : null;

      // Directly update the state without using handleCellChange
      setImportedData(prevData => {
        const newData = [...prevData];
        newData[rowIndex] = {
          ...newData[rowIndex],
          'Department': deptName,
          'Designation': '' // Reset designation
        };

        // If checkbox is checked for this row, apply department to all rows below
        if (departmentCheckboxes[rowIndex] && deptName) {
          for (let i = rowIndex + 1; i < newData.length; i++) {
            newData[i] = {
              ...newData[i],
              'Department': deptName,
              'Designation': '' // Reset designation
            };
          }
        }

        return newData;
      });

      // Load designations for selected department
      if (deptId) {
        await gettingDesignation(deptId);
      }
    } catch (error) {
      console.error('Error loading designations:', error);
    }
  };

  // Handle department checkbox change
  const handleDepartmentCheckboxChange = async (rowIndex, isChecked) => {
    setDepartmentCheckboxes(prev => ({
      ...prev,
      [rowIndex]: isChecked
    }));

    // If checked, apply current department to all rows below
    if (isChecked) {
      const currentRow = importedData[rowIndex];
      const deptName = currentRow?.['Department'];

      if (deptName) {
        // Find the department ID from the name
        const deptOptions = flattenOptions(dept_subDept);
        const selectedDept = deptOptions.find(dept => dept.label === deptName);
        const deptId = selectedDept ? selectedDept.value : null;

        setImportedData(prevData => {
          const newData = [...prevData];
          // Apply department to all rows below
          for (let i = rowIndex + 1; i < newData.length; i++) {
            newData[i] = {
              ...newData[i],
              'Department': deptName,
              'Designation': '' // Reset designation
            };
          }
          return newData;
        });

        // Load designations for the department if needed
        if (deptId) {
          await gettingDesignation(deptId);
        }
      }
    }
  };

  // Handle designation change for a specific row
  const handleDesignationChange = (designationName, rowIndex) => {
    setImportedData(prevData => {
      const newData = [...prevData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        'Designations': designationName,
        'Designation': designationName
      };

      // If checkbox is checked for this row, apply designation to all rows below
      if (designationCheckboxes[rowIndex] && designationName) {
        for (let i = rowIndex + 1; i < newData.length; i++) {
          newData[i] = {
            ...newData[i],
            'Designations': designationName,
            'Designation': designationName
          };
        }
      }

      return newData;
    });
  };

  // Handle designation checkbox change
  const handleDesignationCheckboxChange = (rowIndex, isChecked) => {
    setDesignationCheckboxes(prev => ({
      ...prev,
      [rowIndex]: isChecked
    }));

    // If checked, apply current designation to all rows below
    if (isChecked) {
      const currentRow = importedData[rowIndex];
      const designationName = currentRow?.['Designations'] || currentRow?.['Designation'];

      if (designationName) {
        setImportedData(prevData => {
          const newData = [...prevData];
          // Apply designation to all rows below
          for (let i = rowIndex + 1; i < newData.length; i++) {
            newData[i] = {
              ...newData[i],
              'Designations': designationName,
              'Designation': designationName
            };
          }
          return newData;
        });
      }
    }
  };

  // Handle reporting manager checkbox change - apply selected manager to all rows below
  const handleReportingManagerCheckboxChange = (rowIndex, isChecked) => {
    setReportingManagerCheckboxes(prev => ({
      ...prev,
      [rowIndex]: isChecked
    }));

    if (isChecked) {
      const currentRow = importedData[rowIndex];
      const managerName = currentRow?.['Reporting Manager'];

      if (managerName) {
        setImportedData(prevData => {
          const newData = [...prevData];
          for (let i = rowIndex + 1; i < newData.length; i++) {
            newData[i] = {
              ...newData[i],
              'Reporting Manager': managerName
            };
          }
          return newData;
        });
      }
    }
  };

  // Handle reporting manager select change - if "apply below" is checked, apply to all rows below
  const handleReportingManagerChange = (managerName, rowIndex) => {
    setImportedData(prevData => {
      const newData = [...prevData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        'Reporting Manager': managerName
      };
      if (reportingManagerCheckboxes[rowIndex] && managerName) {
        for (let i = rowIndex + 1; i < newData.length; i++) {
          newData[i] = {
            ...newData[i],
            'Reporting Manager': managerName
          };
        }
      }
      return newData;
    });
  };

  // Handle work policy change for a specific row
  const handleWorkPolicyChange = (policyName, rowIndex) => {
    setImportedData(prevData => {
      const newData = [...prevData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        'Work Policy': policyName
      };

      // If checkbox is checked for this row, apply work policy to all rows below
      if (workPolicyCheckboxes[rowIndex] && policyName) {
        for (let i = rowIndex + 1; i < newData.length; i++) {
          newData[i] = {
            ...newData[i],
            'Work Policy': policyName
          };
        }
      }

      return newData;
    });
  };

  // Handle work policy checkbox change
  const handleWorkPolicyCheckboxChange = (rowIndex, isChecked) => {
    setWorkPolicyCheckboxes(prev => ({
      ...prev,
      [rowIndex]: isChecked
    }));

    // If checked, apply current work policy to all rows below
    if (isChecked) {
      const currentRow = importedData[rowIndex];
      const policyName = currentRow?.['Work Policy'];

      if (policyName) {
        setImportedData(prevData => {
          const newData = [...prevData];
          // Apply work policy to all rows below
          for (let i = rowIndex + 1; i < newData.length; i++) {
            newData[i] = {
              ...newData[i],
              'Work Policy': policyName
            };
          }
          return newData;
        });
      }
    }
  };

  // Handle salary template select change for a specific row
  const handleSalaryTemplateSelectChange = (templateName, rowIndex) => {
    setImportedData(prevData => {
      const newData = [...prevData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        'Salary Template': templateName
      };

      // If checkbox is checked for this row, apply salary template to all rows below
      if (salaryTemplateCheckboxes[rowIndex] && templateName) {
        for (let i = rowIndex + 1; i < newData.length; i++) {
          newData[i] = {
            ...newData[i],
            'Salary Template': templateName
          };
        }
      }

      return newData;
    });
  };

  // Handle salary template checkbox change
  const handleSalaryTemplateCheckboxChange = (rowIndex, isChecked) => {
    setSalaryTemplateCheckboxes(prev => ({
      ...prev,
      [rowIndex]: isChecked
    }));

    // If checked, apply current salary template to all rows below
    if (isChecked) {
      const currentRow = importedData[rowIndex];
      const templateName = currentRow?.['Salary Template'];

      if (templateName) {
        setImportedData(prevData => {
          const newData = [...prevData];
          // Apply salary template to all rows below
          for (let i = rowIndex + 1; i < newData.length; i++) {
            newData[i] = {
              ...newData[i],
              'Salary Template': templateName
            };
          }
          return newData;
        });
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
      setShowTable(false); // Hide table when new file is selected
      setImportedData([]); // Clear previous data
      setFileImported(false); // Reset import status for new file
    }
  };

  // Download Excel template
  const handleDownloadTemplate = () => {
    try {
      // Create a link element to download the file from public folder
      const link = document.createElement('a');
      link.href = '/employee_template_2.xlsx'; // Path to the Excel file in public folder
      link.download = 'employee_bulk_upload_template.xlsx'; // Name for the downloaded file
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Excel template downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading template:', error);
      showToast('Error downloading template. Please try again.', 'error');
    }
  };

  // Import Excel file and display data
  const handleImport = async () => {
    if (!selectedFile) {
      showToast('Please select a file first', 'error');
      return;
    }

    try {
      setIsUploading(true);

      const data = await readExcelFile(selectedFile);
      // console.log('Raw imported data:', data);

      if (data && data.length > 0) {
        setImportedData(data);
        setShowTable(true);
        setFileImported(true); // Mark file as imported
        // showToast(`Successfully imported ${data.length} employees (filtered out empty rows)`, 'success');
      } else {
        // Show empty table for manual data entry
        setImportedData([]);
        setShowTable(true);
        setFileImported(true); // Mark file as imported even for empty data
      }
    } catch (error) {
      console.error('Import error:', error);
      showToast('Failed to import file. Please check the file format.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Convert date format from dd/mm/yyyy to yyyy-mm-dd for HTML date inputs
  const convertDateFormat = (dateString) => {
    if (!dateString) return '';

    // If already in yyyy-mm-dd format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Convert from dd/mm/yyyy to yyyy-mm-dd
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const parts = dateString.split('/');
      const day = parts[0];
      const month = parts[1];
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }

    // If it's a number (Excel date), convert it
    if (typeof dateString === 'number') {
      const date = new Date((dateString - 25569) * 86400 * 1000);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return dateString;
  };

  // Add new empty row for manual entry
  const handleAddRow = () => {
    // Check if first row (index 0) has checkbox checked and get its branch
    let branchToApply = '';
    if (branchCheckboxes[0] && importedData[0]?.['Branch']) {
      branchToApply = importedData[0]['Branch'];
    } else {
      // If first row not checked, find the last checked checkbox and get its branch
      for (let i = importedData.length - 1; i >= 0; i--) {
        if (branchCheckboxes[i] && importedData[i]?.['Branch']) {
          branchToApply = importedData[i]['Branch'];
          break;
        }
      }
    }

    const newRow = {
      rowIndex: importedData.length + 1,
      'Mobile No': '',
      'Email': '',
      'Full Name': '',
      'Father Name': '',
      'Mobile Network': '',
      'Date of Birth': '',
      'Passport/CNIC': '',
      'Password': '',
      'Gender': '',
      'Employee ID': '',
      'Joining Data': '',
      'Branch': branchToApply, // Apply branch from first checked checkbox or last checked
      'Department': '',
      'Designations': '',
      'Reporting Manager': '',
      'Work Policy': '',
      'Employment Status': '',
      'Salary Template': ''
    };
    setImportedData([...importedData, newRow]);
  };



  // Update cell value
  const handleCellChange = (rowIndex, field, value) => {
    const updatedData = importedData.map((row, index) => {
      if (index === rowIndex) {
        const updatedRow = { ...row, [field]: value };
        return updatedRow;
      }
      return row;
    });

    setImportedData(updatedData);
  };

  // Handle salary template form input changes
  const handleSalaryTemplateChange = (e) => {
    const { name, value } = e.target;
    setSalaryTemplateForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle branch option radio change
  const handleBranchOptionChange = (value) => {
    setSalaryTemplateForm((prev) => ({
      ...prev,
      branch_option: value,
    }));
  };

  // Handle form submission
  const handleSalaryTemplateSubmit = async (e) => {
    e.preventDefault();

    // Get the branch from the current row
    const currentRow = importedData[currentRowIndex];
    const branchName = currentRow?.['Branch'];
    const selectedBranch = branchName ? empBranches.find(b => b.branch_name === branchName) : null;
    const branchId = selectedBranch ? selectedBranch.id : null;

    // Prepare form data for createSalaryTemplateFromEmployee
    const formData = {
      template_name: salaryTemplateForm.template_name,
      salary_amount: salaryTemplateForm.salary_amount,
      branch_option: salaryTemplateForm.branch_option,
      selected_branch_id: salaryTemplateForm.branch_option === 'selected'
        ? branchId
        : null,
    };

    // Validate branch selection
    if (salaryTemplateForm.branch_option === 'selected' && !branchId) {
      showToast('Please select a branch for this row first', 'error');
      return;
    }

    // Call the API function from EmployeeServices
    const result = await createSalaryTemplateFromEmployee(formData);

    // If successful, reset form and close drawer
    if (result && result.success) {
      setSalaryTemplateForm({
        template_name: '',
        salary_amount: '',
        branch_option: 'selected',
      });
      setShowSalaryTemplateDrawer(false);

      // Store the newly created template ID for auto-selection
      if (result.template_id) {
        setNewlyCreatedTemplateId(result.template_id);
      }

      // Fetch templates again to refresh the list
      if (branchId && gettingSalayTemplate) {
        // Fetch templates for the branch - useEffect will handle selection
        await gettingSalayTemplate(branchId);
      }
    }
  };

  // Open salary template drawer for a specific row
  const handleOpenSalaryTemplateDrawer = (e, rowIndex) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if branch is selected for this row
    const row = importedData[rowIndex];
    const branchName = row?.['Branch'];

    if (!branchName) {
      showToast('Please select a branch for this row first', 'error');
      return;
    }

    setCurrentRowIndex(rowIndex);
    setShowSalaryTemplateDrawer(true);
  };

  // Close salary template drawer
  const handleCloseSalaryTemplateDrawer = () => {
    setShowSalaryTemplateDrawer(false);
    setCurrentRowIndex(null);
    setSalaryTemplateForm({
      template_name: '',
      salary_amount: '',
      branch_option: 'selected',
    });
  };

  // Delete row
  const handleDeleteRow = (rowIndex) => {
    const updatedData = importedData.filter((_, index) => index !== rowIndex);
    // Update row numbers
    const renumberedData = updatedData.map((row, index) => ({
      ...row,
      rowIndex: index + 1
    }));
    setImportedData(renumberedData);
  };

  // Read Excel file
  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Convert to array of objects with headers
          if (jsonData.length > 1) {
            const headers = jsonData[0];
            const rows = jsonData.slice(1);

            // Normalize headers to handle line breaks and special characters
            const normalizeHeader = (header) => {
              if (!header) return '';
              // Replace line breaks and extra spaces with single space
              return header.toString().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
            };

            // Map Excel headers to our expected column names
            const headerMapping = {
              'Mobile No': 'Mobile No',
              'Mobile No (+92XXXXXXXXXX)': 'Mobile No',
              'Mobile No (+923130000000)': 'Mobile No',
              'Mobile No\n(+92XXXXXXXXXX)': 'Mobile No', // Handle line break
              'Mobile No\n(+923130000000)': 'Mobile No',
              'Email': 'Email',
              'Full Name': 'Full Name',
              'Father Name': 'Father Name',
              'Mobile Network': 'Mobile Network',
              'Date of Birth': 'Date of Birth',
              'Date of Birth(yyyy-mm-dd)': 'Date of Birth',
              'Date of Birth\n(yyyy-mm-dd)': 'Date of Birth', // Handle line break
              'Passport/CNIC': 'Passport/CNIC',
              'Password': 'Password',
              'Gender': 'Gender',
              'Employee ID': 'Employee ID',
              'Joining Data': 'Joining Data',
              'Joining Date': 'Joining Data',
              'Joining Date (yyyy-mm-dd)': 'Joining Data',
              'Joining Date\n(yyyy-mm-dd)': 'Joining Data', // Handle line break
              'Branch': 'Branch',
              'Department': 'Department',
              'Designations': 'Designations',
              'Reporting Manager': 'Reporting Manager',
              'Work Policy': 'Work Policy',
              'Employment Status': 'Employment Status',
              'Salary Template': 'Salary Template'
            };
            // Map any "Mobile No (...)" variant to "Mobile No" (e.g. Excel template with example number)
            const getMappedHeader = (normalized, original) => {
              const raw = (original !== undefined && original !== null) ? original.toString().replace(/\n/g, ' ').trim() : '';
              if (/^Mobile No(\s*\([^)]*\))?$/i.test(normalized) || /^Mobile No(\s*\([^)]*\))?$/i.test(raw)) {
                return 'Mobile No';
              }
              return headerMapping[normalized] || headerMapping[raw] || normalized;
            };

            // Filter out empty rows - only keep rows with actual data
            const nonEmptyRows = rows.filter((row, index) => {
              // Check if row has any non-empty values
              const hasData = row.some(cell => {
                if (cell === null || cell === undefined) return false;
                const cellValue = cell.toString().trim();
                return cellValue !== '' && cellValue !== '-';
              });
              return hasData;
            });

            const formattedData = nonEmptyRows.map((row, index) => {
              const obj = {};
              headers.forEach((header, colIndex) => {
                const cellValue = row[colIndex];
                // Normalize the header and map it to our expected column name
                const normalizedHeader = normalizeHeader(header);
                const mappedHeader = getMappedHeader(normalizedHeader, header);

                // Only add non-empty values, skip empty cells
                if (cellValue !== null && cellValue !== undefined && cellValue.toString().trim() !== '') {
                  // Convert date fields to proper format
                  if (mappedHeader === 'Date of Birth' || mappedHeader === 'Joining Data') {
                    obj[mappedHeader] = convertDateFormat(cellValue);
                  } else if (mappedHeader === 'Mobile No') {
                    // Excel may return mobile as number; ensure string and optional + prefix for display
                    const raw = typeof cellValue === 'number' ? String(cellValue) : cellValue.toString().trim();
                    const digits = raw.replace(/\D/g, '');
                    obj[mappedHeader] = digits.length >= 10 && digits.startsWith('92') ? `+${digits}` : raw;
                  } else {
                    obj[mappedHeader] = cellValue;
                  }
                } else {
                  obj[mappedHeader] = ''; // Empty string for empty cells
                }
              });
              obj.rowIndex = index + 1; // Add row number for reference
              return obj;
            });

            resolve(formattedData);
          } else {
            resolve([]);
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  // Submit data to backend
  const handleSubmit = async () => {
    if (importedData.length === 0) {
      showToast('No data to submit', 'error');
      return;
    }

    try {
      setIsUploading(true);

      // Validate data
      const validationErrors = validateData(importedData);
      if (validationErrors.length > 0) {
        showToast(`Validation errors found: ${validationErrors.join(', ')}`, 'error');
        return;
      }

      // If we have a selected file, use it for submission
      if (selectedFile) {
        // Transform the imported data to convert names to IDs before creating Excel
        const transformedData = importedData.map(row => {
          const transformedRow = { ...row };

          // Convert Branch name to ID
          if (row['Branch']) {
            const branch = empBranches.find(b => b.branch_name === row['Branch']);
            transformedRow['Branch'] = branch ? branch.id.toString() : '';
          }

          // Convert Department name to ID
          if (row['Department']) {
            const deptOptions = flattenOptions(dept_subDept);
            const dept = deptOptions.find(d => d.label === row['Department']);
            transformedRow['Department'] = dept ? dept.value.toString() : '';
          }

          // Convert Designation name to ID (check both 'Designations' and 'Designation' fields)
          if (row['Designations'] || row['Designation']) {
            const designationValue = row['Designations'] || row['Designation'];
            const designation = designations.find(d => d.title === designationValue);
            transformedRow['Designations'] = designation ? designation.id.toString() : '';
            transformedRow['Designation'] = designation ? designation.id.toString() : '';
          }

          // Convert Reporting Manager name to ID
          if (row['Reporting Manager']) {
            const manager = empManager.find(m => m.name === row['Reporting Manager']);
            transformedRow['Reporting Manager'] = manager ? manager.id.toString() : '0';
          } else {
            transformedRow['Reporting Manager'] = '0';
          }

          // Convert Work Policy name to ID
          if (row['Work Policy']) {
            const policy = policies.find(p => p.policy_name === row['Work Policy']);
            transformedRow['Work Policy'] = policy ? policy.id.toString() : '';
          }

          // Convert Salary Template name to ID
          if (row['Salary Template']) {
            const template = salaryTemplate.find(t => t.name === row['Salary Template']);
            transformedRow['Salary Template'] = template ? template.id.toString() : '';
          }

          return transformedRow;
        });

        // Create Excel file from transformed data
        const worksheet = XLSX.utils.json_to_sheet(transformedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const file = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        const formData = new FormData();
        formData.append('file', file);

        const response = await employeesApi.addBulkEmployees(formData);

        if (response?.data?.STATUS === "SUCCESSFUL" || response?.STATUS === "SUCCESSFUL") {
          showToast('Employees uploaded successfully!', 'success');
          // Reset form
          setSelectedFile(null);
          setFileName("No file chosen");
          setImportedData([]);
          setShowTable(false);
          setFileImported(false); // Reset import status
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          showToast(response?.data?.ERROR_DESCRIPTION || response?.MESSAGE || 'Failed to upload employees', 'error');
        }
      } else {
        // Handle manually entered data - create Excel file from table data
        // Transform data to convert names to IDs before creating Excel
        const transformedData = importedData.map(row => {
          const transformedRow = { ...row };

          // Convert Branch name to ID
          if (row['Branch']) {
            const branch = empBranches.find(b => b.branch_name === row['Branch']);
            transformedRow['Branch'] = branch ? branch.id.toString() : '';
          }

          // Convert Department name to ID
          if (row['Department']) {
            const deptOptions = flattenOptions(dept_subDept);
            const dept = deptOptions.find(d => d.label === row['Department']);
            transformedRow['Department'] = dept ? dept.value.toString() : '';
          }

          // Convert Designation name to ID (check both 'Designations' and 'Designation' fields)
          if (row['Designations'] || row['Designation']) {
            const designationValue = row['Designations'] || row['Designation'];
            const designation = designations.find(d => d.title === designationValue);
            transformedRow['Designations'] = designation ? designation.id.toString() : '';
            transformedRow['Designation'] = designation ? designation.id.toString() : '';
          }

          // Convert Reporting Manager name to ID
          if (row['Reporting Manager']) {
            const manager = empManager.find(m => m.name === row['Reporting Manager']);
            transformedRow['Reporting Manager'] = manager ? manager.id.toString() : '0';
          } else {
            transformedRow['Reporting Manager'] = '0';
          }

          // Convert Work Policy name to ID
          if (row['Work Policy']) {
            const policy = policies.find(p => p.policy_name === row['Work Policy']);
            transformedRow['Work Policy'] = policy ? policy.id.toString() : '';
          }

          // Convert Salary Template name to ID
          if (row['Salary Template']) {
            const template = salaryTemplate.find(t => t.name === row['Salary Template']);
            transformedRow['Salary Template'] = template ? template.id.toString() : '';
          }

          return transformedRow;
        });

        const worksheet = XLSX.utils.json_to_sheet(transformedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const file = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

        const formData = new FormData();
        formData.append("file", file, "manual_employees.xlsx");

        const response = await employeesApi.addBulkEmployees(formData);

        if (response?.data?.STATUS === "SUCCESSFUL" || response?.STATUS === "SUCCESSFUL") {
          showToast('Employees uploaded successfully!', 'success');
          // Reset form
          setImportedData([]);
          setShowTable(false);
        } else {
          showToast(response?.data?.ERROR_DESCRIPTION || response?.MESSAGE || 'Failed to upload employees', 'error');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      showToast(error?.response?.data?.ERROR_DESCRIPTION || 'Failed to upload employees', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Validate imported data
  const validateData = (data) => {
    const errors = [];

    // Core required fields that must always be present
    const coreRequiredFields = [
      'Employee ID', 'Full Name', 'Father Name', 'Email'
    ];

    data.forEach((row, index) => {
      // Check if this row has any meaningful data (not just empty strings)
      const hasData = Object.keys(row).some(key =>
        key !== 'rowIndex' &&
        row[key] &&
        row[key].toString().trim() !== '' &&
        row[key].toString().trim() !== 'undefined' &&
        row[key].toString().trim() !== 'null'
      );

      // Only validate rows that have actual data
      if (hasData) {
        // Check core required fields
        coreRequiredFields.forEach(field => {
          if (!row[field] || row[field].toString().trim() === '') {
            errors.push(`Row ${index + 1}: ${field} is required`);
          }
        });

        // Check essential fields for data rows
        const essentialFields = [
          'Mobile No', 'Date of Birth', 'Joining Data', 'Branch', 'Department'
        ];

        essentialFields.forEach(field => {
          if (row.hasOwnProperty(field) && (!row[field] || row[field].toString().trim() === '')) {
            errors.push(`Row ${index + 1}: ${field} is required when adding employee data`);
          }
        });
      }
    });

    return errors;
  };

  // Get table headers from imported data
  const getTableHeaders = () => {
    if (importedData.length > 0) {
      return Object.keys(importedData[0]).filter(key => key !== 'rowIndex');
    }
    return [];
  };

  return (
    <div className="py-4">
      <div className="space-y-6">
        {/* File Upload Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="space-y-4">
            {/* Choose File Section */}
            <div className="space-y-2">
              <label className="text-[14px] font-medium text-[#474747] font-Urbanist">
                Choose Excel Sheet Containing the data.
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Choose File
                  </label>
                  <span className="ml-3 text-sm text-gray-500">{fileName}</span>
                </div>
                <Button
                  className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  onClick={handleImport}
                  disabled={!selectedFile || isUploading}
                  loading={isUploading}
                >
                  <FaUpload className="text-sm" />
                  {isUploading ? 'Importing...' : 'IMPORT'}
                </Button>
              </div>
            </div>

            {/* Template Download Section */}
            {!fileImported && (
              <div className="border-t pt-4 space-y-2">
                <p className="text-[14px] font-normal text-[#474747] font-Urbanist">Excel Template For Data Insertion.</p>
                <Button
                  className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-green-400 text-white rounded-md hover:bg-green-700 font-Urbanist text-[12px] font-medium"
                  onClick={handleDownloadTemplate}
                >
                  <FaDownload className="text-sm" />
                  Download Excel Template
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Data Table Section */}
        {showTable && (
          <div className="w-full bg-white rounded-[10px] p-2 drop-shadow-md">
            {/* Table */}
            <div className="overflow-auto customScroll">
              <table className="w-full">
                <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
                  <tr>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Row
                    </th> */}
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Mobile No
                    </th>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Email
                    </th>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Full Name
                    </th>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Father Name
                    </th>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Mobile Network
                    </th>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Date of Birth
                    </th>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Passport/CNIC
                    </th>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Password
                    </th>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Gender
                    </th>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Employee ID
                    </th>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Joining Data
                    </th>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Branch
                    </th>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Department
                    </th>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Designations
                    </th>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Reporting Manager
                    </th>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Work Policy
                    </th>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Employment Status
                    </th>
                    <div>
                      <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                        Salary Template
                      </th>
                    </div>
                    <th className="text-[#474747] font-medium leading-none capitalize text-[clamp(12px,0.9vw,14px)] whitespace-nowrap font-Urbanist p-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="">
                  {importedData.length > 0 ? (
                    importedData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {row.rowIndex}
                        </td> */}
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <input
                            type="text"
                            value={row['Mobile No'] || ''}
                            onChange={(e) => handleCellChange(rowIndex, 'Mobile No', e.target.value)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist"
                            placeholder="+92XXXXXXXXXX"
                          />
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <input
                            type="email"
                            value={row['Email'] || ''}
                            onChange={(e) => handleCellChange(rowIndex, 'Email', e.target.value)}
                            className="w-40 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="email@example.com"
                          />
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <input
                            type="text"
                            value={row['Full Name'] || ''}
                            onChange={(e) => handleCellChange(rowIndex, 'Full Name', e.target.value)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Full Name"
                          />
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <input
                            type="text"
                            value={row['Father Name'] || ''}
                            onChange={(e) => handleCellChange(rowIndex, 'Father Name', e.target.value)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Father Name"
                          />
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <select
                            value={row['Mobile Network'] || ''}
                            onChange={(e) => handleCellChange(rowIndex, 'Mobile Network', e.target.value)}
                            className="w-36 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Network</option>
                            <option value="Mobilink-PK">Mobilink-PK</option>
                            <option value="Telenor-PK">Telenor-PK</option>
                            <option value="Jazz-PK">Jazz-PK</option>
                            <option value="Zong-PK">Zong-PK</option>
                            <option value="Ufone-PK">Ufone-PK</option>
                          </select>
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <input
                            type="date"
                            value={convertDateFormat(row['Date of Birth']) || ''}
                            onChange={(e) => handleCellChange(rowIndex, 'Date of Birth', e.target.value)}
                            className="w-36 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <input
                            type="text"
                            value={row['Passport/CNIC'] || ''}
                            onChange={(e) => handleCellChange(rowIndex, 'Passport/CNIC', e.target.value)}
                            className="w-36 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="CNIC/Passport"
                          />
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <input
                            type="text"
                            value={row['Password'] || ''}
                            onChange={(e) => handleCellChange(rowIndex, 'Password', e.target.value)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Password"
                          />
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <select
                            value={row['Gender'] || ''}
                            onChange={(e) => handleCellChange(rowIndex, 'Gender', e.target.value)}
                            className="w-28 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                          </select>
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <input
                            type="text"
                            value={row['Employee ID'] || ''}
                            onChange={(e) => handleCellChange(rowIndex, 'Employee ID', e.target.value)}
                            className="w-28 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Employee ID"
                          />
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <input
                            type="date"
                            value={convertDateFormat(row['Joining Data']) || ''}
                            onChange={(e) => handleCellChange(rowIndex, 'Joining Data', e.target.value)}
                            className="w-36 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 relative group" style={{ width: '20px', minWidth: '20px', visibility: rowIndex === 0 ? 'visible' : 'hidden' }}>
                              {rowIndex === 0 && (
                                <>
                                  <input
                                    type="checkbox"
                                    id={`branch-checkbox-${rowIndex}`}
                                    checked={branchCheckboxes[rowIndex] || false}
                                    onChange={(e) => handleBranchCheckboxChange(rowIndex, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 shadow-lg pointer-events-none">
                                    Apply below to all
                                    <span className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></span>
                                  </div>
                                </>
                              )}
                            </div>
                            <select
                              value={row['Branch'] || ''}
                              onChange={(e) => handleBranchChange(e.target.value, rowIndex)}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Branch</option>
                              {empBranches.map(branch => (
                                <option key={branch.id} value={branch.branch_name}>{branch.branch_name}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 relative group" style={{ width: '20px', minWidth: '20px', visibility: rowIndex === 0 ? 'visible' : 'hidden' }}>
                              {rowIndex === 0 && (
                                <>
                                  <input
                                    type="checkbox"
                                    id={`department-checkbox-${rowIndex}`}
                                    checked={departmentCheckboxes[rowIndex] || false}
                                    onChange={(e) => handleDepartmentCheckboxChange(rowIndex, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 shadow-lg pointer-events-none">
                                    Apply below to all
                                    <span className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></span>
                                  </div>
                                </>
                              )}
                            </div>
                            <select
                              value={row['Department'] || ''}
                              onChange={(e) => handleDepartmentChange(e.target.value, rowIndex)}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Department</option>
                              {flattenOptions(dept_subDept).map(dept => (
                                <option key={dept.value} value={dept.label}>{dept.label}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 relative group" style={{ width: '20px', minWidth: '20px', visibility: rowIndex === 0 ? 'visible' : 'hidden' }}>
                              {rowIndex === 0 && (
                                <>
                                  <input
                                    type="checkbox"
                                    id={`designation-checkbox-${rowIndex}`}
                                    checked={designationCheckboxes[rowIndex] || false}
                                    onChange={(e) => handleDesignationCheckboxChange(rowIndex, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 shadow-lg pointer-events-none">
                                    Apply below to all
                                    <span className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></span>
                                  </div>
                                </>
                              )}
                            </div>
                            <select
                              value={row['Designations'] || ''}
                              onChange={(e) => handleDesignationChange(e.target.value, rowIndex)}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Designation</option>
                              {designations.map(designation => (
                                <option key={designation.id} value={designation.title}>{designation.title}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 relative group" style={{ width: '20px', minWidth: '20px', visibility: rowIndex === 0 ? 'visible' : 'hidden' }}>
                              {rowIndex === 0 && (
                                <>
                                  <input
                                    type="checkbox"
                                    id={`reporting-manager-checkbox-${rowIndex}`}
                                    checked={reportingManagerCheckboxes[rowIndex] || false}
                                    onChange={(e) => handleReportingManagerCheckboxChange(rowIndex, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 shadow-lg pointer-events-none">
                                    Apply below to all
                                    <span className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></span>
                                  </div>
                                </>
                              )}
                            </div>
                            <select
                              value={row['Reporting Manager'] || ''}
                              onChange={(e) => handleReportingManagerChange(e.target.value, rowIndex)}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Manager</option>
                              {Array.isArray(empManager) ? empManager.map(manager => (
                                <option key={manager.id} value={manager.name}>{manager.name}</option>
                              )) : []}
                            </select>
                          </div>
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 relative group" style={{ width: '20px', minWidth: '20px', visibility: rowIndex === 0 ? 'visible' : 'hidden' }}>
                              {rowIndex === 0 && (
                                <>
                                  <input
                                    type="checkbox"
                                    id={`work-policy-checkbox-${rowIndex}`}
                                    checked={workPolicyCheckboxes[rowIndex] || false}
                                    onChange={(e) => handleWorkPolicyCheckboxChange(rowIndex, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 shadow-lg pointer-events-none">
                                    Apply below to all
                                    <span className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></span>
                                  </div>
                                </>
                              )}
                            </div>
                            <select
                              value={row['Work Policy'] || ''}
                              onChange={(e) => handleWorkPolicyChange(e.target.value, rowIndex)}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Policy</option>
                              {policies.map(policy => (
                                <option key={policy.id} value={policy.policy_name}>{policy.policy_name}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <select
                            value={row['Employment Status'] || ''}
                            onChange={(e) => handleCellChange(rowIndex, 'Employment Status', e.target.value)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Status</option>
                            {contractData.map(status => (
                              <option key={status.id} value={status.name}>{status.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 relative group" style={{ width: '20px', minWidth: '20px', visibility: rowIndex === 0 ? 'visible' : 'hidden' }}>
                              {rowIndex === 0 && (
                                <>
                                  <input
                                    type="checkbox"
                                    id={`salary-template-checkbox-${rowIndex}`}
                                    checked={salaryTemplateCheckboxes[rowIndex] || false}
                                    onChange={(e) => handleSalaryTemplateCheckboxChange(rowIndex, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                  />
                                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 shadow-lg pointer-events-none">
                                    Apply below to all
                                    <span className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></span>
                                  </div>
                                </>
                              )}
                            </div>
                            <select
                              value={row['Salary Template'] || ''}
                              onChange={(e) => handleSalaryTemplateSelectChange(e.target.value, rowIndex)}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Template</option>
                              {salaryTemplate.map(template => (
                                <option key={template.id} value={template.name}>{template.name}</option>
                              ))}
                            </select>
                            <button
                              className="text-sm font-medium bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 transition-colors"
                              onClick={(e) => handleOpenSalaryTemplateDrawer(e, rowIndex)}
                              type="button"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="font-normal text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] font-Urbanist p-4 border-b border-[#F2F2F9]">
                          <button
                            onClick={() => handleDeleteRow(rowIndex)}
                            className="text-red-600 flex justify-center align-center ml-4  hover:text-red-900 text-sm font-medium"
                          >
                            <FaTrashCan size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="19" className="px-6 py-8 text-center text-gray-500">
                        No employee data available. Click "Add Row" to start entering employee information.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Action Buttons at Bottom */}
            <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <Button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={handleAddRow}
              >
                Add Row
              </Button>
              <Button
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                onClick={handleSubmit}
                disabled={isUploading || importedData.length === 0}
                loading={isUploading}
              >
                <FaFileExcel className="text-sm" />
                {isUploading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Salary Template Drawer */}
      {showSalaryTemplateDrawer && (
        <PortalDrawer
          open={showSalaryTemplateDrawer}
          closeDrawer={handleCloseSalaryTemplateDrawer}
          title="New Salary Template"
          widthSize={620}
          compo={
            <form onSubmit={handleSalaryTemplateSubmit} className="pt-8">
              <div className="flex flex-col space-y-6">
                {/* Template Name */}
                <div className="block">
                  <Input
                    label="Template Name"
                    color="blue"
                    name="template_name"
                    value={salaryTemplateForm.template_name}
                    onChange={handleSalaryTemplateChange}
                    required
                  />
                </div>

                {/* Branch Selection */}
                <div className="block">
                  <label className="text-[#698592] text-sm mb-3 block">Branch</label>
                  <div className="flex gap-6">
                    <Radio
                      label="Selected Branch"
                      name="branch_option"
                      value="selected"
                      checked={salaryTemplateForm.branch_option === 'selected'}
                      onChange={(e) => handleBranchOptionChange(e.target.value)}
                      color="blue"
                    />
                    <Radio
                      label="All Branch"
                      name="branch_option"
                      value="all"
                      checked={salaryTemplateForm.branch_option === 'all'}
                      onChange={(e) => handleBranchOptionChange(e.target.value)}
                      color="blue"
                    />
                  </div>
                </div>

                {/* Salary Amount */}
                <div className="block">
                  <Input
                    label="Salary Amount"
                    color="blue"
                    name="salary_amount"
                    type="number"
                    value={salaryTemplateForm.salary_amount}
                    onChange={handleSalaryTemplateChange}
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-start pt-4">
                  <Button
                    type="submit"
                    color="blue"
                    className="capitalize"
                    disabled={isCreatingSalaryTemplate}
                    loading={isCreatingSalaryTemplate}
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </form>
          }
        />
      )}
    </div>
  );
};

export default AddBulkEmployee;

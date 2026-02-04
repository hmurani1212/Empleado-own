import { useEffect, useState } from "react"
import * as XLSX from "xlsx";
import useStore from "../../Store/store"
import employeesApi from "../../Model/Data/Employees/Employees";
import { formatDateYMD } from "../../services/__dateTimeServices";
import countryData from "../../View/country/country_list";

const useBulkService = () => {
    const gettingCountries = useStore((state) => state.gettingCountries)
    const allCountries = useStore((state) => state.allCountries)
    const gettingUtilsBranches = useStore((state) => state.gettingUtilsBranches)
    const utilsBranches = useStore((state) => state.utilsBranches)
    const showExcelTable = useStore((state) => state.showExcelTable)
    const toggleOffExcelTable = useStore((state) => state.toggleOffExcelTable)
    const toggleShowExcelTable = useStore((state) => state.toggleShowExcelTable)

    const [checkedState, setCheckedState] = useState({})

    const [bulkOptionsDbData, setBulkOptionsDbData] = useState({
        15: [ // Gender options
            { name: 'Male', id: 1 },
            { name: 'Female', id: 0 },
        ],
        11: [ // Mobile Network options
            { id: 1, name: 'Jazz' },
            { id: 2, name: 'Zong' },
            { id: 3, name: 'Telenor' },
        ],
        1: countryData.map(country => ({
            id: country.id,
            name: country.country_name,
            code: country.country_code,
            phonecode: country.phonecode
        })),  // Country Code - populated from local country data
        2: [],  // Branch - will be populated from API
        3: {},  // Department - will be populated from API based on branch
        4: {},  // Designations - will be populated from API based on department
        5: {},  // Working Policy - will be populated from API based on branch
        6: {},  // Salary Template - will be populated from API based on branch
    })

    const [bulkFile, setBulkFile] = useState({
        excelFile: '',
        dynamicData: [],
        showTable: false
    })

    const bulkTableHead = [
        { id: 7, title: 'Mobile No', type: 'text' },
        { id: 8, title: 'Email', type: 'text' },
        { id: 9, title: 'Full Name', type: 'text' },
        { id: 10, title: 'Father Name', type: 'text' },
        { id: 1, title: 'Country Code', type: 'select' },
        { id: 11, title: 'Mobile Network', type: 'select' },
        { id: 12, title: 'Date of Birth', type: 'date' },
        { id: 13, title: 'Passport/CNIC', type: 'text' },
        { id: 14, title: 'Password', type: 'text' },
        { id: 15, title: 'Gender', type: 'select' },
        { id: 2, title: 'Branch', type: 'select' },
        { id: 3, title: 'Department', type: 'select' },
        { id: 4, title: 'Designations', type: 'select' },
        { id: 5, title: 'Working Ploicy', type: 'select' },
        { id: 6, title: 'Salary Template', type: 'select' },
        { id: 17, title: 'Employee ID', type: 'text' },
        { id: 18, title: 'Joining Data', type: 'date' },
    ];

    // Initialize empty bulkFormValue with all fields
    const [bulkFormValue, setBulkFormValue] = useState(() => {
        const initialValue = {};
        bulkTableHead.forEach(header => {
            initialValue[header.id] = [];
        });
        return initialValue;
    });

    const handleExcelChange = (e) => {
        const file = e.target.files[0]
        setBulkFile((prevState) => ({
            ...prevState,
            excelFile: file,
            showTable: false
        }))
    }

    // Effect to initialize and update branch data
    useEffect(() => {
        const initializeBranchData = async () => {
            // Only call if branches data is not already available
            if (!utilsBranches || utilsBranches.length === 0) {
                await gettingUtilsBranches();
            }
            if (utilsBranches && utilsBranches.length > 0) {
                const formattedBranches = utilsBranches.map(branch => ({
                    id: branch.id,
                    name: branch.branch_name
                }));
                setBulkOptionsDbData(prev => ({
                    ...prev,
                    2: formattedBranches
                }));
            }
        };
        initializeBranchData();
    }, [gettingUtilsBranches, utilsBranches]);
    //   console.log("allCountries", allCountries)
    // Effect to update branch data when utilsBranches changes
    useEffect(() => {
        if (utilsBranches && utilsBranches.length > 0) {
            const formattedBranches = utilsBranches.map(branch => ({
                id: branch.id,
                name: branch.branch_name
            }));
            setBulkOptionsDbData(prev => ({
                ...prev,
                2: formattedBranches
            }));
        }
    }, [utilsBranches]);
//    console.log("allCountries", allCountries)
    const handleConvert = async () => {
        if (bulkFile.excelFile) {
            // Initialize with one empty row
            setBulkFile(prev => ({
                ...prev,
                dynamicData: [{}],
                showTable: true
            }));

            // Initialize form values for one row
            const newFormValue = {};
            bulkTableHead.forEach(header => {
                newFormValue[header.id] = [''];
            });
            setBulkFormValue(newFormValue);

            toggleShowExcelTable();
        }
    }

    const createEmptyObject = () => {
        setBulkFile(prev => ({
            ...prev,
            dynamicData: [...prev.dynamicData, {}]
        }));

        setBulkFormValue(prev => {
            const newState = { ...prev };
            Object.keys(newState).forEach(key => {
                newState[key] = [...(newState[key] || []), ''];
            });
            return newState;
        });
    }

    const handleChangeSelect = (id, data, rowIndex) => {
        const { value } = data.target;

        setBulkFormValue((prevState) => {
            const updatedState = { ...prevState };
            if (!updatedState[id]) {
                updatedState[id] = [];
            }
            updatedState[id][rowIndex] = value;

            // Fix: Reset dependent selects when parent changes
            if (id === 2) { // Branch selection
                // Clear department and designation for this row
                if (updatedState[3]) updatedState[3][rowIndex] = '';
                if (updatedState[4]) updatedState[4][rowIndex] = '';
            }
            if (id === 3) { // Department selection
                // Clear designation for this row
                if (updatedState[4]) updatedState[4][rowIndex] = '';
            }

            if (checkedState[id] && checkedState[id][rowIndex]) {
                for (let i = rowIndex; i < updatedState[id].length; i++) {
                    updatedState[id][i] = value;
                }
            }
            return updatedState;
        });

        // Handle dependent dropdowns
        switch (id) {
            case 2: // Branch selection
                if (value !== '') {
                    gettingDepartments(value, rowIndex);
                    gettingPolicies(value, rowIndex);
                    gettingSalayTemplate(value, rowIndex);
                }
                break;
            case 3: // Department selection
                if (value !== '') {
                    gettingDesignation(value, rowIndex);
                }
                break;
            default:
                break;
        }
    }

    const handleInputChange = (e, headerId, rowIndex) => {
        const value = e.target.value;
        setBulkFormValue(prevState => ({
            ...prevState,
            [headerId]: [
                ...(prevState[headerId] || []).slice(0, rowIndex),
                value,
                ...(prevState[headerId] || []).slice(rowIndex + 1)
            ]
        }));
    }

    const handleBulkCalendar = (selected, id, rowIndex) => {
        setBulkFormValue(prevState => ({
            ...prevState,
            [id]: [
                ...(prevState[id] || []).slice(0, rowIndex),
                formatDateYMD(selected),
                ...(prevState[id] || []).slice(rowIndex + 1)
            ]
        }));
    }

    const handleCheckBox = (headerID, rowIndex, rowData, data) => {
        const newCheckedState = { ...checkedState };
        newCheckedState[headerID] = newCheckedState[headerID] || {};
        const currentCheckedState = newCheckedState[headerID][rowIndex];
        const newState = !currentCheckedState;

        for (let i = rowIndex; i < data.length; i++) {
            newCheckedState[headerID][i] = newState;
        }

        setCheckedState(newCheckedState);
    }

    // API call functions
    const gettingDepartments = async (id, rowIndex) => {
        const data = { parent_id: 0, branchId: id, getAll: true }
        try {
            const response = await employeesApi.gettingSubDepts(data)
            if (response.status === 200 && response.data.STATUS === "SUCCESSFUL") {
                // Ensure we're storing the array of departments directly
                const departments = response.data.DB_DATA || [];
                setBulkOptionsDbData((prevState) => ({
                    ...prevState,
                    3: { 
                        ...prevState[3], 
                        [rowIndex]: departments.map(dept => ({
                            id: dept.id,
                            name: dept.dept_name || dept.name || '',
                            dept_name: dept.dept_name || dept.name || '',
                            // Include any other necessary fields
                        }))
                    }
                }))
            }
        } catch (err) {
            console.error('Error fetching departments:', err);
            // Set empty array on error
            setBulkOptionsDbData((prevState) => ({
                ...prevState,
                3: { ...prevState[3], [rowIndex]: [] }
            }));
        }
    }

    const gettingPolicies = async (id, rowIndex) => {
        const data = { branch_id: id }
        try {
            const response = await employeesApi.getPolicies(data)
            if (response.status === 200 && response.data.STATUS === "SUCCESSFUL") {
                setBulkOptionsDbData((prevState) => ({
                    ...prevState,
                    5: { ...prevState[5], [rowIndex]: response.data.DB_DATA }
                }))
            }
        } catch (err) {
            console.error('Error fetching policies:', err);
        }
    }

    const gettingSalayTemplate = async (id, rowIndex) => {
        const data = { bid: id }
        try {
            const response = await employeesApi.getSalaryTemplate(data)
            if (response.status === 200 && response.data.STATUS === "SUCCESSFUL") {
                setBulkOptionsDbData((prevState) => ({
                    ...prevState,
                    6: { ...prevState[6], [rowIndex]: response.data.DB_DATA }
                }))
            }
        } catch (err) {
            console.error('Error fetching salary template:', err);
        }
    }

    const gettingDesignation = async (id, rowIndex) => {
        const data = { d_id: id }
        try {
            const response = await employeesApi.getDesignations(data)
            if (response.status === 200 && response.data.STATUS === "SUCCESSFUL") {
                // Extract designations array from DB_DATA and format it
                const designations = response.data.DB_DATA?.designations || [];
                setBulkOptionsDbData((prevState) => ({
                    ...prevState,
                    4: { 
                        ...prevState[4], 
                        [rowIndex]: designations.map(designation => ({
                            id: designation.id,
                            name: designation.title || '', // Use title as the display name
                            title: designation.title || '' // Also keep title for compatibility
                        }))
                    }
                }))
            }
        } catch (err) {
            console.error('Error fetching designations:', err);
            // Set empty array on error
            setBulkOptionsDbData((prevState) => ({
                ...prevState,
                4: { ...prevState[4], [rowIndex]: [] }
            }));
        }
    }

    const uploadBulkRecord = () => {
        // Convert bulkFormValue to Excel format
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(
            bulkFormValue[Object.keys(bulkFormValue)[0]].map((_, index) => {
                const row = {};
                bulkTableHead.forEach(header => {
                    row[header.title] = bulkFormValue[header.id]?.[index] || '';
                });
                return row;
            })
        );
        XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
        XLSX.writeFile(workbook, "bulk_employees.xlsx");
    }

    return {
        handleExcelChange,
        bulkFile,
        handleConvert,
        bulkTableHead,
        createEmptyObject,
        bulkOptionsDbData,
        handleChangeSelect,
        toggleOffExcelTable,
        toggleShowExcelTable,
        showExcelTable,
        handleInputChange,
        handleBulkCalendar,
        handleCheckBox,
        checkedState,
        uploadBulkRecord,
        bulkFormValue
    }
}

export default useBulkService
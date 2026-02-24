import { Button, Option, Select } from '@material-tailwind/react'
import React, { useEffect, useState } from 'react'
import { BiSearch } from 'react-icons/bi'
import { TbFileExport } from 'react-icons/tb'
import { FaListUl } from 'react-icons/fa'
import { IoGrid } from 'react-icons/io5'
import { alphabetsArray } from '../../services/__appServicesData'
import EmployeesList from './EmployeesList'
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices'
import GridEmployee from './GridEmployee'
import { motion } from 'framer-motion'
import useDropdownService from '../../services/__dropDownHoverService'
import { exportEmployeesToExcel } from '../../services/EmpServices'
import { showToast } from '../../Components/Toaster/Toaster'
import employeesApi from '../../Model/Data/Employees/Employees'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'

// Custom Branch Select Component with Animations
const CustomBranchSelect = ({ label, value, options = [], onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const selectedOption = (options && Array.isArray(options) && options.length > 0) 
        ? (options.find(option => option.value === value) || options.find(opt => opt.value === "") || { label: "All Branches" })
        : { label: "All Branches" };

    const handleToggle = () => {
        if (isAnimating) return;
        
        setIsAnimating(true);
        if (isOpen) {
            setIsOpen(false);
            setTimeout(() => setIsAnimating(false), 200);
        } else {
            setIsOpen(true);
            setTimeout(() => setIsAnimating(false), 200);
        }
    };

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsAnimating(true);
        setIsOpen(false);
        setTimeout(() => setIsAnimating(false), 200);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !event.target.closest('.custom-branch-select')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative custom-branch-select w-full">
            <div className="relative">
                <button
                    type="button"
                    className={`w-full h-10 px-3 py-2 text-sm text-gray-700 font-medium rounded-lg shadow-sm bg-white text-left transition-all duration-200 border border-gray-200 hover:border-brand-300 focus:ring-2 focus:ring-brand-100 ${
                        isOpen ? 'border-brand-500 ring-2 ring-brand-100' : ''
                    }`}
                    onClick={handleToggle}
                >
                    <div className="flex justify-between items-center">
                        <span className="truncate">{selectedOption.label}</span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </button>

                {/* Animated Dropdown */}
                <div
                    className={`absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden origin-top ${
                        isOpen 
                            ? 'opacity-100 visible scale-100' 
                            : 'opacity-0 invisible scale-95'
                    } transition-all duration-200 ease-out`}
                >
                    <div className="py-1 max-h-60 overflow-y-auto customScroll">
                        {options && Array.isArray(options) && options.length > 0 ? (
                            options.map((option) => (
                                <button
                                    key={option.value || Math.random()}
                                    type="button"
                                    className={`w-full px-4 py-2 text-sm text-left hover:bg-brand-50 hover:text-brand-700 transition-colors duration-150 ${
                                        value === option.value ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-700'
                                    }`}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    {option.label || option.value || 'Unknown'}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">No options available</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AllEmployess = () => {
    const { allEmployees, employeesListLoading, empMount,  getAllDepartments,  handleFilterChange, handleFilterDeptChange,
        handleListToggle,handleGridToggle,listView, handleChangeEmployees, empStatus, handleStatusFilter, handelAlphabetSearch, alphaIndex,
        toggleMenuValue,openMenuValue, getEmployeesWithFilters, paginationData, goToNextPage, goToPreviousPage, goToPage,
    empBranches, fetchingAllBranches, setInitialStatus, filterValues } = useEmployees()

    const { getDropdownPosition, triggerRefs } = useDropdownService()
    
    // Add state for filtered employees and no results message
    const [filteredEmployees, setFilteredEmployees] = useState(null);
    const [noResults, setNoResults] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('Active Employees'); // Default to Active Employees title
    const [selectedAlphabetLetter, setSelectedAlphabetLetter] = useState('');

    useEffect(() => {
        // Call API only when the component is mounted (initial load or page refresh)
        if(!empMount){
            // Only call the 2 required APIs
            // console.log('Setting default status to Active Employees:', selectedStatus);
            setInitialStatus('1'); // Set initial status to Active Employees
            getEmployeesWithFilters({ status: '1' }); // Initial fetch with Active Employees filter - calls employees?page=1&status=1
            fetchingAllBranches(); // calls get_branch_employee
        }
    }, []);

    // Update filteredEmployees when allEmployees changes
    useEffect(() => {
            //    console.log("herllo", allEmployees)
        if (allEmployees?.STATUS === "ERROR") {
            setFilteredEmployees({
                ...allEmployees,
                employees: []
            });
            setNoResults(true);
        } else {
            setFilteredEmployees(allEmployees);
            setNoResults(false);
        }
    }, [allEmployees]);

    const handleExportExcel = async () => {
        try {
            setIsExporting(true);

            const status = selectedStatus === 'Active Employees' ? '1' : selectedStatus === 'Inactive Employees' ? '0' : selectedStatus === 'All Employees' ? '3' : '1';
            const branchId = filterValues?.branchName && empBranches?.length ? empBranches.find((b) => b.branch_name === filterValues.branchName)?.id : undefined;
            const text = (filterValues?.searchEmployee && String(filterValues.searchEmployee).trim()) || selectedAlphabetLetter || undefined;

            const filters = { pages: 'all', status };
            if (branchId) filters.branch_id = branchId;
            if (text) filters.text = text;

            const response = await employeesApi.getEmployeesWithFilters(filters);
            const data = response?.data;

            if (data?.STATUS === 'SUCCESSFUL' && data?.DB_DATA?.employees?.length > 0) {
                const statusFilter = selectedStatus === 'Active Employees' ? 'active' : selectedStatus === 'Inactive Employees' ? 'inactive' : 'all';
                await exportEmployeesToExcel(data.DB_DATA, { statusFilter });
                showToast('Employees exported successfully', 'success');
            } else {
                showToast(data?.DB_DATA?.employees?.length === 0 ? 'No employees match current filters to export' : 'No employees found to export', 'error');
            }
        } catch (error) {
            console.error('Export error:', error);
            showToast('Failed to export employees', 'error');
        } finally {
            setIsExporting(false);
        }
    };

    // New function to handle alphabet filtering
    const handleAlphabetFilter = (letter, index) => {
        handelAlphabetSearch(letter, index);
        if (index === 0) {
            setSelectedAlphabetLetter('');
            const currentStatus = selectedStatus === 'Active Employees' ? '1' : 
                                selectedStatus === 'Inactive Employees' ? '0' : 
                                selectedStatus === 'All Employees' ? '3' : '1';
            getEmployeesWithFilters({ status: currentStatus, page: 1 });
            return;
        }
        setSelectedAlphabetLetter(letter);
        const currentStatus = selectedStatus === 'Active Employees' ? '1' : 
                            selectedStatus === 'Inactive Employees' ? '0' : 
                            selectedStatus === 'All Employees' ? '3' : '1';
        getEmployeesWithFilters({ text: letter, status: currentStatus, page: 1 });
    };

    return (
        <div className='flex flex-col gap-6 z-10 animate-fade-in-up'>
            {/* Filter Section */}
            <div className='bg-white rounded-xl shadow-soft p-5 border border-gray-100'>
                <div className='flex flex-col xl:flex-row items-end xl:items-center justify-between gap-4'>
                    <div className='flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto'>
                        <div className='w-full md:w-[200px]'>
                            <label className='text-gray-500 text-xs font-semibold mb-1.5 block uppercase tracking-wide'>Branch</label>
                            <CustomBranchSelect 
                                placeHolderTitle='Filter by Branch'
                                value={filterValues?.branchName || ""}
                                options={[
                                    { value: "", label: "All Branches" },
                                    ...(empBranches?.map((ele) => ({
                                        value: ele.branch_name,
                                        label: ele.branch_name,
                                        id: ele.id
                                    })) || [])
                                ]}
                                onChange={(selectedValue) => {
                                    if (selectedValue === "" || selectedValue === null || selectedValue === undefined) {
                                        handleFilterChange("branchName", "");
                                    } else {
                                        const selectedBranch = empBranches?.find(branch => branch.branch_name === selectedValue);
                                        if (selectedBranch) {
                                            handleFilterChange("branchName", selectedBranch);
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className='w-full md:w-[200px]'>
                            <label className='text-gray-500 text-xs font-semibold mb-1.5 block uppercase tracking-wide'>Status</label>
                            <div className="h-10">
                                <CustomSelect 
                                    placeHolderTitle='Employees Status'
                                    className='h-full' 
                                    value={(() => {
                                        const statusOptions = empStatus?.map((ele) => ({
                                            value: ele.title,
                                            label: ele.title,
                                            id: ele.id,
                                            status: ele.status
                                        })) || [];
                                        return statusOptions.find(opt => opt.value === selectedStatus) || 
                                            statusOptions.find(opt => opt.value === 'Active Employees') || 
                                            null;
                                    })()}
                                    onChangeHandler={(selectedOption)=>{
                                        if (!selectedOption) return;
                                        const val = selectedOption.value;
                                        const selectedOptionData = empStatus.find(option => option.title === val);
                                        if (selectedOptionData) {
                                            setSelectedStatus(val);
                                            if (val === "All Employees") {
                                                handleFilterChange("branchName", "");
                                            }
                                            handleStatusFilter(selectedOptionData);
                                        }
                                    }}
                                    options={empStatus?.map((ele) => ({
                                        value: ele.title,
                                        label: ele.title,
                                        id: ele.id,
                                        status: ele.status
                                    })) || []}
                                />
                            </div>
                        </div>
                        <div className='w-full md:w-[240px]'>
                            <label className='text-gray-500 text-xs font-semibold mb-1.5 block uppercase tracking-wide'>Search</label>
                            <div className="relative w-full h-10 group">
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 group-hover:text-brand-500 transition-colors">
                                    <BiSearch size={18} />
                                </div>
                                <input
                                    className="w-full h-full bg-white rounded-lg pl-3 pr-10 border border-gray-200 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all shadow-sm"
                                    placeholder="Search by name, ID, etc..." 
                                    name='searchEmployee' 
                                    onChange={handleChangeEmployees} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className='flex items-center gap-3 w-full xl:w-auto justify-end mt-4 xl:mt-0'>
                         <Button 
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg shadow-none normal-case font-medium text-sm transition-all ${
                                allEmployees?.STATUS === "ERROR" || !allEmployees?.employees?.length || isExporting
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                                    : "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 hover:shadow-sm"
                            }`}
                            onClick={handleExportExcel}
                            disabled={allEmployees?.STATUS === "ERROR" || !allEmployees?.employees?.length || isExporting}
                        >
                            {isExporting ? 'Exporting...' : 'Export Excel'}
                            <TbFileExport className='text-lg'/>
                        </Button>
                        <div className='flex bg-gray-100 p-1 rounded-lg border border-gray-200'>
                            <button 
                                className={`p-2 rounded-md transition-all ${listView ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={handleListToggle}
                            >
                                <FaListUl />
                            </button>
                            <button 
                                className={`p-2 rounded-md transition-all ${!listView ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={handleGridToggle}
                            >
                                <IoGrid />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alphabet Filter */}
            <div className='bg-white rounded-xl shadow-soft p-4 border border-gray-100 overflow-x-auto'>
                <div className='flex justify-between items-center min-w-[800px]'>
                    {alphabetsArray.map((ele, i) => (
                        <div key={i} className='flex items-center flex-1 justify-center relative group'>
                            <motion.button 
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAlphabetFilter(ele, i)}
                                className={`relative w-8 h-8 flex items-center justify-center text-xs font-semibold rounded-full transition-all duration-300 z-10 ${
                                    alphaIndex === i 
                                        ? "text-white shadow-md shadow-brand-500/30" 
                                        : "text-gray-500 hover:text-brand-600 hover:bg-brand-50"
                                }`}
                            >
                                {alphaIndex === i && (
                                    <motion.span
                                        layoutId="bubble-alpha"
                                        className="absolute inset-0 bg-brand-500 rounded-full -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                {ele}
                            </motion.button>
                            {/* Connector Line */}
                            {i !== alphabetsArray.length - 1 && (
                                <div className='absolute right-[-50%] w-full h-[1px] bg-gray-100 -z-0 top-1/2'></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            {listView ? 
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className='bg-white rounded-xl shadow-card p-1 border border-gray-100 overflow-hidden'
                >
                    <EmployeesList 
                        empListData={filteredEmployees || allEmployees}
                        loading={employeesListLoading}
                        getDropdownPosition={getDropdownPosition} 
                        triggerRefs={triggerRefs}
                        openMenuValue={openMenuValue}
                        toggleMenuValue={toggleMenuValue}
                        paginationData={paginationData}
                        onNextPage={goToNextPage}
                        onPreviousPage={goToPreviousPage}
                        onGoToPage={goToPage}
                        currentStatus={selectedStatus}
                    />
                </motion.div> 
                :
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className='pr-2 pb-10'
                >
                    <GridEmployee 
                        empListData={filteredEmployees || allEmployees}
                        loading={employeesListLoading}
                        paginationData={paginationData}
                        onNextPage={goToNextPage}
                        onPreviousPage={goToPreviousPage}
                        onGoToPage={goToPage}
                        currentStatus={selectedStatus}
                    />
                </motion.div>
            }
        </div>
    )
}

export default AllEmployess
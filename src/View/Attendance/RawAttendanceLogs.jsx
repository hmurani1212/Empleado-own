import React, { useEffect, useState } from 'react'
import CustomButton from '../../Components/CustomButton/CustomButton'
import useAttendance from '../../ViewModel/AttendanceViewModel/AttendanceServices'
import { Typography } from '@material-tailwind/react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { getAllMonths, getAllYears } from '../../services/__appServicesData'
import { BiSearch } from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

const RawAttendanceLogs = () => {
    const { backNavigate, empListAtt, empSuggestionListAtt, showTableRaw, rawAtt, rawLogsAtt, onChangeRaw, handleGetAttRawLogs } = useAttendance()
    const dataRawAtt = ['Date', 'Time', 'Machine']
    const months = getAllMonths()
    const years = getAllYears()

    // State for employee search
    const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
    const [employeeSearchTerm, setEmployeeSearchTerm] = useState("");

    useEffect(() => {
        empSuggestionListAtt()
    }, [])

    // Filter employees based on search term (name or ID)
    const filteredEmployees = Array.isArray(empListAtt)
        ? empListAtt
            .filter((emp) => {
                const search = employeeSearchTerm.toLowerCase();
                const empName = String(emp.name || "").toLowerCase();
                const empId = String(emp.id || "");
                const empBioId = String(emp.bio_id || "");
                const empEmpId = String(emp.emp_id || "");

                return (
                    empName.includes(search) ||
                    empId.includes(search) ||
                    empBioId.includes(search) ||
                    empEmpId.includes(search)
                );
            })
            .sort((a, b) => {
                const search = employeeSearchTerm.toLowerCase();

                const getRank = (emp) => {
                    const values = [
                        String(emp.id || ""),
                        String(emp.emp_id || ""),
                        String(emp.bio_id || ""),
                        String(emp.name || "").toLowerCase(),
                    ];

                    // 0 = exact match
                    if (values.some((v) => v === search)) return 0;

                    // 1 = startsWith
                    if (values.some((v) => v.startsWith(search))) return 1;

                    // 2 = includes
                    return 2;
                };

                return getRank(a) - getRank(b);
            })
        : [];

    // Handle employee selection from search dropdown
    const handleEmployeeSelect = (employee) => {
        const empObject = { value: employee.id, label: employee.name };
        onChangeRaw(empObject, "emp_Id");
        setEmployeeSearchTerm(employee.name);
        setIsEmployeeDropdownOpen(false);
    };

    // Handle input change for search
    const handleEmployeeInputChange = (e) => {
        const value = e.target.value;
        setEmployeeSearchTerm(value);
        setIsEmployeeDropdownOpen(true);

        // If input is cleared, clear selection
        if (!value) {
            onChangeRaw(null, "emp_Id");
        }
    };

    // Handle input focus
    const handleEmployeeInputFocus = () => {
        setIsEmployeeDropdownOpen(true);
    };

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".employee-select-container")) {
                setIsEmployeeDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Update search term when employee is selected from outside
    useEffect(() => {
        if (rawAtt?.emp_Id?.label) {
            setEmployeeSearchTerm(rawAtt.emp_Id.label);
        }
    }, [rawAtt?.emp_Id]);

    return (
        <div className='flex flex-col gap-6 animate-fade-in-up'>
             {/* Search Filter Section */}
            <div className="bg-white p-5 rounded-2xl shadow-soft border border-gray-100">
                <div className="flex flex-col md:flex-row gap-5 items-end justify-between">
                     <div className="flex flex-wrap items-center gap-4 w-full md:w-auto flex-1">
                        <div className="w-full md:w-64">
                            <label className="text-gray-700 text-xs font-semibold px-1 mb-1 block">Search Employee</label>
                            <div className="relative employee-select-container">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <BiSearch className="text-lg" />
                                    </div>
                                    <input
                                        type="text"
                                        value={employeeSearchTerm}
                                        onChange={handleEmployeeInputChange}
                                        onFocus={handleEmployeeInputFocus}
                                        placeholder="Name or ID"
                                        className="w-full h-[42px] pl-10 pr-4 text-gray-700 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-gray-50 transition-all"
                                    />
                                </div>

                                {/* Suggestions Dropdown */}
                                {isEmployeeDropdownOpen && employeeSearchTerm && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto customScroll">
                                        {filteredEmployees.length > 0 ? (
                                            <>
                                                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 sticky top-0">
                                                    {filteredEmployees.length} result{filteredEmployees.length !== 1 ? "s" : ""}
                                                </div>
                                                {filteredEmployees.map((emp) => (
                                                    <div
                                                        key={emp.id}
                                                        className="px-4 py-2.5 hover:bg-brand-50 hover:text-brand-700 cursor-pointer border-b border-gray-50 last:border-b-0 transition-colors"
                                                        onClick={() => handleEmployeeSelect(emp)}
                                                    >
                                                        <div className="text-sm font-medium">
                                                            {emp.name}
                                                            <span className="text-xs text-gray-400 ml-2 font-normal">
                                                                ({emp.emp_id || emp.id || emp.bio_id})
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                No employees found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='w-full md:w-40'>
                            <label className="text-gray-700 text-xs font-semibold px-1 mb-1 block">Month</label>
                            <CustomSelect
                                placeHolderTitle='Month'
                                value={rawAtt?.month}
                                options={months.map((month) => ({ value: month.id, label: month.title }))}
                                onChangeHandler={(selectedOption, e) => onChangeRaw(selectedOption, 'month', e)}
                                customStyles={false}
                                thinScrollbar={true}
                            />
                        </div>

                        <div className='w-full md:w-32'>
                            <label className="text-gray-700 text-xs font-semibold px-1 mb-1 block">Year</label>
                            <CustomSelect
                                placeHolderTitle='Year'
                                value={rawAtt?.year}
                                options={years.map((year) => ({ value: year, label: year }))}
                                onChangeHandler={(selectedOption) => onChangeRaw(selectedOption, 'year')}
                                customStyles={false}
                                thinScrollbar={true}
                            />
                        </div>

                        <div className='flex items-end h-[42px]'>
                            <button 
                                onClick={handleGetAttRawLogs}
                                className="px-5 h-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-md active:scale-95"
                            >
                                Get Attendance
                            </button>
                        </div>
                    </div>
                    
                    <CustomButton onClick={() => backNavigate()} title='Back' />
                </div>
            </div>

            {showTableRaw && (
                <div className='bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden flex flex-col'>
                    <div className='overflow-x-auto customScroll'>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className='bg-gray-50/80 border-b border-gray-100'>
                                    {dataRawAtt.map((head, i) => (
                                        <th
                                            key={i}
                                            className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                        >
                                            {head}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                <AnimatePresence>
                                {rawLogsAtt.attendance?.length > 0 ? (
                                    rawLogsAtt.attendance?.map((ele, index) => {
                                        return (
                                            <motion.tr 
                                                key={ele.id || index}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                                                    {ele.day}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-brand-600 font-mono bg-brand-50/30 rounded-md w-fit px-2 py-1 mx-6 my-2 block">
                                                    {ele.time}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {ele.device}
                                                </td>
                                            </motion.tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={dataRawAtt.length} className="p-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                    <BiSearch className="text-3xl text-gray-300" />
                                                </div>
                                                <h3 className="text-gray-800 font-medium text-lg">No records found</h3>
                                                <p className="text-gray-500 text-sm mt-1">Try adjusting your filters to see results.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )
                                }
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default RawAttendanceLogs
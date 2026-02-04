import React from 'react';
import { Input, Select, Option, Button } from "@material-tailwind/react";
import { MdDelete } from 'react-icons/md';

const BulkForm = ({
    tableTitles,
    data,
    handleChangeSelect,
    handleInputChange,
    bulkFormValue,
    handleBulkCalendar,
    handleCheckBox, // not used anymore
    checkedState,   // not used anymore
    bulkOptionsDbData,
    onDeleteRow
}) => {
    // Helper function to safely get options for dropdowns
    const getOptions = (headerId, rowIndex) => {
        if (!bulkOptionsDbData) return [];
        const options = bulkOptionsDbData[headerId];
        if (!options) return [];
        if (typeof options === 'object' && !Array.isArray(options)) {
            const rowOptions = options[rowIndex];
            if (!rowOptions) return [];
            if (Array.isArray(rowOptions)) return rowOptions;
            if (rowOptions.DB_DATA && Array.isArray(rowOptions.DB_DATA)) return rowOptions.DB_DATA;
            if (typeof rowOptions === 'object') return Object.values(rowOptions);
            return [];
        }
        if (Array.isArray(options)) return options;
        return [];
    };

    const getOptionDisplayName = (option) => {
        if (!option || typeof option !== 'object') return '';
        const displayName = option.name || option.branch_name || option.country_name || option.title || option.policy_name || option.dept_name || '';
        if (option.code) return `${displayName} (${option.code})`;
        return displayName;
    };

    // Function to find the display name for a selected ID
    const getSelectedDisplayName = (headerId, rowIndex) => {
        const selectedId = bulkFormValue[headerId]?.[rowIndex];
        if (!selectedId) return '';
        
        const options = getOptions(headerId, rowIndex);
        const selectedOption = options.find(opt => 
            opt.id === selectedId || 
            opt.id === parseInt(selectedId));
        
        if (selectedOption) {
            return getOptionDisplayName(selectedOption);
        }
        return '';
    };

    return (
        <>
            <style>
                {`
                    .select-portal {
                        position: fixed !important;
                        z-index: 9999 !important;
                    }
                    .select-portal > div {
                        position: fixed !important;
                    }
                `}
            </style>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            {tableTitles.map((title, index) => (
                                <th key={index} scope="col" className="px-6 py-3">
                                    {title.title}
                                </th>
                            ))}
                            <th className="px-6 py-3">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(data) && data.map((_, rowIndex) => (
                            <tr key={rowIndex} className="bg-white border-b hover:bg-gray-50">
                                {tableTitles.map((header, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4">
                                        {header.type === 'select' ? (
                                            <div className="relative">
                                                {/* Custom Select Implementation */}
                                                <div className="custom-select w-full">
                                                    {/* Display selected value or placeholder */}
                                                    <div className="border border-gray-300 rounded p-2 flex justify-between items-center cursor-pointer bg-white">
                                                        <div className="flex-grow">
                                                            {getSelectedDisplayName(header.id, rowIndex) || `Select ${header.title}`}
                                                        </div>
                                                        <div className="text-gray-500">
                                                            ▼
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Hidden actual select for form submission */}
                                                    <select 
                                                        value={bulkFormValue[header.id]?.[rowIndex] || ''}
                                                        onChange={(e) => handleChangeSelect(header.id, e, rowIndex)}
                                                        className="absolute opacity-0 w-full h-full top-0 left-0 cursor-pointer"
                                                    >
                                                        <option value="" disabled>Select {header.title}</option>
                                                        {getOptions(header.id, rowIndex).map((option) => (
                                                            <option key={option.id} value={option.id}>
                                                                {getOptionDisplayName(option)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        ) : header.type === 'date' ? (
                                            <div className="relative">
                                                <Input
                                                    type="date"
                                                    value={bulkFormValue[header.id]?.[rowIndex] || ''}
                                                    onChange={(e) => handleInputChange(e, header.id, rowIndex)}
                                                    className="h-10"
                                                    label={header.title}
                                                />
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    value={bulkFormValue[header.id]?.[rowIndex] || ''}
                                                    onChange={(e) => handleInputChange(e, header.id, rowIndex)}
                                                    className="h-10"
                                                    label={header.title}
                                                />
                                            </div>
                                        )}
                                    </td>
                                ))}
                                <td className="px-6 py-4 text-center">
                                    <Button
                                        color="red"
                                        size="sm"
                                        variant="outlined"
                                        onClick={() => onDeleteRow(rowIndex)}
                                        className="p-2 min-w-0"
                                    >
                                        <MdDelete size={18} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default BulkForm;
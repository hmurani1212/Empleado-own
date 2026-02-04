import React from 'react';

const TailwindSelect = ({ 
    label, 
    value, 
    options = [], 
    onChange, 
    disabled = false, 
    placeholder = "Select an option",
    className = ""
}) => {
    const handleChange = (e) => {
        const selectedValue = e.target.value;
        onChange(selectedValue);
    };

    return (
        <div className={`relative ${className}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <select
                value={value || ""}
                onChange={handleChange}
                disabled={disabled}
                className={`
                    w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    text-sm text-gray-900 bg-white
                    ${disabled 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' 
                        : 'hover:border-gray-400'
                    }
                `}
            >
                <option value="" disabled>
                    {placeholder}
                </option>
                {options.map((option, index) => (
                    <option 
                        key={option.value || index} 
                        value={option.value}
                        className="text-gray-900"
                    >
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default TailwindSelect;

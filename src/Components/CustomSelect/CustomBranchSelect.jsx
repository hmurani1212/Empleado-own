import React, { useState, useEffect } from 'react';

const CustomBranchSelect = ({ label, value, options, onChange, disabled = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const selectedOption = options?.find(option => option.value === value) || { label: value || label };

    const handleToggle = () => {
        if (isAnimating || disabled) return;
        
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
        <div className="relative custom-branch-select">
            <div className="relative">
                <button
                    type="button"
                    className={`w-full h-9 px-3 py-2 text-sm border rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ease-out transform ${
                        disabled 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                            : isOpen 
                                ? 'border-blue-500 shadow-lg scale-[1.01] bg-white text-gray-900' 
                                : 'border-gray-300 hover:border-gray-400 hover:shadow-sm hover:scale-[1.005] bg-white text-gray-900'
                    }`}
                    onClick={handleToggle}
                    disabled={disabled}
                    style={{
                        backgroundImage: disabled ? 'none' : `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem',
                        transform: isOpen ? 'scale(1.01)' : 'scale(1)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    {selectedOption.label}
                </button>

                {/* Floating Label */}
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">
                    {label}
                </label>

                {/* Animated Dropdown */}
                <div
                    className={`absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden ${
                        isOpen 
                            ? 'opacity-100 visible transform scale-100 translate-y-0' 
                            : 'opacity-0 invisible transform scale-95 -translate-y-2'
                    } transition-all duration-200 ease-out`}
                    style={{
                        maxHeight: isOpen ? '400px' : '0px',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    <div className="py-1 max-h-96 overflow-y-auto bg-white">
                        {options && options.length > 0 ? (
                            options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`w-full px-3 py-2 text-sm text-left hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 bg-white ${
                                        value === option.value ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
                                    }`}
                                    onClick={() => handleSelect(option.value)}
                                >
                                    {option.label}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">
                                No departments available
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomBranchSelect;

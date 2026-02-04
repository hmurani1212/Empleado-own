import React, { useState } from 'react'
import CustomButton from '../../../Components/CustomButton/CustomButton'
import { toast } from 'react-toastify'

const AddExpenseForm = ({ onSubmit, onCancel, onReset }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        expenseType: 0, // 0 for expense claim, 1 for cash advance
        date: '',
        items: [
            {
                item: '',
                category: 0, // Default to 0 (General)
                amount: '',
                attachment: null
            }
        ]
    })


    // Expense categories options
    const expenseCategories = [
        { label: 'Fuel', value: 0 },
        { label: 'Hotel', value: 1 },
        { label: 'Launch', value: 2 },
        { label: 'Dinner', value: 3 }
    ]

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target
        
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                [name]: files
            }))
        } else if (type === 'radio') {
            // For radio buttons, convert value to number for expenseType
            setFormData(prev => ({
                ...prev,
                [name]: parseInt(value, 10)
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }

    }

    const handleItemChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            )
        }))

    }

    const handleFileChange = (index, files) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => 
                i === index ? { ...item, attachment: files[0] || null } : item
            )
        }))
    }

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    item: '',
                    category: 0,
                    amount: '',
                    attachment: null
                }
            ]
        }))
    }

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            setFormData(prev => ({
                ...prev,
                items: prev.items.filter((_, i) => i !== index)
            }))
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            expenseType: 0, // Reset to default value
            date: '',
            items: [
                {
                    item: '',
                    category: 0,
                    amount: '',
                    attachment: null
                }
            ]
        })
    }

    // Expose resetForm to parent component
    React.useEffect(() => {
        if (onReset) {
            onReset(resetForm)
        }
    }, [onReset])

    const validateForm = () => {
        // Validate Title first
        if (!formData.title.trim()) {
            toast.error('Title is required')
            return false
        }

        // Validate Description
        if (!formData.description.trim()) {
            toast.error('Description is required')
            return false
        }

        // Validate Expense Type
        if (formData.expenseType === null || formData.expenseType === undefined) {
            toast.error('Expense Type is required')
            return false
        }

        // Validate Date
        if (!formData.date) {
            toast.error('Date is required')
            return false
        }

        // Validate Items - check if at least one item exists
        if (!formData.items || formData.items.length === 0) {
            toast.error('At least one item is required')
            return false
        }

        // Validate each item one by one
        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i]
            
            if (!item.item.trim()) {
                toast.error(`Item ${i + 1}: Item name is required`)
                return false
            }

            if (!item.amount || item.amount <= 0) {
                toast.error(`Item ${i + 1}: Amount must be greater than 0`)
                return false
            }
        }

        return true
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        // Call parent onSubmit with form data
        onSubmit(formData)
    }

    return (
        <div className='p-6'>
            <form className='space-y-8' onSubmit={handleSubmit}>
            {/* Title */}
            <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>Title *</label>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md py-[10px] px-[15px] border border-gray-500 outline-none'
                    type='text' 
                    name='title' 
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder='Enter expense title'
                />
            </div>

            {/* Description */}
            <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>Description *</label>
                <textarea 
                    rows="4" 
                    className='w-full text-[#333333] text-[12px] rounded-md py-[10px] px-[15px] border border-gray-500 outline-none resize-none'
                    name='description'
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder='Enter expense description'
                />
            </div>

            {/* Expense Type */}
            <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>Expense Type *</label>
                <div className='flex gap-4'>
                    <label className='flex items-center gap-2 cursor-pointer'>
                        <input 
                            type='radio' 
                            name='expenseType' 
                            value={0}
                            checked={formData.expenseType === 0}
                            onChange={handleInputChange}
                            className='text-blue-600'
                        />
                        <span className='text-[#333333] text-[12px]'>Expense Claim</span>
                    </label>
                    <label className='flex items-center gap-2 cursor-pointer'>
                        <input 
                            type='radio' 
                            name='expenseType' 
                            value={1}
                            checked={formData.expenseType === 1}
                            onChange={handleInputChange}
                            className='text-blue-600'
                        />
                        <span className='text-[#333333] text-[12px]'>Cash Advance</span>
                    </label>
                </div>
            </div>

            {/* Dynamic Items Section */}
            <div className='space-y-4'>
                <label className='text-[#698592] text-[12px]'>Item Details *</label>
                
                {formData.items.map((item, index) => (
                    <div key={index} className='border border-gray-200 rounded-lg p-6 space-y-6'>
                        <div className='flex items-center justify-between'>
                            <h4 className='text-[#333333] text-[14px] font-medium'>Item {index + 1}</h4>
                            {formData.items.length > 1 && (
                                <button
                                    type='button'
                                    onClick={() => removeItem(index)}
                                    className='text-red-500 hover:text-red-700 text-[12px]'
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        {/* Item Row - Horizontal Layout */}
                        <div className='grid grid-cols-4 gap-6 items-end'>
                            {/* Item */}
                            <div className='space-y-2'>
                                <label className='text-[#698592] text-[12px]'>Item *</label>
                                <input 
                                    className='w-full text-[#333333] text-[12px] rounded-md py-[10px] px-[15px] border border-gray-500 outline-none'
                                    type='text' 
                                    value={item.item}
                                    onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                                    placeholder='Enter item name'
                                />
                            </div>

                            {/* Expense Category */}
                            <div className='space-y-2'>
                                <label className='text-[#698592] text-[12px]'>Expense Category *</label>
                                <select 
                                    className='w-full text-[#333333] text-[12px] rounded-md py-[10px] px-[15px] border border-gray-500 outline-none'
                                    value={item.category}
                                    onChange={(e) => handleItemChange(index, 'category', parseInt(e.target.value))}
                                >
                                    {expenseCategories.map(category => (
                                        <option key={category.value} value={category.value}>
                                            {category.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount */}
                            <div className='space-y-2'>
                                <label className='text-[#698592] text-[12px]'>Amount *</label>
                                <input 
                                    className='w-full text-[#333333] text-[12px] rounded-md py-[10px] px-[15px] border border-gray-500 outline-none'
                                    type='number' 
                                    value={item.amount}
                                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                                    placeholder='Enter amount'
                                    min='0'
                                    step='0.01'
                                />
                            </div>

                            {/* Attach File */}
                            <div className='space-y-2'>
                                <label className='text-[#698592] text-[12px]'>Attach File</label>
                                <div className='flex items-center gap-2'>
                                    <input 
                                        type='file' 
                                        onChange={(e) => handleFileChange(index, e.target.files)}
                                        className='hidden'
                                        id={`file-input-${index}`}
                                    />
                                    <label 
                                        htmlFor={`file-input-${index}`}
                                        className='px-3 py-2 border border-gray-500 rounded-md text-[12px] text-[#333333] cursor-pointer hover:bg-gray-50'
                                    >
                                        Choose Files
                                    </label>
                                    <button
                                        type='button'
                                        onClick={addItem}
                                        className='w-8 h-8 bg-blue-600 text-white rounded-md flex items-center justify-center hover:bg-blue-700'
                                    >
                                        <span className='text-lg'>+</span>
                                    </button>
                                </div>
                                {item.attachment && (
                                    <span className='text-[#333333] text-[11px]'>
                                        {item.attachment.name}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Date */}
            <div className='space-y-2'>
                <label className='text-[#698592] text-[12px]'>Date *</label>
                <input 
                    className='w-full text-[#333333] text-[12px] rounded-md py-[10px] px-[15px] border border-gray-500 outline-none'
                    type='date' 
                    name='date' 
                    value={formData.date}
                    onChange={handleInputChange}
                />
            </div>

            {/* Submit Button */}
            <div className='flex justify-end gap-3 pt-4'>
                <button
                    type='button'
                    onClick={onCancel}
                    className='px-4 py-2 border border-gray-300 rounded-md text-[12px] text-gray-700 hover:bg-gray-50'
                >
                    Cancel
                </button>
                <CustomButton 
                    title='Submit'
                    type='submit'
                />
            </div>
            </form>
        </div>
    )
}

export default AddExpenseForm

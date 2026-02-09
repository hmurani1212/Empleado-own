import React, { useState } from 'react'
import { 
    Input, 
    Textarea, 
    Radio, 
    Button, 
    Select, 
    Option,
    Card,
    CardBody,
    Typography,
    IconButton
} from '@material-tailwind/react'
import { toast } from 'react-toastify'
import { FaTrash, FaPlus, FaCloudUploadAlt, FaFileAlt } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

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
        { label: 'Lunch', value: 2 },
        { label: 'Dinner', value: 3 }
    ]

    const handleInputChange = (e) => {
        const { name, value, type } = e.target
        
        if (type === 'radio') {
            setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }))
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
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
        if (files && files[0]) {
            setFormData(prev => ({
                ...prev,
                items: prev.items.map((item, i) => 
                    i === index ? { ...item, attachment: files[0] } : item
                )
            }))
        }
    }

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                { item: '', category: 0, amount: '', attachment: null }
            ]
        }))
    }

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            setFormData(prev => ({
                ...prev,
                items: prev.items.filter((_, i) => i !== index)
            }))
        } else {
            toast.warning("You must have at least one item.");
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            expenseType: 0,
            date: '',
            items: [{ item: '', category: 0, amount: '', attachment: null }]
        })
    }

    React.useEffect(() => {
        if (onReset) onReset(resetForm)
    }, [onReset])

    const validateForm = () => {
        if (!formData.title.trim()) {
            toast.error('Title is required')
            return false
        }
        if (!formData.description.trim()) {
            toast.error('Description is required')
            return false
        }
        if (!formData.date) {
            toast.error('Date is required')
            return false
        }
        
        for (let i = 0; i < formData.items.length; i++) {
            const item = formData.items[i]
            if (!item.item.trim()) {
                toast.error(`Item ${i + 1}: Name is required`)
                return false
            }
            if (!item.amount || item.amount <= 0) {
                toast.error(`Item ${i + 1}: Amount must be positive`)
                return false
            }
        }
        return true
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (validateForm()) onSubmit(formData)
    }

    return (
        <div className='p-6 h-full flex flex-col'>
            <div className="flex-1 overflow-y-auto customScroll pr-2 pb-20">
                <form id="expenseForm" onSubmit={handleSubmit} className='space-y-6'>
                    
                    {/* Basic Info Section */}
                    <Card className="border border-gray-200 shadow-none">
                        <CardBody className="p-5 space-y-5">
                            <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
                                <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                                General Information
                            </Typography>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className='md:col-span-2'>
                                    <Input 
                                        label="Expense Title *" 
                                        name='title'
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        color="blue"
                                        size="lg"
                                    />
                                </div>
                                <div className='md:col-span-2'>
                                    <Textarea 
                                        label="Description *" 
                                        name='description'
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        color="blue"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Input 
                                        type='date'
                                        label="Expense Date *" 
                                        name='date'
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        color="blue"
                                    />
                                </div>
                                <div className="flex items-center gap-6 pl-2">
                                    <Typography variant="small" color="gray" className="font-medium">Type:</Typography>
                                    <Radio 
                                        name="expenseType" 
                                        label="Expense Claim" 
                                        value={0}
                                        checked={formData.expenseType === 0}
                                        onChange={handleInputChange}
                                        color="blue"
                                    />
                                    <Radio 
                                        name="expenseType" 
                                        label="Cash Advance" 
                                        value={1}
                                        checked={formData.expenseType === 1}
                                        onChange={handleInputChange}
                                        color="blue"
                                    />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Items Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
                                <span className="w-1 h-6 bg-brand-500 rounded-full"></span>
                                Expense Items
                            </Typography>
                            <Button 
                                size="sm" 
                                variant="text" 
                                className="flex items-center gap-2 text-brand-500 hover:bg-brand-50"
                                onClick={addItem}
                            >
                                <FaPlus /> Add Another Item
                            </Button>
                        </div>

                        <AnimatePresence>
                            {formData.items.map((item, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Card className="border border-gray-200 shadow-sm overflow-visible">
                                        <CardBody className="p-5 relative">
                                            {/* Remove Button */}
                                            {formData.items.length > 1 && (
                                                <div className="absolute top-2 right-2">
                                                    <IconButton 
                                                        variant="text" 
                                                        color="red" 
                                                        size="sm"
                                                        className="rounded-full hover:bg-red-50"
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        <FaTrash className="text-xs" />
                                                    </IconButton>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                                <div className="md:col-span-1 flex items-center justify-center md:justify-start">
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                                        {index + 1}
                                                    </div>
                                                </div>
                                                
                                                <div className="md:col-span-11 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                    <div className="md:col-span-2">
                                                        <Input 
                                                            label="Item Name *" 
                                                            value={item.item}
                                                            onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                                                            color="blue"
                                                        />
                                                    </div>
                                                    
                                                    <div>
                                                        <Select
                                                            label="Category *"
                                                            value={item.category.toString()}
                                                            onChange={(val) => handleItemChange(index, 'category', parseInt(val))}
                                                            color="blue"
                                                        >
                                                            {expenseCategories.map(cat => (
                                                                <Option key={cat.value} value={cat.value.toString()}>
                                                                    {cat.label}
                                                                </Option>
                                                            ))}
                                                        </Select>
                                                    </div>

                                                    <div>
                                                        <Input 
                                                            type="number" 
                                                            label="Amount *" 
                                                            value={item.amount}
                                                            onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                                                            color="blue"
                                                            min="0"
                                                            icon={<span className="text-xs font-bold text-gray-500">PKR</span>}
                                                        />
                                                    </div>

                                                    <div className="md:col-span-4 border-t border-gray-100 pt-3 mt-1">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative">
                                                                <input
                                                                    type="file"
                                                                    id={`file-${index}`}
                                                                    className="hidden"
                                                                    onChange={(e) => handleFileChange(index, e.target.files)}
                                                                />
                                                                <label 
                                                                    htmlFor={`file-${index}`}
                                                                    className="flex items-center gap-2 cursor-pointer py-2 px-4 rounded-lg border border-dashed border-gray-300 hover:border-brand-500 hover:bg-brand-50 transition-all text-sm text-gray-600"
                                                                >
                                                                    <FaCloudUploadAlt className="text-brand-500 text-lg" />
                                                                    {item.attachment ? "Change Receipt" : "Upload Receipt"}
                                                                </label>
                                                            </div>
                                                            {item.attachment && (
                                                                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                                                    <FaFileAlt />
                                                                    <span className="truncate max-w-[200px]">{item.attachment.name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </form>
            </div>

            {/* Footer Actions - Fixed at bottom */}
            <div className="pt-4 mt-2 border-t border-gray-100 flex justify-end gap-3 bg-white">
                <Button variant="outlined" color="gray" onClick={onCancel} className="border-gray-300 text-gray-700">
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    form="expenseForm"
                    className="bg-brand-500 hover:bg-brand-600 shadow-brand-500/20"
                >
                    Submit Expense
                </Button>
            </div>
        </div>
    )
}

export default AddExpenseForm

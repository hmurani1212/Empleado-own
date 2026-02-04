import React, { useEffect, useState } from 'react'
import useChecklist from '../../ViewModel/ChecklistViewModel/ChecklistServices'
import { Button, Input, Typography } from '@material-tailwind/react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { showToast } from '../../Components/Toaster/Toaster'

const CreateChecklist = ({ closeDrawer }) => {
    const {
        departments,
        employees,
        loading,
        checklistForm,
        getAllDepartments,
        getAllEmployees,
        createChecklist,
        updateFormField,
        resetForm
    } = useChecklist()

    const [formData, setFormData] = useState({
        title: '',
        deptId: 'global',
        personResponsible: 'admin',
        avgCompletionTime: 30,
        user_id: '',
        requirement_title: '',
        response_type: '1'
    })

    // Load departments and employees on component mount
    useEffect(() => {
        getAllDepartments()
        getAllEmployees()
    }, [])

    // Handle form field changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        
        // Validation
        if (!formData.title.trim()) {
            showToast('Please enter checklist title', 'error')
            return
        }

        if (formData.deptId !== 'global' && !formData.deptId) {
            showToast('Please select a department', 'error')
            return
        }

        if (formData.personResponsible === 'employee' && !formData.user_id) {
            showToast('Please select an employee', 'error')
            return
        }

        try {
            const success = await createChecklist(formData)
            if (success) {
                resetForm()
                setFormData({
                    title: '',
                    deptId: 'global',
                    personResponsible: 'admin',
                    avgCompletionTime: 30,
                    user_id: '',
                    requirement_title: '',
                    response_type: '1'
                })
                // Close drawer after successful creation
                if (closeDrawer) {
                    closeDrawer()
                }
            }
        } catch (error) {
            console.log('Error submitting form:', error)
        }
    }

    // Handle department selection
    const handleDepartmentChange = (selectedOption) => {
        if (selectedOption && selectedOption.value) {
            handleInputChange('deptId', selectedOption.value)
        } else {
            handleInputChange('deptId', 'global')
        }
    }

    // Handle employee selection
    const handleEmployeeChange = (selectedOption) => {
        if (selectedOption && selectedOption.value) {
            handleInputChange('user_id', selectedOption.value)
        } else {
            handleInputChange('user_id', '')
        }
    }

    // Handle person responsible change
    const handlePersonResponsibleChange = (value) => {
        handleInputChange('personResponsible', value)
        // Reset user_id when switching to admin
        if (value === 'admin') {
            handleInputChange('user_id', '')
        }
    }

    // Handle response type change
    const handleResponseTypeChange = (value) => {
        handleInputChange('response_type', value)
    }

    return (
        <div className="p-6">
            <Typography variant="h5" className="mb-6 text-center">
                Create Employee Onboarding Checklist
            </Typography>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Checklist Title */}
                <div>
                    <Typography variant="small" className="mb-2 font-medium">
                        Checklist Title *
                    </Typography>
                    <Input
                        label="Enter checklist title"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        required
                        className="w-full"
                    />
                </div>

                {/* Department Selection */}
                <div>
                    <Typography variant="small" className="mb-2 font-medium">
                        Department *
                    </Typography>
                    <CustomSelect
                        placeHolderTitle="Select Department"
                        value={formData.deptId === 'global' ? { value: 'global', label: 'Global' } : 
                               departments.find(dept => dept.id === formData.deptId) ? 
                               { value: formData.deptId, label: departments.find(dept => dept.id === formData.deptId).name } : 
                               null}
                        options={[
                            { value: 'global', label: 'Global' },
                            ...departments.map(dept => ({
                                value: dept.id,
                                label: dept.name
                            }))
                        ]}
                        onChangeHandler={handleDepartmentChange}
                        cStyle={true}
                    />
                </div>

                {/* Person Responsible */}
                <div>
                    <Typography variant="small" className="mb-2 font-medium">
                        Person Responsible *
                    </Typography>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="personResponsible"
                                value="admin"
                                checked={formData.personResponsible === 'admin'}
                                onChange={(e) => handlePersonResponsibleChange(e.target.value)}
                                className="mr-2"
                            />
                            Admin
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="personResponsible"
                                value="employee"
                                checked={formData.personResponsible === 'employee'}
                                onChange={(e) => handlePersonResponsibleChange(e.target.value)}
                                className="mr-2"
                            />
                            Employee
                        </label>
                    </div>
                </div>

                {/* Employee Selection (only when personResponsible is employee) */}
                {formData.personResponsible === 'employee' && (
                    <div>
                        <Typography variant="small" className="mb-2 font-medium">
                            Select Employee *
                        </Typography>
                        <CustomSelect
                            placeHolderTitle="Select Employee"
                            value={formData.user_id ? 
                                   employees.find(emp => emp.id === formData.user_id) ? 
                                   { value: formData.user_id, label: employees.find(emp => emp.id === formData.user_id).name } : 
                                   null : null}
                            options={employees.map(emp => ({
                                value: emp.id,
                                label: emp.name
                            }))}
                            onChangeHandler={handleEmployeeChange}
                            cStyle={true}
                        />
                    </div>
                )}

                {/* Average Completion Time */}
                <div>
                    <Typography variant="small" className="mb-2 font-medium">
                        Average Completion Time (days) *
                    </Typography>
                    <Input
                        type="number"
                        label="Enter completion time in days"
                        value={formData.avgCompletionTime}
                        onChange={(e) => handleInputChange('avgCompletionTime', parseInt(e.target.value) || 0)}
                        min="1"
                        required
                        className="w-full"
                    />
                </div>

                {/* Requirement Title (Optional) */}
                <div>
                    <Typography variant="small" className="mb-2 font-medium">
                        Requirement Title (Optional)
                    </Typography>
                    <Input
                        label="Enter requirement title"
                        value={formData.requirement_title}
                        onChange={(e) => handleInputChange('requirement_title', e.target.value)}
                        className="w-full"
                    />
                </div>

                {/* Response Type */}
                <div>
                    <Typography variant="small" className="mb-2 font-medium">
                        Response Type (Optional)
                    </Typography>
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="responseType"
                                value="1"
                                checked={formData.response_type === '1'}
                                onChange={(e) => handleResponseTypeChange(e.target.value)}
                                className="mr-2"
                            />
                            Text Input
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                name="responseType"
                                value="0"
                                checked={formData.response_type === '0'}
                                onChange={(e) => handleResponseTypeChange(e.target.value)}
                                className="mr-2"
                            />
                            File Upload
                        </label>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={resetForm}
                        className="capitalize"
                    >
                        Reset
                    </Button>
                    <Button
                        type="submit"
                        className="capitalize font-medium bg-[#8bc9f8] px-6 py-2"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create Checklist'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default CreateChecklist

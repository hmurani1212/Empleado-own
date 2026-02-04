

import { Radio, Input, Textarea } from '@material-tailwind/react'
import React, { useState, useEffect } from 'react'
// import SubmitButton from '../../Components/SubmitButton/SubmitButton'
import CustomButton from '../../Components/CustomButton/CustomButton'
import departmentsApi from '../../Model/Data/Departments/Departments'
import { showToast } from '../../Components/Toaster/Toaster'
import useStore from '../../Store/store'
import CustomSelect from '../../Components/CustomSelect/CustomSelect';
import useDepartments from "../../ViewModel/DepartmentsViewModel/DepartmentsServices";

const EditDepartmentModal = ({ departmentData, data, onSuccess }) => {
    const branchIdset = useStore((state) => state.branchIdset)
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: '',
        isGlobal: '1', // Default to global (all branches)
        parentId: null
    });

    const { allDeptDetails } = useDepartments();


    // console.log('this the real data', allDeptDetails)

    const id = 12345678

    useEffect(() => {
        if (departmentData) {
            // Check if branch_id is 0 to determine if it's global
            const isGlobal = departmentData.branch_id === 0 ? '1' : '0';

            setEditFormData({
                name: departmentData.name || departmentData.dept_name || '',
                description: departmentData.description || '',
                isGlobal: isGlobal,
                parentId: departmentData.parent_id || null
            })
        };

        ///getEmployeesOptimized(id)
    }, [departmentData]);


    /// console.log('now this is data', data)

    // const get_data = async () => {
    //     try {
    //         const response = await getEmployeesOptimized();
    //         console.log('This is the response', response)
    //     } catch (err) {
    //         console.log('Error')
    //     }
    // };


    // get_data()



    // console.log('what are you returning the data to me ', get_data())

    const handleChange = (e) => {
        const { name, value } = e.target
        setEditFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }))
    }

    const handleRadioChange = (e) => {
        const { value } = e.target
        setEditFormData((prevState) => ({
            ...prevState,
            isGlobal: value,
        }))
    }

    const handleParentDepartmentChange = (selectedOption) => {
        // console.log('Parent department selected:', selectedOption)
        setEditFormData((prevState) => ({
            ...prevState,
            parentId: selectedOption ? selectedOption.value : null,
        }))
    }

    const handleUpdateDepartment = async (e) => {
        e.preventDefault()

        if (!editFormData.name.trim()) {
            showToast('Department name is required', 'error')
            return
        }

        // Only validate branch_id if it's not global (isGlobal !== '1')
        if (editFormData.isGlobal !== '1' && !departmentData.branch_id && !branchIdset) {
            showToast('Branch ID is required', 'error')
            return
        }

        // Determine branch_id based on radio button selection
        const branchId = editFormData.isGlobal === '1' ? 0 : (departmentData.branch_id || branchIdset);

        const updateData = {
            id: departmentData.id,
            branch_id: branchId,
            name: editFormData.name,
            description: editFormData.description,
            parent_id: editFormData.parentId || 0,
            is_global: editFormData.isGlobal
        }

        // console.log('Form Data:', editFormData)
        // console.log('Update Data Payload:', updateData)
        // console.log('Department Data:', departmentData)

        try {
            const response = await departmentsApi.updateEditDepartment(updateData)
            const data = response.data

            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                showToast('Department updated successfully', 'success')
                onSuccess(updateData)
            } else {
                showToast('Failed to update department', 'error')
            }
        } catch (error) {
            // console.log('Update error:111', error?.response)
            showToast(error?.response?.data?.ERROR_DESCRIPTION, 'error')
        }
    }


    // console.log('data?.employees?.name', data?.employees?.name)
    // console.log('Current form state:', editFormData)
    // console.log('Available departments for parent selection:', data?.employees)
    return (
        <form className='flex flex-col space-y-4 text-[12px] px-[1.1vw] pt-3' onSubmit={handleUpdateDepartment}>
            <div>
                <Input
                    label='Department Name'
                    color='blue'
                    value={editFormData.name}
                    name='name'
                    onChange={handleChange}
                    required
                />
            </div>

            <CustomSelect
                placeHolderTitle="Select Parent Department"
                options={(allDeptDetails ?? []).map(e => ({
                    value: e.id,     // what you'll get on change
                    label: e.name,   // what the user sees
                }))}
                value={editFormData.parentId ? { value: editFormData.parentId, label: (allDeptDetails ?? []).find(e => e.id === editFormData.parentId)?.name } : null}
                onChangeHandler={handleParentDepartmentChange}
                cStyle={true}
            //isClearable={true}
            />



            <div className="my-4">
                <span className="text-[15px] font-semibold">
                    Department Visibility Privacy
                </span>
                <div className="flex text-[13px]">
                    <Radio
                        name="isGlobal"
                        color="blue"
                        label="For the selected branch only"
                        value="0"
                        checked={editFormData.isGlobal === '0'}
                        onChange={handleRadioChange}
                    />
                    <Radio
                        name="isGlobal"
                        color="blue"
                        label="Global (for all branches)"
                        className="text-[13px]"
                        value="1"
                        checked={editFormData.isGlobal === '1'}
                        onChange={handleRadioChange}
                    />
                </div>
            </div>

            <div>
                <Textarea
                    label='Description'
                    color='blue'
                    value={editFormData.description}
                    name='description'
                    onChange={handleChange}
                    rows={4}
                />
            </div>

            <div>
                <CustomButton title='Update Department' type='submit' />
            </div>
        </form>
    )
}

export default EditDepartmentModal 
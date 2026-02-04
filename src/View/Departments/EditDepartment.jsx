import { Input, Option, Radio, Select, Textarea } from '@material-tailwind/react'
import React, { useEffect, useState } from 'react'
import CustomButton from '../../Components/CustomButton/CustomButton'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'
import useDepartments from '../../ViewModel/DepartmentsViewModel/DepartmentsServices'
import departmentsApi from '../../Model/Data/Departments/Departments'
import { showToast } from '../../Components/Toaster/Toaster'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'

const EditDepartment = (props) => {
    const { deptIdset, handleDeptUpdate, closeDrawer } = useDepartments()
    const { data, branchIdset } = props
    // console.log('data', data)
    // console.log('data', deptIdset, branchIdset)

    const [editDesignationValue, setEditDesignationValue] = useState({
        // Tooba
        designation_name: data.name,
        description: data.description,
        parent_dept: '',
        isGlobal: data.isGlobal,
        selectedBranch: '',
        id: ''
    })

    const handleChangeEditDept = (e) => {
        const { name, value } = e.target
        setEditDesignationValue((prevState) => ({
            ...prevState,
            [name]: value,
        }))
    }

    const onChangeDept = (selectedOption, field) => {
        // console.log('selectedOption, field', selectedOption, field)
        setEditDesignationValue((prevState) => ({
            ...prevState,
            [field]: selectedOption,
        }));
    }

    const handleRadioChange = (e) => {
        const isGlobal = e.target.value === '1';
        setEditDesignationValue((prevState) => ({
            ...prevState,
            isGlobal: isGlobal,
        }));
    }

    const handleUpdateDept = async (e) => {
        e.preventDefault()

        const dataUpdate = {
            name: editDesignationValue.designation_name,
            id: deptIdset,
            selectedBranch: branchIdset,
            description: editDesignationValue.description,
            isGlobal: editDesignationValue.isGlobal ? '1' : '0',
            parent_dept: editDesignationValue.parent_dept.value
        }

        const uData = {
            id: deptIdset,
            name: editDesignationValue.designation_name,
            description: editDesignationValue.description,
            parent_id: editDesignationValue.parent_dept.value,
            isGlobal: editDesignationValue.isGlobal ? '1' : '0',

        }
        // console.log('dataUpdate', dataUpdate)
        // handleDeptUpdate(uData, editDesignationValue.isGlobal)
        try {
            const response = await departmentsApi.updateEditDepartment(dataUpdate)
            const data = response.data

            console.log('data updated', data)
            if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
                showToast(data.DESCRIPTION, 'success')
                handleDeptUpdate(uData, editDesignationValue.isGlobal)
                setEditDesignationValue({
                    designation_name: '',
                    description: '',
                    parent_dept: '',
                    isGlobal: '',
                    selectedBranch: '',
                    id: ''
                })
                closeDrawer()
            } else {
                showToast(data.ERROR_DESCRIPTION, 'error')
            }
        } catch (error) {
            console.log(data)
        }

    }
    return (

        <>
            <form className='flex flex-col space-y-4 text-[12px]' onSubmit={handleUpdateDept}>

                <div>
                    <Input label='Department Name' color='blue' value={editDesignationValue.designation_name || ''} name='designation_name' onChange={handleChangeEditDept} />
                </div>

                <div>
                    <CustomSelect
                        placeHolderTitle='Department'
                        value={editDesignationValue?.parent_dept}
                        options={data.parentDepts.DB_DATA?.map((dept) => ({ value: dept.id, label: dept.name }))}
                        onChangeHandler={(selectedOption, e) => onChangeDept(selectedOption, 'parent_dept', e)}
                        cStyle={true}
                    />
                </div>

                <div>
                    <label>Availability</label>
                    <div>
                        <Radio
                            label='Visible in the selected branch only'
                            name='isGlobal'
                            value='0'
                            color='blue'
                            checked={!editDesignationValue.isGlobal}
                            onChange={handleRadioChange}
                        />
                    </div>
                    <div>
                        <Radio
                            label='Visible in all branches (global)'
                            name='isGlobal'
                            value='1'
                            color='blue'
                            checked={editDesignationValue.isGlobal}
                            onChange={handleRadioChange}
                        />
                    </div>
                </div>

                <div>
                    <Textarea label='Description' color='blue' value={editDesignationValue.description || ''} name='description' onChange={handleChangeEditDept} />
                </div>

                <div>
                    <SubmitButton title='Update' />
                </div>

            </form>
        </>
    )
}

export default EditDepartment
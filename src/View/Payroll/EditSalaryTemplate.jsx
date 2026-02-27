import { Input } from '@material-tailwind/react'
import React, { useEffect, useRef, useState } from 'react'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'
import usePayroll from '../../ViewModel/PayrollViewModel/PayrollServices'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { gettingDepartmentsServices } from '../../services/__frequentApiServices'

const EditSalaryTemplate = () => {
    const{editValues, copyBranchesData, singleTemp, handleChangeBranchEdit, handleChangeEditValues, handleEdit, loading} = usePayroll()

    const [departmentOptions, setDepartmentOptions] = useState([])
    const [departmentLoading, setDepartmentLoading] = useState(false)
    const userHasSelectedBranchRef = useRef(false)

    // Track if user has started editing to prevent fallback to original values
    const [hasUserEdited, setHasUserEdited] = useState({
        name: false,
        amount: false,
        branch: false,
        department: false
    })

    // Initialize hasUserEdited when editValues are first populated
    useEffect(() => {
        if (editValues.name !== '' || editValues.amount !== '' || editValues.branch || editValues.department) {
            setHasUserEdited({
                name: editValues.name !== '',
                amount: editValues.amount !== '',
                branch: editValues.branch !== null,
                department: editValues.department !== null
            })
        }
    }, [editValues.name, editValues.amount, editValues.branch, editValues.department])

    // Use editValues if user has started editing, otherwise fall back to singleTemp data
    const displayValues = {
        name: hasUserEdited.name ? editValues.name : (editValues.name || singleTemp?.name || ''),
        amount: hasUserEdited.amount ? editValues.amount : (editValues.amount || singleTemp?.salary_amount || ''),
        branch: hasUserEdited.branch ? editValues.branch : (editValues.branch || (singleTemp?.branch_id != null && singleTemp?.branch_id !== '' ? {
            value: singleTemp.branch_id,
            label: singleTemp.branch_name
        } : null)),
        department: hasUserEdited.department ? editValues.department : (editValues.department || (singleTemp?.deptt_id != null && singleTemp?.deptt_id !== '' ? {
            value: singleTemp.deptt_id,
            label: singleTemp.dept_name || `Department ${singleTemp.deptt_id}`
        } : null))
    }

    // Stable branch id for dependency
    const selectedBranchId = displayValues.branch == null
        ? null
        : (displayValues.branch.value === 0 || displayValues.branch.value === '0' ? 0 : displayValues.branch.value)

    // Fetch departments only when user has selected a branch (not on initial load with pre-filled branch)
    useEffect(() => {
        if (!userHasSelectedBranchRef.current || selectedBranchId === null) {
            if (selectedBranchId === null) setDepartmentOptions([])
            return
        }
        setDepartmentLoading(true)
        setDepartmentOptions([])
        gettingDepartmentsServices(selectedBranchId)
            .then((options) => setDepartmentOptions(options || []))
            .catch(() => setDepartmentOptions([]))
            .finally(() => setDepartmentLoading(false))
    }, [selectedBranchId])
    
    console.log('EditSalaryTemplate - displayValues:', displayValues)
    
    // The editValues should already be initialized by handleEditTemp in PayrollServices
    // when the edit form is opened, so we don't need to initialize them here
    
    // Custom handler to update editValues when user types
    const handleInputChange = (e) => {
        const { name, value } = e.target
        handleChangeEditValues(e) // This will update the editValues state
        
        // Mark this field as edited by user
        setHasUserEdited(prev => ({
            ...prev,
            [name]: true
        }))
    }
    
  const branchOptions = [
    { value: 0, label: 'All Branches' },
    ...(copyBranchesData?.map((branch) => ({ value: branch.id, label: branch.branch_name })) || [])
  ]

  const departmentSelectOptions = [
    { value: 0, label: 'All Departments' },
    ...(departmentOptions || [])
  ]

  return (
    <>
    <form onSubmit={(e) => handleEdit(e)}>
        <div className='flex flex-col space-y-4 pt-6'>
            <div>
                <Input label='Name' color='blue' name='name' value={displayValues.name} onChange={handleInputChange}/>
            </div>

            <div>
                <Input label='Amount' color='blue' name='amount' value={displayValues.amount} onChange={handleInputChange}/>
            </div>

            <div>
                <label className='text-[#698592] text-[12px] mb-1 block'>Select Branch</label>
                <CustomSelect 
                    placeHolderTitle='Select Branch'
                    value={displayValues.branch}
                    options={branchOptions} 
                    onChangeHandler={(selectedOption) => {
                        userHasSelectedBranchRef.current = true
                        handleChangeBranchEdit(selectedOption, 'branch')
                        setHasUserEdited(prev => ({ ...prev, branch: true }))
                    }}
                    customStyles={false}
                />
            </div>

            <div>
                <label className='text-[#698592] text-[12px] mb-1 block'>Department</label>
                <CustomSelect 
                    placeHolderTitle={displayValues.branch ? 'Select Department' : 'Select branch first'}
                    value={displayValues.department}
                    options={departmentSelectOptions}
                    onChangeHandler={(selectedOption) => {
                        handleChangeBranchEdit(selectedOption, 'department')
                        setHasUserEdited(prev => ({ ...prev, department: true }))
                    }}
                    customStyles={false}
                    isDisabled={!displayValues.branch}
                />
                {departmentLoading && <div className='text-sm text-gray-500 mt-1'>Loading departments...</div>}
            </div>

            <div>
                <SubmitButton loading={loading} title='Update'/>
            </div>
        </div>
    </form>
    </>
  )
}

export default EditSalaryTemplate
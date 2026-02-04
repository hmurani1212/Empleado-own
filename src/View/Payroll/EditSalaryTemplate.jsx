import { Input } from '@material-tailwind/react'
import React, { useEffect, useState } from 'react'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'
import usePayroll from '../../ViewModel/PayrollViewModel/PayrollServices'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'

const EditSalaryTemplate = () => {
    const{editValues, copyBranchesData, singleTemp, handleChangeBranchEdit, handleChangeEditValues, handleEdit, loading} = usePayroll()

    // Track if user has started editing to prevent fallback to original values
    const [hasUserEdited, setHasUserEdited] = useState({
        name: false,
        amount: false,
        branch: false
    })

    // Initialize hasUserEdited when editValues are first populated
    useEffect(() => {
        if (editValues.name !== '' || editValues.amount !== '' || editValues.branch) {
            setHasUserEdited({
                name: editValues.name !== '',
                amount: editValues.amount !== '',
                branch: editValues.branch !== null
            })
        }
    }, [editValues.name, editValues.amount, editValues.branch])

    // Use editValues if user has started editing, otherwise fall back to singleTemp data
    const displayValues = {
        name: hasUserEdited.name ? editValues.name : (editValues.name || singleTemp?.name || ''),
        amount: hasUserEdited.amount ? editValues.amount : (editValues.amount || singleTemp?.salary_amount || ''),
        branch: hasUserEdited.branch ? editValues.branch : (editValues.branch || (singleTemp?.branch_id ? {
            value: singleTemp.branch_id,
            label: singleTemp.branch_name
        } : null))
    }
    
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
    
  return (
    <>
    {/* Tooba */}
    {/* In edit, that Branch data is not prefilled */}
    <form onSubmit={(e) => handleEdit(e)}>
        <div className='flex flex-col space-y-4'>
            <div>
                <Input label='Name' color='blue' name='name' value={displayValues.name} onChange={handleInputChange}/>
            </div>

            <div>
                <Input label='Amount' color='blue' name='amount' value={displayValues.amount} onChange={handleInputChange}/>
            </div>

            <div>
                <CustomSelect 
                    placeHolderTitle= 'Branch'
                    value={displayValues.branch}
                    options={copyBranchesData?.map((branch) => ({ value: branch.id, label: branch.branch_name })) || []} 
                    onChangeHandler={(selectedOption, e) => {
                        handleChangeBranchEdit(selectedOption, 'branch', e)
                        // Mark branch as edited by user
                        setHasUserEdited(prev => ({
                            ...prev,
                            branch: true
                        }))
                    }}
                    customStyles={false}
                    />
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
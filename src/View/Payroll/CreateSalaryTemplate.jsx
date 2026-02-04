import { Input } from '@material-tailwind/react'
import React, { useState } from 'react'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'
import usePayroll from '../../ViewModel/PayrollViewModel/PayrollServices'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'

const CreateSalaryTemplate = () => {
    const { copyBranchesData, handleCreateSalaryTemplate, loading } = usePayroll()
    
    const [createValues, setCreateValues] = useState({
        name: '',
        amount: '',
        branch: null
    })

    const handleChangeCreateValues = (e) => {
        const { name, value } = e.target
        setCreateValues((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleChangeBranchCreate = (selectedOption) => {
        setCreateValues((prevState) => ({
            ...prevState,
            branch: selectedOption
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        handleCreateSalaryTemplate(createValues)
    }

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className='flex flex-col space-y-4'>
                    <div>
                        <Input 
                            label='Template Name' 
                            color='blue' 
                            name='name' 
                            value={createValues.name} 
                            onChange={handleChangeCreateValues}
                            required
                        />
                    </div>

            <div>
                <Input 
                    label='Salary Amount' 
                    color='blue' 
                    name='amount' 
                    type='number'
                    value={createValues.amount} 
                    onChange={handleChangeCreateValues}
                    required
                />
            </div>

            <div>
                        <CustomSelect 
                            placeHolderTitle='Select Branch'
                            value={createValues.branch}
                            options={copyBranchesData?.map((branch) => ({ 
                                value: branch.id, 
                                label: branch.branch_name 
                            })) || []} 
                            onChangeHandler={handleChangeBranchCreate}
                            customStyles={false}
                        />
                    </div>

                    <div>
                        <SubmitButton loading={loading} title='Create Template'/>
                    </div>
                </div>
            </form>
        </>
    )
}

export default CreateSalaryTemplate

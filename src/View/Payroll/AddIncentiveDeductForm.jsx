import React from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { Input } from '@material-tailwind/react'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'
import useManageEmpSalary from '../../ViewModel/PayrollViewModel/ManageEmpSalaryServices'

const AddIncentiveDeductForm = () => {
  const {typeOptions, statusOptions, handleSelectChangeIncent, addIncentDeductValues, handleInputChangeIncent, handleSubmitAdd, loading} = useManageEmpSalary()
  return (
    <>
    <form onSubmit={(e) => handleSubmitAdd(e)}>
      <div className='flex flex-col space-y-4'>
        <div>
          <label className='text-[#7a929e]'>Type</label>
          <CustomSelect 
          placeHolderTitle = 'Type'
          value={addIncentDeductValues?.type}
          options={typeOptions} 
          onChangeHandler={(selectedOption) => handleSelectChangeIncent(selectedOption, 'type')}
          customStyles={false}
          />
        </div>

        <div>
          <Input label='Title' color='blue' value={addIncentDeductValues.title} name='title' onChange={handleInputChangeIncent}/>
        </div>

        <div>
          <label className='text-[#7a929e]'>Status</label>
          <CustomSelect 
          placeHolderTitle = 'Status'
          value={addIncentDeductValues?.status}
          options={statusOptions} 
          onChangeHandler={(selectedOption) => handleSelectChangeIncent(selectedOption, 'status')}
          customStyles={false}
          />
        </div>

        <div>
          <SubmitButton loading={loading} />
        </div>
      </div>
    </form>
    </>
  )
}

export default AddIncentiveDeductForm
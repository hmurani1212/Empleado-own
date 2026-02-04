import { Textarea } from '@material-tailwind/react'
import React from 'react'
import useManageEmpSalary from '../../ViewModel/PayrollViewModel/ManageEmpSalaryServices'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'

const CancelInc = (id) => {
    const {handleCancelInc, handleChangeCancel, cancelIncValues } = useManageEmpSalary()
  return (
    <>
    <form onSubmit={(e) => {e.preventDefault(); handleCancelInc(id)}}>
        <div>
            <div>
                <Textarea label='Reason' color='blue' onChange={handleChangeCancel} name='reason' value={cancelIncValues.reason}/>
            </div>
            
            <div>
                <SubmitButton title='Confirm'/>
            </div>
        </div>
    </form>
                    

    </>
  )
}

export default CancelInc
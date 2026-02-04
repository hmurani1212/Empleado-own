import { Input, Textarea } from '@material-tailwind/react'
import React from 'react'
import useHire from '../../ViewModel/HireViewModel/HireServices'

const RejectAppForm = (props) => {
    const {handleChangeShortlist,  handleRejectApp, rejectValues} = props
    
  return (
    <>
    <form onSubmit={(e) => handleRejectApp(e)}>
        <div>
            <div>
            <div className='py-2'>
                <Input label='Data Label' color='blue' name='labelR' value={rejectValues.labelR} onChange={handleChangeShortlist}>
                    
                </Input>
            </div>

            <div className='py-2'>
                <Textarea label='Reject Reason' color='blue' name='rejectReason'  onChange={handleChangeShortlist}>

                </Textarea>

            </div>
            </div>
        </div>
    </form>
    </>
  )
}

export default RejectAppForm
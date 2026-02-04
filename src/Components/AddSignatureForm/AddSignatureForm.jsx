import { Input, Button } from '@material-tailwind/react'
import React, { useState } from 'react'
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices'
import { showToast } from '../Toaster/Toaster'

function AddSignatureForm(props) {
  const { onClose } = props
  const [signatureValue, setSignatureValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Get addSignature function from useEmployees
  const { addSignature } = useEmployees()

  const handleSignatureChange = (e) => {
    setSignatureValue(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!signatureValue.trim()) return

    setIsLoading(true)
    
    try {
      const result = await addSignature({ signature: signatureValue.trim() })
      if (result.success) {
        showToast('Signature added successfully!', 'success')
        onClose() // Close drawer after successful submission
      } else {
        showToast(result.error || 'Failed to add signature', 'error')
      }
    } catch (error) {
      showToast('An error occurred while adding signature', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = signatureValue.trim() !== ''

  return (
    <div className='w-90'>
      <form className='' onSubmit={handleSubmit}>
        <div className='flex flex-col gap-4'>
          <div>
            <Input
              required
              label='Enter Signature*'
              color='blue'
              value={signatureValue}
              name='signature'
              onChange={handleSignatureChange}
            />
          </div>

          <div>
            {isLoading ? (
              <Button
                className='bg-blue-300 py-[10px] capitalize'
                loading={true}
              >
                Loading
              </Button>
            ) : (
              <Button
                type='submit'
                className={`py-[10px] capitalize ${isFormValid ? 'bg-blue-500' : 'bg-blue-200'}`}
                disabled={!isFormValid}
              >
                Submit
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddSignatureForm

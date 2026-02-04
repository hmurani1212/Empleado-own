import { Input, Button } from '@material-tailwind/react'
import React, { useState, useEffect } from 'react'
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices'
import { showToast } from '../Toaster/Toaster'

function AddDigitalSignatureForm(props) {
  const { onClose, existingSignature } = props
  const [signatureValue, setSignatureValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Get digital signature functions from useEmployees
  const { addDigitalSignature } = useEmployees()

  // Pre-fill the form if editing existing signature
  useEffect(() => {
    if (existingSignature && existingSignature.signature_text) {
      setSignatureValue(existingSignature.signature_text)
    }
  }, [existingSignature])

  const handleSignatureChange = (e) => {
    setSignatureValue(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!signatureValue.trim()) return

    setIsLoading(true)
    
    try {
      const result = await addDigitalSignature({ signature: signatureValue.trim() })
      if (result.success) {
        const message = existingSignature ? 'Digital signature updated successfully!' : 'Digital signature added successfully!'
        showToast(message, 'success')
        onClose() // Close drawer after successful submission
      } else {
        showToast(result.error || 'Failed to add/update digital signature', 'error')
      }
    } catch (error) {
      showToast('An error occurred while adding/updating digital signature', 'error')
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
              label='Enter Digital Signature*'
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
                {existingSignature ? 'Update' : 'Submit'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddDigitalSignatureForm


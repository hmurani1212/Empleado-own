import { Input, Button } from '@material-tailwind/react'
import React, { useState, useEffect } from 'react'
import useEmployees from '../../ViewModel/EmployeeViewModel/EmployeeServices'
import { showToast } from '../Toaster/Toaster'

function AddSignatureForm(props) {
  const { onClose, existingSignature } = props
  const [signatureValue, setSignatureValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { addSignature } = useEmployees()

  useEffect(() => {
    if (existingSignature?.signature != null) {
      setSignatureValue(String(existingSignature.signature))
    } else {
      setSignatureValue('')
    }
  }, [existingSignature])

  const handleSignatureChange = (e) => {
    setSignatureValue(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!signatureValue.trim()) return

    setIsLoading(true)

    const trimmed = signatureValue.trim()
    const payload = existingSignature?.id != null
      ? { id: existingSignature.id, signature: trimmed }
      : { signature: trimmed }

    try {
      const result = await addSignature(payload)
      if (result.success) {
        showToast(
          existingSignature?.id != null
            ? 'Signature updated successfully!'
            : 'Signature added successfully!',
          'success'
        )
        onClose()
      } else {
        showToast(
          result.error ||
            (existingSignature?.id != null ? 'Failed to update signature' : 'Failed to add signature'),
          'error'
        )
      }
    } catch (error) {
      showToast(
        existingSignature?.id != null
          ? 'An error occurred while updating signature'
          : 'An error occurred while adding signature',
        'error'
      )
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
                {existingSignature?.id != null ? 'Update' : 'Submit'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default AddSignatureForm

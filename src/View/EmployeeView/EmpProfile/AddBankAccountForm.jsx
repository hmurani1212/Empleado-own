import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input, Select, Option, Button, Typography } from '@material-tailwind/react'
import useStore from '../../../Store/store'
import { toast } from 'react-toastify'

const AddBankAccountForm = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false)
    const { updateAccountDetail } = useStore()
    
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm()

    const accountType = watch('bank_account_type')

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            // Convert account type to number as expected by API
            const payload = {
                ...data,
                bank_account_type: parseInt(data.bank_account_type)
            }

            const response = await updateAccountDetail(payload)
            
            if (response && response.STATUS === 'SUCCESSFUL') {
                toast.success('Bank account details updated successfully!')
                onSuccess && onSuccess(response)
                onClose && onClose()
            } else {
                toast.error('Failed to update bank account details')
            }
        } catch (error) {
            console.error('Error updating bank account:', error)
            toast.error('An error occurred while updating bank account details')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 bg-white rounded-lg">
            {/* <div className="mb-6">
                <Typography variant="h5" color="blue-gray" className="mb-2">
                    Add Bank Account Details
                </Typography>
                <Typography color="gray" className="font-normal">
                    Please fill in your bank account information
                </Typography>
            </div> */}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Account Title */}
                <div>
                    <Input
                        label="Account Title"
                        placeholder="Enter account title"
                        {...register('bank_account_title', {
                            required: 'Account title is required'
                        })}
                        error={errors.bank_account_title}
                    />
                    {errors.bank_account_title && (
                        <Typography color="red" className="text-xs mt-1">
                            {errors.bank_account_title.message}
                        </Typography>
                    )}
                </div>

                {/* Bank Name */}
                <div>
                    <Input
                        label="Bank Name"
                        placeholder="Enter bank name"
                        {...register('bank_name', {
                            required: 'Bank name is required'
                        })}
                        error={errors.bank_name}
                    />
                    {errors.bank_name && (
                        <Typography color="red" className="text-xs mt-1">
                            {errors.bank_name.message}
                        </Typography>
                    )}
                </div>

                {/* Branch Name */}
                <div>
                    <Input
                        label="Branch Name"
                        placeholder="Enter branch name"
                        {...register('branch_name', {
                            required: 'Branch name is required'
                        })}
                        error={errors.branch_name}
                    />
                    {errors.branch_name && (
                        <Typography color="red" className="text-xs mt-1">
                            {errors.branch_name.message}
                        </Typography>
                    )}
                </div>

                {/* Branch Code */}
                <div>
                    <Input
                        label="Branch Code"
                        placeholder="Enter branch code"
                        {...register('bank_branch_code', {
                            required: 'Branch code is required'
                        })}
                        error={errors.bank_branch_code}
                    />
                    {errors.bank_branch_code && (
                        <Typography color="red" className="text-xs mt-1">
                            {errors.bank_branch_code.message}
                        </Typography>
                    )}
                </div>

                {/* Account Number */}
                <div>
                    <Input
                        label="Account Number"
                        placeholder="Enter account number"
                        {...register('bank_account_no', {
                            required: 'Account number is required',
                            pattern: {
                                value: /^[0-9]+$/,
                                message: 'Account number should contain only numbers'
                            }
                        })}
                        error={errors.bank_account_no}
                    />
                    {errors.bank_account_no && (
                        <Typography color="red" className="text-xs mt-1">
                            {errors.bank_account_no.message}
                        </Typography>
                    )}
                </div>

                {/* Account Type */}
                <div>
                    <Select
                        label="Account Type"
                        value={accountType}
                        onChange={(value) => setValue('bank_account_type', value)}
                        error={errors.bank_account_type}
                    >
                        <Option value="0">Savings</Option>
                        <Option value="1">Current</Option>
                        <Option value="2">Fixed Deposit</Option>
                        <Option value="3">Salary</Option>
                    </Select>
                    {errors.bank_account_type && (
                        <Typography color="red" className="text-xs mt-1">
                            {errors.bank_account_type.message}
                        </Typography>
                    )}
                    <input
                        type="hidden"
                        {...register('bank_account_type', {
                            required: 'Account type is required'
                        })}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        variant="outlined"
                        color="gray"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        color="blue"
                        loading={loading}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Add Bank Details'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default AddBankAccountForm

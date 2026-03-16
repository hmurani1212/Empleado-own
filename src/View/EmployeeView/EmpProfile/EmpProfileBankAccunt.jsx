import React, { useState, useEffect } from 'react'
import CustomButton from '../../../Components/CustomButton/CustomButton'
import { Typography, Card, CardBody } from '@material-tailwind/react'
import useStore from '../../../Store/store'
import AddBankAccountForm from './AddBankAccountForm'
import useProfileCompletion from '../../../hooks/useProfileCompletion'

const tableHeader = [
    "Account Title", "Bank Name", "Branch Name", "Branch Code", "Account Number", "Account Type"
]

const accountTypeLabels = {
    0: "Savings",
    1: "Current", 
    2: "Fixed Deposit",
    3: "Salary"
}

const EmpProfileBankAccunt = () => {
    const [showAddForm, setShowAddForm] = useState(false)
    const [bankAccounts, setBankAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const { openDrawer, settingComponent, closeDrawer, settingDrawerTitle, settingDrawerSize, getEmployeeProfileV2, employeeProfileV2Data } = useStore()
    const { fetchProfileCompletion } = useProfileCompletion()

    const handleAddBankAccount = () => {
        settingDrawerTitle("Add Bank Account")
        settingDrawerSize(600)
        settingComponent(
            <AddBankAccountForm 
                onClose={() => closeDrawer()}
                onSuccess={handleBankAccountAdded}
            />
        )
        openDrawer()
    }

    // Sync from store (single fetch by useProfileCompletion on Profile mount)
    useEffect(() => {
        if (employeeProfileV2Data?.DB_DATA?.bank_account_detail) {
            setBankAccounts(employeeProfileV2Data.DB_DATA.bank_account_detail)
            setLoading(false)
        } else if (employeeProfileV2Data != null) {
            setBankAccounts([])
            setLoading(false)
        }
    }, [employeeProfileV2Data])

    useEffect(() => {
        if (employeeProfileV2Data === null) setLoading(true)
    }, [])

    // Refresh after add/edit
    const fetchEmployeeProfile = async () => {
        setLoading(true)
        try {
            const userId = localStorage.getItem('user_id') || '9119548'
            const response = await getEmployeeProfileV2(userId)
            if (response?.DB_DATA) {
                setBankAccounts(response.DB_DATA.bank_account_detail || [])
            }
        } catch (error) {
            console.error('Error fetching employee profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleBankAccountAdded = (response) => {
        console.log('Bank account added successfully:', response)
        // Refresh the data to show real-time updates
        fetchEmployeeProfile()
    }

    return (
        <div className='flex flex-col gap-4 p-2'>
            <div className='flex items-center justify-between'>
                <span className='text-[20px]'>Bank Account Details</span>
                <button className='bg-bgBlue  capitalize py-2 px-4 font-medium text-[12px] rounded-[10px] text-white hover:bg-blue-600 cursor-pointer' onClick={handleAddBankAccount}>
                    Add Bank Details
                </button>
                {/* <CustomButton 
                    title="Add Bank Details"
                    onClick={handleAddBankAccount}
                    className='bg-bgBlue text-white'
                /> */}
            </div>

            {loading ? (
                <Card className="w-full">
                    <CardBody className="text-center py-12">
                        <Typography color="gray" className="mb-4">
                            Loading bank account details...
                        </Typography>
                    </CardBody>
                </Card>
            ) : bankAccounts.length > 0 ? (
                <div className='bg-white p-4 rounded-[10px] drop-shadow-md'>
                    <table className="w-[100%] min-w-max text-left">
                        <thead className='sticky top-[-9px]'>
                            <tr>
                                {tableHeader?.map((head, i) => (
                                    <th
                                        key={i}
                                        className="bg-[#F8F9FA] p-4"
                                    >
                                        <Typography
                                            variant="small"
                                            color="#292929"
                                            className="font-medium leading-none opacity-90 font-Urbanist capitalize"
                                        >
                                            {head}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bankAccounts.map((account, index) => (
                                <tr key={index} className="even:bg-blue-gray-50/50">
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {account.bank_account_title}
                                        </Typography>
                                    </td>
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {account.bank_name}
                                        </Typography>
                                    </td>
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {account.branch_name}
                                        </Typography>
                                    </td>
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {account.bank_branch_code}
                                        </Typography>
                                    </td>
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {account.bank_account_no}
                                        </Typography>
                                    </td>
                                    <td className="p-4">
                                        <Typography variant="small" color="blue-gray" className="font-normal">
                                            {accountTypeLabels[account.bank_account_type] || 'Unknown'}
                                        </Typography>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <Card className="w-full">
                    <CardBody className="text-center py-12">
                        <Typography variant="h6" color="blue-gray" className="mb-2">
                            No Bank Account Details Found
                        </Typography>
                        <Typography color="gray" className="mb-4">
                            Add your bank account information to get started
                        </Typography>
                    </CardBody>
                </Card>
            )}
        </div>
    )
}

export default EmpProfileBankAccunt
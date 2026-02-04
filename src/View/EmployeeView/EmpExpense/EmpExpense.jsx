import React, { useEffect, useState } from 'react'
import CustomButton from '../../../Components/CustomButton/CustomButton'
import { Typography } from '@material-tailwind/react'
import CustomDrawer from '../../../Components/CustomDrawer/CustomDrawer'
import AddExpenseForm from './AddExpenseForm'
import useStore from '../../../Store/store'
import empExpenseApi from '../../../Model/Data/EmpData/EmpExpense/EmpExpense'
import { toast } from 'react-toastify'
import noRecordFound from '../../../assets/employee_side_images/no record found.gif';

const tableHeader = [
    "Expense Name", "Category", "Created By", "Created On", "Total Amount", "Status"
]

const EmpExpense = () => {
    const [addExpenseDrawerOpen, setAddExpenseDrawerOpen] = useState(false)
    const [resetFormFunction, setResetFormFunction] = useState(null)

    const {
        expenseList,
        loading,
        loadingMore,
        hasMoreData,
        totalCount,
        gettingExpenseList,
        loadMoreExpenses
    } = useStore()

    useEffect(() => {
        gettingExpenseList()
    }, [])

    // Handle opening the add expense drawer
    const handleAddExpense = () => {
        setAddExpenseDrawerOpen(true)
    }

    // Handle closing the drawer
    const handleCloseDrawer = () => {
        setAddExpenseDrawerOpen(false)
    }

    // Handle form submission
    const handleExpenseSubmit = async (formData) => {
        try {
            // console.log('Expense form submitted:', formData)

            // Transform form data to match API structure
            const apiPayload = {
                title: formData.title,
                desc: formData.description,
                type: formData.expenseType,
                date: new Date(formData.date).toISOString(),
                items: formData.items.map(item => ({
                    item: item.item,
                    category: item.category,
                    amount: parseFloat(item.amount),
                    attachment: item.attachment ? item.attachment.name : null // For now, just send filename
                }))
            }

            // console.log('API Payload:', apiPayload)

            const response = await empExpenseApi.addEmployeeExpense(apiPayload)

            if (response.data && response.data.STATUS === 'SUCCESSFUL') {
                toast.success('Expense submitted successfully!')

                // Reset form after successful submission
                if (resetFormFunction) {
                    resetFormFunction()
                }

                // Close drawer after successful submission
                setAddExpenseDrawerOpen(false)

                // Refresh the expense list
                gettingExpenseList()
            } else {
                toast.error(response.data?.MESSAGE || 'Failed to submit expense')
            }

        } catch (error) {
            console.error('Error submitting expense:', error)
            toast.error('Error submitting expense. Please try again.')
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return '-'
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            })
        } catch (error) {
            return dateString
        }
    }

    const formatAmount = (amount) => {
        if (!amount || amount === 0) return '-'
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR'
        }).format(amount)
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-[#FFF1D9] text-[#FDA006]'
            case 'approved':
                return 'bg-[#DBFFF5] text-[#0ACF97]'
            case 'rejected':
                return 'bg-[#FFF0F4] text-[#FF4979]'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    // const getCategoryName = (category) => {
    //     console
    //     // Handle both number and string categories
    //     if (typeof category === 'number') {

    //         const categoryMap = {
    //             0: 'Fuel',
    //             1: 'Hotel',
    //             2: 'Launch',
    //             3: 'Dinner'
    //         }
    //         return categoryMap[category] || 'Unknown'
    //     } else if (typeof category === 'string') {
    //         return category.replace('_', ' ')
    //     }
    //     return 'Unknown'
    // }

    const renderLoadMore = () => {
        if (!hasMoreData || expenseList.length === 0) return null

        return (
            <div className="flex justify-center mt-6">
                <button
                    onClick={loadMoreExpenses}
                    disabled={loadingMore}
                    className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loadingMore ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Loading...
                        </>
                    ) : (
                        'Load More'
                    )}
                </button>
            </div>
        )
    }

    return (
        <div className='flex flex-col gap-4 p-2'>
            <div className='flex justify-between items-center'>
                <span className='text-[20px] #212529 font-medium font-Urbanist'>Expense</span>
                <button className='bg-bgBlue  capitalize py-2 px-4 font-medium text-[12px] rounded-[10px] text-white hover:bg-blue-600 cursor-pointer' onClick={handleAddExpense}>
                    Add Expense
                </button>
                {/* <CustomButton
                    title="Add Expense"
                    onClick={handleAddExpense}
                /> */}
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="text-gray-500">Loading expenses...</div>
                </div>
            ) : (
                <>
                    <div className='"w-full bg-white rounded-[10px] p-2 drop-shadow-md'>
                        <div className="relative w-full min-h-[calc(100vh-100px)] overflow-auto customScroll">
                            <table className="lg:min-w-full min-w-[600px] table-fixed text-center border-collapse">
                                <colgroup>
                        <col style={{width: "20%"}} />
                        <col style={{width: "20%"}} />
                        <col style={{width: "20%"}} />
                        <col style={{width: "20%"}} />
                        <col style={{width: "20%"}} />
                        <col style={{width: "20%"}} />
                    </colgroup>
                                <thead className='sticky top-[-9px] bg-[#F8F9FA] rounded-[8px]'>
                                    <tr>
                                        {tableHeader?.map((head, i) => (
                                            <th
                                                key={i}
                                                className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4"
                                            >
                                                <Typography
                                                    // variant="small"
                                                    // color="#292929"
                                                    className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                                                >
                                                    {head}
                                                </Typography>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {expenseList?.length > 0 ? (
                                        expenseList.map((expense, index) => {
                                            const isLast = index === expenseList.length - 1;
                                            const classes = isLast
                                                ? "px-[clamp(4px,0.8vw,12px)] py-4"
                                                : "px-[clamp(4px,0.8vw,12px)] py-4 border-b border-[#F2F2F9]";

                                            return (
                                                <tr key={expense.id || index}>
                                                    <td className={classes}>
                                                        <Typography
                                                            // variant="small"
                                                            // color="blue-gray"
                                                            className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                                                        >
                                                            {expense.expense_name || '-'}
                                                        </Typography>
                                                    </td>
                                                    <td className={classes}>
                                                        <Typography
                                                            // variant="small"
                                                            // color="blue-gray"
                                                            className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                                                        >
                                                            {
                                                                expense?.category?.[0] === 0 ? 'Fuel' :
                                                                    expense?.category?.[0] === 1 ? 'Hotel' :
                                                                        expense?.category?.[0] === 2 ? 'Launch' :
                                                                            expense?.category?.[0] === 3 ? 'Dinner' :
                                                                                'Null'
                                                            }

                                                        </Typography>
                                                    </td>
                                                    <td className={classes}>
                                                        <Typography
                                                            // variant="small"
                                                            // color="blue-gray"
                                                            className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                                                        >
                                                            {expense.created_by || '-'}
                                                        </Typography>
                                                    </td>
                                                    <td className={classes}>
                                                        <Typography
                                                            // variant="small"
                                                            // color="blue-gray"
                                                            className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                                                        >
                                                            {formatDate(expense.created_on)}
                                                        </Typography>
                                                    </td>
                                                    <td className={classes}>
                                                        <Typography
                                                            // variant="small"
                                                            // color="blue-gray"
                                                            className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                                                        >
                                                            {Math.round(expense.amount)}
                                                        </Typography>
                                                    </td>
                                                    <td className={classes}>
                                                        <span
                                                            className={`px-4 py-1 text-xs rounded-[7px] w-[110px] font-medium ${getStatusColor(expense.status)}`}
                                                        >
                                                            {expense.status || '-'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-4">
                                                <div className="flex flex-col items-center justify-center gap-2 text-center">
                                                    <img src={noRecordFound} alt="No record found" className='w-80' />
                                                    <span className="text-[#292929] font-medium text-[12px]">
                                                        No details found!
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    {renderLoadMore()}
                </>
            )}

            {/* Add Expense Drawer */}
            <CustomDrawer
                open={addExpenseDrawerOpen}
                closeDrawer={handleCloseDrawer}
                title="Add Expense"
                direction="right"
                widthSize={800}
                compo={
                    <AddExpenseForm
                        onSubmit={handleExpenseSubmit}
                        onCancel={handleCloseDrawer}
                        onReset={setResetFormFunction}
                    />
                }
            />
        </div>
    )
}

export default EmpExpense;
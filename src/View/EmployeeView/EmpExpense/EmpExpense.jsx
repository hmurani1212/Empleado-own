import React, { useEffect, useState, useMemo } from 'react'
import { Typography, Card, CardBody, Chip, IconButton, Tooltip, Button } from '@material-tailwind/react'
import CustomDrawer from '../../../Components/CustomDrawer/CustomDrawer'
import AddExpenseForm from './AddExpenseForm'
import useStore from '../../../Store/store'
import empExpenseApi from '../../../Model/Data/EmpData/EmpExpense/EmpExpense'
import { toast } from 'react-toastify'
import noRecordFound from '../../../assets/employee_side_images/no record found.gif';
import { motion, AnimatePresence } from 'framer-motion'
import { FaFileInvoiceDollar, FaPlus, FaCheck, FaTimes, FaClock, FaReceipt } from 'react-icons/fa'
import { HiCurrencyDollar, HiOutlineDocumentText } from "react-icons/hi";

const SkeletonCard = () => (
  <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-3 w-full">
        <div className="h-3 w-24 bg-gray-200 rounded"></div>
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 w-10 rounded-full bg-gray-200"></div>
    </div>
  </div>
);

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-100">
    <td className="py-4 px-6">
       <div className="flex items-center gap-3">
         <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
         <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
         </div>
       </div>
    </td>
    <td className="py-4 px-6"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
    <td className="py-4 px-6"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
    <td className="py-4 px-6"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
    <td className="py-4 px-6"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
    <td className="py-4 px-6"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
  </tr>
);

const tableHeader = [
    "Expense Name", "Category", "Created By", "Date", "Total Amount", "Status"
]

const EmpExpense = () => {
    const [addExpenseDrawerOpen, setAddExpenseDrawerOpen] = useState(false)
    const [resetFormFunction, setResetFormFunction] = useState(null)

    const {
        expenseList,
        loading,
        loadingMore,
        hasMoreData,
        gettingExpenseList,
        loadMoreExpenses
    } = useStore()

    useEffect(() => {
        gettingExpenseList()
    }, [])

    // Calculate Stats
    const stats = useMemo(() => {
        if (!expenseList) return { total: 0, amount: 0, pending: 0, approved: 0 };
        
        return expenseList.reduce((acc, curr) => {
            acc.total++;
            acc.amount += parseFloat(curr.amount || 0);
            if (curr.status?.toLowerCase() === 'pending') acc.pending++;
            if (curr.status?.toLowerCase() === 'approved') acc.approved++;
            return acc;
        }, { total: 0, amount: 0, pending: 0, approved: 0 });
    }, [expenseList]);

    const handleAddExpense = () => setAddExpenseDrawerOpen(true)
    const handleCloseDrawer = () => setAddExpenseDrawerOpen(false)

    const handleExpenseSubmit = async (formData) => {
        try {
            const apiPayload = {
                title: formData.title,
                desc: formData.description,
                type: formData.expenseType,
                date: new Date(formData.date).toISOString(),
                items: formData.items.map(item => ({
                    item: item.item,
                    category: item.category,
                    amount: parseFloat(item.amount),
                    attachment: item.attachment ? item.attachment.name : null
                }))
            }

            const response = await empExpenseApi.addEmployeeExpense(apiPayload)

            if (response.data && response.data.STATUS === 'SUCCESSFUL') {
                toast.success('Expense submitted successfully!')
                if (resetFormFunction) resetFormFunction()
                setAddExpenseDrawerOpen(false)
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
            return new Date(dateString).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            })
        } catch (error) {
            return dateString
        }
    }

    const formatAmount = (amount) => {
        if (!amount && amount !== 0) return '-'
        return new Intl.NumberFormat('en-PK', {
            style: 'currency', currency: 'PKR', maximumFractionDigits: 0
        }).format(amount)
    }

    const getStatusChip = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return <Chip variant="ghost" color="amber" value="Pending" icon={<FaClock />} size="sm" className="rounded-full px-2" />;
            case 'approved':
                return <Chip variant="ghost" color="green" value="Approved" icon={<FaCheck />} size="sm" className="rounded-full px-2" />;
            case 'rejected':
                return <Chip variant="ghost" color="red" value="Rejected" icon={<FaTimes />} size="sm" className="rounded-full px-2" />;
            default:
                return <Chip variant="ghost" color="blue-gray" value={status || '-'} size="sm" className="rounded-full px-2" />;
        }
    }

    const getCategoryLabel = (expense) => {
        const catValue = expense?.category?.[0];
        const categories = { 0: 'Fuel', 1: 'Hotel', 2: 'Lunch', 3: 'Dinner' };
        return categories[catValue] || 'General';
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300 } }
    };

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className='flex flex-col gap-6 p-4 md:p-6 min-h-screen bg-gray-50/50 font-poppins'
        >
            {/* Header */}
            <motion.div variants={itemVariants} className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100'>
                <div className='flex items-center gap-4'>
                    <div className='p-3 bg-brand-50 rounded-xl text-brand-500'>
                        <FaFileInvoiceDollar className='text-2xl' />
                    </div>
                    <div>
                        <h1 className='text-2xl font-bold text-gray-800'>Expense Claims</h1>
                        <p className='text-sm text-gray-500 mt-1'>Manage and track your reimbursement claims</p>
                    </div>
                </div>
                <Button 
                    className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 shadow-brand-500/20"
                    onClick={handleAddExpense}
                >
                    <FaPlus /> New Claim
                </Button>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                {loading && (!expenseList || expenseList.length === 0) ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    <>
                        <Card className='shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300'>
                            <CardBody className='p-4 flex items-center justify-between'>
                                <div>
                                    <p className='text-xs text-gray-500 font-bold uppercase'>Total Claims</p>
                                    <h3 className='text-2xl font-bold text-gray-800 mt-1'>{stats.total}</h3>
                                </div>
                                <div className='p-3 bg-blue-50 text-blue-500 rounded-full'><HiOutlineDocumentText size={20} /></div>
                            </CardBody>
                        </Card>
                        <Card className='shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300'>
                            <CardBody className='p-4 flex items-center justify-between'>
                                <div>
                                    <p className='text-xs text-gray-500 font-bold uppercase'>Total Amount</p>
                                    <h3 className='text-2xl font-bold text-gray-800 mt-1'>{formatAmount(stats.amount)}</h3>
                                </div>
                                <div className='p-3 bg-green-50 text-green-500 rounded-full'><HiCurrencyDollar size={20} /></div>
                            </CardBody>
                        </Card>
                        <Card className='shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300'>
                            <CardBody className='p-4 flex items-center justify-between'>
                                <div>
                                    <p className='text-xs text-gray-500 font-bold uppercase'>Pending</p>
                                    <h3 className='text-2xl font-bold text-gray-800 mt-1'>{stats.pending}</h3>
                                </div>
                                <div className='p-3 bg-amber-50 text-amber-500 rounded-full'><FaClock size={20} /></div>
                            </CardBody>
                        </Card>
                        <Card className='shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300'>
                            <CardBody className='p-4 flex items-center justify-between'>
                                <div>
                                    <p className='text-xs text-gray-500 font-bold uppercase'>Approved</p>
                                    <h3 className='text-2xl font-bold text-gray-800 mt-1'>{stats.approved}</h3>
                                </div>
                                <div className='p-3 bg-purple-50 text-purple-500 rounded-full'><FaCheck size={20} /></div>
                            </CardBody>
                        </Card>
                    </>
                )}
            </motion.div>

            {/* Expenses List */}
            <motion.div variants={itemVariants}>
                <Card className='rounded-2xl shadow-card border border-gray-100 overflow-hidden'>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className='bg-gray-50 border-b border-gray-200'>
                                <tr>
                                    {tableHeader.map((head, i) => (
                                        <th key={i} className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            {head}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading && (!expenseList || expenseList.length === 0) ? (
                                    <>
                                        {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
                                    </>
                                ) : expenseList?.length > 0 ? (
                                    expenseList.map((expense, index) => (
                                        <motion.tr 
                                            key={expense.id || index} 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-brand-50 rounded-lg text-brand-500">
                                                        <FaReceipt />
                                                    </div>
                                                    <div>
                                                        <Typography variant="small" color="blue-gray" className="font-bold">
                                                            {expense.expense_name || 'Expense Claim'}
                                                        </Typography>
                                                        <Typography variant="small" className="text-gray-400 text-xs">
                                                            ID: {expense.id?.toString().slice(-6) || 'N/A'}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                                                    {getCategoryLabel(expense)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-sm font-medium text-gray-700">
                                                {expense.created_by || 'Me'}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {formatDate(expense.created_on)}
                                            </td>
                                            <td className="py-4 px-6 text-sm font-bold text-gray-800">
                                                {formatAmount(expense.amount)}
                                            </td>
                                            <td className="py-4 px-6">
                                                {getStatusChip(expense.status)}
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <img src={noRecordFound} alt="No record" className="w-40 opacity-70 mix-blend-multiply mb-4" />
                                                <Typography color="gray" className="font-medium">No expense claims found</Typography>
                                                <Button variant="text" color="blue" onClick={handleAddExpense} className="mt-2">
                                                    Create your first claim
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Load More Button */}
                    {hasMoreData && (
                        <div className="p-4 border-t border-gray-100 flex justify-center">
                            <Button 
                                variant="text" 
                                color="blue-gray" 
                                onClick={loadMoreExpenses}
                                disabled={loadingMore}
                                className="flex items-center gap-2"
                            >
                                {loadingMore && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                                {loadingMore ? "Loading..." : "Load More"}
                            </Button>
                        </div>
                    )}
                </Card>
            </motion.div>

            {/* Add Expense Drawer */}
            <CustomDrawer
                open={addExpenseDrawerOpen}
                closeDrawer={handleCloseDrawer}
                title="New Expense Claim"
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
        </motion.div>
    )
}

export default EmpExpense
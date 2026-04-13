import React, { useLayoutEffect, useState, useMemo } from 'react'
import { Typography, Card, CardBody, Chip, IconButton, Button } from '@material-tailwind/react'
import CustomDrawer from '../../../Components/CustomDrawer/CustomDrawer'
import AddExpenseForm from './AddExpenseForm'
import useStore from '../../../Store/store'
import empExpenseApi from '../../../Model/Data/EmpData/EmpExpense/EmpExpense'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import { FaFileInvoiceDollar, FaPlus, FaCheck, FaTimes, FaClock, FaReceipt } from 'react-icons/fa'
import { HiCurrencyDollar, HiOutlineDocumentText } from "react-icons/hi";

const SkeletonCard = () => (
  <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-3 w-full">
        <div className="h-3 w-24 bg-gray-200 rounded"></div>
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
      </div>
      <div className="h-10 w-10 rounded-xl bg-gray-200"></div>
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

    useLayoutEffect(() => {
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
                return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-600 border border-amber-100 flex items-center gap-1 w-fit"><FaClock className="text-[10px]" /> Pending</span>;
            case 'approved':
                return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-100 flex items-center gap-1 w-fit"><FaCheck className="text-[10px]" /> Approved</span>;
            case 'rejected':
                return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100 flex items-center gap-1 w-fit"><FaTimes className="text-[10px]" /> Rejected</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200 w-fit">{status || '-'}</span>;
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

    const StatCard = ({ title, value, icon, colorClass, bgColorClass }) => (
        <motion.div
            variants={itemVariants}
            className={`relative overflow-hidden rounded-2xl p-5 ${bgColorClass} shadow-sm border border-transparent hover:shadow-md transition-all duration-300 group`}
        >
            <div className="flex items-center justify-between z-10 relative">
                <div className="flex flex-col gap-1">
                    <Typography className="text-sm font-medium text-white/90 font-poppins">
                        {title}
                    </Typography>
                    <Typography className="text-2xl font-bold text-white font-poppins">
                        {value}
                    </Typography>
                </div>
                <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm text-white ${colorClass}`}>
                    {icon}
                </div>
            </div>
            {/* Decorative circle */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
        </motion.div>
    );

    return (
        <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={containerVariants}
            className='flex flex-col gap-6 p-6 min-h-screen bg-gray-50/50 font-poppins'
        >
            {/* Header */}
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-900'>Expense Claims</h1>
                    <p className='text-sm text-gray-500 mt-1'>Manage and track your reimbursement claims</p>
                </div>
                <Button 
                    className="flex items-center gap-2 bg-bgBlue hover:bg-blue-600 shadow-blue-500/20 hover:shadow-blue-500/40 rounded-xl py-2.5 px-6 normal-case font-medium"
                    onClick={handleAddExpense}
                >
                    <FaPlus className="text-sm" /> New Claim
                </Button>
            </div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {loading && (!expenseList || expenseList.length === 0) ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    <>
                        <StatCard 
                            title="Total Claims" 
                            value={stats.total} 
                            icon={<HiOutlineDocumentText size={20} />} 
                            bgColorClass="bg-[#3DA5F4]"
                        />
                        <StatCard 
                            title="Total Amount" 
                            value={formatAmount(stats.amount)} 
                            icon={<HiCurrencyDollar size={20} />} 
                            bgColorClass="bg-[#0ACF97]"
                        />
                        <StatCard 
                            title="Pending" 
                            value={stats.pending} 
                            icon={<FaClock size={20} />} 
                            bgColorClass="bg-[#FDA006]"
                        />
                        <StatCard 
                            title="Approved" 
                            value={stats.approved} 
                            icon={<FaCheck size={20} />} 
                            bgColorClass="bg-[#8bc9f8]"
                        />
                    </>
                )}
            </div>

            {/* Expenses List */}
            <motion.div variants={itemVariants}>
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className="overflow-x-auto customScroll">
                        <table className="w-full text-left min-w-[800px]">
                            <thead className='bg-gray-50/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10'>
                                <tr>
                                    {tableHeader.map((head, i) => (
                                        <th key={i} className="p-4 first:pl-6 last:pr-6 whitespace-nowrap">
                                            <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                                                {head}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
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
                                            className="hover:bg-blue-50/30 transition-colors group"
                                        >
                                            <td className="p-4 first:pl-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-lg">
                                                        <FaReceipt />
                                                    </div>
                                                    <div>
                                                        <Typography className="text-sm font-semibold text-gray-900 font-poppins">
                                                            {expense.expense_name || 'Expense Claim'}
                                                        </Typography>
                                                        <Typography className="text-xs text-gray-400 font-poppins">
                                                            ID: {expense.id?.toString().slice(-6) || 'N/A'}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium font-poppins">
                                                    {getCategoryLabel(expense)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <Typography className="text-sm font-medium text-gray-700 font-poppins">
                                                    {expense.created_by || 'Me'}
                                                </Typography>
                                            </td>
                                            <td className="p-4">
                                                <Typography className="text-sm text-gray-600 font-poppins">
                                                    {formatDate(expense.created_on)}
                                                </Typography>
                                            </td>
                                            <td className="p-4">
                                                <Typography className="text-sm font-bold text-gray-800 font-poppins">
                                                    {formatAmount(expense.amount)}
                                                </Typography>
                                            </td>
                                            <td className="p-4 last:pr-6">
                                                {getStatusChip(expense.status)}
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                                                    <FaReceipt className="text-3xl text-gray-300" />
                                                </div>
                                                <Typography className="font-medium font-poppins">No expense claims found</Typography>
                                                <Button variant="text" color="blue" onClick={handleAddExpense} className="mt-2 normal-case font-medium">
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
                        <div className="p-4 border-t border-gray-100 flex justify-center bg-gray-50/50">
                            <Button 
                                variant="text" 
                                color="blue-gray" 
                                onClick={loadMoreExpenses}
                                disabled={loadingMore}
                                className="flex items-center gap-2 normal-case font-medium text-gray-600 hover:text-bgBlue"
                            >
                                {loadingMore && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                                {loadingMore ? "Loading..." : "Load More"}
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Add Expense Drawer */}
            <CustomDrawer
                open={addExpenseDrawerOpen}
                closeDrawer={handleCloseDrawer}
                title="New Expense Claim"
                direction="right"
                widthSize={620}
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
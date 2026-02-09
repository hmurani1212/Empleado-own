import React, { useEffect, useMemo } from 'react'
import { Typography, Card, CardBody, Button, Chip } from '@material-tailwind/react'
import useNewAdjustRequest from '../../../ViewModel/AttendanceViewModel/newAdjustRequest'
import PortalDrawer from '../../../Components/CustomDrawer/PortalDrawer'
import CreateNewRequest from '../../Attendance/CreateNewRequest'
import useEmpTimeAdjustmentServices from '../../../ViewModel/EmpViewModel/EmpTimeAdjustment/EmpTimeAdjustmentService'
import { formatDateDMY, formatTimeTo12Hour } from '../../../services/__dateTimeServices'
import noRecordFound from '../../../assets/employee_side_images/no record found.gif';
import { motion } from 'framer-motion';
import { FaPlus, FaClock, FaCheck, FaTimes, FaCalendarAlt, FaHourglassHalf } from 'react-icons/fa';
import { HiOutlineAdjustments } from "react-icons/hi";

const tableHeader = [
  "Actual Time", "Adjustment Date", "Requested Time", "Detail", "Status"
]

const EmpTimeAdjustment = () => {
    const {formValue, handleChangeAdjustRequest, toggleAddNewAdjustRequest, NewAdjustRequest, handleNewTimeRequest} = useNewAdjustRequest()
    const {getTimeAjustmentData, timeAjustmentData} = useEmpTimeAdjustmentServices()
    
    useEffect(()=>{
        getTimeAjustmentData()
    },[]);

    // Calculate Stats
    const stats = useMemo(() => {
        if (!timeAjustmentData) return { total: 0, pending: 0, approved: 0, rejected: 0 };
        
        return timeAjustmentData.reduce((acc, curr) => {
            acc.total++;
            if (curr.status === 0) acc.pending++;
            if (curr.status === 1) acc.approved++;
            if (curr.status === 2) acc.rejected++;
            return acc;
        }, { total: 0, pending: 0, approved: 0, rejected: 0 });
    }, [timeAjustmentData]);

    const getStatusChip = (status) => {
        switch (status) {
            case 0:
                return <Chip variant="ghost" color="amber" value="Pending" icon={<FaHourglassHalf />} size="sm" className="rounded-full px-2" />;
            case 1:
                return <Chip variant="ghost" color="green" value="Approved" icon={<FaCheck />} size="sm" className="rounded-full px-2" />;
            case 2:
                return <Chip variant="ghost" color="red" value="Rejected" icon={<FaTimes />} size="sm" className="rounded-full px-2" />;
            default:
                return <Chip variant="ghost" color="blue-gray" value="Unknown" size="sm" className="rounded-full px-2" />;
        }
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
                     <HiOutlineAdjustments className='text-2xl' />
                   </div>
                   <div>
                      <h1 className='text-2xl font-bold text-gray-800'>Time Adjustment</h1>
                      <p className='text-sm text-gray-500 mt-1'>Manage your time adjustment requests</p>
                   </div>
                </div>
                <Button 
                    className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 shadow-brand-500/20"
                    onClick={NewAdjustRequest}
                >
                    <FaPlus /> New Request
                </Button>
            </motion.div>

            {/* Stats Cards */}
            <motion.div variants={itemVariants} className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <Card className='shadow-sm border border-gray-100'>
                    <CardBody className='p-4 flex items-center justify-between'>
                        <div>
                            <p className='text-xs text-gray-500 font-bold uppercase'>Total Requests</p>
                            <h3 className='text-2xl font-bold text-gray-800 mt-1'>{stats.total}</h3>
                        </div>
                        <div className='p-3 bg-blue-50 text-blue-500 rounded-full'><FaClock size={20} /></div>
                    </CardBody>
                </Card>
                <Card className='shadow-sm border border-gray-100'>
                    <CardBody className='p-4 flex items-center justify-between'>
                        <div>
                            <p className='text-xs text-gray-500 font-bold uppercase'>Pending</p>
                            <h3 className='text-2xl font-bold text-gray-800 mt-1'>{stats.pending}</h3>
                        </div>
                        <div className='p-3 bg-amber-50 text-amber-500 rounded-full'><FaHourglassHalf size={20} /></div>
                    </CardBody>
                </Card>
                <Card className='shadow-sm border border-gray-100'>
                    <CardBody className='p-4 flex items-center justify-between'>
                        <div>
                            <p className='text-xs text-gray-500 font-bold uppercase'>Approved</p>
                            <h3 className='text-2xl font-bold text-gray-800 mt-1'>{stats.approved}</h3>
                        </div>
                        <div className='p-3 bg-green-50 text-green-500 rounded-full'><FaCheck size={20} /></div>
                    </CardBody>
                </Card>
                <Card className='shadow-sm border border-gray-100'>
                    <CardBody className='p-4 flex items-center justify-between'>
                        <div>
                            <p className='text-xs text-gray-500 font-bold uppercase'>Rejected</p>
                            <h3 className='text-2xl font-bold text-gray-800 mt-1'>{stats.rejected}</h3>
                        </div>
                        <div className='p-3 bg-red-50 text-red-500 rounded-full'><FaTimes size={20} /></div>
                    </CardBody>
                </Card>
            </motion.div>

            {/* Request List */}
            <motion.div variants={itemVariants}>
                <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden">
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
                                {timeAjustmentData?.length > 0 ? (
                                    timeAjustmentData
                                        .filter(ele => ele && ele._id)
                                        .map((ele, index) => (
                                            <motion.tr 
                                                key={ele._id || index}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="py-4 px-6 text-sm text-gray-600">
                                                    {ele?.entry_time ? formatDateDMY(ele.entry_time) : '-'}
                                                </td>
                                                <td className="py-4 px-6 text-sm font-medium text-gray-700">
                                                    <div className="flex items-center gap-2">
                                                        <FaCalendarAlt className="text-gray-400" />
                                                        {ele?.form_data?.date ? formatDateDMY(ele?.form_data?.date) : '-'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-gray-600">
                                                    <div className="flex flex-col text-xs">
                                                        <span className="flex items-center gap-1">
                                                            <span className="font-semibold text-gray-700 w-8">In:</span> 
                                                            {formatTimeTo12Hour(ele?.form_data?.in_time || '')}
                                                        </span>
                                                        <span className="flex items-center gap-1 mt-1">
                                                            <span className="font-semibold text-gray-700 w-8">Out:</span> 
                                                            {formatTimeTo12Hour(ele?.form_data?.out_time || '')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <p className="text-sm text-gray-600 max-w-xs truncate" title={ele?.form_data?.reason}>
                                                        {ele?.form_data?.reason || '-'}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {getStatusChip(ele?.status)}
                                                </td>
                                            </motion.tr>
                                        ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-gray-400">
                                            <div className="flex flex-col items-center justify-center">
                                                <img src={noRecordFound} alt="No record found" className='w-40 opacity-70 mix-blend-multiply mb-4' />
                                                <Typography color="gray" className="font-medium">No time adjustment requests found!</Typography>
                                                <Button variant="text" color="blue" onClick={NewAdjustRequest} className="mt-2">
                                                    Create your first request
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </motion.div>

            {/* Create Request Drawer */}
            {formValue.show && 
                <PortalDrawer 
                    open={formValue.show}
                    closeDrawer={toggleAddNewAdjustRequest}
                    compo={
                        <CreateNewRequest 
                            formValue={formValue}
                            handleChangeAdjustRequest={handleChangeAdjustRequest}
                            handleNewTimeRequest={handleNewTimeRequest}
                            isAdminSide={false}
                            employeeList={[]}
                            selectedEmployee={null}
                            handleEmployeeChange={() => {}}
                        />
                    }
                    title="New Time Adjustment Request"
                    widthSize={600}
                />
            }
        </motion.div>
    )
}

export default EmpTimeAdjustment

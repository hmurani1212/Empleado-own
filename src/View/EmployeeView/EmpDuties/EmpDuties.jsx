import React, { useEffect } from 'react'
import { Typography, Card, CardBody, Chip } from '@material-tailwind/react'
import useStore from '../../../Store/store'
import noRecordFound from '../../../assets/employee_side_images/no record found.gif';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaCheck, FaTimes, FaHourglassHalf } from 'react-icons/fa';

const tableHeader = [
  "Title", "Description", "Frequency", "Effective From", "Enforced Till", "Status"
]

const EmpDuties = () => {
  const { 
    employeeDuties, 
    loading, 
    gettingEmployeeDuties 
  } = useStore()

  useEffect(() => {
    gettingEmployeeDuties()
  }, [])

  const formatDate = (timestamp) => {
    if (!timestamp) return '-'
    try {
      const date = new Date(timestamp * 1000) 
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      return '-'
    }
  }

  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'zero':
        return { text: 'Pending', color: 'amber', icon: <FaHourglassHalf /> }
      case 'one':
        return { text: 'Approved', color: 'green', icon: <FaCheck /> }
      case 'two':
        return { text: 'Rejected', color: 'red', icon: <FaTimes /> }
      default:
        return { text: 'Unknown', color: 'gray', icon: null }
    }
  }

  const formatFrequency = (unit, duration) => {
    if (!unit || !duration) return '-'
    return `Every ${duration} ${unit}${duration > 1 ? 's' : ''}`
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
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
        <div>
           <h1 className='text-2xl font-bold text-gray-800'>Extra Duties</h1>
           <p className='text-sm text-gray-500 mt-1'>View your assigned extra responsibilities</p>
        </div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-800">Assigned Duties</h3>
            </div>
            
            <CardBody className="p-0 overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                  </div>
                ) : (
                  <table className="w-full min-w-max text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-200">
                        {tableHeader?.map((head, i) => (
                          <th key={i} className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {head}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {employeeDuties?.duties?.length > 0 ? (
                        employeeDuties.duties.map((duty, index) => (
                          <tr key={duty.id || index} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                                <span className="font-semibold text-gray-800">{duty.title || '-'}</span>
                            </td>
                            <td className="p-4">
                                <p className="text-sm text-gray-600 max-w-xs truncate" title={duty.description}>{duty.description || '-'}</p>
                            </td>
                            <td className="p-4">
                                <span className="text-sm font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">
                                    {formatFrequency(duty.repetition_unit, duty.repetition_duration)}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                                {formatDate(duty.effective_from)}
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                                {formatDate(duty.enforce_till)}
                            </td>
                            <td className="p-4">
                              {(() => {
                                const statusInfo = getStatusInfo(duty.acceptance_status)
                                return (
                                  <Chip
                                    variant="ghost"
                                    size="sm"
                                    value={statusInfo.text}
                                    color={statusInfo.color}
                                    icon={statusInfo.icon}
                                    className="rounded-full px-2"
                                  />
                                )
                              })()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center">
                            <div className="flex flex-col items-center justify-center gap-3">
                                <img src={noRecordFound} alt="No record found" className='w-40 opacity-80 mix-blend-multiply' />
                                <span className="text-gray-500 font-medium">
                                  No extra duties assigned yet!
                                </span>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
            </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default EmpDuties
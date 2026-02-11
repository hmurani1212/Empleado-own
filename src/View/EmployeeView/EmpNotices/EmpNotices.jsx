import { Card, CardBody } from '@material-tailwind/react';
import React, { useEffect } from 'react';
import useEmpNoticesServices from '../../../ViewModel/EmpViewModel/EmpNoticesViewModel/EmpNotices';
import noRecordFound from '../../../assets/employee_side_images/no record found.gif';
import { motion } from 'framer-motion';
import { HiSpeakerphone } from "react-icons/hi";
import EmpNoticesTableSkeleton from './EmpNoticesSkeleton';

const EmpNotices = () => {
  const { getEmpNoticesData, noticesData, noticesLoading } = useEmpNoticesServices();

  useEffect(() => {
    getEmpNoticesData();
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
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
      className="flex flex-col gap-6 p-4 md:p-6 min-h-screen bg-gray-50/50 font-poppins"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100'>
        <div className='flex items-center gap-4'>
           <div className='p-3 bg-brand-50 rounded-xl text-brand-500'>
             <HiSpeakerphone className='text-2xl' />
           </div>
           <div>
              <h1 className='text-2xl font-bold text-gray-800'>Notices Board</h1>
              <p className='text-sm text-gray-500 mt-1'>Stay updated with latest announcements</p>
           </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        {noticesLoading ? (
          <EmpNoticesTableSkeleton />
        ) : (
        <Card className="rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <CardBody className="p-0">
             {/* Header Row */}
             <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 grid grid-cols-12 gap-4">
                 <div className="col-span-12 md:col-span-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Title</div>
                 <div className="col-span-12 md:col-span-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</div>
                 <div className="col-span-12 md:col-span-7 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</div>
             </div>

             <div className="divide-y divide-gray-100 max-h-[calc(100vh-250px)] overflow-y-auto customScroll">
                {noticesData?.length > 0 ? (
                    noticesData.map((ele, index) => (
                       <motion.div 
                          key={ele?.id || index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-6 hover:bg-gray-50/50 transition-colors grid grid-cols-12 gap-4 items-start"
                       >
                          <div className="col-span-12 md:col-span-3">
                              <h3 className="font-semibold text-gray-800 text-sm">{ele?.title}</h3>
                          </div>
                          
                          <div className="col-span-12 md:col-span-2 flex items-center gap-2">
                              <div className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-600">
                                {formatDate(ele?.timestamp)}
                              </div>
                          </div>
                          
                          <div className="col-span-12 md:col-span-7">
                              <p className="text-sm text-gray-600 leading-relaxed text-justify">{ele?.description}</p>
                          </div>
                       </motion.div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <img src={noRecordFound} alt="No record found" className='w-48 opacity-80 mix-blend-multiply mb-4' />
                        <h3 className="text-lg font-semibold text-gray-700">No notices found!</h3>
                        <p className="text-gray-500 text-sm">You're all caught up with announcements.</p>
                    </div>
                )}
             </div>
          </CardBody>
        </Card>
        )}
      </motion.div>
    </motion.div>
  );
};

export default EmpNotices;

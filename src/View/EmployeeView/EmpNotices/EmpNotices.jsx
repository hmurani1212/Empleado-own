import { Card, CardBody } from '@material-tailwind/react';
import React, { useEffect, useMemo, useState } from 'react';
import useEmpNoticesServices from '../../../ViewModel/EmpViewModel/EmpNoticesViewModel/EmpNotices';
import noRecordFound from '../../../assets/employee_side_images/no record found.gif';
import { motion } from 'framer-motion';
import { HiSpeakerphone } from "react-icons/hi";
import EmpNoticesTableSkeleton from './EmpNoticesSkeleton';
import CustomSelect from '../../../Components/CustomSelect/CustomSelect';
import { getAllMonths, getAllYears } from '../../../services/__appServicesData';

const EmpNotices = () => {
  const { getEmpNoticesData, noticesData, noticesLoading, noticesPagination } = useEmpNoticesServices();
  const [filters, setFilters] = useState({
    month: null,
    year: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const months = getAllMonths();
  const years = getAllYears();
  const monthOptions = useMemo(
    () => [{ value: '', label: 'Select Month' }, ...(months?.map((month) => ({ value: month.id, label: month.title })) || [])],
    [months]
  );
  const yearOptions = useMemo(
    () => [{ value: '', label: 'Select Year' }, ...(years?.map((year) => ({ value: year, label: year })) || [])],
    [years]
  );
  const monthValue = filters?.month?.value;
  const yearValue = filters?.year?.value;
  const hasMonth = Boolean(monthValue);
  const hasYear = Boolean(yearValue);

  useEffect(() => {
    const selectedMonthPlaceholder = monthValue === '' || monthValue == null;
    const selectedYearPlaceholder = yearValue === '' || yearValue == null;
    const shouldFetchFiltered = hasMonth && hasYear;
    const shouldFetchUnfiltered = selectedMonthPlaceholder && selectedYearPlaceholder;

    // Call API only when both values are chosen:
    // 1) both real values -> filtered call
    // 2) both reset options -> unfiltered call
    if (!shouldFetchFiltered && !shouldFetchUnfiltered) return;

    getEmpNoticesData({
      ...(shouldFetchFiltered ? { month: monthValue, year: yearValue } : {}),
      page: currentPage,
      limit: 15,
    });
  }, [hasMonth, hasYear, monthValue, yearValue, currentPage]);

  const handleFilterChange = (selectedOption, key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: selectedOption,
    }));
    setCurrentPage(1);
  };

  const totalPages = noticesPagination?.totalPages || 1;
  const safeCurrentPage = noticesPagination?.currentPage || currentPage || 1;

  const visiblePages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    pages.push(1);
    if (safeCurrentPage > 3) pages.push("ellipsis-start");
    const startPage = Math.max(2, safeCurrentPage - 1);
    const endPage = Math.min(totalPages - 1, safeCurrentPage + 1);
    for (let i = startPage; i <= endPage; i += 1) pages.push(i);
    if (safeCurrentPage < totalPages - 2) pages.push("ellipsis-end");
    pages.push(totalPages);
    return pages;
  }, [safeCurrentPage, totalPages]);

  const handlePageChange = (page) => {
    if (!Number.isFinite(page) || page < 1 || page > totalPages || page === safeCurrentPage) return;
    setCurrentPage(page);
  };

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
        <div className='flex items-center gap-3 w-full md:w-auto'>
          <div className='w-full md:w-40'>
            <CustomSelect
              placeHolderTitle='Month'
              value={filters.month}
              options={monthOptions}
              onChangeHandler={(selectedOption) => handleFilterChange(selectedOption, 'month')}
            />
          </div>
          <div className='w-full md:w-32'>
            <CustomSelect
              placeHolderTitle='Year'
              value={filters.year}
              options={yearOptions}
              onChangeHandler={(selectedOption) => handleFilterChange(selectedOption, 'year')}
            />
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

             <div className="divide-y divide-gray-100">
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

             {noticesData?.length > 0 && totalPages > 1 && (
               <div className="w-full flex justify-center items-center gap-2 py-4 border-t border-gray-100">
                 <button
                   title="Previous Page"
                   disabled={safeCurrentPage <= 1}
                   className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                     safeCurrentPage > 1
                       ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                       : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                   }`}
                   onClick={() => handlePageChange(safeCurrentPage - 1)}
                 >
                   ‹
                 </button>

                 <div className="flex items-center gap-1.5">
                   {visiblePages.map((page, index) =>
                     page === "ellipsis-start" || page === "ellipsis-end" ? (
                       <span key={`ellipsis-${index}`} className="text-gray-400 px-1">
                         ...
                       </span>
                     ) : (
                       <button
                         key={page}
                         onClick={() => handlePageChange(page)}
                         className={`w-8 h-8 flex items-center cursor-pointer justify-center rounded-lg text-xs font-medium transition-all ${
                           page === safeCurrentPage
                             ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                             : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                         }`}
                       >
                         {page}
                       </button>
                     )
                   )}
                 </div>

                 <button
                   title="Next Page"
                   disabled={safeCurrentPage >= totalPages}
                   className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                     safeCurrentPage < totalPages
                       ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                       : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                   }`}
                   onClick={() => handlePageChange(safeCurrentPage + 1)}
                 >
                   ›
                 </button>
               </div>
             )}
          </CardBody>
        </Card>
        )}
      </motion.div>
    </motion.div>
  );
};

export default EmpNotices;

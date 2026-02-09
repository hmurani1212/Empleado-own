import { Card, CardBody, MenuItem, Typography, Button } from '@material-tailwind/react'
import React from 'react'
import { IoMdMore } from 'react-icons/io'
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { FaCalendar } from "react-icons/fa";
import { formatTimestamp } from '../Branches/utils'
import useHRPolicies from '../../ViewModel/HRPoliciesViewModel/HRPoliciesServices';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog';
import formatTime from '../../services/__hrPoliciesServices';
import { HiOutlineDocumentText } from "react-icons/hi";

const SkeletonCard = () => (
  <div className="border border-gray-100 bg-white shadow-sm rounded-2xl overflow-hidden p-5 flex flex-col h-full animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3 w-full">
        <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
    </div>
    
    <div className="flex flex-col gap-3 mb-4 flex-1">
      <div className="h-10 bg-gray-100 rounded-lg"></div>
      <div className="h-10 bg-gray-100 rounded-lg"></div>
    </div>
    
    <div className="flex justify-between pt-3 border-t border-gray-100 mt-auto">
      <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
      <div className="h-4 w-24 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const PoliciesGrid = (props) => {
  const {allHrpolicies, hasMore, isLoadingMore, onLoadMore, onNextPage, onPreviousPage, onGoToPage, paginationData} = props
  const {openMenu, openDialog, hrPolicyStatusValue, handleHrPolicyStatus, handleStatusHrPolicy, toggleMenuHrPolicies, handleMenuItemsHrPolicies, hrPoliciesItems} = useHRPolicies()
  
  return (
    
    <div className='pb-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6'>
      {props.loading ? (
        // Show 6 skeleton cards while loading
        Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))
      ) : allHrpolicies.length > 0 ? (
        allHrpolicies?.map((policy, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
          <Card className="border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-2xl overflow-hidden group">
          <CardBody className='p-5 flex flex-col h-full relative'>
              <div className='flex justify-between items-start mb-4'>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-500 rounded-xl group-hover:scale-105 transition-transform duration-300">
                    <HiOutlineDocumentText size={20} />
                  </div>
                  <div>
                    <Typography className='text-gray-900 font-semibold font-poppins text-base line-clamp-1' title={policy.policy_name}>
                      {policy.policy_name}
                    </Typography>
                    <Typography className='text-xs text-gray-400 font-poppins mt-0.5'>
                      ID: #{policy.id}
                    </Typography>
                  </div>
                </div>

                  <div 
                  onMouseEnter={() => toggleMenuHrPolicies(index, true)} onMouseLeave={() => toggleMenuHrPolicies(index, false)} 
                  className='relative'>
                  <Button variant="text" className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 min-w-0 w-8 h-8 flex items-center justify-center">
                      <IoMdMore size={20} />
                  </Button>

                  <AnimatePresence>
                  {openMenu[index] && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.1 }}
                        className='border border-gray-100 rounded-xl absolute z-50 bg-white right-0 w-48 shadow-xl mt-1 py-1'
                      >
                          <ul className="flex w-full flex-col">
                          {/* Edit - First */}
                          <li className="px-1 py-0.5">
                            <button className='w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between rounded-lg transition-colors' onClick={() => handleMenuItemsHrPolicies(1, policy)}>
                              Edit
                              <span className="text-gray-400">{hrPoliciesItems.find(item => item.title === 'Edit').icon}</span>
                            </button>
                          </li>
                          
                          {/* View - Second */}
                          <li className="px-1 py-0.5">
                            <button className='w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between rounded-lg transition-colors' onClick={() => handleMenuItemsHrPolicies(2, policy)}>
                              View
                              <span className="text-gray-400">{hrPoliciesItems.find(item => item.title === 'View').icon}</span>
                            </button>
                          </li>
                          
                          {/* Policy Used By - Third */}
                          <li className="px-1 py-0.5">
                            <button className='w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between rounded-lg transition-colors' onClick={() => handleMenuItemsHrPolicies(5, policy)}>
                              Policy Used By
                              <span className="text-gray-400">{hrPoliciesItems.find(item => item.title === 'Policy Used By').icon}</span>
                            </button>
                          </li>
                          
                          {/* Copy - Fourth */}
                          <li className="px-1 py-0.5">
                            <button className='w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between rounded-lg transition-colors' onClick={() => handleMenuItemsHrPolicies(6, policy)}>
                              Copy
                              <span className="text-gray-400">{hrPoliciesItems.find(item => item.title === 'Copy').icon}</span>
                            </button>
                          </li>

                          <div className="h-px bg-gray-100 my-1 mx-2"></div>

                          {/* Delete/Deactivate - Last */}
                          {policy.status === '0' ? // Assuming '0' is inactive/expired
                          (
                            <li className="px-1 py-0.5">
                              <button className='w-full text-left px-3 py-2 text-xs font-medium text-green-600 hover:bg-green-50 flex items-center justify-between rounded-lg transition-colors' onClick={() => handleMenuItemsHrPolicies(3, policy.id, 1)}>
                                Activate
                                <span>{hrPoliciesItems.find(item => item.title === 'Activate').icon}</span>
                              </button>
                            </li>
                          ) :
                          (
                            <li className="px-1 py-0.5">
                              <button className='w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center justify-between rounded-lg transition-colors' onClick={() => handleMenuItemsHrPolicies(3, policy.id, 0)}>
                                Deactivate
                                <span>{hrPoliciesItems.find(item => item.title === 'Deactivate').icon}</span>
                              </button>
                            </li>
                          )
                        }
                          </ul>
                      </motion.div>
                  )}
                  </AnimatePresence>
              </div>
                 
              </div>
              
              <div className='flex flex-col gap-3 mb-4'>
                  <div className='bg-gray-50 rounded-lg p-3 flex items-center justify-between'>
                      <div className='flex items-center gap-2 text-gray-500'>
                          <MdOutlineAccessTimeFilled className="text-blue-400" />
                          <span className="text-xs font-medium font-poppins">Shift Timing</span>
                      </div>
                      <span className="text-xs font-bold text-gray-700 font-poppins">
                          {formatTime(policy.starting_time)} - {formatTime(policy.closing_time)}
                      </span>
                  </div>

                  <div className='bg-gray-50 rounded-lg p-3 flex items-center justify-between'>
                      <div className='flex items-center gap-2 text-gray-500'>
                          <FaCalendar className="text-blue-400 text-xs" />
                          <span className="text-xs font-medium font-poppins">Created On</span>
                      </div>
                      <span className="text-xs font-bold text-gray-700 font-poppins">
                          {formatTimestamp(policy.creation_time)}
                      </span>
                  </div>
              </div>

              <div className='mt-auto flex items-center justify-between pt-3 border-t border-gray-100'>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    policy.status === '0' 
                      ? 'bg-red-50 text-red-500 border border-red-100' 
                      : 'bg-emerald-50 text-emerald-500 border border-emerald-100'
                }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${policy.status === '0' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                    {policy.status === '0' ? 'Expired' : 'Active'}
                </div>
                
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider font-poppins">
                    {policy.payroll === 1 || policy.payroll === '1' ? 'Time Base' :
                      policy.payroll === 2 || policy.payroll === '2' ? 'Attendance Base' :
                        policy.payroll === 3 || policy.payroll === '3' ? 'Hourly Base' : 'Unknown'}
                </span>

              </div>
          </CardBody>
         
          </Card>
          </motion.div>
          
      ))

      ) : (
        <div className='col-span-3 flex flex-col items-center justify-center p-12 text-gray-400 bg-white rounded-2xl border border-gray-100 border-dashed'>
          <HiOutlineDocumentText className="w-12 h-12 text-gray-300 mb-3" />
          <span className="font-poppins font-medium">No Policies Found</span>
        </div>
      )}
      </div>
      
      {/* Google-style Pagination */}
      {allHrpolicies?.length > 0 && paginationData && paginationData.totalPages > 1 && (
        <div className='flex justify-center items-center gap-2 mt-8'>
          {/* Previous Button */}
          <button
            title="Previous Page"
            disabled={paginationData.currentPage <= 1 || isLoadingMore}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
              paginationData.currentPage > 1
                ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            onClick={onPreviousPage}
          >
            ‹
          </button>
          
          {/* Page Numbers */}
          <div className="flex items-center gap-1.5">
            {(() => {
              const currentPage = paginationData.currentPage;
              const totalPages = paginationData.totalPages;
              
              // If 7 or fewer pages, show all pages
              if (totalPages <= 7) {
                return Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => onGoToPage(pageNum)}
                    disabled={isLoadingMore}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                      pageNum === currentPage
                        ? 'bg-bgBlue text-white shadow-md shadow-blue-500/20'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                ));
              }
              
              // For more than 7 pages, show with ellipsis
              const pages = [];
              pages.push(1);
              
              if (currentPage > 3) {
                pages.push('ellipsis-start');
              }
              
              const startPage = Math.max(2, currentPage - 1);
              const endPage = Math.min(totalPages - 1, currentPage + 1);
              
              for (let i = startPage; i <= endPage; i++) {
                if (i !== 1 && i !== totalPages) {
                  pages.push(i);
                }
              }
              
              if (currentPage < totalPages - 2) {
                pages.push('ellipsis-end');
              }
              
              pages.push(totalPages);
              
              return pages.map((page, index) => {
                if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                  return (
                    <span key={`ellipsis-${index}`} className="text-gray-400 px-1">
                      ...
                    </span>
                  );
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => onGoToPage(page)}
                    disabled={isLoadingMore}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                      page === currentPage
                        ? 'bg-bgBlue text-white shadow-md shadow-blue-500/20'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              });
            })()}
          </div>
          
          {/* Next Button */}
          <button
            title="Next Page"
            disabled={paginationData.currentPage >= paginationData.totalPages || isLoadingMore}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
              paginationData.currentPage < paginationData.totalPages
                ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            onClick={onNextPage}
          >
            ›
          </button>
        </div>
      )}
        
         <ConfirmationDialog 
                openDialog = {openDialog}
                handleOpen = {handleStatusHrPolicy}
                handleConfirm={() => handleHrPolicyStatus()} 
                title = {hrPolicyStatusValue.pstatus === 0 ? 'Confirm Deactivation' : 'Confirm Activation'}
                message = {`Are you sure to ${hrPolicyStatusValue.pstatus === 0 ? 'deactivate' : 'activate'} this policy?`}
      />
            
    </div>
  
  )
}

export default PoliciesGrid
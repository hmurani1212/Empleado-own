import { Card, CardBody, Typography, Button } from '@material-tailwind/react'
import React from 'react'
import { IoMdMore } from 'react-icons/io'
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { FaCalendar } from "react-icons/fa";
import { formatTimestamp } from '../Branches/utils'
import useHRPolicies from '../../ViewModel/HRPoliciesViewModel/HRPoliciesServices';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog';
import formatTime, { isHrPolicyInactive } from '../../services/__hrPoliciesServices';
import { HiOutlineDocumentText } from "react-icons/hi";

function policyPayrollLabel(payroll) {
  if (payroll === 1 || payroll === '1') return 'Time Base'
  if (payroll === 2 || payroll === '2') return 'Attendance Base'
  if (payroll === 3 || payroll === '3') return 'Hourly Base'
  return 'Unknown'
}

function policyPayrollBadgeClass(payroll) {
  if (payroll === 1 || payroll === '1') {
    return 'bg-amber-50 text-amber-800 ring-amber-200/80'
  }
  if (payroll === 2 || payroll === '2') {
    return 'bg-violet-50 text-violet-800 ring-violet-200/80'
  }
  if (payroll === 3 || payroll === '3') {
    return 'bg-teal-50 text-teal-800 ring-teal-200/80'
  }
  return 'bg-slate-100/95 text-slate-600 ring-slate-200/80'
}

const SkeletonCard = () => (
  <div className="relative h-full min-h-[190px] border border-gray-200 bg-white shadow-md rounded-xl overflow-hidden flex flex-col animate-pulse">
    <div className="h-0.5 bg-slate-200" />
    <div className="p-3 sm:p-3.5 flex flex-col flex-1">
      <div className="flex justify-between items-start gap-2 mb-3">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <div className="w-9 h-9 bg-slate-200 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5 pt-0.5">
            <div className="h-3.5 bg-slate-200 rounded-lg w-[85%]" />
            <div className="h-2.5 bg-slate-200 rounded w-20" />
          </div>
        </div>
        <div className="w-8 h-8 bg-slate-200 rounded-lg shrink-0" />
      </div>
      <div className="rounded-lg border border-gray-100 bg-slate-50/80 overflow-hidden mb-3 flex-1">
        <div className="h-9 bg-slate-100/80 border-b border-gray-100" />
        <div className="h-9 bg-slate-50/80" />
      </div>
      <div className="flex justify-between items-center gap-2 pt-2 mt-auto border-t border-gray-100">
        <div className="h-5 w-16 bg-slate-200 rounded-full" />
        <div className="h-5 w-14 bg-slate-200 rounded-full" />
      </div>
    </div>
  </div>
);

const PoliciesGrid = (props) => {
  const {allHrpolicies, hasMore, isLoadingMore, onLoadMore, onNextPage, onPreviousPage, onGoToPage, paginationData} = props
  const {openMenu, openDialog, hrPolicyStatusValue, handleHrPolicyStatus, handleStatusHrPolicy, toggleMenuHrPolicies, handleMenuItemsHrPolicies, hrPoliciesItems} = useHRPolicies()
  
  return (
    
    <div className='pb-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5'>
      {props.loading ? (
        // Show 6 skeleton cards while loading
        Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))
      ) : allHrpolicies.length > 0 ? (
        allHrpolicies?.map((policy, index) => {
          const inactive = isHrPolicyInactive(policy.status)
          return (
          <motion.div
            key={index}
            className={`h-full relative ${openMenu[index] ? 'z-[80]' : 'z-0'}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: index * 0.04 }}
          >
          <Card className="group relative h-full min-h-[190px] border border-gray-200 bg-white shadow-md hover:shadow-lg hover:border-gray-300 transition-all duration-300 rounded-xl overflow-visible">
          <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none" aria-hidden />
          <CardBody className='p-3 sm:p-3.5 flex flex-col h-full relative pt-4 overflow-visible'>
              <div className='flex justify-between items-start gap-2 mb-3'>
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <div className="p-2 bg-gradient-to-br from-sky-50 to-blue-50 text-sky-600 rounded-xl ring-1 ring-sky-100/80 shadow-sm group-hover:scale-[1.02] transition-transform duration-300 shrink-0">
                    <HiOutlineDocumentText size={18} className="stroke-[1.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Typography className='text-gray-900 font-semibold font-poppins text-sm leading-snug line-clamp-2' title={policy.policy_name}>
                      {policy.policy_name}
                    </Typography>
                    <Typography className='text-[10px] text-slate-400 font-poppins mt-0.5 tabular-nums font-medium'>
                      ID #{policy.id}
                    </Typography>
                  </div>
                </div>

                  <div 
                  onMouseEnter={() => toggleMenuHrPolicies(index, true)} onMouseLeave={() => toggleMenuHrPolicies(index, false)} 
                  className='relative shrink-0 z-[90]'>
                  <Button variant="text" aria-label="Policy actions" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100/90 min-w-0 w-8 h-8 flex items-center justify-center transition-colors">
                      <IoMdMore size={18} />
                  </Button>

                  <AnimatePresence>
                  {openMenu[index] && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.1 }}
                        className='border border-gray-200 rounded-xl absolute z-[100] top-full right-0 w-48 min-w-[12rem] bg-white mt-1 py-1 shadow-md ring-1 ring-gray-100/80'
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
                          {inactive ? (
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
              
              <div className='mb-3 rounded-lg border border-gray-100 bg-gradient-to-b from-slate-50/90 to-slate-50/40 overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.7)]'>
                  <div className='flex items-center justify-between gap-2 px-3 py-2'>
                      <div className='flex items-center gap-1.5 text-slate-500 min-w-0'>
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/80 text-sky-500 shadow-sm ring-1 ring-gray-100 shrink-0">
                            <MdOutlineAccessTimeFilled size={14} />
                          </span>
                          <span className="text-[10px] font-semibold font-poppins text-slate-600 tracking-tight">Shift</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-900 font-poppins tabular-nums text-right leading-tight">
                          {formatTime(policy.starting_time)} – {formatTime(policy.closing_time)}
                      </span>
                  </div>

                  <div className="h-px bg-gray-100" aria-hidden />

                  <div className='flex items-center justify-between gap-2 px-3 py-2'>
                      <div className='flex items-center gap-1.5 text-slate-500 min-w-0'>
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/80 text-sky-500 shadow-sm ring-1 ring-gray-100 shrink-0">
                            <FaCalendar className="text-[10px]" />
                          </span>
                          <span className="text-[10px] font-semibold font-poppins text-slate-600 tracking-tight">Created</span>
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-semibold text-slate-800 font-poppins text-right leading-tight max-w-[58%]">
                          {formatTimestamp(policy.creation_time)}
                      </span>
                  </div>
              </div>

              <div className='mt-auto flex flex-wrap items-center justify-center gap-1.5 pt-2 border-t border-gray-100'>
                <div
                  role="status"
                  aria-label={inactive ? 'Policy status: expired' : 'Policy status: active'}
                  className={`inline-flex select-none items-center justify-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide cursor-default text-center shadow-sm ring-1 transition-colors font-urbanist leading-none ${
                    inactive
                      ? 'bg-red-50 text-red-800 ring-red-200/80'
                      : 'bg-green-50 text-green-800 ring-green-200/80'
                  }`}
                >
                    <span className={`inline-flex h-1.5 w-1.5 shrink-0 self-center rounded-full ${inactive ? 'bg-red-500' : 'bg-green-500'}`} />
                    <span className="text-center">{inactive ? 'Expired' : 'Active'}</span>
                </div>
                
                <span
                  className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-center font-urbanist leading-none shadow-sm ring-1 ${policyPayrollBadgeClass(policy.payroll)}`}
                >
                    {policyPayrollLabel(policy.payroll)}
                </span>

              </div>
          </CardBody>
         
          </Card>
          </motion.div>
          )
      })

      ) : (
        <div className='col-span-full flex flex-col items-center justify-center p-12 sm:p-16 text-slate-400 bg-gradient-to-b from-white to-slate-50/50 rounded-2xl border border-dashed border-slate-200'>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
            <HiOutlineDocumentText className="h-8 w-8" strokeWidth={1.25} />
          </div>
          <span className="font-poppins text-sm font-semibold text-slate-600">No policies found</span>
          <span className="mt-1 text-center text-xs text-slate-400 font-poppins max-w-xs">Try adjusting filters or create a new policy.</span>
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
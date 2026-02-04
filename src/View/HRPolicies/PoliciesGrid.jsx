import { Card, CardBody, MenuItem, Typography, Button } from '@material-tailwind/react'
import React from 'react'
import { IoMdMore } from 'react-icons/io'
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { FaCalendar, FaCheckDouble } from "react-icons/fa";
import { formatTimestamp } from '../Branches/utils'
import useHRPolicies from '../../ViewModel/HRPoliciesViewModel/HRPoliciesServices';
import { motion } from 'framer-motion';
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog';
import formatTime from '../../services/__hrPoliciesServices';


const PoliciesGrid = (props) => {
  const {allHrpolicies, hasMore, isLoadingMore, onLoadMore, onNextPage, onPreviousPage, onGoToPage, paginationData} = props
  const {openMenu, openDialog, hrPolicyStatusValue, handleHrPolicyStatus, handleStatusHrPolicy, toggleMenuHrPolicies, handleMenuItemsHrPolicies, hrPoliciesItems} = useHRPolicies()
  return (
    
    <div className='grid grid-cols-3 gap-4'>
      {allHrpolicies.length > 0 ? (
        allHrpolicies?.map((policy, index) => (
          <Card className="border border-[#3DA5F4] bg-[#F8F9FF] shadow-none" key={index}>
          <CardBody className='p-4'>
              <div className='flex justify-between'>
                <div>
                  <span className='text-[#3DA5F4] font-semibold'>{policy.id}</span>
                  <span className='text-[13px]'>ID</span>
                  </div>

                  <div 
                  onMouseEnter={() => toggleMenuHrPolicies(index, true)} onMouseLeave={() => toggleMenuHrPolicies(index, false)} 
                  className='relative'>
                  <span className='text-[#9B9B9B] text-[20px] cursor-pointer'>
                      <IoMdMore />
                  </span>

                {openMenu[index] && (
                      <div className='border border-gray-200 rounded-lg absolute z-10 bg-white left-[-142px] w-[155px] shadow-md' 
                      >
                      <motion.div
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 50 }}
                          transition={{ duration: 0.2 }}
                      >
                          
                          <ul className="flex w-full flex-col gap-1">
                          {/* Edit - First */}
                          <MenuItem className='flex items-center justify-between' onClick={() => handleMenuItemsHrPolicies(1, policy)}>
                            <Typography variant="small">Edit</Typography>
                            <span>{hrPoliciesItems.find(item => item.title === 'Edit').icon}</span>
                          </MenuItem>
                          
                          {/* View - Second */}
                          <MenuItem className='flex items-center justify-between' onClick={() => handleMenuItemsHrPolicies(2, policy)}>
                            <Typography variant="small">View</Typography>
                            <span>{hrPoliciesItems.find(item => item.title === 'View').icon}</span>
                          </MenuItem>
                          
                          {/* Policy Used By - Third */}
                          <MenuItem className='flex items-center justify-between' onClick={() => handleMenuItemsHrPolicies(5, policy)}>
                            <Typography variant="small">Policy Used By</Typography>
                            <span>{hrPoliciesItems.find(item => item.title === 'Policy Used By').icon}</span>
                          </MenuItem>
                          
                          {/* Copy - Fourth */}
                          <MenuItem className='flex items-center justify-between' onClick={() => handleMenuItemsHrPolicies(6, policy)}>
                            <Typography variant="small">Copy</Typography>
                            <span>{hrPoliciesItems.find(item => item.title === 'Copy').icon}</span>
                          </MenuItem>

                          {/* Delete/Deactivate - Last */}
                          {policy.status === 'EXPIRED' ?
                          (
                            <MenuItem className='flex items-center justify-between' onClick={() => handleMenuItemsHrPolicies(3, policy.id, 1)}>
                              <Typography variant="small">Activate</Typography>
                              <span>{hrPoliciesItems.find(item => item.title === 'Activate').icon}</span>
                            </MenuItem>
                          ) :
                          (
                            <MenuItem className='flex items-center justify-between' onClick={() => handleMenuItemsHrPolicies(3, policy.id, 0)}>
                              <Typography variant="small">Deactivate</Typography>
                              <span>{hrPoliciesItems.find(item => item.title === 'Deactivate').icon}</span>
                            </MenuItem>
                          )
                        }
                          </ul>
                      </motion.div>
                      </div>
                  )}
              </div>
                 
              </div>
              <div className='flex justify-center'>
                  <div className='flex flex-col items-center gap-[3px]'>
                      <div>
                          <span>{policy.policy_name}</span>
                      </div>

                      <div className='text-[14px] text-[#3DA5F4] flex items-center gap-2'>
                          <span><MdOutlineAccessTimeFilled /></span>
                          <span>{formatTime(policy.starting_time)} - {formatTime(policy.closing_time)}</span>
                      </div>

                      <div className='text-[#474747] text-[13px] flex items-center gap-2'>
                          <span><FaCalendar /></span>
                          <span className=''>
                              {formatTimestamp(policy.creation_time)} 
                          </span>
                      </div>
                  </div>
              </div>

              <div className='flex justify-end gap-2'>
                <span className='text-green-700'><FaCheckDouble /></span>
                <span>{policy.status === '0' ? 'Expired' : 'Valid'}</span>

              </div>
          </CardBody>
         
          </Card>
          
      ))

      ) : (
        <div className='col-span-3 flex justify-center'>
          <span>No Data Found</span>
        </div>
      )}
      
      {/* Google-style Pagination */}
      {allHrpolicies?.length > 0 && paginationData && paginationData.totalPages > 1 && (
        <div className='col-span-3 flex justify-center items-center gap-1 mt-4'>
          {/* Previous Button */}
          {paginationData.currentPage > 1 ? (
            <button
              title="Previous Page"
              className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onPreviousPage}
              disabled={isLoadingMore}
            >
              <span>‹</span>
              <span>Previous</span>
            </button>
          ) : (
            <div className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-gray-400 cursor-not-allowed flex items-center gap-1">
              <span>‹</span>
              <span>Previous</span>
            </div>
          )}
          
          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {(() => {
              const currentPage = paginationData.currentPage;
              const totalPages = paginationData.totalPages;
              
              // If 10 or fewer pages, show all pages (like Google)
              if (totalPages <= 10) {
                return Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => onGoToPage(pageNum)}
                    disabled={isLoadingMore}
                    className={`px-3 py-1.5 text-[clamp(12px,1vw,14px)] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      pageNum === currentPage
                        ? 'bg-[#1a73e8] text-white font-medium'
                        : 'text-[#1a73e8] hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ));
              }
              
              // For more than 10 pages, show with ellipsis
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
              
              // Remove duplicates
              const uniquePages = [];
              const seen = new Set();
              pages.forEach(page => {
                if (typeof page === 'number' && !seen.has(page)) {
                  seen.add(page);
                  uniquePages.push(page);
                } else if (typeof page === 'string') {
                  uniquePages.push(page);
                }
              });
              
              return uniquePages.map((page, index) => {
                if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8]">
                      ...
                    </span>
                  );
                }
                
                return (
                  <button
                    key={page}
                    onClick={() => onGoToPage(page)}
                    disabled={isLoadingMore}
                    className={`px-3 py-1.5 text-[clamp(12px,1vw,14px)] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      page === currentPage
                        ? 'bg-[#1a73e8] text-white font-medium'
                        : 'text-[#1a73e8] hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              });
            })()}
          </div>
          
          {/* Next Button */}
          {paginationData.currentPage < paginationData.totalPages ? (
            <button
              title="Next Page"
              className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onNextPage}
              disabled={isLoadingMore}
            >
              <span>Next</span>
              <span>›</span>
            </button>
          ) : (
            <div className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-gray-400 cursor-not-allowed flex items-center gap-1">
              <span>Next</span>
              <span>›</span>
            </div>
          )}
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
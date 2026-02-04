import { Button, MenuItem, Typography, Spinner } from '@material-tailwind/react'
import React from 'react'
import { formatTimestamp } from '../Branches/utils'
import useHRPolicies from '../../ViewModel/HRPoliciesViewModel/HRPoliciesServices'
import { FaChevronDown } from "react-icons/fa";
import { motion } from 'framer-motion';
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog';
import formatTime from '../../services/__hrPoliciesServices';
import useDropdownService from '../../services/__dropDownHoverService';
import CustomButton from '../../Components/CustomButton/CustomButton';
import { formatDate } from 'date-fns';
import { formatDateDMY } from '../../services/__dateTimeServices';

const PoliciesList = (props) => {

  const { allHrpolicies, hasMore, isLoadingMore, onLoadMore, onNextPage, onPreviousPage, onGoToPage, paginationData } = props
  const { triggerRefs, getDropdownPosition } = useDropdownService()
  const { openMenu, openDialog, hrPolicyStatusValue, handleHrPolicyStatus, handleStatusHrPolicy, toggleMenuHrPolicies, handleMenuItemsHrPolicies, hrPoliciesItems } = useHRPolicies()

  const data = ['PID', 'Policy Name', 'Timings', 'Expiry', 'Payroll Generation Type', 'Overtime', 'Created Date', 'Actions']
  return (
    <div className='bg-white rounded-[10px] p-2 drop-shadow-md'>
      <div className='relative w-full min-h-[calc(100vh-100px)] overflow-auto customScroll'>
      <table className="min-w-full table-fixed text-center">
      <colgroup>
    <col span="8" />
  </colgroup>
      <thead className='sticky top-0 z-20 bg-[#F8F9FA] rounded-[8px]'>
        <tr>
          {data?.map((head, i) => (
            <th
              key={i}
              className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4"
            >
              <Typography
                className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
              >
                {head}
              </Typography>
            </th>
          ))}
        </tr>

      </thead>
      <tbody>
        {allHrpolicies.length > 0 ? (
          allHrpolicies?.map((policy, index) => {
            const isLast = index === allHrpolicies.length - 1;
            const classes = isLast ? "px-[clamp(4px,0.8vw,12px)] py-4" : "px-[clamp(4px,0.8vw,12px)] py-4 border-b border-[#F2F2F9]"
            return (
              <tr key={index}>
                <td className={classes}>
                  <Typography
                    className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                  >
                    {policy.id}
                  </Typography>
                </td>

                <td className={classes}>
                  <Typography
                    className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                  >
                    {policy.policy_name}
                  </Typography>
                </td>

                <td className={classes}>
                  <Typography
                    className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                  >
                    <span>{formatTime(policy.starting_time)} - {formatTime(policy.closing_time)}</span>
                  </Typography>
                </td>

                <td className={classes}>
                  <Typography
                    className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                  >
                    {policy.status === '0' ? 'Expired' : 'Valid'}

                  </Typography>
                </td>

                <td className={classes}>
                  <Typography
                    className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                  >
                    {policy.payroll === 1 || policy.payroll === '1' ? 'Time Base' :
                      policy.payroll === 2 || policy.payroll === '2' ? 'Attendance Base' :
                        policy.payroll === 3 || policy.payroll === '3' ? 'Hourly Base' : 'Unknown'}
                  </Typography>
                </td>

                <td className={classes}>
                  <Typography
                    className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                  >
                    {policy.vertime_pay}
                  </Typography>
                </td>

                <td className={classes}>
                  <Typography
                    className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                  >
                    {formatDateDMY(policy.creation_time)}
                  </Typography>
                </td>


                <td className={classes}>
                  <div
                    ref={(el) => (triggerRefs.current[index] = el)}
                    onMouseEnter={() => toggleMenuHrPolicies(index, true)} onMouseLeave={() => toggleMenuHrPolicies(index, false)}
                    className='relative flex items-center justify-center'>
                    <Button

                      className='flex items-center justify-center gap-1 sm:gap-2 capitalize font-normal text-[clamp(10px,0.8vw,13px)] bg-[#EFF8FF] border border-[#3da5f4] text-[#3da5f4] px-[8px] sm:px-[10px] py-[4px] sm:py-[5px]'
                      variant="outlined"
                    >
                      Action
                      <FaChevronDown
                        strokeWidth={2.5}
                        className={`transition-transform transform ${openMenu[index] ? "rotate-180" : ""}`}
                      />
                    </Button>

                    {openMenu[index] && (
                      <div
                      className={`border border-gray-200 rounded-lg absolute z-[99999] bg-white w-[200px] left-[-120px] shadow-lg mt-0 ${index<=5 ? "top-full" : "bottom-full"}`}
                      >
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
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
                </td>

              </tr>
            )
          })

        ) : (
          <tr>
            <td colSpan={data.length} className="p-2 text-center">
              No Data Found
            </td>
          </tr>
        )}

      </tbody>

      {/* Google-style Pagination */}
      {allHrpolicies?.length > 0 && paginationData && paginationData.totalPages > 1 && (
        <tfoot>
          <tr>
            <td colSpan={data.length} className="p-4 w-full">
              <div className="w-full flex justify-center items-center gap-1">
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
            </td>
          </tr>
        </tfoot>
      )}

      <ConfirmationDialog
        openDialog={openDialog}
        handleOpen={handleStatusHrPolicy}
        handleConfirm={() => handleHrPolicyStatus()}
        title={hrPolicyStatusValue.pstatus === 0 ? 'Confirm Deactivation' : 'Confirm Activation'}
        message={hrPolicyStatusValue.pstatus === 0 ? 'Are you sure to deactivate this policy?' : 'Are you sure to activate this policy?'}

      />

      </table>
    </div>
    </div>
  )
}

export default PoliciesList
import { Button, Typography } from '@material-tailwind/react'
import React, { useState, useCallback, useLayoutEffect, useRef, useEffect } from 'react'
import ReactDOM from 'react-dom'
import useHRPolicies from '../../ViewModel/HRPoliciesViewModel/HRPoliciesServices'
import { FaChevronDown } from "react-icons/fa";
import { motion } from 'framer-motion';
import ConfirmationDialog from '../../Components/ConfirmationDialog/ConfirmationDialog';
import formatTime, { isHrPolicyInactive } from '../../services/__hrPoliciesServices';
import useDropdownService from '../../services/__dropDownHoverService';
import { formatDateDMY } from '../../services/__dateTimeServices';
import { HiOutlineDocumentText } from "react-icons/hi";
import useStore from '../../Store/store';

/** Payroll pills — same shape as Time Base, distinct light palette */
function policyPayrollPillClass(payroll) {
  if (payroll === 1 || payroll === '1') return 'bg-amber-50 text-amber-800 ring-amber-200/80'
  if (payroll === 2 || payroll === '2') return 'bg-violet-50 text-violet-800 ring-violet-200/80'
  if (payroll === 3 || payroll === '3') return 'bg-teal-50 text-teal-800 ring-teal-200/80'
  return 'bg-slate-100 text-slate-600 ring-slate-200/80'
}

function policyPayrollLabelCell(payroll) {
  if (payroll === 1 || payroll === '1') return 'Time Base'
  if (payroll === 2 || payroll === '2') return 'Attendance Base'
  if (payroll === 3 || payroll === '3') return 'Hourly Base'
  return 'Unknown'
}

const listPillSm =
  'inline-flex items-center justify-center text-center rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 font-urbanist leading-none'

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-100">
    <td className="p-4"><div className="h-4 w-12 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-6 w-16 rounded-full bg-gray-200 mx-auto" /></td>
    <td className="p-4"><div className="h-6 w-24 rounded-full bg-gray-200 mx-auto" /></td>
    <td className="p-4"><div className="h-4 w-16 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-8 w-20 bg-gray-200 rounded mx-auto"></div></td>
  </tr>
);

const PoliciesList = (props) => {

  const { allHrpolicies, hasMore, isLoadingMore, onLoadMore, onNextPage, onPreviousPage, onGoToPage, paginationData } = props
  const { triggerRefs } = useDropdownService()
  const { openMenu, openDialog, hrPolicyStatusValue, handleHrPolicyStatus, handleStatusHrPolicy, toggleMenuHrPolicies, handleMenuItemsHrPolicies, hrPoliciesItems } = useHRPolicies()
  const drawerOpen = useStore((state) => state.drawerOpen)

  const displayPolicies = allHrpolicies || []
  const scrollContainerRef = useRef(null)
  const [portalState, setPortalState] = useState({
    openIndex: -1,
    top: 0,
    left: 0,
    bottom: undefined,
    openAbove: false,
  })

  const updatePortalPosition = useCallback(() => {
    const openIndex = displayPolicies.findIndex((_, i) => openMenu[i])
    if (openIndex < 0) {
      setPortalState((s) => (s.openIndex < 0 ? s : { ...s, openIndex: -1 }))
      return
    }
    const triggerEl = triggerRefs.current?.[openIndex]
    if (!triggerEl) return
    const rect = triggerEl.getBoundingClientRect()
    const openAbove = openIndex >= displayPolicies.length - 3
    const dropdownWidth = 192
    const left = Math.max(4, Math.min(rect.right - dropdownWidth, window.innerWidth - dropdownWidth - 4))
    setPortalState({
      openIndex,
      left,
      top: openAbove ? undefined : rect.bottom + 0,
      bottom: openAbove ? window.innerHeight - rect.top + 0 : undefined,
      openAbove,
    })
  }, [openMenu, displayPolicies])

  useLayoutEffect(() => {
    updatePortalPosition()
  }, [openMenu, updatePortalPosition])

  useEffect(() => {
    if (portalState.openIndex < 0) return
    const scrollEl = scrollContainerRef.current
    const onScroll = () => updatePortalPosition()
    scrollEl?.addEventListener('scroll', onScroll, true)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      scrollEl?.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [portalState.openIndex, updatePortalPosition])

  useEffect(() => {
    if (drawerOpen) {
      Object.keys(openMenu || {}).forEach((i) => toggleMenuHrPolicies(Number(i), false))
    }
  }, [drawerOpen])

  const data = ['PID', 'Policy Name', 'Timings', 'Status', 'Payroll Generation', 'Overtime', 'Created Date', 'Actions']
  
  return (
    <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
      <div ref={scrollContainerRef} className='relative w-full min-h-[calc(100vh-250px)] overflow-auto customScroll'>
      <table className="min-w-full table-auto text-center">
      <thead className='sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md border-b border-gray-100'>
        <tr>
          {data?.map((head, i) => (
            <th
              key={i}
              className={`p-4 first:pl-6 last:pr-6 whitespace-nowrap ${
                head === "Policy Name" ? "text-left" : "text-center"
              }`}
            >
              <Typography
                className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins"
              >
                {head}
              </Typography>
            </th>
          ))}
        </tr>

      </thead>
      <tbody className="divide-y divide-gray-50">
        {props.loading ? (
          // Show 8 skeleton rows while loading
          Array.from({ length: 8 }).map((_, index) => (
            <SkeletonRow key={index} />
          ))
        ) : allHrpolicies.length > 0 ? (
          allHrpolicies?.map((policy, index) => {
            const inactive = isHrPolicyInactive(policy.status)
            return (
              <motion.tr 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-blue-50/30 transition-colors group"
              >
                <td className="p-4 first:pl-6">
                  <Typography className="text-sm font-medium text-gray-500 font-poppins">
                    #{policy.id}
                  </Typography>
                </td>

                <td className="p-4 text-left">
                  <div className="flex items-center gap-3">
                      {/* <div className="p-2 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-blue-100 transition-colors">
                        <HiOutlineDocumentText size={18} />
                      </div> */}
                      <Typography className="text-sm font-semibold text-gray-900 font-poppins">
                        {policy.policy_name}
                      </Typography>
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                      {formatTime(policy.starting_time)} - {formatTime(policy.closing_time)}
                    </span>
                  </div>
                </td>

                <td className="p-4 text-center">
                  <div className="flex justify-center">
                    <span
                      className={`${listPillSm} gap-1.5 shadow-sm ${
                        inactive ? 'bg-red-50 text-red-800 ring-red-200/80' : 'bg-green-50 text-green-800 ring-green-200/80'
                      }`}
                    >
                      <span className={`inline-flex h-2 w-2 shrink-0 self-center rounded-full ${inactive ? 'bg-red-500' : 'bg-green-500'}`} />
                      <span className="text-center">{inactive ? 'Expired' : 'Active'}</span>
                    </span>
                  </div>
                </td>

                <td className="p-4 text-center">
                  <div className="flex justify-center">
                    <span className={`${listPillSm} ${policyPayrollPillClass(policy.payroll)}`}>
                      {policyPayrollLabelCell(policy.payroll)}
                    </span>
                  </div>
                </td>

                <td className="p-4">
                  <Typography className="text-sm text-gray-600 font-poppins">
                    {policy.vertime_pay || '-'}
                  </Typography>
                </td>

                <td className="p-4">
                  <Typography className="text-xs text-gray-500 font-poppins">
                    {formatDateDMY(policy.creation_time)}
                  </Typography>
                </td>


                {/* Actions - dropdown rendered via portal so it stays below side drawers */}
                <td className={`p-4 last:pr-6 relative ${openMenu[index] ? 'z-[30]' : ''}`}>
                  <div
                    ref={(el) => (triggerRefs.current[index] = el)}
                    onMouseEnter={() => toggleMenuHrPolicies(index, true)}
                    onMouseLeave={() => toggleMenuHrPolicies(index, false)}
                    className="relative flex justify-center"
                  >
                    <Button
                      className="flex items-center gap-2 capitalize font-medium bg-white hover:bg-brand-50 text-brand-500 border border-brand-200 hover:border-brand-300 rounded-lg text-xs px-3 py-1.5 shadow-sm transition-all"
                      variant="text"
                    >
                      Action
                      <FaChevronDown
                        size={10}
                        className={`transition-transform duration-200 ${openMenu[index] ? "rotate-180" : ""}`}
                      />
                    </Button>
                  </div>
                </td>

              </motion.tr>
            )
          })

        ) : (
          <tr>
            <td colSpan={data.length} className="p-12 text-center text-gray-400">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <HiOutlineDocumentText className="w-8 h-8 text-gray-300" />
                </div>
                <Typography color="gray" className="font-medium font-poppins">
                  No Policies Found
                </Typography>
                <Typography className="text-sm text-gray-400 mt-1 font-poppins">
                  Try adjusting your search or filters
                </Typography>
              </div>
            </td>
          </tr>
        )}

      </tbody>
      </table>
      </div>

      {/* Portaled action dropdown so it does not appear on top of side drawers (z-[9990] < drawer overlay) */}
      {portalState.openIndex >= 0 &&
        (() => {
          const policy = displayPolicies[portalState.openIndex]
          if (!policy) return null
          return ReactDOM.createPortal(
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="fixed w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[9990]"
              style={{
                left: portalState.left,
                top: portalState.top,
                bottom: portalState.bottom,
              }}
              onMouseEnter={() => toggleMenuHrPolicies(portalState.openIndex, true)}
              onMouseLeave={() => toggleMenuHrPolicies(portalState.openIndex, false)}
            >
              <ul className="flex flex-col py-1">
                <li className="px-1">
                  <button type="button" className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between rounded-lg transition-colors" onClick={() => handleMenuItemsHrPolicies(1, policy)}>
                    Edit
                    <span className="text-gray-400">{hrPoliciesItems.find((item) => item.title === 'Edit')?.icon}</span>
                  </button>
                </li>
                <li className="px-1">
                  <button type="button" className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between rounded-lg transition-colors" onClick={() => handleMenuItemsHrPolicies(2, policy)}>
                    View
                    <span className="text-gray-400">{hrPoliciesItems.find((item) => item.title === 'View')?.icon}</span>
                  </button>
                </li>
                <li className="px-1">
                  <button type="button" className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between rounded-lg transition-colors" onClick={() => handleMenuItemsHrPolicies(5, policy)}>
                    Policy Used By
                    <span className="text-gray-400">{hrPoliciesItems.find((item) => item.title === 'Policy Used By')?.icon}</span>
                  </button>
                </li>
                <li className="px-1">
                  <button type="button" className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between rounded-lg transition-colors" onClick={() => handleMenuItemsHrPolicies(6, policy)}>
                    Copy
                    <span className="text-gray-400">{hrPoliciesItems.find((item) => item.title === 'Copy')?.icon}</span>
                  </button>
                </li>
                <div className="h-px bg-gray-100 my-1 mx-2" />
                {isHrPolicyInactive(policy.status) ? (
                  // OLD (incoming branch):
                  // {policy.status === '0' ? (
                  <li className="px-1">
                    <button type="button" className="w-full text-left px-3 py-2 text-xs font-medium text-green-600 hover:bg-green-50 flex items-center justify-between rounded-lg transition-colors" onClick={() => handleMenuItemsHrPolicies(3, policy.id, 1)}>
                      Activate
                      <span>{hrPoliciesItems.find((item) => item.title === 'Activate')?.icon}</span>
                    </button>
                  </li>
                ) : (
                  <li className="px-1">
                    <button type="button" className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center justify-between rounded-lg transition-colors" onClick={() => handleMenuItemsHrPolicies(3, policy.id, 0)}>
                      Deactivate
                      <span>{hrPoliciesItems.find((item) => item.title === 'Deactivate')?.icon}</span>
                    </button>
                  </li>
                )}
              </ul>
            </motion.div>,
            document.body
          )
        })()}

      {/* Google-style Pagination */}
      {allHrpolicies?.length > 0 && paginationData && paginationData.totalPages > 1 && (
          <div className="w-full flex justify-center items-center gap-2 mt-6 mb-2 pb-4">
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
                
                // Helper to render page button
                const renderPageButton = (page) => (
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

                // If 7 or fewer pages, show all pages
                if (totalPages <= 7) {
                  return Array.from({ length: totalPages }, (_, i) => i + 1).map(renderPageButton);
                }
                
                // For more than 7 pages, show with ellipsis
                const pages = [];
                pages.push(renderPageButton(1));
                
                if (currentPage > 3) {
                  pages.push(<span key="ellipsis-start" className="text-gray-400 px-1 text-xs">...</span>);
                }
                
                const startPage = Math.max(2, currentPage - 1);
                const endPage = Math.min(totalPages - 1, currentPage + 1);
                
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(renderPageButton(i));
                }
                
                if (currentPage < totalPages - 2) {
                  pages.push(<span key="ellipsis-end" className="text-gray-400 px-1 text-xs">...</span>);
                }
                
                pages.push(renderPageButton(totalPages));
                
                return pages;
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

export default PoliciesList
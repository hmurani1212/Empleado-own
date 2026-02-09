import React from "react";
import { Button, MenuItem, Typography } from "@material-tailwind/react";
import { formatTimestamp } from "./utils";
import { FaChevronDown } from "react-icons/fa";
import { HiOutlineOfficeBuilding } from "react-icons/hi"; // New icons

import useBranches from "../../ViewModel/BranchesViewModel/BranchesServices";
import useBranches2 from "../../ViewModel/Brach2ViewModel/BranchesServices2";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import CustomDrawer from "../../Components/CustomDrawer/CustomDrawer";
import EditBranchForm from "./EditBranchForm";
import CustomButton from "../../Components/CustomButton/CustomButton";
import branchImage from "../../assets/images/departement 1.png"; // Reusing the same image or a generic empty state image if available

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-100">
    <td className="p-4"><div className="h-4 w-16 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-4 w-12 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div></td>
    <td className="p-4"><div className="h-8 w-20 bg-gray-200 rounded mx-auto"></div></td>
  </tr>
);

const BranchesList = (props) => {
  const { data, loading, branchesAll, currentFilterStatus } = props;
  
  const {
    openMenu,
    menuItems,
    toggleMenu,
    handleChangeStatus,
    handleMenuItems,
    openDialog,
    handleStatus,
    branchStatusValue,
    showDrawer,
    closeBranchDrawer,
    newBranchValues,
    handleNewBranch,
    handleEditBranch,
    handleSelect,
    formatPhoneNumberTable,
    triggerRefs,
    getDropdownPosition,
    gettingAllBranchesNew,
    markBranchAdmin,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  } = useBranches2();

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="relative w-full min-h-[calc(100vh-250px)] overflow-auto customScroll">
          <table className="min-w-full table-auto text-center">
            <thead className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
              <tr>
                {data?.map((head, i) => (
                  <th
                    key={i}
                    className={`p-4 first:pl-6 last:pr-6 whitespace-nowrap ${
                      head === "Branch Name" ? "text-left" : "text-center"
                    }`}
                  >
                    <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                 [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : branchesAll?.branches?.length > 0 ? (
                branchesAll?.branches?.map((branch, index) => {
                  
                  return (
                    <motion.tr 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-blue-50/30 transition-colors group"
                    >
                      {/* Branch ID */}
                      <td className="p-4 first:pl-6">
                        <Typography className="text-sm font-medium text-gray-500 font-poppins">
                          #{branch.id}
                        </Typography>
                      </td>

                      {/* Branch Name */}
                      <td className="p-4 text-left">
                        <div className="flex items-center gap-3">
                           {/* <div className="p-2 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-blue-100 transition-colors">
                              <HiOutlineOfficeBuilding size={18} />
                           </div> */}
                           <Typography className="text-sm font-semibold text-gray-900 font-poppins">
                             {branch.branch_name}
                           </Typography>
                        </div>
                      </td>

                      {/* Branch Admin */}
                      <td className="p-4">
                        <Typography className="text-sm text-gray-700 font-poppins">
                          {branch?.branch_admin?.length > 0 ? (
                            <div className="flex flex-col items-center justify-center">
                              <span className="font-medium text-gray-900">{branch?.branch_admin[0]?.name}</span>
                              {branch?.branch_admin.length > 1 && (
                                <span
                                  onClick={() =>
                                    markBranchAdmin({
                                      id: branch.id,
                                      ...branch,
                                    })
                                  }
                                  className="text-[10px] text-blue-500 cursor-pointer hover:underline mt-0.5 font-medium"
                                  title="Click to manage branch admins"
                                >
                                  +{branch?.branch_admin.length - 1} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-xs">Unassigned</span>
                          )}
                        </Typography>
                      </td>

                      {/* Currency */}
                      <td className="p-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium border border-gray-200">
                          {branch.currency || "-"}
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="p-4 whitespace-nowrap">
                        <Typography className="text-sm text-gray-600 font-poppins">
                          {formatPhoneNumberTable(branch.phone_no)}
                        </Typography>
                      </td>

                      {/* Email */}
                      <td className="p-4">
                        <Typography className="text-sm text-gray-600 font-poppins truncate max-w-[180px]" title={branch.email_add}>
                          {branch.email_add}
                        </Typography>
                      </td>

                      {/* Creation Time */}
                      <td className="p-4 whitespace-nowrap">
                        <Typography className="text-xs text-gray-500 font-poppins">
                          {formatTimestamp(branch.creation_time)}
                        </Typography>
                      </td>

                      {/* Actions */}
                      <td className="p-4 last:pr-6 relative">
                        <div
                          ref={(el) => (triggerRefs.current[index] = el)}
                          onMouseEnter={() => toggleMenu(index, true)}
                          onMouseLeave={() => toggleMenu(index, false)}
                          className="relative inline-block"
                        >
                          <Button
                            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all normal-case"
                            variant="text"
                          >
                            Action
                            <FaChevronDown
                              size={10}
                              className={`transition-transform duration-200 ${
                                openMenu[index] ? "rotate-180" : ""
                              }`}
                            />
                          </Button>

                          <AnimatePresence>
                          {openMenu[index] && (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              transition={{ duration: 0.15, ease: "easeOut" }}
                              className={`absolute z-50 bg-white border border-gray-100 rounded-xl shadow-xl w-48 right-0 ${
                                getDropdownPosition(index) === "top" ? "bottom-full mb-2" : "top-full mt-2"
                              }`}
                            >
                                <ul className="flex flex-col py-1">
                                  {/* For inactive branches (status == 0): Show Activate and Edit */}
                                  {branch.status == 0 ? (
                                    <>
                                      <li className="px-1">
                                        <button
                                          className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between rounded-lg transition-colors"
                                          onClick={() =>
                                            handleMenuItems(1, branch.id, branch)
                                          }
                                        >
                                          Edit
                                          <span className="text-gray-400">{menuItems.find(item => item.title === 'Edit')?.icon}</span>
                                        </button>
                                      </li>
                                      <li className="px-1">
                                        <button
                                          className="w-full text-left px-3 py-2 text-xs font-medium text-green-600 hover:bg-green-50 flex items-center justify-between rounded-lg transition-colors"
                                          onClick={() =>
                                            handleMenuItems(3, branch.id, 1) // 3 is Activate
                                          }
                                        >
                                          Activate
                                          <span>{menuItems.find(item => item.title === 'Activate')?.icon}</span>
                                        </button>
                                      </li>
                                    </>
                                  ) : (
                                    /* For active branches (status == 1): Show Edit, Premises, Branch Admin, Deactivate in order */
                                    <>
                                      <li className="px-1">
                                        <button
                                          className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between rounded-lg transition-colors"
                                          onClick={() =>
                                            handleMenuItems(1, branch.id, branch)
                                          }
                                        >
                                          Edit
                                          <span className="text-gray-400">{menuItems.find(item => item.title === 'Edit')?.icon}</span>
                                        </button>
                                      </li>
                                      <li className="px-1">
                                        <button
                                          className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between rounded-lg transition-colors"
                                          onClick={() =>
                                            handleMenuItems(4, branch.id, branch)
                                          }
                                        >
                                          Premises
                                          <span className="text-gray-400">{menuItems.find(item => item.title === 'Premises')?.icon}</span>
                                        </button>
                                      </li>
                                      <li className="px-1">
                                        <button
                                          className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between rounded-lg transition-colors"
                                          onClick={() =>
                                            handleMenuItems(5, branch.id, branch)
                                          }
                                        >
                                          Branch Admin
                                          <span className="text-gray-400">{menuItems.find(item => item.title === 'Branch Admin')?.icon}</span>
                                        </button>
                                      </li>
                                      <div className="h-px bg-gray-100 my-1 mx-2"></div>
                                      <li className="px-1">
                                        <button
                                          className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center justify-between rounded-lg transition-colors"
                                          onClick={() =>
                                            handleMenuItems(2, branch.id, 0)
                                          }
                                        >
                                          Deactivate
                                          <span>{menuItems.find(item => item.title === 'Deactivate')?.icon}</span>
                                        </button>
                                      </li>
                                    </>
                                  )}
                                </ul>
                            </motion.div>
                          )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={data.length} className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <HiOutlineOfficeBuilding className="w-8 h-8 text-gray-300" />
                      </div>
                      <Typography color="gray" className="font-medium font-poppins">
                        No branches found
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

        <ConfirmationDialog
          openDialog={openDialog}
          handleOpen={handleStatus}
          handleConfirm={() => handleChangeStatus()}
          title={
            branchStatusValue.status == 0
              ? "Confirm Deactivation"
              : "Confirm Activation"
          }
          message={`Are you sure you want to ${
            branchStatusValue.status == 0 ? "deactivate" : "activate"
          } this branch?`}
        />

        {/* Google-style Pagination */}
        {branchesAll?.branches?.length > 0 && branchesAll?.pagination && branchesAll?.pagination?.pages > 1 && (
          <div className="w-full flex justify-center items-center gap-2 mt-6 mb-2 pb-4">
            {/* Previous Button */}
            <button
              title="Previous Page"
              disabled={branchesAll.pagination.page <= 1}
              className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                branchesAll.pagination.page > 1
                  ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                  : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
              }`}
              onClick={goToPreviousPage}
            >
              ‹
            </button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1.5">
              {(() => {
                const currentPage = branchesAll.pagination.page;
                const totalPages = branchesAll.pagination.pages;
                
                // If 7 or fewer pages, show all pages
                if (totalPages <= 7) {
                  return Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
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
                      onClick={() => goToPage(page)}
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
              disabled={branchesAll.pagination.page >= branchesAll.pagination.pages}
              className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                branchesAll.pagination.page < branchesAll.pagination.pages
                  ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                  : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
              }`}
              onClick={goToNextPage}
            >
              ›
            </button>
          </div>
        )}

        {showDrawer && (
          <CustomDrawer
            open={showDrawer}
            closeDrawer={closeBranchDrawer}
            compo={
              <EditBranchForm
                newBranchValues={newBranchValues}
                closeBranchDrawer={closeBranchDrawer}
                handleNewBranch={handleNewBranch}
                handleSelect={handleSelect}
                handleEditBranch={handleEditBranch}
              />
            }
            title="Edit Branch"
            widthSize={620}
          />
        )}
      </div>
    </>
  );
};

export default BranchesList;
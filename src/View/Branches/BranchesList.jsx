import React from "react";
import { Button, MenuItem, Typography } from "@material-tailwind/react";
import { formatTimestamp } from "./utils";
import { FaChevronDown } from "react-icons/fa";

import useBranches from "../../ViewModel/BranchesViewModel/BranchesServices";
import useBranches2 from "../../ViewModel/Brach2ViewModel/BranchesServices2";
import { motion } from "framer-motion";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import CustomDrawer from "../../Components/CustomDrawer/CustomDrawer";
import EditBranchForm from "./EditBranchForm";
import CustomButton from "../../Components/CustomButton/CustomButton";

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
      <div className="w-full bg-white rounded-[10px] p-2 drop-shadow-md">
        <div className="relative w-full min-h-[calc(100vh-100px)] overflow-auto customScroll">
          <table className="min-w-full table-fixed text-center">
          <colgroup>
    <col span="8" />
  </colgroup>
            <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
              <tr>
                {data?.map((head, i) => (
                  <th
                    key={i}
                    className={`bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4 ${
                      head === "Creation Time" ? "min-w-[180px]" : ""
                    }`}
                  >
                    <Typography className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize">
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={data.length} className="p-6 text-center">
                    <Typography className="text-gray-500">
                      Loading employees...
                    </Typography>
                  </td>
                </tr>
              )}
              {!loading && branchesAll?.branches?.length > 0 && (
                branchesAll?.branches?.map((branch, index) => {
                  const isLast = index === branchesAll.length - 1;
                  const classes = isLast
                    ? "px-[clamp(4px,0.8vw,12px)] py-4"
                    : "px-[clamp(4px,0.8vw,12px)] py-4 border-b border-[#F2F2F9]";

                  return (
                    <tr key={index}>
                      <td className={`${classes} text-center`}>
                        {/* <div className="flex justify-center"> */}
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {branch.id}
                        </Typography>
                        {/* </div> */}
                      </td>
                      <td className={`${classes} text-center`}>
                        {/* <div className="flex justify-center"> */}
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {branch.branch_name}
                        </Typography>
                        {/* </div> */}
                      </td>
                      <td className={`${classes} text-center`}>
                        {/* <div className="flex justify-center"> */}
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {branch?.branch_admin?.length > 0 ? (
                            <div className="flex items-center justify-center gap-2">
                              <span>{branch?.branch_admin[0]?.name}</span>
                              {branch?.branch_admin.length > 1 && (
                                <span
                                  onClick={() =>
                                    markBranchAdmin({
                                      id: branch.id,
                                      ...branch,
                                    })
                                  }
                                  className="text-gray-400 cursor-pointer hover:text-gray-600 underline"
                                  title="Click to manage branch admins"
                                >
                                  (+{branch?.branch_admin.length - 1} more)
                                </span>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </Typography>
                        {/* </div> */}
                      </td>
                      <td className={`${classes} text-center`}>
                        {/* <div className="flex justify-center"> */}
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {branch.currency}
                        </Typography>
                        {/* </div> */}
                      </td>
                      <td className={`${classes} text-center`}>
                        {/* <div className="flex justify-center"> */}
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {formatPhoneNumberTable(branch.phone_no)}
                        </Typography>
                        {/* </div> */}
                      </td>
                      <td className={`${classes} text-center`}>
                        {/* <div className="flex justify-center"> */}
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {branch.email_add}
                        </Typography>
                        {/* </div> */}
                      </td>
                      <td
                        className={`${classes} text-center whitespace-nowrap min-w-[180px]`}
                      >
                        {/* <div className="flex justify-center"> */}
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {formatTimestamp(branch.creation_time)}
                        </Typography>
                        {/* </div> */}
                      </td>
                      <td className={classes}>
                        <div
                          ref={(el) => (triggerRefs.current[index] = el)}
                          onMouseEnter={() => toggleMenu(index, true)}
                          onMouseLeave={() => toggleMenu(index, false)}
                          className="relative flex justify-center"
                        >
                          <Button
                            className="flex items-center gap-2 bg-[#EFF8FF] capitalize font-normal text-[clamp(10px,0.8vw,13px)] border border-[#3da5f4] text-[#3da5f4] px-[10px] py-[5px]"
                            // variant="outlined"
                          >
                            Action
                            <FaChevronDown
                              strokeWidth={2.5}
                              className={`transition-transform transform ${
                                openMenu[index] ? "rotate-180" : ""
                              }`}
                            />
                          </Button>

                          {openMenu[index] && (
                            <div
                              className={`border border-gray-200 rounded-lg absolute z-[99999] bg-white w-[200px] left-[-130px] shadow-lg mt-0 ${
                                index <= 4 ? "top-full" : "bottom-full"
                              }`}
                            >
                              <motion.div
                                initial={{
                                  opacity: 0,
                                  y: index <= 4 ? 50 : -50,
                                }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{
                                  opacity: 0,
                                  y: index <= 4 ? 50 : -50,
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                {/* <div className='border border-gray-200 rounded-lg absolute z-10 bg-white  w-[200px] shadow-md' 
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            transition={{ duration: 0.2 }}
                          > */}

                                <ul className="flex w-full flex-col gap-1">
                                  {/* For inactive branches (status == 0): Show Activate and Edit */}
                                  {branch.status == 0 ? (
                                    <>
                                      <MenuItem
                                        className="flex items-center justify-between"
                                        onClick={() =>
                                          handleMenuItems(1, branch.id, branch)
                                        }
                                      >
                                        <Typography variant="small">
                                          Edit
                                        </Typography>
                                        <span>
                                          {
                                            menuItems.find(
                                              (item) => item.title === "Edit"
                                            ).icon
                                          }
                                        </span>
                                      </MenuItem>
                                      <MenuItem
                                        className="flex items-center justify-between"
                                        onClick={() =>
                                          handleMenuItems(2, branch.id, 1)
                                        }
                                      >
                                        <Typography variant="small">
                                          Activate
                                        </Typography>
                                        <span>
                                          {
                                            menuItems.find(
                                              (item) =>
                                                item.title === "Activate"
                                            ).icon
                                          }
                                        </span>
                                      </MenuItem>
                                    </>
                                  ) : (
                                    /* For active branches (status == 1): Show Edit, Premises, Branch Admin, Deactivate in order */
                                    <>
                                      <MenuItem
                                        className="flex items-center justify-between"
                                        onClick={() =>
                                          handleMenuItems(1, branch.id, branch)
                                        }
                                      >
                                        <Typography variant="small">
                                          Edit
                                        </Typography>
                                        <span>
                                          {
                                            menuItems.find(
                                              (item) => item.title === "Edit"
                                            ).icon
                                          }
                                        </span>
                                      </MenuItem>
                                      <MenuItem
                                        className="flex items-center justify-between"
                                        onClick={() =>
                                          handleMenuItems(4, branch.id, branch)
                                        }
                                      >
                                        <Typography variant="small">
                                          Premises
                                        </Typography>
                                        <span>
                                          {
                                            menuItems.find(
                                              (item) =>
                                                item.title === "Premises"
                                            ).icon
                                          }
                                        </span>
                                      </MenuItem>
                                      <MenuItem
                                        className="flex items-center justify-between"
                                        onClick={() =>
                                          handleMenuItems(5, branch.id, branch)
                                        }
                                      >
                                        <Typography variant="small">
                                          Branch Admin
                                        </Typography>
                                        <span>
                                          {
                                            menuItems.find(
                                              (item) =>
                                                item.title === "Branch Admin"
                                            ).icon
                                          }
                                        </span>
                                      </MenuItem>
                                      <MenuItem
                                        className="flex items-center justify-between"
                                        onClick={() =>
                                          handleMenuItems(2, branch.id, 0)
                                        }
                                      >
                                        <Typography variant="small">
                                          Deactivate
                                        </Typography>
                                        <span>
                                          {
                                            menuItems.find(
                                              (item) =>
                                                item.title === "Deactivate"
                                            ).icon
                                          }
                                        </span>
                                      </MenuItem>
                                    </>
                                  )}
                                </ul>
                              </motion.div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                }))}
                {!loading && branchesAll?.branches?.length === 0 && (
              <tr>
                <td colSpan={data.length} className="p-6 text-center">
                  <Typography className="text-gray-500">
                    No branches found
                  </Typography>
                </td>
              </tr>
            )}
            </tbody>
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
              } this branch ?`}
            />
          </table>

          {/* Google-style Pagination */}
          {branchesAll?.branches?.length > 0 && branchesAll?.pagination && branchesAll?.pagination?.pages > 1 && (
            <div className="w-full flex justify-center items-center gap-1 mt-4 mb-4">
              {/* Previous Button */}
              {branchesAll.pagination.page > 1 ? (
                <button
                  title="Previous Page"
                  className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
                  onClick={goToPreviousPage}
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
                  const currentPage = branchesAll.pagination.page;
                  const totalPages = branchesAll.pagination.pages;
                  
                  // If 10 or fewer pages, show all pages (like Google)
                  if (totalPages <= 10) {
                    return Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-1.5 text-[clamp(12px,1vw,14px)] rounded transition-colors ${
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
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1.5 text-[clamp(12px,1vw,14px)] rounded transition-colors ${
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
              {branchesAll.pagination.page < branchesAll.pagination.pages ? (
                <button
                  title="Next Page"
                  className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
                  onClick={goToNextPage}
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
      </div>
    </>
  );
};

export default BranchesList;
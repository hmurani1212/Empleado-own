import React, { useEffect, useState } from "react";
// import ListNoticesTable from './ListNoticesTable'
import useNotice from "../../ViewModel/NoticeViewModel/NoticeServices";
import { Typography, Button, MenuItem } from "@material-tailwind/react";
import EditNoticeForm from "./EditNoticeForm";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import NoticesView from "./NoticesView";
import { formatTimestamp } from "../Branches/utils";
import { FaChevronDown } from "react-icons/fa";
import { motion } from "framer-motion";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import { hexToRGBA, titleNameAlpha } from "../../services/appServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { getAllYears } from "../../services/__appServicesData";

const ListNotices = () => {
  const {
    allNoticesList,
    getAllNoticesList,
    deleteNotices,
    openMenu,
    noticesMenuItems,
    toggleMenuNotices,
    openDialog,
    handleMenuItemsNotices,
    handleDelete,
    openViewDialog,
    setOpenViewDialog,
    handleView,
    loading,
    addNoticeValue,
    handleEditNoticeToggle,
    noticesBranches,
    filterDepartmentsNotices,
    handleEditNotice,
    handleNewNotice,
    handleAddNoticeBranch,
    filterNoticeValue,
    handleSelectFilterNotice,
    getAllDepartmentsNotices,
    resetFilters,
    noticesPagination,
    getFilterNotice,
  } = useNotice();

  const [currentPageId, setCurrentPageId] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const data = [
    "Month",
    "Notice ID",
    "Notice Title",
    "Recipient",
    "Created Date",
    "Actions",
  ];

  // Always fetch notices list when List notices tab is shown (first time or when navigating here)
  useEffect(() => {
    getAllNoticesList({ page: 1, limit: 10 }, true, false);
    setCurrentPageId(1);
    // Branch/department options are loaded when user opens "Filter by Branch" (onMenuOpen) to avoid extra APIs on first load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Load More button click
  const handleLoadMore = async () => {
    if (isLoadingMore || !noticesPagination?.hasMore) return;

    setIsLoadingMore(true);
    const nextPageId = currentPageId + 1;
    setCurrentPageId(nextPageId);

    try {
      const { branch_id, dept_id, year } = filterNoticeValue;
      
      // Check if any filters are active
      const hasFilters = (branch_id && branch_id.value && branch_id.value !== '0') || 
                         (dept_id && dept_id.value && dept_id.value !== '0') || 
                         (year && year.value);
      
      if (hasFilters) {
        // Use getFilterNotice with loadMore flag
        await getFilterNotice(
          branch_id?.value || "",
          dept_id?.value || "",
          year?.value || "",
          nextPageId,
          10,
          true
        );
      } else {
        // Use getAllNoticesList with loadMore flag
        await getAllNoticesList({ page: nextPageId, limit: 10 }, false, true);
      }
    } catch (error) {
      console.error("Error loading more notices:", error);
      setCurrentPageId(currentPageId); // Revert page_id on error
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Wrapper for handleSelectFilterNotice to reset pagination
  const handleFilterChange = async (selectedOption, field) => {
    // Reset pagination when filters change
    setCurrentPageId(1);
    // Call the original handler from the hook
    await handleSelectFilterNotice(selectedOption, field);
  };

  const years = getAllYears();

  return (
    <>
      <div className="flex flex-col gap-3 w-full h-full relative mt-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full md:w-52">
              <label className="text-[#474747] text-[12px] font-medium font-Urbanist px-2">
                Filter by Branch
              </label>
              <CustomSelect
                placeHolderTitle="Branch"
                value={filterNoticeValue?.branch_id}
                options={
                  Array.isArray(filterNoticeValue?.branchesList)
                    ? filterNoticeValue.branchesList.map((branch) => ({
                        value: branch.id,
                        label: branch.branch_name,
                      }))
                    : []
                }
                onChangeHandler={(selectedOption) =>
                  handleFilterChange(selectedOption, "branch_id")
                }
                onMenuOpen={getAllDepartmentsNotices}
                customStyles={false}
                thinScrollbar={true}
              />
            </div>
            <div className="w-full md:w-52">
              <label className="text-[#474747] text-[12px] font-medium font-Urbanist px-2">
                Filter by Department
              </label>
              <CustomSelect
                placeHolderTitle="Department"
                value={filterNoticeValue?.dept_id}
                options={
                  Array.isArray(filterNoticeValue?.departmentList)
                    ? filterNoticeValue.departmentList.map((department) => ({
                        value: department.id,
                        label: department.name,
                      }))
                    : []
                }
                onChangeHandler={(selectedOption) =>
                  handleSelectFilterNotice(selectedOption, "dept_id")
                }
                customStyles={false}
                thinScrollbar={true}
              />
            </div>
            <div className="w-full md:w-32">
              <label className="text-[#474747] text-[12px] font-medium font-Urbanist px-2">
                Filter by Year
              </label>
              <CustomSelect
                placeHolderTitle="Year"
                value={filterNoticeValue?.year}
                options={years?.map((year) => ({ value: year, label: year }))}
                onChangeHandler={(selectedOption) =>
                  handleSelectFilterNotice(selectedOption, "year")
                }
                customStyles={false}
                thinScrollbar={true}
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-[10px] drop-shadow-md p-2 mt-2">
          <div className="relative w-full min-h-[calc(100vh-100px)] overflow-auto customScroll">
            <table className="min-w-full table-fixed text-center">
            <colgroup>
    <col span="6" />
  </colgroup>
              <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
                <tr>
                  {data?.map((head, i) => (
                    <th key={i} className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                      <Typography
                        // variant="small"
                        // color="blue-gray"
                        className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* {allNoticesList?.map((ele, index) => {
            const isLast = index === data.length - 1;
            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

          return (
            <tr key={index}>

              <td className={classes}>
                  <Typography 
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                  >
                      -
                  </Typography>
              </td>

              <td className={classes}>
                  <Typography 
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                  >
                      {ele.id}
                  </Typography>
              </td>

              <td className={classes}>
                  <Typography 
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                  >
                      {ele.title}
                  </Typography>
              </td>

              <td className={classes}>
                  <Typography 
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                  >
                      {ele.emp_name ? ele.emp_name : "All Branches"}
                  </Typography>
              </td>

              <td className={classes}>
                  <Typography 
                      variant="small"
                      color="blue-gray"
                      className="font-normal"
                  >
                      {formatTimestamp(ele.timestamp)}
                  </Typography>
              </td>




              <td className={classes}>
                <div onMouseEnter={() => toggleMenuNotices(index, true)} onMouseLeave={() => toggleMenuNotices(index, false)} className='relative'>
                  <Button 
                    
                    className='flex items-center gap-2 capitalize font-normal text-[13px] border border-[#3da5f4] text-[#3da5f4] px-[10px] py-[5px]'
                      variant="outlined"
                  >
                    Action
                    <FaChevronDown
                      strokeWidth={2.5}
                      className={`transition-transform transform ${openMenu[index] ? "rotate-180" : ""}`}
                      />
                  </Button>

                  {openMenu[index] && (
                        <div className='border border-gray-200 rounded-lg absolute z-10 bg-white left-[-60px] w-[200px] shadow-md' 
                        >
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            transition={{ duration: 0.2 }}
                        >
                            
                            <ul className="flex w-full flex-col gap-1">
                            
                            {noticesMenuItems.map(menuItem => (
                                <MenuItem className='flex items-center justify-between' key={menuItem.id} onClick={() => handleMenuItemsNotices(menuItem.id, ele)}>
                                <Typography variant="small">{menuItem.title}</Typography>
                                </MenuItem>
                            ))}
                            </ul>
                        </motion.div>
                        </div>
                    )}
                </div>
              </td>

            </tr>
          );
        })} */}

                {allNoticesList && allNoticesList.length > 0 ? (
                  allNoticesList
                    .filter(
                      (ele) =>
                        ele &&
                        ele !== null &&
                        ele !== undefined &&
                        ele.timestamp
                    )
                    ?.sort((a, b) => b.timestamp - a.timestamp) // Sort by timestamp in descending order
                    .map((ele, index) => {
                      const currentMonth = new Date(
                        ele.timestamp * 1000
                      ).toLocaleString("en-US", {
                        month: "short",
                      });
                      const previousMonth =
                        index > 0
                          ? new Date(
                              allNoticesList[index - 1].timestamp * 1000
                            ).toLocaleString("en-US", {
                              month: "short",
                            })
                          : null;

                      const isFirstRowOfMonth = currentMonth !== previousMonth;

                      // Count how many rows belong to the current month
                      const rowSpan = allNoticesList.filter(
                        (item) =>
                          item &&
                          item.timestamp &&
                          new Date(item.timestamp * 1000).toLocaleString(
                            "en-US",
                            { month: "short" }
                          ) === currentMonth
                      ).length;

                      const isLast = index === allNoticesList.length - 1;
                      const classes = isLast
                        ? "px-[clamp(4px,0.8vw,12px)] py-4"
                        : "px-[clamp(4px,0.8vw,12px)] py-4 border-b border-[#F2F2F9]";
                      const { bgColor } = titleNameAlpha(currentMonth);
                      const rgbaColor = hexToRGBA(bgColor, 0.1);
                      return (
                        <tr key={index}>
                          {/* Month Name (only in the first row for each month, with dynamic rowSpan) */}
                          {isFirstRowOfMonth && (
                            <td rowSpan={rowSpan} className="p-4 align-middle">
                              <div className="flex items-center justify-center h-full">
                                <div
                                  className="h-20 w-14 text-[clamp(10px,0.8vw,13px)] text-[#474747] flex items-center justify-center rounded-lg leading-none"
                                  style={{
                                    writingMode: "vertical-rl",
                                    textOrientation: "upright",
                                    border: `2px solid ${bgColor}`,
                                    backgroundColor: rgbaColor,
                                    color: bgColor,
                                  }}
                                >
                                  {currentMonth.toUpperCase()}
                                </div>
                              </div>
                            </td>
                          )}

                          {/* ID */}
                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                            >
                              {ele.id}
                            </Typography>
                          </td>

                          {/* Title */}
                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                            >
                              {ele.title}
                            </Typography>
                          </td>

                          {/* Employee Name */}
                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                            >
                              {ele.emp_name || "All Branches"}
                            </Typography>
                          </td>

                          {/* Formatted Timestamp */}
                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                            >
                              {formatTimestamp(ele.timestamp)}
                            </Typography>
                          </td>

                          {/* Action */}
                          <td className={classes}>
                            <div
                              onMouseEnter={() =>
                                toggleMenuNotices(index, true)
                              }
                              onMouseLeave={() =>
                                toggleMenuNotices(index, false)
                              }
                              className="relative flex items-center justify-center"
                            >
                              <Button
                                className="flex items-center gap-2 capitalize font-normal text-[clamp(10px,0.8vw,13px)] bg-[#EFF8FF] border border-[#3da5f4] text-[#3da5f4] px-[10px] py-[5px]"
                                variant="outlined"
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
                                <div className={`border border-gray-200 rounded-lg absolute z-[99999] bg-white w-[200px] left-[-100px] shadow-lg mt-0 ${index<=5 ? "top-full" : "bottom-full"}`}>
                                  <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 50 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ul className="flex w-full flex-col gap-1">
                                      {noticesMenuItems.map((menuItem) => (
                                        <MenuItem
                                          className="flex items-center justify-between"
                                          key={menuItem.id}
                                          onClick={() =>
                                            handleMenuItemsNotices(
                                              menuItem.id,
                                              ele
                                            )
                                          }
                                        >
                                          <Typography variant="small">
                                            {menuItem.title}
                                          </Typography>
                                          <span>{menuItem.icon}</span>
                                        </MenuItem>
                                      ))}
                                    </ul>
                                  </motion.div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                ) : (
                  <tr>
                    <td colSpan={data?.length} className="p-2 text-center py-4 text-[12px]">
                      No record found
                    </td>
                  </tr>
                )}
              </tbody>

              <ConfirmationDialog
                openDialog={openDialog}
                handleOpen={handleDelete}
                handleConfirm={() => deleteNotices()}
                title={"Confirm Delete"}
                loading={loading}
                message={"Are you sure to Delete this notice?"}
              />

              <CustomDialog
                openDialog={openViewDialog}
                handleOpenDialog={handleView}
                handleOpen={() => setOpenViewDialog(false)}
                title={"View Notice Detail"}
                compo={<NoticesView />}
                showBtns={false}
              />
            </table>
            
            {/* Load More Button */}
            {allNoticesList && allNoticesList.length > 0 && noticesPagination?.hasMore && (
              <div className="flex justify-center mt-4 pb-4">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  loading={isLoadingMore}
                  className="px-6 py-2 text-[13px] font-semibold capitalize bg-[#3DA5F4] text-white rounded-lg"
                >
                  {isLoadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {addNoticeValue?.show && (
        <PortalDrawer
          open={addNoticeValue.show}
          addNoticeValue={addNoticeValue}
          closeDrawer={handleEditNoticeToggle}
          widthSize={"45vw"}
          title="Update Notice"
          compo={
            <EditNoticeForm
              noticesBranches={noticesBranches}
              filterDepartmentsNotices={filterDepartmentsNotices}
              addNoticeValue={addNoticeValue}
              handleEditNotice={handleEditNotice}
              handleNewNotice={handleNewNotice}
              handleAddNoticeBranch={handleAddNoticeBranch}
              loading={loading}
            />
          }
        />
      )}
    </>
  );
};

export default ListNotices;
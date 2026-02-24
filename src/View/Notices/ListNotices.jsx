import React, { useEffect, useState } from "react";
import useNotice from "../../ViewModel/NoticeViewModel/NoticeServices";
import { Typography, Button } from "@material-tailwind/react";
import EditNoticeForm from "./EditNoticeForm";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import NoticesView from "./NoticesView";
import { formatTimestamp } from "../Branches/utils";
import { FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import { hexToRGBA, titleNameAlpha } from "../../services/appServices";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { getAllYears } from "../../services/__appServicesData";
import { HiOutlineSpeakerphone } from "react-icons/hi";

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-100">
    <td className="p-4">
      <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
    </td>
    <td className="p-4">
      <div className="h-4 w-12 bg-gray-200 rounded mx-auto" />
    </td>
    <td className="p-4">
      <div className="h-4 w-32 bg-gray-200 rounded mx-auto" />
    </td>
    <td className="p-4">
      <div className="h-4 w-24 bg-gray-200 rounded mx-auto" />
    </td>
    <td className="p-4">
      <div className="h-4 w-24 bg-gray-200 rounded mx-auto" />
    </td>
    <td className="p-4">
      <div className="h-8 w-20 bg-gray-200 rounded mx-auto" />
    </td>
  </tr>
);

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
    noticesPagination,
    getFilterNotice,
  } = useNotice();

  const [currentPageId, setCurrentPageId] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const tableHeads = [
    "Month",
    "Notice ID",
    "Notice Title",
    "Recipient",
    "Created Date",
    "Actions",
  ];

  // Fetch notices list on mount (page 1)
  // Fetch notices list on mount (page 1). Use cache when returning (forceReload: false).
  // API is skipped in store when cache exists; refetch only after add/edit/delete (forceReload: true).
  useEffect(() => {
    const fetchFirstPage = async () => {
      setInitialLoading(true);
      try {
        await getAllNoticesList({ page: 1, limit: 10 }, false, false);
        setCurrentPageId(1);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset pagination when filters change (wrap original handler)
  const handleFilterChange = async (selectedOption, field) => {
    setCurrentPageId(1);
    await handleSelectFilterNotice(selectedOption, field);
  };

  // Load More supports filtered + unfiltered
  const handleLoadMore = async () => {
    if (isLoadingMore || !noticesPagination?.hasMore) return;

    setIsLoadingMore(true);
    const nextPageId = currentPageId + 1;

    try {
      const { branch_id, dept_id, year } = filterNoticeValue;

      const hasBranch =
        branch_id?.value && branch_id.value !== "0" && branch_id.value !== "";
      const hasDept =
        dept_id?.value && dept_id.value !== "0" && dept_id.value !== "";
      const hasYear = year?.value && year.value !== "";

      const hasFilters = hasBranch || hasDept || hasYear;

      if (hasFilters) {
        await getFilterNotice(
          branch_id?.value || "",
          dept_id?.value || "",
          year?.value || "",
          nextPageId,
          10,
          true
        );
      } else {
        await getAllNoticesList({ page: nextPageId, limit: 10 }, false, true);
      }

      setCurrentPageId(nextPageId);
    } catch (error) {
      console.error("Error loading more notices:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const years = getAllYears();

  return (
    <>
      <div className="flex flex-col gap-6 w-full h-full relative">
        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-full md:w-56">
              <CustomSelect
                placeHolderTitle="Filter by Branch"
                value={filterNoticeValue?.branch_id}
                options={
                  Array.isArray(filterNoticeValue?.branchesList)
                    ? filterNoticeValue.branchesList.map((branch) => ({
                        value: branch.id,
                        label: branch.branch_name,
                      }))
                    : []
                }
                onChangeHandler={(opt) => handleFilterChange(opt, "branch_id")}
                onMenuOpen={getAllDepartmentsNotices}
                customStyles={false}
                thinScrollbar={true}
              />
            </div>

            <div className="w-full md:w-56">
              <CustomSelect
                placeHolderTitle="Filter by Department"
                value={filterNoticeValue?.dept_id}
                options={
                  Array.isArray(filterNoticeValue?.departmentList)
                    ? filterNoticeValue.departmentList.map((dept) => ({
                        value: dept.id,
                        label: dept.name,
                      }))
                    : []
                }
                onChangeHandler={(opt) => handleFilterChange(opt, "dept_id")}
                customStyles={false}
                thinScrollbar={true}
              />
            </div>

            <div className="w-full md:w-32">
              <CustomSelect
                placeHolderTitle="Filter by Year"
                value={filterNoticeValue?.year}
                options={years?.map((y) => ({ value: y, label: y }))}
                onChangeHandler={(opt) => handleFilterChange(opt, "year")}
                customStyles={false}
                thinScrollbar={true}
              />
            </div>
          </div>
        </div>

        {/* Notices Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative w-full min-h-[calc(100vh-250px)] overflow-auto customScroll">
            <table className="min-w-full table-auto text-center">
              <thead className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
                <tr>
                  {tableHeads.map((head, i) => (
                    <th
                      key={i}
                      className={`p-4 first:pl-6 last:pr-6 whitespace-nowrap ${
                        head === "Notice Title" ? "text-left" : "text-center"
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
                {initialLoading ? (
                  Array.from({ length: 8 }).map((_, idx) => (
                    <SkeletonRow key={idx} />
                  ))
                ) : (allNoticesList && allNoticesList.length > 0) ? (
                // ) : allNoticesList && allNoticesList.length > 0 ? (
                  allNoticesList
                    .filter((n) => n && n.timestamp)
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((ele, index) => {
                      const currentMonth = new Date(
                        ele?.timestamp ? ele.timestamp * 1000 : 0
                      ).toLocaleString("en-US", { month: "short" });

                      const previousMonth =
                        index > 0
                          ? new Date(
                              allNoticesList[index - 1].timestamp * 1000
                            ).toLocaleString("en-US", { month: "short" })
                          : null;

                      const isFirstRowOfMonth = currentMonth !== previousMonth;

                      const rowSpan = allNoticesList.filter(
                        (item) =>
                          item?.timestamp &&
                          new Date(item.timestamp * 1000).toLocaleString(
                            "en-US",
                            { month: "short" }
                          ) === currentMonth
                      ).length;

                      const { bgColor } = titleNameAlpha(currentMonth);
                      const rgbaColor = hexToRGBA(bgColor, 0.1);

                      return (
                        <motion.tr
                          key={`${ele.id}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          {/* Month */}
                          {isFirstRowOfMonth && (
                            <td
                              rowSpan={rowSpan}
                              className="p-4 align-middle border-r border-gray-50 bg-gray-50/30"
                            >
                              <div className="flex items-center justify-center h-full">
                                <div
                                  className="h-20 w-10 text-[11px] font-bold flex items-center justify-center rounded-lg leading-none shadow-sm"
                                  style={{
                                    writingMode: "vertical-rl",
                                    textOrientation: "upright",
                                    border: `1px solid ${bgColor}`,
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
                          <td className="p-4">
                            <Typography className="font-medium text-xs text-gray-500 font-poppins">
                              #{ele.id}
                            </Typography>
                          </td>

                          {/* Title */}
                          <td className="p-4 text-left">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-blue-100 transition-colors">
                                <HiOutlineSpeakerphone size={16} />
                              </div>
                              <Typography
                                className="text-sm font-semibold text-gray-900 font-poppins line-clamp-1"
                                title={ele.title}
                              >
                                {ele.title}
                              </Typography>
                            </div>
                          </td>

                          {/* Recipient */}
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                ele.emp_name
                                  ? "bg-purple-50 text-purple-600 border border-purple-100"
                                  : "bg-blue-50 text-blue-600 border border-blue-100"
                              }`}
                            >
                              {ele.emp_name || "All Branches"}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="p-4">
                            <Typography className="text-xs text-gray-500 font-poppins">
                              {formatTimestamp(ele.timestamp)}
                            </Typography>
                          </td>

                          {/* Actions */}
                          <td className="p-4 last:pr-6 relative">
                            <div
                              onMouseEnter={() => toggleMenuNotices(index, true)}
                              onMouseLeave={() => toggleMenuNotices(index, false)}
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
                                    className={`absolute z-50 bg-white border border-gray-100 rounded-xl shadow-xl w-40 right-0 ${
                                      index >= allNoticesList.length - 3
                                        ? "bottom-full mb-2"
                                        : "top-full mt-2"
                                    }`}
                                  >
                                    <ul className="flex flex-col py-1">
                                      {noticesMenuItems.map((menuItem) => (
                                        <li className="px-1" key={menuItem.id}>
                                          <button
                                            type="button"
                                            className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between rounded-lg transition-colors"
                                            onClick={() =>
                                              handleMenuItemsNotices(menuItem.id, ele)
                                            }
                                          >
                                            {menuItem.title}
                                            <span className="text-gray-400">
                                              {menuItem.icon}
                                            </span>
                                          </button>
                                        </li>
                                      ))}
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
                    <td
                      colSpan={tableHeads.length}
                      className="p-12 text-center text-gray-400"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                          <HiOutlineSpeakerphone className="w-8 h-8 text-gray-300" />
                        </div>
                        <Typography color="gray" className="font-medium font-poppins">
                          No Notices Found
                        </Typography>
                        <Typography className="text-sm text-gray-400 mt-1 font-poppins">
                          Try adjusting your filters
                        </Typography>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Load More */}
            {allNoticesList?.length > 0 && noticesPagination?.hasMore && (
              <div className="flex justify-center mt-6 pb-6">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-6 py-2.5 text-xs font-semibold capitalize bg-white text-blue-600 border border-blue-100 hover:bg-blue-50 hover:border-blue-200 rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  {isLoadingMore && (
                    <div className="w-3 h-3 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                  )}
                  {isLoadingMore ? "Loading..." : "Load More Notices"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationDialog
        openDialog={openDialog}
        handleOpen={handleDelete}
        handleConfirm={() => deleteNotices()}
        title="Confirm Delete"
        loading={loading}
        message="Are you sure to Delete this notice?"
      />

      <CustomDialog
        openDialog={openViewDialog}
        handleOpenDialog={handleView}
        handleOpen={() => setOpenViewDialog(false)}
        title="View Notice Detail"
        compo={<NoticesView />}
        showBtns={false}
      />

      {addNoticeValue?.show && (
        <PortalDrawer
          open={addNoticeValue.show}
          addNoticeValue={addNoticeValue}
          closeDrawer={handleEditNoticeToggle}
          widthSize="500px"
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

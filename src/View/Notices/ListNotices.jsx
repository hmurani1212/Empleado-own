import React, { useEffect, useState, useCallback, useLayoutEffect, useRef, useMemo } from "react";
import ReactDOM from "react-dom";
import useNotice from "../../ViewModel/NoticeViewModel/NoticeServices";
import { Typography, Button } from "@material-tailwind/react";
import EditNoticeForm from "./EditNoticeForm";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import NoticesView from "./NoticesView";
import { FaChevronDown } from "react-icons/fa";
import { motion } from "framer-motion";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { getAllYears } from "../../services/__appServicesData";
import { HiOutlineSpeakerphone } from "react-icons/hi";
import useDropdownService from "../../services/__dropDownHoverService";
import useStore from "../../Store/store";

const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-gray-100">
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
    departmentsLoading,
    departmentsLoadedForBranchId,
  } = useNotice();

  const { triggerRefs } = useDropdownService();
  const drawerOpen = useStore((state) => state.drawerOpen);

  const [currentPageId, setCurrentPageId] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);

  const displayNotices = useMemo(
    () =>
      allNoticesList && allNoticesList.length > 0
        ? allNoticesList
            .filter((n) => n && n.timestamp)
            .sort((a, b) => b.timestamp - a.timestamp)
        : [],
    [allNoticesList]
  );

  const scrollContainerRef = useRef(null);
  const [portalState, setPortalState] = useState({
    openIndex: -1,
    top: 0,
    left: 0,
    bottom: undefined,
    openAbove: false,
  });

  const updatePortalPosition = useCallback(() => {
    const openIndex = displayNotices.findIndex((_, i) => openMenu[i]);
    if (openIndex < 0) {
      setPortalState((s) => (s.openIndex < 0 ? s : { ...s, openIndex: -1 }));
      return;
    }
    const triggerEl = triggerRefs.current?.[openIndex];
    if (!triggerEl) return;
    const rect = triggerEl.getBoundingClientRect();
    const openAbove = openIndex >= displayNotices.length - 3;
    const dropdownWidth = 192;
    const left = Math.max(4, Math.min(rect.right - dropdownWidth, window.innerWidth - dropdownWidth - 4));
    setPortalState({
      openIndex,
      left,
      top: openAbove ? undefined : rect.bottom + 0,
      bottom: openAbove ? window.innerHeight - rect.top + 0 : undefined,
      openAbove,
    });
  }, [openMenu, displayNotices]);

  useLayoutEffect(() => {
    updatePortalPosition();
  }, [openMenu, updatePortalPosition]);

  useEffect(() => {
    if (portalState.openIndex < 0) return;
    const scrollEl = scrollContainerRef.current;
    const onScroll = () => updatePortalPosition();
    scrollEl?.addEventListener("scroll", onScroll, true);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      scrollEl?.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [portalState.openIndex, updatePortalPosition]);

  useEffect(() => {
    if (drawerOpen || addNoticeValue?.show) {
      Object.keys(openMenu || {}).forEach((i) => toggleMenuNotices(Number(i), false));
    }
  }, [drawerOpen, addNoticeValue?.show]);

  const tableHeads = [
    "Notice ID",
    "Title",
    "Description",
    "Recipient",
    "Created Date",
    "Actions",
  ];

  const formatDateOnly = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(Number(timestamp) * 1000);
    if (Number.isNaN(date.getTime())) return "N/A";
    const day = date.toLocaleString("en-US", { day: "2-digit" });
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  // Fetch notices list once on mount (page 1). Ref guard avoids duplicate call from Strict Mode or double mount.
  const hasFetchedRef = React.useRef(false);
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
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
  }, [getAllNoticesList]);

  // Reset pagination when filters change (wrap original handler)
  const handleFilterChange = async (selectedOption, field) => {
    setCurrentPageId(1);
    setPageLoading(true);
    try {
      await handleSelectFilterNotice(selectedOption, field);
    } finally {
      setPageLoading(false);
    }
  };

  const handlePageChange = async (page) => {
    const nextPage = Number(page);
    if (!Number.isFinite(nextPage) || nextPage <= 0 || nextPage === currentPageId) return;

    setPageLoading(true);
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
          nextPage,
          10,
          false
        );
      } else {
        await getAllNoticesList({ page: nextPage, limit: 10 }, true, false);
      }

      setCurrentPageId(nextPage);
    } catch (error) {
      console.error("Error changing page:", error);
    } finally {
      setPageLoading(false);
    }
  };

  const currentPage = noticesPagination?.currentPage || currentPageId || 1;
  const totalPages = noticesPagination?.totalPages || 1;

  const visiblePages = useMemo(() => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Sliding 3-page window:
    // Page 1 -> 1 2 3 ... last
    // Page 3 -> 2 3 4 ... last
    // Near end -> (last-3) (last-2) (last-1) last
    const startPage = Math.max(1, Math.min(currentPage - 1, totalPages - 3));
    const endPage = Math.min(totalPages - 1, startPage + 2);

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    if (endPage < totalPages - 1) {
      pages.push("ellipsis-end");
    }
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);

  const years = getAllYears();

  const isFilterBranchDropdownLoading =
    Boolean(departmentsLoading) &&
    (!Array.isArray(filterNoticeValue?.branchesList) || filterNoticeValue.branchesList.length === 0);

  const isFilterDepartmentDropdownLoading =
    Boolean(departmentsLoading) &&
    (!Array.isArray(filterNoticeValue?.departmentList) || filterNoticeValue.departmentList.length === 0);

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
                  isFilterBranchDropdownLoading
                    ? []
                    : Array.isArray(filterNoticeValue?.branchesList)
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
                menuLoading={isFilterBranchDropdownLoading}
                menuLoadingLabel="Loading branches..."
                hideControlLoadingIndicator
              />
            </div>

            <div className="w-full md:w-56">
              <CustomSelect
                placeHolderTitle="Filter by Department"
                value={filterNoticeValue?.dept_id}
                options={
                  isFilterDepartmentDropdownLoading
                    ? []
                    : Array.isArray(filterNoticeValue?.departmentList)
                    ? filterNoticeValue.departmentList.map((dept) => ({
                        value: dept.id,
                        label: dept.name,
                      }))
                    : []
                }
                onChangeHandler={(opt) => handleFilterChange(opt, "dept_id")}
                customStyles={false}
                thinScrollbar={true}
                menuLoading={isFilterDepartmentDropdownLoading}
                menuLoadingLabel="Loading departments..."
                hideControlLoadingIndicator
              />
            </div>

            <div className="w-full md:w-56">
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
          <div ref={scrollContainerRef} className="relative w-full min-h-[calc(100vh-250px)] overflow-auto customScroll">
            <table className="min-w-full table-fixed text-center">
              <thead className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
                <tr>
                  {tableHeads.map((head, i) => (
                    <th
                      key={i}
                      className={`p-4 first:pl-6 last:pr-6 ${
                        head === "Title"
                          ? "text-left w-[26%]"
                          : head === "Description"
                          ? "text-left w-[24%]"
                          : head === "Recipient"
                          ? "text-center w-[16%]"
                          : head === "Created Date"
                          ? "text-center w-[18%]"
                          : head === "Actions"
                          ? "text-center w-[12%]"
                          : "text-center whitespace-nowrap"
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
                {initialLoading || pageLoading ? (
                  Array.from({ length: 8 }).map((_, idx) => (
                    <SkeletonRow key={idx} />
                  ))
                ) : displayNotices.length > 0 ? (
                  displayNotices.map((ele, index) => {
                      return (
                        <motion.tr
                          key={`${ele.id}-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.03 }}
                          className="bg-white hover:bg-gray-50/60 transition-colors group"
                        >
                          {/* ID */}
                          <td className="p-4">
                            <Typography className="font-medium text-xs text-gray-500 font-poppins">
                              {ele.id}
                            </Typography>
                          </td>

                          {/* Title */}
                          <td className="p-4 text-left">
                            <div className="flex items-center gap-3 max-w-[320px]">
                              <div className="p-2 bg-blue-50 rounded-lg text-blue-500 group-hover:bg-blue-100 transition-colors">
                                <HiOutlineSpeakerphone size={16} />
                              </div>
                              <Typography
                                className="text-sm font-semibold text-gray-900 font-poppins line-clamp-2 break-words leading-5"
                                title={ele.title}
                              >
                                {ele.title}
                              </Typography>
                            </div>
                          </td>

                          {/* Description */}
                          <td className="p-4 text-left">
                            <Typography
                              className="text-xs text-gray-500 font-poppins line-clamp-2 break-words leading-5"
                              title={ele.description || ""}
                            >
                              {ele.description || "-"}
                            </Typography>
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
                              {ele.branch_name || ele.emp_name || "All Branches"}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="p-4">
                            <Typography className="text-xs text-gray-500 font-poppins">
                              {formatDateOnly(ele.timestamp)}
                            </Typography>
                          </td>

                          {/* Actions - dropdown rendered via portal so it stays below side drawers */}
                          <td className={`p-4 last:pr-6 relative ${openMenu[index] ? "z-[30]" : ""}`}>
                            <div
                              ref={(el) => (triggerRefs.current[index] = el)}
                              onMouseEnter={() => toggleMenuNotices(index, true)}
                              onMouseLeave={() => toggleMenuNotices(index, false)}
                              className="relative flex justify-center"
                            >
                              <Button
                                className="flex items-center gap-2 cursor-pointer capitalize font-medium bg-white hover:bg-brand-50 text-brand-500 border border-brand-200 hover:border-brand-300 rounded-lg text-xs px-3 py-1.5 shadow-sm transition-all"
                                variant="text"
                              >
                                Action
                                <FaChevronDown
                                  size={10}
                                  className={`w-3 h-3 transition-transform duration-200 ${openMenu[index] ? "rotate-180" : ""}`}
                                />
                              </Button>
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

            {/* Portaled action dropdown so it does not appear on top of side drawers (z-[9990] < drawer overlay) */}
            {portalState.openIndex >= 0 &&
              (() => {
                const ele = displayNotices[portalState.openIndex];
                if (!ele) return null;
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
                    onMouseEnter={() => toggleMenuNotices(portalState.openIndex, true)}
                    onMouseLeave={() => toggleMenuNotices(portalState.openIndex, false)}
                  >
                    <ul className="flex flex-col py-1">
                      {noticesMenuItems.map((menuItem) => (
                        <li className="px-1" key={menuItem.id}>
                          <button
                            type="button"
                            className="w-full text-left px-3 cursor-pointer py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between rounded-lg transition-colors"
                            onClick={() => handleMenuItemsNotices(menuItem.id, ele)}
                          >
                            {menuItem.title}
                            <span className="text-gray-400">{menuItem.icon}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>,
                  document.body
                );
              })()}

            {/* Pagination (inside table box) */}
            {displayNotices.length > 0 && totalPages > 1 && (
              <div className="w-full flex justify-center items-center gap-2 mt-6 mb-2 pb-6">
                <button
                  title="Previous Page"
                  disabled={currentPage <= 1}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${
                    currentPage > 1
                      ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                      : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ‹
                </button>

                <div className="flex items-center gap-1.5">
                  {visiblePages.map((page, index) => {
                    if (page === "ellipsis-start" || page === "ellipsis-end") {
                      return (
                        <span key={`ellipsis-${index}`} className="text-gray-400 px-1">
                          ...
                        </span>
                      );
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 flex items-center cursor-pointer justify-center rounded-lg text-xs font-medium transition-all ${
                          page === currentPage
                            ? "bg-bgBlue text-white shadow-md shadow-blue-500/20"
                            : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  title="Next Page"
                  disabled={currentPage >= totalPages}
                  className={`flex items-center justify-center cursor-pointer w-8 h-8 rounded-lg border transition-all ${
                    currentPage < totalPages
                      ? "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
                      : "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  ›
                </button>
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
        size="h-[62vh] w-[560px]"
      />

      {addNoticeValue?.show && (
        <PortalDrawer
          open={addNoticeValue.show}
          addNoticeValue={addNoticeValue}
          closeDrawer={handleEditNoticeToggle}
          widthSize={620}
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
              departmentsLoading={departmentsLoading}
              departmentsLoadedForBranchId={departmentsLoadedForBranchId}
            />
          }
        />
      )}
    </>
  );
};

export default ListNotices;

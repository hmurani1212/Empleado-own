import { Button, MenuItem, Typography } from "@material-tailwind/react";
import React, { useEffect, useState, useLayoutEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import { FaChevronDown } from "react-icons/fa6";
import { FaUserCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { empActionList } from "../../services/EmpServices";
import useEmployeeActionService from "../../ViewModel/EmployeeViewModel/EmployeeActionService";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import SalaryDetails from "./SalaryDetails";
import CustomButton from "../../Components/CustomButton/CustomButton";
import useStore from "../../Store/store";

const EMAIL_LIKE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmailContact(value) {
  const s = String(value ?? "").trim();
  return s.length > 0 && EMAIL_LIKE.test(s);
}

/** True if value looks like a phone (digits / +), not an email. */
function isPhoneLike(value) {
  const s = String(value ?? "").trim();
  if (!s || isEmailContact(s)) return false;
  const compact = s.replace(/[\s\-().]/g, "");
  return /^\+?\d{7,}$/.test(compact);
}

/**
 * Mobile# column: never show emails. Prefer +92, then title hints, then any phone-like contact.
 */
function getEmployeeMobile(contacts) {
  if (contacts == null || !Array.isArray(contacts) || contacts.length === 0) return "-";

  const rows = contacts.filter((c) => c?.contact != null && String(c.contact).trim() !== "");
  const nonEmail = rows.filter((c) => !isEmailContact(c.contact));

  const pk = nonEmail.find((c) => String(c.contact).trim().startsWith("+92"));
  if (pk) return String(pk.contact).trim();

  const byTitleExact = nonEmail.find(
    (c) =>
      String(c.contact_title ?? "").trim().toLowerCase() === "mobile" && isPhoneLike(c.contact)
  );
  if (byTitleExact) return String(byTitleExact.contact).trim();

  const byTitleMobileWord = nonEmail.find(
    (c) => /mobile/i.test(String(c.contact_title ?? "")) && isPhoneLike(c.contact)
  );
  if (byTitleMobileWord) return String(byTitleMobileWord.contact).trim();

  const byTypeMobile = nonEmail.find(
    (c) => String(c.contact_type ?? "").trim().toLowerCase() === "mobile" && isPhoneLike(c.contact)
  );
  if (byTypeMobile) return String(byTypeMobile.contact).trim();

  const anyPhone = nonEmail.find((c) => isPhoneLike(c.contact));
  if (anyPhone) return String(anyPhone.contact).trim();

  return "-";
}

const EmployeesList = (props) => {
  const {
    empListData,
    loading: loadingProp,
    triggerRefs,
    getDropdownPosition,
    toggleMenuValue,
    openMenuValue,
    paginationData,
    onNextPage,
    onPreviousPage,
    onGoToPage,
    currentStatus,
  } = props;

  const drawerOpen = useStore((state) => state.drawerOpen);

  const isLoading = loadingProp !== undefined ? loadingProp : !empListData?.employees;

  const data = [
    "Employee ID",
    "Bio ID",
    "ID",
    "Name",
    "Placement",
    "Department",
    "Mobile#",
    "Action",
  ];

  const {
    handleEmpActionList,
    salaryDetailsValue,
    handleToggleSalaryDetails,
    ToggleCancelIncDialog,
    handleOnChangeCancelInc,
    handleSubmitCancelInc,
    handleSalaryIncrement,
  } = useEmployeeActionService();

  const sortedEmployees = useMemo(
    () =>
      [...(empListData?.employees ?? [])].sort((a, b) =>
        (a?.name || "").localeCompare(b?.name || "", undefined, { sensitivity: "base" })
      ),
    [empListData?.employees]
  );

  const [portalState, setPortalState] = useState({
    openIndex: -1,
    top: 0,
    left: 0,
    bottom: undefined,
    openAbove: false,
  });

  const scrollContainerRef = React.useRef(null);

  const updatePortalPosition = React.useCallback(() => {
    const openIndex = sortedEmployees.findIndex((_, i) => openMenuValue[i]);
    if (openIndex < 0) {
      setPortalState((s) => (s.openIndex < 0 ? s : { ...s, openIndex: -1 }));
      return;
    }
    const triggerEl = triggerRefs.current?.[openIndex];
    if (!triggerEl) return;
    const rect = triggerEl.getBoundingClientRect();
    const openAbove = openIndex >= sortedEmployees.length - 3;
    const dropdownWidth = 192;
    const left = Math.max(4, Math.min(rect.right - dropdownWidth, window.innerWidth - dropdownWidth - 4));
    setPortalState({
      openIndex,
      left,
      top: openAbove ? undefined : rect.bottom + 0,
      bottom: openAbove ? window.innerHeight - rect.top + 0 : undefined,
      openAbove,
    });
  }, [openMenuValue, sortedEmployees.length]);

  useLayoutEffect(() => {
    updatePortalPosition();
  }, [openMenuValue, updatePortalPosition]);

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

  // Close action dropdown when any side model/drawer opens so menu does not appear on top of it
  useEffect(() => {
    if (drawerOpen || salaryDetailsValue?.show) {
      Object.keys(openMenuValue || {}).forEach((i) => toggleMenuValue(Number(i), false));
    }
  }, [drawerOpen, salaryDetailsValue?.show]);

  // Filter action list based on current status
  const getFilteredActionList = () => {
    if (currentStatus === "Inactive Employees") {
      // Remove "Deactivate" action and add "Activate" action for inactive employees
      const filteredActions = empActionList.filter((action) => action.id !== 7);
      // Add "Activate" action for inactive employees
      filteredActions.push({
        id: 8,
        title: "Activate",
        icon: <FaUserCheck />,
        color: "#0ACF97",
      });
      return filteredActions;
    }
    return empActionList;
  };

  const isAnyActionMenuOpen = Object.values(openMenuValue || {}).some(Boolean);

  // console.log('what is the paginations data', paginationData)

  // this is our react js code
  return (
    <div
      ref={scrollContainerRef}
      className="relative w-full min-h-[calc(100vh-200px)] overflow-auto customScroll"
    >
      <table className="min-w-[960px] w-full table-fixed text-center border-collapse">
        <colgroup>
          <col className="w-[7%]" />
          <col className="w-[7%]" />
          <col className="w-[10%]" />
          <col className="w-[14%]" />
          <col className="w-[12%]" />
          <col className="w-[14%]" />
          <col className="w-[18%] min-w-[12rem]" />
          <col className="w-[10%]" />
        </colgroup>
        <thead className="sticky top-0 z-20 bg-gray-50 shadow-sm">
          <tr>
            {data?.map((head, i) => (
              <th
                key={i}
                className={`px-3.5 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider font-poppins first:rounded-tl-lg last:rounded-tr-lg ${
                  head === "Mobile#" ? "whitespace-nowrap min-w-[12rem]" : ""
                }`}
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`bg-white divide-y divide-gray-100 ${isAnyActionMenuOpen ? "relative z-[25]" : ""}`}>
          {isLoading &&
            [...Array(6)].map((_, rowIndex) => (
              <tr key={rowIndex} className="animate-pulse border-b border-gray-100">
                <td className="px-4 py-4">
                  <div className="h-4 bg-gray-100 rounded w-full max-w-[60px] mx-auto" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 bg-gray-100 rounded w-full max-w-[56px] mx-auto" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 bg-gray-100 rounded w-full max-w-[48px] mx-auto" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 bg-gray-100 rounded w-full max-w-[120px] mx-auto" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 bg-gray-100 rounded w-full max-w-[80px] mx-auto" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-6 bg-gray-100 rounded-full w-full max-w-[72px] mx-auto" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-4 bg-gray-100 rounded w-full max-w-[88px] mx-auto" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-8 bg-gray-100 rounded-lg w-full max-w-[64px] mx-auto" />
                </td>
              </tr>
            ))}
          {!isLoading && empListData?.employees?.length > 0 && (
            sortedEmployees.map((ele, i) => {
              return (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`hover:bg-brand-50/30 transition-colors duration-200 group ${openMenuValue[i] ? "relative z-[40] isolate" : ""}`}
                >
                  <td className="px-4 py-4">
                    <Typography className="text-sm font-normal text-gray-600 font-poppins">
                      {ele?.id || "-"}
                    </Typography>
                  </td>
                  <td className="px-4 py-4">
                    <Typography className="text-sm font-normal text-gray-600 font-poppins">
                      {ele?.bio_id || "-"}
                    </Typography>
                  </td>
                  <td className="px-4 py-4">
                    <Typography className="text-sm font-medium text-gray-800 font-poppins">
                      {ele?.emp_id || "-"}
                    </Typography>
                  </td>
                  <td className="px-4 py-4">
                    <Typography className="text-sm font-semibold text-gray-800 font-poppins group-hover:text-brand-600 transition-colors">
                      {ele?.name || "-"}
                    </Typography>
                  </td>
                  <td className="px-4 py-4">
                    <Typography className="text-sm font-normal text-gray-600 font-poppins">
                      {ele?.branch?.branch_name || "-"}
                    </Typography>
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {ele?.department?.name || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-4 min-w-[12rem] align-middle">
                    <Typography className="text-sm font-normal text-gray-600 font-poppins whitespace-nowrap tabular-nums">
                      {getEmployeeMobile(ele?.contacts)}
                    </Typography>
                  </td>

                  <td className={`px-4 py-4 relative ${openMenuValue[i] ? "z-[30]" : ""}`}>
                    <div
                      ref={(el) => (triggerRefs.current[i] = el)}
                      onMouseEnter={() => toggleMenuValue(i, true)}
                      onMouseLeave={() => toggleMenuValue(i, false)}
                      className="relative flex justify-center"
                    >
                      <Button
                        className="flex items-center gap-2 capitalize font-medium bg-white hover:bg-brand-50 text-brand-500 border border-brand-200 hover:border-brand-300 rounded-lg text-xs px-3 py-1.5 shadow-sm transition-all"
                      >
                        Action
                        <FaChevronDown
                          className={`w-3 h-3 transition-transform duration-200 ${openMenuValue[i] ? "rotate-180" : ""
                            }`}
                        />
                      </Button>
                      {/* Dropdown is rendered via portal below to avoid clipping by overflow container */}
                    </div>
                  </td>
                </motion.tr>
              );
            }))}

          {!isLoading && empListData?.employees?.length === 0 && (
            <tr>
              <td colSpan={data.length} className="p-10 text-center">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                  <Typography className="font-medium">No employees found</Typography>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {empListData?.employees?.length > 0 && paginationData && paginationData.totalPages > 1 && (
        <div className="w-full flex justify-center items-center gap-2 mt-6 mb-2">
          {/* Previous Button */}
          <button
            title="Previous Page"
            disabled={paginationData.currentPage <= 1}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${paginationData.currentPage > 1
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

              const renderPageButton = (page) => (
                <button
                  key={page}
                  onClick={() => onGoToPage(page)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${page === currentPage
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                    }`}
                >
                  {page}
                </button>
              );

              // If 7 or fewer pages, show all
              if (totalPages <= 7) {
                return Array.from({ length: totalPages }, (_, i) => i + 1).map(renderPageButton);
              }

              const pages = [];
              pages.push(renderPageButton(1));

              if (currentPage > 3) {
                pages.push(<span key="start-ellipsis" className="text-gray-400 px-1">...</span>);
              }

              const startPage = Math.max(2, currentPage - 1);
              const endPage = Math.min(totalPages - 1, currentPage + 1);

              for (let i = startPage; i <= endPage; i++) {
                pages.push(renderPageButton(i));
              }

              if (currentPage < totalPages - 2) {
                pages.push(<span key="end-ellipsis" className="text-gray-400 px-1">...</span>);
              }

              pages.push(renderPageButton(totalPages));

              return pages;
            })()}
          </div>

          {/* Next Button */}
          <button
            title="Next Page"
            disabled={paginationData.currentPage >= paginationData.totalPages}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all ${paginationData.currentPage < paginationData.totalPages
                ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            onClick={onNextPage}
          >
            ›
          </button>
        </div>
      )}

      {portalState.openIndex >= 0 &&
        ReactDOM.createPortal(
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
            onMouseEnter={() => toggleMenuValue(portalState.openIndex, true)}
            onMouseLeave={() => toggleMenuValue(portalState.openIndex, false)}
          >
            <ul className="flex w-full flex-col py-1">
              {getFilteredActionList().map((menuItem) => (
                <li
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors text-gray-700 hover:text-brand-600"
                  key={menuItem.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEmpActionList(sortedEmployees[portalState.openIndex], menuItem);
                  }}
                >
                  <Typography variant="small" className="text-xs font-medium font-poppins">
                    {menuItem.title}
                  </Typography>
                  <span style={{ color: menuItem.color }} className="text-sm opacity-80">
                    {menuItem.icon}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>,
          document.body
        )}

      {salaryDetailsValue?.show && (
        <PortalDrawer
          open={salaryDetailsValue.show}
          compo={
            <SalaryDetails
              salaryDetailsValue={salaryDetailsValue}
              ToggleCancelIncDialog={ToggleCancelIncDialog}
              handleOnChangeCancelInc={handleOnChangeCancelInc}
              handleSubmitCancelInc={handleSubmitCancelInc}
              handleSalaryIncrement={handleSalaryIncrement}
            />
          }
          title="Salary Details"
          closeDrawer={handleToggleSalaryDetails}
        // widthSize={620}
          widthSize={620}
        />
      )}
    </div>
  );
};

export default EmployeesList;
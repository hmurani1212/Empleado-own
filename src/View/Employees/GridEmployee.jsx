import { Card, CardBody, Button, MenuItem } from '@material-tailwind/react'
import { IoMdMore } from 'react-icons/io'
import { FaUserCheck } from 'react-icons/fa';
import { Typography } from "@material-tailwind/react";
import { motion } from "framer-motion";
import {
  BuildingOffice2Icon,
  BriefcaseIcon,
  EnvelopeIcon,
  PhoneIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { empActionList } from "../../services/EmpServices";
import useEmployeeActionService from "../../ViewModel/EmployeeViewModel/EmployeeActionService";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import SalaryDetails from "./SalaryDetails";
import { useState, useEffect } from "react";
import { EmployeesGridSkeleton } from "./EmployeesSkeletons";
import { getImageUrlFromEmployeeData } from "../../utils/imageUrlUtils";

const DEFAULT_MALE_DP = 'https://emp-beta.veevotech.com/images/icons/empm.jpg';
const DEFAULT_FEMALE_DP = 'https://emp-beta.veevotech.com/images/icons/empf.jpg';

function getGenderFallbackDp(gender) {
  if (gender === '0' || gender === 0) return DEFAULT_FEMALE_DP;
  return DEFAULT_MALE_DP;
}

/** Match list/export field usage: designation may be string or { title, name, label }. */
function getDesignationLabel(emp) {
  const raw = emp?.designation_name ?? emp?.designation;
  if (raw == null || raw === '') return '';
  if (typeof raw === 'object') {
    return String(raw.title ?? raw.name ?? raw.label ?? raw.designation ?? '').trim();
  }
  return String(raw).trim();
}

/** Prefer top-level email; then first email-type row in contacts. */
function getDisplayEmail(emp) {
  const top = String(emp?.email ?? emp?.work_email ?? '').trim();
  if (top) return top;
  const contacts = Array.isArray(emp?.contacts) ? emp.contacts : [];
  const emailRow = contacts.find((c) => {
    const t = String(c?.contact_type ?? '').toLowerCase();
    if (t === 'email') return true;
    const v = String(c?.contact ?? '').trim();
    return v.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  });
  return emailRow?.contact ? String(emailRow.contact).trim() : '';
}

/** Align with EmpServices getEmployeeMobile: mobile / emp_phone / contacts. */
function getDisplayPhone(emp) {
  if (emp?.mobile != null && String(emp.mobile).trim() !== '') return String(emp.mobile).trim();
  if (emp?.emp_phone != null && String(emp.emp_phone).trim() !== '') return String(emp.emp_phone).trim();
  if (emp?.emp_mob != null && String(emp.emp_mob).trim() !== '') return String(emp.emp_mob).trim();
  const contacts = Array.isArray(emp?.contacts) ? emp.contacts : [];
  const mobileType = (c) => (c?.contact_type && /contact number|mobile|phone/i.test(String(c.contact_type)));
  const preferred = contacts.find(mobileType);
  if (preferred?.contact != null && String(preferred.contact).trim() !== '') return String(preferred.contact).trim();
  const first = contacts[0];
  if (first?.contact != null && String(first.contact).trim() !== '') {
    const v = String(first.contact).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return v;
  }
  return '';
}

function InfoRow({ icon: Icon, label, value, valueClassName = '' }) {
  const display = value != null && String(value).trim() !== '' ? String(value).trim() : '—';
  return (
    <div className="flex gap-2.5 items-start min-w-0 text-left w-full">
      <span className="mt-0.5 shrink-0 text-brand-500/90" aria-hidden>
        <Icon className="w-4 h-4 stroke-[1.75]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 leading-tight">{label}</p>
        <p className={`text-xs text-slate-700 font-poppins leading-snug break-words ${valueClassName}`} title={display}>
          {display}
        </p>
      </div>
    </div>
  );
}

const GridEmployee = (props) => {
    const {
        empListData,
        loading: loadingProp,
        paginationData,
        onNextPage,
        onPreviousPage,
        onGoToPage,
        currentStatus,
        readOnlyEmployeeList,
    } = props;
    
    const [openMenuValue, setOpenMenuValue] = useState({});
    
    const {
        handleEmpActionList,
        salaryDetailsValue,
        handleToggleSalaryDetails,
        ToggleCancelIncDialog,
        handleOnChangeCancelInc,
        handleSubmitCancelInc,
    } = useEmployeeActionService();

    // Filter action list based on current status
    const getFilteredActionList = () => {
        if (currentStatus === 'Inactive Employees') {
            // Remove "Deactivate" action and add "Activate" action for inactive employees
            const filteredActions = empActionList.filter(action => action.id !== 7);
            // Add "Activate" action for inactive employees
            filteredActions.push({
                id: 8,
                title: 'Activate',
                icon: <FaUserCheck />,
                color: '#0ACF97'
            });
            return filteredActions;
        }
        return empActionList;
    };

    const toggleMenuValue = (index, isOpen) => {
        setOpenMenuValue(prev => ({
            ...prev,
            [index]: isOpen
        }));
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.action-menu-container')) {
                setOpenMenuValue({});
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const isLoading = loadingProp !== undefined ? loadingProp : !empListData?.employees;

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
                    <EmployeesGridSkeleton />
                ) : empListData?.employees?.length > 0 ? <>
                    {empListData?.employees?.map((ele, index) => {
                        const branchName = ele?.branch?.branch_name ?? '';
                        const deptName = ele?.department?.name ?? ele?.emp_dept ?? '';
                        const designationText = getDesignationLabel(ele);
                        const emailText = getDisplayEmail(ele);
                        const phoneText = getDisplayPhone(ele);
                        const imgSrc = getImageUrlFromEmployeeData(ele, true);

                        return (
                        <Card
                            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition-shadow duration-300"
                            key={ele?.id ?? `emp-${index}`}
                        >
                            <div className="h-1 w-full bg-gradient-to-r from-[#3DA5F4] via-[#5B8DEF] to-[#6366f1]" aria-hidden />
                            <CardBody className="p-0">
                            {!readOnlyEmployeeList && (
                            <div className="flex justify-end px-3 pt-2 relative action-menu-container">
                                <span 
                                    className="text-slate-400 text-xl cursor-pointer rounded-lg p-1 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMenuValue(index, !openMenuValue[index]);
                                    }}
                                >
                                    <IoMdMore />
                                </span>
                                
                                {openMenuValue[index] && (
                                    <div className="absolute top-8 right-2 z-50 border border-gray-200 rounded-xl bg-white w-[200px] shadow-lg">
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ul className="flex w-full flex-col gap-0.5 py-1">
                                                {getFilteredActionList().map((menuItem) => (
                                                    <MenuItem
                                                        className="flex items-center justify-between py-2.5 px-4 rounded-lg"
                                                        key={menuItem.id}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEmpActionList(ele, menuItem);
                                                            toggleMenuValue(index, false);
                                                        }}
                                                    >
                                                        <Typography variant="small" style={{ fontSize: '10px' }}>
                                                            {menuItem.title}
                                                        </Typography>
                                                        <span style={{ color: menuItem.color }}>
                                                            {menuItem.icon}
                                                        </span>
                                                    </MenuItem>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                            )}

                            <div className="px-4 pb-4 pt-0 flex flex-col items-center">
                                <div className="relative mb-3">
                                    <img
                                        className="rounded-full w-[72px] h-[72px] object-cover ring-4 ring-white shadow-md ring-offset-2 ring-offset-slate-50 group-hover:ring-brand-100 transition-all"
                                        src={imgSrc}
                                        alt={ele?.name ? `${ele.name} profile` : 'Employee'}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = getGenderFallbackDp(ele?.gender);
                                        }}
                                    />
                                </div>

                                <div className="flex flex-col items-center gap-0.5 px-1 w-full">
                                    <h3 className="text-center font-poppins font-semibold text-[15px] text-slate-900 leading-tight line-clamp-2">
                                        {ele?.name || '—'}
                                    </h3>
                                    <p className="text-center text-[11px] text-slate-500 font-medium leading-tight">
                                        <span className="text-slate-400">Employee ID</span>
                                        <span className="mx-1.5 text-slate-300">·</span>
                                        <span className="tabular-nums text-slate-700">{ele?.id ?? '—'}</span>
                                    </p>
                                </div>

                                <div className="mt-4 w-full space-y-3 pt-3 border-t border-slate-100">
                                    <InfoRow
                                        icon={BuildingOffice2Icon}
                                        label="Branch"
                                        value={branchName}
                                    />
                                    <InfoRow
                                        icon={Squares2X2Icon}
                                        label="Department"
                                        value={deptName}
                                    />
                                    <InfoRow
                                        icon={BriefcaseIcon}
                                        label="Designation"
                                        value={designationText}
                                    />
                                    <InfoRow
                                        icon={EnvelopeIcon}
                                        label="Email"
                                        value={emailText}
                                        valueClassName={emailText ? 'text-brand-600' : ''}
                                    />
                                    <InfoRow
                                        icon={PhoneIcon}
                                        label="Mobile"
                                        value={phoneText}
                                    />
                                </div>
                            </div>
                            </CardBody>

                        </Card>
                        );
                    })}
                </> : (
                <div>
                    <div className="w-full h-[200px] flex items-center justify-center">
                        <Typography variant="h6" color="blue-gray" className="font-normal">
                            No employees found
                        </Typography>
                    </div>
                </div>
                )}

            </div>
            
            {/* Google-style Pagination */}
            {empListData?.employees?.length > 0 && paginationData && paginationData.totalPages > 1 && (
                <div className="w-full flex justify-center items-center gap-1 mt-4 mb-4">
                    {/* Previous Button */}
                    {paginationData.currentPage > 1 ? (
                        <button
                            title="Previous Page"
                            className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
                            onClick={onPreviousPage}
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
                                        onClick={() => onGoToPage(page)}
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
                    {paginationData.currentPage < paginationData.totalPages ? (
                        <button
                            title="Next Page"
                            className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1"
                            onClick={onNextPage}
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

            {/* Salary Details Drawer */}
            {!readOnlyEmployeeList && salaryDetailsValue?.show && (
                <PortalDrawer
                    open={salaryDetailsValue.show}
                    compo={
                        <SalaryDetails
                            salaryDetailsValue={salaryDetailsValue}
                            ToggleCancelIncDialog={ToggleCancelIncDialog}
                            handleOnChangeCancelInc={handleOnChangeCancelInc}
                            handleSubmitCancelInc={handleSubmitCancelInc}
                        />
                    }
                    title="Salary Details"
                    closeDrawer={handleToggleSalaryDetails}
                    widthSize={900}
                />
            )}
        </div>
    )
}

export default GridEmployee
import { Card, CardBody, Button, MenuItem } from '@material-tailwind/react'
// import React from 'react'
import { IoMdMore } from 'react-icons/io'
import { FaUserCheck } from 'react-icons/fa';
import { Typography } from "@material-tailwind/react";
import { motion } from "framer-motion";
import { empActionList } from "../../services/EmpServices";
import useEmployeeActionService from "../../ViewModel/EmployeeViewModel/EmployeeActionService";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import SalaryDetails from "./SalaryDetails";
import { useState, useEffect } from "react";
import { EmployeesGridSkeleton } from "./EmployeesSkeletons";
import { buildEmployeeImageUrl } from "../../utils/imageUrlUtils";

const GridEmployee = (props) => {
    const { empListData, loading: loadingProp, paginationData, onNextPage, onPreviousPage, onGoToPage, currentStatus } = props;
    
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

    // empListData?.employees?.map((ele, index) => {
    //     console.log(' ele ele ele', ele)
    // })
    // console.log('empListData empListData', empListData)
    const isLoading = loadingProp !== undefined ? loadingProp : !empListData?.employees;

    return (
        <div>
            <div className='grid grid-cols-4 gap-3'>
                {isLoading ? (
                    <EmployeesGridSkeleton />
                ) : empListData?.employees?.length > 0 ? <>
                    {empListData?.employees?.map((ele, index) => (
                        <Card className="border border-[#3DA5F4] bg-[#F8F9FF] shadow-none" key={index}>
                            <CardBody className='p-1'>
                            <div className='flex justify-end relative action-menu-container'>
                                <span 
                                    className='text-[#9B9B9B] text-[20px] cursor-pointer'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMenuValue(index, !openMenuValue[index]);
                                    }}
                                >
                                    <IoMdMore />
                                </span>
                                
                                {/* Action Menu Dropdown */}
                                {openMenuValue[index] && (
                                    <div className="absolute top-0 right-0 z-50 border border-gray-200 rounded-lg bg-white w-[200px] shadow-md">
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ul className="flex w-full flex-col gap-1 py-1">
                                                {getFilteredActionList().map((menuItem) => (
                                                    <MenuItem
                                                        className="flex items-center justify-between py-2.5 px-4"
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
                                <div className='flex justify-center'>
                                    <div className='flex flex-col items-center gap-[3px]'>
                                        <div>
                                            {/* {console.log('ele?.dp', ele?.dp)} */}
                                            {/* {ele?.dp == null ? console.log("Dp is not foud") : console.log("I Found the dp thats fine ")} */}
                                            <img 
                                                className='rounded-full w-[50px] h-[50px]' 
                                                src={buildEmployeeImageUrl(ele)} 
                                                alt='Employee'
                                                onError={(e) => {
                                                    e.target.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6rKwDbEN_M9FCcve-ozbDkUUn6VkEZ7xfVw&s';
                                                }}
                                            />
                                        </div>
                                        <div className='text-[#474747] text-[13px] flex items-center gap-2'>
                                            <span >Empleado ID</span>
                                            <span className='font-semibold'>{ele?.id}</span>
                                        </div>
                                        <div className='font-semibold text-[14px] text-[#3DA5F4]'>
                                            <span>{ele?.name}</span>
                                        </div>
                                        <div className='text-[13px] text-[#9B9B9B]'>
                                            <span>{ele?.emp_dept}</span>
                                        </div>
                                        <div className='flex flex-col items-center gap-[1px] text-[13px] text-[#3DA5F4]'>
                                            <span>{ele?.email}</span>
                                            <span>{ele?.emp_mob}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>

                        </Card>
                    ))}
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
            {salaryDetailsValue?.show && (
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
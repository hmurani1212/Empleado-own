import { Typography, Button, MenuItem } from "@material-tailwind/react";
import React, { useState, useEffect } from "react";
import usePayroll from "../../ViewModel/PayrollViewModel/PayrollServices";
import useStore from "../../Store/store";
import { FaChevronDown } from "react-icons/fa";
import { motion } from "framer-motion";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import useDropdownService from "../../services/__dropDownHoverService";

const ManageSalaryTempList = (props) => {
  const { triggerRefs, getDropdownPosition } = useDropdownService();
  const {
    openMenuPayroll,
    toggleMenuPayroll,
    payrollActionMenu,
    handleMenuPayroll,
    salaryTempDialog,
    openDialogDelTemp,
    handleDelete,
    loading,
    branchFilter,
    salaryTemplateSearch,
    gettingSalaryTemp,
  } = usePayroll();
  const { allSalaryTemp } = props;
  
  // Get pagination from store
  const salaryTemplatesPagination = useStore((state) => state.salaryTemplatesPagination);
  
  // Pagination states
  const [currentPageId, setCurrentPageId] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPageId(0);
  }, [branchFilter?.branch_id?.value, salaryTemplateSearch?.searchPayroll]);
  const salarydata = [
    "ID",
    "Template Name",
    "Branch Name",
    "Salary",
    "Overtime rate/hour",
    "Creation date",
    "Actions",
  ];

  function convertDateString(dateStr) {
    const months = {
      January: "Jan",
      February: "Feb",
      March: "Mar",
      April: "Apr",
      May: "May",
      June: "Jun",
      July: "Jul",
      August: "Aug",
      September: "Sep",
      October: "Oct",
      November: "Nov",
      December: "Dec",
    };

    // Split input string
    const [day, monthFull, yearShort] = dateStr.split("-");

    // Convert 2-digit year to 4-digit
    const year = parseInt(yearShort) < 50 ? `20${yearShort}` : `19${yearShort}`;

    return `${parseInt(day)} ${months[monthFull]}, ${year}`;
  }

  // Handle Load More button click
  const handleLoadMore = async () => {
    if (isLoadingMore || !salaryTemplatesPagination?.hasMore) return;

    setIsLoadingMore(true);
    const nextPageId = currentPageId + 1;
    setCurrentPageId(nextPageId);

    try {
      const branchId = branchFilter?.branch_id?.value !== undefined && branchFilter?.branch_id?.value !== null
        ? branchFilter.branch_id.value
        : 0;
      const searchValue = salaryTemplateSearch?.searchPayroll || '';

      // Pass loadMore = true to append data instead of replacing
      await gettingSalaryTemp(branchId, searchValue, nextPageId, 10, true, true);
    } catch (error) {
      console.error("Error loading more salary templates:", error);
      setIsLoadingMore(false);
      setCurrentPageId(currentPageId); // Revert page_id on error
    } finally {
      setIsLoadingMore(false);
    }
  };

  return (
    <>
      <div className="p-2 bg-white rounded-[10px] drop-shadow-md w-full ">
        <div className="relative w-full min-h-[calc(100vh-100px)] overflow-auto customScroll">
          <table className="min-w-full table-fixed text-center ">
          <colgroup>
    <col span="7" />
  </colgroup>
            <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
              <tr>
                {salarydata?.map((head, i) => (
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
              {!allSalaryTemp?.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#666] text-[14px] font-Urbanist">
                    No data found
                  </td>
                </tr>
              ) : allSalaryTemp?.map((data, index) => {
                const isLast = index === allSalaryTemp.length - 1;
                const classes = isLast
                  ?  "px-[clamp(4px,0.8vw,12px)] py-4" : "px-[clamp(4px,0.8vw,12px)] py-4 border-b border-[#F2F2F9]"

                return (
                  <tr key={index}>
                    <td className={classes}>
                      <Typography
                        // variant="small"
                        // color='blue-gray'
                        className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                      >
                        {data.id}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography
                        // variant="small"
                        // color='blue-gray'
                        className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                      >
                        {data.name}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography
                        // variant="small"
                        // color='blue-gray'
                        className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                      >
                        {data.branch_name}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography
                        // variant="small"
                        // color='blue-gray'
                        className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                      >
                        {data.salary_amount}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography
                        // variant="small"
                        // color='blue-gray'
                        className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                      >
                        {data.overtime_rate}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography
                        // variant="small"
                        // color='blue-gray'
                        className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                      >
                        {convertDateString(data.creation_time)}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <div
                        ref={(el) => (triggerRefs.current[index] = el)}
                        onMouseEnter={() => toggleMenuPayroll(index, true)}
                        onMouseLeave={() => toggleMenuPayroll(index, false)}
                        className="relative flex justify-center"
                      >
                        <Button
                          className="flex items-center gap-2 capitalize font-normal text-[clamp(10px,0.8vw,13px)] bg-[#EFF8FF] border border-[#3DA5F4] text-[#3DA5F4] px-[10px] py-[5px] rounded-[7px]"
                          // variant="outlined"
                        >
                          Action
                          <FaChevronDown
                            strokeWidth={2.5}
                            className={`transition-transform transform ${
                              openMenuPayroll[index] ? "rotate-180" : ""
                            }`}
                          />
                        </Button>

                        {openMenuPayroll[index] && (
                          <div
                            className={`border border-gray-200 rounded-lg absolute z-[99999] bg-white w-[200px] left-[-100px] shadow-lg mt-0 ${index<=5 ? "top-full" : "bottom-full"}`}
                            style={{ position: "absolute" }}
                          >
                            <motion.div
                              initial={{
                                opacity: 0,
                                y:
                                  getDropdownPosition(index) === "top"
                                    ? -50
                                    : 50,
                              }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{
                                opacity: 0,
                                y:
                                  getDropdownPosition(index) === "top"
                                    ? -50
                                    : 50,
                              }}
                              transition={{ duration: 0.2 }}
                            >
                              <ul className="flex w-full flex-col gap-1">
                                {payrollActionMenu?.map((menuItem) => (
                                  <MenuItem
                                    className="flex items-center justify-between"
                                    key={menuItem.id}
                                    onClick={() =>
                                      handleMenuPayroll(menuItem.id, data)
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
              })}
            </tbody>
          </table>

          {/* Load More Button */}
          {allSalaryTemp && allSalaryTemp.length > 0 && salaryTemplatesPagination?.hasMore && (
            <div className="w-full flex justify-center mt-4 mb-4">
              <Button
                title="Load More"
                className="capitalize px-[clamp(4px,0.8vw,12px)] py-2 font-medium text-[clamp(10px,0.8vw,13px)] bg-bgBlue flex items-center gap-2 rounded-lg text-white"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                loading={isLoadingMore}
              >
                {isLoadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}

          <ConfirmationDialog
            openDialog={openDialogDelTemp}
            handleOpen={salaryTempDialog}
            handleConfirm={handleDelete}
            title={"Confirm Delete"}
            loading={loading}
            message={"Are you sure to Delete this Salary Template?"}
          />
        </div>
      </div>
    </>
  );
};

export default ManageSalaryTempList;
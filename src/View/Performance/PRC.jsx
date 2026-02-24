import React, { useEffect } from "react";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { BiSearch } from "react-icons/bi";
import { Button, MenuItem, Typography } from "@material-tailwind/react";
import usePRCServices from "../../ViewModel/PerformnaceViewModel/PRCServices";
import PortalDrawer from "../../Components/CustomDrawer/PortalDrawer";
import AddEditPRC from "./AddEditPRC";
import usePerformanceServices from "../../ViewModel/PerformnaceViewModel/performanceServices";
import { motion } from "framer-motion";
import useDropdownService from "../../services/__dropDownHoverService";
import { PRCActionList } from "../../services/__performanceServices";
import { FaChevronDown } from "react-icons/fa6";
import ViewPRC from "./ViewPRC";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import { PerformanceTableSkeleton } from "./PerformanceSkeletons";

const PRC = () => {
  const tableHeader = [
    "S.No",
    "Title",
    "Assigned To",
    "Start Date",
    "End Date",
    "Actions",
  ];

  // Helper function to format timestamps to dates
  const formatTimestampToDate = (timestamp) => {
    if (!timestamp) return "";

    let date;
    // If timestamp is a number
    if (typeof timestamp === "number") {
      // If timestamp is in seconds (10 digits), convert to milliseconds
      if (timestamp.toString().length === 10) {
        date = new Date(timestamp * 1000);
      } else {
        // If timestamp is already in milliseconds (13 digits)
        date = new Date(timestamp);
      }
    } else {
      // If timestamp is a string, try to parse it
      date = new Date(timestamp);
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid timestamp:", timestamp);
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const {
    PRCAddValue,
    toggleAddPRC,
    handlePRCMenuList,
    viewPRC,
    toggleViewPRC,
    deleteValue,
    confirmDelete,
    toggleDeleteConfirmatio,
    handleChangeRPC,
    handleSelectAddPRC,
    handleSubmitPRC,
    handleRemoveEmp,
    handleUpdatePRC,
    searchValue,
    handlePRCSearch,
    searchLoading,
  } = usePRCServices();

  const {
    PRCData,
    toggleMenuValue,
    openMenuValue,
    performanceScrollRef,
    gettingPRCData,
    PRCLoading,
  } = usePerformanceServices();

  const { getDropdownPosition, triggerRefs } = useDropdownService();

  useEffect(() => {
    gettingPRCData();
  }, []);

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* <h1 className='text-3xl'>Performance</h1> */}

      <div className="flex items-end justify-between">
        <div className="relative w-96">
          <label className="text-[#474747] text-[12px] px-2 font-medium font-Urbanist">
            Search Review Cycle
          </label>
          <div className="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-1/2 mt-3 right-3 -translate-y-2/4">
            {searchLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            ) : (
              <span>
                <BiSearch />
              </span>
            )}
          </div>
          <input
            className="bg-white text-[12px] font-Urbanist font-medium px-2 text-[#474747] w-full px-4 h-[38px] outline-none border-none rounded-[8px] shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
            placeholder="Search Review Cycle"
            name="name"
            value={searchValue.name}
            onChange={handlePRCSearch}
            disabled={searchLoading}
          />
        </div>
        <div>
          <CustomButton
            className="bg-[#8bc9f8]"
            title="Create Performance Review Cycle"
            onClick={toggleAddPRC}
          />
        </div>
      </div>
      <div className="bg-white rounded-[10px] drop-shadow-md p-2">
        {PRCLoading ? (
          <PerformanceTableSkeleton headers={tableHeader} />
        ) : (
        <div
          className="h-[calc(100vh-100px)] overflow-auto customScroll"
          ref={performanceScrollRef}
        >
          <table className="w-full text-center">
            <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
              <tr>
                {tableHeader?.map((head, i) => (
                  <th key={i} className="bg-[#F8F9FA] p-4">
                    <Typography
                      // variant="small"
                      // color="blue-gray"
                      className="font-medium leading-none text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRCData && PRCData.length === 0 ? (
                <tr>
                  <td colSpan={tableHeader.length} className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-gray-400 text-lg">
                        {searchValue.name.trim()
                          ? "No search results found"
                          : "No performance review cycles found"}
                      </div>
                      <div className="text-gray-300 text-sm">
                        {searchValue.name.trim()
                          ? `No results for "${searchValue.name}"`
                          : "Create your first performance review cycle"}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                PRCData?.map((ele, i) => {
                  const isLast = i === PRCData?.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-[#F2F2F9]";

                  return (
                    <tr key={i}>
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {i + 1}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {ele.name}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {ele.assign_to}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {formatTimestampToDate(ele.startDate)}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          as="a"
                          href="#"
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {formatTimestampToDate(ele.endDate)}
                        </Typography>
                      </td>
                      {/* <td className={classes}>
                                    <Typography
                                        as="a"
                                        href="#"
                                        variant="small"
                                        color="blue-gray"
                                        className="font-medium"
                                    >
                                        {ele.count}
                                    </Typography>
                                </td> */}
                      <td className={classes}>
                        <div
                          ref={(el) => (triggerRefs.current[i] = el)}
                          onMouseEnter={() => toggleMenuValue(i, true)}
                          onMouseLeave={() => toggleMenuValue(i, false)}
                          className="relative flex justify-center items-center"
                        >
                          <Button
                            className="flex items-center gap-2 capitalize font-normal text-[clamp(10px,0.9vw,12px)] bg-[#EFF8FF] border border-[#3da5f4] text-[#3da5f4] px-[10px] py-[5px]"
                            variant="outlined"
                          >
                            Action
                            <FaChevronDown
                              strokeWidth={2.5}
                              className={`transition-transform transform ${
                                openMenuValue[i] ? "rotate-180" : ""
                              }`}
                            />
                          </Button>
                          {openMenuValue[i] && (
                            <div
                              className={`border border-gray-200 rounded-lg absolute z-[99999] bg-white w-[200px] left-[-100px] shadow-lg mt-0 ${
                                i <= 5 ? "top-full" : "bottom-full"
                              }`}
                            >
                              <motion.div
                                initial={{
                                  opacity: 0,
                                  y:
                                    getDropdownPosition(i) === "top" ? -50 : 50,
                                }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{
                                  opacity: 0,
                                  y:
                                    getDropdownPosition(i) === "top" ? -50 : 50,
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                <ul className="flex w-full flex-col gap-1">
                                  {PRCActionList.map((menuItem) => (
                                    <MenuItem
                                      className="flex items-center justify-between"
                                      key={menuItem.id}
                                      onClick={(e) => {
                                        e.stopPropagation(); // Prevent the event from bubbling up
                                        handlePRCMenuList(ele, menuItem);
                                      }}
                                    >
                                      <Typography variant="small">
                                        {menuItem.name}
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
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {(PRCAddValue.show || viewPRC.show) && (
        <PortalDrawer
          open={PRCAddValue.show || viewPRC.show}
          compo={
            PRCAddValue.show ? (
              <AddEditPRC
                handleChangeRPC={handleChangeRPC}
                PRCAddValue={PRCAddValue}
                handleSelectAddPRC={handleSelectAddPRC}
                handleSubmitPRC={handleSubmitPRC}
                handleRemoveEmp={handleRemoveEmp}
                handleUpdatePRC={handleUpdatePRC}
              />
            ) : viewPRC.show ? (
              <ViewPRC data={viewPRC.singleData} />
            ) : null
          }
          title={
            PRCAddValue.show
              ? !PRCAddValue.update
                ? "Create Performance Review Cycle"
                : "Update Performance Review Cycle"
              : viewPRC.show
              ? "Performance Review Cycle"
              : null
          }
          closeDrawer={
            PRCAddValue.show
              ? toggleAddPRC
              : viewPRC.show
              ? toggleViewPRC
              : null
          }
          widthSize={PRCAddValue.show ? 550 : viewPRC.show ? 750 : null}
        />
      )}

      {deleteValue.show && (
        <ConfirmationDialog
          openDialog={deleteValue.show}
          handleOpen={toggleDeleteConfirmatio}
          handleConfirm={confirmDelete}
          loading={deleteValue.loading}
          title="Delete Confirmation"
          message="Are you sure you want to delete this ?"
        />
      )}
    </div>
  );
};

export default PRC;
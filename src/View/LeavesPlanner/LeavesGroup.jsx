import React, { useEffect, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { Button, MenuItem, Switch, Typography } from "@material-tailwind/react";
import useLeavesPlanner from "../../ViewModel/LeavePlannerViewModel/LeavePlannerServices";
import { FaEye, FaChevronDown } from "react-icons/fa";
import { Outlet, useLocation } from "react-router";
import { motion } from "framer-motion";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import CustomButton from "../../Components/CustomButton/CustomButton";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";

const LeavesGroup = () => {
  const {
    addLeaveGroupDrawer,
    getAllDepartmentsLeaves,
    leavesBranches,
    allLeavesGroup,
    mountLeave,
    getLeavesList,
    getPaidLeavesConfig,
    handleLeaveView,
    handleLeavesChange,
    openMenu,
    toggleMenuLeaves,
    leavesNoticesItems,
    handleMenuItemsLeaves,
    openDialogLeaves,
    type,
    handleDeleteLeavesDialog,
    handleDeleteGroups,
    triggerRefs,
    getDropdownPosition,
    selectBranchHandler,
    handleChangeToggle,
    isDeletingGroup,
  } = useLeavesPlanner();

  const [selectedBranch, setSelectedBranch] = useState(null);

  const data = [
    "ID",
    "Group Title",
    "Creation Date",
    "Defined Leaves",
    "View Leaves",
    "Action",
  ];

  useEffect(() => {
    if (!mountLeave) {
      getLeavesList();
      getAllDepartmentsLeaves();
      getPaidLeavesConfig();
    }
  }, []);

  const location = useLocation();

  function formatTimestamp(unixTimestamp) {
    if (!unixTimestamp) return "N/A";

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    let timestamp = unixTimestamp;

    // Handle different timestamp formats
    if (typeof timestamp === "string") {
      // If it's an ISO string, convert to Unix timestamp
      const dateObj = new Date(timestamp);
      timestamp = Math.floor(dateObj.getTime() / 1000);
    } else if (typeof timestamp === "number") {
      // If timestamp is in milliseconds (13 digits), convert to seconds
      if (timestamp.toString().length === 13) {
        timestamp = Math.floor(timestamp / 1000);
      }
    }

    // Ensure timestamp is a valid number
    if (isNaN(timestamp) || timestamp <= 0) {
      return "N/A";
    }

    // Convert seconds to milliseconds for JS Date
    const date = new Date(timestamp * 1000);

    // Validate the date
    if (isNaN(date.getTime())) {
      return "N/A";
    }

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month}, ${year}`;
  }

  return (
    <>
      {location.pathname.includes("viewLeaves") ? (
        <Outlet />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col w-52">
                <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Select Branch</label>
                {/* <label className="text-[#698592] text-[12px] mb-1">Branch</label> */}
                <CustomSelect
                  placeHolderTitle="All Branches"
                  value={selectedBranch}
                  options={[
                    { value: "all", label: "All branches" },
                    ...(leavesBranches?.map((branch) => ({
                      value: branch.id,
                      label: branch.branch_name,
                    })) || []),
                  ]}
                  onChangeHandler={(selectedOption) => {
                    setSelectedBranch(selectedOption);
                    selectBranchHandler(selectedOption.value);
                  }}
                  customStyles={false}
                  optionFontSize={11}
                />
              </div>

              <div className="relative min-w-[220px]">
                <label className="text-[#474747] text-[12px] font-Urbanist font-medium px-2">Search by name</label>
                <div className="relative">
                  <BiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg" />
                  <input
                    className="w-full rounded-[10px] px-3 pr-10 text-sm h-[37px] outline-none border-none text-[12px] text-[#474747] bg-white shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]"
                    placeholder="Search by name"
                    name="search"
                    onChange={handleLeavesChange}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  color="blue"
                  label="Paid Leaves"
                  checked={type}
                  onChange={handleChangeToggle}
                />
              </div>
            </div>

            <CustomButton
              className="bg-[#8bc9f8]"
              title="Add New Group"
              onClick={addLeaveGroupDrawer}
            />
          </div>

          <div className="bg-white rounded-[10px] drop-shadow-md p-2">
            <div className="min-h-[calc(100vh-100px)] overflow-auto customScroll">
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
                  {allLeavesGroup && allLeavesGroup.length > 0 ? (
                    allLeavesGroup.map((leave, index) => {
                      if (!leave) return null;
                      const isLast = index === allLeavesGroup.length - 1;
                      const classes = isLast
                        ? "px-[clamp(4px,0.8vw,12px)] py-4"
                        : "px-[clamp(4px,0.8vw,12px)] py-4 border-b border-[#F2F2F9]";
                      return (
                        <tr key={index}>
                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                            >
                              {leave.id}
                            </Typography>
                          </td>
                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                            >
                              {leave.group_title || leave.name}
                            </Typography>
                          </td>
                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                            >
                              {formatTimestamp(leave.creation_time)}
                            </Typography>
                          </td>
                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                            >
                              {leave.defined_leaves_count || 0}
                            </Typography>
                          </td>
                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal flex justify-center w-full text-[#474747] font-Urbanist text-[clamp(10px,0.8vw,13px)] capitalize"
                            >
                              <FaEye
                                className="border-solid border-2 border-[#8bc9f8] p-[3px] text-[27px] text-[#8bc9f8] cursor-pointer"
                                onClick={() => handleLeaveView(leave.id)}
                              />
                            </Typography>
                          </td>
                          <td className={classes}>
                            <div
                              ref={(el) => {
                                if (el && triggerRefs.current) {
                                  triggerRefs.current[index] = el;
                                }
                              }}
                              onMouseEnter={() => toggleMenuLeaves(index, true)}
                              onMouseLeave={() =>
                                toggleMenuLeaves(index, false)
                              }
                              className="relative flex items-center justify-center w-full"
                            >
                              <Button
                                className="flex items-center gap-2 capitalize font-normal text-[clamp(10px,0.9vw,12px)] bg-[#EFF8FF] border border-[#3da5f4] text-[#3da5f4] px-[10px] py-[5px]"
                                variant="outlined"
                              >
                                Action
                                <FaChevronDown
                                  strokeWidth={2.5}
                                  className={`transition-transform transform ${
                                    openMenu && openMenu[index]
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                />
                              </Button>

                              {openMenu && openMenu[index] && (
                                <div
                                  className={`border border-gray-200 rounded-lg absolute z-[99999] bg-white w-[130px] left-[-20px] shadow-lg mt-0 ${index<=5 ? "top-full" : "bottom-full"}`}
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
                                    <ul className="flex w-full flex-col">
                                      {leavesNoticesItems &&
                                        leavesNoticesItems.length > 0 &&
                                        leavesNoticesItems.map(
                                          (menuItem) =>
                                            menuItem && (
                                              <MenuItem
                                                className="flex items-center justify-between"
                                                key={menuItem.id}
                                                onClick={() =>
                                                  handleMenuItemsLeaves(
                                                    menuItem.id,
                                                    leave
                                                  )
                                                }
                                              >
                                                <Typography variant="small">
                                                  {menuItem.title}
                                                </Typography>
                                                <span>{menuItem.icon}</span>
                                              </MenuItem>
                                            )
                                        )}
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
                      <td colSpan={data.length} className="p-2 text-center">
                        No record found
                      </td>
                    </tr>
                  )}
                </tbody>

                <ConfirmationDialog
                  openDialog={openDialogLeaves}
                  handleOpen={handleDeleteLeavesDialog}
                  handleConfirm={() => handleDeleteGroups()}
                  title="Confirm Delete"
                  message="Are you sure you want to Delete this group?"
                  loading={isDeletingGroup}
                />
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeavesGroup;
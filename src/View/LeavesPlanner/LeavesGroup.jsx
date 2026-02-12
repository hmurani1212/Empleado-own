import React, { useEffect, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { Button, MenuItem, Switch, Typography } from "@material-tailwind/react";
import useLeavesPlanner from "../../ViewModel/LeavePlannerViewModel/LeavePlannerServices";
import { FaEye, FaChevronDown } from "react-icons/fa";
import { Outlet, useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import CustomButton from "../../Components/CustomButton/CustomButton";
import CustomSelect from "../../Components/CustomSelect/CustomSelect";
import { LeavesGroupTableSkeleton } from "./LeavesPlannerSkeletons";

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
  const [leavesGroupLoading, setLeavesGroupLoading] = useState(true);

  const data = [
    "ID",
    "Group Title",
    "Creation Date",
    "Defined Leaves",
    "View Leaves",
    "Action",
  ];

  useEffect(() => {
    if (mountLeave) {
      setLeavesGroupLoading(false);
    } else {
      setLeavesGroupLoading(true);
      Promise.all([
        getLeavesList(),
        getAllDepartmentsLeaves(),
        getPaidLeavesConfig(),
      ]).finally(() => setLeavesGroupLoading(false));
    }
  }, [mountLeave]);

  const location = useLocation();

  function formatTimestamp(unixTimestamp) {
    if (!unixTimestamp) return "N/A";

    let timestamp = unixTimestamp;
    if (typeof timestamp === "string") {
      const dateObj = new Date(timestamp);
      timestamp = Math.floor(dateObj.getTime() / 1000);
    } else if (typeof timestamp === "number") {
      if (timestamp.toString().length === 13) {
        timestamp = Math.floor(timestamp / 1000);
      }
    }

    if (isNaN(timestamp) || timestamp <= 0) {
      return "N/A";
    }

    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  return (
    <>
      {location.pathname.includes("viewLeaves") ? (
        <Outlet />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="w-full md:w-56">
                <CustomSelect
                  placeHolderTitle="Filter by Branch"
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
                />
              </div>

              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BiSearch className="text-gray-400 text-lg" />
                </div>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-700"
                  placeholder="Search groups..."
                  name="search"
                  onChange={handleLeavesChange}
                />
              </div>

              <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                <span className="text-sm font-medium text-gray-600">Paid Leaves</span>
                <Switch
                  color="blue"
                  checked={type}
                  onChange={handleChangeToggle}
                  className="h-full w-full checked:bg-[#3da5f4]"
                  containerProps={{
                    className: "w-11 h-6",
                  }}
                  circleProps={{
                    className: "before:hidden left-0.5 border-none",
                  }}
                />
              </div>
            </div>

            <Button
              className="bg-bgBlue text-white shadow-blue-500/20 hover:shadow-blue-500/40 capitalize font-medium text-sm px-6 py-2.5 rounded-xl transition-all w-full lg:w-auto flex justify-center"
              onClick={addLeaveGroupDrawer}
            >
              Add New Group
            </Button>
          </div>

          {/* Table */}
          {leavesGroupLoading ? (
            <LeavesGroupTableSkeleton />
          ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="min-h-[calc(100vh-250px)] overflow-auto customScroll">
              <table className="min-w-full table-auto text-center">
                <thead className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
                  <tr>
                    {data?.map((head, i) => (
                      <th key={i} className={`p-4 first:pl-6 last:pr-6 whitespace-nowrap ${head === 'Group Title' ? 'text-left' : ''}`}>
                        <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                          {head}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allLeavesGroup && allLeavesGroup.length > 0 ? (
                    allLeavesGroup.map((leave, index) => {
                      if (!leave) return null;
                      return (
                        <motion.tr 
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-blue-50/30 transition-colors group"
                        >
                          <td className="p-4">
                            <span className="text-xs font-medium text-gray-500 font-poppins bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                              #{leave.id}
                            </span>
                          </td>
                          <td className="p-4 text-left">
                            <Typography className="text-sm font-semibold text-gray-900 font-poppins">
                              {leave.group_title || leave.name}
                            </Typography>
                          </td>
                          <td className="p-4">
                            <Typography className="text-xs text-gray-500 font-poppins">
                              {formatTimestamp(leave.creation_time)}
                            </Typography>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                              {leave.defined_leaves_count || 0} Types
                            </span>
                          </td>
                          <td className="p-4">
                            <Button
                              variant="text"
                              className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                              onClick={() => handleLeaveView(leave.id)}
                            >
                              <FaEye size={18} />
                            </Button>
                          </td>
                          <td className="p-4 relative">
                            <div
                              ref={(el) => {
                                if (el && triggerRefs.current) {
                                  triggerRefs.current[index] = el;
                                }
                              }}
                              onMouseEnter={() => toggleMenuLeaves(index, true)}
                              onMouseLeave={() => toggleMenuLeaves(index, false)}
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
                                    openMenu && openMenu[index] ? "rotate-180" : ""
                                  }`}
                                />
                              </Button>

                              <AnimatePresence>
                                {openMenu && openMenu[index] && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15, ease: "easeOut" }}
                                    className={`absolute z-50 bg-white border border-gray-100 rounded-xl shadow-xl w-40 right-0 ${
                                      index >= allLeavesGroup.length - 3 ? "bottom-full mb-2" : "top-full mt-2"
                                    }`}
                                  >
                                    <ul className="flex flex-col py-1">
                                      {leavesNoticesItems?.map((menuItem) => (
                                        <li className="px-1" key={menuItem.id}>
                                          <button
                                            className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between rounded-lg transition-colors"
                                            onClick={() => handleMenuItemsLeaves(menuItem.id, leave)}
                                          >
                                            {menuItem.title}
                                            <span className="text-gray-400">{menuItem.icon}</span>
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
                      <td colSpan={data.length} className="p-12 text-center text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                          <Typography color="gray" className="font-medium font-poppins">
                            No leave groups found
                          </Typography>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}

          <ConfirmationDialog
            openDialog={openDialogLeaves}
            handleOpen={handleDeleteLeavesDialog}
            handleConfirm={() => handleDeleteGroups()}
            title="Confirm Delete"
            message="Are you sure you want to Delete this group?"
            loading={isDeletingGroup}
          />
        </div>
      )}
    </>
  );
};

export default LeavesGroup;
import React, { useEffect } from "react";
import { BiSearch } from "react-icons/bi";
import { Button, Typography } from "@material-tailwind/react";
import { useNavigate, useParams } from "react-router";
import useLeavesPlanner from "../../ViewModel/LeavePlannerViewModel/LeavePlannerServices";
import { MdDelete } from "react-icons/md";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import { FaArrowLeft, FaPlus } from "react-icons/fa";
import { ViewLeavesHeaderSkeleton, ViewLeavesTableSkeleton } from "./LeavesPlannerSkeletons";

const ViewLeaves = () => {
  const {
    allViewLeave,
    viewLeavesLoading,
    getViewLeavesList,
    openDialogSpecific,
    handleDeleteLeaves,
    handleDeleteSpecificLeaves,
    addDefineLeave,
    handleLeaveTypeSearch,
    isDeletingSpecificLeave,
  } = useLeavesPlanner();
  const params = useParams();
  const navigate = useNavigate();

  const handleBackToLeave = () => {
    navigate("/leavesPlanner/leaves_group");
  };

  useEffect(() => {
    if (params.id) {
      getViewLeavesList({ group_id: params.id });
    }
  }, [params.id]);

  const data = [
    "ID",
    "Title",
    "Leave Calendar From",
    "Leave Calendar Upto",
    "No of Leaves",
    "Unit",
    "Carry Forward",
    "Consecutive",
    "Encashable",
    "Prorated",
    "Leave Type",
    "Min.service (days)",
    "Action",
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Controls */}
      {viewLeavesLoading ? (
        <ViewLeavesHeaderSkeleton />
      ) : (
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Button 
            variant="text" 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 normal-case font-medium p-2"
            onClick={handleBackToLeave}
          >
            <FaArrowLeft /> Back
          </Button>
          
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BiSearch className="text-gray-400 text-lg" />
            </div>
            <input
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 text-gray-700"
              placeholder="Search leaves..."
              name="searchE"
              onChange={handleLeaveTypeSearch}
            />
          </div>
        </div>

        <Button
          className="bg-bgBlue text-white shadow-blue-500/20 hover:shadow-blue-500/40 capitalize font-medium text-sm px-6 py-2.5 rounded-xl transition-all flex items-center gap-2"
          onClick={() => addDefineLeave(params.id)}
        >
          <FaPlus size={12} /> Define Leave Type
        </Button>
      </div>
      )}

      {/* Table */}
      {viewLeavesLoading ? (
        <ViewLeavesTableSkeleton />
      ) : (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="min-h-[calc(100vh-250px)] overflow-auto customScroll">
          <table className="min-w-full table-auto text-center">
            <thead className="sticky top-0 z-20 bg-gray-50/80 backdrop-blur-md border-b border-gray-100">
              <tr>
                {data?.map((head, i) => (
                  <th key={i} className="p-4 first:pl-6 last:pr-6 whitespace-nowrap">
                    <Typography className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 font-poppins">
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allViewLeave && allViewLeave.length > 0 ? (
                allViewLeave.map((ele, index) => (
                  <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4">
                      <span className="text-xs font-medium text-gray-500 font-poppins bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                        #{ele.id}
                      </span>
                    </td>
                    <td className="p-4">
                      <Typography className="text-sm font-semibold text-gray-900 font-poppins">
                        {ele.title}
                      </Typography>
                    </td>
                    <td className="p-4"><Typography className="text-xs text-gray-600 font-poppins">{ele.calender_from}</Typography></td>
                    <td className="p-4"><Typography className="text-xs text-gray-600 font-poppins">{ele.calender_upto}</Typography></td>
                    <td className="p-4"><Typography className="text-xs font-medium text-blue-600 font-poppins">{ele.quantity}</Typography></td>
                    <td className="p-4"><Typography className="text-xs text-gray-600 font-poppins">{ele.unit}</Typography></td>
                    <td className="p-4"><Typography className="text-xs text-gray-600 font-poppins">{ele.carry_forward}</Typography></td>
                    <td className="p-4"><Typography className="text-xs text-gray-600 font-poppins">{ele.consecutive}</Typography></td>
                    <td className="p-4"><Typography className="text-xs text-gray-600 font-poppins">{ele.encashable}</Typography></td>
                    <td className="p-4"><Typography className="text-xs text-gray-600 font-poppins">{ele.prorated}</Typography></td>
                    <td className="p-4"><Typography className="text-xs text-gray-600 font-poppins">{ele.leave_type}</Typography></td>
                    <td className="p-4"><Typography className="text-xs text-gray-600 font-poppins">{ele.new_joiners_after}</Typography></td>
                    <td className="p-4">
                      <Button
                        variant="text"
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        onClick={() => handleDeleteSpecificLeaves(ele.id)}
                      >
                        <MdDelete size={20} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={data.length} className="p-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center">
                      <Typography color="gray" className="font-medium font-poppins">
                        No leave types found
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
        openDialog={openDialogSpecific}
        handleOpen={handleDeleteSpecificLeaves}
        handleConfirm={() => handleDeleteLeaves()}
        title={"Confirm Delete"}
        message={"Are you sure to Delete this leave?"}
        loading={isDeletingSpecificLeave}
      />
    </div>
  );
};

export default ViewLeaves;
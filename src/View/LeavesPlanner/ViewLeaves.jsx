import React from "react";
import { BiSearch } from "react-icons/bi";
import { Button, Typography } from "@material-tailwind/react";
import { useNavigate, useParams } from "react-router";
import useLeavesPlanner from "../../ViewModel/LeavePlannerViewModel/LeavePlannerServices";
import { MdDelete } from "react-icons/md";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";
import CustomButton from "../../Components/CustomButton/CustomButton";

const ViewLeaves = () => {
  const {
    allViewLeave,
    openDialogSpecific,
    handleDeleteLeaves,
    handleDeleteSpecificLeaves,
    addDefineLeave,
    handleLeaveTypeSearch,
    isDeletingSpecificLeave,
  } = useLeavesPlanner();
  const params = useParams();
  // console.log(params)
  // console.log('allView', allViewLeave)

  const navigate = useNavigate();
  const handleBackToLeave = () => {
    navigate("/leavesPlanner/leaves_group");
  };

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
    <>
      <div className="pl-2 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="relative w-full min-w-[200px] h-9">
                <div className="absolute grid w-5 h-5 place-items-center text-blue-gray-500 top-2/4 right-3 -translate-y-2/4">
                  <span>
                    <BiSearch />
                  </span>
                </div>
                <input
                  className="peer w-full h-full bg-white text-blue-gray-700  outline outline-0 focus:outline-0 disabled:bg-blue-gray-50 disabled:border-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 border focus:border-2 border-t-transparent focus:border-t-transparent text-sm px-3 py-2.5 rounded-[7px] !pr-9 border-blue-gray-200 focus:border-gray-900"
                  placeholder=" "
                  name="searchE"
                  onChange={handleLeaveTypeSearch}
                />
                <label className="flex w-full h-full select-none pointer-events-none absolute left-0 !overflow-visible truncate peer-placeholder-shown:text-blue-gray-500 leading-tight peer-focus:leading-tight peer-disabled:text-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 transition-all -top-1.5 peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] before:content[' '] before:block before:box-border before:w-2.5 before:h-1.5 before:mt-[6.5px] before:mr-1 peer-placeholder-shown:before:border-transparent before:rounded-tl-md before:border-t peer-focus:before:border-t-2 before:border-l peer-focus:before:border-l-2 before:pointer-events-none before:transition-all peer-disabled:before:border-transparent after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 after:h-1.5 after:mt-[6.5px] after:ml-1 peer-placeholder-shown:after:border-transparent after:rounded-tr-md after:border-t peer-focus:after:border-t-2 after:border-r peer-focus:after:border-r-2 after:pointer-events-none after:transition-all peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] text-gray-500 peer-focus:text-gray-900 before:border-blue-gray-200 peer-focus:before:!border-gray-900 after:border-blue-gray-200 peer-focus:after:!border-gray-900">
                  Search by name
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pr-2">
            <span>
              <CustomButton
                className="bg-[#8bc9f8]"
                title="Define Leave Type"
                onClick={() => addDefineLeave(params.id)}
              ></CustomButton>
            </span>
            <span>
              <CustomButton
                className="bg-[#8bc9f8]"
                title="Back"
                onClick={handleBackToLeave}
              ></CustomButton>
            </span>
          </div>
        </div>

        <div className="overflow-x-scroll sideMenu customScroll bg-white rounded-[10px] drop-shadow-md p-2">
          <table className="w-full min-w-max text-center h-full">
            <thead className="sticky top-[-9px] z-20 bg-[#F8F9FA] rounded-[8px]">
              <tr>
                {data?.length > 0 &&
                  data.map((head, i) => (
                    <th key={i} className="bg-[#F8F9FA] p-4">
                      <Typography
                        // variant = "small"
                        // color = "blue-gray"
                        className="font-medium leading-none text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {allViewLeave?.length > 0 &&
                allViewLeave.map((ele, index) => {
                  const isLast = index === data.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-[#F2F2F9]";

                  return (
                    <tr key={index}>
                      <td className={classes}>
                        <Typography
                          //  variant="small"
                          //  color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {ele.id}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          //  variant="small"
                          //  color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {ele.title}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          //  variant="small"
                          //  color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {ele.calender_from}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          //  variant="small"
                          //  color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {ele.calender_upto}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          //  variant="small"
                          //  color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {ele.quantity}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          //  variant="small"
                          //  color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {ele.unit}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          //  variant="small"
                          //  color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {ele.carry_forward}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          //  variant="small"
                          //  color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {ele.consecutive}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          //  variant="small"
                          //  color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {ele.encashable}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          //  variant="small"
                          //  color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {ele.prorated}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          //  variant="small"
                          //  color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {ele.leave_type}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          //  variant="small"
                          //  color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {ele.new_joiners_after}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          //  variant="small"
                          //  color="blue-gray"
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          <div className="flex items-center justify-center">
                            <span>
                              <MdDelete
                                className="text-[20px] text-red-500 cursor-pointer"
                                onClick={() => handleDeleteSpecificLeaves(ele.id)}
                              />
                            </span>
                          </div>
                        </Typography>
                      </td>
                    </tr>
                  );
                })}
            </tbody>

            <ConfirmationDialog
              openDialog={openDialogSpecific}
              handleOpen={handleDeleteSpecificLeaves}
              handleConfirm={() => handleDeleteLeaves()}
              title={"Confirm Delete"}
              message={"Are you sure to Delete this leave?"}
              loading={isDeletingSpecificLeave}
            />
          </table>
        </div>
      </div>
    </>
  );
};

export default ViewLeaves;
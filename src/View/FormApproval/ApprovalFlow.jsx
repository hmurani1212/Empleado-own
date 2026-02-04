import { Button, Typography } from "@material-tailwind/react";
import React, { useEffect } from "react";
import useFormApproval from "../../ViewModel/FormApprovalViewModel/FormApprovalServices";
import { formatTimestamp } from "../../services/__formApprovalServices";
import { FaEye, FaTrashAlt } from "react-icons/fa";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";

const ApprovalFlow = () => {
  const {
    mountApprovalFlow,
    gettingFormApproval,
    allApprovalFlow,
    viewFormApproval,
    handleDeleteApproval,
    openDialogForm,
    deleteApproval,
  } = useFormApproval();
  const approvalData = ["#", "Title", "Creation Time", "Action"];

  useEffect(() => {
    if (!mountApprovalFlow) {
      gettingFormApproval();
    }
  }, []);

  function formatTimeStamp(unixTimestamp) {
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

    // Convert seconds to milliseconds for JS Date
    const date = new Date(unixTimestamp * 1000);

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month}, ${year}`;
  }

  return (
    <>
      <div className="px-2 flex flex-col gap-3">
        <div className="bg-white rounded-[10px] drop-shadow-md p-2">
          <div className="h-[calc(100vh-100px)] overflow-auto customScroll">
            <table className="w-full text-center">
              <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
                <tr>
                  {approvalData?.map((head, i) => (
                    <th key={i} className="bg-[#F8F9FA] p-4">
                      <Typography
                        // variant='small'
                        // color='blue-gray'
                        className="font-medium leading-none text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {allApprovalFlow?.map((data, index) => {
                  const isLast = index === allApprovalFlow.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-[#F2F2F9]";

                  return (
                    <tr key={index}>
                      <td className={classes}>
                        <Typography
                          // variant='small'
                          // color='blue-gray'
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {index + 1}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          // variant='small'
                          // color='blue-gray'
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {data.title}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          // variant='small'
                          // color='blue-gray'
                          className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                        >
                          {formatTimeStamp(data.entry_time)}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            className="capitalize font-medium text-[12px] bg-[#8bc9f8] p-2 flex items-center gap-1"
                            onClick={() => viewFormApproval(data)}
                          >
                            <span>
                              <FaEye />
                            </span>
                            View
                          </Button>

                          {/* Hide delete button for global approval flows (org_id === 0) */}
                          {data.org_id === 0 || data.org_id === "0" ? null : (
                            <Button
                              className="capitalize font-medium text-[12px] bg-[#FF4979] p-2 flex items-center gap-1"
                              onClick={() => handleDeleteApproval(data.id)}
                            >
                              <span>
                                <FaTrashAlt />
                              </span>
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <ConfirmationDialog
          openDialog={openDialogForm}
          handleOpen={handleDeleteApproval}
          handleConfirm={(e) => deleteApproval(e)}
          title={"Confirm Delete"}
          // loading = { loading }
          message={
            "You are attempting to delete this approval flow. Please note that it is an irreversable process. Are you sure to Delete this Approval Flow?"
          }
        />
      </div>
    </>
  );
};

export default ApprovalFlow;
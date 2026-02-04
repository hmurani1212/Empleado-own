import React from "react";
import useManageEmpSalary from "../../ViewModel/PayrollViewModel/ManageEmpSalaryServices";
import { Typography } from "@material-tailwind/react";
import { FaPencilAlt, FaTimes } from "react-icons/fa";
import CustomButton from "../../Components/CustomButton/CustomButton";
import CustomDialog from "../../Components/CustomDialog/CustomDialog";
import ConfirmationDialog from "../../Components/ConfirmationDialog/ConfirmationDialog";

const DeductionList = () => {
  const headList = ["S.No.", "Title", "Status", "Action"];
  const {
    addIncentiveDeduction,
    handleDeleteInc,
    handleDialogDelIncent,
    openDialogDelIncent,
    openEditIncent,
    allDeductList,
    loading,
  } = useManageEmpSalary();
  return (
    <div className="p-2 flex flex-col space-y-4 bg-white rounded-[10px] drop-shadow-md p-2">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[#3da5f4] text-[14px] font-semibold">
            Deduction List
          </span>
        </div>

        <div>
          <CustomButton
            title="Add Incentive/Deduction"
            loading={loading}
            onClick={() => addIncentiveDeduction()}
          />
        </div>
      </div>

      <div className="">
        <table className="w-full text-center">
          <thead className="">
            <tr>
              {headList?.map((head, i) => (
                <th key={i} className="bg-[#F8F9FA] p-4">
                  <Typography
                    variant="small"
                    // color='blue-gray'
                    className="font-medium leading-none font-Urbanist text-[14px] text-[#474747] capitalize"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {allDeductList.length > 0 ? (
              allDeductList?.map((data, index) => {
                const isLast = index === allDeductList.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-[#F2F2F9]";

                return (
                  <tr key={index}>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        // color='blue-gray'
                        className="font-normal font-Urbanist text-[14px] text-[#474747]"
                      >
                        {index + 1}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography
                        variant="small"
                        // color='blue-gray'
                        className="font-normal font-Urbanist text-[14px] text-[#474747]"
                      >
                        {data.title}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography
                        variant="small"
                        // color='blue-gray'
                        className="font-normal font-Urbanist text-[14px] text-[#474747]"
                      >
                        {(() => {
                          console.log(
                            "DeductionList - data.status:",
                            data.status,
                            "type:",
                            typeof data.status
                          );
                          // Based on API response: status "ACTIVE" = Active, status "INACTIVE" = In-active
                          return data.status === "ACTIVE"
                            ? "Active"
                            : "In-active";
                        })()}
                      </Typography>
                    </td>

                    <td className={classes}>
                      <Typography
                        variant="small"
                        // color='blue-gray'
                        className="font-normal cursor-pointer font-Urbanist text-[14px] text-[#474747]"
                      >
                        <div className="flex gap-4 justify-center">
                          <div>
                            <FaPencilAlt
                              className="text-green-500"
                              onClick={() => openEditIncent(data)}
                            />
                          </div>

                          {/* Tooba */}
                          {/* Delete in Real time */}
                          <div>
                            <FaTimes
                              className="text-red-500"
                              onClick={() => handleDialogDelIncent(data)}
                            />
                          </div>
                        </div>
                      </Typography>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={headList.length}
                  className="p-2 text-center font-normal font-Urbanist text-[12px] text-[#474747]"
                >
                  No record found
                </td>
              </tr>
            )}
          </tbody>
          <ConfirmationDialog
            openDialog={openDialogDelIncent}
            handleOpen={handleDialogDelIncent}
            title="Confirm Cancellation"
            message="Are you sure to delete this incentive?"
            loading={loading}
            handleConfirm={() => handleDeleteInc()}
            showBtns={false}
          />
        </table>
      </div>
    </div>
  );
};

export default DeductionList;
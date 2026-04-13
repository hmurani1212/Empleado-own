import { Button, Option, Select, Typography } from "@material-tailwind/react";
import React from "react";
import useHire from "../../ViewModel/HireViewModel/HireServices";
import { FaEye } from "react-icons/fa";
import { Outlet, useLocation } from "react-router";
import useHire_2 from "../../ViewModel/HireViewModel2/hireServices_2";
import { formatTimestamp } from "../Branches/utils";
import useStore from "../../Store/store";
import { RejectedTableSkeleton } from "./HireSkeletons";
const Rejected = () => {
  const { get_rejected_app_data, handleNavigateView } =
    useHire();
  const rejectedApplicantsLoading = useStore(
    (state) => state.rejectedApplicantsLoading
  );
  // const { get_applicants_data } = useHire_2();

  //console.log("get_rejected_app_data:", get_rejected_app_data)
  const rejectData = [
    "App ID",
    "Candidate",
    "Rejected On",
    "Rejected By",
    "Rejection Reason",
    "Action",
  ];
  const location = useLocation();
  const application_type = "rejected";
  return (
    <>
      <div className="pl-2 flex flex-col gap-3">
        {location.pathname.includes("view_detail") ? (
          <div className="pt-[12px] px-[30px]">
            <Outlet />
          </div>
        ) : (
          <div className="bg-white rounded-[10px] drop-shadow-md p-2">
            <div className="min-h-[calc(100vh-100px)] overflow-auto customScroll">
              <table className="w-full text-center">
                <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
                  <tr>
                    {rejectData?.map((head, i) => (
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
                  {rejectedApplicantsLoading ? (
                    <RejectedTableSkeleton rows={8} />
                  ) : get_rejected_app_data && get_rejected_app_data.length > 0 ? (
                    get_rejected_app_data.map((hire, index) => {
                      const isLast = index === get_rejected_app_data.length - 1;
                      const classes = isLast
                        ? "p-4"
                        : "p-4 border-b border-[#F2F2F9]";

                      return (
                        <tr key={index}>
                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                            >
                              {hire.app_id || hire.id || "N/A"}
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                            >
                              {hire.candidate_name || hire.name || "N/A"}
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                            >
                              {hire.timestamp
                                ? formatTimestamp(hire.timestamp).split(
                                    ","
                                  )[0] +
                                  "," +
                                  formatTimestamp(hire.timestamp).split(",")[1]
                                : "N/A"}
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                            >
                              {hire.rejected_by || "N/A"}
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Typography
                              // variant="small"
                              // color="blue-gray"
                              className="font-normal text-[#474747] font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap capitalize"
                            >
                              {hire.reject_reason || "N/A"}
                            </Typography>
                          </td>

                          <td className={classes}>
                            <Button
                              className="bg-white border-2 border-[#8bc9f8] text-[#9b9b9b] px-[14px] py-[8px]"
                              onClick={() => {
                                // console.log("Clicking App Detail for hire:", hire);
                                handleNavigateView({ application_type, hire });
                              }}
                            >
                              App Detail
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center">
                        <Typography variant="small" color="blue-gray">
                          No rejected applications found
                        </Typography>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Rejected;

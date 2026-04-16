import { Button, Option, Select, Typography } from "@material-tailwind/react";
import React from "react";
import useHire from "../../ViewModel/HireViewModel/HireServices";
import { FaEye } from "react-icons/fa";
import { Outlet, useLocation, useParams } from "react-router";
import useHire_2 from "../../ViewModel/HireViewModel2/hireServices_2";
import { formatTimestamp } from "../Branches/utils";
import useStore from "../../Store/store";
import { RejectedTableSkeleton } from "./HireSkeletons";
const Rejected = () => {
  const { get_rejected_app_data, handleNavigateView, get_rejected_app, rejectedPaginationData } =
    useHire();
  const { vacancyId } = useParams();

  const goToRejectedPage = (page) => {
    get_rejected_app({ vacancy_id: vacancyId, page });
  };
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
          <>
          <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
            <div className="min-h-[calc(100vh-100px)] overflow-auto customScroll">
              <table className="w-full text-left">
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
                        <tr key={index} className="hover:bg-brand-50/30 transition-colors">
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
                              className="flex items-center gap-2 capitalize font-normal text-[clamp(10px,0.9vw,12px)] bg-[#EFF8FF] border border-[#3da5f4] text-[#3da5f4] px-[10px] py-[5px] cursor-pointer"
                              variant="outlined"
                              onClick={() => {
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

          {/* Pagination */}
          {!rejectedApplicantsLoading && get_rejected_app_data?.length > 0 && rejectedPaginationData?.totalRecords > 10 && (
            <div className="w-full flex justify-center items-center gap-1 mt-4 mb-2">
              {rejectedPaginationData.currentPage > 1 ? (
                <button className="px-3 py-2 cursor-pointer text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1" onClick={() => goToRejectedPage(rejectedPaginationData.currentPage - 1)}>
                  <span>‹</span><span>Previous</span>
                </button>
              ) : (
                <div className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-gray-400 cursor-not-allowed flex items-center gap-1"><span>‹</span><span>Previous</span></div>
              )}
              <div className="flex items-center gap-1">
                {(() => {
                  const { currentPage, totalPages } = rejectedPaginationData;
                  const pages = totalPages <= 10
                    ? Array.from({ length: totalPages }, (_, i) => i + 1)
                    : (() => {
                        const p = [1];
                        if (currentPage > 3) p.push('…');
                        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) p.push(i);
                        if (currentPage < totalPages - 2) p.push('…');
                        p.push(totalPages);
                        return p;
                      })();
                  return pages.map((page, i) =>
                    typeof page === 'string' ? (
                      <span key={i} className="px-2 text-[clamp(12px,1vw,14px)] text-[#1a73e8]">{page}</span>
                    ) : (
                      <button key={page} onClick={() => goToRejectedPage(page)}
                        className={`px-3 py-1.5 cursor-pointer text-[clamp(12px,1vw,14px)] rounded transition-colors ${page === currentPage ? 'bg-[#1a73e8] text-white font-medium' : 'text-[#1a73e8] hover:bg-gray-100'}`}>
                        {page}
                      </button>
                    )
                  );
                })()}
              </div>
              {rejectedPaginationData.currentPage < rejectedPaginationData.totalPages ? (
                <button className="px-3 py-2 cursor-pointer text-[clamp(12px,1vw,14px)] text-[#1a73e8] hover:bg-gray-100 rounded transition-colors flex items-center gap-1" onClick={() => goToRejectedPage(rejectedPaginationData.currentPage + 1)}>
                  <span>Next</span><span>›</span>
                </button>
              ) : (
                <div className="px-3 py-2 text-[clamp(12px,1vw,14px)] text-gray-400 cursor-not-allowed flex items-center gap-1"><span>Next</span><span>›</span></div>
              )}
            </div>
          )}
          </>
        )}
      </div>
    </>
  );
};

export default Rejected;

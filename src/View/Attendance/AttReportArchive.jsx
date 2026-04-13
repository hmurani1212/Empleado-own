import React, { useEffect } from "react";
import useAttendance from "../../ViewModel/AttendanceViewModel/AttendanceServices";
import CustomButton from "../../Components/CustomButton/CustomButton";
import { useNavigate } from "react-router";
import { Typography } from "@material-tailwind/react";
import useSocket from "../../Components/useSocket/useSocket";
import { showToast } from "../../Components/Toaster/Toaster";
import { formatTimestampToDate } from "../../services/__dateTimeServices";
const ARCHIVE_TABLE_COLS = 7;

/** Skeleton rows for ATT Report Archive table (matches Branch … Download columns). */
const AttReportArchiveTableBodySkeleton = () => (
  <>
    {[1, 2, 3, 4, 5, 6].map((row) => (
      <tr key={row} className="border-b border-[#F2F2F9] animate-pulse">
        {Array.from({ length: ARCHIVE_TABLE_COLS }).map((_, col) => (
          <td key={col} className="p-4 text-center">
            <div className="h-4 bg-gray-100 rounded-md w-full max-w-[140px] mx-auto" />
          </td>
        ))}
      </tr>
    ))}
  </>
);

// import useBranches  from "....."
const AttReportArchive = () => {
  const { allAttArchiveReport, attArchiveReportLoading, gettingAttReportArchive } =
    useAttendance();
  const navigate = useNavigate();
  const { socketIoRef } = useSocket();

  // Call API when component mounts to get updated data
  useEffect(() => {
    // if (!allAttArchiveReport || allAttArchiveReport.length === 0) {
    gettingAttReportArchive();
    // }
  }, []);

  // Listen for attendance_report_ready socket event
  useEffect(() => {
    if (!socketIoRef.current) return;

    const handleAttendanceReportReady = (data) => {
      // Show success notification
      showToast("New attendance report is ready for download!", "success");

      // Refresh the archive list to show the new report
      // gettingAttReportArchive();
    };

    // Add listener
    socketIoRef.current.on(
      "attendance_report_ready",
      handleAttendanceReportReady
    );

    // Cleanup listener on unmount
    return () => {
      if (socketIoRef.current) {
        socketIoRef.current.off(
          "attendance_report_ready",
          handleAttendanceReportReady
        );
      }
    };
  }, [socketIoRef]);
  const handleDownload = (ele) => {
    if (!ele.elephant_url) {
      alert("Download URL not available");
      return;
    }

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = ele.elephant_url;
    /// link.target = '_blank'; // Open in new tab as fallback
    link.rel = "noopener noreferrer"; // Security best practice

    // Generate a meaningful filename based on the report data
    const timestamp = new Date(parseInt(ele.timestamp) * 1000)
      .toISOString()
      .split("T")[0];
    const filename = `${ele.report_type}_${ele.export_type}_${timestamp}.xlsx`;
    link.download = filename;

    // Add to DOM, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const titleAtt = [
    "Branch",
    "Department",
    "Report About",
    "Report Type",
    "Report For",
    "Generated",
    "Download",
  ];
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <div>
            <span className="text-[#3da5f4] font-semibold">
              ATT Report Archive
            </span>
          </div>
          <div>
            <CustomButton
              onClick={() => navigate("/attendance")}
              title="Back"
            />
          </div>
        </div>

        <div className="bg-white rounded-[10px] drop-shadow-md p-2">
          <div className="max-h-[calc(100vh-100px)] overflow-auto customScroll">
            <table className="w-full text-center">
              <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
                <tr className="bg-[#F8F9FA] rounded-[8px]">
                  {titleAtt.map((head, i) => (
                    <th key={i} className="bg-[#F8F9FA] p-4 text-center">
                      <Typography
                        variant="small"
                        // color='blue-gray'
                        className="font-medium leading-none font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] capitalize text-center"
                      >
                        {head}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {attArchiveReportLoading ? (
                  <AttReportArchiveTableBodySkeleton />
                ) : (
                  allAttArchiveReport.map((ele, index) => {
                  const isLast = index === allAttArchiveReport.length - 1;
                  const classes = isLast
                    ? "p-4 text-center"
                    : "p-4 border-b border-[#F2F2F9] text-center";

                  return (
                    <tr key={index}>
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] text-center"
                        >
                          {ele.branch_name || "No Branch"}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] text-center"
                        >
                          {ele.deptt_name || "No Dep"}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] text-center"
                        >
                          {ele.report_type}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] text-center"
                        >
                          {ele.export_type}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] text-center"
                        >
                          {`${ele.rep_month}-${ele.rep_year}`}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal font-Urbanist text-[clamp(12px,0.9vw,14px)] whitespace-nowrap text-[#474747] text-center"
                        >
                          {formatTimestampToDate(ele.timestamp)}
                        </Typography>
                      </td>

                      {/* Download */}
                      <td className={classes}>
                        <Typography
                          variant="small"
                          className="font-normal cursor-pointer text-center text-bgBlue font-Urbanist text-[14px]hover:underline hover:text-blue-700"
                          onClick={() => handleDownload(ele)}
                        >
                          Download
                        </Typography>
                      </td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AttReportArchive;
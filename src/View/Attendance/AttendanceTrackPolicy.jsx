import React, { useEffect } from "react";
import { Typography } from "@material-tailwind/react";
import useStore from "../../Store/store";
import useTrackPolicy from "../../ViewModel/AttendanceViewModel/trackPolicyServices";
import { showToast } from "../../Components/Toaster/Toaster";

const tableHeader = ["#", "Date", "Policy"];

// Format date function - handles both DD-MM-YYYY and standard date formats
const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  let date;
  // Check if date is in DD-MM-YYYY format
  if (dateString.includes("-") && dateString.split("-").length === 3) {
    const parts = dateString.split("-");
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    // Create date object (month is 0-indexed in JavaScript Date)
    date = new Date(year, month - 1, day);
  } else {
    // Try to parse as standard date format
    date = new Date(dateString);
  }

  // Validate date
  if (isNaN(date.getTime())) {
    // If parsing failed, try using calendar_date format if available
    return dateString || "N/A";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();
  return `${day}, ${month} ${year}`;
};

const AttendanceTrackPolicy = () => {
  const trackPolicyParams = useStore((state) => state.trackPolicyParams);
  const calendarData = useStore((state) => state.calendarData);
  const { trackPolicyValue, getTrackPolicy, handleTrackPolicyOpen } =
    useTrackPolicy();

  const trackPolicyData = trackPolicyValue?.trackPolicyData || [];

  // Initialize component with stored params on mount
  useEffect(() => {
    if (trackPolicyParams?.empId?.value) {
      // Initialize state and fetch data with stored params
      handleTrackPolicyOpen({
        empId: trackPolicyParams.empId,
        month: trackPolicyParams.month,
        year: trackPolicyParams.year,
      });
    } else if (calendarData?.attendance && calendarData.attendance.length > 0) {
      // If calendarData exists but params don't, try to extract anyway
      getTrackPolicy();
    } else {
      showToast(
        "No employee selected. Please view an employee's attendance first.",
        "info"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Re-extract data when calendarData changes (when attendance is loaded)
  useEffect(() => {
    if (calendarData?.attendance && calendarData.attendance.length > 0) {
      // Re-extract track policy data when attendance data becomes available
      // Use a small delay to ensure state is ready
      const timer = setTimeout(() => {
        getTrackPolicy();
      }, 100);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarData?.attendance]);

  return (
    <div>
      <div className="bg-white rounded-[10px] drop-shadow-md p-2">
        <div className="relative w-full overflow-auto customScroll">
          {trackPolicyValue?.loading && (
            <div className="text-center py-8">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal"
              >
                Loading...
              </Typography>
            </div>)}
          <table className="min-w-full table-fixed text-center">
            <colgroup>
              <col style={{ width: '33%' }} />
              <col style={{ width: '33%' }} />
              <col style={{ width: '33%' }} />
            </colgroup>
            <thead className="sticky top-[0px] z-20 bg-[#F8F9FA] rounded-[8px]">
              <tr>
                {tableHeader?.map((head, i) => (
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
              {trackPolicyData?.length > 0 ? (
                trackPolicyData?.map((ele, index) => {
                  const isLast = index === trackPolicyData?.length - 1;
                  const classes = isLast ? "px-[clamp(4px,0.8vw,12px)] py-4"
                    : "px-[clamp(4px,0.8vw,12px)] py-4 border-b border-[#F2F2F9]";
                  // Get policy value - show null if policy is null, "0", or empty
                  const policyValue = ele.policy || ele["policy"] || null;
                  const displayPolicy =
                    policyValue === null ||
                      policyValue === "0" ||
                      policyValue === 0
                      ? "null"
                      : String(policyValue);

                  // Determine color based on attendance label
                  const getPolicyColor = () => {
                    if (displayPolicy === "null") {
                      return "text-gray-400";
                    }
                    const attLabel = ele.att_label || ele["att_label"];
                    if (attLabel === "A") {
                      return "text-red-600";
                    } else if (attLabel === "H") {
                      return "text-yellow-600";
                    } else if (attLabel === "MAL") {
                      return "text-purple-600";
                    }
                    return "text-blue-500"; // Default color for other statuses
                  };

                  return (
                    <tr key={index} className="text-[#474747]">
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {index + 1}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist"
                        >
                          {formatDate(ele.date)}
                        </Typography>
                      </td>
                      <td className={classes}>
                        <Typography
                          // variant="small"
                          // color="blue-gray"
                          className={`font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist ${getPolicyColor()}`}
                        >
                          {displayPolicy}
                        </Typography>
                      </td>
                    </tr>
                  );
                }))
                : <tr>
                  <td colSpan={tableHeader.length} className="p-6 text-center">
                    <span className="font-Urbanist text-[12px] text-[#474747]">
                      No record found
                    </span>
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTrackPolicy;
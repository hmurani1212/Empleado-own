import { Typography } from "@material-tailwind/react";
import React, { useEffect } from "react";
import useEmpDashboard from "../../ViewModel/EmpViewModel/EmpDashboardViewModel/EmpDashboardServices";
import { CiCalendar } from "react-icons/ci";

const LateMinutes = () => {
  const { empDashboardData } = useEmpDashboard();
  const attendanceHistory = empDashboardData?.attendance_history;
  console.log('attendanceHistory', attendanceHistory)

  function formatFromTimestamp(seconds) {
    const date = new Date(seconds * 1000); // seconds → ms
  
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  function formatUnixTime(tsSeconds, timeZone = "Asia/Karachi") {
    const d = new Date(tsSeconds * 1000);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone,
    }).format(d);
  };

  function secondsToHoursLabel(seconds) {
    const hrs = Number(seconds) / 3600;
    const rounded = Math.round(hrs * 10) / 10; // 1 decimal (e.g., 6.5)
    return `${rounded} hrs`;
  };

  function overtimeSecondsToLabel(seconds) {
    const s = Math.max(0, Math.floor(Number(seconds) || 0));
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
  
    const parts = [];
    if (hrs) parts.push(`${hrs} hrs`);
    if (mins || !hrs) parts.push(`${mins} min`); // show minutes if hours is 0
  
    return parts.join(" ");
  };

  const tableHeader = [
    "Date",
    "In Time",
    "Out Time",
    "Late Minutes",
  ];

  return (
    <div className="w-full h-[calc(100vh-58px)] overflow-x-auto">
    <table className="text-center w-full">
      <thead className="sticky top-[-9px]">
        <tr>
          {tableHeader?.map((head, i) => (
            <th key={i} className="bg-[#F8F9FA] py-4 px-2 whitespace-nowrap">
              <Typography
                variant="small"
                color="#292929"
                className="font-medium leading-none opacity-80 font-Urbanist capitalize"
              >
                {head}
              </Typography>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {attendanceHistory?.length > 0 ? (
          attendanceHistory.map((item, index) => (
            <tr key={item.id || index} className="hover:bg-gray-50">
              <td className="p-4 border-b border-gray-200">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal"
                >
                  {item.date}
                </Typography>
              </td>
              <td className="p-4 border-b border-gray-200">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal"
                >
                  {item.timings?.[0] ? formatUnixTime(item.timings[0]) : "--"}
                </Typography>
              </td>
              <td className="p-4 border-b border-gray-200">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal"
                >
                  {item.timings?.[1] ? formatUnixTime(item.timings[1]) : "--"}
                </Typography>
              </td>
              <td className="p-4 border-b border-gray-200">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal"
                >
                  {item?.late_minutes || item?.adjusted_late_min || "-"}
                </Typography>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={tableHeader.length}
              className="p-8 text-center text-gray-500"
            >
              No late minutes history found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
    // <div className="max-w-full h-[calc(100vh-58px)] overflow-x-hidden">
    //   <div className="py-2">
    //     {attendanceHistory?.map((item, index) => (
    //       <div key={index} className="border-b border-gray-300 space-y-2 py-2">
    //         <div className="flex items-center gap-2">
    //             <CiCalendar className="text-[50px] text-customGray-blueGray" />
    //             <span className="text-sm font-medium">{formatFromTimestamp(item.date)}</span>
    //         </div>
    //         <div className="grid grid-cols-3 gap-4">
    //             <div className="flex flex-col items-center justify-center">
    //                 <span className="text-[13px] font-normal">In Time</span>
    //                 <span className="text-[13px] font-medium">{formatUnixTime(item.timings[0]) || '--'}</span>
    //             </div>
    //             <div className="flex flex-col items-center justify-center">
    //                 <span className="text-[13px] font-normal">Out Time</span>
    //                 <span className="text-[13px] font-medium">{formatUnixTime(item?.timings[1]) || '--'}</span>
    //             </div>
    //             <div className="flex flex-col items-center justify-center">
    //                 <span className="text-[13px] font-normal">Earned Hours</span>
    //                 <span className="text-[13px] font-medium">{secondsToHoursLabel(item?.earned) || 0}</span>
    //             </div>
    //             <div className="flex flex-col items-center justify-center">
    //                 <span className="text-[13px] font-normal">Overtime</span>
    //                 <span className="text-[13px] font-medium">{overtimeSecondsToLabel(item?.overtime) || 0}</span>
    //             </div>
    //             <div className="flex flex-col items-center justify-center">
    //                 <span className="text-[13px] font-normal">Late Minutes</span>
    //                 <span className="text-[13px] font-medium">{item.late_minutes || 0}</span>
    //             </div>
    //         </div>
    //       </div>
    //     ))}
    //   </div>
    // </div>
  );
};

export default LateMinutes;
import { Typography } from "@material-tailwind/react";
import React, { useMemo } from "react";
import useEmpDashboard from "../../ViewModel/EmpViewModel/EmpDashboardViewModel/EmpDashboardServices";

const LateMinutes = () => {
  const { empDashboardData } = useEmpDashboard();
  const attendanceHistory = empDashboardData?.attendance_history;
  const attendanceRows = empDashboardData?.attendance_detail?.attendance || [];
  const earlyLeaveSummaryDays = Array.isArray(empDashboardData?.early_leave_summary?.days)
    ? empDashboardData.early_leave_summary.days
    : [];

  function formatUnixTime(tsSeconds, timeZone = "Asia/Karachi") {
    const d = new Date(tsSeconds * 1000);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone,
    }).format(d);
  };

  const toMinutes = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.floor(n);
  };

  const toDdMmYyyy = (raw) => {
    if (raw == null || raw === "") return "";

    // already dd-mm-yyyy
    if (typeof raw === "string" && /^\d{2}-\d{2}-\d{4}$/.test(raw.trim())) {
      return raw.trim();
    }

    // yyyy-mm-dd -> dd-mm-yyyy
    if (typeof raw === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
      const [y, m, d] = raw.trim().split("-");
      return `${d}-${m}-${y}`;
    }

    // unix seconds / ms or Date-parseable string
    const num = Number(raw);
    let dateObj = null;
    if (Number.isFinite(num) && num > 0) {
      dateObj = new Date(num > 1e12 ? num : num * 1000);
    } else {
      const parsed = new Date(raw);
      if (!Number.isNaN(parsed.getTime())) dateObj = parsed;
    }
    if (!dateObj || Number.isNaN(dateObj.getTime())) return "";
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const yyyy = dateObj.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const earlyLeaveByDate = useMemo(() => {
    const map = new Map();
    earlyLeaveSummaryDays.forEach((row) => {
      if (!row) return;
      const key = toDdMmYyyy(row.date_string || row.date);
      if (!key) return;
      const minutes =
        Number(row.early_leave_minutes ?? row.early_minutes ?? row.minutes ?? row.total_early_leave_minutes) || 0;
      map.set(key, Math.max(0, Math.floor(minutes)));
    });
    return map;
  }, [earlyLeaveSummaryDays]);

  const attendanceByDate = useMemo(() => {
    const map = new Map();
    attendanceRows.forEach((row) => {
      const key = toDdMmYyyy(row?.date_string || row?.date);
      if (!key) return;
      map.set(key, row);
    });
    return map;
  }, [attendanceRows]);

  const displayRows = useMemo(() => {
    const rowsMap = new Map();

    if (Array.isArray(attendanceHistory) && attendanceHistory.length > 0) {
      attendanceHistory.forEach((row) => {
        const key = toDdMmYyyy(row?.date);
        if (!key) return;
        rowsMap.set(key, {
          ...row,
          id: row?.id ?? key,
          date: key,
          timings: Array.isArray(row?.timings) ? row.timings : [],
          late_minutes: row?.late_minutes ?? 0,
          adjusted_late_min: row?.adjusted_late_min ?? 0,
          early_leave_minutes: row?.early_leave_minutes ?? 0,
        });
      });
    } else {
      attendanceRows.forEach((row) => {
        const key = toDdMmYyyy(row?.date_string || row?.date);
        if (!key) return;
        const hasLate = toMinutes(row?.late_minutes) > 0 || toMinutes(row?.adjusted_late_min) > 0;
        const hasEarlyFromSummary = earlyLeaveByDate.has(key) && toMinutes(earlyLeaveByDate.get(key)) > 0;
        if (!hasLate && !hasEarlyFromSummary) return;
        rowsMap.set(key, {
          id: row?.id ?? key,
          date: key,
          timings: Array.isArray(row?.timings) ? row.timings : [],
          late_minutes: row?.late_minutes ?? 0,
          adjusted_late_min: row?.adjusted_late_min ?? 0,
          early_leave_minutes: hasEarlyFromSummary ? earlyLeaveByDate.get(key) : (row?.early_leave_minutes ?? 0),
        });
      });
    }

    earlyLeaveByDate.forEach((minutes, dateKey) => {
      const existing = rowsMap.get(dateKey);
      if (existing) {
        rowsMap.set(dateKey, { ...existing, early_leave_minutes: minutes });
        return;
      }
      const attendanceForDate = attendanceByDate.get(dateKey);
      rowsMap.set(dateKey, {
        id: attendanceForDate?.id ?? dateKey,
        date: dateKey,
        timings: Array.isArray(attendanceForDate?.timings) ? attendanceForDate.timings : [],
        late_minutes: attendanceForDate?.late_minutes ?? 0,
        adjusted_late_min: attendanceForDate?.adjusted_late_min ?? 0,
        early_leave_minutes: minutes,
      });
    });

    return Array.from(rowsMap.values()).sort((a, b) => {
      const [ad, am, ay] = String(a?.date || "").split("-").map(Number);
      const [bd, bm, by] = String(b?.date || "").split("-").map(Number);
      const aTime = new Date(ay || 0, (am || 1) - 1, ad || 1).getTime();
      const bTime = new Date(by || 0, (bm || 1) - 1, bd || 1).getTime();
      return aTime - bTime;
    });
  }, [attendanceHistory, attendanceRows, earlyLeaveByDate, attendanceByDate]);

  return (
    <div className="w-full h-[calc(100vh-58px)] overflow-x-auto">
    <table className="text-center w-full">
      <thead className="sticky top-[-9px]">
        <tr>
          <th rowSpan={2} className="bg-[#F8F9FA] py-4 px-2 whitespace-nowrap">
            <Typography
              variant="small"
              color="#292929"
              className="font-medium leading-none opacity-80 font-Urbanist capitalize"
            >
              Date
            </Typography>
          </th>
          <th rowSpan={2} className="bg-[#F8F9FA] py-4 px-2 whitespace-nowrap">
            <Typography
              variant="small"
              color="#292929"
              className="font-medium leading-none opacity-80 font-Urbanist capitalize"
            >
              In Time
            </Typography>
          </th>
          <th rowSpan={2} className="bg-[#F8F9FA] py-4 px-2 whitespace-nowrap">
            <Typography
              variant="small"
              color="#292929"
              className="font-medium leading-none opacity-80 font-Urbanist capitalize"
            >
              Out Time
            </Typography>
          </th>
          <th colSpan={2} className="bg-[#F8F9FA] py-2 px-2 whitespace-nowrap">
            <Typography
              variant="small"
              color="#292929"
              className="font-medium leading-none opacity-80 font-Urbanist capitalize"
            >
              Type
            </Typography>
          </th>
        </tr>
        <tr>
          <th className="bg-[#F8F9FA] py-2 px-2 whitespace-nowrap">
            <Typography
              variant="small"
              color="#292929"
              className="font-medium leading-none opacity-80 font-Urbanist capitalize"
            >
              Early
            </Typography>
          </th>
          <th className="bg-[#F8F9FA] py-2 px-2 whitespace-nowrap">
            <Typography
              variant="small"
              color="#292929"
              className="font-medium leading-none opacity-80 font-Urbanist capitalize"
            >
              Late
            </Typography>
          </th>
        </tr>
      </thead>
      <tbody>
        {displayRows?.length > 0 ? (
          displayRows.map((item, index) => (
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
                  {(() => {
                    const dateKey = toDdMmYyyy(item?.date);
                    const mapped = dateKey ? earlyLeaveByDate.get(dateKey) : null;
                    if (mapped != null) return mapped;
                    return toMinutes(item?.early_leave_minutes);
                  })()}
                </Typography>
              </td>
              <td className="p-4 border-b border-gray-200">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal"
                >
                  {toMinutes(item?.late_minutes)}
                </Typography>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={5}
              className="p-8 text-center text-gray-500"
            >
              No bucket history found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
  );
};

export default LateMinutes;
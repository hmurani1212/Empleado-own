import React, { useEffect } from "react";
import { Typography } from "@material-tailwind/react";
import { secondsToHoursMinutes } from "../../services/__attendanceDataFormatter";
import AttendanceLoading from "./AttendanceLoading";
import { IoIosTime } from "react-icons/io";
import {
  BsFileEarmarkCheckFill,
  BsGraphUp,
  BsGraphUpArrow,
} from "react-icons/bs";
import { ImParagraphRight } from "react-icons/im";
import { FaCalendarAlt } from "react-icons/fa";
import { RiUserFollowFill } from "react-icons/ri";

const AttendanceSummary = ({ attendanceData }) => {
  // Default values when no data is available
  const defaultValues = {
    total: 0,
    expected_working_days: 0,
    earned_working_days: 0,
    earned: 0,
    overtime: 0,
    percentage: "0.00",
    ot_percentage: "0.00",
    summary: {
      expectedHours: 0,
      completedHours: 0,
      overtimeHours: 0,
      present_days: 0,
      absentees: 0,
      holidays: 0,
    },
  };

  // Use data if available, otherwise use default values
  const attendanceAttr = attendanceData?.attendanceAttr || defaultValues;
  const summary = attendanceAttr?.summary || defaultValues.summary;

  const data = attendanceAttr?.attendance || [];
  useEffect(() => {
    console.log("attendanceData in AttendanceSummary:", attendanceAttr);
  });

  const summary_late_minut = data.reduce(
    (acc, d) => {
      acc.late_minutes += d.late_minutes;
      return acc;
    },
    { late_minutes: 0 }
  );

  // console.log(summary_late_minut);
  // Output: { totalExpected: 61200, totalEarned: 0 }

  return (
    <>
      {attendanceAttr?.last_policy?.payroll !== "TWO" ? (
        <div className="space-y-4 py-4">
          {/* Main Summary */}
          <div className="grid grid-cols-2 gap-2 space-y-2">
            <div className="flex items-center gap-2 select-text">
              <div className="w-[32px] h-[32px] flex items-center justify-center bg-bgBlue rounded-full text-white p-2">
                <IoIosTime className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-[#474747] font-light text-[12px] font-Urbanist">
                  Expected Hours
                </span>
                <span className="font-medium font-Urbanist text-[14px] text-[#474747]">
                  {secondsToHoursMinutes(attendanceAttr.total || 0)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 select-text">
              <div className="w-[32px] h-[32px] flex items-center justify-center bg-bgBlue rounded-full text-white p-2">
                <BsFileEarmarkCheckFill className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-[#474747] font-light text-[12px] font-Urbanist">
                  Earned Hours
                </span>
                <span className="font-medium font-Urbanist text-[14px] text-[#474747]">
                  {secondsToHoursMinutes(attendanceAttr.earned || 0)}
                </span>
              </div>
            </div>
            <div className="border border-dashed border-gray-200 w-full col-span-2"></div>
            <div className="flex items-center gap-2 select-text">
              <div className="w-[32px] h-[32px] flex items-center justify-center bg-bgBlue rounded-full text-white p-2">
                <ImParagraphRight className="w-full h-full rotate-90" />
              </div>
              <div className="flex flex-col">
                <span className="text-[#474747] font-light text-[12px] font-Urbanist">
                  Overtime
                </span>
                <span className="font-medium font-Urbanist text-[14px] text-[#474747]">
                  {secondsToHoursMinutes(attendanceAttr.overtime || 0)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 select-text text-red-500">
              <div className="w-[32px] h-[32px] flex items-center justify-center bg-bgBlue rounded-full text-white p-2">
                <FaCalendarAlt className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-[#474747] font-light text-[12px] font-Urbanist">
                  Late Minutes
                </span>
                <span className="font-medium font-Urbanist text-[14px] text-[#474747]">
                  {summary_late_minut?.late_minutes || 0}m
                </span>
              </div>
            </div>
            <div className="border border-dashed border-gray-200 w-full col-span-2"></div>
            <div className="flex items-center gap-2 select-text">
              <div className="w-[32px] h-[32px] flex items-center justify-center bg-bgBlue rounded-full text-white p-2">
                <RiUserFollowFill className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-[#474747] font-light text-[11px] font-Urbanist">
                  Attendance Percentage
                </span>
                <span className="font-medium font-Urbanist text-[14px] text-[#474747]">
                  {attendanceAttr.percentage || 0}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 select-text">
              <div className="w-[32px] h-[32px] flex items-center justify-center bg-bgBlue rounded-full text-white p-2">
                <BsGraphUpArrow className="w-full h-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-[#474747] font-light text-[12px] font-Urbanist">
                  Overtime Percentage
                </span>
                <span className="font-medium font-Urbanist text-[14px] text-[#474747]">
                  {Number(attendanceAttr?.ot_percentage) || 0}%
                </span>
              </div>
            </div>
            <div className="border border-dashed border-gray-200 w-full col-span-2"></div>
          </div>

          {/* Additional Summary Details */}
          {summary && (
            <div className="space-y-2">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-semibold text-xs uppercase tracking-wide"
              >
                Additional Details
              </Typography>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center rounded-full border-[3px] border-[#0ACF97] w-[50px] h-[50px]">
                    <span className="font-medium text-[14px] text-[#474747] font-Urbanist">
                      {summary.present_days || 0}
                    </span>
                  </div>
                  <span className="text-[#474747] font-light text-[12px] font-Urbanist">
                    Present Days
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center rounded-full border-[3px] border-[#FF4979] w-[50px] h-[50px]">
                    <span className="font-medium text-[14px] text-red-500 font-Urbanist">
                      {summary.absentees || 0}
                    </span>
                  </div>
                  <span className="text-[#474747] font-light text-[12px] font-Urbanist">
                    Absentees
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center rounded-full border-[3px] border-[#FED406] w-[50px] h-[50px]">
                    <span className="font-medium text-[14px] text-[#474747] font-Urbanist">
                      {summary.holidays || 0}
                    </span>
                  </div>
                  <span className="text-[#474747] font-light text-[12px] font-Urbanist">
                    Holidays
                  </span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center justify-center rounded-full border-[3px] border-[#8770FF] w-[50px] h-[50px]">
                    <span className="font-medium text-[14px] text-[#474747] font-Urbanist">
                      {summary.leaveAvailed || 0}
                    </span>
                  </div>
                  <span className="text-[#474747] font-light text-[12px] font-Urbanist">
                    Leaves Availed
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border-b border-b-customGray-100 space-y-4 py-4">
          {/* Main Summary */}
          <div className="flex items-center justify-between select-text">
            <span className="text-customGray-100">Expected</span>
            <span className="font-medium">
              {attendanceAttr?.expected_working_days || 0} Days
            </span>
          </div>
          <div className="flex items-center justify-between select-text">
            <span className="text-customGray-100">Earned</span>
            <span className="font-medium">
              {attendanceAttr?.earned_working_days || 0} Days
            </span>
          </div>
          <div className="flex items-center justify-between select-text">
            <span className="text-customGray-100">Overtime</span>
            <span className="font-medium">
              {secondsToHoursMinutes(attendanceAttr?.overtime || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between select-text">
            <span className="text-customGray-100">Attendance Percentage</span>
            <span className="font-medium">
              {attendanceAttr?.percentage || 0}%
            </span>
          </div>
          <div className="flex items-center justify-between select-text">
            <span className="text-customGray-100">Overtime Percentage</span>
            <span className="font-medium">
              {Number(attendanceAttr?.ot_percentage) || 0}%
            </span>
          </div>
        </div>
      )}
    </>
  );
};

export default AttendanceSummary;
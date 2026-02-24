import React, { useEffect } from "react";
import { FaIdCardAlt } from "react-icons/fa";
import useExtraAttendanceServices from "../../ViewModel/AttendanceViewModel/extraAttendanceService";
import useStore from "../../Store/store";
import { showToast } from "../../Components/Toaster/Toaster";
import { formatTimestamp } from "../Branches/utils";
import formatTime from "../../services/__hrPoliciesServices";
import HRPolicyCards from "./HRPolicyCards";
import { IoIosTime } from "react-icons/io";
import { BsFileEarmarkCheckFill } from "react-icons/bs";
import { FaBarsProgress } from "react-icons/fa6";
import { BsGraphUpArrow } from "react-icons/bs";
import { FaCalendarAlt } from "react-icons/fa";

const iconMap = {
  pid: FaIdCardAlt,
  time: IoIosTime,
  status: BsFileEarmarkCheckFill,
  payroll: FaBarsProgress,
  overtime: BsGraphUpArrow,
  date: FaCalendarAlt,
};

const InfoItem = ({ label, value, Icon }) => (
  <div className="flex items-center gap-3">
    <div className="bg-[#EFF8FF] rounded-[7px] flex items-center justify-center w-[35px] h-[35px] shrink-0">
      <Icon className="text-bgBlue text-[18px]" />
    </div>
    <div className="flex flex-col leading-tight">
      <span className="text-[12px] text-[#474747] font-Urbanist font-semibold">
        {label}
      </span>
      <span className="text-[12px] font-medium text-[#474747] font-Urbanist">
        {value}
      </span>
    </div>
  </div>
);

const CurrentHRPolicy = () => {
  const { viewPolicy, viewPolicyData } = useExtraAttendanceServices();
  const lastHRPolicy = useStore((state) => state.lastHRPolicy);

  useEffect(() => {
    if (!lastHRPolicy?.id && !viewPolicy?.id) {
      showToast(
        "No HR Policy found. Please view an employee's attendance first.",
        "info"
      );
    }
  }, [lastHRPolicy?.id, viewPolicy?.id]);

  if (!viewPolicy?.id) {
    return (
      <div className="p-6 bg-white rounded-[10px] drop-shadow-md">
        <div className="flex items-center justify-center py-10">
          <p className="text-[#474747] text-[14px] font-Urbanist">
            No HR Policy data available. Please view an employee's attendance
            first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[10px] drop-shadow-md p-4">
      {/* Header */}
      <div className="px-4 py-2 font-Urbanist font-semibold text-bgBlue text-[16px]">
        {viewPolicy.policy_name}
      </div>

      {/* Info Grid */}
      <div className="border-t border-[#F2F2F9] mt-2 pt-4 px-4">
        <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
          <InfoItem label="PID" value={viewPolicy.id} Icon={iconMap.pid} />

          <InfoItem
            label="Timings"
            value={`${formatTime(viewPolicy.starting_time)} - ${formatTime(
              viewPolicy.closing_time
            )}`}
            Icon={iconMap.time}
          />

          <InfoItem
            label="Expiry"
            value={viewPolicy.status === "0" ? "Expiry" : "Valid"}
            Icon={iconMap.status}
          />

          <InfoItem
            label="Payroll Generation Type"
            value={
              viewPolicy.payroll === 1 || viewPolicy.payroll === "1"
                ? "Time Base"
                : viewPolicy.payroll === 2 || viewPolicy.payroll === "2"
                ? "Attendance Base"
                : viewPolicy.payroll === 3 || viewPolicy.payroll === "3"
                ? "Hourly Base"
                : "Unknown"
            }
            Icon={iconMap.payroll}
          />

          <InfoItem
            label="Overtime"
            value={viewPolicy.overtime_pay === "0" ? "Unpaid" : "Paid"}
            Icon={iconMap.overtime}
          />

          <InfoItem
            label="Created Date"
            value={formatTimestamp(viewPolicy.creation_time)}
            Icon={iconMap.date}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border border-dashed border-[#DDDDDD] my-6" />

      {/* Policy Cards */}
      <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4">
        {viewPolicyData?.map((item) => (
          <HRPolicyCards
            key={item.id}
            title={item.title}
            logo={item.icon}
            data={item.data}
          />
        ))}
      </div>
    </div>
  );
};

export default CurrentHRPolicy;
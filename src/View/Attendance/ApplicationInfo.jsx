import { Typography } from '@material-tailwind/react'
import React from 'react'
import useAttendance from '../../ViewModel/AttendanceViewModel/AttendanceServices'
import { formatTimestamp } from '../../services/__formApprovalServices'
import { FaUser, FaUserCheck, FaCalendar, FaFileAlt, FaUserEdit, FaEdit } from "react-icons/fa";

const ApplicationInfo = () => {
    const { individualRequestDetail } = useAttendance()
    const titleInfo = ['Approval Index', 'Approval Type', 'Approve By', 'Status', 'Last update time']

    function formatUnixToDate(unixTimestamp) {
        if (!unixTimestamp) return "N/A";
        // check if timestamp is in seconds, convert to ms
        if (unixTimestamp.toString().length === 10) {
            unixTimestamp = unixTimestamp * 1000;
        }

        const date = new Date(unixTimestamp);

        const day = date.getDate();
        const month = date.toLocaleString("en-US", { month: "short" });
        const year = date.getFullYear();

        return `${day} ${month}, ${year}`;
    }

    const converToSnakeCase = (str) => {
        if (!str) return "N/A";
        const snakeCase = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        return snakeCase;
    };

    return (
        <>
            <div className="bg-white  flex flex-col overflow-hidden">
                {/* Application Info Header */}
                {/* <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-[#3DA5F4] font-semibold text-lg">Application Info</h2>
                </div> */}

                {/* Application Info Content */}
                <div className="flex-1 overflow-y-auto">
                    {individualRequestDetail?.map((ele, index) => {
                        return (
                            <div key={index} className="flex flex-col">
                                <div className="px-6 py-5">
                                    <div className="flex flex-col gap-0">
                                        {/* Row 1: From, To, Emp ID */}
                                        <div className="grid grid-cols-3 gap-4 py-4 border-b border-dashed border-gray-300">
                                            {/* From */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                                    <FaUser className="text-[#3DA5F4] text-lg" />
                                                </div>
                                                <div className="flex flex-col items-start justify-start gap-1">
                                                    <span className="text-gray-600 font-normal text-sm">From:</span>
                                                    <span className="text-gray-800 font-Urbanist font-semibold text-sm">{ele.user_name || "N/A"}</span>
                                                </div>
                                            </div>

                                            {/* To */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                                    <FaUserCheck className="text-[#3DA5F4] text-lg" />
                                                </div>
                                                <div className="flex flex-col items-start justify-start gap-1">
                                                    <span className="text-gray-600 font-normal text-sm">To:</span>
                                                    <span className="text-gray-800 font-Urbanist font-semibold text-sm">Approval Flow</span>
                                                </div>
                                            </div>

                                            {/* Emp ID */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                                    <FaUser className="text-[#3DA5F4] text-lg" />
                                                </div>
                                                <div className="flex flex-col items-start justify-start gap-1">
                                                    <span className="text-gray-600 font-normal text-sm">Emp ID:</span>
                                                    <span className="text-gray-800 font-Urbanist font-semibold text-sm">{ele?.form_data?.emp_id || "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 2: Dated, Subject, Emp OneID */}
                                        <div className="grid grid-cols-3 gap-4 py-4 border-b border-dashed border-gray-300">
                                            {/* Dated */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                                    <FaCalendar className="text-[#3DA5F4] text-lg" />
                                                </div>
                                                <div className="flex flex-col items-start justify-start gap-1">
                                                    <span className="text-gray-600 font-normal text-sm">Dated:</span>
                                                    <span className="text-gray-800 font-Urbanist font-semibold text-sm">{ele?.entry_time?.slice(0, 10)}</span>
                                                </div>
                                            </div>

                                            {/* Subject */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                                    <FaFileAlt className="text-[#3DA5F4] text-lg" />
                                                </div>
                                                <div className="flex flex-col items-start justify-start gap-1">
                                                    <span className="text-gray-600 font-normal text-sm">Subject:</span>
                                                    <span className="text-gray-800 font-Urbanist font-semibold text-sm">Time Adjustment Request</span>
                                                </div>
                                            </div>

                                            {/* Emp OneID */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                                    <FaUserEdit className="text-[#3DA5F4] text-lg" />
                                                </div>
                                                <div className="flex flex-col items-start justify-start gap-1">
                                                    <span className="text-gray-600 font-normal text-sm">Emp OneID:</span>
                                                    <span className="text-gray-800 font-Urbanist font-semibold text-sm">{ele.one_id || "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Row 3: Reason (spanning full width) */}
                                        <div className="grid grid-cols-3 gap-4 py-4">
                                            {/* Reason - spans full width */}
                                            <div className="flex items-start gap-4 col-span-3">
                                                <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                                    <FaEdit className="text-[#3DA5F4] text-lg" />
                                                </div>
                                                <div className="flex flex-col items-start justify-start gap-1">
                                                    <span className="text-gray-600 font-normal text-sm">Reason:</span>
                                                    <span className="text-gray-800 font-Urbanist font-semibold text-sm leading-relaxed">{ele?.form_data?.reason || "N/A"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Approval List Section */}
                                <div className="px-6 pb-6 border-t border-gray-200">
                                    <h3 className="text-[#3DA5F4] font-semibold text-lg mb-4">Approval List</h3>
                                    <div className="bg-white rounded-[10px] drop-shadow-md p-2 w-full overflow-x-auto">
                                        <table className="w-[100%] min-w-max text-center">
                                            <thead className="sticky top-[-9px] bg-[#F8F9FA] rounded-[8px]">
                                                <tr>
                                                    {titleInfo.map((head, i) => (
                                                        <th
                                                            key={i}
                                                            className="py-4 px-2"
                                                        >
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
                                                {ele && ele.approval_members && ele.approval_members.length > 0 ? (
                                                    ele.approval_members.map((member, index) => {
                                                        const isLast = index === ele.approval_members.length - 1;
                                                        return (
                                                            <tr key={index} className="hover:bg-gray-50">
                                                                <td className={`p-4 ${!isLast ? 'border-b border-gray-200' : ''}`}>
                                                                    <Typography
                                                                        variant="small"
                                                                        color="blue-gray"
                                                                        className="font-normal"
                                                                    >
                                                                        {member.approval_index || "N/A"}
                                                                    </Typography>
                                                                </td>

                                                                <td className={`p-4 ${!isLast ? 'border-b border-gray-200' : ''}`}>
                                                                    <Typography
                                                                        variant="small"
                                                                        color="blue-gray"
                                                                        className="font-normal"
                                                                    >
                                                                        {converToSnakeCase(member.approved_by) || "N/A"}
                                                                    </Typography>
                                                                </td>

                                                                <td className={`p-4 ${!isLast ? 'border-b border-gray-200' : ''}`}>
                                                                    <Typography
                                                                        variant="small"
                                                                        color="blue-gray"
                                                                        className="font-normal"
                                                                    >
                                                                        {`${member.approved_name || "N/A"} : ${member.oneid || "N/A"}`}
                                                                    </Typography>
                                                                </td>

                                                                <td className={`p-4 ${!isLast ? 'border-b border-gray-200' : ''}`}>
                                                                    <span
                                                                        className={`px-4 py-1 text-xs rounded-[7px] w-[110px] font-medium inline-flex items-center justify-center ${member.status_lbl === "PENDING" || member.status_lbl === "Pending"
                                                                            ? "bg-[#FFF1D9] text-[#FDA006]"
                                                                            : member.status_lbl === "APPROVED" || member.status_lbl === "Approved"
                                                                                ? "bg-[#DBFFF5] text-[#0ACF97]"
                                                                                : "bg-[#FFF0F4] text-[#FF4979]"
                                                                            }`}
                                                                    >
                                                                        {converToSnakeCase(member.status_lbl) || "N/A"}
                                                                    </span>
                                                                </td>

                                                                <td className={`p-4 ${!isLast ? 'border-b border-gray-200' : ''}`}>
                                                                    <Typography
                                                                        variant="small"
                                                                        color="blue-gray"
                                                                        className="font-normal"
                                                                    >
                                                                        {member.last_update_time?.slice(0, 10)}
                                                                    </Typography>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan="5"
                                                            className="p-4"
                                                        >
                                                            <div className="flex flex-col items-center justify-center gap-2 text-center">
                                                                <span className="text-[#292929] font-medium text-[16px]">
                                                                    No Approval Found!
                                                                </span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    )
}

export default ApplicationInfo
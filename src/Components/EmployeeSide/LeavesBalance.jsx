import { Typography } from "@material-tailwind/react";
import React, { useEffect } from "react";
import useEmpDashboard from "../../ViewModel/EmpViewModel/EmpDashboardViewModel/EmpDashboardServices";

const LeavesBalance = () => {
  const { empDashboardData } = useEmpDashboard();
  const leaveBalance = empDashboardData?.leave_balance;

  const tableHeader = [
    "Leave",
    "Total",
    "Availed",
    "Carry Forward",
    "From",
    "To",
    "Expiry",
  ];

  return (
    <div className="h-[calc(100vh-58px)] overflow-x-auto">
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
          {leaveBalance?.length > 0 ? (
            leaveBalance.map((leave, index) => (
              <tr key={leave.id || index} className="hover:bg-gray-50">
                <td className="p-4 border-b border-gray-200">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {leave.Leave || "-"}
                  </Typography>
                </td>
                <td className="p-4 border-b border-gray-200">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {leave.Total || "-"}
                  </Typography>
                </td>
                <td className="p-4 border-b border-gray-200">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {leave.Availed || "-"}
                  </Typography>
                </td>
                <td className="p-4 border-b border-gray-200">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {leave.Carry_Forward || "-"}
                  </Typography>
                </td>
                <td className="p-4 border-b border-gray-200">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {leave.From || "-"}
                  </Typography>
                </td>
                <td className="p-4 border-b border-gray-200">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {leave.To || "-"}
                  </Typography>
                </td>
                <td className="p-4 border-b border-gray-200">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    {leave.Expiry || "-"}
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
                No duties assigned
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeavesBalance;

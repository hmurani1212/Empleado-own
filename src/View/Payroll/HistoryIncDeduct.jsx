import { Typography } from "@material-tailwind/react";
import React, { useEffect } from "react";
import useManageEmpSalary from "../../ViewModel/PayrollViewModel/ManageEmpSalaryServices";

const HistoryIncDeduct = () => {
  const { manageHistoryData, gettingHistory, idSet } = useManageEmpSalary();
  const headHistory = [
    "Title",
    "Amount",
    "Recurring",
    "Date",
    "Status",
    "Type",
  ];

  // Load history data on component mount
  useEffect(() => {
    if (idSet) {
      gettingHistory({ emp_id: idSet });
    }
  }, [gettingHistory, idSet]);

  useEffect(() => {
    console.log("manageHistoryData", manageHistoryData);
  });

  return (
    <>
      <div className="p-2 flex flex-col space-y-4 bg-white rounded-[10px] drop-shadow-md p-2">
        <div>
          <span className="text-[#3da5f4] text-[14px] font-semibold">
            Incentive/Deduction History
          </span>
        </div>

        <div className="">
          <table className="w-full text-center">
            <thead className="">
              <tr>
                {headHistory?.map((head, i) => (
                  <th key={i} className="bg-[#F8F9FA] p-4">
                    <Typography
                      variant="small"
                      // color='blue-gray'
                      className="font-medium leading-none font-Urbanist text-[14px] text-[#474747] capitalize"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {manageHistoryData && manageHistoryData.length > 0 ? (
                manageHistoryData?.map((data, index) => {
                  const isLast = index === manageHistoryData.length - 1;
                  const classes = isLast
                    ? "p-4"
                    : "p-4 border-b border-[#F2F2F9]";

                  return (
                    <tr key={data.id || index}>
                      <td className={classes}>
                        <Typography
                          variant="small"
                          // color='blue-gray'
                          className="font-normal font-Urbanist text-[14px] text-[#474747]"
                        >
                          {data.title || "N/A"}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          variant="small"
                          // color='blue-gray'
                          className="font-normal font-Urbanist text-[14px] text-[#474747]"
                        >
                          {data.amount || "N/A"}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          variant="small"
                          // color='blue-gray'
                          className="font-normal font-Urbanist text-[14px] text-[#474747]"
                        >
                          {data.re_occuring || "N/A"}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          variant="small"
                          // color='blue-gray'
                          className="font-normal font-Urbanist text-[14px] text-[#474747]"
                        >
                          {data.timestamp
                            ? (() => {
                                try {
                                  // Parse the timestamp and format it as DD-MM-YYYY
                                  const date = new Date(data.timestamp);
                                  const day = String(date.getDate()).padStart(
                                    2,
                                    "0"
                                  );
                                  const month = String(
                                    date.getMonth() + 1
                                  ).padStart(2, "0");
                                  const year = date.getFullYear();
                                  return `${day}-${month}-${year}`;
                                } catch (error) {
                                  // If parsing fails, try to extract date from the string format
                                  const dateMatch = data.timestamp.match(
                                    /(\d{1,2})-(\w+)-(\d{2,4})/
                                  );
                                  if (dateMatch) {
                                    const [, day, monthStr, year] = dateMatch;
                                    const monthMap = {
                                      January: "01",
                                      February: "02",
                                      March: "03",
                                      April: "04",
                                      May: "05",
                                      June: "06",
                                      July: "07",
                                      August: "08",
                                      September: "09",
                                      October: "10",
                                      November: "11",
                                      December: "12",
                                    };
                                    const monthNum = monthMap[monthStr] || "01";
                                    const fullYear =
                                      year.length === 2 ? `20${year}` : year;
                                    return `${day.padStart(
                                      2,
                                      "0"
                                    )}-${monthNum}-${fullYear}`;
                                  }
                                  return "N/A";
                                }
                              })()
                            : "N/A"}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          variant="small"
                          // color='blue-gray'
                          className="font-normal font-Urbanist text-[14px] text-[#474747]"
                        >
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              data.status === "1"
                                ? "bg-green-100 text-green-800"
                                : data.status === "0"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {data.status === "1"
                              ? "Active"
                              : data.status === "0"
                              ? "Inactive"
                              : "Deleted"}
                          </span>
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography
                          variant="small"
                          // color='blue-gray'
                          className="font-normal font-Urbanist text-[14px] text-[#474747]"
                        >
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              data.d_type === "INCENTIVE"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {data.d_type || "N/A"}
                          </span>
                        </Typography>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={headHistory.length}
                    className="p-2 text-center font-normal font-Urbanist text-[12px] text-[#474747]"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal leading-none opacity-70"
                    >
                      No incentive/deduction history found
                    </Typography>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default HistoryIncDeduct;
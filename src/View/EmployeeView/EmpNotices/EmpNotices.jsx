import { Typography } from '@material-tailwind/react';
import React, { useEffect } from 'react';
import useEmpNoticesServices from '../../../ViewModel/EmpViewModel/EmpNoticesViewModel/EmpNotices';
import noRecordFound from '../../../assets/employee_side_images/no record found.gif';

const EmpNotices = () => {
  const { getEmpNoticesData, noticesData } = useEmpNoticesServices();

  useEffect(() => {
    getEmpNoticesData();
  }, []);

  // Format date as "12 Nov, 2025"
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  return (
    <div className="flex flex-col gap-4 py-2 l:px-2 md:px-2 px-0">
      <div>
        <span className='text-[20px] #212529 font-medium font-Urbanist'>Notices</span>
      </div>

      <div className="w-full bg-white rounded-[10px] p-2 drop-shadow-md">
        <div className="relative w-full min-h-[calc(100vh-100px)] overflow-auto customScroll">
          <table className="lg:min-w-full min-w-[600px] table-fixed text-center border-collapse">
          <colgroup>
                        <col style={{width: "25%"}} />
                        <col style={{width: "25%"}} />
                        <col style={{width: "45%"}} />
                    </colgroup>
            {/* HEADER */}
            <thead className="sticky top-0 bg-[#F8F9FA]">
              <tr>
                <th className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                  <Typography
                    // variant="small"
                    className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                  >
                    Title
                  </Typography>
                </th>

                <th className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                  <Typography
                    // variant="small"
                    className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                  >
                    Date
                  </Typography>
                </th>

                <th className="bg-[#F8F9FA] px-[clamp(4px,0.8vw,12px)] py-4">
                  <Typography
                    // variant="small"
                    className="font-medium text-[clamp(10px,0.9vw,14px)] text-[#474747] font-Urbanist leading-none capitalize"
                  >
                    Description
                  </Typography>
                </th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {noticesData?.length > 0 ? (
                noticesData.map((ele, index) => {
                  const isLast = index === noticesData.length - 1;
                  const classes = isLast
                    ? "px-[clamp(4px,0.8vw,12px)] py-4"
                    : "px-[clamp(4px,0.8vw,12px)] py-4 border-b border-[#F2F2F9]";

                  return (
                    <tr key={ele?.id}>
                      <td className={classes}>
                        <Typography className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist">
                          {ele?.title}
                        </Typography>
                      </td>

                      <td className={classes}>
                        <Typography className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist">
                          {formatDate(ele?.timestamp)}
                        </Typography>
                      </td>

                      <td className={`${classes} break-words`}>
                        <Typography className="font-normal text-[clamp(10px,0.8vw,13px)] text-[#474747] font-Urbanist">
                          {ele?.description}
                        </Typography>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="p-4">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <img src={noRecordFound} alt="No record found" className='w-80' />
                      <span className="text-[#292929] font-medium text-[12px]">
                        No notices found!
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
};

export default EmpNotices;
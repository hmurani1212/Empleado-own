import React from 'react'
import { Typography } from '@material-tailwind/react';
import { FaTimes } from 'react-icons/fa';

function RequestLeave({ applicationData, onClose }) {

  // Extract form_data safely

  function formatDateString(dateStr) {
    if (!dateStr) return '-';
    // Handle format "yyyy-mm-dd" (ISO format)
    const date = new Date(dateStr);

    if (isNaN(date.getTime())) {
      // If invalid date, try to parse as "dd-mm-yyyy"
      const [day, month, year] = dateStr.split('-');
      const parsedDate = new Date(year, month - 1, day);
      if (isNaN(parsedDate.getTime())) return dateStr; // Return original if still invalid

      const formattedDay = parsedDate.getDate();
      const formattedMonth = parsedDate.toLocaleString("en-US", { month: "short" });
      const formattedYear = parsedDate.getFullYear();
      return `${formattedDay} ${formattedMonth}, ${formattedYear}`;
    }

    const formattedDay = date.getDate();
    const formattedMonth = date.toLocaleString("en-US", { month: "short" });
    const formattedYear = date.getFullYear();

    return `${formattedDay} ${formattedMonth}, ${formattedYear}`;
  }

  // Format adjust_in values
  const formatAdjustIn = (value) => {
    if (!value) return '-';
    // Convert snake_case to Title Case
    return value
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Extract form_data safely
  const formData = applicationData?.form_data;

  // If no form_data or no leave dates, show fallback UI
  if (!formData || !formData.leave_date || formData.leave_date.length === 0) {
    return (
      <div className="bg-white h-full flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-[#3DA5F4] font-semibold text-lg">Requested Leave</h2>
          <button
            onClick={onClose}
            className="w-6 h-6 flex justify-center items-center rounded-full border-2 border-blue-500 hover:bg-blue-50 transition-colors"
            title="Close"
          >
            <FaTimes className="text-blue-500" size={14} />
          </button>
        </div>

        <div className='mt-4 flex-1 px-6 pb-6'>
          <div className='bg-white rounded-[10px] drop-shadow-md p-2 w-full overflow-x-auto'>
            <table className="w-[100%] min-w-max text-center">
              <thead className="sticky top-[-9px] bg-[#F8F9FA] rounded-[8px]">
                <tr>
                  <th className="py-4 px-2">
                    <Typography
                      variant="small"
                      color="#292929"
                      className="font-medium leading-none opacity-80 font-Urbanist capitalize"
                    >
                      Leave Date
                    </Typography>
                  </th>
                  <th className="py-4 px-2">
                    <Typography
                      variant="small"
                      color="#292929"
                      className="font-medium leading-none opacity-80 font-Urbanist capitalize"
                    >
                      Adjust In
                    </Typography>
                  </th>
                  <th className="py-4 px-2">
                    <Typography
                      variant="small"
                      color="#292929"
                      className="font-medium leading-none opacity-80 font-Urbanist capitalize"
                    >
                      Leave For
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="3" className="p-4">
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <span className="text-[#292929] font-medium text-[16px]">No leave dates available</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Build combined leave array from form_data arrays
  const leaveDetails = formData.leave_date?.map((date, idx) => ({
    date,
    adjust_in: formData.leave_adjust_in?.[idx] || '-',
    half_day: formData.half_day?.[idx] || '0'
  })) || [];

  // Optional formatting
  const getHalfDayLabel = (v) => {
    if (v === "1") return "First Half";
    if (v === "2") return "Second Half";
    return "Full Day"; // default 0
  };

  return (
    <>
      <div className="bg-white h-full flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-[#3DA5F4] font-semibold text-lg">Requested Leave</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 flex justify-center items-center rounded-full border-2 border-blue-500 hover:bg-blue-50 transition-colors bg-transparent p-0 cursor-pointer outline-none focus:outline-none"
            title="Close"
            aria-label="Close requested leave details"
          >
            <FaTimes className="text-blue-500" size={14} />
          </button>
        </div>

        <div className='mt-4 flex-1 px-6 pb-6'>
          <div className='bg-white rounded-[10px] drop-shadow-md p-2 w-full overflow-x-auto'>
            <table className="w-[100%] min-w-max text-center">
              <thead className="sticky top-[-9px] bg-[#F8F9FA] rounded-[8px]">
                <tr>
                  <th className="py-4 px-2">
                    <Typography
                      variant="small"
                      color="#292929"
                      className="font-medium leading-none opacity-80 font-Urbanist capitalize"
                    >
                      Leave Date
                    </Typography>
                  </th>
                  <th className="py-4 px-2">
                    <Typography
                      variant="small"
                      color="#292929"
                      className="font-medium leading-none opacity-80 font-Urbanist capitalize"
                    >
                      Adjust In
                    </Typography>
                  </th>
                  <th className="py-4 px-2">
                    <Typography
                      variant="small"
                      color="#292929"
                      className="font-medium leading-none opacity-80 font-Urbanist capitalize"
                    >
                      Leave For
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaveDetails.length > 0 ? (
                  leaveDetails.map((item, index) => {
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-4 border-b border-gray-200">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {formatDateString(item.date)}
                          </Typography>
                        </td>
                        <td className="p-4 border-b border-gray-200">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {formatAdjustIn(item.adjust_in)}
                          </Typography>
                        </td>
                        <td className="p-4 border-b border-gray-200">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {getHalfDayLabel(item.half_day)}
                          </Typography>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="3" className="p-4">
                      <div className="flex flex-col items-center justify-center gap-2 text-center">
                        <span className="text-[#292929] font-medium text-[16px]">No leave dates available</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default RequestLeave;

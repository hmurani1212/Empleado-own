import React from 'react'
import { motion } from 'framer-motion'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6'
import CustomDialog from '../../../Components/CustomDialog/CustomDialog';
import SingleAttendanceView from './SingleAttendanceView';
import useStore from '../../../Store/store';

const CalendarView = (props) => {
  const {
    getBackgroundColor, getAttendanceLabel, getExtraAttribute,
    calendarData, handleNextMonth, handlePreviousMonth,
    handleSingleDayDate,
    singleAttendance,
    toggleSingleAttendance

  } = props;

  const gettingEmpDashboardData = useStore((state) => state.gettingEmpDashboardData);

  const today = new Date(); // Current date

  const currentDate = calendarData?.currentDate
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Wrapper function for next month navigation
  const handleNextMonthWithAPI = () => {
    const currentMonth = calendarData.month.value - 1; // Month index (0-11)
    const currentYear = calendarData.year.value;
    
    // Calculate next month and year
    const nextMonthDate = new Date(currentYear, currentMonth + 1);
    const newMonth = nextMonthDate.getMonth() + 1; // 1-based (1 for January)
    const newYear = nextMonthDate.getFullYear();
    
    // Call the attendance API with new month and year
    gettingEmpDashboardData(newMonth, newYear);
    
    // Call the original handler
    handleNextMonth();
  };

  // Wrapper function for previous month navigation
  const handlePreviousMonthWithAPI = () => {
    const currentMonth = calendarData.month.value - 1; // Month index (0-11)
    const currentYear = calendarData.year.value;
    
    // Calculate previous month and year
    const prevMonthDate = new Date(currentYear, currentMonth - 1);
    const newMonth = prevMonthDate.getMonth() + 1; // 1-based (1 for January)
    const newYear = prevMonthDate.getFullYear();
    
    // Call the attendance API with new month and year
    gettingEmpDashboardData(newMonth, newYear);
    
    // Call the original handler
    handlePreviousMonth(currentDate, currentDate?.year?.label);
  };





  return (
    <>
      <div className=''>
        <div className="flex justify-between items-center mb-4">
          <motion.button
            whileHover={{ scale: 1.2 }}
            onClick={handlePreviousMonthWithAPI}
            className="w-10 h-10 flex items-center justify-center border border-customGray-300 rounded-full hover:bg-[#3DA5F4] hover:text-white"
          >
            <FaChevronLeft />
          </motion.button>
          <div className="text-xl text-[#292929] font-medium flex flex-col items-center">
            <span>
              {calendarData?.month.label}
            </span>
            <span className="">{calendarData.year.label}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.2 }}
            onClick={handleNextMonthWithAPI}
            className="w-10 h-10 flex items-center justify-center border border-customGray-300 rounded-full hover:bg-[#3DA5F4] hover:text-white"
          >
            <FaChevronRight />
          </motion.button>
        </div>

        <div className="grid grid-cols-7 gap-6 text-center p-4">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-md text-[#292929] font-medium w-10 h-10 flex items-center justify-center"
            >
              {day}
            </div>
          ))}

          {calendarData?.daysArray?.map((day, index) => {
            const attLabel = getAttendanceLabel(day, calendarData.month.value - 1, calendarData.year.value);
            const backgroundColor = getBackgroundColor(attLabel);

            const attributes = [
              { key: 'manual_changed', colorClass: '!bg-[#FF9800]' },
              { key: 'signout_missed', colorClass: '!bg-[#000]' },        // Black for missed logout
              { key: 'late', colorClass: '!bg-[#FF0000]' },              // Red for late
              { key: 'early_leave', colorClass: '!bg-[#FFA500]' },
            ];

            // const testData = handleSingleDayDate(day, searchingEmpValue.month.value - 1, searchingEmpValue.year.value)

            // Filter attributes that are true
            const activeAttributes = attributes.filter(attr =>
              getExtraAttribute(day, calendarData.month.value - 1, calendarData.year.value, attr.key)
            );

            return day ? (
              <motion.div
                whileHover={{ scale: 1.1 }}
                key={index}
                // className={`w-10 h-10 flex items-center justify-center rounded-full relative`}
                className={`w-10 h-10 flex items-center justify-center rounded-full ${day === today.getDate() &&
                    today.getMonth() == calendarData.month.value - 1
                    ? "!bg-customGray-blueGray cursor-pointer"
                    : "hover:border hover:border-customGray-blueGray cursor-pointer"
                  } relative`}
                style={{ backgroundColor: backgroundColor }}

                onClick={() => handleSingleDayDate(day, calendarData.month.value - 1, calendarData.year.value)}
              >
                {day}
                {activeAttributes.map((attr, i) => (
                  <div
                    key={i}
                    className={`h-3 w-3 rounded-full absolute ${attr.colorClass}`}
                    style={{
                      // Adjust dot position based on index to place them around the border
                      top: i === 0 ? '-5px' : `'auto'`,
                      right: i === 1 ? '-5px' : `'auto'`,
                      bottom: i === 2 ? '-5px' : `'auto'`,
                      left: i === 3 ? '-5px' : `'auto'`
                    }}
                  ></div>
                ))}
              </motion.div>
            ) : (
              <div key={index} className="px-4 py-2"></div>
            );
          })}
        </div>

      </div>
      {singleAttendance.show &&

        <CustomDialog
          openDialog={singleAttendance.show}
          handleOpen={toggleSingleAttendance}
          backgroundColor="#3DA5F4"
          border={false}
          compo={
            <SingleAttendanceView
              data={singleAttendance.data}
            />
          }
          title={`Details of ${singleAttendance?.data?.calendar_date}`}
          outsidePress={false}
          footer={false}
          size="h-[40vh] w-[500px]"
        />

      }
    </>

  );
}

export default CalendarView
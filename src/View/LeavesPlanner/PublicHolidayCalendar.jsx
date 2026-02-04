import React from 'react'
import { motion } from 'framer-motion'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import RemoveHoliday from './RemoveHoliday';
import AssignHoliday from './AssignHoliday';
import CustomDialog from '../../Components/CustomDialog/CustomDialog';


const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const today = new Date(); // Current date

const PublicHolidayCalendar = (props) => {



    const { publicHolidayValue, handleNextMonth, handlePreviousMonth,handleSingleDayPublicHoliday ,
      toggleHandleSingleDayPublicHoliday,showSingleHoliday,handleRemovePublicHoliday,
      addPublicHolidaysValue,
      handleChangeAddPublicHoliday,
      handleAddPublicHoliday
     } = props

    return (
      <>
      <div className='py-8 px-10 bg-white rounded-[10px] drop-shadow-md'>
          <div className="flex justify-between items-center mb-4">
            <motion.button
              whileHover={{ scale: 1.2 }}
              onClick={()=>handlePreviousMonth(publicHolidayValue, publicHolidayValue?.year?.label)}
              className="w-10 h-10 flex items-center justify-center border border-customBlack-100 rounded-full hover:bg-customGray-400 hover:text-customGray-300"
            >
              <FaChevronLeft />
            </motion.button>
              <div className="text-xl text-customGray-400 font-bold flex flex-col items-center">
              <span>
                {publicHolidayValue?.month.label}
              </span>
              <span className="font-normal">{publicHolidayValue.year.label}</span>
            </div> 
            <motion.button
              whileHover={{ scale: 1.2 }}
              onClick={handleNextMonth}
              className="w-10 h-10 flex items-center justify-center border border-customGray-300 rounded-full hover:bg-customGray-400 hover:text-customGray-300"
            >
              <FaChevronRight />
            </motion.button>
          </div>

          <div className="grid grid-cols-7 gap-6 text-center p-4 place-items-center">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-md text-customGray-400 font-normal w-10 h-10 flex items-center justify-center"
              >
                {day}
              </div>
            ))}
            {publicHolidayValue?.daysArray?.map((day, index) => {
                const holidayDates = publicHolidayValue?.attendanceAttr?.map(holiday => {
                    const dateStr = holiday.date || holiday.day_unix;
                    const [year, month, dayNum] = dateStr.split('-').map(Number);
                    return {
                        day: dayNum,
                        month: month - 1,
                        year: year,
                    };
                });

                const currentMonth = publicHolidayValue.month.value - 1;
                const currentYear = publicHolidayValue.year?.value;
                const specificHoliday = publicHolidayValue?.attendanceAttr?.find(holiday => {
                  const dateStr = holiday.date || holiday.day_unix;
                  const [year, month, dayNum] = dateStr.split('-').map(Number);
                  return (
                      dayNum === day &&
                      month - 1 === currentMonth &&
                      year === currentYear
                  );
                });

                if(specificHoliday) {
                  console.log('🔍 Found holiday with ID:', specificHoliday.id, specificHoliday);
                }

                return day ? (
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        key={index}
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${
                            day === today.getDate() &&
                            today.getMonth() === currentMonth &&
                            today.getFullYear() === currentYear
                                ? "!bg-customGray-blueGray cursor-pointer"
                                : holidayDates.some(
                                      holiday =>
                                          holiday.day == day &&
                                          holiday.month == currentMonth &&
                                          holiday.year == currentYear
                                  ) // Check if the day, month, and year match a holiday
                                    ? "!bg-yellow-400 cursor-pointer" // Apply yellow for matching days
                                    : "hover:border hover:border-customGray-blueGray cursor-pointer"
                        } relative`}

                        onClick={()=>handleSingleDayPublicHoliday(specificHoliday, {day, currentMonth,currentYear})}
                    >
                        {day}
                    </motion.div>
                ) : (
                    <div key={index} className="px-4 py-2"></div>
                );
            })}

          </div>

      </div>
      {
        (showSingleHoliday.showHoliday || showSingleHoliday.assignHoliday) &&
        <CustomDialog 
          openDialog = {
            showSingleHoliday.showHoliday? 
            showSingleHoliday.showHoliday :
            showSingleHoliday.assignHoliday ?
            showSingleHoliday.assignHoliday :
            null
          }
          handleOpen = {toggleHandleSingleDayPublicHoliday}
          compo = {
            showSingleHoliday.showHoliday? 
            <RemoveHoliday 
              showSingleHoliday = {showSingleHoliday}
              handleRemovePublicHoliday = {handleRemovePublicHoliday}

            />
            :
            showSingleHoliday.assignHoliday ? 
              <AssignHoliday 
                addPublicHolidaysValue={addPublicHolidaysValue}
                handleChangeAddPublicHoliday={handleChangeAddPublicHoliday}
                handleAddPublicHoliday={handleAddPublicHoliday}
              /> 
            : 
            null
          }
          title={
            showSingleHoliday.showHoliday ?
            'Remove Holiday' :
            showSingleHoliday.assignHoliday ?
            'Mark Holiday' :
            null
          }
          size= {
            showSingleHoliday.showHoliday ? 
            "md"
            :
            null
          }
          outsidePress ={false}
          footer ={false}
          backgroundColor={(showSingleHoliday.showHoliday || showSingleHoliday.assignHoliday) ? '#6691cc' : undefined}

      />

      }
    </>
  )
}

export default PublicHolidayCalendar
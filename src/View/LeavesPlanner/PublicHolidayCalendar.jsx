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
      <div className='py-8 px-10 bg-white rounded-2xl shadow-sm border border-gray-100 font-poppins'>
          <div className="flex justify-between items-center mb-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={()=>handlePreviousMonth(publicHolidayValue, publicHolidayValue?.year?.label)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <FaChevronLeft className="text-sm" />
            </motion.button>
            
            <div className="text-xl text-gray-800 font-bold flex flex-col items-center">
              <span className="text-2xl mb-1">
                {publicHolidayValue?.month.label}
              </span>
              <span className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                {publicHolidayValue.year.label}
              </span>
            </div> 
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNextMonth}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <FaChevronRight className="text-sm" />
            </motion.button>
          </div>

          <div className="grid grid-cols-7 gap-y-6 gap-x-2 text-center p-2 place-items-center">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="text-xs font-semibold text-gray-400 uppercase tracking-wider w-10 h-10 flex items-center justify-center"
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

                // Determine classes based on state
                const isToday = day === today.getDate() && 
                               today.getMonth() === currentMonth && 
                               today.getFullYear() === currentYear;
                               
                const isHoliday = holidayDates.some(
                                      holiday =>
                                          holiday.day == day &&
                                          holiday.month == currentMonth &&
                                          holiday.year == currentYear
                                  );

                return day ? (
                    <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        key={index}
                        className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all duration-200 cursor-pointer relative
                        ${isToday ? "bg-bgBlue text-white shadow-md shadow-blue-500/20" : ""}
                        ${isHoliday ? "bg-amber-100 text-amber-700 font-bold border-2 border-amber-200" : ""}
                        ${!isToday && !isHoliday ? "text-gray-700 hover:bg-gray-100" : ""}
                        `}
                        onClick={()=>handleSingleDayPublicHoliday(specificHoliday, {day, currentMonth,currentYear})}
                    >
                        {day}
                        {isHoliday && (
                          <span className="absolute -bottom-1 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                        )}
                    </motion.div>
                ) : (
                    <div key={index} className="w-10 h-10"></div>
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
          className="rounded-2xl shadow-xl border border-gray-100 font-poppins overflow-hidden"
          headerClassName="bg-gray-50 border-b border-gray-100 px-6 py-4"
          titleClassName="text-lg font-bold text-gray-800"
          bodyClassName="p-6"
        />

      }
    </>
  )
}

export default PublicHolidayCalendar
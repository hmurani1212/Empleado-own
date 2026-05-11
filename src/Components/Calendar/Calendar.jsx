import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { MdPhoneIphone } from "react-icons/md";
import { motion } from "framer-motion";
import { attendanceColorData } from "../../services/__attendanceServices";
import CustomDialog from "../CustomDialog/CustomDialog";
import SingleDayDetails from "../../View/Attendance/SingleDayDetails";

// Mock attendance data (replace with real data)
const Calendar = (props) => {
  const { data,
    handleNextMonth,handlePreviousMonth,getAttendanceLabel,getBackgroundColor,
    getExtraAttribute,searchingEmpValue,handleSingleDayDate,
    singleDayService, toggleSingleAttendance,addMoreInput,updateSingleDayData,onDataRefreshed,
    showFooter = true
    // handleDayDetails

  } = props;

  const today = new Date(); // Current date

  const currentDate = data?.currentDate
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  // const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-4">
          <motion.button
            whileHover={{ scale: 1.2 }}
            onClick={()=>handlePreviousMonth(currentDate, searchingEmpValue.year.label)}
            className="w-8 h-8 flex items-center cursor-pointer justify-center border border-customGray-300 rounded-full hover:bg-bgBlue hover:text-customGray-300"
          >
            <FaChevronLeft />
          </motion.button>
          <div className="text-xl text-customGray-400  font-bold flex flex-col items-center">
            <span className="font-medium text-[#292929] text-[20px] font-Urbanist">
              {/* {currentDate.toLocaleString("default", { month: "long" })} */}
              {searchingEmpValue?.month.label}
            </span>
            <span className="font-medium text-[#292929] text-[14px] font-Urbanist">{searchingEmpValue.year.label}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.2 }}
            onClick={handleNextMonth}
            className="w-8 h-8 flex items-center cursor-pointer justify-center border border-customGray-300 rounded-full hover:bg-bgBlue hover:text-customGray-300"
          >
            <FaChevronRight />
          </motion.button>
        </div>

        <div className="grid grid-cols-7 gap-6 text-center justify-center items-center w-full p-4">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-[14px] text-[#292929] font-medium w-10 h-10 flex items-center justify-center"
            >
              {day}
            </div>
          ))}

          {data?.daysArray?.map((day, index) => {
            const attLabel = getAttendanceLabel(day, searchingEmpValue.month.value - 1, searchingEmpValue.year.value); // Pass selected month and year
            const backgroundColor = getBackgroundColor(attLabel);

            // Top side attributes (orange, black, red)
            const topAttributes = [
              { key: 'manual_changed', colorClass: '!bg-[#FF9800]', position: 'top-left' },      // Orange
              { key: 'signout_missed', colorClass: '!bg-[#000]', position: 'top-center' },      // Black
              { key: 'late', colorClass: '!bg-[#FF0000]', position: 'top-right' },              // Red
            ];

            // Bottom right attributes (blue, green)
            const bottomRightAttributes = [
              { key: 'early_leave', colorClass: '!bg-[#1e00ff]', position: 'bottom-right-1' },  // Blue
              { key: 'leave_request', colorClass: '!bg-[#008000]', position: 'bottom-right-2' }, // Green
            ];

            const isManualChanged = !!getExtraAttribute(day, searchingEmpValue.month.value - 1, searchingEmpValue.year.value, 'manual_changed')
            const hasGeoLogDay = !!getExtraAttribute(day, searchingEmpValue.month.value - 1, searchingEmpValue.year.value, 'GEO_LOG_DAY')
          
          // Filter attributes that are true
          const activeTopAttributes = topAttributes.filter(attr => 
              getExtraAttribute(day, searchingEmpValue.month.value - 1, searchingEmpValue.year.value, attr.key)
          );

          const activeBottomRightAttributes = bottomRightAttributes.filter(attr => 
              getExtraAttribute(day, searchingEmpValue.month.value - 1, searchingEmpValue.year.value, attr.key)
          ); 
          
          // Check if current day AND has no attendance data
          const isCurrentDay = day === today.getDate() && today.getMonth() === (searchingEmpValue.month.value - 1);
          const hasAttendanceData = backgroundColor && backgroundColor !== 'transparent' && backgroundColor !== '';
          const shouldShowCurrentDayColor = isCurrentDay && !hasAttendanceData;
                 

            return day ? (
              <motion.div
                whileHover={{ scale: 1.1 }}
                key={index}
                className={`w-10 h-10 flex items-center justify-center rounded-full ${
                  shouldShowCurrentDayColor
                    ? "!bg-customGray-blueGray cursor-pointer"
                    : "hover:border hover:border-customGray-blueGray cursor-pointer"
                } relative`}
                style={{ backgroundColor: backgroundColor }}

                onClick={()=>handleSingleDayDate(day, searchingEmpValue.month.value - 1, searchingEmpValue.year.value)}
              >
                {day}
                
                {/* Top side dots (orange, black, red) */}
                {activeTopAttributes.map((attr, i) => {
                  let topStyle = {};
                  if (attr.position === 'top-left') {
                    topStyle = { top: '5px', left: '-5px' };
                  } else if (attr.position === 'top-center') {
                    topStyle = { top: '-5px', left: '50%', transform: 'translateX(-50%)' };
                  } else if (attr.position === 'top-right') {
                    topStyle = { top: '5px', right: '-5px' };
                  } else if (attr.position === 'top-right-late') {
                    topStyle = { top: '5px', right: '-5px' };
                  }
                  
                  return (
                    <div 
                      key={`top-${i}`} 
                      className={`h-3 w-3 rounded-full absolute ${attr.colorClass}`}
                      style={topStyle}
                    ></div>
                  );
                })}

                {/* Bottom right dots (blue, green) */}
                {activeBottomRightAttributes.map((attr, i) => {
                  let bottomStyle = {};
                  if (attr.position === 'bottom-right-1') {
                    bottomStyle = { bottom: '5px', right: '-5px' };
                  } else if (attr.position === 'bottom-left-2') {
                    bottomStyle = { bottom: '5px', left: '-5px' };
                  }
                  
                  return (
                    <div 
                      key={`bottom-${i}`} 
                      className={`h-3 w-3 rounded-full absolute ${attr.colorClass}`}
                      style={bottomStyle}
                    ></div>
                  );
                })}

                {/* GEO day badge (bottom-right) — hidden when manual_changed */}
                {hasGeoLogDay && !isManualChanged && (
                  <div
                    className="absolute z-30 flex items-center justify-center rounded-full bg-slate-200 text-slate-700 ring-2 ring-white shadow-[0_10px_18px_-10px_rgba(0,0,0,0.35)] pointer-events-none"
                    style={{
                      bottom: '-8px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '16px',
                      height: '16px',
                    }}
                    title="Geo location available"
                  >
                    <MdPhoneIphone className="text-[13px]" />
                  </div>
                )}
              </motion.div>
            ) : (
              <div key={index} className="px-4 py-2"></div>
            );
          })}
        </div>
      </div>

    {singleDayService.show && 

      <CustomDialog 
        openDialog = {singleDayService.show}
        handleOpen = {toggleSingleAttendance}
        compo = {
          <SingleDayDetails 
            singleDayService = {singleDayService}
            addMoreInput = {addMoreInput}
            updateSingleDayData = {updateSingleDayData}
            onDataRefreshed = {onDataRefreshed}
            searchingEmpValue = {searchingEmpValue}
            attendanceData = {data}
          />
        }
        title={`Duty Timing ${singleDayService?.data?.daliy_policy_starting || ''} - ${singleDayService?.data?.daliy_policy_closing || ''}`}
        outsidePress ={false}
        footer ={false}
        size={`${(singleDayService?.data?.timings && singleDayService.data.timings.length > 0) ? 'h-[85vh]' : 'h-auto'} w-[750px]`}
      />

    }
    </>
  );
};


export default Calendar;

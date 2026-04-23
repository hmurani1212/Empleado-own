import attendanceApi from "../Model/Data/Attendance/Attendance";

export const convertSecondsToTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const remainingSeconds = seconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);

  if (hours > 0 && minutes > 0) {
    return `${hours} hrs, ${minutes} min`;
  } else if (hours > 0) {
    return `${hours} hrs`;
  } else {
    return `${minutes} min`;
  }
};


export default function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(":");
  let formattedTime = "";
  
  let hoursInt = parseInt(hours);
  const amPm = hoursInt < 12 ? "AM" : "PM";

  if (hoursInt === 0) {
      formattedTime = `12:${minutes}`;
  } else if (hoursInt > 12) {
      hoursInt -= 12;
      formattedTime = `${hoursInt}:${minutes}`;
  } else {
      formattedTime = `${hoursInt}:${minutes}`;
  }

  return `${formattedTime} ${amPm}`;
}



export const attendanceColorData = [
  {id:1, title:'Present', color:'#0acf97', att:'P'},
  {id:2, title:'Holiday', color:'#ffd81a', att:'H'},
  {id:3, title:'Absent', color:'#fc563b', att:'A'},
  {id:4, title:'Annual Leave', color: '#864bff', att:'L'},
  {id:5, title:'Monthly Allowed Leave', color:'#eb0dbc', att:'MAL'},
  {id:6, title:'Early Leave', color:'#1e00ff', att:'EL'},
  {id:7, title:'Half Day', color:'#b8f6dd', att:'HD'},
  {id:8, title:'Missed Logout', color:'#000', att:'ML'},
  {id:9, title:'Leave Request Accepted', color:'#008000', att:'LR'},
  {id:10, title:'Manually Adjusted', color:'#FF9800', att:'MA'},
  {id:11, title:'Current Day', color:'#6691cc', att:'CD'}
]


export const attendancePercentageCalculation = (earned, total) => {
  if (!earned || !total || isNaN(earned) || isNaN(total)) {
    return '0.00'; // return 0.00 if either earned or total is invalid
  }

  let percentage = (earned / total) * 100;
  let result = percentage < 0 ? '0.00' : percentage.toFixed(2);

  return result;
};



export const getRawAttendanceLogs = async(data)=>{
  try{
    const response = await attendanceApi.getRawAttLogs(data)
    return response
  }catch(err){
    throw err
  }
} 
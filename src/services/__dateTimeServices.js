export const convertDMY = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-GB'); // 'en-GB' locale for dd/MM/yyyy format
};

export const convertTimeAMPM = (timestamp) => {
  if (timestamp === "0") {
    return ""; // Placeholder for invalid timestamps
  }
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};



export const toUnixTimeStamp = (timestamp)=>{
  const date = new Date(timestamp);

  // Convert the Date object to a Unix timestamp (in seconds)
  const unixTimestamp = Math.floor(date.getTime() / 1000);

  return unixTimestamp
}

export const formatDateYMD = (dateString) => {
    const date = new Date(dateString * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatTimestampToDate = (timestamp) => {
    if (!timestamp || timestamp === 0) {
        return 'N/A';
    }
    
    try {
        // Handle both seconds and milliseconds timestamps
        const date = new Date(timestamp * 1000);
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        ///console.log('what is the output', `${year}-${month}-${day}`)
        
        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Error formatting timestamp:', error);
        return 'Invalid Date';
    }
};



export function formatDateDMY(timestamp) {
    if (!timestamp) return 'N/A';
    
    // Handle ISO string format
    if (typeof timestamp === 'string') {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return 'Invalid Date';
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        return `${day} ${month} ${year}`;
    }
    
    // Handle milliseconds (13 digits) or seconds (10 digits)
    const date = new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
}


export function formatDateDM(timestamp) {
    // Convert the timestamp to milliseconds
    const date = new Date(timestamp * 1000);

    // Extract day, month, and year
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    // Return the formatted date
    return `${day} ${month}`;
}


export const formatTimestampToTime = (timestamp) => {
  if (timestamp == null || timestamp === "" || timestamp === 0) return "—";
  const ts = Number(timestamp);
  const date = new Date(ts > 9999999999 ? ts : ts * 1000);
  if (isNaN(date.getTime())) return "—";
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours || 12;
  const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${minutesFormatted} ${ampm}`;
};


export const formatTimestampToTimeSeconds = (timestamp) => {
  if (timestamp == null || timestamp === "" || timestamp === 0) return "—";
  const ts = Number(timestamp);
  const date = new Date(ts > 9999999999 ? ts : ts * 1000);
  if (isNaN(date.getTime())) return "—";
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours || 12;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} ${ampm}`;
};



export const secondsIntoHrs = (seconds)=>{
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  let timeString = '';

  if (hours > 0) {
    timeString += `${hours} hour${hours > 1 ? 's' : ''}`;
  }

  if (minutes > 0) {
    if (hours > 0) timeString += ', '; // add comma if hours exist
    timeString += `${minutes} min${minutes > 1 ? '' : ''}`;
  }

  return timeString || '0 min';
}



export const unixToDMY = (timestamp)=>{
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds

  const formattedDate = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  return formattedDate
}


export const empSecondsIntoHrs = (seconds) => {
  if (seconds <= 0) {
    return '0'; // Return specific "0" when the input is 0 or negative
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  let timeString = '';

  if (hours > 0) {
    timeString += `${hours} Hour${hours > 1 ? 's' : ''}`;
  }

  if (minutes > 0) {
    if (hours > 0) timeString += ', '; // add comma if hours exist
    timeString += `${minutes} Mint${minutes > 1 ? 's' : ''}`;
  }


  return timeString || '0 Min';
};


function convertTo24HrFormat(time) {
  if (!time || typeof time !== 'string') {
    console.error('Invalid time format:', time);
    return '00:00'; // Fallback to prevent breaking
  }

  // Split the time into parts
  const [timePart, modifier] = time.split(' ');
  if (!timePart || !modifier) {
    console.error('Time format is missing expected parts:', time);
    return '00:00'; // Fallback for unexpected format
  }

  let [hours, minutes] = timePart.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    console.error('Invalid time components:', timePart);
    return '00:00'; // Fallback for invalid time parts
  }

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  } else if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}


export const calculateHoursDifference=(startTime, endTime) =>{
  // Convert time strings to Date objects
  const start = new Date(`1970-01-01T${convertTo24HrFormat(startTime)}`);
  const end = new Date(`1970-01-01T${convertTo24HrFormat(endTime)}`);
  
  // Calculate the difference in milliseconds
  const differenceInMs = end - start;

  // Convert milliseconds to hours
  const differenceInHours = differenceInMs / (1000 * 60 * 60);
  
  return `${differenceInHours} hrs`;
}


export const getFormattedDate = ()=> {
  const date = new Date();
  
  // Get day name
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayName = days[date.getDay()];

  // Get month name
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const monthName = months[date.getMonth()];

  // Get day number and add suffix
  const day = date.getDate();
  const daySuffix = getDaySuffix(day);

  // Get full year
  const year = date.getFullYear();

  // Combine into the desired format
  return `${dayName} ${day}${daySuffix} of ${monthName} ${year}`;
}

function getDaySuffix(day) {
  if (day >= 11 && day <= 13) {
    return 'th'; // Special case for 11th, 12th, and 13th
  }
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}



export const formatTimeTo12Hour = (timeString) => {
  if (!timeString || typeof timeString !== 'string') {
    return '-';
  }
  
  const timeParts = timeString.split(':');
  if (timeParts.length !== 2) {
    return timeString; // Return original if not in expected format
  }
  
  const [hour, minute] = timeParts.map(Number);
  
  // Check if hour and minute are valid numbers
  if (isNaN(hour) || isNaN(minute)) {
    return timeString; // Return original if not valid numbers
  }
  
  const ampm = hour >= 12 ? 'pm' : 'am';
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12; // Convert 0 and 12 to 12 in 12-hour format
  return `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
}


// exports

//73246868
/// 2025/12/13
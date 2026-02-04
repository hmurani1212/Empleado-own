
// Convert the Unix timestamp to milliseconds


export const convertDateToCustom =(dayUnix)=>{

    const date = new Date(dayUnix * 1000);

    // Extract the full date in the desired format
    const formattedDate = date.toLocaleString('en-US', {
        month: 'short', // Short month format like "Aug"
        day: 'numeric', // Numeric day format like "8"
        year: 'numeric' // Full numeric year format like "2023"
    });

    return formattedDate;
    
}

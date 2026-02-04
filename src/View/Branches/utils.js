export const  formatTimestamp = (timestamp)=> {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
  
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
  
    return date.toLocaleString('en-US', options);
  }
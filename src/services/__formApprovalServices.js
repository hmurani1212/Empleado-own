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


  export const approvedByData = [
    {id:1, name:'Designation', value:1},
    {id:2, name:'Employee', value:2},
    {id:3, name:'Reporting Manager', value:3}
  ]
  export const approvedTypeData = [
    {id:1, name:'Sequential', value:1},
    {id:2, name:'Open', value:2}
  ]
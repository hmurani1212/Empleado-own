import { FaCheck, FaXmark } from "react-icons/fa6";
import { getAllMonths } from "./__appServicesData";

export const applicationIconData = [
    {id:2, icon:<FaCheck />, color:'#0ecf97', content:'Approve'},
    {id:3, icon:<FaXmark />, color:'#FC563B', content:'Reject'}
]


export const selectData = [
    {value:1, label:'All'},
    {value:2, label:'Read'},
    {value:3, label:'Unread'}
]


export const selectApplicationDropdown = [
    {id:1, title:'Select Month', data:getAllMonths()},
    {id:2, title:'Select Type', data:[
        {id:1, title:'test'}
    ]}
]
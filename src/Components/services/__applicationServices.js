
import { FaRegCircleXmark, FaRegCircleCheck } from "react-icons/fa6";
import { BsClockHistory } from 'react-icons/bs'
// import useApplication from '../../ViewModel/ApplicationViewModel/ApplicationServices';
// const { GetSubmitted_AppLi } = useApplication();
const data = [
    { id: 0, title: 'Pending', bg: '#FFF5E3', icon: <BsClockHistory />, iconColor: '#FDA006' },
    { id: 1, title: 'Approved', bg: '#EAFFF9', icon: <FaRegCircleCheck />, iconColor: '#0ACF97' },
    { id: 2, title: 'Rejected', bg: '#FFF3F4', icon: <FaRegCircleXmark />, iconColor: '#F55E67' }
]


export const customStatus = (statusID) => {
    const statusObj = data.find(status => status.id === statusID);
    return statusObj ?
        { title: statusObj.title, icon: statusObj.icon, bg: statusObj.bg, iconColor: statusObj.iconColor }
        :
        { title: '', icon: null, bg: '', iconColor: '' };
};





// console.log("THIS IS DATA", GetSubmitted_AppLi)

export const ApplicationType = [
    { id: 1, title: 'Medical allowance' },
    { id: 2, title: 'Ta/Da Application' },
    { id: 3, title: 'Leave Application' },
    { id: 4, title: 'Leave Encashment' },
]
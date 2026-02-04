import { FaBriefcaseMedical, FaBusSimple, FaDollarSign } from "react-icons/fa6";
import { IoDocumentText } from "react-icons/io5";
export const applicationData = [
    { id: 1, title: 'Medical Allowance', icon: <FaBriefcaseMedical />, color: '#0ACF97', bgColor: '#EDFFF0' },
    { id: 2, title: 'TA/DA Application', icon: <FaBusSimple />, color: '#6460FF', bgColor: '#F5F2FF' },
    { id: 3, title: 'Leave Appication', icon: <IoDocumentText />, color: '#F65F7C', bgColor: '#FFF7F2' },
    { id: 4, title: 'Leave Enchasment', icon: <FaDollarSign />, color: '#FFD63D', bgColor: '#FFF9E8' },
    { id: 5, title: 'Loan Application', icon: <FaDollarSign />, color: '#50BFBF', bgColor: '#C9FFFF' },
];





export const applicationTabData = [
    { id: 1, title: 'New Application' },
    { id: 2, title: 'Existing Application' },
]
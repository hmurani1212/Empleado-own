import { BsSpeedometer2, BsFillBuildingFill, BsClockFill, BsSearch, BsGraphUpArrow } from 'react-icons/bs'
import { HiUser, HiOutlineSpeakerphone } from 'react-icons/hi'
import { HiUserGroup } from 'react-icons/hi2'
import { BiSolidUserCheck } from 'react-icons/bi'
import { AiOutlineFileText, AiFillFile, AiOutlineClockCircle } from 'react-icons/ai'
import { FaUserClock, FaFileInvoiceDollar, FaTasks, FaClipboardCheck, FaFileAlt, FaUserAlt } from 'react-icons/fa'
import { FaUserCheck, FaUserTie, FaPersonChalkboard } from 'react-icons/fa6'

import { GoHomeFill } from "react-icons/go";
import { HiSpeakerphone } from "react-icons/hi";
import { MdTask } from "react-icons/md";
import { AiFillDollarCircle } from "react-icons/ai";
import { IoIosTime } from "react-icons/io";
import { PiNotebookFill } from "react-icons/pi";
import { FaMoneyCheckDollar, FaFolderOpen, FaPersonSnowboarding } from "react-icons/fa6";
import { BsFillHandbagFill } from "react-icons/bs";

let role = 'Employee';
try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('role_id') : null;
    if (raw) role = JSON.parse(raw);
} catch {
    role = 'Employee';
}
const useAdminIcons = role === 'Admin';

export const SidebarTabs = [
    { id: 1, tabName: 'Dashboard', icon: useAdminIcons ? <BsSpeedometer2 /> : <GoHomeFill />, roles: ['Admin', 'Employee', 'Branch_Admin', 'Department_Admin'] },
    { id: 2, tabName: 'Attendance', icon: <FaUserCheck />, roles: ['Employee', 'Branch_Admin', 'Department_Admin'] },
    { id: 3, tabName: 'Employees', icon: <HiUser />, roles: ['Admin'] },
    { id: 4, tabName: 'Departments', icon: <HiUserGroup />, roles: ['Admin', 'Department_Admin'] },
    { id: 5, tabName: 'Branches', icon: <BsFillBuildingFill />, roles: ['Admin', 'Branch_Admin'] },
    { id: 6, tabName: 'HR Policies', icon: <FaUserClock />, roles: ['Admin'] },
    { id: 7, tabName: 'Payroll', icon: <FaFileInvoiceDollar />, roles: ['Admin'] },
    { id: 8, tabName: 'Notices', icon: useAdminIcons ? <HiOutlineSpeakerphone /> : <HiSpeakerphone />, roles: ['Admin', 'Employee', 'Branch_Admin', 'Department_Admin'] },
    { id: 9, tabName: 'Tasks', icon: useAdminIcons ? <AiFillFile /> : <MdTask />, roles: ['Admin', 'Employee', 'Branch_Admin', 'Department_Admin'] },
    { id: 10, tabName: 'Attendance', icon: <BiSolidUserCheck />, roles: ['Admin'] },
    { id: 11, tabName: 'Shift Planners', icon: <BsClockFill />, roles: ['Admin'] },
    { id: 12, tabName: 'Hire 2.0', icon: <BsSearch />, roles: ['Admin'] },
    { id: 13, tabName: 'Application', icon: <AiOutlineFileText />, roles: ['Admin'] },
    { id: 14, tabName: 'Leaves Planner', icon: <AiOutlineClockCircle />, roles: ['Admin'] },
    { id: 23, tabName: 'Expense', icon: <AiFillDollarCircle />, roles: ['Employee', 'Branch_Admin', 'Department_Admin'] },
    { id: 18, tabName: 'Time Adjustment', icon: <IoIosTime />, roles: ['Employee', 'Branch_Admin', 'Department_Admin'] },
    { id: 19, tabName: 'Applications', icon: <PiNotebookFill />, roles: ['Employee', 'Branch_Admin', 'Department_Admin'] },
    { id: 20, tabName: 'Payslip', icon: <FaMoneyCheckDollar />, roles: ['Employee', 'Branch_Admin', 'Department_Admin'] },
    { id: 21, tabName: 'Duties', icon: <BsFillHandbagFill />, roles: ['Employee', 'Branch_Admin', 'Department_Admin'] },
    { id: 15, tabName: 'Notes Pool', icon: useAdminIcons ? <AiFillFile /> : <FaFolderOpen />, roles: ['Admin', 'Employee', 'Branch_Admin', 'Department_Admin'] },
    { id: 16, tabName: 'Performance', icon: useAdminIcons ? <BsGraphUpArrow /> : <FaPersonSnowboarding />, roles: ['Admin', 'Employee', 'Branch_Admin', 'Department_Admin'] },
    { id: 17, tabName: 'Form & Approval', icon: <FaClipboardCheck />, roles: ['Admin'] },
    { id: 24, tabName: 'Expense', icon: <FaFileInvoiceDollar />, roles: ['Admin'] },
    { id: 22, tabName: 'Profile', icon: <FaUserAlt />, roles: ['Employee', 'Branch_Admin', 'Department_Admin'] },
    { id: 25, tabName: 'Training', icon: <FaPersonChalkboard />, roles: ['Admin'] },
    { id: 26, tabName: 'Training', icon: <FaPersonChalkboard />, roles: ['Employee', 'Branch_Admin', 'Department_Admin'] },

];
export const SidebarTabsContainer = [
    { id: 1, tabUrl: '/' },
    { id: 2, tabUrl: '/attendance' },
    { id: 3, tabUrl: '/employees/all_employess' },
    { id: 4, tabUrl: '/departments' },
    { id: 5, tabUrl: '/branches' },
    { id: 6, tabUrl: '/hrpolicies/manage_policies' },
    { id: 7, tabUrl: '/payroll/payroll_overview' },
    { id: 8, tabUrl: '/notices/list_notices' },
    { id: 9, tabUrl: '/tasks' },
    { id: 10, tabUrl: '/attendance' },
    { id: 11, tabUrl: '/shiftPlanners' },
    { id: 12, tabUrl: '/hire/vacancies_list' },
    { id: 13, tabUrl: '/application/application_list' },
    { id: 14, tabUrl: '/leavesPlanner/leaves_group' },
    { id: 23, tabUrl: '/expense' },

    { id: 18, tabUrl: '/time-adjustment' },
    { id: 19, tabUrl: '/applications' },
    { id: 20, tabUrl: '/payslip' },
    { id: 21, tabUrl: '/duties' },
    { id: 15, tabUrl: '/notespool' },

    { id: 16, tabUrl: '/performance' },
    { id: 17, tabUrl: '/formApproval/custom_form' },
    { id: 24, tabUrl: '/expense' },
    { id: 22, tabUrl: '/profile' },
    { id: 25, tabUrl: '/trainingDash' },
    { id: 26, tabUrl: '/EmployeeTraining' },

]

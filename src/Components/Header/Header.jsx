import React, { useEffect, useState, useRef } from "react";
import { BsBell, BsQuestionCircle } from "react-icons/bs";
import { FaBars, FaEdit } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { MdMail } from "react-icons/md";
import { FaBell } from "react-icons/fa6";
import PortalDrawer from "../CustomDrawer/PortalDrawer";
import {
  TbLayoutSidebarRightExpandFilled,
  TbLayoutSidebarRightCollapseFilled,
} from "react-icons/tb";
import empLogo from "../../assets/images/empleado-logo.png";
import defaultUserAvatar from "../../constants/avatar";
import useStore from "../../Store/store";
import { Link, useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  Button,
  MenuItem,
  Navbar,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { motion, AnimatePresence } from "framer-motion";
import useHeader from "../../ViewModel/Header/HeaderServices";
import { getUserData } from "../../Authentication/jwt_decode";
import useEmployees from "../../ViewModel/EmployeeViewModel/EmployeeServices";
import NotificationsPanel from "../NotificationsPanel/NotificationsPanel";
import VideoTutorial from "../VideoTutorial/VideoTutorial";
import { showToast } from "../Toaster/Toaster";
import useAttendance from "../../ViewModel/AttendanceViewModel/AttendanceServices";
import { formatTimestamp } from "../../View/Branches/utils";

function Header() {
  const toggleState = useStore((state) => state.sideMenuToggleState);
  const handleTrueToggleState = useStore((state) => state.sideMenuToggleTrue);
  const handleFalseToggleState = useStore((state) => state.sideMenuToggleFalse);
  const mobilevToggleTrue = useStore((state) => state.mobilevToggleTrue);
  const empDashboardData = useStore((state) => state.empDashboardData);
  const { toggleMenuHeader, openMenuHeader, switchAccessMenu, handleInbox, handleSwitchAccessClick, fetchSwitchAccessInstances, loading } =
    useHeader();
  const { getLiveBiometricDevices, liveBiometricDevices, updateLiveBiometricDevice } = useAttendance();
  const [openNav, setOpenNav] = useState(false);
  const [openProfileMenu, setOpenProfileMenu] = useState(false);
  const [showLiveBiometricDevices, setShowLiveBiometricDevices] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nameValue, setNameValue] = useState('');
  const profileMenuRef = useRef(null);

  const { getHeaderDatafn, getHeaderData, logout } = useEmployees();

  // Inbox: use real unread count from inbox store (not getHeaderData.unread_logs)
  const InboxData = useStore((state) => state.InboxData);
  const getEmployeesAll = useStore((state) => state.getEmployeesAll);
  const inboxUnreadCount = React.useMemo(() => {
    const list = InboxData || [];
    return list.filter((story) => {
      if (story.users && Array.isArray(story.users) && story.users.length > 0) {
        return story.users.some((u) => Number(u.read_status) === 0);
      }
      return Number(story.read_status) !== 1;
    }).length;
  }, [InboxData]);
  
  // Notifications state and actions
  const { 
    unreadCount, 
    toggleNotificationPanel, 
    // getUnreadCount 
  } = useStore();

  // Drawer functions from store
  const openDrawer = useStore((state) => state.openDrawer);
  const settingDrawerTitle = useStore((state) => state.settingDrawerTitle);
  const settingDrawerSize = useStore((state) => state.settingDrawerSize);
  const settingComponent = useStore((state) => state.settingComponent);


  const handleEdit = (device) => {
    setEditId(device.device_id);
    setNameValue(device.device_name || '');
  };

  const handleUpdate = (deviceId) => {
    // onUpdateName(deviceId, nameValue);
    updateLiveBiometricDevice({
      device_id: deviceId,
      device_name: nameValue
    });
    setEditId(null);
  };

  // Navigation hook
  const navigate = useNavigate();

  // Get user role from JWT token
  const userData = getUserData();
  const userRole = userData?.roleId || 'Employee';

  // Profile menu items - different for Admin vs Employee
  const profileMenuItems = userRole === 'Admin' 
    ? [
        { id: 1, title: 'Tutorial' },
        { id: 2, title: 'Setting' },
        { id: 3, title: 'Logout' }
      ]
    : [
        { id: 1, title: 'Accelerate' },
        { id: 2, title: 'Logout' }
      ];

  // Profile menu handlers
  const handleProfileMenuToggle = () => {
    setOpenProfileMenu(!openProfileMenu);
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result.success) {
        showToast('Logged out successfully!', 'success');
        // Navigate to login page
        navigate('/login');
      } else {
        showToast(result.error || 'Logout failed', 'error');
        // Even if logout fails, redirect to login for security
        navigate('/login');
      }
    } catch (error) {
      showToast('An error occurred during logout', 'error');
      // Even if logout fails, redirect to login for security
      navigate('/login');
    }
  };

  const handleProfileMenuItemClick = (item) => {
    switch (item.title) {
      case 'Tutorial':
        // Open video tutorial drawer using the correct pattern
        openDrawer();
        settingDrawerSize(800);
        settingDrawerTitle('Empleado - Quick Introduction to the HR');
        settingComponent(<VideoTutorial />);
        break;
      case 'Setting':
        // Navigate to settings page
        navigate('/settings');
        break;
      case 'Accelerate':
        // Redirect to Accelerate platform
        window.open('https://accelerate.veevotech.com/index', '_blank');
        break;
      case 'Logout':
        // Handle logout action
        handleLogout();
        break;
      default:
        break;
    }
    setOpenProfileMenu(false);
  };

  const backToHomeHandle = () => {
    window.location.href = '/';
  };

  const hasFetchedHeaderDataRef = useRef(false);
  const hasFetchedInboxRef = useRef(false);

  useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setOpenNav(false)
    );
    
    // Only fetch header data once to prevent duplicate API calls
    if (!hasFetchedHeaderDataRef.current) {
      getHeaderDatafn();
      hasFetchedHeaderDataRef.current = true;
    }
    // Fetch inbox list once so header badge shows correct unread count
    if (!hasFetchedInboxRef.current && typeof getEmployeesAll === 'function') {
      getEmployeesAll();
      hasFetchedInboxRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures it only runs once

  // Handle click outside to close profile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setOpenProfileMenu(false);
      }
    };

    if (openProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openProfileMenu]);

  useEffect(() => {
    getLiveBiometricDevices();
  }, []);

  return (
    <Navbar fullWidth className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md px-4 py-3 shadow-sm transition-all">
      <div className="flex items-center justify-between gap-4">
        
        {/* LEFT SECTION: LOGO, TOGGLER & ADMIN TOOLS */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
             {/* Mobile Toggle */}
            <div className="cursor-pointer block lg:hidden p-1 rounded-md hover:bg-gray-100 transition-colors">
              <FaBars
                size={20}
                className="text-gray-500"
                onClick={() => mobilevToggleTrue()}
              />
            </div>

            {/* Logo */}
            <img
              className="cursor-pointer h-8 w-auto object-contain"
              src={empLogo}
              alt="Empleado Logo"
              onClick={backToHomeHandle}
            />

            {/* Desktop Toggle */}
            <div className="cursor-pointer hidden lg:block p-1 rounded-md hover:bg-gray-100 transition-colors ml-2">
              {toggleState ? (
                <TbLayoutSidebarRightExpandFilled
                  size={22}
                  className="text-gray-400 hover:text-brand-500 transition-colors"
                  onClick={() => handleFalseToggleState()}
                />
              ) : (
                <TbLayoutSidebarRightCollapseFilled
                  size={22}
                  className="text-gray-400 hover:text-brand-500 transition-colors"
                  onClick={() => handleTrueToggleState()}
                />
              )}
            </div>
          </div>
          {/* Admin Info (Biometrics) & Support - Moved to Left */}
          {userRole === 'Admin' && (
             <div className="hidden xl:flex items-center gap-3 ml-4">
                {/* Machines & Live Status - Unified Sleek Pill */}
                <div 
                  className="flex items-center bg-gray-50/50 hover:bg-gray-50 transition-all duration-300 rounded-full px-4 py-1.5 border border-gray-200/60 shadow-sm group/stats cursor-pointer"
                  onClick={() => setShowLiveBiometricDevices(true)}
                >
                   {/* Machines */}
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Machines</span>
                      <span className="text-xs font-bold text-gray-700">{liveBiometricDevices.allCount || 0}</span>
                   </div>
                   
                   {/* Divider */}
                   <div className="h-3 w-px bg-gray-300 mx-3 group-hover/stats:bg-gray-400 transition-colors"></div>

                   {/* Live Status */}
                   <div className="flex items-center gap-2 group/live">
                      <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </div>
                      <span className="text-xs font-bold text-gray-700 group-hover/live:text-green-600 transition-colors">{liveBiometricDevices.liveCount || 0}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider group-hover/live:text-green-600/70 transition-colors">Live</span>
                   </div>
                </div>

                {/* Support Info - Clean Text with Icon */}
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 text-gray-400 hover:text-brand-600 transition-colors duration-300 cursor-default">
                    <BsQuestionCircle size={14} className="text-gray-400" />
                    <span className="text-[11px] font-semibold tracking-wide font-poppins">Support: <span className="text-gray-600 font-bold">+92-304-1118333</span></span>
                </div>
             </div>
          )}
        </div>
        {/* MIDDLE SECTION: Admin Info (Biometrics) */}
        {userRole === 'Admin' && (
          <div className="hidden xl:flex items-center gap-6 text-sm text-gray-500 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
             <div className="flex items-center gap-2 cursor-pointer hover:text-brand-600 transition-colors" onClick={() => setShowLiveBiometricDevices(true)}>
                <span className="font-medium text-gray-600">Machines:</span>
                <span className="bg-blue-100 text-brand-600 px-2 py-0.5 rounded text-xs font-semibold">{liveBiometricDevices.allCount || 0}</span>
             </div>
             <div className="h-4 w-px bg-gray-300"></div>
             <div 
               className="flex items-center gap-2" 
             >
                <span className="font-medium">Live:</span>
                <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-semibold">{liveBiometricDevices.liveCount || 0}</span>
             </div>
          </div>
        )}

        {/* MIDDLE SECTION: Admin Info (Biometrics) */}
        {userRole === 'Admin' && (
          <div className="hidden xl:flex items-center gap-6 text-sm text-gray-500 bg-gray-50 px-4 py-1.5 rounded-full border border-gray-100">
             <div className="flex items-center gap-2 cursor-pointer hover:text-brand-600 transition-colors" onClick={() => setShowLiveBiometricDevices(true)}>
                <span className="font-medium text-gray-600">Machines:</span>
                <span className="bg-blue-100 text-brand-600 px-2 py-0.5 rounded text-xs font-semibold">{liveBiometricDevices.allCount || 0}</span>
             </div>
             <div className="h-4 w-px bg-gray-300"></div>
             <div 
               className="flex items-center gap-2" 
             >
                <span className="font-medium">Live:</span>
                <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded text-xs font-semibold">{liveBiometricDevices.liveCount || 0}</span>
             </div>
          </div>
        )}

        {/* RIGHT SECTION: ACTIONS & PROFILE */}
        <div className="flex items-center gap-3 md:gap-5">

          <div className="flex items-center gap-2">
            {/* Messages / Inbox - show unread count from inbox store (matches list) */}
            <Badge
              content={inboxUnreadCount}
              overlap="circular"
              placement="top-end"
              className="min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center text-[10px] bg-red-500 border-2 border-white [&>span]:!rounded-full [&>span]:!flex [&>span]:!items-center [&>span]:!justify-center [&>span]:!min-w-[18px] [&>span]:!min-h-[18px] [&>span]:!aspect-square"
            >
              <IconButton variant="text" color="blue-gray" className="rounded-full hover:bg-gray-100" onClick={handleInbox}>
                 {userRole === "Admin" ? (
                   <HiOutlineMail size={22} className="text-gray-500" />
                 ) : (
                   <MdMail size={22} className="text-brand-500" />
                 )}
              </IconButton>
            </Badge>

            {/* Notifications */}
            <Badge
              content={getHeaderData.total_notifications > 0 ? getHeaderData.total_notifications : null}
              overlap="circular"
              placement="top-end"
              className="min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center text-[10px] bg-red-500 border-2 border-white [&>span]:!rounded-full [&>span]:!flex [&>span]:!items-center [&>span]:!justify-center [&>span]:!min-w-[18px] [&>span]:!min-h-[18px] [&>span]:!aspect-square"
            >
              <IconButton variant="text" color="blue-gray" className="rounded-full hover:bg-gray-100" onClick={toggleNotificationPanel}>
                 {userRole === "Admin" ? (
                   <BsBell size={20} className="text-gray-500" />
                 ) : (
                   <FaBell size={20} className="text-brand-500" />
                 )}
              </IconButton>
            </Badge>
          </div>
          
          {/* Switch Access Menu */}
          <div
            onMouseEnter={() => toggleMenuHeader(true)}
            onMouseLeave={() => toggleMenuHeader(false)}
            className="relative hidden sm:block"
          >
            <Button
              className="flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 text-brand-600 shadow-none hover:shadow-sm hover:bg-brand-100 transition-all font-medium normal-case py-2 px-4"
              size="sm"
            >
              <span>Switch Access</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </Button>
            <AnimatePresence>
            {openMenuHeader && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 z-20 mt-1 w-48 rounded-xl border border-gray-100 bg-white p-2 shadow-lg shadow-blue-gray-500/10"
              >
                  <ul className="flex flex-col gap-1">
                    {switchAccessMenu.length > 0 ? (
                      switchAccessMenu.map((menuItem) => (
                        <li
                          key={menuItem.id}
                          className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-600 cursor-pointer transition-colors"
                          onClick={() => handleSwitchAccessClick(menuItem)}
                        >
                           <span className="truncate">{menuItem.title}</span>
                        </li>
                      ))
                    ) : (
                      <li className="p-2 text-center text-xs text-gray-400">
                        No instances available
                      </li>
                    )}
                  </ul>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          {/* Profile Menu */}
          <div ref={profileMenuRef} className="relative pl-2 border-l border-gray-200">
             <div 
               className="cursor-pointer rounded-full border-2 border-transparent hover:border-brand-100 transition-all p-0.5"
               onClick={handleProfileMenuToggle}
             >
                <Avatar
                  src={empDashboardData?.section1?.dp || defaultUserAvatar}
                  alt="avatar"
                  size="sm"
                  variant="circular"
                  className="ring-2 ring-white"
                />
             </div>
            
            <AnimatePresence>
            {openProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-xl border border-gray-100 bg-white p-2 shadow-xl shadow-blue-gray-500/10 z-50"
              >
                  <ul className="flex flex-col gap-1">
                    {profileMenuItems.map((menuItem) => (
                      <li
                        key={menuItem.id}
                        onClick={() => handleProfileMenuItemClick(menuItem)}
                        className={`flex items-center gap-2 rounded-lg p-2 text-sm font-medium transition-colors cursor-pointer
                          ${menuItem.title === 'Logout' 
                            ? 'text-red-500 hover:bg-red-50' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-brand-600'
                          }`}
                      >
                        {menuItem.title}
                      </li>
                    ))}
                  </ul>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

        </div>
      </div>
      
      {/* Notifications Panel Component */}
      <NotificationsPanel />

      {/* Biometric Devices Drawer */}
      <PortalDrawer
        open={showLiveBiometricDevices}
        closeDrawer={() => setShowLiveBiometricDevices(false)}
        title="Live Biometric Devices"
        widthSize={600}
        compo={
          <div className="p-6">
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Device Name</th>
                    <th className="px-6 py-3 font-semibold">Type</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {liveBiometricDevices?.liveDevices?.map((device) => (
                    <tr key={device.device_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {editId === device.device_id ? (
                          <div className="flex items-center gap-2">
                            <input
                              value={nameValue}
                              onChange={(e) => setNameValue(e.target.value)}
                              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                              autoFocus
                            />
                            <Button size="sm" color="blue" className="bg-brand-500 px-3 py-1 rounded-md" onClick={() => handleUpdate(device.device_id)}>
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3 group">
                            <span className="truncate">{device.device_name || 'N/A'}</span>
                            <FaEdit
                              className="invisible group-hover:visible cursor-pointer text-gray-400 hover:text-brand-500"
                              onClick={() => handleEdit(device)}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">{device.device_type_label || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                          Last Live: {formatTimestamp(device.last_live) || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {(!liveBiometricDevices?.liveDevices || liveBiometricDevices.liveDevices.length === 0) && (
                    <tr>
                      <td colSpan="3" className="px-6 py-8 text-center text-gray-400">
                        No live devices found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        }
      />
    </Navbar>
  );
}

export default Header;
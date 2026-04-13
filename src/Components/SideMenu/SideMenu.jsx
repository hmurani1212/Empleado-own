import React from 'react'
import {
  SidebarTabsContainer,
  SIDEBAR_TAB_ID_ATTENDANCE_SELF,
  SIDEBAR_TAB_ID_ATTENDANCE_ADMIN,
} from './data'
import { NavLink, useLocation } from 'react-router-dom'
import useSideMenu from './sideMenuServices'
import { motion } from 'framer-motion'
import { useSidebarFilteredTabs } from '../../hooks/useSidebarFilteredTabs'

const SideMenu = (props) => {
  const { toggleState } = props
  const { handleSideMenuTab } = useSideMenu()
  const location = useLocation()

  const filteredTabs = useSidebarFilteredTabs()

  const isTabActive = (tabUrl, tabId) => {
    if (!tabUrl || tabUrl === '#') return false;
    if (tabUrl === '/') return location.pathname === '/';
    if (tabId === SIDEBAR_TAB_ID_ATTENDANCE_SELF && tabUrl === '/my-attendance') {
      return (
        location.pathname === '/my-attendance' ||
        location.pathname.startsWith('/my-attendance/')
      );
    }
    if (tabId === SIDEBAR_TAB_ID_ATTENDANCE_ADMIN && tabUrl === '/attendance') {
      const p = location.pathname;
      if (p === '/my-attendance' || p.startsWith('/my-attendance')) return false;
      return p === '/attendance' || p.startsWith('/attendance/');
    }
    const basePath = '/' + (tabUrl.split('/').filter(Boolean)[0] || '');
    return location.pathname === basePath || location.pathname.startsWith(basePath + '/');
  };

  return (
    <div className='flex flex-col w-full h-full bg-white'>
      <div className='flex-1 overflow-y-auto scrollbarHidden py-4 flex flex-col gap-1 overflow-x-hidden'>
        {filteredTabs.map((tab, index) => {
          const containerItem = SidebarTabsContainer.find(item => item.id === tab.id);
          const tabUrl = containerItem ? containerItem.tabUrl : '#';

          // Special handling for Tasks - redirect to external URL
          if (tab.id === 9) { // Tasks has id 9
            return (
              <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <a
                  href="https://accelerate.veevotech.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative flex items-center gap-3 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    text-gray-600 hover:bg-gray-50 hover:text-brand-600 group ${toggleState ? "px-0 justify-center" : "px-4 mx-3"}`}
                  onClick={() => handleSideMenuTab(tab.id)}
                  title={toggleState ? tab.tabName : ''}
                >
                  <span className={`transition-colors duration-200 text-gray-400 group-hover:text-brand-500 ${toggleState ? 'text-2xl' : 'text-lg'}`}>
                    {tab.icon}
                  </span>
                  {!toggleState && (
                    <span className="whitespace-nowrap font-poppins pt-0.5">
                      {tab.tabName}
                    </span>
                  )}
                </a>
              </motion.div>
            );
          }
          
          // Regular NavLink for other tabs
          return (
            <motion.div key={index} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
              <NavLink
                to={tabUrl}
                className={() => {
                  const shouldBeActive = isTabActive(tabUrl, tab.id);
                  const paddingClass = toggleState ? "px-0 justify-center" : "px-4 mx-3";
                  const baseClasses = `relative flex items-center gap-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${paddingClass}`;
                  const activeClasses = "bg-brand-50 text-brand-600 shadow-sm";
                  const inactiveClasses = "text-gray-600 hover:bg-gray-50 hover:text-brand-600";
                  return `${baseClasses} ${shouldBeActive ? activeClasses : inactiveClasses}`;
                }}
                onClick={() => handleSideMenuTab(tab.id)}
                title={toggleState ? tab.tabName : ''}
              >
                {() => {
                  const shouldBeActive = isTabActive(tabUrl, tab.id);
                  return (
                    <>
                      <span className={`transition-colors duration-200 ${shouldBeActive ? 'text-brand-600' : 'text-gray-400 group-hover:text-brand-500'} ${toggleState ? 'text-2xl' : 'text-lg'}`}>
                        {tab.icon}
                      </span>
                      {!toggleState && (
                        <span className="whitespace-nowrap font-poppins pt-0.5 truncate">
                          {tab.tabName}
                        </span>
                      )}
                    </>
                  );
                }}
              </NavLink>
            </motion.div>
          );
        })}
      </div>
    </div>
  )
}

export default SideMenu
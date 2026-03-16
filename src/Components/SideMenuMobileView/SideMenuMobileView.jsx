import React from 'react'
import useSideMenu from '../SideMenu/sideMenuServices'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SidebarTabsContainer, SidebarTabs } from '../SideMenu/data'
import { getUserData } from '../../Authentication/jwt_decode'

const SideMenuMobileView = (props) => {
  const { toggleState } = props
  const { handleSideMenuTab } = useSideMenu()

  // Get user role from JWT so mobile menu shows correct tabs (Employee vs Admin)
  const userData = getUserData()
  const role = userData?.roleId || 'Employee'
  const filteredTabs = SidebarTabs.filter((tab) => tab.roles.includes(role))

  return (
    <div className='flex w-full'>
      <div className="flex flex-col w-full">
        {filteredTabs.map((tab, index) => {
          const tabContainer = SidebarTabsContainer.find(item => item.id === tab.id)
          if (!tabContainer) return null

          // Tasks (id 9) opens external URL, same as desktop sidebar
          if (tab.id === 9) {
            return (
              <motion.button key={index}>
                <a
                  href="https://accelerate.veevotech.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#607d8b] px-[28px] py-[10px] flex items-center gap-[10px] text-[14px] no-underline hover:text-[#03a9f3] navLinkCustom w-full text-left"
                  onClick={() => handleSideMenuTab(tab.id)}
                >
                  <span className={toggleState ? 'text-[20px] transition-all duration-300 ease-in-out' : 'text-[16px] transition-all duration-300 ease-in-out'}>{tab.icon}</span>
                  <span className="whitespace-nowrap">{tab.tabName}</span>
                </a>
              </motion.button>
            )
          }

          return (
            <motion.button key={index}>
              <NavLink
                to={tabContainer.tabUrl}
                className="text-[#607d8b] px-[28px] py-[10px] flex items-center gap-[10px] text-[14px] no-underline hover:text-[#03a9f3] navLinkCustom"
                onClick={() => handleSideMenuTab(tab.id)}
              >
                <span className={toggleState ? 'text-[20px] transition-all duration-300 ease-in-out' : 'text-[16px] transition-all duration-300 ease-in-out'}>{tab.icon}</span>
                <span className="whitespace-nowrap">{tab.tabName}</span>
              </NavLink>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default SideMenuMobileView
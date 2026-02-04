import React from 'react'
import useSideMenu from '../SideMenu/sideMenuServices'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SidebarTabsContainer, SidebarTabs } from '../SideMenu/data'

const SideMenuMobileView = (props) => {
    
  const {toggleState } = props
  const {handleSideMenuTab} = useSideMenu()
  return (
    <div className='flex w-full'>
      <div className="flex flex-col w-full">
        {SidebarTabs.map((tab, index) => {
          const tabContainer = SidebarTabsContainer.find(item => item.id === tab.id)
          if (!tabContainer) return null
          
          return (
            <motion.button
                  // whileHover={{ scale: 1.1 }}
                  // animate={{ scale: activeTab === tab.id ? 1.1 : 1 }}
                  key={index}
                >
              <NavLink to={tabContainer.tabUrl} key={index}  
                className="text-[#607d8b]  px-[28px] py-[10px] flex items-center gap-[10px] text-[14px] no-underline hover:text-[#03a9f3] navLinkCustom" onClick={()=>handleSideMenuTab(tab.id)}
                  
                >
                
                <span className={`${toggleState ?  'text-[20px] transition-all duration-300 ease-in-out ' : 'text-[16px] transition-all duration-300 ease-in-out '}`}>{tab.icon}</span>
                
                <span className='whitespace-nowrap '>{tab.tabName}</span>
                
              </NavLink>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

export default SideMenuMobileView
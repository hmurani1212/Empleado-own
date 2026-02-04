import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router';
import useHRPolicies from '../../ViewModel/HRPoliciesViewModel/HRPoliciesServices';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion'
import { Button } from '@material-tailwind/react';

const HRPolicies = () => {
  const {hrPoliciesMenu, getAllHrPolicies} = useHRPolicies()
  const location = useLocation();
  const navigate = useNavigate()

  const handleLeaveNavClick = (e,link, id) => {
    e.preventDefault()
    navigate(link)
    
  }
  return (
    <>
    <div className='flex flex-col gap-4 py-2 lg:px-2 md:px-2 px-0'>
      <div className=''>
        <span className='text-[20px] text-[#474747] font-Urbanist font-semibold'>HR Policies</span>
      </div>

      <div className='flex flex-col gap-2 pb-3'>
        <div className='flex justify-between items-center gap-5 py-5'>
          <div className='flex flex-wrap w-full items-center gap-5'>
            {hrPoliciesMenu.map((ele) => (
              <NavLink key={ele.id}
              className={`${
                location.pathname === ele.link? "text-white" : "hover:text-[#474747]/60 text-[#474747]"
              } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition focus-visible:outline-2`}
              style={{
                WebkitTapHighlightColor: "transparent",
              }}
          
              onClick={(e) => handleLeaveNavClick(e, ele.link, ele.id)}
              >
                {location.pathname === ele.link && (
                  <motion.span
                    layoutId="bubble"
                    className="absolute inset-0 z-10 bg-[#8bc9f8]"
                    style={{ borderRadius: 9999 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className='relative cursor-pointer text-[14px] z-20' >{ele.title}</span>

              </NavLink>
            ))
            }

          </div>
        </div>
        <div>
          <Outlet /> 

        </div>

      </div>

    </div>

    </>
  )
}

export default HRPolicies
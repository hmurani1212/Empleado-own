import React from 'react'
import useNotice from '../../ViewModel/NoticeViewModel/NoticeServices'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const Notices = () => {
  
  const {noticeTitles, getAllDepartmentsNotices} = useNotice()
  const location = useLocation();
  const naivgate = useNavigate()

  const handleNavLinkClick = (e, link, id)=>{
    e.preventDefault()
    naivgate(link)
    if(id === 2){
      getAllDepartmentsNotices()
    }
  }

  return (
    <div className='flex flex-col gap-4 py-2 pb-1 lg:px-2 md:px-2 px-0'>
      <div className=''>
        <span className='text-[20px] font-semibold font-Urbanist text-[#474747]'>Notices</span>
      </div>

      <div className='flex flex-col gap-2'>
        <div className='flex justify-between items-center gap-5'>
          <div className='flex items-center gap-5'>
            {noticeTitles.map((ele)=>(
              <NavLink key={ele.id}
              className={`${
                location.pathname === ele.link? "text-white" : "hover:text-[#474747]/60 text-[#474747]"
              } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition focus-visible:outline-2`}
              style={{
                WebkitTapHighlightColor: "transparent",
              }}
              // to={ele.link}
              onClick={(e) => handleNavLinkClick(e, ele.link, ele.id)}
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
            ))}

          </div>

        </div>
        <div className=''>
            <Outlet />
        </div> 

      </div>



    </div>
  )
}

export default Notices
import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion'
import useApplication from '../../ViewModel/ApplicationViewModel/ApplicationServices';
import useEmployees from "../../ViewModel/EmployeeViewModel/EmployeeServices"




const Application = () => {
  const { appTitles, GetSubmitted_AppFn } = useApplication();
  const location = useLocation();
  const { Get_All_Employeefn,
    Get_All_Employee } = useEmployees()

  // console.log('This is data i am getting here', Get_All_Employee)


  return (
    <>

      {/* <div className='flex flex-col gap-4 py-2 pb-1 pl-2 '>
      <div className=''>
        <span className='text-[20px]'>Applications</span>
      </div>


      <div className='flex flex-col gap-2 pb-3 drop-shadow rounded-lg bg-white p-3' >
        <div style={{ wordWrap: "break-word",color:"black !important",  fontSize: "12px", color: "#878787", display: "flex", flexDirection: "row", gap: "30px" }}>
            <div
              style={{
                fontWeight: toggle === 1 ? 'medium' : 'normal',
                paddingInline: toggle === 1 ? '13px' : '', 
                padding: toggle === 1 ? '6px' : '6px', 
                backgroundColor: toggle === 1 ? '#3DA5F4' : '', 
                color: toggle === 1 ? 'white' : '',
                borderRadius: toggle ===1 ? '16px' : '',
                backgroundColor: toggle ===1 ? '#8bc9f8' : '', 
              }}
              className={`font-hover font-weight-normal text-black font-semibold hover:text-black/60 text-[14px]`}
              onClick={() => setToggle(1)}
            >
              Applications Lists
            </div>
            <div
              style={{
                fontWeight: toggle === 2 ? 'medium' : 'normal',
                paddingInline: toggle === 2 ? '13px' : '', 
                padding: toggle === 2 ? '6px' : '6px', 
                backgroundColor: toggle === 2 ? '#3DA5F4' : '', 
                color: toggle === 2 ? 'white' : '',
                borderRadius: toggle ===2 ? '16px' : '',
                backgroundColor: toggle ===2 ? '#8bc9f8' : '',
              }}
              className={`font-hover font-weight-normal text-black font-semibold hover:text-black/60 text-[14px]`}
              onClick={() => setToggle(2)}
            >
              New Application
            </div>
        </div>
        

        {toggle === 1 ? <ApplicationsLists /> : null}
        {toggle === 2 ? <NewApplication /> : null}


      </div>
  </div>   */}

      <div className='flex flex-col gap-4 py-2 px-2 z-10'>
        <div className=''>
          <span className='text-[20px] font-Urbanist font-semibold text-[#474747]'>Applications</span>
        </div>

        <div className='flex flex-col gap-2 pb-3 w-full'>
          <div className='flex justify-between items-center gap-5 py-5'>
            <div className='flex items-center gap-5'>
              {appTitles.map((ele) => (
                <NavLink
                  key={ele.id}
                  onClick={() => {
                    GetSubmitted_AppFn();
                    Get_All_Employeefn();
                  }}
                  className={`${location.pathname === ele.link
                    ? "text-white"
                    : "hover:text-[#474747]/60 text-[#474747]"
                    } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition focus-visible:outline-2`}
                  style={{
                    WebkitTapHighlightColor: "transparent",
                  }}
                  to={ele.link}
                >
                  {location.pathname === ele.link && (
                    <motion.span
                      layoutId="bubble"
                      className="absolute inset-0 z-10 bg-[#8bc9f8]"
                      style={{ borderRadius: 9999 }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className='relative cursor-pointer text-[14px] z-20'>{ele.title}</span>
                </NavLink>
              ))}
            </div>
            <div></div>
          </div>

          <div>
            <Outlet />
          </div>
        </div>
      </div>

    </>
  )
}

export default Application
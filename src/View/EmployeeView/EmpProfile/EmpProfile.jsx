import React from 'react'
import { motion } from 'framer-motion'
import { profileDetailsData } from '../../../services/__empProfileService'
import useEmpProfileServices from '../../../ViewModel/EmpViewModel/EmpProfileViewModel/EmpProfileServices'
import EmpProfileAcademic from './EmpProfileAcademic'
import EmpProfileExperience from './EmpProfileExperience'
import EmpProfileDocuments from './EmpProfileDocuments'
import EmpProfileLicenses from './EmpProfileLicenses'
import EmpProfileBankAccunt from './EmpProfileBankAccunt'
import ProfileCompletionIndicator from '../../../Components/ProfileCompletionIndicator/ProfileCompletionIndicator'
import useProfileCompletion from '../../../hooks/useProfileCompletion'

const EmpProfile = () => {
  const {active, toggleEmpProfile} = useEmpProfileServices()
  const { completionPercentage, fetchProfileCompletion } = useProfileCompletion()
  
  return (
    <div className='flex flex-col gap-8 p-2'>
        
      <div className='flex items-center justify-between'>
        <span className='text-[20px]'>My Profile</span>
        <ProfileCompletionIndicator completionPercentage={completionPercentage} />
      </div>

      <div className='flex items-center gap-5 bg-white p-4 rounded-[10px] drop-shadow-md w-full overflow-x-auto'>
          {profileDetailsData.map((ele)=>(
            <div key={ele.id} 
              className={`${
                  active === ele.id? "text-white" : "hover:text-black/60 text-black"
                } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition focus-visible:outline-2`}
                style={{
                  WebkitTapHighlightColor: "transparent",
                }}
                onClick={()=>toggleEmpProfile(ele.id)}
                
            >
              {active === ele.id && (
                <motion.span
                  layoutId="bubble"
                  className="absolute inset-0 z-10 bg-bgBlue"
                  style={{ borderRadius: 9999 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className='relative cursor-pointer text-[14px] z-20' >{ele.title}</span>
            </div>
          ))}
        </div>
        {
          active === 1 ?

          <EmpProfileAcademic />

          :

          active === 2 ?
          <EmpProfileExperience />
          :
          active === 3 ?
          <EmpProfileDocuments />
          :
    
          active === 4 ?
          <EmpProfileLicenses />
          :
          active === 5 ?
          <EmpProfileBankAccunt />
          :
          null
        }
    </div>
  )
}

export default EmpProfile
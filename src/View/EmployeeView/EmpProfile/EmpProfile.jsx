import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  const { active, toggleEmpProfile } = useEmpProfileServices()
  const { completionPercentage, fetchProfileCompletion } = useProfileCompletion()
  
  const activeTabName = profileDetailsData.find(d => d.id === active)?.title || "Profile";

  return (
    <div className='flex flex-col gap-6 p-4 md:p-6 min-h-screen bg-gray-50/50 font-poppins'>
        
      {/* Header Section */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100'>
        <div>
           <h1 className='text-2xl font-bold text-gray-800'>My Profile</h1>
           <p className='text-sm text-gray-500 mt-1'>Manage your personal and professional information</p>
        </div>
        <div className='min-w-[200px]'>
           <ProfileCompletionIndicator completionPercentage={completionPercentage} />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className='bg-white p-2 rounded-xl shadow-sm border border-gray-100 overflow-x-auto customScroll'>
          <div className='flex items-center space-x-1 min-w-max'>
            {profileDetailsData.map((ele) => (
              <button
                key={ele.id}
                onClick={() => toggleEmpProfile(ele.id)}
                className={`relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-brand-200 ${
                  active === ele.id 
                    ? "text-white" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-brand-600"
                }`}
              >
                {active === ele.id && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 bg-brand-500 rounded-lg shadow-md shadow-brand-500/30"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{ele.title}</span>
              </button>
            ))}
          </div>
      </div>

      {/* Content Area */}
      <motion.div
         key={active}
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, y: -10 }}
         transition={{ duration: 0.3 }}
         className='bg-white p-6 rounded-2xl shadow-card border border-gray-100 min-h-[400px]'
      >
        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-gray-800">{activeTabName}</h2>
        </div>
        
        <div className="animate-fade-in">
          {active === 1 && <EmpProfileAcademic />}
          {active === 2 && <EmpProfileExperience />}
          {active === 3 && <EmpProfileDocuments />}
          {active === 4 && <EmpProfileLicenses />}
          {active === 5 && <EmpProfileBankAccunt />}
        </div>
      </motion.div>
    </div>
  )
}

export default EmpProfile
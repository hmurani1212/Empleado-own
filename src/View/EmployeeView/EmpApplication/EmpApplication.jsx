import React from 'react'
import { applicationData, applicationTabData } from '../../../services/__empApplicationServices'
import useEmpApplcationServices from '../../../ViewModel/EmpViewModel/EmpApplicationViewModel/EmpApplicationServices.js'
import { motion } from 'framer-motion'
import EmpExistingApplication from './EmpExistingApplication'
import PortalDrawer from '../../../Components/CustomDrawer/PortalDrawer.jsx'
import EmpMedicalAllowance from './EmpMedicalAllowance.jsx'
import useApplicationHook from '../../../hooks/ApplicationsHook.js'
import TadaApplication from './TadaApplication.jsx'
import EmpLeaveApplication from './EmpLeaveApplication.jsx';
import EmpLoanApplication from './EmpLoanApplication.jsx';
const EmpApplication = () => {
  const { active, handleApplicationToggle } = useEmpApplcationServices()
  const { handleApplicationType, medicalFormValue, toggleMedicalAllowance, handleChangeMedicalAllowance, handleSelectMedicalAllowance, handleMedicalAllowanceSubmission,
    tadaFormValue, toggleTadaAllowance, handleChangeTADA, handleAddTadaForm,
    leaveApplcationValue, handleToggleLeaveApplication, addEmpLeaveApplication, handleApplicationChange, generateLeaveDays, handleLeaveTypeChange, handleHalfDayChange, employeeDefinedLeaves, paidLeaveConfigEnabled,
    loanApplicationValue, handleToggleLoanApplication, addEmpLoanApplication, handleLoanApplicationChange

  } = useApplicationHook();

  return (
    <>
      <div className='space-y-5'>

        <div className='mb-5'>
          <span className='text-[20px]'>Applications</span>
        </div>

        <div className='space-y-4 bg-white p-4 rounded-[10px] drop-shadow-md'>
          <div className='flex items-center gap-5'>
            {applicationTabData.map((ele) => (
              <div key={ele.id}
                className={`${active === ele.id ? "text-white" : "hover:text-[#474747]/60 text-[#474747]"
                  } relative rounded-full px-3 py-1.5 text-sm font-medium outline-sky-400 transition focus-visible:outline-2`}
                style={{
                  WebkitTapHighlightColor: "transparent",
                }}
                onClick={() => handleApplicationToggle(ele.id)}

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
          {active === 1 ?
            <div className='flex items-center justify-center flex-wrap gap-4'>
              {applicationData.map((ele, index) => (
                <motion.div 
                  key={ele.id} 
                  className='w-[200px] h-[100px] rounded-xl flex flex-col justify-between py-4 px-4 cursor-pointer relative overflow-hidden group bg-white border border-gray-100' 
                  onClick={() => handleApplicationType(ele)}
                  whileHover={{ 
                    y: -4,
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
                    borderColor: ele.color 
                  }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className='flex items-center justify-between flex-1 z-10'>
                    <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-opacity-20 transition-colors duration-300" style={{ color: ele.color }}>
                        <span className='text-[24px]'>{ele.icon}</span>
                    </div>
                    <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-10 transition-all duration-500 ease-out" 
                         style={{ background: `radial-gradient(circle, ${ele.color}20 0%, transparent 70%)` }}></div>
                  </div>
                  <span className='text-[14px] font-semibold z-10 tracking-wide text-gray-700 group-hover:text-gray-900 transition-colors duration-200'>{ele.title}</span>
                  
                  {/* Bottom Border Accent */}
                  <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-current group-hover:w-full transition-all duration-300 ease-out" style={{ backgroundColor: ele.color }}></div>
                </motion.div>
              ))}
            </div>
            :

            <EmpExistingApplication />
          }
        </div>
      </div>

      {(medicalFormValue.show || tadaFormValue.show || leaveApplcationValue.show) &&

        <PortalDrawer
          open={
            medicalFormValue.show ? medicalFormValue.show :
              tadaFormValue.show ? tadaFormValue.show :
                leaveApplcationValue.show ? leaveApplcationValue.show :
                  null
          }
          closeDrawer={
            medicalFormValue.show ? toggleMedicalAllowance :
              tadaFormValue.show ? toggleTadaAllowance :
                leaveApplcationValue.show ? handleToggleLeaveApplication :
                  null
          }
          title={
            medicalFormValue.show ? 'Add Medical Allowance' :
              tadaFormValue.show ? 'Add TADA' :
                leaveApplcationValue.show ? 'Leave Application' :
                  null
          }
          widthSize={
            medicalFormValue.show ? 800 :
              tadaFormValue.show ? 800 :
                leaveApplcationValue.show ? 800 :
                  600

          }
          compo={
            medicalFormValue.show ?
              <EmpMedicalAllowance
                medicalFormValue={medicalFormValue}
                handleChangeMedicalAllowance={handleChangeMedicalAllowance}
                handleSelectMedicalAllowance={handleSelectMedicalAllowance}
                handleMedicalAllowanceSubmission={handleMedicalAllowanceSubmission}
              /> :

              tadaFormValue.show ?
                <TadaApplication
                  tadaFormValue={tadaFormValue}
                  handleChangeTADA={handleChangeTADA}
                  handleAddTadaForm={handleAddTadaForm}
                />
                :
                leaveApplcationValue.show ?
                  <EmpLeaveApplication
                    leaveApplcationValue={leaveApplcationValue}
                    addEmpLeaveApplication={addEmpLeaveApplication}
                    handleApplicationChange={handleApplicationChange}
                    generateLeaveDays={generateLeaveDays}
                    handleLeaveTypeChange={handleLeaveTypeChange}
                    handleHalfDayChange={handleHalfDayChange}
                    employeeDefinedLeaves={employeeDefinedLeaves}
                    paidLeaveConfigEnabled={paidLeaveConfigEnabled}
                  />
                  :
                  null

          }
        />
      }
      
      {loanApplicationValue.show && 
        <PortalDrawer 
            open={loanApplicationValue.show}
            closeDrawer={handleToggleLoanApplication}
            compo={
                <EmpLoanApplication
                    loanApplicationValue={loanApplicationValue}
                    addEmpLoanApplication={addEmpLoanApplication}
                    handleApplicationChange={handleLoanApplicationChange}
                />
            }
            title="Loan Application"
            widthSize={800}
        />
      }
    </>
  )
}

export default EmpApplication
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
    leaveApplcationValue, handleToggleLeaveApplication, addEmpLeaveApplication, handleApplicationChange, generateLeaveDays, handleLeaveTypeChange, handleHalfDayChange, employeeDefinedLeaves,
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
              {applicationData.map((ele) => (
                <div key={ele.id} className='w-[200px] h-[100px] rounded-xl flex flex-col justify-between py-1 px-3 cursor-pointer' style={{ backgroundColor: ele.bgColor, border: `1px solid ${ele.color}` }}
                  onClick={() => handleApplicationType(ele)}
                >
                  <div className='flex items-center flex-1'>
                    <span style={{ color: ele.color }} className='text-[30px]'>{ele.icon}</span>
                  </div>
                  <span style={{ color: ele.color }} className='text-[13px]'>{ele.title}</span>
                </div>
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
import useEmpLeaveApplication from "../ViewModel/EmpViewModel/EmpApplicationViewModel/EmpLeaveApplicationServices"
import useTADAServices from "../ViewModel/EmpViewModel/EmpApplicationViewModel/EmpTADAServices"
import useMedicalAllowanceServices from "../ViewModel/EmpViewModel/EmpApplicationViewModel/MedicalAllowanceServices"
import useEmpLoanApplication from "../ViewModel/EmpViewModel/EmpApplicationViewModel/EmpLoanApplicationServices"

const useApplicationHook = ()=>{


  const {handleAddMedicalAllowance, medicalFormValue, toggleMedicalAllowance,handleChangeMedicalAllowance,handleMedicalAllowanceSubmission,handleSelectMedicalAllowance} = useMedicalAllowanceServices()

  const {tadaFormValue, handleTadaAllowance, toggleTadaAllowance,handleChangeTADA, handleAddTadaForm} = useTADAServices()

  const { leaveApplcationValue, handleToggleLeaveApplication, addEmpLeaveApplication, handleApplicationChange, generateLeaveDays, handleLeaveTypeChange, handleHalfDayChange, employeeDefinedLeaves, paidLeaveConfigEnabled } = useEmpLeaveApplication()

  const {loanApplicationValue, handleToggleLoanApplication, addEmpLoanApplication, handleApplicationChange: handleLoanApplicationChange} = useEmpLoanApplication()


  const handleApplicationType = (data)=>{
    const caseId = data.id
    switch (caseId) {
        case 1:
            handleAddMedicalAllowance()
            break;
        case 2:
            handleTadaAllowance()
            break;
        case 3:
            handleToggleLeaveApplication()
            break;
        case 4:
            // Leave Encashment - not implemented yet
            break;
        case 5:
            handleToggleLoanApplication()
            break;
    
        default:
            break;
    }
  }



  return {
    handleApplicationType, medicalFormValue,toggleMedicalAllowance,handleChangeMedicalAllowance,handleSelectMedicalAllowance,handleMedicalAllowanceSubmission,
    tadaFormValue, toggleTadaAllowance,handleChangeTADA, handleAddTadaForm,
    handleToggleLeaveApplication, leaveApplcationValue, addEmpLeaveApplication, handleApplicationChange,
    generateLeaveDays, handleLeaveTypeChange, handleHalfDayChange, employeeDefinedLeaves, paidLeaveConfigEnabled,
    loanApplicationValue, handleToggleLoanApplication, addEmpLoanApplication, handleLoanApplicationChange
  }
}

export default useApplicationHook
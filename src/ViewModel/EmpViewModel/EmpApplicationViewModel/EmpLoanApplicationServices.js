import { useState } from "react"
import { showToast } from "../../../Components/Toaster/Toaster"
import empApplicationApi from "../../../Model/Data/EmpData/EmpApplication/EmpApplication"
import axios from "axios"

const useEmpLoanApplication = ()=>{

    const [loanApplicationValue, setLoanApplicationValue] = useState({
        show:false,
        subject:'',
        application:'',
        loading:false,
    })

    const handleToggleLoanApplication = ()=>{
        setLoanApplicationValue((prevState)=>({
            ...prevState,
            show:!prevState.show
        }))
    }

    const handleApplicationChange = (e)=>{
        const {name, value} = e.target
        setLoanApplicationValue((prevState)=>({
            ...prevState,
            [name]: value
        }))
    }

    const addEmpLoanApplication = async(e)=>{
        e.preventDefault()
        console.log('loan application', loanApplicationValue)
        
        // Form validation
        const { subject, application } = loanApplicationValue;
        
        if (!subject.trim()) {
            showToast('Subject is required', 'error');
            return;
        }
        
        if (!application.trim()) {
            showToast('Body is required', 'error');
            return;
        }
        
        const formData = new FormData();

        // Append each field to the FormData
        formData.append('operation', 'set_application');
        formData.append('appType', 'loan');
        formData.append('subject', subject);
        formData.append('app_body', application);
        formData.append('emp_id', ''); // Keep empty for employee side
        formData.append('emp_name', ''); // Keep empty for employee side
        formData.append('form_data.form_type', 'LOAN');

        try {
            setLoanApplicationValue((prevState) => ({
                ...prevState,
                loading: true
            }));

            const response = await empApplicationApi.addMedicalAllowance(formData);
            const responseData = response.data;
            
            if (response.status === 200 && responseData.STATUS === "SUCCESSFUL") {
                showToast('Loan Application Submitted Successfully', 'success');
                setLoanApplicationValue({
                    show: false,
                    subject: '',
                    application: '',
                    loading: false,
                });
            } else {
                const error = responseData.ERROR_DESCRIPTION;
                showToast(error, 'error');
            }
        } catch (err) {
            console.error('Loan application error:', err);
            showToast('Failed to submit loan application', 'error');
        } finally {
            setLoanApplicationValue((prevState) => ({
                ...prevState,
                loading: false
            }));
        }
    }

    return {
        loanApplicationValue,
        handleToggleLoanApplication,
        addEmpLoanApplication,
        handleApplicationChange
    }
}

export default useEmpLoanApplication

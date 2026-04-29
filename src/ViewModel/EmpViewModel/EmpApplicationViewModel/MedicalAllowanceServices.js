import { useState } from "react"
import empApplicationApi from "../../../Model/Data/EmpData/EmpApplication/EmpApplication"
import { showToast } from "../../../Components/Toaster/Toaster"
import axios from "axios"
const MAKE_URL_ENDPOINT = 'https://emp.veevotech.com/empleado_app/hiring/api/v1/organizations/make_url';

const useMedicalAllowanceServices = ()=>{




    const [medicalFormValue, setMedicalFormValue] = useState({
        show:false,
        subject:'',
        applicaiton:'',
        amountClaimed:'',
        month:null, 
        year: null, 
        attachement:'',
        loading:false,
    })

    const handleAddMedicalAllowance = ()=>{
        setMedicalFormValue((prevState)=>({
            ...prevState,
            show:true
        }))
    }

    const toggleMedicalAllowance = ()=>{

        setMedicalFormValue((prevState)=>({
            ...prevState,
            show:false,
            subject:'',
            applicaiton:'',
            amountClaimed:'',
            month:null, 
            year: null, 
            attachement:'',
        }))
    }


    const handleChangeMedicalAllowance = (e)=>{
        const { name, type, value, files } = e.target;

        // Determine the value based on the input type
        const inputValue = type === 'file' ? (files[0] ? files[0] : null) : value;

        setMedicalFormValue((prevState) => ({
            ...prevState,
            [name]: inputValue,
        }));
    }
    
    
    const handleSelectMedicalAllowance = (selected, field)=>{
        
        setMedicalFormValue((prevState)=>({
            ...prevState,
            [field]: selected
        }))
    }


    const handleMedicalAllowanceSubmission = async(e)=>{
        e.preventDefault()
        console.log(medicalFormValue)

        // Form validation
        const { subject, applicaiton, amountClaimed, month, year } = medicalFormValue;
        
        if (!subject.trim()) {
            showToast('Subject is required', 'error');
            return;
        }
        
        if (!applicaiton.trim()) {
            showToast('Application Body is required', 'error');
            return;
        }
        
        if (!amountClaimed.trim()) {
            showToast('Amount Claimed is required', 'error');
            return;
        }
        
        if (!month) {
            showToast('Months is required', 'error');
            return;
        }
        
        if (!year) {
            showToast('Year is required', 'error');
            return;
        }
        
        const formData = new FormData();

        // Append each field to the FormData
        formData.append('operation', 'set_application');
        formData.append('appType', 'med_allowance');
        formData.append('subject', medicalFormValue.subject);
        formData.append('app_body', medicalFormValue.applicaiton);
        formData.append('amount', medicalFormValue.amountClaimed);
        formData.append('claim_month', medicalFormValue.month?.value);
        formData.append('claim_year', medicalFormValue.year?.value);
        formData.append('emp_id', ''); // Keep empty for employee side
        formData.append('emp_name', ''); // Keep empty for employee side
        formData.append('form_data.form_type', 'Medical_Allownce');

        // Upload file and get URL if attachment exists
        let attachmentUrl = '';
        if (medicalFormValue.attachement) {
            try {
                const uploadFormData = new FormData();
                uploadFormData.append('fileInput', medicalFormValue.attachement);
                
                const uploadResponse = await axios.post(MAKE_URL_ENDPOINT, uploadFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                
                if (uploadResponse.data && (uploadResponse.data.url || uploadResponse.data.FILE_URL)) {
                    attachmentUrl = uploadResponse.data.url || uploadResponse.data.FILE_URL;
                }
            } catch (uploadError) {
                console.error('File upload error:', uploadError);
                showToast('File upload failed', 'error');
                return;
            }
        }
        
        // Append attachment URL instead of binary file
        formData.append('atta', attachmentUrl);
        try{

            setMedicalFormValue((prevState)=>({
                ...prevState,
                loading:true
            }))

            const response = await empApplicationApi.addMedicalAllowance(formData)
            const responseData = response.data 
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                showToast('Medical Allowance Submitted Successfully', 'success')
                toggleMedicalAllowance()

            }else{
                const error = responseData.ERROR_DESCRIPTION
                showToast(error, 'error')
            }
            console.log('respponse', response)
        }catch(err){

        }finally{
            setMedicalFormValue((prevState)=>({
                ...prevState,
                loading:false
            }))
        }
    }
    
    return {

        medicalFormValue,
        handleAddMedicalAllowance,
        toggleMedicalAllowance,
        handleChangeMedicalAllowance,
        handleSelectMedicalAllowance,
        handleMedicalAllowanceSubmission

    }
}


export default useMedicalAllowanceServices
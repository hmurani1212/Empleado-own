import { useState } from "react"
import formApprovalApi from "../../Model/Data/FormApproval/FormApproval"
import { showToast } from "../../Components/Toaster/Toaster"

const useCustomFormService = ()=>{

    const [approvalFlowValue, setApprovalFlowSerivce] = useState({
        show:false,
        currentFlow:{},
        approvalFlowList:[],
        approvalFlowId:null,
        loading:false,
    })

    // State for different form modals
    const [formModal, setFormModal] = useState({
        show: false,
        formData: null,
        formType: null // 'leave', 'time_adjustment', 'loan', etc.
    })

    const viewAssignAF = async(data)=>{
        try{
            // Call gettingCustomForm to get approval flow templates
            const response = await formApprovalApi.getApprovalFlowList()
            console.log('Approval Flow Templates response:', response)
            const responseData = response.data 
            
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                const approvalFlowTemplates = responseData.DB_DATA
                console.log('Approval Flow Templates:', approvalFlowTemplates)
                
                setApprovalFlowSerivce((prevState)=>({
                    ...prevState,
                    approvalFlowList: approvalFlowTemplates
                }))
            }else{
                const error = responseData.ERROR_DESCRIPTION 
                showToast(error, 'error')
            }
        }catch(err){
            console.log('Error fetching approval flow templates:', err)
            showToast('Failed to fetch approval flow templates', 'error')
        }
        
        setApprovalFlowSerivce((prevState)=>({
            ...prevState,
            currentFlow: data,
            show:true
        }))
    }
    const toggleAssignAF = ()=>{
        setApprovalFlowSerivce((prevState)=>({
            ...prevState,
            show:false,
            approvalFlowId:null
        }))
    }


    const assingApprovalFlow = async(e)=>{

        e.preventDefault()
        
        // Validate that approval template is selected
        if(approvalFlowValue.approvalFlowId === null){
            showToast('Select Approval Template', 'error')
            return
        }

        // Validate that form data exists
        if(!approvalFlowValue.currentFlow || (!approvalFlowValue.currentFlow._id && !approvalFlowValue.currentFlow.id)){
            showToast('Form data is missing', 'error')
            return
        }

        // Get form ID - try _id first, then id
        const formId = approvalFlowValue.currentFlow._id || approvalFlowValue.currentFlow.id
        
        const apiData = {
            dynamic_form_id: formId,
            approval_flow_id: approvalFlowValue.approvalFlowId.value
        }

        setApprovalFlowSerivce((prevState)=>({
            ...prevState,
            loading:true
        }))
        
        try{
            const response = await formApprovalApi.assignApprovalFlowTemplate(apiData)
            const responseData = response.data 
            console.log('Assign Approval Flow response:', response)
            
            if(response.status === 200 && responseData.STATUS === "SUCCESSFUL"){
                showToast('Approval Flow assigned successfully!', 'success')
                toggleAssignAF()
            }else{
                const error = responseData.ERROR_DESCRIPTION || 'Failed to assign approval flow'
                showToast(error, 'error')
            }
        }catch(err){
            console.error('Error assigning approval flow:', err)
            showToast('Failed to assign approval flow. Please try again.', 'error')
        }
        finally{
            setApprovalFlowSerivce((prevState)=>({
                ...prevState,
                loading:false
            })) 
        }
    }



    const handlesSelectAAF = (select, field)=>{
        setApprovalFlowSerivce((prevState)=>({
            ...prevState,
            [field]: select
        }))
    }

    // Function to handle view button click - opens appropriate form modal based on form type
    const handleViewForm = (formData) => {
        console.log('Opening form modal for:', formData)
        
        let formType = 'default'
        
        // Determine form type based on form name
        if (formData.form_label === 'ATT_TIME_ADJUSTMENT') {
            formType = 'time_adjustment'
        } else if (formData.form_label === 'LOAN_APPLICATION') {
            formType = 'loan'
        } else if (formData.form_label === 'LEAVE_REQUEST') {
            formType = 'leave'
        }
        
        setFormModal({
            show: true,
            formData: formData,
            formType: formType
        })
    }

    // Function to close form modal
    const closeFormModal = () => {
        setFormModal({
            show: false,
            formData: null,
            formType: null
        })
    }

    return{
        approvalFlowValue,
        toggleAssignAF,
        viewAssignAF,
        assingApprovalFlow,
        handlesSelectAAF,
        formModal,
        handleViewForm,
        closeFormModal
    }

}


export default useCustomFormService
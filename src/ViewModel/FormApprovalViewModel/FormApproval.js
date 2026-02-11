import React from 'react'
import formApprovalApi from '../../Model/Data/FormApproval/FormApproval'

const formApprovalViewModel = (set,get) => ({
    allCustomForm : [],
    customFormLoading: false,
    mountCustomForm : false,
    allApprovalFlow : [],
    approvalFlowLoading: false,
    viewApproval : [],
    viewApprovalLoading : false,
    mountApprovalFlow : false,

    handleMountCustomForm : ()=> {
        set({mountCustomForm : true})
    },

    handleMountApprovalFlow : ()=> {
        set({mountApprovalFlow : true})
    },

    gettingCustomForm : async() => {
        set({customFormLoading: true})
        try{
            const response = await formApprovalApi.getCustomFormList()
            const data = response.data
            // console.log('Custom', data)

            if(data.STATUS === 'SUCCCESSFUL'){
                set({allCustomForm : data.DB_DATA})
            }
        } catch(error) {
            console.log(error)
        } finally {
            set({customFormLoading: false})
        }
    },

    gettingFormApproval : async() => {
        set({approvalFlowLoading: true})
        try{
            const response = await formApprovalApi.getApprovalFlowList()
            const data = response.data
            console.log('Approval', data)

            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                set({allApprovalFlow : data.DB_DATA})
            }
        } catch(error) {
            console.log(error)
        } finally {
            set({approvalFlowLoading: false})
        }
    },

    gettingViewFormApproval : async(template_id) => {
        console.log('Fetching approval flow for template_id:', template_id)
        set({viewApprovalLoading: true, viewApproval: []})
        
        try{
            const response = await formApprovalApi.getViewApprovalFlow(template_id)
            const data = response.data
            console.log('Approval View Response:', data)

            if(response.status === 200 && data.STATUS === 'SUCCESS'){
                console.log('Setting viewApproval data:', data.DB_DATA)
                set({viewApproval : data.DB_DATA, viewApprovalLoading: false})
            } else {
                console.log('API returned non-success status:', data.STATUS)
                set({viewApproval: [], viewApprovalLoading: false})
            }
        } catch(error) {
            console.log('Error fetching approval flow:', error)
            set({viewApproval: [], viewApprovalLoading: false})
        }
    },

    handleDeletionForm : async(id) => {
        console.log(id)
        set({
            allApprovalFlow : get().allApprovalFlow.filter(approval => approval.id !== id),    
        })
    }

    



})

export default formApprovalViewModel
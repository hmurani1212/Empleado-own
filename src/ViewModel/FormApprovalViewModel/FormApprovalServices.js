import React, { useState } from 'react'
import useStore from '../../Store/store'
import ViewApprovalFlow from '../../View/FormApproval/ViewApprovalFlow'
import formApprovalApi from '../../Model/Data/FormApproval/FormApproval'
import { showToast } from '../../Components/Toaster/Toaster'

const useFormApproval = () => {
    const handleMountCustomForm = useStore((state) => state.handleMountCustomForm)
    const mountCustomForm = useStore((state) => state.mountCustomForm)
    const allCustomForm = useStore((state) => state.allCustomForm)
    const gettingCustomForm = useStore((state) => state.gettingCustomForm)
    const mountApprovalFlow = useStore((state) => state.mountApprovalFlow)
    const gettingFormApproval = useStore((state) => state.gettingFormApproval)
    const allApprovalFlow = useStore((state) => state.allApprovalFlow)
    const openDrawer = useStore ((state) => state.openDrawer)
    const settingDrawerTitle = useStore ((state) => state.settingDrawerTitle)
    const settingComponent = useStore ((state) => state.settingComponent)
    const settingDrawerSize = useStore ((state) => state.settingDrawerSize)
    const viewApproval = useStore((state) => state.viewApproval)
    const viewApprovalLoading = useStore((state) => state.viewApprovalLoading)
    const gettingViewFormApproval = useStore((state) => state.gettingViewFormApproval)
    const handleDeletionForm = useStore((state) => state.handleDeletionForm)

    const formApprovalTitles = [
        {id:1, title:'Custom Form', link:'/formApproval/custom_form'},
        {id:2, title:'Approval Flow', link:'/formApproval/approval_flow'}
    ]

    const viewFormApproval = async (data) => {
        console.log('view', data)
        
        // First fetch the data
        await gettingViewFormApproval(data.id)
        
        // Then open the drawer
        openDrawer()
        settingDrawerSize(500)
        settingDrawerTitle(data.title)
        settingComponent(<ViewApprovalFlow />)
    }

    const [openDialogForm, setOpenDialogForm] = useState(false)
    const [tempId, setTempId] = useState('')
    const handleDeleteApproval = (id) => {
        console.log(id)
        setTempId(id)
        setOpenDialogForm(!openDialogForm)
    }



    const deleteApproval = async(e) => {
        e.preventDefault()
        const dataDeleted = {
            template_id : tempId
        }
        
        try{
            const response = await formApprovalApi.deleteApprovalFlow(dataDeleted)
            const data = response.data

            // console.log("Delete data", data)

            if(response.status === 200 && data.STATUS === 'SUCCESSFUL'){
                showToast('Data Deleted Successfully', 'success')
                handleDeletionForm(tempId)
                setOpenDialogForm(false)
            } else {
                showToast(`${data.ERROR_DESCRIPTION}`, 'error')
                setOpenDialogForm(false)
            }
        } catch (error) {
            console.log(error)
        }
    }



  return {formApprovalTitles, handleMountCustomForm, mountCustomForm, allCustomForm, gettingCustomForm, mountApprovalFlow, gettingFormApproval, allApprovalFlow, viewFormApproval, viewApproval, viewApprovalLoading, handleDeleteApproval, openDialogForm, deleteApproval}
}

export default useFormApproval
import React, { useEffect } from 'react'
import { Button, Input } from '@material-tailwind/react'
import leavesPlannerApi from '../../Model/Data/LeavesPlanner/LeavesPlanner'
import { useState } from 'react'
import { showToast } from '../../Components/Toaster/Toaster'


const EditLeavesGroup = (props) => {
    const {data, closeDrawer, UpdateLeaveGroup} = props

    const [isLoading, setIsLoading] = useState(false)
    
    const [addGroupValues, setAddGroupValue] = useState({
      group_id: data?.id || '',
      group_title: data?.group_title || '',
      branch_id: data?.branch_id || ''
    })

    // Update state when data prop changes
    useEffect(() => {
      if (data) {
        setAddGroupValue({
          group_id: data.id || '',
          group_title: data.group_title || '',
          branch_id: data.branch_id || ''
        })
      }
    }, [data])


    const handleChange = (e)=>{
      const {name, value} = e.target
      setAddGroupValue((prevState)=>({
        ...prevState, 
        [name]:value
      }))
    }


    
    const validateForm = ()=>{

      if (!addGroupValues.group_title) {
        showToast(`Group Name is Required`, 'error');
        return;
      }else if (/^\s*$/.test(addGroupValues.group_title)) {
          showToast(` Group name can't be empty`, 'error');
          return;
      }else if (/^[\s]+/.test(addGroupValues.group_title)) {
          showToast(`Remove spaces from the start of group name`, 'error');
          return;
      }else if (/^[!@#$%^&*(),.?":{}|<>]/.test(addGroupValues.group_title)) {
        showToast(`Group name can't start with special characters`, 'error');
        return;
      }


        return true
    }

    const handleEditLeaveGroup = async(e) => {
    
        e.preventDefault();
        const editDataLeave = {
          id : addGroupValues.group_id,
          group_title : addGroupValues.group_title,
          branch_id: addGroupValues.branch_id
        }
        console.log(editDataLeave)
        const validate = validateForm()
        if(validate){

        
          try {
              setIsLoading(true)
              const response = await leavesPlannerApi.editGroupLeave(editDataLeave)
              const respData = response.data

            if (response.status === 201 || respData.STATUS === 'SUCCESSFUL'){
                UpdateLeaveGroup({
                  id: addGroupValues.group_id,
                  group_title: addGroupValues.group_title,
                  creation_time: respData.creation_time || Math.floor(Date.now() / 1000)
                })
                closeDrawer()
                showToast('Group Updated Successfully', 'success')
            }else{
              showToast(respData.ERROR_DESCRIPTION, 'error')
            }

          } catch (error) {
              console.log(error)
          }finally{
            setIsLoading(false)
          }
        }
    } 

  return (
    <>
    {/* Tooba */}
    <form onSubmit={handleEditLeaveGroup}>
        <div className='flex flex-col gap-4' >

            <div className='w-100 pt-5'>
                <Input label='Edit Group Name' color='blue' name='group_title' value={addGroupValues.group_title} onChange={handleChange} />
            </div>

            <div>
              <Button 
                type='submit' 
                className='bg-blue-300 py-[10px] capitalize'
                loading={isLoading}
                disabled={isLoading}
              > 
                Submit
              </Button>
            </div>
        </div>
    </form>
    </>
    
  )
}

export default EditLeavesGroup
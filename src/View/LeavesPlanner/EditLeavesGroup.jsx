import React, { useEffect, useState } from 'react'
import { Button, Input } from '@material-tailwind/react'
import leavesPlannerApi from '../../Model/Data/LeavesPlanner/LeavesPlanner'
import { showToast } from '../../Components/Toaster/Toaster'
import { Loader2 } from 'lucide-react'

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
    <div className='p-6 h-full flex flex-col'>
    <form onSubmit={handleEditLeaveGroup} className="flex flex-col gap-6 h-full">
        <div className='flex flex-col gap-5 flex-1'>
            <div className='flex flex-col gap-2'>
                <label className="text-sm font-semibold text-gray-700 font-poppins">Group Name</label>
                <Input 
                    color='blue' 
                    className='!border !border-gray-200 bg-white text-gray-900 ring-4 ring-transparent placeholder:text-gray-500 focus:!border-blue-500 focus:!border-t-blue-500 focus:ring-blue-500/10 rounded-lg'
                    labelProps={{
                        className: "hidden",
                    }}
                    name='group_title' 
                    value={addGroupValues.group_title} 
                    onChange={handleChange} 
                />
            </div>
        </div>

        <div className='mt-auto pt-6 border-t border-gray-100 flex justify-end gap-3'>
            <Button 
                type='submit' 
                className='font-poppins font-medium capitalize bg-bgBlue shadow-blue-500/20 hover:shadow-blue-500/40 min-w-[120px] flex items-center justify-center py-2.5 rounded-xl'
                disabled={isLoading}
            > 
                {isLoading ? <Loader2 className='animate-spin w-4 h-4' /> : 'Update Group'}
            </Button>
        </div>
    </form>
    </div>
  )
}

export default EditLeavesGroup
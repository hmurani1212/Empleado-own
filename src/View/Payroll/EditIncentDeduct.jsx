import React, { useState, useEffect, useRef } from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { Input } from '@material-tailwind/react'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'
import useManageEmpSalary from '../../ViewModel/PayrollViewModel/ManageEmpSalaryServices'
import payrollApi from '../../Model/Data/Payroll/Payroll'
import { showToast } from '../../Components/Toaster/Toaster'
import { useLocation } from 'react-router'

const EditIncentDeduct = (props) => {

  const { data }= props
  const location = useLocation()
  const {dataSet,  typeOptions, statusOptions, handleUpdateList, closeDrawer, gettingAllIncentDeductListBoth, gettingAllIncentList, gettingAllDeductList, loading, setLoading} = useManageEmpSalary()
  
  // Check if we're on IncentiveList or DeductionList page
  const isIncentiveListPage = location.pathname.includes('/incentive_list')
  const isDeductionListPage = location.pathname.includes('/deduct_list')
  const isListPage = isIncentiveListPage || isDeductionListPage
  
  // Helper function to convert d_type to option value
  const getTypeValue = (d_type) => {
    if (!d_type && d_type !== 0) return null
    // Handle numeric values
    if (d_type === '0' || d_type === 0) return '0'
    if (d_type === '1' || d_type === 1) return '1'
    // Handle string values
    if (typeof d_type === 'string') {
      const upperDType = d_type.toUpperCase()
      if (upperDType.includes('INCENTIVE')) return '0'
      if (upperDType.includes('DEDUCTION')) return '1'
    }
    return String(d_type)
  }
  
  // Helper function to convert status to option value
  const getStatusValue = (status) => {
    if (!status && status !== 0 && status !== '0') return null
    // Handle numeric values
    if (status === '1' || status === 1) return '1'
    if (status === '0' || status === 0) return '0'
    // Handle string values (ACTIVE/INACTIVE)
    if (typeof status === 'string') {
      const upperStatus = status.toUpperCase()
      if (upperStatus === 'ACTIVE') return '1'
      if (upperStatus === 'INACTIVE') return '0'
    }
    return String(status)
  }
  
  // Track the last initialized data ID to prevent re-initializing when user makes changes
  const lastInitializedIdRef = useRef(null)
  
  const [editValue, setEditValue] = useState({
    title : data?.title || '',
    type : null,
    status : null,
    update_id : data?.id || ''
  })
  
  // Update state when data or options change (only initialize once per data.id, don't override user changes)
  useEffect(() => {
    if (data && typeOptions && statusOptions && data.id) {
      // Only initialize if this is a new data item (different ID) or if we haven't initialized yet
      const isNewData = lastInitializedIdRef.current !== data.id
      
      if (isNewData) {
        console.log('EditIncentDeduct - Initializing new data:', data)
        console.log('EditIncentDeduct - typeOptions:', typeOptions)
        console.log('EditIncentDeduct - statusOptions:', statusOptions)
        
        // Find initial type option
        const typeValue = getTypeValue(data.d_type)
        console.log('EditIncentDeduct - data.d_type:', data.d_type, 'converted to:', typeValue)
        const typeOption = typeValue ? typeOptions.find(option => option.value === typeValue) : null
        console.log('EditIncentDeduct - found typeOption:', typeOption)
        
        // Find initial status option
        const statusValue = getStatusValue(data.status)
        console.log('EditIncentDeduct - data.status:', data.status, 'converted to:', statusValue)
        const statusOption = statusValue ? statusOptions.find(option => option.value === statusValue) : null
        console.log('EditIncentDeduct - found statusOption:', statusOption)
        
        setEditValue({
          title: data.title || '',
          type: typeOption,
          status: statusOption,
          update_id: data.id || ''
        })
        
        // Mark this data.id as initialized
        lastInitializedIdRef.current = data.id
      }
    }
  }, [data?.id, data?.d_type, data?.status, data?.title, typeOptions, statusOptions])

  const handleSubmitUpdate = async(e) => {
    setLoading(true)
    e.preventDefault()
    const submitData = {
      type : String(editValue?.type?.value),
      status : String(editValue?.status?.value),
      title : editValue.title,
      update_id : editValue.update_id,
    }
    
    // Add action parameter when called from IncentiveList or DeductionList pages
    if (isListPage) {
      submitData.action = 'update'
    }
    console.log('submitData', submitData)
    console.log('Data types:', {
      action: typeof submitData.action,
      type: typeof submitData.type,
      status: typeof submitData.status,
      title: typeof submitData.title,
      update_id: typeof submitData.update_id
    })

    try{
      const response = await payrollApi.updateIncentiveList(submitData)
      const data = response.data
      if(response.status === 200 && (data.STATUS === 'SUCCESS' || data.STATUS === 'SUCCESSFUL')){
        showToast(data.MESSAGE || 'Deduction/incentive title updated successfully', 'success')
        handleUpdateList(submitData)
        setEditValue({
          title : '',
          type : '',
          status : '',
          update_id : ''
        })
        closeDrawer()
        // Refresh the incentive/deduction list after updating
        gettingAllIncentDeductListBoth()
        // Also refresh individual lists
        gettingAllIncentList()
        gettingAllDeductList()
      } else {
        showToast(data.ERROR_DESCRIPTION || data.MESSAGE || 'Error occurred','error')
      }
    }catch(error){
      console.log(error)
      showToast('Failed to update incentive/deduction', 'error')
    }finally {
      setLoading(false)
    }

  }
  const handleSelectEditChange = (selectedOption, field) => {
    console.log('handleSelectEditChange - field:', field, 'selectedOption:', selectedOption)
    setEditValue((prevState) => {
      const newState = {
        ...prevState,
        [field]: selectedOption
      }
      console.log('handleSelectEditChange - new state:', newState)
      return newState
    })
  }
  
  const handleInputEditIncent = (e) => {
    const {name, value} =  e.target
    setEditValue((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }
  
        // : { value: typeOptions[0].id, label: typeOptions[0].title },
  return (
    <>
    <form onSubmit = {(e) => handleSubmitUpdate(e)}>
      <div className='flex flex-col space-y-4'>
        <div>
          <label className='text-[#7a929e]'>Type</label>
          <CustomSelect 
          key={`type-select-${editValue.update_id}`}
          placeHolderTitle = 'Type'
          value={editValue.type}
          options={typeOptions || []} 
          onChangeHandler={(selectedOption) => handleSelectEditChange(selectedOption, 'type')}
          customStyles={false}
          />
        </div>

        <div>
          <Input label='Title' color='blue' 
          value={editValue.title} 
          name='title' onChange={handleInputEditIncent}
          />
        </div>

        <div>
          <label className='text-[#7a929e]'>Status</label>
          <CustomSelect 
          key={`status-select-${editValue.update_id}`}
          placeHolderTitle = 'Status'
          value={editValue.status}
          options={statusOptions || []} 
          onChangeHandler={(selectedOption) => handleSelectEditChange(selectedOption, 'status')}
          customStyles={false}
          />
        </div>

        <div>
          <SubmitButton loading={loading} />
        </div>
      </div>
    </form>
    </>
  )
}

export default EditIncentDeduct
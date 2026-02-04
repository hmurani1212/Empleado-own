import { Button, Input } from '@material-tailwind/react'
import React, { useEffect, useState } from 'react'
import useHRPolicies from '../../ViewModel/HRPoliciesViewModel/HRPoliciesServices'
import SubmitButton from '../../Components/SubmitButton/SubmitButton'
import hrPoliciesApi from '../../Model/Data/HRPolicies/HRPolicies'
import { showToast } from '../../Components/Toaster/Toaster'
import { validateEditPolicyForm } from '../../Validation/Validation'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import { validateInput } from '../../Validation/CustomValidation'
import { isValid } from 'date-fns'
import leavesPlannerApi from '../../Model/Data/LeavesPlanner/LeavesPlanner'

const EditPolicy = (props) => {
  const { data, enableLeaveGroup, leave_groups } = props
  const { closeDrawer, handleUpdatePolicy, getAllHrPolicies } = useHRPolicies()
  const [policiesValues, setPoliciesValues] = useState({
    id: data.id,
    policy_name: data.policy_name,
    group: '',
    loading: false
  })
  const [leaveGroupsList, setLeaveGroupsList] = useState([])
  const shouldShowLeaveGroup = data.leave_group_id === '0' || data.leave_group_id === 0

  // Fetch leave groups when component mounts and leave_group_id is 0
  useEffect(() => {
    if (shouldShowLeaveGroup) {
      fetchLeaveGroups()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchLeaveGroups = async () => {
    try {
      const response = await leavesPlannerApi.getAllLeaveGroups()
      const resData = response.data
      console.log('Leave Groups API Response:', resData)

      if (response.status === 200 && resData.STATUS === 'SUCCESSFUL') {
        const groups = resData.DB_DATA?.groups || []
        const transformedGroups = groups.map(group => ({
          value: group.id,
          label: group.group_title
        }))
        setLeaveGroupsList(transformedGroups)
        console.log('Leave Groups loaded:', transformedGroups)
      } else {
        console.error('Failed to fetch leave groups:', resData.ERROR_DESCRIPTION)
        setLeaveGroupsList([])
      }
    } catch (err) {
      console.error('Error fetching leave groups:', err)
      setLeaveGroupsList([])
    }
  }

  const handleChangeEditPolicy = (e) => {
    const { name, value } = e.target
    // console.log('name, value', name ,value)

    setPoliciesValues((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }

  const handleSelectChange = (selected, field) => {
    setPoliciesValues((prevState) => ({
      ...prevState,
      [field]: selected
    }))
  }


  const editFormValidation = () => {

    const { policy_name } = policiesValues

    const nameValidation = validateInput('Policy', policy_name);
    if (!nameValidation.isValid) {
      return { isValid: false, message: nameValidation.message };
    }

    // Leave group is optional - no validation required
    return { isValid: true }


  }

  const handleEditPolicy = async (e) => {
    e.preventDefault()

    console.log('shouldShowLeaveGroup:', shouldShowLeaveGroup)
    console.log('policiesValues.group:', policiesValues.group)

    const editPolicy = {
      id: policiesValues.id,
      name: policiesValues.policy_name,
    }

    // Add leave_group_id to payload if user selected a group
    if (shouldShowLeaveGroup && policiesValues.group) {
      // Handle both object {value, label} and direct value
      const groupId = typeof policiesValues.group === 'object'
        ? policiesValues.group.value
        : policiesValues.group

      editPolicy.leave_group_id = groupId
      console.log('Adding leave_group_id to payload:', editPolicy.leave_group_id)
    }

    console.log('Edit Policy Payload:', editPolicy)

    const validate = editFormValidation()
    if (!validate.isValid) {
      showToast(validate.message, 'error');
      return
    } else {
      try {
        setPoliciesValues((prevState) => ({
          ...prevState,
          loading: true
        }))
        const response = await hrPoliciesApi.updatePolicy(editPolicy)
        const data = response.data

        // console.log('edited darta', data)
        if (response.status === 200 && data.STATUS === 'SUCCESSFUL') {
          handleUpdatePolicy(editPolicy)

          // Refresh the policies list to reflect changes in real-time
          getAllHrPolicies()

          showToast('Hr policy updated Successfuly', 'success')
          setPoliciesValues({
            id: '',
            policy_name: '',
            group: ''
          })
          closeDrawer()

        } else {
          showToast(data.ERROR_DESCRIPTION, 'error')
        }
      } catch (error) {
        console.error('Error updating policy:', error)
        showToast('Failed to update policy', 'error')
      } finally {
        setPoliciesValues((prevState) => ({
          ...prevState,
          loading: false
        }))
      }
    }

  }





  return (
    <>
      <form onSubmit={handleEditPolicy}>
        <div className='flex flex-col space-y-4'>
          <div>
            <Input label='Policy Name' color='blue' value={policiesValues.policy_name} name='policy_name' onChange={handleChangeEditPolicy} />
          </div>

          <div>
            <span className='text-[10px]'>
              Due to the employees registered against this policy the Other attributes of the policy can't be edited since changing policy data may cause the existing attendance to be invalidated and corrupted
            </span>
          </div>
          {shouldShowLeaveGroup &&
            <div>
              <CustomSelect
                placeHolderTitle='Leave Management Group'
                value={policiesValues?.group}
                options={leaveGroupsList}
                onChangeHandler={(selectedOption) => handleSelectChange(selectedOption, 'group')}
                customStyles={false}
              />
            </div>
          }

          <div>
            {policiesValues.loading
              ?

              <Button color='blue' loading >Loading</Button>
              :

              <SubmitButton />
            }
          </div>
        </div>
      </form>

    </>
  )
}

export default EditPolicy
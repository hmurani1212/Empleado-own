import { Button, Option, Select } from '@material-tailwind/react'
import React from 'react'
import useLeavesPlanner from '../../ViewModel/LeavePlannerViewModel/LeavePlannerServices'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'

const ImportGoogleHolidays = () => {
  const {
    policiesList,
    handleSelectChange,
    holidayValues,
    countriesGoogleForm,
    branchesGoogleForm,
    handleGoogleHoliday,
    leavesBranches
  } = useLeavesPlanner()

  // Make sure branches always exist
  const branches =
    Array.isArray(leavesBranches) && leavesBranches.length > 0
      ? leavesBranches
      : branchesGoogleForm

  // Add "All Branches" to the start of branches
  const mergedBranches = [
    { id: 0, branch_name: 'All Branches' },
    ...(Array.isArray(branches)
      ? branches.filter((b) => b && b.id && b.branch_name)
      : [])
  ]

  // Add "All Policies" to the start of policies
  const mergedPolicies = [
    { id: 0, policy_name: 'All Policies' },
    ...(Array.isArray(policiesList)
      ? policiesList.filter((p) => p && p.id && p.policy_name)
      : [])
  ]

  return (
    <>
      <form onSubmit={handleGoogleHoliday}>
        <div className='flex flex-col gap-4'>

          {/* Branch Select */}
          <div>
            <Select
              label='Select Branch'
              color='blue'
              className='h-10'
              name='branch_id'
              onChange={(value) => handleSelectChange('branch_id', value)}
            >
              {mergedBranches.map((ele) => (
                <Option key={ele.id} value={ele.id}>
                  {ele.branch_name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Policy Select */}
          <div>
            <Select
              label='Select HR Policy'
              color='blue'
              className='h-10'
              name='policy_id'
              onChange={(value) => handleSelectChange('policy_id', value)}
            >
              {mergedPolicies.map((ele) => (
                <Option key={ele.id} value={ele.id}>
                  {ele.policy_name}
                </Option>
              ))}
            </Select>
          </div>

          {/* Country Select */}
          <div>
            <label className='text-[#7a929e]'>Select Country</label>
            <CustomSelect
              placeHolderTitle='Country'
              value={holidayValues.country_code}
              options={
                Array.isArray(countriesGoogleForm)
                  ? countriesGoogleForm
                      .filter((c) => c && c.country_name)
                      .map((country) => ({
                        value: country.prefix?.toLowerCase(),
                        label: `${country.country_name} (${country.phonecode})`
                      }))
                  : []
              }
              onChangeHandler={(selectedOption) =>
                handleSelectChange('country_code', selectedOption)
              }
              customStyle={false}
            />
          </div>

          {/* Submit Button */}
          <div>
            {holidayValues.loading ? (
              <Button loading className='bg-[#8bc9f8]'>
                Loading
              </Button>
            ) : (
              <Button type='submit' className='bg-[#8bc9f8]'>
                Submit
              </Button>
            )}
          </div>
        </div>
      </form>
    </>
  )
}

export default ImportGoogleHolidays
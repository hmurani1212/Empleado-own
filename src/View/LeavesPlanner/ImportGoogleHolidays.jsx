import { Button } from '@material-tailwind/react'
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
    leavesBranches,
    googleFormsLoading,
    leavesBranchesLoading,
    googleFormPoliciesLoading,
  } = useLeavesPlanner()

  const branches =
    Array.isArray(leavesBranches) && leavesBranches.length > 0
      ? leavesBranches
      : branchesGoogleForm

  const mergedBranches = [
    { id: 0, branch_name: 'All Branches' },
    ...(Array.isArray(branches)
      ? branches.filter((b) => b && b.id && b.branch_name)
      : []),
  ]

  const mergedPolicies = [
    { id: 0, policy_name: 'All Policies' },
    ...(Array.isArray(policiesList)
      ? policiesList.filter((p) => p && p.id && p.policy_name)
      : []),
  ]

  const hasBranchData =
    (Array.isArray(leavesBranches) && leavesBranches.length > 0) ||
    (Array.isArray(branchesGoogleForm) && branchesGoogleForm.length > 0)

  const branchMenuLoading =
    (leavesBranchesLoading || googleFormsLoading) && !hasBranchData

  const countryMenuLoading =
    googleFormsLoading && !(Array.isArray(countriesGoogleForm) && countriesGoogleForm.length > 0)

  const branchOptions = mergedBranches.map((b) => ({
    value: b.id,
    label: b.branch_name,
  }))

  const policyOptions = mergedPolicies.map((p) => ({
    value: p.id,
    label: p.policy_name,
  }))

  const countryOptions = Array.isArray(countriesGoogleForm)
    ? countriesGoogleForm
        .filter((c) => c && c.country_name)
        .map((country) => ({
          value: country.prefix?.toLowerCase(),
          label: `${country.country_name} (${country.phonecode})`,
        }))
    : []

  const branchValue =
    holidayValues.branch_id === '' || holidayValues.branch_id == null
      ? null
      : branchOptions.find(
          (o) => String(o.value) === String(holidayValues.branch_id),
        ) ?? null

  const policyValue =
    holidayValues.policy_id === '' || holidayValues.policy_id == null
      ? null
      : policyOptions.find(
          (o) => String(o.value) === String(holidayValues.policy_id),
        ) ?? null

  return (
    <>
      <form onSubmit={handleGoogleHoliday}>
        <div className='flex flex-col gap-4'>
          <div>
            <label className='text-[#7a929e]'>Select Branch</label>
            <CustomSelect
              placeHolderTitle='Branch'
              value={branchValue}
              options={branchOptions}
              onChangeHandler={(opt) =>
                handleSelectChange('branch_id', opt?.value ?? '')
              }
              menuLoading={branchMenuLoading}
              menuLoadingLabel='Loading branches...'
            />
          </div>

          <div>
            <label className='text-[#7a929e]'>Select HR Policy</label>
            <CustomSelect
              placeHolderTitle='HR Policy'
              value={policyValue}
              options={policyOptions}
              onChangeHandler={(opt) =>
                handleSelectChange('policy_id', opt?.value ?? '')
              }
              menuLoading={googleFormPoliciesLoading}
              menuLoadingLabel='Loading policies...'
            />
          </div>

          <div>
            <label className='text-[#7a929e]'>Select Country</label>
            <CustomSelect
              placeHolderTitle='Country'
              value={holidayValues.country_code}
              options={countryOptions}
              onChangeHandler={(selectedOption) =>
                handleSelectChange('country_code', selectedOption)
              }
              menuLoading={countryMenuLoading}
              menuLoadingLabel='Loading countries...'
            />
          </div>

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

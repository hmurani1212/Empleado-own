import { Input, Button, Typography } from '@material-tailwind/react'
import React, { useMemo } from 'react'
import useBranches2 from '../../ViewModel/Brach2ViewModel/BranchesServices2'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'

function CreateNewBranch(props) {
  const { closeBranchDrawer } = props
  const { allCountries, newBranchValues, onChangeCountry, handleNewBranch, addNewBranch, isLoading } = useBranches2()

  // Check if all required fields are filled
  const isFormValid = useMemo(() => {
    return (
      newBranchValues.branch_name?.trim() !== '' &&
      newBranchValues.branch_address?.trim() !== '' &&
      newBranchValues.phone_no?.trim() !== '' &&
      newBranchValues.email_address?.trim() !== '' &&
      newBranchValues.country_code?.value &&
      newBranchValues.currency?.trim() !== ''
    );
  }, [newBranchValues]);

  return (
    <div className='p-6'>
      <form className='flex flex-col gap-6' onSubmit={(e) => addNewBranch(e, closeBranchDrawer)}>
        <div className="grid grid-cols-1 gap-6">
            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium font-poppins">
                Branch Name <span className="text-red-500">*</span>
              </Typography>
              <Input
                size="lg"
                placeholder="e.g. Head Office"
                className="!border-t-blue-gray-200 focus:!border-blue-500 font-poppins"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={newBranchValues.branch_name}
                name='branch_name'
                onChange={handleNewBranch}
              />
            </div>

            <div>
              <Typography variant="small" color="blue-gray" className="mb-2 font-medium font-poppins">
                Branch Address <span className="text-red-500">*</span>
              </Typography>
              <Input
                size="lg"
                placeholder="e.g. 123 Main St, City, Country"
                className="!border-t-blue-gray-200 focus:!border-blue-500 font-poppins"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={newBranchValues.branch_address}
                name='branch_address'
                onChange={handleNewBranch}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium font-poppins">
                    Phone Number <span className="text-red-500">*</span>
                  </Typography>
                  <Input
                    size="lg"
                    placeholder="e.g. +1 234 567 8900"
                    className="!border-t-blue-gray-200 focus:!border-blue-500 font-poppins"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    value={newBranchValues.phone_no}
                    name='phone_no'
                    onChange={handleNewBranch}
                  />
                </div>

                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium font-poppins">
                    Email Address <span className="text-red-500">*</span>
                  </Typography>
                  <Input
                    size="lg"
                    type="email"
                    placeholder="e.g. branch@company.com"
                    className="!border-t-blue-gray-200 focus:!border-blue-500 font-poppins"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    value={newBranchValues.email_address}
                    name='email_address'
                    onChange={handleNewBranch}
                  />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium font-poppins">
                    Country <span className="text-red-500">*</span>
                  </Typography>
                  <CustomSelect 
                    placeHolderTitle= 'Select Country'
                    value={newBranchValues?.country_code}
                    options={allCountries?.map((country_code) => ({ value: country_code.id, label: country_code.country_name }))} 
                    onChangeHandler={(selectedOption, e) => onChangeCountry(selectedOption, 'country_code', e)}
                    customStyles={false}
                  />
                </div>

                <div>
                  <Typography variant="small" color="blue-gray" className="mb-2 font-medium font-poppins">
                    Currency <span className="text-red-500">*</span>
                  </Typography>
                  <Input
                    size="lg"
                    placeholder="e.g. USD"
                    className="!border-t-blue-gray-200 focus:!border-blue-500 font-poppins"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                    value={newBranchValues.currency}
                    name='currency'
                    onChange={handleNewBranch}
                    // disabled // Typically currency is auto-selected based on country, but leaving editable if needed
                    readOnly
                  />
                </div>
            </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
           <Button
              variant="text"
              color="gray"
              onClick={closeBranchDrawer}
              className="font-poppins normal-case"
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className={`font-poppins normal-case px-6 ${isFormValid ? 'bg-bgBlue shadow-blue-500/20' : 'bg-blue-200 shadow-none'}`}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Branch'}
            </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateNewBranch

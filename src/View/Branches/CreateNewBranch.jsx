import { Input, Button } from '@material-tailwind/react'
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
    <>
      <div className=''>
        <form className='' onSubmit={(e) => addNewBranch(e, closeBranchDrawer)}>
          <div className='flex flex-col gap-4'>
            <div>
              <Input
                required
                label='Enter Branch Name'
                color='blue'
                value={newBranchValues.branch_name}
                name='branch_name'
                onChange={handleNewBranch}
              />
            </div>
            <div>
              <Input
                required
                label='Enter Branch Address'
                color='blue'
                value={newBranchValues.branch_address}
                name='branch_address'
                onChange={handleNewBranch}
              />
            </div>

            <div>
              <Input
                required
                label='Enter Phone No'
                color='blue'
                value={newBranchValues.phone_no}
                name='phone_no'
                className='w-64'
                onChange={handleNewBranch}
              />
            </div>

            <div>
              <Input
                required
                label='Enter Email Address'
                color='blue'
                value={newBranchValues.email_address}
                name='email_address'
                className='w-64'
                onChange={handleNewBranch}
              />
            </div>

            <div>
              <label className='text-[#7a929e]'>Select Country</label>
            <CustomSelect 
              required
              placeHolderTitle= 'Country'
              value={newBranchValues?.country_code}
              options={allCountries?.map((country_code) => ({ value: country_code.id, label: country_code.country_name }))} 
              onChangeHandler={(selectedOption, e) => onChangeCountry(selectedOption, 'country_code', e)}
              customStyles={false}
            />

            </div>

            <div>
              <Input
                required
                label='Enter Currency'
                color='blue'
                value={newBranchValues.currency}
                className='w-64'
                onChange={handleNewBranch}
              />
            </div>

            <div>
              {isLoading ? (
                <Button
                  className='bg-blue-300 py-[10px] capitalize'
                  loading={true}
                >
                  Loading
                </Button>
              ) : (
                <Button
                  type='submit'
                  className={`py-[10px] capitalize ${isFormValid ? 'bg-blue-500' : 'bg-blue-200'}`}
                  disabled={!isFormValid}
                >
                  Submit
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  )
}

export default CreateNewBranch

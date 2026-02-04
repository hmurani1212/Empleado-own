import { Select } from '@material-tailwind/react'
import React from 'react'
import CustomSelect from '../../Components/CustomSelect/CustomSelect'
import useDepartments from '../../ViewModel/DepartmentsViewModel/DepartmentsServices'
import CustomButton from '../../Components/CustomButton/CustomButton'
import { useParams } from "react-router-dom";
const ChangeHod = () => {
  const { allSuggestionsEmp, onChangeEmpHod, empIdHod, handleUpdatingHod } = useDepartments();

 const { id } = useParams();
// console.log('what is the myParams' ,id)
  return (
    <>
      <div className='flex flex-col space-y-4 px-[1.1vw]'>
        <div className=''>
          <label>Select Employee</label>
          <CustomSelect
            placeHolderTitle='Employee'
            value={empIdHod?.emp_Id}
            options={allSuggestionsEmp?.map((employee) => ({
              value: employee.id,
              label: employee.name
            }))}
            onChangeHandler={(selectedOption, e) => onChangeEmpHod(selectedOption, 'emp_Id', e)}
            cStyle={true}
          />
        </div>

        <div>

          <CustomButton title='Update'
            loading={empIdHod.loading ? true : false}
            onClick={handleUpdatingHod} />
        </div>
      </div>


    </>
  )
}

export default ChangeHod
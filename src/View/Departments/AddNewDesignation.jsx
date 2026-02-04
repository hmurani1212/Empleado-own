import { Button, IconButton, Input } from '@material-tailwind/react'
import React from 'react'
import useDepartments from '../../ViewModel/DepartmentsViewModel/DepartmentsServices'
import { FaXmark } from 'react-icons/fa6';
import CustomButton from '../../Components/CustomButton/CustomButton';

const AddNewDesignation = () => {
    const {handleNewDesignations, handleInputChangeDes, handleRemoveNewDesignation, newDesigValue, handleAddDesig} = useDepartments()

    
  return (
    <>
    <div className='flex flex-col space-y-4'>
        {newDesigValue.designations?.map((designation, index) => (
            <div className='flex items-center justify-between' key={designation.id}>
                <div key={index} className='w-96'>
                    <Input
                    label='Designation'
                    value={designation.value}
                    color='blue'
                    onChange={(event) => handleInputChangeDes(index, event)}
                    name="value"
                    />
                    </div>
                    {newDesigValue.designations.length > 1 && 
                    <div>
                        <IconButton color="red" onClick={() => handleRemoveNewDesignation(index)}>
                            <FaXmark />
                            </IconButton>
                    </div>
                    }  
            </div>  
        ))}
        <div>
            <Button className='bg-[#8bc9f8] capitalize p-2 font-medium' onClick={handleNewDesignations}>Add More Designation</Button>
        </div>

        <div>
            <CustomButton title='submit' onClick = {handleAddDesig}/>
        </div>
    </div>
    </>
  )
}

export default AddNewDesignation
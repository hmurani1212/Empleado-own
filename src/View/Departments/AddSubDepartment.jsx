import React from 'react'
import useSubDept from '../../ViewModel/DepartmentsViewModel/SubDeptServices'
import { Button, IconButton, Input } from '@material-tailwind/react'
import { FaXmark } from 'react-icons/fa6'

const AddSubDepartment = (props) => {

    const { data } = props

    const { submitSubDept, newDesigValue, handleNewDesignations, handleRemoveNewDesignation, handleInputChangeDes, handleChangeDesignation} = useSubDept()
  return (
    <div className='flex flex-col gap-2'>
        <div>
            <Input
                label='Department Name'
                value={newDesigValue.dept_name}
                color='blue'
                name="dept_name"

                onChange={handleChangeDesignation}
            />
        </div>
        <div>

            <Input
                label='Department Description'
                value={newDesigValue.dept_description}
                color='blue'
                name="dept_description"
                 onChange={handleChangeDesignation}               
            />
        </div>
        <div className='flex flex-col gap-2'>
        
            {newDesigValue.designations?.map((designation, index) => (
                <div className='flex items-center justify-between'>
                    <div key={index} className={`${newDesigValue.designations.length === 1 ? 'w-full'  : 'w-96'}`}>
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
                            <IconButton color="red" className='w-7 h-7' onClick={() => handleRemoveNewDesignation(index)}>
                                <FaXmark className='text-[11px]' />
                            </IconButton>
                        </div>
                    
                    }  
                </div>
                
            ))}
        </div>

        <div>
            <Button className='bg-[#8bc9f8] capitalize p-2 font-medium' loading={newDesigValue.loading ? true : false} onClick={handleNewDesignations}>Add New Designation</Button>
        </div>
        <div>
            <Button className='bg-[#8bc9f8] capitalize p-2 font-medium' onClick={(e)=>submitSubDept(e, data)}>Submit</Button>
        </div>
    </div>
  )
}

export default AddSubDepartment
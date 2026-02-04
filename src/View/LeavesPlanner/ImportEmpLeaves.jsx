import { Input } from '@material-tailwind/react'
import React from 'react'
import CustomButton from '../../Components/CustomButton/CustomButton'
import excelTemp from '../../assets/template/Empleado-Leave-Balance-Used-Template.xlsx'


const ImportEmpLeaves = () => {
  return (
    <>
    <div className='text-[12px] flex flex-col space-y-4'>
        <div>
            <span className='text-[#007bff]'>Please note that this feature can only be used to import your employees leaves being used before your Empleado account was created.</span>
        </div>

        <div  className='border-b-[1px]'></div > 

        <div>
            <div className='text-[14px]'>Excel Sheet Template</div>
            <a href={excelTemp} className='text-[#007bff] cursor-pointer'>Please Download and fill the data according to this excel template.</a>
        </div>

        <div>
            <Input type='file' label='Choose File' className='h-[45px]'/>
        </div>

        <div>
            <CustomButton title='Import'/>

        </div>
    </div>
    </>
  )
}

export default ImportEmpLeaves
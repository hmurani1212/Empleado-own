import { Button } from '@material-tailwind/react'
import React from 'react'

const SubmitButton = (props) => {
  const { title = 'Submit', loading } = props; 
   
  return (
    <>
    <Button type='submit' className='bg-[#8bc9f8] capitalize p-2 font-medium text-[12px] cursor-pointer' loading={loading} >{title}</Button>
    </>
  )
}

export default SubmitButton
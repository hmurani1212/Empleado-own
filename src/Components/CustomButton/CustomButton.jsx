import { Button } from '@material-tailwind/react'
import React from 'react'

const CustomButton = (props) => {
  const { title, onClick, loading = false, type = "submit", icon, className = '' } = props
  return (
    <>
      <Button className={`capitalize py-2 px-4 cursor-pointer font-medium text-[12px] bg-bgBlue flex items-center gap-2 ${className}`} loading={loading} onClick={onClick} type={type}>
        {icon && <span>{icon}</span>}
        {title}
      </Button>
    </>
  )
}

export default CustomButton

{/* <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Default</button> */ }
import { Dialog, DialogBody, DialogHeader } from '@material-tailwind/react'
import React from 'react'
import { IoClose } from "react-icons/io5";

const GoogleFormDialog = (props) => {
    const { openDialog , handleOpen, title, compo, size } = props
  return (
    <Dialog open={openDialog} handler={handleOpen} size={size}>
        <DialogHeader className='justify-between'>
          <div>
          {title}
          </div>
          <div>
          <IoClose onClick={handleOpen} className='cursor-pointer'/>
          </div>
          </DialogHeader>
        <DialogBody className=''>
          {compo}
        </DialogBody>
    </Dialog>
  )
}

export default GoogleFormDialog
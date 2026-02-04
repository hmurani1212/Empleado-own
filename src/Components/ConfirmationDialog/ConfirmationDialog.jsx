import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, } from '@material-tailwind/react'
import React from 'react'

const ConfirmationDialog = (props) => {
    const { openDialog , handleOpen, title, message, handleConfirm, loading=false, size=true } = props

    return (
      <Dialog open={openDialog} handler={handleOpen} size={size ? "xs" :"md"}>
        <DialogHeader className='justify-center text-[20px]'>{title} </DialogHeader>
        <hr className="border-t border-gray-300" />
        <DialogBody className='text-center text-[15px]'>{message}</DialogBody>
        <DialogFooter  className='flex justify-center items-center gap-2'>
          <Button className='bg-[#F55E67] px-4 py-2 font-normal' onClick={handleOpen}>
            Cancel
          </Button>
          <Button className='mr-2 bg-[#3DA5F4] py-2 px-4 font-normal' onClick={handleConfirm} loading={loading}>
            {loading ? 'Loading' : 'Confirm'}
          </Button>
        </DialogFooter>

      </Dialog>
    )

}

export default ConfirmationDialog

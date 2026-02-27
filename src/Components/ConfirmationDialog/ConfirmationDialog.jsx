import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, ThemeProvider } from '@material-tailwind/react'
import React from 'react'

const confirmationDialogTheme = {
  dialog: {
    styles: {
      base: {
        backdrop: {
          backgroundColor: "bg-transparent",
          backdropFilter: "backdrop-blur-none",
        },
      },
    },
  },
}

const ConfirmationDialog = (props) => {
    const { openDialog , handleOpen, title, message, handleConfirm, loading=false, size=true } = props

    return (
      <ThemeProvider value={confirmationDialogTheme}>
      <Dialog
      overlayProps={{
        className: "!bg-transparent !backdrop-blur-none",
        style: { backgroundColor: "transparent", backdropFilter: "none" },
      }}
      open={openDialog} handler={handleOpen} size={size ? "xs" :"md"}>
        <DialogHeader className='justify-center text-[20px]'>{title} </DialogHeader>
        <hr className="border-t border-gray-300" />
        <DialogBody className='text-center text-[15px]'>{message}</DialogBody>
        <DialogFooter  className='flex justify-center items-center gap-2'>
          <Button className='bg-[#F55E67] px-4 py-2 font-normal' onClick={() => handleOpen(false)}>
            Cancel
          </Button>
          <Button className='mr-2 bg-[#3DA5F4] py-2 px-4 font-normal' onClick={handleConfirm} loading={loading}>
            {loading ? 'Loading' : 'Confirm'}
          </Button>
        </DialogFooter>

      </Dialog>
      </ThemeProvider>
    )

}

export default ConfirmationDialog

import { Button, Dialog, DialogBody, DialogFooter, DialogHeader } from '@material-tailwind/react'
import React from 'react'
import { IoClose } from "react-icons/io5";

const CustomDialog = (props) => {
  const { openDialog , handleOpen, title, compo, handleConfirm, size, showBtns, confirmBtn, switchBtn=false, footer=true, outsidePress=true, backgroundColor} = props
  
  // Check if size contains custom CSS classes
  const isCustomSize = size && (size.includes('h-[') || size.includes('w-['))
  const dialogSize = isCustomSize ? undefined : size
  
  // Extract width and height classes
  const widthClass = size && size.includes('w-[') ? size.match(/w-\[([^\]]+)\]/)?.[0] : ''
  const heightClass = size && size.includes('h-[') ? size.match(/h-\[([^\]]+)\]/)?.[0] : ''
  
  // Create custom className with proper Material Tailwind overrides
  const customClassName = isCustomSize ? `${widthClass} ${heightClass} max-w-none` : ''
  
  return (
    <Dialog 
      open={openDialog} 
      handler={handleOpen} 
      size={dialogSize} 
      dismiss={{ outsidePress: outsidePress }}
      className={customClassName}
      style={{
        backgroundColor: backgroundColor ? '#6691cc' : backgroundColor,
        ...(isCustomSize ? {
          '--tw-w': size.includes('w-[') ? size.match(/w-\[([^\]]+)\]/)?.[1] : undefined,
          '--tw-h': size.includes('h-[') ? size.match(/h-\[([^\]]+)\]/)?.[1] : undefined,
          width: size.includes('w-[') ? size.match(/w-\[([^\]]+)\]/)?.[1] : undefined,
          height: 'auto',
          // height: size.includes('h-[') ? size.match(/h-\[([^\]]+)\]/)?.[1] : undefined,
          maxWidth: 'none',
          maxHeight: 'none'
        } : {}),
        ...(backgroundColor ? { backgroundColor: backgroundColor } : {})
      }}
    >
        <DialogHeader className='justify-between'>
          <div className={`flex flex-1 items-center justify-center ${backgroundColor ? 'text-white' : ''}`}>
          {title}
          </div>
          <div>
          <IoClose onClick={handleOpen} className={`cursor-pointer ${backgroundColor ? 'text-white' : ''}`}/>
          </div>
          </DialogHeader>
        <DialogBody className={`customScroll overflow-y-auto overflow-x-hidden ${compo ? 'max-h-[calc(100vh-200px)]' : 'min-h-[auto]'}`}>
          {compo}
        </DialogBody>
        {footer &&
            <DialogFooter>

              <div className='flex gap-4'>
                <Button
                 className={switchBtn ? "bg-brand-500 hover:bg-brand-600" :"bg-red-500 hover:bg-red-600"}
                onClick={handleOpen}
                // className="mr-1"
                >
                  <span className='font-normal'>{switchBtn ? 'Ok' : 'Close'}</span>
                </Button>
                
                {showBtns && 
                <Button  className='font-normal bg-brand-500 hover:bg-brand-600' onClick={handleConfirm}>
                  <span >Confirm</span>
                </Button>
                }

                {confirmBtn && 
                <Button  className='font-normal bg-brand-500 hover:bg-brand-600' type='submit' >
                  <span>Confirm Form</span>
                </Button>
                }
              </div>
            
            
            </DialogFooter>
        }
    </Dialog>
  )
}

export default CustomDialog
import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, ThemeProvider } from '@material-tailwind/react'
import React from 'react'
import { IoClose } from "react-icons/io5";

/** Default dialog width tier when `size` is omitted — keeps modal dialogs visually consistent app-wide */
const DEFAULT_DIALOG_SIZE = 'lg'

const CustomDialog = (props) => {
  const { openDialog , handleOpen, title, compo, handleConfirm, size: sizeProp = DEFAULT_DIALOG_SIZE, showBtns, confirmBtn, switchBtn=false, footer=true, outsidePress=true, backgroundColor, headerClassName, bodyClassName, scrollableBody = false, minimalHeader = false} = props
  const size = sizeProp
  
  // Check if size contains custom CSS classes
  const isCustomSize = size && (size.includes('h-[') || size.includes('w-['))
  const dialogSize = isCustomSize ? undefined : size
  
  // Extract width and height classes
  const widthClass = size && size.includes('w-[') ? size.match(/w-\[([^\]]+)\]/)?.[0] : ''
  const heightClass = size && size.includes('h-[') ? size.match(/h-\[([^\]]+)\]/)?.[0] : ''
  
  // Create custom className with proper Material Tailwind overrides
  const customClassName = isCustomSize ? `${widthClass} ${heightClass} max-w-none` : ''
  const hasHeaderBg = !!backgroundColor

  const customTheme = {
    dialog: {
      styles: {
        base: {
          backdrop: {
            backgroundColor: "bg-black/10",
            backdropFilter: "backdrop-blur-xs",
          },
        },
      },
    },
  };
  
  return (
    <ThemeProvider value={customTheme}>
    <Dialog 
      open={openDialog} 
      handler={handleOpen} 
      size={dialogSize} 
      className={scrollableBody && compo ? '!flex !flex-col !max-h-[min(95dvh,calc(100dvh-0.5rem))] !overflow-hidden' : undefined}
      animate={{
        mount: { scale: 1, y: 0, opacity: 1 },
        unmount: { scale: 0.96, y: -20, opacity: 0 },
      }}
     
      style={{
        backgroundColor: backgroundColor ? '#6691cc' : backgroundColor,
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
        overflow: 'hidden',
        ...(isCustomSize ? {
          '--tw-w': size.includes('w-[') ? size.match(/w-\[([^\]]+)\]/)?.[1] : undefined,
          '--tw-h': size.includes('h-[') ? size.match(/h-\[([^\]]+)\]/)?.[1] : undefined,
          width: size.includes('w-[') ? size.match(/w-\[([^\]]+)\]/)?.[1] : undefined,
          height: 'auto',
          maxWidth: 'none',
          maxHeight: 'none'
        } : {}),
        ...(backgroundColor ? { backgroundColor: backgroundColor } : {})
      }}
    >
        <DialogHeader className={`justify-between shrink-0 px-5 py-4 ${hasHeaderBg ? 'border-b border-white/20' : minimalHeader ? '!border-b-0 bg-white' : 'border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/90 to-slate-100/80 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8)]'} ${headerClassName || ''} ${hasHeaderBg ? '!text-white !bg-transparent' : 'text-slate-800'}`}>
          {!minimalHeader ? (
          <div className={`flex flex-1 items-center justify-center font-poppins text-lg sm:text-xl font-semibold tracking-tight ${hasHeaderBg ? '!text-white' : 'text-slate-800'}`}>
          {title}
          </div>
          ) : (
          <div className="flex min-w-0 flex-1" aria-hidden="true" />
          )}
          <button
            type="button"
            onClick={handleOpen}
            aria-label="Close"
            className={`p-2 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 ${hasHeaderBg ? 'text-white hover:bg-white/20 focus:ring-white/50' : 'text-slate-500 hover:bg-slate-100 focus:ring-slate-300'}`}
          >
            <IoClose className="w-5 h-5 cursor-pointer" />
          </button>
          </DialogHeader>
        <DialogBody className={`customScroll overflow-x-hidden text-slate-700 bg-gradient-to-b from-slate-100/80 via-slate-50/60 to-slate-100/80 ${
          scrollableBody && compo
            ? '!flex-1 !min-h-0 !overflow-y-auto !p-0'
            : compo
              ? 'max-h-[calc(100vh-180px)] overflow-y-auto p-4'
              : 'min-h-[auto]'
        } ${bodyClassName || ''}`}>
          {compo}
        </DialogBody>
        {footer &&
            <DialogFooter>

              <div className='flex gap-4'>
                <Button
                 className={switchBtn ? "bg-brand-500 hover:bg-brand-600 cursor-pointer" :"bg-red-500 hover:bg-red-600 cursor-pointer"}
                onClick={handleOpen}
                // className="mr-1"
                >
                  <span className='font-normal'>{switchBtn ? 'Ok' : 'Close'}</span>
                </Button>
                
                {showBtns && 
                <Button  className='font-normal bg-brand-500 hover:bg-brand-600 cursor-pointer' onClick={handleConfirm}>
                  <span >Confirm</span>
                </Button>
                }

                {confirmBtn && 
                <Button  className='font-normal bg-brand-500 hover:bg-brand-600 cursor-pointer' type='submit' >
                  <span>Confirm Form</span>
                </Button>
                }
              </div>
            
            
            </DialogFooter>
        }
    </Dialog>
    </ThemeProvider>
  )
}

export default CustomDialog
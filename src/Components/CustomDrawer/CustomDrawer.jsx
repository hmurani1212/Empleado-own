import { Drawer } from '@material-tailwind/react'
import React, { useEffect, useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { useDrawerWidthPx } from '../../hooks/useDrawerWidthPx'

const CustomDrawer = (props) => {
  const { open, closeDrawer, compo, direction = 'right', title, widthSize, customImg = false, image } = props
  /** Mobile hamburger menu keeps its width; all other side drawers use 47vw (responsive). */
  const drawerWidthPx = useDrawerWidthPx({ widthSize, customImg })
  const [shouldRender, setShouldRender] = useState(!!open)
  const [isToastVisible, setIsToastVisible] = useState(false)

  // Unmount closed drawers to avoid "stuck" side panel on resize/zoom.
  // Keep it mounted briefly so Material Tailwind can remove its overlay cleanly.
  useEffect(() => {
    if (open) {
      setShouldRender(true)
      return
    }
    const t = setTimeout(() => setShouldRender(false), 250)
    return () => clearTimeout(t)
  }, [open])

  // Monitor for toast visibility
  useEffect(() => {
    const checkForToasts = () => {
      const toasts = document.querySelectorAll('.Toastify__toast');
      setIsToastVisible(toasts.length > 0);
    };

    // Check initially
    checkForToasts();

    // Set up interval to check for toasts
    const interval = setInterval(checkForToasts, 100);

    // Cleanup
    return () => clearInterval(interval);
  }, []);

  const handleDrawerClose = (e) => {
    // If toasts are visible, don't close the drawer
    if (isToastVisible) {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      return;
    }
    closeDrawer();
  };

  if (!shouldRender) return null

  return (
    <Drawer 
      open={open} 
      onClose={handleDrawerClose} 
      // className="flex flex-col overflow-hidden h-full bg-white shadow-2xl border-l border-slate-100" 
      placement={direction}
      // size={drawerWidthPx}
      className="flex flex-col overflow-hidden h-full bg-white shadow-2xl border-l border-gray-300" 
      // placement={direction} 
      size={drawerWidthPx}
      overlayProps={{
        className: "fixed inset-0 w-full h-full !bg-transparent !backdrop-blur-none z-[9995]",
      }}
    >
        {/* Sticky header - stays visible when content scrolls */}
        <div className="shrink-0 border-b border-gray-200 bg-gradient-to-b from-white to-slate-50/50 px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.9)]">
          <div className="flex items-center justify-between">
            {customImg ? 
              <img src={image} alt='logo' 
                height="30"
                width="130"
              />
            :
            <h2 className="text-base font-semibold font-poppins text-slate-800 tracking-tight">
              {title}
            </h2>
            }
            <button
              onClick={handleDrawerClose}
              className="p-2 -m-2 cursor-pointer rounded-lg text-slate-500 hover:text-red-500 hover:bg-slate-100 flex justify-center items-center transition-all duration-200"
              title="Close"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>
        {/* Scrollable content area */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden customDrwerScroll px-4 pb-4">
            {compo}
        </div>
      </Drawer>
  )
}

export default CustomDrawer
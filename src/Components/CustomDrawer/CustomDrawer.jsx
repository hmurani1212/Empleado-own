import { Drawer, IconButton, Typography } from '@material-tailwind/react'
import React, { useEffect, useState } from 'react'
import { FaTimes } from 'react-icons/fa'

const CustomDrawer = (props) => {
  const { open, closeDrawer, compo, direction="right", title, widthSize='45vw', customImg=false, image} = props
  const [isToastVisible, setIsToastVisible] = useState(false)

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

  return (
    <Drawer open={open} onClose={handleDrawerClose} 
      className="px-4 py-2 customDrwerScroll h-full overflow-auto" placement={direction} size={widthSize}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
        <div className="flex items-center justify-between px-[0.10vw] py-[0.5vw]">
          {customImg ? 
            <img src={image} alt='logo' 
              height="30"
              width="130"
            />
          :
          <Typography className='text-lg font-medium font-Urbanist text-gray-800'>
            {title}
          </Typography>

          }
          {/* <IconButton variant="text" color="blue-gray" onClick={closeDrawer}> */}
          <button
            onClick={closeDrawer}
            className="w-[20px] h-[20px] hover:text-red-500 flex justify-center items-center hover:rotate-180 transition-all duration-300 "
            title="Close"
          >
            <FaTimes size={16} />
          </button>
          {/* </IconButton> */}
        </div>
        <hr className='mb-2' />
        <div>
            {compo}
        </div>
      </Drawer>
  )
}

export default CustomDrawer
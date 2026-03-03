import { Drawer, IconButton, Typography } from '@material-tailwind/react';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { FaTimes } from 'react-icons/fa';

const PortalDrawer = (props) => {
  const { open, closeDrawer, compo, direction = "right", title, widthSize = '45vw', customImg = false, image, zIndex } = props;
  const [isToastVisible, setIsToastVisible] = useState(false)
  
  // Track toast presence to avoid accidental drawer close while interacting with toasts
  useEffect(() => {
    const checkForToasts = () => {
      const toasts = document.querySelectorAll('.Toastify__toast');
      setIsToastVisible(toasts.length > 0);
    };

    checkForToasts();
    const interval = setInterval(checkForToasts, 100);
    return () => clearInterval(interval);
  }, []);

  // No aggressive overlay cleanup on close - it was removing critical DOM nodes
  // (e.g. app root or portal container) and causing a blank white page.
  // The Drawer receives open={false} and should clean up its own overlay.

  const handleDrawerClose = (e) => {
    if (isToastVisible) {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      return;
    }
    closeDrawer?.();
  };

  // Always render Drawer with open prop so it can properly remove overlay on close.
  // Returning null when !open caused the overlay to stay (whitening the screen).
  const drawerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...(zIndex != null && { zIndex }),
  };

  return ReactDOM.createPortal(
    <>
      <style>{`
        .portal-drawer-fit-content,
        .portal-drawer-fit-content > div {
          height: fit-content !important;
          max-height: 100vh !important;
        }
      `}</style>
    <Drawer 
      open={open} 
      onClose={handleDrawerClose}
      className="px-4 py-2 customDrwerScroll overflow-auto h-full max-w-[620px]"
      placement={direction}
      size={widthSize}
      style={drawerStyle}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-[0.10vw] pt-[1.1vw] flex-shrink-0">
          {customImg ? 
            <img src={image} alt="logo" height="30" width="130" />
            :
            <Typography className='text-[1.2vw] font-medium font-Urbanist text-[#474747]'>
              {title}
            </Typography>
          }
          <button
            onClick={() => closeDrawer?.()}
            className="w-[20px] h-[20px] hover:text-red-500 flex justify-center items-center hover:rotate-180 transition-all duration-300 "
            title="Close"
          >
            <FaTimes size={16} />
          </button>
        </div>
        <hr className='mb-2 flex-shrink-0' />
        <div className="flex-shrink-0 pb-0">
          {open ? compo : null}
        </div>
      </div>
    </Drawer>
    </>,
    document.body
  );
};

export default PortalDrawer;


// import { Drawer, IconButton, Typography } from '@material-tailwind/react';
// import React from 'react';
// import ReactDOM from 'react-dom';

// const PortalDrawer = (props) => {
//   const { open, closeDrawer, compo, direction = "right", title, widthSize = 900, customImg = false, image } = props;
  
//   // console.log('PortalDrawer - open:', open);
//   // console.log('PortalDrawer - title:', title);

//   return ReactDOM.createPortal(
//     <Drawer 
//       open={open} 
//       onClose={closeDrawer}
//       className="px-4 py-2 customDrwerScroll h-full overflow-auto"
//       placement={direction}
//       size={widthSize}
//       style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
//     >
//       <div className="mb-2 flex items-center justify-between">
//         {customImg ? 
//           <img src={image} alt="logo" height="30" width="130" />
//           :
//           <Typography variant="h5" color="blue-gray">
//             {title}
//           </Typography>
//         }
//         <IconButton variant="text" color="blue-gray" onClick={closeDrawer}>
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//             strokeWidth={2}
//             stroke="currentColor"
//             className="h-5 w-5"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d="M6 18L18 6M6 6l12 12"
//             />
//           </svg>
//         </IconButton>
//       </div>
//       <div>
//         {compo}
//       </div>
//     </Drawer>,
//     document.body // This specifies that the drawer should be rendered as a child of the <body> element.
//   );
// };

// export default PortalDrawer;
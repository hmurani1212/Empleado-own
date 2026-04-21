import { Drawer, Typography } from '@material-tailwind/react';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { useDrawerWidthPx } from '../../hooks/useDrawerWidthPx';

const PortalDrawer = (props) => {
  const { open, closeDrawer, compo, direction = "right", title, widthSize: _widthSize, customImg = false, image, zIndex } = props;
  /** `widthSize` kept in API for compatibility; width is always the shared 47vw (see `useDrawerWidthPx`). */
  const drawerWidthPx = useDrawerWidthPx({ widthSize: _widthSize, customImg: false })
  const [shouldRender, setShouldRender] = useState(!!open)
  
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

  // No aggressive overlay cleanup on close - it was removing critical DOM nodes
  // (e.g. app root or portal container) and causing a blank white page.
  // The Drawer receives open={false} and should clean up its own overlay.

  const handleDrawerClose = () => {
    closeDrawer?.();
  };

  // Do not force full-viewport `style` on <Drawer> — it breaks Material Tailwind’s internal
  // overlay/panel layout so backdrop click and onClose often never complete (drawer “stuck”).
  const drawerZStyle = zIndex != null ? { zIndex } : undefined;

  if (!shouldRender) return null

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
      dismissible={true}
      className="flex flex-col overflow-hidden h-full bg-white shadow-2xl border-l border-gray-300"
      placement={direction}
      size={drawerWidthPx}
      style={drawerZStyle}
      overlayProps={{
        className: "fixed inset-0 bg-black/40 z-[9998]",
      }}
    >
      <div className="shrink-0 border-b border-gray-200 bg-gradient-to-b from-white to-slate-50/50 px-4 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_0_rgba(255,255,255,0.9)]">
        <div className="flex items-center justify-between">
          {customImg ? (
            <img src={image} alt="logo" height="30" width="130" />
          ) : (
            <Typography className="text-base font-semibold font-poppins text-slate-800 tracking-tight">
              {title}
            </Typography>
          )}
          <button
            type="button"
            onClick={handleDrawerClose}
            className="p-2 -m-2 cursor-pointer rounded-lg text-slate-500 hover:text-red-500 hover:bg-slate-100 flex justify-center items-center transition-all duration-200"
            title="Close"
          >
            <FaTimes size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden customDrwerScroll px-4 pb-4">
        {shouldRender ? compo : null}
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
import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const Toaster = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={1500}
      newestOnTop
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      style={{zIndex:99999}}
      onClick={(e) => {
        // Prevent event bubbling to avoid closing drawers when clicking toasts
        e.stopPropagation();
      }}
    />
  );
};

const showToast = (message, type = 'info') => {
  switch (type) {
    case 'success' || 'ok':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'warnning':
      toast.warn(message);
      break;
    default:
      toast.info(message);
  }
};


export { Toaster, showToast};
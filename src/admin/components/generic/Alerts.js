import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const ToastContainerWrapper = () => {
  return (
    <ToastContainer
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss={false}
      draggable
      pauseOnHover
      position={toast.POSITION.BOTTOM_CENTER}
    />
  );
};


export function showToast(message, type, id = null) {
  switch (type) {
    case 'success':
      toast.success(message, {
        toastId: id
      });
      break;
    case 'error':
      toast.error(message, {
        toastId: id
      });
      break;
    case 'info':
      toast.info(message, {
        toastId: id
      });
      break;
    case 'warning':
      toast.warning(message, {
        toastId: id
      });
      break;
    default:
      toast(message, {
        toastId: id
      });
  }
};

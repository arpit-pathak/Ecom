import React from 'react'
import ReactDom from 'react-dom'
import { MODAL_STYLES, OVERLAY_STYLES } from '../../styles/ModalStyles'

const Modal = ({
  onClose,
  confirm,
  title,
  confirmText,
  cancelText,
  form,
}) => {

  const handleOnConfirm = (e) => {
    e.preventDefault();
    confirm(true)
  }

  return ReactDom.createPortal(
    <>
      <div style={OVERLAY_STYLES} />
      <div style={MODAL_STYLES} className="rounded-lg">
        <button type="button" onClick={onClose} data-modal-hide="popup-modal" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white">
          <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
        <div className="p-4 mt-6 text-center">
          <h3 className="mb-5 text-md font-normal text-gray-500 dark:text-gray-400">{title}</h3>
          {form ? (
            form
          ) : (
            <>
              <button onClick={handleOnConfirm} data-modal-hide="popup-modal" type="button" className="mb-2 text-white bg-yellow-600 hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                {confirmText}
              </button>
              {cancelText &&
                <button onClick={onClose} data-modal-hide="popup-modal" type="button" className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">{cancelText}</button>
              }
            </>
          )}
        </div>
      </div>
    </>,
    document.getElementById('portal')
  );
};

export default Modal;



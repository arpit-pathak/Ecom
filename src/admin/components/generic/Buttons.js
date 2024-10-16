import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faMagnifyingGlass, faDownload, faUpload } from '@fortawesome/free-solid-svg-icons';

/**
 * Generic Button component to build button with consistent styles
 * @param {button text} text 
 * @param {onClick event } onClick 
 * @param {edit,view,delete,add,confirm,cancel} buttonType 
 * @param {py padding on y-axis} py 
 * @param {px padding on x-axis} px
 * @returns custom button 
 */
const Button = ({
  text,
  onClick,
  type,
  py,
  px,
  showIcon
}) => {
  let className = "mb-1 rounded flex items-center justify-left ";
  let icon;
  switch (type) {
    case "edit":
      className += `bg-blue hover:bg-blue text-white font-bold text-xs py-${py} px-${px}`;
      icon = faEdit;
      break;
    case "view":
      className += `bg-yellow-500 hover:bg-yellow-700 text-white font-bold text-xs py-${py} px-${px}`;
      icon = faMagnifyingGlass;
      break;
    case "delete":
      className += `bg-red-500 hover:bg-red-700 text-white font-bold text-xs py-${py} px-${px}`;
      icon = faTrash;
      break;
    case "add":
      className += `bg-green-500 hover:bg-green-700 text-white font-bold text-xs py-${py} px-${px}`;
      icon = faPlus;
      break;
    case "confirm": //Same style for approve
      className += `bg-yellow-500 hover:bg-yellow-700 text-white font-bold text-xs py-${py} px-${px}`;
      break;
    case "cancel":
      className += `bg-slate-300 hover:bg-gray-500 text-black font-bold text-xs py-${py} px-${px}`;
      break;
    case "Reject":
      className += `bg-red-400 hover:bg-red-500 text-white font-bold text-xs py-${py} px-${px}`;
      break;
    case "download":
      className += `bg-blue hover:bg-blue text-white font-bold text-xs py-${py} px-${px}`;
      icon = showIcon ? faDownload : null;
      break;
    case "upload":
      className += `bg-green-500 hover:bg-green-700 text-white font-bold text-xs py-${py} px-${px}`;
      icon = faUpload;
      break;
    case "transparent-blue":
      className += `bg-transparent hover:bg-blue text-blue font-bold hover:text-white border border-blue hover:border-transparent rounded text-xs py-${py} px-${px}`;
      break;
    case "transparent-green":
      className += `bg-transparent hover:bg-green-500 text-green-700 font-bold hover:text-white border border-green-500 hover:border-transparent rounded text-xs py-${py} px-${px}`;
      break;
    case "transparent-red":
      className += `bg-transparent hover:bg-red-500 text-red-700 font-bold hover:text-white border border-red-500 hover:border-transparent rounded text-xs py-${py} px-${px}`;
      break;
    case "transparent-yellow":
      className += `bg-transparent hover:bg-yellow-500 text-yellow-700 font-bold hover:text-white border border-yellow-500 hover:border-transparent rounded text-xs py-${py} px-${px}`;
      break;
    default:
      className += `bg-yellow-500 hover:bg-yellow-700 text-white font-bold text-xs py-${py} px-${px}`;
      break;
  }

  return (
    <button
      className={className}
      onClick={onClick}
    >
      {icon && <FontAwesomeIcon icon={icon} className="mr-1"/>}
      {text}
    </button>
  );
};
Button.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.object,
  onClick: PropTypes.func,
  type: PropTypes.string,
  py: PropTypes.string,
  px: PropTypes.string,
};

Button.defaultProps = {
  text: 'Button',
  className: '',
  type: 'add',
  py: '1',
  px: '2',
};

export default Button;

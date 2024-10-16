import '../../css/popupMessage.css';
import '../../css/animate.min.css';

import { Modal } from '../../customer/components/GenericComponents';

//icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

import successGif from '../../assets/success.gif';
import { AiFillWarning } from 'react-icons/ai';

export default function PopupMessage({ toggle, header, message, result }) {
    function handleClick() {
        toggle();
    };

    return <Modal
            width="max-md:w-3/4 w-4/12"
            open={true}
            children={
                <div>
                    <span className="flex justify-end cp" onClick={handleClick}>
                        <FontAwesomeIcon icon={faXmark} />  
                    </span>
                    {result === 'success' ?
                        <img src={successGif} alt='' className="modal-icon" />
                        : <AiFillWarning className='modal-icon' />}
                    {header != null &&
                        <div className='poptitle font-medium text-center'>{header}</div>
                    }

                    {message != null &&
                        <div className='text-sm text-grey mt-2 text-center'>{message}</div>
                    }
                </div>}
        />;



}
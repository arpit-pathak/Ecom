
import { Modal } from '../../customer/components/GenericComponents';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { AiFillWarning } from 'react-icons/ai';

export function ProductAddEligibilityPopup
({showPrompt, toggle}){
    return (
      <Modal
        width="w-4/12"
        open={showPrompt}
        children={
          <div>
            <span
              className="flex justify-end cp"
              onClick={toggle}
            >
              <FontAwesomeIcon icon={faXmark} />
            </span>
            <AiFillWarning className="modal-icon" />
            <div className="poptitle font-medium text-center">
              <span>
                You need to set-up your Shipping and Profile before you can add
                a product
              </span>
            </div>
          </div>
        }
      />
    );
  };
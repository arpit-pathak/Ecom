import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Modal } from "../../../customer/components/GenericComponents.js";

export default function ProofOfDeliveryPopup({
  closePodPopup,
  togglePodPopup,
  podDetails,
}) {
  return (
    <>
      <Modal
        open={togglePodPopup}
        children={
          <div>
            <div className="flex justify-between mb-3">
              <p className="text-lg font-semibold">Proof of Delivery</p>
              <span className="flex justify-end cp" onClick={closePodPopup}>
                <FontAwesomeIcon icon={faXmark} />
              </span>
            </div>
            <hr />
            <div className="flex justify-evenly gap-10 px-10">
              <div className="mt-4">
                <p className="text-sm font-bold my-5">Signature</p>
                <div className="flex justify-center">
                  <img src={podDetails.signature_img} alt="" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-bold my-5">Parcel Image</p>
                <img
                  src={podDetails.parcel_img}
                  alt=""
                  className="h-[200px] min-w-[200px]"
                />
              </div>
            </div>
            <hr className="my-5" />
            <div className="flex justify-end">
              <button
                className="cp text-center rounded-md bg-[#f5ab35] text-white h-8 px-6 mr-5"
                onClick={closePodPopup}
              >
                OK
              </button>
            </div>
          </div>
        }
      />
    </>
  );
}

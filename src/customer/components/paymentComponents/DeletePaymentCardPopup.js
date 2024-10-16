import React, { useState } from "react";
import { Modal } from "../GenericComponents";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";

const DeletePaymentCardPopup = ({
  showDeleteConfirmation,
  closeDeletePopup,
  cardToDelete,
  processDeleteResult,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const user = JSON.parse(localStorage.getItem("customer"));

  const callDeleteCard = () => {
    setIsDeleting(true);
    const formData = new FormData();
    formData.append("payment_method", cardToDelete.id);
    BuyerApiCalls(
      formData,
      Apis.paymentMethod,
      "DELETE",
      {
        Authorization: `Bearer ${user.access}`,
      },
      processDeleteRes
    );
  };

  const processDeleteRes = (res, api) => {
    processDeleteResult(res);
    setIsDeleting(false);
  };

  return (
    <Modal
      width="w-5/12"
      open={showDeleteConfirmation}
      children={
        <div>
          <p className="text-lg font-semibold mb-3">Payment Method Delete</p>
          <hr />
          <p className="text-sm my-4 pr-7 mb-4">
            Are you sure to delete the payment method ?
          </p>
          <div className="flex justify-end mt-10">
            <button
              className="cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5  disabled:opacity-50  disabled:cursor-default"
              disabled={isDeleting}
              onClick={callDeleteCard}
            >
              Yes
            </button>
            <button
              className="cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35] h-8 w-20 disabled:border-[#FFD086]
                                    disabled:cursor-default"
              disabled={isDeleting}
              onClick={closeDeletePopup}
            >
              No
            </button>
          </div>
        </div>
      }
    />
  );
};

export default DeletePaymentCardPopup;

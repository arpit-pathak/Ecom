import React, { useEffect, useState } from "react";
import PaymentForm from "../formComponents/modalForms/CreditCardForm";
import { Modal } from "./../GenericComponents";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import ls from "local-storage";
import { useLocation, useNavigate } from "react-router";
import PopupMessage from "../../../merchant/components/PopupMessage";
//css
import "react-credit-cards-2/es/styles-compiled.css";

//icons
import { AiOutlinePlusCircle, AiOutlineDelete } from "react-icons/ai";
import visaIcon from "../../../assets/buyer/paymentBrands/visa.png";
import masterIcon from "../../../assets/buyer/paymentBrands/mastercard.png";
import amexIcon from "../../../assets/buyer/paymentBrands/american-express.png";
import defaultBrand from "../../../assets/buyer/paymentBrands/credit-card.png";
import discoverIcon from "../../../assets/buyer/paymentBrands/discover.png";
import dinersIcon from "../../../assets/buyer/paymentBrands/diners-club.png";
import jcbIcon from "../../../assets/buyer/paymentBrands/jcb.png";
import { PageLoader } from "../../../utils/loader";
import DeletePaymentCardPopup from "../paymentComponents/DeletePaymentCardPopup";

const brandIcons = {
  visa: visaIcon,
  amex: amexIcon,
  mastercard: masterIcon,
  diners: dinersIcon,
  discover: discoverIcon,
  jcb: jcbIcon,
};

export default function PaymentCard() {
  const [openModal, setopenModal] = useState(false);
  const [PaymentCards, setPaymentCards] = useState([]);
  const user = JSON.parse(localStorage.getItem("customer"));
  const [showPopup, setShowPopup] = useState(false);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    retrieveCards();
    if (location.state?.loadAddCard) setopenModal(true);
  }, []);

  const retrieveCards = () => {
    setIsLoading(true);
    const formData = new FormData();
    BuyerApiCalls(
      formData,
      Apis.paymentMethod,
      "GET",
      {
        Authorization: `Bearer ${user.access}`,
      },
      processRes
    );
  };

  const processRes = (res, api) => {
    if (res.data.result === "SUCCESS") {
      setPaymentCards(res.data.data.user_payment_method);
      sessionStorage.setItem("SPK", res.data.data.publishable_key);
    }
    setIsLoading(false);
  };

  const close = () => {
    setopenModal(false);
  };

  const handleAddCard = (res) => {
    if (res.data.result === "SUCCESS") {
      if (location.state?.loadAddCard) {
        navigate(-1);
      } else {
        close();
        retrieveCards();
      }
    } else {
      setShowPopup(true);
      setResult(res.data);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setResult(null);
  };

  const deleteCard = (item) => {
    setShowDeleteConfirmation(true);
    setCardToDelete(item);
  };

  const processDeleteRes = (res, api) => {
    setShowDeleteConfirmation(false);
    setShowPopup(true);
    setResult(res.data);
    if (res.data.result === "SUCCESS") retrieveCards();
  };

  return (
    <React.Fragment>
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="flex flex-col flex-wrap h-auto md:basis-3/4 md:border-[1px] border-grey-300 px-4 py-4 rounded-lg">
          <p className="text-lg font-bold mb-4">Payment</p>
          <div className="flex flex-row flex-wrap gap-8 mx-auto">
            {PaymentCards.length < 3 && (
              <div className=" mx-auto flex items-center w-72 h-48 justify-center grow-0  border-2 shadow-lg rounded-[15px]">
                <button
                  className="flex-col items-center justify-center"
                  onClick={() => setopenModal(true)}
                >
                  <div className="flex flex-wrap items-center">
                    <AiOutlinePlusCircle
                      className="grow text-amber-500"
                      size={45}
                    />
                  </div>
                  Add Card
                </button>
                <Modal
                  open={openModal}
                  close={() => setopenModal(false)}
                  width={"w-1/2"}
                >
                  <PaymentForm
                    handleAddCard={handleAddCard}
                    close={close}
                  ></PaymentForm>
                </Modal>
              </div>
            )}
            {PaymentCards.map((PaymentCard, index) => {
              return (
                <div
                  key={index}
                  className="w-72 h-48 gap-2 px-4 grow-0  border-2
               shadow-lg rounded-[15px] mx-auto"
                >
                  <div className="my-6 h-10">
                    <img
                      src={brandIcons[PaymentCard.brand] ?? defaultBrand}
                      alt=""
                      className="h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-sm mb-3">
                      Card Number : **** ***** **** {PaymentCard?.last4}
                    </p>
                    <p className="text-sm">
                      Expiry : {PaymentCard?.exp_month}
                      {" / "}
                      {PaymentCard?.exp_year}
                    </p>
                  </div>
                  <div
                    className="mt-2 cp flex justify-end"
                    onClick={(e) => deleteCard(PaymentCard)}
                  >
                    <AiOutlineDelete color="orange" size="25px" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {showDeleteConfirmation && (
        <DeletePaymentCardPopup
          closeDeletePopup={() => setShowDeleteConfirmation(false)}
          showDeleteConfirmation={showDeleteConfirmation}
          cardToDelete={cardToDelete}
          processDeleteResult={processDeleteRes}
        />
      )}
      {showPopup && (
        <PopupMessage
          toggle={closePopup}
          header={result.result === "SUCCESS" ? "Successful" : "Failed"}
          message={result.message}
          result={result.result.toLowerCase()}
        />
      )}
    </React.Fragment>
  );
}

import React, { useEffect, useState } from "react";
import PaymentForm from "../formComponents/modalForms/CreditCardForm";
import { AiFillDelete, AiFillPlusCircle } from "react-icons/ai";
import { Modal } from "../GenericComponents";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import ls from "local-storage";
import visaIcon from "../../../assets/buyer/paymentBrands/visa.png";
import masterIcon from "../../../assets/buyer/paymentBrands/mastercard.png";
import amexIcon from "../../../assets/buyer/paymentBrands/american-express.png";
import defaultBrand from "../../../assets/buyer/paymentBrands/credit-card.png";
import discoverIcon from "../../../assets/buyer/paymentBrands/discover.png";
import dinersIcon from "../../../assets/buyer/paymentBrands/diners-club.png";
import jcbIcon from "../../../assets/buyer/paymentBrands/jcb.png";
import { PageLoader } from "../../../utils/loader";
import DeletePaymentCardPopup from "./DeletePaymentCardPopup";
import "react-credit-cards-2/es/styles-compiled.css";
import { useNavigate } from "react-router-dom";
import { CustomerRoutes } from "../../../Routes";

const brandIcons = {
  visa: visaIcon,
  amex: amexIcon,
  mastercard: masterIcon,
  diners: dinersIcon,
  discover: discoverIcon,
  jcb: jcbIcon,
};

const PaymentCardList = ({ onCardSelect, cards }) => {
  const [openModal, setopenModal] = useState(false);
  const [PaymentCards, setPaymentCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("customer"));
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setPaymentCards(cards);
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
    if (res.data.result === "SUCCESS") navigate(-1);
  };

  const processDeleteResult = (res, api) => {
    setShowDeleteConfirmation(false);
    if (res.data.result === "SUCCESS") retrieveCards();
  };

  const openDeleteCard = (item) => {
    setShowDeleteConfirmation(true);
    setCardToDelete(item);
  };

  const closeDeletePopup = () => setShowDeleteConfirmation(false);

  const callAddCard = () => {
    navigate(CustomerRoutes.PaymentCard, {
      state: {
        loadAddCard: true,
      },
    });
  };

  const cardSelectionHandler = (PaymentCard, index) => {
    setSelectedCard(index);
    onCardSelect(PaymentCard);
  };

  return (
    <>
      {isLoading ? (
        <PageLoader />
      ) : (
        <div className="flex flex-wrap gap-3 justify-evenly mx-auto">
          {PaymentCards?.length < 3 && (
            <div
              className=" flex flex-1/2 items-center w-72 h-48 justify-center grow-0  
            bg-white border-2 shadow-lg rounded-[15px]"
            >
              <button
                className="flex-col items-center justify-center"
                onClick={callAddCard}
              >
                <div className="flex flex-wrap items-center">
                  <AiFillPlusCircle className="grow text-amber-500" size={45} />
                </div>
                Link Payment Method
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
              <div className="flex gap-3 items-start mb-3" key={index}>
                <input
                  type="radio"
                  className="mt-4"
                  checked={selectedCard === index}
                  onChange={() => cardSelectionHandler(PaymentCard, index)}
                />
                <div className="w-72 h-48 gap-2 px-4 grow-0 border-2 bg-white shadow-lg rounded-[15px] mx-auto">
                  <div
                    className="my-6 h-10"
                    onClick={() => cardSelectionHandler(PaymentCard, index)}
                  >
                    <img
                      src={brandIcons[PaymentCard.brand] ?? defaultBrand}
                      alt=""
                      className="h-full object-contain"
                    />
                  </div>
                  <div onClick={() => cardSelectionHandler(PaymentCard, index)}>
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
                    onClick={() => cardSelectionHandler(PaymentCard, index)}
                  >
                    <AiFillDelete
                      color="orange"
                      size="25px"
                      onClick={(e) => openDeleteCard(PaymentCard)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showDeleteConfirmation && (
        <DeletePaymentCardPopup
          closeDeletePopup={closeDeletePopup}
          showDeleteConfirmation={showDeleteConfirmation}
          cardToDelete={cardToDelete}
          processDeleteResult={processDeleteResult}
        />
      )}
    </>
  );
};

export default PaymentCardList;

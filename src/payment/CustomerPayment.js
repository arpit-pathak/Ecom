//localhost test customeruser@uparcel.sg Ushoptester21! | staging paumorseven same pass
//4242424242424242 success
import { useState } from "react";
import { CustomerRoutes } from "../Routes";
import { Links } from "../customer/components/GenericSections";
import Navbar from "../customer/components/navbar/Navbar";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import { Apis } from "../customer/utils/ApiCalls";
import { baseUrl } from "../apiUrls";
import "./stripe.css";
import SweetAlert2 from "react-sweetalert2";
import { PageLoader } from "../utils/loader";
import { useNavigate } from "react-router-dom";
import PaymentCardList from "../customer/components/paymentComponents/PaymentCardList";
import { useEffect } from "react";
import { BuyerApiCalls } from "../customer/utils/ApiCalls";
import { useMediaQuery } from "@mui/material";

const CARD_OPTIONS = {
  style: {
    base: {
      ":-webkit-autofill": { color: "#A5ACB8" },
      "::placeholder": { color: "#A5ACB8" },
    },
    invalid: {
      iconColor: "#ffc7ee",
      color: "black",
    },
  },
  classes: {
    base: "custom-stripe-element", // Add your custom CSS class here
    complete: "custom-stripe-element-complete", // Custom class when element is complete
    empty: "custom-stripe-element-empty", // Custom class when element is empty
    focus: "custom-stripe-element-focus", // Custom class when element is focused
    invalid: "custom-stripe-element-invalid", // Custom class when element is invalid
  },
};

const payByUsing = { SAVED_CARD: 1, MANUAL: 2 };

export default function CustomerPayment() {
  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");
  const userLs = localStorage.getItem("customer");
  const [payUsing, setPayUsing] = useState(payByUsing["SAVED_CARD"]);
  const [PaymentCards, setPaymentCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [stripePromise, setStripePromise] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      if (!stripePromise) {
        const stripePrm = await loadStripe(sessionStorage.getItem("SPK"));
        setStripePromise(stripePrm);
      }
    }
    fetchData();
  }, []);

  useEffect(() => retrieveCards(), []);

  //check user token
  if (userLs === null) {
    window.location = CustomerRoutes.Login;
    return;
  }
  const user = JSON.parse(userLs);

  //check payment ref if not redirect to view orders   231005O5CTMAGJ
  const payment_ref = sessionStorage.getItem("payment_order_num");
  if (payment_ref === null || payment_ref === "")
    window.location = CustomerRoutes.ViewOrder;

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
    const rdata = res.data;
    if (res.data?.result === "SUCCESS") {
      if (rdata.data.user_payment_method.length === 0)
        setPayUsing(payByUsing["MANUAL"]);
      else setPaymentCards(rdata.data.user_payment_method);

      sessionStorage.setItem("SPK", res.data.data.publishable_key);
    } else setPayUsing(payByUsing["MANUAL"]);

    setIsLoading(false);
  };

  const updateComplete = () => setIsComplete(true);

  return (
    <>
      {isLoading ? (
        <PageLoader />
      ) : (
        <>
          {/* {isLargeScreen ? <NewNavbar /> : <Navbar />} */}
          <Navbar />
          <div className="px-4 md:px-20">
            <div
              onClick={() => {
                navigate(CustomerRoutes.CheckOutCart, { replace: true });
              }}
              className="!text-black text-sm cp my-3"
            >
              {"<"}&nbsp;Back
            </div>
            {PaymentCards.length > 0 && !isComplete && (
              <div className="flex gap-4 mt-5">
                <p className="ml-6 font-semibold">Pay using</p>
                <div className="flex gap-8 ml-8">
                  <div className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={payUsing === payByUsing["SAVED_CARD"]}
                      onChange={() => setPayUsing(payByUsing["SAVED_CARD"])}
                    />
                    <label className="font-medium">Saved Card</label>
                  </div>
                  <div className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={payUsing === payByUsing["MANUAL"]}
                      onChange={() => setPayUsing(payByUsing["MANUAL"])}
                    />
                    <label className="font-medium">Enter New Card</label>
                  </div>
                </div>
              </div>
            )}
            <Elements stripe={stripePromise}>
              <PaymentForm
                user={user}
                isNewCard={payUsing === payByUsing["MANUAL"]}
                paymentCards={PaymentCards}
                updateComplete={updateComplete}
              />
            </Elements>
          </div>
          <Links />
        </>
      )}
    </>
  );
}

function PaymentForm({ user, isNewCard, paymentCards, updateComplete }) {
  const [success, setSuccess] = useState(false);
  const [swalProps, setSwalProps] = useState({});
  const [selectedCard, setSelectedCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  //vars
  const payment_ref = sessionStorage.getItem("payment_order_num");
  const payment_amt = sessionStorage.getItem("payment_order_amt");

  //funcs
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (isNewCard) {
      const card = elements.getElement(
        CardCvcElement,
        CardExpiryElement,
        CardNumberElement
      );
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: card,
      });

      if (!error) {
        try {
          const { id } = paymentMethod;

          processPayment(id, card);
        } catch (error) {
          setSwalProps({
            show: true,
            title: "Payment Failed",
            text: "Unable to process the payment. Please try again.",
            icon: "error",
          });
        }
      } else {
        setSwalProps({
          show: true,
          title: "Payment Failed",
          text: error.message,
          icon: "error",
        });
      }
    } else processPayment(selectedCard?.id, null);
  };

  const processPayment = async (id, card) => {
    const formData = new FormData();
    formData.append("payment_method", id);
    formData.append("order_id", sessionStorage.getItem("payment_order_id"));
    formData.append("save_card", "n");
    const response = await axios({
      url: baseUrl + Apis.paymentProcess,
      method: "POST",
      data: formData,
      headers: {
        Authorization: `Bearer ${user.access}`,
      },
    });
    //console.log("response:", response);
    if (response.data.result === "SUCCESS") {
      if (response.data.data.status === "requires_action") {
        let stripeData;
        if (isNewCard) {
          stripeData = {
            card: card,
            billing_details: {},
          };
        } else stripeData = id;

        console.log("requires action", stripeData);
        const result = await stripe.confirmCardPayment(
          response.data.data.client_secret,
          {
            payment_method: stripeData,
          }
        );
        if (result.error) {
          //show alert
          setSwalProps({
            show: true,
            title: "Payment Failed",
            text: result.error.message,
            icon: "error",
          });
        } else {
          if (result.paymentIntent.status === "requires_capture") {
            // stripe/payment/update/order/
            // call api to update order param to pass payment intent id & order id
            // console.log('result.paymentIntent.id: ', result.paymentIntent.id);
            const formData = new FormData();
            formData.append("payment_intent", result.paymentIntent.id);
            formData.append(
              "order_id",
              sessionStorage.getItem("payment_order_id")
            );
            const updateOrderRes = await axios({
              url: baseUrl + Apis.updateOrder,
              method: "POST",
              data: formData,
              headers: {
                Authorization: `Bearer ${user.access}`,
              },
            });
            if (updateOrderRes.data.result === "SUCCESS") {
              updateComplete();

              setSwalProps({
                show: true,
                title: "Payment Success",
                text: "Thank you for your purchase, Your payment was successfull",
                icon: "success",
              });
              setSuccess(true);
            } else {
              setSwalProps({
                show: true,
                title: "Error",
                text: updateOrderRes.data.message,
                icon: "error",
              });
            }
          }
        }
      } else {
        setSuccess(true);
        updateComplete();
        setSwalProps({
          show: true,
          title: "Payment Success",
          text: response.message,
          icon: "success",
        });
      }
    } else {
      //console.log("error payment process: ", response.data.errors);
      setSwalProps({
        show: true,
        title: "Payment Failed",
        text: response.data.message,
        icon: "error",
      });
    }
    setIsLoading(false);
  };

  const getPaymentDate = () => {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    const seconds = String(currentDate.getSeconds()).padStart(2, "0");

    const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
  };

  const onCardSelect = (card) => setSelectedCard(card);

  return (
    <>
      {stripe && (
        <>
          {!success ? (
            <>
              {isNewCard ? (
                <form
                  id="stripe-payment"
                  className="my-[30px] py-[20px] px-[20px] inline-block w-full"
                  onSubmit={handleSubmit}
                >
                  {/* <a href={CustomerRoutes.CheckOutCart} className='!text-black font-normal cp'>{'<'}&nbsp;Back</a> */}
                  <div className="mb-[40px] lg:px-[150px] md:px-[50px] px-[20px]">
                    <div className="pfield mb-[10px]">
                      <label>Card number</label>
                      <CardNumberElement options={CARD_OPTIONS} />
                    </div>
                    <div className="pfield grid grid-cols-2 gap-[10px]">
                      <div className="">
                        <label>Expiry</label>
                        <CardExpiryElement options={CARD_OPTIONS} />
                      </div>
                      <div className="">
                        <label>CVC</label>
                        <CardCvcElement options={CARD_OPTIONS} />
                      </div>
                    </div>

                    {/* information detail */}
                    <div className="flex flex-col gap-[10px] w-full mt-[20px]">
                      <div className="info flex flex-row justify-between">
                        <span>Ref Number</span>
                        <span>{payment_ref}</span>
                      </div>
                      <div className="info flex flex-row justify-between mb-[15px]">
                        <span>Total Amount</span>
                        <span>${payment_amt}</span>
                      </div>
                    </div>

                    <button
                      className={`float-right flex flex-row gap-[8px] items-center`}
                    >
                      {isLoading ? "Processing Payment" : "Confirm Payment"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-8 px-2 border bg-gray-100 mt-5 mb-11">
                  <PaymentCardList
                    onCardSelect={onCardSelect}
                    cards={paymentCards}
                  />
                  <div className="flex flex-col gap-[10px] w-full px-14 mt-6">
                    <div className="info flex flex-row justify-between">
                      <span>Ref Number</span>
                      <span>{payment_ref}</span>
                    </div>
                    <div className="info flex flex-row justify-between mb-[15px]">
                      <span>Total Amount</span>
                      <span>${payment_amt}</span>
                    </div>
                  </div>
                  <div className="flex w-full justify-end pr-8">
                    <button
                      className="cp text-center rounded-md bg-[#f5ab35] text-white h-8 px-3 mr-5 hover:bg-amber-500
                         disabled:opacity-50  disabled:cursor-default"
                      onClick={handleSubmit}
                      disabled={isLoading || selectedCard === null}
                    >
                      {isLoading ? "Processing Payment" : "Confirm Payment"}
                    </button>
                  </div>
                </div>
              )}

              <SweetAlert2
                {...swalProps}
                didOpen={() => {
                  // run when swal is opened...
                }}
                didClose={() => {
                  setSwalProps({});
                }}
                onConfirm={(result) => {
                  setSwalProps({});
                }}
                onError={(error) => {
                  setSwalProps({});
                }}
                onResolve={(result) => {
                  // run when promise is resolved...
                }}
              />
            </>
          ) : (
            <div className="payment-success py-[20px] lg:px-[150px] md:px-[50px] px-[20px]">
              <h2 className="mb-[15px]">Payment Success!</h2>
              <div className="divider mb-[15px]"></div>
              <div className="info  grid grid-cols-2 gap-[16px]">
                <span>Ref Number</span>
                <span>{payment_ref}</span>
              </div>
              <div className="info  grid grid-cols-2 gap-[16px]">
                <span>Payment Time</span>
                <span>{getPaymentDate()}</span>
              </div>
              <div className="info  grid grid-cols-2 gap-[16px]">
                <span>Payment Method</span>
                <span>Credit Card</span>
              </div>
              <div className="info grid grid-cols-2 gap-[16px] mb-[15px]">
                <span>Amount</span>
                <span>${payment_amt}</span>
              </div>

              <div className="text-right">
                <button
                  className="bg-[#f3a429] rounded-[4px] text-white px-[10px] py-[4px]"
                  onClick={() => {
                    sessionStorage.setItem("SPK", "");
                    sessionStorage.setItem("payment_order_id", "");
                    sessionStorage.setItem("payment_order_num", "");
                    sessionStorage.setItem("payment_order_amt", "");
                    window.location = CustomerRoutes.ViewOrder;
                  }}
                >
                  Visit My Orders
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {(isLoading || !stripe) && <PageLoader />}
    </>
  );
}

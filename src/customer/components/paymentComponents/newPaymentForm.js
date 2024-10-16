import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import "./payment.css";
import { CustomerRoutes } from "../../../Routes";
import SweetAlert2 from "react-sweetalert2";
import { domainUrl } from "../../../apiUrls";
import axios from "axios";

import { Apis } from "../../utils/ApiCalls";
import { baseUrl } from "../../../apiUrls";
import { Links } from "../GenericSections";
import Navbar from "../../components/navbar/Navbar";
import Loader, { PageLoader } from "../../../utils/loader";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";

const RETRIAL_TIMES = 3;

//src > payment > CustomerPayment.js was previously used instead of this component which lists saved cards and
//allow adding a new card and use it. This component is used now to include "Pay Now" option. This so far doesn't
//support to select from saved cards

export default function NewPaymentElement() {
  const clientSecret = sessionStorage.getItem("client_secret");
  const userLs = localStorage.getItem("customer");
  const [stripePromise, setStripePromise] = useState(null);
  const [error, setError] = useState("");

  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");

  const payment_ref = sessionStorage.getItem("payment_order_num");
  if (payment_ref === null || payment_ref === "")
    window.location = CustomerRoutes.ViewOrder.replace(":tab", "all");

  useEffect(() => {
    loadStripe(sessionStorage.getItem("SPK"))
      .then((stripe) => {
        setStripePromise(stripe);
      })
      .catch((error) => {
        console.error("Failed to load Stripe:", error);
        setError("Failed to load payment gateway. Please try again later.");
      });
  }, []);

  const appearance = {
    theme: "stripe",
  };

  const options = {
    clientSecret,
    appearance,
  };

  //check user token
  if (userLs === null) {
    window.location = CustomerRoutes.Login;
    return;
  }
  const user = JSON.parse(userLs);

  return (
    <div className="overflow-hidden">
      {/* {isLargeScreen ? <NewNavbar /> : <Navbar />} */}
      <Navbar />
      {clientSecret && stripePromise !== null ? (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm clientSecret={clientSecret} user={user} />
        </Elements>
      ) : error ? (
        <div className="flex items-center justify-center">
          <div className="min-h-[300px] w-[500px] max-sm:w-full flex items-center justify-center shadow-md rounded-md p-4 my-12">
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <PageLoader />
      )}
      <Links />
    </div>
  );
}

function CheckoutForm({ clientSecret, user }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [swalProps, setSwalProps] = useState({});
  const [isStripeLoading, setIsStripeLoading] = useState(true);
  const [result, setResult] = useState(null);

  //retry three times with 3 seconds gap to update correct order status
  //as stripe webhook is delaying to update the payment status
  const [noOfTimesCalled, setNoOfTimesCalled] = useState(0);

  //vars
  const payment_ref = sessionStorage.getItem("payment_order_num");
  const payment_amt = sessionStorage.getItem("payment_order_amt");

  const paymentElementOptions = {
    layout: "accordion",
  };

  // const [isVisible, setIsVisible] = useState(true);

  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     setIsVisible(!document.hidden);
  //     if (!document.hidden) {
  //       // When the tab becomes visible again, query payment status
  //     }
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, []);

  // useEffect(() => {
  //   if (isVisible) {
  //   }
  // }, [isVisible]);

  useEffect(() => {
    if (result) {
      if (result.error) {
        setSwalProps({
          title: "Payment Confirm Error!",
          text: result.error.message,
          icon: "error",
          show: true,
        });
        setIsLoading(false);
      } else setTimesCalled();
    }
  }, [result]);

  useEffect(() => {
    if (result && noOfTimesCalled > 0) {
      if (noOfTimesCalled <= RETRIAL_TIMES) {
        setTimeout(() => {
          processrequest();
        }, 3000);
      } else if (noOfTimesCalled === RETRIAL_TIMES) setIsLoading(false);
    }
  }, [noOfTimesCalled, result]);

  const setTimesCalled = () => {
    let timesCalled = noOfTimesCalled + 1;
    setNoOfTimesCalled(timesCalled);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      setMessage("Something went wrong. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      stripe
        .confirmPayment({
          elements,
          confirmParams: {
            return_url: domainUrl + "user/orders/pending-confirmation",
          },
          redirect: "if_required",
        })
        .then(function (result) {
          console.log("result ", result);
          setResult(result);
        });
    } catch (err) {
      console.log("catch err ", err);
      setMessage("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  const processrequest = async () => {
    // Create the PaymentIntent and obtain clientSecret
    const formData = new FormData();
    formData.append("order_id", sessionStorage.getItem("payment_order_id"));

    const updateOrderRes = await axios({
      url: baseUrl + Apis.getPaymentStatus,
      method: "POST",
      data: formData,
      headers: {
        Authorization: `Bearer ${user.access}`,
      },
    });
    
    if (updateOrderRes.data?.result === "SUCCESS") {
      let paymentStatus = updateOrderRes.data?.data?.payment_status;
      if (
        paymentStatus === "succeeded" ||
        paymentStatus === "requires_capture"
      ) {
        console.log("Satisfied status");
        setIsLoading(false);
        navigate(CustomerRoutes.OrderConfirmation, {
          replace: true,
          state: {
            payment_amt: payment_amt,
            payment_ref: payment_ref,
            shipping_address_details:
              updateOrderRes.data?.data?.shipping_detail,
          },
        });
      } else {
        setSwalProps({
          show: true,
          title: "Error",
          text: updateOrderRes.data.message,
          icon: "error",
        });
      }
      setIsLoading(false);
    } else {
      console.log("error status returned");
      if (noOfTimesCalled === RETRIAL_TIMES) {
        console.log("error after retrial times");
        setSwalProps({
          show: true,
          title: "Error",
          text: updateOrderRes.data.message,
          icon: "error",
        });
        setResult(null);
        setNoOfTimesCalled(0);
        setIsLoading(false);
      } else setTimesCalled();
    }
  };

  return (
    <>
      {!stripe || !elements ? (
        <PageLoader />
      ) : (
        <>
          <div className="flex  flex-col justify-center items-center w-screen h-screen">
            <p className="font-bold text-2xl">uShop Order Payment</p>
            <p className="mt-1">Order ID: {payment_ref}</p>
            <p className="mt-1">Amount: ${payment_amt}</p>
            <div className="flex justify-center items-center">
              <form
                id="payment-form"
                onSubmit={handleSubmit}
                className="bg-[#F7FAFC] border border-grey4Border text-center my-8 py-8 lg:px-[150px] md:px-14 px-5"
              >
                {isStripeLoading && <PageLoader />}
                <PaymentElement
                  id="payment-element"
                  options={paymentElementOptions}
                  onReady={() => setIsStripeLoading(false)}
                />
                <button
                  disabled={
                    isStripeLoading || isLoading || !stripe || !elements
                  }
                  id="submit"
                >
                  <span id="button-text">
                    {isLoading ? <Loader /> : "Pay now"}
                  </span>
                </button>
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
                {/* Show any error or success messages */}
                {message && <div id="payment-message">{message}</div>}
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}

import React, { useState } from "react";
import Cards from "react-credit-cards-2";
import "react-credit-cards-2/es/styles-compiled.css";
import { ImCross } from "react-icons/im";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardCvcElement, CardExpiryElement, useStripe, useElements } from "@stripe/react-stripe-js";
import '../../../../payment/stripe.css';
import ls from 'local-storage';
import { BuyerApiCalls, Apis } from "../../../utils/ApiCalls";
import {
  FaSpinner
} from 'react-icons/fa';

const CARD_OPTIONS = {
  style: {
    base: {
      ":-webkit-autofill": { color: "#A5ACB8" },
      "::placeholder": { color: "#A5ACB8" }
    },
    invalid: {
      iconColor: "#ffc7ee",
      color: "black"
    }
  },
  classes: {
    base: 'custom-stripe-element', // Add your custom CSS class here
    complete: 'custom-stripe-element-complete', // Custom class when element is complete
    empty: 'custom-stripe-element-empty', // Custom class when element is empty
    focus: 'custom-stripe-element-focus', // Custom class when element is focused
    invalid: 'custom-stripe-element-invalid', // Custom class when element is invalid
  },
}

const PaymentForm = ({ handleAddCard, close }) => {
  const stripePromise = loadStripe(sessionStorage.getItem("SPK"));
  const user = JSON.parse(localStorage.getItem("customer"));

  const [state, setState] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
    focus: "",
  });
  


  const handleInputChange = (event) => {
    //event.target.name : event.target.value
    const { name, value } = event.target;
    //set event.target.name = event.target.value
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputFocus = (event) => {
    setState((prev) => ({ ...prev, focus: event.target.name }));
  };


  return (
    <div id="PaymentForm">
      <div className=" flex justify-between mb-4">
        <p className="inline font-bold text-xl">Add Card</p>
        <button
          type="button"
          className="inline"
          onClick={() => {
            close();
          }}
        >
          <ImCross></ImCross>
        </button>
      </div>
      <Cards
        number={state.number}
        expiry={state.expiry}
        cvc={state.cvc}
        name={state.name}
        focused={state.focus}
      />
      <Elements stripe={stripePromise}>
        <StripeForm user={user} handleAddCard={handleAddCard} />
      </Elements>
    </div>
  );
};

function StripeForm({ user, handleAddCard }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const stripe = useStripe();
  const elements = useElements();


  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrMsg("")
    setIsLoading(true)

    const card = elements.getElement(CardCvcElement, CardExpiryElement, CardNumberElement);
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: card
    })

    if (!error) {
      console.log("payment method ", paymentMethod);
      try {
        const { id } = paymentMethod
        const formData = new FormData();
        formData.append("payment_method", id);
        BuyerApiCalls(
          formData,
          Apis.paymentMethod,
          "POST",
          {
            Authorization: `Bearer ${user.access}`,
          },
          processRes
        );
      } catch (err) {
        console.log(err)
      }
    } else {
      console.log("Error ", error);
      setErrMsg(error?.message ?? "")
      setIsLoading(false)
    }

  };

  const processRes = (res, api) => {
    setIsLoading(false)
    handleAddCard(res)
  }

  return <>
    <form id="stripe-payment" className="my-[30px] py-[20px] px-[20px] inline-block w-full" onSubmit={handleSubmit}>
      <div className="pfield mb-[10px]">
        <label>Card number</label>
        <CardNumberElement options={CARD_OPTIONS} />
      </div>
      <div className="pfield grid grid-cols-2 gap-[10px]" >
        <div className="">
          <label>Expiry</label>
          <CardExpiryElement options={CARD_OPTIONS} />
        </div>
        <div className="">
          <label>CVC</label>
          <CardCvcElement options={CARD_OPTIONS} />
        </div>
      </div>
      <p className='text-red-600 mt-5 text-sm'>{errMsg}</p>
      <button className={`float-right flex flex-row gap-[8px] items-center mt-6 disabled:opacity-50  disabled:cursor-default`}
        disabled={isLoading}>
        {isLoading && <FaSpinner className="loader" />}
        Add Card
      </button>
    </form>
  </>;
}

export default PaymentForm;




{/* <form onSubmit={handleSubmit} className="w-fit md:w-[652px]">
        <div className="flex my-2 border">
          <input
            className="flex-wrap flex-1 p-2"
            type="number"
            name="number"
            placeholder="Card Number"
            value={state.number}
            required
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onInput={(e) => (e.target.value = e.target.value.slice(0, 16))}
          />
        </div>

        <div className="flex my-2 border">
          <input
            className="flex-wrap flex-1 p-2"
            type="text"
            name="name"
            placeholder="Name"
            value={state.name}
            maxLength="10"
            required
            onChange={handleInputChange}
            onFocus={handleInputFocus}
          />
        </div>

        <div className="flex flex-1 my-2 gap-4">
          <div className="flex basis-1/2 border">
            <input
              id="num"
              className="num p-2 flex-1"
              type="number"
              name="expiry"
              placeholder="expiry"
              required
              value={state.expiry}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onInput={(e) => (e.target.value = e.target.value.slice(0, 4))}
            />
          </div>
          <div className="flex basis-1/2 border">
            <input
              className="p-2 flex-1"
              type="number"
              name="cvc"
              required
              placeholder="cvc"
              value={state.cvc}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onInput={(e) => (e.target.value = e.target.value.slice(0, 4))}
            />
          </div>
        </div>
        <div className="grid justify-items-center">
          <button
            type="submit"
            className="border bg-amber-500 px-4 py-2 rounded-lg"
          >
            Add Card
          </button>
        </div>
      </form> */}
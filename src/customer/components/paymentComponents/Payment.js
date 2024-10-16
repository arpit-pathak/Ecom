import { useState } from "react";
import { Link } from "react-router-dom";
import { TfiCreditCard } from "react-icons/tfi";
import paynowIcon from "../../../assets/buyer//paynowIcon.png";

export default function PaymentMethods() {
  const [activeMethod, setActiveMethod] = useState(1);
  const paymentMethod = [
    { text: "Pay Now", index: 1 },
    { text: "Google Pay", index: 2 },
    { text: "Credit Card/Debit Card", index: 3 },
    { text: "DBS PayLah!", index: 4 },
  ];

  const setActive = (index) => {
    console.log(index);
    setActiveMethod(index);
  };

  return (
    <div className="flex flex-col space-y-5">
      <div className="flex flex-row items-center space-x-2">
        <TfiCreditCard className="text-amber-500 w-7 h-7" />
        <p>Select Payment Method</p>
      </div>
      <div className="flex flex-wrap gap-10 items-center">
        {paymentMethod.map((item) => {
          return (
            <Link
              style={
                activeMethod === item.index
                  ? { "background-color": "#ffa500", color: "white" }
                  : { "background-color": "white", color: "black" }
              }
              onClick={() => setActive(item.index)}
              className="border border-black px-4 py-2 rounded bg-amber-500/100 text-white"
            >
              {item.text}
            </Link>
          );
        })}
      </div>

      <div className="flex flex-row  items-center space-x-5 ">
        <input type="radio" className="accent-amber-500" />
        <img src={paynowIcon} alt="" />
        <p>Pay Now</p>
      </div>
    </div>
  );
}

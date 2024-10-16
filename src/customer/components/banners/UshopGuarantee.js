import React from "react";

import certifiedIcon from "../../../assets/buyer/certifiedIcon.png";
import creditCardIcon from "../../../assets/buyer/creditCardIcon.png";
import shippingReturnIcon from "../../../assets/buyer/shippingReturnIcon.png";
import deliveryTruckIcon from "../../../assets/buyer/deliveryTruckIcon.png";
function UshopGuarantee() {
  return (
    <div className="flex flex-row justify-between text-center my-[36px]">
      <div className="flex flex-col items-center w-full gap-2">
        <img
          className=" w-16 h-16 px-4 py-4 md:w-40 md:h-40 bg-amber-100 rounded-full  object-scale-down"
          src={deliveryTruckIcon}
        />
        <p className="text-xs md:text-xl font-bold">Speedy Delivery</p>
      </div>
      <div className="flex flex-col items-center w-full gap-2">
        <img
          className=" w-16 h-16 px-4 py-4  md:w-40 md:h-40  bg-amber-100 rounded-full object-scale-down"
          src={certifiedIcon}
        />
        <p className="text-xs md:text-xl font-bold">100% Original Products</p>
      </div>

      <div className="flex flex-col items-center w-full gap-2">
        <img
          className=" w-16 h-16 px-4 py-4 md:w-40 md:h-40 bg-amber-100 rounded-full object-scale-down"
          src={shippingReturnIcon}
          alt=""
        />
        <p className="text-xs md:text-xl font-bold">Easy Return Policy</p>
      </div>

      <div className="flex flex-col items-center w-full gap-2">
        <img
          className=" w-16 h-16 px-4 py-4  md:w-40 md:h-40 bg-amber-100 rounded-full  object-scale-down"
          src={creditCardIcon}
          alt=" "
        />
        <p className="text-xs md:text-xl font-bold">100% Secure Payment</p>
      </div>
    </div>
  );
}
export default UshopGuarantee;

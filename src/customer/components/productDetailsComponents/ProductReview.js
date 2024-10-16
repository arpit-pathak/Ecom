import React from "react";
import { Link } from "react-router-dom";
import { AiFillStar } from "react-icons/ai";
import { VscKebabVertical, VscVerified } from "react-icons/vsc";
function ProductReview() {
  return (
    <div className="flex flex-col space-y-5 ">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row space-x-2">
          <div className="flex flex-row items-center space-x-1 py-0 px-2 bg-green-500 text-white rounded-lg">
            <p>4.7</p>
            <AiFillStar />
          </div>
          <div className="text-xl">Amazing Product</div>
        </div>
        <Link to="">
          <VscKebabVertical />
        </Link>
      </div>{" "}
      <p>
        Fantastic value for money machine!! Absolute beast as far as sheer
        performance is concerned that being super efficient on the battery. 1.
        Using it mainly for coding purposes, browsing and all that regular
        stuff. Haven’t played any games on it so I can’t comment on battery life
        and performance while gaming but with regular coding stuff like web
        development, mobile app development, web browsing etc the battery will
        easily last for 10+ hrs or even more. Absolutely worth the price. A must
        buy....Read More
      </p>
      <div className="flex flex-row justify-between ">
        <div className="flex flex-row text-gray-400 items-center space-x-2">
          <p>Rohit Verma</p>
          <VscVerified />
          <p> Certified Buyer, March 2021</p>
        </div>
        {/* <div className="flex flex-row text-gray-400 items-center space-x-2">
            <IoMdThumbsUp/>
            <p> 20</p>
            <IoMdThumbsDown/>
            <p> 20</p>
        </div> */}
      </div>
    </div>
  );
}
export default ProductReview;

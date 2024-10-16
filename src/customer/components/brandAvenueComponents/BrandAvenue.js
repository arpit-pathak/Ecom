import React from "react";
import { Link } from "react-router-dom";
import ProductListing from "./../ProductListing";
import BrandThumbnail from "./BrandThumbnail";

import data from "./../MockData";
import brandOppoLogo from "../../../assets/buyer/brandOppoLogo.png";

function BrandAvenue() {
  return (
    <div className="flex flex-col m-5">
      <div className="flex flex-row justify-between">
        <h1 className="font-bold uppercase">Brand Avenue</h1>
        <Link to="" className="text-amber-400 font-bold ">
          View All &gt;{" "}
        </Link>
      </div>

      <div className="flex flex-row bg-gray-100">
        <BrandThumbnail logo={brandOppoLogo} />
        <BrandThumbnail logo={brandOppoLogo} />
        <BrandThumbnail logo={brandOppoLogo} />
        <BrandThumbnail logo={brandOppoLogo} />
        <BrandThumbnail logo={brandOppoLogo} />
        <BrandThumbnail logo={brandOppoLogo} />
      </div>
      <div className="slider-container ">
        <div
          id="sliderBrandAvenue"
          className="grid  sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 item-slider scrollbar-hide"
        >
          {data.map((item) => (
            <ProductListing
              key={item.id}
              name={item.name}
              discount={item.discount}
              originalPrice={item.originalPrice}
              ratingCount={item.ratingCount}
              currentPrice={item.currentPrice}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default BrandAvenue;

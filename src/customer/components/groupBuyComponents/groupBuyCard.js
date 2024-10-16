import React, { useEffect, useState } from "react";
import productImg1 from "../../../assets/buyer/productImg1.png";
import { CustomerRoutes } from "../../../Routes";
import { trimName } from "../../../utils/general";
import { Link } from "react-router-dom";
import "./index.css";

const GroupBuyCard = ({ groupBuy }) => {
  const [timeLeft, setTimeLeft] = useState({});
  const remainingQty =
    groupBuy?.max_campaign_qty - groupBuy?.group_buy_sold_qty;

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(groupBuy?.end_datetime_formated));
    }, 1000);

    return () => clearTimeout(timer);
  });

  const calculateTimeLeft = (targetDate) => {
    const difference = new Date(targetDate) - new Date();
    let timeLeft = {};

    if (difference > 0) {
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      timeLeft = {
        hours: hours < 10 ? `0${hours}` : hours,
        minutes: minutes < 10 ? `0${minutes}` : minutes,
        seconds: seconds < 10 ? `0${seconds}` : seconds,
      };
    }

    return timeLeft;
  };

  return (
    <div
      className="shadow-productListing flex flex-col relative
    !cursor:pointer h-fit mx-1 my-2 md:gap-[12px] box-border border-2 border-transparent hover:border hover:shadow-md
    hover:border-grey4Border hover:top-[-2px] ease-in duration-300"
      key={groupBuy.product_id__name}
    >
      {/* favorite & rating */}
      {/* <div className="absolute flex justify-between items-center w-full mt-2 pl-1">
      <button
        onClick={() => addToFavourite(product, index)}
        className="w-7 h-6 bg-mildOrange rounded-xl"
      >
        <FontAwesomeIcon
          icon={
            user && product?.added_in_wishlist === "Y"
              ? fasHeart
              : faHeart
          }
          size={20}
          className="text-orangeButton h-3.5 w-3.5"
        />
      </button>
      {product?.avg_rating !== "0.00" && (
        <div className="w-12 h-5 bg-mildOrange rounded-lg flex justify-center gap-1 items-center mr-1 px-1">
          <FontAwesomeIcon
            icon={fasStar}
            className="text-orangeButton h-3.5 w-3.5"
          />
          <p className="text-xs text-black font-semibold">
            {parseFloat(product?.avg_rating).toFixed(1)}
          </p>
        </div>
      )}
    </div> */}

      <Link
        to={CustomerRoutes.ProductDetails + `${groupBuy.product_id__slug}/`}
        state={groupBuy.id_product}
        key={groupBuy.id_product}
      >
        {/* prod img */}
        <img
          src={groupBuy?.product_image ?? productImg1}
          className="w-full h-[202px] max-md:h-[165px] object-contain"
          alt=""
        ></img>

        <div className="mx-2 grid gap-0.5 pb-2">
          <div
            className="capitalize font-semibold text-black w-full break-normal text-sm
          text-ellipsis mt-2  max-[530px]:text-xs max-[415px]:text-[10px]"
          >
            {trimName(groupBuy.product_id__name, 20)}
          </div>

          <div className="flex items-center flex-wrap">
            <p className="line-through text-sm my-1 mr-3">
              <span className="font-bold text-gray-500">
                ${groupBuy["usual_price"]}
              </span>
            </p>

            <p className={`font-bold text-orangeButton text-lg`}>
              ${parseFloat(groupBuy?.success_discount_price).toFixed(2)}
            </p>
          </div>

          <div className="w-full text-black font-semibold flex items-center gap-1 my-2 flex-wrap">
            <p className="text-xs font-semibold whitespace-nowrap">ENDS IN</p>
            <div className="flex items-center gap-1 justify-center">
              <div className="bg-orangeButton px-1 h-5 rounded text-center text-white text-sm">
                {timeLeft?.hours ?? "00"}
              </div>
              <p>:</p>
              <div className="bg-orangeButton px-1 h-5 rounded text-center text-white text-sm">
                {timeLeft?.minutes ?? "00"}
              </div>
              <p>:</p>
              <div className="bg-orangeButton px-1 h-5 rounded text-center text-white text-sm">
                {timeLeft?.seconds ?? "00"}
              </div>
            </div>
          </div>

          <div className="w-full mt-2 relative">
            <div className="progress1">
              <div
                className="progress-bar1"
                role="progressbar"
                style={{
                  width: `${
                    (groupBuy?.group_buy_sold_qty /
                      groupBuy?.max_campaign_qty) *
                    100
                  }%`,
                  fontWeight: "500",
                }}
                aria-valuenow={groupBuy?.group_buy_sold_qty}
                aria-valuemin="0"
                aria-valuemax={groupBuy?.max_campaign_qty}
              ></div>
            </div>
            <p className="text-xs top-0 text-center text-black font-semibold z-10 absolute top-[1.5px] left-0 right-0 mx-auto">
              {remainingQty <= 10 ? `LAST ${remainingQty}` : "LIMITED QTY"}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default GroupBuyCard;

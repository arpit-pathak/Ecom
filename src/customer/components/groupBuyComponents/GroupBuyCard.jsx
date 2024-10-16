import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CustomerRoutes } from "../../../Routes";
import productImg1 from "../../../assets/buyer/productImg1.png";
import timerBlue from "../../../assets/buyer/group-buy-timer-blue.svg";
import timerOrange from "../../../assets/buyer/group-buy-timer-orange.svg";
import { trimName } from "../../../utils/general";
// import { FaDollarSign } from "react-icons/fa";

const GroupBuyCard = ({ groupBuy }) => {
  const [timeLeft, setTimeLeft] = useState(
    calculateTimeLeft(groupBuy?.end_datetime_formated)
  );
  const remainingQty =
    groupBuy[0]?.max_campaign_qty - groupBuy[0]?.group_buy_sold_qty;
  const discountPrice = parseFloat(groupBuy[0]?.success_discount_price).toFixed(
    2
  );
  const progressPercentage =
    (groupBuy[0]?.group_buy_sold_qty / groupBuy[0]?.max_campaign_qty) * 100;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(groupBuy[0]?.end_datetime_formated));
    }, 1000);

    return () => clearInterval(timer);
  }, [groupBuy[0]?.end_datetime_formated]);

  function calculateTimeLeft(targetDate) {
    const difference = new Date(targetDate) - new Date();
    if (difference <= 0) return {};

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return {
      hours: hours.toString().padStart(2, "0"),
      minutes: minutes.toString().padStart(2, "0"),
      seconds: seconds.toString().padStart(2, "0"),
    };
  }

  return (
    <>
      {groupBuy.length > 0 &&
        groupBuy.map((product, index) => {
          return (
            <Link
              className="flex flex-col relative !cursor:pointer h-fit mx-1 my-2 md:gap-[2px] box-border border-[1px] border-[#EFEFEF] hover:border hover:shadow-md
              hover:border-grey4Border hover:top-[-2px] ease-in duration-300 bg-white"
              to={`${CustomerRoutes.ProductDetails}${product.product_id__slug}/`}
              state={product.id_product}
              key={product.id_product}
            >
              <div className="relative w-full">
                {/* prod img */}
                <img
                  src={product?.product_image ?? productImg1}
                  className="w-auto h-[237px] max-md:h-[166px] object-contain"
                  alt="product-img"
                  loading="lazy"
                />

                <div className="flex w-full bg-[#ffffff] rounded-full py-[2px] lg:py-1 pl-2 pr-1 lg:pr-4 gap-1 items-center absolute top-2">
                  <img
                    src={timeLeft?.hours < 24 ? timerOrange : timerBlue}
                    alt="timer"
                    className="h-[10px] lg:h-[19px]"
                  />
                  <div className="flex justify-between w-full">
                    <p className="text-[#666666] font-bold text-xs leading-3 lg:leading-5 pt-[1px] whitespace-nowrap">
                      ENDS IN
                    </p>
                    <div className="flex items-center gap-[1px] lg:gap-1 text-xs leading-3 lg:leading-5">
                      {["hours", "minutes", "seconds"].map((unit, index) => (
                        <React.Fragment key={unit}>
                          {index > 0 && (
                            <p className="text-[#666666] font-bold text-xs leading-3 lg:leading-5">
                              :
                            </p>
                          )}
                          <div className="lg:h-5 px-[1px] lg:px-1 font-bold text-center text-black text-xs lg:text-sm leading-3 lg:leading-5">
                            {timeLeft[unit] ?? "00"}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col w-full h-[100px] md:h-[134px] justify-end px-3">
                <div className="capitalize font-medium w-full text-black break-normal text-ellipsis text-xs leading-3 lg:text-sm">
                  {trimName(product.product_id__name, 35)}
                </div>

                <div className="flex flex-wrap pt-2 md:pt-4">
                  <p className="text-[#FF9100] text-poppins flex items-center">
                    {/* <FaDollarSign size={30} /> */}
                    <span className="font-bold text-xl leading-8 max-[530px]:text-sm max-[415px]:text-sm">
                      $ {discountPrice}
                    </span>
                  </p>
                  <p className="pl-2 my-1 mr-3 text-[#999999] relative">
                    <span className="font-bold text-[9px] md:text-xs lg:text-sm line-through text-[#999999] relative -top-1">
                      ${product["usual_price"]}
                    </span>
                  </p>
                </div>

                <div className="progress1 mt-1 md:mt-2">
                  <div
                    className="progress-bar1"
                    role="progressbar"
                    style={{
                      width: `${progressPercentage}%`,
                      fontWeight: "500",
                    }}
                    aria-valuenow={product?.group_buy_sold_qty}
                    aria-valuemin="0"
                    aria-valuemax={product?.max_campaign_qty}
                  >
                    <p className="text-[8px] md:text-xs text-center text-white font-semibold pl-1">
                      {remainingQty <= 10
                        ? `LAST ${remainingQty}`
                        : "LIMITED QTY"}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
    </>
  );
};

export default GroupBuyCard;

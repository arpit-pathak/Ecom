import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import productImg1 from "../../../assets/buyer/productImg1.png";
import { SHIPPING_TYPE } from "../../../constants/general";
import instant from "../../../assets/buyer/instant.svg";
import sameday from "../../../assets/buyer/same-day-delivery.svg";
import scheduled from "../../../assets/buyer/scheduled.svg";
import { FaDollarSign } from "react-icons/fa";

import { Link } from "react-router-dom";
import { CustomerRoutes } from "../../../Routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faHeart } from "@fortawesome/free-regular-svg-icons";
import {
  faHeart as fasHeart,
  faStar as fasStar,
} from "@fortawesome/free-solid-svg-icons";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import { trimName } from "../../../utils/general";
import PopupMessage from "../../../merchant/components/PopupMessage";

const NewProductCard = ({ products, setProducts, listFrom }) => {
  const user = JSON.parse(localStorage.getItem("customer"));
  const [prods, setProds] = useState([]);
  const [showUnauthorizedWishlistErr, setShowUnauthorizedWishlistErr] =
    useState(false);
  const [showResultStatus, setShowResultStatus] = useState(false);
  const [result, setResult] = useState(false);

  useEffect(() => {
    setProds(products);
  }, [products]);

  const addToFavourite = (product, index) => {
    if (user) {
      if (product?.added_in_wishlist === "N") {
        //add to wishlist
        const formData = new FormData();
        formData.append("id_product", product.id_product);
        BuyerApiCalls(
          formData,
          Apis.addToWishlist,
          "POST",
          {
            Authorization: `Bearer ${user?.access}`,
          },
          (res) => {
            setResult(res.data);
            setShowResultStatus(true);
            if (res.data.result === "SUCCESS") {
              let updatedProducts = [...products];
              updatedProducts[index] = {
                ...updatedProducts[index],
                added_in_wishlist: "Y",
              };
              setProducts(updatedProducts);
            }
          }
        );
      } else {
        //remove from wishlist
        const formData = new FormData();
        formData.append("id_product", product.id_product);
        BuyerApiCalls(
          formData,
          Apis.removeFromWishlist,
          "DELETE",
          {
            Authorization: `Bearer ${user?.access}`,
          },
          (res) => {
            setResult(res.data);
            setShowResultStatus(true);
            if (res.data.result === "SUCCESS") {
              let updatedProducts = [...products];
              if (listFrom === "wishlist") {
                updatedProducts.splice(index, 1);
              } else {
                updatedProducts[index] = {
                  ...updatedProducts[index],
                  added_in_wishlist: "N",
                };
              }
              setProducts(updatedProducts);
            }
          }
        );
      }
    } else {
      setShowUnauthorizedWishlistErr(true);
    }
  };

  return (
    <>
      {prods.length > 0 &&
        prods.map((product, index) => {
          return (
            <div
              className="flex flex-col relative !cursor:pointer h-fit mx-1 my-2 md:gap-[12px] box-border border-[1px] border-[#EFEFEF] hover:border hover:shadow-md
              hover:border-grey4Border hover:top-[-2px] ease-in duration-300 bg-white"
              key={`product${index}`}
            >
              {/* rating */}
              <div className="absolute flex justify-between items-center w-full mt-2 pl-1">
                {product?.avg_rating !== "0.00" && (
                  <div className="w-12 h-5 bg-[#FFF1DC] rounded-lg flex justify-center gap-1 items-center mr-1 px-1">
                    <FontAwesomeIcon
                      icon={fasStar}
                      className="text-orangeButton h-4 w-4"
                    />
                    <p className="text-xs text-black font-semibold">
                      {parseFloat(product?.avg_rating).toFixed(1)}
                    </p>
                  </div>
                )}
              </div>

              <Link
                to={CustomerRoutes.ProductDetails + `${product.slug}/`}
                state={product.id_product}
                key={product.id_product}
                target="_blank"
              >
                {/* prod img */}
                <img
                  src={product?.cover_image?.list_img ?? productImg1}
                  className="w-full h-[202px] max-md:h-[165px] object-contain"
                  alt=""
                  loading="lazy"
                />

                {/* shipping */}
                <div className="w-full h-10  max-[1024px]:h-8 max-[415px]:h-6 bg-[#FFF5E9] flex justify-evenly items-center mt-2">
                  {product?.available_shipping.includes(
                    SHIPPING_TYPE.SAME_DAY
                  ) && (
                    <div className="flex gap-1 items-center">
                      <img
                        src={sameday}
                        className="h-3.5 w-3.5 max-[1024px]:h-3 max-[1024px]:w-3"
                        alt=""
                      />
                      <p className="text-black text-[10px] font-semibold max-[1024px]:text-[8px] max-[415px]:text-[7px]">
                        Same Day
                      </p>
                    </div>
                  )}

                  {product?.available_shipping.includes(
                    SHIPPING_TYPE.INSTANT
                  ) && (
                    <div className="flex gap-0.5 items-center">
                      <img
                        src={instant}
                        className="h-3.5 w-3.5 max-[1024px]:h-4 max-[1024px]:w-4"
                        alt=""
                      />
                      <p className="text-black text-[10px] font-semibold max-[1024px]:text-[8px] max-[415px]:text-[7px]">
                        Instant
                      </p>
                    </div>
                  )}

                  {!product?.available_shipping.includes(
                    SHIPPING_TYPE.NEXT_DAY
                  ) && (
                    <div className="flex gap-1 items-center">
                      <img
                        src={scheduled}
                        className="h-3.5 w-3.5 max-[1024px]:h-3 max-[1024px]:w-3 max-[415px]:h-2 max-[415px]:w-2"
                        alt=""
                      />
                      <p className="text-black text-[10px] font-semibold max-[1024px]:text-[8px] max-[415px]:text-[7px]">
                        Scheduled
                      </p>
                    </div>
                  )}
                </div>

                <div
                  className="capitalize text-black w-full break-normal text-sm font-medium
                  overflow-hidden text-ellipsis px-3 pt-1 max-[530px]:text-xs max-[415px]:text-[10px]
                  h-[38px] flex flex-col justify-start leading-tight"
                >
                  {trimName(product.name, 50)}
                </div>
              </Link>

              <div className="mx-2 grid gap-0.5 pb-2">
                <div className="">
                  {product?.variations ? (
                    <div className="flex justify-between">
                      <div className="text-poppins flex items-center text-[#FF9100] font-bold text-lg max-[530px]:text-xs max-[415px]:text-[10px]">
                        <FaDollarSign />
                        {product?.groupbuy_price
                          ? parseFloat(product?.groupbuy_price).toFixed(2)
                          : parseFloat(
                              product?.product_price_range.split("-")[0]
                            ).toFixed(2)}{" "}
                        {product?.in_stock === 0 && (
                          <span className="text-xs text-gray-400 font-normal">
                            Out of stock
                          </span>
                        )}
                        {product?.variations.discount !== 0 && (
                          <p className="ml-1 bg-[#5E44FF] text-white text-[10px] leading-[1.5] rounded-sm px-[3px] py-[0.5px]">
                            {product?.variations.discount} % off
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => addToFavourite(product, index)}
                        className="w-8 h-5 rounded-xl"
                      >
                        <FontAwesomeIcon
                          icon={
                            user && product?.added_in_wishlist === "Y"
                              ? fasHeart
                              : faHeart
                          }
                          size={20}
                          className="text-orangeButton h-5 w-8"
                        />
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400">Out of stock</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

      {showUnauthorizedWishlistErr && (
        <PopupMessage
          toggle={() => setShowUnauthorizedWishlistErr(false)}
          header="Unauthorized access"
          message="Please login to add to/remove from wishlist"
          result="fail"
        />
      )}

      {showResultStatus && (
        <PopupMessage
          toggle={() => setShowResultStatus(false)}
          header={result.result}
          message={result.message}
          result={result.result.toLowerCase()}
        />
      )}
    </>
  );
};

export default NewProductCard;

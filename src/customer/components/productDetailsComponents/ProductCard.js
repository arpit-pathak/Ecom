import React, { useEffect, useState } from "react";
import productImg1 from "../../../assets/buyer/productImg1.png";
import { SHIPPING_TYPE } from "../../../constants/general";
import instant from "../../../assets/buyer/product/instant.svg";
import sameday from "../../../assets/buyer/product/sameday.svg";
import scheduled from "../../../assets/buyer/product/scheduled.svg";

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
import PromptLoginPopup from "../../utils/PromptLoginPopup";

const ProductsCard = ({ products, setProducts, listFrom }) => {
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
          (res, api) => {
            setResult(res.data);
            setShowResultStatus(true);
            if (res.data.result === "SUCCESS") {
              let prods = products;
              prods[index] = { ...prods[index], added_in_wishlist: "Y" };
              setProducts([...prods]);
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
          (res, api) => {
            setResult(res.data);
            setShowResultStatus(true);
            if (res.data.result === "SUCCESS") {
              let prods = products;
              if (listFrom === "wishlist") {
                prods.splice(index, 1);
              } else {
                prods[index] = { ...prods[index], added_in_wishlist: "N" };
              }
              setProducts([...prods]);
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
              className="shadow-productListing flex flex-col relative
              !cursor:pointer h-fit mx-1 my-2 md:gap-[12px] box-border border-2 border-transparent hover:border hover:shadow-md
              hover:border-grey4Border hover:top-[-2px] ease-in duration-300"
              key={`product${index}`}
            >
              {/* favorite & rating */}
              <div className="absolute flex justify-between items-center w-full mt-2 pl-1">
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
                    size="sm"
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
                ></img>

                {/* shipping */}
                <div className="w-full h-10  max-[1024px]:h-8 max-[415px]:h-6 bg-mildOrange flex justify-evenly items-center">
                  {product?.available_shipping.includes(
                    SHIPPING_TYPE.INSTANT
                  ) && (
                    <div className="flex gap-0.5 items-center">
                      <img
                        src={instant}
                        className="h-5 w-5 max-[1024px]:h-4 max-[1024px]:w-4"
                        alt=""
                      ></img>
                      <p className="text-black text-[10px] font-semibold max-[1024px]:text-[8px] max-[415px]:text-[7px]">
                        Instant
                      </p>
                    </div>
                  )}

                  {product?.available_shipping.includes(
                    SHIPPING_TYPE.SAME_DAY
                  ) && (
                    <div className="flex gap-1 items-center">
                      <img
                        src={sameday}
                        className="h-4 w-4 max-[1024px]:h-3 max-[1024px]:w-3"
                        alt=""
                      ></img>
                      <p className="text-black text-[10px] font-semibold max-[1024px]:text-[8px] max-[415px]:text-[7px]">
                        Same Day
                      </p>
                    </div>
                  )}

                  {product?.available_shipping.includes(
                    SHIPPING_TYPE.NEXT_DAY
                  ) && (
                    <div className="flex gap-1 items-center">
                      <img
                        src={scheduled}
                        className="h-3 w-3 max-[1024px]:h-3 max-[1024px]:w-3 max-[415px]:h-2 max-[415px]:w-2"
                        alt=""
                      ></img>
                      <p className="text-black text-[10px] font-semibold max-[1024px]:text-[8px] max-[415px]:text-[7px]">
                        Scheduled
                      </p>
                    </div>
                  )}
                </div>

                <div className="mx-2 grid gap-0.5 pb-2">
                  <div
                    className="capitalize font-semibold text-black w-full break-normal text-sm
                    overflow-hidden text-ellipsis mt-2  max-[530px]:text-xs max-[415px]:text-[10px]"
                  >
                    {trimName(product.name, 25)}
                  </div>
                  <p className="text-poppins text-orangeButton font-semibold text-sm leading-2 max-[530px]:text-xs max-[415px]:text-[10px]">
                    $
                    {product?.groupbuy_price
                      ? parseFloat(product?.groupbuy_price).toFixed(2)
                      : product?.product_price_range}{" "}
                    {product?.in_stock === 0 && (
                      <span className="text-xs text-gray-400 font-normal">
                        Out of stock
                      </span>
                    )}
                  </p>
                </div>
              </Link>
              {/* <button
                onClick={() => {
                  addToCart(product);
                  navigate(CustomerRoutes.MyCart);
                }}
                disabled={!product?.variations && true}
                id="buyNow"
                className="flex items-center justify-center bg-orangeButton h-[36px] max-[530px]:h-8 max-[415px]:h-6 text-white 
                text-sm max-[530px]:text-xs max-[415px]:text-[10px] font-medium ml-2 mr-1 mb-3 w-[93%] cp disabled:bg-opacity-60
                disabled:cursor-default"
              >
                Order Now
              </button> */}
            </div>
          );
        })}

      {/* {showUnauthorizedWishlistErr && (
        <PopupMessage
          toggle={() => setShowUnauthorizedWishlistErr(false)}
          header="Unauthorized access"
          message="Please login to add to/remove from wishlist"
          result="fail"
        />
      )} */}

      {showUnauthorizedWishlistErr && (
        <PromptLoginPopup
          isOpen={showUnauthorizedWishlistErr}
          setIsOpen={setShowUnauthorizedWishlistErr}
          navigateTo={window.location.href}
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

export default ProductsCard;

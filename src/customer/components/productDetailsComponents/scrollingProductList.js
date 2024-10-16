import { MdArrowForwardIos, MdArrowBackIos } from "react-icons/md";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDispatch } from "react-redux";
import {
  retrieveCartQuantity,
  setCartItems,
} from "../../redux/reducers/cartReducer";

import productImg1 from "../../../assets/buyer/productImg1.png";
import { SHIPPING_TYPE } from "../../../constants/general";
import instant from "../../../assets/buyer/product/instant.svg";
import sameday from "../../../assets/buyer/product/sameday.svg";
import scheduled from "../../../assets/buyer/product/scheduled.svg";

import { Link } from "react-router-dom"; //useNavigate
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

const ScrollingProductList = ({ title, prodSlug }) => {
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("customer"));

  const [prods, setProds] = useState([]);
  const [page, setPage] = useState(1);
  const [showUnauthorizedWishlistErr, setShowUnauthorizedWishlistErr] =
    useState(false);
  const [showResultStatus, setShowResultStatus] = useState(false);
  const [result, setResult] = useState(false);
  const [pages, setPages] = useState(1);
  const [scrollWidth, setScrollWidth] = useState("");
  const [listLength, setListLength] = useState("");
  const [total, setTotal] = useState(0);
  const [innerWidth, setInnerWidth] = useState(0);

  const divRef = useRef(null);

  const [startX, setStartX] = useState(null)
  const [scrollLeft, setScrollLeft] = useState(0)

  useEffect(()=>{
    setInnerWidth(window.innerWidth)
  },[window.innerWidth])

  useEffect(() => {
    let prodListWidth = innerWidth - 235;
    let listlen = Math.round(prodListWidth/208)

    if(innerWidth <= 640){
      listlen = 25;
      prodListWidth = innerWidth
    }   

    if(innerWidth <= 400){
      prodListWidth= innerWidth + 100
    }

    setListLength(listlen)
    setScrollWidth(prodListWidth)
  },[innerWidth])

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
              let prods = prods;
              prods[index] = { ...prods[index], added_in_wishlist: "Y" };
              setProds([...prods]);
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
              let prods = prods;
              prods[index] = { ...prods[index], added_in_wishlist: "N" };
              setProds([...prods]);
            }
          }
        );
      }
    } else {
      setShowUnauthorizedWishlistErr(true);
    }
  };

  const processRes = (res, api) => {
    if (api === Apis.retrieveCart) {
      const newCartItem = res.data.data.cart_item;
      if (newCartItem !== undefined) {
        dispatch(setCartItems(newCartItem));
        dispatch(retrieveCartQuantity());
      }
      return;
    }

    if (api.includes(Apis.sameShopProducts) || api.includes(Apis.relatedProducts)) {
      if (res.data.result === "SUCCESS") {
        let currentProds = [...prods, ...res.data.data?.products];
        setProds(currentProds);
        setPages(res.data.data?.pages);
        setTotal(res.data.data.total)
      }
    }
  };

  const callPrevSet = () => {
    handleScroll(-(scrollWidth));
  };

  const callNextSet = () => {
    if (page < pages) {
      setPage(page+1);
    }   

    if(prods.length === total){
      handleScroll(scrollWidth)
    }
  };

  useEffect(()=>{
    if(page >1){
      handleScroll(scrollWidth);
    }
  },[prods])

  useEffect(() => {
    if (listLength !== "") {
      const formData = new FormData();

      let endpoint = "";
      if (title === "From the Same Shop") {
        endpoint =  Apis.sameShopProducts + "?list_length=" + listLength + "&page=" + page + "&product_slug=" + prodSlug
      } else {
        endpoint =  Apis.relatedProducts + "?list_length=" + listLength + "&page=" + page + "&product_slug=" + prodSlug
      }
        
      BuyerApiCalls(formData, endpoint , "GET", {}, processRes);
    }
  }, [page, listLength]);

  const handleScroll = (scrollOffset) => {
    if (divRef.current) {
      divRef.current.scrollLeft += scrollOffset;
    }
  };

  // useEffect(() => {
  //   if(innerWidth <= 640){
  //     const el = divRef.current;
  //     if (el) {
  //       const onWheel = e => {
  //         if (e.deltaY == 0) return;
  //         e.preventDefault();
  //         el.scrollTo({
  //           left: el.scrollLeft + e.deltaY,
  //           behavior: "smooth"
  //         });
  //       };
  //       el.addEventListener("wheel", onWheel);
  //       return () => el.removeEventListener("wheel", onWheel);
  //   }
  // }
  // }, []);

  const getProdCards = () => {
    return (
      <>
        {prods.map((product, index) => {
          return (
            <div
              className="shadow-productListing flex-none relative !w-52 !cursor:pointer h-fit mx-1 my-2 box-border
                   border-2 border-transparent hover:border hover:shadow-md hover:border-grey4Border hover:top-[-2px] ease-in 
                   duration-300"
              key={`prod${index}`}
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
                      {product?.review_count}
                    </p>
                  </div>
                )}
              </div>

              <Link
                to={CustomerRoutes.ProductDetails + `${product?.slug}/`}
                state={product.id_product}
                key={product.id_product}
              >
                {/* prod img */}
                <img
                  src={product?.cover_image?.list_img ?? productImg1}
                  className="w-full h-[202px] object-contain"
                  alt=""
                ></img>

                {/* shipping */}
                <div className="w-full h-10 bg-mildOrange flex justify-evenly items-center">
                  {product?.available_shipping.includes(
                    SHIPPING_TYPE.INSTANT
                  ) && (
                    <div className="flex gap-1 items-center">
                      <img src={instant} className="h-5 w-5" alt=""></img>
                      <p className="text-black text-[9px] font-semibold">
                        Instant
                      </p>
                    </div>
                  )}

                  {product?.available_shipping.includes(
                    SHIPPING_TYPE.SAME_DAY
                  ) && (
                    <div className="flex gap-1 items-center">
                      <img src={sameday} className="h-4 w-4" alt=""></img>
                      <p className="text-black text-[9px] font-semibold">
                        Same Day
                      </p>
                    </div>
                  )}

                  {product?.available_shipping.includes(
                    SHIPPING_TYPE.NEXT_DAY
                  ) && (
                    <div className="flex gap-1 items-center">
                      <img src={scheduled} className="h-3 w-3" alt=""></img>
                      <p className="text-black text-[9px] font-semibold">
                        Scheduled
                      </p>
                    </div>
                  )}
                </div>

                <div className="mx-2 grid gap-0.5 pb-2">
                  <div
                    className="capitalize font-semibold text-black w-full break-normal text-sm
                    overflow-hidden text-ellipsis mt-2"
                  >
                    {trimName(product.name, 20)}
                  </div>
                  {product?.variations ? (
                    <>
                      {product.variations?.discount.toFixed(0) === "0" ||
                      product.variations?.discount.toFixed(0) === undefined ? (
                        <p className="text-poppins text-orangeButton font-semibold text-sm leading-2">
                          ${product?.variations?.price.toFixed(2)}
                        </p>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <p className="text-poppins text-orangeButton font-semibold text-sm">
                            $
                            {product?.variations?.discounted_price.toFixed(2) ||
                              0}
                          </p>
                          <p className="text-[14px] line-through text-gray-400">
                            ${product?.variations?.price.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">Out of stock</p>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
      </>
    );
  };

  const handleTouchStart = (e) =>{
    setStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e) => {
    // console.log("start x ", startX)
    // if(!startX) return;
    const x = e.touches[0].clientX;
    console.log("x ", x)
    const distance = startX - x;
    setScrollLeft(distance)
    // divRef.current.scrollLeft =  distance;
    // console.log("scroll ", scrollLeft, distance)
  }

  const handleTouchEnd = () => {
    console.log("dist ", scrollLeft)
    divRef.current.scrollLeft +=  scrollLeft;
    // setStartX(null)
    // setScrollLeft(divRef.current.scrollLeft)
  }

  return (
    <>
      {prods.length > 0 && (
        <div className="rounded-xl sm:border border-grey4Border py-6 sm:px-3 w-full mb-14">
          <label className="font-bold text-lg sm:ml-2 mb-3">{title}</label>
          {innerWidth <= 640 ? (
            <div
              ref={divRef}
              className="flex items-center w-full overflow-x-hidden scroll-smooth"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {getProdCards()}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <MdArrowBackIos className="cp" size={25} onClick={callPrevSet} />
              <div
                className="flex items-center w-full justify-center overflow-x-hidden scroll-smooth"
                ref={divRef}
              >
                {getProdCards()}
              </div>
              <MdArrowForwardIos
                className="cp"
                size={25}
                onClick={callNextSet}
              />
            </div>
          )}

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
        </div>
      )}
    </>
  );
};

export default ScrollingProductList;

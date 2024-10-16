import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MdArrowForwardIos } from "react-icons/md";
import { Apis, BuyerApiCalls } from "../../utils/ApiCalls";
import noImage from "../../../assets/add-variant-img.svg";
import titleImg from "../../../assets/buyer/discover-by-brands.svg";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { SlArrowRight, SlArrowLeft } from "react-icons/sl";
import NewProductCard from "../productDetailsComponents/NewProductCard";
import { CustomerRoutes } from "../../../Routes";

const DiscoverBrands = () => {
  const navigate = useNavigate();
  const [shopList, setShopList] = useState([]);
  const [currShopIdx, setCurrShopIdx] = useState(0);
  const [prodList, setProdList] = useState([]);
  const [slidesPerRow, setSlidesPerRow] = useState(6);

  const ArrowCss =
    "hidden sm:block bg-white p-2 border-transparent shadow-lg text-slate-500 text-2xl rounded-full absolute bottom-1/2 hover:p-[14px] transition-all duration-300 hover:shadow-xl hover:text-slate-600 z-20";

  // Debounce function to limit the rate of `updateSlidesPerRow` execution
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  const updateSlidesPerRow = useCallback(() => {
    let newSlidesPerRow;

    if (window.innerWidth < 640) {
      // Small screens
      newSlidesPerRow = 2;
    } else if (window.innerWidth >= 640 && window.innerWidth < 1070) {
      //small-mid
      newSlidesPerRow = 3;
    } else if (window.innerWidth >= 1070 && window.innerWidth < 1280) {
      // Medium screens
      newSlidesPerRow = 4;
    } else if (window.innerWidth >= 1280 && window.innerWidth < 1500) {
      // Large screens
      newSlidesPerRow = 5;
    } else {
      newSlidesPerRow = 6;
    }

    setSlidesPerRow(newSlidesPerRow);
  }, [prodList?.length]);

  const CustomCarouselLeftArrow = ({ onClick }) => (
    <button
      className={`${ArrowCss} left-[-10px] z-50 md:left-[-40px]`}
      onClick={onClick}
    >
      <SlArrowLeft size={15} />
    </button>
  );

  const CustomCarouselRightArrow = ({ onClick }) => (
    <button
      className={`${ArrowCss} right-[-10px] z-50 md:right-[-40px]`}
      onClick={onClick}
    >
      <SlArrowRight size={15} />
    </button>
  );

  const settings = {
    infinite: false,
    speed: 500,
    rows: 1,
    slidesToShow: slidesPerRow,
    nextArrow: <CustomCarouselRightArrow />,
    prevArrow: <CustomCarouselLeftArrow />,
  };

  useEffect(() => {
    updateSlidesPerRow();
    const debouncedResize = debounce(updateSlidesPerRow, 100);

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
    };
  }, [updateSlidesPerRow]);

  useEffect(() => {
    BuyerApiCalls({}, Apis.featuredShops, "GET", {}, (res) => {
      if (res.data.result === "SUCCESS") {
        setShopList(res.data.data?.featured_shop || []);
        setCurrShopIdx(0);
      }
    });
  }, []);

  useEffect(() => {
    if (shopList[currShopIdx]?.shop_slug) {
      BuyerApiCalls(
        {},
        `${Apis.sellerProductListing}?list_length=30&page=1&shop_slug=${shopList[currShopIdx].shop_slug}`,
        "GET",
        {},
        (res) => {
          setProdList(
            res.data.result === "SUCCESS" ? res.data.data?.products : []
          );
        }
      );
    }
  }, [shopList, currShopIdx]);

  return (
    shopList?.length > 0 && (
      <section className="flex flex-col mt-10 bg-white px-5 py-5 mb-5">
        <p className="flex gap-3 font-bold uppercase text-base md:text-lg">
          <img src={titleImg} alt="title" />
          Discover By Brands
        </p>

        <div className="grid grid-cols-6 max-md:grid-cols-3 gap-0 mt-4">
          {shopList.map((shop, index) => (
            <div
              className={`cp flex flex-col items-center py-2 border-[#E2E2E2] ${
                currShopIdx === index
                  ? "border-r-[1px] border-l-[1px] border-t-[6px] border-t-[#F5AB35]"
                  : "border-b-[1px]"
              }`}
              onClick={() => setCurrShopIdx(index)}
              key={shop.shop_slug}
            >
              <img
                src={shop?.shop_logo_img || noImage}
                alt="shop"
                className="object-contain h-24 w-full"
              />
            </div>
          ))}
        </div>

        {prodList?.length > 6 && (
          <div className="flex justify-between text-sm mt-2 mb-4 items-center">
            <p>{shopList[currShopIdx]?.shop_name}</p>
            <p
              className="text-xs leading-5 text-orangeButton font-semibold flex gap-1 items-center cp"
              onClick={() =>
                navigate(
                  CustomerRoutes.ShopDetails +
                    shopList[currShopIdx].shop_slug +
                    "/"
                )
              }
            >
              View all <MdArrowForwardIos />
            </p>
          </div>
        )}

        {prodList?.length > 0 ? (
          <Slider {...settings}>
            {prodList?.map((product) => (
              <div key={product.id_product}>
                <NewProductCard products={[product]} />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="flex justify-center items-center h-32">
            <p className="text-gray-500 text-xl uppercase">No products Found</p>
          </div>
        )}
      </section>
    )
  );
};

export default DiscoverBrands;

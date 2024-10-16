import React, { useEffect, useState } from "react";
import TopDealProductCards from "./TopDealProductCards";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// images and icons
import checkoutImg from "../../../assets/buyer/top-deal-checkout.svg";
import { Apis, BuyerApiCalls } from "../../utils/ApiCalls";
import { SlArrowLeft, SlArrowRight } from "react-icons/sl";
import { MdArrowForwardIos } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { CustomerRoutes } from "../../../Routes";

const TopDeals = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("customer"));
  const [topDealProducts, setTopDealProducts] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth); // Get initial window width

  const ArrowCss =
    "hidden sm:block bg-white p-[8px] border-transparent shadow-lg text-slate-500 text-[28px] rounded-full absolute bottom-1/2 hover:p-[14px] hover:transition-all hover:duration-300 hover:shadow-xl hover:text-slate-600 hover:z-20";

  const CustomCarouselLeftArrow = ({ onClick, currentSlide }) =>
    currentSlide !== 0 ? (
      <button
        className={`${ArrowCss} left-[-10px] z-50 md:left-[-20px]`}
        onClick={onClick}
      >
        <SlArrowLeft size={15} />
      </button>
    ) : null;

  const CustomCarouselRightArrow = ({ onClick, slideCount, currentSlide }) =>
    currentSlide !== slideCount - getSlidesPerRow() ? (
      <button
        className={`${ArrowCss} right-[-10px] z-50 md:right-[-10px]`}
        onClick={onClick}
      >
        <SlArrowRight size={15} />
      </button>
    ) : null;

  // Function to determine slides per row based on window width
  const getSlidesPerRow = () => {
    if (windowWidth < 640) return 2;
    if (windowWidth >= 640 && windowWidth < 1280) return 4;
    if (windowWidth >= 1280 && windowWidth < 1536) return 5;
    return 6;
  };

  const settings = {
    infinite: false,
    speed: 500,
    rows: 1,
    slidesToShow: getSlidesPerRow(),
    slidesToScroll: getSlidesPerRow(),
    nextArrow: <CustomCarouselRightArrow />,
    prevArrow: <CustomCarouselLeftArrow />,
    responsive: [
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
        },
      },
      {
        breakpoint: 1536,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 5,
        },
      },
      {
        breakpoint: Infinity,
        settings: {
          slidesToShow: 6,
          slidesToScroll: 6,
        },
      },
    ],
  };

  useEffect(() => {
    // Update window width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [window.innerWidth]);

  useEffect(() => {
    BuyerApiCalls(
      {},
      Apis.productList + "top-deals-all/?list_length=18",
      "GET",
      user
        ? {
            Authorization: `Bearer ${user?.access}`,
          }
        : {},
      (res) => {
        if (res.data) {
          let rdata = res.data?.data?.products ?? [];
          setTopDealProducts(rdata);
        }
      }
    );
  }, []);

  return (
    <div className="md:mt-4 mb-6">
      <div className="pb-5 flex justify-between">
        <div className="flex flex-col lg:flex-row lg:items-center max-[1024px]:w-full">
          <div className="flex justify-between max-[1024px]:w-full">
            <p className="max-[780px]:pl-2 text-xl leading-[22px] md:text-[26px] md:leading-8 font-extrabold text-[#FB8700]">
              TODAY'S TOP DEAL
            </p>
            <button
              className="text-[#F5AB35] items-center gap-1 text-sm flex lg:hidden"
              onClick={() =>
                navigate(
                  CustomerRoutes.ProductListing + `keyword=top-deals-all`
                )
              }
            >
              <p className="font-semibold">View all</p>
              <MdArrowForwardIos />
            </button>
          </div>
          <img
            src={checkoutImg}
            alt="checkout-img"
            className="md:pl-4 max-[780px]:mt-1 mb-1 h-[31px] w-[320px] md:w-[381px] md:h-[39px]"
          />
        </div>

        <button
          className="text-[#F5AB35] items-center gap-1 text-sm hidden lg:flex"
          onClick={() =>
            navigate(CustomerRoutes.ProductListing + `keyword=top-deals-all`)
          }
        >
          <p className="font-semibold">View all</p>
          <MdArrowForwardIos />
        </button>
      </div>

      <Slider {...settings}>
        {topDealProducts?.map((prod, idx) => (
          <div key={prod.id_product} className="px-1 md:px-2">
            <TopDealProductCards product={prod} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TopDeals;

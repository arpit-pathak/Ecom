import ushopLogo from "../../../assets/buyer/ushop-2.png";
import voucherArrow from "../../../assets/buyer/voucher-arrow.png";
import welcomeVoucher from "../../../assets/buyer/welcomeVoucher-new.png";
import sameDayProductsBtn from "../../../assets/buyer/same-day-products-btn.svg";
import decideWhenReceive from "../../../assets/buyer/decide-when-receive.svg";
import sameDayDelivery from "../../../assets/buyer/same-day.svg";
import islandWideDelivery from "../../../assets/buyer/island-wide-delivery.svg";
import mumKidsBanner from "../../../assets/buyer/new-banner-kids.png";
import brunchIdeas from "../../../assets/buyer/new-banner-brunch.png";
import summerSelfcare from "../../../assets/buyer/new-banner-selfcare.png";
import { useEffect, useState } from "react";
import { SlArrowRight, SlArrowLeft } from "react-icons/sl";
import { GoDash } from "react-icons/go";
import { TfiArrowRight } from "react-icons/tfi";
import { Link, useNavigate } from "react-router-dom";
import { CustomerRoutes } from "../../../Routes";
import { useDispatch } from "react-redux";
import {
  setMainCategory,
  setSubCategoryName,
} from "../../redux/reducers/categoryReducer";

const bannerData = [
  {
    title: "Mum & Kids",
    bgImage: mumKidsBanner,
    slug: "mummies-babies",
  },
  {
    title: "Brunch Ideas",
    bgImage: brunchIdeas,
    slug: "food-beverage",
  },
  {
    title: "Summer Selfcare",
    bgImage: summerSelfcare,
    slug: "beauty-pharmacy",
  },
];

const CategoriesCarousel = () => {
  const [bannerIdx, setBannerIdx] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("customer"));

  const prevBanner = () => {
    if (bannerIdx > 0) setBannerIdx(bannerIdx - 1);
  };

  const nextBanner = () => {
    if (bannerIdx < bannerData.length - 1) setBannerIdx(bannerIdx + 1);
  };

  // Automatically increment banner index every 6 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIdx((prevIdx) => (prevIdx + 1) % bannerData.length);
    }, 6000);

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return (
    <div className="w-full h-fit flex flex-row">
      {/* Left banner section */}
      <div
        className="flex-1 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bannerData[bannerIdx].bgImage})` }}
      >
        <div className="pl-6 lg:pl-12 pt-[280px] lg:pt-[350px]">
          <div className="text-white flex items-center gap-2 text-xl lg:text-2xl font-thin font-sans">
            {bannerIdx !== 0 && (
              <SlArrowLeft
                className="mr-2 cursor-pointer"
                size={25}
                onClick={prevBanner}
              />
            )}
            <span className="p-5 border border-white rounded-full w-[30px] h-[30px] lg:w-[40px] lg:h-[40px] flex items-center justify-center">
              0{bannerIdx + 1}
            </span>{" "}
            {" / "}{" "}
            <span className="text-[28px] lg:text-[32px]">
              0{bannerData.length}
            </span>
            {bannerIdx !== bannerData.length - 1 && (
              <SlArrowRight
                className="ml-2 cursor-pointer"
                size={25}
                onClick={nextBanner}
              />
            )}
          </div>

          <div className="flex flex-col gap-1 lg:gap-2 mt-2">
            {bannerData.map((item, idx) => (
              <div className="text-white" key={`${item.title}-${idx}`}>
                {idx === bannerIdx ? (
                  <p className="text-4xl lg:text-6xl">{item.title}</p>
                ) : (
                  <div className="flex gap-2 items-center">
                    <GoDash size={window.innerWidth >= 1024 ? 30 : 25} />
                    <p className="text-xl lg:text-2xl">{item.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          // to={CustomerRoutes.UshopBlogsArticle.replace(
          //   ":slug",
          //   bannerData[bannerIdx].slug
          // )}
          onClick={() => {
            dispatch(setMainCategory(bannerData[bannerIdx].title));
            dispatch(setSubCategoryName(bannerData[bannerIdx].title));
            navigate(
              CustomerRoutes.CategoryProductListing +
                bannerData[bannerIdx].slug +
                "/"
            );
          }}
          className="text-white cp flex justify-end items-center gap-2 pr-4 pt-4 lg:pt-8 pb-2"
        >
          <p className="text-3xl lg:text-4xl">Receive Today</p>
          <TfiArrowRight size={window.innerWidth >= 1024 ? 40 : 30} />
        </div>
      </div>

      {/* Right banner section */}
      <div className="bg-[#f5ab35] flex-1 relative flex-col hidden lg:flex">
        <img src={ushopLogo} alt="ushop-logo" className="pt-28 2xl:pt-4" />

        <div className="absolute top-[240px] left-1/2 transform -translate-x-1/2 lg:left-20 lg:translate-x-0 text-center lg:text-left">
          <p className="text-white font-light font-sans text-4xl xl:text-5xl 2xl:text-6xl">
            Shop online
          </p>
          <p className="text-white font-bold font-sans text-4xl xl:text-5xl 2xl:text-6xl pl-2 lg:pl-8 italic">
            on <span className="font-thin">your</span> demand
          </p>
        </div>

        <div className="flex items-center pl-10 lg:pl-20 pt-3 lg:pt-5">
          <img
            src={decideWhenReceive}
            alt="decideWhenReceive"
            className="w-[110px] h-[110px] 2xl:w-[160px] 2xl:h-[160px]"
          />
          <img
            src={sameDayDelivery}
            alt="sameDayDelivery"
            className="w-[101px] h-[109px] 2xl:w-[163px] 2xl:h-[157px]"
          />
          <img
            src={islandWideDelivery}
            alt="islandWideDelivery"
            className="w-[109px] h-[109px] 2xl:w-[157px] 2xl:h-[157px]"
          />
        </div>

        <img
          src={sameDayProductsBtn}
          alt="same-day-products-btn"
          className="w-[250px] h-[50px] 2xl:w-[315px] 2xl:h-[64px] ml-12 2xl:ml-24 mt-20 2xl:mt-7 cursor-pointer"
          onClick={() => {
            navigate(CustomerRoutes.ProductListing + `shipping_id=1`);
          }}
        />

        {!user && (
          <div className="flex flex-col absolute bottom-0 right-0 gap-3 items-center bg-[#FFE2B4] rounded-md w-[180px] h-fit 2xl:w-[250px] 2xl:h-fit">
            <div className="text-[#C87B00] flex justify-between w-full pl-3 lg:pl-5 pr-3 lg:pr-4 pt-2 lg:pt-4">
              <p className="text-xs lg:text-sm font-bold">
                Welcome <br /> voucher
              </p>
              <img
                src={voucherArrow}
                alt="arrow"
                className="h-[30px] w-[30px] lg:h-[46px] lg:w-[46px]"
              />
            </div>

            <img
              src={welcomeVoucher}
              alt="welcome-voucher-img"
              className="pb-2"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesCarousel;

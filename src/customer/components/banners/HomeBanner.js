import React, { useEffect, useState } from "react";

//css
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import defaultBanner from "../../../assets/buyer/defaultBanner.svg";
import { SlArrowRight, SlArrowLeft } from "react-icons/sl";

// .custom-arrows {
//   font-size: 30px;
//   position: absolute;
//   z-index: 10;
//   margin: auto 0;
//   top: 0;
//   bottom: 0;
//   height: 60px;
//   border-radius: 100%;
//   border: 1px solid white;
//   text-align: center;
//   cursor: pointer;
// }
const bannerArrowsCss =
  "bg-[#ffffff]/[0.1] p-[10px] text-white text-[30px] sm:text-[30px] absolute z-10 top-10 sm:top-[180px] h-8 w-8 sm:h-16 sm:w-16 border-[1px] border-white rounded-full flex items-center justify-center cursor-pointer";

const CustomArrow = ({ onClick, direction }) => {
  const arrowPosition = direction === "right" ? "right-[16px]" : "left-[16px]";

  return (
    <div className={`${bannerArrowsCss} ${arrowPosition}`} onClick={onClick}>
      {direction === "right" ? <SlArrowRight /> : <SlArrowLeft />}
    </div>
  );
};

export const HomeBanner = ({ banners, title }) => {
  const [isMobile, setIsMobile ] = useState(false)

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <CustomArrow direction="right" />,
    prevArrow: <CustomArrow direction="left" />,
    appendDots: (dots) => (
      <div>
        <ul className="custom-dots">{dots}</ul>
      </div>
    ),
    customPaging: (i) => (
      <div className="h-[10px] absolute top-10 sm:top-0 w-[10px] sm:h-[20px] sm:w-[20px] border border-white bg-[#333333]/[0.2] rounded-[10px]"></div>
    ),
    autoplay: true,
    autoplaySpeed: 5000
  };

  const updateImageAccess = () => {
    if (window.innerWidth <= 768) setIsMobile(true);
    else setIsMobile(false);
  };

  useEffect(() => {
    updateImageAccess();
    window.addEventListener("resize", updateImageAccess);
    return () => {
      window.removeEventListener("resize", updateImageAccess);
    };
  }, [window.innerWidth]);

  return (
    //sm:px-[16px]   md:px-[80px]
    <div className="sm:py-[16px] md:py-[32px] sm:bg-[#fafafa] bg-orangeButton">
      {banners.length > 0 ? (
        <>
          <Slider {...settings}>
            {banners.map((itm, x) =>
              itm.title.toLowerCase() === title ? (
                <img
                  key={x}
                  alt={itm.title}
                  loading="lazy"
                  src={isMobile ? itm?.mobile_image_url : itm.image_url}
                  className="!max-h-[350px] cp"
                  onClick={() => window.open(itm?.content_url, '_blank')}
                />
              ) : null
            )}
          </Slider>
        </>
      ) : (
        <>
          <Slider {...settings}>
            <div className="w-full flex justify-center items-center">
              <img
                src={defaultBanner}
                className="mx-auto w-full max-h-[400px]"
                alt=""
              />
            </div>
          </Slider>
        </>
      )}
    </div>
  );
};

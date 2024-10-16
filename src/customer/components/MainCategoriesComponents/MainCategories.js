import React, { useEffect, useState } from "react";
import CategoryThumbnail from "./CategoryThumbnail";
import { SlArrowRight, SlArrowLeft } from "react-icons/sl";
import Slider from "react-slick";
import "../../../css/customer.css";

const ArrowCss =
  "hidden sm:block bg-white p-[14px] border-transparent shadow-lg text-slate-500 text-[28px] rounded-full absolute bottom-1/2    hover:p-[24px] hover:transition-all hover:duration-300 hover:shadow-xl hover:text-slate-600 hover:z-20";
function CustomCarouselLeftArrow(props) {
  const { onClick } = props;
  return (
    <button className={`${ArrowCss} left-[-10px] z-50 md:left-[-50px]`} onClick={onClick}>
      <SlArrowLeft></SlArrowLeft>
    </button>
  );
}
function CustomCarouselRightArrow(props) {
  const { onClick } = props;
  return (
    <button className={`${ArrowCss} right-[-10px] z-50 md:right-[-50px]`} onClick={onClick}>
      <SlArrowRight></SlArrowRight>
    </button>
  );
}

function MainCategories({ categories }) {
  //responsiveness
  const [slidesPerRow, setSlidesPerRow] = useState(4);
  // const [itemsPerRow, setItemsPerRow] = useState()

  const updateSlidesPerRow = () => {
    let windowWidth;  
    if(window.innerWidth<640){
      setSlidesPerRow(2);
    }else{
      setSlidesPerRow(4);
    }
    // let numberOfSlide = Math.floor(windowWidth / 140);
    // setSlidesPerRow(numberOfSlide);
    // setItemsPerRow(Math.floor(numberOfSlide/2))
  };
  
  // Update slides per row when the component mounts and when the window size changes
  useEffect(() => {
    updateSlidesPerRow();
    window.addEventListener("resize", updateSlidesPerRow);
    return () => {
      window.removeEventListener("resize", updateSlidesPerRow);
    };
  }, [window.innerWidth]);

  const settings = {
    className: "center",
    infinite: false,
    speed: 500,
    rows: 2,
    slidesToShow: slidesPerRow,
    slidesPerRow: 2,
    nextArrow: <CustomCarouselRightArrow />,
    prevArrow: <CustomCarouselLeftArrow />,
  };
  // const settings = {
  //   className: "center",
  //   infinite: false,
  //   speed: 500,
  //   rows: 2,
  //   slidesToShow: 1,
  //   slidesPerRow: slidesPerRow,
  //   nextArrow: <CustomCarouselRightArrow />,
  //   prevArrow: <CustomCarouselLeftArrow />,
  // };

  return (
    <section className="flex flex-col mt-10">
      <p className="font-bold uppercase text-[14px] md:text-[18px] ">
        top categories
      </p>
      <div className="h-[2px] w-16 bg-amber-500 mb-4 "></div>
      <div className="relative">
        <Slider {...settings}>
          {categories.length > 0
            ? categories.map((item) => (
                <div key={item.id_category} className="h-[190px] md:h-[240px]">
                  <CategoryThumbnail
                    id_category={item.id_category}
                    slug={item.slug}
                    name={item.name}
                    image_url={item.image_url}
                  />
                </div>
              ))
            : [...Array(8)].map((_, index) => (
                // Render each item here
                <div key={index}>
                  <CategoryThumbnail></CategoryThumbnail>
                </div>
              ))}
        </Slider>
      </div>
    </section>
  );
}
export default MainCategories;

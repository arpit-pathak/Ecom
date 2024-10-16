import React, { useEffect, useState, useCallback } from "react";
import { MdArrowForwardIos } from "react-icons/md";
import GroupBuyCard from "../groupBuyComponents/GroupBuyCard.jsx";
import { useNavigate } from "react-router";
import { CustomerRoutes } from "../../../Routes";
import groupBuyIcon from "../../../assets/buyer/group-buy.svg";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { SlArrowRight, SlArrowLeft } from "react-icons/sl";

const GroupBuyList = ({ groupBuyList, groupBuyTotal }) => {
  const navigate = useNavigate();
  const [slidesPerRow, setSlidesPerRow] = useState(4);
  const [rows, setRows] = useState(1);

  //* dummy data to test groupbuy products
  // Todo: remove the groupBuyList prop and uncomment below list
  // const groupBuyList = [
  //   {
  //     id_product_group_buy: 36,
  //     campaign_label: "#GB202409001",
  //     product_id: 263,
  //     product_id__name: "Natural Vitamin C Supplement 1000mg lakfa adlfki aeliafd lajgeiajd",
  //     product_id__slug: "263-natural-vitamin-c-supplement-1000mg",
  //     group_buy_price: "45.90",
  //     success_discount_price: "39.90",
  //     success_target_qty: 50,
  //     max_campaign_qty: 100,
  //     start_datetime: "08 Sep 2024 (Sun)",
  //     end_datetime: "14 Sep 2024 (Sat)",
  //     status_id: 1,
  //     avg_rating: 0,
  //     cover_image_count: 1,
  //     added_in_wishlist: "N",
  //     usual_price: "49.90",
  //     status: "Live",
  //     start_datetime_formated: "2024-09-08 00:00:00",
  //     end_datetime_formated: "2024-09-14 23:59:59",
  //     group_buy_sold_qty: 0,
  //     group_buy_total_sales: "0.00",
  //     product_image:
  //       "https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/product/263/image/200X200/1703059604.742659_VitaCjpg.jpg",
  //   },
  //   {
  //     id_product_group_buy: 37,
  //     campaign_label: "#GB202409002",
  //     product_id: 264,
  //     product_id__name: "iPhone Cable Lightning Speed",
  //     product_id__slug: "264-iphone-cable-lightning-speed",
  //     group_buy_price: "0.90",
  //     success_discount_price: "0.50",
  //     success_target_qty: 30,
  //     max_campaign_qty: 50,
  //     start_datetime: "08 Sep 2024 (Sun)",
  //     end_datetime: "14 Sep 2024 (Sat)",
  //     status_id: 1,
  //     avg_rating: 0,
  //     cover_image_count: 1,
  //     added_in_wishlist: "N",
  //     usual_price: "20.00",
  //     status: "Live",
  //     start_datetime_formated: "2024-09-08 00:00:00",
  //     end_datetime_formated: "2024-09-14 23:59:59",
  //     group_buy_sold_qty: 0,
  //     group_buy_total_sales: "0.00",
  //     product_image:
  //       "https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/product/264/image/200X200/1703065138.587516_Iphonecablejpg.jpg",
  //   },
  //   {
  //     id_product_group_buy: 37,
  //     campaign_label: "#GB202409002",
  //     product_id: 264,
  //     product_id__name: "iPhone Cable Lightning Speed",
  //     product_id__slug: "264-iphone-cable-lightning-speed",
  //     group_buy_price: "0.90",
  //     success_discount_price: "0.50",
  //     success_target_qty: 30,
  //     max_campaign_qty: 50,
  //     start_datetime: "08 Sep 2024 (Sun)",
  //     end_datetime: "14 Sep 2024 (Sat)",
  //     status_id: 1,
  //     avg_rating: 0,
  //     cover_image_count: 1,
  //     added_in_wishlist: "N",
  //     usual_price: "20.00",
  //     status: "Live",
  //     start_datetime_formated: "2024-09-08 00:00:00",
  //     end_datetime_formated: "2024-09-14 23:59:59",
  //     group_buy_sold_qty: 0,
  //     group_buy_total_sales: "0.00",
  //     product_image:
  //       "https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/product/264/image/200X200/1703065138.587516_Iphonecablejpg.jpg",
  //   },
  //   {
  //     id_product_group_buy: 37,
  //     campaign_label: "#GB202409002",
  //     product_id: 264,
  //     product_id__name: "iPhone Cable Lightning Speed",
  //     product_id__slug: "264-iphone-cable-lightning-speed",
  //     group_buy_price: "0.90",
  //     success_discount_price: "0.50",
  //     success_target_qty: 30,
  //     max_campaign_qty: 50,
  //     start_datetime: "08 Sep 2024 (Sun)",
  //     end_datetime: "14 Sep 2024 (Sat)",
  //     status_id: 1,
  //     avg_rating: 0,
  //     cover_image_count: 1,
  //     added_in_wishlist: "N",
  //     usual_price: "20.00",
  //     status: "Live",
  //     start_datetime_formated: "2024-09-08 00:00:00",
  //     end_datetime_formated: "2024-09-14 23:59:59",
  //     group_buy_sold_qty: 0,
  //     group_buy_total_sales: "0.00",
  //     product_image:
  //       "https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/product/264/image/200X200/1703065138.587516_Iphonecablejpg.jpg",
  //   },
  //   {
  //     id_product_group_buy: 37,
  //     campaign_label: "#GB202409002",
  //     product_id: 264,
  //     product_id__name: "iPhone Cable Lightning Speed",
  //     product_id__slug: "264-iphone-cable-lightning-speed",
  //     group_buy_price: "0.90",
  //     success_discount_price: "0.50",
  //     success_target_qty: 30,
  //     max_campaign_qty: 50,
  //     start_datetime: "08 Sep 2024 (Sun)",
  //     end_datetime: "14 Sep 2024 (Sat)",
  //     status_id: 1,
  //     avg_rating: 0,
  //     cover_image_count: 1,
  //     added_in_wishlist: "N",
  //     usual_price: "20.00",
  //     status: "Live",
  //     start_datetime_formated: "2024-09-08 00:00:00",
  //     end_datetime_formated: "2024-09-14 23:59:59",
  //     group_buy_sold_qty: 0,
  //     group_buy_total_sales: "0.00",
  //     product_image:
  //       "https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/product/264/image/200X200/1703065138.587516_Iphonecablejpg.jpg",
  //   },
  // ];

  const ArrowCss =
    "hidden sm:block bg-white p-[8px] border-transparent shadow-lg text-slate-500 text-[28px] rounded-full absolute bottom-1/2 hover:p-[14px] hover:transition-all hover:duration-300 hover:shadow-xl hover:text-slate-600 hover:z-20";

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
      newSlidesPerRow = 2;
    } else if (window.innerWidth >= 640 && window.innerWidth < 1280) {
      newSlidesPerRow = 4;
    } else if (window.innerWidth > 1280 && window.innerWidth < 1536) {
      newSlidesPerRow = 5;
    } else {
      newSlidesPerRow = 6;
    }
    setSlidesPerRow(newSlidesPerRow);
  }, [groupBuyList?.length]);

  const updateRows = useCallback(() => {
    setRows(window.innerWidth < 769 && groupBuyList.length > 2 ? 2 : 1);
  }, [groupBuyList?.length]);

  useEffect(() => {
    updateSlidesPerRow();
    updateRows();
    const debouncedResize = debounce(updateSlidesPerRow, 100);
    const debounceUpdateRows = debounce(updateRows, 100);

    window.addEventListener("resize", debouncedResize);
    window.addEventListener("resize", debounceUpdateRows);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      window.removeEventListener("resize", debounceUpdateRows);
    };
  }, [updateSlidesPerRow, updateRows]);

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
    rows: rows,
    slidesToShow: slidesPerRow,
    nextArrow: <CustomCarouselRightArrow />,
    prevArrow: <CustomCarouselLeftArrow />,
  };

  if (!groupBuyList.length) return null;

  return (
    <section className="flex flex-col mt-10 bg-white w-full px-2 md:px-5 h-fit pb-5">
      <div className="flex justify-between items-center pb-4 py-5">
        <div className="flex gap-3 items-center">
          <img
            src={groupBuyIcon}
            alt="group-buy-icon"
            className="h-[20px] w-[20px]"
          />
          <p className="font-semibold text-[#333333] uppercase text-sm md:text-base">
            Group Buy deals
          </p>
        </div>

        {groupBuyTotal > 6 && (
          <p
            className="text-sm text-orangeButton font-semibold flex gap-1 items-center cp"
            onClick={() => navigate(CustomerRoutes.GroupBuyAll)}
          >
            View All <MdArrowForwardIos />
          </p>
        )}
      </div>

      <Slider {...settings}>
        {groupBuyList?.map((groupbuy) => (
          <div
            key={groupbuy.id_product_group_buy}
            className="pr-1 md:pr-[7px] mt-3 lg:mt-0"
          >
            <GroupBuyCard groupBuy={[groupbuy]} />
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default GroupBuyList;

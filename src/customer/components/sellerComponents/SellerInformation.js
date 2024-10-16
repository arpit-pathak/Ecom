import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineShop, AiFillWechat } from "react-icons/ai";
import percentageIcon from "../../../assets/buyer/percentageIcon.png";
import { CustomerRoutes } from "../../../Routes";
import { useDispatch } from "react-redux";
import { setWhichForm } from "../../redux/reducers/addressReducer";
import { USER_TYPE } from "../../../constants/general";
import ls from "local-storage";
import PromptLoginPopup from "../../utils/PromptLoginPopup";

function SellerInformation({ sellerInformation, setOpenModal, navigateTo }) {
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("customer"));
  const [isOpen, setIsOpen] = useState(false)

  const openChat = () => {
    if (user) {
      let dataToPass = {
        userType: USER_TYPE[1],
        receiverType: USER_TYPE[2],
        buyerId: user?.user_id,
        shopSlug: sellerInformation?.shop_slug,
        sellerId: sellerInformation?.user_id,
        shopName: sellerInformation?.shop_name,
      };

      ls("chatData", JSON.stringify(dataToPass));

      const newTab = window.open(CustomerRoutes.ChatScreen, "_blank");
      if (newTab) newTab.focus();
    } else setIsOpen(true);
  };

  if (sellerInformation) {
    return (
      <div className="flex flex-col justify-center md:justify-between md:flex md:flex-row flex-1 gap-[19px] flex-wrap w-full ">
        <div className="flex flex-1 gap-4 w-fit h-[76px] md:h-fit md:items-center">
          {/* <div className="w-[88px] h-[76px] md:w-[95px] md:h-[95px] bg-gray-400"></div> */}
          <img src={sellerInformation.merchant_shop_logo} className="w-[88px]  md:w-[95px] md:h-[95px] mt-1"></img>
          <div className="flex flex-col justify-start gap-[14px]">
            <div className="flex flex-col gap-[2px]">
              <p className="text-[12px] md:text-[14px]">
                {sellerInformation?.shop_name || sellerInformation?.individual_name }
              </p>
              <p className="text-gray-400 text-[10px] md:text-[14px]">
                {sellerInformation?.joined}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="max-sm:hidden flex justify-center items-center w-[61px] md:min-w-[74px]  px-2 h-8 gap-1 border rounded-[2px]
               border-orangeButton text-orangeButton cp" onClick={openChat}>
                <AiFillWechat size={16}></AiFillWechat>
                <p className="text-[10px] md:text-[14px]">Chat</p>
              </button>
              <button
                onClick={() => {
                  setOpenModal(true);
                  dispatch(setWhichForm("claimShopVoucher"));
                }}
                className="flex justify-center items-center px-2 w-[89px] md:min-w-[107px]  h-8 gap-1 border rounded-[2px] border-orangeButton text-orangeButton"
              >
                <img src={percentageIcon} className="w-4 h-4"></img>
                <p className="text-[10px] md:text-[14px]">Vouchers</p>
              </button>
              {sellerInformation.shop_name !== null && (
                <Link
                  to={{
                    pathname:
                      CustomerRoutes.ShopDetails + sellerInformation.shop_slug+"/",
                  }}
                  state={sellerInformation.shop_slug}
                  className="flex justify-center items-center px-2 min-w-[110px] w-fit h-8 gap-1 border rounded-[2px] border-orangeButton text-orangeButton"
                >
                  <AiOutlineShop size={16}></AiOutlineShop>
                  <p className="text-[10px] md:text-[14px] whitespace-nowrap">View Shop</p>
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap flex-col gap-5 min-w-[258px] h-full ">
          <div className="flex flex-wrap items-start justify-between capitalize w-full sm:w-[258px] md:w-full">
            <div className="flex flex-wrap items-center gap-[2px] md:gap-5 w-[54px]  md:w-[159px]">
              <p className="mobileSellerText11 md:text-[12px] leading-6">
                Ratings
              </p>
              <p className="text-orangeButton mobileSellerText12 md:text-[14px] leading-6">
                {sellerInformation.ratings}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-[2px] md:gap-5 w-[83px] md:w-[250px]">
              <p className="mobileSellerText11 leading-6">Responses rate</p>
              <p className="text-orangeButton mobileSellerText12 leading-6">
                {sellerInformation.response_rate}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-[2px] md:gap-5 w-[72px] md:w-[200px] leading-6">
              <p className="mobileSellerText11">Joined</p>
              <p className="text-orangeButton mobileSellerText12">
                {sellerInformation.joined}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-start justify-between capitalize w-full sm:w-[258px] md:w-[658px]">
            <div className="flex flex-wrap items-center gap-[2px] md:gap-5  w-[54px]   md:w-[159px]">
              <p className="mobileSellerText11 md:text-[12px]">Products</p>
              <p className="text-orangeButton mobileSellerText12">{sellerInformation?.products}</p>
            </div>
            <div className="flex flex-wrap items-center gap-[2px] md:gap-5 w-[83px]  md:w-[250px] ">
              <p className="mobileSellerText11">Response time</p>
              <p className="text-orangeButton mobileSellerText12">
                {sellerInformation.response_time}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-[2px] md:gap-5 w-[72px]  md:w-[200px] ">
              <p className="mobileSellerText11">follower</p>
              <p className="text-orangeButton mobileSellerText12">
                {sellerInformation.shop_followers_count}
              </p>
            </div>
          </div>
        </div>
        {isOpen && (
        <PromptLoginPopup
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          navigateTo={navigateTo}
        />
      )}
      </div>      
    );
  } else {
    return <div></div>;
  }
}
export default SellerInformation;

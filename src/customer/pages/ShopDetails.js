import { Links } from "../components/GenericSections";
import Navbar from "../components/navbar/Navbar";
import { useParams } from "react-router-dom";
import SellerProducts from "../components/sellerComponents/sellerProducts";
import { BuyerApiCalls, Apis } from "../utils/ApiCalls";
import { CustomerRoutes } from "../../Routes";
import { Constants } from "../utils/Constants";
import { PopUpComponent } from "../components/GenericComponents";
import PromptLoginPopup from "../utils/PromptLoginPopup";
//images
import voucherIcon from "../../assets/buyer/UshopVoucher.svg";
//icons
import { AiOutlineFileSearch } from "react-icons/ai";
import { USER_TYPE } from "../../constants/general";
import ls from "local-storage";

import { AiFillWechat } from "react-icons/ai";
import { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import PopupMessage from "../../merchant/components/PopupMessage.js";
import NewProductCard from "../components/productDetailsComponents/NewProductCard.jsx";

const LIST_LENGTH = 60;

export default function ShopDetail() {
  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");
  const [sellerInformation, setSellerInformation] = useState(null);
  const [sellerProductListing, setSellerProductListing] = useState([]);
  // const [sellerTopProducts, setSellerTopProducts] = useState(null);
  const [popUpMessage, setPopUpMessage] = useState(null);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [popupLink, setPopUpLink] = useState(null);
  const user = JSON.parse(localStorage.getItem("customer"));
  const [redeemedVouchers, setRedeemedVouchers] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false)
  const [resMessage, setResMessage] = useState("")

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState(null);

  const [activeNavLink, setActiveNavLink] = useState(
    Constants.sellerButtonLinks.home
  ); // [0,1,2,3,4
  let { slug: shop_slug } = useParams();
  const processResponse = (res, api) => {
    if (api.includes(Apis.sellerDetail)) {
      setSellerInformation(res.data.data);
      if (
        res.data.data?.is_follow === "N" ||
        res.data.data?.is_follow === "n"
      ) {
        setIsFollowing(false);
      } else {
        setIsFollowing(true);
      }
      return;
    }
    if (api.includes(Apis.sellerProductListing) || api.includes(Apis.sellerOnSaleProducts)) {
      let rdata = res.data.data;
      let newData = [];
      if (!Array.isArray(rdata)) {
        if (page !== 1) newData = [...sellerProductListing, ...rdata.products];
        else newData = [...rdata.products];

        setSellerProductListing(newData);
        setTotal(rdata?.total);
      } else setSellerProductListing([]);

      return;
    }
    // if (api.includes(Apis.sellerTopProducts)) {
    //   setSellerTopProducts(res.data.data);
    //   return;
    // }
    if (api.includes(Apis.retrieveShopVoucher)) {
      setRedeemedVouchers(res.data.data);
      return;
    }
    if (api === Apis.followUnfollowSeller) {
      if (res.data.message === "Buyer successfully followed the seller.") {
        setIsFollowing(true);
      } else {
        setIsFollowing(false);
      }
    }
  };

  useEffect(() => {
    getAllProducts();
  }, [page, activeNavLink]);

  const changeLink = (index) => {
    if (
      index === Constants.sellerButtonLinks.home ||
      index === Constants.sellerButtonLinks.onSale
    ) {
      setActiveNavLink(index);
      setCategory(null);
    } else {
      let selectedCategory = sellerInformation?.product_categories[index];
      setActiveNavLink(selectedCategory.name);
      setCategory(selectedCategory);
    }
    setSellerProductListing([]);
    setPage(1);
  };

  function getAllProducts() {
    const formData = new FormData();

    // formData.append("shop_slug", shop_slug);
    // formData.append("list_length", LIST_LENGTH);
    // formData.append("page", page);
    if (activeNavLink !== Constants.sellerButtonLinks.onSale)
      category && formData.append("category_id", category?.id_category);

      let endpoint = ""
      if(activeNavLink !== Constants.sellerButtonLinks.onSale)
      {
        endpoint = Apis.sellerProductListing + "?list_length=" + LIST_LENGTH + "&page=" + page + "&shop_slug=" + shop_slug
        if(category) endpoint += "&category_id=" + category?.id_category
      }else {
        endpoint = Apis.sellerOnSaleProducts+ "?list_length=" + LIST_LENGTH + "&page=" + page + "&shop_slug=" + shop_slug
      }

    BuyerApiCalls(
      formData,
      endpoint,
      "GET",
      user
        ? {
            Authorization: `Bearer ${user.access}`,
          }
        : {},
      processResponse
    );
  }

  useEffect(() => {
    const formData = new FormData();
    formData.append("shop_slug", shop_slug);
    BuyerApiCalls(
      formData,
      Apis.sellerDetail + shop_slug + "/",
      "GET",
      user
        ? {
            Authorization: `Bearer ${user.access}`,
          }
        : {},
      processResponse
    );

    // BuyerApiCalls(
    //   {},
    //   Apis.sellerTopProducts + "?shop_slug="+shop_slug,
    //   "GET",
    //   user
    //     ? {
    //         "Content-Type": "multipart/form-data",
    //         Authorization: `Bearer ${user.access}`,
    //       }
    //     : {},
    //   processResponse
    // );
  }, []);

  //retrieve claimed user shop voucher and compare against shop voucher, if exist grey out
  useEffect(() => {
    if (user && sellerInformation) {
      BuyerApiCalls(
        {},
        Apis.retrieveShopVoucher + `claimed/${sellerInformation?.id_merchant}/`,
        "GET",
        {
          Authorization: `Bearer ${user.access}`,
        },
        processResponse
      );
    }
  }, [sellerInformation]);

  const followHandler = (sellerId) => {
    if (user) {
      const formData = new FormData();
      formData.append("id_merchant", sellerId);
      BuyerApiCalls(
        formData,
        Apis.followUnfollowSeller,
        "POST",
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.access}`,
        },
        processResponse
      );
    } else {
      setPopUpMessage("Please Login To Follow The Seller");
      setOpenPopUp(true);
      setPopUpLink({ link: CustomerRoutes.Login, label: "login" });
    }
  };

  const voucherHandler = (id_voucher) => {
    const user = JSON.parse(localStorage.getItem("customer"));
    const formData = new FormData();
    formData.append("voucher_id", id_voucher);
    //note* claimushopvoucher is used to claim both ushop and shop vouchers
    if (user) {
      BuyerApiCalls(
        formData,
        Apis.claimUshopVoucher,
        "POST",
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.access}`,
        },
        (res,api) =>{
          if (res.data.result === "SUCCESS") {
            let vouchers = sellerInformation?.voucher;
            let idx = vouchers.findIndex(
              (item) => item?.id_voucher === id_voucher
            );
            if (idx > -1) vouchers.splice(idx, 1);
            setSellerInformation({ ...sellerInformation, voucher: vouchers });
            setResMessage(res.data.message);
            setIsSuccess(true);

            setTimeout(() => {
              setIsSuccess(false);
              setResMessage("");
            }, 3000);
          } else {
            setPopUpMessage(res.data.message);
            setOpenPopUp(true);
          }
        }
      );

      //sellerInformation?.voucher
    } else {
      setPopUpMessage("please login to redeem the voucher");
      setOpenPopUp(true);
      setPopUpLink({ link: CustomerRoutes.Login, label: "login" });
    }
  };

  function fetchMoreData() {
    if (sellerProductListing.length < total) {
      let currentPage = page + 1;
      setPage(currentPage);
    }
  }

  function renderPage(activeNavLink) {
    return (
      <>
        {activeNavLink === Constants.sellerButtonLinks.home && (
          <section className="flex flex-col my-10">
            <div className="flex flex-col">
              <p className="text-[12px] sm:text-[16px]">ABOUT SHOP</p>
              <div className="h-[2px] w-16 bg-amber-500 mb-4"></div>
            </div>

            <div className="flex flex-col sm:flex-row w-full md:h-[219px] gap-[40px]">
             {sellerInformation?.shop_banner && 
             <img
                src={sellerInformation?.shop_banner}
                className="w-[471px] h-[219px]"
                alt="shop-banner"
              />
               }
              <section className="flex flex-col text-[12px] sm:text-[16px] overflow-auto sm:h-[250px] text-justify">
                <p>{sellerInformation?.shop_description}</p>
              </section>
            </div>
          </section>
        )}

        {sellerProductListing?.length > 0 ? (
          <>
            {activeNavLink === Constants.sellerButtonLinks.home && (
              <p className="mt-10 mb-5">All Products</p>
            )}
            <InfiniteScroll
              dataLength={sellerProductListing.length}
              next={fetchMoreData}
              hasMore={sellerProductListing.length < total}
              loader={<h4>Loading...</h4>}
              endMessage={
                <p className="text-center text-sm mt-3">
                  No more data to load.
                </p>
              }
            >
              <div
                className="grid grid-cols-6 max-[1500px]:grid-cols-5 max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2
             z-0 h-fit "
              >
                <NewProductCard
                  products={sellerProductListing}
                  setProducts={setSellerProductListing}
                />
              </div>
            </InfiniteScroll>
          </>
        ) : (
          <div className="flex flex-col w-full justify-center text-center items-center  gap-2 my-10">
            <AiOutlineFileSearch
              className="place-self-center"
              size={100}
            ></AiOutlineFileSearch>
            <p>No result found</p>
          </div>
        )}
      </>
    );
    // }
  }

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* {isLargeScreen ? <NewNavbar /> : <Navbar />} */}
      <Navbar />
      <div className="mx-2 sm:mx-20 flex-col md:gap-6 my-4">
        {openPopUp && (
          <PopUpComponent
            message={popUpMessage}
            open={openPopUp}
            close={() => setOpenPopUp(false)}
            result="error"
            link={popupLink}
          ></PopUpComponent>
        )}
        {isSuccess && (
          <PopupMessage
            message={resMessage}
            open={isSuccess}
            toggle={() => setIsSuccess(false)}
            result="success"
          ></PopupMessage>
        )}
        <div className="flex items-center justify-start md:justify-between md:flex md:flex-row flex-1 gap-[19px] flex-wrap w-full ">
          <div className="flex gap-4 w-fit h-fit md:h-fit md:items-center">
            <img
              src={sellerInformation?.shop_logo}
              className="w-[151px] h-[151px] "
              alt="shop-logo"
            ></img>
            <div className="flex h-[76px] flex-col justify-start gap-[14px]">
              <div className="flex flex-col gap-[2px]">
                <p className="text-[12px] md:text-[14px]">
                  {sellerInformation?.shop_name}
                </p>
                <p className="text-gray-400 text-[10px] md:text-[14px]">
                  {sellerInformation?.joined}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      followHandler(sellerInformation?.id_merchant)
                    }
                    className={`flex justify-center items-center w-[61px] md:min-w-[74px]  px-2 h-8 gap-1 border rounded-[2px] border-orangeButton ${
                      isFollowing
                        ? "bg-orangeButton text-white"
                        : "bg-white text-orangeButton"
                    }`}
                  >
                    {/* <AiFillWechat size={16}></AiFillWechat> */}
                    <p className="text-[10px] md:text-[14px] whitespace-nowrap">
                      {isFollowing ? "Unfollow" : "+ Follow"}
                    </p>
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    className={`flex justify-center items-center w-[61px] md:min-w-[74px]  px-2 h-8 gap-1 border 
                  rounded-[2px] ${
                    sellerInformation?.accept_chat === "on"
                      ? "border-orangeButton text-orangeButton"
                      : "border-gray-300 text-gray-300"
                  }`}
                    disabled={sellerInformation?.accept_chat === "off"}
                    onClick={openChat}
                  >
                    <AiFillWechat size={16}></AiFillWechat>
                    <p className="text-[10px] md:text-[14px]">Chat</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-between flex-col gap-5 min-w-[258px] w-full h-full ">
            <div className="flex flex-wrap items-start justify-between capitalize w-full max-w-[1000px] max-sm:px-5">
              <div className="flex flex-wrap items-center gap-[2px] md:gap-5 w-[54px]  md:w-[159px]">
                <p className="mobileSellerText11 md:text-[12px] leading-6">
                  Ratings
                </p>
                <p className="text-orangeButton mobileSellerText12 md:text-[14px] leading-6">
                  {sellerInformation?.ratings}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-[2px] md:gap-5 w-[83px] md:w-[250px]">
                <p className="mobileSellerText11 leading-6">Responses rate</p>
                <p className="text-orangeButton mobileSellerText12 leading-6">
                  {sellerInformation?.response_rate}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-[2px] md:gap-5 w-[72px] md:w-[200px] leading-6">
                <p className="mobileSellerText11">Joined</p>
                <p className="text-orangeButton mobileSellerText12">
                  {sellerInformation?.joined}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-start sm:items-center justify-between capitalize max-sm:px-5 w-full max-w-[1000px]">
              <div className="flex flex-wrap  gap-[2px] md:gap-5 w-[54px]  md:w-[159px]">
                <p className="mobileSellerText11 md:text-[12px]">Products</p>
                <p className="text-orangeButton mobileSellerText12">
                  {sellerInformation?.products}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-[2px] md:gap-5 w-[83px]  md:w-[250px] ">
                <p className="mobileSellerText11">Response time</p>
                <p className="text-orangeButton mobileSellerText12">
                  {sellerInformation?.response_time}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-[2px] md:gap-5 w-[72px]  md:w-[200px] ">
                <p className="mobileSellerText11">follower</p>
                <p className="text-orangeButton mobileSellerText12">
                  {sellerInformation?.followers}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* voucher section */}
        <div className="flex w-fit pt-4 overflow-y-auto flex-wrap">
          {sellerInformation?.voucher.map((voucher) => {
            return (
              <div className="relative bg-orangeButton flex h-[160px] w-fill text-black p-2 mx-2 my-2">
                <img src={voucherIcon} alt="voucher"></img>
                <div className="absolute ml-[80px] space-y-1">
                  <p className="mt-2 font-bold text-[14px]">
                    {voucher.voucher_name}
                  </p>
                  <p className="w-[180px] top-[40px]   font-medium text-[12px] whitespace-normal">
                    Min. spend ${voucher.minimum_spend} Capped at $
                    {voucher.maximum_discount}
                  </p>
                  <button
                    onClick={() => {
                      voucherHandler(voucher.id_voucher);
                    }}
                    className={`text-[14px] px-2 py-1 border ${
                      redeemedVouchers?.some(
                        (item) => item.id_voucher === voucher.id_voucher
                      )
                        ? "text-slate-400 border-slate-400"
                        : "text-orangeButton hover:text-orangeButton hover:border-orangeButton"
                    } border-[#FF9019] text-[#FF9019] bg-white font-bold `}
                    disabled={
                      redeemedVouchers?.some(
                        (item) => item.id_voucher === voucher.id_voucher
                      )
                        ? true
                        : false
                    }
                  >
                    {redeemedVouchers?.some(
                      (item) => item.id_voucher === voucher.id_voucher
                    )
                      ? "Claimed"
                      : "Claim Voucher"}
                  </button>

                  <p className="bottom-1 text-[10px] text-red-500   text-3 capitalize">
                    Ends {voucher.to_date}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <SellerProducts
          productCategories={sellerInformation?.product_categories}
          setActiveNavLink={changeLink}
          activeNavLink={activeNavLink}
          getAllProducts={getAllProducts}
        ></SellerProducts>
        {renderPage(activeNavLink)}
      </div>
      <Links></Links>

      {isOpen && (
        <PromptLoginPopup
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          navigateTo={
            CustomerRoutes.ShopDetails + sellerInformation?.shop_slug + "/"
          }
        />
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
//Components
import { Links } from "../components/GenericSections";
// import { Navbar } from "../components/GenericSections";
import Navbar from "../components/navbar/Navbar";
import { useNavigate } from "react-router-dom";

// import MainCategories from "../components/MainCategoriesComponents/MainCategories";
// import FooterCategories from "../components/FooterCatListing";
// import JustForYou from "../components/productListing/JustForYou";

//Components
// import { AdBannerSm } from "../components/GenericComponents";
import { HomeBanner } from "../components/banners/HomeBanner";
import PromotionBanner from "../components/banners/PromotionBanner";
// import UshopGuarantee from "../components/banners/UshopGuarantee";

//apis
import { Apis, BuyerApiCalls } from "../utils/ApiCalls";
import { CommonApis } from "../../Utils";

import { CustomerRoutes } from "../../Routes";
import "react-toastify/dist/ReactToastify.css";
import "../../css/customer.css";
import ls from "local-storage";
// import { Helmet } from "react-helmet-async";
import { ImCross } from "react-icons/im";
import PromptLoginPopup from "../utils/PromptLoginPopup";
import SEOComponent from "../../utils/seo";
import DashboardProdList from "../components/dashboardComponents/dashboardProdList";
import DiscoverBrands from "../components/dashboardComponents/DiscoverBrands";
import GroupBuyList from "../components/dashboardComponents/groupBuyList";
import CategoriesCarousel from "../components/categoriesBannerCarousel/CategoriesCarousel";
import UniqueSellingPoints from "../components/UniqueSellingPoints";
import ProductCategoriesBanner from "../components/ProductCategoriesBanner";
import CustomerHomeBanner from "../components/banners/CustomerHomeBanner";
// import { useMediaQuery } from "@mui/material";
import TopDeals from "../components/topdeals/TopDeals";
import { useDispatch } from "react-redux";
import { setSubCategoryName } from "../redux/reducers/categoryReducer";

const BannerTitles = [
  "home page: banner 1",
  "home page: banner 2",
  "home page: banner 3",
  "home page: banner 4",
];

const MAX_PROD = 25;

function Homescreen() {
  const [categories, setcategories] = useState([]);
  const [footCategories, setFootCategories] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [homeBanners, setHomeBanners] = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const [showPromotionBanner, setPromotionBanner] = useState(false);
  const promotionBannerRef = useRef({
    image_url: null,
    content_url: null,
  });
  const [metadata, setMetadata] = useState(null);
  const user = JSON.parse(localStorage.getItem("customer"));
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [groupBuyList, setGroupBuyList] = useState([]);
  const [groupBuyTotal, setGroupBuyTotal] = useState(0);

  const dispatch = useDispatch();

  const processResponse = (res, api) => {
    if (api === Apis.banners) {
      if (res.data) {
        let banner = res.data.data;
        if (
          banner &&
          Array.isArray(banner) &&
          banner.length > 0 &&
          banner[0].title === "Promotion Banner"
        ) {
          if (banner[0].display_banner) {
            //If true show banner
            promotionBannerRef.current.image_url = banner[0].image_url;
            promotionBannerRef.current.content_url = banner[0].content_url;
            setPromotionBanner(true);
          }
          setPromoBanners(banner);
        } else {
          if (banner.length > 0 && banner[0].title.includes("Home Page")) {
            setHomeBanners(banner);
          }
        }
      }
    }
    if (api.includes(Apis.categoryList)) {
      if (res.data) {
        setcategories(res.data.data.categories);
        setMetadata(res.data.data.metadata);
      }
    }
    if (api.includes(Apis.footerCategoryList)) {
      if (res.data) {
        setFootCategories(res.data.data.categories);
      }
    }
    if (api === CommonApis.settings) {
      if (res.data) {
        const status = res.data.data.web_announcement_status;
        const msg = res.data.data.web_announcement_msg;
        const display = res.data.data.web_announcement_display;
        if (status === "y" && msg !== "" && display === true) {
          const itemAlreadyDisplayed = sessionStorage.getItem(
            "webAnnouncementDisplayed"
          );
          if (!itemAlreadyDisplayed) {
            setAnnouncementMsg(msg);
            sessionStorage.setItem("webAnnouncementDisplayed", "true");

            setTimeout(() => {
              setAnnouncementMsg("");
            }, 5000);
          }
        }
      }
    }

    if (api.includes(Apis.productList)) {
      if (res.data) {
        let rdata = res.data?.data?.products ?? [];
        setNewProducts(rdata);
      }
    }

    if (api.includes(Apis.recommendedProdList)) {
      if (res.data) {
        let rdata = res.data?.data?.products ?? [];
        setRecommendedProducts(rdata);
      }
    }
  };

  useEffect(() => {
    BuyerApiCalls({}, CommonApis.settings, "POST", {}, processResponse);

    BuyerApiCalls(
      { title: "Home Page" },
      Apis.banners,
      "GET",
      {},
      processResponse,
      null
    );

    BuyerApiCalls(
      { title: "Promotion Banner" },
      Apis.banners,
      "GET",
      {},
      processResponse,
      null
    );

    const formData = new FormData();

    BuyerApiCalls(
      formData,
      Apis.categoryList + "?list_length=100",
      "GET",
      user
        ? {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.access}`,
          }
        : {},
      processResponse
    );

    // BuyerApiCalls(
    //   formData,
    //   Apis.footerCategoryList + "?list_length=100",
    //   "GET",
    //   user
    //     ? {
    //         "Content-Type": "multipart/form-data",
    //         Authorization: `Bearer ${user.access}`,
    //       }
    //     : {},
    //   processResponse
    // );

    const prodFormData = new FormData();

    let newProdEndpoint =
      Apis.productList +
      `?list_length=${MAX_PROD}&page=1&product_list=new_product`;
    BuyerApiCalls(
      prodFormData,
      newProdEndpoint,
      "GET",
      user
        ? {
            Authorization: `Bearer ${user?.access}`,
          }
        : {},
      processResponse
    );

    let endPoint = Apis.recommendedProdList + `?list_length=${MAX_PROD}&page=1`;
    let pastSearches = ls("past5Search") ?? [];
    if (typeof pastSearches === "string")
      pastSearches = JSON.parse(pastSearches);
    for (let i = 0; i < pastSearches.length; i++) {
      endPoint += "&search[]=" + pastSearches[i];
    }
    BuyerApiCalls(
      {},
      endPoint,
      "GET",
      user
        ? {
            Authorization: `Bearer ${user?.access}`,
          }
        : {},
      processResponse
    );

    let url = Apis.groupBuyList + "?page=1&list_length=6";
    BuyerApiCalls({}, url, "GET", {}, (res, api) => {
      if (res.data.result === "SUCCESS") {
        setGroupBuyList(res.data.data?.group_buy_list);
        setGroupBuyTotal(res.data.data?.total);
      }
    });
  }, []);

  const handleClaimNow = () => {
    if (user) navigate(CustomerRoutes.UshopVoucher);
    else setIsOpen(true);
  };

  return (
    <>
      <SEOComponent
        title={metadata?.meta_title}
        description={metadata?.meta_description}
        ogTitle={metadata?.meta_title}
        ogDescription={metadata?.meta_description}
      />
      {showPromotionBanner ? (
        <PromotionBanner
          onClose={() => setPromotionBanner(false)}
          imgUrl={promotionBannerRef.current.image_url}
          contentUrl={promotionBannerRef.current.content_url}
        />
      ) : null}

      <div className="min-h-screen relative">
        {announcementMsg !== "" && (
          <div
            className="cp absolute w-full top-0 right-0 left-0 h-20 bg-[#4169E1] text-center text-white z-[75] px-5 py-3"
            onClick={() => setAnnouncementMsg("")}
          >
            <div className="flex justify-end">
              <ImCross
                className="material-icons cp"
                onClick={() => setAnnouncementMsg("")}
              ></ImCross>
            </div>
            <p className="">{announcementMsg}</p>
          </div>
        )}

        <Navbar />

        <CategoriesCarousel />

        <UniqueSellingPoints />

        <div className="flex flex-col px-[10px] lg:px-[100px] pt-10 bg-[#F7F7F7]">
          <TopDeals />

          <ProductCategoriesBanner />

          <DiscoverBrands />

          <CustomerHomeBanner />

          <GroupBuyList
            groupBuyList={groupBuyList}
            groupBuyTotal={groupBuyTotal}
          />

          <div className="flex flex-col grow max-sm:px-1">
            <DashboardProdList prods={newProducts} title="New Products" />
            {newProducts?.length >= MAX_PROD && (
              <div className="w-full flex justify-center">
                <button
                  onClick={() => {
                    dispatch(setSubCategoryName("New Products"));
                    navigate(CustomerRoutes.ProductListing);
                  }}
                  id="buyNow"
                  className="flex items-center justify-center bg-white border uppercase
                         h-[36px] text-[#F5AB35] text-sm md:text-lg
                         px-10 py-2 md:px-20 md:py-6 cp mb-5 rounded-md hover:shadow-md"
                >
                  View More
                </button>
              </div>
            )}
          </div>
          {/* <FooterCategories categories={footCategories}></FooterCategories> */}
        </div>

        {/* <HomeBanner banners={homeBanners} title={BannerTitles[0]} /> */}
        {/* <div className="flex flex-col grow max-sm:px-1 px-3 lg:px-20"> */}
        {/* <MainCategories categories={categories} /> */}
        {/* <JustForYou></JustForYou> */}
        {/* <AdBannerSm banners={homeBanners} title={BannerTitles[1]} />
          <DashboardProdList prods={recommendedProducts} title="WE RECOMMEND" />
          {recommendedProducts?.length >= MAX_PROD && (
            <div className="w-full flex justify-center">
              <button
                onClick={() => {
                  navigate(CustomerRoutes.RecommendedProductListing);
                }}
                id="buyNow"
                className="flex items-center justify-center bg-white border border-orangeButton h-[36px] 
              text-orangeButton text-sm font-semibold px-2 cp mb-5 rounded-md"
              >
                View More..
              </button>
            </div>
          )} */}
        {/* <UshopGuarantee /> */}
        {/* <div onClick={handleClaimNow} className="mb-4 cp">
            <AdBannerSm banners={homeBanners} title={BannerTitles[2]} />
          </div> */}

        {/* <AdBannerSm banners={homeBanners} title={BannerTitles[3]} /> */}
        {/* <FooterCategories categories={footCategories}></FooterCategories> */}
        {/* </div> */}
        <Links />
      </div>

      {isOpen && (
        <PromptLoginPopup
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          navigateTo={CustomerRoutes.Landing}
          loginText="LOGIN AND CLAIM"
          signupText="SIGN UP AND CLAIM"
        />
      )}
    </>
  );
}
export default Homescreen;

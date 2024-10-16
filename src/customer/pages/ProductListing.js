import { Links } from "../components/GenericSections";
import Navbar from "../components/navbar/Navbar";
import { Modal } from "../components/GenericComponents";
import ProductListingPage from "../components/productListing/Products";
import SideBarfilter from "../components/SearchAndFilterComponents/SidebarFilter";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Apis, BuyerApiCalls } from "../utils/ApiCalls";
import React, { createContext, useEffect, useState, useCallback } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { SlArrowRight, SlArrowLeft } from "react-icons/sl";
import {
  faArrowDownWideShort,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MdFilterList } from "react-icons/md";
import ls from "local-storage";

export const productContext = createContext();

const bannerArrowsCss =
  "bg-[#ffffff]/[0.1] p-[14px] text-white text-[28px] custom-arrows";

const CustomArrow = ({ onClick, direction }) => {
  const arrowPosition = direction === "right" ? "right-[16px]" : "left-[16px]";

  return (
    <div className={`${bannerArrowsCss} ${arrowPosition}`} onClick={onClick}>
      {direction === "right" ? <SlArrowRight /> : <SlArrowLeft />}
    </div>
  );
};

const BannerTitles = [
  "product page: banner 1",
  "product page: banner 2",
  "product page: banner 3",
];

export const ProductBanner = ({ banners, title }) => {
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
      <div className="h-[20px] w-[20px] border border-white bg-[#333333]/[0.2] rounded-[10px]"></div>
    ),
  };

  return (
    <>
      {banners.length > 0 ? (
        <Slider {...settings}>
          {banners.map((itm, x) =>
            itm.title.toLowerCase() === title ? (
              <img key={x} alt={itm.title} loading="lazy" src={itm.image_url} />
            ) : null
          )}
        </Slider>
      ) : null}
    </>
  );
};

const sortByItems = [
  { label: "Price: Low to High", value: "price_low_to_high" },
  { label: "Price: High to Low", value: "price_high_to_low" },
  { label: "Ratings : High to Low", value: "rating_high_to_low" },
  { label: "Popular", value: "popular" },
  { label: "Latest", value: "latest" },
  { label: "Highest Sales", value: "highest_sales" },
];

export default function ProductListing() {
  let categoryID = useSelector((state) => state.category.mainCategoryID);
  const searchImage = useSelector((state) => state.category.SearchedImageFile);
  let catDetail = ls("cat_detail");

  //get the search keyword from the url
  const location = useLocation();

  //shipping params
  const shipping_query_params = new URLSearchParams(location.search);
  const shippingId = shipping_query_params.get("shipping_id") || null;
  //default filter values
  const [filterData, setFilterData] = useState({
    list_length: 20,
    page: 1,
    category_id: "",
    search: "",
    id_status: "",
    shipping_id: shippingId || "",
    star_rating: "",
    brand_id: "",
    price_range: "",
    sort_by: "",
    postal_code: "",

    //to keep track of category id selection
    secondLayerId: "",
    thirdLayerId: "",
    secondLayerData: [],
  });
  const [banners, setBanners] = useState([]);
  const queryParams = location.search?.split("keyword=")[1];
  const keyword = queryParams ? queryParams?.split("&")[0] : null;

  const [isSortOptionsOpen, setIsSortOptionsOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  if (!categoryID) categoryID = catDetail?.id_category;

  const processResponse = (res) => {
    let banner = res.data.data;
    setBanners(banner);
  };

  useEffect(() => {
    if (window.innerWidth < 678) {
      setIsMobile(true);
      ls("isMobile", true);
    } else {
      setIsMobile(false);
      ls("isMobile", false);
    }
    BuyerApiCalls(
      { title: "Product Page" },
      Apis.banners,
      "GET",
      {},
      processResponse,
      null
    );
  }, []);

  /*
    1. redirect due to search engine, append the search keyword to the filterData
    2. redirect from category, append the category id to the filterData (through category layers)
  */

  //update the searchkey or parentID when there is any changes
  useEffect(() => {
    let keyValue = location.search.split("keyword=")[1];
    if (keyValue) {
      addToFilterData("search", keyValue.split("&")[0]);
    }
  }, [location.search.split("keyword=")[1], categoryID]);

  useEffect(() => {
    let postal = location.search.split("postal_code=")[1];
    addToFilterData("postal_code", postal);
  }, [location.search.split("postal_code=")[1]]);

  useEffect(() => {
    if (!location.pathname.includes("search")) {
      const slug = location.pathname.split("/")[2];

      if (slug) {
        const categoryGroups = new Set([
          "fresh-food",
          "party-beverage",
          "beauty-pharmacy",
          "mummies-babies",
        ]);

        if (categoryGroups.has(slug)) {
          addToFilterData("category_group", slug);
        } else {
          addToFilterData("category_slug", slug);
        }
      }
    } else if (categoryID) {
      addToFilterData("category_id", categoryID?.toString());
    }
  }, [location.pathname, categoryID]);

  useEffect(() => {}, [filterData, location.pathname]);

  //update filterData
  // const addToFilterData = useCallback((which, updatedValue) => {
  //   if (which === "list_length") {
  //     setFilterData((prevState) => ({
  //       ...prevState,
  //       list_length: updatedValue,
  //       page: 1,
  //     }));
  //     return;
  //   }
  //   if (which === "page") {
  //     setFilterData((prevState) => ({
  //       ...prevState,
  //       page: updatedValue,
  //     }));
  //     return;
  //   }
  //   if (which === "search") {
  //     setFilterData((prevState) => ({
  //       ...prevState,
  //       page: 1,
  //       search: updatedValue,
  //       category_id: "",
  //     }));
  //     return;
  //   }
  //   if (which === "category_id" && filterData.category_id !== updatedValue) {
  //     setFilterData((prevState) => ({
  //       ...prevState,
  //       page: 1,
  //       category_id: updatedValue,
  //     }));
  //     return;
  //   }
  //   if (which === "category_slug") {
  //     setFilterData((prevState) => ({
  //       ...prevState,
  //       page: 1,
  //       category_slug: updatedValue,
  //     }));
  //     return;
  //   }
  //   if (which === "category_group") {
  //     setFilterData((prevState) => ({
  //       ...prevState,
  //       page: 1,
  //       category_group: updatedValue,
  //     }));
  //     return;
  //   }
  //   if (which === "shipping_id") {
  //     setFilterData((prevState) => ({
  //       ...prevState,
  //       page: 1,
  //       shipping_id: updatedValue,
  //     }));
  //     return;
  //   }
  //   if (which === "price_range") {
  //     setFilterData((prevState) => ({
  //       ...prevState,
  //       page: 1,
  //       price_range: updatedValue,
  //     }));
  //     return;
  //   }
  //   if (which === "brand_id") {
  //     setFilterData((prevState) => ({
  //       ...prevState,
  //       page: 1,
  //       brand_id: updatedValue,
  //     }));
  //     return;
  //   }
  //   if (which === "star_rating") {
  //     setFilterData((prevState) => ({
  //       ...prevState,
  //       page: 1,
  //       star_rating: updatedValue,
  //     }));
  //     return;
  //   }
  //   if (which === "sort_by") {
  //     setFilterData((prevState) => ({
  //       ...prevState,
  //       page: 1,
  //       sort_by: updatedValue,
  //     }));
  //     return;
  //   }
  //   if (which === "postal_code") {
  //     setFilterData((prevState) => ({
  //       ...prevState,
  //       page: 1,
  //       postal_code: updatedValue,
  //     }));
  //     return;
  //   }
  //   if (which === "all") {
  //     setIsFiltersOpen(false);
  //     setFilterData((prevState) => ({
  //       ...prevState,
  //       category_id: "",
  //       search: "",
  //       shipping_id: "",
  //       star_rating: "",
  //       brand_id: "",
  //       price_range: "",
  //       sort_by: "",
  //       page: 1,

  //       secondLayerId: "",
  //       thirdLayerId: "",
  //       secondLayerData: [],
  //     }));
  //     return;
  //   }

  //   if (which === "apply_all") {
  //     setIsFiltersOpen(false);
  //     setFilterData((prevState) => ({
  //       ...prevState,
  //       category_id: updatedValue.category_id,
  //       shipping_id: updatedValue.shipping_id,
  //       star_rating: updatedValue.star_rating,
  //       brand_id: updatedValue.brand_id,
  //       price_range: updatedValue.price_range,
  //       secondLayerId: updatedValue.secondLayerActiveID,
  //       thirdLayerId: updatedValue.thirdLayerActiveID,
  //       secondLayerData: updatedValue.secondLayerData,
  //       page: 1,
  //     }));
  //     return;
  //   }

  //   if (which === "closeFilter") {
  //     setFilterData((prevState) => ({
  //       ...prevState,
  //       secondLayerId: updatedValue.secondLayerActiveID,
  //       thirdLayerId: updatedValue.thirdLayerActiveID,
  //       secondLayerData: updatedValue.secondLayerData,
  //       page: 1,
  //     }));
  //     setIsFiltersOpen(false);
  //   }
  // }, []);

  const addToFilterData = useCallback(
    (which, updatedValue) => {
      setFilterData((prevState) => {
        let newFilterData = { ...prevState };

        if (which === "list_length") {
          return {
            ...newFilterData,
            list_length: updatedValue,
            page: 1,
          };
        }

        if (which === "page") {
          return {
            ...newFilterData,
            page: updatedValue,
          };
        }

        if (which === "search") {
          return {
            ...newFilterData,
            page: 1,
            search: updatedValue,
            category_id: "",
            category_group: "",
            category_slug: "",
          };
        }

        if (
          which === "category_id" &&
          newFilterData.category_id !== updatedValue
        ) {
          return {
            ...newFilterData,
            page: 1,
            category_id: updatedValue,
          };
        }

        if (which === "category_slug") {
          // Ensure immutability by creating a new object and deleting category_group properly
          const { category_group, ...rest } = newFilterData;
          return {
            ...rest,
            page: 1,
            category_slug: updatedValue,
          };
        }

        if (which === "category_group") {
          // Ensure category_slug is removed if category_group is set
          const { category_slug, ...rest } = newFilterData;
          return {
            ...rest,
            page: 1,
            category_group: updatedValue,
          };
        }

        if (which === "shipping_id") {
          return {
            ...newFilterData,
            page: 1,
            shipping_id: updatedValue,
          };
        }

        if (which === "price_range") {
          return {
            ...newFilterData,
            page: 1,
            price_range: updatedValue,
          };
        }

        if (which === "brand_id") {
          return {
            ...newFilterData,
            page: 1,
            brand_id: updatedValue,
          };
        }

        if (which === "star_rating") {
          return {
            ...newFilterData,
            page: 1,
            star_rating: updatedValue,
          };
        }

        if (which === "sort_by") {
          return {
            ...newFilterData,
            page: 1,
            sort_by: updatedValue,
          };
        }

        if (which === "postal_code") {
          return {
            ...newFilterData,
            page: 1,
            postal_code: updatedValue,
          };
        }

        if (which === "all") {
          setIsFiltersOpen(false);
          return {
            ...newFilterData,
            category_id: "",
            search: "",
            shipping_id: "",
            star_rating: "",
            brand_id: "",
            price_range: "",
            sort_by: "",
            page: 1,
            secondLayerId: "",
            thirdLayerId: "",
            secondLayerData: [],
          };
        }

        if (which === "apply_all") {
          setIsFiltersOpen(false);
          return {
            ...newFilterData,
            category_id: updatedValue.category_id,
            shipping_id: updatedValue.shipping_id,
            star_rating: updatedValue.star_rating,
            brand_id: updatedValue.brand_id,
            price_range: updatedValue.price_range,
            secondLayerId: updatedValue.secondLayerActiveID,
            thirdLayerId: updatedValue.thirdLayerActiveID,
            secondLayerData: updatedValue.secondLayerData,
            page: 1,
          };
        }

        if (which === "closeFilter") {
          setIsFiltersOpen(false);
          return {
            ...newFilterData,
            secondLayerId: updatedValue.secondLayerActiveID,
            thirdLayerId: updatedValue.thirdLayerActiveID,
            secondLayerData: updatedValue.secondLayerData,
            page: 1,
          };
        }

        return newFilterData;
      });
    },
    [setFilterData, setIsFiltersOpen, filterData]
  );

  const sortHandler = () => {
    addToFilterData("sort_by", selectedSort);
    setIsSortOptionsOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {banners.length > 0 && (
        <div className="max-md:hidden visible grid grid-cols-3 gap-4 my-10 md:mx-[60px]">
          <div className="flex-auto md:col-span-2">
            <ProductBanner banners={banners} title={BannerTitles[0]} />
          </div>
          <div className="row-span-2 space-y-3">
            <ProductBanner banners={banners} title={BannerTitles[1]} />
            <ProductBanner banners={banners} title={BannerTitles[2]} />
          </div>
        </div>
      )}

      {!isFiltersOpen && isMobile && (
        <div className="md:hidden visible flex justify-center gap-14 mt-5">
          <div
            className="flex gap-2 items-center cp"
            onClick={() => setIsSortOptionsOpen(true)}
          >
            <FontAwesomeIcon icon={faArrowDownWideShort} className="text-xs" />
            <p className="text-sm">Sort by</p>
          </div>

          <div className="h-7 w-[1px] bg-[#D1D1D6]"></div>

          <div
            className="flex gap-2 items-center cp"
            onClick={() => {
              setIsFiltersOpen(true);
            }}
          >
            <MdFilterList />
            <p className="text-sm">Filter</p>
          </div>
        </div>
      )}

      {isFiltersOpen && (
        <productContext.Provider
          value={{
            keyword,
            filterData,
            addToFilterData,
          }}
        >
          <SideBarfilter filterData={filterData} />
        </productContext.Provider>
      )}

      <div className="flex gap-5 my-10 md:mx-[80px]">
        <productContext.Provider
          value={{
            keyword,
            filterData,
            addToFilterData,
          }}
        >
          {!isMobile && <SideBarfilter />}
          {((isMobile && !isFiltersOpen) || !isMobile) && (
            <ProductListingPage searchedImage={searchImage || null}></ProductListingPage>
          )}
        </productContext.Provider>
      </div>
      <Links />

      {isSortOptionsOpen && (
        <Modal
          open={isSortOptionsOpen}
          width={"w-3/4"}
          children={
            <div>
              <div className=" flex justify-between">
                <p className="text-lg font-semibold mb-3">SORT BY</p>
                <span
                  className="flex justify-end cp"
                  onClick={() => setIsSortOptionsOpen(false)}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </span>
              </div>
              <hr className="mb-4" />
              {sortByItems.map((item, index) => {
                return (
                  <div className="flex justify-between mb-2" key={index}>
                    <label key={index} className="text-sm">
                      {item.label}
                    </label>
                    <input
                      type="radio"
                      name="sortGroup"
                      checked={selectedSort === item.value}
                      onChange={(_) => setSelectedSort(item.value)}
                    />
                  </div>
                );
              })}
              <div className=" flex justify-center">
                <button
                  className="cp text-center rounded-md bg-[#f5ab35] text-white py-2 w-3/4 mt-4"
                  onClick={sortHandler}
                >
                  Apply
                </button>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}

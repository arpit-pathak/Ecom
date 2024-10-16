import { Link, useLocation, useParams } from "react-router-dom";
import { useState, useEffect, useContext, useMemo } from "react";
import { productContext } from "../../pages/ProductListing";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import { useSelector } from "react-redux";
import Pagination from "../../../utils/Pagination/pagination";
import Select from "react-select";
import Loader, { PageLoader } from "../../../utils/loader";
//icons
import { AiOutlineFileSearch } from "react-icons/ai";
import InfiniteScroll from "react-infinite-scroll-component";

//images
import { MdArrowForwardIos } from "react-icons/md";
import ShopCard from "../shopListing/shopCard";
import { CustomerRoutes } from "../../../Routes";
import ls from "local-storage";
import NewProductCard from "../productDetailsComponents/NewProductCard";

const LIST_LENGTH = 60;
const START = 1;

export default function ProductListingPage({ searchedImage }) {
  let categoryName = useSelector((state) => state.category.subCategoryName);
  let categoryID = useSelector((state) => state.category.mainCategoryID);
  let catDetail = ls("cat_detail");
  const location = useLocation();
  const { filterData, addToFilterData, keyword } = useContext(productContext);
  const [products, setProducts] = useState([]);
  const [filterList, setFilterList] = useState({});
  const [shops, setShops] = useState([]);
  const [initialCall, setInitialCall] = useState(true);

  //pagination
  const [total, setTotal] = useState(0);

  const user = JSON.parse(localStorage.getItem("customer"));
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const params = useParams();
  const [infiniteLoader, setInfiniteLoader] = useState(false);

  //endpoint
  let endpoint = Apis.productList;

  const items = [
    { label: "Price: Low to High", value: "price_low_to_high" },
    { label: "Price: High to Low", value: "price_high_to_low" },
    { label: "Ratings : High to Low", value: "rating_high_to_low" },
    { label: "Popular", value: "popular" },
    { label: "Latest", value: "latest" },
    { label: "Highest Sales", value: "highest_sales" },
  ];

  if (!categoryID) categoryID = catDetail?.id_category;

  if (
    !location.pathname.includes("search") &&
    !location.pathname.includes("category/")
  )
    categoryName = location.pathname.split("/")[2];

  //responsible for render the products
  //if state changes in filterData, call the productList to update the product
  const formData = useMemo(() => {
    var data = new FormData();
    data.append("list_length", LIST_LENGTH);
    data.append("page", filterData.page ?? 1);
    if (filterData.shipping_id)
      data.append("shipping_id", filterData.shipping_id);
    if (filterData.brand_id) data.append("brand_id", filterData.brand_id);
    if (filterData.price_range)
      data.append("price_range", filterData.price_range);
    if (filterData.star_rating)
      data.append("star_rating", filterData.star_rating);
    if (filterData.sort_by) data.append("sort_by", filterData.sort_by);
    if ((filterData?.category_id || categoryID) && !filterData?.category_slug) {
      if (params["slug"] === "search") data.append("category_id", "");
      else
        data.append(
          "category_id",
          filterData?.category_id || categoryID.toString()
        );
    }
    if (filterData.category_slug) {
      if (params["slug"] === "search") data.append("category_slug", "");
      else data.append("category_slug", filterData.category_slug);
    }
    if (filterData.category_group) {
      if (params["slug"] === "search") data.append("category_group", "");
      else data.append("category_group", filterData.category_group);
    }

    if (keyword) {
      if (keyword === "top-deals-all") {
        endpoint = endpoint + keyword + "/";
      } else {
        data.append("search", keyword);
      }
    }
    if (filterData.postal_code)
      data.append("postal_code", parseInt(filterData.postal_code));
    return data;
  }, [filterData, keyword]);

  useEffect(() => {
    if (initialCall) {
      if (!location.pathname.includes("search")) {
        setInitialCall(false);
        return;
      }
    }

    setFilterList({ ...filterData });

    if (keyword === "image-search") {
      let fd = new FormData();
      fd.append("image", searchedImage);
      fd.append("list_length", LIST_LENGTH);
      fd.append("page", filterData.page ?? 1);

      if (!infiniteLoader) setIsProductsLoading(true);

      BuyerApiCalls(
        fd,
        Apis.productList + "image-search/",
        "POST",
        {
          Authorization: `Bearer ${user?.access}`,
        },
        processRes
      );
    } else {
      if (JSON.stringify(filterData) !== JSON.stringify(filterList)) {
        if (!infiniteLoader) setIsProductsLoading(true);

        let ix = 0;
        for (var pair of formData.entries()) {
          if (ix === 0) {
            endpoint += "?" + pair[0] + "=" + pair[1];
            ix++;
          } else endpoint += "&" + pair[0] + "=" + pair[1];
        }

        BuyerApiCalls(
          {},
          endpoint,
          "GET",
          user
            ? {
                Authorization: `Bearer ${user?.access}`,
              }
            : {},
          processRes
        );
      }
    }
  }, [formData, searchedImage]);

  const processRes = (res, api) => {
    var rdata = res.data?.data;
    let list = Array.isArray(rdata) ? [] : rdata?.products ?? [];

    if (filterData.page !== 1) list = [...products, ...list];

    setProducts(list);
    setShops(rdata?.shop_list);
    setTotal(rdata?.total ?? 0);
    setIsProductsLoading(false);
    setInfiniteLoader(false);
    return;
  };

  //--------sorting---------------
  function sortHandler(sortBy) {
    addToFilterData("sort_by", sortBy);
  }

  function fetchMoreData() {
    if (products.length < total) {
      let currentPage = filterData.page + 1;
      addToFilterData("page", currentPage);
      setInfiniteLoader(true);
    }
  }

  return (
    <div className="flex relative flex-col gap-6 w-screen z-20 p-4 max-md:p-2">
      {keyword && shops?.length > 0 && (
        <div>
          <div className="flex  items-center justify-between  h-[27px] gap-[9px]">
            <p className=" font-poppins font-[400px] text-slate-400 leading-[21px]">
              SHOP RELATED TO "
              <span className="text-orangeButton">
                {keyword.replaceAll("%20", " ")}
              </span>
              "
            </p>
            <Link
              className="flex text-orangeButton items-center text-sm font-light cp"
              to={CustomerRoutes.ShopList.replace(":slug", keyword)}
            >
              More Shops <MdArrowForwardIos />
            </Link>
          </div>
          <div>
            {shops.map((shop, index) => {
              return <ShopCard shop={shop} from="products" />;
            })}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center w-full h-8 z-10">
        <div className="flex  items-center  h-[27px] gap-[9px]">
          {keyword ? (
            <p className="w-fit h-[27px] font-poppins font-medium text-gray-800 text-[18px] leading-[27px]">
              {decodeURIComponent(keyword) === "image-search"
                ? null // No text if keyword is "image-search"
                : decodeURIComponent(keyword) === "top-deals-all"
                ? "Top Deals"
                : decodeURIComponent(keyword)}
            </p>
          ) : categoryName ? (
            <p className="min-w-[fit-content] h-[27px] font-poppins font-medium text-gray-800 text-[18px] leading-[27px] ">
              {categoryName}
            </p>
          ) : null}

          <p
            className="flex min-w-[fit-content] h-[23px] font-poppins font-[400px] text-slate-400 
          text-[14px] leading-[21px]"
          >
            (Showing {START}-{products.length} products of {total})
          </p>
        </div>
        <div className="hidden md:visible md:flex relative items-center w-[200px] h-8 px-[10px] py-[5px] ">
          <Select
            id="sortBy"
            name="sortBy"
            options={items}
            placeholder="Sort By"
            className="text-xs w-full"
            onChange={(e) => {
              sortHandler(e.value);
            }}
          />
        </div>
      </div>
      <>
        {isProductsLoading ? (
          <PageLoader />
        ) : (
          <>
            {products?.length > 0 ? (
              <InfiniteScroll
                dataLength={products.length}
                next={fetchMoreData}
                hasMore={products.length < total}
                loader={
                  <div className="text-center mt-3">
                    <Loader color="#F5AB35" />
                    <p className="text-orangeButton text-xs">Loading...</p>
                  </div>
                }
                endMessage={
                  <p className="text-center text-sm mt-3">
                    No more data to load.
                  </p>
                }
              >
                <div className="grid grid-cols-5 max-[1500px]:grid-cols-4 max-xl:grid-cols-3 max-[970px]:grid-cols-2 z-0 h-fit">
                  <NewProductCard products={products} setProducts={setProducts} />
                </div>
              </InfiniteScroll>
            ) : (
              <div className="flex flex-col w-full justify-center text-center items-center gap-2 my-10">
                <AiOutlineFileSearch
                  className="place-self-center"
                  size={100}
                ></AiOutlineFileSearch>
                <p>No result found</p>
                <p>Try different or more general keywords</p>
              </div>
            )}
          </>
        )}
      </>
    </div>
  );
}

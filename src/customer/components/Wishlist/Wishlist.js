import { useState, useEffect } from "react";
// import { Navbar } from "../../components/GenericSections";
import Navbar from "../../components/navbar/Navbar";
import Pagination from "../../../utils/Pagination/pagination";
import { PageLoader } from "../../../utils/loader";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import ls from "local-storage";

import { AiOutlineFileSearch } from "react-icons/ai";
import { Links } from "../GenericSections";

import NewProductCard from "../productDetailsComponents/NewProductCard";

export default function Wishlist() {
  const user = JSON.parse(localStorage.getItem("customer"));
  const path = window.location.pathname;
  const isWishList = path.includes("wishlist")
  const isRecommendedList = path.includes("recommended-products")

  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  //pagination
  const [entries, setEntries] = useState(isWishList ? 10 : 25);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");

  useEffect(() => {
    setIsWishlistLoading(true);
    
    var formData = new FormData();
    let endpoint;

    if (isWishList) {
      endpoint =
        Apis.retrieveWishlist + "?list_length=" + entries + "&page=" + page;
    } else if (isRecommendedList){
      
      endpoint = Apis.recommendedProdList + "?list_length=" + entries + "&page=" + page;
      let pastSearches = ls("past5Search") ?? [];
      if (typeof pastSearches === "string")
        pastSearches = JSON.parse(pastSearches);
      for (let i = 0; i < pastSearches.length; i++) {
        endpoint += "&search[]=" + pastSearches[i]
      }
    }
    else
      endpoint =
        Apis.productList +
        "?list_length=" +
        entries +
        "&page=" +
        page;

    BuyerApiCalls(
      formData,
      endpoint,
      "GET",
      user
        ? {
            Authorization: `Bearer ${user?.access}`,
          }
        : {},
      processRes
    );
  }, [page]);

  useEffect(() => {}, [wishlist]);

  const processRes = (res, api) => {
    var rdata = res.data?.data;
    let list = Array.isArray(rdata)
      ? []
      : isWishList
      ? rdata?.consumer_wishlist
      : rdata?.products;
    let pg = !isWishList ? rdata?.pages :page;
    let total = isWishList ? rdata?.total_records : rdata?.total;
    
    if(isWishList){
      let nxtPageCount = total % entries;
      let currentPage = parseInt(total / entries);
      if (nxtPageCount >= 0 && currentPage !== pg - 1) pg += 1;
    }

    setWishlist(list ?? []);
    setPages(pg);
    setTotal(total ?? 0);
    setIsWishlistLoading(false);
    return;
  };

  const changeEntries = (e) => {
    setPage(1);
    setEntries(e.target.value);
  };

  const toPage = (page) => {
    setPage(page);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* {isLargeScreen ? <NewNavbar /> : <Navbar />} */}
      <Navbar />
      <div className="">
        <div className="gap-8 py-4 justify-center items-center max-sm:pl-4 pl-12">
          <p className="font-bold uppercase text-[20px] md:text-[20px]">
            {isWishList
              ? "Wishlist"
              : isRecommendedList
              ? "WE RECOMMEND"
              : "New Products"}
          </p>
          <div className="h-[2px] w-16 bg-amber-500 mb-4"></div>
          <div className="relative"></div>
        </div>
      </div>
      {isWishlistLoading ? (
        <PageLoader />
      ) : (
        <div
          className="grid grid-cols-6 max-[1500px]:grid-cols-5 max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2 
           z-0 h-fit max-md:mx-2 mx-12"
        >
          {wishlist.length > 0 ? (
            <NewProductCard
              products={wishlist}
              setProducts={setWishlist}
              listFrom={isWishList ? "wishlist" : "newProducts"}
            />
          ) : (
            <div className="flex flex-col w-full self-center text-center items-center  gap-2">
              <AiOutlineFileSearch
                className="place-self-center"
                size={100}
              ></AiOutlineFileSearch>
              <p>No result found</p>
            </div>
          )}
        </div>
      )}
      <div className="buyer-page mx-20 mt-7 mb-3">
        <Pagination
          entries={entries}
          changeEntries={changeEntries}
          toPage={toPage}
          from="Wishlist"
          pages={pages}
          page={page}
          total={total}
        />
      </div>
      <Links />
    </div>
  );
}

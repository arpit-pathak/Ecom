import { useParams } from "react-router-dom";
import { Links } from "../GenericSections";
import Navbar from "../../components/navbar/Navbar";
import { useEffect, useState } from "react";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import Pagination from "../../../utils/Pagination/pagination";
import ShopCard from "./shopCard";
import { AiOutlineFileSearch } from "react-icons/ai";
import { useMediaQuery } from "@mui/material";

const ShopList = () => {
  const params = useParams();
  const { slug } = params;
  const user = JSON.parse(localStorage.getItem("customer"));

  const [shops, setShops] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [entries, setEntries] = useState(20);
  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");

  useEffect(() => {
    const formData = new FormData();
    // formData.append("list_length", entries);
    // formData.append("page", page);
    // formData.append("search", slug);

    let shopListUrl = Apis.shopList + "?list_length=" + entries + "&page=" + page + "&search=" + slug;
    BuyerApiCalls(
      formData,
      shopListUrl,
      "GET",
      user
        ? {
            Authorization: `Bearer ${user.access}`,
          }
        : {},
      processRes
    );
  }, [slug, page]);

  const processRes = (res, api) => {
    let rdata = res.data.data;

    setShops(rdata?.shop_list);
    setPages(rdata?.pages)
    setTotal(rdata?.total)
  };

  const changeEntries = (e) => {
    setEntries(e.target.value)
    setPage(1)
 };

  const  toPage = (page) => {
    setPage(page)
    
}

  return (
    <div className="min-h-screen flex flex-col">
      {/* {isLargeScreen ? <NewNavbar /> : <Navbar />} */}
      <Navbar />
      <div className=" mx-4 md:mx-20 my-10 listing-page">
        <p className="font-semibold text-black">SHOP RELATED TO "{slug}"</p>
        {shops.length > 0 ? (
          shops.map((shop) => {
            return <ShopCard shop={shop} from="shops" />;
          })
        ) : (
          <div className="flex flex-col w-full self-center text-center items-center  gap-2">
            <AiOutlineFileSearch
              className="place-self-center"
              size={100}
            ></AiOutlineFileSearch>
            <p>No result found</p>
          </div>
        )}
        <Pagination
          entries={entries}
          changeEntries={changeEntries}
          toPage={toPage}
          pages={pages}
          page={page}
          total={total}
        />
      </div>

      <Links />
    </div>
  );
};

export default ShopList;

import { useState, useEffect } from "react";
// import { Navbar } from "../../components/GenericSections";
import Navbar from "../../components/navbar/Navbar";
import Pagination from "../../../utils/Pagination/pagination";
import { PageLoader } from "../../../utils/loader";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";

import { AiOutlineFileSearch } from "react-icons/ai";
import { Links } from "../GenericSections";
import GroupBuyCard from "./groupBuyCard";
import { useMediaQuery } from "@mui/material";

export default function GroupBuyAll() {
  const [isGroupBuyListLoading, setIsGroupBuyListLoading] = useState(false);
  const [groupBuyList, setGroupBuyList] = useState([]);

  //pagination
  const [entries, setEntries] = useState(10);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");

  useEffect(() => {
    setIsGroupBuyListLoading(true);
    let url = Apis.groupBuyList + "?page=" + page + "&list_length=" + entries;
    BuyerApiCalls({}, url, "GET", {}, processRes);
  }, [page]);

  const processRes = (res, api) => {
    var rdata = res.data?.data;

    setGroupBuyList(rdata?.group_buy_list ?? []);
    setPages(rdata?.pages);
    setTotal(total ?? 0);
    setIsGroupBuyListLoading(false);
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
        <div className="py-4 max-sm:pl-4 pl-12 mt-8">
          <p className="font-bold uppercase text-[20px] md:text-[20px]">
            Group Buy Promotions
          </p>
          <div className="h-[2px] w-16 bg-amber-500 mb-4"></div>
          <div className="relative"></div>
        </div>
      </div>
      {isGroupBuyListLoading ? (
        <PageLoader />
      ) : (
        <div
          className="grid grid-cols-6 max-[1500px]:grid-cols-5 max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2 
           z-0 h-fit max-md:mx-2 mx-12"
        >
          {groupBuyList.length > 0 ? (
            groupBuyList.map((groupbuy) => {
              return <GroupBuyCard groupBuy={groupbuy} />;
            })
          ) : (
            <div className="flex flex-col w-full self-center text-center items-center  gap-2">
              <AiOutlineFileSearch
                className="place-self-center"
                size={100}
              ></AiOutlineFileSearch>
              <p>No result found</p>
            </div>
          )}{" "}
        </div>
      )}
      <div className="buyer-page mx-20 my-7">
        <Pagination
          entries={entries}
          changeEntries={changeEntries}
          toPage={toPage}
          from="GroupBuyList"
          pages={pages}
          page={page}
          total={total}
        />
      </div>
      <Links />
    </div>
  );
}

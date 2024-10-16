import React, { useEffect, useState } from "react";
import { Links } from "../../components/GenericSections";
import Navbar from "../../components/navbar/Navbar";
import NavbarFilter from "../../components/accountDetailsComponents/NavbarFilter";
import SideBar from "../../components/accountDetailsComponents/Sidebar";
import Orders from "../../components/accountDetailsComponents/Orders";
import { BiSearch } from "react-icons/bi";
import { ORDER_CONSTANTS } from "../../../constants/order_status";
import { Apis, BuyerApiCalls } from "../../utils/ApiCalls";
import Pagination from "../../../utils/Pagination/pagination";
import { CustomerRoutes } from "../../../Routes";
import { useNavigate, useParams } from "react-router-dom";
import { useMediaQuery } from "@mui/material";

const navLinks = [
  { text: "All", link: "all", id: "" },
  // { text: "Unpaid", link: "" },
  { text: "Pending Confirmation", link: "pending-confirmation", id: ORDER_CONSTANTS.GENERALSTATUS_PENDING_CONFIRMATION },
  { text: "To Receive", link: "to-receive", id: ORDER_CONSTANTS.GENERALSTATUS_ORDER_CONFIRMED },
  { text: "Delivered", link: "delivered", id: ORDER_CONSTANTS.GENERALSTATUS_DELIVERED },
  { text: "Cancelled", link: "cancelled", id: ORDER_CONSTANTS.GENERALSTATUS_CANCELLED },
  { text: "Return & Refund", link: "return-refund", id: ORDER_CONSTANTS.GENERALSTATUS_RETURNED },
];

export default function ViewOrder() {
  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");
  const user = JSON.parse(localStorage.getItem("customer"));
  const [searchValue, setSearchValue] = useState("");

  //orders
  const [orders, setOrders] = useState([]);
  const params = useParams();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);

  //pagination
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [entries, setEntries] = useState(10);

  const handleChange = (event) => {
    setSearchValue(event.target.value);
  };

  React.useEffect(()=>{
    let tab = params.tab;
    let currentIndex = navLinks.findIndex(item => item.link === tab)
    setActiveIndex(currentIndex)
    if(initialLoad) setInitialLoad(false)
  },[params])


  React.useEffect(() => {
    let delayInputTimeoutId 
    if (!initialLoad) {
      delayInputTimeoutId = setTimeout(() => {
        retrieveOrdersList();
      }, 500);
    }
    return () => clearTimeout(delayInputTimeoutId);
  }, [searchValue, initialLoad]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      //handle submit
    }
  };

  const processResponse = (res, api) => {
    setOrders(res.data.data);
    setTotal(res.data.total_records)
    setPages(res.data.total_pages)
  };

  const toPage = (page) => {
    setPage(page)
  }

  const retrieveOrdersList = () => {
    const formData = new FormData();

    if (activeIndex !== 0) formData.append("delivery_status", navLinks[activeIndex]?.id);
    if (searchValue) formData.append("search", searchValue);

    formData.append("list_length", entries);
    formData.append("page", page);

    BuyerApiCalls(
      formData,
      Apis.retrieveOrder,
      "POST",
      {
        Authorization: `Bearer ${user.access}`,
      },
      processResponse
    );
  }

  useEffect(() => {
    retrieveOrdersList()
  }, [activeIndex, page, entries])

  const handleActiveButton = (index) => {
    navigate(CustomerRoutes.ViewOrder.replace(":tab",navLinks[index]?.link))
  };

  const changeEntries = (e) => {
    setPage(1);
    setEntries(e.target.value)
    retrieveOrdersList()
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* {isLargeScreen ? <NewNavbar /> : <Navbar />} */}
      <Navbar />
      <div></div>
      <div className="md:mx-20">
        <div className="flex flex-col sm:flex-cols-2 px-4 sm:px-0 sm:gap-8 sm:pt-4">
          <div className="flex flex-col w-[280px] divide-y-2  mb-5">
            <ul className="list-none">
              <li className="inline">
                <a href={CustomerRoutes.Landing} className="!text-[#828282]">
                  Home&nbsp;/&nbsp;
                </a>
              </li>
              <li className="inline">
                <a href=" " className="!text-[#4F4F4F] ">
                  My Orders
                </a>
              </li>
            </ul>
          </div>
          <div className="basis-3/4 ">
            <div className="flex flex-row justify-between">
              <p className="font-bold text-[16px] sm:text-xl">My Orders</p>
              <div className="px-[15px] flex flex-row border rounded h-10">
                <button
                  type="submit"
                  className="text-grey mr-[15px] ease-linear transition hover:text-black flex-none"
                >
                  {" "}
                  <BiSearch size={24} />
                </button>
                <input
                  value={searchValue}
                  onChange={(event) => handleChange(event)}
                  onKeyDown={handleKeyDown}
                  type="text"
                  placeholder="Search Anything Here..."
                  className="text-left text-black text-base w-full"
                />
              </div>
            </div>
            <div className="buyer-page mt-5">
              <Pagination
                entries={entries}
                changeEntries={changeEntries}
                toPage={toPage}
                pages={pages}
                page={page}
                total={total}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex flex-1 sm:gap-[22px] py-4">
            <SideBar></SideBar>
            <div className="flex-col flex-1 w-1/2">
              <NavbarFilter
                navLinks={navLinks}
                handleActiveButton={handleActiveButton}
                activeIndex={activeIndex}
              />
              <Orders orders={orders} retrieveOrdersList={retrieveOrdersList} />
            </div>
          </div>
        </div>
      </div>
      <Links></Links>
    </div>
  );
}

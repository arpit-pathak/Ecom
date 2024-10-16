import { useState, useEffect } from "react";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import noTransactionIcon from "../../../assets/buyer/NoTransactionsIconCashBack.svg";
import CustomerPagination from "../../utils/Pagination";
import { GrImage } from "react-icons/gr";
import noImage from "../../../assets/add-variant-img.svg";

// import "./../../utils/pagination.css";
// import Pagination from "../../../utils/Pagination/pagination";
import { Constants } from "../../utils/Constants";
export default function ViewCashback() {
  const [viewTransactions, setViewTransactions] = useState("All History");
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilterTransactions] = useState([]);
  //pagination
  //entries = number of items to show
  //total = total number of records
  //pages = number of pages to show

  //total = entries x pages
  const [entries, setEntries] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(1);
  const user = JSON.parse(localStorage.getItem("customer"));
  const processResponse = (res, api) => {
    setTransactions(res.data.data);
    setFilterTransactions(res.data.data.transaction_list);

    var rdata = res.data?.data;
    // if total > number of entries per page, pages = total / entries (round up to whole number)
    // else pages = 1 (default)
    if (rdata.transaction_list.length > entries) {
      setPages(Math.ceil(rdata.transaction_list.length % entries));
    }
    // let nxtPageCount = rdata.transaction_list.length % entries;
    // console.log(nxtPageCount)
    // let currentPage = parseInt(rdata?.transaction_list.length / entries);
    // console.log(currentPage)
    // if (nxtPageCount >= 0 && currentPage !== pages - 1) pages -= 1;
    setTotal(rdata?.transaction_list.length ?? 0);
  };

  useEffect(() => {
    BuyerApiCalls(
      {},
      Apis.retrieveWalletTransactions + "/",
      "POST",
      {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${user.access}`,
      },
      processResponse
    );
  }, []);

  const retrieveCashback = (type, label) => {
    setViewTransactions(label);
    const formData = new FormData();
    if (type) {
      formData.append("transaction_type", type);
    }
    BuyerApiCalls(
      formData,
      Apis.retrieveWalletTransactions + "/",
      "POST",
      {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${user.access}`,
      },
      processResponse
    );
  };

  const changeEntries = (selectedValue) => {
    setEntries(selectedValue);
  };

  const TransactionButton = ({ label, type }) => {
    return (
      <button
        className=" px-2 py-1 "
        id={label}
        onClick={() => {
          retrieveCashback(type, label);
        }}
        style={{
          color: viewTransactions === label ? "orange" : "black",
          borderTop: viewTransactions === label ? "1px solid #d3d3d3" : "none",
          borderLeft: viewTransactions === label ? "1px solid #d3d3d3" : "none",
          borderRight:
            viewTransactions === label ? "1px solid #d3d3d3" : "none",
          borderTopLeftRadius: viewTransactions === label ? "4px" : "0", // Add top-left border radius
          borderTopRightRadius: viewTransactions === label ? "4px" : "0", // Add top-right border radius
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </button>
    );
  };
  return (
    <div className="flex flex-col w-full h-[470px] capitalize">
      <div className="mb-4 h-fill border-transparent shadow-lg">
        <div className="flex md:flex-col gap-6 p-5">
          <p className="text-[16px] font-medium">Cashback balance</p>
          {/* <p className="text-[14px] font-medium">Balance</p> */}
          <p className="text-[20px] font-medium">
            ${transactions.remaining_credit}
          </p>
        </div>
      </div>
      <div className="flex  flex-col gap-4 h-full border-transparent shadow-lg p-5">
        <div className="flex flex-col gap-6 h-full md:overflow-x-auto overflow-y-auto">
          <p className="text-[16px] font-medium">Last Transactions</p>
          <div className="flex flex-col ">
            <div className="flex capitalize w-full">
              <TransactionButton label="All History"></TransactionButton>
              <TransactionButton
                label="Earning"
                type={Constants.walletTransactionType.credit}
              ></TransactionButton>
              <TransactionButton
                label="Spending"
                type={Constants.walletTransactionType.debit}
              ></TransactionButton>
              <div className="border-b w-full "></div>
            </div>
            <div className="flex flex-col ">
              <div className="sm:flex hidden items-center bg-[#FFF2E3] h-[46px] w-auto relative ">
                {/* <p className="ml-10">Transaction</p> */}
                <p className="absolute ml-[200px]">Date</p>
                <p className="absolute ml-[400px]">Order ID</p>
                <p className="absolute ml-[600px]">Item Name</p>
                <p className="absolute ml-[800px]">Amount</p>
              </div>

              {filteredTransactions?.length > 0 ? (
                filteredTransactions?.map((transaction, index) => {
                  return (
                    <div>
                      <div className="flex justify-between py-4 relative items-center ">
                        <div className="flex gap-4 ">
                          {transaction.item_img!==null && transaction.item_img !== "" ? <img
                            src={transaction.item_img}
                            className="bg-contain w-[60px] h-[60px] md:w-[89px] md:h-[89px] rounded "
                            alt=""
                          ></img> : 
                          <img src={noImage} alt="" className="bg-contain w-[60px] h-[60px] md:w-[89px] md:h-[89px] rounded " />
                          }
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center sm:absolute">
                        <p className="md:absolute md:ml-[200px] whitespace-nowrap">
                          {transaction.transaction_date}
                        </p>
                        <p className="md:absolute md:ml-[400px]">
                          {transaction.order_number}
                        </p>
                        <p className="md:absolute md:ml-[600px] w-[146px]">
                          {transaction.product_name}
                        </p>
                        </div>
                        <div
                          style={{
                            color:
                              transaction.transaction_type === "CREDIT"
                                ? "#44B564"
                                : "#F5AB35",
                            // fontWeight: "bold",
                          }}
                          className="md:absolute md:ml-[800px]"
                        >
                          {transaction.transaction_type === "CREDIT"
                            ? "+"
                            : "-"}
                          ${transaction.credit_amount.toFixed(2)}
                        </div>
                      </div>
                      {index !== filteredTransactions.length - 1 && (
                        <hr className=" w-full"></hr>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col py-20 items-center justify-center w-full">
                  <img src={noTransactionIcon}></img>
                  <p className="py-2 text-slate-400">No data</p>
                </div>
              )}
              <div className="buyer-page "></div>
            </div>
          </div>
        </div>
        <CustomerPagination
          entries={parseInt(entries)}
          changeEntries={changeEntries}
          setCurrentPage={setCurrentPage}
          from="Products"
          pages={parseInt(pages)}
          currentPage={parseInt(currentPage)}
          total={parseInt(total)}
        />
         {/* <CustomerPagination
          entries={entries}
          changeEntries={changeEntries}
          setCurrentPage={setCurrentPage}
          from="Products"
          pages={5}
          currentPage={currentPage}
          total={50}
        /> */}
       {/* <Pagination
          entries={entries}
          changeEntries={changeEntries}
          toPage={setCurrentPage}
          from="Products"
          pages={pages}
          page={currentPage}
          total={total}
        /> */}
      </div>
    </div>
  );
}

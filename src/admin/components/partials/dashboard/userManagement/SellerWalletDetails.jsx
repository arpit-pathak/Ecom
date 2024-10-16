import pending from "../../../../../assets/seller/pending.svg";
import { useEffect, useState, useMemo, useCallback } from "react";
import { ApiCalls, AdminApis, HttpStatus, Messages } from "../../../../utils";
import useAuth from "../../../../hooks/UseAuth";
import { showToast } from "../../../generic/Alerts";
import { Button, Modal } from "../../../generic";
import Table from "../Table";
import Pagination from "../../../../../utils/Pagination/pagination";
import Loader from "../../../../../utils/loader";
import { InputBoxStyle } from "../../../../styles/FormStyles";

const labelClass = 'text-sm font-semibold text-[#828282] whitespace-nowrap';

const TransactionForm = ({ onConfirm }) => {
  const transTypeOptions = [{label: "Credit", value:"add"},{label:"Debit", value:"remove"}];

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target.form);
    onConfirm(formData);
  };

  return (
    <>
      <p className="text-lg font-semibold mb-3 text-left">New Transaction</p>
      <hr />
      <div className="py-2"></div>
      <form className="w-full mr-32">

        {/* amount text field */}
          <p className={`${labelClass} text-left`}>Amount</p>
          <input
            id="amount"
            name="amount"
            type="number"
            className={InputBoxStyle}
          />

          {/* transaction type drop down */}
          <p className={`${labelClass} text-left my-3`}>Transaction Type</p>
          <select
            name="action"
            id="action"
            className="mt-1 block w-full py-2 my-4 rounded-md border border-gray-300 shadow-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            {transTypeOptions.map(
              (elem) => (
                <option key={elem.value} value={elem.value}>
                  {elem.label}
                </option>
              )
            )}
          </select>

          <p className={`${labelClass} text-left my-3`}>Remarks</p>
          <textarea type="text" rows="4" name="remarks" id="remarks" className={InputBoxStyle} />

          {/* submit button */}
        <button
          type="submit"
          className="mb-2 text-white bg-yellow-500 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
          onClick={(event) => handleSubmit(event)}
        >
          Submit
        </button>
      </form>
    </>
  );
};


export default function SellerWalletDetails({ onClose, sellerWalletData }) {
  const auth = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [currentTab, setCurrentTab] = useState("pending");
  const [isDownloading, setIsDownloading] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);
  
  //pagination
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState(10);
  const [total, setTotal] = useState(0);

  const getWalletData = useCallback(async () => {
    let url =
      AdminApis.getSellerWalletData +
      sellerWalletData?.id +
      "/?page=" +
      page +
      "&status=" +
      currentTab;

    var formData = new FormData();
    await ApiCalls(url, "GET", formData, false, auth.token.access)
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          setWalletData(response.data.data);

          let pg = page;
          let nxtPageCount = response.data.data.total_records % entries;
          let currentPage = parseInt(
            response.data.data.total_records / entries
          );
          if (nxtPageCount >= 0 && currentPage !== pg - 1) pg += 1;
          setPages(pg);
          setTotal(response.data.data.total_records);
        }
      })
      .catch((error) => {
        showToast(error.response.data.message, "error");
      });
  }, [auth, currentTab, page]);

  const commonColumns = [
    {
      Header: "Receipt",
      accessor: "receipt",
    },
    {
      Header: "Type",
      accessor: "transaction_type",
    },
    {
      Header: "Fee",
      accessor: "transaction_fee",
    },
    {
      Header: "Status",
      accessor: "status",
    },
  ];

  const columns = useMemo(() => {
    if (currentTab === "pending") {
      return [
        ...commonColumns,
        {
          Header: "Payout Amount",
          accessor: "credit_amount",
        },
      ];
    } else if (currentTab === "complete") {
      return [
        {
          Header: "Order Number",
          accessor: "order_number",
        },
        ...commonColumns,
        {
          Header: "Payout Amount",
          accessor: "credit_amount",
        },
      ];
    } else {
      return [
        {
          Header: "Order Number",
          accessor: "order_number",
        },
        ...commonColumns,
        {
          Header: "Deducted Amount",
          accessor: "credit_amount",
        },
      ];
    }
  }, [getWalletData, currentTab]);

  useEffect(() => {
    getWalletData();
  }, [getWalletData]);

  const loadTab = (selectedTab) => {
    setCurrentTab(selectedTab);
    toPage(1);
  };

  const changeEntries = (e) => {
    setPage(1);
    setEntries(e.target.value);
  };

  const toPage = (page) => {
    setPage(page);
  };

  const onDownloadHandler = async () => {
    setIsDownloading(true);
    await ApiCalls(
      AdminApis.getSellerWalletData + sellerWalletData?.id + "/",
      "POST",
      {},
      true,
      auth.token.access
    )
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          const fileUrl = response.data.data.file_url;
          if (fileUrl) {
            window.location.href = fileUrl;
            showToast(response.data.message, "success")
          }
          if (response.data.result === "FAIL") {
            showToast(response.data.message, "error");
          }
        }
        setIsDownloading(false);
      })
      .catch((error) => {
        showToast(error.response.data.message, "error");
        setIsDownloading(false);
      });
  };

  const handleNewTransaction = async (formData) => {
    await ApiCalls(
      AdminApis.getSellerWalletData + sellerWalletData?.id + "/update/",
      "POST",
      formData,
      false,
      auth.token.access
    )
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          showToast(response.data.message, "success", "transaction-created");
          setShowTransaction(false);
          getWalletData();
        } else showToast(response.data.message, "error");
      })
      .catch((error) => {
        showToast(error?.response?.data.message, "error");
      });
  };

  return (
    <>
      {walletData ? (
        <div className="listing-page my-5 !pr-0">
           <div className="bg-white mb-8 h-11/12">
            <p className="font-semibold mb-6 mt-3">Seller Details</p>
            <div className="flex gap-12">
              <p>Name: <span className="font-bold">{sellerWalletData?.business_name}</span></p>
              <p>Email: <span className="font-bold">{sellerWalletData?.email}</span></p>
            </div>
            </div>
          <div className="bg-white mb-4 pb-8 h-11/12">
            <p className="font-semibold mb-6 mt-3">Income Overview</p>
            <p className="text-sm mb-8 text-[#828282]">
              {walletData?.display_date ?? ""}
              (This Month)
            </p>
            <div className="flex">
              <div className="border-r w-1/3">
                <div className="flex gap-1 mb-6">
                  <p className="text-sm font-semibold">Withdrawal</p>
                  <img src={pending} alt="" />
                </div>
                <p className="text-sm mb-2">Total</p>
                <p className="text-xl font-semibold mt-3">
                  ${walletData?.pending_amt ?? "0.0"}
                </p>
              </div>

              <div className="border-r w-1/3 ml-5">
                <div className="flex gap-1 mb-6">
                  <p className="text-sm font-semibold">Earned</p>
                  <img src={pending} alt="" />
                </div>
                <p className="text-sm mb-2">Total</p>
                <p className="text-xl font-semibold mt-3">
                  ${walletData.remaining_credit ?? "0.0"}
                </p>
              </div>

              <div className="border-r w-1/3 ml-5">
                <div className="flex gap-1 mb-6">
                  <p className="text-sm font-semibold">Deductions</p>
                  <img src={pending} alt="" />
                </div>
                <p className="text-sm mb-2">Total</p>
                <p className="text-xl font-semibold mt-3">
                  ${walletData.debit_amt ?? "0.0"}
                </p>
              </div>
            </div>
          </div>

          {/* income details section */}
          <div className="bg-white mb-5">
            <div className="flex justify-between">
              <p className="font-semibold mt-3 mb-6">Income Details</p>
              <div className="flex justify-end gap-3">
              <Button
                text={"Add Transaction"}
                onClick={()=>setShowTransaction(true)}
                type="add"
                py="0"
                px={ "4"}
              />
              {isDownloading ? <Button
                text={<Loader height="15px" width="15px" />}
                type="download"
                py="0"
                px="14"
                showIcon={!isDownloading}
              /> : <Button
                text="Download CSV"
                onClick={onDownloadHandler}
                type="download"
                py="0"
                px="4"
                showIcon={!isDownloading}
              />}
              </div>
             
            </div>
            {/* tabs section */}
            <ul className="border-b-[1px] border-b-[#e0e0e0] text-[#828282] !p-0 flex gap-8 items-center cp">
              <li
                onClick={(e) => loadTab("pending")}
                id="Pending"
                className={currentTab === "pending" ? "text-orangeButton" : ""}
              >
                Withdrawal
                <div
                  className={
                    currentTab === "pending"
                      ? "!border-b-orangeButton border-b-[3px]"
                      : ""
                  }
                ></div>
              </li>
              <li
                onClick={(e) => loadTab("complete")}
                className={currentTab === "complete" ? "text-orangeButton" : ""}
              >
                Earned
                <div
                  className={
                    currentTab === "complete"
                      ? "!border-b-orangeButton border-b-[3px]"
                      : ""
                  }
                ></div>
              </li>
              <li
                onClick={(e) => loadTab("deduct")}
                className={currentTab === "deduct" ? "text-orangeButton" : ""}
              >
                Deductions
                <div
                  className={
                    currentTab === "deduct"
                      ? "!border-b-orangeButton border-b-[3px]"
                      : ""
                  }
                ></div>
              </li>
            </ul>

            <div className="overflow-y-scroll overflow-x-hidden resize-y">
              <Table
                columns={columns}
                data={walletData.transaction_list}
                fetchData={getWalletData}
                numOfPages={walletData.total_records}
                defaultSearch={false}
                pagination={false}
              />
            </div>
            <Pagination
              entries={entries}
              changeEntries={changeEntries}
              toPage={toPage}
              pages={pages}
              page={page}
              total={total}
            />
          </div>
          <Button
            onClick={() => onClose({ edit: "true" })}
            text="Back"
            type="cancel"
            py="2"
            px="3"
          />
        </div>
      ) : (
        <div>{Messages.LOADING}</div>
      )}
      {showTransaction && <Modal
      onClose={()=>setShowTransaction(false)}
      open={showTransaction}
      form={<TransactionForm onConfirm={handleNewTransaction} />}
       />}
    </>
  );
}

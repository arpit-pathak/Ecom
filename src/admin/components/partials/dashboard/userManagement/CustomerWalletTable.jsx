//customerWalletList

import { useCallback, useEffect, useState, useMemo } from "react";
import { ApiCalls, AdminApis, HttpStatus, Messages } from "../../../../utils";
import useAuth from "../../../../hooks/UseAuth";
import { showToast } from "../../../generic/Alerts";
import Table from "../Table";
import { Button } from "../../../generic";
import NoImg from "../../../../../assets/add-variant-img.svg";

const CustomerWalletTable = ({ user, onClose }) => {
  const [actualData, setActualData] = useState({
    data: null,
    pageCount: 0,
  });
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState("");

  const getData = useCallback(
    async (page, records) => {
      let url = AdminApis.customerWalletList + user?.buyerId + `/?page=${page ?? 1}&transaction_type=${activeTab}`

      await ApiCalls(
        url,
        "GET",
        {},
        false,
        auth.token.access
      )
        .then((response) => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            setActualData((prevState) => ({
              ...prevState,
              data: response.data.data,
              pageCount: response.data.data.total_pages,
            }));
          }
        })
        .catch((error) => {
          showToast(error.response.data.message, "error");
        });
    },
    [auth, activeTab]
  );

  useEffect(() => {
    getData();
  }, [getData]);

  const columns = useMemo(
    () => [
      {
        Header: "Item",
        accessor: "product_name",
        Cell: (props) => {
          let isImg =
            props.row.original?.item_img !== "" &&
            props.row.original?.item_img !== null;
          return (
            <div className="flex items-center gap-3">
              {isImg ? (
                <img
                  alt=""
                  src={props.row.original?.item_img}
                  className="bg-contain w-[60px] h-[60px] md:w-[89px] md:h-[89px] "
                />
              ) : (
                <div className="w-[60px] h-[60px] md:w-[89px] md:h-[89px]">
                  <img
                    alt=""
                    src={NoImg}
                    className="bg-contain mx-auto my-auto w-[40px] h-[40px] md:w-[69px] md:h-[69px] "
                  />
                </div>
              )}
              <p>{props.row.original.product_name}</p>
            </div>
          );
        },
      },
      {
        Header: "Order ID",
        accessor: "order_id",
      },
      {
        Header: "Date",
        accessor: "transaction_date",
      },
      {
        Header: "Amount",
        accessor: "transaction_amount",
        Cell: (props) => {
          return (
            <p
              className={`${
                props.row.original.transaction_type === "CREDIT"
                  ? "text-[#44B564]"
                  : "text-[#F5AB35]"
              }`}
            >
              {props.row.original.transaction_type === "CREDIT" ? "+" : "-"}$
              {parseFloat(props.row.original.transaction_amount).toFixed(2)}
            </p>
          );
        },
      },
    ],
    [getData]
  );

  const loadTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      {actualData?.data ? (
        <>
          <Button onClick={onClose} text="Back" type="cancel" py="2" px="3" />
          <p className="text-xl font-bold mt-7">Cashback Balance</p>

          <div className="w-full px-4 py-5 shadow-md rounded-lg bg-white flex flex-col gap-5 mt-5 mb-10">
            <p className="font-semibold">User Details</p>
            <div className="flex items-center gap-10 sm:gap-20 mt-2">
              <p>Name : {user?.name}</p>
              <p>Email : {user?.email}</p>
              <p>Contact Number : {user?.contact_number}</p>
              </div>
            </div>

          <div className="w-full p-4 shadow-md rounded-lg bg-white flex flex-col gap-5 mt-5 mb-10">
            <p className="font-semibold">Cashback Balance</p>
            <p className="text-lg">
              $ {actualData?.data?.remaining_credit}
            </p>
          </div>        

          <p className="font-semibold">Last Transactions</p>
          <div className="listing-page w-full py-4 bg-white px-2">
            <ul className="border-b-[1px] border-b-[#e0e0e0] text-[#828282] !p-0 flex gap-8 items-center cp">
              <li
                onClick={(e) => loadTab("")}
                className={activeTab === "" ? "text-orangeButton" : ""}
              >
                All History
                <div
                  className={
                    activeTab === ""
                      ? "!border-b-orangeButton border-b-[3px]"
                      : ""
                  }
                ></div>
              </li>
              <li
                onClick={(e) => loadTab("credit")}
                className={activeTab === "credit" ? "text-orangeButton" : ""}
              >
                Earning
                <div
                  className={
                    activeTab === "credit"
                      ? "!border-b-orangeButton border-b-[3px]"
                      : ""
                  }
                ></div>
              </li>
              <li
                onClick={(e) => loadTab("debit")}
                className={activeTab === "debit" ? "text-orangeButton" : ""}
              >
                Spending
                <div
                  className={
                    activeTab === "debit"
                      ? "!border-b-orangeButton border-b-[3px]"
                      : ""
                  }
                ></div>
              </li>
            </ul>

            <Table
              columns={columns}
              data={actualData?.data?.transaction_list}
              fetchData={getData}
              numOfPages={actualData?.pageCount}
              defaultSearch={false}
            />
          </div>
        </>
      ) : (
        <h1>{Messages.LOADING}</h1>
      )}
    </>
  );
};

export default CustomerWalletTable;

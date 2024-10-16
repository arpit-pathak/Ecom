import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Table, { SelectColumnFilter } from "../../Table";
import {
  ApiCalls,
  AdminApis,
  HttpStatus,
  PageTitles,
  Messages,
  CommonStrings,
  UserPermissions,
} from "../../../../../utils";
import { Button, Modal } from "../../../../generic";
import { showToast } from "../../../../generic/Alerts";
import useAuth from "../../../../../hooks/UseAuth";
import { useNavigate, useParams } from "react-router-dom";
import { FormStyle } from "../../../../../styles/FormStyles";
import verifiedBadge from "../../../../../../assets/seller/verified_badge.png";

export const WithdrawForm = ({ onConfirm }) => {
  return (
    <form className={`${FormStyle.overall}`}>
      <button
        type="submit"
        className="mb-2 text-white bg-yellow-500 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
        onClick={(event) => onConfirm("paid")}
      >
        Approve
      </button>
      <button
        type="submit"
        className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
        onClick={(event) => onConfirm("reject")}
      >
        Reject
      </button>
    </form>
  );
};

const AffiliateWalletTable = () => {
  const { affiliateUserId } = useParams();

  const navigate = useNavigate();
  const [creditChoices, setCreditChoices] = useState([]);
  const [transactionTypes, setTransactionTypes] = useState([]);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [debitChoices, setDebitChoices] = useState([]);
  const [userDetail, setUserDetail] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  
  const auth = useAuth();
  const hasUpdatePermission = auth.checkPermission([UserPermissions.affiliate_wallet_withdraw]);

  const [tableData, setTableData] = useState({
    data: null,
    pageCount: 0,
  });

  const dataRef = useRef({
    status: null,
    transactionType: null,
    id_transaction: null,
  });

  const getData = useCallback(
    async (page, records) => {
      const formData = new FormData();

      let pg = 1,
        rec = 10;
      if (page) pg = page;
      if (records) rec = records;

      let url =
        AdminApis.getAffiliateTransactionList +
        affiliateUserId +
        "/?page=" +
        pg +
        "&list_length=" +
        rec;

      if (dataRef.current.transactionType) {
        url += "&transaction_type=" + dataRef.current.transactionType;
      }

      if (dataRef.current.status) {
        url += "&status=" + dataRef.current.status;
      }

      await ApiCalls(url, "GET", formData, false, auth.token.access)
        .then((response) => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            setTableData((prevState) => ({
              ...prevState,
              data: response.data.data.transaction_list,
              pageCount: response.data.data.total_pages,
            }));

            if (creditChoices.length === 0) {
              let choices = Object.keys(
                response.data.data?.filter?.credit_status
              )?.map((key) => {
                return {
                  value: key,
                  label: statusFormatter("CREDIT", response.data.data?.filter?.credit_status[key].toUpperCase()),
                };
              });
              setCreditChoices(choices);
            }

            if (debitChoices.length === 0) {
              let dchoices = Object.keys(
                response.data.data?.filter?.debit_status
              )?.map((key) => {
                return {
                  value: key,
                  label: statusFormatter("DEBIT", response.data.data?.filter?.debit_status[key].toUpperCase()),
                };
              });
              setDebitChoices(dchoices);
            }


            if (transactionTypes.length === 0) {
              let types = Object.keys(
                response.data.data?.filter?.transaction_type
              )?.map((key) => {
                return {
                  value: key,
                  label: key,
                };
              });
              setTransactionTypes(types);
            }

            if(!userDetail) {
              setUserDetail({...response.data.data?.user_detail,
                "lifetime_earning": response.data.data.lifetime_earning,
                "available_earning": response.data.data?.available_earning,
                "total_tracked" : response.data.data?.total_tracked,
                "total_redeemed" : response.data.data?.total_redeemed
            })
          }

          if(!bankDetails) {
            setBankDetails({...response.data.data?.bank_detail})
          }
        }})
        .catch((error) => {
          showToast(error.response.data.message, "error");
        });
    },
    [auth]
  );

  //Fetch data on first load with useEffect
  useEffect(() => {
    getData();
  }, [getData]);

  const statusFormatter = (type, status) => {
    if (type === "CREDIT") {
      if (status === "PENDING") return "TRACKED";
      else if (status === "VERIFIED") return "CONFIRMED";
      else return status;
    } else {
      if (status === "PAID") return "COMPLETED";
      else if (status === "REJECT") return "FAILED";
      else return status;
    };
  };

  const columns = useMemo(() => {
    let cols = [
      {
        Header: "Receipt",
        accessor: "receipt",
      },
      {
        Header: "Transaction Amount",
        accessor: "transaction_amount",
      },
      {
        Header: "Transaction Fee",
        accessor: "transaction_fee",
      },
      {
        Header: "Transaction Date",
        accessor: "transaction_date",
      },
      {
        Header: "Credit Amount",
        accessor: "credit_amount",
      },
      {
        Header: "Transaction Type",
        accessor: "transaction_type",
        Filter: ({ column }) => (
          <SelectColumnFilter
            column={column}
            choices={transactionTypes}
            initialValue={dataRef.current.transactionType}
            onFilterChange={(filterValue) => {
              dataRef.current.transactionType = filterValue;
              dataRef.current.status = null;
              getData();
            }}
          />
        ),
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: (props) => (
          <p>
            {statusFormatter(
              props.row.original.transaction_type,
              props.row.original.status
            )}
          </p>
        ),
        Filter: ({ column }) => (
          <SelectColumnFilter
            column={column}
            choices={
              dataRef.current.transactionType === "credit"
                ? creditChoices
                : dataRef.current.transactionType === "debit"
                ? debitChoices
                : []
            }
            initialValue={dataRef.current.status}
            onFilterChange={(filterValue) => {
              dataRef.current.status = filterValue;
              getData();
            }}
          />
        ),
      },
      {
        Header: "Action",
        Cell: (props) => (
          <>
            {props.row.original.transaction_type === "DEBIT" &&
            props.row.original.status === "PENDING" ? (
              <Button
                text="Update"
                onClick={() => {
                  if(hasUpdatePermission){
                  dataRef.current.id_transaction =
                    props.row.original.id_transaction;
                  setIsWithdrawOpen(true);
                  }else{
                    showToast(CommonStrings.ACTION_NO_PERMISSION, "error")
                  }
                }}
                type="transparent-blue"
              />
            ) : (
              <p>N/A</p>
            )}
          </>
        ),
      },
    ];

    if (dataRef.current.transactionType !== "debit") {
      cols = [
        {
          Header: "Shop Name",
          accessor: "seller_shop_name",
        },
        {
          Header: "Order Number",
          accessor: "order_number",
        },
        ...cols,
      ];
    }

    return cols;
  }, [
    getData,
    transactionTypes,
    creditChoices,
    dataRef.current.transactionType,
    debitChoices,
  ]);

  const handleWithdraw = async (action) => {
    var formData = new FormData()
    formData.append("user_id", affiliateUserId);
    formData.append("transaction_id", dataRef.current.id_transaction);
    formData.append("status", action);

    await ApiCalls(
      AdminApis.manageAffiliateWithdraw,
      "POST",
      formData,
      false,
      auth.token.access
    )
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          showToast(response.data.message, "success");
          setIsWithdrawOpen(false)
        }
      })
      .catch((error) => {
        showToast(error.response.data.message, "error");
      });
  };

  return (
    <>
      {isWithdrawOpen && (
        <Modal
          open={isWithdrawOpen}
          onClose={() => setIsWithdrawOpen(false)}
          title="Withdraw Confirmation"
          form={<WithdrawForm onConfirm={handleWithdraw} />}
        />
      )}
      <div className="min-h-screen text-gray-900 bg-white">
        <main className="px-4 pt-4 pb-4 mx-auto sm:px-6 lg:px-8">
          <Button
            onClick={() => navigate(-1)}
            text="Back"
            type="cancel"
            py="2"
            px="4"
          />
          <h1 className="text-xl font-semibold my-5">
            {PageTitles.AFFILIATE_WALLET}
          </h1>
          <div className="w-full mb-6 text-sm shadow-md p-5">
            <p className="font-bold my-2">User Details</p>
            <div className="flex items-center gap-10 sm:gap-20 mt-4">
              <p>Name : {userDetail?.name}</p>
              <p>Email : {userDetail?.email}</p>
              <p>Contact Number : {userDetail?.contact_number}</p>
            </div>

            <p className="font-bold my-5">Bank Details</p>
            <div className="flex items-center gap-10 sm:gap-20 mt-4">
              <p>Name : {bankDetails?.full_name}</p>
              <p className="flex gap-1 justify-center items-center">
                Bank :{" "}
                <img
                  src={bankDetails?.bank_logo}
                  className="w-fit h-[15px]"
                  alt="bank_logo"
                />
                {bankDetails?.bank}
                {bankDetails?.is_verified && (
                  <img
                    src={verifiedBadge}
                    alt="verified-badge"
                    width="75px"
                    height="50px"
                  />
                )}
              </p>
              <p>Account Number : {bankDetails?.account_number}</p>
            </div>

            <p className="font-bold mt-6 mb-2">Earning Summary</p>
            <div className="flex items-center gap-10 sm:gap-20  mt-4">
              <p>Lifetime Earning : {userDetail?.lifetime_earning}</p>
              <p>Total Tracked : {userDetail?.total_tracked}</p>
              <p>Available Earning : {userDetail?.available_earning}</p>
              <p>Total Redeemed : {userDetail?.total_redeemed}</p>
            </div>
          </div>
          {tableData.data ? (
            <Table
              columns={columns}
              data={tableData.data}
              fetchData={getData}
              numOfPages={tableData.pageCount}
              defaultSearch={false}
            />
          ) : (
            <div>{Messages.LOADING}</div>
          )}

          <Button
            onClick={() => navigate(-1)}
            text="Back"
            type="cancel"
            py="2"
            px="4"
          />
        </main>
      </div>
    </>
  );
};

export default AffiliateWalletTable;

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Table, {StatusPill, SelectColumnFilter} from "../Table";
import {
  ApiCalls,
  AdminApis,
  HttpStatus,
  Messages,
  DateConverter,
  buildQueryParams,
  UserStatusChoices,
} from "../../../../utils";
import { Button } from "../../../generic";
import { showToast } from "../../../generic/Alerts";
import useAuth from "../../../../hooks/UseAuth";
import Loader from "../../../../../utils/loader";

const MerchantWalletReport = () => {
  const [tableData, setTableData] = useState({
    data: null,
    pageCount: 0,
  });
  const auth = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);
  const filtersRef = useRef({
    status: null,
    search: ""
  })
  const getData = useCallback(
    async (page, records, search = null) => {
      const formData = new FormData();

      if (page) {
        formData.append("page", page);
      }
      if (records) {
        formData.append("records", records);
      }
      if (search) {
        formData.append("search", search);
        filtersRef.current.search = search;
      }else filtersRef.current.search = "";

      if (filtersRef.current.status) {
        formData.append("status_id", filtersRef.current.status);
      }
  
      await ApiCalls(
        AdminApis.merchantList +"?slug=wallet-summary",
        "POST",
        formData,
        false,
        auth.token.access
      )
        .then((response) => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            setTableData((prevState) => ({
              ...prevState,
              data: response.data.data.records,
              pageCount: response.data.total_pages,
            }));
          }
        })
        .catch((error) => {
          showToast(
            error.response.data.message,
            "error",
            "seller-wallet-error"
          );
        });
    },
    [auth]
  );

  useEffect(() => {
    getData();
  }, [getData]);

  const columns = useMemo(
    () => [
      {
        Header: "Shop Name",
        accessor: "business_name",
      },
      {
        Header: "Phone Number",
        accessor: "contact_number",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Status",
        accessor: "user_status",
        Cell: StatusPill,
        Filter: ({ column }) => (
          <SelectColumnFilter
            column={column}
            choices={UserStatusChoices}
            initialValue={filtersRef.current.status}
            onFilterChange={filterValue => {
              filtersRef.current.status = filterValue;
              getData();
            }}
          />
        ),
      },
      {
        Header: "Created On",
        accessor: "created_date",
        Cell: ({ cell: { value } }) => (
          <div className="text-sm text-gray-500 whitespace-normal">{DateConverter(value)}</div>
        )
      },
      {
        Header: "Last Login",
        accessor: "last_login",
        Cell: ({ cell: { value } }) => (
          <div className="text-sm text-gray-500 whitespace-normal">{DateConverter(value)}</div>
        )
      },
      {
        Header: "Wallet Balance",
        accessor: "total_cashback",
        Cell: ({ cell: { value } }) => (
          <div className="text-sm text-gray-500 whitespace-normal text-right">{parseFloat(value).toFixed(2)}</div>
        )
      }
    ],
    []
  );

   //Handle CSV Download
   const onDownloadHandler = async () => {
     setIsDownloading(true);
     let url = AdminApis.merchantWalletReportDownload+"?status_id=1&slug=wallet-summary"


     if (filtersRef.current.search) {
      url += "&search="+encodeURIComponent(filtersRef.current.search);
     }
    
     if (filtersRef.current.status) url += "&status_id="+filtersRef.current.status;
    
     await ApiCalls(url, "GET", null, true, auth.token.access)
       .then((response) => {
         if (response.status === HttpStatus.HTTP_200_OK) {
           const fileUrl = response.data.data.file_url;
           if (fileUrl) {
             window.location.href = fileUrl;
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

  return (
      <div className="min-h-screen text-gray-900 bg-white">
        <main className="px-4 pt-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold mb-2">
              Merchant Wallet Balances
            </h1>
            <Button
              onClick={() => onDownloadHandler()}
              text={
                isDownloading ? (
                  <Loader height="15px" width="15px" />
                ) : (
                  "Download CSV"
                )
              }
              type="download"
              py="2"
              px={isDownloading ? "12" : "4"}
              showIcon={!isDownloading}
            />
          </div>
          {tableData.data ? (
            <Table
              columns={columns}
              data={tableData.data}
              fetchData={getData}
              numOfPages={tableData.pageCount}
              onSearchChange={(searchValue) => {
                getData(undefined, undefined, searchValue);
              }}
            />
          ) : (
            <div>{Messages.LOADING}</div>
          )}
        </main>
      </div>
  );
};
export default MerchantWalletReport;

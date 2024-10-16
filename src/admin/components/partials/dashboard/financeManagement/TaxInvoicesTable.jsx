import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Table from "../Table";
import {
  ApiCalls,
  AdminApis,
  HttpStatus,
  Messages,
  CommonStrings,
  UserPermissions,
  buildQueryParams,
} from "../../../../utils";
import { Modal, Button } from "../../../generic";
import { showToast } from "../../../generic/Alerts";
import useAuth from "../../../../hooks/UseAuth";
import Loader from "../../../../../utils/loader";

const TaxInvoicesTable = () => {
  const [tableData, setTableData] = useState({
    data: null,
    pageCount: 0,
  });
  const taxInvoiceRef = useRef(null);
  const auth = useAuth();
  const hasDeletePermission = auth.checkPermission([
    UserPermissions.seller_invoice_delete,
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const getData = useCallback(
    async (page, records) => {
      const params = buildQueryParams(page, records);

      await ApiCalls(
        AdminApis.taxInvoice,
        "GET",
        params,
        false,
        auth.token.access
      )
        .then((response) => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            setTableData((prevState) => ({
              ...prevState,
              data: response.data.data.invoice_list,
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
        accessor: "shop_name",
      },
      {
        Header: "Email ",
        accessor: "email",
      },
      {
        Header: "Tax Invoice/Debit Note",
        accessor: "invoice_label",
      },
      {
        Header: "Date of Doc",
        accessor: "invoice_date",
      },
      {
        Header: "Amount ",
        accessor: "total_amount",
      },
      {
        Header: "Action",
        Cell: (props) => {
          return (
            <>
              <Button
                text="View"
                  onClick={() => window.open(props.row.original?.invoice_url, "_blank")}
                type="view"
              />
              <Button
                text="Delete"
                onClick={() => {
                  if (hasDeletePermission) {
                    taxInvoiceRef.current = props.row.original.id_invoice;
                    setIsOpen(true);
                  } else {
                    showToast(CommonStrings.ACTION_NO_PERMISSION, "error");
                  }
                }}
                type="delete"
              />
            </>
          );
        },
      },
    ],
    [hasDeletePermission]
  );

  const handleConfirmation = async () => {
    const formData = new FormData();
    formData.append("invoice_id", taxInvoiceRef.current);
    await ApiCalls(AdminApis.taxInvoice, "DELETE", formData, false, auth.token.access)
      .then(response => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          showToast(response.data.message, "success", "delete-faq")
          setIsOpen(false);
          getData();
        }
      }).catch(error => {
        showToast(error.response.data.message, "error")
      });
  }

   //Handle CSV Download
   const onDownloadHandler = async () => {
     setIsDownloading(true);
     await ApiCalls(AdminApis.taxInvoice, "POST", null, true, auth.token.access)
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
    <>
      {isOpen && (
        <Modal
          confirm={handleConfirmation}
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title={CommonStrings.DELETE_TITLE}
          confirmText={CommonStrings.CONFIRM_YES}
          cancelText={CommonStrings.CONFIRM_NO}
        />
      )}
      <div className="min-h-screen text-gray-900 bg-white">
        <main className="px-4 pt-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold mb-2">
              Tax Invoices / Debit Notes
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
              defaultSearch={false}
            />
          ) : (
            <div>{Messages.LOADING}</div>
          )}
        </main>
      </div>
    </>
  );
};
export default TaxInvoicesTable;

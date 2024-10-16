import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import Table from '../Table'
import { Link } from 'react-router-dom';
import {
    ApiCalls, AdminApis, HttpStatus, Messages
} from '../../../../utils';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';
import useRedux from '../../../../hooks/UseRedux';
import { setFilterItems, clearFilterItems } from '../../../../redux/orderListReducer';
import { useNavigate } from "react-router-dom";
import { AdminRoutes } from '../../../../../Routes';
import { Modal, Button } from '../../../generic';
import {
  CancelOrderForm,
  RefundOrderForm,
  SearchOrderForm,
  DisputeOrderForm,
  ConfirmOrderForm,
  ManualRefundOrderForm,
} from "./OrdersForm";
import {
  isConfirmEligible,
  isCancelEligible,
  isRefundEligible,
  isDisputeEligible,
  isManualRefundEligible,
  isWaybillEligible,
} from "./OrdersUtils";
import Loader from '../../../../../utils/loader';

// const FILTERS_PERMITTED = ["order_number", "tracking_number", "delivery_status", "start_date", "end_date", 
//   "time_slot_id", "delivery_date", "seller_email", "buyer_email", "transaction_id", "payment_status", "payment_type"];

const OrdersTable = () => {
    const [orderStatus, setOrderStatus] = useState([]);
    const [timeSlot, setTimeSlot] = useState([]);
    const [cancelReasons, setCancelReasons] = useState([]);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [isRefundOpen, setIsRefundOpen] = useState(false);
    const [isDisputeOpen, setIsDisputeOpen] = useState(false);
    const [isConfirmOrder, setIsConfirmOrder] = useState(false);
    const [isManualRefundOpen, setIsManualRefundOpen] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState([]);
    const [paymentType, setPaymentType] = useState([]);
    const [tableData, setTableData] = useState({
        data: null,
        pageCount: 0
    });
    const [isDownloading, setIsDownloading] = useState(false);
    const auth = useAuth();
    const navigate = useNavigate();
    const orderIDRef = useRef(null);
    const returnRefundRef = useRef();
    const orderDetailsRef = useRef({});
    const { dispatch, selectedData: orderFilters } = useRedux((state) => state.orderList.orderFilters);
    // const searchRef = useRef({}); //To store search form data for pagination

    const getData = useCallback(async (page, records, searchForm) => {
        const formData = new FormData();
        if (page) {
            formData.append("page", page);
        }
        if (records) {
            formData.append("list_length", records);
        }
        if (searchForm) {
          // for (const [key, value] of searchForm.entries()) {
          //   if (value !== "") {
          //     searchRef.current[key] = value;
          //     formData.append(key, value);
          //   }
          // }
            for (const [key, value] of searchForm.entries()) {
                if (value !== '') {
                    dispatch(setFilterItems([{ key, value }]));
                    formData.append(key, value);
                }
            }
        } else {
          // for (const [key, value] of Object.entries(searchRef.current)) {
          //   if (value !== "") {
          //     formData.append(key, value);
          //   }
          // }
            //On page load, check if store has saved filters
            for (const key in orderFilters) {
                const value = orderFilters[key];
                if (value !== '') {
                    formData.append(key, value);
                }
            }
        }

        await ApiCalls(AdminApis.orderList, "POST", formData, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    setTableData(prevState => ({
                        ...prevState,
                        data: response.data.data,
                        pageCount: response.data.total_pages
                    }));
                    // Check if orderStatus is empty before setting it
                    if (orderStatus.length === 0) {
                        setOrderStatus(response.data.general_status);
                    }
                    if (timeSlot.length === 0) {
                        setTimeSlot(response.data.order_timeslot);
                    }
                    if (cancelReasons.length === 0) {
                        setCancelReasons(response.data.cancel_reason);
                    }
                    if(paymentStatus.length === 0){
                      setPaymentStatus(response.data.payment_status)
                    }
                    if(paymentType.length === 0){
                      setPaymentType(response.data.payment_type)
                    }
                }

            }).catch(error => {
                showToast(error.response.data.message, "error", "order-list-error")
            });
    }, [auth, orderStatus.length, timeSlot.length, cancelReasons.length, dispatch, orderFilters]);


    useEffect(() => {
        getData();
    }, []);

    const columns = useMemo(
      () => [
        {
          Header: "Order Number",
          accessor: "order_number",
          Cell: (props) => (
            <>
              <div className="text-sm text-gray-500 whitespace-normal underline">
                <Link
                  to={`${AdminRoutes.ManageOrders}/${props.row.original.id_order}`}
                >
                  {props.row.original.order_number}
                </Link>
              </div>
            </>
          ),
        },
        {
          Header: "Buyer Email",
          accessor: "buyer_email",
        },
        {
          Header: "Total Paid",
          accessor: "formatted_total_paid",
        },
        {
          Header: "Payment Type",
          accessor: "payment_type",
        },
        {
          Header: "Payment Status",
          accessor: "order_payment",
        },
        {
          Header: "Order Status",
          accessor: "order_delivery",
        },
        {
          Header: "Delivery Type",
          accessor: "seller_detail.delivery_method",
        },
        {
          Header: "Pickup Date/Time",
          Cell: (props) => (
            <>
              <div className="whitespace-nowrap">
                <div>{props.row.original.seller_detail.pickup_date}</div>
                <div className="mt-2">
                  {props.row.original.seller_detail.pickup_time}
                </div>
              </div>
            </>
          ),
        },
        {
          Header: "Delivery Date/Time",
          Cell: (props) => (
            <>
              <div className="whitespace-nowrap">
                <div>
                  {props.row.original.seller_detail.delivery_date_end
                    ? props.row.original.seller_detail.delivery_date +
                      " to " +
                      props.row.original.seller_detail.delivery_date_end
                    : props.row.original.seller_detail.delivery_date}
                </div>
                <div className="mt-2">
                  {props.row.original.seller_detail.delivery_time}
                </div>
              </div>
            </>
          ),
        },
        {
          Header: "Created On",
          accessor: "created_date",
          Cell: ({ cell: { value } }) => (
            <div className="text-sm text-gray-500 whitespace-normal">
              {value}
            </div>
          ),
        },
        {
          Header: "Action",
          Cell: (props) => (
            <>
              <Button
                text="View"
                onClick={() =>
                  navigate(
                    AdminRoutes.ManageOrders + "/" + props.row.original.id_order
                  )
                }
                type="view"
              />
              {isCancelEligible(props.row.original) && (
                <Button
                  text="Cancel"
                  onClick={() => {
                    orderIDRef.current = props.row.original.id_order;
                    setIsCancelOpen(true);
                  }}
                  type="Reject"
                />
              )}
              {isConfirmEligible(props.row.original) && (
                <Button
                  text="Confirm"
                  onClick={() => {
                    orderIDRef.current = props.row.original.id_order;
                    orderDetailsRef.current["Delivery Date"] =
                      props.row.original.seller_detail.delivery_date;
                    orderDetailsRef.current["Delivery Time"] =
                      props.row.original.seller_detail.delivery_time;
                    orderDetailsRef.current["Delivery Type"] =
                      props.row.original.seller_detail.delivery_method;
                    orderDetailsRef.current["Pickup Date"] =
                      props.row.original.seller_detail.pickup_date;
                    orderDetailsRef.current["Shipping ID"] =
                      props.row.original.seller_detail.shipping_id;
                      orderDetailsRef.current["Timeslots"] =
                      props.row.original.seller_detail.available_timeslot;
                    if (props.row.original.seller_detail.delivery_date_end) {
                      orderDetailsRef.current["Delivery Date End"] =
                        props.row.original.seller_detail.delivery_date_end;
                    } else orderDetailsRef.current["Delivery Date End"] = null;

                    setIsConfirmOrder(true);
                  }}
                  type="transparent-green"
                />
              )}
              {isRefundEligible(props.row.original) && (
                <>
                  <Button
                    text="Approve"
                    onClick={() => {
                      orderIDRef.current = props.row.original.id_order;
                      orderDetailsRef.current["Refund Amount"] =
                        props.row.original.formatted_total_paid;
                      returnRefundRef.current = "approve";
                      setIsRefundOpen(true);
                    }}
                    type="transparent-blue"
                  />
                  <Button
                    text="Reject"
                    onClick={() => {
                      orderIDRef.current = props.row.original.id_order;
                      returnRefundRef.current = "reject";
                      setIsRefundOpen(true);
                    }}
                    type="transparent-red"
                  />
                </>
              )}
              {isWaybillEligible(props.row.original) && (
                <Button
                  text="Waybill"
                  onClick={() => {
                    orderIDRef.current = props.row.original.id_order;
                    handlePrintWaybill();
                  }}
                  type="transparent-yellow"
                />
              )}
              {isDisputeEligible(props.row.original) && (
                <Button
                  text="Dispute"
                  onClick={() => {
                    orderIDRef.current = props.row.original.id_order;
                    setIsDisputeOpen(true);
                  }}
                  type="transparent-blue"
                />
              )}
              {isManualRefundEligible(props.row.original) && (
                <Button
                  text="Refund"
                  onClick={() => {
                    orderIDRef.current = props.row.original.id_order;
                    setIsManualRefundOpen(true);
                  }}
                  type="transparent-green"
                />
              )}
            </>
          ),
        },
      ],
      [navigate]
    );

    //Handle CSV Download
    const onDownloadHandler = async () => {      
      let url = `${AdminApis.orderExport}${"orders"}/`

      if(Object.entries(orderFilters).length > 0){
        url += "?"
        Object.entries(orderFilters).map(([key, value]) =>{
          // if(FILTERS_PERMITTED.includes(key)){
          url += key + "=" + value + "&";
          // }
        })

        url = url.substring(0, url.length-1)
      }

      setIsDownloading(true)
      await ApiCalls(url, "GET", null, true, auth.token.access)
          .then((response) => {
              if (response.status === HttpStatus.HTTP_200_OK) {
                  const fileUrl = response.data.data.file_url;
                  if (fileUrl) {
                      window.location.href = fileUrl
                      showToast(response.data.message, "success")
                  }
                  if (response.data.result === "FAIL") {
                      showToast(response.data.message, "error")
                  }
              }
              setIsDownloading(false)
          }).catch((error) => {
              showToast(error.response.data.message, "error")
              setIsDownloading(false)
          })
    };

    
    const handleCancelOrder = async (formData) => {
        formData.append("id_order", orderIDRef.current);
        
        await ApiCalls(AdminApis.orderCancel, "POST", formData, false, auth.token.access)
        .then(response => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            showToast(response.data.message, "success", "order-dispute")
            setIsCancelOpen(false);
            getData();
          }else showToast(response.data.message, "error")
        }).catch(error => {
          showToast(error?.response?.data.message, "error")
        });
    }

    const handleRefund = async (formData, action) => {
        formData.append("id_order", orderIDRef.current);
        let url = AdminApis.orderRefund;
        url += `${action}/`;

        await ApiCalls(url, "POST", formData, false, auth.token.access)
        .then(response => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            showToast(response.data.message, "success", "order-dispute")
            setIsRefundOpen(false);
            getData();
          }else showToast(response.data.message, "error")
        }).catch(error => {
          showToast(error?.response?.data.message, "error")
        });
    }

    const handleDispute = async (formData, action) => {
        let url = AdminApis.orderDispute;
        url += `${action}/`;

        formData.append("id_order", orderIDRef.current);

        await ApiCalls(url, "POST", formData, false, auth.token.access)
        .then(response => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            showToast(response.data.message, "success", "order-dispute")
            setIsDisputeOpen(false);
            getData();
          }else showToast(response.data.message, "error")
        }).catch(error => {
          showToast(error?.response?.data.message, "error")
        });
    }

    const handleConfirmation = async (formData) => {
        formData.append("id_order", orderIDRef.current);

        await ApiCalls(AdminApis.orderConfirm, "POST", formData, false, auth.token.access)
        .then(response => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            showToast(response.data.message, "success", "order-confirmed")
            setIsConfirmOrder(false);
            getData();
          }else showToast(response.data.message, "error")
          
        }).catch(error => {
          showToast(error?.response?.data.message, "error")
        });
    }

    const handleManualRefund = async (formData) => {
      let url = AdminApis.orderManualRefund;

      formData.append("id_order", orderIDRef.current);

      for (var [key, value] of formData.entries()) {
        if (key === "partial_refund_amount" && value === "") {
          formData.delete("partial_refund_amount");
          break;
        }
      }
      await ApiCalls(url, "POST", formData, false, auth.token.access)
        .then((response) => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            showToast(response.data.message, "success", "order-manual-refund");
            setIsManualRefundOpen(false);
            getData();
          } else showToast(response.data.message, "error");
        })
        .catch((error) => {
          showToast(error?.response?.data.message, "error");
        });
    };

    const handlePrintWaybill = async () => {
      var formData = new FormData()
      formData.append("order_id", orderIDRef.current);
      formData.append("is_multiple", 0); //0-false, 1- true (single/multiple way bill)
      await ApiCalls(AdminApis.orderPrintWaybill, "POST", formData, false, auth.token.access)
      .then(response => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          const fileUrl = response.data.data.waybill;
          if (fileUrl) {
              var link = document.createElement('a');
              link.href = fileUrl;
              link.target = "_blank";
              link.click();
              showToast(response.data.message, "success")
          }
          if (response.data.result === "FAIL") {
              showToast(response.data.message, "error")
          }
      }
      }).catch(error => {
        showToast(error?.response?.data.message, "error")
      });
  }

    const getDataWithSearchForm = (formData) => {
        getData(null, null, formData);
    }

    const handleReset = () => {
      // searchRef.current = {};
        dispatch(clearFilterItems());
    }

    useEffect(() => {
      dispatch(clearFilterItems());

      // return () => {
      //   dispatch(clearFilterItems());
      // };
    }, [dispatch]);

    return (
      <>
        {isCancelOpen ? (
          <Modal
            open={isCancelOpen}
            onClose={() => setIsCancelOpen(false)}
            form={
              <CancelOrderForm
                onConfirm={handleCancelOrder}
                onClose={() => setIsCancelOpen(false)}
                cancelSlots={cancelReasons}
              />
            }
          />
        ) : null}

        {isRefundOpen ? (
          <Modal
            open={isRefundOpen}
            onClose={() => setIsRefundOpen(false)}
            form={
              <RefundOrderForm
                onConfirm={handleRefund}
                status={returnRefundRef.current}
                onClose={() => setIsRefundOpen(false)}
                orderDetails={orderDetailsRef.current}
              />
            }
          />
        ) : null}

        {isDisputeOpen ? (
          <Modal
            open={isDisputeOpen}
            onClose={() => setIsDisputeOpen(false)}
            form={<DisputeOrderForm onConfirm={handleDispute} />}
          />
        ) : null}

        {isManualRefundOpen ? (
          <Modal
            open={isManualRefundOpen}
            onClose={() => setIsManualRefundOpen(false)}
            form={<ManualRefundOrderForm onConfirm={handleManualRefund} />}
          />
        ) : null}

        {isConfirmOrder ? (
          <Modal
            open={isConfirmOrder}
            onClose={() => setIsConfirmOrder(false)}
            form={
              <ConfirmOrderForm
                onConfirm={handleConfirmation}
                onClose={() => setIsConfirmOrder(false)}
                orderDetails={orderDetailsRef.current}
              />
            }
          />
        ) : null}
        <div className="min-h-screen text-gray-900 bg-white">
          <main className="px-4 pt-4 mx-auto sm:px-6 lg:px-8">
            {orderStatus && timeSlot && (
              <SearchOrderForm
                onConfirm={getDataWithSearchForm}
                onReset={handleReset}
                orderStatus={orderStatus}
                timeSlot={timeSlot}
                selectedValues={orderFilters}
                paymentStatus={paymentStatus}
                paymentType={paymentType}
              />
            )}
            <div className="flex items-center justify-end mb-4">
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
}
export default OrdersTable;


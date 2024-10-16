import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import Table, { SelectColumnFilter } from '../Table'
import {
    ApiCalls, AdminApis, HttpStatus, Messages
} from '../../../../utils';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';
import { useNavigate } from "react-router-dom";
import { AdminRoutes } from '../../../../../Routes';
import { Modal, Button } from '../../../generic';
import {
    CancelOrderForm, RefundOrderForm,
    SearchOrderForm, DisputeOrderForm, ConfirmOrderForm
} from './OrdersForm';
import { toast } from 'react-toastify';
import { isConfirmEligible, isCancelEligible, isRefundEligible, isDisputeEligible } from './OrdersUtils';
import Loader from '../../../../../utils/loader';

const OrdersLateTable = () => {
    const [orderStatus, setOrderStatus] = useState([]);
    const [timeSlot, setTimeSlot] = useState([]);
    const [cancelReasons, setCancelReasons] = useState([]);
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [isRefundOpen, setIsRefundOpen] = useState(false);
    const [isDisputeOpen, setIsDisputeOpen] = useState(false);
    const [isConfirmOrder, setIsConfirmOrder] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState([]);
    const [paymentType, setPaymentType] = useState([]);
    const [tableData, setTableData] = useState({
        data: null,
        pageCount: 0
    });
    const auth = useAuth();
    const navigate = useNavigate();
    const orderIDRef = useRef(null);
    const searchRef = useRef({}); //To store search form data for pagination
    const returnRefundRef = useRef();
    const orderDetailsRef = useRef({});
    const filtersRef = useRef({
        slug: null,
    });
    const [isDownloading, setIsDownloading] = useState(false);

    const getData = useCallback(async (page, records, searchForm) => {
        const formData = new FormData();
        if (page) {
            formData.append("page", page);
        }
        if (records) {
            formData.append("list_length", records);
        }
        if (searchForm) {
            for (const [key, value] of searchForm.entries()) {
                if (value !== '') {
                    searchRef.current[key] = value;
                    formData.append(key, value);

                }
            }
        } else {
            for (const [key, value] of Object.entries(searchRef.current)) {
                if (value !== '') {
                    formData.append(key, value);
                }
            }
        }
        let url = `${AdminApis.orderList}late-deliveries/`
        if (filtersRef.current.slug) {
            url = `${AdminApis.orderList}${filtersRef.current.slug}/`
        }
        await ApiCalls(url, "POST", formData, false, auth.token.access)
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
                    if (paymentStatus.length === 0) {
                      setPaymentStatus(response.data.payment_status);
                    }
                    if (paymentType.length === 0) {
                      setPaymentType(response.data.payment_type);
                    }
                }

            }).catch(error => {
                showToast(error.response.data.message, "error", "order-list-error")
            });
    }, [auth, orderStatus.length, timeSlot.length, cancelReasons.length]);


    useEffect(() => {
        getData();
    }, []);

    const columns = useMemo(() => [
        {
            Header: "Order Number",
            accessor: 'order_number',
            Cell: (props) => (
                <>
                    <div className="text-sm text-gray-500 whitespace-normal underline">
                        <a href={AdminRoutes.ManageOrders + "/" + props.row.original.id_order}>
                            {props.row.original.order_number}
                        </a>
                    </div>
                </>
            ),
        },
        {
            Header: "Buyer Email",
            accessor: 'buyer_email',
            Filter: () => (
                <SelectColumnFilter
                    column={{ id: "Slug", render: "OrderType:" }}
                    choices={[
                        { "value": "late-deliveries", "label": "Late Deliveries", },
                        { "value": "not-delivered", "label": "Not Delivered", },
                    ]}
                    initialValue={filtersRef.current.slug}
                    onFilterChange={filterValue => {
                        filtersRef.current.slug = filterValue;
                        getData();
                    }}
                    custom={true}
                    all={false}
                />
            ),
        },
        {
            Header: "Total Paid",
            accessor: 'formatted_total_paid',
        },
        {
            Header: "Payment Type",
            accessor: 'payment_type',
        },
        {
            Header: "Payment Status",
            accessor: 'order_payment',
        },
        {
            Header: "Order Status",
            accessor: 'order_delivery',
        },
        {
            Header: "Delivery Type",
            accessor: 'seller_detail.delivery_method',
        },
        {
            Header: "Pickup Date/Time",
            Cell: (props) => (
                <>
                    <div className='whitespace-nowrap'>
                        <div>{props.row.original.seller_detail.pickup_date}</div>
                        <div className="mt-2">{props.row.original.seller_detail.pickup_time}</div>
                    </div>
                </>
            ),
        },
        {
            Header: "Delivery Date/Time",
            Cell: (props) => (
                <>
                    <div className='whitespace-nowrap'>
                        <div>{props.row.original.seller_detail.delivery_date}</div>
                        <div className="mt-2">{props.row.original.seller_detail.delivery_time}</div>
                    </div>
                </>
            ),
        },
        {
            Header: "Created On",
            accessor: "created_date",
            Cell: ({ cell: { value } }) => (
                <div className="text-sm text-gray-500 whitespace-normal">{value}</div>
            ),
        },
        {
            Header: "Action",
            Cell: (props) => (
                <>
                    <Button
                        text="View"
                        onClick={() => navigate(AdminRoutes.ManageOrders + "/" + props.row.original.id_order)}
                        type="view"
                    />
                    {isCancelEligible(props.row.original) &&
                        <Button
                            text="Cancel"
                            onClick={() => {
                                orderIDRef.current = props.row.original.id_order;
                                setIsCancelOpen(true);
                            }}
                            type="Reject"
                        />
                    }
                    {isConfirmEligible(props.row.original) &&
                        <Button
                            text="Confirm"
                            onClick={() => {
                                orderIDRef.current = props.row.original.id_order;
                                orderDetailsRef.current["Delivery Date"] = props.row.original.seller_detail.delivery_date;
                                orderDetailsRef.current["Delivery Time"] = props.row.original.seller_detail.delivery_time;
                                orderDetailsRef.current["Delivery Type"] = props.row.original.seller_detail.delivery_method;
                                setIsConfirmOrder(true);
                            }}
                            type="transparent-green"
                        />
                    }
                    {isRefundEligible(props.row.original) &&
                        <>
                            <Button
                                text="Approve"
                                onClick={() => {
                                    orderIDRef.current = props.row.original.id_order;
                                    orderDetailsRef.current["Refund Amount"] = props.row.original.formatted_total_paid;
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
                    }
                    {isDisputeEligible(props.row.original) &&
                        <Button
                            text="Dispute"
                            onClick={() => {
                                orderIDRef.current = props.row.original.id_order;
                                setIsDisputeOpen(true);
                            }}
                            type="transparent-blue"
                        />
                    }
                </>
            ),
        },
    ], [navigate, getData])

    //Handle CSV Download
    const onDownloadHandler = async () => {
        setIsDownloading(true)
        await ApiCalls(`${AdminApis.orderExport}${"confirmed-not-delivered"}/`, "GET", null, true, auth.token.access)
            .then((response) => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    const fileUrl = response.data.data.file_url;
                    if (fileUrl) {
                        window.location.href = fileUrl
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
        await toast.promise(
            ApiCalls(AdminApis.orderCancel, "POST", formData, false, auth.token.access),
            {
                pending: {
                    render() {
                        return "Loading..."
                    },
                },
                success: {
                    render({ data }) {
                        setIsCancelOpen(false);
                        getData();
                        return data.data.message
                    },
                },
                error: {
                    render({ data }) {
                        return data.data.message
                    },
                },
            },
        )
    }

    const handleRefund = async (formData, action) => {
        formData.append("id_order", orderIDRef.current);
        let url = AdminApis.orderRefund;
        url += `${action}/`;
        await toast.promise(
            ApiCalls(url, "POST", formData, false, auth.token.access),
            {
                pending: {
                    render() {
                        return "Loading..."
                    },
                },
                success: {
                    render({ data }) {
                        setIsRefundOpen(false);
                        getData();
                        return data.data.message
                    },
                },
                error: {
                    render({ data }) {
                        return data.data.message
                    },
                },
            },
        )
    }

    const handleDispute = async (formData, action) => {
        let url = AdminApis.orderDispute;
        url += `${action}/`;

        formData.append("id_order", orderIDRef.current);
        await toast.promise(
            ApiCalls(url, "POST", formData, false, auth.token.access),
            {
                pending: {
                    render() {
                        return "Loading..."
                    },
                },
                success: {
                    render({ data }) {
                        setIsDisputeOpen(false);
                        getData();
                        return data.data.message
                    },
                },
                error: {
                    render({ data }) {
                        return data.data.message
                    },
                },
            },
        )
    }

    const handleConfirmation = async (formData) => {
        formData.append("id_order", orderIDRef.current);
        await toast.promise(
            ApiCalls(AdminApis.orderConfirm, "POST", formData, false, auth.token.access),
            {
                pending: {
                    render() {
                        return "Loading..."
                    },
                },
                success: {
                    render({ data }) {
                        setIsConfirmOrder(false);
                        getData();
                        return data.data.message
                    },
                },
                error: {
                    render({ data }) {
                        return data.data.message
                    },
                },
            },
        )
    }

    const getDataWithSearchForm = (formData) => {
        getData(null, null, formData);
    }

    const handleReset = () => {
        searchRef.current = {};
    }

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

        {isConfirmOrder ? (
          <Modal
            open={isConfirmOrder}
            onClose={() => setIsConfirmOrder(false)}
            form={
              <ConfirmOrderForm
                onConfirm={handleConfirmation}
                onClose={() => setIsConfirmOrder(false)}
                orderDetails={orderDetailsRef.current}
                timeSlot={timeSlot}
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
export default OrdersLateTable;
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Modal } from "../GenericComponents";
import payOnDelivery from "../../../assets/buyer/payOnDelivery.png";
import uParcel from "../../../assets/uParcelLogo.png";
import shipDelivered from "../../../assets/seller/order_detail/ship_delivered.svg";
import returnIcon from "../../../assets/seller/order_detail/return_icon.svg";
import cancelIcon from "../../../assets/buyer/orderStatus/cancelIcon.svg";
import { CustomerRoutes } from "../../../Routes";
import ls from "local-storage";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import { AiOutlineShop } from "react-icons/ai";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import productImg2 from "../../../assets/buyer/productImg2.png";
import { FaQuestionCircle } from "react-icons/fa";
import { ORDER_CONSTANTS } from "../../../constants/order_status";
import successGif from "../../../assets/success.gif";
import { AiFillWarning } from "react-icons/ai";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import {
  ProgressTracker,
  ProgressNotifBanner,
} from "../../../constants/OrdersProgression.js";
import BuyerCancelOrderPopup from "../StatusUpdatePopups/CancelOrderPopup";
import { ProgressLabels } from "../../../constants/ProgressConstants";
import BuyerReturnOrderPopup from "../StatusUpdatePopups/ReturnOrderPopup";
import MarkReceivedOrderPopup from "../StatusUpdatePopups/MarkReceivedPopup";
import { PageLoader } from "../../../utils/loader.js";
import RateReviewPopup from "../StatusUpdatePopups/RateReviewPopup";
import BuyerRefundReqPopup from "../StatusUpdatePopups/RefundRequestPopup";
import ChatComponent from "../../../components/chat/chat.js";
import { USER_TYPE } from "../../../constants/general.js";
import ChangeAddressForm from "../formComponents/modalForms/ChangeAddressForm.jsx";

//css
const titleCss = "border-y priceKey text-sm";
const valueCss = "border-y border-l priceValue text-sm";

export default function OrderDetailsComponent() {
  const [isOrderDetailLoading, setIsOrderDetailLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderStatusDetails, setOrderStatusDetails] = useState({});
  const [isOpen, setisOpen] = useState(false);
  const [isCancelOrderShow, setIsCancelOrderShow] = useState(false);
  const [isReturnPopupShow, setIsReturnPopupShow] = useState(false);
  const [showMarkReceived, setShowMarkReceived] = useState(false);
  const [isShowMsg, setIsShowMsg] = useState(false);
  const [message, setMessage] = useState({});
  const [isReviewPopupShow, setIsReviewPopupShow] = useState(false);
  const [productIndex, setProductIndex] = useState(0);
  const [isRefundPopupShow, setIsRefundPopupShow] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [viewDetail, setviewDetail] = useState(false);
  const [isPaymentStatusKey, setIsPaymentStatusKey] = useState(false);
  const [isChangeAddressOpen, setIsChangeAddressOpen] = useState(false);
  const [shouldRefetch, setShouldRefetch] = useState(false); // when the delivery address is changed need to refetch updated address

  const navigate = useNavigate();
  const params = useParams();
  const user = JSON.parse(localStorage.getItem("customer"));

  const processResponse = (res, api) => {
    if (res.data) {
      var order = res.data.data;

      if (order?.return_window_date) {
        let isReturnAvailable =
          new Date() <= new Date(order?.return_window_date);

        order = { ...order, isReturnAvailable: isReturnAvailable };
      }

      const statusKey =
        order?.payment_status_id === ORDER_CONSTANTS.GENERALSTATUS_REFUNDED &&
        (order?.delivery_status_id ===
          ORDER_CONSTANTS.GENERALSTATUS_DELIVERED ||
          order?.delivery_status_id ===
            ORDER_CONSTANTS.GENERALSTATUS_ORDER_RECEIVED);

      let idToCheck = statusKey
        ? order.payment_status_id
        : order.delivery_status_id;
      const status = ProgressLabels.find((item) => item.id === idToCheck);

      setOrderDetails(order);
      setOrderStatusDetails(status);
      setIsPaymentStatusKey(statusKey);
      setIsOrderDetailLoading(false);
    }
  };

  const retrieveOrder = () => {
    setIsOrderDetailLoading(true);
    const formData = new FormData();
    formData.append("order_number", params.orderNumber);
    BuyerApiCalls(
      formData,
      Apis.orderDetails,
      "POST",
      {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${user?.access}`,
      },
      processResponse
    );
  };

  useEffect(() => {
    retrieveOrder();
    setShouldRefetch(false);
  }, [shouldRefetch]);

  const showPriceBreakdown = () => {
    setisOpen(!isOpen);
  };

  const onStatusUpdateComplete = (res, api) => {
    setMessage(res.data);
    setIsShowMsg(true);

    retrieveOrder();

    setTimeout(() => {
      setIsShowMsg(false);
      setMessage({});
    }, 2000);
  };

  const toggleReturnPopup = () => {
    setIsReturnPopupShow(!isReturnPopupShow);
  };

  const toggleRefundPopup = () => {
    setIsRefundPopupShow(!isRefundPopupShow);
  };

  const showReviewPopup = (index) => {
    setIsReviewPopupShow(true);
    setProductIndex(index);
  };

  const formatDateAndTime = (dateAndTime) => {
    var dateAndTimeArray = dateAndTime.split(",");
    var date = dateAndTimeArray[0];
    var startEndTime = dateAndTimeArray[1];
    var startEndTimeArray = startEndTime.split("-");
    for (let time in startEndTimeArray) {
      if (startEndTimeArray[time].startsWith(" ")) {
        startEndTimeArray[time] = startEndTimeArray[time].trimStart();
      }
      if (startEndTimeArray[time].startsWith("0")) {
        startEndTimeArray[time] = startEndTimeArray[time].substring("1");
      }
    }
    if (startEndTimeArray.length > 1) {
      return date + " , " + startEndTimeArray[0] + " - " + startEndTimeArray[1];
    } else {
      return date + " , " + startEndTimeArray[0];
    }
  };

  const closeChat = () => setIsChatOpen(false);

  const openChat = () => {
    let dataToPass = {
      userType: USER_TYPE[1],
      receiverType: USER_TYPE[2],
      buyerId: user?.user_id,
      shopSlug: orderDetails?.seller_detail?.shop_slug,
      sellerId: orderDetails?.seller_detail?.user_id,
      shopName: orderDetails?.seller_detail?.shop_name,
    };

    ls("chatData", JSON.stringify(dataToPass));

    const newTab = window.open(CustomerRoutes.ChatScreen, "_blank");
    if (newTab) newTab.focus();
    // navigate(CustomerRoutes.ChatScreen, {
    //   state: {
    //     userType: USER_TYPE[1],
    //     receiverType: USER_TYPE[2],
    //     buyerId: user?.user_id,
    //     shopSlug: orderDetails?.seller_detail?.shop_slug,
    //   },
    // });
    // setIsChatOpen(true)
  };

  const downloadReceipt = () => {
    const formData = new FormData();
    let orderReceiptApi = `${Apis.downloadReceipt}${params.orderNumber}/`;
    console.log("orderReceiptApi ", orderReceiptApi);
    BuyerApiCalls(
      formData,
      orderReceiptApi,
      "GET",
      {
        Authorization: `Bearer ${user?.access}`,
        "Content-Type": "application/pdf",
      },
      (res, api) => {
        var link = document.createElement("a");
        link.href = res.data.data.invoice_url;
        link.target = "_blank";
        link.click();
      }
    );
  };

  return (
    <>
      {isOrderDetailLoading ? (
        <PageLoader />
      ) : (
        /*<div className="md:mx-20">
          <div className="flex flex-cols-2 gap-8 pt-4 ">
            <div className="flex flex-col divide-y-2 px-4  mb-5"> */
        <div className="sm:mx-20 relative">
          <div className="flex flex-col divide-y-2 px-4  mt-5">
            <ul className="list-none">
              <li className="inline">
                <a href={CustomerRoutes.Landing} className="!text-[#828282]">
                  Home&nbsp;/&nbsp;
                </a>
              </li>
              <li className="inline">
                <a
                  href={CustomerRoutes.ViewOrder.replace(":tab", "all")}
                  className="!text-[#828282]"
                >
                  My Orders&nbsp;/&nbsp;
                </a>
              </li>
              <li className="inline">
                <a href=" " className="!text-[#4F4F4F]">
                  Details
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-cols-2 gap-4 sm:gap-8 pt-4 ">
            <div className="sm:w-64"></div>
            <div className="flex flex-row basis-3/4 justify-between">
              <p className="font-bold text-[14px] whitespace-nowrap sm:text-xl">
                Order Details
              </p>
              <div className="hidden sm:flex gap-3">
                <div className="border-solid border-[#f5ab35] h-10 py-2 px-4 border mb-4 rounded">
                  <button
                    onClick={(e) => navigate(-1)}
                    className="text-center whitespace-nowrap text-[14px] font-['Poppins'] font-medium text-[#f5ab35] relative"
                  >
                    {"<"}&nbsp;Back
                  </button>
                </div>
                {orderDetails?.delivery_status_id ===
                  ORDER_CONSTANTS.GENERALSTATUS_PENDING_CONFIRMATION && (
                  <div className="border-solid border-[#f5ab35] h-10 p-2 border mb-4 rounded">
                    <button
                      onClick={(e) => setIsCancelOrderShow(!isCancelOrderShow)}
                      className="text-center whitespace-nowrap text-[14px] font-['Poppins'] font-medium text-[#f5ab35] relative"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
                {orderDetails?.delivery_status_id ===
                  ORDER_CONSTANTS.GENERALSTATUS_DELIVERED &&
                  !isPaymentStatusKey && (
                    <div className="border-solid border-[#f5ab35] h-10 p-2 border rounded">
                      <button
                        onClick={(e) => setShowMarkReceived(!showMarkReceived)}
                        className="text-center whitespace-nowrap text-[14px] font-['Poppins'] font-medium text-[#f5ab35] relative"
                      >
                        Mark Received
                      </button>
                    </div>
                  )}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row flex-1 gap-[22px] pb-4">
            <div>
              <div className="max-sm:hidden">
                {orderDetails && (
                  <ProgressTracker
                    progressPath={
                      isPaymentStatusKey
                        ? orderDetails?.payment_status
                        : orderDetails?.order_status
                    }
                    currentStep={orderDetails?.delivery_status_id}
                    isBuyer={true}
                    order={orderDetails}
                    viewDetail={true}
                  />
                )}
              </div>
              <div className="hidden md:flex flex-col mt-4">
                {orderStatusDetails?.id ===
                ORDER_CONSTANTS.GENERALSTATUS_PENDING_CONFIRMATION ? (
                  <div
                    className="flex flex-row gap-2 items-center mb-3 cp"
                    onClick={(e) => setIsCancelOrderShow(!isCancelOrderShow)}
                  >
                    <img
                      src={cancelIcon}
                      alt=""
                      className="w-[20px] h-[20px] "
                    ></img>
                    <p>Cancel</p>
                  </div>
                ) : (
                  <>
                    {((orderStatusDetails?.id ===
                      ORDER_CONSTANTS.GENERALSTATUS_DELIVERED &&
                      orderDetails?.isReturnAvailable) ||
                      orderStatusDetails?.id ===
                        ORDER_CONSTANTS.GENERALSTATUS_ORDER_DELIVERY_FAILED) &&
                    !isPaymentStatusKey ? (
                      <div
                        className="flex flex-row gap-2 items-center mb-3 cp"
                        onClick={
                          orderStatusDetails?.id ===
                          ORDER_CONSTANTS.GENERALSTATUS_DELIVERED
                            ? toggleReturnPopup
                            : toggleRefundPopup
                        }
                      >
                        <img
                          src={returnIcon}
                          alt=""
                          className="w-[20px] h-[20px] "
                        ></img>
                        <p>
                          {orderStatusDetails?.id ===
                          ORDER_CONSTANTS.GENERALSTATUS_DELIVERED
                            ? "Return/Refund"
                            : "Refund"}
                        </p>
                      </div>
                    ) : null}
                  </>
                )}

                <div
                  className="flex flex-row gap-2 items-center cp"
                  onClick={() =>
                    navigate(CustomerRoutes.Help.replace(":tab", "contact-us"))
                  }
                >
                  <FaQuestionCircle
                    className="icon site-primary-color"
                    fontSize="18px"
                  />
                  <p className="content-text ">Need Help?</p>
                </div>
              </div>
            </div>

            {orderDetails?.order_delivery ? (
              <div className="flex-col flex-1 border-[1px] border-solid border-gray-300  p-4 rounded-lg">
                <ProgressNotifBanner
                  progressStep={orderStatusDetails?.id}
                  order={orderDetails}
                />
                <button
                  onClick={() => setviewDetail(!viewDetail)}
                  className="text-sm mt-4 font-bold underline visible sm:hidden"
                >
                  View Details
                </button>
                <div className="md:hidden">
                  {orderDetails && viewDetail && (
                    <ProgressTracker
                      progressPath={
                        isPaymentStatusKey
                          ? orderDetails?.payment_status
                          : orderDetails?.order_status
                      }
                      currentStep={orderDetails?.delivery_status_id}
                      isBuyer={true}
                      order={orderDetails}
                      viewDetail={viewDetail}
                    />
                  )}
                </div>
                <div
                  className={`flex my-5 ${
                    orderDetails?.order_delivery === "Delivered"
                      ? "justify-between"
                      : "start"
                  } items-center flex-wrap`}
                >
                  <div className="flex flex-row mr-2 justify-between w-full flex-wrap">
                    <div className="flex flex-row mr-2">
                      <p className="text-[14px] italic font-semibold">
                        Order Number : &nbsp;
                      </p>
                      <p className="inline text-[14px] italic font-semibold text-darkOrange">
                        # &nbsp;{orderDetails?.order_number}
                      </p>
                    </div>
                    {orderDetails?.delivery_status_id ===
                      ORDER_CONSTANTS.GENERALSTATUS_PENDING_CONFIRMATION && (
                      <div
                        className="flex flex-row gap-2 items-center cp"
                        onClick={() =>
                          navigate(
                            CustomerRoutes.Help.replace(":tab", "contact-us")
                          )
                        }
                      >
                        <FaQuestionCircle
                          className="icon site-primary-color"
                          fontSize="18px"
                        />
                        <p className="content-text ">Need Help?</p>
                      </div>
                    )}

                    {orderDetails?.delivery_status_id ===
                      ORDER_CONSTANTS.GENERALSTATUS_DELIVERED && (
                      <div className="flex flex-row mr-2 items-center">
                        <p className="text-[14px] italic font-semibold">
                          Delivery Partner : &nbsp;
                        </p>
                        <img src={uParcel} alt="" />
                      </div>
                    )}
                    {orderDetails?.tracking_number && (
                      <div
                        className="flex flex-row mr-2 cp"
                        onClick={() =>
                          window.open(orderDetails?.tracking_url, "_blank")
                        }
                      >
                        <p className="text-[14px] italic font-semibold">
                          Tracking Code : &nbsp;
                        </p>
                        <p className="inline text-[14px] italic font-semibold text-darkOrange">
                          {orderDetails?.tracking_number}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-1 w-full">
                  <div className="flex flex-col  w-full gap-2 mb-2">
                    {orderDetails?.product_item?.map((product, index) => {
                      return (
                        <div className="flex flex-row justify-between relative w-full items-center flex-wrap mb-2">
                          <div
                            className="flex gap-3 items-center cp"
                            onClick={() => {
                              if (product.slug !== null)
                                navigate(
                                  CustomerRoutes.ProductDetails +
                                    product.slug +
                                    "/"
                                );
                            }}
                          >
                            <img
                              src={
                                product.thumbnail_img
                                  ? product.thumbnail_img
                                  : productImg2
                              }
                              alt=""
                              className="min-h-0 min-w-0 relative w-16 shrink-0"
                            />
                            <div className=" font-['Poppins'] text-[14px] sm:text-[16px] font-bold text-[#282828] relative shrink-0 w-44">
                              {product?.product_detail.name}
                            </div>
                          </div>
                          <div className="text-[12px] sm:text-[14px] font-['Poppins'] leading-[24px] w-24 text-[#828282] capitalize relative shrink-0">
                            {product.product_detail.variation?.length > 0
                              ? product.product_detail.variation.map(
                                  (variation) => {
                                    return (
                                      <div className="flex gap-2">
                                        <p>{variation.variation_name}:</p>
                                        <p>{variation.variation_value}</p>
                                      </div>
                                    );
                                  }
                                )
                              : null}
                          </div>
                          <div className="text-[12px] sm:text-[16px] whitespace-nowrap font-['Poppins'] text-[#828282] relative shrink-0 w-32">
                            Qty: {product?.quantity}
                          </div>
                          <div className="whitespace-nowrap  font-['Poppins'] w-11 font-semibold leading-[28.5px] text-[#f2994a] relative shrink-0 mr-2 text-[16px] ">
                            ${" "}
                            {(product?.unit_price * product?.quantity).toFixed(
                              2
                            )}
                          </div>
                          {(orderDetails.delivery_status_id ===
                            ORDER_CONSTANTS.GENERALSTATUS_DELIVERED ||
                            orderDetails.delivery_status_id ===
                              ORDER_CONSTANTS.GENERALSTATUS_ORDER_RECEIVED) &&
                            (!product?.already_rate ? (
                              <p
                                className="text-[#F2994A] underline cp"
                                onClick={(_) => showReviewPopup(index)}
                              >
                                Write a review
                              </p>
                            ) : (
                              <p className="text-[#F2994A]">Already Rated</p>
                            ))}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="px-4 pb-10 pt-5 text-slate-500">
                  {orderDetails?.buyer_return_request ? (
                    <section className="flex flex-col items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-[8px] h-[8px] border bg-slate-400 rounded-full"></div>
                        <p className="my-2 capitalize text-slate-400 text-sm">
                          Order Date & Time:{" "}
                          <span className="text-black text-sm">
                            {orderDetails?.created_date_formated &&
                              formatDateAndTime(
                                orderDetails?.created_date_formated
                              )}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-[8px] h-[8px] border bg-slate-400 rounded-full"></div>
                        {orderDetails.delivery_status_id ===
                          ORDER_CONSTANTS.GENERALSTATUS_ORDER_REFUND_REJECT && (
                          <>
                            <p className="my-2 text-slate-400 text-sm">
                              Order Refund Rejected : &nbsp;
                              <span className="text-black text-sm">
                                {
                                  orderDetails?.order_status?.find(
                                    (item) =>
                                      item?.status_id ===
                                      ORDER_CONSTANTS.GENERALSTATUS_ORDER_REFUND_REJECT
                                  )?.created_date
                                }
                              </span>
                            </p>
                          </>
                        )}
                        {orderDetails.delivery_status_id ===
                          ORDER_CONSTANTS.GENERALSTATUS_ORDER_RETURN_REQUESTED && (
                          <>
                            <p className="my-2 text-slate-400 text-sm">
                              Order Return Requested :
                              <span className="text-black text-sm">
                                {
                                  orderDetails?.buyer_return_request
                                    ?.created_date
                                }
                              </span>
                            </p>
                          </>
                        )}
                        {orderDetails.delivery_status_id ===
                          ORDER_CONSTANTS.GENERALSTATUS_ORDER_REFUND_COMPLETED && (
                          <>
                            <p className="my-2 text-slate-400 text-sm">
                              Order Refund Completed :
                              <span className="text-black text-sm">
                                {
                                  orderDetails?.order_status?.find(
                                    (item) =>
                                      item?.status_id ===
                                      ORDER_CONSTANTS.GENERALSTATUS_ORDER_REFUND_COMPLETED
                                  )?.created_date
                                }
                              </span>
                            </p>
                          </>
                        )}
                        {orderDetails.delivery_status_id ===
                          ORDER_CONSTANTS.GENERALSTATUS_DISPUTE && (
                          <>
                            <p className="my-2 text-slate-400 text-sm">
                              Order in Dispute : &nbsp;
                              <span className="text-black text-sm">
                                {
                                  orderDetails?.order_status?.find(
                                    (item) =>
                                      item?.status_id ===
                                      ORDER_CONSTANTS.GENERALSTATUS_DISPUTE
                                  )?.created_date
                                }
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </section>
                  ) : (
                    <>
                      <>
                        {orderDetails?.seller_detail?.schedule_label && (
                          <div className="flex gap-2 mb-2">
                            <img src={shipDelivered} alt="" />
                            <p className="text-slate-400 text-sm">
                              {orderDetails?.seller_detail?.schedule_label}
                            </p>
                          </div>
                        )}
                      </>
                      <section className="flex flex-col items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-[8px] h-[8px] border bg-slate-400 rounded-full"></div>
                          <p className="my-2 capitalize text-slate-400 text-sm">
                            Order Date & Time:{" "}
                            <span className="text-black text-sm">
                              {orderDetails?.created_date_formated &&
                                formatDateAndTime(
                                  orderDetails?.created_date_formated
                                )}
                            </span>
                          </p>
                        </div>

                        {orderDetails?.seller_detail?.delivery_date_end ? (
                          <div className="my-2 flex items-center gap-2">
                            <div className="w-[8px] h-[8px] border bg-slate-400 rounded-full"></div>
                            <p className=" text-slate-400 text-sm">
                              Expected to arrive between :{" "}
                              <span className="text-black">
                                {
                                  orderDetails?.seller_detail
                                    ?.delivery_date_formated
                                }
                              </span>{" "}
                              to{" "}
                              <span className="text-black">
                                {orderDetails?.seller_detail?.delivery_date_end
                                  .split("-")
                                  .reverse()
                                  .join("-")}
                              </span>
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-[8px] h-[8px] border bg-slate-400 rounded-full"></div>
                            <p className="my-2 text-slate-400 text-sm">
                              Order Delivery Date & Time:{" "}
                              <span className="text-black text-sm">
                                {formatDateAndTime(
                                  orderDetails?.seller_detail
                                    ?.delivery_datetime_formated
                                )}
                              </span>
                            </p>
                          </div>
                        )}

                        <p className="text-black mt-2 text-sm">
                          <span className="font-semibold">Remarks: </span>
                          {orderDetails?.seller_detail?.delivery_remark ??
                            "N/A"}
                        </p>
                      </section>
                    </>
                  )}
                  <div className="border-4 my-4 "></div>

                  {/* reason for refund section  */}
                  {orderDetails?.buyer_return_request && (
                    <>
                      <section className="flex flex-col gap-4 ">
                        <p className="text-black font-bold">
                          Reason For Return/Refund
                        </p>
                        <p className="text-sm">
                          {orderDetails?.buyer_return_request
                            ?.return_request_reason ?? ""}
                        </p>
                        {orderDetails?.refund_detail?.total_refund_amount && (
                          <div className="flex justify-between items-center">
                            <p className="text-sm text-black">
                              Total Refund Amount
                            </p>
                            <p className="text-orangeButton text-[20px] mr-3">
                              $
                              {orderDetails?.refund_detail?.total_refund_amount}
                            </p>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                          {orderDetails?.buyer_return_request?.other_detail?.product_img?.map(
                            (item, index) => {
                              return (
                                <div className="h-20 w-20 p-4 border rounded-md">
                                  <img
                                    key={index}
                                    src={item.file_url}
                                    alt=""
                                    height="80px"
                                    width="80px"
                                  />
                                </div>
                              );
                            }
                          )}
                        </div>
                      </section>

                      <div className="border-4 my-4 "></div>
                    </>
                  )}

                  {/* reason for refund rejection  */}
                  {orderDetails?.seller_refund_response && (
                    <>
                      <section className="flex flex-col gap-4 ">
                        <p className="text-black font-bold">
                          Reason For Rejection
                        </p>
                        <p className="text-sm">
                          {orderDetails?.seller_refund_response?.remarks ??
                            "No remarks added"}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {orderDetails?.seller_refund_response?.other_detail?.product_img?.map(
                            (item, index) => {
                              return (
                                <div className="h-20 w-20 p-4 border rounded-md">
                                  <img
                                    key={index}
                                    src={item.file_url}
                                    alt=""
                                    height="80px"
                                    width="80px"
                                  />
                                </div>
                              );
                            }
                          )}
                        </div>
                      </section>

                      <div className="border-4 my-4 "></div>
                    </>
                  )}

                  {/* delivery address section */}
                  <section className="flex flex-col gap-4 ">
                    <div className="flex justify-between items-center">
                      <p className="text-black font-bold">Delivery Address</p>
                      {orderDetails?.delivery_status_id ===
                        ORDER_CONSTANTS.GENERALSTATUS_PENDING_CONFIRMATION && (
                        <button
                          className="text-[#F5AB35] text-sm font-medium font-['Poppins'] py-[5px] px-4 rounded border border-[#BFBFBF]"
                          onClick={() =>
                            setIsChangeAddressOpen((prev) => !prev)
                          }
                        >
                          Change
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <p className="inline text-black font-semibold text-sm">
                        {Object.keys(orderDetails).length > 0 &&
                          orderDetails["shipping_address"]["full_name"]}
                      </p>
                      <p className="inline px-6 text-black font-semibold text-sm">
                        {Object.keys(orderDetails).length > 0 &&
                          orderDetails["shipping_address"]["contact_number"]}
                      </p>
                    </div>

                    <p className=" text-sm">
                      {Object.keys(orderDetails).length > 0 &&
                        orderDetails["shipping_address"]["address_details"]}
                      , #{" "}
                      {Object.keys(orderDetails).length > 0 &&
                        orderDetails["shipping_address"]["unit_number"]}
                      ,{" "}
                      {Object.keys(orderDetails).length > 0 &&
                        orderDetails["shipping_address"]["postal_code"]}
                    </p>
                  </section>
                  {/* refund section */}
                  {Object.keys(orderDetails).length > 0 &&
                    orderDetails?.refund_detail?.total_refund_amount && (
                      <div>
                        <div className="border-4 my-4 "></div>
                        <section className="flex flex-col gap-2 text-black text-sm">
                          <p className="font-bold text-base">Refund Details</p>
                          <p>
                            Reason :{" "}
                            {orderDetails?.refund_detail?.reason ?? "N/A"}
                          </p>
                          <p>
                            Remarks :{" "}
                            {orderDetails?.refund_detail?.remarks ?? "N/A"}
                          </p>
                          <p>
                            Refund Amount : $
                            {orderDetails?.refund_detail?.total_refund_amount}
                          </p>
                          <p>Refund To : {orderDetails?.payment_type}</p>
                        </section>
                      </div>
                    )}

                  <div className="border-4 my-4 "></div>
                  <section className="py-2 flex justify-between">
                    <div className="flex flex-col gap-2">
                      <p className="text-black font-bold">Total Order price</p>
                      {orderDetails?.formatted_total_discount !== "0.00" && (
                        <p>
                          You saved ${orderDetails?.formatted_total_discount} in
                          this order
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <p className="text-orangeButton text-[20px]">
                        ${orderDetails?.formatted_total_paid}
                      </p>
                      <button
                        onClick={() => showPriceBreakdown()}
                        className="underline text-black font-semibold text-sm"
                      >
                        View break price
                      </button>
                    </div>
                  </section>
                  <div className="flex items-center justify-between mr-2">
                    <div className="flex items-center my-4">
                      <img
                        src={payOnDelivery}
                        className="pt-2 h-8 w-fit"
                        alt=""
                      />
                      <span className="text-black ml-2 text-sm">
                        {orderDetails["payment_type"]}
                      </span>
                    </div>
                    {orderDetails?.delivery_status_id ===
                      ORDER_CONSTANTS.GENERALSTATUS_DELIVERED && (
                      <p
                        className="text-orangeButton border border-orangeButton border-[4px] cp font-semibold py-1 px-3 my-4"
                        onClick={downloadReceipt}
                      >
                        E-Receipt
                      </p>
                    )}
                  </div>
                  <p className="text-black text-sm">
                    Payment Reference ID :{" "}
                    <span className="font-bold">
                      {orderDetails?.stripe_payment_intent}
                    </span>
                  </p>
                  {isOpen && (
                    <div className="flex flex-col gap-4 w-full place-self-end">
                      <table className="text-end ">
                        <tr>
                          <td className={titleCss}>Product Cost</td>
                          <td className={valueCss}>
                            $ {orderDetails.formatted_order_total}
                          </td>
                        </tr>
                        <tr>
                          <td className={titleCss}>Shipping Fee</td>
                          <td className={valueCss}>
                            $ {orderDetails.formatted_total_shipping}
                          </td>
                        </tr>
                        <tr>
                          <td className={titleCss}>Voucher Discount</td>
                          <td className={`${valueCss} `}>
                            - $ {orderDetails.formatted_total_discount}
                          </td>
                        </tr>
                        <tr>
                          <td className={titleCss}>Applied Cashback</td>
                          <td className={`${valueCss} `}>
                            - $ {orderDetails.formatted_applied_cashback}
                          </td>
                        </tr>

                        <tr>
                          <td className={titleCss}>Order Total</td>
                          <td className="border-y border-l text-red-500 text-[20px] pr-2">
                            $ {orderDetails.formatted_total_paid}
                          </td>
                        </tr>
                      </table>
                    </div>
                  )}
                  <div className="border-4 my-4 "></div>
                  <section className="flex flex-col gap-2">
                    <p className="capitalize font-bold text-black">
                      Seller details
                    </p>
                    <div className="flex justify-between items-center flex-wrap gap-2 mb-2">
                      <div className="flex gap-5 items-center">
                        <div className="flex gap-2">
                          <p className="text-black text-sm">Shop name :</p>
                          <span className="text-orangeButton text-sm">
                            {orderDetails?.seller_detail?.shop_name}
                          </span>
                        </div>
                        <img
                          alt="shop-logo"
                          src={orderDetails?.seller_detail.shop_logo}
                          className="w-[66px] h-[54px]"
                        ></img>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          to={{
                            pathname:
                              CustomerRoutes.ShopDetails +
                              orderDetails?.seller_detail?.shop_slug +
                              "/",
                          }}
                          state={orderDetails?.seller_detail?.shop_slug}
                          className="flex justify-center items-center px-2 min-w-[110px] w-fit h-8 gap-1 border rounded-[2px] border-orangeButton text-orangeButton"
                        >
                          <AiOutlineShop size={16}></AiOutlineShop>
                          <p className="text-[10px] md:text-[14px]">
                            View Shop
                          </p>
                        </Link>
                        <button
                          className="text-orangeButton border px-2 py-1 border-orangeButton rounded-sm text-sm "
                          onClick={openChat}
                        >
                          <FontAwesomeIcon icon={faComments} className="pr-2" />
                          Chat Now
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            ) : null}
          </div>
          {isChatOpen && (
            <ChatComponent
              closeChat={closeChat}
              userToken={user.access}
              userType={USER_TYPE[1]}
              receiverType={USER_TYPE[2]}
              shopSlug={orderDetails?.seller_detail?.shop_slug}
              buyerId={user?.user_id}
            />
          )}
        </div>
      )}
      {isCancelOrderShow && (
        <BuyerCancelOrderPopup
          toggleCancelOrder={isCancelOrderShow}
          orderId={orderDetails.id_order}
          user={user}
          closeCancelOrderPopup={() => setIsCancelOrderShow(false)}
          processCancelOrder={onStatusUpdateComplete}
        />
      )}

      {isReturnPopupShow && (
        <BuyerReturnOrderPopup
          toggleReturnOrder={isReturnPopupShow}
          orderId={orderDetails.id_order}
          user={user}
          closeReturnOrderPopup={() => setIsReturnPopupShow(false)}
          processReturnOrder={onStatusUpdateComplete}
        />
      )}

      {isRefundPopupShow && (
        <BuyerRefundReqPopup
          toggleRefundReq={isRefundPopupShow}
          orderId={orderDetails.id_order}
          user={user}
          closeRefundReqPopup={() => setIsRefundPopupShow(false)}
          processRefundReq={onStatusUpdateComplete}
        />
      )}

      {showMarkReceived && (
        <MarkReceivedOrderPopup
          toggleMarkReceivedOrder={showMarkReceived}
          orderId={orderDetails.id_order}
          user={user}
          closeMarkReceivedOrderPopup={() => setShowMarkReceived(false)}
          processMarkReceivedOrder={onStatusUpdateComplete}
        />
      )}

      {isReviewPopupShow && (
        <RateReviewPopup
          togglePopup={isReviewPopupShow}
          closePopup={() => setIsReviewPopupShow(false)}
          user={user}
          order={orderDetails}
          process={onStatusUpdateComplete}
          productIndex={productIndex}
        />
      )}

      {isShowMsg && (
        <Modal
          width="w-4/12"
          open={isShowMsg}
          children={
            <div>
              <span
                className="flex justify-end cp"
                onClick={() => setIsShowMsg(false)}
              >
                <FontAwesomeIcon icon={faXmark} />
              </span>
              {message.result === "SUCCESS" ? (
                <img src={successGif} alt="" className="modal-icon" />
              ) : (
                <AiFillWarning className="modal-icon" />
              )}
              <div className="poptitle font-medium text-center">
                {message.message}
              </div>
            </div>
          }
        />
      )}

      {isChangeAddressOpen && (
        <Modal open={isChangeAddressOpen}>
          <ChangeAddressForm
            close={() => setIsChangeAddressOpen((prev) => !prev)}
            refetchAddress={() => setShouldRefetch((prev) => !prev)}
          />
        </Modal>
      )}
    </>
  );
}

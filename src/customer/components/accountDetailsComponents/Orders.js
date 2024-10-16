import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import uuid from "react-uuid";
import { Modal } from "../GenericComponents";
import ls from "local-storage";

//css
import { CustomerRoutes } from "../../../Routes";

//images
import productImg2 from "../../../assets/buyer/productImg2.png";
import { ORDER_CONSTANTS } from "../../../constants/order_status";
import successGif from "../../../assets/success.gif";
import { AiFillWarning } from "react-icons/ai";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BuyerCancelOrderPopup from "../StatusUpdatePopups/CancelOrderPopup";
import { ProgressLabels } from "../../../constants/ProgressConstants";
import chat from "../../../assets/buyer/chatSqaure.svg";
import { USER_TYPE } from "../../../constants/general.js";

export default function Orders({ retrieveOrdersList, orders }) {
  const user = JSON.parse(localStorage.getItem("customer"));
  const navigate = useNavigate();
  const [isCancelOrderShow, setIsCancelOrderShow] = useState(false);
  const [isShowMsg, setIsShowMsg] = useState(false);
  const [message, setMessage] = useState({});
  const [order, setOrder] = useState(null);

  const processCancelOrder = (res, api) => {
    setMessage(res.data);
    setIsShowMsg(true);
    retrieveOrdersList();

    setTimeout(() => {
      setIsShowMsg(false);
      setMessage("");
      setOrder(null);
    }, 2000);
  };

  const toggleCancelOrderPopup = (order) => {
    setOrder(order);
    setIsCancelOrderShow(!isCancelOrderShow);
  };

  const openChat = (order) => {
    let dataToPass = {
      userType: USER_TYPE[1],
      receiverType: USER_TYPE[2],
      buyerId: user?.user_id,
      shopSlug: order?.seller_detail?.shop_slug,
      sellerId: order?.seller_detail?.user_id,
      shopName: order?.seller_detail?.shop_name,
    }; 
    ls("chatData", JSON.stringify(dataToPass));

    const newTab = window.open(CustomerRoutes.ChatScreen, "_blank");
    if (newTab) newTab.focus();
  };

  const displayOrderNumber = (order_number, style) => {
    return (
      <div
        className={`cp ${style}`}
        onClick={() => navigate(CustomerRoutes.ViewOrderDetails + `${order_number}/`)}
      >
        <p className="inline text-[12px] sm:text-[16px] italic font-medium flex lg:justify-end">
          Order number:{" "}
        </p>
        <p className="inline text-[12px] sm:text-[16px] italic font-semibold text-darkOrange flex justify-end">
          {order_number}
        </p>
      </div>
    );
  };

  const displayStatusBasedAction = (order, style) => {
    return (
      <div className={`text-center my-3 pb-2 ${style}`}>
        {order.delivery_status_id === ORDER_CONSTANTS.GENERALSTATUS_UNPAID && (
          <Link
            to={CustomerRoutes.ViewOrderDetails + `${order.order_number}/`}
            className="border-2 w-[130px] border-amber-500 rounded px-2 py-2 mr-3 "
          >
            View Details
          </Link>
        )}
        {order.delivery_status_id === ORDER_CONSTANTS.GENERALSTATUS_UNPAID && (
          <Link
            to=""
            className="border-2 w-[130px] max-sm:w-[170px] border-amber-500 rounded px-2 py-2"
          >
            Make Payment
          </Link>
        )}

        {order.delivery_status_id ===
          ORDER_CONSTANTS.GENERALSTATUS_PENDING_CONFIRMATION && (
          <div className=" px-2 py-2 border-[#f5ab35] w-[130px] p-2 border-2 rounded">
            <button
              onClick={(e) => toggleCancelOrderPopup(order)}
              className=" text-center whitespace-nowrap  font-medium text-[#f5ab35] relative"
            >
              Cancel Order
            </button>
          </div>
        )}
        {order.delivery_status_id ===
          ORDER_CONSTANTS.GENERALSTATUS_DELIVERED && (
          <Link
            to={
              CustomerRoutes.ProductDetails + `${order?.product_item[0]?.slug}/`
            }
            state={order?.product_item[0]?.id_product}
            key={order?.product_item[0]?.id_product}
            className="border-2 w-[130px] border-amber-500 rounded px-4 py-2"
          >
            Buy Again
          </Link>
        )}
      </div>
    );
  };

  return (
    <section className="my-6 grid sm:border-[1px] rounded-[4px] border-gray-300 min-h-[510px]">
      {orders.length === 0 && (
        <div className="h-[450px]  justify-center flex items-center">
          <p>No order found</p>
        </div>
      )}
      {orders.map((order) => {
        const orderStatus = ProgressLabels.find(
          (item) => item.id === order.delivery_status_id
        );
        let returnDate = new Date(order.return_window_date).toLocaleDateString(
          "en-SG",
          { day: "numeric", month: "short" }
        );
        return (
          <div key={uuid()}>
            <div className="mx-4 my-4 sm:bg-slate-50 ">
              <div className="flex max-lg:flex-wrap mb-4 gap-2 sm:gap-0 justify-between sm:px-[19px] sm:py-[10px] items-start sm:items-center cp">
                <div className="flex gap-5 h-fit items-center md:items-start justify-between md:justify-start ">
                  <div className="flex items-center justify-center gap-6 h-33">
                    <img
                      src={order.seller_detail.shop_logo ?? productImg2}
                      className="w-10 h-10"
                    />
                    <p className="capitalize text-[14px] sm:text-[16px] leading-6 font-medium">
                      {order.seller_detail.shop_name ??
                        order.seller_detail.business_name ??
                        order.seller_detail.individual_name}
                    </p>
                  </div>
                  <div
                    className="flex items-center  h-[33px] w-[83px] gap-1 cp"
                    onClick={() => openChat(order)}
                  >
                    <img src={chat} className="w-[18px] sm:w-[20px]" />
                    <p className="capitalize w-[35px] h-[21px] text-[12px] md:text-[14px] leading-[21px] text-orangeButton">
                      Chat
                    </p>
                  </div>
                </div>

                <div className="flex sm:items-center sm:gap-[14px] justify-between sm:justify-end  w-full ">
                  <div className="max-sm:w-full flex justify-between">
                    <div className="flex gap-[14px]">
                      {orderStatus?.icon}
                      <div className="flex-col">
                        <div>
                          <p className="font-semibold text-[14px] sm:text-[16px] font-poppins capitalize">
                            {orderStatus?.name}
                          </p>
                          <p className="text-slate-500 text-[12px] sm:text-[14px] font-poppins font-normal leading-6">
                            On {order.created_date}
                          </p>
                        </div>
                      </div>
                    </div>
                    {displayOrderNumber(order.order_number,"max-sm:block hidden")}
                  </div>
                </div>
              </div>
              <div className="flex max-lg:flex-wrap max-[650px]:justify-start justify-between sm:px-4">
                <div
                  className="order-2 flex gap-4 cp"
                  onClick={() =>
                    navigate(
                      CustomerRoutes.ViewOrderDetails + `${order.order_number}/`
                    )
                  }
                >
                  {
                    <img
                      src={order?.product_item[0].thumbnail_img}
                      alt=""
                      className="w-[75px] h-[75px] sm:w-[89px] sm:h-[89px]"
                    ></img>
                  }
                  <div className="flex flex-col text-[14px] sm:text-[16px]">
                    <p className="font-bold">
                      {order?.product_item[0].product_detail.name}
                    </p>
                    <p className="text-amber-500 font-bold">
                      ${" "}
                      {parseFloat(
                        order.product_item[0].unit_price *
                          order.product_item[0].quantity
                      ).toFixed(2)}
                    </p>

                    <div className="flex text-[#828282]">
                      {order.product_item[0].product_detail.variation.length >
                        0 &&
                        order.product_item[0].product_detail.variation.map(
                          (variation, index) => (
                            <div className="flex gap-1">
                              <p>{variation.variation_name}</p>:
                              <p>{variation.variation_value}</p>
                              {index !==
                                order.product_item[0].product_detail.variation
                                  .length -
                                  1 && <span>, </span>}
                            </div>
                          )
                        )}
                    </div>
                  </div>
                </div>
                <div className="items-end max-lg:items-start order-1 sm:order-2 flex flex-col sm:gap-2">
                  {displayOrderNumber(order.order_number, "max-sm:hidden")}
                  {displayStatusBasedAction(order, "max-sm:hidden")}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between sm:px-4 sm:py-2 text-[14px] sm:text-[16px]">
                <p className="">
                  {order.product_item.length}{" "}
                  {order.product_item.length === 1 ? "Item" : "Items"} Ordered
                </p>
                <p className="font-bold capitalized">
                  Order Total: ${order.formatted_total_paid}
                </p>
              </div>
              {displayStatusBasedAction(order, "max-sm:flex hidden")}

              {order.delivery_status_id ===
                ORDER_CONSTANTS.GENERALSTATUS_DELIVERED && (
                <>
                  <div className="h-0.5 w-full bg-[#F5F5F6] px-2 mb-3"></div>
                  <div className="mx-4 pb-6 flex flex-row justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-[8px] h-[8px] border bg-slate-400 rounded-full"></div>
                      <p className="text-slate-500 text-[14px] font-poppins font-normal">
                        {`Exchange / return window will be closed on ${returnDate}`}
                      </p>
                    </div>
                    <p
                      className="text-[#F2994A] underline cp"
                      onClick={() =>
                        navigate(
                          CustomerRoutes.ViewOrderDetails + `${order.order_number}/`
                        )
                      }
                    >
                      Write a review
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="border-[8px] border-solid border-greyDivider sm:border-none"></div>
          </div>
        );
      })}

      {isCancelOrderShow && (
        <BuyerCancelOrderPopup
          toggleCancelOrder={isCancelOrderShow}
          orderId={order.id_order}
          user={user}
          closeCancelOrderPopup={() => setIsCancelOrderShow(false)}
          processCancelOrder={processCancelOrder}
        />
      )}

      {isShowMsg && (
        <Modal
          width="w-4/12 max-sm:w-3/4"
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
                {message.result === "SUCCESS" ? (
                  message.message
                ) : (
                  <span>
                    Order cancellation failed
                    <p className="text-base font-normal text-grey mt-2">
                      {`Error: ${message.message}`}
                    </p>
                  </span>
                )}
              </div>
            </div>
          }
        />
      )}
    </section>
  );
}

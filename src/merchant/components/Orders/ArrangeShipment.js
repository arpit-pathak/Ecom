import React from "react";
import ls from "local-storage";
import "react-loading-skeleton/dist/skeleton.css";
import { Link } from "react-router-dom";

import { MerchantRoutes, CustomerRoutes } from "../../../Routes.js";
import { ApiCalls, Apis } from "../../utils/ApiCalls.js";
import { Constants, Waybill } from "../../utils/Constants.js";

//ui components
import Navbar from "../../components/Navbar.js";
import {
  ProgressNotifBanner,
  ProgressTracker,
} from "../../../constants/OrdersProgression.js";
import { Modal } from "../../../customer/components/GenericComponents.js";
import Loader, { PageLoader } from "../../../utils/loader.js";
import { callingPrintWaybill } from "./PrintWaybill.js";

import { AiFillWarning } from "react-icons/ai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import successGif from "../../../assets/success.gif";
import productImg2 from "../../../assets/buyer/productImg2.png";
import editIcon from "../../../assets/edit-orange.svg";

//icons
import { TbError404 } from "react-icons/tb";
import { FaQuestionCircle } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa6";
import { IoChatbubbles } from "react-icons/io5";

import mobileBankIcon from "../../../assets/mobileBankIcon.png";
// import chatNowButton from "../../../assets/chatNowButton.png";
import emailIcon from "../../../assets/emailIcon.png";
import phoneIconCall from "../../../assets/phoneIconCall.png";

import { loginRequired } from "../../utils/Helper.js";

import { ORDER_CONSTANTS } from "../../../constants/order_status.js";
import ConfirmOrderPopup from "./ConfirmOrderPopup.js";
import CancelOrderPopup from "./CancelOrderPopup.js";
import withRouter from "../../../Utils.js";
import ReturnRejectOrderPopup from "./OrderReturnRejectPopup.js";
import ReturnAcceptOrderPopup from "./OrderReturnAcceptPopup.js";
import RefundModifyOrderPopup from "./RefundModifyPopup.js";
import ProofOfDeliveryPopup from "./ProofOfDeliveryPopup.js";
import ChatComponent from "../../../components/chat/chat.js";
import { USER_TYPE } from "../../../constants/general.js";
import ChangeAddressPopup from "./ChangeAddressPopup.jsx";

class ArrangeShipment extends React.Component {
  constructor(props) {
    super(props);
    loginRequired(props.page);

    this.pageTitle = "Order Detail";

    document.title = `${this.pageTitle} | uShop`;

    this.user = ls(Constants.localStorage.user);
    if (this.user) this.user = JSON.parse(this.user);

    const orderNum = window.location.href.split("/")[6];

    this.state = {
      progressSteps: [1, 2, 3, 4],
      orderNum: orderNum,
      orderDetails: null,
      deliveryStatus: ORDER_CONSTANTS.GENERALSTATUS_PENDING_CONFIRMATION,
      message: "",
      isShowMsg: false,
      isPricingOpen: false,
      isOrderDetailsLoading: false,
      isAdultItemAgreed: false,

      //popup handling variables
      toggleConfirmOrder: false,
      toggleCancelOrder: false,
      toggleReturnRequestReject: false,
      toggleReturnRequestAccept: false,
      toggleModifyOrder: false,
      toggleChangeAddress: false,

      isPrintingWaybill: false,
      showPOD: false,

      isChatOpen: false,
    };
  }

  processOrderDetails = (res, api) => {
    let rdata = res.data.data;
    this.setState({
      orderDetails: rdata,
      deliveryDate: new Date(rdata.seller_detail.delivery_date),
      deliveryStatus:
        rdata?.payment_status_id === ORDER_CONSTANTS.GENERALSTATUS_REFUNDED &&
        (rdata?.delivery_status_id ===
          ORDER_CONSTANTS.GENERALSTATUS_DELIVERED ||
          rdata?.delivery_status_id ===
            ORDER_CONSTANTS.GENERALSTATUS_ORDER_RECEIVED)
          ? rdata.payment_status_id
          : rdata.delivery_status_id,
      isOrderDetailsLoading: false,
      isAdultItemAgreed: rdata?.product_item?.some(
        (item) => item?.product_detail?.agreed_adult_item === "y"
      ),
    });
  };

  loadOrderDetails = () => {
    console.log("loading");
    this.setState({ isOrderDetailsLoading: true });
    let fd = new FormData();

    // user must be a merchant
    fd.append("is_seller", "yes");
    fd.append("order_number", this.state.orderNum);

    ApiCalls(
      fd,
      Apis.sellerOrderDetail,
      "POST",
      {
        Authorization: "Bearer " + this.user.access,
      },
      this.processOrderDetails
    );
  };

  componentDidMount = () => {
    //fetch order details
    this.loadOrderDetails();
  };

  componentDidUpdate(prevProps, prevState) {
    // Check if the order number in the URL has changed
    if (
      this.props.location.pathname.split("/")[4] !==
      prevProps.location.pathname.split("/")[4]
    ) {
      this.setState(
        { orderNum: this.props.location.pathname.split("/")[4] },
        () => {
          this.loadOrderDetails();
        }
      );
    }

    // Check if toggleChangeAddressPopup has changed from true to false
    if (
      prevState.toggleChangeAddress === true &&
      this.state.toggleChangeAddress === false
    ) {
      // Refetch data when the popup is closed
      this.loadOrderDetails();
    }
  }

  renderSkeletonTable = () => {
    var fillers = [0, 1, 2];
    return (
      <>
        {fillers.map((itm, i) => (
          <tr key={i}>
            <td>
              <div className="skeleton-ui skeleton-checkbox"></div>
            </td>
            <td>
              <div className=" inline-block w-full">
                <div className=" float-left">
                  <div className="skeleton-ui skeleton-img"></div>
                </div>
                <div className=" float-left w-2/3">
                  <div className="skeleton-ui skeleton-action"></div>
                  <div className="skeleton-ui skeleton-action"></div>
                </div>
              </div>
            </td>
            <td>
              <div className="skeleton-ui skeleton-action"></div>
            </td>
            <td>
              <div className="skeleton-ui skeleton-action"></div>
            </td>
            <td>
              <div className="skeleton-ui skeleton-action"></div>
            </td>
            <td>
              <div className="skeleton-ui skeleton-action"></div>
            </td>
            <td>
              <div className="skeleton-ui skeleton-action"></div>
            </td>
            <td>
              <div className="skeleton-ui skeleton-action"></div>
            </td>
          </tr>
        ))}
      </>
    );
  };

  processConfirmOrder = (res, api) => {
    this.setState({
      isShowMsg: true,
      message: res.data,
    });
    if (res.data.result === "SUCCESS") this.loadOrderDetails();

    setTimeout(() => this.setState({ isShowMsg: false }), 3000);
  };

  processCancelOrder = (res, api) => {
    this.setState({
      isShowMsg: true,
      message: res.data,
    });
    if (res.data.result === "SUCCESS") this.loadOrderDetails();

    setTimeout(() => this.setState({ isShowMsg: false }), 2000);
  };

  processOrder = (res, api) => {
    this.setState({
      isShowMsg: true,
      message: res.data,
    });

    setTimeout(() => {
      this.setState({ isShowMsg: false });
      this.loadOrderDetails();
    }, 2000);
  };

  triggerWaybillDownload = () => {
    callingPrintWaybill(
      Waybill.single,
      this.state.orderDetails?.id_order,
      this.setIsPrintingWaybill
    );
  };

  setIsPrintingWaybill = (value) => {
    this.setState({
      isPrintingWaybill: value,
    });
  };

  onToggleConfirmOrder = (e) => {
    this.setState({
      toggleConfirmOrder: !this.state.toggleConfirmOrder,
    });
  };

  onToggleCancelOrder = (e) => {
    this.setState({
      toggleCancelOrder: !this.state.toggleCancelOrder,
    });
  };

  closeConfirmOrderPopup = () => this.setState({ toggleConfirmOrder: false });

  closeCancelOrderPopup = () => this.setState({ toggleCancelOrder: false });

  closeReturnRejectOrderPopup = () =>
    this.setState({ toggleReturnRequestReject: false });

  closeReturnAcceptOrderPopup = () =>
    this.setState({ toggleReturnRequestAccept: false });

  closeRefundModifyPopup = () => this.setState({ toggleModifyOrder: false });

  onToggleReturnRequestReject = (e) => {
    this.setState({
      toggleReturnRequestReject: !this.state.toggleReturnRequestReject,
    });
  };

  onToggleReturnRequestAccept = (e) => {
    this.setState({
      toggleReturnRequestAccept: !this.state.toggleReturnRequestAccept,
    });
  };

  onToggleRefundRequestModify = (e) => {
    this.setState({
      toggleModifyOrder: !this.state.toggleModifyOrder,
    });
  };

  renderStatus = (value) => {
    switch (value) {
      case "Confirm":
        return this.renderStatusButton({
          label: "Confirm Order",
          onClick: this.onToggleConfirmOrder,
          isLoading: false,
        });

      case "Cancel":
        return this.renderStatusButton({
          label: "Cancel Order",
          onClick: this.onToggleCancelOrder,
          isLoading: false,
        });

      case "Waybill":
        return this.renderStatusButton({
          label: "Print Waybill",
          onClick: this.triggerWaybillDownload,
          isLoading: this.state.isPrintingWaybill,
        });

      case "Return Accept":
      case "Refund Accept":
        return this.renderStatusButton({
          label: "Approve",
          onClick: this.onToggleReturnRequestAccept,
          isLoading: false,
        });

      case "Return Reject":
      case "Refund Reject":
        return this.renderStatusButton({
          label: "Reject",
          onClick: this.onToggleReturnRequestReject,
          isLoading: false,
        });

      case "Modify Reject":
        return this.renderStatusButton({
          label: "Modify",
          onClick: this.onToggleRefundRequestModify, //to change
          isLoading: false,
        });

      case "Reschedule":
        // in case of instant don't display reschedule button
        if (this.state.orderDetails.seller_detail?.shipping_id === 3) {
          return null;
        }
        return this.renderStatusButton({
          label: "Reschedule Order",
          onClick: this.onToggleConfirmOrder,
          isLoading: false,
        });

      default:
        return {
          label: "",
          onClick: () => {},
          isLoading: false,
        };
    }
  };

  closeChat = () => {
    this.setState({
      isChatOpen: false,
    });
  };

  openChat = () => {
    let dataToPass = {
      userType: USER_TYPE[2],
      receiverType: USER_TYPE[1],
      buyerId: this.state.orderDetails?.buyer_user_id,
      shopSlug: this.user?.shop_slug,
      buyerName:
        this.state.orderDetails?.buyer_name ??
        this.state.orderDetails?.buyer_email,
    };

    ls("chatData", JSON.stringify(dataToPass));

    const newTab = window.open(MerchantRoutes.ChatScreen, "_blank");
    if (newTab) newTab.focus();
  };

  renderStatusButton = (currentStatus) => {
    return (
      <div>
        <div
          className={`site-btn btn-default mx-5 ${
            currentStatus.label === "Reschedule Order" ? "w-40" : "w-32"
          } h-11`}
          onClick={currentStatus.onClick}
        >
          <span className="button__text">
            {currentStatus.isLoading ? <Loader /> : currentStatus.label}
          </span>
        </div>
      </div>
    );
  };

  msgPopup = () => {
    return (
      <Modal
        width="w-4/12"
        open={this.state.isShowMsg}
        children={
          <div>
            <span
              className="flex justify-end cp"
              onClick={() => this.setState({ isShowMsg: false })}
            >
              <FontAwesomeIcon icon={faXmark} />
            </span>
            {this.state.message.result === "SUCCESS" ? (
              <img src={successGif} alt="" className="modal-icon" />
            ) : (
              <AiFillWarning className="modal-icon" />
            )}
            <div className="poptitle font-medium text-center">
              {this.state.message.result === "SUCCESS" ? (
                this.state.message.message
              ) : (
                <span>
                  Order confirmation failed
                  <p className="text-base font-normal text-grey mt-2">
                    {`Error: ${this.state.message.message}`}
                  </p>
                </span>
              )}
            </div>
          </div>
        }
      />
    );
  };

  body = () => {
    return (
      <>
        {this.state.orderDetails ? (
          <div className="flex flex-row w-full">
            <div className="max-[768px]:hidden side-tracker mb-11 ml-10">
              <ProgressTracker
                progressPath={
                  this.state.orderDetails?.payment_status_id ===
                    ORDER_CONSTANTS.GENERALSTATUS_REFUNDED &&
                  (this.state.orderDetails?.delivery_status_id ===
                    ORDER_CONSTANTS.GENERALSTATUS_DELIVERED ||
                    this.state.orderDetails?.delivery_status_id ===
                      ORDER_CONSTANTS.GENERALSTATUS_ORDER_RECEIVED)
                    ? this.state.orderDetails?.payment_status
                    : this.state.orderDetails?.order_status
                }
                isBuyer={false}
                order={this.state.orderDetails}
                viewDetail={true}
              />
            </div>
            <div className="listing-page !p-0" id="listing-order-detail">
              <div
                className="merchant-db page-section !bg-white !p-0"
                id="list-page-section"
              >
                <div className="pl-3">
                  <ProgressNotifBanner
                    progressStep={this.state.deliveryStatus}
                    order={this.state.orderDetails}
                  />
                </div>
                <div className="content-headers pl-3">
                  <div className="content-float-left">
                    <tr>
                      <td>
                        <span className="italic">
                          Order number:&nbsp;&nbsp;
                        </span>
                      </td>

                      <td>
                        <span className="italic">
                          <p className="orderNum-style">
                            # {this.state.orderDetails?.order_number}
                          </p>
                        </span>
                      </td>
                    </tr>
                  </div>

                  <div className="content-float-right">
                    <tr
                      className="flex items-center cp"
                      onClick={() =>
                        this.props.navigate(
                          MerchantRoutes.ContactUs.replace(":tab", "contact-us")
                        )
                      }
                    >
                      <td>
                        <FaQuestionCircle
                          className="icon site-primary-color"
                          fontSize="18px"
                        />
                      </td>
                      <td className="content-text mt-1 ">Need Help?</td>
                    </tr>
                  </div>
                </div>
                <tr>
                  <td>&nbsp;</td>
                </tr>
                <div className="content-headers pl-3 pt-2">
                  <hr />
                </div>

                <div className="content-headers pl-3">
                  {this.state.orderDetails.product_item.map((prod, index) => {
                    return (
                      <div
                        key={index}
                        className="flex flex-row justify-between relative w-full items-center flex-wrap mb-2 pr-2"
                      >
                        <div className="flex gap-3 items-center">
                          <img
                            src={
                              prod.thumbnail_img
                                ? prod.thumbnail_img
                                : productImg2
                            }
                            alt=""
                            className="min-h-0 min-w-0 relative w-16 shrink-0"
                          />
                          <div className=" font-['Poppins'] font-bold text-[#282828] relative shrink-0 w-44">
                            {prod?.product_detail?.name} <br />
                            <span className="font-normal text-sm text-danger italic">
                              {prod?.sku && `SKU : ${prod?.sku}`}
                            </span>
                          </div>
                        </div>
                        <div className="whitespace-nowrap font-normal w-24 text-[#828282] capitalize shrink-0">
                          {prod?.product_detail?.variation?.length > 0
                            ? prod?.product_detail?.variation.map(
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
                        <div className="whitespace-nowrap text-[#828282] w-20 font-normal">
                          Qty: {prod?.quantity}
                        </div>
                        <div className="whitespace-nowrap text-lg w-11 font-semibold text-[#f2994a] mr-2 w-24 text-right">
                          $ {(prod?.unit_price * prod?.quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                  {this.state.isAdultItemAgreed && (
                    <p className="text-xs text-red-500 font-semibold my-3">
                      Buyer has confirmed that he is above 18 years old for this
                      purchase
                    </p>
                  )}
                  <table className="mt-8">
                    <tr>
                      <td width="100%">
                        <div className="px-3 flex flex-row justify-between">
                          <div className="flex flex-row items-center gap-2 mb-2">
                            <div className="h-2 w-2 rounded-md bg-[#828282]"></div>
                            <p>Pickup Date & Time:</p>
                            <p className="text-black">
                              {
                                this.state.orderDetails?.seller_detail
                                  ?.pickup_datetime_formated
                              }
                            </p>
                          </div>
                          <div>
                            {this.state.orderDetails?.tracking_number && (
                              <p
                                className="text-[#282828] font-bold text-base cp"
                                onClick={() =>
                                  window.open(
                                    this.state.orderDetails?.tracking_url,
                                    "_blank"
                                  )
                                }
                              >
                                {`Tracking No. ${this.state.orderDetails?.tracking_number}`}
                              </p>
                            )}
                            {this.state.orderDetails?.pod ? (
                              <div
                                className="mt-2 mr-2 cp"
                                onClick={() => this.setState({ showPOD: true })}
                              >
                                <p className="text-xs font-semibold text-center">
                                  View Proof of Delivery
                                </p>
                              </div>
                            ) : (
                              <Link
                                to={CustomerRoutes.Help.replace(
                                  ":tab",
                                  "contact-us"
                                )}
                              >
                                <p className="text-xs mt-2 text-center text-[#838789] font-semibold">
                                  Contact Customer Support
                                </p>
                              </Link>
                            )}
                          </div>
                        </div>
                        <div className="h-[0.5px] w-full bg-[#E0E0E0] my-4"></div>
                        <div className="px-3 flex flex-row items-center gap-2 mb-2">
                          <div className="h-2 w-2 rounded-md bg-[#828282]"></div>
                          <p>Order Packed before:</p>
                          <p className="text-black">
                            {this.state.orderDetails?.seller_detail?.pickup_datetime_formated.substring(
                              0,
                              this.state.orderDetails?.seller_detail?.pickup_datetime_formated.indexOf(
                                "-"
                              )
                            )}
                          </p>
                        </div>
                        <div className="h-[0.5px] w-full bg-[#E0E0E0] my-4"></div>

                        {this.state.orderDetails?.seller_detail
                          ?.delivery_date_end ? (
                          <div className="px-3 flex flex-row items-center gap-2 mb-2">
                            {" "}
                            <div className="h-2 w-2 rounded-md bg-[#828282]"></div>
                            <p>Expected to arrive between : </p>
                            <span className="text-black">
                              {
                                this.state.orderDetails?.seller_detail
                                  ?.delivery_date_formated
                              }
                            </span>{" "}
                            to{" "}
                            <span className="text-black">
                              {this.state.orderDetails?.seller_detail?.delivery_date_end
                                .split("-")
                                .reverse()
                                .join("-")}
                            </span>
                          </div>
                        ) : (
                          <div className="px-3 flex flex-row items-center gap-2 mb-2">
                            <div className="h-2 w-2 rounded-md bg-[#828282]"></div>
                            <p>Order Delivery Date & Time:</p>
                            <p className="text-black">
                              {
                                this.state.orderDetails?.seller_detail
                                  ?.delivery_datetime_formated
                              }
                            </p>
                          </div>
                        )}

                        <p className="text-black ml-5 mt-5">
                          <span className="font-semibold">Remarks: </span>
                          {this.state.orderDetails?.seller_detail
                            ?.delivery_remark ?? "N/A"}
                        </p>
                      </td>
                    </tr>
                  </table>
                </div>
                <div className="h-4 w-full bg-[#F5F5F6] mt-2"></div>

                {/* reason for refund section  */}
                {this.state.orderDetails?.buyer_return_request && (
                  <>
                    <section className="flex flex-col gap-4 pl-5">
                      <div className="content-float-left font-bold">
                        <span>Reason For Refund</span>
                      </div>
                      <p className="text-sm">
                        {this.state.orderDetails?.buyer_return_request
                          ?.remarks ?? ""}
                      </p>
                      {this.state.orderDetails?.refund_detail
                        ?.total_refund_amount && (
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-black">
                            Total Refund Amount
                          </p>
                          <p className="text-orangeButton text-[20px] mr-3">
                            $
                            {
                              this.state.orderDetails?.refund_detail
                                ?.total_refund_amount
                            }
                          </p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3">
                        {this.state.orderDetails?.buyer_return_request?.other_detail?.product_img?.map(
                          (item, index) => {
                            return (
                              <div
                                className="h-20 w-20 p-4 border rounded-md"
                                key={index}
                              >
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

                    <div className="h-4 w-full bg-[#F5F5F6] mt-2"></div>
                  </>
                )}

                {this.state.orderDetails?.seller_refund_response?.other_detail
                  ?.product_img && (
                  <>
                    <section className="flex flex-col gap-4 pl-5">
                      <div className="content-float-left font-bold">
                        <span>Reason For Rejection</span>
                      </div>
                      <p className="text-sm">
                        {this.state.orderDetails?.seller_refund_response
                          ?.remarks ?? "No remarks added"}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {this.state.orderDetails?.seller_refund_response?.other_detail?.product_img?.map(
                          (item, index) => {
                            return (
                              <div
                                className="h-20 w-20 p-4 border rounded-md"
                                key={index}
                              >
                                <img
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

                    <div className="h-4 w-full bg-[#F5F5F6] mt-2"></div>
                  </>
                )}

                {this.state.orderDetails?.refund_detail && (
                  <>
                    <section className="flex flex-col gap-4 pl-5">
                      <div className="content-float-left font-bold">
                        <span>Reason For Refund</span>
                      </div>
                      <p className="text-sm text-black">
                        {this.state.orderDetails?.refund_detail?.reason ?? ""}
                      </p>
                      <div className="flex gap-4 items-center text-sm">
                        <p>Remarks :</p>
                        <p>
                          {this.state.orderDetails?.refund_detail?.remarks ??
                            "N/A"}
                        </p>
                      </div>
                      {this.state.orderDetails?.refund_detail
                        ?.total_refund_amount && (
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-black">
                            Total Refund Amount
                          </p>
                          <p className="text-orangeButton text-[20px] mr-3">
                            $
                            {
                              this.state.orderDetails?.refund_detail
                                ?.total_refund_amount
                            }
                          </p>
                        </div>
                      )}
                    </section>
                    <div className="h-4 w-full bg-[#F5F5F6] mt-2"></div>
                  </>
                )}

                <div className="content-headers pt-5 pl-3">
                  <div className="content-float-left">
                    <span>Buyer Details</span>
                  </div>
                  <table className="mt-10 my-3">
                    <tr className="text-black">
                      <td width="30%">
                        Receiver Name:
                        <span className="price-style ml-2">
                          {this.state.orderDetails?.shipping_address?.full_name}
                        </span>
                      </td>
                      <td width="5%">
                        <img
                          src={phoneIconCall}
                          alt=""
                          className="py-1 h-8 w-fit"
                        />
                      </td>
                      <td width="15%">
                        <span className="font-normal text-sm">
                          {
                            this.state.orderDetails?.shipping_address
                              .contact_number
                          }
                        </span>
                      </td>
                      <td width="5%">
                        <img
                          src={emailIcon}
                          alt=""
                          className="py-1 h-8 w-fit"
                        />
                      </td>
                      <td width="25%">
                        <span className="font-normal text-sm">
                          {this.state.orderDetails?.shipping_address.email}
                        </span>
                      </td>
                      <td width="10%">
                        {this.state.orderDetails?.shipping_address
                          .contact_number &&
                        !this.state.orderDetails?.shipping_address.contact_number
                          .toLowerCase()
                          .includes("x") ? (
                          <div
                            className="border border-[#F5AB35] gap-1 px-[2px] py-1 mr-1 rounded flex items-center justify-center cursor-pointer"
                            onClick={() => {
                              const url = `https://web.whatsapp.com/send?phone=${this.state.orderDetails?.shipping_address.contact_number}`;
                              window.open(url, "_blank");
                            }}
                          >
                            <FaWhatsapp className="text-[#F5AB35] text-sm" />
                            <p className="text-[#F5AB35] text-xs font-semibold">
                              Chat on WA
                            </p>
                          </div>
                        ) : null}
                      </td>
                      <td width="10%">
                        <div
                          className="border border-[#F5AB35] gap-1 px-[2px] py-1 mr-1 rounded flex items-center justify-center cursor-pointer"
                          onClick={this.openChat}
                        >
                          <IoChatbubbles className="text-[#F5AB35] text-sm" />
                          <p className="text-[#F5AB35] text-xs font-semibold">
                            Chat on uShop
                          </p>
                        </div>
                      </td>
                    </tr>
                  </table>
                  <div className="my-4">
                    <hr />
                  </div>

                  <table>
                    <tbody className="flex justify-between">
                      <div>
                        <span className="font-normal text-sm text-black">
                          Address :{" "}
                        </span>
                        <span className="font-normal text-sm">
                          {
                            this.state.orderDetails?.shipping_address
                              ?.address_details
                          }{" "}
                          #
                          {
                            this.state.orderDetails?.shipping_address
                              ?.unit_number
                          }{" "}
                          {
                            this.state.orderDetails?.shipping_address
                              ?.postal_code
                          }
                        </span>
                      </div>

                      {(this.state.deliveryStatus ===
                        ORDER_CONSTANTS.GENERALSTATUS_ORDER_CONFIRMED ||
                        this.state.deliveryStatus ===
                          ORDER_CONSTANTS.GENERALSTATUS_PENDING_CONFIRMATION ||
                        this.state.deliveryStatus ===
                          ORDER_CONSTANTS.GENERALSTATUS_ORDER_COLLECTION_FAILED ||
                        this.state.deliveryStatus ===
                          ORDER_CONSTANTS.GENERALSTATUS_ORDER_DELIVERY_FAILED) && (
                        <button
                          className="flex items-center gap-1"
                          onClick={() =>
                            this.setState({
                              toggleChangeAddress:
                                !this.state.toggleChangeAddress,
                            })
                          }
                        >
                          <img src={editIcon} alt="edit-icon" />
                          <p className="text-[#F5AB35] text-sm font-medium">
                            Change
                          </p>
                        </button>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="h-4 w-full bg-[#F5F5F6] mt-2"></div>

                <div className="content-headers pt-3 pl-3">
                  <div className="content-float-left">
                    <span>Total Order Price</span>
                  </div>
                  <div className="content-float-right">
                    <span className="price-style">
                      $ {this.state.orderDetails.formatted_seller_total_paid}
                    </span>
                  </div>
                </div>
                <div className="content-headers pt-7 pl-3">
                  <div className="content-float-left">
                    <table>
                      <tbody>
                        {this.state.orderDetails?.formatted_total_discount !==
                          "0.00" && (
                          <span className="font-normal text-sm">
                            Discount of ${" "}
                            {this.state.orderDetails?.formatted_total_discount}{" "}
                            on the order
                          </span>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="content-float-right">
                    <table>
                      <tbody>
                        <span
                          className="text-black text_underline cp"
                          onClick={() =>
                            this.setState({
                              isPricingOpen: !this.state.isPricingOpen,
                            })
                          }
                        >
                          View pricing breakdown
                        </span>
                      </tbody>
                    </table>
                  </div>
                  {!this.state.isPricingOpen && (
                    <div className="h-[1px] w-full bg-[#E0E0E0] mt-12"></div>
                  )}
                </div>

                {this.state.isPricingOpen && (
                  <div className="flex flex-col gap-4 w-full place-self-end">
                    <table className="text-end mt-5 ">
                      <tr>
                        <td className="border-y priceKey">Product Cost</td>
                        <td className="border-y border-l priceValue">
                          $ {this.state.orderDetails.formatted_order_total}
                        </td>
                      </tr>
                      <tr>
                        <td className="border-y priceKey">
                          Buyer Shipping Fee
                        </td>
                        <td className="border-y border-l priceValue">
                          $ {this.state.orderDetails.formatted_total_shipping}
                        </td>
                      </tr>
                      <tr>
                        <td className="border-y priceKey">Voucher Discount</td>
                        <td className="border-y border-l priceValue">
                          - $ {this.state.orderDetails.formatted_total_discount}
                        </td>
                      </tr>
                      <tr>
                        <td className="border-y priceKey">Order Total</td>
                        <td className="border-y border-l text-red-500 text-[20px] pr-2">
                          ${" "}
                          {this.state.orderDetails.formatted_seller_total_paid}
                        </td>
                      </tr>
                    </table>
                  </div>
                )}

                <div className="content-headers pl-3 mt-4">
                  <tr>
                    <td>
                      <div className="flex items-center my-2">
                        <img
                          src={mobileBankIcon}
                          alt=""
                          className="pt-2 h-8 w-fit"
                        />
                        <span className="text-black ml-2">
                          {this.state.orderDetails?.payment_type}
                        </span>
                      </div>
                    </td>
                  </tr>
                </div>
                <div className="h-4 w-full bg-[#F5F5F6]"></div>

                <div className="pt-5 pl-3 pb-14">
                  <div className="mb-5 font-bold">
                    <span>Other Information</span>
                  </div>

                  <p className="text-sm">
                    Order Weight:
                    <span className="font-semibold text-orangeButton ml-2">
                      {this.state.orderDetails?.order_total_weight}
                    </span>
                  </p>

                  <p className="text-sm mt-5">
                    Seller Shipping Fee:
                    <span className="font-semibold text-orangeButton ml-2">
                      $
                      {this.state.orderDetails?.seller_detail?.total_seller_shipping.toFixed(
                        2
                      )}
                    </span>
                  </p>
                  {/* <table>
                                <tr className="text-black">
                                    <td className="pb-5">
                                        Order Size
                                    </td>
                                </tr>
                                <tr>
                                    <td width="5%" >
                                        <span className="text-black">
                                            <p>
                                                <span className='font-bold'> Width:</span>&nbsp;&nbsp;
                                                {oid.product_item[0].id_product} cm
                                            </p>
                                        </span>
                                    </td>
                                    <td width="5%" >
                                        <span className="text-black">
                                            <p>
                                                <span className='font-bold'> Length:</span>&nbsp;&nbsp;
                                                {oid.product_item[0].id_product} cm
                                            </p>
                                        </span>
                                    </td>
                                    <td width="5%" >
                                        <span className="text-black">
                                            <p>
                                                <span className='font-bold'> Height:</span> &nbsp;&nbsp;
                                                {oid.product_item[0].id_product} cm
                                            </p>
                                        </span>
                                    </td>
                                </tr>
                            </table> */}
                </div>
              </div>
            </div>
          </div>
        ) : (
          this.renderSkeletonTable()
        )}
      </>
    );
  };

  render() {
    var apiError = ls("apiError");
    if (apiError != null) ls.remove("apiError");
    let mcClass =
      this.props.level === 1
        ? "main-contents !bg-white relative"
        : "main-contents ws !bg-white relative";
    return (
      <main className="app-merchant merchant-db ">
        <Navbar theme="dashboard" />

        {this.state.isOrderDetailsLoading ? (
          <PageLoader />
        ) : (
          <div className={mcClass}>
            <div className="white-bg">
              <div className="pl-[45px] pt-4 text-sm">
                <a
                  href={MerchantRoutes.Orders}
                  className="!text-black font-normal"
                >
                  {"<"}&nbsp;Back
                </a>
              </div>

              <div className="breadcrumbs">
                <div className="text-lg font-bold !float-left">
                  {this.pageTitle}
                </div>

                <ul>
                  <li>
                    <a href={MerchantRoutes.Landing}>Home {">"}</a>
                  </li>
                  <li>
                    <a href={MerchantRoutes.Orders}>My Orders {">"}</a>
                  </li>
                  <li>
                    {/* Link back to "To Ship" tab as a final touch-up to this page */}
                    {/* If user was 'checking details' from the To Ship tab, 
                                then it will be saved as state. So navigating back to "My Orders"
                                will be done with "To Ship" tab selected.
                                */}
                    To Ship {">"}
                  </li>
                  <li>Check Details</li>
                </ul>

                {this.state.deliveryStatus ===
                ORDER_CONSTANTS.GENERALSTATUS_PENDING_CONFIRMATION ? (
                  <div className="action-buttons">
                    {this.renderStatus("Confirm")}
                    {this.renderStatus("Cancel")}
                  </div>
                ) : this.state.deliveryStatus ===
                    ORDER_CONSTANTS.GENERALSTATUS_ORDER_CONFIRMED ||
                  this.state.deliveryStatus ===
                    ORDER_CONSTANTS.GENERALSTATUS_ORDER_PENDING_PICKUP ||
                  this.state.deliveryStatus ===
                    ORDER_CONSTANTS.GENERALSTATUS_ORDER_DELIVERY_RESCHEDULED ? (
                  <div className="action-buttons">
                    {this.renderStatus("Waybill")}
                  </div>
                ) : this.state.deliveryStatus ===
                    ORDER_CONSTANTS.GENERALSTATUS_ORDER_COLLECTION_FAILED ||
                  this.state.deliveryStatus ===
                    ORDER_CONSTANTS.GENERALSTATUS_ORDER_DELIVERY_FAILED ? (
                  <div className="action-buttons">
                    {this.renderStatus("Reschedule")}
                  </div>
                ) : this.state.deliveryStatus ===
                  ORDER_CONSTANTS.GENERALSTATUS_ORDER_RETURN_REQUESTED ? (
                  <div className="action-buttons">
                    {this.renderStatus("Return Reject")}
                    {this.renderStatus("Return Accept")}
                  </div>
                ) : this.state.deliveryStatus ===
                  ORDER_CONSTANTS.GENERALSTATUS_ORDER_REFUND_REQUESTED ? (
                  <div className="action-buttons">
                    {this.renderStatus("Refund Reject")}
                    {this.renderStatus("Refund Accept")}
                  </div>
                ) : this.state.deliveryStatus ===
                  ORDER_CONSTANTS.GENERALSTATUS_ORDER_REFUND_REJECT ? (
                  <div className="action-buttons">
                    {this.renderStatus("Modify Reject")}
                  </div>
                ) : null}
              </div>
              {this.body()}
            </div>
            {this.state.isChatOpen && (
              <ChatComponent
                closeChat={this.closeChat}
                userToken={this.user.access}
                userType={USER_TYPE[2]}
                receiverType={USER_TYPE[1]}
                shopSlug={this.user?.shop_slug}
                buyerId={this.state.orderDetails?.buyer_user_id}
              />
            )}
          </div>
        )}

        {apiError ? (
          <div
            className="api-error"
            onClick={() => this.setState({ userJwt: true })}
          >
            <TbError404 />
            <div className="message">
              {apiError.message}. Click here to reload page.
            </div>
          </div>
        ) : (
          <></>
        )}

        {/* order confirmation dialog with delivery setting */}
        {this.state.toggleConfirmOrder && (
          <ConfirmOrderPopup
            toggleConfirmOrder={this.state.toggleConfirmOrder}
            isSingleOrder={true}
            closeConfirmOrderPopup={this.closeConfirmOrderPopup}
            orderId={this.state.orderDetails.id_order}
            processConfirmOrder={this.processConfirmOrder}
            user={this.user}
            sellerDetail={this.state.orderDetails.seller_detail}
            redeliveryFees={this.state.orderDetails.total_shipping_charge}
            userDetail={this.state.orderDetails.shipping_address}
            type={
              this.state.orderDetails?.delivery_status_id ===
              ORDER_CONSTANTS.GENERALSTATUS_PENDING_CONFIRMATION
                ? "Confirm"
                : "Reschedule"
            }
          />
        )}

        {/* order cancel dialog with reasons */}
        {this.state.toggleCancelOrder && (
          <CancelOrderPopup
            toggleCancelOrder={this.state.toggleCancelOrder}
            closeCancelOrderPopup={this.closeCancelOrderPopup}
            orderId={this.state.orderDetails.id_order}
            processCancelOrder={this.processCancelOrder}
            user={this.user}
          />
        )}

        {/* return order rejection popup */}
        {this.state.toggleReturnRequestReject && (
          <ReturnRejectOrderPopup
            toggleReturnRejectOrder={this.state.toggleReturnRequestReject}
            closeReturnRejectOrderPopup={this.closeReturnRejectOrderPopup}
            order={this.state.orderDetails}
            processReturnRejectOrder={this.processOrder}
            user={this.user}
            type={
              this.state.deliveryStatus ===
              ORDER_CONSTANTS.GENERALSTATUS_ORDER_RETURN_REQUESTED
                ? "Return"
                : "Refund"
            }
          />
        )}

        {this.state.showPOD && (
          <ProofOfDeliveryPopup
            togglePodPopup={this.state.showPOD}
            closePodPopup={() => this.setState({ showPOD: false })}
            podDetails={this.state.orderDetails?.pod}
          />
        )}

        {/* return order accept popup */}
        {this.state.toggleReturnRequestAccept && (
          <ReturnAcceptOrderPopup
            toggleReturnAcceptOrder={this.state.toggleReturnRequestAccept}
            closeReturnAcceptOrderPopup={this.closeReturnAcceptOrderPopup}
            order={this.state.orderDetails}
            processReturnAcceptOrder={this.processOrder}
            user={this.user}
            type={
              this.state.deliveryStatus ===
              ORDER_CONSTANTS.GENERALSTATUS_ORDER_RETURN_REQUESTED
                ? "Return"
                : "Refund"
            }
          />
        )}

        {/* refund order modify popup */}
        {this.state.toggleModifyOrder && (
          <RefundModifyOrderPopup
            toggleModifyOrder={this.state.toggleModifyOrder}
            closeRefundModifyOrderPopup={this.closeRefundModifyPopup}
            order={this.state.orderDetails}
            processModifyOrder={this.processOrder}
            user={this.user}
            type={
              this.state.deliveryStatus ===
              ORDER_CONSTANTS.GENERALSTATUS_ORDER_RETURN_REQUESTED
                ? "Return"
                : "Refund"
            }
          />
        )}

        {/* change address popup */}
        {this.state.toggleChangeAddress && (
          <ChangeAddressPopup
            close={() =>
              this.setState({
                toggleChangeAddress: !this.state.toggleChangeAddress,
              })
            }
            fullName={this.state.orderDetails?.shipping_address?.full_name}
            contact={this.state.orderDetails?.shipping_address.contact_number}
            postalCode={this.state.orderDetails?.shipping_address.postal_code}
            addressDetails={
              this.state.orderDetails?.shipping_address.address_details
            }
            orderNumber={this.state.orderDetails?.order_number}
            unitNumber={this.state.orderDetails?.shipping_address.unit_number}
          />
        )}

        {/* popup to show success/err */}
        {this.state.isShowMsg && this.msgPopup()}
      </main>
    );
  }
}

export default withRouter(ArrangeShipment);

import React from "react";
import ls from "local-storage";
import DatePicker from "react-datepicker";
import { ProductAddEligibilityPopup } from "../../utils/ProductAddEligibilityPopup.js";
import { CustomerRoutes, MerchantRoutes } from "../../../Routes.js";
import { ApiCalls, Apis } from "../../utils/ApiCalls.js";
import {
  checkSellerPermission,
  Constants,
  SELLER_ACCESS_PERMISSIONS,
  Waybill,
} from "../../utils/Constants.js";
import { Modal } from "../../../customer/components/GenericComponents.js";
import { AiFillWarning } from "react-icons/ai";
import withRouter from "../../../Utils.js";
import { callingPrintWaybill } from "./PrintWaybill.js";

//ui components
import Navbar from "../../components/Navbar.js";
// import { Sidebar } from '../../components/Parts.js';
import Pagination from "../Ui/Pagination/merchant_orders_pages.js";

//icons
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
  MdOutlineRefresh,
  MdImage,
  MdOutlineBrokenImage,
  MdCalendarViewMonth,
} from "react-icons/md";
import {
  AiOutlineDashboard,
  AiOutlineShoppingCart,
  AiOutlineShop,
  AiOutlineSetting,
  AiOutlineQuestionCircle,
} from "react-icons/ai";
import { BsBoxSeam } from "react-icons/bs";
import { IoSwapVertical } from "react-icons/io5";
import {
  TbTruckDelivery,
  TbTruckOff,
  TbPrinter,
  TbReportSearch,
  TbReportAnalytics,
  TbError404,
} from "react-icons/tb";
import { RiBankLine } from "react-icons/ri";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import successGif from "../../../assets/success.gif";

import {
  //notification icons
  BsPatchCheckFill,
  BsFillQuestionCircleFill,
} from "react-icons/bs";

import { FaSearch } from "react-icons/fa";
import { loginRequired } from "../../utils/Helper.js";
import { ORDER_CONSTANTS } from "../../../constants/order_status";
import ConfirmOrderPopup from "./ConfirmOrderPopup";
import CancelOrderPopup from "./CancelOrderPopup";
import Loader from "../../../utils/loader";
import { toast } from "react-toastify";

class MyOrders extends React.Component {
  constructor(props) {
    super(props);
    loginRequired(props.page);

    this.pageTitle = "My Orders";

    document.title = `${this.pageTitle} | uShop`;

    this.user = ls(Constants.localStorage.user);
    if (this.user) this.user = JSON.parse(this.user);

    //list vars
    var tableView = ls("tableView");

    //list filters
    this.filters = {
      // page: 'product-list',
      id_category: null,
      product_name: "",
      sku: "",
      tab: ls("orders-tab") ?? "",
      // sortVariation: '',
      // sortStock: '',
      // sortSales: '',
    };

    this.filters_toship = {
      tab: ls("orders-toship-tab") ?? "toship-all",
    };

    this.filters_returnrefund = {
      tab: ls("orders-returnrefund-tab") ?? "returnrefund-all",
    };

    ls.remove("orders-tab");
    ls.remove("orders-toship-tab");
    ls.remove("orders-returnrefund-tab");

    this.state = {
      tableView: tableView ? tableView : "list",
      loading: true,
      page: 1,
      entries: 10,
      pages: 1,
      total: 0,
      selectedMenu: 1.1,
      searchValue: "",

      orderDetails: "",
      ordersSelected: [],

      products: [],
      category: [],
      notification: null,

      startDate: null,
      endDate: null,
      deliveryStartDate: null,
      deliveryEndDate: null,
      buyerName: "",
      buyerEmail: "",

      order_status: [],
      orderCounter: null,

      isReportListOpen: false,
      reportPopUpRef: React.createRef(null),

      //confirm pending order pop up variables
      togglePendingOrderConfirm: false,
      toggleCancelOrder: false,
      toggleMassPendingOrderConfirm: false,
      isShowMsg: false,
      message: "",
      orderPromises: [],
      isMassConfirmingOrder: false,

      isMassPrintingWaybill: false,
      massErr: "",
      isPrintingWayBill: [],

      showPrompt: false,
    };
  }

  arrayToCsv = (input) => {
    return input
      .map(
        (row) =>
          row
            .map(String) // Stringify all data
            .map((v) => v.replaceAll('"', '""')) // Handling double quotes
            .map((v) => `"${v}"`) // Resolve quotes
            .join(",") // commas between values
      )
      .join("\r\n"); // new line foreach row
  };

  downloadCSV = (res, api) => {
    // for download link
    let file = res.data.data?.file_url;
    if (file) {
      var pom = document.createElement("a");
      pom.href = file;
      pom.click();
    } else toast.error("No data to export");
  };

  exportOrderCSV = async () => {
    let subStatus = "";
    var stDate = "",
      edDate = "",
      delStDate = "",
      delEndDate = "";
    let url = Apis.sellerOrderExportDetail + "?";

    //set start and end date for the report
    url +=
      "search_by=order&search=" +
      this.state.searchValue +
      "&buyer_email=" +
      this.state.buyerEmail +
      "&buyer_name=" +
      this.state.buyerName;

    if (this.state.startDate) {
      stDate =
        this.state.startDate.getFullYear() +
        "-" +
        (this.state.startDate.getMonth() + 1) +
        "-" +
        this.state.startDate.getDate();
      url += "&start_date=" + stDate;
    }

    if (this.state.endDate) {
      edDate =
        this.state.endDate.getFullYear() +
        "-" +
        (this.state.endDate.getMonth() + 1) +
        "-" +
        this.state.endDate.getDate();
      url += "&end_date=" + edDate;
    }

    if (this.state.deliveryStartDate) {
      delStDate =
        this.state.deliveryStartDate.getFullYear() +
        "-" +
        (this.state.deliveryStartDate.getMonth() + 1) +
        "-" +
        this.state.deliveryStartDate.getDate();
      url += "&start_delivery_date=" + delStDate;
    }

    if (this.state.deliveryEndDate) {
      delEndDate =
        this.state.deliveryEndDate.getFullYear() +
        "-" +
        (this.state.deliveryEndDate.getMonth() + 1) +
        "-" +
        this.state.deliveryEndDate.getDate();
      url += "&end_delivery_date=" + delEndDate;
    }

    switch (this.filters.tab) {
      case "toship":
        url +=
          "&delivery_status=" + ORDER_CONSTANTS.GENERALSTATUS_ORDER_CONFIRMED;

        switch (this.filters_toship.tab) {
          case "toship-all":
            subStatus = "all";
            break;
          case "toship-pendingconfirmation":
            subStatus = "process";
            break;
          case "toship-orderconfirmed":
            subStatus = "complete";
            break;
          case "toship-pendingpickup":
            subStatus = "pending_pickup";
            break;
          default:
            subStatus = "all";
        }
        url += "&sub_status=" + subStatus;

        break;

      case "shipping":
        url +=
          "&delivery_status=" + ORDER_CONSTANTS.GENERALSTATUS_ORDER_SHIPPED;
        break;

      case "completed":
        url += "&delivery_status=" + ORDER_CONSTANTS.GENERALSTATUS_DELIVERED;
        break;

      case "cancellation":
        url += "&delivery_status=" + ORDER_CONSTANTS.GENERALSTATUS_CANCELLED;
        break;

      case "returnrefund":
        url += "&delivery_status=" + ORDER_CONSTANTS.GENERALSTATUS_RETURNED;
        switch (this.filters_returnrefund.tab) {
          case "returnrefund-all":
            subStatus = "all";
            break;
          case "returnrefund-toprocess":
            subStatus = "process";
            break;
          case "returnrefund-processed":
            subStatus = "complete";
            break;
          default:
            subStatus = "all";
        }
        url += "&sub_status=" + subStatus;
        break;

      default:
        console.log("default case order list");
    }

    //once backend ready, pass fd instead of null
    ApiCalls(
      {},
      url,
      "GET",
      {
        Authorization: "Bearer " + this.user.access,
      },
      this.downloadCSV
    );
  };

  checkbox_mirror_action = (e, id) => {
    setTimeout(() => {
      if (
        id === "div_mirror_one" &&
        document.getElementById("mirror-two").checked !==
          document.getElementById("mirror-one").checked
      ) {
        document.getElementById("mirror-two").click();
      }

      if (
        id === "div_mirror_two" &&
        document.getElementById("mirror-two").checked !==
          document.getElementById("mirror-one").checked
      ) {
        document.getElementById("mirror-one").click();
      }

      if (document.getElementById("mirror-two").checked) {
        document.getElementById("mirror-two-label").innerText = "Deselect All";
      } else {
        document.getElementById("mirror-two-label").innerText = "Select All";
      }

      var oi_checkbox = document.getElementsByClassName("order-item-checkbox");

      for (let i = 0; i < oi_checkbox.length; i++) {
        if (
          oi_checkbox[i].checked !==
          document.getElementById("mirror-one").checked
        ) {
          oi_checkbox[i].click();
        }
      }
    }, 200);
  };

  displayMirrors_toggle = (action) => {
    if (action === "ON") {
      document.getElementById("mirror-two-label").innerText = "Deselect All";

      if (document.getElementById("mirror-two").checked !== true) {
        document.getElementById("mirror-one").checked = true;
        document.getElementById("mirror-two").checked = true;
      }
    }

    if (action === "OFF") {
      document.getElementById("mirror-two-label").innerText = "Select All";

      if (document.getElementById("mirror-two").checked === true) {
        document.getElementById("mirror-one").checked = false;
        document.getElementById("mirror-two").checked = false;
      }
    }
  };

  handleSelected = (e, orderItem, totalProducts) => {
    if (
      (orderItem.delivery_status_id ===
        ORDER_CONSTANTS.GENERALSTATUS_PENDING_CONFIRMATION &&
        this.filters.tab === "") ||
      (this.filters.tab === "toship" &&
        (this.filters_toship.tab === "toship-orderconfirmed" ||
          this.filters_toship.tab === "toship-pendingpickup" ||
          this.filters_toship.tab === "toship-pendingconfirmation"))
    ) {
      var currentlySelectedOrders = [];
      currentlySelectedOrders = this.state.ordersSelected;

      const foundElem = currentlySelectedOrders.findIndex(
        (ele) => ele.order_id === orderItem.order_id
      );
      if (foundElem >= 0) {
        var ordersAfterDeselection = currentlySelectedOrders.filter(
          (ele) => ele.order_id !== orderItem.order_id
        );
        this.setState({ ordersSelected: ordersAfterDeselection, massErr: "" });
      } else {
        var newlySelectedOrders = [];
        newlySelectedOrders = currentlySelectedOrders;
        newlySelectedOrders.push(orderItem);
        this.setState({ ordersSelected: newlySelectedOrders, massErr: "" });
      }

      setTimeout(() => {
        if (this.state.ordersSelected.length === 0) {
          this.displayMirrors_toggle("OFF");
        } else if (this.state.ordersSelected.length === totalProducts) {
          this.displayMirrors_toggle("ON");
        } else if (
          this.state.ordersSelected.length !== totalProducts &&
          document.getElementById("mirror-one").checked
        ) {
          this.displayMirrors_toggle("OFF");
        }
      }, 300);
    }
  };

  loadTab = (whichTab) => {
    this.filters.tab = whichTab;
    this.toPage(1);
    this.loadTabToShip("toship-all", false);
    this.loadTabReturnRefund("returnrefund-all", false);

    setTimeout(() => this.loadSettings(), 1000);
  };

  loadTabToShip = (toShipTab, isLoadPage) => {
    this.filters_toship.tab = toShipTab;
    if (isLoadPage) this.toPage(1);
  };

  loadTabReturnRefund = (whichTab, isLoadPage) => {
    this.filters_returnrefund.tab = whichTab;
    if (isLoadPage) this.toPage(1);
  };

  loadSettings = async (e) => {
    let fd = new FormData();
    let subStatus = "";
    var stDate = "",
      edDate = "",
      delStDate = "",
      delEndDate = "";

    switch (this.filters.tab) {
      case "toship":
        fd.append(
          "delivery_status",
          ORDER_CONSTANTS.GENERALSTATUS_ORDER_CONFIRMED
        );
        switch (this.filters_toship.tab) {
          case "toship-all":
            subStatus = "all";
            break;
          case "toship-pendingconfirmation":
            subStatus = "process";
            break;
          case "toship-orderconfirmed":
            subStatus = "complete";
            break;
          case "toship-pendingpickup":
            subStatus = "pending_pickup";
            break;
          default:
            subStatus = "all";
        }
        fd.append("sub_status", subStatus);
        break;

      case "shipping":
        fd.append(
          "delivery_status",
          ORDER_CONSTANTS.GENERALSTATUS_ORDER_SHIPPED
        );
        break;

      case "completed":
        fd.append("delivery_status", ORDER_CONSTANTS.GENERALSTATUS_DELIVERED);
        break;

      case "cancellation":
        fd.append("delivery_status", ORDER_CONSTANTS.GENERALSTATUS_CANCELLED);
        break;

      case "returnrefund":
        fd.append("delivery_status", ORDER_CONSTANTS.GENERALSTATUS_RETURNED);
        switch (this.filters_returnrefund.tab) {
          case "returnrefund-all":
            subStatus = "all";
            break;
          case "returnrefund-toprocess":
            subStatus = "process";
            break;
          case "returnrefund-processed":
            subStatus = "complete";
            break;
          default:
            subStatus = "all";
        }
        fd.append("sub_status", subStatus);
        break;

      default:
        console.log("default case order list");
    }

    fd.append("list_length", this.state.entries);
    fd.append("page", this.state.page);

    if (this.state.searchValue) {
      fd.append("search", this.state.searchValue);
    }

    if (this.state.startDate) {
      stDate =
        this.state.startDate.getFullYear() +
        "-" +
        (this.state.startDate.getMonth() + 1) +
        "-" +
        this.state.startDate.getDate();
      fd.append("start_date", stDate);
    }

    if (this.state.endDate) {
      edDate =
        this.state.endDate.getFullYear() +
        "-" +
        (this.state.endDate.getMonth() + 1) +
        "-" +
        this.state.endDate.getDate();
      fd.append("end_date", edDate);
    }

    if (this.state.deliveryStartDate) {
      delStDate =
        this.state.deliveryStartDate.getFullYear() +
        "-" +
        (this.state.deliveryStartDate.getMonth() + 1) +
        "-" +
        this.state.deliveryStartDate.getDate();
      fd.append("start_delivery_date", delStDate);
    }

    if (this.state.deliveryEndDate) {
      delEndDate =
        this.state.deliveryEndDate.getFullYear() +
        "-" +
        (this.state.deliveryEndDate.getMonth() + 1) +
        "-" +
        this.state.deliveryEndDate.getDate();
      fd.append("end_delivery_date", delEndDate);
    }

    fd.append("search_by", "order");
    fd.append("buyer_name", this.state.buyerName ?? "");
    fd.append("buyer_email", this.state.buyerEmail ?? "");

    await ApiCalls(
      fd,
      Apis.sellerOrderList,
      "POST",
      { Authorization: "Bearer " + this.user.access },
      this.processResponse,
      e ? e.target : null
    );
  };

  processResponse = (res, api) => {
    var rdata = res.data;

    //for pagination
    let pg = this.state.page;
    let nxtPageCount = rdata.total_records % this.state.entries;
    let currentPage = parseInt(rdata.total_records / this.state.entries);
    if (nxtPageCount >= 0 && currentPage !== pg - 1) pg += 1;

    var isPrinting = [];
    rdata.data.forEach((_) => isPrinting.push(false));

    this.setState({
      loading: false,
      products: rdata.data,
      order_status: rdata.order_status,
      total: rdata.total_records,
      pages: pg,
      ordersSelected: [],
      selectedMenu:
        this.filters.tab === "cancellation"
          ? 1.2
          : this.filters.tab === "returnrefund"
          ? 1.3
          : 1.1,
      massErr: "",
      isPrintingWayBill: isPrinting,
      orderCounter: rdata.order_counter,
    });
  };

  changeEntries = (e) => {
    this.setState(
      {
        page: 1,
        entries: e.target.value,
        loading: true,
        ordersSelected: [],
      },
      () => {
        this.loadSettings();
      }
    );
  };

  closeConfirmOrderPopup = () =>
    this.setState({
      togglePendingOrderConfirm: false,
      toggleMassPendingOrderConfirm: false,
    });

  closeCancelOrderPopup = () => this.setState({ toggleCancelOrder: false });

  processCancelOrder = (res, api) => {
    this.setState({
      isShowMsg: true,
      message: res.data,
    });
    if (res.data.result === "SUCCESS") this.loadSettings();

    setTimeout(() => {
      this.setState({ isShowMsg: false });
    }, 2000);
  };

  processSingleConfirmOrder = (res, api) => {
    this.setState({
      isShowMsg: true,
      message: res.data,
    });
    if (res.data.result === "SUCCESS") this.loadSettings();

    setTimeout(() => {
      this.setState({ isShowMsg: false });
    }, 2000);
  };

  processConfirmOrder = (res, api) => {
    var promises = [...this.state.orderPromises, res.data];
    this.setState({
      orderPromises: promises,
    });
  };

  completeMassOrderConfirm = () => {
    let successCount = 0;
    var errMsg = "";
    for (var j = 0; j < this.state.orderPromises.length; j++) {
      if (this.state.orderPromises[j].result === "SUCCESS") successCount++;
      else errMsg = this.state.orderPromises[j].message;
    }

    this.setState({
      isShowMsg: true,
      message: {
        result: successCount === 0 ? "FAIL" : "SUCCESS",
        message:
          successCount === 0
            ? errMsg
            : `${successCount} of the selected orders confirmed successfully.
                     ${
                       successCount === this.state.orderPromises.length
                         ? ""
                         : "Others failed"
                     }`,
      },
    });

    this.displayMirrors_toggle("OFF");
    this.checkbox_mirror_action(null, "div_mirror_one");

    setTimeout(() => {
      this.setState({
        isShowMsg: false,
        message: "",
        orderPromises: [],
        ordersSelected: [],
      });
      this.loadSettings();
    }, 2000);
  };

  handleSearchValue = (e) => {
    this.setState({
      searchValue: e.target.value,
    });
  };

  handleBuyerField = (e, key) => {
    this.setState({
      [key]: e.target.value,
    });
  };

  resetSearch = () => {
    this.setState(
      {
        searchValue: "",
        startDate: null,
        endDate: null,
        deliveryEndDate: null,
        deliveryStartDate: null,
        buyerMailPhone: "",
      },
      () => {
        this.loadSettings();
      }
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

  renderOrdersFilter = () => {
    return (
      <>
        <ul className="tabs mb-4">
          <li
            onClick={(e) => this.loadTab("")}
            id="ordersTab_all"
            className={this.filters.tab === "" ? "active" : ""}
          >
            All
            <div className="border"></div>
          </li>
          {/* <li onClick={e => this.loadTab('unpaid')}
                    className={(this.filters.tab === 'unpaid') ? 'active' : ''}>Unpaid <div className='border'></div></li> */}
          <li
            onClick={(e) => this.loadTab("toship")}
            className={this.filters.tab === "toship" ? "active" : ""}
          >
            To Ship <div className="border"></div>
          </li>
          <li
            onClick={(e) => this.loadTab("shipping")}
            className={this.filters.tab === "shipping" ? "active" : ""}
          >
            Shipping <div className="border"></div>
          </li>
          <li
            onClick={(e) => this.loadTab("completed")}
            className={this.filters.tab === "completed" ? "active" : ""}
          >
            Completed <div className="border"></div>
          </li>
          <li
            onClick={(e) => this.loadTab("cancellation")}
            id="ordersTab_cancellation"
            className={this.filters.tab === "cancellation" ? "active" : ""}
          >
            Cancellation <div className="border"></div>
          </li>
          <li
            onClick={(e) => this.loadTab("returnrefund")}
            id="ordersTab_returnRefund"
            className={this.filters.tab === "returnrefund" ? "active" : ""}
          >
            Return/Refund <div className="border"></div>
          </li>
        </ul>
      </>
    );
  };

  renderProducts = () => {
    var prod_to_display = this.state.products;
    if (prod_to_display.length === 0) return this.noProduct();

    return (
      <>
        {prod_to_display.map((item, i) => {
          const isDisable =
            item.delivery_status_id !==
              ORDER_CONSTANTS.GENERALSTATUS_PENDING_CONFIRMATION &&
            this.filters.tab === "";
          return [
            <tr>
              <th colSpan="6">
                <div className="bg-[#D9D9D9] h-11 w-fill p-3 flex items-center gap-20">
                  <p
                    className="text-left text-black font-semibold text-base cp"
                    onClick={(e) =>
                      this.orderDetailNavigation(item.order_number)
                    }
                  >
                    Order ID &nbsp;&nbsp; {item.order_number}
                  </p>

                  <p className="text-left text-black text-sm font-semibold text-base cp">
                    Pickup Date & Time: &nbsp;&nbsp;
                    {item?.seller_detail?.pickup_datetime_formated}
                  </p>
                </div>
              </th>
            </tr>,

            <tr>
              <td>
                <div
                  className={`custom-checkbox ${
                    isDisable && "disable-custom-checkbox"
                  }`}
                  onClick={(e) =>
                    this.handleSelected(e, item, prod_to_display.length)
                  }
                >
                  <input
                    className="order-item-checkbox"
                    id={"select-" + i}
                    type="checkbox"
                    disabled={isDisable}
                  />
                  <span className="checkmark"></span>
                </div>
              </td>

              <td>
                <div className="col-product flex flex-row">
                  <div className="img">
                    {item.product_item[0].cover_img ? (
                      <>
                        <img
                          src={item.product_item[0].cover_img}
                          alt=""
                          loading="lazy"
                          onError={(e) => this.showBrokenImage(e)}
                        />
                      </>
                    ) : (
                      <>
                        <MdImage />
                      </>
                    )}
                    <MdOutlineBrokenImage className="hidden broken-img" />
                  </div>
                  <div className="desc">
                    <div
                      className="name text-black"
                      onClick={(e) =>
                        this.orderDetailNavigation(item.order_number)
                      }
                    >
                      {item.product_item[0].product_detail.name}&nbsp;
                      <span className="text-[#828282]">
                        ({item.product_item[0].quantity})&nbsp;
                      </span>
                      {item.product_item.length > 1 && <p>& others</p>}
                    </div>
                  </div>
                </div>
              </td>

              <td className="text-center">
                ${parseFloat(item.formatted_total_paid).toFixed(2)}
              </td>

              <td className="text-black text-center">{item.order_delivery}</td>

              <td className="text-black text-center">{item.shipping_mode}</td>

              <td>
                <div>
                  <div
                    className="col-orders-actions cp"
                    onClick={(e) =>
                      this.orderDetailNavigation(item.order_number)
                    }
                  >
                    <div className="img">
                      <TbReportSearch />
                    </div>
                    <div>
                      {/* <a href="http://localhost:3000/seller/orders/shipping/arrange/">Check Details</a> */}
                      Check Details
                    </div>
                  </div>

                  {item.delivery_status_id ===
                  ORDER_CONSTANTS.GENERALSTATUS_PENDING_CONFIRMATION ? (
                    <div>
                      <div
                        className="col-orders-actions cp"
                        onClick={(e) => this.singleOrderConfirm(e, item)}
                      >
                        <div className="img">
                          <TbTruckDelivery />
                        </div>
                        <div>
                          <p>Confirm</p>
                        </div>
                      </div>

                      <div
                        className="col-orders-actions cp"
                        onClick={(e) => this.singleOrderCancel(e, item)}
                      >
                        <div className="img">
                          <TbTruckOff />
                        </div>
                        <div>
                          <p>Cancel</p>
                        </div>
                      </div>
                    </div>
                  ) : item.delivery_status_id ===
                      ORDER_CONSTANTS.GENERALSTATUS_ORDER_CONFIRMED ||
                    item.delivery_status_id ===
                      ORDER_CONSTANTS.GENERALSTATUS_ORDER_PENDING_PICKUP ||
                    item.delivery_status_id ===
                      ORDER_CONSTANTS.GENERALSTATUS_ORDER_DELIVERY_RESCHEDULED ? (
                    <div
                      className="col-orders-actions cp"
                      onClick={(e) =>
                        callingPrintWaybill(
                          Waybill.single,
                          item.order_id,
                          this.setIsPrintingWaybill,
                          i
                        )
                      }
                    >
                      {this.state.isPrintingWayBill[i] ? (
                        <div className="w-24 text-center">
                          <Loader color="#f5ab35" height="15px" width="15px" />
                        </div>
                      ) : (
                        <>
                          <div className="img">
                            <TbPrinter />
                          </div>
                          <div>
                            <p>Print Waybill </p>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </td>
            </tr>,
          ];
        })}
      </>
    );
  };

  noProduct = () => {
    const contents = (
      <div className="no-data col-span-5">
        <div>No Available Data</div>
        <div>
          <div className="btn site-btn" onClick={(e) => this.loadSettings()}>
            <span className="button__text">
              <MdOutlineRefresh />
              <span>Reload</span>
            </span>
          </div>
        </div>
      </div>
    );
    return (
      <>
        {this.state.tableView === "list" ? (
          <>
            <tr>
              <td colSpan={8}>{contents}</td>
            </tr>
          </>
        ) : (
          <>{contents}</>
        )}
      </>
    );
  };

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

  renderSkeletonGrid = () => {
    var fillers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    return (
      <>
        {fillers.map((item, i) => (
          <div className="grid-item" key={i}>
            <div className="img">
              <MdImage />
            </div>
            <div className="content">
              <div className="skeleton-ui skeleton-title"></div>
              <div className="skeleton-ui skeleton-full"></div>
              <div className="skeleton-ui skeleton-full"></div>
            </div>
          </div>
        ))}
      </>
    );
  };

  setIsPrintingWaybill = (value, index) => {
    let wayBillsPrinting = this.state.isPrintingWayBill;
    wayBillsPrinting[index] = value;
    this.setState({
      isPrintingWayBill: wayBillsPrinting,
    });
  };

  setIsMassPrintingWaybill = (value) => {
    this.setState({
      isMassPrintingWaybill: value,
    });
  };

  triggerMultipleWaybillDownload = (e) => {
    if (this.state.ordersSelected.length > 0) {
      let orderIds = "";

      this.state.ordersSelected.forEach(
        (item) => (orderIds += `${item.order_id},`)
      );
      orderIds = orderIds.substring(0, orderIds.length - 1);

      callingPrintWaybill(
        Waybill.multiple,
        orderIds,
        this.setIsMassPrintingWaybill
      );
    } else {
      this.setState({ massErr: "Select an order to print waybill" });
    }
  };

  singleOrderCancel = async (e, order) => {
    this.setState({
      orderDetails: order,
      toggleCancelOrder: true,
    });
  };

  singleOrderConfirm = async (e, order) => {
    this.setState({
      orderDetails: order,
      togglePendingOrderConfirm: true,
    });
  };

  orderDetailNavigation = async (orderNumber) => {
    this.props.navigate(
      MerchantRoutes.ArrangeShipping.replace(":orderNumber", orderNumber)
    );
  };

  showBrokenImage = (e) => {
    var targetParent = e.target.parentElement;
    targetParent.lastChild.classList.remove("hidden");
  };

  massPendingOrderConfirm = () => {
    if (this.state.ordersSelected.length > 0) {
      this.setState({
        toggleMassPendingOrderConfirm: true,
        orderDetails: this.state.ordersSelected,
      });
    } else {
      this.setState({ massErr: "Select an order to confirm" });
    }
  };

  componentDidMount = () => {
    this.loadSettings();

    // set filters
    if (this.filters.product_name !== "") {
      document.getElementById("product_name").value = this.filters.product_name;
    }
  };

  Sidebar = () => {
    const parentMenu =
      this.state.selectedMenu === null ? 0 : parseInt(this.state.selectedMenu);

    const setActiveMenu = (e, url) => {
      // For Orders page, implement logic to use setState rather than redirect when
      // navigating to either Cancellation or Return/Refund
      if (parentMenu === 1 && url.substring(0, 15) === "/seller/orders/") {
        // to set state rather than navigate to url for cancellation / return&refund

        if (url.substring(15) === "return_refund/") {
          var returnRefund_tab = document.getElementById(
            "ordersTab_returnRefund"
          );
          returnRefund_tab.click();
          this.setState({
            selectedMenu: 1.3,
          });
        } else if (url.substring(15) === "cancellation/") {
          var cancellation_tab = document.getElementById(
            "ordersTab_cancellation"
          );
          cancellation_tab.click();
          this.setState({
            selectedMenu: 1.2,
          });
        } else {
          document.getElementById("ordersTab_all").click();
          this.setState({
            selectedMenu: 1.1,
          });
        }
      } else {
        e.preventDefault();
        setTimeout(() => {
          document.getElementById("browser").href = url;
          document.getElementById("browser").click();
        }, 300);
      }
    };

    if (this.state.selectedMenu !== 3.2) ls.remove("m-add-product");
    return (
      <>
        <div className="m-sidebar h-screen animate__animated animate__fadeInLeft">
          <a href="/" id="browser" className="hidden">
            for browser history
          </a>
          <div
            className={parentMenu === 0 ? "active" : ""}
            onClick={(e) => setActiveMenu(e, MerchantRoutes.Landing)}
          >
            <div>
              <AiOutlineDashboard />
              Dashboard
            </div>
          </div>
          {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.ORDERS) && (
            <div className={parentMenu === 1 ? "active parent" : ""}>
              <div>
                <AiOutlineShoppingCart />
                Orders
                <MdOutlineKeyboardArrowDown className="has-child caret-down" />
                <MdOutlineKeyboardArrowUp className="has-child caret-up" />
              </div>

              <ul>
                <li
                  className={
                    this.state.selectedMenu === 1.1
                      ? "orange-bg active-menu"
                      : ""
                  }
                >
                  <span
                    onClick={(e) => setActiveMenu(e, MerchantRoutes.Orders)}
                  >
                    My Orders
                  </span>
                </li>
                <li
                  className={
                    this.state.selectedMenu === 1.2
                      ? "orange-bg active-menu"
                      : ""
                  }
                >
                  <span
                    onClick={(e) =>
                      setActiveMenu(e, MerchantRoutes.Cancellation)
                    }
                  >
                    Cancellation
                  </span>
                </li>
                <li
                  className={
                    this.state.selectedMenu === 1.3
                      ? "orange-bg active-menu"
                      : ""
                  }
                >
                  <span
                    onClick={(e) =>
                      setActiveMenu(e, MerchantRoutes.ReturnRefund)
                    }
                  >
                    Return/Refund
                  </span>
                </li>
              </ul>
            </div>
          )}
          {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.PRODUCTS) && (
            <div className={parentMenu === 2 ? "active parent" : ""}>
              <div>
                <BsBoxSeam />
                Products
                <MdOutlineKeyboardArrowDown className="has-child caret-down" />
                <MdOutlineKeyboardArrowUp className="has-child caret-up" />
              </div>

              <ul>
                <li
                  className={
                    this.state.selectedMenu === 2.1
                      ? "orange-bg active-menu"
                      : ""
                  }
                >
                  <span
                    onClick={(e) => setActiveMenu(e, MerchantRoutes.Products)}
                  >
                    My Products
                  </span>
                </li>
                <li
                  className={
                    this.state.selectedMenu === 2.2
                      ? "orange-bg active-menu"
                      : ""
                  }
                >
                  <span
                    onClick={(e) => {
                      let profile_status = ls("merchant_setup");
                      if (profile_status === "Y") {
                        setActiveMenu(e, MerchantRoutes.AddProduct);
                      } else this.setState({ showPrompt: true });
                    }}
                  >
                    Add Product
                  </span>
                </li>
                <li
                  className={
                    this.state.selectedMenu === 2.3
                      ? "orange-bg active-menu"
                      : ""
                  }
                >
                  <span
                    onClick={(e) => setActiveMenu(e, MerchantRoutes.Categories)}
                  >
                    Categories
                  </span>
                </li>
              </ul>
            </div>
          )}
          {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.SHIPMENT) && (
            <div className={parentMenu === 3 ? "active " : ""}>
              <div
                onClick={(e) =>
                  setActiveMenu(e, MerchantRoutes.ShippingSettings)
                }
              >
                <TbTruckDelivery />
                Shipment Settings
              </div>
            </div>
          )}
          {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.SHOP) && (
            <div className={parentMenu === 4 ? "active parent" : ""}>
              <div
                onClick={(e) => setActiveMenu(e, MerchantRoutes.ShopProfile)}
              >
                <AiOutlineShop />
                Shop
                <MdOutlineKeyboardArrowDown className="has-child caret-down" />
                <MdOutlineKeyboardArrowUp className="has-child caret-up" />
              </div>

              <ul>
                <li
                  className={parentMenu === 4.1 ? "orange-bg active-menu" : ""}
                >
                  <span
                    onClick={(e) =>
                      setActiveMenu(e, MerchantRoutes.ShopProfile)
                    }
                  >
                    Shop Profile
                  </span>
                </li>
                <li
                  className={parentMenu === 4.2 ? "orange-bg active-menu" : ""}
                >
                  <span
                    onClick={(e) => setActiveMenu(e, MerchantRoutes.ShopRating)}
                  >
                    Shop Rating
                  </span>
                </li>
                <li
                  className={parentMenu === 4.3 ? "orange-bg active-menu" : ""}
                >
                  <span
                    onClick={(e) =>
                      setActiveMenu(
                        e,
                        CustomerRoutes.ShopDetails + this.user.shop_slug + "/"
                      )
                    }
                  >
                    View My Shop
                  </span>
                </li>
                {!ls("sub-seller-permission") && (
                  <li
                    className={
                      parentMenu === 4.4 ? "orange-bg active-menu" : ""
                    }
                  >
                    <span
                      onClick={(e) =>
                        setActiveMenu(e, MerchantRoutes.SubAdminList)
                      }
                    >
                      Sub-Admin Setting
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}
          {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.FINANCE) && (
            <div className={parentMenu === 5 ? "active" : ""}>
              <div onClick={(e) => setActiveMenu(e, MerchantRoutes.Finance)}>
                <RiBankLine />
                Finance
              </div>
            </div>
          )}
          {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.MARKETING) && (
            <div className={parentMenu === 6 ? "active" : ""}>
              <div className="flex">
                <TbReportAnalytics size={20} />
                Marketing Centre
                <MdOutlineKeyboardArrowDown size={20} className="has-child" />
              </div>
              <ul>
                <li
                  className={parentMenu === 6.1 ? "orange-bg active-menu" : ""}
                >
                  <span
                    onClick={(e) => {
                      ls("completed_tour", "y");
                      setActiveMenu(e, MerchantRoutes.VoucherSeller);
                    }}
                  >
                    Vouchers
                  </span>
                </li>
                <li
                  className={parentMenu === 6.2 ? "orange-bg active-menu" : ""}
                >
                  <span
                    onClick={(e) => {
                      ls("completed_tour", "y");
                      setActiveMenu(e, MerchantRoutes.BannerAds);
                    }}
                  >
                    Banner Ads
                  </span>
                </li>
                <li
                  className={parentMenu === 6.3 ? "orange-bg active-menu" : ""}
                >
                  <span
                    onClick={(e) => {
                      ls("completed_tour", "y");
                      setActiveMenu(e, MerchantRoutes.GroupBuys);
                    }}
                  >
                    Group Buys
                  </span>
                </li>
              </ul>
            </div>
          )}
          {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.SETTINGS) && (
            <div className={parentMenu === 7 ? "active" : ""}>
              <div onClick={(e) => setActiveMenu(e, MerchantRoutes.Settings)}>
                <AiOutlineSetting />
                Settings
              </div>
            </div>
          )}
          <div className={parentMenu === 8 ? "active" : ""}>
            <div
              onClick={(e) =>
                setActiveMenu(
                  e,
                  MerchantRoutes.ContactUs.replace(":tab", "contact-us")
                )
              }
            >
              <AiOutlineQuestionCircle />
              Support
            </div>
          </div>
        </div>
      </>
    );
  };

  //table
  toPage = (page) => {
    this.setState(
      {
        page: page,
        loading: true,
        ordersSelected: [],
      },
      () => {
        this.loadSettings();
      }
    );
  };

  updateSearchBarField = (searchByVal) => {
    this.setState({
      searchValue: "",
    });
  };

  selectsDateRange = (dates) => {
    try {
      const [start, end] = dates;
      // Range from today to 6 months prior
      this.setState({
        startDate: start,
        endDate: end,
      });
    } catch (e) {
      console.log("Error message: " + e);
    }
  };

  selectsDeliveryDateRange = (dates) => {
    try {
      const [start, end] = dates;
      // Range from today to 6 months prior
      this.setState({
        deliveryStartDate: start,
        deliveryEndDate: end,
      });
    } catch (e) {
      console.log("Error message: " + e);
    }
  };

  body = () => {
    let notificationClass = "notification";
    let notificationIcon = null;

    if (this.state.notification !== null) {
      if (this.state.notification.result === "success")
        notificationIcon = <BsPatchCheckFill />;
      if (this.state.notification.result === "warning")
        notificationIcon = <BsFillQuestionCircleFill />;
      notificationClass += " " + this.state.notification.result;
    }

    return (
      <>
        <div className="listing-page mt-5">
          <div className="body">
            {this.renderOrdersFilter()}
            {this.state.notification !== null ? (
              <>
                <div
                  className={notificationClass}
                  onClick={(e) => this.closeNotification(e)}
                >
                  {notificationIcon}
                  {this.state.notification.message}
                </div>
              </>
            ) : (
              <></>
            )}

            <div className="table-container">
              {/* Div for Order Creation Date filter */}
              {/* <div className="my-5 flex flex-row gap-2 flex-wrap">
                    <p className="mt-2">Order Creation Date</p>
                    <div>
                      <div
                        id="date-picker"
                        className="flex flex-row justify-between px-2 items-center"
                      >
                        <DatePicker
                          startDate={this.state.startDate}
                          endDate={this.state.endDate}
                          dateFormat="d/M/yyyy"
                          selectsRange
                          onChange={this.selectsDateRange}
                          width="100%"
                          placeholderText="From Date - To Date"
                          monthsShown={2}
                        />
                        <MdCalendarViewMonth color="#828282" />
                      </div>
                      <p className="text-xs text-red-600">
                        {this.state.dateErr}
                      </p>
                    </div>
                    <div
                      className="site-btn btn-border-primary mx-2 h-11"
                      onClick={(e) => this.exportOrderCSV("summary")}
                    >
                      <span className="button__text">Export Order Summary</span>
                    </div>
                    <div
                      className="site-btn btn-border-primary mx-2 h-11"
                      onClick={(e) => this.exportOrderCSV("detail")}
                    >
                      <span className="button__text">Export Order Details</span>
                    </div>
                  </div> */}

              {/* Div for OrderID filter */}
              <div className="mb-8 w-full flex items-center gap-5 flex-wrap">
                <div className="max-w-[300px]">
                  <label className="text-xs">Order ID</label>
                  <input
                    placeholder="Order ID"
                    type="text"
                    id="searchBarInput"
                    value={this.state.searchValue}
                    onChange={this.handleSearchValue}
                  />
                </div>

                <div className="max-w-[300px]">
                  <label className="text-xs">Order Creation Date</label>
                  <div
                    id="date-picker"
                    className="flex flex-row justify-between px-2 items-center"
                  >
                    <DatePicker
                      startDate={this.state.startDate}
                      endDate={this.state.endDate}
                      dateFormat="d/M/yyyy"
                      selectsRange
                      onChange={this.selectsDateRange}
                      width="100%"
                      placeholderText="From Date - To Date"
                      monthsShown={2}
                    />
                    <MdCalendarViewMonth color="#828282" />
                  </div>
                </div>

                <div className="max-w-[300px]">
                  <label className="text-xs">Delivery Date</label>
                  <div
                    id="date-picker"
                    className="flex flex-row justify-between px-2 items-center"
                  >
                    <DatePicker
                      startDate={this.state.deliveryStartDate}
                      endDate={this.state.deliveryEndDate}
                      dateFormat="d/M/yyyy"
                      selectsRange
                      onChange={this.selectsDeliveryDateRange}
                      width="100%"
                      placeholderText="From Date - To Date"
                      monthsShown={2}
                    />
                    <MdCalendarViewMonth color="#828282" />
                  </div>
                </div>

                <div className="max-w-[300px]">
                  <label className="text-xs">Buyer Name</label>
                  <input
                    placeholder="Buyer Name"
                    type="text"
                    value={this.state.buyerName}
                    onChange={(e) => this.handleBuyerField(e, "buyer_name")}
                  />
                </div>

                <div className="max-w-[300px]">
                  <label className="text-xs">Buyer Email</label>
                  <input
                    placeholder="Buyer Email"
                    type="text"
                    value={this.state.buyerEmail}
                    onChange={(e) => this.handleBuyerField(e, "buyer_email")}
                  />
                </div>
              </div>

              <div className="flex items-center gap-5 mb-5">
                <div
                  className="site-btn btn-default w-[150px]"
                  onClick={() => this.loadSettings()}
                >
                  <span className="button__text">Search</span>
                </div>

                <div
                  className="site-btn btn-border-primary w-[150px]"
                  onClick={this.resetSearch}
                >
                  <span className="button__text">Reset</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="bg-blue rounded px-3 py-2 text-sm text-center text-white"
                  onClick={this.exportOrderCSV}
                >
                  Download CSV
                </button>
              </div>

              {this.filters.tab === "toship" ? (
                <ul className="tabs-secondary mb-5">
                  <li
                    onClick={(e) => this.loadTabToShip("toship-all", true)}
                    className={
                      this.filters_toship.tab === "toship-all" ? "active" : ""
                    }
                  >
                    All ({this.state.orderCounter?.to_ship_all})
                    <div className="border"></div>
                  </li>
                  <li
                    onClick={(e) =>
                      this.loadTabToShip("toship-pendingconfirmation", true)
                    }
                    className={
                      this.filters_toship.tab === "toship-pendingconfirmation"
                        ? "active"
                        : ""
                    }
                  >
                    Pending Confirmation (
                    {this.state.orderCounter?.to_ship_pending_confirmation})
                    {/* <span>{(this.filters_toship.tab === 'toship-pendingconfirmation') && `(${this.state.products.length})`}</span>  */}
                    <div className="border"></div>
                  </li>
                  <li
                    onClick={(e) =>
                      this.loadTabToShip("toship-orderconfirmed", true)
                    }
                    className={
                      this.filters_toship.tab === "toship-orderconfirmed"
                        ? "active"
                        : ""
                    }
                  >
                    Order Confirmed (
                    {this.state.orderCounter?.to_ship_order_confirmed})
                    {/* <span>{(this.filters_toship.tab === 'toship-orderconfirmed') && `(${this.state.products.length})`}</span>  */}
                    <div className="border"></div>
                  </li>
                  {/* <li
                    onClick={(e) =>
                      this.loadTabToShip("toship-pendingpickup", true)
                    }
                    className={
                      this.filters_toship.tab === "toship-pendingpickup"
                        ? "active"
                        : ""
                    }
                  >
                    Pending Pickup (
                    {this.state.orderCounter?.to_ship_pending_pickup})
                    <span>{(this.filters_toship.tab === 'toship-pendingpickup') && `(${this.state.products.length})`}</span> 
                    <div className="border"></div>
                  </li> */}
                </ul>
              ) : (
                ""
              )}

              {this.filters.tab === "returnrefund" ? (
                <ul className="tabs-secondary mb-5">
                  <li
                    onClick={(e) =>
                      this.loadTabReturnRefund("returnrefund-all", true)
                    }
                    className={
                      this.filters_returnrefund.tab === "returnrefund-all"
                        ? "active"
                        : ""
                    }
                  >
                    All ({this.state.orderCounter?.return_all})
                    <div className="border"></div>
                  </li>
                  <li
                    onClick={(e) =>
                      this.loadTabReturnRefund("returnrefund-toprocess", true)
                    }
                    className={
                      this.filters_returnrefund.tab === "returnrefund-toprocess"
                        ? "active"
                        : ""
                    }
                  >
                    To Process ({this.state.orderCounter?.return_to_process}){" "}
                    <div className="border"></div>
                  </li>
                  <li
                    onClick={(e) =>
                      this.loadTabReturnRefund("returnrefund-processed", true)
                    }
                    className={
                      this.filters_returnrefund.tab === "returnrefund-processed"
                        ? "active"
                        : ""
                    }
                  >
                    Processed ({this.state.orderCounter?.return_processed}){" "}
                    <div className="border"></div>
                  </li>
                </ul>
              ) : (
                ""
              )}

              <table>
                <tr>
                  <td width="25%">
                    <h2 className="ordersDisplay !my-2">
                      {this.state.total} ORDERS
                    </h2>
                  </td>
                  <td width="52%">&nbsp;</td>
                  <td>
                    {this.filters.tab !== "" ? (
                      <div className="site-btn btn-border-primary sortByBtnDimen">
                        <tr>
                          <td>
                            {/* <td className="sm:none md:pl-1 lg:pl-3 xl:pl-4"> */}
                            &nbsp;
                          </td>
                          <td className="px-2">
                            <IoSwapVertical />
                          </td>
                          <td className="text-center">
                            <span className="button__text">Sort By</span>
                          </td>
                        </tr>
                      </div>
                    ) : (
                      ""
                    )}
                  </td>
                </tr>
              </table>

              <Pagination
                entries={this.state.entries}
                changeEntries={this.changeEntries}
                toPage={this.toPage}
                pages={this.state.pages}
                page={this.state.page}
                total={this.state.total}
              />

              <div
                className={`scrollable-table ${
                  this.state.tableView === "grid" ? "grid-height" : ""
                }`}
              >
                <table>
                  <thead>
                    <tr>
                      <td width="5%">
                        <div
                          className="custom-checkbox"
                          onClick={(e) =>
                            this.checkbox_mirror_action(e, "div_mirror_one")
                          }
                        >
                          <input id="mirror-one" type="checkbox" />
                          <span className="checkmark"></span>
                        </div>
                      </td>
                      <td width="20%" className="text-black font-semibold">
                        Product(s)
                      </td>
                      <td
                        width="15%"
                        className="text-center text-black font-semibold"
                      >
                        Order Total
                      </td>
                      <td
                        width="20%"
                        className="text-center text-black font-semibold"
                      >
                        Status
                      </td>
                      <td
                        width="20%"
                        className="text-center text-black font-semibold"
                      >
                        Shipping Mode
                      </td>
                      <td
                        width="20%"
                        className="text-center text-black font-semibold"
                      >
                        Actions
                      </td>
                    </tr>
                  </thead>

                  <tbody>
                    {this.state.loading ? (
                      <>{this.renderSkeletonTable()}</>
                    ) : (
                      <>
                        {this.state.products !== null &&
                        this.state.products.length > 0 ? (
                          <>{this.renderProducts()} </>
                        ) : (
                          <>{this.noProduct()}</>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              <table>
                {this.filters.tab === "toship" &&
                (this.filters_toship.tab === "toship-pendingconfirmation" ||
                  this.filters_toship.tab === "toship-orderconfirmed" ||
                  this.filters_toship.tab === "toship-pendingpickup") ? (
                  this.filters_toship.tab === "toship-pendingconfirmation" ? (
                    // Case 1: Mass Action buttons to be displayed for Confirm & Cancel
                    <tfoot className="margins-footer">
                      <tr className="margins-footer">
                        <td width="5%">
                          <div
                            className="custom-checkbox"
                            onClick={(e) =>
                              this.checkbox_mirror_action(e, "div_mirror_two")
                            }
                          >
                            <input id="mirror-two" type="checkbox" />
                            <span className="checkmark"></span>
                          </div>
                        </td>

                        <td width="15%">
                          <div id="mirror-two-label"> Select All </div>
                        </td>

                        <td width="28%">&nbsp;</td>

                        <td width="20%">
                          {this.state.ordersSelected.length}
                          {/* amend display text based on number of orders currently selected */}
                          {this.state.ordersSelected.length === 1
                            ? " product selected"
                            : " products selected"}
                        </td>

                        <td width="16%">
                          <div className="orders_pending">
                            <div
                              className="site-btn btn-red mx-2"
                              id="btn_mass_cancel"
                            >
                              <span className="button__text">Cancel</span>
                            </div>
                          </div>
                        </td>
                        <td width="16%">
                          <div
                            className="orders_pending"
                            onClick={this.massPendingOrderConfirm}
                          >
                            <div
                              className="site-btn btn-default mx-2"
                              id="btn_mass_confirm"
                            >
                              <span className="button__text">Confirm</span>
                            </div>
                          </div>
                        </td>
                        <td>&nbsp;</td>
                      </tr>
                    </tfoot>
                  ) : (
                    // Case 2: Mass Action button to be displayed for Print Waybill
                    <tfoot className="margins-footer mb-3">
                      <tr className="margins-footer">
                        <td width="5%">
                          <div
                            className="custom-checkbox"
                            onClick={(e) =>
                              this.checkbox_mirror_action(e, "div_mirror_two")
                            }
                          >
                            <input id="mirror-two" type="checkbox" />
                            <span className="checkmark"></span>
                          </div>
                        </td>

                        <td width="15%">
                          <div id="mirror-two-label"> Select All </div>
                        </td>

                        <td width="28%">&nbsp;</td>

                        <td width="20%">
                          {this.state.ordersSelected.length}
                          {/* amend display text based on number of orders currently selected */}
                          {this.state.ordersSelected.length === 1
                            ? " product selected"
                            : " products selected"}
                        </td>

                        <td width="16%">
                          <div className="orders_confirmed">
                            <div>&nbsp;</div>
                          </div>
                        </td>
                        <td width="16%">
                          <div className="orders_confirmed">
                            <button
                              className="site-btn btn-default mx-2 !disabled:bg-amber-300 w-40 h-11"
                              id="btn_mass_printwaybill"
                              onClick={this.triggerMultipleWaybillDownload}
                              disabled={this.state.isMassPrintingWaybill}
                            >
                              <span className="button__text">
                                {this.state.isMassPrintingWaybill ? (
                                  <Loader />
                                ) : (
                                  " Print Waybill"
                                )}
                              </span>
                            </button>
                          </div>
                        </td>
                        <td>&nbsp;</td>
                      </tr>
                    </tfoot>
                  )
                ) : this.filters.tab === "" ? (
                  <tfoot className="margins-footer">
                    <tr className="margins-footer">
                      <td width="5%">
                        <div
                          className="custom-checkbox"
                          onClick={(e) =>
                            this.checkbox_mirror_action(e, "div_mirror_two")
                          }
                        >
                          <input id="mirror-two" type="checkbox" />
                          <span className="checkmark"></span>
                        </div>
                      </td>

                      <td width="15%">
                        <div id="mirror-two-label"> Select All </div>
                      </td>

                      <td width="28%">&nbsp;</td>

                      <td width="20%">
                        {this.state.ordersSelected.length}
                        {/* amend display text based on number of orders currently selected */}
                        {this.state.ordersSelected.length === 1
                          ? " product selected"
                          : " products selected"}
                      </td>

                      <td width="16%">&nbsp;</td>
                      <td width="16%">
                        <div
                          className="orders_pending"
                          onClick={this.massPendingOrderConfirm}
                        >
                          <div
                            className="site-btn btn-default mx-2"
                            id="btn_mass_confirm"
                          >
                            <span className="button__text">Confirm</span>
                          </div>
                        </div>
                      </td>
                      <td>&nbsp;</td>
                    </tr>
                  </tfoot>
                ) : (
                  // Case 3: No Mass Action buttons to be displayed
                  <tfoot className="margins-footer">
                    <tr className="margins-footer">
                      <td width="5%">
                        <div
                          className="custom-checkbox"
                          onClick={(e) =>
                            this.checkbox_mirror_action(e, "div_mirror_two")
                          }
                        >
                          <input id="mirror-two" type="checkbox" />
                          <span className="checkmark"></span>
                        </div>
                      </td>

                      <td width="15%">
                        <div id="mirror-two-label"> Select All </div>
                      </td>

                      <td width="30%">&nbsp;</td>

                      <td width="20%">
                        {this.state.ordersSelected.length}
                        {/* amend display text based on number of orders currently selected */}
                        {this.state.ordersSelected.length === 1
                          ? " product selected"
                          : " products selected"}
                      </td>
                      <td width="30%">
                        <div>&nbsp;</div>
                      </td>
                      <td>&nbsp;</td>
                    </tr>
                  </tfoot>
                )}
              </table>
              {this.state.massErr && (
                <p className="text-red-600 text-sm text-center pb-3">
                  {this.state.massErr}
                </p>
              )}
            </div>
          </div>
        </div>

        {this.state.togglePendingOrderConfirm && (
          <ConfirmOrderPopup
            toggleConfirmOrder={this.state.togglePendingOrderConfirm}
            isSingleOrder={true}
            closeConfirmOrderPopup={this.closeConfirmOrderPopup}
            orderId={this.state.orderDetails.order_id}
            processConfirmOrder={this.processSingleConfirmOrder}
            user={this.user}
            sellerDetail={this.state.orderDetails.seller_detail}
            userDetail={this.state.orderDetails.shipping_address}
            redeliveryFees={this.state.orderDetails.total_shipping_charge}
            type="Confirm"
          />
        )}

        {this.state.toggleCancelOrder && (
          <CancelOrderPopup
            toggleCancelOrder={this.state.toggleCancelOrder}
            closeCancelOrderPopup={this.closeCancelOrderPopup}
            orderId={this.state.orderDetails.order_id}
            processCancelOrder={this.processCancelOrder}
            user={this.user}
          />
        )}

        {this.state.toggleMassPendingOrderConfirm && (
          <ConfirmOrderPopup
            toggleConfirmOrder={this.state.toggleMassPendingOrderConfirm}
            isSingleOrder={false}
            processConfirmOrder={this.processConfirmOrder}
            closeConfirmOrderPopup={this.closeConfirmOrderPopup}
            selectedOrders={this.state.orderDetails}
            user={this.user}
            completeMassOrderConfirm={this.completeMassOrderConfirm}
            type="Confirm"
          />
        )}

        {this.state.isShowMsg && this.msgPopup()}
      </>
    );
  };

  render() {
    var apiError = ls("apiError");
    if (apiError != null) ls.remove("apiError");
    let mcClass = this.props.level === 1 ? "main-contents" : "main-contents ws";
    return (
      <main className="app-merchant merchant-db">
        <Navbar theme="dashboard" />
        <this.Sidebar />
        <div className={mcClass}>
          <div className="breadcrumbs">
            <div className="page-title">{this.pageTitle}</div>

            <ul>
              <li>
                <a href={MerchantRoutes.Landing}>Home {">"}</a>
              </li>

              {this.props.level > 0 && <li>{this.pageTitle}</li>}
            </ul>
          </div>

          {this.body()}
        </div>

        {this.state.showPrompt && (
          <ProductAddEligibilityPopup
            toggle={() => this.setState({ showPrompt: false })}
            showPrompt={this.state.showPrompt}
          />
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
      </main>
    );
  }
}

export default withRouter(MyOrders);

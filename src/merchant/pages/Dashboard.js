import React from "react";
import ls from "local-storage";
import { ApiCalls, Apis } from "../utils/ApiCalls.js";

//utils
import { checkSellerPermission, Constants, SELLER_ACCESS_PERMISSIONS } from "../utils/Constants.js";

import { CustomerRoutes, MerchantRoutes } from "../../Routes.js";
//comp
import Navbar from "../components/Navbar.js";
import PopupMessage from "../components/PopupMessage.js";

//css
import "../../css/merchant.css";
import "../../css/animate.min.css";

import SignupSuccess from "../components/SignupSuccess.js";
import OnBoard from "../components/OnBoard.js";
import { TbError404 } from "react-icons/tb";
import { loginRequired } from "../utils/Helper.js";
import Chart from "chart.js/auto";
import Joyride, { ACTIONS, STATUS } from "react-joyride";

// icons
import {
  AiOutlineDashboard,
  AiOutlineShoppingCart,
  AiOutlineShop,
  AiOutlineSetting,
  AiOutlineQuestionCircle,
  // AiFillCaretUp,
  // AiFillCaretDown,
  // AiOutlineLeft,
  // AiOutlineRight,
} from "react-icons/ai";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import { BsBoxSeam } from "react-icons/bs";
import { TbTruckDelivery, TbReportAnalytics } from "react-icons/tb";
import { RiBankLine } from "react-icons/ri";
import { PageLoader } from "../../utils/loader.js";
import Select from "react-select";
import withRouter from "../../Utils.js";
import { ProductAddEligibilityPopup } from "../utils/ProductAddEligibilityPopup.js";
import ProdAnalysisWrapper from "../components/Dashboard/index.js";

const periodList = [
  { value: "weekly", label: "Weekly" },
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
];
class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    loginRequired(props.page);

    //this.validator = new srv();
    this.pageTitle = "Dashboard";

    document.title = `${this.pageTitle} | uShop`;

    this.user = ls(Constants.localStorage.user);
    if (this.user) this.user = JSON.parse(this.user);

    this.salesChart = null;
    this.visitorsChart = null;
    this.cancelledOrdersChart = null;

    this.state = {
      appPage: props.page,
      userJwt: null,

      //popup
      popupSeen: false,
      popupHead: "",
      popupMsg: "",
      popupResult: null,

      isDashboardDataLoading: true,
      graphData: null,
      widgetData: null,
      selectedChartPeriod: periodList[0],

      // webNotification: [],
      // expandedMessage: null,
      // page: 1,

      showPrompt: false,

      // tutorial | guided tour
      steps: [
        {
          target: ".sideNav-starting-step",
          content: (
            <div>
              <h1 className="font-bold text-xl">
                Guided tour of uShop for Merchants
              </h1>
              <br />
              This walkthrough will briefly explain how to manage your store on
              UShop.
            </div>
          ),
          disableBeacon: true,
          disableOverlayClose: true,
          hideCloseButton: true,
          placement: "auto",
        },
        {
          target: ".sideNav-first-step",
          content: (
            <div>
              <h1 className="font-bold text-xl">Set up your shop profile!</h1>
              <br />
              Under Shop Profile, you can set up your profile banners &
              decorations to showcase your branding to customers!
            </div>
          ),
          disableBeacon: true,
          disableOverlayClose: true,
          hideCloseButton: true,
          placement: "auto",
        },
        {
          target: ".sideNav-second-step",
          content: (
            <div>
              <h1 className="font-bold text-xl">
                Set up your shipment settings
              </h1>
              <br />
              It's important to configure the shipping options for your products
              and set up your address etc. here!
            </div>
          ),
          placement: "auto",
          disableOverlayClose: true,
          hideCloseButton: true,
          spotlightPadding: 0,
        },
        {
          target: ".sideNav-third-step",
          content: (
            <div>
              <h1 className="font-bold text-xl">Set up your bank details</h1>
              <br />
              Remember to set up your bank account details under Finance to
              receive your earnings!
            </div>
          ),
          placement: "auto",
          disableOverlayClose: true,
          hideCloseButton: true,
        },
        {
          target: ".sideNav-fourth-step",
          content: (
            <div>
              <h1 className="font-bold text-lg">Expand section</h1>
              <br />
              Click to expand 'Products' section and display more links
            </div>
          ),
          placement: "auto",
          disableOverlayClose: true,
          disableOverlay: true,
          hideCloseButton: true,
          showSkipButton: false,
          spotlightClicks: true,
          disableBeacon: false,
        },
        {
          target: ".sideNav-fifth-step",
          content: (
            <div>
              <h1 className="font-bold text-lg">Start listing your products</h1>
              <br />
              Navigate to Add Products to start selling your items!
            </div>
          ),
          placement: "auto",
          disableOverlayClose: true,
          hideCloseButton: true,
        },
        {
          target: ".sideNav-sixth-step",
          content: (
            <div>
              <h1 className="font-bold text-lg">
                Set up Shipping Settings for your shop
              </h1>
              <br />
              Provide the days and times that your shop will accept deliveries.
              You may also adjust the shipping fees here.
            </div>
          ),
          placement: "auto",
          disableOverlayClose: true,
          hideCloseButton: true,
        },

        // {
        //     target: '.sideNav-sixth-step',
        //     content: "Finally, it's time to start adding your products! Simply navigate to Add Products to start selling your items!",
        //     title: "UShop 2023",
        //     placement: "right",
        //     disableOverlayClose: true,
        //     hideCloseButton: true,
        // }
      ],
    };
  }

  // toggleMessage = (index) => {
  //   if (this.state.expandedMessage === index) {
  //     this.setState({ expandedMessage: null });
  //   } else {
  //     this.setState({ expandedMessage: index });
  //   }
  // };

  // prevPage = () => {
  //   this.setState({ page: this.state.page - 1 });
  // };

  // nextPage = () => {
  //   this.setState({ page: this.state.page + 1 });
  // };

  fetchDashboardData = () => {
    let fd = new FormData();
    ApiCalls(
      fd,
      Apis.dashboardData +
        `?filter=${this.state.selectedChartPeriod?.value}`,
      "GET",
      {
        Authorization: "Bearer " + this.user.access,
      },
      (res, api) => {
        if (res.data.result === "SUCCESS") {
          this.setState(
            {
              widgetData: res.data.data.widget_data,
              graphData: res.data.data.graph,
              isDashboardDataLoading: false,
              // webNotification: res.data.data.web_notification,
            },
            () => {
              this.setChartData();
            }
          );
        }
      }
    );
  };

  componentDidMount() {
    if (this.user.is_registered) this.fetchDashboardData();

    var checkUserTour = ls("user");
    if (checkUserTour) {
      var visitedTour = JSON.parse(checkUserTour)["visited_guide"];
      // to initiate guided tour / tutorial for 1st time Seller login
      if (visitedTour === "y" || ls("completed_tour") === "y") {
        // reset value of steps such that guided tour does not run
        this.setState({
          steps: "",
        });
      } else {
        ls("completed_tour", "n");
      }
    }

    if (ls("completed_tour") === "n") {
      if (document.getElementById("sidenav-mobile"))
        document.getElementById("sidenav-mobile").style.display = "block";
    }
  }

  // componentDidUpdate(prevProps, prevState) {
  //   // Check if there has been a change in the page
  //   if (prevState.page !== this.state.page) {
  //     // Call fetchDashboardData when the page changes
  //     if (this.user.is_registered) {
  //       this.fetchDashboardData();
  //     }
  //   }
  // }

  setChartData = () => {
    const data = this.state.graphData;

    this.salesChart = new Chart(document.getElementById("sales"), {
      type: "line",
      data: {
        labels: data?.graph_label?.map((label) => label),
        datasets: [
          {
            label: "Sales",
            data: data?.graph_value?.map((row) => row.total_sales),
            borderColor: "#F5A256",
          },
        ],
      },
      options: {
        scales: {
          y: {
            ticks: {
              // Include a dollar sign in the ticks
              callback: function (value, index, ticks) {
                return "$" + value;
              },
            },
          },
        },
      },
    });
   

    this.visitorsChart = new Chart(document.getElementById("visitors"), {
      type: "line",
      data: {
        labels: data?.graph_label?.map((label) => label),
        datasets: [
          {
            label: "Visitors",
            data: data?.graph_value?.map((row) => row.total_visitor),
            borderColor: "#828282",
          },
        ],
      },
    });

    this.cancelledOrdersChart = new Chart(document.getElementById("cancelled_orders"), {
      type: "line",
      data: {
        labels: data?.graph_label?.map((label) => label),
        datasets: [
          {
            label: "Cancelled Orders",
            data: data?.graph_value?.map((row) => row.cancelled_order),
            borderColor: "green",
          },
        ],
      },
    });
  };

  setChartPeriodSelection = (e) => {
    this.setState(
      {
        selectedChartPeriod: e,
      },
      () => {
        this.salesChart.destroy()
        this.visitorsChart.destroy()
        this.cancelledOrdersChart.destroy()
        
        this.fetchDashboardData()
      }
    );
  };

  cardNavigation = (to) => {
    switch (to) {
      case "new-orders":
        ls("orders-tab", "toship");
        ls("orders-toship-tab", "toship-pendingconfirmation");
        break;

      case "new-returns":
        ls("orders-tab", "returnrefund");
        ls("orders-returnrefund-tab", "returnrefund-toprocess");
        break;

      case "cancelled-orders":
        ls("orders-tab", "cancellation");
        break;

      case "sold-products":
        ls("soldout-page", "dashboard");
        this.props.navigate(MerchantRoutes.Products);
        return;

      case "shipment-pending":
        ls("orders-tab", "toship");
        ls("orders-toship-tab", "toship-pendingconfirmation");
        break;

      case "total-refund":
        ls("orders-tab", "returnrefund");
        ls("orders-returnrefund-tab", "returnrefund-processed");
        break;

      case "total-sales":
        ls("orders-tab", "completed");
        break;

      default:
        console.log("to ", to);
    }

    this.props.navigate(MerchantRoutes.Orders);
  };

  // instantiate side navigation bar to coincide with guided tour
  Sidebar = ({ selectedMenu }) => {
    const parentMenu = selectedMenu === null ? 0 : parseInt(selectedMenu);

    const setActiveMenu = (e, url) => {
      e.preventDefault();
      setTimeout(() => {
        document.getElementById("browser").href = url;
        document.getElementById("browser").click();
      }, 300);
    };

    function ordersRedirect(e, orderSubsection) {
      if (orderSubsection === "cancellation") {
        ls("orders_redirect", orderSubsection);
      }
      if (orderSubsection === "returnrefund") {
        ls("orders_redirect", orderSubsection);
      }
      setActiveMenu(e, MerchantRoutes.Orders);
    }

    return (
      <>
        {/* <div className='m-sidebar h-screen animate__animated animate__fadeInLeft '> */}
        <div className="m-sidebar h-screen" id="sidenav-mobile">
          <a href="/" id="browser" className="hidden">
            for browser history
          </a>
          <div
            className={
              parentMenu === 0
                ? "active sideNav-starting-step"
                : "sideNav-starting-step"
            }
            onClick={(e) => {
              ls("completed_tour", "y");
              setActiveMenu(e, MerchantRoutes.Landing);
            }}
            id="dashboard-sidenav"
          >
            <div>
              <AiOutlineDashboard />
              Dashboard
            </div>
          </div>
          {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.ORDERS) && 
          <div className={parentMenu === 1 ? "active parent" : ""}>
            <div>
              <AiOutlineShoppingCart />
              Orders
              <MdOutlineKeyboardArrowDown className="has-child caret-down" />
              <MdOutlineKeyboardArrowUp className="has-child caret-up" />
            </div>

            <ul>
              <li
                className={selectedMenu === 1.1 ? "orange-bg active-menu" : ""}
              >
                <span
                  onClick={(e) => {
                    ls("completed_tour", "y");
                    setActiveMenu(e, MerchantRoutes.Orders);
                  }}
                >
                  My Orders
                </span>
              </li>
              <li
                className={selectedMenu === 1.2 ? "orange-bg active-menu" : ""}
              >
                <span
                  onClick={(e) => {
                    ls("completed_tour", "y");
                    ordersRedirect(e, "cancellation");
                  }}
                >
                  Cancellation
                </span>
              </li>
              <li
                className={selectedMenu === 1.3 ? "orange-bg active-menu" : ""}
              >
                <span
                  onClick={(e) => {
                    ls("completed_tour", "y");
                    ordersRedirect(e, "returnrefund");
                  }}
                >
                  Return/Refund
                </span>
              </li>
            </ul>
          </div>}
          {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.PRODUCTS) && 
          <div>
            <div
              className={
                parentMenu === 2
                  ? "active parent sideNav-fourth-step"
                  : "sideNav-fourth-step"
              }
            >
              <BsBoxSeam />
              Products
              <MdOutlineKeyboardArrowDown className="has-child caret-down" />
              <MdOutlineKeyboardArrowUp className="has-child caret-up" />
            </div>

            <ul>
              <li
                className={selectedMenu === 2.1 ? "orange-bg active-menu" : ""}
              >
                <span
                  onClick={(e) => {
                    ls("completed_tour", "y");
                    setActiveMenu(e, MerchantRoutes.Products);
                  }}
                >
                  My Products
                </span>
              </li>
              <li
                className={selectedMenu === 2.2 ? "orange-bg active-menu" : ""}
              >
                <span
                  className="sideNav-fifth-step"
                  onClick={(e) => {
                    ls("completed_tour", "y");

                    let profile_status = ls("merchant_setup");
                    if (profile_status === "Y") {
                      setActiveMenu(e, MerchantRoutes.AddProduct);
                    } else this.setState({showPrompt: true});                   
                  }}
                >
                  Add Product
                </span>
              </li>
              <li
                className={selectedMenu === 2.3 ? "orange-bg active-menu" : ""}
              >
                <span
                  onClick={(e) => {
                    ls("completed_tour", "y");
                    setActiveMenu(e, MerchantRoutes.Categories);
                  }}
                >
                  Categories
                </span>
              </li>
            </ul>
          </div>}
          {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.SHIPMENT) && 
          <div
            className={
              parentMenu === 3
                ? "active sideNav-sixth-step"
                : "sideNav-sixth-step"
            }
          >
            <div
              onClick={(e) => {
                ls("completed_tour", "y");
                setActiveMenu(e, MerchantRoutes.ShippingSettings);
              }}
              className="sideNav-second-step"
            >
              <TbTruckDelivery />
              Shipment Settings
            </div>
          </div>}
          {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.SHOP) && 
          <div className={parentMenu === 4 ? "active parent" : ""}>
            <div
              id="start-of-tour"
              className={
                selectedMenu === 4.1
                  ? "orange-bg active-menu sideNav-first-step"
                  : "sideNav-first-step"
              }
            >
              <AiOutlineShop />
              Shop
              <MdOutlineKeyboardArrowDown className="has-child caret-down" />
              <MdOutlineKeyboardArrowUp className="has-child caret-up" />
            </div>
            <ul>
              <li>
                <span
                  onClick={(e) => {
                    ls("completed_tour", "y");
                    setActiveMenu(e, MerchantRoutes.ShopProfile);
                  }}
                >
                  Shop Profile
                </span>
              </li>
              <li
                className={selectedMenu === 4.2 ? "orange-bg active-menu" : ""}
              >
                <span
                  onClick={(e) => {
                    ls("completed_tour", "y");
                    setActiveMenu(e, MerchantRoutes.ShopRating);
                  }}
                >
                  Shop Rating
                </span>
              </li>
              <li className={selectedMenu === 4.3 ? "orange-bg active-menu" : ""}>
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
            {!ls("sub-seller-permission") && <li className={selectedMenu === 4.4 ? "orange-bg active-menu" : ""}>
              <span
                onClick={(e) => setActiveMenu(e, MerchantRoutes.SubAdminList)}
              >
                Sub-Admin Setting
              </span>
            </li>}
            </ul>
          </div>}
          {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.FINANCE) && 
          <div className={parentMenu === 5 ? "active" : ""}>
            <div
              className="sideNav-third-step"
              onClick={(e) => {
                ls("completed_tour", "y");
                setActiveMenu(e, MerchantRoutes.Finance);
              }}
            >
              <RiBankLine />
              Finance
            </div>
          </div>}
          {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.MARKETING) && 
          <div className={parentMenu === 6 ? "active" : ""}>
            <div className="flex">
              <TbReportAnalytics size={20} />
              Marketing Centre
              <MdOutlineKeyboardArrowDown size={20} className="has-child" />
            </div>
            <ul>
              <li
                className={selectedMenu === 6.1 ? "orange-bg active-menu" : ""}
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
                className={selectedMenu === 6.2 ? "orange-bg active-menu" : ""}
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
                className={selectedMenu === 6.3 ? "orange-bg active-menu" : ""}
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
          </div>}
          {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.SETTINGS) && 
          <div className={parentMenu === 7 ? "active" : ""}>
            <div
              onClick={(e) => {
                ls("completed_tour", "y");
                setActiveMenu(e, MerchantRoutes.Settings);
              }}
            >
              <AiOutlineSetting />
              Settings
            </div>
          </div>}
          <div className={parentMenu === 8 ? "active" : ""}>
            <div
              onClick={(e) => {
                ls("completed_tour", "y");
                setActiveMenu(
                  e,
                  MerchantRoutes.ContactUs.replace(":tab", "contact-us")
                );
              }}
            >
              <AiOutlineQuestionCircle />
              Support
            </div>
          </div>
        </div>
      </>
    );
  };

  // Joyride callback (especially for mobile view)
  handleJoyrideCallback = (data) => {
    const { action, status } = data;

    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      ls("completed_tour", "y");
    }

    if (data) {
      if (action === ACTIONS.NEXT) {
        document
          .getElementById("sidenav-mobile")
          .scrollIntoView({ behavior: "instant" });
        window.scrollBy(0, -300);
      }
    }
  };

  //popups
  togglePop = (msgHead, msg, result) => {
    this.setState({
      popupSeen: !this.state.popupSeen,
      popupHead: msgHead,
      popupMsg: msg,
      popupResult: result,
    });
  };

  body = () => {
    return (
      <>
        <div className="listing-page mt-5">
          <div className="body mb-20 max-w-[1200px]">
            <div className="grid grid-cols-4 mx-3">
              <div id="root">
                <div className="pt-5 px-2">
                  <div className="row align-items-stretch">
                    <div className="c-dashboardInfo col-lg-3 col-md-6">
                      <div
                        className="wrap cp"
                        onClick={() => this.cardNavigation("new-orders")}
                      >
                        <h4 className="heading heading5 h-14 hind-font medium-font-weight c-dashboardInfo__title">
                          New Orders
                        </h4>
                        <span className="hind-font caption-12 c-dashboardInfo__count">
                          {this.state.widgetData?.new_order}
                        </span>
                      </div>
                    </div>
                    <div className="hidden">&nbsp;</div>

                    <div className="c-dashboardInfo col-lg-3 col-md-6">
                      <div
                        className="wrap cp"
                        onClick={() => this.cardNavigation("sold-products")}
                      >
                        <h4 className="heading heading5 h-14 hind-font medium-font-weight c-dashboardInfo__title">
                          Total Sold Out Products
                        </h4>
                        <span className="hind-font caption-12 c-dashboardInfo__count">
                          {this.state.widgetData?.sold_out_product}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div id="root">
                <div className="pt-5 px-2">
                  <div className="row align-items-stretch">
                    <div className="hidden">&nbsp;</div>
                    <div className="c-dashboardInfo col-lg-3 col-md-6">
                      <div
                        className="wrap cp"
                        onClick={() => this.cardNavigation("new-returns")}
                      >
                        <h4 className="heading heading5 h-14 hind-font medium-font-weight c-dashboardInfo__title">
                          New Returns
                        </h4>
                        <span className="hind-font caption-12 c-dashboardInfo__count">
                          {this.state.widgetData?.new_return}
                        </span>
                      </div>
                    </div>

                    <div className="hidden">&nbsp;</div>

                    <div className="c-dashboardInfo col-lg-3 col-md-6">
                      <div
                        className="wrap cp"
                        onClick={() =>
                          this.cardNavigation("shipment-pending")
                        }
                      >
                        <h4 className="heading heading5 h-14 hind-font medium-font-weight c-dashboardInfo__title">
                          Order Confirmed
                        </h4>
                        <span className="hind-font caption-12 c-dashboardInfo__count">
                          {this.state.widgetData?.shipment_pending}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="root">
                <div className="pt-5 px-2">
                  <div className="row align-items-stretch">
                    <div className="c-dashboardInfo col-lg-3 col-md-6">
                      <div
                        className="wrap cp"
                        onClick={() =>
                          this.cardNavigation("cancelled-orders")
                        }
                      >
                        <h4 className="heading heading5 h-14 hind-font medium-font-weight c-dashboardInfo__title">
                          Cancelled Orders
                        </h4>
                        <span className="hind-font caption-12 c-dashboardInfo__count">
                          {this.state.widgetData?.cancelled_order}
                        </span>
                      </div>
                    </div>
                    <div className="hidden">&nbsp;</div>

                    <div className="c-dashboardInfo col-lg-3 col-md-6">
                      <div
                        className="wrap cp"
                        onClick={() => this.cardNavigation("total-refund")}
                      >
                        <h4 className="heading heading5 h-14 hind-font medium-font-weight c-dashboardInfo__title">
                          Total Refund
                        </h4>
                        <span className="hind-font caption-12 c-dashboardInfo__count">
                          {this.state.widgetData?.total_refund}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="root">
                <div className="pt-5 px-2">
                  <div className="row align-items-stretch">
                    <div className="c-dashboardInfo col-lg-3 col-md-6">
                      <div className="wrap">
                        <h4 className="heading heading5 h-14 hind-font medium-font-weight c-dashboardInfo__title">
                          Visitors
                        </h4>
                        <span className="hind-font caption-12 c-dashboardInfo__count">
                          {this.state.widgetData?.visitors}
                        </span>
                      </div>
                    </div>

                    <div className="hidden">&nbsp;</div>

                    <div className="c-dashboardInfo col-lg-3 col-md-6">
                      <div
                        className="wrap cp"
                        onClick={() => this.cardNavigation("total-sales")}
                      >
                        <h4 className="heading heading5 h-14 hind-font medium-font-weight c-dashboardInfo__title">
                          Total Sales
                        </h4>
                        <span
                          className={`hind-font caption-12 c-dashboardInfo__count break-words
                        `}
                        >
                          $ {this.state.widgetData?.total_sales.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="body pt-5 pl-6 mt-10 pb-10">
              <div className="col-lg-3 col-md-6">
                <div className="flex justify-between w-full">
                  <div className="font-bold text-lg">
                    <span>Statistic</span>
                  </div>
                  <div className="periodSelectionDropdown pr-5">
                    <Select
                      id="dashboardPeriod"
                      name="dashboardPeriod"
                      options={periodList}
                      value={this.state.selectedChartPeriod}
                      onChange={this.setChartPeriodSelection}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mb-10 mt-6 w-full max-md:flex-wrap max-md:pr-8">
                  <div className="w-1/2 h-fit max-md:w-full">
                    <canvas id="sales"></canvas>
                  </div>
                  <div className="w-1/2 h-fit mr-3 max-md:w-full">
                    <canvas id="visitors"></canvas>
                  </div>
                </div>
                <div className="mb-10 w-1/2 h-fit max-md:w-full max-md:pr-8">
                  <canvas id="cancelled_orders"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div className="listing-page mt-5">
          <div className="body mb-20 max-w-[1200px]">
            <div className="body pt-5 px-6 pb-10">
              <p className="font-bold">Product Analysis</p>
              <ProdAnalysisWrapper />
            </div>
          </div>
        </div>
      </>
    );
  };

  render() {
    var apiError = ls("apiError");
    var fromPage = ls(Constants.localStorage.fromPage);
    if (apiError != null) ls.remove("apiError");

    //dashboard ui
    fromPage = fromPage === null ? "login" : fromPage;
    let mcClass = this.props.level === 1 ? "main-contents" : "main-contents ws";

    // for tutorial || guided tour
    const { steps } = this.state;

    return (
      <main className="app-merchant merchant-db">
        <Navbar theme="dashboard" />
        {/*onboarding*/}
        {!this.user.is_registered ? (
          <OnBoard togglePop={this.togglePop} />
        ) : (
          <>
            {/*side bar*/}
            <this.Sidebar selectedMenu={0} />

            {/*main contents*/}
            <div className={mcClass}>
              <div className="breadcrumbs">
                <div className="page-title">Dashboard</div>
              </div>

              {this.state.isDashboardDataLoading ? <PageLoader /> : this.body()}

              <div>
                <Joyride
                  steps={steps}
                  disableScrolling={true}
                  continuous={true}
                  styles={{
                    options: {
                      textColor: "#000",
                      spotlightShadow: "50px 70px 15px rgba(201, 100, 56, 0.3)",
                      width: 360,
                      arrowColor: "#f5ab35",
                    },
                    spotlight: {
                      width: 800,
                    },
                  }}
                  showProgress={true}
                  showSkipButton={true}
                  callback={this.handleJoyrideCallback}
                />
              </div>
            </div>
          </>
        )}
        {/*show signup success after*/}
        {fromPage === "register" && <SignupSuccess />}
        {this.state.popupSeen ? (
          <PopupMessage
            toggle={this.togglePop}
            header={this.state.popupHead}
            message={this.state.popupMsg}
          />
        ) : null}
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
export default withRouter(Dashboard);

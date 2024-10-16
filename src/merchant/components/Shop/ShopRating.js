import React from "react";
import ls from "local-storage";
import { Constants } from "../../utils/Constants.js";
import { MerchantRoutes } from "../../../Routes.js";
import { loginRequired } from "../../utils/Helper.js";
import { ApiCalls, Apis } from "../../utils/ApiCalls.js";
import withRouter from "../../../Utils.js";
import DatePicker from "react-datepicker";
import {
  MdCalendarViewMonth,
  MdImage,
  MdOutlineBrokenImage,
} from "react-icons/md";
import Navbar from "../Navbar.js";
import { Sidebar } from "../Parts.js";
import "../../../css/merchant.css";
import storeIcon from "../../../assets/seller/store_icon_rating.svg";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Pagination from "../../../utils/Pagination/pagination.js";
import { FaStar } from "react-icons/fa";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal } from "../../../customer/components/GenericComponents.js";
import galleryIcon from "../../../assets/buyer/gallery.svg";
import { USER_TYPE } from "../../../constants/general.js";
import { CiPlay1 } from "react-icons/ci";

class ShopRating extends React.Component {
  constructor(props) {
    super(props);
    loginRequired(props.page);
    document.title = "Merchant | uShop";

    this.user = ls(Constants.localStorage.user);
    if (this.user) this.user = JSON.parse(this.user);

    // Initialize refs
    this.videoRefs = [];

    this.state = {
      productName: "",
      userName: "",
      startDate: null,
      endDate: null,
      selectedStar: "",
      productList: [],
      isProductsLoading: false,

      //pagination variables
      page: 1,
      entries: 10,
      pages: 1,
      total: 0,

      toggleReviewDetailsPopup: false,
      reviewData: null,
    };
  }

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

  handleFieldChange = (e, type) => {
    switch (type) {
      case "product":
        this.setState({
          productName: e.target.value,
        });
        break;

      case "username":
        this.setState({
          userName: e.target.value,
        });
        break;

      default:
        console.log("default case");
    }
  };

  starSelectionChange = (type) => {
    this.setState(
      {
        selectedStar: type,
      },
      () => this.fetchDataList()
    );
  };

  fetchDataList = () => {
    this.setState({ isProductsLoading: true });
    let fd = new FormData();

    if (this.state.productName)
      fd.append("product_name", this.state.productName);
    if (this.state.userName) fd.append("username", this.state.userName);

    if (this.state.startDate && this.state.endDate) {
      var stDate =
        this.state.startDate.getFullYear() +
        "-" +
        (this.state.startDate.getMonth() + 1) +
        "-" +
        this.state.startDate.getDate();
      var endDate =
        this.state.endDate.getFullYear() +
        "-" +
        (this.state.endDate.getMonth() + 1) +
        "-" +
        this.state.endDate.getDate();
      fd.append("start_date", stDate);
      fd.append("end_date", endDate);
    }
    if (this.state.selectedStar)
      fd.append("rating", parseInt(this.state.selectedStar));

    ApiCalls(
      fd,
      Apis.shopRating,
      "POST",
      {
        Authorization: "Bearer " + this.user.access,
      },
      this.processData
    );
  };

  processData = (res, api) => {
    var rdata = res.data.data;
    //for pagination
    let pg = this.state.page;
    let nxtPageCount = rdata.total_records % this.state.entries;
    let currentPage = parseInt(rdata.total_records / this.state.entries);
    if (nxtPageCount >= 0 && currentPage !== pg - 1) pg += 1;

    this.setState({
      productList: rdata.shop_rating,
      isProductsLoading: false,
      total: rdata.total_records,
      pages: pg,
    });
  };

  componentDidMount = () => {
    this.fetchDataList();
  };

  resetFields = () => {
    this.setState(
      {
        productName: "",
        userName: "",
        startDate: null,
        endDate: null,
      },
      () => this.fetchDataList()
    );
  };

  showBrokenImage = (e) => {
    var targetParent = e.target.parentElement;
    targetParent.lastChild.classList.remove("hidden");
  };

  changeEntries = (e) => {
    this.setState(
      {
        page: 1,
        entries: e.target.value,
      },
      () => {
        this.fetchDataList();
      }
    );
  };

  toPage = (page) => {
    this.setState(
      {
        page: page,
      },
      () => {
        this.fetchDataList();
      }
    );
  };

  openChat = (item) => {
    let dataToPass = {
      userType: USER_TYPE[2],
      receiverType: USER_TYPE[1],
      buyerId: item?.buyer_user_id,
      shopSlug: this.user?.shop_slug,
      buyerName: item?.buyer_name ?? item?.buyer_email,
    };

    ls("chatData", JSON.stringify(dataToPass));

    const newTab = window.open(MerchantRoutes.ChatScreen, "_blank");
    if (newTab) newTab.focus();
  };

  showReviewDetails = (item) => {
    this.setState({
      toggleReviewDetailsPopup: true,
      reviewData: item,
    });
  };

  renderSkeletonTable = () => {
    var fillers = [0, 1];
    return (
      <>
        {fillers.map((itm, i) => (
          <tr key={i}>
            <td>
              <Skeleton height={25} width={150} className="mb-4" />
            </td>
            <td>
              <Skeleton height={25} width={150} className="mb-4" />
            </td>
            <td>
              <Skeleton height={25} width={150} className="mb-4" />
            </td>
          </tr>
        ))}
      </>
    );
  };

  setRef = (element, index) => {
    this.videoRefs[index] = element;
  };

  handleVideoClick = (index) => {
    const video = this.videoRefs[index];
    if (video) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.mozRequestFullScreen) {
        // Firefox
        video.mozRequestFullScreen();
      } else if (video.webkitRequestFullscreen) {
        // Chrome, Safari and Opera
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {
        // IE/Edge
        video.msRequestFullscreen();
      }
    }
  };

  showReviewData = () => {
    return (
      <Modal
        width="w-1/3"
        open={this.state.toggleReviewDetailsPopup}
        children={
          <div>
            <div className="flex justify-between items-center w-full">
              <p className="text-lg font-semibold mb-3">Review Details</p>
              <span
                className="cp"
                onClick={() =>
                  this.setState({ toggleReviewDetailsPopup: false })
                }
              >
                <FontAwesomeIcon icon={faXmark} />
              </span>
            </div>
            <hr />
            <div className="flex mb-1 gap-3 mt-3">
              <div className="h-16 w-16 rounded-md border flex items-center justify-center border-[#bdbdbd]">
                <img
                  src={this.state.reviewData?.list_img ?? galleryIcon}
                  alt=""
                  height="56px"
                  width="56px"
                />
              </div>
              <div>
                <p className="text-sm">
                  {this.state.reviewData?.product_name ?? "N/A"}
                </p>
                <div className="flex gap-1 flex-row mt-1">
                  <FaStar
                    style={{
                      color:
                        this.state.reviewData?.rating > 0
                          ? "#f5ab35"
                          : "#e5e7eb",
                    }}
                  />
                  <FaStar
                    style={{
                      color:
                        this.state.reviewData?.rating > 1
                          ? "#f5ab35"
                          : "#e5e7eb",
                    }}
                  />
                  <FaStar
                    style={{
                      color:
                        this.state.reviewData?.rating > 2
                          ? "#f5ab35"
                          : "#e5e7eb",
                    }}
                  />
                  <FaStar
                    style={{
                      color:
                        this.state.reviewData?.rating > 3
                          ? "#f5ab35"
                          : "#e5e7eb",
                    }}
                  />
                  <FaStar
                    style={{
                      color:
                        this.state.reviewData?.rating > 4
                          ? "#f5ab35"
                          : "#e5e7eb",
                    }}
                  />
                </div>
                <p className="mb-2 mt-4 w-full text-xs text-[#c1c1c1]">
                  Reviewed by: {this.state.reviewData?.buyer_name ?? ""}
                </p>
              </div>
            </div>

            <p className="mb-3 w-full pt-4 text-sm font-bold">
              {this.state.reviewData?.title ?? ""}
            </p>
            <p className="mb-5 w-full text-sm">
              {this.state.reviewData?.description ?? ""}
            </p>
            <div className="flex gap-3 flex-wrap mb-5">
              {this.state.reviewData?.review_media?.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="h-16 w-fit border rounded-md border-[#bdbdbd] flex justify-center items-center"
                  >
                    {item.media_type === "image" ? (
                      <img
                        src={item.review_img}
                        alt="review_img"
                        height="80px"
                        width="80px"
                      />
                    ) : (
                      <div
                        className="relative h-[80px] w-[80px] cursor-pointer"
                        onClick={() => this.handleVideoClick(index)}
                      >
                        <CiPlay1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-white" />
                        <video
                          className="bg-slate-500 h-full w-full rounded-[5px]"
                          alt="review_vid"
                          ref={(element) => this.setRef(element, index)}
                        >
                          <source src={item.review_img} type="video/mp4" />
                          Your browser does not support the video.
                        </video>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <hr />
            <div className="w-full flex justify-end mt-5">
              <button
                className="cp text-sm text-center rounded-md bg-[#f5ab35] text-white h-8 px-6"
                onClick={() =>
                  this.setState({ toggleReviewDetailsPopup: false })
                }
              >
                OK
              </button>
            </div>
          </div>
        }
      />
    );
  };

  render() {
    let mcClass = this.props.level === 1 ? "main-contents" : "main-contents ws";

    return (
      <main className="app-merchant merchant-db">
        <Navbar theme="dashboard" />
        <Sidebar selectedMenu={4.2} />
        <div className={mcClass}>
          <div className="breadcrumbs">
            <div className="page-title !pb-0 !font-bold">Shop Rating</div>

            <ul>
              <li>
                <a href={MerchantRoutes.Landing}>Home {">"}</a>
              </li>
              <li>
                <a href={MerchantRoutes.Landing}>Shop {">"}</a>
              </li>
              {this.props.level > 0 && (
                <li className="!font-bold">Shop Rating</li>
              )}
            </ul>
          </div>

          <div className="listing-page my-5  mb-32">
            <div className="p-4 bg-white mb-4">
              <div className="flex justify-between w-full flex-wrap">
                {/* product name search field */}
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-sm text-bold w-28 whitespace-nowrap font-bold">
                    Product Name:{" "}
                  </p>
                  <input
                    type="text"
                    name="prod_name"
                    id="orderComment"
                    value={this.state.productName}
                    onChange={(e) => this.handleFieldChange(e, "product")}
                    placeholder="Enter Product's Name"
                    className="mb-1 px-3 py-3 text-xs border rounded-md"
                  />
                </div>

                {/* review time search field */}
                <div className="flex items-center mb-3">
                  <p className="text-sm text-bold w-28 whitespace-nowrap font-bold">
                    Review Time:{" "}
                  </p>
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
                      placeholderText="Set Period"
                      monthsShown={2}
                    />
                    <MdCalendarViewMonth color="#828282" />
                  </div>
                </div>

                {/* user name search field */}
                <div className="flex gap-3 items-center mb-3">
                  <p className="text-sm text-bold w-28 whitespace-nowrap font-bold">
                    User Name:{" "}
                  </p>
                  <input
                    type="text"
                    name="user_name"
                    id="orderComment"
                    value={this.state.userName}
                    onChange={(e) => this.handleFieldChange(e, "username")}
                    placeholder="Enter User Name"
                    className="mb-1 px-3 py-3 text-xs border rounded-md"
                  />
                </div>
              </div>

              {/* buttons for search fields */}
              <div className="flex my-4">
                <button
                  className="cp text-center rounded-md bg-[#f5ab35] text-white h-11 w-20 mr-5 hover:bg-amber-500
                     font-sm"
                  onClick={this.fetchDataList}
                >
                  Search
                </button>
                <button
                  className="cp text-center rounded-md border border-[#C1C1C1] bg-white text-[#C1C1C1] h-11 w-20 font-sm"
                  onClick={this.resetFields}
                >
                  Reset
                </button>
              </div>

              {/* star selection section */}
              <div className="flex my-8">
                <div
                  className={`w-20 border h-10 cp flex items-center justify-center px-2
                            ${
                              this.state.selectedStar === ""
                                ? "border-[#f5ab35]"
                                : "border-[#C1C1C1]"
                            }`}
                  onClick={() => this.starSelectionChange("")}
                >
                  <p className="font-bold text-sm">All</p>
                </div>

                <div
                  className={`w-20 border h-10 cp flex items-center justify-center px-2
                            ${
                              this.state.selectedStar === "1"
                                ? "border-[#f5ab35]"
                                : "border-[#C1C1C1]"
                            }`}
                  onClick={() => this.starSelectionChange("1")}
                >
                  <p className="font-bold text-sm">1 Star</p>
                </div>

                <div
                  className={`w-20 border h-10 cp flex items-center justify-center px-2
                            ${
                              this.state.selectedStar === "2"
                                ? "border-[#f5ab35]"
                                : "border-[#C1C1C1]"
                            }`}
                  onClick={() => this.starSelectionChange("2")}
                >
                  <p className="font-bold text-sm">2 Star</p>
                </div>

                <div
                  className={`w-20 border h-10 cp flex items-center justify-center px-2
                            ${
                              this.state.selectedStar === "3"
                                ? "border-[#f5ab35]"
                                : "border-[#C1C1C1]"
                            }`}
                  onClick={() => this.starSelectionChange("3")}
                >
                  <p className="font-bold text-sm">3 Star</p>
                </div>

                <div
                  className={`w-20 border h-10 cp flex items-center justify-center px-2
                            ${
                              this.state.selectedStar === "4"
                                ? "border-[#f5ab35]"
                                : "border-[#C1C1C1]"
                            }`}
                  onClick={() => this.starSelectionChange("4")}
                >
                  <p className="font-bold text-sm">4 Star</p>
                </div>
              </div>

              <table className="pb-10">
                <thead className="px-4">
                  <tr>
                    <td
                      width="30%"
                      className="!pl-4 !font-bold !text-sm text-black"
                    >
                      Product Information
                    </td>
                    <td width="30%" className="!font-bold !text-sm text-black">
                      Buyer's Review
                    </td>
                    <td width="20%" className="!font-bold !text-sm text-black">
                      Rating
                    </td>
                    <td
                      width="20%"
                      className="!font-bold !text-sm text-black text-center"
                    >
                      Order ID
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {this.state.isProductsLoading ? (
                    this.renderSkeletonTable()
                  ) : (
                    <>
                      {this.state.productList.length === 0 ? (
                        <tr>
                          <td colspan="6"> No data found</td>
                        </tr>
                      ) : (
                        <>
                          {this.state.productList?.map((item) => {
                            return (
                              <>
                                <tr>
                                  <th colSpan="6">
                                    <div className="bg-[#D9D9D9] h-11 w-fill flex gap-2 p-3 text-xs font-medium">
                                      <p>{item?.buyer_name ?? ""}</p>
                                      <img
                                        src={storeIcon}
                                        alt=""
                                        className="cp"
                                        onClick={() => this.openChat(item)}
                                      />
                                    </div>
                                  </th>
                                </tr>
                                <tr>
                                  <td>
                                    <div
                                      className="col-product flex flex-row cp"
                                      onClick={() =>
                                        this.showReviewDetails(item)
                                      }
                                    >
                                      <div className="img">
                                        {item?.list_img ? (
                                          <img
                                            src={item.list_img}
                                            alt=""
                                            loading="lazy"
                                            onError={(e) =>
                                              this.showBrokenImage(e)
                                            }
                                          />
                                        ) : (
                                          <MdImage />
                                        )}
                                        <MdOutlineBrokenImage className="hidden broken-img" />
                                      </div>
                                      <div className="desc pr-8 ">
                                        <div className="text-black !font-bold">
                                          {item?.product_name ?? ""}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="text-black">
                                    {item.description ?? ""}
                                  </td>

                                  <td>
                                    <div className="flex gap-1 flex-row mt-1">
                                      <FaStar
                                        style={{
                                          color:
                                            item?.rating > 0
                                              ? "#f5ab35"
                                              : "#e5e7eb",
                                        }}
                                      />
                                      <FaStar
                                        style={{
                                          color:
                                            item?.rating > 1
                                              ? "#f5ab35"
                                              : "#e5e7eb",
                                        }}
                                      />
                                      <FaStar
                                        style={{
                                          color:
                                            item?.rating > 2
                                              ? "#f5ab35"
                                              : "#e5e7eb",
                                        }}
                                      />
                                      <FaStar
                                        style={{
                                          color:
                                            item?.rating > 3
                                              ? "#f5ab35"
                                              : "#e5e7eb",
                                        }}
                                      />
                                      <FaStar
                                        style={{
                                          color:
                                            item?.rating > 4
                                              ? "#f5ab35"
                                              : "#e5e7eb",
                                        }}
                                      />
                                    </div>
                                  </td>
                                  <td className="text-black text-center">
                                    {item.order_number ?? ""}
                                  </td>
                                </tr>
                              </>
                            );
                          })}
                        </>
                      )}
                    </>
                  )}
                </tbody>
              </table>

              <Pagination
                entries={this.state.entries}
                changeEntries={this.changeEntries}
                toPage={this.toPage}
                pages={this.state.pages}
                page={this.state.page}
                total={this.state.total}
              />
            </div>
          </div>
        </div>
        {this.state.toggleReviewDetailsPopup && this.showReviewData()}
      </main>
    );
  }
}

export default withRouter(ShopRating);

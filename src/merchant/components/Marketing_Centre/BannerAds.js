import React from "react";
import ls from "local-storage";
import { Constants } from "../../utils/Constants.js";
import { MerchantRoutes } from "../../../Routes.js";
import { loginRequired } from "../../utils/Helper.js";
import withRouter from "../../../Utils.js";
import Select from "react-select";

import Navbar from "../Navbar.js";
import { Sidebar } from "../Parts.js";
import "../../../css/merchant.css";
import { ApiCalls, Apis } from "../../utils/ApiCalls.js";
import { CommonApis } from "../../../Utils.js";

//icons
import { PageLoader } from "../../../utils/loader.js";
import { BsPlusCircle } from "react-icons/bs";
import homepage_sample_banner from "../../../assets/seller/homepage_banner.png";
import categorypage_sample_banner from "../../../assets/seller/categorypage_banner.png";

import { AiFillWarning } from "react-icons/ai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import successGif from "../../../assets/success.gif";
import { Modal } from "../../../customer/components/GenericComponents.js";

const errObj = {
  placement: "",
  remarks: "",
  totalCost: "",
  bannerImg: "",
  bannerSlots: "",
};
const bannerData = {
  placement: "",
  bannerImg: null,
  remarks: "",
  totalCost: "",
  bannerFile: null,
  bannerSlots: [],
};
const BANNER_HEIGHT = 409,
  BANNER_WIDTH = 1280;

class BannerAds extends React.Component {
  constructor(props) {
    super(props);
    loginRequired(props.page);
    document.title = "Merchant | uShop";

    this.user = ls(Constants.localStorage.user);
    if (this.user) this.user = JSON.parse(this.user);

    this.state = {
      loading: false,
      bannerDetails: bannerData,
      errMsg: errObj,
      isShowMsg: false,
      message: "",
      loadingBannerSlots: false,
      bannerWeekSlots: [],
    };
  }

  componentDidMount = () => {
    this.loadBannerSlots();
  };

  loadBannerSlots = () => {
    this.setState({ loading: true });
    var fd = new FormData();

    ApiCalls(fd, CommonApis.settings, "POST", {}, (res, api) => {
      let rdata = res.data.data.banner_week_slot;
      let bannerSlots = [];

      rdata.forEach((item, index) => {
        return bannerSlots.push({ label: item, value: item });
      });
      this.setState({
        bannerWeekSlots: bannerSlots,
        loading: false,
      });
    });
  };

  processAddBannerAd = (res, api) => {
    this.setState({
      loading: false,
      errMsg: errObj,
      isShowMsg: true,
      message: res.data,
      bannerDetails:
        res.data.result === "SUCCESS" ? bannerData : this.state.bannerDetails,
    });
    if (res.data.result === "SUCCESS") {
      var ele = document.getElementsByName("placement");
      for (var i = 0; i < ele.length; i++) ele[i].checked = false;
    }
  };

  handleFieldChange = (e, type) => {
    var bannerData, bannerErrObj;
    switch (type) {
      case "placement":
        bannerData = {
          ...this.state.bannerDetails,
          placement: e === 1 ? "home" : "category",
        };
        bannerErrObj = { ...this.state.errMsg, placement: "" };
        break;
      case "remarks":
        bannerData = { ...this.state.bannerDetails, remarks: e.target.value };
        bannerErrObj = { ...this.state.errMsg, remarks: "" };
        break;
      case "totalCost":
        bannerData = { ...this.state.bannerDetails, totalCost: e.target.value };
        bannerErrObj = { ...this.state.errMsg, totalCost: "" };
        break;
      case "bannerSlots":
        let values = this.state.bannerDetails;
        if (
          (e.length > 0 && values.bannerSlots.length < 2) ||
          e.length !== values.bannerSlots.length
        ) {
          let slots = [];
          e.forEach((item) => slots.push(item.value));
          bannerData = {
            ...values,
            bannerSlots: slots,
          };
        } else bannerData = [...this.state.bannerDetails];
        bannerErrObj = { ...this.state.errMsg, bannerSlots: "" };
        break;
      default:
        console.log("default case");
    }

    this.setState({
      bannerDetails: bannerData,
      errMsg: bannerErrObj,
    });
  };

  fileSizeCheck = (file) => {
    const mb = 1024 * 1024;
    var fileSize = (file.size / mb).toFixed(2);
    if (fileSize <= 5.0) return true;
    else return false;
  };

  bannerSelection = (e) => {
    if (e.target.files && e.target.files[0]) {
      var bannerErrObj;
      var file = e.target.files[0];

      //file size check
      let isFileSizeMatching = this.fileSizeCheck(file);

      if (isFileSizeMatching) {
        //file dimension check
        var imgFile = URL.createObjectURL(file);
        const img = new Image();
        img.src = imgFile;
        img.onload = () => {
          if (img.height === BANNER_HEIGHT && img.width === BANNER_WIDTH) {
            var bannerData = {
              ...this.state.bannerDetails,
              bannerImg: imgFile,
              bannerFile: file,
            };
            bannerErrObj = { ...this.state.errMsg, bannerImg: "" };
            this.setState({
              bannerDetails: bannerData,
              errMsg: bannerErrObj,
            });
          } else {
            bannerErrObj = {
              ...this.state.errMsg,
              bannerImg: "Banner dimension should be 1280 x 409",
            };
            this.setState({
              errMsg: bannerErrObj,
            });
          }
        };
      } else {
        bannerErrObj = {
          ...this.state.errMsg,
          bannerImg: "Banner size should not exceed 5.0 MB",
        };
        this.setState({
          errMsg: bannerErrObj,
        });
      }
    }
  };

  selectImage = (id) => {
    var fileInput = document.getElementById(id);
    fileInput.click();
  };

  validateFields = () => {
    var bannerErrObj = this.state.errMsg;
    let length = 0;
    Object.keys(this.state.bannerDetails).forEach((key, index) => {
      if (!this.state.bannerDetails[key]) {
        length++;
        switch (key) {
          case "placement":
            bannerErrObj = {
              ...bannerErrObj,
              placement: "Placement is required",
            };
            break;
          case "totalCost":
            bannerErrObj = {
              ...bannerErrObj,
              totalCost: "Total Cost is required",
            };
            break;
          default:
            console.log("other img cases", key);
        }
      }

      if (
        key === "bannerSlots" &&
        this.state.bannerDetails.bannerSlots.length === 0
      ) {
        length++;
        bannerErrObj = {
          ...bannerErrObj,
          bannerSlots: "Campaign period is required",
        };
      }
    });

    if (length <= 6 && length > 3) {
      this.setState({
        errMsg: bannerErrObj,
      });
      return false;
    } else return true;
  };

  submitBannerAd = () => {
    let isValid = this.validateFields();
    if (isValid) {
      this.setState({ loading: true });
      let fd = new FormData();

      fd.append("placement", this.state.bannerDetails.placement);
      fd.append("add_remarks", this.state.bannerDetails.remarks);
      fd.append("banner_img", this.state.bannerDetails.bannerFile);
      fd.append("total_cost", this.state.bannerDetails.totalCost);

      let bannerSlots = this.state.bannerDetails.bannerSlots;
      for (let i = 0; i < bannerSlots.length; i++) {
        fd.append("week_slot[]", bannerSlots[i]);
      }

      ApiCalls(
        fd,
        Apis.addBannerAd,
        "POST",
        {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + this.user.access,
        },
        this.processAddBannerAd
      );
    }
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
                  Add banner request failed
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

  render() {
    let mcClass = this.props.level === 1 ? "main-contents" : "main-contents ws";

    return (
      <main className="app-merchant merchant-db">
        <Navbar theme="dashboard" />
        <Sidebar selectedMenu={6.2} />
        <div className={mcClass}>
          {/* Page title */}
          <div className="breadcrumbs">
            <div className="page-title !pb-0">Banner Ads</div>
            <ul>
              <li>
                <a href={MerchantRoutes.Landing}>Home {">"}</a>
              </li>
              {this.props.level > 0 && (
                <li className="font">Marketing Centre {">"}</li>
              )}
              {this.props.level > 0 && (
                <li className="last-bread-crumb">Banner Ads</li>
              )}
            </ul>
          </div>

          {this.state.loading ? (
            <PageLoader />
          ) : (
            <div className="listing-page my-5 !pr-0 pl-11">
              <div className="flex flex-col">
                {/* Key Metrics */}
                <div className="p-4 bg-white mb-4 pb-8 mr-5 h-11/12">
                  <p className="font-semibold ml-5 mt-3">
                    Request for Banner Ads
                  </p>

                  <p className="ml-5 mt-3 mb-5">
                    Boost Your Sales By Getting Featured On Our Main Pages! Here
                    Are Some Sample Previews:
                  </p>
                  <div className="flex">
                    <div className="px-5">
                      <p className="text-sm text-[#828282]">Homepage: </p>
                      <img src={homepage_sample_banner} alt="" />
                    </div>
                    <div>
                      <p className="text-sm text-[#828282]">Category Page: </p>
                      <img src={categorypage_sample_banner} alt="" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white mb-4 mr-5 h-11/12">
                  <p className="font-semibold ml-5 mt-3">
                    Campaign Information
                  </p>

                  <div className="flex ml-5 gap-8 w-full">
                    <p className="voucher-labels mt-5">Placement</p>

                    <div>
                      <div className="mb-3 mt-5">
                        <input
                          type="radio"
                          name="placement"
                          checked={
                            this.state.bannerDetails.placement === "home"
                          }
                          value="home"
                          className="!w-auto"
                          onChange={() =>
                            this.handleFieldChange(1, "placement")
                          }
                        />
                        <span className="text-sm"> Homepage</span>

                        <input
                          type="radio"
                          name="placement"
                          value="category"
                          checked={
                            this.state.bannerDetails.placement === "category"
                          }
                          className="!w-auto ml-5"
                          onChange={() =>
                            this.handleFieldChange(2, "placement")
                          }
                        />
                        <span className="text-sm"> Category Page</span>
                      </div>
                      <p className="text-[#EB5757] text-xs">
                        {this.state.errMsg.placement}
                      </p>
                    </div>
                  </div>

                  <div className="flex my-4">
                    <div className="flex ml-5 gap-8 w-full">
                      <p className="voucher-labels">Campaign Period</p>

                      <div>
                        <Select
                          isMulti
                          placeholder="Select slots"
                          onChange={(e) =>
                            this.handleFieldChange(e, "bannerSlots")
                          }
                          name="bannerWeekSlot"
                          isOptionDisabled={() =>
                            this.state.bannerDetails.bannerSlots.length >= 2
                          }
                          options={this.state.bannerWeekSlots}
                          className="min-w-[250px] h-[43px] text-ellipsis text-sm"
                        />
                        <p className="mt-1 text-[#EB5757] text-xs">
                          {this.state.errMsg.bannerSlots}
                        </p>

                        <p className="banner-ads-tool-tips mt-3">
                          (Minimum - 1 slot, Maximum - 2 slots)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex my-6">
                    <div className="flex ml-5 gap-8 w-full">
                      <p className="voucher-labels mr-5">Total cost</p>
                      <div className="w-full">
                        <div className="w-[250px] max-[500px]:w-full">
                          <input
                            type="text"
                            name="total_cost"
                            id="total_cost"
                            value={this.state.bannerDetails.totalCost}
                            onChange={(e) =>
                              this.handleFieldChange(e, "totalCost")
                            }
                            placeholder="Enter Total Cost"
                            className="mb-1"
                          />
                          <p className="text-[#EB5757] text-xs">
                            {this.state.errMsg.totalCost}
                          </p>
                        </div>
                        <p className="banner-ads-tool-tips mt-3">
                          Each advertisement price for homepage is $300, and
                          category page is $100
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white mb-4 pb-8 mr-5 h-11/12">
                  <p className="font-semibold ml-5 mt-3">
                    Design and Specifications
                  </p>
                  <p className="banner-ads-tool-tips ml-5 mt-2">
                    *Please Note That The Banner Designs Are Subject To Approval
                    And Must Follow Our Image Dimensions
                  </p>

                  <div className="flex ml-5 mt-5 gap-8 w-full">
                    <p className="voucher-labels">Banner Design (Optional)</p>
                    <div>
                      <div className="relative">
                        <input
                          type="file"
                          name="banner"
                          id="banner"
                          onChange={this.bannerSelection}
                          accept=".png, .jpg, .jpeg"
                          className="opacity-0 absolute !w-full"
                        />
                        <button
                          className="!w-full flex gap-2 px-4 h-11
                          items-center cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35]"
                          onClick={() => this.selectImage("banner")}
                        >
                          {this.state.bannerDetails?.bannerFile ? (
                            <p className="text-center">
                              {this.state.bannerDetails?.bannerFile?.name}
                            </p>
                          ) : (
                            <>
                              <BsPlusCircle />
                              Upload PNG/JPEG File
                            </>
                          )}
                        </button>
                      </div>
                      <p className="banner-ads-tool-tips mt-3">
                        (Image dimensions : 1280 x 409, File size : Under 5MB)
                      </p>
                      <p className="mb-8 text-[#EB5757] text-xs">
                        {this.state.errMsg.bannerImg}
                      </p>
                    </div>
                  </div>

                  <div className="flex ml-5 mt-5 gap-8 w-full">
                    <p className="voucher-labels">Additional Remarks</p>
                    <p className="w-1/2">
                      <textarea
                        rows="4"
                        id="orderComment"
                        onChange={(e) => this.handleFieldChange(e, "remarks")}
                        placeholder="Let us know your design needs if you would like our team to design the banner for you!"
                        value={this.state.bannerDetails.remarks}
                        className="!text-sm border border-[#C1C1C1] rounded-md p-2 w-full"
                      />
                    </p>
                  </div>
                </div>

                <button
                  className="cp text-center rounded-md bg-[#f5ab35] text-sm text-white 
                h-8 w-20 hover:bg-amber-500 disabled:opacity-50  disabled:cursor-default"
                  onClick={this.submitBannerAd}
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
        {this.state.isShowMsg && this.msgPopup()}
      </main>
    );
  }
}

export default withRouter(BannerAds);

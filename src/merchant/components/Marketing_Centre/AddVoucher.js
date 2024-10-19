import React from "react";
import ls from "local-storage";
import withRouter from "../../../Utils.js";

import "../../../css/merchant.css";
import { ApiCalls, Apis } from "../../utils/ApiCalls.js";

import { loginRequired } from "../../utils/Helper.js";
import { Constants } from "../../utils/Constants.js";

import Navbar from "../Navbar.js";
import { Sidebar } from "../Parts.js";
import { MerchantRoutes } from "../../../Routes.js";
import { PageLoader } from "../../../utils/loader.js";
import { BsChevronLeft } from "react-icons/bs";

import DatePicker from "react-datepicker";
import { subDays } from "date-fns";
import Select from "react-select";
import { MdCalendarViewMonth } from "react-icons/md";

import { Modal } from "../../../customer/components/GenericComponents.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import successGif from "../../../assets/success.gif";
import { AiFillWarning } from "react-icons/ai";

const errObj = {
  voucher_name: "",
  voucher_code: "",
  date: "",
  target_buyer: "",
  discount_type: "",
  discount_type_amount: "",
  minimum_spend: "",
  usage_limit: "",
  maximum_discount: "",
  is_multiple_redeem: "",
  usage_per_day: "",
  voucher_visiblity: "",
  voucher_redeem_type: "",
};

const voucherObj = {
  voucher_name: "",
  voucher_code: "",
  from_date: "",
  to_date: "",
  target_buyer: "",
  discount_type: "",
  discount_type_amount: "",
  minimum_spend: "",
  usage_limit: "",
  maximum_discount: "",
  is_multiple_redeem: false,
  usage_per_day: "",
  voucher_visiblity: "",
  voucher_redeem_type: "",
};

class AddVoucherSeller extends React.Component {
  constructor(props) {
    super(props);
    loginRequired(props.page);
    document.title = "Merchant | uShop";

    this.user = ls(Constants.localStorage.user);
    if (this.user) this.user = JSON.parse(this.user);

    this.discountTypes = [
      //{ value: "", label: "Select discount type" },
      { value: "percentage", label: "Percentage" },
      { value: "fixed", label: "Amount" }, //this option not for now; may be to add later
    ];

    let existVoucherObj;
    let actualData;
    if (this.props.location.state) {
      actualData = this.props.location.state.voucherData;
    }
    if (this.props.location.state && this.props.location.state.isEdit) {
      let discountType = this.discountTypes.find(
        (item) => item.value === actualData.discount_type
      );

      existVoucherObj = {
        ...actualData,
        from_date: new Date(actualData.from_date),
        to_date: new Date(actualData.to_date),
        discount_type: discountType,
      };
    }
    this.state = {
      currentTab: 1,
      isSavingVoucherDetails: false,
      voucherDetails:
        this.props.location.state && this.props.location.state.isEdit
          ? existVoucherObj
          : voucherObj,
      //isAddingVoucher: false,
      errMsg: errObj,
      isShowMsg: false,
      message: "",
      isEdit: this.props.location.state?.isEdit ?? false,
    };
  }

  validateFields = (fd) => {
    var voucherErrObj = this.state.errMsg;
    let length = 0,
      lenToCompare = 10;
    if (this.props.location.state?.isEdit) lenToCompare = 15;
    Object.keys(this.state.voucherDetails).forEach((key, index) => {
      if (key === "maximum_discount") {
        if (this.state.voucherDetails.maximum_discount === 100) {
          voucherErrObj = {
            ...voucherErrObj,
            maximum_discount: "Maximum discount must be less than 100",
          };
          length++;
        }
      }
      if (!this.state.voucherDetails.is_multiple_redeem) {
        if (key === "is_multiple_redeem" || key === "usage_per_day") return;
      }

      if (this.props.location.state?.isEdit) {
        if (
          key === "usage_per_day" &&
          this.state.voucherDetails.is_multiple_redeem === "off"
        ) {
          return;
        }
      }

      if (!this.state.voucherDetails[key]) {
        length++;
        switch (key) {
          case "voucher_name":
            voucherErrObj = {
              ...voucherErrObj,
              voucher_name: "Voucher name is required",
            };
            break;
          case "voucher_code":
            voucherErrObj = {
              ...voucherErrObj,
              voucher_code: "Voucher code is required",
            };
            break;
          case "from_date":
          case "to_date":
            voucherErrObj = {
              ...voucherErrObj,
              date: "Both dates are required",
            };
            break;
          case "target_buyer":
            voucherErrObj = {
              ...voucherErrObj,
              target_buyer: "Target buyer is required",
            };
            break;
          case "discount_type":
            voucherErrObj = {
              ...voucherErrObj,
              discount_type: "Discount type is required",
            };
            break;
          case "discount_type_amount":
            voucherErrObj = {
              ...voucherErrObj,
              discount_type_amount: "Discount type amount is required",
            };
            break;
          case "minimum_spend":
            voucherErrObj = {
              ...voucherErrObj,
              minimum_spend: "Minimum spend is required",
            };
            break;
          case "usage_limit":
            voucherErrObj = {
              ...voucherErrObj,
              usage_limit: "Usage limit is required",
            };
            break;
          case "maximum_discount":
            voucherErrObj = {
              ...voucherErrObj,
              maximum_discount: "Maximum discount is required",
            };
            break;
          case "usage_per_day":
            if (this.state.voucherDetails.is_multiple_redeem) {
              voucherErrObj = {
                ...voucherErrObj,
                usage_per_day: "Usage per day is required",
              };
            }
            break;
          default:
        }
      }
    });

    if (this.state.voucherDetails.is_multiple_redeem) {
      if (length > 0 && length <= lenToCompare + 1) {
        this.setState({
          errMsg: voucherErrObj,
        });
        return false;
      } else return true;
    } else {
      if (length > 0 && length <= lenToCompare) {
        this.setState({
          errMsg: voucherErrObj,
        });
        return false;
      } else {
        return true;
      }
    }
  };

  handleFieldChange = (e, type) => {
    var voucherData, voucherErrObj;
    switch (type) {
      case "voucher_name":
        voucherData = {
          ...this.state.voucherDetails,
          voucher_name: e.target.value,
        };
        voucherErrObj = { ...this.state.errMsg, voucher_name: "" };
        this.setState({
          voucherDetails: voucherData,
          errMsg: voucherErrObj,
        });
        break;
      case "voucher_code":
        voucherData = {
          ...this.state.voucherDetails,
          voucher_code: e.target.value,
        };
        voucherErrObj = { ...this.state.errMsg, voucher_code: "" };
        this.setState({
          voucherDetails: voucherData,
          errMsg: voucherErrObj,
        });
        break;
      case "from_date":
        voucherData = {
          ...this.state.voucherDetails,
          from_date: e.target.value,
        };
        voucherErrObj = { ...this.state.errMsg, from_date: "" };
        this.setState({
          voucherDetails: voucherData,
          errMsg: voucherErrObj,
        });
        break;
      case "to_date":
        voucherData = { ...this.state.voucherDetails, to_date: e.target.value };
        voucherErrObj = { ...this.state.errMsg, to_date: "" };
        this.setState({
          voucherDetails: voucherData,
          errMsg: voucherErrObj,
        });
        break;
      case "target_buyer":
        voucherData = {
          ...this.state.voucherDetails,
          target_buyer: e.target.value,
        };
        voucherErrObj = { ...this.state.errMsg, target_buyer: "" };
        this.setState({
          voucherDetails: voucherData,
          errMsg: voucherErrObj,
        });
        break;
      case "discount_type":
        voucherData = {
          ...this.state.voucherDetails,
          discount_type: e.value,
        };
        voucherErrObj = { ...this.state.errMsg, discount_type: "" };
        this.setState({
          voucherDetails: voucherData,
          errMsg: voucherErrObj,
        });
        break;
      case "discount_type_amount":
        voucherData = {
          ...this.state.voucherDetails,
          discount_type_amount: e.target.value,
        };
        voucherErrObj = { ...this.state.errMsg, discount_type_amount: "" };
        this.setState({
          voucherDetails: voucherData,
          errMsg: voucherErrObj,
        });
        break;
      case "minimum_spend":
        voucherData = {
          ...this.state.voucherDetails,
          minimum_spend: e.target.value,
        };
        voucherErrObj = { ...this.state.errMsg, minimum_spend: "" };
        this.setState({
          voucherDetails: voucherData,
          errMsg: voucherErrObj,
        });
        break;
      case "usage_limit":
        voucherData = {
          ...this.state.voucherDetails,
          usage_limit: e.target.value,
        };
        voucherErrObj = { ...this.state.errMsg, usage_limit: "" };
        this.setState({
          voucherDetails: voucherData,
          errMsg: voucherErrObj,
        });
        break;
      case "maximum_discount":
        voucherData = {
          ...this.state.voucherDetails,
          maximum_discount: e.target.value,
        };
        voucherErrObj = { ...this.state.errMsg, maximum_discount: "" };
        this.setState({
          voucherDetails: voucherData,
          errMsg: voucherErrObj,
        });
        break;
      case "is_multiple_redeem":
        if (this.state.voucherDetails.is_multiple_redeem === "on") {
          voucherData = {
            ...this.state.voucherDetails,
            is_multiple_redeem: "off",
          };
          this.setState({
            voucherDetails: voucherData,
          });
        } else {
          voucherData = {
            ...this.state.voucherDetails,
            is_multiple_redeem: "on",
          };
          this.setState({
            voucherDetails: voucherData,
          });
        }
        break;
      case "usage_per_day":
        voucherData = {
          ...this.state.voucherDetails,
          usage_per_day: e.target.value,
        };
        voucherErrObj = { ...this.state.errMsg, usage_per_day: "" };
        this.setState({
          voucherDetails: voucherData,
          errMsg: voucherErrObj,
        });
        break;
      default:
    }
  };

  processVoucherData = (res, api) => {
    this.setState({
      //isAddingVoucher: false,
      errMsg: errObj,
      isShowMsg: true,
      message: res.data,
      voucherDetails:
        res.data.result === "SUCCESS" && !this.state.isEdit
          ? voucherObj
          : this.state.voucherDetails,
      discount_type: " ",
    });
    if (res.data.result === "SUCCESS") {
      var ele = document.getElementsByName("target_buyer");
      for (var i = 0; i < ele.length; i++) ele[i].checked = false;
      let updateurl = MerchantRoutes.VoucherSeller;

      setTimeout(() => {
        this.props.navigate(updateurl);

        setTimeout(() => this.setState({ isShowMsg: false }), 3000);
      }, 3000);
    }
  };

  addNewVoucher = async (e) => {
    e.preventDefault();
    let isValid = this.validateFields();
    if (isValid) {
      //this.setState({ isAddingVoucher: true });
      var fd = new FormData();

      if (
        this.state.voucherDetails.from_date &&
        this.state.voucherDetails.to_date
      ) {
        // var voucherErrObj = this.state.errMsg;
        var stDate =
          this.state.voucherDetails.from_date.getDate() +
          "-" +
          (this.state.voucherDetails.from_date.getMonth() + 1) +
          "-" +
          this.state.voucherDetails.from_date.getFullYear();
        var edDate =
          this.state.voucherDetails.to_date.getDate() +
          "-" +
          (this.state.voucherDetails.to_date.getMonth() + 1) +
          "-" +
          this.state.voucherDetails.to_date.getFullYear();
      }
      fd.append("voucher_name", this.state.voucherDetails.voucher_name);
      fd.append("voucher_code", this.state.voucherDetails.voucher_code);
      fd.append("from_date", stDate);
      fd.append("to_date", edDate);
      fd.append("target_buyer", this.state.voucherDetails.target_buyer);
      if (this.props.location.state) {
        fd.append(
          "discount_type",
          this.state.voucherDetails.discount_type.value
        );
      } else {
        fd.append("discount_type", this.state.voucherDetails.discount_type);
      }
      fd.append(
        "discount_type_amount",
        this.state.voucherDetails.discount_type_amount
      );
      fd.append("minimum_spend", this.state.voucherDetails.minimum_spend);
      fd.append("usage_limit", this.state.voucherDetails.usage_limit);
      fd.append("maximum_discount", this.state.voucherDetails.maximum_discount);
      if (this.state.voucherDetails.is_multiple_redeem === "on") {
        fd.append("is_multiple_redeem", "on");
      } else if (this.state.voucherDetails.is_multiple_redeem === "off") {
        fd.append("is_multiple_redeem", "off");
      }
      if (this.state.voucherDetails.usage_per_day) {
        fd.append("usage_per_day", this.state.voucherDetails.usage_per_day);
      }

      //print formdata
      // for (const [key, value] of fd.entries()) {
      //   console.log("key:", key, "value:", value);
      // }

      ApiCalls(
        fd,
        this.state.isEdit
          ? Apis.updateVoucher +
              this.props.location.state.voucherData.id_voucher +
              "/"
          : Apis.addVoucher,
        "POST",
        {
          Authorization: "Bearer " + this.user.access,
        },
        this.processVoucherData
      );
    }
  };

  selectsDateRange = (dates) => {
    try {
      const [start, end] = dates;
      let voucherErrObj = this.state.errMsg;
      if (end) {
        voucherErrObj = {
          ...voucherErrObj,
          date: "",
        };
      }
      this.setState({
        voucherDetails: {
          ...this.state.voucherDetails,
          from_date: start,
          to_date: end,
        },
        errMsg: voucherErrObj,
      });
    } catch (e) {
      console.log("Error message: " + e);
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
                  Voucher creation failed
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
        <Sidebar selectedMenu={6.1} />
        <div className={mcClass}>
          {/* Page title */}
          <div className="breadcrumbs">
            <div
              className="page-title flex gap-[12px]"
              style={{ paddingBottom: 0 }}
            >
              <button
                className=""
                onClick={() =>
                  this.props.navigate(MerchantRoutes.VoucherSeller)
                }
              >
                <BsChevronLeft />
              </button>
              Vouchers
            </div>
            <ul>
              <li>
                <a href={MerchantRoutes.Landing}>Home {">"}</a>
              </li>
              {this.props.level > 0 && (
                <li className="font">Marketing Centre {">"}</li>
              )}
              {this.props.level > 0 && (
                <li>
                  <a href={MerchantRoutes.VoucherSeller}> Vouchers {">"}</a>
                </li>
              )}
              {this.props.location.state && this.props.location.state.isEdit
                ? this.props.level > 0 && <li>Edit</li>
                : this.props.level > 0 && <li>Create</li>}
            </ul>
          </div>

          {/* Main Page */}
          {this.state.isSettingLoading ? (
            <PageLoader color="#f5ab35" width="35px" height="35px" />
          ) : (
            <div className="listing-page my-5">
              {/* <form onSubmit={this.addNewVoucher}> */}
              {/* Basic Information*/}
              <div className="p-4 bg-white mb-4">
                <p className="font-semibold ml-5 mb-8 mt-3">
                  Basic Information
                </p>

                {/* Voucher Type */}
                <div className="flex my-4">
                  <div className="flex ml-5 gap-2 items-center w-full">
                    <p className="voucher-labels">Voucher Type</p>
                    <p className="ml-20">Shop Voucher</p>
                  </div>
                </div>

                {/* Voucher Name */}
                <div className="flex mt-4">
                  <div className="flex ml-5 gap-8 items-center w-full">
                    <p className="voucher-labels">Voucher Name</p>
                    <p className="w-1/4">
                      <input
                        value={this.state.voucherDetails.voucher_name}
                        placeholder={"Enter Voucher Name"}
                        name="voucher_name"
                        id="voucher_name"
                        onChange={(e) =>
                          this.handleFieldChange(e, "voucher_name")
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="voucher-tool-tips">
                  Voucher name is not visible to buyers.
                </div>
                <div className="voucher-error-msgs">
                  {this.state.errMsg.voucher_name}
                </div>

                {/* Voucher Code */}
                <div className="flex mt-4">
                  <div className="flex ml-5 gap-8 items-center w-full">
                    <p className="voucher-labels">Voucher Code</p>
                    <p className="w-1/4">
                      <input
                        value={this.state.voucherDetails.voucher_code}
                        placeholder={"Enter Voucher Code"}
                        name="voucher_code"
                        id="voucher_code"
                        onChange={(e) =>
                          this.handleFieldChange(e, "voucher_code")
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="voucher-tool-tips">
                  <p>Please enter A-Z, 0-9; 5 characters maximum. </p>
                  <p>Your complete voucher code is:MABE</p>
                </div>
                <div className="voucher-error-msgs">
                  {this.state.errMsg.voucher_code}
                </div>

                {/* Voucher Usage Period */}
                <div className="flex my-4">
                  <div className="flex ml-5 gap-8 items-center w-full">
                    <p className="voucher-labels">Voucher Usage Period</p>

                    <div
                      id="date-picker"
                      className="flex flex-row justify-between px-2 items-center w-1/4"
                    >
                      <DatePicker
                        startDate={this.state.voucherDetails.from_date}
                        endDate={this.state.voucherDetails.to_date}
                        dateFormat="d/M/yyyy"
                        minDate={subDays(new Date(), 0)}
                        monthsShown={2}
                        selectsRange
                        onChange={this.selectsDateRange}
                        width="100%"
                        placeholderText="From Date - To Date"
                      />
                      <MdCalendarViewMonth color="#828282" />
                    </div>
                  </div>
                </div>
                <div className="voucher-error-msgs">
                  {this.state.errMsg.date}
                </div>

                {/* Target Buyer*/}
                <div className="flex mt-4">
                  <div className="flex ml-5 gap-8 items-center w-full">
                    <p className="voucher-labels">Target Buyer</p>

                    <div>
                      <div className="mb-3 mt-8">
                        <input
                          type="radio"
                          id="allBuyers"
                          name="target_buyer"
                          value="all_buyer"
                          className="!w-auto"
                          checked={
                            this.state.voucherDetails.target_buyer ===
                            "all_buyer"
                              ? true
                              : false
                          }
                          onChange={(e) =>
                            this.handleFieldChange(e, "target_buyer")
                          }
                        />
                        <span className="text-sm"> All Buyers</span>
                      </div>

                      <div>
                        <input
                          type="radio"
                          id="newBuyers"
                          name="target_buyer"
                          value="new_buyer"
                          className="!w-auto"
                          checked={
                            this.state.voucherDetails.target_buyer ===
                            "new_buyer"
                              ? true
                              : false
                          }
                          onChange={(e) =>
                            this.handleFieldChange(e, "target_buyer")
                          }
                        />
                        <span className="text-sm"> New Buyers</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="voucher-tool-tips">
                  Buyer who has not purchased from your shop
                </div>
                <div className="voucher-error-msgs">
                  {this.state.errMsg.target_buyer}
                </div>
              </div>

              {/* Reward Settings */}
              <div className="p-4 bg-white mb-4">
                <p className="font-semibold ml-5 mb-8 mt-3">Reward Settings</p>

                {/* Dicount Type Amount */}
                <div className="flex mt-5">
                  <div className="flex ml-5 items-center w-full">
                    <p className="voucher-labels">Discount Type Amount</p>
                    <p className="w-1/4 ml-8">
                      <input
                        placeholder={"Enter Discount Type Amount"}
                        name="discount_type_amount"
                        id="discount_type_amount"
                        value={this.state.voucherDetails.discount_type_amount}
                        onChange={(e) =>
                          this.handleFieldChange(e, "discount_type_amount")
                        }
                      />
                    </p>
                    {/* Drop down */}
                    <p>
                      <Select
                        id="discount_type"
                        name="discount_type"
                        options={this.discountTypes}
                        defaultValue={
                          this.state.voucherDetails
                            ? this.state.voucherDetails.discount_type
                            : "Percentage"
                        }
                        placeholder="Discount Amount & Type"
                        className="text-sm w-64"
                        onChange={(e) => {
                          this.handleFieldChange(e, "discount_type");
                        }}
                      />
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="voucher-error-msgs">
                    {this.state.errMsg.discount_type_amount}
                  </div>
                  <div className="voucher-error-msgs slight-left-margin">
                    {this.state.errMsg.discount_type}
                  </div>
                </div>

                {/* Minimum Basket Price */}
                <div className="flex my-4">
                  <div className="flex ml-5 gap-8 items-center w-full">
                    <p className="voucher-labels">Minimum Basket Price</p>
                    <p className="w-1/4">
                      <input
                        placeholder={"Enter Minimum Basket Price"}
                        name="minimum_spend"
                        value={this.state.voucherDetails.minimum_spend}
                        id="minimum_spend"
                        onChange={(e) =>
                          this.handleFieldChange(e, "minimum_spend")
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="voucher-error-msgs">
                  {this.state.errMsg.minimum_spend}
                </div>

                {/* Usage Quantity */}
                <div className="flex mt-4">
                  <div className="flex ml-5 gap-8 items-center w-full">
                    <p className="voucher-labels">Usage Quantity</p>
                    <p className="w-1/4">
                      <input
                        value={this.state.voucherDetails.usage_limit}
                        placeholder={"Enter Usage Quantity"}
                        name="usage_limit"
                        id="usage_limit"
                        onChange={(e) =>
                          this.handleFieldChange(e, "usage_limit")
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="voucher-tool-tips">
                  Total usable voucher for all buyers
                </div>
                <div className="voucher-error-msgs">
                  {this.state.errMsg.usage_limit}
                </div>

                {/* Maximum Discount */}
                <div className="flex my-4">
                  <div className="flex ml-5 gap-8 items-center w-full">
                    <p className="voucher-labels">Maximum Discount</p>
                    <p className="w-1/4">
                      <input
                        value={this.state.voucherDetails.maximum_discount}
                        placeholder={"Enter Maximum Discount $"}
                        name="maximum_discount"
                        id="maximum_discount"
                        onChange={(e) =>
                          this.handleFieldChange(e, "maximum_discount")
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="voucher-error-msgs">
                  {this.state.errMsg.maximum_discount}
                </div>

                {/* Multiple Redeem */}
                <div className="flex my-4">
                  <div className="flex ml-5 gap-8 items-center w-full">
                    <p className="voucher-labels">Allow Multiple Redemption</p>
                    <p className="flex flex-row">
                      <label className="switch mb-7">
                        <input
                          type="checkbox"
                          id="is_multiple_redeem_switch"
                          checked={
                            this.state.voucherDetails.is_multiple_redeem ===
                            "on"
                              ? true
                              : false
                          }
                          onChange={(e) =>
                            this.handleFieldChange(e, "is_multiple_redeem")
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                      <div className="voucher-special-tool-tip">
                        Allows multiple redemptions for each user
                      </div>
                    </p>
                  </div>
                </div>
                <div className="voucher-error-msgs">
                  {this.state.errMsg.is_multiple_redeem}
                </div>

                {/* Usage Per Day */}
                {this.state.voucherDetails.is_multiple_redeem === "on" && (
                  <>
                    <div className="flex my-4">
                      <div className="flex ml-5 gap-8 items-center w-full">
                        <p className="voucher-labels">Usage Per Day</p>
                        <p className="w-1/4">
                          <input
                            value={this.state.voucherDetails.usage_per_day}
                            placeholder={"Enter usage per day"}
                            name="usage_per_day"
                            id="usage_per_day"
                            onChange={(e) =>
                              this.handleFieldChange(e, "usage_per_day")
                            }
                          />
                        </p>
                      </div>
                    </div>
                    <div className="voucher-error-msgs">
                      {this.state.errMsg.usage_per_day}
                    </div>
                  </>
                )}
              </div>

              <button
                className="cp text-center rounded-md bg-[#f5ab35] text-sm text-white 
                  h-8 w-20 hover:bg-amber-500 disabled:opacity-50  disabled:cursor-default"
                //type="submit"
                //disabled={this.state.isAddingVoucher}
                onClick={this.addNewVoucher}
              >
                Confirm
              </button>
              {/* </form> */}
            </div>
          )}
        </div>
        {this.state.isShowMsg && this.msgPopup()}
      </main>
    );
  }
}

export default withRouter(AddVoucherSeller);

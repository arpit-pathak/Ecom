import React from "react";
import ls from 'local-storage';
import { Constants, Media_Size_Limit } from '../../utils/Constants.js';
import { MerchantRoutes } from "../../../Routes.js";
import { loginRequired } from '../../utils/Helper.js'
import { ApiCalls, Apis } from '../../utils/ApiCalls.js';
import withRouter from '../../../Utils.js';
// import isUrl from "is-url";
// import Tooltip from '@mui/material/Tooltip';
import { domainUrl } from "../../../apiUrls.js";

import { AiFillWarning } from 'react-icons/ai';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import successGif from '../../../assets/success.gif';

import Navbar from '../Navbar.js';
import { Sidebar } from '../Parts.js';
import "../../../css/merchant.css";
import { Modal } from '../../../customer/components/GenericComponents.js';

import sampleLogo from "../../../assets/seller/sample_logo.svg"
import editImg from "../../../assets/edit.png"
import { FaRegCopy } from "react-icons/fa";

const errObj = {
    "name": "",
    'description': "",
    "logo": "",
    "banner": "",
    "url": ""
};

const shopBaseUrl = `${domainUrl}shop/`;

const BANNER_HEIGHT = 600, BANNER_WIDTH = 1200;
const LOGO_DIMENSION = 300

class Shop extends React.Component {
  constructor(props) {
    super(props);
    loginRequired(props.page);
    document.title = "Merchant | uShop";

    this.user = ls(Constants.localStorage.user);
    if (this.user) this.user = JSON.parse(this.user);

    this.state = {
      currentTab: 1,
      isSavingShopDetails: false,
      shopDetails: {
        name: "",
        description: "",
        logo: null,
        banner: null,
        url: shopBaseUrl,
        logoFile: null,
        bannerFile: null,
      },
      errMsg: errObj,
      isShowMsg: false,
      message: "",
      isShowWarning: false,
      copySuccess: false,
    };
  }

  processShopProfileData = (res, api) => {
    if (res.data.result === "SUCCESS") {
      var result = res.data.data;
      var shopData = {
        name: result.shop_name,
        description: result.shop_description ?? "",
        logo: result.shop_logo,
        banner: result.shop_banner,
        url: result.shop_url ?? shopBaseUrl,
        logoFile: null,
        bannerFile: null,
      };
      this.setState({
        shopDetails: shopData,
      });
    }
  };

  loadShopProfile = () => {
    let fd = new FormData();

    ApiCalls(
      fd,
      Apis.shopProfile,
      "GET",
      {
        Authorization: "Bearer " + this.user.access,
      },
      this.processShopProfileData
    );
  };

  componentDidMount = () => {
    //fetch shop profile data on load
    this.loadShopProfile();
  };

  removeSpecialChars = (input) => {
    let specialChars =/[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~]/;
    let chars = input.split("");
    let formattedInput = "";
    for(let i = 0; i < chars.length; i++){
      if(specialChars.test(chars[i])) formattedInput += "";
      else if(chars[i] === " ") formattedInput += "-";
      else formattedInput += chars[i].toLowerCase();
    }

    while(formattedInput.includes("--")) {
      formattedInput = formattedInput.replaceAll("--","-")
    }
    return formattedInput;
  }

  handleFieldChange = (e, type) => {
    var shopData, shopErrobj;
    switch (type) {
      case "name":
        let formattedUrl = this.removeSpecialChars(e.target.value);
        shopData = { ...this.state.shopDetails, name: e.target.value, url: `${shopBaseUrl}${formattedUrl}${formattedUrl.length > 0 ? "/" : ""}` };
        shopErrobj = { ...this.state.errMsg, name: "" };
        this.setState({
          shopDetails: shopData,
          errMsg: shopErrobj,
        });
        break;
      // case "url":
      //   shopData = { ...this.state.shopDetails, url: e.target.value };
      //   shopErrobj = { ...this.state.errMsg, url: "" };
      //   this.setState({
      //     shopDetails: shopData,
      //     errMsg: shopErrobj,
      //   });
      //   break;
      case "description":
        shopData = { ...this.state.shopDetails, description: e.target.value };
        shopErrobj = { ...this.state.errMsg, description: "" };
        this.setState({
          shopDetails: shopData,
          errMsg: shopErrobj,
        });
        break;
      default:
        console.log("default case");
    }
  };

  selectImage = (id) => {
    var fileInput = document.getElementById(id);
    fileInput.click();
  };

  logoSelection = (e) => {
    if (e.target.files && e.target.files[0]) {
      var shopErrobj;
      var file = e.target.files[0];

      //file size check
      let isFileSizeMatching = this.fileSizeCheck(file);

      if (isFileSizeMatching) {
        var imgFile = URL.createObjectURL(file);
        const img = new Image();
        img.src = imgFile;
        img.onload = () => {
          if (img.height >= LOGO_DIMENSION && img.width >= LOGO_DIMENSION) {
            var shopData = {
              ...this.state.shopDetails,
              logo: imgFile,
              logoFile: file,
            };
            shopErrobj = { ...this.state.errMsg, logo: "" };
            this.setState({
              shopDetails: shopData,
              errMsg: shopErrobj,
            });
          } else {
            shopErrobj = {
              ...this.state.errMsg,
              logo: "Logo dimension not appropriate",
            };
            this.setState({
              errMsg: shopErrobj,
            });
          }
        };
      } else {
        shopErrobj = {
          ...this.state.errMsg,
          logo: "Logo size should not exceed 2.0 MB",
        };
        this.setState({
          errMsg: shopErrobj,
        });
      }
    }
  };

  fileSizeCheck = (file) => {
    const mb = 1024 * 1024;
    var fileSize = (file.size / mb).toFixed(2);
    if (fileSize <= 2.0) return true;
    else return false;
  };

  bannerSelection = (e) => {
    if (e.target.files && e.target.files[0]) {
      var shopErrobj;
      var file = e.target.files[0];

      //file size check
      let isFileSizeMatching = this.fileSizeCheck(file);

      if (isFileSizeMatching) {
        //file dimension check
        var imgFile = URL.createObjectURL(file);
        const img = new Image();
        img.src = imgFile;
        img.onload = () => {
          if (img.height >= BANNER_HEIGHT && img.width >= BANNER_WIDTH) {
            var shopData = {
              ...this.state.shopDetails,
              banner: imgFile,
              bannerFile: file,
            };
            shopErrobj = { ...this.state.errMsg, banner: "" };
            this.setState({
              shopDetails: shopData,
              errMsg: shopErrobj,
            });
          } else {
            shopErrobj = {
              ...this.state.errMsg,
              banner: "Banner dimension not appropriate",
            };
            this.setState({
              errMsg: shopErrobj,
            });
          }
        };
      } else {
        shopErrobj = {
          ...this.state.errMsg,
          banner: "Banner size should not exceed 2.0 MB",
        };
        this.setState({
          errMsg: shopErrobj,
        });
      }
    }
  };

  processSaveShopResponse = (res, api) => {
    this.setState({
      isSavingShopDetails: false,
      errMsg: errObj,
      isShowMsg: true,
      message: res.data,
      isShowWarning: false
    });

    if(res.data.result === "SUCCESS") {
      if(ls("merchant_setup") === "N"){
        ApiCalls({},
            Apis.getProfileStatus,
            "GET",
            { "Authorization": "Bearer " + this.user.access, },
            (profileRes,api1)=>{
                ls("merchant_setup", profileRes.data.data.profile_status ?? "N")
            }                    
        );
    }
    }

    setTimeout(() => this.setState({ isShowMsg: false }), 3000);
  };

  validateFields = () => {
    let isNameValid = this.state.shopDetails.name ? true : false;
    if (!isNameValid) {
      this.setState({
        errMsg: { ...this.state.errMsg, name: "Name is required" },
      });
      return;
    }

    // if (this.state.shopDetails["url"] !== "") {
    //   if (!isUrl(this.state.shopDetails["url"])) {
    //     this.setState({
    //       errMsg: { ...this.state.errMsg, url: "URL format is incorrect" },
    //     });
    //     return;
    //   }
    // }

    let length = 0;
    Object.keys(this.state.shopDetails).forEach((key, index) => {
      switch (key) {
        case "description":
        case "url":
          if (this.state.shopDetails[key] === "") length++;
          break;
        case "banner":
        case "logo":
          if (!this.state.shopDetails[key]) length++;
          break;
        default:
          console.log("other img cases");
      }
    });

    if (length === 0) this.saveShopDetails();
    else {
      this.setState({
        isShowWarning: true,
      });
    }
  }

  saveShopDetails = () => {
    
      this.setState({ isSavingShopDetails: true });
      let fd = new FormData();
      fd.append("shop_name", this.state.shopDetails.name);
      fd.append("shop_description", this.state.shopDetails.description);
      fd.append("shop_url", this.state.shopDetails.url);
      fd.append(
        "shop_banner",
        this.state.shopDetails.bannerFile ?? this.state.shopDetails.banner
      );
      fd.append(
        "shop_logo",
        this.state.shopDetails.logoFile ?? this.state.shopDetails.logo
      );

      ApiCalls(
        fd,
        Apis.shopProfile,
        "POST",
        {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + this.user.access,
        },
        this.processSaveShopResponse
      );
   
  };

  onToggle = () => {
    this.setState({
      isShowWarning : false
    })
  }

  copyUrl = () => {
    this.setState({copySuccess : true})
    navigator.clipboard.writeText(this.state.shopDetails.url)

    setTimeout(()=>this.setState({copySuccess: false}), 1000)
  }

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
                  Shop profile creation failed
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
        <Sidebar selectedMenu={4.1} />
        <div className={mcClass}>
          <div className="breadcrumbs">
            <div className="page-title !pb-0">Shop Profile</div>

            <ul>
              <li>
                <a href={MerchantRoutes.Landing}>Home {">"}</a>
              </li>
              <li>
                <a href={MerchantRoutes.Landing}>Shop {">"}</a>
              </li>
              {this.props.level > 0 && (
                <li className="!font-bold">Shop Profile</li>
              )}
            </ul>
          </div>

          {/* {this.body()} */}
          <div className="listing-page my-5">
            <div className="p-4 bg-white mb-4 h-11/12">
              <p className="font-semibold text-[#f5ab35] mb-8 mt-3">
                Basic Information
              </p>
              {/* shop name field */}
              <p className="text-sm mb-3">Shop Name:</p>
              <input
                type="text"
                name="shop_name"
                id="shop_name"
                value={this.state.shopDetails.name}
                onChange={(e) => this.handleFieldChange(e, "name")}
                placeholder="Enter Shop Name"
                className="!w-2/4 mb-1"
              />
              <p className="mb-8 text-[#EB5757] text-xs">
                {this.state.errMsg.name}
              </p>
              {/* shop url field */}
              <div className="flex gap-2 mb-3">
                <p className="text-sm ">Shop URL:</p>
                {/* <Tooltip
                  title={
                    <p className="whitespace-pre-line">
                      {`URL Format: https://www.ushop.market/shop/<your shop name>/
                          Example: https://www.ushop.market/shop/uParcel/
                          Please follow the format exactly.`}
                    </p>
                  }
                >
                  <FontAwesomeIcon icon={faInfoCircle} />
                </Tooltip> */}
              </div>
              <div className="flex gap-2 items-center">
                <div className="!w-2/4 rounded-md flex gap-2 items-center border border-[#c1c1c1]">
                  <input
                    type="text"
                    name="shop_url"
                    id="shop_url"
                    disabled={true}
                    value={this.state.shopDetails.url}
                    // onChange={(e) => this.handleFieldChange(e, "url")}
                    placeholder="Enter Shop URL"
                    className=" mb-1 !border-0"
                  />
                  <FaRegCopy 
                    size={20}
                    className="cp text-[#c1c1c1] mr-2"
                    onClick={this.copyUrl}
                  />
                </div>
                {this.state.copySuccess && 
                <div className="px-2 h-6 bg-orangeButton rounded-md text-white text-sm pt-0.5">Copied</div>}
              </div>
              <p className="mb-8 text-[#EB5757] text-xs">
                {this.state.errMsg.url}
              </p>
              {/* Logo image field */}
              <p className="text-sm mb-3">Shop Logo:</p>
              <div className="flex gap-11 mb-1">
                <div className="w-24 h-24 p-2 relative border border-[#C1C1C1] rounded-md text-center flex items-center justify-center">
                  <img
                    src={this.state.shopDetails.logo ?? sampleLogo}
                    alt=""
                    height="90px"
                    width="90px"
                  />

                  <div className="w-6 h-6 absolute bottom-[10px] right-[-10px] cp">
                    <input
                      type="file"
                      name="shop_logo"
                      id="shop_logo"
                      onChange={this.logoSelection}
                      accept=".png, .jpg, .jpeg"
                      className="opacity-0 absolute"
                    />
                    <img
                      src={editImg}
                      alt=""
                      onClick={() => this.selectImage("shop_logo")}
                      className="absolute"
                    />
                  </div>
                </div>
                <div className="flex items-center text-[#A6A6A6]">
                  <ul className="text-xs list-disc">
                    <li className="mb-2">
                      Recommended image dimensions: Min Width 300px, Min Height
                      300px
                    </li>
                    <li className="mb-2">Maximum file size: 2.0 MB</li>
                    <li className="mb-2">
                      Image format accepted: JPG, JPEG, PNG
                    </li>
                  </ul>
                </div>
              </div>
              <p className="mb-8 text-[#EB5757] text-xs">
                {this.state.errMsg.logo}
              </p>
              {/* banner image field */}
              <p className="text-sm mb-3">Banner Upload</p>
              <div className="flex gap-11 mb-1">
                <div className="w-56 h-28 p-2 relative border border-[#C1C1C1] rounded-md text-center flex items-center justify-center">
                  <img
                    src={this.state.shopDetails.banner ?? sampleLogo}
                    alt=""
                    height="90px"
                    widht="224px"
                  />

                  <div className="w-6 h-6 absolute bottom-[10px] right-[-10px] cp">
                    <input
                      type="file"
                      name="shop_banner"
                      id="shop_banner"
                      onChange={this.bannerSelection}
                      accept=".png, .jpg, .jpeg"
                      className="opacity-0 absolute"
                    />
                    <img
                      src={editImg}
                      alt=""
                      onClick={() => this.selectImage("shop_banner")}
                      className="absolute"
                    />
                  </div>
                </div>
                <div className="flex items-center text-[#A6A6A6]">
                  <ul className="text-xs list-disc">
                    <li className="mb-2">
                      Recommended image dimensions: Min Width 1200px, Min Height
                      600px
                    </li>
                    <li className="mb-2">Maximum file size: 2.0 MB</li>
                    <li className="mb-2">
                      Image format accepted: JPG, JPEG, PNG
                    </li>
                  </ul>
                </div>
              </div>
              <p className="mb-8 text-[#EB5757] text-xs">
                {this.state.errMsg.banner}
              </p>
              {/* shop description field */}
              <p className="text-sm mb-3">Shop Description</p>
              <textarea
                rows="4"
                id="orderComment"
                placeholder="Enter description"
                value={this.state.shopDetails.description}
                onChange={(e) => this.handleFieldChange(e, "description")}
                className="!w-2/4 text-sm border border-[#C1C1C1] rounded-md p-2"
              />
              <p className="mb-8 text-[#EB5757] text-xs">
                {this.state.errMsg.description}
              </p>
            </div>

            {/* save button */}
            <button
              className="cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-24 mb-5 hover:bg-amber-500
                             disabled:opacity-50  disabled:cursor-default"
              onClick={this.validateFields}
              disabled={this.state.isSavingShopDetails}
            >
              {this.state.isSavingShopDetails
                ? "Publishing.."
                : // : this.state.shopDetails?.name ? "Publish"
                  "Publish"}
            </button>
          </div>
        </div>

        {this.state.isShowMsg && this.msgPopup()}

        {this.state.isShowWarning && (
          <Modal
            open={this.state.isShowWarning}
            width="w-2/5"
            children={
              <div>
                <div className="flex justify-between mb-2">
                  <p className="font-semibold">Warning</p>
                  <span
                    className="cp"
                    onClick={() => this.setState({ isShowWarning: false })}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </span>
                </div>
                <hr />
                <div>
                  <p className="mt-4 mb-4 text-sm leading-relaxed">
                    All details are not filled which may affect the Shop's
                    design. Are you willing to proceed ?
                  </p>
                  <hr />
                  <div className="flex justify-end mt-4">
                    <button
                      className="cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5 hover:bg-amber-500
                             disabled:opacity-50  disabled:cursor-default"
                      onClick={this.saveShopDetails}
                    >
                      OK
                    </button>
                    <button
                      className="cp text-center rounded-md border-[#f5ab35] border-2 disabled:border-[#FFD086]
                                 disabled:cursor-default bg-white text-[#f5ab35] h-8 w-20"
                      onClick={this.onToggle}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            }
          />
        )}
      </main>
    );
  }
}

export default withRouter(Shop);
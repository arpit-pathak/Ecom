import React from "react";
import srv from "simple-react-validator";
import ls from "local-storage";
import { ApiCalls } from "../utils/ApiCalls.js";
import { CommonApis, isBtnLoading } from "../../Utils";
import { MerchantRoutes, CustomerRoutes } from "../../Routes.js";
//import { Constants } from '../utils/Constants.js';

//icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

//image
import fg from "../../assets/forgot_password.png";
import { Constants } from "../utils/Constants.js";

class ForgotForm extends React.Component {
  constructor(props) {
    super(props);

    //url params
    var queryParameters = new URLSearchParams(window.location.search);
    this.utype = localStorage.getItem("userType")

    this.validator = new srv();
    this.validator2 = new srv();

    var rtoken = queryParameters.get("token");
    if (rtoken === null && this.props.whichPage === "reset-password")
      window.location.replace(MerchantRoutes.Login);

    this.state = {
      resetBy: null,
      resetToken: rtoken,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.props.whichPage === "reset-password") {
        this.checkEmailToken();
      }
    }, 200);
  }
  //input change
  handleChange = (e, which) => {
    if (which === "sms") {
      this.setState({ forgotPhone: this.forgotPhone.value });
    } else {
      this.setState({ forgotEmail: this.forgotEmail.value });
    }
  };

  //change form
  forgotBy = (e, toForm) => {
    e.preventDefault();

    if (toForm === "sms") this.forgotEmail.value = "";
    if (toForm === "email") this.forgotPhone.value = "";

    this.setState({ resetBy: toForm });
  };

  //submit
  clickForgot = (e) => {
    e.preventDefault();
    var whichForm = "email";
    var val = this.validator2;

    if (this.state.resetBy === "sms") {
      whichForm = this.state.resetBy;
      val = this.validator;
    }

    if (!val.allValid()) {
      val.showMessages();
      this.forceUpdate();
      return;
    }

    if (isBtnLoading(e.target)) {
      return;
    }

    var fd = new FormData();
    if (whichForm === "email") {
      fd.append("email", this.state.forgotEmail);
    } else {
      fd.append("contact_number", this.state.forgotPhone);
    }
    fd.append("usertype_id", this.utype);

    var whichApi = CommonApis.forgotPassword;
    ApiCalls(fd, whichApi, "POST", {}, this.processRes, e.target);
  };
  processRes = (res, api) => {
    var whichForm = "email";
    if (this.state.resetBy === "sms") {
      whichForm = this.state.resetBy;
    }

    var rdata = res.data;
    console.log(rdata);

    if (rdata.result === "FAIL") {
      this.props.togglePop(
        "Oops, something went wrong.",
        rdata.message,
        "error"
      );
      return;
    }

    if (api === CommonApis.resetPasswordEmail + this.state.resetToken + "/") {
      //render change password
      setTimeout(() => {
        ls(Constants.localStorage.ruserToken, this.state.resetToken);
        ls(Constants.localStorage.ruser, JSON.stringify(rdata.data));
        window.location.replace(CustomerRoutes.ChangePassword);
      }, 600);
      return;
    }

    var mh =
      whichForm === "email"
        ? "Mail Sent Successfully"
        : "SMS Send Successfully";
    var mg =
      whichForm === "email"
        ? "An email has been sent to your mail address with instructions to reset password"
        : "An sms has been sent to your phone number with instructions to reset password";
    this.props.togglePop(mh, mg, "success");

    //redirect to otp page
    if (whichForm === "email") {
    }
    if (whichForm === "sms") {
      setTimeout(() => {
        ls(Constants.localStorage.resetDetails, JSON.stringify(rdata.data));
        window.location.replace(CustomerRoutes.ResetPasswordOtp);
      }, 2000);
    }
  };
  checkEmailToken = () => {
    if (this.state.popupSeen) return;

    //get token from url
    if (this.state.resetToken === null) {
      this.props.togglePop(
        "Oops, something went wrong.",
        "Unable to get Reset Password Token. Please try again.",
        "error"
      );
      return;
    }

    var whichApi = CommonApis.resetPasswordEmail;
    ApiCalls(
      null,
      whichApi + this.state.resetToken + "/",
      "GET",
      {},
      this.processRes
    );
  };

  //UI
  render() {
    var field =
      this.state.resetBy === "sms" ? (
        <>
          <div className="site-input mb-6">
            <label>Phone Number</label>
            <div className="field-container">
              <input
                className=" text-sm font-normal"
                type="text"
                placeholder="Enter Phone Number"
                ref={(node) => (this.forgotPhone = node)}
                onChange={(e) => this.handleChange(e, "sms")}
              />
            </div>
            {this.validator.message(
              "phone number",
              this.state.forgotPhone,
              "required|numeric",
              { className: "text-red-600 form-error" }
            )}
          </div>

          <button
            onClick={(e) => this.clickForgot(e)}
            className="site-btn btn-default w-full mb-6"
          >
            <span className="button__text text-lg">Send</span>
          </button>
          <input
            onClick={(e) => this.forgotBy(e, "email")}
            type="button"
            value="Reset via Email"
            className="w-full block site-primary-color text-sm mb-3 cursor-pointer"
          />
        </>
      ) : (
        <>
          <div className="site-input mb-6">
            <label>Email</label>
            <div className="field-container">
              <input
                className="text-sm font-normal"
                type="text"
                placeholder="Enter Email ID"
                ref={(node) => (this.forgotEmail = node)}
                onChange={(e) => this.handleChange(e, "email")}
              />
            </div>
            {this.validator2.message(
              "email",
              this.state.forgotEmail,
              "required|email",
              { className: "text-red-600 form-error" }
            )}
          </div>

          <button
            onClick={(e) => this.clickForgot(e)}
            className="site-btn btn-default w-full mb-6"
          >
            <span className="button__text text-lg">Send</span>
          </button>
          <input
            onClick={(e) => this.forgotBy(e, "sms")}
            type="button"
            value="Reset via OTP"
            className="w-full block site-primary-color text-sm mb-3 cursor-pointer"
          />
        </>
      );

    var fromPage =
      this.utype === 2 ? MerchantRoutes.Landing : CustomerRoutes.Landing;
    return (
      <>
        <form id="form" className="font-normal bg-white ml-20 form-padding2">
          <a className="back-button text-black" href={fromPage}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </a>
          <div className="form-icon">
            <img alt="" src={fg} />
          </div>
          <div className="title text-2xl font-medium text-center mb-6">
            Forgot Password
          </div>

          {field}
        </form>
      </>
    );
  }
}

export default ForgotForm;

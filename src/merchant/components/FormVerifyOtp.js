import React from "react";
import srv from "simple-react-validator";
import ls from "local-storage";
import { ApiCalls } from "../utils/ApiCalls.js";
import { CustomerRoutes } from "../../Routes.js";
import { Constants } from "../utils/Constants.js";
import { CommonApis, isBtnLoading } from "../../Utils.js";

// icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

// css
import "../../css/formVerify.css";

// image
import fg from "../../assets/verify_otp.png";

class ForgotVerifyOtp extends React.Component {
  constructor(props) {
    super(props);

    this.timeoutCounter = null;
    this.validator = new srv();
    this.state = {
      sent: true,
      count: 59,
      rdata: JSON.parse(ls(Constants.localStorage.resetDetails)),

      otp1: null,
      otp2: null,
      otp3: null,
      otp4: null,
      otp5: null,
      otp6: null,
    };

    // Create a reference array for the OTP input fields
    this.otpRefs = Array(6)
      .fill()
      .map(() => React.createRef());
  }

  // on change
  handleChange = (e, index) => {
    const value = e.target.value;

    // Only allow single digits
    if (/^[0-9]$/.test(value)) {
      this.setState({ [`otp${index + 1}`]: value });

      // Move to next input
      if (index < 5) {
        this.otpRefs[index + 1].current.focus();
      }
    } else if (value === "") {
      // If the input is cleared, focus on the previous input
      if (index > 0) {
        this.otpRefs[index - 1].current.focus();
      }
    }
  };

  // flow
  verifyOtp = (e) => {
    e.preventDefault();
    const { otp1, otp2, otp3, otp4, otp5, otp6 } = this.state;

    if (
      [otp1, otp2, otp3, otp4, otp5, otp6].some(
        (otp) => otp === null || otp === ""
      )
    ) {
      this.props.togglePop("Wrong OTP", "Please enter a valid OTP.", "error");
      return;
    }

    if (isBtnLoading(e.target)) {
      console.log("don't send");
      return;
    }

    var fd = new FormData();
    fd.append("id_user", this.state.rdata.id_user);
    fd.append("otp", `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`);

    var whichApi = CommonApis.resetPasswordOtp;
    ApiCalls(fd, whichApi, "POST", {}, this.processRes, e.target);
  };

  resendOtp = (e) => {
    if (this.state.count > 0) {
      var mh = "Oops, something went wrong.";
      var mg =
        "Please wait " +
        this.state.count +
        " seconds before requesting a new OTP.";
      this.props.togglePop(mh, mg, "error");
      return;
    }

    var rdata = this.state.rdata;
    var fd = new FormData();
    fd.append("contact_number", rdata.contact_number);
    fd.append("usertype_id", rdata.id_usertype);

    var whichApi = CommonApis.forgotPassword;
    ApiCalls(fd, whichApi, "POST", {}, this.processRes);
  };

  processRes = (res, api) => {
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

    if (api === CommonApis.forgotPassword) {
      var mh = "SMS Sent Successfully";
      var mg =
        "An SMS has been sent to your phone number with instructions to reset your password.";
      this.props.togglePop(mh, mg, "success");
      ls(Constants.localStorage.resetDetails, JSON.stringify(rdata.data));
      this.setState({
        sent: true,
        count: 59,
      });
    }
    if (api === CommonApis.resetPasswordOtp) {
      setTimeout(() => {
        ls(Constants.localStorage.ruser, JSON.stringify(rdata.data));
        window.location.replace(CustomerRoutes.ChangePassword);
      }, 600);
    }
  };

  // countdown
  countDown = (e) => {
    if (this.timeoutCounter != null) clearTimeout(this.timeoutCounter);
    this.timeoutCounter = setTimeout(() => {
      var curcount = this.state.count - 1;
      this.setState({
        count: curcount,
      });
      if (curcount === 0) {
        this.setState({
          sent: false,
        });
      }
    }, 1000);
  };

  render() {
    if (this.state.sent && this.state.count > 0) {
      this.countDown();
    }
    return (
      <form id="form" className="font-normal bg-white ml-20">
        <a
          className="back-button text-black"
          href={CustomerRoutes.ForgotPassword}
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </a>
        <div className="form-icon">
          <img alt="" src={fg} />
        </div>
        <div className="title text-2xl font-medium text-center mb-6">
          Verify with OTP
        </div>

        <div className="form-subtitle mb-6">
          Please enter the OTP that we have just <br /> sent to your phone{" "}
          <span>{this.state.rdata.contact_number}</span>
        </div>

        <div className="digit-group text-center mb-6" data-group-name="digits">
          {Array.from({ length: 6 }, (_, index) => (
            <input
              key={index}
              type="text"
              id={`digit-${index + 1}`}
              name={`digit-${index + 1}`}
              maxLength={1}
              autoComplete={"off"}
              ref={this.otpRefs[index]}
              onChange={(e) => this.handleChange(e, index)}
            />
          ))}
        </div>

        {this.state.sent && (
          <div className="form-counter mb-6">00:{this.state.count}</div>
        )}

        <button
          onClick={(e) => this.verifyOtp(e)}
          className="site-btn btn-default w-full mb-6"
        >
          <span className="button__text text-lg">Verify</span>
        </button>
        <div
          className="form-resend text-center"
          onClick={(e) => this.resendOtp()}
        >
          Not received OTP? <span>Resend Now</span>
        </div>
      </form>
    );
  }
}

export default ForgotVerifyOtp;

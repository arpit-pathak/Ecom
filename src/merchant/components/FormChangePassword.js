import React from "react";
import srv from "simple-react-validator";
import ls from "local-storage";
import { ApiCalls } from "../utils/ApiCalls.js";
import { CommonApis, isBtnLoading } from "../../Utils.js";
import { MerchantRoutes, CustomerRoutes } from "../../Routes.js";

//icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

//image
import fg from "../../assets/forgot_password.png";
import { Constants } from "../utils/Constants.js";
import img_eye from "../../assets/eye.png";

class FormChangePassword extends React.Component {
  constructor(props) {
    super(props);

    this.validator = new srv();
    this.rusertype = ls("userType");
    if (this.rusertype === null)
      this.rusertype = ls(Constants.localStorage.resetUtype);

    var ruser = ls(Constants.localStorage.ruser);
    if (ruser === null) window.location.replace("/");

    ruser = JSON.parse(ruser);
    this.state = {
      ruser: ruser,
      setpass: null,
      confirmpass: null,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.state.ruser === null) {
        window.location.replace(CustomerRoutes.Landing);
      }
    }, 200);
  }
  //input change
  handleChange = (e, which) => {
    if (which === "setpass") {
      this.setState({ setpass: this.setpass.value });
    }
    if (which === "confirmpass") {
      this.setState({ confirmpass: this.confirmpass.value });
    }
  };
  resetPassword = (e) => {
    e.preventDefault();
    if (!this.validator.allValid()) {
      this.validator.showMessages();
      this.forceUpdate();
      return;
    }

    if (isBtnLoading(e.target)) {
      return;
    }

    var fd = new FormData();
    fd.append("id_user", this.state.ruser.id_user);
    fd.append("password", this.state.setpass);
    fd.append("confirm_password", this.state.confirmpass);

    var whichApi = CommonApis.changePasssword;
    ApiCalls(fd, whichApi, "POST", {}, this.processRes, e.target);
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

    this.props.togglePop(
      "Password Reset",
      "Your password has been reset successfully. Redirecting you to Login page in 2 seconds.",
      "success"
    );
    setTimeout(() => {
      var toWhichLogin =
        ls(Constants.localStorage.resetUtype) === Constants.userType
          ? MerchantRoutes.Login
          : CustomerRoutes.Login;
      window.location.replace(toWhichLogin);
    }, 2000);
  };

  //UI
  render() {
    var backTo =
      this.state.ruser.id_usertype === 2
        ? MerchantRoutes.Landing
        : CustomerRoutes.Landing;
    return (
      <form id="form" className="font-normal bg-white ml-20 form-padding2">
        <a className="back-button text-black" href={backTo}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </a>
        <div className="form-icon">
          <img alt="" src={fg} />
        </div>
        <div className="title text-2xl font-medium text-center mb-6">
          Create New Password
        </div>

        <div className="site-input mb-6">
          <label>New Password</label>
          <div className="field-container">
            <input
              className=" text-sm font-normal"
              type="password"
              placeholder="Enter Password"
              ref={(node) => (this.setpass = node)}
              onChange={(e) => this.handleChange(e, "setpass")}
            />
            <img
              alt=""
              src={img_eye}
              className="animate__animated animate__rubberBand input-icon show-pass"
            />
          </div>
          {this.validator.message(
            "password",
            this.state.setpass,
            [
              "required",
              {
                regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d#$@!%&*?]{8,}$/,
              },
            ],
            {
              className: "text-red-600 form-error",
              messages: {
                regex:
                  "The minimum password length is 8 characters and must contain at least 1 lowercase, 1 uppercase letter, 1 number and 1 special character.",
              },
            }
          )}
        </div>

        <div className="site-input mb-6">
          <label>Confirm New Password</label>
          <div className="field-container">
            <input
              className=" text-sm font-normal"
              type="password"
              placeholder="Enter Password"
              ref={(node) => (this.confirmpass = node)}
              onChange={(e) => this.handleChange(e, "confirmpass")}
            />
            <img
              alt=""
              src={img_eye}
              className="animate__animated animate__rubberBand input-icon show-pass"
            />
          </div>
          {this.validator.message(
            "confirm password",
            this.state.confirmpass,
            ["required", { in: this.state.setpass }],
            {
              className: "text-red-600 form-error",
              messages: {
                in: "Confirm password must be the same as set password field.",
              },
            }
          )}
        </div>

        <button
          onClick={(e) => this.resetPassword(e)}
          className="site-btn btn-default w-full"
        >
          <span className="button__text text-lg">Reset Password</span>
        </button>
      </form>
    );
  }
}

export default FormChangePassword;

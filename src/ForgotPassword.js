import React from "react";
import ls from "local-storage";
//import srv from 'simple-react-validator';

//utils
import { Constants } from "./merchant/utils/Constants.js";

//comp
import Navbar from "./merchant/components/Navbar.js";
import PopupMessage from "./merchant/components/PopupMessage.js";

//images
import background from "./assets/bg-landing.png";
import join from "./assets/join.png";

//css
import "./css/merchant.css";
import "./css/animate.min.css";

import ForgotForm from "./merchant/components/FormForgot.js";
import ForgotVerifyOtp from "./merchant/components/FormVerifyOtp.js";
import ChangePassword from "./merchant/components/FormChangePassword";

//customer components
import { Links } from "./customer/components/GenericSections";

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);

    //this.validator = new srv();
    this.usertype = localStorage.getItem("userType");
    var user = ls(
      this.usertype === "1" ? "customer" : Constants.localStorage.user
    );
    user = user ? JSON.parse(user) : user;

    this.state = {
      appPage: props.page,

      //page
      userJwt: null,
      user: user,

      //popup
      popupSeen: false,
      popupHead: "",
      popupMsg: "",
      popupResult: null,
    };
  }
  componentDidMount() {}

  //popups
  togglePop = (msgHead, msg, result) => {
    this.setState({
      popupSeen: !this.state.popupSeen,
      popupHead: msgHead,
      popupMsg: msg,
      popupResult: result,
    });
  };

  renderForm = () => {
    var which =
      this.state.appPage === null ? this.props.page : this.state.appPage;
    var currentForm = <div></div>;

    if (which === "forgot-password" || which === "reset-password") {
      currentForm = <ForgotForm togglePop={this.togglePop} whichPage={which} />;
    }
    if (which === "reset-password-otp") {
      currentForm = <ForgotVerifyOtp togglePop={this.togglePop} />;
    }
    if (which === "change-password") {
      currentForm = <ChangePassword togglePop={this.togglePop} />;
    }

    return currentForm;
  };

  render() {
    var pageForm = this.renderForm();
    return (
      <>
        <main className="app app-merchant ">
          <Navbar theme="login" />

          <section
            className="landing-login relative"
            style={{ backgroundImage: `url(${background})` }}
          >
            <div className="app-row grid lg:grid-cols-2 md:grid-cols-1">
              <div className="max-lg:hidden">
                <img
                  alt=""
                  src={join}
                  className="mt-32 animate__animated animate__rubberBand"
                />
              </div>
              <div className="form-container">{pageForm}</div>
            </div>
          </section>

          {this.state.popupSeen ? (
            <PopupMessage
              toggle={this.togglePop}
              header={this.state.popupHead}
              message={this.state.popupMsg}
              result={this.state.popupResult}
            />
          ) : null}
          <div className="relative">
            <Links />
          </div>
        </main>
      </>
    );
  }
}

export default ForgotPassword;

import React from "react";
import srv from "simple-react-validator";
import ls from "local-storage";
import { ApiCalls, Apis } from "../utils/ApiCalls.js";
import { MerchantRoutes, CustomerRoutes } from "../../Routes.js";
import { Constants } from "../utils/Constants.js";
import { isBtnLoading, loadSettings } from "../../Utils.js";
import { USER_TYPE } from "../../constants/general.js";
import { PopUpComponent } from "../../customer/components/GenericComponents.js";

import img_eye from "../../assets/eye.png";
import social_fb from "../../assets/icon_fb.svg";
import social_goog from "../../assets/icon_google.svg";

//social
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import { auth, requestForToken } from "../../utils/firebase.js";
import jwtDecode from "jwt-decode";
import GoogleSignIn from "../../customer/components/formComponents/forms/googleSignin.js";
import Loader from "../../utils/loader.js";

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    var cls = Constants.localStorage;
    ls.remove(cls.resetUtype);
    ls.remove(cls.resetDetails);
    ls.remove(cls.user);
    ls.remove(cls.ruser);
    ls.remove(cls.ruserToken);
    ls.remove(cls.fromPage);
    ls.remove("onboarding");

    this.validator = new srv();
    this.state = {
      username: null,
      userpass: null,

      //social info
      socialInfo: {
        email: "",
        email_verified: "0",
        contact_number: "",
        socialId: "",
        social: "",
      },

      loginResult: null,
      popupShow: false,

      isGoogleSigninRequired: false,
      existingId: "",
      googleData: null,
      loading: false,
    };
  }
  
  componentDidMount() {
    loadSettings();
    requestForToken()
  }

  //input change
  handleChange = (event, which) => {
    if (which === "username") this.setState({ username: this.username.value });
    if (which === "userpass") this.setState({ userpass: this.userpass.value });
  };

  //submit
  clickLogin = (e) => {
    e.preventDefault();
    if (!this.validator.allValid()) {
      this.validator.showMessages();
      this.forceUpdate();
      return;
    }

    if (isBtnLoading(e.target)) return;
    //form
    var fd = new FormData();
    fd.append("username", this.state.username);
    fd.append("password", this.state.userpass);
    fd.append("usertype_id", Constants.userType);
    fd.append("token", ls("deviceToken"));
    ApiCalls(fd, Apis.login, "POST", {}, this.processRes, e.target);
  };

  processRes = (res, api) => {
    var rdata = res.data;
    if (rdata.result === "FAIL") {
      if (rdata.message === "account_not_exists") {
        var socialInfo = {
          email: this.state.socialInfo.email,
          email_verified: this.state.socialInfo.email_verified,
          contact_number: this.state.socialInfo.contact_number,
          socialId: this.state.socialInfo.socialId,
          social: this.state.socialInfo.social,
        };
        ls("social_info", JSON.stringify(socialInfo));
        document.location.replace(MerchantRoutes.Register);
      } else {
        this.setState({
          popupShow: true,
          loginResult: rdata,
        });
      }
      this.setState({ loading: false });
      return;
    }
    //success
    if (api === Apis.login || api === Apis.socialSLogin) {
      ls("loggedUser", USER_TYPE.SELLER);
      ls(Constants.localStorage.fromPage, "login");
      ls("merchant_setup", rdata.data.profile_status??"N")
      this.setState({ loading: false });
      ls(Constants.localStorage.user, JSON.stringify(rdata.data));
      ls("sub-seller-permission", rdata.data?.sub_seller_permission ? rdata.data?.sub_seller_permission : null)
      setTimeout(() => {
        window.location.replace(MerchantRoutes.Landing);
      }, 200);
    }
  };

  toForgotPassword = (e) => {
    e.preventDefault();
    localStorage.setItem("userType", "2");
    ls(Constants.localStorage.resetUtype, Constants.userType);
    window.location.replace(CustomerRoutes.ForgotPassword);
  };

  socialLogin = async (platform) => {
    if (this.state.loading) return;

    this.setState({ loading: true });

    var socialInfo = {
      email: "",
      email_verified: "0",
      contact_number: "",
      socialId: "",
      social: platform,
    };

    if (platform === "fb") {
      try {
        var fbProvider = new FacebookAuthProvider();
        let result = await signInWithPopup(auth, fbProvider);

        if (result.user) {
          var ruser = result.user;
          if (ruser.email) {
            socialInfo.email = ruser.email;
            socialInfo.email_verified = "1";
          }
          if (ruser.uid) socialInfo.socialId = ruser.uid;
          if (ruser.phoneNumber) socialInfo.contact_number = ruser.phoneNumber;
        }
      } catch (error) {
        console.log("error google login: " + error);
        const credential = FacebookAuthProvider.credentialFromError(error);
        const emailId = error.customData.email;
        let user = auth?.currentUser;
        if (
          error.code === "auth/account-exists-with-different-credential" &&
          credential &&
          emailId
        ) {
          this.setState(
            { existingId: { emailId: emailId, credential: credential } },
            () => {
              if (user) this.mergeFirebaseAccounts(user);
              else this.setState({ isGoogleSigninRequired: true });
            }
          );

          return;
        }
      }
    }
    if (platform === "gg") {
      var googleProvider = new GoogleAuthProvider();
      try {
        let result = await signInWithPopup(auth, googleProvider);
        var user = jwtDecode(result.user.accessToken);
        if (user) {
          if (user.email) {
            socialInfo.email = user.email;
            socialInfo.email_verified = "1";
          }
          if (user.user_id) socialInfo.socialId = user.user_id;
        }
      } catch (error) {
        console.log("error google login: " + error);
      }
    }

    if (platform === "") socialInfo = this.state.googleData;

    if (socialInfo.socialId === null || socialInfo.socialId === "") {
      this.props.togglePop(
        "Oops, something went wrong.", "We are unable to retrieve your social profile.",
        "error"
      );
      this.setState({ loading: false });
      return;
    }

    this.setState({
      socialInfo: {
        email: socialInfo.email,
        email_verified: socialInfo.email_verified,
        socialId: socialInfo.socialId,
        social: socialInfo.social,
        contact_number: socialInfo.contact_number,
      },
    });


    var fd = new FormData();
    fd.append("platform", socialInfo.social === "gg" ? "google" : "facebook");
    fd.append("usertype_id", Constants.userType);
    fd.append("social_id", socialInfo.socialId);
    fd.append("email", socialInfo.email);
    fd.append("email_verified", socialInfo.email_verified);
    fd.append("token", ls("deviceToken"));

    await ApiCalls(fd, Apis.socialSLogin, "POST", {}, this.processRes);

    //set loading to false here instead of inside the processres
    setTimeout(() => {
      this.setState({ loading: false });
    }, 200);
  };

  mergeFirebaseAccounts = async (user) => {
    var currentInfo = {
      email: "",
      email_verified: "0",
      contact_number: "",
      socialId: "",
      social: "fb",
    };

    try {
      const linkedUser = await linkWithCredential(
        user,
        this.state.existingId?.credential
      );
      if (linkedUser.user) {
        var ruser = linkedUser.user;

        if (ruser.email) {
          currentInfo.email = ruser.email;
          currentInfo.email_verified = "1";
        }

        if (ruser.uid) currentInfo.socialId = ruser.uid;

        if (ruser.phoneNumber) currentInfo.contact_number = ruser.phoneNumber;
      }
      this.setState({ loading: false });
      this.setState({ googleData: currentInfo }, () => this.socialLogin(""));
    } catch (e) {
      this.props.togglePop(
        "Oops, something went wrong.",
        "Please refresh the page and try again",
        "error"
      );
      this.setState({ loading: false });
      console.log(e);
    }
  };

  getGoogleData = async () => {
    this.setState({ isGoogleSigninRequired: false });
    try {
      const linkedProvider = new GoogleAuthProvider();
      linkedProvider.setCustomParameters({
        login_hint: this.state.existingId?.emailId,
      });

      const result = await signInWithPopup(auth, linkedProvider);
      if (result?.user) this.mergeFirebaseAccounts(result.user);
    } catch (e) {
      console.log("Google login err", e);
    }
  };

  closeGooglePopup = () => this.setState({ isGoogleSigninRequired: false });

  //UI
  render() {
    return (
      <>
        <form id="form" className="font-normal bg-white ml-20">
          <div className="title text-2xl font-medium">
            Log-in to your Seller Centre
          </div>
          <div className="subtitle text-base mb-[35px]">
            Please fill your details below
          </div>

          <div className="site-input mb-5">
            <label>Email/Number</label>
            <div className={"field-container"}>
              <input
                className=" text-sm font-normal"
                name="emailno"
                type="text"
                placeholder="Email or Phone Number"
                autoComplete="off"
                ref={(node) => (this.username = node)}
                onChange={(e) => this.handleChange(e, "username")}
              />
            </div>

            {this.validator.message(
              "email/number",
              this.state.username,
              "required",
              { className: "text-red-600 form-error" }
            )}
          </div>

          <div className="site-input mb-3">
            <label>Password</label>
            <div className="field-container">
              <input
                className=" text-sm font-normal"
                name="password"
                type="password"
                placeholder="Password"
                ref={(node) => (this.userpass = node)}
                onChange={(e) => this.handleChange(e, "userpass")}
              />
              <img
                alt=""
                src={img_eye}
                className="animate__animated animate__rubberBand input-icon show-pass"
              />
            </div>

            {this.validator.message(
              "password",
              this.state.userpass,
              "required",
              {
                className: "text-red-600 form-error",
              }
            )}
          </div>

          <div className="forgot-link mb-3">
            <a href="/" onClick={(e) => this.toForgotPassword(e)} className="">
              Forgot Password
            </a>
          </div>
          <button
            onClick={(e) => this.clickLogin(e)}
            className="site-btn btn-default w-full"
            disabled={this.state.loading}
          >
            {this.state.loading ? (
              <div className="h-[25px] flex justify-center ">
                <Loader />
              </div>
            ) : (
              <span className="button__text text-lg">Log in</span>
            )}
          </button>

          <div className="login-with my-[25px] text-center">
            <span className=" mr-2">Login with</span>
            <div className="icon_social animate__animated animate__fadeInDown">
              <img
                alt=""
                src={social_fb}
                className="social-login "
                onClick={(e) => this.socialLogin("fb")}
              />
            </div>
            <div className="icon_social animate__animated animate__fadeInDown">
              <img
                alt=""
                src={social_goog}
                className="social-login "
                onClick={(e) => this.socialLogin("gg")}
              />
            </div>
          </div>

          <div className="divider-text mb-3">
            <div></div>
            <span>New to uShop ?</span>
          </div>

          {/*
            <a href={MerchantRoutes.Register} className='site-btn btn-border-default w-full block' >
                <span className='button__text text-lg'>Create your Seller Account</span>
            </a>
            */}

          <button
            onClick={(e) => this.props.changeForm("register")}
            className="site-btn btn-border-default w-full block"
          >
            <span className="button__text text-lg">
              Create your Seller Account
            </span>
          </button>
        </form>
        {this.state.popupShow && (
          <PopUpComponent
            message={this.state.loginResult.message}
            open={this.state.popupShow}
            close={() => this.setState({ popupShow: false })}
            result={"error"}
          ></PopUpComponent>
        )}

        {this.state.isGoogleSigninRequired && (
          <GoogleSignIn
            isGoogleSigninRequired={this.state.isGoogleSigninRequired}
            closeGooglePopup={this.closeGooglePopup}
            getGoogleData={this.getGoogleData}
          />
        )}
      </>
    );
  }
}

export default LoginForm;

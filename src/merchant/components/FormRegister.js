import React from 'react'
import srv from 'simple-react-validator';
import ls from 'local-storage';
import Select from 'react-select';
import { ApiCalls, Apis } from '../utils/ApiCalls.js';
import { isBtnLoading, loadSettings } from '../../Utils.js';
import { CustomerRoutes, MerchantRoutes } from '../../Routes.js';
import { Constants } from '../utils/Constants.js';

import img_eye from '../../assets/eye.png';
import social_fb from '../../assets/icon_fb.svg';
import social_goog from '../../assets/icon_google.svg';

import { CountryCodes, CountryNames } from '../../CountryCodes.js';
import { USER_TYPE } from '../../constants/general.js';
//icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import ReactCountryFlag from "react-country-flag";

//social
import {
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    linkWithCredential
} from "firebase/auth";
import { auth, requestForToken } from "../../utils/firebase.js";
import jwtDecode from "jwt-decode";
import GoogleSignIn from '../../customer/components/formComponents/forms/googleSignin.js';
import Loader from '../../utils/loader.js';

class RegisterForm extends React.Component {
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

        var socialInfo = ls("social_info");
        socialInfo = (socialInfo != null) ? JSON.parse(socialInfo) : null;

        this.validator = new srv();
        this.otpValidator = new srv();
        this.state = {
            otp: null,
            contact: null,
            email: null,
            setpass: null,
            confirmpass: null,
            findfrom: null,
            phonecode: "+65",
            phoneflag: "SG",
            isSentOtp: false,
            validOtp: false,
            responseData: null,
            others: null,
            socialInfo: socialInfo,
            isOtpFormatValid : true,

            binding: null,
            bindUser: null,
            bindpass: null,

            blockedOtp: false,

            tc: false,  //terms & conditions
            dpn : false, //data protection notice
            prommail: false,

            isGoogleSigninRequired : false,
            existingId: "",
            googleData: null,
            loading:false,

            ushopOptions : []
        };
    }
    componentDidMount() {
      this.getSettings();
      requestForToken()
    }

    getSettings = async () => {
      let result = await loadSettings();
      this.setState({ushopOptions : result?.find_from})
    }

    //country drop event
    setPhone = (phone, country) => {
        console.log(phone + " " + country);
        this.setState({
            phoneflag: country,
            phonecode: "+" + phone
        });
    }
    createSelectPhone = () => {
        var arr = [];
        var arrKey = [];
        var ordered = Object.keys(CountryCodes).sort().reduce(
            (obj, key) => {
                obj[key] = CountryCodes[key];
                return obj;
            },
            {}
        );

        Object.keys(ordered).forEach(function (key) {
            arr.push(ordered[key]);
            arrKey.push(key);
        });

        var slobj = <div className='country-code-drop'>
            <button className="dropbtn" data-phone='+65'>
                <ReactCountryFlag
                    countryCode={this.state.phoneflag}
                    svg
                    style={{
                        width: '22px',
                        height: '22px',
                        marginRight: '5px'
                    }}
                    className="dropflag"
                />

                <FontAwesomeIcon icon={faAngleDown} className="dropicon" />
                <span>{this.state.phonecode}</span>
            </button>
            <div className='options'>
                {arr.map((item, i) => <div key={item + arrKey[i]} onClick={e => this.setPhone(item, arrKey[i])}>{CountryNames[arrKey[i]]} {item}</div>)}
            </div>
        </div>
        return slobj;
    }

    //create drop from
    setFrom = (from) => {
        this.setState({
            findfrom: from,
        });
    }
    createSelectFrom = () => {
        var arr = ls("settings");
        if (arr === null) {
         arr = this.state.ushopOptions;
        } else {
            arr = JSON.parse(arr);
            arr = arr.find_from;
        }
        arr = arr.map(e => {
            return { label: e, value: e };
        });

        var slobj = <Select id="reference" name="reference" options={arr} placeholder="Where did you hear about uShop?"
            onChange={e => this.setFrom(e.value)} />
        return slobj;
    }

    //input on change
    handleChange = (event, which) => {
        if (which === "otp") {
            this.setState({ otp: this.otp.value })

            //call api to check otp
            if (this.otp.value.length === 6) {
                this.validateOtp(this.otp.value);
            } else {
                this.setState({ validOtp: false, isOtpFormatValid: false })
            }

        }
        if (which === "contact") {
            this.setState({ phone: this.phone.value })
        }
        if (which === "email") {
            this.setState({ email: this.email.value })
        }
        if (which === "setpass") {
            this.setState({ setpass: this.setpass.value })
        }
        if (which === "bindpass") {
            this.setState({ bindpass: this.bindpass.value })
        }
        if (which === "confirmpass") {
            this.setState({ confirmpass: this.confirmpass.value })
        }
        if (which === "findfrom") {
            this.setState({ findfrom: this.findfrom.value })
        }
        if (which === "phone") {
            this.setState({ phone: this.phone.value })
        }
        if (which === "others") {
            this.setState({ others: this.others.value })
        }
    };

    //register flow
    validateOtp = (otp) => {
        if (!this.otpValidator.allValid()) {
            this.otpValidator.showMessages();
            this.forceUpdate();
            return;
        }

        var fd = new FormData();
        fd.append("contact_number", this.state.phone);
        fd.append("usertype_id", Constants.userType);
        fd.append("otp", otp);

        var whichApi = Apis.verifyOtp;
        ApiCalls(fd, whichApi, 'POST', {}, this.processRes);
    }

    clickSendOtp = (e) => {
        if (!this.otpValidator.allValid()) {
            this.otpValidator.showMessages();
            this.forceUpdate();
            return;
        }

        var elementInput = document.getElementById("otpfield");
        elementInput.value = "";

        var fd = new FormData();
        fd.append("country_code", this.state.phonecode);
        fd.append("contact_number", this.state.phone);
        fd.append("usertype_id", Constants.userType);

        var whichApi = Apis.sendOtp;
        ApiCalls(fd, whichApi, 'POST', {}, this.processRes);
    }

    clickSignup = (e) => {
        e.preventDefault();
        var isRemarks = false;
        if (this.state.socialInfo === null) {
            if (!this.state.validOtp) {
                this.props.togglePop(
                    "Oops, something went wrong.",
                    "Contact number is not valid. Please fill up the contact number then click Send OTP and enter your otp.",
                    'error'
                );
                return;
            }
            if (!this.validator.allValid()) {
                this.validator.showMessages();
                this.forceUpdate();
                return;
            }

            if (this.state.findfrom === null) {
                this.props.togglePop("Oops, something went wrong.", "Please select from where did you hear about uShop.", 'error')
                return;
            }

            if(this.state.tc === false){
                this.props.togglePop("Oops, something went wrong.", "Please agree to terms & conditions", 'error')
                return;
            }

            if(this.state.dpn === false){
                this.props.togglePop("Oops, something went wrong.", "Please agree to data protection notice", 'error')
                return;
            }


            var ff = this.state.findfrom;
            ff = (ff + "").toLowerCase();
            isRemarks = (this.state.others === null || this.state.others === "");
            if (ff.indexOf("others") > -1 && isRemarks) {
                this.props.togglePop("Oops, something went wrong.", "Please fill in remarks field.", 'error')
                return;
            }
        } else {
            if (!this.otpValidator.allValid()) {
                this.otpValidator.showMessages();
                this.forceUpdate();
                return;
            }

            // check if email is not provided by ffacebook or google 
            if (this.state.socialInfo.email_verified === "0" && !this.validator.allValid()) {
                this.validator.showMessages();
                this.forceUpdate();
                return;
            }
        }

        if (isBtnLoading(e.target)) {
            console.log("dont allow to resubmit")
            return;
        }

        var fd = new FormData();
        var whichApi = Apis.signup;
        var userEmail = this.state.email;
        if (this.state.socialInfo !== null && this.state.socialInfo.email_verified === "1") {
            userEmail = this.state.socialInfo.email;
        }

        fd.append("email", userEmail);
        fd.append("contact_number", this.state.phone);
        fd.append("usertype_id", Constants.userType);
        fd.append("token", ls("deviceToken"));

        if (this.state.socialInfo === null) {
            fd.append("confirm_password", this.state.confirmpass);
            fd.append("otp", this.state.otp);
            fd.append("find_from", this.state.findfrom);
            fd.append("term_n_con", this.state.tc ? "y" : "n");
            fd.append("data_protect_noti", this.state.dpn ? "y" : "n");
            fd.append("promotion_email", this.state.prommail ? "y" : "n");

            if (isRemarks) fd.append("others_text", this.state.others);
        } else {
            whichApi = Apis.socialSignup;
            fd.append("platform", (this.state.socialInfo.social === "gg") ? "google" : "facebook");
            fd.append("email_verified", this.state.socialInfo.email_verified);
            fd.append("social_id", this.state.socialInfo.socialId);
        }

        ApiCalls(fd, whichApi, 'POST', {}, this.processRes, e.target);
    }
    
    bindSocialUser = (e) => {
        e.preventDefault();
        if (!this.otpValidator.allValid()) {
            this.otpValidator.showMessages();
            this.forceUpdate();
            return;
        }
        if (!this.validator.allValid()) {
            this.validator.showMessages();
            this.forceUpdate();
            return;
        }

        if (isBtnLoading(e.target)) {
            console.log("dont allow to resubmit")
            return;
        }

        var fd = new FormData();
        fd.append("id_user", this.state.bindUser.id_user);
        fd.append("platform", this.state.bindUser.platform);
        fd.append("social_id", this.state.bindUser.social_id);
        fd.append("password", this.state.bindpass);
        ApiCalls(fd, Apis.bindUser, 'POST', {}, this.processRes, e.target);

    }

    processRes = (res, api) => {
        var rdata = res.data;
        console.log(rdata);

        if (rdata.result === "FAIL") {
            if (api === Apis.sendOtp) {
                this.props.togglePop("Resend OTP", rdata.message, 'error');
                return;
            }

            if (api === Apis.verifyOtp) {
                var em = rdata.message;
                if (rdata.message.includes("does not exist")) {
                    em = "Please click the Send OTP button first";
                }
                this.setState({
                    otpErrorMessage: em,
                    isSentOtp: false,
                });
                return;
            }

            this.props.togglePop("Oops, something went wrong.", rdata.message, 'error');
            if (rdata.step === "toBindAccount") {
                this.setState({ binding: true, bindUser: rdata.data });
            }
            return;
        }

        //success
        if (api === Apis.sendOtp) {
            this.setState({
                isSentOtp: true,
                otpErrorMessage: "",
                blockedOtp: true,
                isOtpFormatValid : true
            })
        }
        if (api === Apis.signup || api === Apis.socialSignup || api === Apis.bindUser) {
            ls(Constants.localStorage.user, JSON.stringify(rdata.data));
            ls("merchant_setup", rdata.data.profile_status ?? "N")
            ls("sub-seller-permission", rdata.data?.sub_seller_permission ? rdata.data?.sub_seller_permission : null)
            ls("loggedUser", USER_TYPE.SELLER);
            ls(Constants.localStorage.fromPage, "register");

            ls.remove("social_info");
            //go to success page > //go to dashboard
            setTimeout(() => {
                window.location.replace(MerchantRoutes.Landing);
            }, 200)

        }
        if (api === Apis.verifyOtp) {
            this.setState({
                validOtp: true,
                isOtpFormatValid: true,
                isSentOtp: false,
                otpErrorMessage: ""
            })
        }
    }

    //social signup
    socialSignup = async (platform) => {
        if (this.state.loading) {
            console.log("already loading social profile...");
            return;
        }
        this.setState({loading : true});
        var socialInfo = {
            email: "",
            email_verified: "0",
            contact_number: "",
            socialId: '',
            social: platform
        };

        if (platform === "fb") {
          try {
            var fbProvider = new FacebookAuthProvider();
            var result = await signInWithPopup(auth, fbProvider);
            if (result.user) {
              var ruser = result.user;
              if (ruser.email) socialInfo.email = ruser.email;
              if (ruser.email) socialInfo.email_verified = "1";
              if (ruser.uid) socialInfo.socialId = ruser.uid;
              if (ruser.phoneNumber)
                socialInfo.contact_number = ruser.phoneNumber;
            }
          } catch (error) {
            console.log("error google login: " + error);
            const credential = FacebookAuthProvider.credentialFromError(error);
            const emailId = error.customData.email;
            this.setState(
              { existingId: { emailId: emailId, credential: credential } },
              async () => {
                if (
                  error.code ===
                    "auth/account-exists-with-different-credential" &&
                  credential &&
                  emailId
                ) {
                  let user = auth?.currentUser;
                  if (user) await this.mergeFirebaseAccounts(user);
                  else this.setState({ isGoogleSigninRequired: true });
                   
                  return;
                }
              }
            );
          }
      }
        if (platform === "gg") {
            var googleProvider = new GoogleAuthProvider();
            try {
                let result = await signInWithPopup(auth, googleProvider);
                var user = jwtDecode(result.user.accessToken);
                //console.log(result);
                //console.log(user);

                if (user) {
                    if (user.email) socialInfo.email = user.email;
                    if (user.email) socialInfo.email_verified = "1";
                    if (user.user_id) socialInfo.socialId = user.user_id;
                }

            } catch (error) {
                console.log("error google login: " + error);
            }

        }

        if(platform === "") socialInfo = this.state.googleData

        if (socialInfo.socialId === null || socialInfo.socialId === "") {
            this.props.togglePop("Oops, something went wrong.", "We are unable to retrieve your social profile.", 'error')
            this.setState({loading :false});
            return;
        }

        var fd = new FormData();
        fd.append("platform", socialInfo.social === "gg" ? "google" : "facebook")
        fd.append("usertype_id", Constants.userType);
        fd.append("social_id", socialInfo.socialId);
        fd.append("email",  socialInfo.email);
        fd.append("email_verified",  socialInfo.email_verified);
        fd.append("token", ls("deviceToken"));

    
        await ApiCalls(fd, Apis.socialSLogin, "POST", {}, 
        (res,api) =>{
            var rdata = res.data;
            if (rdata.result === "FAIL") {
                if(rdata.message === "account_not_exists"){
                  var tempInfo = {
                    email: socialInfo.email,
                    email_verified: socialInfo.email_verified,
                    contact_number: socialInfo.contact_number,
                    socialId: socialInfo.socialId,
                    social: socialInfo.social
                  };
                    ls("social_info", JSON.stringify(tempInfo));
                    this.setState({loading :false});
                    document.location.replace(MerchantRoutes.Register);
                }     
                return;
              }

              ls("loggedUser", USER_TYPE.SELLER);
              ls(Constants.localStorage.fromPage, "login");
              ls(Constants.localStorage.user, JSON.stringify(rdata.data));
              setTimeout(() => {
                this.setState({loading :false});
                window.location.replace(MerchantRoutes.Landing);
              }, 200);
        });
  }

    mergeFirebaseAccounts = async (user) => {
      var currentInfo = {
        email: "",
        email_verified: "0",
        contact_number: "",
        socialId: "",
        social: "fb",
      };

      try {
        const linkedUser = await linkWithCredential(user, this.state.existingId?.credential);
        if (linkedUser.user) {
          var ruser = linkedUser.user;
  
          if (ruser.email) {
            currentInfo.email = ruser.email;
            currentInfo.email_verified = "1";
          }
  
          if (ruser.uid) currentInfo.socialId = ruser.uid;
  
          if (ruser.phoneNumber) currentInfo.contact_number = ruser.phoneNumber;
        }
        this.setState({loading : false})
        this.setState({googleData: currentInfo}, () => this.socialSignup(""))
      } catch (e) {
        this.setState({loading : false})
        console.log(e);
      }
    };

     getGoogleData = async () => {
      this.setState({isGoogleSigninRequired : false});
      console.log("Get google data ", this.state.existingId);
      try {
        const linkedProvider = new GoogleAuthProvider();
        linkedProvider.setCustomParameters({ login_hint: this.state.existingId?.emailId });
  
        const result = await signInWithPopup(auth, linkedProvider);
        console.log(result);
        if(result?.user) this.mergeFirebaseAccounts(result.user);
  
      } catch (e) {
        console.log("Google login err", e);
      }
    };  

    closeGooglePopup = () => this.setState({isGoogleSigninRequired : false})

    //UI
    render() {
        var selectPhone = this.createSelectPhone();
        var selectFrom = this.createSelectFrom();
        var showOthers = (this.state.findfrom != null && (this.state.findfrom + "").toLowerCase().indexOf("others") > -1);

        return (
          <form id="form" className="font-normal bg-white ml-20">
            <div className="title text-2xl font-medium">Welcome to uShop</div>
            <div className="subtitle text-base mb-[35px]">
              Create your account to start selling
            </div>

            {this.state.socialInfo === null && (
              <>
                <div className="site-input mb-5">
                  <div className="field-container phone-drop">
                    {selectPhone}
                    <input
                      className=" text-sm font-normal"
                      placeholder="Phone Number"
                      ref={(node) => (this.phone = node)}
                      onChange={(e) => this.handleChange(e, "phone")}
                    />
                  </div>
                  <div
                    className="site-btn btn-border-default block phone-otp"
                    onClick={(e) => this.clickSendOtp(e)}
                  >
                    <span className="button__text text-sm">Send OTP</span>
                  </div>

                  {this.otpValidator.message(
                    "phone number",
                    this.state.phone,
                    "required|numeric",
                    { className: "text-red-600 form-error" }
                  )}
                </div>

                <div className="site-input mb-5">
                  <div className='flex gap-2 w-full'>
                  <div className="field-container !w-72">
                    <input
                      className=" text-sm font-normal"
                      id="otpfield"
                      type="number"
                      placeholder="Enter OTP"
                      maxLength={6}
                      ref={(node) => (this.otp = node)}
                      // onChange={(e) => this.handleChange(e, "otp")}
                      onChange={e => this.setState({isOtpFormatValid: true})}
                    />
                    {this.state.validOtp ? (
                      <FontAwesomeIcon
                        icon={faCircleCheck}
                        className="input-icon check-green"
                      />
                    ) : (
                      <></>
                    )}
                  </div>
                  <div
                    className="site-btn btn-border-default block phone-otp"
                    onClick={(e) => this.handleChange(e, "otp")}
                  >
                    <span className="button__text text-sm">Validate</span>
                  </div>
                  </div>
                  {this.state.isSentOtp === true && (
                    <div className="sentOtp">
                      We have sent an OTP in a SMS to your mobile number
                    </div>
                  )}
                  {!this.state.isOtpFormatValid  ? (
                     <div className="sentOtp error-color">
                     Invalid OTP
                   </div>)
                   : <>
                  {this.state.otpErrorMessage && (
                    <div className="sentOtp error-color">
                      {this.state.otpErrorMessage}
                    </div>
                  )}</>}
                  {this.validator.message(
                    "otp",
                    this.state.otp,
                    "required|numeric|min:6|max:6",
                    { className: "text-red-600 form-error" }
                  )}
                </div>

                <div className="site-input mb-3">
                  <div className="field-container">
                    <input
                      className=" text-sm font-normal"
                      type="text"
                      placeholder="Email ID"
                      ref={(node) => (this.email = node)}
                      onChange={(e) => this.handleChange(e, "email")}
                    />
                  </div>
                  {this.validator.message(
                    "email",
                    this.state.email,
                    "required|email",
                    { className: "text-red-600 form-error" }
                  )}
                </div>

                <div className="site-input mb-3">
                  <div className="field-container">
                    <input
                      className=" text-sm font-normal"
                      type="password"
                      placeholder="Set Password"
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
                    "set password",
                    this.state.setpass,
                    [
                      "required",
                      {
                        regex:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d#$@!%&*?]{8,}$/,
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

                <div className="site-input mb-3">
                  <div className="field-container">
                    <input
                      className=" text-sm font-normal"
                      type="password"
                      placeholder="Confirm Password"
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

                <div className="site-input mb-3">{selectFrom}</div>
                {showOthers ? (
                  <div className="site-input mb-3">
                    <div className="field-container">
                      <input
                        className=" text-sm font-normal"
                        type="text"
                        placeholder="Remarks..."
                        ref={(node) => (this.others = node)}
                        onChange={(e) => this.handleChange(e, "others")}
                      />
                    </div>
                  </div>
                ) : null}
                {/* checkboxes */}

                <label htmlFor="tc" className="text-xs text-[#828282] mb-2">
                  <input
                    type="checkbox"
                    id="tc"
                    name="tc"
                    value={this.state.tc}
                    className="align-middle"
                    onChange={(e) => {
                      this.setState({
                        tc: e.target.checked,
                      });
                    }}
                  />{" "}
                  I agree with the{" "}
                  <span
                    className="font-semibold text-black underline cp"
                    onClick={() =>
                      window.open(CustomerRoutes.FooterPages.replace(":slug", "terms-conditions"), "_blank")
                    }
                  >
                    Terms & Conditions
                  </span>
                </label>
                <br></br>

                <label htmlFor="dpn" className="text-xs text-[#828282] mb-2">
                  <input
                    type="checkbox"
                    id="dpn"
                    name="dpn"
                    value={this.state.dpn}
                    className="align-middle"
                    onChange={(e) => {
                      this.setState({
                        dpn: e.target.checked,
                      });
                    }}
                  />{" "}
                  I have read and agree to the{" "}
                  <span
                    className="font-semibold text-black underline cp"
                    onClick={() =>
                      window.open(CustomerRoutes.FooterPages.replace(":slug", "privacy-policy"), "_blank")
                    }
                  >
                    Data Protection Notice
                  </span>
                </label>
                <br></br>

                <label htmlFor="prom_mail" className="text-xs text-[#828282] mb-2">
                  <input
                    type="checkbox"
                    id="prom_mail"
                    name="prom_mail"
                    value={this.state.prommail}
                    className="align-middle"
                    onChange={(e) => {
                      this.setState({
                        prommail: e.target.checked,
                      });
                    }}
                  />{" "}
                  I want to receive promotions by emails
                </label>
                <br></br>

               

                <div className="login-with my-[25px] text-center">
                  <span className=" mr-2">Sign up with</span>
                  <div className="icon_social animate__animated animate__fadeInDown">
                    <img
                      alt=""
                      src={social_fb}
                      className="social-login "
                      onClick={(e) => this.socialSignup("fb")}
                    />
                  </div>
                  <div className="icon_social animate__animated animate__fadeInDown">
                    <img
                      alt=""
                      src={social_goog}
                      className="social-login "
                      onClick={(e) => this.socialSignup("gg")}
                    />
                  </div>
                </div>
              </>
            )}

            {this.state.socialInfo !== null && (
              <>
                <div className="site-input mb-3">
                  <div className="field-container flex">
                    <img
                      alt=""
                      src={
                        this.state.socialInfo.social === "gg"
                          ? social_goog
                          : social_fb
                      }
                      height="35px"
                      width="35px"
                      className="pl-3"
                    />
                    <input
                      className=" text-sm font-normal"
                      type="text"
                      value={
                        this.state.socialInfo.social === "gg"
                          ? "Google"
                          : "Facebook"
                      }
                      readOnly
                    />
                  </div>
                </div>

                <div className="site-input mb-3">
                  <div className="field-container phone-drop phone-drop-full">
                    {selectPhone}
                    <input
                      className=" text-sm font-normal"
                      placeholder="Phone Number"
                      ref={(node) => (this.phone = node)}
                      onChange={(e) => this.handleChange(e, "phone")}
                    />
                  </div>

                  {this.otpValidator.message(
                    "phone number",
                    this.state.phone,
                    "required|numeric|size:8",
                    { className: "text-red-600 form-error" }
                  )}
                </div>

                {this.state.socialInfo.email_verified === "1" && (
                  <>
                    <div className="site-input mb-3">
                      <div className="field-container">
                        <input
                          className=" text-sm font-normal"
                          type="text"
                          value={this.state.socialInfo.email}
                          readOnly
                        />
                      </div>
                    </div>
                  </>
                )}

                {this.state.socialInfo.email_verified === "0" && (
                  <>
                    <div className="site-input mb-3">
                      <div className="field-container">
                        <input
                          className=" text-sm font-normal"
                          type="text"
                          placeholder="Email ID"
                          ref={(node) => (this.email = node)}
                          onChange={(e) => this.handleChange(e, "email")}
                        />
                      </div>
                      {this.validator.message(
                        "email",
                        this.state.email,
                        "required|email",
                        { className: "text-red-600 form-error" }
                      )}
                    </div>
                  </>
                )}

                {this.state.binding === true && (
                  <>
                    <div className="site-input mb-3">
                      <div className="field-container">
                        <input
                          className=" text-sm font-normal"
                          type="password"
                          placeholder="Password"
                          ref={(node) => (this.bindpass = node)}
                          onChange={(e) => this.handleChange(e, "bindpass")}
                        />
                        <img
                          alt=""
                          src={img_eye}
                          className="animate__animated animate__rubberBand input-icon show-pass"
                        />
                      </div>

                      {this.validator.message(
                        "password",
                        this.state.bindpass,
                        "required",
                        { className: "text-red-600 form-error" }
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {this.state.binding === true && (
              <>
                <button
                  onClick={(e) => this.bindSocialUser(e)}
                  className="site-btn btn-default w-full mb-5"
                >
                  <span className="button__text text-lg">Bind Account</span>
                </button>
              </>
            )}

            {this.state.binding !== true && (
              <>
                <button
                  onClick={(e) => this.clickSignup(e)}
                  className="site-btn btn-default w-full mb-5 h-12"
                  disabled={this.state.loading}
                >
                  {this.state.loading ? (
                    <div className='h-[25px] flex justify-center '><Loader /></div>
                  ) : (
                    <span className="button__text text-lg">Create Account</span>
                  )}
                </button>
              </>
            )}

            {/**
             <a href={MerchantRoutes.Landing} className='form-resend block text-center'>
                Already have an account? <span>Login</span>
            </a> 
            */}

            <button
              onClick={(e) => this.props.changeForm("login")}
              className="form-resend block text-center"
            >
              Already have an account? <span>Login</span>
            </button>

            {this.state.isGoogleSigninRequired && (
              <GoogleSignIn
                isGoogleSigninRequired={this.state.isGoogleSigninRequired}
                closeGooglePopup={this.closeGooglePopup}
                getGoogleData={this.getGoogleData}
              />
            )}
          </form>
        );
    }
}

export default RegisterForm;
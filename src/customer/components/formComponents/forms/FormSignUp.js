import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import srv from "simple-react-validator";
import Select from "react-select";
import { registerSchema } from "../../../schemas";
import { useFormik } from "formik";
import { BuyerApiCalls, Apis } from "../../../utils/ApiCalls";
import { loadSettings } from "../../../../Utils.js";
import ReactFlagsSelect from "react-flags-select";
import { PopUpComponent } from "./../../GenericComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import ls from "local-storage";
import { USER_TYPE } from "../../../../constants/general";
import axios from "axios";
import { baseUrl } from "../../../../apiUrls.js";
//social
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  linkWithCredential
} from "firebase/auth";
import { auth, requestForToken } from "../../../../utils/firebase.js";
import jwtDecode from "jwt-decode";

import social_fb from "../../../../assets/icon_fb.svg";
import social_goog from "../../../../assets/icon_google.svg";
import "../../../../css/customer.css";
import { CustomerRoutes } from "../../../../Routes";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import Loader from "../../../../utils/loader";
import GoogleSignIn from "./googleSignin.js";

export default function SignUpForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [popUpMessage, setPopUpMessage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [popUpIcon, setPopUpIcon] = useState("success");
  const [otpErrorMessage, setotpErrorMessage] = useState(null);
  const [phoneErrorMessage, setPhoneErrorMessage] = useState(null);
  const [otpMessage, setotpMessage] = useState(null);
  // const [isSentOtp,setIsSendOtp] = useState(false)
  const [isValidOtp, setValidOtp] = useState(false);
  const [isFrom, setIsFrom] = useState("");
  const [isFromErr, setIsFromErr] = useState(false);
  const [link, setLink] = useState("");
  const [isBind, setBind] = useState(false);
  const [socialInfo, setSocialInfo] = useState({});
  const phoneRule = new RegExp(/^[0-9]+$/);
  const [showPass, setShowPass] = useState(false);
  const [showCfmPass, setShowCfmPass] = useState(false);
  const [signupHandling, setSignupHandling] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  //on account exist with different credential err
  const [isGoogleSigninRequired, setIsGoogleSigninRequired] = useState(false);
  const [existingId, setExistingId] = useState("");
  const [googleData, setGoogleData] = useState(null);

  //react select options
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);

  //upon form validation, the component will re-render and the setting will change
  useEffect(() => {
    getSettings()
    requestForToken()
  }, []);

  const getSettings = async() => {
    var settings = localStorage.getItem("settings");
    if (!settings) settings = await loadSettings();
    else settings = settings !== null ? JSON.parse(JSON.parse(settings)) : null;

    if (
      settings !== null &&
      settings.find_from &&
      settings.find_from.length > 0
    ) {
      settings = settings.find_from;
      let options = [];
      settings.forEach((s, idx) => {
        options.push({
          value: s,
          label: s,
        });
      });
      setOptions(options);
    }   
  }

  useEffect(() => {
    var info = ls("buyer_social_info");
    info = info ? JSON.parse(info) : {}
    ls.remove("buyer_social_info")
    setSocialInfo(info);
  }, [])

  const {
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    touched,
    errors,
    setFieldValue
  } = useFormik({
    initialValues: {
      country_code: "+65",
      mobileNumber: "",
      otp: "",
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      usertype_id: 1,
      tc: false,
      dpn: false,
      promEmail: false
    },
    validationSchema: registerSchema,
    onSubmit,
  });

  //error message text color
  var mobileNumberError =
    errors.mobileNumber && touched.mobileNumber ? "inputError" : "";
  var userNameError = errors.userName && touched.userName ? "inputError" : "";
  var emailError = errors.email && touched.email ? "inputError" : "";
  var passwordError = errors.password && touched.password ? "inputError" : "";
  var confirmPasswordError =
    errors.confirmPassword && touched.confirmPassword ? "inputError" : "";

  //country code selector
  const [selected, setSelected] = useState("SG");

  //styling for react select

  // {{
  //     control: (baseStyles) => ({
  //     ...baseStyles,
  //     border: '2px solid rgb(203 213 225)',
  //     height: 52.19,
  //     minHeight: 52.19,
  //     boxShadow: 'none',
  //     '&:hover': {
  //         border: '2px solid rgb(203 213 225)',
  //     }

  //     }),
  // }}

  function handleInputChange(event) {
    setPhoneNumber(event.target.value);
  }

  function handleOtpChange(e) {
    //call api to check otp
    if (values.otp.length === 6 && values.mobileNumber != null) {
      validateOtp(values.otp);
    } else {
      setPhoneErrorMessage("phone number field cannot be empty");
    }
  }

  const otpValidator = new srv();

  //register flow
  const clickSendOtp = () => {
    if (!otpValidator.allValid()) {
      otpValidator.showMessages();
      return;
    }

    //clear OTP value
    var elementInput = document.getElementById("otpfield");
    elementInput.value = "";

    //data requirement for OTP
    var fd = new FormData();
    fd.append("country_code", "+65");
    fd.append("contact_number", values.mobileNumber);
    fd.append("usertype_id", "1");

    //if mobile number does not start with 8 or 9, then return error (prevent spamming to API)
    if (
      !values.mobileNumber.startsWith("8") &&
      !values.mobileNumber.startsWith("9") &&
      values.mobileNumber.length === 8
    ) {
      setPhoneErrorMessage("not a valid mobile number");
      return;
    } else if (values.mobileNumber.length === 0) {
      setPhoneErrorMessage("phone number cannot be empty");
      return;
    }
    //if there is no error in the yup validation and API validation
    else {
      setPhoneErrorMessage(null);
      setotpErrorMessage(null);
      if (!errors.mobileNumber) {
        BuyerApiCalls(fd, Apis.sendOtp, "POST", {}, processRes);
      }
    }
  };

  const validateOtp = (otp) => {
    if (!otpValidator.allValid()) {
      otpValidator.showMessages();
      this.forceUpdate();
      return;
    }
    console.log(values.mobileNumber);
    if (values.mobileNumber === null) {
      setPhoneErrorMessage("phone number is required");
      return;
    }
    var fd = new FormData();
    fd.append("contact_number", values.mobileNumber);
    fd.append("usertype_id", 1);
    fd.append("otp", otp);

    var whichApi = Apis.verifyOtp;
    BuyerApiCalls(fd, whichApi, "POST", {}, processRes);
  };

  const processRes = (res, api) => {
    if (res === "Request failed with status code 500") {
      setIsOpen(true);
      setPopUpMessage("something went wrong.");
      setPopUpIcon("error");
      setSignupHandling(false)
      setSubmitting(false);
      return;
    }

    if (res?.data?.result === "FAIL") {
      if (api === Apis.verifyOtp) {
        var errorMessage = res.data.message;
        if (res.data.message.includes("does not exist")) {
          errorMessage = "Please click the Send OTP button first";
        }
        setotpErrorMessage(errorMessage);
        setValidOtp(false);
        return;
      }
      if (api === Apis.sendOtp) {
        setPhoneErrorMessage(res.data.message);
        setIsOpen(true);
        setPopUpMessage(res.data.message);
        setPopUpIcon("error");
        setLink(null);
      }
      if (api === Apis.signup) {
        setIsOpen(true);
        setPopUpMessage(res.data.message);
        setPopUpIcon("error");
        setLink(null);
        setSubmitting(false);
        return;
      }
      if (api === Apis.bindUser) {
        setIsOpen(true);
        setPopUpMessage(res.data.message);
        setPopUpIcon("error");
        setLink(null);
        setSignupHandling(false)
        return;
      }
      if (api === Apis.socialSignup) {
        console.log("signup failed")
        //if account already exist
        if (res.data.step === "toBindAccount") {
          setSocialInfo((socialInfo) => ({
            ...socialInfo,
            userId: res.data.data.id_user,
          }));
          setBind(true);
          setIsOpen(true);
          setPopUpMessage(
            "Email already registered, input password to bind your account"
          );
          setPopUpIcon("error");
          setSignupHandling(false)
          return;
        }
        // if (res.data.step === "toBindAccount") {
        //     this.setState({ binding: true, bindUser: res.data.data });
        // }
        //if acc doesnt exist, but have error
        setIsOpen(true);
        setPopUpMessage(res.error);
        setPopUpIcon("error");
        setSignupHandling(false)

        return;
      }
      return;
    }

    //success
    if (api === Apis.sendOtp) {
      setPhoneErrorMessage(null);
      setotpErrorMessage(null);
      setValidOtp(false);
      setotpMessage("We have sent an OTP in a SMS to your mobile number");
    }
    if (api === Apis.signup || api === Apis.socialSignup) {
      ls("loggedUser", USER_TYPE.BUYER);

      ls("promotion_voucher", res.data?.data?.received_promotion_voucher === "SUCCESS")
      ls("buyerAddress", null)
      ls("addressPrompt", false)

      localStorage.setItem("customer", JSON.stringify(res.data.data));
      setPhoneErrorMessage(null);
      setSignupHandling(false)
      setSubmitting(false);
      if (
        sessionStorage.getItem("selectedItems") &&
        sessionStorage.getItem("fromCart") !== null
      ) {
        window.location.replace(CustomerRoutes.CheckOutCart);
      } else {
        console.log("going to land")
        window.location.replace(CustomerRoutes.Landing);
      }

      return;
    }
    //if OPT is correct
    if (api === Apis.verifyOtp) {
      setotpErrorMessage(null);
      setValidOtp(true);
    }
    if (api === Apis.bindUser) {
      setIsOpen(true);
      setPopUpMessage("Account successfully binded");
      setPopUpIcon("success");
      setSignupHandling(false)
      return;
    }
  };

  async function onSubmit(values, { resetForm }, actions, event) {
    if (selectedOption === "Others (please specify)") {
      if (isFrom === null || isFrom === "") {
        setIsFromErr(true);
        return;
      }
    }
    setIsFromErr(false)
    setSubmitting(true)
    
    const formData = {
      usertype_id: 1,
      country_code: "+65",
      contact_number: values.mobileNumber,
      OTP: values.otp,
      password: values.password,
      confirm_password: values.confirmPassword,
      username: values.userName,
      email: values.email,
      find_from:
        selectedOption !== "Others (please specify)" ? selectedOption : isFrom === null || isFrom === "" ? "-" : isFrom,
      term_n_con: values.tc ? "y" : "n",
      data_protect_noti: values.dpn ? "y" : "n",
      promotion_email: values.prom_mail ? "y" : "n",
      token: ls("deviceToken")
    };
    if (isValidOtp) {
      await axios
        .post(baseUrl + Apis.signup, formData)
        .then((res) => {
          processRes(res, Apis.signup);
          if (res.data.result === "SUCCESS") {
            resetForm();
            setSelectedOption(null)
            setIsFrom("")
            setIsFromErr(false)
          }
        })
        .catch((error) => {
          if (error.response.status === 500) {
            alert("An error has occured. Please try again later.");
          }
        });
      setPhoneErrorMessage(null);
      return;
    } else {
      setIsOpen(true);
      setPopUpMessage("invalid OTP,please try again");
      setPopUpIcon("error");
      setPhoneErrorMessage(null);
      setSubmitting(false);
      // resetForm();
      return;
    }
  }
  //fb or google signup (when user click the icon, get the info and re-render form)
  const socialSignUp = async (platform) => {
    if(submitting) return;

    setSubmitting(true);
    var currentInfo = {
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
          if (ruser.email) {
            currentInfo.email = ruser.email;
            currentInfo.email_verified = "1"
          }

          if (ruser.uid) currentInfo.socialId = ruser.uid

          if (ruser.phoneNumber) currentInfo.contact_number = ruser.phoneNumber

        }
      } catch (error) {
        const credential = FacebookAuthProvider.credentialFromError(error);
        const emailId = error.customData.email
        setExistingId({emailId: emailId, credential: credential})
        if (error.code === "auth/account-exists-with-different-credential" && credential && emailId) {
            let user = auth?.currentUser
            if (user) await mergeFirebaseAccounts(user, credential);
            else setIsGoogleSigninRequired(true);
            
            return;
        }
      }
    }
    if (platform === "gg") {
      var googleProvider = new GoogleAuthProvider();
      try {
        var ggresult = await signInWithPopup(auth, googleProvider);
        var user = jwtDecode(ggresult.user.accessToken);
        if (user) {
          if (user.user_id) currentInfo.socialId = user.user_id;
          if (user.email) {
            currentInfo.email = user.email;
            currentInfo.email_verified = "1"
          }
        }
      } catch (error) {
        console.log("error google login: " + error);
      }
      // document.location.reload();
    }

    if(platform === "") currentInfo = googleData
    

      if (currentInfo.socialId === null || currentInfo.socialId === "") {
        setIsOpen(true);
        setPopUpMessage(
          "Oops, something went wrong. We are unable to retrieve your social profile."
        );
        setPopUpIcon("error");
        setSubmitting(false);
        return;
      }

      const formData = {
        platform: platform === "gg" ? "google" : "facebook",
        usertype_id: "1",
        social_id: currentInfo.socialId,
        email: currentInfo.email,
        email_verified: currentInfo.email_verified,
        device: ls("deviceToken")
      };

    BuyerApiCalls(formData, Apis.socialSLogin, "POST", {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
    }, (res, api) => {
      var rdata = res.data;
      //first time user trying to do social signup; get social info and call signup
      if (rdata.message === "account_not_exists") {
        // setSocialInfo((socialInfo) => ({
        //   ...socialInfo,
        //   email: currentInfo.email,
        //   email_verified: currentInfo.email_verified,
        //   socialId: currentInfo.socialId,
        //   contact_number: currentInfo.contact_number,
        //   social: currentInfo.social
        // }));

        const formData = {
          social_id: currentInfo.socialId,
          email: currentInfo.email,
          email_verified: currentInfo.email_verified,
          platform: platform === "gg" ? "google" : "facebook",
          contact_number: currentInfo.contact_number,
          usertype_id: "1",
          token: ls("deviceToken")
        };
        setSignupHandling(true)
        BuyerApiCalls(formData, Apis.socialSignup, "POST", {}, processRes);
        setPhoneNumber("");
        setSubmitting(false);

        return;
      }

      //if user already did social sign up, login directly
        ls("loggedUser", USER_TYPE.BUYER);
        ls("buyerAddress", rdata.data?.user_address ? rdata.data?.user_address?.address_details : null);
        ls("addressPrompt", res.data.data?.user_address ? true: false)

        localStorage.setItem("customer", JSON.stringify(rdata.data));
        window.location.replace(CustomerRoutes.Landing);
        setSubmitting(false);

        return      
    });
};

  const mergeFirebaseAccounts = async (user,credential ) => {
    var currentInfo = {
      email: "",
      email_verified: "0",
      contact_number: "",
      socialId: "",
      social: "fb",
    };

    try {
      const linkedUser = await linkWithCredential(user, credential);
      if (linkedUser.user) {
        var ruser = linkedUser.user;

        if (ruser.email) {
          currentInfo.email = ruser.email;
          currentInfo.email_verified = "1";
        }

        if (ruser.uid) currentInfo.socialId = ruser.uid;

        if (ruser.phoneNumber) currentInfo.contact_number = ruser.phoneNumber;
      }
      setGoogleData(currentInfo)
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (googleData !== null) socialSignUp("");
  }, [googleData]);

  const getGoogleData = async () => {
    setIsGoogleSigninRequired(false);

    try {
      const linkedProvider = new GoogleAuthProvider();
      linkedProvider.setCustomParameters({ login_hint: existingId?.emailId });

      const result = await signInWithPopup(auth, linkedProvider);
      console.log(result);
      if(result?.user) mergeFirebaseAccounts(result.user, existingId?.credential);

    } catch (e) {
      console.log("Google login err", e);
    }
  };

  const closeGooglePopup = () => setIsGoogleSigninRequired(false)

  function SocialSignUpHandler(event) {
    event.preventDefault();
    //if account doesnt exist
    if (!isBind) {
      const formData = {
        social_id: socialInfo.socialId,
        email: socialInfo.email,
        email_verified: socialInfo.email_verified,
        platform: event.target.social.value.toLowerCase(),
        contact_number: event.target.phoneNumber.value,
        usertype_id: "1",
        token: ls("deviceToken")
      };
      if (
        !phoneRule.test(phoneNumber) ||
        (!phoneNumber.startsWith("8") && !phoneNumber.startsWith("9")) ||
        phoneNumber.length !== 8
      ) {
        setPhoneErrorMessage("true");
        return;
      } else {
        console.log("calling social signup finally")
        setSignupHandling(true)
        BuyerApiCalls(formData, Apis.socialSignup, "POST", {}, processRes);
        setPhoneNumber("");
      }
    } else {
      setSignupHandling(true)
      const formData = new FormData();
      formData.append("id_user", socialInfo.userId);
      formData.append("password", values.password);
      formData.append("platform", event.target.social.value.toLowerCase());
      formData.append("social_id", socialInfo.socialId);
      BuyerApiCalls(formData, Apis.bindUser, "POST", {}, processRes);
      return;
    }
  }

  return Object.keys(socialInfo).length === 0 ? (
    <form
      onSubmit={handleSubmit}
      className="font-normal bg-white flex-col flex-wrap md:rounded-lg"
    >
      <div className="mx-4 py-4">
        <div className="title text-2xl font-medium text-center pt-4">
          SignUp
        </div>
        <div className="subtitle text-base mb-[35px] text-center">
          Please fill your details below
        </div>

        <div className="site-input mb-5">
          <div className="flex flex-col lg:flex-row flex-wrap gap-4 flex-1">
            <div className="flex relative h-[52.5px] grow border-2 divide-x-2 rounded border-slate-300">
              <ReactFlagsSelect
                className="grid h-14"
                countries={["SG"]}
                customLabels={{ SG: "+65" }}
                selected={selected}
                onSelect={(code) => setSelected(code)}
                selectedSize={14}
              />
              <div className="flex grow shrink-0 px-2">
                <input
                  className={`h-full px-2 text-sm font-normal  w-32 outline-0 gap-1 `}
                  name="mobileNumber"
                  value={values.mobileNumber}
                  type="text"
                  placeholder="Mobile Number"
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div>
              <button
                id="otpfield"
                type="button"
                onClick={(e) => clickSendOtp(e)}
                className="form-field-fix bg-transparent text-orangeButton font-semibold  py-2 w-full lg:px-4 border border-orangeButton rounded hover:bg-orangeButton hover:text-white"
              >
                Send OTP
              </button>
            </div>
          </div>
          {/* display validation error */}
          {errors.mobileNumber && touched.mobileNumber && (
            <p id={mobileNumberError}>{errors.mobileNumber}</p>
          )}

          {/* if the number does not start with 8 or 9, display not valid number error */}
          {phoneErrorMessage &&
          !errors.mobileNumber &&
          values.mobileNumber.length !== 0 &&
          !values.mobileNumber.startsWith("9") &&
          !values.mobileNumber.startsWith("8") ? (
            <p className="text-warning">Phone number must start with 8 or 9</p>
          ) : null}

          {/* if user did not input phone number -> verify the OTP -> click send OTP after that */}
          {/* if user click on the sendOTP before the input field (no validation done yet), display mobile required error response from verifyOTP API */}
          {phoneErrorMessage &&
            values.mobileNumber.length === 0 &&
            (!errors.mobileNumber || !touched.mobileNumber) && (
              <p className="text-warning">Mobile number is required</p>
            )}
        </div>

        <div className="site-input mb-5 ">
          <div className="flex flex-col lg:flex-row gap-2 w-full justify-between">
            <div
              className={`flex items-center relative h-[52.5px] border-2 border-slate-300 rounded w-full lg:w-80`}
            >
              <input
                className="px-2 grow text-sm font-normal outline-0 "
                value={values.otp}
                name="otp"
                type="text"
                placeholder="Enter OTP"
                onBlur={handleBlur}
                onChange={(e) => {
                  handleChange(e);
                  // handleOtpChange(e);
                }}
              />
              {/* if it is valid otp, display the green tick */}
              {isValidOtp && values.otp.length === 6 && (
                <div className="mx-2">
                  <FontAwesomeIcon
                    icon={faCircleCheck}
                    className="input-icon check-green"
                  />
                </div>
              )}
            </div>
            <button
              id="validate"
              type="button"
              onClick={(e) => handleOtpChange()}
              className="form-field-fix bg-transparent text-orangeButton font-semibold py-2 lg:px-5 border border-orangeButton rounded hover:bg-orangeButton hover:text-white"
            >
              Validate
            </button>
          </div>
          {/* display the otp message if the otp is not being verified */}
          {otpMessage && otpErrorMessage == null && !isValidOtp ? (
            <p className="text-md mt-2 font-bold">{otpMessage}</p>
          ) : (
            otpErrorMessage != null &&
            values.otp.length === 6 && (
              <p className="text-warning">{otpErrorMessage}</p>
            )
          )}

          {errors.otp && touched.otp && (
            <p className="text-warning">{errors.otp}</p>
          )}
        </div>

        <div className="site-input mb-5">
          <div
            className={`flex relative h-[52.5px] border-2 border-slate-300 rounded `}
          >
            <input
              className="px-2 grow text-sm font-normal outline-0"
              value={values.userName}
              name="userName"
              onBlur={handleBlur}
              type="text"
              placeholder="User Name"
              onChange={handleChange}
            />
          </div>
          {errors.userName && touched.userName && (
            <p id={userNameError}>{errors.userName}</p>
          )}
        </div>

        <div className="site-input mb-5">
          <div
            className={`flex relative h-[52.5px] border-2 border-slate-300 rounded `}
          >
            <input
              className="px-2 grow text-sm font-normal outline-0"
              value={values.email}
              name="email"
              onBlur={handleBlur}
              type="text"
              placeholder="Email ID"
              onChange={handleChange}
            />
          </div>
          {errors.email && touched.email && (
            <p id={emailError}>{errors.email}</p>
          )}
        </div>

        <div className="site-input mb-5">
          <div
            className={`relative h-[52.5px] border-2 border-slate-300 rounded flex justify-between items-center px-2 `}
          >
            <input
              className="text-base grow font-normal outline-0"
              value={values.password}
              name="password"
              type={showPass ? "text" : "password"}
              placeholder="Set Password"
              onChange={handleChange}
              onBlur={handleBlur}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}>
              {showPass ? (
                <AiOutlineEye size={22}></AiOutlineEye>
              ) : (
                <AiOutlineEyeInvisible size={22}></AiOutlineEyeInvisible>
              )}
            </button>
          </div>
          {errors.password && touched.password && (
            <p id={passwordError}>{errors.password}</p>
          )}
        </div>
        <div className="site-input mb-5">
          <div
            className={`relative h-[52.5px] border-2 border-slate-300 rounded flex justify-between items-center px-2 `}
          >
            <input
              className="text-base grow font-normal outline-0"
              value={values.confirmPassword}
              name="confirmPassword"
              type={showCfmPass ? "text" : "password"}
              placeholder="Confirm Password"
              onBlur={handleBlur}
              onChange={handleChange}
            />
            <button type="button" onClick={() => setShowCfmPass(!showCfmPass)}>
              {showCfmPass ? (
                <AiOutlineEye size={22}></AiOutlineEye>
              ) : (
                <AiOutlineEyeInvisible size={22}></AiOutlineEyeInvisible>
              )}
            </button>
          </div>
          {errors.confirmPassword && touched.confirmPassword && (
            <p id={confirmPasswordError}>{errors.confirmPassword}</p>
          )}
        </div>

        <div className="text-sm mb-3 ">
          <Select
            styles={{
              control: (baseStyles) => ({
                ...baseStyles,
                border: "2px solid rgb(203 213 225)",
                height: 52.19,
                minHeight: 52.19,
                boxShadow: "none",
                "&:hover": {
                  border: "2px solid rgb(203 213 225)",
                },
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "grey",
              }),
            }}
            defaultValue={{
              value: "-",
              label: "Where did you hear about uShop?",
            }}
            options={options}
            value={options.value}
            onChange={(event) => {
              setSelectedOption(event.value);
              setIsFromErr(false);
            }}
          ></Select>
          {selectedOption === "Others (please specify)" ? (
            <div>
              <div
                className={`flex relative h-[52.5px] border-2 border-slate-300 rounded mt-4`}
              >
                <input
                  className="px-2 grow text-sm font-normal outline-0"
                  value={isFrom}
                  name="otherOption"
                  placeholder="Please specify..."
                  onChange={(event) => setIsFrom(event.target.value)}
                />
              </div>
              {isFromErr && isFrom === "" && (
                <p className="text-warning text-sm">
                  Please specify where you heard about us
                </p>
              )}
            </div>
          ) : null}
          {!selectedOption && isFromErr && (
            <p className="text-warning text-sm">
              Please specify where you heard about us
            </p>
          )}
        </div>

        {/* checkboxes */}

        <label for="tc" className="text-xs text-[#828282] mb-2">
          <input
            type="checkbox"
            id="tc"
            name="tc"
            value={values.tc}
            className="align-middle"
            onChange={(e) => {
              setFieldValue("tc", e.target.checked);
            }}
          />{" "}
          I agree with the{" "}
          <span
            className="font-semibold text-black underline cp"
            onClick={() =>
              window.open(
                CustomerRoutes.FooterPages.replace(":slug", "terms-conditions"),
                "_blank"
              )
            }
          >
            Terms & Conditions
          </span>
        </label>
        <br></br>

        <label for="dpn" className="text-xs text-[#828282] mb-2">
          <input
            type="checkbox"
            id="dpn"
            name="dpn"
            value={values.dpn}
            className="align-middle"
            onChange={(e) => {
              setFieldValue("dpn", e.target.checked);
            }}
          />{" "}
          I have read and agree to the{" "}
          <span
            className="font-semibold text-black underline cp"
            onClick={() =>
              window.open(
                CustomerRoutes.FooterPages.replace(":slug", "privacy-policy"),
                "_blank"
              )
            }
          >
            Data Protection Notice
          </span>
        </label>
        <br></br>

        <label for="prom_mail" className="text-xs text-[#828282] mb-2">
          <input
            type="checkbox"
            id="prom_mail"
            name="prom_mail"
            value={values.prommail}
            className="align-middle"
            onChange={(e) => {
              setFieldValue("prom_mail", e.target.checked);
            }}
          />{" "}
          I want to receive promotions by emails
        </label>

        {errors.tc && touched.tc && (
          <p className="text-warning text-xs my-2">{errors.tc}</p>
        )}

        {errors.dpn && touched.dpn && (
          <p className="text-warning text-xs">{errors.dpn}</p>
        )}
        <br></br>

        <div className="login-with my-[25px] text-center">
          <span className=" mr-2">Sign up with</span>
          <div className="icon_social animate__animated animate__fadeInDown">
            <img
              alt=""
              src={social_fb}
              className="social-login "
              onClick={(e) => socialSignUp("fb")}
            />
          </div>
          <div className="icon_social animate__animated animate__fadeInDown">
            <img
              alt=""
              src={social_goog}
              className="social-login "
              onClick={(e) => socialSignUp("gg")}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-orangeButton text-white font-medium text-lg p-2 w-full rounded hover:bg-amber-500 h-11"
          onClick={() => setIsFromErr(true)}
        >
          {submitting ? <Loader /> : "Create Account"}
        </button>

        {isOpen && (
          <PopUpComponent
            message={popUpMessage}
            open={isOpen}
            link={link}
            close={() => setIsOpen(false)}
            result={popUpIcon}
          ></PopUpComponent>
        )}

        <p className="text-center pt-4">
          already have an account?
          <Link to={CustomerRoutes.Login}> login</Link>
        </p>
      </div>
      {isGoogleSigninRequired && (
        <GoogleSignIn
          isGoogleSigninRequired={isGoogleSigninRequired}
          closeGooglePopup={closeGooglePopup}
          getGoogleData={getGoogleData}
        />
      )}
    </form>
  ) : (
    <>
      <form
        className="bg-white rounded px-8 py-8"
        onSubmit={(event) => SocialSignUpHandler(event)}
      >
        <p className="mb-6 text-2xl font-bold">Welcome to uShop</p>
        <div className="site-input mb-5">
          <div
            className={`flex relative h-[52.5px] border-2 border-slate-300 rounded `}
          >
            <img
              alt=""
              src={socialInfo.social === "gg" ? social_goog : social_fb}
              height="35px"
              width="35px"
              className="pl-3"
            />
            <input
              className="px-2 grow text-sm font-normal outline-0"
              name="social"
              value={socialInfo.social === "gg" ? "Google" : "Facebook"}
              type="text"
              readOnly
            />
          </div>
        </div>

        <div className="site-input mb-3">
          {isBind ? null : (
            <div className="flex relative h-[52.5px] border-2 border-slate-300 rounded divide-x-2">
              <div className="px-2">
                <ReactFlagsSelect
                  className="grid h-14"
                  countries={["SG"]}
                  customLabels={{ SG: "+65" }}
                  selected={selected}
                  onSelect={(code) => setSelected(code)}
                  selectedSize={14}
                />
              </div>
              <div className="grid px-4 w-fill">
                <input
                  type="text"
                  className="text-md font-normal h-fill"
                  name="phoneNumber"
                  onChange={handleInputChange}
                  value={phoneNumber}
                  placeholder="Phone Number"
                />
              </div>
            </div>
          )}

          {!phoneRule.test(phoneNumber) &&
            phoneErrorMessage &&
            phoneNumber.length !== 0 && (
              <p className="text-warning">
                Phone number can only contain digits [0-9]{" "}
              </p>
            )}
          {phoneNumber.length !== 8 &&
            phoneErrorMessage &&
            phoneNumber.length !== 0 && (
              <p className="text-warning">Phone number must be 8 digits </p>
            )}
          {phoneNumber.length === 0 &&
            phoneErrorMessage &&
            touched.phoneNumber && (
              <p className="text-warning">Phone number cannot be empty</p>
            )}
          {!phoneNumber.startsWith("8") &&
            !phoneNumber.startsWith("9") &&
            phoneErrorMessage &&
            phoneNumber.length !== 0 && (
              <p className="text-warning">Invalid Phone number</p>
            )}
        </div>

        <div className="site-input mb-5">
          <div
            className={`flex relative h-[52.5px] border-2 border-slate-300 rounded `}
          >
            <input
              className="px-2 grow text-sm font-normal outline-0"
              name="socialEmail"
              value={socialInfo.email}
              type="text"
              readOnly={socialInfo.email_verified === "1" ? true : false}
            />
          </div>
        </div>

        <div className="site-input mb-5">
          {isBind ? (
            <div
              className={`relative h-[52.5px] border-2 border-slate-300 rounded flex justify-between items-center px-2 `}
            >
              <input
                className="text-sm grow font-normal outline-0"
                value={values.password}
                name="password"
                type="password"
                placeholder="Set Password"
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}>
                {showPass ? (
                  <AiOutlineEye size={22}></AiOutlineEye>
                ) : (
                  <AiOutlineEyeInvisible size={22}></AiOutlineEyeInvisible>
                )}
              </button>
            </div>
          ) : null}

          {errors.password && touched.password && (
            <p id={passwordError}>{errors.password}</p>
          )}
        </div>

        <div className="bg-amber-500 text-center p-3 rounded text-white font-bold text-lg">
          {isBind ? (
            <button type="submit">
              {signupHandling ? <Loader /> : "Bind Account"}
            </button>
          ) : (
            <button type="submit">
              {signupHandling ? <Loader /> : "Create Account"}
            </button>
          )}
          {isOpen && (
            <PopUpComponent
              message={popUpMessage}
              open={isOpen}
              close={() => setIsOpen(false)}
              link={link}
              result={popUpIcon}
            ></PopUpComponent>
          )}
        </div>
      </form>
    </>
  );
}

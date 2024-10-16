import { BuyerApiCalls, Apis } from "../../../utils/ApiCalls.js";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { LoginApi } from "../../../utils/ApiCalls";
import { loginSchema } from "../../../schemas";
import { Link } from "react-router-dom";
import social_fb from "../../../../assets/icon_fb.svg";
import social_goog from "../../../../assets/icon_google.svg";
import { CustomerRoutes } from "../../../../Routes";
import { PopUpComponent } from "./../../GenericComponents";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import ls from "local-storage";
import { USER_TYPE } from "../../../../constants/general.js";
import { useSelector } from "react-redux";

//social
import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  linkWithCredential,
} from "firebase/auth";
import { auth, requestForToken } from "../../../../utils/firebase.js";
import jwtDecode from "jwt-decode";
import Loader from "../../../../utils/loader.js";
import GoogleSignIn from "./googleSignin.js";

export default function LoginForm() {
  // const [errorMsg,setErrorMsg] = useState(null)
  const [isOpen, setIsOpen] = useState(false);
  const [popUpMessage, setPopUpMessage] = useState(null);
  const [popUpIcon, setPopUpIcon] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [actualSocialInfo, setActualSocialInfo] = useState({});
  const navigate = useNavigate();
  const prevUrl = useSelector((state) => state.prevUrl.prevUrl);

  //on account exist with different credential err
  const [isGoogleSigninRequired, setIsGoogleSigninRequired] = useState(false);
  const [existingId, setExistingId] = useState("");
  const [googleData, setGoogleData] = useState(null);

  useEffect(() => {
    localStorage.setItem("userType", "1");
    requestForToken()
  }, []);

  function onSubmit(values, actions) {
    setIsLoading(true);

    const formData = {
      username: values.emailOrNumber,
      password: values.password,
      usertype_id: 1,
      token: ls("deviceToken")
    };

    LoginApi(formData, Apis.login).then((res) => {
      if (res) {
        // setErrorMsg(res[0])
        setIsOpen(true);
        setPopUpMessage(res[0]);
        setPopUpIcon("error");
      } else {
        // setErrorMsg(null)
        setPopUpIcon("success");
        ls("loggedUser", USER_TYPE.BUYER);
        // window.location.replace(prevUrl);
        navigate(prevUrl);

        actions.resetForm();
      }
      setIsLoading(false);
    });
  }

  const processRes = (res, api) => {
    var rdata = res.data;
    if (rdata.result === "FAIL") {
      if (rdata.message === "account_not_exists") {
        // var tempInfo = {
        //   email: actualSocialInfo.email,
        //   email_verified: actualSocialInfo.email_verified,
        //   contact_number: actualSocialInfo.contact_number,
        //   socialId: actualSocialInfo.socialId,
        //   social: actualSocialInfo.social,
        // };
        // ls("buyer_social_info", JSON.stringify(tempInfo));
        // document.location.replace(CustomerRoutes.SignUp);
        const formData = {
          platform: actualSocialInfo.social === "gg" ? "google" : "facebook",
          usertype_id: "1",
          social_id: actualSocialInfo.socialId,
          email: actualSocialInfo.email,
          email_verified: actualSocialInfo.email_verified,
          contact_number: "",
          token: ls("deviceToken")
        };
        BuyerApiCalls(formData, Apis.socialSignup, "POST", {}, processRes);
      }
      return;
    }

    //if success, store the credentials
    if (api === Apis.login || api === Apis.socialSLogin || api === Apis.socialSignup) {
      ls("loggedUser", USER_TYPE.BUYER);
      ls("promotion_voucher", res.data?.data?.received_promotion_voucher === "SUCCESS")

      if(api === Apis.socialSignup) {
        ls("buyerAddress", null)
        ls("addressPrompt", false)
      }
      else {
        ls("buyerAddress", rdata.data?.user_address ? rdata.data?.user_address?.address_details : null);
        ls("addressPrompt", res.data.data?.user_address ? true: false)
      }
      setIsLoading(false);

      localStorage.setItem("customer", JSON.stringify(rdata.data));
      if (sessionStorage.getItem("fromCart") !== null) navigate(CustomerRoutes.CheckOutCart);
      else navigate(CustomerRoutes.Landing);
    }
  };

  const socialLogin = async (platform) => {
    if(isLoading) return;

    setIsLoading(true);

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
        var result = await signInWithPopup(auth, fbProvider);
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
        const credential = FacebookAuthProvider.credentialFromError(error);
        const emailId = error.customData.email
        setExistingId({emailId: emailId, credential: credential})
        if (error.code === "auth/account-exists-with-different-credential" && credential && emailId) {
          let user = auth?.currentUser;
          if (user) await mergeFirebaseAccounts(user, credential);
          else setIsGoogleSigninRequired(true);
          return;          
        }
      }
    }

    if (platform === "gg") {
      var googleProvider = new GoogleAuthProvider();
      try {
        var result_gg = await signInWithPopup(auth, googleProvider);
        var user = jwtDecode(result_gg.user.accessToken);
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

    
    if(platform === "") socialInfo = googleData

    if (socialInfo.socialId === null || socialInfo.socialId === "") {
      setIsOpen(true);
      setPopUpMessage(
        "Oops, something went wrong. We are unable to retrieve your social profile."
      );
      setPopUpIcon("error");
      setIsLoading(false);

      return;
    }
    setActualSocialInfo(socialInfo);
  };

  const mergeFirebaseAccounts = async (user, credential) => {
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
    if (googleData !== null) socialLogin("");
  }, [googleData]);

  const getGoogleData = async () => {
    setIsGoogleSigninRequired(false);
    try {
      const linkedProvider = new GoogleAuthProvider();
      linkedProvider.setCustomParameters({ login_hint: existingId?.emailId });

      const result = await signInWithPopup(auth, linkedProvider);
      if(result?.user) mergeFirebaseAccounts(result.user, existingId?.credential);

    } catch (e) {
      console.log("Google login err", e);
    }
  };

  const closeGooglePopup = () => setIsGoogleSigninRequired(false)

  useEffect(() => {
    if (Object.keys(actualSocialInfo).length > 0) {
      const formData = {
        platform: actualSocialInfo.social === "gg" ? "google" : "facebook",
        usertype_id: "1",
        social_id: actualSocialInfo.socialId,
        email: actualSocialInfo.email,
        email_verified: actualSocialInfo.email_verified,
        token: ls("deviceToken")
      };

      BuyerApiCalls(
        formData,
        Apis.socialSLogin,
        "POST",
        {
          //fix for US 201
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        processRes
      );
    }
  }, [actualSocialInfo]);

  const { values, handleSubmit, handleChange, handleBlur, touched, errors } =
    useFormik({
      initialValues: {
        emailOrNumber: "",
        password: "",
      },
      validationSchema: loginSchema,
      onSubmit,
    });
  var emailError =
    errors.emailOrNumber && touched.emailOrNumber ? "inputError" : "";
  var passwordError = errors.password && touched.password ? "inputError" : "";

  return (
    <form
      onSubmit={handleSubmit}
      className="font-normal bg-white flex-col flex-wrap md:rounded-lg "
    >
      <div className="mx-4 py-4 ">
        <div className="title text-2xl font-medium  pt-4">Buyer Log-in</div>
        <div className="subtitle text-base mb-[35px] ">
          Please fill your details below
        </div>

        <label htmlFor="emailOrNumber" className="text-[14px]">
          Email/Number
        </label>
        <div className=" mb-4 mt-2">
          <div
            className={`form-field flex grow justify-between items-center px-2 ${emailError}`}
          >
            <input
              className="text-base grow h-full font-normal outline-0"
              value={values.emailOrNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              id="emailOrNumber"
              type="text"
              placeholder="Email or Phone Number"
            />
          </div>
          {errors.emailOrNumber && touched.emailOrNumber && (
            <p className="text-[14px]" id={emailError}>
              {errors.emailOrNumber}
            </p>
          )}
        </div>

        <label htmlFor="password" className="text-[14px]">
          Password
        </label>
        <div className="mb-4 mt-2">
          <div
            className={`form-field flex flex-wrap grow justify-between items-center px-2 ${passwordError}`}
          >
            <input
              className="text-base grow h-full font-normal outline-0"
              id="password"
              type={showPass ? "text" : "password"}
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Password"
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
            <p className="text-[14px]" id={passwordError}>
              {errors.password}
            </p>
          )}
        </div>

        <div className="forgot-link mb-3">
          <Link to={CustomerRoutes.ForgotPassword} className="">
            Forgot Password
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-orangeButton text-white text-lg p-2 h-11 w-full rounded font-medium hover:bg-amber-500 disabled:bg-amber-300"
        >
          {isLoading ? <Loader /> : "Log in"}
        </button>

        {isOpen && (
          <PopUpComponent
            message={popUpMessage}
            open={isOpen}
            close={() => setIsOpen(false)}
            result={popUpIcon}
          ></PopUpComponent>
        )}

        <div className="login-with my-[25px] text-center">
          <span className=" mr-2">Login with</span>
          <div className="icon_social animate__animated animate__fadeInDown">
            <img
              alt=""
              src={social_fb}
              className="social-login "
              onClick={(e) => socialLogin("fb")}
            />
          </div>
          <div className="icon_social animate__animated animate__fadeInDown">
            <img
              alt=""
              src={social_goog}
              className="social-login "
              onClick={(e) => socialLogin("gg")}
            />
          </div>
        </div>

        <div className="divider-text">
          <div></div>
          <span>New to uShop ?</span>
        </div>
      </div>
      <div className="text-center pb-4">
        <Link
          to={CustomerRoutes.SignUp}
          className=" site-primary-color text-sm "
        >
          Create your Account
        </Link>
      </div>

      {isGoogleSigninRequired && (
          <GoogleSignIn
            isGoogleSigninRequired={isGoogleSigninRequired}
            closeGooglePopup={closeGooglePopup}
            getGoogleData={getGoogleData}
          />
        )}
    </form>
  );
}

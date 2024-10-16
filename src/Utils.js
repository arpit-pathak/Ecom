import { ApiCalls } from "./merchant/utils/ApiCalls.js";
import ls from "local-storage";
import { useLocation, useNavigate } from 'react-router-dom';

export var CommonApis = {
  forgotPassword: "forgot-password/",
  resetPasswordEmail: "reset-password-email/",
  resetPasswordOtp: "reset-password-otp/",
  changePasssword: "user/reset-change-password/",

  settings: "general-setting/",
  logout: "logout/",
  
};

export function isBtnLoading(btn, turn) {
  var parentHasClass = btn.closest(".site-btn") !== null;
  if (turn === false) {
    if (parentHasClass) {
      btn.closest(".site-btn").classList.remove("button--loading");
    } else {
      btn.classList.remove("button--loading");
    }
    return false;
  }

  var isLoading = false;
  if (btn.closest(".button--loading") !== null) {
    isLoading = true;
  } else {
    if (parentHasClass) {
      btn.closest(".site-btn").classList.add("button--loading");
    } else {
      btn.classList.add("button--loading");
    }
  }

  return isLoading;
}

export const loadSettings = async() => {
  if (ls("settings") !== null) return;
  var whichApi = CommonApis.settings;
  let result;
  await ApiCalls(null, whichApi, "POST", {}, (res, api) => {
    var rdata = res.data;
    if (rdata.result === "FAIL") {
      console.log("Unable to load settings: ", res);
      return;
    }

    ls("settings", JSON.stringify(rdata.data));
    result = rdata.data
    //console.log("Loaded settings: ", rdata);
  });
  return result 
}

export function numberAbbr(value) {
  let newValue = value;
  if (value >= 1000) {
    var suffixes = ["", "k", "m", "b", "t"];
    var suffixNum = Math.floor(("" + value).length / 3);
    var shortValue = "";
    for (var precision = 2; precision >= 1; precision--) {
      shortValue = parseFloat(
        (suffixNum !== 0
          ? value / Math.pow(1000, suffixNum)
          : value
        ).toPrecision(precision)
      );
      var dotLessShortValue = (shortValue + "").replace(/[^a-zA-Z 0-9]+/g, "");
      if (dotLessShortValue.length <= 2) {
        break;
      }
    }
    if (shortValue % 1 !== 0) shortValue = shortValue.toFixed(1);
    newValue = shortValue + suffixes[suffixNum];
  }
  return newValue;
}

export function getId(url) {
  url = url + "";
  if (url.charAt(url.length - 1) === "/")
    url = url.substring(0, url.length - 1);

  url = url.substring(url.lastIndexOf("/") + 1);
  if (isNaN(url)) url = null;
  return url;
}

export function getCurrentDateForChat() {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;

  const formattedToday = dd + "/" + mm + "/" + yyyy;
  return formattedToday;
}



const withRouter = Component => props => {
  const location = useLocation();
       const navigate= useNavigate();
  // other hooks
  return <Component {...props} navigate={navigate} location={location} />;
};

export default withRouter;
import "../../css/navbar.css";
import Logo from "../../assets/logo-white.svg";
import LogoAlt from "../../assets/logo-orange.svg";
import { RiUserLine } from "react-icons/ri";
import { IoMdNotifications } from "react-icons/io";
import { AiOutlineLogout, AiOutlineUser } from "react-icons/ai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import withRouter from "../../Utils";
import { MdChat } from "react-icons/md";
import { USER_TYPE } from "../../constants/general.js";

import React from "react";
import ls from "local-storage";
import { Constants } from "../utils/Constants.js";

import { ApiCalls, Apis } from "../utils/ApiCalls.js";
import { CommonApis } from "../../Utils";
import { MerchantRoutes, CustomerRoutes } from "../../Routes";
import { onMessageListener } from "../../utils/firebase.js";
import { playSound } from "../../utils/general.js";
import audio from "../../assets/audio/notification_audio.wav";
import NotificationPopupList from "../../components/notifications/notificationPopupList.js";
import { ToastContainer, toast } from "react-toastify";
import AccSwitchPopup from "../../components/accountSwitch/AccSwitchPopup.js";

class Navbar extends React.Component {
  constructor(props) {
    super(props);

    var user = ls(Constants.localStorage.user);
    if (user) user = JSON.parse(user);
    this.state = {
      userJwt: null,
      user: user,
      isUserMenuShown: false,
      hasUnseenNotification: false,
      hasChatNotification: user?.unread_chat ?? false,
      showNotificationList: false,
      userNewData: null,
      showSwitchPopup: false,
    };

    this.menuRef = React.createRef();
  }

  componentDidMount() {
    this.notificationListener();
  }

  closeNotificationPopup = () => {
    this.setState({ showNotificationList: false });
  };

  notificationListener = () => {
    onMessageListener()
      .then((payload) => {
        // console.log(payload);
        if (payload?.data?.chat_message === "1") {
          this.setState({
            hasChatNotification: true,
          });
        } else {
          this.setState({
            hasUnseenNotification: true,
          });
        }
        playSound(audio);
        this.notificationListener();
      })
      .catch((err) => {
        console.log("failed: ", err);
        this.notificationListener();
      });
  };

  showUserMenu = () => {
    this.setState({ isUserMenuShown: !this.state.isUserMenuShown });
  };

  logout = async () => {
    var fd = new FormData();
    fd.append("token", ls("deviceToken"));
    ApiCalls(
      fd,
      CommonApis.logout,
      "POST",
      {
        Authorization: "Bearer " + this.state.user.access,
      },
      this.processRes
    );
    ls.clear();
    this.props.navigate(MerchantRoutes.Login, { replace: true });
  };

  processRes = (res, api) => {
    var rdata = res.data;
    if (rdata.result === "FAIL") {
      this.props.togglePop(
        "Oops, something went wrong.",
        rdata.message,
        "error"
      );
      return;
    } else {
      ls.remove("loggedUser");
      ls.remove("deviceToken");
      ls.remove(Constants.localStorage.user);
    }
  };

  redirectToProfile = (e) => {
    this.props.navigate(MerchantRoutes.ShopProfile);
  };

  switchToBuyer = (e) => {
    var fd = new FormData();
    ApiCalls(
      fd,
      Apis.switchToBuyer,
      "GET",
      { Authorization: "Bearer " + this.state.user.access },
      (res, api) => {
        if (res.data.result === "SUCCESS") {
          let rdata = res.data.data;
          this.setState({
            userNewData: rdata,
            showSwitchPopup: true,
          });
        } else {
          toast.error("Something went wrong! Try later!");
        }
      }
    );
  };

  openChat = () => {
    if (this.state.user) {
      let dataToPass = {
        userType: USER_TYPE[2],
        receiverType: USER_TYPE[1],
        buyerId: "",
        shopSlug: this.state.user?.shop_slug,
        buyerName: "",
      };

      ls("chatData", JSON.stringify(dataToPass));

      this.setState({ hasChatNotification: false });
      const newTab = window.open(MerchantRoutes.ChatScreen, "_blank");
      if (newTab) newTab.focus();
    }
  };

  openNotificaitonPopup = () => {
    this.setState(
      {
        hasUnseenNotification: false,
        showNotificationList: !this.state.showNotificationList,
      },
      () => {
        if (this.state.showNotificationList)
          document.addEventListener("mousedown", this.handleClickOutside);
        else document.removeEventListener("mousedown", this.handleClickOutside);
      }
    );
  };

  handleClickOutside = (e) => {
    try {
      if (this.menuRef.current && !this.menuRef.current?.contains(e.target)) {
        this.setState({
          showNotificationList: false,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  createUserMenu = () => {
    return (
      <div className="user-menu">
        <div>
          <div
            className="nav-user"
            onMouseOver={() => {
              this.setState({ showNotificationList: false });
            }}
          >
            <RiUserLine />
          </div>
          <div className="options animate__animated animate__fadeIn">
            <div
              className="font-medium text-sm pt-1 pb-1"
              onClick={this.redirectToProfile}
            >
              <AiOutlineUser className="mr-2" />
              <span>Profile</span>
            </div>
            <div
              className="font-medium text-sm pt-1 pb-1"
              onClick={this.switchToBuyer}
            >
              <FontAwesomeIcon icon={faRepeat} size={20} />
              <span>
                Switch <br /> Account
              </span>
            </div>
            <div
              className="font-medium text-sm pt-1 pb-1 cursor-pointer"
              onClick={(e) => this.logout()}
            >
              <AiOutlineLogout className="mr-2" /> <span>Logout</span>
            </div>
          </div>
        </div>
        <div className="nav-bell relative" ref={this.menuRef}>
          {this.state.hasUnseenNotification && (
            <div className="bg-red-500 h-2 w-2 rounded absolute right-[6px] top-[1px]"></div>
          )}
          <IoMdNotifications onClick={this.openNotificaitonPopup} />
          {this.state.showNotificationList && (
            <NotificationPopupList
              usertype={2}
              closeNotificationPopup={this.closeNotificationPopup}
            />
          )}
        </div>{" "}
        <div className="nav-bell relative" onClick={this.openChat}>
          {this.state.hasChatNotification && (
            <div className="bg-red-500 h-2 w-2 rounded absolute right-[-1px] top-[-1px]"></div>
          )}
          <MdChat />
        </div>
      </div>
    );
  };
  render() {
    var nclass = "navbar";
    var userMenu = <></>;
    if (this.props.theme === "dashboard") {
      nclass += " loggedin";
      userMenu = this.createUserMenu();
    }

    return (
      <>
        <ToastContainer
          autoClose={500}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          position={toast.POSITION.BOTTOM_RIGHT}
        />
        <div className={nclass}>
          {this.props.theme === "dashboard" ? (
            <>
              <div className="menu">
                <input type="checkbox" />
                <span></span>
                <span></span>
                <span></span>
                <ul></ul>
              </div>
            </>
          ) : null}
          <Link
            to={
              ls("loggedUser") ? MerchantRoutes.Landing : CustomerRoutes.Landing
            }
            className="logo animate__animated animate__fadeInLeft"
          >
            <div className="logo animate__animated animate__fadeInLeft">
              <img src={Logo} alt="" />
            </div>
          </Link>
          <div className="logo-alt animate__animated animate__fadeInLeft">
            <img src={LogoAlt} alt="" />
          </div>

          {userMenu}
        </div>
        {this.state.showSwitchPopup && (
          <AccSwitchPopup
            showSwitchPopup={this.state.showSwitchPopup}
            onClose={() => this.setState({ showSwitchPopup: false })}
            userOldData={{ ...this.state.user }}
            userNewData={{ ...this.state.userNewData }}
            switchingTo={USER_TYPE.BUYER}
            // handleLogOut={this.logout}
          />
        )}{" "}
      </>
    );
  }
}
export default withRouter(Navbar);

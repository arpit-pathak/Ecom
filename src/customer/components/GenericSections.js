import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { BuyerApiCalls, Apis } from "../utils/ApiCalls";
import { CustomerRoutes, MerchantRoutes } from "../../Routes";
import { Modal, SideNav } from "../components/GenericComponents";
import { toggleSideBar } from "../utils/ToggleSideBar";
import { v4 as uuidv4 } from "uuid";
import parse from "html-react-parser";
import ls from "local-storage";
import { AiOutlineLogout } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import { CommonApis } from "../../Utils";
import { ApiCalls } from "../../merchant/utils/ApiCalls";
import { Constants } from "../../merchant/utils/Constants";
import { USHOP_API_KEY } from "../../utils/firebase";
//useReducer
import { useSelector, useDispatch } from "react-redux";
import {
  setProfilePic,
  setRetrieveProfile,
} from "../redux/reducers/profileReducer";
import { setPrevUrl } from "../redux/reducers/prevUrlReducer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import {
  retrieveCartQuantity,
  setCartItems,
  setCartState,
} from "../redux/reducers/cartReducer";
//css
import "../../css/navbar.css";
import "../../css/customer.css";

//icons
import join from "../../assets/join.png";
import { LogoNav } from "./GenericComponents";
import ProfileDropdown from "./navbarComponents/ProfileDropDown";
import { GrLocation } from "react-icons/gr";
import { BiSearch } from "react-icons/bi";
import {
  MdMyLocation,
  MdOutlineCameraAlt,
  MdChat,
  MdFavoriteBorder,
  MdOutlineNotifications,
  MdMenu,
  MdClose,
  MdArrowDropDown,
} from "react-icons/md";

//images
import ushopWhiteIcon from "../../assets/logo-white.svg";
import tagIcon from "../../assets/buyer/tagIcon.png";
import cartIcon from "../../assets/buyer/cartIcon.png";
import questionMarkIcon from "../../assets/buyer/questionMarkIcon.png";
import globeIcon from "../../assets/globeIcon.png";
import { USER_TYPE } from "../../constants/general";
import { setMainCategoryID } from "../redux/reducers/categoryReducer";
import PromptLoginPopup from "../utils/PromptLoginPopup";
import { onMessageListener } from "../../utils/firebase";
import { playSound, trimName } from "../../utils/general";
import audio from "../../assets/audio/notification_audio.wav";
import axios from "axios";
import Loader from "../../utils/loader";

export function SearchInput({
  setPrevSearch,
  prevSearch,
  searchValue,
  handleChange,
  postalValue,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  //call api
  const handleSubmit = async (event) => {
    event.preventDefault();
    sessionStorage.setItem("searchValue", searchValue);
    if (searchValue.trim() !== "") {
      let prevValues = [...prevSearch];
      if (!prevValues.includes(searchValue)) {
        setPrevSearch((prevState) => [...prevState, searchValue]);
      }

      //setting past 5 search values to pass for recommended prod list
      let cookies = ls("past5Search");
      let currentValues = [];
      if (cookies) {
        cookies = JSON.parse(cookies);
        if (!cookies.includes(searchValue)) {
          if (cookies.length >= 5) cookies.splice(0, 1);
          currentValues = [...cookies, searchValue];
        }
      } else currentValues = [searchValue];
      ls("past5Search", JSON.stringify(currentValues));
    }

    dispatch(setMainCategoryID(""));

    navigate(
      CustomerRoutes.ProductListing +
        `keyword=${searchValue}&postal_code=${postalValue}`
    );
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit(event);
    }
  };

  return (
    //${isInputFocused ? "focused" : "" }
    <form
      className="flex flex-row justify-between w-full md:w-fill px-3  py-2 bg-white rounded mb-[8px] 
      "
      onSubmit={handleSubmit}
    >
      <div className={`flex-1 mr-[15px] `}>
        <input
          value={searchValue}
          onChange={(event) => handleChange(event)}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="Search Anything Here..."
          className="text-left text-black text-base w-full"
        />
      </div>
      <button
        type="submit"
        className="text-grey mr-[15px] ease-linear transition hover:text-black flex-none"
      >
        <BiSearch size={24} />
      </button>

      <button className="text-orange ease-linear transition hover:text-black flex-none">
        <MdOutlineCameraAlt size={24} />
      </button>
    </form>
  );
}

export function Navbar() {
  const location = useLocation();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("customer"))
  );
  const acessToken = JSON.parse(localStorage.getItem("customer"));
  // const customer = JSON.parse(localStorage.getItem("customer"));
  const [userType, setUserType] = useState(ls("loggedUser"));

  //location fetching
  const [isFetchAddressOpen, setIsFetchAddressOpen] = useState(false);
  const [address, setAddress] = useState(ls("buyerAddress"));
  const [isAlreadyPrompted, setIsAlreadyPrompted] = useState(
    ls("addressPrompt")
  );

  //address update
  const [showAddresses, setShowAddresses] = useState(false);
  const [addresses, setAddresses] = useState([]);

  const [isOpen, setIsOpen] = useState(false);
  const [prevSearch, setPrevSearch] = useState([]);

  //postal code
  const [postalValue, setPostalValue] = useState();
  //search
  const [searchValue, setSearchValue] = useState("");

  //notifications
  const [hasUnseenNotification, setHasUnseenNotification] = useState(false);
  const [hasChatNotification, setHasChatNotification] = useState(false);

  //promotion voucher popup
  const [welcomeVoucher, showWelcomeVoucher] = useState(
    ls("promotion_voucher")
  );

  //state + reducer name + state name
  const cartQuantity = useSelector((state) => state.cart.cartQuantity);
  const retrieveCartState = useSelector((state) => state.cart.cartState);
  const retrieveProfile = useSelector((state) => state.profile.retrieveProfile);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handlePostalChange = (event) => {
    setPostalValue(event.target.value);
  };

  useEffect(() => {
    setHasUnseenNotification(user?.unread_chat ?? false);
  }, [user]);

  useEffect(() => {
    let keyValue = location.search.split("keyword=")[1] ?? "";
    setSearchValue(
      keyValue.split("&")[0]
        ? keyValue.split("&")[0].replaceAll("%20", " ")
        : ""
    );

    setPostalValue(location.search.split("postal_code=")[1] ?? "");
  }, [location.search]);

  const onPostalSubmit = async (event) => {
    event.preventDefault();
    if (postalValue.length === 6 || postalValue.length === 0) {
      navigate(
        CustomerRoutes.ProductListing +
          `keyword=${searchValue}&postal_code=${postalValue}`
      );
    }
  };

  const handleChange = (event) => {
    setSearchValue(event.target.value);
  };

  const processRes = (res, api) => {
    if (api === Apis.retrieveCart) {
      const newCartItem = res.data.data.cart_item;
      if (newCartItem !== undefined) {
        dispatch(setCartItems(newCartItem));
        dispatch(retrieveCartQuantity());
        dispatch(setCartState(true));
      }
    }
    if (api === Apis.retrieveWishList) {
      console.log(res);
      console.log(res.data);
    }
    if (api === Apis.retrieveProfile) {
      dispatch(setProfilePic(res.data.data.profile_pic));
      dispatch(setRetrieveProfile(false));
    }
  };

  useEffect(() => {
    //retrievecartstate from redux ensure api call once only even component re-render
    if (retrieveCartState === false) {
      const formData = new FormData();
      var cart_unique_id = localStorage.getItem("cart_unique_id");
      if (!cart_unique_id) {
        cart_unique_id = uuidv4();
        localStorage.setItem("cart_unique_id", cart_unique_id);
      }
      formData.append("cart_unique_id", cart_unique_id);
      BuyerApiCalls(formData, Apis.retrieveCart, "POST", {}, processRes);
    }
    if (acessToken && retrieveProfile) {
      BuyerApiCalls(
        {},
        Apis.retrieveProfile,
        "GET",
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${acessToken.access}`,
        },
        processRes
      );
    }

    var previousSearch = JSON.parse(localStorage.getItem("previousSearch"));
    if (prevSearch.length === 0) {
      if (!previousSearch) {
        var tempArr = [];
        if (sessionStorage.getItem("searchValue")) {
          tempArr.push(sessionStorage.getItem("searchValue"));
        }
        localStorage.setItem("previousSearch", JSON.stringify(tempArr));
        setPrevSearch((prevState) => [...prevState, ...tempArr]);
      } else {
        //if there is previous search
        //navbar component re-render cause state is lost, check if theres search value
        if (previousSearch.length > 5) {
          previousSearch = previousSearch.slice(-5);
        }
        if (
          previousSearch[previousSearch.length - 1] !==
          sessionStorage.getItem("searchValue")
        ) {
          previousSearch.push(sessionStorage.getItem("searchValue"));
        }
        localStorage.setItem("previousSearch", JSON.stringify(previousSearch));
        setPrevSearch((prevState) => [...prevState, ...previousSearch]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("previousSearch", JSON.stringify(prevSearch));
  }, [prevSearch]);

  const notificationListener = () => {
    onMessageListener()
      .then((payload) => {
        console.log("buyer", payload);
        if (payload?.data?.chat_message === "1") {
          setHasChatNotification(true);
          // toast.info("You have a new message",{
          //   autoClose: 2000,
          //   position: "top-right",
          //   toastId: "chat"
          // })
        } else {
          setHasUnseenNotification(true);
        }
        playSound(audio);
        notificationListener();
      })
      .catch((err) => {
        console.log("failed: ", err);
        notificationListener();
      });
  };

  useEffect(() => {
    if (userType === USER_TYPE.BUYER) notificationListener();
  }, []);

  useEffect(() => {
    if (user && !address && !welcomeVoucher) {
      if (!isAlreadyPrompted) {
        setIsFetchAddressOpen(true);
        setIsAlreadyPrompted(true);
      }
    }
  }, [welcomeVoucher]);

  useEffect(() => {
    if (user) {
      BuyerApiCalls(
        {},
        Apis.retrieveAddress,
        "GET",
        {
          Authorization: `Bearer ${user.access}`,
        },
        (res, api) => {
          setAddresses(res?.data?.data);
        }
      );
    }
  }, []);

  const setDefaultAddress = (index) => {
    let defaultAddr = addresses[index];
    const formData = new FormData();

    formData.append("full_name", defaultAddr?.full_name);
    formData.append("contact_number", defaultAddr?.contact_number);
    formData.append("postal_code", defaultAddr?.postal_code);
    formData.append("address_details", defaultAddr?.address_details);
    formData.append("unit_number", defaultAddr?.unit_number);
    formData.append("address_label", defaultAddr?.address_label);
    formData.append("set_default", true);

    BuyerApiCalls(
      formData,
      Apis.editAddress + `${addresses[index].id_address}/`,
      "POST",
      {
        Authorization: `Bearer ${user.access}`,
      },
      (res, api) => {
        if (res.data.result === "SUCCESS") {
          ls("buyerAddress", res.data.data.address_details);
          setAddress(res.data.data.address_details);
          let addr = [...addresses];
          addr[index] = res.data.data;
          setAddresses([...addr]);
          toast.success(res.data.message);
        } else toast.error(res.data.message);

        setShowAddresses(false);
      }
    );
  };

  const handleLogOut = () => {
    var fd = new FormData();
    fd.append("token", ls("deviceToken"));
    ApiCalls(
      fd,
      CommonApis.logout,
      "POST",
      {
        Authorization: "Bearer " + acessToken.access,
      },
      (res, api) => {
        if (res.data.result === "FAIL") {
          toast.error("Oops, something went wrong", {
            position: "bottom-right",
          });
          return;
        }
      }
    );
    dispatch(setRetrieveProfile(true));
    setUser(false);
    ls.remove("loggedUser");
    ls.remove("deviceToken");
    setUserType("");
    localStorage.removeItem("customer");
  };

  const handleSellerLogout = () => {
    var seller = JSON.parse(ls(Constants.localStorage.user));
    var fd = new FormData();
    fd.append("token", ls("deviceToken"));
    ApiCalls(
      fd,
      CommonApis.logout,
      "POST",
      {
        Authorization: "Bearer " + seller.access,
      },
      (res, api) => {
        if (res.data.result === "FAIL") {
          toast.error("Oops, something went wrong", {
            position: "bottom-right",
          });
          return;
        }
        ls.clear();
        setUserType("");
        navigate(MerchantRoutes.Login, { replace: true });
      }
    );
  };

  function getRelativePath() {
    // Get the full URL
    const fullURL = window.location.href;

    // Get the base URL of your application
    const baseURL = window.location.origin;

    // Check if the full URL starts with the base URL
    if (fullURL.startsWith(baseURL)) {
      // Extract the relative path by removing the base URL
      const relativePath = fullURL.substring(baseURL.length);

      return relativePath;
    }

    // If the full URL doesn't start with the base URL, return the full URL
    return fullURL;
  }

  const RedirectToLogin = () => {
    const prevUrl = getRelativePath();
    dispatch(setPrevUrl(prevUrl));
    navigate(CustomerRoutes.Login);
  };

  const RedirectToSignUp = () => {
    navigate(CustomerRoutes.SignUp);
  };

  const createLoginBtn = () => {
    const imgHeight =
    "h-[30px] md:h-[30px] lg:h-auto px-1 py-1 md:px-3 md:py-2 ";
    return (
      <>
        <div className="flex gap-4 basis-60 h-10">
          <Link
              to={CustomerRoutes.MyCart}
              onClick={() => dispatch(setPrevUrl(CustomerRoutes.MyCart))}
              className="lg:hidden flex relative items-center justify-center"
            >
              <div className="flex items-center justify-center absolute rounded-2xl w-4 h-4 bg-white bottom-2 top-[2px]">
                <p className=" text-orangeButton font-bold">{cartQuantity}</p>
              </div>
              <div className="">
                <img src={cartIcon} alt="" className={imgHeight} />
              </div>
            </Link>
          <button
            onClick={RedirectToLogin}
            className=" basis-1 rounded-md text-white bg-[#F2994A]
          lg:bg-transparent lg:outline lg:outline-1 grow btn-outline-white"
          >
            Log In
          </button>
          <button
            onClick={RedirectToSignUp}
            className=" basis-1 rounded-md lg:outline lg:outline-1 grow btn-white"
          >
            Sign Up
          </button>
        </div>
      </>
    );
  };

  const createDashboardBtn = () => {
    return (
      <div className="flex h-10">
        <button
          onClick={() => navigate(MerchantRoutes.Landing)}
          className=" basis-1 rounded-md text-white bg-[#F2994A]
          lg:bg-transparent lg:outline lg:outline-1 grow btn-outline-white px-6"
        >
          Dashboard
        </button>
      </div>
    );
  };

  const createLogo = () => {
    return (
      <>
        <Link
          to={CustomerRoutes.Landing}
          className="flex flex-none mr-3 xl:mr-12 max-[440px]:w-[120px]"
        >
          <img src={ushopWhiteIcon} alt="" className="lg:h-min" />
        </Link>
      </>
    );
  };

  const handleWishlistClick = () => {
    if (!user) {
      setIsPopupVisible(true);
      setIsOpen(false);
    } else {
      window.location.href = CustomerRoutes.Wishlist;
      <Link to={CustomerRoutes.Wishlist} className="lg:inline-block"></Link>;
    }
  };

  const openChat = () => {
    let dataToPass = {
      userType: USER_TYPE[1],
      receiverType: USER_TYPE[2],
      buyerId: user?.user_id,
      shopSlug: "",
      sellerId: "",
      shopName: "",
    };

    ls("chatData", JSON.stringify(dataToPass));
    setHasChatNotification(false)
    const newTab = window.open(CustomerRoutes.ChatScreen, "_blank");
    if (newTab) newTab.focus();
  };

  const createNotifHeartCart = () => {
    const imgHeight =
      "h-[30px] md:h-[30px] lg:h-auto px-1 py-1 md:px-3 md:py-2 ";
    return (
      <>
        <div className="flex flex-none w-fit items-start  gap-2">
          <Link
            to={CustomerRoutes.ViewNotifcation}
            className="lg:inline-block relative"
          >
            {hasUnseenNotification && (
              <div className="bg-red-500 h-2 w-2 rounded absolute right-[4px] top-[4px]"></div>
            )}
            <MdOutlineNotifications
              size={24}
              color="white"
              className="cp mt-1"
            />
          </Link>
          <MdFavoriteBorder
            size={24}
            color="white"
            onClick={handleWishlistClick}
            className="cp mt-1"
          />

          <div className="flex">
            <p className="text-sm text-white font-semibold mt-2">SGD</p>
            <Link
              to={CustomerRoutes.MyCart}
              onClick={() => dispatch(setPrevUrl(CustomerRoutes.MyCart))}
              className="flex relative items-center justify-center"
            >
              <div className="flex items-center justify-center absolute rounded-2xl w-4 h-4 bg-white bottom-2 top-[2px]">
                <p className=" text-orangeButton font-bold">{cartQuantity}</p>
              </div>
              <div className="">
                <img src={cartIcon} alt="" className={imgHeight} />
              </div>
            </Link>
          </div>
          {user && (
            <div className="cp mt-1.5 md:mr-[18px] relative" onClick={openChat}>
              {hasChatNotification && (
                <div className="bg-red-500 h-2 w-2 rounded absolute right-[-1px] top-[-1px]"></div>
              )}
              <MdChat size={24} color="white" />
            </div>
          )}
        </div>
      </>
    );
  };

  const linkCss =
    "hidden lg:inline text-white text-xs transition-colors hover:text-black font-medium";

  return (
    <section
      id="navbar"
      className="flex flex-col lg:pb-2 lg:px-10 xl:px-20 px-4 py-3 z-30 w-full mb-4"
    >
      <ToastContainer autoClose={500} hideProgressBar={true} />
      {/*first row*/}
      <div className="hidden lg:flex justify-between text-white space-x-5 my-3">
        {!userType ? (
          <div className="flex flex-row">
            <div className="group">
              <Link
                to={MerchantRoutes.Login}
                // target="_blank"
                className="flex flex-row items-center group-hover:underline"
              >
                <img
                  className="hidden lg:inline mr-1"
                  width={20}
                  src={globeIcon}
                  alt=""
                />
                <p className={linkCss}>Seller Centre</p>
              </Link>
              {/* <div className="mx-2 group-hover:border-b group-hover:border-blue-50"></div> */}
            </div>
            <div className="vl"></div>
            <div className="group">
              <Link
                to={MerchantRoutes.Register}
                // target="_blank"
                className="flex flex-row items-center "
              >
                <img
                  className="hidden lg:inline mr-1"
                  width={20}
                  src={tagIcon}
                  alt=""
                />
                <p className={linkCss}>Sell On Ushop</p>
              </Link>
              {/* <div className="mx-2 group-hover:border-b group-hover:border-blue-50"></div> */}
            </div>
          </div>
        ) : null}

        <div
          className={`flex flex-row ${
            user || userType ? "w-full" : ""
          } justify-end`}
        >
          <div className="group mr-6 flex gap-2">
            <div className="flex flex-row items-center">
              <img
                className="hidden lg:inline mr-1"
                src={questionMarkIcon}
                alt=""
                width={20}
              />
              <Link
                to={CustomerRoutes.Help.replace(":tab", "contact-us")}
                className={linkCss}
              >
                Help
              </Link>
            </div>
            {userType === USER_TYPE.SELLER && (
              <div
                className="flex flex-row gap-1 items-center cp"
                onClick={handleSellerLogout}
              >
                <AiOutlineLogout />
                <p className="text-xs">Logout</p>
              </div>
            )}
          </div>

          {/* <div className="group mr-6">
            <div className="flex flex-row items-center ">
              <img
                className="hidden lg:inline mr-1"
                src={globeIcon}
                alt=""
                width={20}
              />
              <Link className={linkCss}>Language</Link>
            </div>
          </div> */}

          {/* <div className="group">
            <div className="flex flex-row items-center ">
              <img
                className="hidden lg:inline mr-1"
                src={chatSupportIcon}
                alt=""
                width={20}
              />
              <Link className={linkCss}>Chat & Support</Link>
            </div>
          </div> */}
        </div>
      </div>

      {isPopupVisible && (
        <PromptLoginPopup
          isOpen={isPopupVisible}
          setIsOpen={setIsPopupVisible}
          navigateTo={CustomerRoutes.Wishlist}
          additionalText={
            !isOpen && (
              <div className="text-center justify-center font-bold text-xl">
                Want to add to your wishlist?
              </div>
            )
          }
        />
      )}

      {isFetchAddressOpen && (
        <FetchAddress
          isFetchAddressOpen={isFetchAddressOpen}
          closeFetchAddress={() => {
            ls("addressPrompt", true);
            setIsFetchAddressOpen(false);
          }}
          setAddress={setAddress}
          user={user}
        />
      )}

      {welcomeVoucher && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] bg-slate-500 bg-opacity-50">
          <div className="welcomeVoucherClass relative overflow-auto">
            <div
              className="absolute top-5 right-5 cp"
              onClick={() => {
                showWelcomeVoucher(false);
                ls("promotion_voucher", false);
              }}
            >
              <MdClose color="black" size={25} />
            </div>
          </div>
        </div>
      )}

      {/*2nd row desktop*/}
      <div className="hidden lg:flex text-white ">
        {/* logo */}

        {createLogo()}

        {/* postal code*/}
        {user && address ? (
          <div className=" mr-8  mb-3">
            <div className="flex gap-1 items-center relative">
              <p className="text-white font-bold">Delivery To</p>
              <MdArrowDropDown
                size={30}
                className="cp"
                onClick={() => setShowAddresses(!showAddresses)}
              />
              {showAddresses && (
                <div
                  className="absolute bg-white w-[250px] max-h-[150px] overflow-y-auto top-[50px] shadow-md rounded-md
                px-3 py-3 overflow-y-auto z-10"
                >
                  {addresses.length > 0 ? (
                    <>
                      {addresses.map((address, index) => {
                        return (
                          <div
                            key={`address${index}`}
                            className="cp mb-2"
                            onClick={() => setDefaultAddress(index)}
                          >
                            <p className="text-black">
                              {address?.address_details}
                            </p>
                            <hr className="my-1" />
                          </div>
                        );
                      })}
                    </>
                  ) : null}
                </div>
              )}
            </div>
            <p
              className="text-white text-sm cp"
              onClick={() => setShowAddresses(!showAddresses)}
            >
              {trimName(address, 25)}
            </p>
          </div>
        ) : (
          <div
            className="h-1/5 items-center text-black  bg-white rounded 
        px-2 py-2 mr-8 xl:mr-16 mb-3 
        flex flex-row"
          >
            <GrLocation size={24} className="mr-1 flex-none" />
            <form
              className="flex-auto w-[140px] mr-2"
              onSubmit={onPostalSubmit}
            >
              <input
                id="searchItemBox"
                type="text"
                placeholder="Enter Postal Code"
                className="text-left outline-0 placeholder:text-left text-base w-full"
                value={postalValue}
                onChange={handlePostalChange}
              />
            </form>
            <MdMyLocation
              size={24}
              className="text-orange transition hover:text-black cursor-pointer flex-none"
            />
          </div>
        )}

        {/*search box*/}
        <div className={`flex flex-col flex-auto h-full mr-5 md:w-[400px]`}>
          <SearchInput
            setPrevSearch={setPrevSearch}
            prevSearch={prevSearch}
            handleChange={handleChange}
            searchValue={searchValue}
            postalValue={postalValue}
          />
          {/*common searched*/}
          <ul className="flex search-q lg:text-xs xl:text-sm ">
            {[...prevSearch]
              .reverse()
              .slice(0, 5)
              .map((item, index) => {
                return (
                  <li key={index} className="gap-4 mx-2">
                    <button
                      onClick={() => {
                        navigate(
                          CustomerRoutes.ProductListing +
                            `keyword=${item}&postal_code=${postalValue}`
                        );
                      }}
                    >
                      {item}
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>

        {/*notification*/}
        {createNotifHeartCart()}

        {/* {user ? (
          <>
            <ProfileDropdown setUser={setUser} handleLogOut={handleLogOut} />
          </>
        ) : (
          <> */}
        {/*desktop*/}
        {userType === USER_TYPE.SELLER ? (
          createDashboardBtn()
        ) : user ? (
          <ProfileDropdown handleLogOut={handleLogOut} />
        ) : (
          createLoginBtn()
        )}
        {/* </>
        )} */}
      </div>

      {/*mobile*/}
      <div className="lg:hidden flex justify-between items-center mb-5">
        <div className="flex flex-row items-center">
          {/* <div id="site-burger" onClick={toggleSideBar}> */}
          {user && (
            <>
              <div className="!w-10 h-10" id="site-menu">
                <MdMenu
                  color="white"
                  className="cp !w-10 h-10"
                  onClick={toggleSideBar}
                />
              </div>
              {/* logo */}
              <SideNav></SideNav>
            </>
          )}
          {createLogo()}
        </div>

        {user ? (
          <>
            {/*notif*/}
            {createNotifHeartCart()}
          </>
        ) : (
          <>
            {/*notif*/}
            {createLoginBtn()}
          </>
        )}
      </div>

      <div className="lg:hidden">
        <SearchInput
          setPrevSearch={setPrevSearch}
          prevSearch={prevSearch}
          handleChange={handleChange}
          searchValue={searchValue}
          postalValue={postalValue}
        />
      </div>
    </section>
  );
}

export function Links() {
  const [footer, setFooter] = useState(null);

  const processResponse = (res) => {
    setFooter(res.data.data);
  };

  useEffect(() => {
    BuyerApiCalls(
      { slug: "footer" },
      Apis.staticPages,
      "GET",
      {},
      processResponse,
      null
    );
  }, []);

  return (
    <>
      {footer && footer.static_content && footer.static_content.description
        ? parse(footer.static_content.description)
        : null}

      {/* <section id="links" className="relative">
        <div className="flex flex-col py-7 px-5 items-start text-start text-xs space-y-5 lg:flex-row lg:space-y-0 lg:justify-between lg:px-28 lg:py-14 lg:text-left">
          <div className="flex flex-col space-y-5 items-start">
            <p>
              <img src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/ushopIcon.png" alt="ushopIcon" className="w-min" />
            </p>
            <p className="text-[12px] md:text-[14px] w-2/3 leading-6">
              uShop is a quick commerce platform that matches sellers to buyers. We combine the merits of traditional e-commerce with innovations in last mile delivery.
            </p>
            <div className="flex flex-row space-x-5 ">
              <img src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/instagramIcon.png" alt="instagramIcon" className="w-10 h-10" />
              <img src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/websiteIcon.png" alt="websiteIcon" className="w-10 h-10" />
              <img src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/twitterIcon.png" alt="twitterIcon" className="w-10 h-10" />
              <img src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/youtubeIcon.png" alt="youtubeIcon" className="w-10 h-10" />
            </div>
          </div>
          <div className="grid grid-cols-2 w-full lg:flex lg:flex-row">
            <div className="leading-9 flex flex-col lg:mx-auto">
              <p className="font-semibold mb-5 text-[12px] md:text-[16px]">
                Customer Service
              </p>
              <div className="grid">
                <a href="http://stg.ushop.market/help/contact-us/" className="hover:text-amber-400 text-black mb-1 text-[12px] md:text-[16px] font-normal">Help Centre </a>
                <a href="http://stg.ushop.market/help/order-shipping/" className="hover:text-amber-400 text-black mb-1 text-[12px] md:text-[16px] font-normal">How To Buy </a>
                <a href="http://stg.ushop.market/become-seller/" className="hover:text-amber-400 text-black mb-1 text-[12px] md:text-[16px] font-normal">How To Sell </a>
                <a href="http://stg.ushop.market/help/payments/" className="hover:text-amber-400 text-black mb-1 text-[12px] md:text-[16px] font-normal">Payment Methods </a>
                <a href="http://stg.ushop.market/help/return-refund/" className="hover:text-amber-400 text-black mb-1 text-[12px] md:text-[16px] font-normal">Return & Refund </a>
                <a href="http://stg.ushop.market/help/contact-us/" className="hover:text-amber-400 text-black mb-1 text-[12px] md:text-[16px] font-normal">Contact Us</a>
              </div>
            </div>
            <div className="leading-9 flex flex-col lg:mx-auto">
              <p className="font-semibold mb-5 text-[12px] md:text-[16px]">
                About uShop
              </p>
              <div className="grid">
                <a href="http://stg.ushop.market/about/" className="hover:text-amber-400 text-black mb-1 text-[12px] md:text-[16px] font-normal">About Us</a>
                <a href="http://stg.ushop.market/terms-and-conditions/" className="hover:text-amber-400 text-black mb-1 text-[12px] md:text-[16px] font-normal">Terms & Conditions </a>
                <a href="http://stg.ushop.market/privacy-and-policy/" className="hover:text-amber-400 text-black mb-1 text-[12px] md:text-[16px] font-normal">Privacy Policy</a>
                <a href="http://stg.ushop.market/ushop-blogs/" className="hover:text-amber-400 text-black mb-1 text-[12px] md:text-[16px] font-normal">uShop Blog</a>
                <a href="http://stg.ushop.market/become-seller/" className="hover:text-amber-400 text-black mb-1 text-[12px] md:text-[16px] font-normal">Seller Centre</a>
                <a href="" className="hover:text-amber-400 text-black mb-1 text-[12px] md:text-[16px] font-normal">Media Contact</a>
              </div>
            </div>
            <div className="leading-9 mt-4 lg:mt-0 lg:mx-auto">
              <p className="font-semibold mb-5 text-[12px] md:text-[16px]">
                Payment
              </p>
              <div className="grid  grid-cols-4 lg:grid-cols-2 gap-2 mb-7">
                <img src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/visaIcon.png" alt="visaIcon" />
                <img src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/mastercardIcon.png" alt="masterCardIcon" />
                <img src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/americanExpressIcon.png" alt="americanExpressIcon" />
              </div>
              <p className="font-bold text-[12px] md:text-[18px] mb-5">
                Logistics
              </p>
              <p>
                <img src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/uparcelIcon.png" alt="uparcelIcon" />
              </p>
            </div>
          </div>
        </div>
      </section> */}
    </>
  );
}

export function CommonBackground(props) {
  return (
    <div className="w-full grid md:app-row">
      <div>
        <LogoNav />
      </div>
      <div className="flex justify-center ">
        <div>
          <img
            alt=""
            src={join}
            className="hidden lg:block md:mt-32 md:animate__animated animate__rubberBand "
          />
        </div>
        <div className="md:py-4 md:pl-20 w-full md:w-[550px]">
          {props.children}
        </div>
      </div>
    </div>
  );
}

export function FetchAddress({
  isFetchAddressOpen,
  closeFetchAddress,
  setAddress,
  user,
}) {
  const [locationErr, setLocationErr] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      setLocationErr(null);
      navigator.geolocation.getCurrentPosition(
        handleLocationSuccess,
        handleLocationError
      );
    } else setLocationErr("Geolocation is not available");
  };

  const handleLocationSuccess = (position) => {
    const { latitude, longitude } = position.coords;
    axios
      .get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${USHOP_API_KEY}`
      )
      .then((response) => {
        const addressComp = response.data.results[0].address_components;

        let address = "",
          postal = "";
        addressComp.map((comp) => {
          if (comp.types.includes("postal_code")) postal = comp.long_name;
          else address += comp.long_name + ", ";
        });
        address = address.substring(0, address.length - 1);

        setIsAdding(true);
        const formData = new FormData();
        console.log("user", user);

        formData.append("full_name", user?.username ?? user?.email);
        formData.append("contact_number", user?.contact_number ?? "");
        formData.append("postal_code", "470742");
        formData.append("address_details", "742 Bedok Reservoir Rd #01-3093");
        formData.append("unit_number", "");
        formData.append("address_label", "Home");
        formData.append("set_default", true);
        formData.append("original_domain", "yes");

        BuyerApiCalls(
          formData,
          Apis.addAddress,
          "POST",
          {
            Authorization: `Bearer ${user.access}`,
          },
          (res, api) => {
            console.log(res.data);
            if (res.data.result === "SUCCESS") {
              setAddress(address);
              setLocationErr(null);
              ls("buyerAddress", address);
              closeFetchAddress();
            } else {
              setLocationErr(res.data.message);
            }
            setIsAdding(false);
          }
        );
      })
      .catch((error) => {
        setLocationErr("Error fetching address");
        console.log(error);
      });
  };

  const handleLocationError = (error) => {
    setLocationErr(error.message);
  };

  return (
    <Modal
      width="w-[450px] max-sm:w-full mx-4"
      open={isFetchAddressOpen}
      children={
        <div>
          <div className="flex justify-between">
            <p className="text-black mb-5 font-semibold">
              Welcome to <span className="text-orangeButton">uShop</span>
            </p>
            <FontAwesomeIcon
              icon={faXmark}
              className="cp"
              onClick={closeFetchAddress}
            />
          </div>
          <div className="flex gap-4">
            <GrLocation size={30} />
            <p>
              Please provide your delivery location to see products at nearby
              site
            </p>
          </div>
          <div
            className="h-10 pt-2 bg-orangeButton text-center text-white ml-7 cp mb-4 mt-6 w-48"
            onClick={detectLocation}
          >
            {isAdding ? <Loader /> : "Detect my location"}
          </div>
          {locationErr && <p className="text-sm text-red-500">{locationErr}</p>}
        </div>
      }
    />
  );
}

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setPrevUrl } from "../../redux/reducers/prevUrlReducer";
import { v4 as uuidv4 } from "uuid";
import ls from "local-storage";

// routes
import { CustomerRoutes } from "../../../Routes";

//reducers
import { useSelector } from "react-redux";

//components sections
import NavHeader from "./NavHeader";
import NavSearchBar from "./NavSearchBar";
import NavCategory from "./NavCategory";
import PromptLoginPopup from "../../utils/PromptLoginPopup";
import { Apis, BuyerApiCalls } from "../../utils/ApiCalls";
import {
  retrieveCartQuantity,
  setCartItems,
  setCartState,
} from "../../redux/reducers/cartReducer";
import { setRetrieveProfile } from "../../redux/reducers/profileReducer";
import AccSwitchPopup from "../../../components/accountSwitch/AccSwitchPopup";
import { USER_TYPE } from "../../../constants/general";
import { useMediaQuery } from "@mui/material";
import NavMobileSearchBar from "./mobile-components/NavMobileSearchBar";

const NewNavbar = () => {
  // const location = useLocation();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("customer"))
  );
  const acessToken = JSON.parse(localStorage.getItem("customer"));
  const [userType, setUserType] = useState(ls("loggedUser"));

  const [isOpen, setIsOpen] = useState(false);

  //search
  const [searchValue, setSearchValue] = useState("");
  const [prevSearch, setPrevSearch] = useState([]);

  //notifications
  // const [hasUnseenNotification, setHasUnseenNotification] = useState(false);
  // const [hasChatNotification, setHasChatNotification] = useState(false);

  //promotion voucher popup
  // const [welcomeVoucher, showWelcomeVoucher] = useState(
  //   ls("promotion_voucher")
  // );

  //state + reducer name + state name
  const cartQuantity = useSelector((state) => state.cart.cartQuantity);
  const retrieveCartState = useSelector((state) => state.cart.cartState);
  const retrieveProfile = useSelector((state) => state.profile.retrieveProfile);

  // account switch popup
  const [showSwitchPopup, setShowSwitchPopup] = useState(false);
  const [userNewData, setUserNewData] = useState(null);
  const profile_pic = useSelector((state) => state.profile.profile_pic);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLargeScreen = useMediaQuery("(min-width: 1150px)");

  const getRelativePath = () => {
    const fullURL = window.location.href;
    const baseURL = window.location.origin;
    return fullURL.startsWith(baseURL)
      ? fullURL.substring(baseURL.length)
      : fullURL;
  };

  const RedirectToLogin = () => {
    const prevUrl = getRelativePath();
    dispatch(setPrevUrl(prevUrl));
    navigate(CustomerRoutes.Login);
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
      dispatch(setRetrieveProfile(false));
    }
  };

  useEffect(() => {
    // retrievecartstate from redux ensure api call once only even component re-render
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

  return (
    <div className="flex flex-col sticky top-0 left-0 right-0 z-50 bg-white">
      <NavHeader user={user} userType={userType} />
      {isPopupVisible && (
        <PromptLoginPopup
          isOpen={isPopupVisible}
          setIsOpen={setIsPopupVisible}
          additionalText={
            !isOpen && (
              <div className="text-center justify-center font-bold text-xl">
                Want to add to your wishlist?
              </div>
            )
          }
        />
      )}
      <AccSwitchPopup
        showSwitchPopup={showSwitchPopup}
        onClose={() => setShowSwitchPopup(false)}
        userOldData={{ ...user, profile_pic: profile_pic }}
        userNewData={{ ...userNewData }}
        switchingTo={USER_TYPE.SELLER}
      />
      {isLargeScreen ? (
        <NavSearchBar
          RedirectToLogin={RedirectToLogin}
          prevSearch={prevSearch}
          setPrevSearch={setPrevSearch}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          handleWishlistClick={handleWishlistClick}
          cartQuantity={cartQuantity}
          setShowSwitchPopup={setShowSwitchPopup}
          setUserNewData={setUserNewData}
          user={user}
          setUser={setUser}
          userType={userType}
          setUserType={setUserType}
        />
      ) : (
        <NavMobileSearchBar
          RedirectToLogin={RedirectToLogin}
          prevSearch={prevSearch}
          setPrevSearch={setPrevSearch}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          handleWishlistClick={handleWishlistClick}
          cartQuantity={cartQuantity}
          user={user}
          setUser={setUser}
          setUserType={setUserType}
        />
      )}
      <NavCategory SetIsCategoryDropdownOpen={setIsCategoryDropdownOpen} isCategoryDropdownOpen={isCategoryDropdownOpen} />

      {/* Overlay for CategoriesCarousel */}
      {isCategoryDropdownOpen && (
        <div
          className="fixed inset-0 top-[232px] bg-black bg-opacity-30 z-40"
          onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
        ></div>
      )}
    </div>
  );
};

export default NewNavbar;

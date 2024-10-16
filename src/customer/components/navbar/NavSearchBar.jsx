import React, { useEffect, useState } from "react";
import ls from "local-storage";

//images
import ushopLogo from "../../../assets/logo-orange.svg";
import locationLogo from "../../../assets/location-nav.svg";
// icons
import { BsHeart } from "react-icons/bs";
import { FiUser } from "react-icons/fi";
import { RiShoppingBag2Line } from "react-icons/ri";

//redux hooks
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { CustomerRoutes, MerchantRoutes } from "../../../Routes";
import NavProfileDropdown from "./NavProfileDropdown";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { CommonApis } from "../../../Utils";
import { ApiCalls } from "../../../merchant/utils/ApiCalls";
import { setRetrieveProfile } from "../../redux/reducers/profileReducer";
import { setPrevUrl } from "../../redux/reducers/prevUrlReducer";
import { trimName } from "../../../utils/general";
import {
  MdClose,
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import { Apis, BuyerApiCalls } from "../../utils/ApiCalls";
import { Constants } from "../../../merchant/utils/Constants";
import { USER_TYPE } from "../../../constants/general";
import { FetchAddress } from "../GenericSections";
import SearchBar from "./common/SearchBar";
import { useSelector } from "react-redux";
import { setAddresses } from "../../redux/reducers/addressReducer";

const NavSearchBar = ({
  RedirectToLogin,
  prevSearch,
  setPrevSearch,
  searchValue,
  setSearchValue,
  handleWishlistClick,
  cartQuantity,
  setShowSwitchPopup,
  setUserNewData,
  user,
  setUser,
  userType,
  setUserType,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPopup, setShowPopup] = useState(false);

  // user address states
  const [address, setAddress] = useState(ls("buyerAddress"));
  const [showAddresses, setShowAddresses] = useState(false);
  const addresses = useSelector((state) => state.address.addresses);
  const [isFetchAddressOpen, setIsFetchAddressOpen] = useState(false);

  const acessToken = JSON.parse(localStorage.getItem("customer"));
  const [welcomeVoucher, showWelcomeVoucher] = useState(
    ls("promotion_voucher")
  );
  const [isAlreadyPrompted, setIsAlreadyPrompted] = useState(
    ls("addressPrompt")
  );

  const username =
    user?.username?.split(" ")[0] ??
    user?.email?.substring(0, user.email.indexOf("@")) ??
    "Login";

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
          dispatch(setAddresses([...addr]));
          toast.success(res.data.message);
        } else toast.error(res.data.message);

        setShowAddresses(false);
      }
    );
  };

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
          dispatch(setAddresses(res?.data?.data));
        }
      );
    }
  }, []);

  useEffect(() => {
    if (user && !address && !welcomeVoucher) {
      if (!isAlreadyPrompted) {
        setIsFetchAddressOpen(true);
        setIsAlreadyPrompted(true);
      }
    }
  }, [welcomeVoucher]);

  return (
    <div className="flex flex-col md:flex-row w-full md:h-[139px] items-center justify-center gap-2 sm:gap-5 bg-white p-2">
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

      <Link to={CustomerRoutes.Landing}>
        <img
          src={ushopLogo}
          alt="ushop-logo"
          className="w-[120px] h-[30px] md:w-[160px] lg:h-min"
        />
      </Link>

      <div className="flex items-center relative">
        <img
          src={locationLogo}
          alt="location-logo"
          className="w-[24px] md:w-[34px]"
        />

        {user && address ? (
          <div className="pl-1 flex-col items-center pt-2">
            <div className="flex gap-1 items-center">
              <p className="text-xs text-[#666666]">Delivery To</p>
              {showAddresses && (
                <div
                  className="absolute bg-white w-[250px] max-h-[150px] top-[50px] left-1 shadow-md rounded-md
              px-3 py-3 z-[51] overflow-y-auto"
                >
                  {addresses.length > 0 ? (
                    <>
                      {addresses.map((val, index) => {
                        return (
                          <div
                            key={`val${index}`}
                            className="cp mb-2 p-1"
                            onClick={() => setDefaultAddress(index)}
                          >
                            <div className="flex justify-between">
                              <p className="text-black text-xs">
                                {val?.address_details}
                              </p>

                              {address === val.address_details && (
                                <div className="text-xs text-[#F5AB35] bg-[#F7F7F7]">
                                  Default
                                </div>
                              )}
                            </div>

                            <hr className="my-1" />
                          </div>
                        );
                      })}

                      <div
                        onClick={() => {
                          navigate(CustomerRoutes.addressBook);
                        }}
                        className="text-xs text-center p-2 cp bg-[#F7F7F7] text-[#F5AB35]"
                      >
                        Address books
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            <div className="flex gap-1 items-center justify-center">
              <p
                className="text-xs cp"
                onClick={() => setShowAddresses(!showAddresses)}
              >
                {trimName(address, 20)}
              </p>

              {showAddresses ? (
                <MdOutlineKeyboardArrowUp
                  size={20}
                  className="cp text-[#666666]"
                  onClick={() => setShowAddresses(!showAddresses)}
                />
              ) : (
                <MdOutlineKeyboardArrowDown
                  size={20}
                  className="cp text-[#666666]"
                  onClick={() => setShowAddresses(!showAddresses)}
                />
              )}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-[#666666]">
              please{" "}
              <span
                onClick={RedirectToLogin}
                className="text-[#F5AB35] underline cp"
              >
                login
              </span>
              <br />
              get your delivery address
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col relative">
        <SearchBar
          prevSearch={prevSearch}
          setPrevSearch={setPrevSearch}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />

        {/*common searched*/}
        <ul className="flex gap-4 text-xs absolute top-12">
          {[...prevSearch]
            .reverse()
            .slice(0, 5)
            .map((item, index) => {
              return (
                <li key={index} className="text-[#666666] hover:text-[#F5AB35]">
                  <button
                    onClick={() => {
                      navigate(
                        CustomerRoutes.ProductListing + `keyword=${item}`
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

      <div className="flex gap-2 md:gap-5 items-center justify-center h-[44px]">
        <div
          className="flex flex-col items-center justify-center cp text-[#666666] hover:text-[#F5AB35] h-fit"
          onClick={handleWishlistClick}
        >
          <BsHeart className="w-[20px] h-[18px]" />
          <p className="text-[12px] text-center pt-[6px]">Favorites</p>
        </div>

        <Link
          to={CustomerRoutes.MyCart}
          onClick={() => dispatch(setPrevUrl(CustomerRoutes.MyCart))}
          className="flex flex-col items-center relative cp text-[#666666] hover:text-[#F5AB35] h-fit"
        >
          <RiShoppingBag2Line className="w-[24px] h-[24px]" />
          <p className="text-[12px] text-center">Cart</p>
          <div className="absolute top-0 right-0 bg-[#FF5E2B] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center -mt-2 -mr-1">
            {cartQuantity}
          </div>
        </Link>

        <div
          className="flex flex-col items-center justify-center cp text-[#666666] hover:text-[#F5AB35] h-fit mr-1"
          onClick={() => setShowPopup((prev) => !prev)}
        >
          <FiUser className="w-[24px] h-[24px]" />
          <div className="flex items-center gap-1">
            <p className="text-[12px] text-center">{username}</p>
            {!showPopup ? (
              <FontAwesomeIcon
                className={`w-[7px]`}
                icon={faChevronRight}
                rotation={90}
              />
            ) : (
              <FontAwesomeIcon
                className={`w-[7px]`}
                icon={faChevronRight}
                rotation={270}
              />
            )}

            {showPopup && (
              <NavProfileDropdown
                handleLogOut={
                  userType === USER_TYPE.SELLER
                    ? handleSellerLogout
                    : handleLogOut
                }
                setShowSwitchPopup={setShowSwitchPopup}
                setUserNewData={setUserNewData}
                userType={userType}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavSearchBar;

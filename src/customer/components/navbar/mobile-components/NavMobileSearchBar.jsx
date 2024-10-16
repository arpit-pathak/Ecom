import React, { useEffect, useState } from "react";
import ls from "local-storage";

//images
import ushopLogo from "../../../../assets/logo-orange.svg";
import locationLogo from "../../../../assets/location-nav.svg";

// icons
import { FiUser } from "react-icons/fi";
import { RiShoppingBag2Line } from "react-icons/ri";

//redux hooks
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { CustomerRoutes, MerchantRoutes } from "../../../../Routes";
import { toast } from "react-toastify";
// import { CommonApis } from "../../../Utils";
// import { ApiCalls } from "../../../merchant/utils/ApiCalls";
// import { setRetrieveProfile } from "../../redux/reducers/profileReducer";
import { setPrevUrl } from "../../../redux/reducers/prevUrlReducer";
import { trimName } from "../../../../utils/general";
import {
  MdClose,
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import { RiMenu2Line } from "react-icons/ri";
import { Apis, BuyerApiCalls } from "../../../utils/ApiCalls";
// import { Constants } from "../../../merchant/utils/Constants";
import { FetchAddress } from "../../GenericSections";
import NavMobileSideBar from "./NavMobileSideBar";
import SearchBar from "../common/SearchBar";

const NavMobileSearchBar = ({
  RedirectToLogin,
  prevSearch,
  setPrevSearch,
  searchValue,
  setSearchValue,
  handleWishlistClick,
  cartQuantity,
  user,
  setUser,
  setUserType,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const [showPopup, setShowPopup] = useState(false);

  // user address states
  const [address, setAddress] = useState(ls("buyerAddress"));
  const [showAddresses, setShowAddresses] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [isFetchAddressOpen, setIsFetchAddressOpen] = useState(false);

  const [welcomeVoucher, showWelcomeVoucher] = useState(
    ls("promotion_voucher")
  );
  const [isAlreadyPrompted, setIsAlreadyPrompted] = useState(
    ls("addressPrompt")
  );
  const [showMobileSideBar, setShowMobileSideBar] = useState(false);
  const username = user?.username?.split(" ")[0] || "";

  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");

  // const handleSellerLogout = () => {
  //   var seller = JSON.parse(ls(Constants.localStorage.user));
  //   var fd = new FormData();
  //   fd.append("token", ls("deviceToken"));
  //   ApiCalls(
  //     fd,
  //     CommonApis.logout,
  //     "POST",
  //     {
  //       Authorization: "Bearer " + seller.access,
  //     },
  //     (res, api) => {
  //       if (res.data.result === "FAIL") {
  //         toast.error("Oops, something went wrong", {
  //           position: "bottom-right",
  //         });
  //         return;
  //       }
  //       ls.clear();
  //       setUserType("");
  //       navigate(MerchantRoutes.Login, { replace: true });
  //     }
  //   );
  // };

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

  useEffect(() => {
    if (user && !address && !welcomeVoucher) {
      if (!isAlreadyPrompted) {
        setIsFetchAddressOpen(true);
        setIsAlreadyPrompted(true);
      }
    }
  }, [welcomeVoucher]);

  return (
    <div className="flex flex-col w-full justify-center gap-2 sm:gap-5 bg-white py-2 px-6 md:px-10 border-b border-[#E6E6E6]">
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

      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-row items-center pt-2">
          <RiMenu2Line
            className="cp !w-10 h-6 md:h-[29px] text-[#666666]"
            onClick={() => setShowMobileSideBar((prev) => !prev)}
          />

          {/* Overlay */}
          {showMobileSideBar && (
            <div
              className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40 transition-opacity duration-300"
              onClick={() => setShowMobileSideBar((prev) => !prev)}
            ></div>
          )}

          {showAddresses && (
            <div
              className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40 transition-opacity duration-300"
              onClick={() => setShowAddresses((prev) => !prev)}
            ></div>
          )}

          {showMobileSideBar && (
            <NavMobileSideBar
              handleWishlistClick={handleWishlistClick}
              cartQuantity={cartQuantity}
              user={user}
              setUser={setUser}
              setUserType={setUserType}
              showMobileSideBar={showMobileSideBar}
              setShowMobileSideBar={setShowMobileSideBar}
            />
          )}

          <Link to={CustomerRoutes.Landing}>
            <img
              src={ushopLogo}
              alt="ushop-logo"
              className="w-[104px] h-[26px] md:w-[200px] md:h-[52px] lg:h-min"
            />
          </Link>
        </div>

        <div className="flex gap-4 h-[44px] items-center mr-2">
          <div
            className="flex flex-row cp gap-1 md:gap-2 items-center text-[#666666] text-[13px] md:text-base md:leading-[26px]"
            onClick={() => navigate(CustomerRoutes.ViewProfile)}
          >
            {user && <p>{username}</p>}
            <FiUser className="w-[24px] h-[24px] md:w-[48px] md:h-[48px]" />
          </div>

          <Link
            to={CustomerRoutes.MyCart}
            onClick={() => dispatch(setPrevUrl(CustomerRoutes.MyCart))}
            className="relative cp text-[#666666]"
          >
            <RiShoppingBag2Line className="w-[24px] h-[24px] md:w-[48px] md:h-[48px]" />
            <div className="absolute top-0 right-0 bg-[#FF5E2B] text-white text-sm md:text-lg rounded-full w-4 md:w-6 h-4 md:h-6 flex items-center justify-center -mt-2 -mr-1">
              {cartQuantity}
            </div>
          </Link>
        </div>
      </div>

      <div className="flex flex-col relative w-full">
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

      <div className="flex items-center justify-center gap-4 md:gap-8 relative mt-1">
        <img
          src={locationLogo}
          alt="location-logo"
          className="w-[24px] md:w-[48px] xl:w-[34px]"
        />

        {user && address ? (
          <div className="pl-1 flex items-center w-full pt-2 md:gap-5">
            <div className="flex gap-1 items-center">
              <p className="text-xs md:text-lg xl:text-xs text-[#666666]">
                Delivery To
              </p>
              {showAddresses && (
                <div
                  className={`fixed bottom-0 left-0 right-0 h-[44%] w-full bg-white p-2 shadow-lg z-50 transition-transform duration-500 transform ${
                    showAddresses ? "translate-x-0" : "-translate-x-full"
                  }`}
                >
                  {addresses.length > 0 ? (
                    <>
                      <div className="flex flex-row bg-[#F7F7F7] py-[14px] md:mx-2 justify-between items-center mb-2">
                        <p className="text-base md:text-xl text-black">
                          Delivery To
                        </p>
                        <MdClose
                          size={22}
                          className="text-[#666666] w-[17px] md:w-[26px]"
                          onClick={() => setShowAddresses((prev) => !prev)}
                        />
                      </div>
                      {addresses.map((val, index) => {
                        return (
                          <div
                            key={`val${index}`}
                            className="cp mb-2 p-1"
                            onClick={() => setDefaultAddress(index)}
                          >
                            <div className="flex justify-between items-center py-1">
                              <p className="text-black text-xs md:text-base">
                                {val?.address_details}
                              </p>

                              {address === val.address_details && (
                                <div className="text-xs md:text-base text-[#F5AB35] bg-[#FFF5E5] px-2 py-1">
                                  Default
                                </div>
                              )}
                            </div>

                            <hr className="my-1 text-[#EDEDED]" />
                          </div>
                        );
                      })}

                      <div
                        onClick={() => {
                          navigate(CustomerRoutes.addressBook);
                        }}
                        className="text-xs md:text-base text-center p-2 cp bg-[#F7F7F7] text-[#F5AB35]"
                      >
                        Address books
                      </div>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {/* Vertical line between two divs */}
            <div className="border-l border-[#BDBDBD] h-3 mx-3"></div>

            <div className="flex gap-4 items-center">
              <p
                className="text-xs md:text-lg xl:text-xs cp"
                onClick={() => setShowAddresses(!showAddresses)}
              >
                {trimName(address, 40)}
              </p>

              {showAddresses ? (
                <MdOutlineKeyboardArrowUp
                  size={23}
                  className="cp text-[#666666]"
                  onClick={() => setShowAddresses(!showAddresses)}
                />
              ) : (
                <MdOutlineKeyboardArrowDown
                  size={23}
                  className="cp text-[#666666]"
                  onClick={() => setShowAddresses(!showAddresses)}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-row pt-2">
            <p className="text-sm md:text-xs text-[#666666]">
              please{" "}
              <span
                onClick={RedirectToLogin}
                className="text-[#F5AB35] underline cp"
              >
                login
              </span>{" "}
              get your delivery address
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavMobileSearchBar;

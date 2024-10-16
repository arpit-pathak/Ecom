import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CustomerRoutes } from "../../../../Routes";
import { FiUser } from "react-icons/fi";
import ls from "local-storage";
import { USER_TYPE } from "../../../../constants/general";

//images and icons
import ushopLogo from "../../../../assets/logo-orange.svg";
import { MdKeyboardBackspace, MdOutlinePhonelink } from "react-icons/md";
import {
  RiAccountBoxLine,
  RiCouponLine,
  RiHome4Line,
  RiShoppingBag2Line,
  RiShoppingBag2Fill,
} from "react-icons/ri";
import { BsHeart } from "react-icons/bs";
import { useDispatch } from "react-redux";
import { setPrevUrl } from "../../../redux/reducers/prevUrlReducer";
import {
  PiCar,
  PiDressLight,
  PiForkKnifeLight,
  PiNotebookBold,
} from "react-icons/pi";
import { FaAngleRight } from "react-icons/fa6";
import { TbSofa } from "react-icons/tb";
import { CgGames } from "react-icons/cg";
import { BiBook } from "react-icons/bi";
import messageNavbar from "../../../../assets/msg-navbar-grey.svg";
import faqNavbar from "../../../../assets/faq_nav-grey.svg";
import cardBg from "../../../../assets/buyer/usercard-bg.svg";
import profileFace from "../../../../assets/buyer/profile-face-bear.svg";
import switchIcon from "../../../../assets/buyer/user-card-switch-icon.svg";
import { CommonApis } from "../../../../Utils";
import { ApiCalls } from "../../../../merchant/utils/ApiCalls";
import { toast } from "react-toastify";
import { setRetrieveProfile } from "../../../redux/reducers/profileReducer";
import { useSelector } from "react-redux";
import {
  setMainCategory,
  setMainCategoryID,
  setSubCategoryName,
} from "../../../redux/reducers/categoryReducer";
import { setActiveButton } from "../../../redux/reducers/AcountOverviewReducer";
import { AffiliateInfoModal } from "../../affiliateCommissions/AffiliateConstants";

const loggedInSideNavOptions = [
  {
    text: "Profile",
    link: CustomerRoutes.ViewProfile,
    imageIcon: <RiAccountBoxLine size={26} />,
  },
  {
    text: "My Orders",
    link: CustomerRoutes.ViewOrder.replace(":tab", "all"),
    imageIcon: <PiNotebookBold fontWeight={"bold"} size={26} />,
  },
  {
    text: "Vouchers",
    link: CustomerRoutes.ViewVoucher,
    imageIcon: <RiCouponLine size={26} />,
  },
];

const categoriesList = [
  {
    name: "Food & Beverage",
    imageIcon: <PiForkKnifeLight />,
  },
  {
    name: "Home & Care",
    imageIcon: <TbSofa />,
  },
  {
    name: "Style",
    imageIcon: <PiDressLight />,
  },
  {
    name: "To Relax",
    imageIcon: <CgGames />,
  },
  {
    name: "Electronics",
    imageIcon: <MdOutlinePhonelink />,
  },
  {
    name: "Bookstore",
    imageIcon: <BiBook />,
  },
  {
    name: "Automobiles",
    imageIcon: <PiCar />,
  },
];

const profileMenuList = [
  {
    name: "Personal Details",
    link: CustomerRoutes.ViewProfile,
  },
  {
    name: "Address Book",
    link: CustomerRoutes.addressBook,
  },
  {
    name: "Cashback Balance",
    link: CustomerRoutes.ViewCashback,
  },
  {
    name: "Affiliate Program",
    link: CustomerRoutes.AffiliateSignUp,
  },
];

const UserCard = ({ user }) => {
  const username = user?.username?.split(" ")[0] || "";
  const userEmail = user?.email || "";
  return (
    <div
      className="w-full h-[90px] md:h-[168px] mb-2 rounded-md bg-cover bg-center bg-no-repeat px-3"
      style={{
        backgroundImage: `url(${cardBg})`,
      }}
    >
      <div className="flex flex-row justify-between">
        <div className="flex flex-row items-center gap-2 pt-4 md:pt-6 pl-2 md:pl-3">
          <img src={profileFace} alt="profile-img" className="md:w-[64px]" />
          <div className="flex flex-col gap-[2px]">
            <p className="font-medium text-xs md:text-xl">{username}</p>
            <p className="text-xs leading-3 md:text-lg text-[#605442]">
              {userEmail}
            </p>
          </div>
        </div>

        <img src={switchIcon} alt="switch-icon" className="md:w-[26px]" />
      </div>

      <button className="bg-[#FDBD5E] flex flex-row mt-3 ml-12 md:ml-[82px] items-center px-2 py-[3.5px] gap-1 rounded-sm">
        <RiShoppingBag2Fill className="text-white w-[10px] h-3 md:w-[18px] md:h-[20px]" />
        <p className="text-xs leading-3 md:text-lg text-white font-normal">
          Shopper
        </p>
      </button>
    </div>
  );
};

const NavMobileSideBar = ({
  handleWishlistClick,
  cartQuantity,
  user,
  setUser,
  setUserType,
  showMobileSideBar,
  setShowMobileSideBar,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAffiliate = ls("isAffiliate");
  const isAffiliateNameAvailable = ls("isAffiliateNameAvailable");
  const promoPlatforms = ls("promoPlatforms");
  const acessToken = JSON.parse(localStorage.getItem("customer"));
  const [pageIdx, setPageIdx] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategoryData, setSelectedCategoryData] = useState([]);
  const [currPage, setCurrPage] = useState("");
  const [ProfileMenu, setProfileMenu] = useState([]);
  const [affiliateShowModal, setAffiliateShowModal] = useState(false);
  const categoryGroups = useSelector((state) => state.category.categoryGroups);
  const categories = useSelector((state) => state.category.categories);

  const rightArrowStyles = "text-[#999999] text-[19px]";

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
    // setHasChatNotification(false);
    const newTab = window.open(CustomerRoutes.ChatScreen, "_blank");
    if (newTab) newTab.focus();
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

  const handleBackButton = () => {
    if (pageIdx === 1) {
      setShowMobileSideBar((prev) => !prev);
    } else {
      setSelectedCategory("");
      setCurrPage("");
      setPageIdx((prev) => prev - 1);
    }
  };

  const handleGroupClick = (selectedCat) => {
    setPageIdx((prev) => prev + 1);
    setSelectedCategory(selectedCat);
    setCurrPage("categories");

    const selectedCategoryObjectGroup = categoryGroups.find(
      (category) => category.category_group === selectedCat
    );

    const matchedCategories = selectedCategoryObjectGroup.category
      .map((cat) => categories.filter((c) => c.slug === cat.slug))
      .flat();

    if (matchedCategories) {
      setSelectedCategoryData(matchedCategories);
    } else {
      setSelectedCategoryData([]);
    }
  };

  useEffect(() => {
    let items = [...profileMenuList];
    if (isAffiliate) {
      items[3] = {
        name: "Affiliate Programme",
        link: CustomerRoutes.ViewAffiliateCommissions,
      };
    } else {
      items[3] = {
        name: "Affiliate Programme",
        link: CustomerRoutes.AffiliateSignUp,
        state: {
          platformLinks: promoPlatforms,
        },
      };
    }
    setProfileMenu([...items]);
  }, [isAffiliate, promoPlatforms]);

  return (
    <div
      className={`fixed top-0 left-0 h-full w-[80%] max-w-[500px] bg-white shadow-lg z-50 transition-transform duration-300 transform ${
        showMobileSideBar ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {affiliateShowModal && (
        <AffiliateInfoModal
          showModal={affiliateShowModal}
          setShowModal={setAffiliateShowModal}
        />
      )}

      {/* top section */}
      <div
        className={`flex flex-row items-center justify-start mt-2 mb-3 px-4 py-2 ${
          pageIdx > 1 ? "border-b border-[#EFEFEF]" : ""
        }`}
      >
        <MdKeyboardBackspace
          size={22}
          className="md:w-[28px]"
          onClick={handleBackButton}
        />

        {currPage === "" ? (
          <Link to={CustomerRoutes.Landing}>
            <img
              src={ushopLogo}
              alt="ushop-logo"
              className="w-[104px] h-[26px] md:w-[160px] md:h-[54px] lg:h-min"
            />
          </Link>
        ) : currPage === "categories" ? (
          <p className="text-lg md:text-2xl text-black ml-2">
            {selectedCategory}
          </p>
        ) : currPage === "profile" ? (
          <p className="text-lg md:text-2xl text-black ml-2">Profile</p>
        ) : null}
      </div>

      {/* middle section */}
      <div className="flex-1 overflow-y-auto max-h-[80vh]">
        {pageIdx === 1 && (
          <div className="px-4">
            {user ? (
              <UserCard user={user} />
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <p className="font-semibold text-base md:text-3xl">
                  Hi, Sign up for account and get more benefits
                </p>

                <Link
                  to={CustomerRoutes.SignUp}
                  className="text-black font-semibold bg-[#F5AB35] flex items-center rounded justify-center py-3 md:py-5 cp"
                >
                  <p className="whitespace-nowrap text-sm md:text-2xl">
                    Sign Up
                  </p>
                </Link>

                <Link
                  to={CustomerRoutes.Login}
                  className="text-[#F5AB35] hover:text-white  bg-white hover:bg-[#F5AB35] border border-[#F5AB35] flex items-center justify-center rounded py-3 md:py-5 cp"
                >
                  <p className="whitespace-nowrap text-sm md:text-2xl">login</p>
                </Link>
              </div>
            )}
            {/* menu options */}
            <div className="flex flex-col">
              {user &&
                loggedInSideNavOptions.map((item, idx) => (
                  <div
                    key={`${item.text}-${idx}`}
                    className="flex justify-between px-2 py-[9px] md:py-3"
                    onClick={() => {
                      if (item.text === "Profile") {
                        setCurrPage("profile");
                        setPageIdx((prev) => prev + 1);
                      } else {
                        navigate(item.link);
                        setShowMobileSideBar((prev) => !prev);
                      }
                    }}
                  >
                    <div className="flex flex-row gap-3 items-center">
                      <span className="w-[20px] md:w-[26px] text-[#666666]">
                        {item.imageIcon}
                      </span>
                      <span className="text-xs leading-5 md:text-lg text-black">
                        {item.text}
                      </span>
                    </div>
                    <FaAngleRight className={`${rightArrowStyles}`} />
                  </div>
                ))}

              <div>
                {/* others section */}
                <div className="flex flex-col">
                  <p className="text-xs md:text-lg font-medium px-2 py-[10px] text-[#666666]">
                    {"Others"}
                  </p>
                  <div className="flex flex-col">
                    <div
                      className="flex justify-between px-2 py-3 w-full"
                      onClick={openChat}
                    >
                      <div className="flex flex-row gap-2 md:gap-3">
                        <img
                          src={messageNavbar}
                          alt="message-icon"
                          className="text-[#666666] md:w-[26px] md:h-[26px]"
                        />
                        <p className="text-xs leading-5 md:text-lg text-black">
                          {"Message"}
                        </p>
                      </div>
                      <FaAngleRight className={`${rightArrowStyles}`} />
                    </div>

                    <Link
                      className="flex justify-between px-2 py-3 w-full"
                      to={CustomerRoutes.Help.replace(":tab", "contact-us")}
                      target="_blank"
                    >
                      <div className="flex flex-row gap-2 md:gap-3">
                        <img
                          src={faqNavbar}
                          alt="message-icon"
                          className="text-[#666666] md:w-[26px] md:h-[26px]"
                        />
                        <p className="text-xs leading-5 md:text-lg text-black">
                          {"Help"}
                        </p>
                      </div>
                      <FaAngleRight className={`${rightArrowStyles}`} />
                    </Link>
                  </div>
                </div>

                {/* categories section */}
                <div>
                  <p className="text-xs md:text-lg font-medium px-2 py-[10px] text-[#666666]">
                    {"Categories"}
                  </p>
                  {categoriesList.map((item, idx) => (
                    <div className="flex flex-col">
                      <div
                        className="flex justify-between px-2 py-3 w-full"
                        onClick={() => handleGroupClick(item.name)}
                      >
                        <div className="flex flex-row gap-2">
                          <div className="text-[#666666] md:text-[21px]">
                            {item.imageIcon}
                          </div>
                          <p className="text-xs leading-5 md:text-lg text-black">
                            {item.name}
                          </p>
                        </div>
                        <FaAngleRight className={`${rightArrowStyles}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {pageIdx === 2 && currPage === "categories" && (
          <div className="flex flex-col px-4">
            {selectedCategoryData.map((category) => (
              <div key={category.id_category}>
                <div
                  className="text-[#666666] text-base px-2 py-[10px]"
                  onClick={() => {
                    dispatch(setMainCategoryID(category?.id_category));
                    dispatch(setMainCategory(category?.name));
                    dispatch(setSubCategoryName(category?.name));
                    setShowMobileSideBar((prev) => !prev);
                    navigate(
                      CustomerRoutes.CategoryProductListing +
                        category?.slug +
                        "/"
                    );
                  }}
                >
                  {category.name}
                </div>

                {category.child.map((item, itemIndex) => (
                  <div className="flex flex-col" key={`sub-cat-${itemIndex}`}>
                    <div
                      className="flex justify-between px-2 py-3 w-full"
                      onClick={() => {
                        dispatch(setMainCategoryID(item?.id_category));
                        dispatch(setMainCategory(item?.name));
                        dispatch(setSubCategoryName(item?.name));
                        setShowMobileSideBar((prev) => !prev);
                        navigate(
                          CustomerRoutes.CategoryProductListing +
                            item.slug +
                            "/"
                        );
                      }}
                    >
                      <p className="text-xs leading-5 text-[#333333]">
                        {item.name}
                      </p>
                      <FaAngleRight className={`${rightArrowStyles}`} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {pageIdx === 2 && currPage === "profile" && (
          <div className="flex flex-col px-4">
            {ProfileMenu.map((item, itemIndex) => (
              <div className="flex flex-col" key={`sub-cat-${itemIndex}`}>
                <div
                  className="flex justify-between px-2 py-3 w-full"
                  onClick={() => {
                    if (
                      item.name === "Affiliate Programme" &&
                      !isAffiliateNameAvailable
                    ) {
                      setAffiliateShowModal(true);
                    } else {
                      dispatch(setActiveButton("Personal Details"));
                      navigate(item.link, { state: item?.state });
                    }
                    setShowMobileSideBar((prev) => !prev);
                  }}
                >
                  <p className="text-xs leading-5 text-[#333333]">
                    {item.name}
                  </p>
                  <FaAngleRight className={`${rightArrowStyles}`} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="absolute flex flex-col gap-2 z-10 bottom-0 w-full bg-white border-t border-[#DADADA] p-2">
        <div className="flex flex-row items-center justify-around border-b border-[#DADADA] py-2">
          <div
            className="flex flex-col items-center justify-center cp text-[#333333] h-fit"
            onClick={() => navigate(CustomerRoutes.Landing)}
          >
            <RiHome4Line className="w-[28px] h-[28px]" />
          </div>
          <div
            className="flex flex-col items-center justify-center cp text-[#333333] h-fit"
            onClick={handleWishlistClick}
          >
            <BsHeart className="w-[27px] h-[27px]" />
          </div>

          <Link
            to={CustomerRoutes.MyCart}
            onClick={() => dispatch(setPrevUrl(CustomerRoutes.MyCart))}
            className="flex flex-col items-center relative cp text-[#333333] h-fit"
          >
            <RiShoppingBag2Line className="w-[28px] h-[28px]" />
            <div className="absolute top-0 right-0 bg-[#FF5E2B] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center -mt-2 -mr-1">
              {cartQuantity}
            </div>
          </Link>

          <div
            className="flex flex-col items-center justify-center cp text-[#333333] h-fit mr-1"
            onClick={() => navigate(CustomerRoutes.ViewProfile)}
          >
            <FiUser className="w-[28px] h-[28px]" />
          </div>
        </div>

        {user && (
          <div
            className="cp w-full text-center text-[#FC3301] text-sm py-2 font-medium"
            onClick={() => {
              handleLogOut();
              navigate(CustomerRoutes.Landing);
            }}
          >
            Logout
          </div>
        )}
      </div>
    </div>
  );
};

export default NavMobileSideBar;

import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ReactDom from "react-dom";
import { CustomerRoutes } from "../../Routes";
import { useDispatch } from "react-redux";
import { BuyerApiCalls, Apis } from "../utils/ApiCalls";
import {
  setCartItems,
  retrieveCartQuantity,
} from "../redux/reducers/cartReducer";
//css
import "../../css/customer.css";
import ls from "local-storage";
import { toggleSideBar } from "../utils/ToggleSideBar";
 //icons
import ushopWhiteIcon from "../../assets/logo-white.svg";
import { FaUserCircle, FaClipboardList } from "react-icons/fa";
import {
  BsChatLeftText,
  BsHeart,
  BsArrowRight,
  BsChevronRight,
  BsStarFill,
} from "react-icons/bs";
import {
  MdArrowForwardIos,
  MdMobileScreenShare,
} from "react-icons/md";
import { ImCross } from "react-icons/im";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FaTrash } from "react-icons/fa";
import { AiFillWarning } from "react-icons/ai";
import { BiSearch } from "react-icons/bi";
import { debounce } from "../utils/Script";

//images
import Logo from "../../assets/logo-white.svg";
import LogoAlt from "../../assets/logo-orange.svg";
import successGif from "../../assets/success.gif";
import { toast } from "react-toastify";

export function Modal({ open, children, width, height }) {
  if (!open) return null;

  return ReactDom.createPortal(
    <div>
      {/* fixed inset-0 will fill up entire screen */}
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-500 bg-opacity-50">
        <div className={`${width && width} ${height && height} max-w-[800px] bg-white p-6 rounded-[4px] overflow-y-auto`}>
          {children}
        </div>
      </div>
    </div>,

    document.getElementById("portal")
  );
}

export function ConfirmationPopUp({ close }) {
  const dispatch = useDispatch();
  const clearCart = () => {
    const formData = new FormData();
    let cart_unique_id = localStorage.getItem("cart_unique_id")
    formData.append("cart_unique_id", cart_unique_id);
    BuyerApiCalls(formData, Apis.clearCart, "POST", {}, processRes);
  };

  const processRes = (res, api) => {
    if (api === Apis.clearCart) {
      if(res.data.result === "SUCCESS"){
        dispatch(setCartItems({}));
        dispatch(retrieveCartQuantity());
        close();
      } else {
        toast.error(res.data.message)
      }
    }
  };

  return (
    <div>
      <div className=" flex justify-between mb-4">
        <div className="inline font-bold text-xl"></div>
        <button type="button" className="inline" onClick={close}>
          <ImCross></ImCross>
        </button>
      </div>
      <div className="flex flex-col gap-8">
        <p>Do you want to delete all the items?</p>
        <div className="flex justify-evenly">
          <button
            className="bg-white border border-slate-400 px-2 py-1 rounded hover:bg-slate-100"
            onClick={close}
          >
            Cancel
          </button>
          <button
            className="bg-red-400 px-2 py-1 rounded hover:bg-red-500 text-white"
            onClick={() => clearCart()}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}



export function PopUpComponent({ message, open, close, result, link }) {
  if (!open) return null;
  return ReactDom.createPortal(
    <div>
      <div className="fixed z-50 h-fit rounded-lg w-4/5 md:w-1/3 p-[20px] top-[150px] bg-white rounded-12 min-h-200 left-0 right-0 mx-auto text-center shadow-lg shadow-grey-500/50 animate__animated animate__bounceIn">
        <div className="flex justify-end mb-4 p-0 ">
          <button className="inline" onClick={close}>
            <ImCross></ImCross>
          </button>
        </div>
        {result === "success" && (
          <img src={successGif} alt="" className="modal-icon" />
        )}
        {result === "error" && <AiFillWarning className="modal-icon" />}

        {message != null && <div className="popmsg">{message}</div>}
        {link && (
          <Link className="mt-2" to={link.link}>
            click here to {link.label}
          </Link>
        )}
      </div>
    </div>,
    document.getElementById("portal")
  );
}

//sidebar checkbox filter
export function CheckBox({
  shippingOptions,
  selectedShipping,
  setSelectedShipping,
  addToFilterData,
  selectedBrand,
  brandOptions,
  setSelectedBrand,
  isMobile
}) {
  const handleCheckboxChange = (event, id) => {
    //check if true or false
    let isChecked = event.target.checked;
    if (isChecked) {
      if (selectedShipping === "") {
        selectedShipping += id.toString();
      } else {
        selectedShipping += `,${id.toString()}`;
      }
    } else {
      //delete the character + the comma behind it (if is first character)
      if (selectedShipping.indexOf(id.toString()) === 0) {
        selectedShipping = selectedShipping.replace(
          new RegExp(`${id.toString()},?`),
          ""
        );
        //else delete character + comma infront of it
      } else {
        selectedShipping = selectedShipping.replace(
          new RegExp(`,?${id.toString()}`),
          ""
        );
      }
    }
    console.log("selected shipping: ", selectedShipping);
    setSelectedShipping(selectedShipping);
    if(!isMobile) addToFilterData("shipping_id", selectedShipping);
  };

  const handleBrandSelection = (event, id) => {
    //check if true or false
    let isChecked = event.target.checked;
    if (isChecked) {
      if (selectedBrand === "") {
        selectedBrand += id.toString();
      } else {
        selectedBrand += `,${id.toString()}`;
      }
    } else {
      //delete the character + the comma behind it (if is first character)
      if (selectedBrand.indexOf(id.toString()) === 0) {
        selectedBrand = selectedBrand.replace(
          new RegExp(`${id.toString()},?`),
          ""
        );
        //else delete character + comma infront of it
      } else {
        selectedBrand = selectedBrand.replace(
          new RegExp(`,?${id.toString()}`),
          ""
        );
      }
    }
    console.log("selected brand: ", selectedBrand);
    setSelectedBrand(selectedBrand);
    if(!isMobile) addToFilterData("brand_id", selectedBrand);
  };


  return (
    <div className="flex flex-col gap-[8px] font-poppins font-normal text-sm leading-5 text-gray-600">
      {shippingOptions
        ? shippingOptions?.map((item, index) => (
          <label key={index} className="flex gap-[10px]">
            <input
              type="checkbox"
              name="shippingCheckBox"
              defaultChecked={
                selectedShipping?.indexOf(item.id_shipping_option) > -1
                  ? true
                  : false
              }
              onChange={(e) =>
                handleCheckboxChange(e, item.id_shipping_option)
              }
            />
            {item.name}
          </label>
        ))
        : null}

      {brandOptions
        ? brandOptions?.map((item, index) => (
          <label key={index}>
            <input type="checkbox"
              name="brandCheckBox"
              defaultChecked={
                selectedBrand?.indexOf(item.id_brand_collection) > -1
                  ? true
                  : false
              }
              onChange={(e) => {
                console.log(item)
                handleBrandSelection(e, item.id_brand_collection)
              }
              } />
            {" " + item.name}
          </label>
        ))
        : null}
    </div>
  );
}

export function LogoNav() {
  return (
    <div className="z-10 px-10 py-10">
      <Link
        to={CustomerRoutes.Landing}
        className="logo animate__animated animate__fadeInLeft"
      >
        <div className="logo-alt animate__animated animate__fadeInLeft">
          <img src={Logo} alt={LogoAlt} />
        </div>
      </Link>
    </div>
  );
}

export function CategoryNavTree({ layers }) {

  const setFromUrl = (category_id) => {
    sessionStorage.setItem("fromUrl", category_id);
  };

  return (
    <div className="hidden px-4 md:px-[80px] gap-[10px] bg-white py-4 space-x-1 items-center md:flex md:flex-row ">
      <Link className="text-black" to={CustomerRoutes.Landing}>
        Home
      </Link>

      {layers?.map((layer, index) => {
        const isLastElement = index === layers.length - 1;
        return (
          <div key={index}>
            <FontAwesomeIcon className="w-[10px] pr-4" icon={faChevronRight} />
            {isLastElement ? (
              <span>{layer["name"]}</span>
            ) : (
              <Link
                className="text-black"
                to={CustomerRoutes.CategoryProductListing + layer["slug"]+"/"}
                onClick={() => setFromUrl(layer.id_category, layer.name)}
              >
                {layer["name"]}
              </Link>
            )}
          </div>
        );

        // <p>{layers[layer]}</p>;
      })}
    </div>
  );
}

//footer links banner
export function HeaderBanner(props) {
  return (
    <div className="relative h-full">
      <img src={props.image} className="object-fit w-screen" alt="" />
      <p className="absolute text-4xl md:text-7xl  font-bold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
        {props.firstText}{" "}
        <span className="text-amber-400">{props.secondText}</span>
      </p>
    </div>
  );
}

//landing page below banner
export function AdBannerSm({ banners, title }) {
  return (
    <>
      {banners.length > 0
        ? banners.map((item, index) =>
          item.title.toLowerCase() === title ? (
            <div
              key={index}
              className="flex flex-col items-center justify-center"
            >
              <img src={item.image_url} alt={item.title} className="w-full" />
            </div>
          ) : null
        )
        : null}
    </>
  );
}

//customer review & feedback rating bar
export function RatingBar({ index, reviewTotal, reviewCounts }) {
  const percentage = (parseFloat(`${reviewCounts}`) / parseFloat(`${reviewTotal}`));
  return (
    <div className="flex space-x-[12px] items-center w-[200px] sm:w-[285px] h-[24px]">
      <div className="w-[9px]">
        <p>{index}</p>
      </div>

      <BsStarFill className="text-yellow-300" size={14}></BsStarFill>
      <div className="bg-gray-200 h-2 w-[200px] rounded-md">

        <div
          className={`bg-green-400 h-2 ${percentage === 0 ? 'w-0' : `w-[${(percentage * 100)}%]`}  rounded-md`}
        ></div>

      </div>
      <p className="text-slate-300">{reviewCounts}</p>
    </div>
  );
}

export function DiscountLabel(props) {
  return (
    <p className="bg-red-400 p-2 justify-center items-center text-white text-base rounded-xl">
      {props.discount}% OFF
    </p>
  );
}

export function ChatIcon() {
  return (
    <div className="flex flex-row items-center space-x-2 text-amber-400">
      <BsChatLeftText />
      <p>Chat</p>
    </div>
  );
}

export function SaveForLaterIcon() {
  return (
    <div className="flex flex-row items-center px-7 text-white text-[12px] font-medium leading-[18px] gap-2 ">
      <BsHeart className="" />
      <p className="w-max text-white">Save for later</p>
    </div>
  );
}

//edit div to button
export function SaveForLaterButton() {
  return (
    <button className="flex items-center justify-center gap-2 py-2 w-40 text-black ">
      <BsHeart className="text-black" />
      Save for later
    </button>
  );
}

export function RemoveButton() {
  return (
    <button className="flex flex-1 items-center gap-2 w-40 text-red-500 h-full">
      <FaTrash className="w-6 h-6" />
      Remove
    </button>
  );
}

export function OrangeButton(props) {
  return (
    <Link
      to={CustomerRoutes.CheckOutCart}
      className="py-2 px-5 uppercase  text-white text-[16px] font-medium bg-darkOrange rounded-[4px]"
    >
      {props.text}
    </Link>
  );
}

export function WhiteButton(props) {
  return (
    <Link
      href=""
      className=" py-2 px-5 uppercase border border-gray-400 rounded-md"
    >
      {props.text}
    </Link>
  );
}

export function FaqItem(props) {
  return (
    <Link
      href=""
      className="flex flex-col py-5 border-b items-start capitalize  hover:text-amber-500"
    >
      <p>{props.text}</p>
    </Link>
  );
}

export function HorizontalDivider(customKey) {
  return <div className="flex-grow border-t font-bold border-gray-200"></div>;
}

export function HorizontalDottedDivider() {
  return (
    <div className="flex-grow border-t border-dotted border-2 border-gray-200"></div>
  );
}

export function GraySearchBar({ placeholder, onSearchChange }) {
  const debouncedSearchChange = debounce(onSearchChange);

  return (
    <div className="flex flex-row px-2 items-center border rounded-lg bg-gray-100 text-gray-500 border-gray-400 space-x-2 w-1/5">
      <BiSearch className="w-5 h-5" />
      <input
        type="text"
        placeholder={placeholder}
        className="bg-gray-100 h-full w-full rounded-lg"
        onChange={(e) => {
          debouncedSearchChange(e.target.value);
        }}
      />
    </div>
  );
}

export function BlogThumbNail(props) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col h-full border shadow-lg rounded-md cp" 
      onClick={()=>navigate(CustomerRoutes.UshopBlogsArticle.replace(":slug", props.slug))}>
      <div className="relative">
        <img
          src={props.img}
          className="w-full"
          alt={props.slug}
          loading="lazy"
        />
        <p className="absolute capitalize text-white text-xl bg-red-600 bottom-5 px-4 left-0 font-bold transform -translate-x-0 -translate-y-0 ">
          {props.tag}
        </p>
      </div>
      <div className="flex flex-col p-4 space-y-2">
        <div className="flex flex-row space-x-2 justify-between">
          <p className=" ">{props.title}</p>
          <p className="text-gray-400 w-max">{props.date}</p>
        </div>
        <div
          className="flex flex-row items-center text-amber-500 space-x-2 font-bold"
        >
          <p>Read More</p> <BsArrowRight className="mt-1" />
        </div>
      </div>
    </div>
  );
}
export function OrangeHyperlink(props) {
  return (
    <Link
      to={props.link}
      className="flex flex-row items-center space-x-1 text-amber-500 font-bold capitalize"
    >
      <p>{props.text}</p>
      <BsChevronRight />
    </Link>
  );
}

export function PageNavigator({ pageCount, currentPage, onPageChange }) {
  const handlePageClick = (page) => {
    onPageChange(page);
  };

  const pageIndicators = [];

  for (let page = 1; page <= pageCount; page++) {
    const isSelected = page === currentPage;
    const indicatorClass = isSelected ? "bg-amber-400" : "bg-gray-200";

    pageIndicators.push(
      <div
        key={page}
        className={`flex h-10 w-10 items-center justify-center rounded-xl ${indicatorClass} cursor-pointer`}
        onClick={() => handlePageClick(page)}
      >
        {page}
      </div>
      //  <div className="flex h-10 w-10 items-center justify-center bg-gray-200 rounded-xl">
      //   ...
      // </div>
    );
  }

  return (
    <div className="flex flex-row justify-center">
      <div className="flex flex-row space-x-2">
        {pageIndicators}
        <div
          className="flex h-10 w-10 items-center justify-center bg-gray-200 rounded-xl cursor-pointer"
          onClick={() => handlePageClick(currentPage + 1)}
        >
          Next
        </div>
      </div>
    </div>
  );
}

export function ArticleThumbnail(props) {
  return (
    <div className="flex flex-col  space-y-5">
      <p className="text-xl">{props.title} </p>
      <div className="flex flex-row space-x-10">
        <p className="text-gray-500 capitalize">{props.date}</p>
        <a
          href={CustomerRoutes.UshopBlogs + props.slug+"/"}
          className="flex flex-row items-center text-amber-500 space-x-2 font-bold"
        >
          <p>Read More</p> <BsArrowRight className="mt-1" />
        </a>
      </div>
    </div>
  );
}

export function ArticleImageThumbnail(props) {
  return (
    <div className="flex flex-col space-y-5 border shadow-lg">
      <img src={props.img} alt={props.slug} loading="lazy" />

      <div className="flex flex-col p-4 space-y-2">
        <div className="flex flex-row space-x-2 justify-between">
          <p className=" ">{props.title}</p>
          <p className="text-gray-400 w-max">{props.date}</p>
        </div>
        <a
          href={CustomerRoutes.UshopBlogsArticle.replace(":slug",props.slug)}
          className="flex flex-row items-center text-amber-500 space-x-2 font-bold"
        >
          <p>Read More</p> <BsArrowRight className="mt-1" />
        </a>
      </div>
    </div>
  );
}

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export const SideNav = () => {
  const iconCss = "w-5 text-[#F5AB35] mr-3";
  const menus = [
    {
      title: "Profile",
      childMenus: [],
      icon: <FaUserCircle className={iconCss} />,
      url: CustomerRoutes.ViewProfile,
    },
    {
      title: "My Orders",
      childMenus: [],
      icon: <FaClipboardList className={iconCss} />,
      url: CustomerRoutes.ViewOrder.replace(":tab", "all"),
    },
    // {
    //   title: "Chat & Support",
    //   childMenus: [],
    //   icon: <MdHeadset className={iconCss} />,
    //   url: CustomerRoutes.GeneralEnquiry,
    // },
    // {
    //   title: "Help",
    //   childMenus: [],
    //   icon: <MdHelpOutline className={iconCss} />,
    //   url: "/",
    // },
    // {
    //   title: "Seller Centre",
    //   childMenus: [],
    //   icon: <HiOutlineGlobeAlt className={iconCss} />,
    //   url: CustomerRoutes.BecomeSeller,
    // },
    // {
    //   title: "Sell On Ushop",
    //   childMenus: [],
    //   icon: <FiTag className={iconCss} />,
    //   url: MerchantRoutes.MerchantRegister,
    // },
    // {
    //   title: "Logout",
    //   childMenus: [],
    //   icon: <MdMobileScreenShare className={iconCss} />,
    //   url: CustomerRoutes.Landing,
    // },
  ];

  const handleLogOut = () => {
    ls.remove("loggedUser");
    localStorage.removeItem("customer");
    toggleSideBar()
    window.location.reload()
  };

  return (
    <div id="mobile-sidebar">
      <div className="sidenav">
        {/*logo section*/}
        <div id="sidenavHeader" className="px-4 py-5">
          <Link to={CustomerRoutes.Landing} className="mt-5 block">
            <img src={ushopWhiteIcon} alt="" className=" h-10 lg:h-min" />
          </Link>
        </div>

        <ul className=" min-w-[400px] w-full py-4">
          {menus.map((item, index) => (
            <li
              key={index}
              className="flex flex-row items-center text-[16px] text-black mb-4 px-4"
            >
              {item.icon}
              <Link to={item.url} className="flex-1 text-black">
                {item.title}
              </Link>
              {item.childMenus.length > 0 && (
                <MdArrowForwardIos className="text-[#F5AB35]" />
              )}
            </li>
          ))}
          <div
            className="flex flex-row items-center text-[16px] text-black mb-4 px-4"
            onClick={handleLogOut}
          >
            <MdMobileScreenShare className="text-[#F5AB35]" />
            <p className="px-4 whitespace-nowrap ">Log Out</p>
          </div>
        </ul>
      </div>
      <div className="overlay" onClick={toggleSideBar}></div>
    </div>
  );
};

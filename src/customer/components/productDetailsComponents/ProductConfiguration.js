import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import ls from "local-storage";
import { Apis, BuyerApiCalls } from "../../utils/ApiCalls";
import instant from "../../../assets/buyer/deliveryOptionIcon1.png";
import sameday from "../../../assets/buyer/deliveryOptionIcon2.png";
import nextday from "../../../assets/buyer/deliveryOptionIcon3.png";
import { CustomerRoutes } from "../../../Routes";
import { useSelector, useDispatch } from "react-redux";
import { setWhichForm } from "../../redux/reducers/addressReducer";
import RedeemUshopVoucher from "../formComponents/modalForms/RedeemVoucherForm";
import ProductReviewRating from "./ProductReviewRating";
import { Modal } from "../GenericComponents";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import parse from "html-react-parser";
import {
  PinterestIcon,
  PinterestShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import {
  setUnclaimedShopVouchers,
  setSellerID,
} from "../../redux/reducers/voucher";
import {
  retrieveCartQuantity,
  setCartItems,
} from "../../redux/reducers/cartReducer";
import PopupMessage from "../../../merchant/components/PopupMessage.js";
import SEOComponent from "../../../utils/seo.js";

import GroupBuyLabel from "../../../components/groupBuy/groupBuyLabel.js";

//components
import ProductSlider from "./ProductSlider";
import { CategoryNavTree, PopUpComponent } from "../GenericComponents";
import SellerInformation from "../sellerComponents/SellerInformation";

//icons
import { AiOutlineHeart, AiFillHeart, AiFillWechat } from "react-icons/ai";
import { BsHandbag } from "react-icons/bs";
//css
import "../../../css/customer.css";

//images
import percentageIcon from "../../../assets/buyer/percentageIcon.png";
import { PageLoader } from "../../../utils/loader.js";
import { USER_TYPE } from "../../../constants/general";
import PromptLoginPopup from "../../utils/PromptLoginPopup";
import ScrollingProductList from "./scrollingProductList.js";
import GroupBuyPopup from "../groupBuyComponents/groupBuyPopup.js";
import { toast } from "react-toastify";
import { setPrevUrl } from "../../redux/reducers/prevUrlReducer.js";
import MobGroupBuyLabel from "../../../components/groupBuy/mobGroupBuyLabel.js";

function ProductConfiguration() {
  const shopVouchers = useSelector(
    (state) => state.voucher.unclaimedShopVouchers
  );
  const user = JSON.parse(localStorage.getItem("customer"));
  const dispatch = useDispatch();
  const [productDetail, setProductDetail] = useState();

  // const [rating, setRating] = useState("");
  const { slug } = useParams();
  const navigate = useNavigate();

  const [variation1Id, setVariation1Id] = useState(null);
  const [activeVariationButton1, setactiveVariationButton1] = useState(null);
  const [variation2Id, setVariation2Id] = useState(null);
  const [variation2Value, setVariation2Value] = useState(null);
  const [activeVariationButton2, setactiveVariationButton2] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [layers, setLayers] = useState(null);
  // const [defaultPrice, setDefaultPrice] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [popUpMessage, setPopUpMessage] = useState(null);
  const [popUpIcon, setPopUpIcon] = useState(null);

  const [addedToWishlist, setAddedToWishlist] = useState(false);
  const [wishlistCounts, setWishlistCounts] = useState(0);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  //sold out feature
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [openNotify, setOpenNotify] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [mailErr, setMailErr] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  //group buy feature
  const [groupBuyDetail, setGroupBuyDetail] = useState({});
  const [showGroupBuyPopup, setShowGroupBuyPopup] = useState(false);
  const [isVariationInGroupBuy, setIsVariationInGroupBuy] = useState(false);

  const [navigateTo, setNavigateTo] = useState("");

  //this is to reinitialize data when the same component is loaded for different product (from same shop/related products section)
  const reinitializeData = () => {
    setQuantity(1);
    setShowGroupBuyPopup(false);
    setIsVariationInGroupBuy(false);
    setactiveVariationButton2(null);
    setVariation2Value(null);
    setVariation2Id(null);
  };

  //fetch product
  useEffect(() => {
    reinitializeData();
    let formData = new FormData();

    if (window.location.href.includes("product")) {
      setIsPageLoading(true);
      let endPoint = Apis.productDetail + "?product_slug=" + slug;
      BuyerApiCalls(
        formData,
        endPoint,
        "GET",
        user
          ? {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${user.access}`,
            }
          : {},
        processRes
      );
    }

    if (window.location.href.includes("preview")) {
      setIsPageLoading(true);
      const productID = localStorage.getItem("productID");
      if (productID) {
        let user = ls("user");
        if (user) user = JSON.parse(user);
        BuyerApiCalls(
          null,
          Apis.product + productID + "/",
          "POST",
          user
            ? {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${user.access}`,
              }
            : {},
          processRes
        );
      }
    }
  }, [slug]);

  useEffect(() => {
    priceHandler();
  }, [variation1Id, variation2Value, productDetail]);

  const processRes = (res, api) => {
    if (api.includes(Apis.product)) {
      setProductDetail(res?.data?.data);
      setLayers(res?.data?.data?.categories);
      setActiveImage(res?.data?.data.image_media[0]?.img);

      let rdata = res?.data?.data;
      if (rdata?.variations.length > 0) {
        let result = rdata?.variations.find(
          (variation) =>
            variation.parent_id === null && variation.variation_id !== null
        );
        if (result) {
          setactiveVariationButton1(result?.id_product_variation);
          setVariation1Id(result?.id_product_variation);
          setActiveImage(result?.image[0]?.img);
          setCurrentStock(result?.stock);

          if (result?.child.length > 0) {
            setactiveVariationButton2(result?.child[0]?.variation_value);
            setVariation2Id(result?.child[0]?.id_product_variation);
            setVariation2Value(result?.child[0]?.variation_value);
            setActiveImage(result?.child[0]?.image[0]?.img);
            setCurrentStock(result?.child[0].stock);
          }
        }
      }
      dispatch(setSellerID(res.data.data.seller.seller_id));
      setIsPageLoading(false);

      return;
    }
    if (api === Apis.addToWishlist) {
      setWishlistCounts(res.data.data.total_wishlist_count);
      setAddedToWishlist(true);
      return;
    }
    if (api === Apis.removeFromWishlist) {
      setWishlistCounts(res.data.data.total_wishlist_count);
      setAddedToWishlist(false);
      return;
    }
    if (api.includes(Apis.productDetail)) {
      if (res.data) {
        setIsPageLoading(false);
        let actualData = res.data.data?.product;
        setProductDetail(actualData);
        let groupBuy = res.data.data?.product_group_buy_detail;
        setGroupBuyDetail(groupBuy);
        setWishlistCounts(actualData.wishlist_count);
        setActiveImage(actualData.image_media[0]?.img);
        if (
          actualData.added_in_wishlist === "N" ||
          actualData.added_in_wishlist === "n"
        ) {
          setAddedToWishlist(false);
        } else {
          setAddedToWishlist(true);
        }

        setLayers(actualData.categories);

        if (actualData?.variations.length >= 1) {
          let result = null,
            childIndex = 0;
          if (actualData?.variations_option === "off") {
            result = actualData?.variations[0];
          } else {
            if (Object.keys(groupBuy).length > 0) {
              for (let i = 0; i < actualData?.variations.length; i++) {
                let currentVariation = actualData?.variations[i];
                if (
                  groupBuy?.active_variation.includes(
                    currentVariation?.id_product_variation
                  )
                ) {
                  result = currentVariation;
                  break;
                } else {
                  if (currentVariation?.child.length > 0) {
                    for (let j = 0; j < currentVariation?.child.length; j++) {
                      let currentChildVariation = currentVariation?.child[j];
                      if (
                        groupBuy?.active_variation.includes(
                          currentChildVariation?.id_product_variation
                        )
                      ) {
                        result = currentVariation;
                        childIndex = j;
                        break;
                      }
                    }
                  }
                }
              }
            }

            if (!result) {
              result = actualData?.variations.find(
                (variation) =>
                  variation.parent_id === null &&
                  variation.variation_id !== null
              );
            }
          }

          setactiveVariationButton1(result?.id_product_variation);
          setVariation1Id(result.id_product_variation);
          setActiveImage(result?.image[0]?.img);
          setCurrentStock(result?.stock);

          if (groupBuy?.active_variation?.includes(result.id_product_variation))
            setIsVariationInGroupBuy(true);

          if (result.child.length > 0) {
            setactiveVariationButton2(result.child[childIndex].variation_value);
            setVariation2Id(result.child[childIndex].id_product_variation);
            setVariation2Value(result.child[childIndex].variation_value);
            setCurrentStock(result?.child[childIndex]?.stock);

            setActiveImage(result.child[childIndex]?.image[0]?.img);
            setIsSoldOut(result.child[childIndex].stock > 0 ? false : true);
            if (
              groupBuy?.active_variation?.includes(
                result.child[childIndex].id_product_variation
              )
            )
              setIsVariationInGroupBuy(true);
          } else setIsSoldOut(result?.stock > 0 ? false : true);
        }

        dispatch(setSellerID(actualData.seller.seller_id));
        BuyerApiCalls(
          {},
          Apis.retrieveShopVoucher +
            "unclaimed/" +
            actualData.seller.seller_id +
            "/",
          "GET",
          {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.access}`,
          },
          processRes
        );
      }
      return;
    }
    if (api === Apis.retrieveCart) {
      const newCartItem = res.data.data.cart_item;
      if (newCartItem !== undefined) {
        dispatch(setCartItems(newCartItem));
        dispatch(retrieveCartQuantity());
      }
      return;
    }

    if (api === Apis.notifyProduct) {
      if (res.data.result === "FAIL") {
        setMailErr(res.data.message);
      } else {
        closeNotifyPopup();
        setIsSuccess(true);
        setSuccessData(res.data);

        setTimeout(() => {
          setIsSuccess(false);
          setSuccessData(null);
        }, 2000);
      }
    }

    if (api.includes(Apis.retrieveShopVoucher)) {
      if (
        res.data.result === "SUCCESS" &&
        res.data.message === "No voucher code found."
      ) {
        setUnclaimedShopVouchers(null);
      }
      if (res.data) {
        dispatch(setUnclaimedShopVouchers(res.data.data));
      }
    }

    setIsPageLoading(false);
    return;
  };

  const displayModalForms = () => {
    return (
      openModal && (
        <Modal open={openModal}>
          <RedeemUshopVoucher
            sellerId={productDetail["seller"]["seller_id"]}
            close={() => setOpenModal(false)}
            type="shop"
          ></RedeemUshopVoucher>
        </Modal>
      )
    );
  };

  const displayShareButtons = () => {
    return (
      <div className="flex gap-4 items-center">
        <p>Share</p>
        <WhatsappShareButton
          title="hey! Checkout this awesome product from uShop!"
          windowWidth="900"
          windowHeight="600"
          url={window.location.href}
        >
          <WhatsappIcon size={26} round={true} />
        </WhatsappShareButton>
        <TelegramShareButton
          title="hey! Checkout this awesome product from uShop!"
          url={window.location.href}
        >
          <TelegramIcon size={26} round={true}></TelegramIcon>
        </TelegramShareButton>
        <TwitterShareButton url={window.location.href}>
          <TwitterIcon size={26} round={true} />
        </TwitterShareButton>
        <PinterestShareButton
          url={window.location.href}
          media={window.location.href}
        >
          <PinterestIcon size={26} round={true}></PinterestIcon>
        </PinterestShareButton>
      </div>
    );
  };

  // {
  /*
    price logic
    1.if user never click anything, display the first variation price
    2.if user click on the first layer,
    2.1 if there is second layer , display and set the price as the first item of second layer
    2.2 if there is no second layer, set the price as the first layer
  */

  const favouriteHandler = () => {
    if (user) {
      const formData = new FormData();
      formData.append("id_product", productDetail?.id_product);
      formData.append(
        "id_product_variation",
        productDetail?.variations[0].id_product_variation
      );
      BuyerApiCalls(
        formData,
        addedToWishlist === true ? Apis.removeFromWishlist : Apis.addToWishlist,
        addedToWishlist === true ? "DELETE" : "POST",
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.access}`,
        },
        processRes
      );
    } else {
      setNavigateTo(CustomerRoutes.ProductDetails + slug + "/");
      dispatch(setPrevUrl(CustomerRoutes.ProductDetails + slug + "/"));
      setIsLoginPromptOpen(true);
    }
  };

  //if login, retrieve the cart id
  //else generate a unique cart id
  const addToCart = (type, qty, choice) => {
    var formData = new FormData();
    //get cart unique id from customer key in localstorage
    var cart_unique_id = localStorage.getItem("cart_unique_id");
    if (!cart_unique_id) {
      cart_unique_id = uuidv4();
      localStorage.setItem("cart_unique_id", cart_unique_id);
    }
    formData.append("cart_unique_id", cart_unique_id);
    formData.append("id_product", productDetail?.id_product);
    formData.append("quantity", qty ? qty : quantity);
    if (variation2Id) {
      formData.append("id_product_variation", variation2Id);
    } else if (variation1Id) {
      formData.append("id_product_variation", variation1Id);
    } else {
      formData.append(
        "id_product_variation",
        productDetail?.variations[0]?.id_product_variation
      );
    }

    if (choice !== 1 && type === "groupBuy")
      formData.append(
        "product_group_buy_id ",
        groupBuyDetail?.id_product_group_buy
      );

    BuyerApiCalls(
      formData,
      Apis.addToCart,
      "POST",
      user
        ? {
            Authorization: `Bearer ${user?.access}`,
          }
        : {},
      async (res, api) => {
        if (type !== "groupBuy") {
          setIsOpen(true);
          setTimeout(() => setIsOpen(false), 3000);
        }
        if (res.data.result === "SUCCESS") {
          const formData = new FormData();
          var cart_unique_id = localStorage.getItem("cart_unique_id");
          if (!cart_unique_id) {
            cart_unique_id = uuidv4();
            localStorage.setItem("cart_unique_id", cart_unique_id);
          }
          formData.append("cart_unique_id", cart_unique_id);

          setPopUpMessage(res.data.message);
          setPopUpIcon("success");
          await BuyerApiCalls(
            formData,
            Apis.retrieveCart,
            "POST",
            {},
            processRes
          );
          if (type !== "addToCart") navigate(CustomerRoutes.MyCart);
        } else {
          if (type === "groupBuy") {
            setShowGroupBuyPopup(false);
            toast.error(res.data.message);
          } else {
            setPopUpMessage(res.data.message);
            setPopUpIcon("error");
          }
        }
      }
    );
  };

  const addToCartHandler = () => {
    addToCart("addToCart");
    setIsOpen(true);
  };

  const buyNowHandler = () => {
    addToCart("buyNow");
  };

  //layer 1 -> get variation id
  //layer 2 -> get variation value
  //filter the variation 2 price base on the parent id and the variation value
  const priceHandler = () => {
    let product;
    if (productDetail) {
      if (variation1Id) {
        product = productDetail?.variations.find(
          (variation) => variation.id_product_variation === variation1Id
        );
      } else {
        product = productDetail?.variations[0];
      }

      if (variation2Id) {
        let currentItem = product?.child.find(
          (childVariation) =>
            childVariation.id_product_variation === variation2Id
        );
        if (currentItem) {
          setDiscountedPrice(currentItem.discounted_price);
          setOriginalPrice(currentItem.price);
          setDiscount(currentItem.discount);
        }
      } else {
        setDiscountedPrice(product?.discounted_price);
        setOriginalPrice(product?.price);
        setDiscount(product?.discount);
      }
    }
  };

  const buttonHandler = (
    variationLayer,
    variationId,
    variationValue,
    variationStock,
    variation,
    index
  ) => {
    let image;
    if (variationLayer.toString() === "1") {
      if (variationId !== variation1Id) {
        setVariation1Id(variationId);
        setactiveVariationButton1(variationId);
        setCurrentStock(variationStock);
        setIsSoldOut(variationStock > 0 ? false : true);
        image = variation?.image[0]?.img;
        setActiveImage(image);
        if (quantity > variationStock) setQuantity(variationStock);

        //if there is variation2 value and button changes (variation1 id changes)
        //which means second layer is selected -> change the variation2 id
        //the value is the same, but does not belong to the current parent (belong to previous parent)
        if (variation2Value) {
          let childVariation = productDetail.variations
            .find((variation) => variation.id_product_variation === variationId)
            .child.find((child) => child.variation_value === variation2Value);
          setVariation2Id(childVariation.id_product_variation);
          setIsSoldOut(childVariation.stock > 0 ? false : true);
          image = childVariation?.image[0]?.img ?? variation?.image[0]?.img;
          setActiveImage(image);
          setCurrentStock(childVariation.stock);
          if (quantity > childVariation.stock)
            setQuantity(childVariation.stock);

          checkForGroupBuy(childVariation.id_product_variation);
        } else checkForGroupBuy(variationId);
      }
    } else {
      if (variationId !== variation2Id) {
        setactiveVariationButton2(variationValue);
        setVariation2Value(variationValue);
        setVariation2Id(variationId);
        setCurrentStock(variationStock);
        if (quantity > variationStock) setQuantity(variationStock);
        setIsSoldOut(variationStock > 0 ? false : true);
        image =
          variation?.child[index]?.image[0]?.img ?? variation?.image[0]?.img;
        setActiveImage(image);
        checkForGroupBuy(variationId);
      }
    }
  };

  const checkForGroupBuy = (variationId) => {
    if (groupBuyDetail?.active_variation?.includes(variationId))
      setIsVariationInGroupBuy(true);
    else setIsVariationInGroupBuy(false);
  };

  const openChat = () => {
    if (user) {
      let dataToPass = {
        userType: USER_TYPE[1],
        receiverType: USER_TYPE[2],
        buyerId: user?.user_id,
        shopSlug: productDetail["seller"]?.shop_slug,
        sellerId: productDetail["seller"]?.user_id,
        shopName: productDetail["seller"]?.shop_name,
      };

      ls("chatData", JSON.stringify(dataToPass));

      const newTab = window.open(CustomerRoutes.ChatScreen, "_blank");
      if (newTab) newTab.focus();
    } else {
      setNavigateTo(CustomerRoutes.ProductDetails + slug + "/");
      dispatch(setPrevUrl(CustomerRoutes.ProductDetails + slug + "/"));
      setIsLoginPromptOpen(true);
    }
  };

  const callNotifyMe = () => {
    setOpenNotify(true);
  };

  const submitNotify = () => {
    setMailErr("");
    let id_prod_variation = variation2Id
      ? variation2Id
      : variation1Id
      ? variation1Id
      : null;
    console.log(notifyEmail ? true : false, id_prod_variation);

    if (notifyEmail && id_prod_variation) {
      let formData = new FormData();
      formData.append("email", notifyEmail);
      formData.append("product_variation_id", id_prod_variation);

      BuyerApiCalls(
        formData,
        Apis.notifyProduct,
        "POST",
        user
          ? {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${user.access}`,
            }
          : {},
        processRes
      );
    } else {
      if (!notifyEmail) setMailErr("Please fill email address");
    }
  };

  const closeNotifyPopup = () => {
    setOpenNotify(false);
    setMailErr("");
    setNotifyEmail("");
  };

  const notifyPopup = () => {
    return (
      <Modal
        width="w-[450px] max-sm:w-[300px]"
        open={openNotify}
        children={
          <div>
            <div className="flex justify-between">
              <p className="font-semibold">Notify When Available</p>
              <FontAwesomeIcon
                icon={faXmark}
                className="cp"
                onClick={closeNotifyPopup}
              />
            </div>
            <p className="text-sm mt-5">
              Enter your email address and you will be notified when this
              product is back in stock
            </p>
            <div className="w-full h-12 border border-[#c1c1c1] mt-5 mb-10 px-3 pt-3">
              <input
                type="text"
                value={notifyEmail}
                placeholder="Email Address"
                className="w-full"
                onChange={(e) => {
                  setNotifyEmail(e.target.value);
                  if (e.target.value !== "") setMailErr("");
                }}
              />
              <p className="mt-4 text-xs text-red-500">{mailErr}</p>
            </div>
            <div className="flex justify-end items-center">
              <button
                className="bg-orangeButton px-3 py-1 text-white rounded"
                onClick={submitNotify}
              >
                Notify
              </button>
            </div>
          </div>
        }
      />
    );
  };

  const handleGetGroupBuy = () => {
    setShowGroupBuyPopup(true);
  };

  const submitGroupBuy = (choice, qty) => {
    if (user) addToCart("groupBuy", qty, choice);
    else {
      setShowGroupBuyPopup(false);
      setNavigateTo(CustomerRoutes.ProductDetails + slug + "/");
      setIsLoginPromptOpen(true);
      setPopUpMessage("Please login to purchase group buy");
      setPopUpIcon("error");
      dispatch(setPrevUrl(CustomerRoutes.ProductDetails + slug + "/"));
    }
  };

  const handleQuantity = (type) => {
    if (type === "decrement") {
      if (quantity > 1) {
        setQuantity(quantity - 1);
      }
    } else if (type === "increment") {
      let qty = quantity + 1;
      if (qty <= currentStock) setQuantity(quantity + 1);
      else toast.error("Reached maximum stocks available");
    } else {
      setQuantity(type);
      if (type > currentStock) {
        setTimeout(() => {
          setQuantity(currentStock);
        }, 1000);
      }
    }
  };

  return (
    <React.Fragment>
      {isPageLoading ? (
        <PageLoader />
      ) : (
        <>
          <SEOComponent
            title={productDetail?.name}
            description={productDetail?.meta_description}
            ogTitle={productDetail?.name}
            ogDescription={productDetail?.meta_description}
            isProduct={true}
            productMeta={{
              "og:url": window.location.href,
              "og:image": productDetail?.image_media[0]?.img,
              "product:brand": productDetail?.brand_name,
              "product:availability":
                currentStock === 0 ? "out of stock" : "in stock",
              "product:price:amount":
                discount !== 0
                  ? discountedPrice?.toFixed(2).toString()
                  : originalPrice.toFixed(2).toString(),
              "product:price:currency": "SGD",
              "product:retailer_item_id": productDetail?.id_product,
            }}
          />
          <div>
            {displayModalForms()}
            <CategoryNavTree layers={layers}></CategoryNavTree>

            {/* floating buy now/add to cart in mobile screen */}
            <div className="hidden max-sm:flex fixed bottom-[2px] w-full z-20 justify-center">
              <div className="flex flex-row w-full">
                <div className="w-1/2 h-12">
                  {productDetail?.seller.is_vacation === "N" ? (
                    <button
                      onClick={() => {
                        if (
                          isSoldOut &&
                          Object.keys(groupBuyDetail).length > 0 &&
                          isVariationInGroupBuy
                        )
                          handleGetGroupBuy();
                        else buyNowHandler();
                      }}
                      id="buyNow"
                      className="flex items-center justify-center bg-orangeButton h-12 text-white text-sm 
                      font-medium leading-6 w-full"
                    >
                      Buy now
                    </button>
                  ) : (
                    <div
                      className="flex items-center justify-center bg-gray-300 h-12 text-white text-sm 
                      font-medium leading-6"
                      disabled={true}
                    >
                      Buy now
                    </div>
                  )}
                </div>
                <div className="bg-white w-1/2 h-12 flex justify-evenly">
                  {productDetail?.seller.is_vacation === "N" ? (
                    <>
                      {/* <div className="bg-gray-400 h-6 w-[1px] mt-2"></div> */}
                      <button
                        id="addToCart"
                        onClick={() => {
                          if (
                            isSoldOut &&
                            Object.keys(groupBuyDetail).length > 0 &&
                            isVariationInGroupBuy
                          )
                            handleGetGroupBuy();
                          else addToCartHandler();
                        }}
                        className="text-orangeButton text-[9px] h-12 flex flex-col items-center gap-1 justify-center"
                      >
                        <BsHandbag size={20} />
                        <p className="text-black">Add to cart</p>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="bg-gray-400 h-6 w-[1px] mt-2"></div>
                      <div className=" flex flex-col items-center justify-center text-[9px] text-gray-300 gap-1">
                        <BsHandbag size={20} />
                        <p className="text-gray-300">Add to cart</p>
                      </div>
                    </>
                  )}
                  <div className="bg-gray-400 h-6 w-[1px] mt-2"></div>
                  <button className="text-orangeButton cp" onClick={openChat}>
                    <AiFillWechat size={25}></AiFillWechat>
                    <p className="text-black text-[9px]">Chat</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="h-fit flex-col flex-wrap flex-1 mx-4 md:mx-20 max-sm:relative">
              <section className="md:mb-[32px]">
                <div className="flex-col md:flex md:flex-row md:h-fit max-md:pt-8 py-8 gap-12 grow">
                  <div className="flex md:flex-col md:w-[400px] md:h-[544px] md:gap-5">
                    {productDetail && (
                      <ProductSlider
                        media={productDetail?.image_media}
                        video={
                          productDetail?.image_video.length > 0
                            ? productDetail?.image_video[0]
                            : null
                        }
                        activeImage={activeImage}
                      />
                    )}
                    <div className="hidden md:flex md:justify-between ">
                      {displayShareButtons()}

                      <button
                        className="flex"
                        onClick={() => favouriteHandler()}
                      >
                        {addedToWishlist ? (
                          <AiFillHeart className="text-amber-500" size={25} />
                        ) : (
                          <AiOutlineHeart
                            size={25}
                            className="text-amber-500"
                          />
                        )}
                        <p className="pl-2">Favourite</p>
                        <p className="w-[30px]">({wishlistCounts ?? 0})</p>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col flex-wrap gap-4 w-full h-full mt-4 md:mt-0">
                    <div className="flex flex-col gap-2">
                      <p className="md:text-2xl font-semibold text-poppins text-[14px] capitalize">
                        {productDetail?.name || 0}
                        {isSoldOut &&
                          !(
                            Object.keys(groupBuyDetail).length > 0 ||
                            isVariationInGroupBuy
                          ) && (
                            <span className="inline-block text-xs text-center h-6 pt-1 bg-red-500 rounded-md w-[70px] font-normal text-white ml-2">
                              Sold Out
                            </span>
                          )}
                      </p>
                      <div className="sm:hidden">
                        {Object.keys(groupBuyDetail).length > 0 &&
                          isVariationInGroupBuy && (
                            <MobGroupBuyLabel
                              dealPrice={groupBuyDetail?.group_buy_price}
                              originalPrice={
                                discount !== 0 ? discountedPrice : originalPrice
                              }
                              guaranteedPrice={
                                groupBuyDetail?.success_discount_price
                              }
                              remainingOrderQty={
                                groupBuyDetail?.success_target_qty -
                                groupBuyDetail?.total_order_qty
                              }
                              soldQty={groupBuyDetail?.total_order_qty}
                              maxCampaignQty={groupBuyDetail?.max_campaign_qty}
                              campaignStatus={groupBuyDetail?.campaign_status}
                              handleGetGroupBuy={handleGetGroupBuy}
                              campaignDates={{
                                startDate: groupBuyDetail?.start_datetime,
                                endDate: groupBuyDetail?.end_datetime,
                              }}
                            />
                          )}
                      </div>
                    </div>

                    {productDetail?.variations && (
                      <div className="flex gap-2 items-center">
                        {discount !== 0 && (
                          <p className="flex gap-[10px] text-orangeButton text-2xl font-semibold leading-6 text-poppins">
                            {discountedPrice?.toFixed(2)}
                          </p>
                        )}
                        {discount === 0 && (
                          <p className="flex gap-[10px] text-orangeButton text-2xl font-semibold leading-6 text-poppins">
                            {originalPrice?.toFixed(2)}
                          </p>
                        )}
                        {discount !== 0 && (
                          <p className="text-2xl font-semibold line-through text-gray-400">
                            {originalPrice?.toFixed(2)}
                          </p>
                        )}
                        {discount !== 0 && (
                          <p className="rounded-lg px-2 py-1 bg-red-500 text-white text-[12px] font-semibold">
                            {discount}% off
                          </p>
                        )}
                      </div>
                    )}

                    <div className="max-sm:hidden">
                      {Object.keys(groupBuyDetail).length > 0 &&
                        isVariationInGroupBuy && (
                          <GroupBuyLabel
                            dealPrice={groupBuyDetail?.group_buy_price}
                            originalPrice={
                              discount !== 0 ? discountedPrice : originalPrice
                            }
                            guaranteedPrice={
                              groupBuyDetail?.success_discount_price
                            }
                            remainingOrderQty={
                              groupBuyDetail?.success_target_qty -
                              groupBuyDetail?.total_order_qty
                            }
                            soldQty={groupBuyDetail?.total_order_qty}
                            maxCampaignQty={groupBuyDetail?.max_campaign_qty}
                            from="customer"
                            campaignStatus={groupBuyDetail?.campaign_status}
                            handleGetGroupBuy={handleGetGroupBuy}
                            campaignDates={{
                              startDate: groupBuyDetail?.start_datetime,
                              endDate: groupBuyDetail?.end_datetime,
                            }}
                          />
                        )}
                    </div>

                    <div className="flex flex-col">
                      {/* 
                      product variation logic
                      - first variation of each layer being selected (by default)
                      1. first layer -> active button base on id
                      2. second layer -> active button base on value, else select 2nd layer -> 1st layer will reset the active button in second layer
                      - display the second layer of the first parent if there are two layers (by default)
                      - to set the id of the second layer, will need to check the value or id of the selected button of the first layer (parent) as the value of the second layer can be similar but have different id
                      - disable the button if the stock < 1 and display the stock count if stock > 0
                      - whenever there is changes in the first layer button, should call a function to reset the second layer child


                      -action to perfrom whenever the button changes
                        1. update the id 
                        2. update the changes in ui of the button
                        3. update the price
                        4. check the stock left

                    */}

                      <div className="flex flex-col gap-2">
                        {/* 
                    .find() returns the first element that satisfies the condition (variation name is not null)
                    */}
                        <p>
                          {productDetail?.variations.find(
                            (variation) => variation.variation_name !== null
                          )?.variation_name ?? null}
                        </p>

                        <div className="flex gap-[12px] flex-wrap">
                          {productDetail?.variations
                            ? productDetail?.variations
                                //filter out the first layer variations (parent_id ===null)
                                //filter out those without variation value (BUGGGG), can remove after fix at seller side
                                .filter(
                                  (variation) =>
                                    variation.parent_id === null &&
                                    variation.variation_value !== null
                                )
                                .map((variation, index) => {
                                  //if button is disabled case
                                  if (
                                    variation.stock === 0 &&
                                    variation.child.length === 0
                                  ) {
                                    return (
                                      <div
                                        key={index}
                                        className="flex items-center"
                                      >
                                        <button
                                          id={variation.id_product_variation}
                                          className="capitalize
                                    } border-[0.5px] border-grey4Border rounded-[2px] min-w-[66px] w-fit h-7 text-grey4Border font-normal text-[12px] leading-[18px] border"
                                          disabled
                                        >
                                          {variation.variation_value}
                                        </button>
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div className="flex flex-col gap-2 capitalize">
                                        {/* layer 1 */}

                                        <div
                                          key={index}
                                          className="flex items-center"
                                        >
                                          <button
                                            id={variation.id_product_variation}
                                            className={`${
                                              variation?.id_product_variation ===
                                              activeVariationButton1
                                                ? "bg-orangeButton"
                                                : "bg-white"
                                            } border-[0.5px] px-1 border-greyBorder rounded-[2px] min-w-[66px] w-fit h-7 text-greyBorder font-normal text-[12px] leading-[18px] capitalize`}
                                            onClick={() => {
                                              buttonHandler(
                                                "1",
                                                variation.id_product_variation,
                                                null,
                                                variation.stock,
                                                variation,
                                                index
                                              );
                                            }}
                                          >
                                            {variation.variation_value}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  }
                                })
                            : null}
                        </div>
                        {/* 
                      second layer variation
                      */}
                        <p>
                          {
                            productDetail?.variations.find(
                              (variation) => variation?.child.length > 0
                            )?.child[0]?.variation_name
                          }
                        </p>
                        <div className="flex gap-[12px] flex-wrap">
                          {variation1Id !== null && productDetail?.variations
                            ? productDetail?.variations
                                //filter out the first layer variations (parent_id ===null)
                                //filter out those without variation value (BUGGGG), can remove after fix at seller side
                                .filter(
                                  (variation) =>
                                    variation?.id_product_variation ===
                                    variation1Id
                                )
                                .map((variation, index) => {
                                  //if button is disabled case

                                  return (
                                    <>
                                      {variation.child.map(
                                        (childVariation, childIndex) => {
                                          if (childVariation.stock === 0) {
                                            return (
                                              <div
                                                key={index}
                                                className="flex items-center"
                                              >
                                                <button
                                                  id={
                                                    childVariation.id_product_variation
                                                  }
                                                  className="capitalize
                                            } border-[0.5px] border-grey4Border rounded-[2px] min-w-[66px] w-fit h-7 text-grey4Border font-normal text-[12px] leading-[18px] border px-2"
                                                  disabled
                                                >
                                                  {
                                                    childVariation.variation_value
                                                  }
                                                </button>
                                              </div>
                                            );
                                          } else {
                                            return (
                                              <div className="flex gap-[12px] capitalize">
                                                <div
                                                  key={index}
                                                  className="flex items-center"
                                                >
                                                  <button
                                                    id={
                                                      childVariation.id_product_variation
                                                    }
                                                    className={`${
                                                      childVariation.variation_value ===
                                                      activeVariationButton2
                                                        ? "bg-orangeButton"
                                                        : "bg-white"
                                                    } border-[0.5px] border-greyBorder rounded-[2px] min-w-[66px] w-fit h-7 text-greyBorder font-normal text-[12px] leading-[18px] capitalize px-2`}
                                                    onClick={() => {
                                                      buttonHandler(
                                                        "2",
                                                        childVariation.id_product_variation,
                                                        childVariation.variation_value,
                                                        childVariation.stock,
                                                        variation,
                                                        childIndex
                                                      );
                                                    }}
                                                  >
                                                    {
                                                      childVariation.variation_value
                                                    }
                                                  </button>
                                                </div>
                                              </div>
                                            );
                                          }
                                        }
                                      )}
                                    </>
                                  );
                                })
                            : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 flex-row max-sm:items-center">
                      <label className="text-[14px] leading-[21px] font-medium">
                        Quantity
                      </label>

                      <div className="flex items-center gap-5">
                        <div className="flex gap-[5px] justify-between items-center border-[0.5px] p-[5px] rounded-[4px] w-[95px] h-[32px] border-solid border-gray-400">
                          <div className="flex w-6 h-6 bg-orangeButton items-center justify-center rounded-[2px]">
                            <button
                              className="text-center text-white mx-auto"
                              onClick={() => handleQuantity("decrement")}
                            >
                              -
                            </button>
                          </div>

                          <div className="flex items-center">
                            <input
                              value={quantity}
                              onChange={(e) => handleQuantity(e.target.value)}
                              name="quantity"
                              className="!w-8 text-center"
                            />
                          </div>
                          <div className="flex w-6 h-6 bg-orangeButton items-center justify-center rounded-[2px]">
                            <button
                              className="text-center text-white mx-auto"
                              onClick={() => handleQuantity("increment")}
                              disabled={isSoldOut}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        {currentStock && (
                          <p className="font-normal textNormal text-gray-400">
                            {currentStock} Product Available
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ">
                      <label className="textNormal font-medium">
                        Available Delivery Options
                      </label>
                      <div className="flex gap-4">
                        {productDetail?.seller?.delivery_options.some(
                          (type) => {
                            return type.delivery_type === "Instant Delivery";
                          }
                        ) && (
                          <div className="flex gap-4">
                            <img
                              src={instant}
                              className="h-12 w-10"
                              alt=""
                            ></img>
                          </div>
                        )}
                        {productDetail?.seller?.delivery_options.some(
                          (type) => {
                            return type.delivery_type === "Same Day Delivery";
                          }
                        ) && (
                          <div className="flex gap-4">
                            <img
                              src={sameday}
                              className="h-12 w-12"
                              alt=""
                            ></img>
                          </div>
                        )}
                        {productDetail?.seller?.delivery_options.some(
                          (type) => {
                            return type.delivery_type === "Scheduled Delivery";
                          }
                        ) && (
                          <div className="flex gap-4">
                            <img
                              src={nextday}
                              className="h-12 w-10"
                              alt=""
                            ></img>
                          </div>
                        )}
                      </div>
                    </div>
                    {shopVouchers?.length > 0 && (
                      <div className="flex items-center gap-5">
                        <div className="flex gap-2 items-center">
                          <img
                            alt=""
                            src={percentageIcon}
                            className="w-7 h-7"
                          ></img>
                        </div>

                        <button
                          onClick={() => {
                            setOpenModal(true);
                            dispatch(setWhichForm("claimShopVoucher"));
                          }}
                          className="text-orangeButton text-[14px] font-medium lead-[21px] capitalize"
                        >
                          Claim Vouchers here
                        </button>
                      </div>
                    )}
                    <div className="md:hidden">{displayShareButtons()}</div>
                    <>
                      {isSoldOut &&
                      Object.keys(groupBuyDetail).length > 0 &&
                      isVariationInGroupBuy ? null : isSoldOut &&
                        !(
                          Object.keys(groupBuyDetail).length > 0 ||
                          isVariationInGroupBuy
                        ) ? (
                        <div
                          onClick={() => callNotifyMe()}
                          id="notifyMe"
                          className="text-center border-[1px] px-6 py-2 bg-orangeButton rounded-[4px] text-white text-[14px] 
                      font-medium leading-6 w-[120px] h-[45px] cp"
                        >
                          Notify Me
                        </div>
                      ) : (
                        <div className="flex gap-4 mt-2">
                          <div className="max-sm:hidden flex">
                            {productDetail?.seller.is_vacation === "N" ? (
                              <button
                                onClick={() => {
                                  buyNowHandler();
                                }}
                                id="buyNow"
                                className="text-center border-[1px] px-6 py-2 bg-orangeButton rounded-[4px] text-white text-[14px] 
                          font-medium leading-6 min-w-[120px] h-[45px]"
                              >
                                Buy now
                              </button>
                            ) : (
                              <div
                                className="hidden text-center border-[1px] px-6 py-2 bg-gray-300 rounded-[4px] text-white text-[14px]
                          font-medium leading-6 min-w-[120px] h-[45px]"
                                disabled={true}
                              >
                                Buy now
                              </div>
                            )}
                          </div>
                          <div className="max-sm:hidden flex">
                            {productDetail?.seller.is_vacation === "N" ? (
                              <button
                                id="addToCart"
                                onClick={() => {
                                  addToCartHandler();
                                }}
                                className="flex gap-[10px] items-center border-2 px-6 py-2 border-orangeButton text-orangeButton font-medium rounded-[4px] min-w-[160px] h-[45px]"
                              >
                                <BsHandbag />
                                Add to cart
                              </button>
                            ) : (
                              <div className="hidden flex gap-[10px] items-center text-center border-[1px] px-6 py-2 bg-gray-300 rounded-[4px] text-white text-[14px] font-medium leading-6 min-w-[120px] h-[45px] whitespace-nowrap">
                                <BsHandbag />
                                Add to cart
                              </div>
                            )}
                          </div>
                          {productDetail?.seller.is_vacation !== "N" && (
                            <div className="text-center border-[1px] px-6 py-2 bg-gray-300 rounded-[4px] text-white text-[14px] font-medium leading-6 min-w-[120px] h-[45px]">
                              Seller is on vacation
                            </div>
                          )}
                        </div>
                      )}
                    </>
                    {isOpen && (
                      <PopUpComponent
                        message={popUpMessage}
                        open={isOpen}
                        close={() => setIsOpen(false)}
                        result={popUpIcon}
                        link={{ link: CustomerRoutes.MyCart, label: "cart" }}
                      ></PopUpComponent>
                    )}
                    {isSuccess && (
                      <PopupMessage
                        message={successData.message}
                        open={isOpen}
                        toggle={() => setIsSuccess(false)}
                        result={successData.result.toLowerCase()}
                      ></PopupMessage>
                    )}
                  </div>
                </div>
              </section>
              {productDetail ? (
                <SellerInformation
                  sellerInformation={productDetail["seller"]}
                  setOpenModal={setOpenModal}
                  navigateTo={CustomerRoutes.ProductDetails + slug + "/"}
                ></SellerInformation>
              ) : null}

              <section className="my-8 flex md:flex-col gap-4">
                <p className="text-[18px] font-semibold uppercase">
                  product description
                </p>
                <p className="text-[14px] prod-desc">
                  {productDetail?.description
                    ? parse(productDetail?.description)
                    : null}
                </p>
              </section>
              <ProductReviewRating productDetail={productDetail} />
              <div className="scroll-container">
                <ScrollingProductList
                  title="From the Same Shop"
                  prodSlug={slug}
                />
              </div>
              <ScrollingProductList title="Related Products" prodSlug={slug} />
            </div>
          </div>
        </>
      )}
      {isLoginPromptOpen && (
        <PromptLoginPopup
          isOpen={isLoginPromptOpen}
          setIsOpen={setIsLoginPromptOpen}
          navigateTo={navigateTo}
        />
      )}
      {openNotify && notifyPopup()}

      {showGroupBuyPopup && (
        <GroupBuyPopup
          showGroupBuyPopup={showGroupBuyPopup}
          closeShowGroupBuyPopup={() => setShowGroupBuyPopup(false)}
          product={{
            name: productDetail?.name,
            image: productDetail?.image_media[0]?.img,
          }}
          groupBuyData={groupBuyDetail}
          originalPrice={originalPrice}
          submitGroupBuy={submitGroupBuy}
          isSoldOut={isSoldOut}
        />
      )}
    </React.Fragment>
  );
}
export default ProductConfiguration;

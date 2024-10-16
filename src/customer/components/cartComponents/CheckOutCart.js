import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { CustomerRoutes } from "../../../Routes";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import ls from "local-storage";

import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import {
  setAddresses,
  setWhichForm,
  setSelectedAddress,
} from "../../redux/reducers/addressReducer";

import {
  retrieveCartQuantity,
  setCartItems,
} from "../../redux/reducers/cartReducer";

import { setCheckoutItems } from "../../redux/reducers/checkoutReducer";
import {
  setSellerID,
} from "../../redux/reducers/voucher";

//components
import { Modal } from "./../GenericComponents";
import ViewAddressForm from "../formComponents/modalForms/ViewAddressForm";
import { PopUpComponent } from "./../GenericComponents";
import AddEditAddressForm from "../formComponents/modalForms/AddEditAddressForm";
import ViewApplyVoucherForm from "../formComponents/modalForms/ViewApplyVoucherForm";
import RedeemVoucherForm from "./../formComponents/modalForms/RedeemVoucherForm";

//css
import "react-datepicker/dist/react-datepicker.css";

//icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard } from "@fortawesome/free-regular-svg-icons";
import { BsArrowLeft } from "react-icons/bs";
import { FaCheckCircle, FaPlus } from "react-icons/fa";
import {
  MdModeEdit,
  MdOutlineLocationOn,
  MdKeyboardArrowRight,
  MdCalendarMonth
} from "react-icons/md";
import { IoMdRemoveCircle } from "react-icons/io";

//images
import chat from "../../../assets/buyer/chatSqaure.svg";
import productImg1 from "../../../assets/buyer/productImg1.png";
import percentageIcon from "../../../assets/buyer/percentageIcon.png";
import { baseUrl } from "../../../apiUrls";
import { USER_TYPE } from "../../../constants/general";
import { PageLoader } from "../../../utils/loader.js";
import ShowConfirmAgePopup from "./confirmAgePopup.js";
import shopVoucherIcon from "../../../assets/buyer/shop_voucher.svg";

import jtLogo from "../../../assets/seller/jtLogo.png";
import uparcelLogo from "../../../assets/uParcelLogo.png";
import popularChoiceImg from "../../../assets/buyer/Popular Choice.png";
import { checkAffiliateExpiry } from "../../../utils/general.js";
import uparcel_logo from "../../../assets/uparcel_logo.png";

function CheckOutCart() {
  // const data = useSelector((state) => state.cart.cartItems);
  const dispatch = useDispatch();
  const addresses = useSelector((state) => state.address.addresses);
  const whichForm = useSelector((state) => state.address.whichForm);
  const selectedAddress = useSelector((state) => state.address.selectedAddress);

  let selectedItems = useSelector((state) => state.cart.selectedItems);
  if (selectedItems.length === 0 && ls("selectedItems").length !== 0)
    selectedItems = ls("selectedItems");

  const checkoutItems = useSelector((state) => state.checkout.checkoutItems);

  const user = JSON.parse(localStorage.getItem("customer"));
  const cart_unique_id = localStorage.getItem("cart_unique_id");
  const [cartTotal, setCartTotal] = useState(0);
  const [shopVoucherDiscount, setShopVoucherDiscount] = useState(0);
  const [totalShipping, setTotalShipping] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [shippingSettings, setShippingSettings] = useState([]);
  const [productDiscount, setProductDiscount] = useState(0);
  const [redeemableCashbackAmount, setRedeemableCashbackAmount] = useState(0);
  const [appliedCashbackAmount, setAppliedCashbackAmount] = useState(0);
  const [cashbackMessage, setCashbackMessage] = useState(null);
  const [productTotal, setProductTotal] = useState(0);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [popupResult, setPopupResult] = useState(null);
  const [popUpMessage, setPopUpMessage] = useState(null);
  const [openStates, setOpenState] = useState({});
  const [voucherSellerId, setVoucherSellerId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [shopVouchers, setShopVouchers] = useState([]);
  const [totalSaveMessage, setTotalSaveMessage] = useState(0);
  const [currentSellerId, setCurrentSellerId] = useState(null);
  const [isCartItemsFetched, setIsCartItemsFetched] = useState(false);
  const [appliedUshopVoucher, setAppliedUshopVoucher] = useState("");
  const [appliedsellerVoucher, setAppliedSellerVoucher] = useState("");
  const [appliedUshopVoucherID, setAppliedUshopVoucherID] = useState(0);
  const [appliedsellerVoucherID, setAppliedSellerVoucherID] = useState(0);
  const [isSellerVoucher, setIsSellerVoucher] = useState(null);
  const [prevShipId, setPrevShipId] = useState({});
  const [prevTimeSlotSelected, setPrevTimeSlotSelected] = useState({});
  const [prevDate, setPrevDate] = useState({});
  const [contactUpdate, setContactUpdate] = useState(false);
  const [isAlcoholic, setIsAlcoholic] = useState(false);
  const [showConfirmAge, setShowConfirmAge] = useState(false);
  const [agreedAdultItem, setAgreedAdultItem] = useState(false);
  const [isCheckoutItemUpdated, setIsCheckoutItemUpdated] = useState(0);
  const [quantity, setQuantity] = useState(null);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  //group buy
  const [groupBuyData, setGroupBuyData] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (checkoutItems && isCheckoutItemUpdated > 0) {
      //loop through the selectedItem to get the id of the seller
      var tempObj = {};
      for (const seller in checkoutItems) {
        if (!isNaN(seller)) {
          tempObj[seller] = {
            availableTimeSlotId: [],
            shipping_id: "",
            selectedDate: "",
            selectedTimeSlotId: "",
            discount: "",
            message: "",
            selectedVoucherId: "",
            shipping_cost: 0,
            earliest_shipping_date: "",
            subtotal: parseFloat(
              checkoutItems[seller]?.seller?.seller_total || 0
            ),
            timePreSelection: false,
          };

          if (!groupBuyData?.[seller]?.isGroupBuyAvailable) {
            let merchantShipping =
              checkoutItems[seller]["seller"]?.merchant_shipping;

            let shipData = merchantShipping[0];
            if (shipData) {
              let date;
              // if(shipData?.shipping_option_id !== 2 && shipData?.shipping_option_id !== 5) date = new Date();
              // else
              date = new Date(shipData?.next_delivery_date);
              date =
                date.getFullYear() +
                "-" +
                parseInt(date.getMonth() + 1).toString() +
                "-" +
                date.getDate();

              tempObj[seller] = {
                ...tempObj[seller],
                shipping_id: shipData?.shipping_option_id,
                earliest_shipping_date: shipData?.next_delivery_date,
                selectedDate: date,
                timePreSelection: false,
              };
            }
          }
        }
      }
      //formdata for checkoutupdate api call "shipping"
      setShippingSettings(tempObj);
      setCurrentSellerId(Object.keys(checkoutItems)[0]);
    }
  }, [isCheckoutItemUpdated]);

  useEffect(() => {
    if (selectedAddress && isCartItemsFetched) {
      const addressFormData = new FormData();
      addressFormData.append("update_part", "address");
      addressFormData.append("cart_unique_id", cart_unique_id);
      addressFormData.append(
        "address_details",
        selectedAddress["address_details"]
      );
      addressFormData.append("full_name", selectedAddress["full_name"]);
      addressFormData.append(
        "contact_number",
        selectedAddress["contact_number"]
      );
      addressFormData.append("postal_code", selectedAddress["postal_code"]);
      addressFormData.append("unit_number", selectedAddress["unit_number"]);
      BuyerApiCalls(
        addressFormData,
        `cart/checkout/update/`,
        "POST",
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.access}`,
        },
        processRes
      );
    }
  }, [selectedAddress, isCartItemsFetched]);

  const processRes = (res, api, layer, parent_id, seller_id, shipping_id) => {
    if (api === Apis.retrieveTimeSlot) {
      if (res.data?.result === "FAIL") {
        setPopUpMessage(res.data.message);
        setOpenPopUp(true);
        setPopupResult("error");
        let date = { ...prevDate };
        date[seller_id] = "";
        setPrevDate({ ...date });
        shippingHandler("0.0", seller_id, "shipping_cost");
        shippingHandler("", seller_id, "selectedDate");
        shippingHandler("", seller_id, "   selectedTimeSlotId");
        return;
      }
      let tempArr = [];
      if (res.data && res.data.data) {
        res.data?.data?.map((timeslot) => {
          if (timeslot.delivery_slot.startsWith("0")) {
            timeslot.delivery_slot = timeslot.delivery_slot.substring(1);
          }
          tempArr.push(timeslot);
        });
      }
      shippingHandler(tempArr, seller_id, "availableTimeSlotId");

      if (!shippingSettings[seller_id]?.timePreSelection) {
        shippingHandler(tempArr[0].id_slot, seller_id, "selectedTimeSlotId");
        shippingHandler(true, seller_id, "timePreSelection");
      }
    }

    if (api === Apis.retrieveCart) {
      dispatch(setCartItems(res.data.data.cart_item));
      dispatch(retrieveCartQuantity());
    }

    if (api === Apis.checkoutCart) {
      if (res.data.data?.cart_item) {
        setIsAlcoholic(res.data.data?.is_alcoholic_product);
        let items = res.data.data.cart_item;
        dispatch(setCheckoutItems(items));
        setIsCheckoutItemUpdated((val) => val + 1);
        setIsCartItemsFetched(true);

        let isGroupBuy = {};
        for (let sellerId in items) {
          isGroupBuy[sellerId] = {
            isGroupBuyAvailable: false,
          };
          for (let productId in items[sellerId]) {
            if (productId !== "seller") {
              if (items[sellerId][productId]?.product_group_buy_id) {
                let prodItem = items[sellerId][productId];
                let date = new Date(
                  prodItem?.product_group_buy_detail?.delivery_date
                );
                let deliveryDate =
                  date.getDate() +
                  "/" +
                  parseInt(date.getMonth() + 1).toString() +
                  "/" +
                  date.getFullYear();
                let formattedDate =
                  date.getFullYear() +
                  "-" +
                  parseInt(date.getMonth() + 1).toString() +
                  "-" +
                  date.getDate();

                isGroupBuy[sellerId] = {
                  isGroupBuyAvailable: true,
                  deliveryDate: deliveryDate,
                  deliveryFormattedDate: formattedDate,
                  shipping_cost: items[sellerId].seller?.shipping_charge,
                  seller_total: items[sellerId].seller?.seller_total,
                  timeslotId: items[sellerId]["seller"]?.time_slot_id,
                  timeslot: items[sellerId]["seller"]?.selected_delivery_slot,
                  shippingId:
                    items[sellerId][productId]?.product_group_buy_detail
                      ?.shipping_option_id,
                  shipping: items[sellerId]["seller"]?.selected_shipping_option,
                };
              }
            }
          }
        }
        setGroupBuyData({ ...isGroupBuy });
        setProductTotal(res.data.data.product_total);
        setTotalShipping(res.data.data.total_shipping);
        setSubTotal(res.data.data.subtotal);
        setProductDiscount(res.data.data.total_product_discount);
        setShopVoucherDiscount(res.data.data.total_discount);
        setCartTotal(res.data.data.cart_total);
        setAppliedCashbackAmount(res.data.data.applied_cashback);
      }
      return;
    }

    if (api === Apis.retrieveAddress) {
      dispatch(setAddresses(res.data.data));
      return;
    }

    if (api === Apis.checkoutUpdateCart) {
      if (res.data) {
        if (res.data.result === "FAIL") {
          if (res.data.message === "Please enter valid contact number.")
            setContactUpdate(true);

          setOpenPopUp(true);
          setPopupResult("error");
          setPopUpMessage(res.data.message);
        } else {
          if (isSellerVoucher !== null) {
            if (isSellerVoucher === 1) {
              setProductDiscount(res.data.data.total_product_discount);
              setShopVoucherDiscount(res.data.data.total_discount);
              setSubTotal(res.data.data.subtotal);
            } else {
              setCashbackMessage(null);
            }
            //setCartTotal(res.data.data.cart_total);
            if (shopVoucherDiscount === 0 && cashbackMessage === null) {
              setIsSellerVoucher(null);
            }
          }
          //if shipping charge is 0, useeffect will keep call the api
          if (res.data.data.cart_item[seller_id].seller.shipping_charge === 0) {
            shippingHandler("0.0", seller_id, "shipping_cost");
            // return;
          } else {
            shippingHandler(
              res.data.data.cart_item[seller_id].seller.shipping_charge,
              seller_id,
              "shipping_cost"
            );
          }

          shippingHandler(
            res.data.data.cart_item[seller_id].seller.discount,
            seller_id,
            "discount"
          );
          if (res.data.data.total_shipping) {
            setTotalShipping(res.data.data.total_shipping);
          }
          setProductDiscount(res.data.data.total_product_discount);
          setProductTotal(res.data.data.product_total);
          setCartTotal(res.data.data.cart_total);
          setSubTotal(res.data.data.subtotal);
          setShopVoucherDiscount(res.data.data.total_discount);
          setAppliedCashbackAmount(res.data.data.applied_cashback);
          setCashbackMessage(
            res.data.data.cart_item.ushop_detail.total_cashback
          );
        }
      }
      return;
    }

    if (api === Apis.createOrder) {
      if (res.data.result === "FAIL") {
        setOpenPopUp(true);
        setPopupResult("error");
        setPopUpMessage(res.data.message);
      }
      setIsPlacingOrder(false);
      if (res.data.result === "SUCCESS") {
        sessionStorage.setItem("SPK", res.data.data.publishable_key);
        sessionStorage.setItem("client_secret", res.data.data?.client_secret);
        sessionStorage.setItem("payment_order_id", res.data.data.id_order);
        sessionStorage.setItem("payment_order_num", res.data.data.order_number);
        sessionStorage.setItem("payment_order_amt", res.data.data.total_paid);
        navigate(CustomerRoutes.OrderPayment);
      }
    }
  };

  useEffect(() => {
    setTotalSaveMessage(
      parseFloat(shopVoucherDiscount) + parseFloat(productDiscount)
    );
  }, [shopVoucherDiscount, productDiscount]);

  useEffect(() => {
    for (let sellerId in shippingSettings) {
      const {
        shipping_id,
        selectedDate,
        selectedTimeSlotId,
        message,
        shipping_cost,
        availableTimeSlotId,
      } = shippingSettings[sellerId];
      //retrieve time slot
      //if there isnt any timeslot (api not called) and not type instant
      if (
        shipping_id &&
        selectedDate &&
        (prevShipId?.[sellerId] !== shipping_id ||
          (prevShipId?.[sellerId] === shipping_id &&
            prevDate?.[sellerId] !== selectedDate)) &&
        shipping_id !== 3
      ) {
        const shippingFormData = new FormData();
        shippingFormData.append("cart_unique_id", cart_unique_id);
        shippingFormData.append("seller_id", sellerId);
        shippingFormData.append("shipping_id", shipping_id);
        shippingFormData.append("delivery_date", selectedDate);
        BuyerApiCalls(
          shippingFormData,
          Apis.retrieveTimeSlot,
          "POST",
          {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.access}`,
          },
          processRes,
          {},
          {},
          sellerId,
          shipping_id
        );
        let shipId = { ...prevShipId };
        shipId[sellerId] = shipping_id;
        setPrevShipId({ ...shipId });

        updateDate(sellerId, selectedDate);
      }

      //call checkout update api if all required payload is captured
      if (
        (shipping_id !== 3 &&
          selectedDate &&
          selectedTimeSlotId &&
          selectedTimeSlotId !== prevTimeSlotSelected?.[sellerId]) ||
        (shipping_id === 3 && shipping_cost === 0 && selectedDate)
      ) {
        let shipIdToSend = shipping_id;
        if (shipping_id === 5 || shipping_id === 4) {
          let tslot = availableTimeSlotId.find(
            (ts) => ts.id_slot === selectedTimeSlotId
          );
          if (tslot) shipIdToSend = tslot.shipping_option_id;
        }

        const shippingFormData = new FormData();
        shippingFormData.append("update_part", "shipping");
        shippingFormData.append("cart_unique_id", cart_unique_id);
        shippingFormData.append("seller_id", sellerId);
        shippingFormData.append("shipping_id", shipIdToSend);
        shippingFormData.append("time_slot_id", selectedTimeSlotId);
        shippingFormData.append("delivery_date", selectedDate);
        shippingFormData.append("delivery_remark", message ?? "");
        BuyerApiCalls(
          shippingFormData,
          Apis.checkoutUpdateCart,
          "POST",
          {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.access}`,
          },
          processRes,
          {},
          {},
          sellerId,
          shipping_id
        );

        let timeslotId = { ...prevTimeSlotSelected };
        timeslotId[sellerId] = selectedTimeSlotId;
        setPrevTimeSlotSelected({ ...timeslotId });
      }
    }
  }, [shippingSettings]);

  //retrieve selected item & address
  useEffect(() => {
    // console.log("hasdkasjkdaskj");
    var formData = new FormData();
    formData.append("cart_unique_id", cart_unique_id);
    if (selectedItems) {
      Object.keys(selectedItems).map((sellerID) => {
        formData.append(
          "selected_item[]",
          selectedItems[sellerID]["product_variation_id"] + ""
        );
        formData.append("item_qty[]", selectedItems[sellerID]["quantity"] + "");
      });
    }

    BuyerApiCalls(
      {},
      Apis.retrieveAddress,
      "GET",
      {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${user.access}`,
      },
      processRes
    );

    BuyerApiCalls(
      formData,
      Apis.checkoutCart,
      "POST",
      {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${user.access}`,
      },
      processRes
    );
  }, []);

  //sort the address such that the default address is the first

  useEffect(() => {
    if (addresses) {
      {
        const firstAddress = [...addresses].sort((a, b) =>
          a.set_default === b.set_default ? 0 : a.set_default ? -1 : 1
        );
        dispatch(setSelectedAddress(firstAddress[0]));
      }
    }
  }, [addresses]);

  //-------------functions---------------------------------------------
  const ushopVoucherHandler = () => {
    dispatch(setWhichForm("viewApplyUshopVoucher"));
  };

  function formatDate(dateString) {
    let [year, month, day] = dateString.split("-");
    if (parseInt(month) < 10) {
      month = "0" + month;
    }
    if (parseInt(day) < 10) {
      day = "0" + day;
    }
    return `${day}/${month}/${year}`;
  }

  //handle the changes in the shipping settings at the checkout page
  const shippingHandler = (input, sellerId, which, ship_id) => {
    if (
      which === "selectedTimeSlotId" ||
      which === "availableTimeSlotId" ||
      which === "shipping_cost" ||
      which === "discount" ||
      which === "earliest_shipping_date" ||
      which === "timePreSelection"
    ) {
      setShippingSettings((prevState) => ({
        ...prevState,
        [sellerId]: { ...prevState[sellerId], [which]: input },
      }));
      return;
    }

    if (which === "selectedDate") {
      let selectedDate = input;
      if (input !== "") {
        selectedDate =
          input.getFullYear() +
          "-" +
          parseInt(input.getMonth() + 1).toString() +
          "-" +
          input.getDate();
        if (ship_id === 2 || ship_id === 5) openDatePicker(sellerId);
      }

      setShippingSettings((prevState) => ({
        ...prevState,
        [sellerId]: {
          ...prevState[sellerId],
          [which]: selectedDate,
        },
      }));

      return;
    }
    if (which === "message") {
      setShippingSettings((prevState) => ({
        ...prevState,
        [sellerId]: { ...prevState[sellerId], [which]: input.target.value },
      }));
      return;
    }

    if (which === "shipping_id") {
      //if different radio button and there is shipping cost, reset
      if (input !== shippingSettings[sellerId]["shipping_id"]) {
        setShippingSettings((prevState) => ({
          ...prevState,
          [sellerId]: { ...prevState[sellerId], [which]: input },
        }));
        setShippingSettings((prevState) => ({
          ...prevState,
          [sellerId]: { ...prevState[sellerId], ["selectedTimeSlotId"]: "" },
        }));
        setShippingSettings((prevState) => ({
          ...prevState,
          [sellerId]: { ...prevState[sellerId], ["shipping_cost"]: 0 },
        }));
        let shipId = { ...prevShipId };
        shipId[sellerId] = input;
        setPrevShipId({ ...shipId });
        //if radio button dont have any value
      } else {
        setShippingSettings((prevState) => ({
          ...prevState,
          [sellerId]: { ...prevState[sellerId], [which]: input },
        }));
        return;
      }
    }
  };

  const timeFormater = (timeslot) => {
    var timeslotArray = timeslot.split("-");
    for (let timeslot in timeslotArray) {
      if (timeslotArray[timeslot].startsWith("0")) {
        timeslotArray[timeslot] = timeslotArray[timeslot].substring(1);
      }
    }
    if (timeslotArray.length === 1) {
      return timeslotArray[0];
    } else {
      return timeslotArray[0] + " - " + timeslotArray[1];
    }
  };

  //state for date picker, if the state of that index is true, it will open the datepicker for the shop of that index
  const openDatePicker = (index) => {
    var tempArr = openStates;
    tempArr[index] === true
      ? (tempArr[index] = false)
      : (tempArr[index] = true);
    setOpenState((prevState) => ({
      ...prevState,
      ...tempArr,
    }));
  };

  const dateConverter = (date) => {
    const dateComponents = date.split("-");
    const year = dateComponents[0];
    // JavaScript months are 0-based
    const month = dateComponents[1] - 1;
    const day = dateComponents[2];
    return new Date(year, month, day);
  };

  const updateDate = (sellerId, date) => {
    let dateList = { ...prevDate };
    dateList[sellerId] = date;
    setPrevDate({ ...dateList });
  };

  const handleClick = (sellerId) => {
    try {
      dispatch(setWhichForm("viewApplyShopVoucher"));
      setOpenModal(true);
      setVoucherSellerId(sellerId);
      dispatch(setSellerID(sellerId));
    } catch (err) {
      return err;
    }
  };

  useEffect(() => {
    if (isSellerVoucher !== null) {
      var fd = new FormData();
      fd.append("update_part", "remove-voucher");
      fd.append("is_seller_voucher", isSellerVoucher);
      fd.append("cart_unique_id", cart_unique_id);
      fd.append("seller_id", currentSellerId);
      BuyerApiCalls(
        fd,
        Apis.checkoutUpdateCart,
        "POST",
        {
          Authorization: `Bearer ${user.access}`,
        },
        processRes
      );
    }
  }, [isSellerVoucher]);

  const getPreviousDate = (date) => {
    let stDate = new Date(date);
    stDate.setDate(stDate.getDate() - 1);
    return stDate;
  };

  const placeOrderHandler = async (event) => {
    event?.preventDefault();

    let apiRequests = [];

    for (const sellerid in shippingSettings) {
      if (!groupBuyData?.[sellerid]?.isGroupBuyAvailable) {
        if (shippingSettings[sellerid]["shipping_id"] === "") {
          setOpenPopUp(true);
          setPopupResult("error");
          setPopUpMessage("Please select the shipping type");
          return;
        }
        if (shippingSettings[sellerid]["selectedDate"] === "") {
          setOpenPopUp(true);
          setPopupResult("error");
          setPopUpMessage("Please select the date of delivery.");
          return;
        }
        if (
          shippingSettings[sellerid]["selectedTimeSlotId"] === "" &&
          parseInt(shippingSettings[sellerid]["shipping_id"]) !== 3
        ) {
          setOpenPopUp(true);
          setPopupResult("error");
          setPopUpMessage("Please select the timeslot");
          return;
        }
      }
    }

    if (isAlcoholic) setShowConfirmAge(true);
    else {
      setIsPlacingOrder(true);
      //api call checkoutcartupdate for address
      if (selectedAddress) {
        const addressFormData = new FormData();
        addressFormData.append("update_part", "address");
        addressFormData.append("cart_unique_id", cart_unique_id);
        addressFormData.append(
          "address_details",
          selectedAddress["address_details"]
        );
        addressFormData.append("full_name", selectedAddress["full_name"]);
        addressFormData.append(
          "contact_number",
          selectedAddress["contact_number"]
        );
        addressFormData.append("postal_code", selectedAddress["postal_code"]);
        addressFormData.append("unit_number", selectedAddress["unit_number"]);
        apiRequests.push(
          await axios.post(`${baseUrl}cart/checkout/update/`, addressFormData, {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${user.access}`,
            },
          })
        );
      } else {
        setOpenPopUp(true);
        setPopupResult("error");
        setPopUpMessage("please select a address");
        setIsPlacingOrder(false);
        return;
      }

      const shippingFormData = new FormData();
      for (let sellerId in shippingSettings) {
        if (groupBuyData?.[sellerId]?.isGroupBuyAvailable) {
          const { message } = shippingSettings[sellerId];

          shippingFormData.append("update_part", "shipping");
          shippingFormData.append("cart_unique_id", cart_unique_id);
          shippingFormData.append("seller_id", sellerId);
          shippingFormData.append(
            "shipping_id",
            groupBuyData?.[sellerId].shippingId
          );
          shippingFormData.append(
            "time_slot_id",
            groupBuyData?.[sellerId].timeslotId
          );
          shippingFormData.append(
            "delivery_date",
            groupBuyData?.[sellerId].deliveryFormattedDate
          );
          shippingFormData.append("delivery_remark", message ?? "");
          apiRequests.push(
            await axios.post(
              `${baseUrl}cart/checkout/update/`,
              shippingFormData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                  Authorization: `Bearer ${user.access}`,
                },
              }
            )
          );
        } else {
          const { shipping_id, selectedDate, selectedTimeSlotId, message } =
            shippingSettings[sellerId];

          //call checkout update api if all required payload is captured

          shippingFormData.append("update_part", "shipping");
          shippingFormData.append("cart_unique_id", cart_unique_id);
          shippingFormData.append("seller_id", sellerId);
          shippingFormData.append("shipping_id", shipping_id);
          shippingFormData.append("time_slot_id", selectedTimeSlotId);
          shippingFormData.append("delivery_date", selectedDate);
          shippingFormData.append("delivery_remark", message ?? "");
          apiRequests.push(
            await axios.post(
              `${baseUrl}cart/checkout/update/`,
              shippingFormData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                  Authorization: `Bearer ${user.access}`,
                },
              }
            )
          );
        }
      }

      Promise.all(apiRequests).then((responses) => {
        //check if all the api calls are success
        if (!paymentMethod) {
          setOpenPopUp(true);
          setPopupResult("error");
          setPopUpMessage("please select a payment method");
          return;
        }
        const allSuccess = responses.every(
          (response) => response.data.result === "SUCCESS"
        );

        //call the create order api if all the api calls are success
        if (allSuccess) {
          const formData = new FormData();
          formData.append("cart_unique_id", cart_unique_id);
          if (agreedAdultItem) {
            formData.append("agreed_adult_item", "y");
          }

          if (ls("affiliate_username")) {
            let isExpired = checkAffiliateExpiry();
            if (isExpired) ls("affiliate_username", null);
            else {
              let affiliate = JSON.parse(ls("affiliate_username"));
              formData.append("affiliate_user", affiliate?.username);
            }
          }

          BuyerApiCalls(
            formData,
            Apis.createOrder,
            "POST",
            {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${user.access}`,
            },
            processRes
          );
        } else {
          setOpenPopUp(true);
          responses.forEach((response) => {
            if (response.data.result === "FAIL") {
              setPopUpMessage(response.data.message);
              if (
                response.data.message === "Please enter valid contact number."
              ) {
                setContactUpdate(true);
                return;
              }
            }
          });
          setIsPlacingOrder(false);
          return;
        }
      });
    }
    //api call voucher
  };

  const openChat = (order) => {
    let dataToPass = {
      userType: USER_TYPE[1],
      receiverType: USER_TYPE[2],
      buyerId: user?.user_id,
      shopSlug: order["seller"]["shop_slug"],
      sellerId: order["seller"]["user_id"],
      shopName: order["seller"]["shop_name"],
    };

    ls("chatData", JSON.stringify(dataToPass));

    const newTab = window.open(CustomerRoutes.ChatScreen, "_blank");
    if (newTab) newTab.focus();
  };

  const confirmPlacingOrder = () => {
    setAgreedAdultItem(true);
    setIsAlcoholic(false);
  };

  const cancelPlacingOrder = () => {
    setShowConfirmAge(false);
  };

  useEffect(() => {
    if (!isAlcoholic && showConfirmAge) {
      setShowConfirmAge(false);
      placeOrderHandler();
    }
  }, [isAlcoholic, showConfirmAge]);

  //-------------component fragments---------------------------------
  const displayModalForms = () => {
    return (
      openModal && (
        <Modal open={openModal}>
          {whichForm === "viewAddress" && (
            <ViewAddressForm
              setOpenPopUp={setOpenPopUp}
              close={() => setOpenModal(false)}
              setPopUpMessage={setPopUpMessage}
            ></ViewAddressForm>
          )}
          {(whichForm === "editAddress" || whichForm === "addAddress") && (
            <AddEditAddressForm
              setPopUpMessage={setPopUpMessage}
              setPopupResult={setPopupResult}
              setOpenPopUp={setOpenPopUp}
              close={() => setOpenModal(false)}
            ></AddEditAddressForm>
          )}

          {whichForm === "viewApplyShopVoucher" && (
            <ViewApplyVoucherForm
              close={() => setOpenModal(false)}
              type="shop"
              sellerId={voucherSellerId}
              setSubTotal={setSubTotal}
              setCartTotal={setCartTotal}
              shippingHandler={shippingHandler}
              setShopVoucherDiscount={setShopVoucherDiscount}
              setAppliedSellerVoucher={setAppliedSellerVoucher}
              setAppliedSellerVoucherID={setAppliedSellerVoucherID}
            ></ViewApplyVoucherForm>
          )}
          {whichForm === "viewApplyUshopVoucher" && (
            <ViewApplyVoucherForm
              close={() => setOpenModal(false)}
              type="ushop"
              setSubTotal={setSubTotal}
              setCartTotal={setCartTotal}
              shippingHandler={shippingHandler}
              setCashbackMessage={setCashbackMessage}
              setAppliedUshopVoucher={setAppliedUshopVoucher}
              setAppliedUShopVoucherID={setAppliedUshopVoucherID}
            ></ViewApplyVoucherForm>
          )}
          {whichForm === "claimUshopVoucher" && (
            <RedeemVoucherForm
              close={() => setOpenModal(false)}
              type="ushop"
            ></RedeemVoucherForm>
          )}
          {whichForm === "claimShopVoucher" && (
            <RedeemVoucherForm
              close={() => setOpenModal(false)}
              type="shop"
              sellerId={voucherSellerId}
            ></RedeemVoucherForm>
          )}
        </Modal>
      )
    );
  };

  const unitHandler = (unitNumber) => {
    return unitNumber.includes("#")
      ? unitNumber
      : (unitNumber = "#" + unitNumber);
  };

  const displayPopupMessage = () => {
    return (
      openPopUp && (
        <PopUpComponent
          message={popUpMessage}
          open={openPopUp}
          close={() => {
            if (contactUpdate) {
              setOpenModal(!openModal);
              dispatch(setWhichForm("viewAddress"));
              setContactUpdate(false);
            }
            setOpenPopUp(false);
          }}
          result={popupResult}
        ></PopUpComponent>
      )
    );
  };

  const disabledDates = (sellerId) => (date) => {
    // Define your range of dates to be disabled

    //there should be total 14 days between start and end date for scheduled delivery selection including the start & end date.
    const startDate = dateConverter(
      shippingSettings[sellerId]["earliest_shipping_date"]
    );
    const endDate =
      parseInt(shippingSettings[sellerId]["shipping_id"]) !== 3
        ? new Date(
            dateConverter(
              shippingSettings[sellerId]["earliest_shipping_date"]
            ).getTime() +
              13 * 24 * 60 * 60 * 1000
          )
        : dateConverter(shippingSettings[sellerId]["earliest_shipping_date"]);
    // const vacationDates = startDate <= vacationStartDate &&  vacationEndDate >= endDate ;
    let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    //return an array that contains the days of non operating days (nonOperatingDays)
    let nonOperatingDays = days.filter(
      (day) => !checkoutItems[sellerId].seller.operating_day.includes(day)
    );

    const dayOfWeek = (date.getDay() + 6) % 7;
    //return dates thats
    // 1. greater than the start date and less than end date (disable the dates thats not in this range)
    // 2. not inside the vacation dates
    // 3. operating days
    return (
      date >= startDate &&
      date <= endDate &&
      // &&!vacationDates
      !nonOperatingDays.includes(days[dayOfWeek])
    );
  };

  const displayAddress = () => {
    return selectedAddress ? (
      <div className="flex justify-between p-[16px] md:p-[10px] items-start md:items-center md:gap-[6px] bg-paleOrange md:rounded-[4px] w-full h-fit">
        <div className="flex md:items-center gap-[6px] h-fit w-fit">
          <MdOutlineLocationOn className="h-full w-8 md:w-6 md:h-7 mt-[6px] md:mt-0 text-gray-400"></MdOutlineLocationOn>
          <div className="flex flex-col md:flex-row md:items-center font-medium text-[14px] md:text-[16px] leading-6 ">
            <p className="order-1  font-semibold text-[14px] md:text-[16px] leading-6 mr-3 ">
              {selectedAddress.full_name} {selectedAddress.contact_number}
            </p>
            <p className="order-2 md:order-3 text-gray-500 mr-2">
              {selectedAddress.address_details}
            </p>
            {selectedAddress.unit_number && (
              <p className="order-3 md:order-5 text-gray-500">
                {unitHandler(selectedAddress?.unit_number)},
              </p>
            )}

            <p className="order-4 md:order-5 text-gray-500">
              S{selectedAddress.postal_code}
            </p>
            {selectedAddress.set_default === true ? (
              <p className="hidden md:flex order-5 bg-customOrangeButton bg-opacity-44 border px-2 rounded-[6px] md:ml-4 text-[12px]">
                Default
              </p>
            ) : null}
          </div>
        </div>

        {/* for mobile */}
        <div className="flex gap-2">
          {selectedAddress.set_default === true ? (
            <p className="text-[12px] md:hidden order-5 bg-customOrangeButton bg-opacity-44 border px-2 py-1 rounded-[6px]">
              {" "}
              Default{" "}
            </p>
          ) : null}
          <button
            onClick={() => {
              setOpenModal(!openModal);
              dispatch(setWhichForm("viewAddress"));
            }}
            className="order-6 text-[12px] md:text-[16px] text-blue-500 flex items-center gap-1"
          >
            <MdModeEdit></MdModeEdit>
            <span>Change</span>
          </button>
        </div>

        {}
      </div>
    ) : (
      <div className="flex justify-between p-[10px] items-center  md:gap-[6px] bg-red-400 md:rounded-[4px] w-full">
        <div className="flex items-start gap-[6px] h-6 w-fit text-white font-semibold">
          <MdOutlineLocationOn className="flex items-center h-full  w-4  md:w-6 md:h-6"></MdOutlineLocationOn>
          <p className="font-medium text-[14px] md:text-[16px] leading-6 ">
            Add an Address
          </p>
        </div>
        <button
          onClick={() => {
            dispatch(setWhichForm("addAddress"));
            setOpenModal(!openModal);
          }}
          className="md:text-[24px] text-white font-semibold"
        >
          +
        </button>
      </div>
    );
  };

  const displayShipping = () => {
    const textCss = "text-[14px] leading-[21px]";
    return checkoutItems && shippingSettings
      ? //map the seller
        Object.keys(checkoutItems)?.map((sellerId, index) => {
          if (
            Object.keys(checkoutItems[sellerId]).length !== 0 &&
            !isNaN(sellerId)
          ) {
            return (
              <div
                key={index}
                className="flex flex-col items-start gap-4 md:px-4 pb-4 bg-opacity-50 md:border md:border-grey6Border rounded w-full h-fit"
              >
                <div className="flex  gap-5 w-full h-fit items-center md:items-start justify-between md:justify-start mt-3">
                  <div className="flex items-center justify-center gap-3 h-33">
                    <img
                      src={checkoutItems[sellerId]["seller"]?.shop_logo || null}
                      className="w-10 h-10"
                    />
                    <Link
                      to={
                        CustomerRoutes.ShopDetails +
                        checkoutItems[sellerId]["seller"]?.shop_slug +
                        "/"
                      }
                      className="w-fit font-medium text-black  md:h-6 text-[14px] md:text-[18px] leading-6"
                    >
                      {checkoutItems[sellerId]["seller"]?.shop_name ??
                        checkoutItems[sellerId]["seller"]?.business_name ??
                        checkoutItems[sellerId]["seller"]?.individual_name}
                    </Link>
                  </div>
                  <div
                    className="md:flex hidden items-center  h-[33px] w-[83px] gap-1 cp"
                    onClick={() => openChat(checkoutItems[sellerId])}
                  >
                    <img src={chat}></img>
                    <p className="capitalize w-[35px] h-[21px] md:text-[14px] leading-[21px] text-orangeButton">
                      Chat
                    </p>
                  </div>
                  <div
                    className="md:hidden flex items-center  gap-1 cp border p-1 border-gray-300 rounded"
                    onClick={() => openChat(checkoutItems[sellerId])}
                  >
                    <img src={chat} height={20} width={20}></img>
                    <p className="capitalize text-sm leading-[21px] text-black">
                      Chat
                    </p>
                  </div>
                </div>

                {Object.keys(checkoutItems[sellerId]).map((id, index1) => {
                  //map the items
                  if (!isNaN(id)) {
                    return (
                      <div
                        key={index1}
                        className="w-full flex flex-col gap-2 md:gap-5"
                      >
                        <div className="border-t-[0.5px] border-grey6Border "></div>
                        <div
                          key={index1}
                          className="flex items-center gap-2 md:gap-4 w-full"
                        >
                          <div className="flex items-center min-w-[75px] min-h-[75px] w-[105px] h-[105px]">
                            <img
                              src={
                                checkoutItems[sellerId][id]?.product_image ??
                                productImg1
                              }
                              className="w-[75px] h-[75px] mx-auto"
                            ></img>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-[14px] w-full h-full flex-wrap ">
                            <div className="flex flex-col md:flex-row sm:items-center justify-start w-fit  md:gap-[60px]">
                              <Link
                                to={
                                  CustomerRoutes.ProductDetails +
                                  `${checkoutItems[sellerId][id]["slug"]}/`
                                }
                                className="capitalize text-[14px] md:text-[16px] md:w-[200px] font-semibold leading-6 text-black"
                              >
                                {checkoutItems[sellerId][id]["name"]}
                              </Link>
                              {checkoutItems[sellerId][id]?.product_variation
                                ?.length > 0 ? (
                                <div className="flex text-gray-500">
                                  <div className="flex justify-between gap-1 items-center">
                                    <p className="text-[10px] md:text-[14px]">
                                      var:
                                    </p>
                                    {checkoutItems[sellerId][id][
                                      "product_variation"
                                    ].map((variation, index2) => (
                                      <React.Fragment key={index2}>
                                        <p
                                          key={index2}
                                          className="text-[10px] md:text-[14px] whitespace-nowrap"
                                        >
                                          {variation.variation_value}
                                        </p>
                                        {index2 !==
                                          checkoutItems[sellerId][id][
                                            "product_variation"
                                          ].length -
                                            1 && <span>, </span>}
                                      </React.Fragment>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                            <div className="hidden md:flex justify-start  w-[140px]">
                              <p className={textCss + "font-normal"}>
                                Unit Price:{" "}
                                <span className="font-medium">
                                  ${checkoutItems[sellerId][id]["price"]}
                                </span>
                              </p>
                            </div>
                            <div className="hidden md:block w-[140px]">
                              <p className={textCss + "font-normal"}>
                                Quantity:{" "}
                                <span className="font-medium">
                                  {checkoutItems[sellerId][id]["quantity"]}{" "}
                                  Piece
                                </span>
                              </p>
                            </div>
                            <div className="hidden md:block w-[135px]">
                              <p className={textCss + "font-normal"}>
                                Total Price:{" "}
                                <span className="font-medium">
                                  $
                                  {(
                                    checkoutItems[sellerId][id]["price"] *
                                    checkoutItems[sellerId][id]["quantity"]
                                  ).toFixed(2)}{" "}
                                </span>
                              </p>
                            </div>
                            <div className="w-full flex md:hidden items-center justify-between">
                              <p
                                className={textCss + "font-normal font-medium"}
                              >
                                $
                                {(
                                  checkoutItems[sellerId][id]["price"] *
                                  checkoutItems[sellerId][id]["quantity"]
                                ).toFixed(2)}{" "}
                              </p>
                              {/* to do: include increment/decrement buttons for quantity */}
                              <p
                                className={textCss + "font-normal font-medium"}
                              >
                                Qty:
                                <span className="font-medium">
                                  {checkoutItems[sellerId][id]["quantity"]}{" "}
                                  Piece
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}

                {checkoutItems[sellerId]["seller"]["minimum_cart_message"] && (
                  <p className="text-sm text-red-500 mb-3">
                    {checkoutItems[sellerId]["seller"]["minimum_cart_message"]}
                  </p>
                )}

                <div className="md:hidden flex w-full justify-between items-center gap-6 text-sm h-[20px]">
                  <div className="flex gap-2 items-center h-full">
                    <img
                      src={shopVoucherIcon}
                      className="w-5 h-5 md:w-7 md:h-7"
                    ></img>
                    {shippingSettings.sellerId?.["discount"] === "" ||
                    shippingSettings.sellerId?.["discount"] === undefined ? (
                      <p className="font-medium leading-6 text-greyButton">
                        Shop Vouchers
                      </p>
                    ) : (
                      <p className="font-medium leading-6 text-greyButton">
                        ${shippingSettings.sellerId?.["discount"]} Applied
                      </p>
                    )}
                  </div>

                  <button
                    className="flex items-center gap-1 font-medium leading-[21px] text-blue capitalized "
                    onClick={() => handleClick(sellerId)}
                  >
                    More Voucher
                    <MdKeyboardArrowRight />
                  </button>
                </div>

                <div className="md:hidden bg-[#FFF9F0] border border-[#EDCFA3] rounded p-3 w-full ">
                  {groupBuyData?.[sellerId]?.isGroupBuyAvailable ? (
                    <>
                      <p className="mb-1 text-sm">
                        Shipping :{" "}
                        <span className="font-bold">
                          {groupBuyData[sellerId]?.shipping}
                        </span>
                      </p>
                      <p className="mb-1 text-sm">
                        Delivery Date :{" "}
                        <span className="font-bold">
                          {groupBuyData[sellerId]?.deliveryDate}
                        </span>
                      </p>
                      <p className="mb-1 text-sm">
                        Delivery time :{" "}
                        <span className="font-bold">
                          {groupBuyData[sellerId]?.timeslot}
                        </span>
                      </p>
                    </>
                  ) : (
                    <>
                      {checkoutItems &&
                        checkoutItems[sellerId]?.seller?.merchant_shipping &&
                        Object.keys(
                          checkoutItems[sellerId]["seller"]?.merchant_shipping
                        )
                          .sort((a, b) => {
                            return a.shippingOptionId - [b.shippingOptionId];
                          })
                          .map((shippingOptions, index) => {
                            return (
                              <>
                                <div className="flex justify-between items-center my-3">
                                  <div
                                    className="flex gap-5 relative items-center"
                                    key={index}
                                  >
                                    {checkoutItems[sellerId]["seller"][
                                      "merchant_shipping"
                                    ][shippingOptions]["shipping_option_id"] ===
                                      1 && (
                                      <img
                                        src={popularChoiceImg}
                                        alt="popular-choice"
                                        height="15px"
                                        width="60px"
                                        className="absolute bottom-[20px] left-0"
                                      />
                                    )}
                                    <img
                                      width={40}
                                      className="h-3"
                                      src={
                                        checkoutItems[sellerId]["seller"][
                                          "merchant_shipping"
                                        ][shippingOptions][
                                          "shipping_option_id"
                                        ] === 5
                                          ? jtLogo
                                          : uparcel_logo
                                      }
                                    />

                                    <label
                                      className={`text-sm font-semibold ${
                                        checkoutItems[sellerId]["seller"][
                                          "merchant_shipping"
                                        ][shippingOptions][
                                          "shipping_option_id"
                                        ] ===
                                        shippingSettings[sellerId]?.shipping_id
                                          ? "text-orangeButton"
                                          : "text-black"
                                      }`}
                                    >
                                      {
                                        checkoutItems[sellerId]["seller"][
                                          "merchant_shipping"
                                        ][shippingOptions]["name"]
                                      }
                                    </label>
                                  </div>
                                  <input
                                    id={shippingOptions}
                                    key={index}
                                    type="radio"
                                    checked={
                                      checkoutItems[sellerId]["seller"][
                                        "merchant_shipping"
                                      ][shippingOptions]["name"]?.includes(
                                        "Scheduled Delivery"
                                      )
                                        ? shippingSettings[sellerId]
                                            ?.shipping_id === 2 ||
                                          shippingSettings[sellerId]
                                            ?.shipping_id === 4
                                        : shippingSettings[sellerId]
                                            ?.shipping_id ===
                                          parseInt(
                                            checkoutItems[sellerId]["seller"][
                                              "merchant_shipping"
                                            ][shippingOptions][
                                              "shipping_option_id"
                                            ]
                                          )
                                    }
                                    onChange={() => {
                                      shippingHandler(
                                        checkoutItems[sellerId]["seller"][
                                          "merchant_shipping"
                                        ][shippingOptions].next_delivery_date,
                                        sellerId,
                                        "earliest_shipping_date"
                                      );

                                      shippingHandler(
                                        checkoutItems[sellerId]["seller"][
                                          "merchant_shipping"
                                        ][shippingOptions]?.shipping_option_id,
                                        sellerId,
                                        "shipping_id"
                                      );

                                      if (
                                        checkoutItems[sellerId]["seller"][
                                          "merchant_shipping"
                                        ][shippingOptions]
                                          ?.shipping_option_id === 1 ||
                                        checkoutItems[sellerId]["seller"][
                                          "merchant_shipping"
                                        ][shippingOptions]
                                          ?.shipping_option_id === 3
                                      ) {
                                        shippingHandler(
                                          new Date(),
                                          sellerId,
                                          "selectedDate"
                                        );
                                        updateDate(sellerId, new Date());
                                      } else if (
                                        checkoutItems[sellerId]["seller"][
                                          "merchant_shipping"
                                        ][shippingOptions]
                                          ?.shipping_option_id === 5
                                      ) {
                                        shippingHandler(
                                          new Date(
                                            checkoutItems[sellerId]["seller"][
                                              "merchant_shipping"
                                            ][
                                              shippingOptions
                                            ]?.next_delivery_date
                                          ),
                                          sellerId,
                                          "selectedDate"
                                        );
                                        updateDate(sellerId, "");
                                      } else {
                                        shippingHandler(
                                          "",
                                          sellerId,
                                          "selectedDate"
                                        );
                                        updateDate(sellerId, "");
                                      }

                                      shippingHandler(
                                        "",
                                        sellerId,
                                        "selectedTimeSlotId"
                                      );
                                    }}
                                  ></input>
                                </div>

                                {checkoutItems[sellerId]["seller"][
                                  "merchant_shipping"
                                ][shippingOptions]["shipping_option_id"] ===
                                  shippingSettings[sellerId]?.shipping_id && (
                                  <div className="flex flex-col bg-white border border-[#FAE8C9] rounded-md p-2">
                                    <div className="flex justify-between my-1">
                                      <div className="flex items-start gap-2">
                                        <p className="text-xs tracking-tight text-gray-500">
                                          Receive By{" "}
                                          {shippingSettings[sellerId][
                                            "selectedDate"
                                          ] && (
                                            <>
                                              {Object.keys(
                                                shippingSettings
                                              ).map((id, index) => {
                                                let shippingIndex;

                                                if (
                                                  shippingSettings[sellerId]
                                                    ?.shipping_id === 5
                                                ) {
                                                  shippingIndex = checkoutItems[
                                                    sellerId
                                                  ]["seller"][
                                                    "merchant_shipping"
                                                  ].findIndex(
                                                    (item) =>
                                                      item?.shipping_option_id ===
                                                      5
                                                  );
                                                }

                                                if (id === sellerId) {
                                                  return (
                                                    <p
                                                      key={index}
                                                      className="inline font-semibold text-black"
                                                    >
                                                      {shippingSettings[
                                                        sellerId
                                                      ]?.shipping_id === 5
                                                        ? formatDate(
                                                            shippingSettings[
                                                              sellerId
                                                            ]["selectedDate"]
                                                          ) +
                                                          " to " +
                                                          checkoutItems[
                                                            sellerId
                                                          ]["seller"][
                                                            "merchant_shipping"
                                                          ][
                                                            shippingIndex
                                                          ]?.excepted_delivery_end
                                                            ?.split("-")
                                                            ?.reverse()
                                                            ?.join("/")
                                                        : formatDate(
                                                            shippingSettings[
                                                              sellerId
                                                            ]["selectedDate"]
                                                          )}
                                                    </p>
                                                  );
                                                }
                                              })}
                                            </>
                                          )}
                                        </p>
                                        {(shippingSettings[sellerId]
                                          ?.shipping_id === 2 ||
                                          shippingSettings[sellerId]
                                            ?.shipping_id === 4) && (
                                          <div className="relative">
                                              <MdCalendarMonth size={18} className="mb-1 cp text-[#296DFF]"
                                               onClick={() => {
                                                openDatePicker(sellerId);
                                              }} />
                                            {openStates[sellerId] === true && (
                                              <div className="absolute -left-20 z-20">
                                                <DatePicker
                                                  filterDate={disabledDates(
                                                    sellerId
                                                  )}
                                                  excludeDateIntervals={[
                                                    {
                                                      start: getPreviousDate(
                                                        checkoutItems[sellerId]
                                                          .seller
                                                          .vacation_start_date
                                                      ),
                                                      end: new Date(
                                                        checkoutItems[
                                                          sellerId
                                                        ].seller.vacation_end_date
                                                      ),
                                                    },
                                                  ]}
                                                  maxDate={
                                                    parseInt(
                                                      shippingSettings[
                                                        sellerId
                                                      ]["shipping_id"]
                                                    ) !== 3
                                                      ? new Date(
                                                          dateConverter(
                                                            shippingSettings[
                                                              sellerId
                                                            ][
                                                              "earliest_shipping_date"
                                                            ]
                                                          ).getTime() +
                                                            14 *
                                                              24 *
                                                              60 *
                                                              60 *
                                                              1000
                                                        )
                                                      : dateConverter(
                                                          shippingSettings[
                                                            sellerId
                                                          ][
                                                            "earliest_shipping_date"
                                                          ]
                                                        )
                                                  }
                                                  onChange={(date) => {
                                                    shippingHandler(
                                                      date,
                                                      sellerId,
                                                      "selectedDate",
                                                      2
                                                    );
                                                  }}
                                                  inline
                                                />
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-orangeButton text-xs">
                                        $
                                        {groupBuyData?.[sellerId]
                                          ?.isGroupBuyAvailable
                                          ? parseFloat(
                                              groupBuyData?.[sellerId]
                                                ?.shipping_cost
                                            ).toFixed(2)
                                          : shippingSettings[sellerId]
                                          ? parseFloat(
                                              shippingSettings[sellerId][
                                                "shipping_cost"
                                              ]
                                            ).toFixed(2)
                                          : (0).toFixed(2)}
                                      </p>
                                    </div>
                                    {Object.keys(shippingSettings).map(
                                      (id, index) =>
                                        id === sellerId &&
                                        shippingSettings[id].shipping_id ===
                                          3 && (
                                          <p className="my-1 text-xs font-medium">
                                            Ship out in 30 mins
                                          </p>
                                        )
                                    )}
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {shippingSettings[sellerId]
                                        ?.availableTimeSlotId?.length > 0 &&
                                        shippingSettings[sellerId][
                                          "selectedDate"
                                        ] &&
                                        shippingSettings[sellerId]
                                          .shipping_id !== 3 &&
                                        shippingSettings[sellerId][
                                          "availableTimeSlotId"
                                        ]?.map((timeslot, index) => {
                                          return (
                                            <button
                                              key={index}
                                              id={timeslot.id_slot}
                                              className={`${
                                                shippingSettings[sellerId][
                                                  "selectedTimeSlotId"
                                                ] === timeslot.id_slot
                                                  ? "bg-orangeButton text-white font-semibold"
                                                  : "bg-white"
                                              } border p-1 rounded-md w-fill text-center text-xs whitespace-nowrap`}
                                              onClick={() => {
                                                shippingHandler(
                                                  timeslot.shipping_option_id,
                                                  sellerId,
                                                  "shipping_id"
                                                );

                                                shippingHandler(
                                                  timeslot.id_slot,
                                                  sellerId,
                                                  "selectedTimeSlotId"
                                                );
                                              }}
                                            >
                                              {timeFormater(
                                                timeslot.delivery_slot
                                              )}
                                            </button>
                                          );
                                        })}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })}
                    </>
                  )}
                </div>

                {groupBuyData?.[sellerId]?.isGroupBuyAvailable && (
                  <div className="w-full flex justify-between gap-12">
                    <p className="capitalize text-[14px] font-normal">
                      Shipping Cost:
                    </p>
                    <p className="text-orangeButton text-[14px]">
                      $
                      {groupBuyData?.[sellerId]?.isGroupBuyAvailable
                        ? parseFloat(
                            groupBuyData?.[sellerId]?.shipping_cost
                          ).toFixed(2)
                        : shippingSettings[sellerId]
                        ? parseFloat(
                            shippingSettings[sellerId]["shipping_cost"]
                          ).toFixed(2)
                        : (0).toFixed(2)}
                    </p>
                  </div>
                )}

                <div className="md:hidden flex w-full justify-between ">
                  <p className="text-sm mr-4">Total Price</p>
                  <p className="text-[18px] text-orangeButton font-bold">
                    ${" "}
                    {groupBuyData?.[sellerId]?.isGroupBuyAvailable
                      ? (
                          parseFloat(groupBuyData?.[sellerId]?.shipping_cost) +
                          parseFloat(groupBuyData[sellerId]?.seller_total)
                        ).toFixed(2)
                      : Object.keys(shippingSettings).length > 0
                      ? // Check if shippingSettings is defined and not empty
                        shippingSettings[sellerId]
                        ? // Check if sellerId exists in shippingSettings
                          (
                            parseFloat(
                              shippingSettings[sellerId]["shipping_cost"]
                            ) +
                            parseFloat(shippingSettings[sellerId]["subtotal"])
                          ).toFixed(2)
                        : // Handle the case where sellerId doesn't exist in shippingSettings
                          (0).toFixed(2)
                      : // Handle the case where shippingSettings is not defined or is empty
                        ""}
                  </p>
                </div>
                <div className="md:hidden w-full">
                  <div className="w-full border border-dashed"></div>
                  <div className="mt-3 text-sm flex items-center gap-5 h-full w-full justify-between">
                    <label className="w-fit">Message</label>
                    <input
                      type="text"
                      placeholder="Please enter a message"
                      value={shippingSettings.sellerId?.["message"]}
                      className="px-2 "
                      onChange={(event) =>
                        shippingHandler(event, sellerId, "message")
                      }
                    ></input>
                  </div>
                </div>

                {/*
                 1. object.keys  + map function to loop through the array
                */}
                <div className="hidden md:flex flex-col bg-paleOrange2 p-4 items-start md:p-5 gap-3 w-full md:h-fit mt-1">
                  <div>
                    {groupBuyData?.[sellerId]?.isGroupBuyAvailable ? (
                      <div>
                        <p className="mb-1">
                          Shipping :{" "}
                          <span className="font-bold">
                            {groupBuyData[sellerId]?.shipping}
                          </span>
                        </p>
                        <p className="mb-1">
                          Delivery Date :{" "}
                          <span className="font-bold">
                            {groupBuyData[sellerId]?.deliveryDate}
                          </span>
                        </p>
                        <p className="mb-1">
                          Delivery time :{" "}
                          <span className="font-bold">
                            {groupBuyData[sellerId]?.timeslot}
                          </span>
                        </p>
                      </div>
                    ) : (
                      <>
                        {checkoutItems &&
                          checkoutItems[sellerId]?.seller?.merchant_shipping &&
                          Object.keys(
                            checkoutItems[sellerId]["seller"]?.merchant_shipping
                          )
                            .sort((a, b) => {
                              return a.shippingOptionId - [b.shippingOptionId];
                            })
                            .map((shippingOptions, index) => {
                              return (
                                <div
                                  className="flex gap-2 relative"
                                  key={index}
                                >
                                  {checkoutItems[sellerId]["seller"][
                                    "merchant_shipping"
                                  ][shippingOptions]["shipping_option_id"] ===
                                    1 && (
                                    <img
                                      src={popularChoiceImg}
                                      alt="popular-choice"
                                      height="30px"
                                      width="90px"
                                      className="absolute bottom-[20px] -left-[40px]"
                                    />
                                  )}
                                  <input
                                    id={shippingOptions}
                                    key={index}
                                    type="radio"
                                    checked={
                                      checkoutItems[sellerId]["seller"][
                                        "merchant_shipping"
                                      ][shippingOptions]["name"]?.includes(
                                        "Scheduled Delivery"
                                      )
                                        ? shippingSettings[sellerId]
                                            ?.shipping_id === 2 ||
                                          shippingSettings[sellerId]
                                            ?.shipping_id === 4
                                        : shippingSettings[sellerId]
                                            ?.shipping_id ===
                                          parseInt(
                                            checkoutItems[sellerId]["seller"][
                                              "merchant_shipping"
                                            ][shippingOptions][
                                              "shipping_option_id"
                                            ]
                                          )
                                    }
                                    onChange={() => {
                                      shippingHandler(
                                        checkoutItems[sellerId]["seller"][
                                          "merchant_shipping"
                                        ][shippingOptions].next_delivery_date,
                                        sellerId,
                                        "earliest_shipping_date"
                                      );

                                      shippingHandler(
                                        checkoutItems[sellerId]["seller"][
                                          "merchant_shipping"
                                        ][shippingOptions]?.shipping_option_id,
                                        sellerId,
                                        "shipping_id"
                                      );

                                      if (
                                        checkoutItems[sellerId]["seller"][
                                          "merchant_shipping"
                                        ][shippingOptions]
                                          ?.shipping_option_id === 1 ||
                                        checkoutItems[sellerId]["seller"][
                                          "merchant_shipping"
                                        ][shippingOptions]
                                          ?.shipping_option_id === 3
                                      ) {
                                        shippingHandler(
                                          new Date(),
                                          sellerId,
                                          "selectedDate"
                                        );
                                        updateDate(sellerId, new Date());
                                      } else if (
                                        checkoutItems[sellerId]["seller"][
                                          "merchant_shipping"
                                        ][shippingOptions]
                                          ?.shipping_option_id === 5
                                      ) {
                                        shippingHandler(
                                          new Date(
                                            checkoutItems[sellerId]["seller"][
                                              "merchant_shipping"
                                            ][
                                              shippingOptions
                                            ]?.next_delivery_date
                                          ),
                                          sellerId,
                                          "selectedDate"
                                        );
                                        updateDate(sellerId, "");
                                      } else {
                                        shippingHandler(
                                          "",
                                          sellerId,
                                          "selectedDate"
                                        );
                                        updateDate(sellerId, "");
                                      }

                                      shippingHandler(
                                        "",
                                        sellerId,
                                        "selectedTimeSlotId"
                                      );
                                    }}
                                  ></input>
                                  <label className="font-medium">
                                    {
                                      checkoutItems[sellerId]["seller"][
                                        "merchant_shipping"
                                      ][shippingOptions]["name"]
                                    }
                                  </label>
                                  <img
                                    width={50}
                                    className="h-6"
                                    src={
                                      checkoutItems[sellerId]["seller"][
                                        "merchant_shipping"
                                      ][shippingOptions][
                                        "shipping_option_id"
                                      ] === 5
                                        ? jtLogo
                                        : uparcelLogo
                                    }
                                  />

                                  {checkoutItems[sellerId]["seller"][
                                    "merchant_shipping"
                                  ][shippingOptions]?.shipping_option_id ===
                                    5 &&
                                    shippingSettings[sellerId]?.shipping_id ===
                                      5 && (
                                      <p className="italic text-sm mt-2">
                                        Expected delivery between{" "}
                                        {
                                          checkoutItems[sellerId]["seller"][
                                            "merchant_shipping"
                                          ][shippingOptions]?.next_delivery_date
                                        }{" "}
                                        to{" "}
                                        {
                                          checkoutItems[sellerId]["seller"][
                                            "merchant_shipping"
                                          ][shippingOptions]
                                            ?.excepted_delivery_end
                                        }{" "}
                                        including Sundays & PH
                                      </p>
                                    )}
                                </div>
                              );
                            })}
                      </>
                    )}
                  </div>

                  <div className="flex flex-col  sm:flex-row w-full justify-between md:items-center md:h-fit">
                    <div className="grid relative  gap-2 whitespace-nowrap">
                      {shippingSettings[sellerId] &&
                        shippingSettings[sellerId]["shipping_id"] != "" && (
                          <div className="flex gap-4 items-start">
                            {(shippingSettings[sellerId]["shipping_id"] === 2 ||
                              shippingSettings[sellerId]["shipping_id"] ===
                                4) && (
                              <button
                                id={sellerId}
                                className="capitalize text-orangeButton text-[12px] md:text-[14px] leading-6 font-medium "
                                onClick={() => {
                                  openDatePicker(sellerId);
                                  shippingHandler("", sellerId, "selectedDate");
                                  shippingHandler(
                                    "",
                                    sellerId,
                                    "selectedTimeSlotId"
                                  );
                                }}
                              >
                                select date
                              </button>
                            )}

                            {shippingSettings[sellerId]["selectedDate"] && (
                              <div className="flex flex-col">
                                <p className="text-[12px] md:text-[14px] leading-6 text-greyBorder whitespace-nowrap">
                                  Received By{" "}
                                  {Object.keys(shippingSettings).map(
                                    (id, index) => {
                                      let shippingIndex;

                                      if (
                                        shippingSettings[sellerId]
                                          ?.shipping_id === 5
                                      ) {
                                        shippingIndex = checkoutItems[sellerId][
                                          "seller"
                                        ]["merchant_shipping"].findIndex(
                                          (item) =>
                                            item?.shipping_option_id === 5
                                        );
                                      }

                                      if (id === sellerId) {
                                        return (
                                          <p
                                            key={index}
                                            className="inline font-semibold"
                                          >
                                            {shippingSettings[sellerId]
                                              ?.shipping_id === 5
                                              ? formatDate(
                                                  shippingSettings[sellerId][
                                                    "selectedDate"
                                                  ]
                                                ) +
                                                " to " +
                                                checkoutItems[sellerId][
                                                  "seller"
                                                ]["merchant_shipping"][
                                                  shippingIndex
                                                ]?.excepted_delivery_end
                                                  ?.split("-")
                                                  ?.reverse()
                                                  ?.join("/")
                                              : formatDate(
                                                  shippingSettings[sellerId][
                                                    "selectedDate"
                                                  ]
                                                )}
                                          </p>
                                        );
                                      }
                                    }
                                  )}
                                </p>

                                {Object.keys(shippingSettings).map(
                                  (id, index) =>
                                    id === sellerId &&
                                    shippingSettings[id].shipping_id === 3 && (
                                      <p className="text-[14px]">
                                        Within Next 3 Hours
                                      </p>
                                    )
                                )}
                              </div>
                            )}
                          </div>
                        )}

                      {openStates[sellerId] === true &&
                        (shippingSettings[sellerId]["shipping_id"] === 2 ||
                          shippingSettings[sellerId]["shipping_id"] === 4) && (
                          <div className="absolute top-6">
                            <DatePicker
                              filterDate={disabledDates(sellerId)}
                              excludeDateIntervals={[
                                {
                                  start: getPreviousDate(
                                    checkoutItems[sellerId].seller
                                      .vacation_start_date
                                  ),
                                  end: new Date(
                                    checkoutItems[
                                      sellerId
                                    ].seller.vacation_end_date
                                  ),
                                },
                              ]}
                              maxDate={
                                parseInt(
                                  shippingSettings[sellerId]["shipping_id"]
                                ) !== 3
                                  ? new Date(
                                      dateConverter(
                                        shippingSettings[sellerId][
                                          "earliest_shipping_date"
                                        ]
                                      ).getTime() +
                                        14 * 24 * 60 * 60 * 1000
                                    )
                                  : dateConverter(
                                      shippingSettings[sellerId][
                                        "earliest_shipping_date"
                                      ]
                                    )
                              }
                              onChange={(date) => {
                                shippingHandler(
                                  date,
                                  sellerId,
                                  "selectedDate",
                                  2
                                );
                              }}
                              inline
                            />
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="flex gap-14 flex-wrap">
                    <div className="flex flex-wrap md:flex-nowrap gap-4">
                      {shippingSettings[sellerId]?.availableTimeSlotId?.length >
                        0 &&
                        shippingSettings[sellerId]["selectedDate"] &&
                        shippingSettings[sellerId].shipping_id !== 3 &&
                        shippingSettings[sellerId]["availableTimeSlotId"]?.map(
                          (timeslot, index) => {
                            return (
                              <button
                                key={index}
                                id={timeslot.id_slot}
                                className={`${
                                  shippingSettings[sellerId][
                                    "selectedTimeSlotId"
                                  ] === timeslot.id_slot
                                    ? "bg-orangeButton text-white font-semibold"
                                    : "bg-white"
                                } border px-2 py-1 rounded-md w-fill text-center  text-[14px] whitespace-nowrap`}
                                onClick={() => {
                                  shippingHandler(
                                    timeslot.shipping_option_id,
                                    sellerId,
                                    "shipping_id"
                                  );

                                  shippingHandler(
                                    timeslot.id_slot,
                                    sellerId,
                                    "selectedTimeSlotId"
                                  );
                                }}
                              >
                                {timeFormater(timeslot.delivery_slot)}
                              </button>
                            );
                          }
                        )}
                    </div>
                  </div>

                  <div className="border-[0.5px] w-full border-dashed"></div>
                  <div className="w-full flex justify-between md:justify-end gap-12">
                    <p className="capitalize text-[14px] font-normal">
                      Shipping Cost:
                    </p>
                    <p className="text-orangeButton text-[14px]">
                      $
                      {groupBuyData?.[sellerId]?.isGroupBuyAvailable
                        ? parseFloat(
                            groupBuyData?.[sellerId]?.shipping_cost
                          ).toFixed(2)
                        : shippingSettings[sellerId]
                        ? parseFloat(
                            shippingSettings[sellerId]["shipping_cost"]
                          ).toFixed(2)
                        : (0).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-center gap-3 w-full h-fit">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-[10px] h-full w-full md:w-fit order-2 md:order-1">
                      <label className="text-[12px] md:text-[14px]">
                        Message
                      </label>
                      <div className="flex items-center w-[281px] h-full text-[14px] border border-solid rounded-[4px]">
                        <input
                          type="text"
                          value={shippingSettings.sellerId?.["message"]}
                          className="px-2 w-full"
                          onChange={(event) =>
                            shippingHandler(event, sellerId, "message")
                          }
                        ></input>
                      </div>
                    </div>
                    <div className="flex order-1 md:order-2 w-full md:w-fit justify-between md:justify-start">
                      <p className="text-[14px] mr-4">Order Total:</p>
                      <p className="text-[18px] text-orangeButton font-bold">
                        ${" "}
                        {groupBuyData?.[sellerId]?.isGroupBuyAvailable
                          ? (
                              parseFloat(
                                groupBuyData?.[sellerId]?.shipping_cost
                              ) +
                              parseFloat(groupBuyData[sellerId]?.seller_total)
                            ).toFixed(2)
                          : Object.keys(shippingSettings).length > 0
                          ? // Check if shippingSettings is defined and not empty
                            shippingSettings[sellerId]
                            ? // Check if sellerId exists in shippingSettings
                              (
                                parseFloat(
                                  shippingSettings[sellerId]["shipping_cost"]
                                ) +
                                parseFloat(
                                  shippingSettings[sellerId]["subtotal"]
                                )
                              ).toFixed(2)
                            : // Handle the case where sellerId doesn't exist in shippingSettings
                              (0).toFixed(2)
                          : // Handle the case where shippingSettings is not defined or is empty
                            ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex w-full items-center gap-6 h-[20px] md:h-7">
                  <div className="flex gap-2 items-center h-full">
                    <img
                      src={percentageIcon}
                      className="w-5 h-5 md:w-7 md:h-7"
                    ></img>
                    {shippingSettings.sellerId?.["discount"] === "" ||
                    shippingSettings.sellerId?.["discount"] === undefined ? (
                      <p className="font-medium text-[12px] md:text-[16px] leading-6 text-greyButton">
                        voucher available
                      </p>
                    ) : (
                      <p className="font-medium text-[12px] md:text-[16px] leading-6 text-greyButton">
                        ${shippingSettings.sellerId?.["discount"]} Applied
                      </p>
                    )}
                  </div>

                  <button
                    className="flex items-center text-[12px] md:text-[14px] font-medium leading-[21px] text-orangeButton capitalized"
                    onClick={() => handleClick(sellerId)}
                  >
                    More Voucher
                  </button>
                </div>
              </div>
            );
          }
        })
      : null;
  };

  const displayPayment = () => {
    return (
      <div className="max-md:my-6 flex flex-col items-start gap-2 md:gap-5 w-full">
        <div className="flex gap-[6px] items-center">
          <FontAwesomeIcon icon={faCreditCard} className="text-orangeButton" />
          <p className="capitalize font-semibold text-sm md:text-[16px]">
            Payment Method
          </p>
        </div>
        <div className="max-[450px]:w-full md:h-[41px] md:mb-4 text-[14px] font-normal md:font-medium leading-[21px] whitespace-nowrap">
          <p className="flex items-center gap-2 justify-center border px-5 py-[10px] rounded-[4px] md:w-fit h-[41px] bg-orangeButton text-white">
            <FaPlus color="white" /> Credit Card/Debit Card
          </p>
        </div>
      </div>
    );
  };

  const displayVoucher = () => {
    return (
      <div className="flex justify-between items-center max-md:mt-4">
        <div className="flex items-center gap-1 md:h-8 my-2">
          <img src={percentageIcon}></img>
          <button className="font-semibold text-sm md:text-[16px] leading-6">
            uShop Voucher
          </button>
        </div>
        <button
          onClick={() => {
            ushopVoucherHandler();
            setOpenModal(true);
            dispatch(setSellerID(currentSellerId));
            setVoucherSellerId(null);
          }}
          className="hidden md:flex items-center bg-orangeButton rounded-[4px] px-[14px] py-[10px] text-[14px] font-medium leading-[21px] text-white"
        >
          Ushop voucher
        </button>
        <button
          onClick={() => {
            ushopVoucherHandler();
            setOpenModal(true);
            dispatch(setSellerID(currentSellerId));
            setVoucherSellerId(null);
          }}
          className="md:hidden text-sm flex items-center font-medium leading-[21px] text-blue"
        >
          Check Vouchers <MdKeyboardArrowRight />
        </button>
      </div>
    );
  };

  const displayCashback = () => {
    return (
      <div className="max-md:mb-4 mt-2">
        <label
          htmlFor="cashbackCheckbox"
          className="block font-normal text-[14px] leading-6"
        >
          Cashback Balance
        </label>
        <p className="md:block hidden text-[14px] text-[#A0A0A0]">
          Redeemable Cashback Amount: ${redeemableCashbackAmount}
        </p>
        <div className="md:hidden flex items-center justify-between">
          <p className="text-[14px] text-[#A0A0A0]">
            Redeemable Cashback Amount:
          </p>
          <p>${redeemableCashbackAmount}</p>
        </div>
      </div>
    );
  };

  const displayCheckoutTotal = () => {
    return (
      <div className="flex flex-col md:items-end pt-4 md:px-4  md:py-5 w-full ">
        <div className="flex flex-col w-full md:w-[419px] gap-4 text-[14px] font-normal md:font-medium">
          <p className="capitalize font-semibold text-sm md:hidden">
            Price Detail
          </p>
          <div className="flex flex-col items-start gap-4  ">
            {shopVoucherDiscount > 0 && (
              <p className="flex items-center w-full gap-2 md:w-[419px] bg-orange-100 py-[10px] md:p-[6px] border-orange-50 rounded-[2px] text-orange-400">
                <FaCheckCircle />
                {appliedsellerVoucher} Successfully Applied
                <button onClick={() => setIsSellerVoucher(1)}>
                  <IoMdRemoveCircle />
                </button>
              </p>
            )}
            {cashbackMessage && (
              <p className="flex items-center w-full gap-2 md:w-[419px] bg-green-100 py-[10px] md:p-[6px] border-green-50 rounded-[2px] text-green2">
                <FaCheckCircle />
                {appliedUshopVoucher} Successfully Applied
                <button onClick={() => setIsSellerVoucher(0)}>
                  <IoMdRemoveCircle />
                </button>
              </p>
            )}

            <div className="flex justify-between items-start w-full">
              <p className="font-normal">Product Cost</p>
              <p>${productTotal}</p>
            </div>
          </div>

          {productDiscount > 0 && (
            <div className="flex flex-col items-start gap-4  ">
              <div className="flex justify-between items-start w-full">
                <p className="font-normal">Product Discount</p>
                <p className="text-green2"> -${productDiscount}</p>
              </div>
            </div>
          )}
          {shopVoucherDiscount > 0 && (
            <div className="flex flex-col items-start gap-4 ">
              <div className="flex justify-between items-start w-full">
                <p className="font-normal">Shop Voucher</p>
                <p className="text-green2"> -${shopVoucherDiscount}</p>
              </div>
            </div>
          )}
          {appliedCashbackAmount > 0 && (
            <div className="flex flex-col items-start gap-4 ">
              <div className="flex justify-between items-start w-full">
                <p className="font-normal">Applied cashback</p>
                <p className="text-green2"> -${appliedCashbackAmount}</p>
              </div>
            </div>
          )}
          <div className="w-full border border-dashed"></div>
          <div className="flex flex-col items-start gap-4 ">
            <div className="flex justify-between items-start w-full">
              <p className="font-normal">Subtotal</p>

              <p>
                $
                {(
                  parseFloat(cartTotal) -
                  (parseFloat(shopVoucherDiscount) +
                    parseFloat(appliedCashbackAmount) +
                    parseFloat(productDiscount))
                ).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 ">
            <div className="flex justify-between items-start w-full">
              <p className="font-normal">Shipping Charges</p>
              <p>${parseFloat(totalShipping).toFixed(2)}</p>
            </div>
          </div>
          <div className="w-full border border-dashed"></div>
          <div className="flex flex-col items-start gap-4 ">
            <div className="flex justify-between items-start w-full">
              <p className="text-[18px]">Total</p>
              <p className="text-orangeButton text-[21px] font-semibold">
                ${subTotal}
              </p>
            </div>
          </div>
          {totalSaveMessage ? (
            <p className="flex flex-1 items-center md:justify-start justify-center md:items-start gap-4 w-full md:w-[419px] bg-green-100 py-[10px] md:p-[6px] border-green-50 rounded-[2px] text-green2 capitalize">
              You will save ${totalSaveMessage.toFixed(2)} on this order
            </p>
          ) : null}
          {cashbackMessage && (
            <p className="flex flex-1 items-center md:justify-start justify-center md:items-start gap-4 w-full md:w-[419px] bg-green-100 py-[10px] md:p-[6px] border-green-50 rounded-[2px] text-green2 capitalize">
              You will get ${cashbackMessage} cashback on this order
            </p>
          )}
        </div>
        <div className="border-[0.5px]  w-full my-6"></div>
        <div className="hidden md:flex gap-4 justify-center ">
          <Link
            to={CustomerRoutes.MyCart}
            className="p-[10px] bg-white text-black w-[172px] h-[44px] border rounded-[4px] text-4 font-medium leading-6 text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="p-[10px] bg-darkOrange text-white w-[172px] h-[44px] border rounded-[4px] text-4 font-medium leading-6"
            onClick={(event) => placeOrderHandler(event)}
          >
            PLACE ORDER
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {displayModalForms()}
      {displayPopupMessage()}

      {isPlacingOrder ? (
        <PageLoader />
      ) : (
        <div className="flex justify-between items-start md:py-8 gap-10 w-full h-fit">
          <div className="flex flex-col items-start gap-3 md:gap-6 md:leading-6 w-full h-full ">
            <div className="flex items-center md:h-6 w-fit">
              <Link
                to={CustomerRoutes.MyCart}
                className="flex max-md:mt-4 items-center gap-3 capitalize text-greyBorder font-semibold text-[14px] md:text-[16px] md:leading-6 w-fit"
              >
                <BsArrowLeft />
                Back to cart
              </Link>
            </div>
            <div className="hidden md:flex flex-col items-start gap-4 md:h-[27px] w-fit">
              <p className="font-semibold text-[14px] md:text-[18px] leading-[27px] ">
                Check out
              </p>
            </div>

            {displayAddress()}
            {displayShipping()}
          </div>
        </div>
      )}
      <div className="md:block hidden">{displayPayment()}</div>
      {/* voucher section */}
      <div className="md:hidden w-full border border-dashed"></div>
      {displayVoucher()}
      {displayCashback()}
      <div className="md:hidden w-full border border-dashed"></div>
      <div className="md:hidden">{displayPayment()}</div>
      <div className="md:hidden w-full border border-dashed"></div>

      {displayCheckoutTotal()}
      <div className="hidden max-md:flex fixed left-0 right-0 bottom-[1px] w-[110%] h-14 z-20 justify-center">
        <div className="bg-white w-1/2 text-xs flex flex-col gap-0.5 items-end justify-center pr-2 text-gray-500">
          <p>
            Total: &nbsp;
            <span className="text-orangeButton">
              $
              <span className="text-lg">{parseFloat(subTotal).toFixed(2)}</span>
            </span>
          </p>
          {cashbackMessage && (
            <p>
              Cashback to be earned:{" "}
              <span className="text-orangeButton">${cashbackMessage}</span>
            </p>
          )}
        </div>
        <button
          type="submit"
          className="p-[10px] bg-darkOrange text-white w-1/2 flex items-center text-4 font-medium leading-6"
          onClick={(event) => placeOrderHandler(event)}
        >
          PLACE ORDER
        </button>
      </div>
      {showConfirmAge && (
        <ShowConfirmAgePopup
          showPopup={ShowConfirmAgePopup}
          confirmPlacingOrder={confirmPlacingOrder}
          cancelPlacingOrder={cancelPlacingOrder}
        />
      )}
    </div>
  );
}

export default CheckOutCart;

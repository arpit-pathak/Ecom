import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import { CustomerRoutes } from "../../../Routes";
import "./index.css";
import { PopUpComponent } from "../GenericComponents";
import productImg1 from "../../../assets/buyer/productImg1.png";
import ls from "local-storage";

import { useSelector, useDispatch } from "react-redux";
import { setSelectedItems } from "../../redux/reducers/cartReducer";
import {
  retrieveCartQuantity,
  setCartItems,
} from "../../redux/reducers/cartReducer";

import { Modal, ConfirmationPopUp } from "../GenericComponents";
import { MdIosShare } from "react-icons/md";

//icons
import { FaTrash } from "react-icons/fa";
import chat from "../../../assets/buyer/chatSqaure.svg";
import { setPrevUrl } from "../../redux/reducers/prevUrlReducer";
import { USER_TYPE } from "../../../constants/general";
import PromptLoginPopup from "../../utils/PromptLoginPopup";
import { ToastContainer, toast } from "react-toastify";
import { domainUrl } from "../../../apiUrls";

function MyCart() {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const cartQuantity = useSelector((state) => state.cart.cartQuantity);
  const dispatch = useDispatch();
  
  const [totalPrice, setTotal] = useState(null);
  const [selectedItemLength, setSelectedItemLength] = useState(0);
  const [render, setRender] = useState(true);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [openConfirmationPopUp, setOpenConfirmationPopUp] = useState(false);
  const [popUpMessage, setPopUpMessage] = useState(null);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [quantity, setQuantity] = useState(null);

  var cart_unique_id = localStorage.getItem("cart_unique_id");
  const user = JSON.parse(localStorage.getItem("customer"));

  useEffect(()=>{
    let qty = {}
    for (const seller in cartItems) {
      for(const item in cartItems[seller]){
        if(item!=="seller"){
          qty = {...qty, [item] : cartItems[seller][item]?.quantity ?? 1};
        }
      }
    }
    setQuantity({...qty})
  },[cartItems])

  const IndividualCheckBoxStateHandler = (e) => {
    //set render triggers the calculate sum function to perform the calculation
    //true or false doesnt matter, its main purpose is to let react know they need this re-render
    setRender(!render);
    if (e.target.checked === false) {
      const groupCheckbox = document.getElementsByName(
        `checkboxGroup${e.target.getAttribute("group")}`
      );
      //uncheck group checkbox if any of the shop checkbox is false
      groupCheckbox[0].checked = e.target.checked;

      //change selectAllCheckboxes state
      const checkAllCheckboxes = document.querySelectorAll("[name='checkAll']");
      checkAllCheckboxes.forEach(
        (checkbox) => (checkbox.checked = e.target.checked)
      );
      return;
    }
  };

  const groupCheckboxHandler = (e, checkbox) => {
    setRender(!render);
    if (checkbox.id) {
      //check all checkboxes in the same shop
      checkbox.checked = e.target.checked;
      return;
    }
  };

  const processRes = (res, api) => {
    const newCartItem = res.data.data.cart_item;

    if(res.data.result==="FAIL"){
      setOpenPopUp(true)
      setPopUpMessage(res.data.message)
      return;
    }
    if (api === Apis.clearCart) {
      dispatch(setCartItems({}));
      dispatch(retrieveCartQuantity());
    } else {
      dispatch(setCartItems(newCartItem));
      dispatch(retrieveCartQuantity());
    }
  };

  useEffect(() => {
    sumCheckedItems();
  }, [cartItems, render]);

  const sumCheckedItems = useCallback(() => {
    setSelectedItemLength(0);
    var total = 0;
    const checkSingleCheckboxes = document.querySelectorAll(
      "[name='checkSingle']"
    );
    var tempArr = [];
    checkSingleCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        var item = JSON.parse(checkbox.getAttribute("data"));
        tempArr.push(item);
        total += item.price * item.quantity;
        setSelectedItemLength((prevState) => prevState + 1);
      }
    });
    setTotal(total);
  }, [cartItems, render]);

  //group checkbox handler
  const checkOneShop = async (e) => {
    const checkboxes = document.querySelectorAll(
      `[group="${e.target.getAttribute("group")}"]`
    );

    checkboxes.forEach((checkbox) => {
      groupCheckboxHandler(e, checkbox);
    });

    if (e.target.checked === false) {
      //change selectAllCheckboxes state
      const checkAllCheckboxes = document.querySelectorAll("[name='checkAll']");
      checkAllCheckboxes.forEach(
        (checkbox) => (checkbox.checked = e.target.checked)
      );
    }
  };

  const checkAllCheckboxes = (e) => {
    // *= match any element which contain checkboxGroup
    const checkboxGroups = document.querySelectorAll("[name*='checkboxGroup']");
    const checkAllCheckboxes = document.querySelectorAll("[name='checkAll']");
    const checkSingleCheckboxes = document.querySelectorAll(
      "[name='checkSingle']"
    );

    checkAllCheckboxes.forEach((checkAllCheckboxes) => {
      checkAllCheckboxes.checked = e.target.checked;
    });

    checkboxGroups.forEach((checkboxGroup) => {
      checkboxGroup.checked = e.target.checked;
    });

    //all the individual checkbox belong to the selectall group hmmn...
    checkSingleCheckboxes.forEach((checkbox) => {
      groupCheckboxHandler(e, checkbox);
    });
  };

  const removeCartItem = (productId, productVariationId, cartUniqueId) => {
    const formData = new FormData();
    formData.append("id_product", productId);
    formData.append("id_product_variation", productVariationId);
    formData.append("cart_unique_id", cartUniqueId);
    BuyerApiCalls(formData, Apis.clearItem, "POST", {}, processRes);
  };

  const decreaseQuantity = (
    productId,
    productVariationId,
    cartUniqueId,
    quantity,
    groupbuyId
  ) => {
    //call the decrease quantity api only if the quantity is more than 1
    if (quantity > 1) {
      const formData = new FormData();
      formData.append("id_product", productId);
      formData.append("id_product_variation", productVariationId);
      formData.append("cart_unique_id", cartUniqueId);
      formData.append("quantity", 1);
      if (groupbuyId) formData.append("product_group_buy_id", groupbuyId);

      BuyerApiCalls(
        formData,
        Apis.decreaseQuantity,
        "POST",
        user
          ? {
              Authorization: `Bearer ${user.access}`,
            }
          : {},
        processRes
      );
    }
  };

  const increaseQuantity = (productId, productVariationId, cartUniqueId, groupbuyId, quantity, action) => {
    //call the increase quantity api
    const formData = new FormData();
    formData.append("id_product", productId);
    formData.append("id_product_variation", productVariationId);
    formData.append("cart_unique_id", cartUniqueId);
    formData.append("quantity", quantity);

    if(action) formData.append("action", action);

    if(groupbuyId) formData.append("product_group_buy_id", groupbuyId);

    BuyerApiCalls(
      formData,
      Apis.addToCart,
      "POST",
      user
        ? {
            Authorization: `Bearer ${user.access}`,
          }
        : {},
      processRes
    );
  };

  const handleCheckout = () => {
    const checkSingleCheckboxes = document.querySelectorAll(
      "[name='checkSingle']"
    );
    var tempArr = [];
    checkSingleCheckboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        var item = JSON.parse(checkbox.getAttribute("data"));
        tempArr.push(item);
      }
    });
    if (tempArr.length === 0) {
      setPopUpMessage("please select an item to checkout");
      setOpenPopUp(true);
      return;
    }
    var formData = new FormData();
    formData.append("cart_unique_id", cart_unique_id);
    tempArr.map((item) => {
      formData.append("selected_item[]", item.product_variation_id + "");
      formData.append("item_qty[]", item.quantity + "");
    });

    dispatch(setSelectedItems(tempArr));
    ls("selectedItems", tempArr)

    if (!user) {
      setIsOpen(true);
      return;
    } else {
      navigate(CustomerRoutes.CheckOutCart);
    }
  };

  const openChat = (order) => {
    if (user) {
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
    } else setIsOpen(true);
  };

  const copyUrl = (prodSlug) => {
    let linkToShare = domainUrl + "product/" + prodSlug + "/"
    navigator.clipboard.writeText(linkToShare);
    toast.success(`Product Link copied ${linkToShare}`);
  };

  const handleQuantity = (prevValue, e) => {
    increaseQuantity(
      prevValue?.product_id,
      prevValue?.product_variation_id,
      localStorage.getItem(
        "cart_unique_id"
      ),
      prevValue?.product_group_buy_id, 
      e.target.value,
      "manual"
    );
  }

  return (
    <React.Fragment>
      {openPopUp && (
        <PopUpComponent
          message={popUpMessage}
          open={openPopUp}
          close={() => setOpenPopUp(false)}
          result="error"
        ></PopUpComponent>
      )}
      <ToastContainer hideProgressBar={true} autoClose={500} />
      {cartQuantity > 0 ? (
        <div className="flex flex-col justify-start sm:gap-8 gap-2 w-full h-fit">
          <p className="font-semibold text-poppins text-[14px] md:text-[18px] md:leading-[27px] ">
            MY CART ({cartItems ? Object?.keys(cartItems)?.length : 0})
          </p>

          <div className="hidden bg-white max-sm:flex fixed bottom-[2px] w-full pr-5 z-20 justify-center">
              <div className="flex w-full justify-between items-center">
                <div className="flex items-center gap-5">
                  <p className="text-sm font-medium leading-6">
                    Total ({selectedItemLength} Item
                    {selectedItemLength > 1 && "s"})
                  </p>
                  <p className="text-orangeButton font-semibold">
                    ${totalPrice?.toFixed(2)}
                  </p>
                </div>
                <button
                  className="py-2 px-5 uppercase w-fit whitespace-nowrap h-10 text-white text-sm font-medium 
                  bg-darkOrange rounded-[4px]"
                  onClick={() => handleCheckout()}
                >
                  CHECK OUT
                </button>
                {isOpen && (
                  <PromptLoginPopup
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    loginText="LOGIN AND CHECKOUT"
                    signupText="SIGN UP AND CHECKOUT"
                    navigateTo={CustomerRoutes.CheckOutCart}
                    loginClick={() => {
                      dispatch(setPrevUrl(CustomerRoutes.CheckOutCart));
                      handleCheckout();
                    }}
                    signupClick={() => handleCheckout()}
                  />
                )}
              </div>
          </div>

          <div className="flex bg-gray-50 bg-opacity-50 border border-gray-200 rounded-md items-center gap-[8px] h-[41px] py-[10px] pl-4 md:gap-[6px] md:px-[10px]  md:h-12 w-full">
            <input
              type="checkbox"
              className="w-5 h-5 md:w-5 md:h-5 border border-greyBorder"
              defaultChecked={false}
              name="checkAll"
              onClick={(e) => {
                checkAllCheckboxes(e);
              }}
            ></input>
            <p className="font-medium text-[16px] leading-[21px] md:text-[16px] md:leading-[24px] text-greyBorder">
              Select All
            </p>
          </div>
          {/* map the sellers / stores */}
          {cartItems &&
            Object.keys(cartItems)?.map((item, index) => {
              if(isNaN(item)) {
                return null;
              } else {
             return (
                <div
                  key={index}
                  className="flex flex-col flex-wrap bg-gray-50 bg-opacity-50 border rounded-md w-full px-4 pb-4 sm:pt-4 items-start md:gap-5"
                >
                  <div className="flex items-center md:justify-between w-full py-3 gap-5 md:h-[33px]">
                    <div className="flex items-center w-full justify-between md:justify-start gap-6 md:px-0  md:h-[33px]">
                      <div className="flex  gap-5 w-full h-fit justify-between md:justify-start sm:mt-3">
                        <div className="flex items-center justify-center gap-6 h-33 mt-0">
                          <input
                            type="checkbox"
                            className="w-5 h-5 md:w-5 md:h-5 border border-greyBorder pr-4"
                            // checked = {checkedItems[]}
                            defaultChecked={false}
                            key={index}
                            group={item} //to check all the checkbox of same group
                            name={`checkboxGroup${item}`}
                            onClick={(e) => checkOneShop(e)}
                          ></input>
                          <img
                            src={cartItems[item]["seller"]["shop_logo"]}
                            className="w-10 h-10"
                          />

                          <Link
                            to={
                              CustomerRoutes.ShopDetails +
                              cartItems[item]["seller"]["shop_slug"] +
                              "/"
                            }
                            className="w-fit font-medium  md:h-6 text-[14px] text-black md:text-[18px] leading-6"
                          >
                            {cartItems[item]["seller"]["shop_name"] ??
                              cartItems[item]["seller"]["business_name"] ??
                              cartItems[item]["seller"]["individual_name"]}
                          </Link>
                        </div>
                        <div
                          className="flex items-center  h-[33px] w-[83px] gap-1 cp"
                          onClick={() => openChat(cartItems[item])}
                        >
                          <img src={chat} className="w-[20px] h-[20px]"></img>
                          <p className="capitalize w-[35px] h-[21px] text-[12px] md:text-[14px] leading-[21px] text-orangeButton">
                            Chat
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {Object.keys(cartItems[item]).map((product, index) => {
                    if (isNaN(product)) {
                      return null;
                    } else {
                      {
                        return (
                          <div key={index} className="w-full sm:pb-4 md:p-0">
                            <hr className="mb-5 w-full"></hr>
                            <div className="flex flex-col mb-2">
                              <div className="flex items-start md:gap-4 sm:pb-5 pb-2 w-full">
                                <input
                                  type="checkbox"
                                  className="w-5 h-5 min-w-[5] min-h-[5] md:w-5 md:h-5 border-[1px] border-greyBorder mr-2 md:mr-0"
                                  id={
                                    cartItems[item][product][
                                      "product_variation_id"
                                    ]
                                  }
                                  data={JSON.stringify(
                                    cartItems[item][product]
                                  )}
                                  group={item}
                                  key={index}
                                  name="checkSingle"
                                  defaultChecked={false}
                                  onClick={(e) =>
                                    IndividualCheckBoxStateHandler(e)
                                  }
                                ></input>
                                <div className="flex items-start md:gap-6 h-fill w-fit">
                                  <div className="w-[97px] h-[103px] mr-[11px] md:mr-0">
                                    {/* {cartItems[item][product]
                                        .product_image ? ( */}
                                    <img
                                      src={
                                        cartItems[item][product].product_image
                                          ? cartItems[item][product]
                                              .product_image
                                          : productImg1
                                      }
                                      className="w-[97px] h-[103px] md:w-full md:h-full rounded"
                                    ></img>
                                    {/* ) : (
                                        <div className="w-full h-full skeleton-bg"></div>
                                      )} */}
                                  </div>
                                  <div className="flex flex-col gap-3 items-start w-fit md:h-fill">
                                    <div className="flex  items-start justify-between sm:gap-3 md:max-h-[78px]">
                                      <Link
                                        to={
                                          CustomerRoutes.ProductDetails +
                                          `${cartItems[item][product]["slug"]}/`
                                        }
                                        className="text-[14px] md:text-[16px] w-[150px] sm:w-fit font-semibold text-black"
                                      >
                                        {cartItems[item][product]["name"]}
                                      </Link>
                                      {cartItems[item][product][
                                        "product_variation"
                                      ].length > 0 ? (
                                        <div className="flex text-gray-500">
                                          <p>
                                            (
                                            {cartItems[item][product][
                                              "product_variation"
                                            ].map((variation, index) => (
                                              <span
                                                key={index}
                                                className="text-[14px] md:text-[16px] "
                                              >
                                                {variation.variation_value}
                                              </span>
                                            ))}
                                            )
                                          </p>
                                        </div>
                                      ) : null}
                                    </div>
                                    {cartItems[item][product]
                                      ?.product_group_buy_id ? (
                                      <div className="flex sm:justify-center items-center sm:gap-[20px] gap-[10px] w-fit h-full max-sm:flex-wrap">
                                        <div className="flex justify-center items-center w-fit gap-[3px] md:gap-[10px] text-[12px] md:text-[14px]  leading-[18px] md:leading-[21px]">
                                          <p className=" font-normal text-greyBorder capitalize md:text-[14px]">
                                            Unit Price
                                          </p>
                                          <p className="font-bold line-through">
                                            $
                                            {
                                              cartItems[item][product][
                                                "original_price"
                                              ]
                                            }
                                          </p>
                                        </div>

                                        <p
                                          className={`${
                                            cartItems[item][product]
                                              ?.product_group_buy_detail
                                              ?.group_buy_cart_price !==
                                            cartItems[item][product]
                                              ?.product_group_buy_detail
                                              ?.success_discount_price
                                              ? ""
                                              : "line-through"
                                          } font-bold max-sm:text-sm`}
                                        >
                                          {cartItems[item][
                                            product
                                          ]?.product_group_buy_detail?.group_buy_price.toFixed(
                                            2
                                          )}
                                        </p>

                                        <p
                                          className={`${
                                            cartItems[item][product]
                                              ?.product_group_buy_detail
                                              ?.group_buy_cart_price !==
                                            cartItems[item][product]
                                              ?.product_group_buy_detail
                                              ?.success_discount_price
                                              ? "text-slate-400"
                                              : "text-black"
                                          }  font-bold max-sm:text-sm`}
                                        >
                                          {cartItems[item][
                                            product
                                          ]?.product_group_buy_detail?.success_discount_price.toFixed(
                                            2
                                          )}
                                        </p>

                                        {cartItems[item][product]
                                          ?.product_group_buy_detail
                                          ?.group_buy_cart_price !==
                                          cartItems[item][product]
                                            ?.product_group_buy_detail
                                            ?.success_discount_price && (
                                          <div
                                            className="text-white flex justify-center items-center
                                        h-8 rounded-md px-5 bg-[#E5E5E5] max-sm:text-[11px]"
                                          >
                                            Not yet unlocked
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="flex justify-center items-center gap-[10px] w-fit h-full">
                                        <div className="flex justify-center items-center w-fit gap-[3px] md:gap-[10px] text-[12px] md:text-[14px]  leading-[18px] md:leading-[21px]">
                                          <p className=" font-normal text-greyBorder capitalize md:text-[14px]">
                                            Unit Price
                                          </p>
                                          <p className="font-bold max-sm:text-sm">
                                            ${cartItems[item][product]["price"]}
                                          </p>
                                        </div>
                                        {cartItems[item][product][
                                          "product_per_discount"
                                        ] &&
                                          Math.ceil(
                                            cartItems[item][product][
                                              "product_per_discount"
                                            ]
                                          ) !== 0 && (
                                            <p className="line-through text-slate-400 text-[12px] ">
                                              $
                                              {
                                                cartItems[item][product][
                                                  "original_price"
                                                ]
                                              }
                                            </p>
                                          )}

                                        {cartItems[item][product][
                                          "product_per_discount"
                                        ] &&
                                          Math.ceil(
                                            cartItems[item][product][
                                              "product_per_discount"
                                            ]
                                          ) !== 0 && (
                                            <p className="hidden md:block rounded-lg px-2 py-1 bg-red-400 text-white text-[12px] font-semibold">
                                              {Math.ceil(
                                                cartItems[item][product][
                                                  "product_per_discount"
                                                ]
                                              )}
                                              % off
                                            </p>
                                          )}
                                      </div>
                                    )}

                                    {/* include group buy details */}
                                    {cartItems[item][product]
                                      ?.product_group_buy_id && (
                                      <div className="h-fill mb-2">
                                        <p className="font-bold text-orangeButton text-[11px] sm:text-sm">
                                          In your group buy now
                                        </p>
                                        <div className="flex gap-1 items-center">
                                          <div className="customer-progress sm:min-w-[300px] min-w-[150px]">
                                            <div
                                              className="customer-progress-bar"
                                              role="progressbar"
                                              style={{
                                                paddingTop: "5px",
                                                width: `${
                                                  (cartItems[item][product]
                                                    ?.product_group_buy_detail
                                                    ?.total_group_buy_sold_qty /
                                                    cartItems[item][product]
                                                      ?.product_group_buy_detail
                                                      ?.max_campaign_qty) *
                                                  100
                                                }%`,
                                                fontWeight: "500",
                                                color: "white",
                                              }}
                                              aria-valuenow={
                                                cartItems[item][product]
                                                  ?.product_group_buy_detail
                                                  ?.total_group_buy_sold_qty
                                              }
                                              aria-valuemin="0"
                                              aria-valuemax={
                                                cartItems[item][product]
                                                  ?.product_group_buy_detail
                                                  ?.max_campaign_qty
                                              }
                                            >
                                              {cartItems[item][product]
                                                ?.product_group_buy_detail
                                                ?.total_group_buy_sold_qty === 0
                                                ? ""
                                                : cartItems[item][product]
                                                    ?.product_group_buy_detail
                                                    ?.total_group_buy_sold_qty}
                                            </div>
                                          </div>
                                          <p className="text-red-500 sm:text-sm mr-3 text-[11px]">
                                            <span className="font-semibold">
                                              ${" "}
                                              {parseFloat(
                                                cartItems[item][product]
                                                  ?.product_group_buy_detail
                                                  ?.success_discount_price
                                              ).toFixed(2)}
                                            </span>{" "}
                                            <br />
                                            Special Deal
                                            <br /> Price
                                          </p>
                                          <div
                                            className="flex gap-1 items-center cp max-sm:hidden"
                                            onClick={() =>
                                              copyUrl(
                                                cartItems[item][product]?.slug
                                              )
                                            }
                                          >
                                            <MdIosShare size={25} />
                                            <p className="text-[11px] sm:text-sm font-bold">
                                              Share invites to <br />
                                              join your group buy
                                            </p>
                                          </div>
                                        </div>
                                        <p className="text-orangeButton text-[11px] sm:text-sm">
                                          <span className="font-bold">
                                            {
                                              cartItems[item][product]
                                                ?.product_group_buy_detail
                                                ?.total_group_buy_sold_qty
                                            }
                                          </span>{" "}
                                          units purchased by your Group
                                        </p>
                                        <div
                                          className="flex gap-1 mt-4 items-center cp sm:hidden"
                                          onClick={() =>
                                            copyUrl(
                                              cartItems[item][product]?.slug
                                            )
                                          }
                                        >
                                          <MdIosShare size={25} />
                                          <p className="text-[10px] sm:text-sm font-bold">
                                            Share invites to <br />
                                            join your group buy
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    <div className="flex items-center gap-7 w-full h-[34px]">
                                      <div className="flex gap-[5px] justify-between items-center border-[0.5px] p-[5px] rounded-[4px] w-[95px] h-[32px] border-solid border-gray-400">
                                        <div className="flex w-6 h-6 bg-orangeButton items-center justify-center rounded-[2px]">
                                          <button
                                            className="text-center text-white mx-auto"
                                            onClick={() => {
                                              let qty = parseInt(
                                                quantity?.[product]
                                              );
                                              if(qty > 1){
                                              setQuantity({
                                                ...quantity,
                                                [product]: qty - 1,
                                              });
                                              decreaseQuantity(
                                                cartItems[item][product][
                                                  "product_id"
                                                ],
                                                cartItems[item][product][
                                                  "product_variation_id"
                                                ],
                                                localStorage.getItem(
                                                  "cart_unique_id"
                                                ),
                                                cartItems[item][product][
                                                  "quantity"
                                                ],
                                                cartItems[item][product]
                                                  ?.product_group_buy_id
                                              );
                                            }
                                            }}
                                          >
                                            -
                                          </button>
                                        </div>
                                        {/* quantity */}
                                        <div className="flex items-center">
                                          <input
                                            value={quantity?.[product] ?? 1}
                                            onChange={(e) => {
                                              setQuantity({
                                                ...quantity,
                                                [product]: e.target.value,
                                              });
                                              if (e.target.value) {
                                                handleQuantity(
                                                  cartItems[item][product],
                                                  e
                                                );
                                              }
                                            }}
                                            name="quantity"
                                            className="!w-8 text-center"
                                          />
                                        </div>
                                        <div className="flex w-6 h-6 bg-orangeButton items-center justify-center rounded-[2px]">
                                          <button
                                            className="text-center text-white mx-auto"
                                            onClick={() => {
                                              let qty = parseInt(
                                                quantity?.[product]
                                              );
                                              setQuantity({
                                                ...quantity,
                                                [product]: qty + 1,
                                              });
                                              increaseQuantity(
                                                cartItems[item][product][
                                                  "product_id"
                                                ],
                                                cartItems[item][product][
                                                  "product_variation_id"
                                                ],
                                                localStorage.getItem(
                                                  "cart_unique_id"
                                                ),
                                                cartItems[item][product]
                                                  ?.product_group_buy_id,
                                                1
                                              );
                                            }}
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>

                                      <div className="hidden md:flex items-start gap-7 w-fit h-full">
                                        <button
                                          className="flex flex-1 items-center gap-2 w-full text-red-500 h-full text-[14px]"
                                          onClick={() => {
                                            removeCartItem(
                                              cartItems[item][product][
                                                "product_id"
                                              ],
                                              cartItems[item][product][
                                                "product_variation_id"
                                              ],
                                              localStorage.getItem(
                                                "cart_unique_id"
                                              )
                                            );
                                          }}
                                        >
                                          <FaTrash className="w-6 h-6" />
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <hr className="w-full border-gray-300 my-3 sm:my-5"></hr>

                            <button
                              className="max-sm:flex hidden w-40 items-center justify-center py-[5px] gap-2 border 
                              border-orangeButton rounded-[4px] mb-3 "
                              onClick={() => {
                                removeCartItem(
                                  cartItems[item][product]["product_id"],
                                  cartItems[item][product][
                                    "product_variation_id"
                                  ],
                                  localStorage.getItem("cart_unique_id")
                                );
                              }}
                            >
                              <FaTrash className="bg-white text-orangeButton" />
                              <p className="w-max text-orangeButton">Remove</p>
                            </button>
                          </div>
                        );
                      }
                    }
                  })}

                  {cartItems[item]["seller"]["minimum_cart_message"] && (
                    <p className="text-sm text-red-500">
                      {cartItems[item]["seller"]["minimum_cart_message"]}
                    </p>
                  )}
                </div>
              );
              }
            })}
          <div className="w-full md:flex flex-row justify-between items-center py-5 gap-6">
            <div className="hidden md:flex flex-row gap-6 items-center">
              <div className="flex gap-2 flex-row  items-center">
                {/* <OrangeCheckbox /> */}

                <div className="flex items-center gap-[6px] h-[41px] py-[10px] pl-4 md:gap-[6px] md:px-[10px]  md:h-12 w-full">
                  <input
                    type="checkbox"
                    className="w-5 h-5 md:w-5 md:h-5 border border-greyBorder"
                    defaultChecked={false}
                    name="checkAll"
                    onClick={(e) => {
                      checkAllCheckboxes(e);
                    }}
                  ></input>
                  <p className="font-medium text-[16px] leading-[21px] md:text-[16px] md:leading-[24px] text-greyBorder">
                    Select All
                  </p>
                </div>
              </div>
              <button
                // onClick={() => clearCart()}
                onClick={() => setOpenConfirmationPopUp(true)}
                className="flex flex-1 items-center gap-2 w-40 text-red-500 h-full text-[14px]"
              >
                <FaTrash className="w-6 h-6" />
                Remove All
              </button>
            </div>

            <div className="hidden sm:flex md:gap-[52px] w-full md:w-fit justify-between md:justify-start">
              <div className="flex items-center gap-5">
                <p className="text-[15px] md:text-[16px] font-medium leading-6">
                  Total ({selectedItemLength} Item
                  {selectedItemLength > 1 && "s"})
                </p>
                <p className="text-orangeButton text-[18px] md:text-[21px] font-semibold">
                  ${totalPrice?.toFixed(2)}
                </p>
              </div>
              <button
                className="py-2 px-5 uppercase w-fit whitespace-nowrap h-[41px] text-white text-[16px] font-medium bg-darkOrange rounded-[4px]"
                onClick={() => handleCheckout()}
              >
                CHECK OUT
              </button>
              {openConfirmationPopUp && (
                <Modal open={openConfirmationPopUp} width="562">
                  <ConfirmationPopUp
                    close={() => setOpenConfirmationPopUp(false)}
                  ></ConfirmationPopUp>
                </Modal>
              )}
              {isOpen && (
                <PromptLoginPopup
                  isOpen={isOpen}
                  setIsOpen={setIsOpen}
                  loginText="LOGIN AND CHECKOUT"
                  signupText="SIGN UP AND CHECKOUT"
                  navigateTo={CustomerRoutes.CheckOutCart}
                  loginClick={() => {
                    dispatch(setPrevUrl(CustomerRoutes.CheckOutCart));
                    handleCheckout();
                  }}
                  signupClick={() => handleCheckout()}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center capitalize gap-4 my-auto h-[400px]">
          <p>Your shopping cart is empty</p>
          <Link
            to={CustomerRoutes.Landing}
            className="px-4 py-2 bg-red-500 text-white"
          >
            Go Shopping Now
          </Link>
        </div>
      )}
    </React.Fragment>
  );
}

export default MyCart;

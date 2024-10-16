import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

//images and icons
import discountImg from "../../../assets/buyer/top-deals-discount.svg";
import productImg1 from "../../../assets/buyer/productImg1.png";
import { trimName } from "../../../utils/general";
import { toast } from "react-toastify";
import { Apis, BuyerApiCalls } from "../../utils/ApiCalls";
import { CustomerRoutes } from "../../../Routes";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  retrieveCartQuantity,
  setCartItems,
} from "../../redux/reducers/cartReducer";
import { PopUpComponent } from "../GenericComponents";

const TopDealProductCards = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("customer"));

  const [quantity, setQuantity] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [popUpMessage, setPopUpMessage] = useState(false);
  const [popUpIcon, setPopUpIcon] = useState(null);

  const currentStock = product.variations?.stock;

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
          toast.error("Reached maximum stocks available");
        }, 1000);
      }
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
    formData.append("id_product", product.id_product);
    formData.append("quantity", qty ? qty : quantity);
    formData.append(
      "id_product_variation",
      product.variations?.id_product_variation
    );

    // if (choice !== 1 && type === "groupBuy")
    //   formData.append(
    //     "product_group_buy_id ",
    //     groupBuyDetail?.id_product_group_buy
    //   );

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
            (res) => {
              const newCartItem = res.data.data.cart_item;
              if (newCartItem !== undefined) {
                dispatch(setCartItems(newCartItem));
                dispatch(retrieveCartQuantity());
              }
              return;
            }
          );
        } else {
          if (type === "groupBuy") {
            // setShowGroupBuyPopup(false);
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
    console.log("lok", "add to cart");
  };

  return (
    <div
      className="relative flex flex-col h-fit bg-white border-[1px] border-[#E8E8E8] rounded cp hover:border hover:shadow-md
      hover:border-grey4Border hover:top-[-2px] ease-in duration-300 group"
      onClick={() =>
        navigate(CustomerRoutes.ProductDetails + `${product.slug}/`)
      }
    >
      {/* cart icon on hover */}
      <div className="absolute bottom-0 left-0 right-0 text-white flex flex-col items-center justify-center opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300 ease-in-out p-4 z-10">
        {/* {currentStock && (
          <p className="font-normal textNormal text-black">
            {currentStock} Product Available
          </p>
        )} */}

        <div className="flex w-full mb-2 rounded">
          <button
            className="bg-white w-[25%] text-[#F5AB35] text-base leading-[19px] py-2 px-[1px] border border-[#F5AB35]"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              handleQuantity("decrement");
            }}
          >
            -
          </button>
          <input
            value={quantity}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleQuantity(e.target.value)}
            name="quantity"
            className="text-center w-[50%] py-2 border-t border-b border-[#F5AB35]"
          />
          <button
            className="bg-white w-[25%] text-[#F5AB35] text-base leading-[19px] py-2 px-[1px] border border-[#F5AB35]"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click
              handleQuantity("increment");
            }}
          >
            +
          </button>
        </div>

        <button
          className="bg-[#F5AB35] text-white text-base leading-[19px] py-[9px] w-full rounded"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click from firing
            addToCartHandler();
          }}
        >
          Add To Cart
        </button>
      </div>

      {isOpen && (
        <PopUpComponent
          message={popUpMessage}
          open={isOpen}
          close={() => setIsOpen(false)}
          result={popUpIcon}
          link={{ link: CustomerRoutes.MyCart, label: "cart" }}
        ></PopUpComponent>
      )}

      <div className="flex flex-col px-4 pt-3 pb-1 h-[100px] md:h-[114px] justify-between">
        <p className="capitalize text-black w-full break-normal text-sm font-medium
                  overflow-hidden text-ellipsis max-[530px]:text-xs max-[415px]:text-[10px]
                  h-[38px] flex flex-col justify-start leading-tight">
          {trimName(product.name, 50)}
        </p>

        <div className="flex flex-col">
          <div className="flex flex-wrap pt-1 md:pt-1">
            <p className="text-[#FF9100] text-poppins flex items-center">
              {/* <FaDollarSign size={30} /> */}
              <span className="font-semibold text-lg leading-8 md:text-[26px] max-[530px]:text-sm max-[415px]:text-sm">
                $ {product.product_price?.toFixed(2)}
              </span>
            </p>
            <p className="pl-2 my-1 mr-3 text-[#999999] relative">
              <span className="text-[9px] md:text-xs lg:text-sm line-through text-[#999999] relative bottom-0">
                ${product.product_original_price}
              </span>
            </p>
          </div>
          <div className="relative w-full">
            <img
              src={discountImg}
              alt="discount-icon"
              className="w-[64px] h-[13px] md:w-[88px] md:h-[18px] object-contain"
            />
            <p className="absolute text-[9px] md:text-xs top-[0.5px] md:top-[1.5px] left-1 md:left-2 text-white">
              {product.product_discount}
              {"% "} off
            </p>
          </div>
        </div>
      </div>

      <div className="w-full mt-2">
        <img
          src={product?.cover_image?.list_img ?? productImg1}
          alt="prod-img"
          className="w-full h-[170px] md:h-[250px]"
        />
      </div>
    </div>
  );
};

export default TopDealProductCards;

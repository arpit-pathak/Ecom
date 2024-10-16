import { ImCross } from "react-icons/im";
import { useEffect, useState } from "react";
import { Apis, BuyerApiCalls } from "../../../utils/ApiCalls";
import { useDispatch, useSelector } from "react-redux";
import { PopUpComponent } from "../../GenericComponents";
import {
  setclaimedShopVouchers,
  setclaimedUshopVouchers,
} from "../../../redux/reducers/voucher";
import { setWhichForm } from "../../../redux/reducers/addressReducer";
import voucherIcon from "../../../../assets/buyer/voucher.svg";
import greyIcon from "../../../../assets/buyer/greyVoucher.svg";
//

export default function ViewApplyVoucherForm({
  close,
  type,
  setSubTotal,
  setCartTotal,
  shippingHandler,
  setShopVoucherDiscount,
  setCashbackMessage,
  setAppliedUshopVoucher,
  setAppliedSellerVoucher,
  setAppliedUshopVoucherID,
  setAppliedSellerVoucherID,
}) {
  const dispatch = useDispatch();
  const claimedShopVouchers = useSelector(
    (state) => state.voucher.claimedShopVouchers
  );
  const claimedUshopVouchers = useSelector(
    (state) => state.voucher.claimedUshopVouchers
  );
  const sellerId = useSelector((state) => state.voucher.sellerID);
  const user = JSON.parse(localStorage.getItem("customer"));
  const cart_unique_id = localStorage.getItem("cart_unique_id");
  const [tempSelectedVoucherId, setTempSelectedVoucherId] = useState(null);
  const [popupResult, setPopupResult] = useState(null);
  const [popupMessage, setPopupMessage] = useState(null);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [allRadioButtonsDisabled, setAllRadioButtonsDisabled] = useState(true);
  const [viewVoucherAppliedMessage, setViewVoucherAppliedMessage] =
    useState(false);

  useEffect(() => {
    type === "ushop" &&
      BuyerApiCalls(
        {},
        Apis.retrieveUshopVoucher + "claimed/",
        "GET",
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.access}`,
        },
        processRes
      );
    type === "shop" &&
      BuyerApiCalls(
        {},
        Apis.retrieveShopVoucher + `claimed/${sellerId}/`,
        "GET",
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.access}`,
        },
        processRes
      );
  }, []);

  const processRes = (res, api) => {
    if (api === Apis.retrieveUshopVoucher + "claimed/") {
      if (res.data.data.length > 0) {
        dispatch(setclaimedUshopVouchers(res.data.data));
      } else {
        dispatch(setclaimedUshopVouchers([]));
      }
      return;
    }
    if (api.includes(Apis.retrieveShopVoucher + "claimed/")) {
      if (res.data.data.length > 0) {
        dispatch(setclaimedShopVouchers(res.data.data));
      } else {
        dispatch(setclaimedShopVouchers([]));
      }

      return;
    }
    if (api === Apis.checkoutUpdateCart) {
      if (res.data) {
        if (res.data.result === "FAIL") {
          setPopupMessage(res.data.message);
          setPopupResult("error");
          setOpenPopUp(true);
          return;
        }

        setSubTotal(res.data.data.subtotal);
        setCartTotal(res.data.data.cart_total);
        setViewVoucherAppliedMessage(true);
        close();
        if (type === "ushop") {
          setCashbackMessage(
            res.data.data?.cart_item["ushop_detail"]["total_cashback"]
          );
          setAppliedUshopVoucher(
            res.data.data.cart_item["ushop_detail"].voucher_name
          );
          setAppliedUshopVoucherID(
            res.data.data.cart_item["ushop_detail"].voucher_id
          );
        } else {
          setShopVoucherDiscount(res.data.data?.total_discount);
          setAppliedSellerVoucher(
            res.data.data.cart_item[sellerId].seller.voucher_name
          );
          setAppliedSellerVoucherID(
            res.data.data.cart_item[sellerId].seller.voucher_id
          );
          shippingHandler(
            res.data.data.cart_item[sellerId]["seller"]["discount"],
            sellerId,
            "discount"
          );
        }

        close();
      }
    }
  };
  const voucherHandler = (voucherID, voucherType) => {
    //voucher api call
    const voucherFormData = new FormData();
    voucherFormData.append("update_part", "voucher");
    voucherFormData.append("cart_unique_id", cart_unique_id);
    //if there is a voucher selected
    if (voucherID) {
      voucherFormData.append("voucher_code_id", parseInt(voucherID));
      //seller voucher
      if (sellerId) {
        voucherFormData.append("is_seller_voucher", voucherType);
        voucherFormData.append("seller_id", sellerId);

        //shop voucher
      } else {
        voucherFormData.append("is_seller_voucher", voucherType);
      }

      BuyerApiCalls(
        voucherFormData,
        Apis.checkoutUpdateCart,
        "POST",
        {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${user.access}`,
        },
        processRes
      );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {openPopUp && (
        <PopUpComponent
          message={popupMessage}
          open={openPopUp}
          close={() => setOpenPopUp(false)}
          result={popupResult}
        ></PopUpComponent>
      )}
      <div className={` flex justify-between w-full min-w-[300px] md:min-w-[400px]`}>
        <p className="inline font-bold text-xl">
          {type === "ushop" ? "Platform Vouchers" : "Shop Vouchers"}
        </p>
        <button
          className="inline"
          onClick={() => {
            close();
          }}
        >
          <ImCross></ImCross>
        </button>
      </div>

      {
        <div className="flex flex-col gap-3 h-full">
          {(type === "shop" && claimedShopVouchers?.length > 0) ||
          (type === "ushop" && claimedUshopVouchers?.length > 0) ? (
            <p className="text-[14px]">Select Voucher</p>
          ) : (
            <p className="text-[14px]">No Voucher Available</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {type === "ushop" &&
              claimedUshopVouchers.length > 0 &&
              claimedUshopVouchers.map((voucher, index) => {
                return (
                  <div
                    key={index}
                    className="flex flex-col items-start gap-2 w-fit h-fit"
                  >
                    <div className="flex items-center gap-1 h-fit w-full">
                      <input
                        className="w-4 h-4"
                        type="radio"
                        checked={voucher.id_voucher === tempSelectedVoucherId}
                        value={voucher.id_voucher}
                        onChange={() => {
                          if(voucher.is_redeem !== "Y"){
                            setTempSelectedVoucherId(voucher.id_voucher);
                            setAllRadioButtonsDisabled(false);
                          }
                        }}
                        disabled={voucher.is_redeem === "Y" ? true : false}
                      ></input>
                      <div
                        className={`relative flex flex-col w-[313px] h-[100px]  gap-1 text-white p-2 ${
                          voucher.is_redeem === "Y" ? "opacity-30" : ""
                        } `}
                        onClick={() => {
                          if(voucher.is_redeem !== "Y"){
                            setTempSelectedVoucherId(voucher.id_voucher);
                            setAllRadioButtonsDisabled(false);
                          }
                        }}
                      >
                        <img
                          src={
                            voucher.usage_amount === 0 ? greyIcon : voucherIcon
                          }
                          alt="Platform Voucher Icon"
                        ></img>
                        <p
                          className="absolute mt-2 ml-4 font-bold text-[16px]"
                        >
                          {voucher.voucher_name}
                        </p>
                        <p
                          className={`absolute w-[180px] top-[40px]  ml-4  font-medium text-[10px] ${
                            voucher.is_redeem === "Y" ? "opacity-50" : ""
                          }`}
                        >
                          Min. spend ${voucher.minimum_spend} Capped at $
                          {voucher.maximum_discount}
                        </p>
                        <p
                          className="absolute bottom-3 text-[10px] ml-4  text-3 capitalize"
                        >
                          Valid Till {voucher.to_date}
                        </p>
                        {voucher.usage_amount === 0 && (
                          <p className="absolute bottom-1 right-[20px] text-[10px] text-3 capitalize w-[60px]">
                            Fully Redeemed
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            {type === "shop" &&
              claimedShopVouchers.length > 0 &&
              claimedShopVouchers.map((voucher, index) => {
                return (
                  <div
                    key={index}
                    className="flex flex-col items-start gap-2 w-fit h-fit md:"
                  >
                    <div className="flex items-center gap-1 h-fit w-full">
                      <input
                        className="w-4 h-4"
                        type="radio"
                        id="couponButton"
                        checked={voucher.id_voucher === tempSelectedVoucherId}
                        value={voucher.id_voucher}
                        disabled={voucher.is_redeem === "Y" ? true : false}
                        onChange={() => {
                          if(voucher.is_redeem !== "Y"){
                            setTempSelectedVoucherId(voucher.id_voucher);
                            setAllRadioButtonsDisabled(false);
                          }
                        }}
                      ></input>
                      <div className="relative flex flex-col w-[313px] h-[100px] text-white p-2"
                          onClick={() => {
                            if(voucher.is_redeem !== "Y"){
                              setTempSelectedVoucherId(voucher.id_voucher);
                              setAllRadioButtonsDisabled(false);
                            }
                          }}>
                        <img
                          src={voucherIcon}
                          alt="Seller Voucher Icon"
                        ></img>
                        <div
                          className="absolute mt-2 ml-4 font-bold text-[16px]"
                        >
                          <p >{voucher.voucher_name}</p>
                          <p
                          className="w-[180px] mb-3 font-medium text-[10px]"
                        >
                          Min. spend ${voucher.minimum_spend} Capped at $
                          {voucher.maximum_discount}
                        </p>
                        <p
                          className="text-[10px] text-3 capitalize"
                        >
                          Valid Till {voucher.to_date}
                        </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {(
            type === "shop"
              ? claimedShopVouchers.length > 0
              : claimedUshopVouchers.length > 0
          ) ? (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  voucherHandler(
                    tempSelectedVoucherId,
                    type === "ushop" ? 0 : 1
                  );
                }}
                disabled={allRadioButtonsDisabled}
                className={`capitalized ${
                  allRadioButtonsDisabled ? "bg-[#CAC8C6]" : "bg-orangeButton"
                } text-white px-[18px] py-[10px] text-4 font-medium text-center leading-6 rounded-[4px]`}
              >
                Apply Voucher
              </button>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  dispatch(
                    type === "shop"
                      ? setWhichForm("claimShopVoucher")
                      : setWhichForm("claimUshopVoucher")
                  );
                }}
                className="capitalized bg-orangeButton text-white px-[18px] py-[10px] text-4 font-medium text-center leading-6 rounded-[4px]"
              >
                Claim voucher
              </button>
            </div>
          )}
        </div>
      }
    </div>
  );
}

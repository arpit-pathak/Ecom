import { useState, useEffect } from "react";
import { BuyerApiCalls, Apis } from "../../../utils/ApiCalls";
import { ImCross } from "react-icons/im";
import voucherIcon from "../../../../assets/buyer/UshopVoucher.svg";
import { PopUpComponent } from "../../../components/GenericComponents";
import { useSelector, useDispatch } from "react-redux";
import {
  setUnclaimedShopVouchers,
  setUnclaimedUshopVouchers,
} from "../../../redux/reducers/voucher";

export default function RedeemVoucherForm({ close, type, setUshopVouchers }) {
  const dispatch = useDispatch();
  const unclaimedShopVouchers = useSelector(
    (state) => state.voucher.unclaimedShopVouchers
  );
  const unclaimedUshopVouchers = useSelector(
    (state) => state.voucher.unclaimedUshopVouchers
  );
  const sellerId = useSelector((state) => state.voucher.sellerID);
  const user = JSON.parse(localStorage.getItem("customer"));

  useEffect(() => {
    if (user) {
      const formData = new FormData();
      type === "shop"
        ? BuyerApiCalls(
            formData,
            Apis.retrieveShopVoucher + `unclaimed/${sellerId}/`,
            "GET",
            {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${user.access}`,
            },
            processResponse
          )
        : BuyerApiCalls(
            formData,
            Apis.retrieveUshopVoucher + "unclaimed/",
            "GET",
            {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${user.access}`,
            },
            processResponse
          );
    }
  }, []);

  const processResponse = (res, api) => {
    if (api === Apis.claimUshopVoucher) {
      if (res.data.result === "SUCCESS") {
        const formData = new FormData();
        type === "ushop"
          ? BuyerApiCalls(
              formData,
              Apis.retrieveUshopVoucher + "unclaimed/",
              "GET",
              {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${user.access}`,
              },
              processResponse
            )
          : BuyerApiCalls(
              {},
              Apis.retrieveShopVoucher + "unclaimed/" + sellerId + "/",
              "GET",
              {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${user.access}`,
              },
              processResponse
            );
      }
    }
    if (api === Apis.retrieveUshopVoucher + "unclaimed/") {
      if (res.data) {
        dispatch(setUnclaimedUshopVouchers(res.data.data));
      } else {
        dispatch(setUnclaimedUshopVouchers([]));
      }
    }
    if (api.includes(Apis.retrieveShopVoucher + "unclaimed/")) {
      dispatch(setUnclaimedShopVouchers(res.data.data));
    } else {
      dispatch(setUnclaimedShopVouchers([]));
    }
  };

  const voucherHandler = (id_voucher) => {
    const user = JSON.parse(localStorage.getItem("customer"));
    const formData = new FormData();
    formData.append("voucher_id", id_voucher);
    //note* claimushopvoucher is used to claim both ushop and shop vouchers
    BuyerApiCalls(
      formData,
      Apis.claimUshopVoucher,
      "POST",
      {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${user.access}`,
      },
      processResponse
    );
  };
  return (
    <div>
      <div className="flex flex-col w-full">
        <div className={` flex justify-between min-w-[100px]`}>
          <p className="inline font-bold text-xl">
            {type === "ushop" ? "Platform Vouchers" : ""}
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
        {/* <div className="flex items-center justify-center gap-6 mt-[17px] mb-[28px]">
          <div className="border bg-black w-[200px] h-[1px]"></div>
          <p className="text-center w-fit text-[#FF9019] font-bold text-[30px]">
            {type === "ushop" ? "uShop Vouchers" : "Shop Vouchers"}
          </p>
          <div className="border bg-black w-[200px] h-[1px]"></div>
        </div> */}

        {/* if voucher length > 0 means theres unclaimed voucher , else run all voucher redeemded */}
        {type === "ushop" && unclaimedUshopVouchers?.length > 0 && (
          <div className="w-full min-w-[400px] h-fit flex flex-1 items-center bg-orangeButton">
            <div className="flex my-2 flex-wrap">
              {unclaimedUshopVouchers.map((voucher) => {
                return (
                  <div className="relative flex flex-auto h-[220px] w-fill text-black p-2">
                    <img src={voucherIcon}></img>
                    <div className="absolute ml-[110px] space-y-1 pt-[20px]">
                      {voucher.discount_type === "percentage" ? (
                        <p className="mt-3 font-bold  md:text-[18px] text-base">
                          {voucher.discount_type_amount} % cashback
                        </p>
                      ) : (
                        <p className="mt-3 font-bold  md:text-[18px] text-base">
                           {voucher?.discount_type === "percentage" ? voucher?.discount_type_amount + "%" :
                          "$" + voucher?.discount_type_amount.toFixed(2)} discount
                        </p>
                      )}

                      <p className="w-[180px] top-[40px]   font-medium text-[14px]">
                        Min. spend ${voucher.minimum_spend} Capped at $
                        {voucher.maximum_discount}
                      </p>
                      <button
                        onClick={() => {
                          voucherHandler(voucher.id_voucher);
                        }}
                        className="px-2 py-1 border border-[#FF9019] text-[#FF9019] bg-white font-bold 
                        hover:text-orangeButton hover:border-orangeButton !text-sm mb-1"
                      >
                        Claim Voucher
                      </button>

                      <p className="text-[10px] text-red-500 text-3 capitalize">
                        Ends {voucher.to_date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {type === "shop" && unclaimedShopVouchers?.length > 0 && (
          <div className="w-full h-fill flex flex-1 items-center bg-orangeButton">
            <div className="flex ml-4 my-2 flex-wrap">
              {unclaimedShopVouchers.map((voucher) => {
                return (
                  <div className="relative flex flex-auto h-[220px] w-fill text-black p-2">
                    <img src={voucherIcon}></img>
                    <div className="absolute ml-[110px] space-y-1 pt-[20px]">
                      {voucher.discount_type === "percentage" ? (
                        <p className="mt-3 font-bold md:text-[18px] text-base">
                          {voucher.discount_type_amount} % cashback
                        </p>
                      ) : (
                        <p className="mt-3 font-bold  md:text-[18px] text-base">
                          {voucher?.discount_type === "percentage" ? voucher?.discount_type_amount + "%" :
                          "$" + voucher?.discount_type_amount.toFixed(2)} discount
                        </p>
                      )}

                      <p className="w-[180px] top-[40px]   font-medium text-[14px]">
                        Min. spend ${voucher.minimum_spend} Capped at $
                        {voucher.maximum_discount}
                      </p>
                      <button
                        onClick={() => {
                          voucherHandler(voucher.id_voucher);
                        }}
                        className="px-2 py-1 border border-[#FF9019] text-[#FF9019] bg-white font-bold text-xs md:text-sm 
                        hover:text-orangeButton hover:border-orangeButton"
                      >
                        Claim Voucher
                      </button>

                      <p className="text-[10px] text-red-500   text-3 capitalize">
                        Ends {voucher.to_date}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {((type === "shop" && unclaimedShopVouchers?.length === 0) ||
          (type === "ushop" && unclaimedUshopVouchers?.length === 0)) && (
          <div className="flex flex-col w-[260px]">
            <div className="flex items-center justify-center gap-6 mt-[17px] mb-[28px]">
              <div className="border bg-black w-[200px] h-[1px]"></div>
              <p className="text-center w-fit text-[#FF9019] font-bold text-[30px]">
                {type === "ushop" ? "Platform Vouchers" : "Shop Vouchers"}
              </p>
              <div className="border bg-black w-[200px] h-[1px]"></div>
            </div>
            <p className="text-center text-[20px] font-semibold">
              There are no available vouchers at the moment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

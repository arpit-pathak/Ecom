import React, { useEffect, useState } from "react";
import uuid from "react-uuid";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";

export default function Vouchers() {
  const [ushopVouchers, setUshopVouchers] = useState([]);
  const [shopVouchers, setShopVouchers] = useState([]);
  const [voucherType, setVoucherType] = useState("Shop Vouchers");
  const processRes = (res, api) => {
    if (api === Apis.retrieveAllVouchers) {
      setUshopVouchers(res.data.data.ushop_voucher);
      setShopVouchers(res.data.data.shop_voucher);
    }
  };
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("customer"));

    BuyerApiCalls(
      {},
      Apis.retrieveAllVouchers,
      "POST",
      {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${user.access}`,
      },
      processRes
    );
  }, []);

  const TransactionButton = ({ label }) => {
    return (
      <button
        className=" px-2 py-1 "
        id={label}
        onClick={() => {
          setVoucherType(label);
        }}
        style={{
          color: voucherType === label ? "orange" : "black",
          borderTop: voucherType === label ? "1px solid #d3d3d3" : "none",
          borderLeft: voucherType === label ? "1px solid #d3d3d3" : "none",
          borderRight: voucherType === label ? "1px solid #d3d3d3" : "none",
          borderBottom: voucherType === label ? "none" : "1px solid #d3d3d3",
          whiteSpace: "nowrap",
          // borderRadius: voucherType === label ? "4px" : "0",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <React.Fragment>
      <div className="flex flex-col w-full border-[1px] border-grey-300  px-[25px] py-[29px] gap-3">
        <div className="flex capitalize w-full text-[16px] font-medium">
          <TransactionButton label="Shop Vouchers"></TransactionButton>
          <TransactionButton label="uShop Vouchers"></TransactionButton>
          <div className="border-b w-full "></div>
        </div>
        {ushopVouchers.length > 0 || shopVouchers.length > 0 ? (
          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
              {voucherType === "uShop Vouchers" &&
                ushopVouchers?.map((voucher) => {
                  return (
                    <div
                      className="flex flex-col  gap-4 w-full h-[74px] border-b-2"
                      key={uuid()}
                    >
                      <div className="flex justify-between h-[21px] text-[#51A34E] ">
                        <p className="mt-2 font-bold text-[14px]">{voucher.voucher_name}</p>
                        {/* {voucher?.discount_type === "Percentage" ? (
                          <p className="font-bold text-[16px]">
                            {voucher?.discount_type_amount} % cashback
                          </p>
                        ) : (
                          <p className="font-bold text-[16px]">
                            ${voucher?.discount_type_amount.toFixed(2)} discount
                          </p>
                        )} */}

                        <p>Valid till {voucher.to_date}</p>
                      </div>
                      <div className="flex  justify-between h-[21px]">
                        <p className="capitalize">
                          Min. Spend ${voucher?.minimum_spend.toFixed(2)} Capped
                          At ${voucher?.maximum_discount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="flex flex-col gap-2">
              {voucherType === "Shop Vouchers" &&
                shopVouchers?.map((voucher) => {
                  return (
                    <div
                      className="flex flex-col  gap-2 w-full h-[115px] border-b-2"
                      key={uuid()}
                    >
                       <div className='flex gap-2 items-center'>                         
                          <img src={voucher?.shop_logo} width="30px" height="30px" className="mt-3" />
                          <p>{voucher?.shop_name}</p>
                          {voucher?.is_redeem === "y" && <span className="text-[#51A34E] text-sm">(Redeemed)</span>}
                        </div>
                      <div className="flex justify-between h-[21px] text-[#51A34E] "> 
                        <p className="mt-2 font-bold text-[14px]">{voucher.voucher_name}</p> 
                        <p>Valid till {voucher.to_date}</p>
                      </div>
                      <div className="flex  justify-between h-[21px]">
                        <p className="capitalize">
                          Min. Spend ${voucher?.minimum_spend.toFixed(2)} Capped
                          At ${voucher?.maximum_discount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <div className="flex text-center justify-center items-center my-auto">
            <p>you do not have any voucher</p>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

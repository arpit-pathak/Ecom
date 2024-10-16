import { useState, useEffect } from "react";
import { BuyerApiCalls, Apis } from "../utils/ApiCalls";
import voucherBanner from "../../assets/buyer/voucherBanner.svg";
import { Links } from "../components/GenericSections";
import Navbar from "../components/navbar/Navbar";
import voucherIcon from "../../assets/buyer/UshopVoucher.svg";
import { PopUpComponent } from "../components/GenericComponents";
import { Link } from "react-router-dom";
import { CustomerRoutes } from "../../Routes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useMediaQuery } from "@mui/material";

export default function UshopVoucher() {
  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");
  const user = JSON.parse(localStorage.getItem("customer"));
  const [unclaimedVouchers, setUnclaimedVouchers] = useState(null);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [popUpMessage, setPopUpMessage] = useState(null);
  const [popUpResult, setPopUpResult] = useState(null);
  const processResponse = (res, api) => {
    if (api === Apis.claimUshopVoucher) {
      if (res.data.result === "SUCCESS") {
        const formData = new FormData();
        formData.append("id_user", user.id_user);
        BuyerApiCalls(
          formData,
          Apis.retrieveUnclaimedUshopVoucher,
          "GET",
          {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.access}`,
          },
          processResponse
        );
        setOpenPopUp(true);
        setPopUpResult("success");
      } else {
        setOpenPopUp(true);
        setPopUpResult("error");
      }
      setPopUpMessage(res.data.message);
    }
    if (api === Apis.retrieveUshopVoucher + "unclaimed/") {
      setUnclaimedVouchers(res.data.data);
    }
  };
  useEffect(() => {
    if (user) {
      const formData = new FormData();
      formData.append("id_user", user.id_user);
      BuyerApiCalls(
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
  const voucherHandler = (id_voucher) => {
    const user = JSON.parse(localStorage.getItem("customer"));
    const formData = new FormData();
    formData.append("voucher_id", id_voucher);
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
    <div className="min-h-screen flex flex-col">
      {/* {isLargeScreen ? <NewNavbar /> : <Navbar />} */}
      <Navbar />
      {openPopUp && (
        <PopUpComponent
          message={popUpMessage}
          open={openPopUp}
          close={() => setOpenPopUp(false)}
          result={popUpResult}
        ></PopUpComponent>
      )}
      <div className="hidden px-4 md:px-[80px] gap-[10px] bg-white py-4 space-x-1 items-center md:flex md:flex-row ">
        <Link className="text-black" to={CustomerRoutes.Landing}>
          Home
        </Link>
        <FontAwesomeIcon className="w-[10px]" icon={faChevronRight} />
        <p className="text-slate-500">Voucher</p>
      </div>

      <div className="flex flex-col">
        <div className="relative mt-[35px]">
          <img
            src={voucherBanner}
            className="mx-auto"
            alt="voucherBanner"
          ></img>
        </div>
        <div className="flex items-center justify-center gap-6 mt-[17px] mb-[28px]">
          <div className="border bg-black w-[300px] h-[1px]"></div>
          <p className="text-center w-fill text-[#FF9019] font-bold text-[30px]">
            uShop Vouchers
          </p>
          <div className="border bg-black w-[300px] h-[1px]"></div>
        </div>
        <div className="w-full h-fill flex flex-1 items-center bg-orangeButton">
          <div className="flex flex-auto ml-8 my-8 flex-wrap">
            {unclaimedVouchers?.length > 0 ? (
              unclaimedVouchers.map((voucher, index) => {
                return (
                  <div
                    id={index}
                    className="relative flex flex-auto h-[200px] w-[600px] text-black "
                  >
                    <img src={voucherIcon} alt="voucher"></img>
                    <div className="absolute ml-[110px] space-y-1">
                      {voucher.discount_type === "percentage" ? (
                        <p className="mt-6 font-bold text-[18px]">
                          {voucher.discount_type_amount} % cashback
                        </p>
                      ) : (
                        <p className="mt-6 font-bold text-[18px]">
                          $ {voucher.discount_type_amount.toFixed(2)} discount
                        </p>
                      )}

                      <p className="w-[180px] top-[40px]   font-medium text-[10px]">
                        Min. spend ${voucher.minimum_spend} Capped at $
                        {voucher.maximum_discount}
                      </p>
                      <button
                        onClick={() => voucherHandler(voucher.id_voucher)}
                        className="px-2 py-1 border border-[#FF9019] text-[#FF9019] bg-white font-bold hover:text-orangeButton hover:border-orangeButton"
                      >
                        Claim Voucher
                      </button>

                      <p className="bottom-1 text-[10px] text-red-500   text-3 capitalize">
                        Ends {voucher.to_date}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="mx-auto text-white font-bold text-[24px]">
                All vouchers have been claimed
              </p>
            )}
          </div>
        </div>
      </div>

      <Links></Links>
    </div>
  );
}

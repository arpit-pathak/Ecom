import { useLocation, useNavigate } from "react-router-dom";
import { Links } from "../GenericSections";
import Navbar from "../../components/navbar/Navbar";
import InfoIcon from "../../../assets/buyer/affiliate/info-icon.svg";
import { useState } from "react";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import { toast } from "react-toastify";
import { useMediaQuery } from "@mui/material";

const AffiliateRedeem = () => {
  const user = JSON.parse(localStorage.getItem("customer"));
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const { bankDetail, affiliateEarning } = state;
  const [withdrawalAmt, setWithdrawalAmt] = useState("");

  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");

  const maskPhoneNumber = (accno) => {
    let len = accno.length;
    let maskedNumber = "";

    for (let i = 0; i < len - 4; i++) {
      maskedNumber += "*";
    }
    maskedNumber += accno.substring(len - 4);
    return maskedNumber;
  };

  const raiseWithdrawRequest = () => {
    if (withdrawalAmt >= 20 && withdrawalAmt <= 2000) {
      var formData = new FormData();
      formData.append("withdraw_amount", withdrawalAmt);
      BuyerApiCalls(
        formData,
        Apis.withdrawAffiliateCommission,
        "POST",
        {
          Authorization: `Bearer ${user.access}`,
        },
        (res, api) => {
          if (res.data?.result === "SUCCESS") {
            setWithdrawalAmt("");
            toast.success(res.data.message);
          } else {
            toast.error(res.data.message);
          }
        }
      );
    } else toast.error("Withdrawal amount should be between $20-$2000");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* {isLargeScreen ? <NewNavbar /> : <Navbar />} */}
      <Navbar />
      <div className=" pt-20 bg-white w-4/5 max-w-[1800px] mx-auto">
        <button
          onClick={(e) => navigate(-1)}
          className="whitespace-nowrap text-[14px]  text-orangeButton mb-5"
        >
          {"<"}&nbsp;Back
        </button>
        <p className="font-bold text-xl">uShop Affiliate Programme</p>

        <>
          <div className="w-full rounded mt-10">
            <p className="font-bold">Available to redeem:</p>
            <p className="text-xl sm:text-3xl font-bold mt-4">
              $ {affiliateEarning?.available_earning}
            </p>
            <p className="text-sm mt-2">Min withdrawal amount: $20.00</p>
          </div>
          <div className="border-[12px] border-solid border-greyDivider my-8"></div>
        </>

        <>
          <p className="font-bold text-lg">Withdraw commissions</p>
          <div className="flex justify-between gap-5 items-center">
            <p className="text-sm my-2">
              Select where you want to withdraw to:
            </p>
            {/* <p className="text-orangeButton text-sm underline cp">Manage</p> */}
          </div>

          <div className="border py-8 border-[#4A4545] my-8 w-full">
            <div className="flex gap-8 items-center sm:mx-12 mx-6">
              <img src={InfoIcon} alt="InfoIcon" />
              <div>
                <p>Withdraw commissions to your trusted accounts only.</p>
                <p>
                  We’ll never ask for withdrawals to accounts other than your
                  own.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-5 items-start text-sm mt-10 mb-16">
            <img
              src={bankDetail?.bank_logo}
              alt="RadioIcon"
              className="w-[80px]"
            />

            <div>
              <p className="font-bold mb-1">{bankDetail?.bank_name}</p>
              <p>{bankDetail?.full_name}</p>
              <p>{maskPhoneNumber(bankDetail?.account_number)}</p>
            </div>
          </div>

          <p className="font-bold">Withdrawal Amount</p>
          <p className="text-sm my-2">
            Enter the amount you’d like to withdraw.
          </p>
          <div className="border border-[#D9D9D9] h-16 px-5 py-[23px] mb-10">
            <input
              type="number"
              placeholder="Min $20, Max $2000"
              className="w-full"
              value={withdrawalAmt}
              onChange={(e) => setWithdrawalAmt(e.target.value)}
            />
          </div>

          <div className="text-center mb-32">
            <button
              className="rounded-full bg-orangeButton py-3 sm:px-28 px-14  font-bold "
              onClick={raiseWithdrawRequest}
            >
              Withdraw
            </button>
          </div>
        </>
      </div>
      <Links />
    </div>
  );
};

export default AffiliateRedeem;

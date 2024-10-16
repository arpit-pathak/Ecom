import {
  MdClose,
  MdCheckCircle,
  MdBolt,
  MdPersonOutline,
} from "react-icons/md";
import switchAccountBackdrop from "../../assets/switchAccBg.png";
import ushopLogoOrange from "../../assets/logo-orange.svg";
import ls from "local-storage";
import { Constants } from "../../merchant/utils/Constants.js";
import { USER_TYPE } from "../../constants/general.js";
import { useNavigate } from "react-router-dom";
import { CustomerRoutes, MerchantRoutes } from "../../Routes.js";

export default function AccSwitchPopup({
  showSwitchPopup,
  onClose,
  switchingTo,
  userOldData,
  userNewData,
  navigateTo,
  // handleLogOut,
}) {
  const navigate = useNavigate();
  const hasSwitchingAccAlready =
    switchingTo === USER_TYPE.BUYER
      ? userNewData?.buyer_account
      : userNewData?.seller_account
      
  const sellerSwitch = async() => {
    localStorage.removeItem("customer");
    ls("loggedUser", USER_TYPE.SELLER);
    ls("merchant_setup", userNewData?.profile_status ?? "N");
    ls(Constants.localStorage.user, JSON.stringify(userNewData));

    if (hasSwitchingAccAlready) ls(Constants.localStorage.fromPage, "login");
    else ls(Constants.localStorage.fromPage, "register");

    setTimeout(() => {
      navigate(MerchantRoutes.Landing);
    }, 200);
  };

  const buyerSwitch = async() => {
    ls.remove(Constants.localStorage.user);
    ls("loggedUser", USER_TYPE.BUYER);
    ls("promotion_voucher", userNewData?.received_promotion_voucher === "SUCCESS")

    if(!hasSwitchingAccAlready) {
      ls("buyerAddress", null)
      ls("addressPrompt", false)
    }
    else {
      ls("buyerAddress", userNewData?.user_address ? userNewData?.user_address?.address_details : null);
      ls("addressPrompt", userNewData?.user_address ? true: false)
    }

    localStorage.setItem("customer", JSON.stringify(userNewData));
    if (navigateTo) {
      if(navigateTo === window.location.pathname) window.location.reload();
      else navigate(navigateTo);
    }
    else navigate(CustomerRoutes.Landing);
  };

  if (!showSwitchPopup) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-500 bg-opacity-50">
      <div
        className={`lg:w-1/2 max-w-[600px] w-9/12 rounded-lg overflow-y-auto`}
      >
        <div className="py-2 px-12 bg-[#FAFAFA]">
          <div className="flex gap-2 items-center justify-end my-3">
            <p className="text-lg text-black">Switch Account</p>
            <MdClose size={25} className="cp" color="black" onClick={onClose} />
          </div>
          <div className="flex justify-between my-4">
            <div className="flex gap-3 items-center">
              {userOldData?.profile_pic ? (
                <img
                  className="sm:w-24 sm:h-24 w-16 h-16 text-black"
                  alt="profile-pic"
                  src={userOldData?.profile_pic}
                />
              ) : (
                <div
                  className="sm:w-24 sm:h-24 w-16 h-16 flex items-center justify-center 
                border border-orangeButton border-[4px] rounded-full"
                >
                  <MdPersonOutline size={65} color="#F5AB35" />
                </div>
              )}
              <div>
                <p className="text-black">
                  {userOldData?.username ?? userOldData?.email}
                </p>
                <p className="text-xs text-wolfgrey mt-[2px] mb-4">
                  {userOldData?.email}
                </p>
                <div
                  className={`px-4 py-[2px] w-fit text-xs  ${
                    switchingTo === USER_TYPE.BUYER
                      ? "bg-[#FDBD5E] text-white"
                      : "bg-[#F4F67A] text-wolfgrey"
                  } rounded text-center`}
                >
                  <p>
                    {switchingTo === USER_TYPE.BUYER ? "Business" : "Shopper"}
                  </p>
                </div>
              </div>
            </div>

            <MdCheckCircle size={25} color="#FDBD5E" className="mt-4 mr-5" />
          </div>
        </div>
        <hr className="bg-[#8A96A6] h-[2px]" />
        {hasSwitchingAccAlready ? (
          <div className="pt-7 px-12 bg-[#FAF5EF] relative pb-12">
            <div className="flex justify-between mt-4 mb-12">
              <div className="flex gap-3 items-center">
                {userNewData?.profile_pic ? (
                  <img
                    className="sm:w-24 sm:h-24 w-16 h-16 text-black"
                    alt="profile-pic"
                    src={userNewData?.profile_pic}
                  />
                ) : (
                  <div
                    className="sm:w-24 sm:h-24 w-16 h-16 flex items-center justify-center 
                border border-orangeButton border-[4px] rounded-full"
                  >
                    <MdPersonOutline size={65} color="#F5AB35" />
                  </div>
                )}

                <div>
                  <p className="text-black">
                    {userNewData?.username ?? userNewData?.email}
                  </p>
                  <p className="text-xs text-wolfgrey mt-[2px] mb-4">
                    {userNewData?.email}
                  </p>
                  <div className={`px-2 py-[2px] w-fit text-xs text-wolfgrey ${switchingTo === USER_TYPE.BUYER
                      ? "bg-[#F4F67A] text-wolfgrey"
                      : "bg-[#FDBD5E] text-white"} rounded text-center`}>
                    <p>
                      {switchingTo === USER_TYPE.BUYER ? "Shopper" : "Business"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="bg-orangeButton text-white px-3 py-1 text-center rounded h-8 mt-3 text-sm"
                onClick={switchingTo === USER_TYPE.BUYER ? buyerSwitch : sellerSwitch}
                >
                Switch
              </button>
            </div>
            <div className="absolute bottom-4 left-10 flex items-center gap-5">
              <img
                src={ushopLogoOrange}
                alt="ushop-logo"
                className="w-[100px] "
              />
              {switchingTo === USER_TYPE.BUYER && (
                <p className="text-black font-bold">
                  Checkout with your shopper account
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="pt-7 px-12 bg-[#FBD49A] relative pb-12">
            <img
              src={switchAccountBackdrop}
              alt="switch-acc-backdrop"
              className="absolute right-0 bottom-0 h-44 w-44"
            />
            {switchingTo === USER_TYPE.BUYER ? (
              <p className="text-wolfgrey font-bold ">
                Check out seamlessly! <br /> Shop for on-demand
                <br />
                commerce in a click.
              </p>
            ) : (
              <p className="text-wolfgrey font-bold ">
                Something to sell? <br /> Travelling & thinking of
                <br />
                organising group buys?
              </p>
            )}
            <p className="flex gap-1 items-center mt-4 text-[#13D40F] text-xs font-bold">
              <MdBolt size={18} /> EXPRESS TRACK
            </p>
            <button
              className="rounded border border-wolfgrey p-2 w-fit text-wolfgrey text-sm mb-5"
              onClick={switchingTo === USER_TYPE.BUYER ? buyerSwitch : sellerSwitch}
            >
              {switchingTo === USER_TYPE.BUYER
                ? "Create your shopper account"
                : "Create your seller account"}
            </button>
            <div className="absolute bottom-3 left-5 flex items-center gap-5">
              <img
                src={ushopLogoOrange}
                alt="ushop-logo"
                className="w-[100px] "
              />
              {switchingTo === USER_TYPE.BUYER && (
                <p className="text-black font-bold">
                  Checkout with your shopper account
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

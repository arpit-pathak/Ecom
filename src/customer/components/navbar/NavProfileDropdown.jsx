import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setActiveButton } from "../../redux/reducers/AcountOverviewReducer";
import ls from "local-storage";

//icons
import {
  RiAccountBoxLine,
  RiCouponLine,
  RiLogoutBoxLine,
} from "react-icons/ri";
import { VscDashboard } from "react-icons/vsc";
import { PiNotebookBold } from "react-icons/pi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";

//routes
import { CustomerRoutes, MerchantRoutes } from "../../../Routes";

//images
import { Apis, BuyerApiCalls } from "../../utils/ApiCalls";
import { toast } from "react-toastify";
import { USER_TYPE } from "../../../constants/general";

export default function ProfileDropdown({
  handleLogOut,
  setShowSwitchPopup,
  setUserNewData,
  userType,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("customer"));
  // const [userType, setUserType] = useState(ls("loggedUser"));

  const dropDownListCustomer = [
    {
      name: "My Account",
      activeButton: "Personal Details",
      link: CustomerRoutes.ViewProfile,
      imageIcon: <RiAccountBoxLine size={25} />,
    },
    {
      name: "Switch Account",
      activeButton: "Personal Details",
      link: "",
      imageIcon: <FontAwesomeIcon icon={faRepeat} size={25} />,
    },
    {
      name: "My Orders",
      activeButton: "My Orders",
      link: CustomerRoutes.ViewOrder.replace(":tab", "all"),
      imageIcon: <PiNotebookBold fontWeight={"bold"} size={25} />,
    },
    {
      name: "Vouchers",
      activeButton: "My Vouchers",
      link: CustomerRoutes.ViewVoucher,
      imageIcon: <RiCouponLine size={25} />,
    },
  ];

  const dropDownListSeller = [
    {
      name: "Dashboard",
      activeButton: "Dashboard",
      link: MerchantRoutes.Landing,
      imageIcon: <VscDashboard size={25} />,
    },
    {
      name: "Profile",
      activeButton: "Profile",
      link: MerchantRoutes.ShopProfile,
      imageIcon: <RiAccountBoxLine size={25} />,
    },
  ];

  const switchToSeller = () => {
    BuyerApiCalls(
      {},
      Apis.switchToSeller,
      "GET",
      {
        Authorization: `Bearer ${user?.access}`,
      },
      (res, api) => {
        if (res.data.result === "SUCCESS") {
          let rdata = res.data.data;
          setUserNewData(rdata);
          setShowSwitchPopup(true);
        } else {
          toast.error("Something went wrong! Try later!");
        }
      }
    );
  };

  return (
    <React.Fragment>
      <div className="relative flex flex-col items-center rounded-lg z-50">
        {userType && (
          <div
            className="border-l border-r border-b border-l-slate-300 border-r-slate-300 border-b-slate-300 rounded
          absolute top-[12px] w-fill text-center right-[0px] shadow-lg"
          >
            <div className="grid grid-cols-1 divide-y bg-white py-2 px-4 w-[200px]">
              {userType !== USER_TYPE.SELLER
                ? dropDownListCustomer.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        if (index !== 1) {
                          navigate(item.link);
                          dispatch(setActiveButton(item.activeButton));
                        } else switchToSeller();
                      }}
                      className="text-black hover:text-amber-500 flex items-center justify-start gap-2 py-2 cp"
                    >
                      <div className="!w-6">{item.imageIcon}</div>
                      <p className="whitespace-nowrap">{item.name}</p>
                    </div>
                  ))
                : dropDownListSeller.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        navigate(item.link);
                        dispatch(setActiveButton(item.activeButton));
                      }}
                      className="text-black hover:text-amber-500 flex items-center justify-start gap-2 py-2 cp"
                    >
                      <div className="!w-6">{item.imageIcon}</div>
                      <p className="whitespace-nowrap">{item.name}</p>
                    </div>
                  ))}

              <Link
                to={CustomerRoutes.Landing}
                className="text-black hover:text-amber-500 flex items-center justify-start gap-2 py-2  "
                onClick={handleLogOut}
              >
                <div className="w-6">
                  <RiLogoutBoxLine size={25} />
                </div>
                <p className="whitespace-nowrap ">Log Out</p>
              </Link>
            </div>
          </div>
        )}

        {!userType && (
          <div
            className="border-l border-r border-b border-l-slate-300 border-r-slate-300 border-b-slate-300 rounded
        absolute top-[16px] w-fill text-center right-[0px] shadow-lg"
          >
            <div className="grid grid-cols-1 bg-white py-2 px-2 w-[200px] gap-2">
              <Link
                to={CustomerRoutes.SignUp}
                className="text-white bg-[#F5AB35] flex items-center rounded justify-center py-2 cp"
              >
                <p className="whitespace-nowrap">Sign Up</p>
              </Link>

              <Link
                to={CustomerRoutes.Login}
                className="text-[#F5AB35] hover:text-white  bg-white hover:bg-[#F5AB35] border border-[#F5AB35] flex items-center justify-center rounded py-2 cp"
              >
                <p className="whitespace-nowrap">Buyer Log-in</p>
              </Link>

              <Link
                to={MerchantRoutes.Login}
                className="text-black bg-[#EFEFEF] rounded hover:bg-[#b7b2b28c] flex items-center justify-center py-2 cp"
              >
                <p className="whitespace-nowrap">Seller Log-in</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

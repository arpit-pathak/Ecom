import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setActiveButton } from "../../redux/reducers/AcountOverviewReducer";

//icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faRepeat } from "@fortawesome/free-solid-svg-icons";
import { AiFillAccountBook } from "react-icons/ai";
import { BiUserCircle } from "react-icons/bi";
import { TbDiscount2 } from "react-icons/tb";
import { MdLogout } from "react-icons/md";

//routes
import { CustomerRoutes } from "../../../Routes";

//images
import defaultUserIcon from "../../../assets/buyer/defaultUserIcon.png";
import AccSwitchPopup from "../../../components/accountSwitch/AccSwitchPopup";
import { Apis, BuyerApiCalls } from "../../utils/ApiCalls";
import { USER_TYPE } from "../../../constants/general";
import { toast } from "react-toastify";

export default function ProfileDropdown({ handleLogOut }) {
  const profile_pic = useSelector((state) => state.profile.profile_pic);
  const dispatch = useDispatch();
  const [isOpen, setOpen] = useState(false);
  const popUpRef = useRef(null);
  const navigate = useNavigate();
  const [showSwitchPopup, setShowSwitchPopup] = useState(false);
  const [userNewData, setUserNewData] = useState(null);
  const buyer = JSON.parse(localStorage.getItem("customer"));

  const dropDownList = [
    {
      name: "My Account",
      activeButton: "Personal Details",
      link: CustomerRoutes.ViewProfile,
      imageIcon: <BiUserCircle size={25} />,
    },
    {
      name: "Switch Account",
      activeButton: "Personal Details",
      link: CustomerRoutes.ViewProfile,
      imageIcon: <FontAwesomeIcon icon={faRepeat} size={25} />,
    },
    {
      name: "My Orders",
      activeButton: "My Orders",
      link: CustomerRoutes.ViewOrder.replace(":tab", "all"),
      imageIcon: <AiFillAccountBook size={25} />,
    },
    {
      name: "Vouchers",
      activeButton: "My Vouchers",
      link: CustomerRoutes.ViewVoucher,
      imageIcon: <TbDiscount2 size={25} />,
    },
  ];

  const user = JSON.parse(localStorage.getItem("customer"));
  const username =
    user?.username ?? user?.email.substring(0, user.email.indexOf("@")) ?? "";

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
          setOpen(false);
          setShowSwitchPopup(true);
        } else {
          toast.error("Something went wrong! Try later!");
        }
      }
    );
  };

  return (
    <React.Fragment>
      {showSwitchPopup && (
        <AccSwitchPopup
          showSwitchPopup={showSwitchPopup}
          onClose={() => setShowSwitchPopup(false)}
          userOldData={{ ...buyer, profile_pic: profile_pic }}
          userNewData={{ ...userNewData }}
          switchingTo={USER_TYPE.SELLER}
          // handleLogOut={handleLogOut}
        />
      )}
      <div className="relative flex flex-col items-center rounded-lg z-50">
        <button
          ref={popUpRef}
          className="flex  gap-4 justify-end items-center text-white font-bold ml-10 w-fill  px-4 "
          onClick={() => setOpen(!isOpen)}
        >
          <img
            src={profile_pic ? profile_pic : defaultUserIcon}
            alt=""
            className="w-10 h-10 rounded-full"
          />

          <p className={`text-sm text-white`}>
            {username.length >= 10 ? username.substring(0, 10) : username}
          </p>

          {!isOpen ? (
            <FontAwesomeIcon
              className={`w-[10px] pointer-events- text-white`}
              icon={faChevronRight}
              rotation={90}
            />
          ) : (
            <FontAwesomeIcon
              className={`w-[10px] pointer-events- text-white`}
              icon={faChevronRight}
              rotation={270}
            />
          )}
        </button>

        {isOpen && (
          <div>
            <div className="triangle"></div>
            <div
              className="border-l border-r border-b border-l-slate-300 border-r-slate-300 border-b-slate-300 rounded 
            absolute top-[39px] w-fill text-center right-[0px]"
            >
              <div
                ref={popUpRef}
                className="grid grid-cols-1 divide-y bg-white py-2 px-4 w-[200px]"
              >
                {dropDownList.map((item, index) => (
                  <div
                    key={index}
                    to={item.link}
                    onClick={() => {
                      if (index !== 1) {
                        navigate(item.link);
                        dispatch(setActiveButton(item.activeButton));
                      } else switchToSeller();
                    }}
                    className="text-black hover:text-amber-500 flex items-center justify-start gap-2 py-2 cp"
                  >
                    <div className="!w-6 !h-6">{item.imageIcon}</div>
                    <p className="whitespace-nowrap">{item.name}</p>
                  </div>
                ))}
                <Link
                  to={CustomerRoutes.Landing}
                  className="text-black hover:text-amber-500 flex items-center justify-start gap-2 py-2  "
                  onClick={handleLogOut}
                >
                  <div className="w-6 h-6">
                    <MdLogout size={25} />
                  </div>
                  <p className="whitespace-nowrap ">Log Out</p>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}
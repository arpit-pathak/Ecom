import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CustomerRoutes } from "../../../Routes";
import { BiUserCircle, BiSave } from "react-icons/bi";
import { TbDiscount2 } from "react-icons/tb";
import { IoIosNotificationsOutline } from "react-icons/io";
import { useSelector, useDispatch } from "react-redux";
import { setActiveButton } from "../../redux/reducers/AcountOverviewReducer";
import ls from "local-storage";

//images & css
import "../../../index.css";
import { AffiliateInfoModal } from "../affiliateCommissions/AffiliateConstants";

const sidebarItems = [
  {
    name: "My Account",
    link: CustomerRoutes.ViewProfile,
    activeButton: "Personal Details",
    icon: <BiUserCircle size={20}></BiUserCircle>,
    children: [
      {
        name: "Personal Details",
        link: CustomerRoutes.ViewProfile,
        parent: "Personal Details",
      },
      {
        name: "Address Book",
        link: CustomerRoutes.ShippingAddress,
        parent: "Personal Details",
      },
      {
        name: "Link Payment Methods",
        link: CustomerRoutes.PaymentCard,
        parent: "Personal Details",
      },
      {
        name: "Cashback Balance",
        link: CustomerRoutes.ViewCashback,
        parent: "Personal Details",
      },
      {
        name: "Affiliate Programme",
        link: CustomerRoutes.AffiliateSignUp,
        parent: "Personal Details",
      },
    ],
  },
  {
    name: "My Orders",
    activeButton: "My Orders",
    link: CustomerRoutes.ViewOrder.replace(":tab", "all"),
    icon: <BiSave size={20}></BiSave>,
  },
  {
    name: "Available Vouchers",
    activeButton: "My Vouchers",
    link: CustomerRoutes.ViewVoucher,
    icon: <TbDiscount2 size={20}></TbDiscount2>,
  },
  {
    name: "Notifications",
    activeButton: "Notifications",
    link: CustomerRoutes.ViewNotifcation,
    icon: <IoIosNotificationsOutline size={20}></IoIosNotificationsOutline>,
  },
];

export default function SideBar() {
  const isAffiliate = ls("isAffiliate")
  const isAffiliateNameAvailable = ls("isAffiliateNameAvailable")
  const promoPlatforms = ls("promoPlatforms")
  const [sidebarMenu, setSidebarMenu] = useState([])
  const activeButton = useSelector(
    (state) => state.accountOverview.activeButton
  );
  const [activeChildButton, setActiveChildButton] = useState();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let items = [...sidebarItems];
    if (isAffiliate) {
      items[0].children[4] = {
        name: "Affiliate Programme",
        link: CustomerRoutes.ViewAffiliateCommissions,
        parent: "Personal Details",
      };
    } else {
      items[0].children[4] = {
        name: "Affiliate Programme",
        link: CustomerRoutes.AffiliateSignUp,
        parent: "Personal Details",
        state: {
          platformLinks: promoPlatforms
        }
      };
    }
    setSidebarMenu([...items]);
  }, [isAffiliate, promoPlatforms]);

 

  return (
    <div>
      {showModal && (
        <AffiliateInfoModal showModal={showModal} setShowModal={setShowModal} />
      )}
      <div className="hidden md:flex flex-col w-fill  grow-0 shrink-0 h-[602px] border-[1px] border-solid border-gray-300  px-4 rounded-lg">
        <div className="flex-col p-[16px]">
          {sidebarMenu.map((item, index) => (
            <div
              key={index}
              className="flex-col w-full border-b border-gray-300 p-[10px] gap-[13px] whitespace-nowrap"
            >
              <Link
                to={item.link}
                style={{
                  color: item.activeButton === activeButton ? "orange" : null,
                }}
                onClick={() => {
                  dispatch(setActiveButton(item.activeButton));
                }}
                className="flex items-center text-[14px] pt-2 pb-1 gap-2 text-black font-[600] hover:text-amber-500"
              >
                {item.icon}
                {item.name}
              </Link>
              {item.children && (
                <div className="mx-4 whitespace-nowrap">
                  {item.children.map((child, index) => {
                    return (
                      <div
                        key={index}
                        style={{
                          fontWeight:
                            child.name === activeChildButton ? 600 : null,
                        }}
                        className="flex text-[14px] items-center pt-[13px] font-normal text-black hover:text-amber-500 cp"
                        onClick={() => {
                          if (
                            child.name === "Affiliate Programme" &&
                            !isAffiliateNameAvailable
                          )
                            setShowModal(true);
                          else {
                            dispatch(setActiveButton(child.parent));
                            setActiveChildButton(() => child.name);
                            navigate(child.link, { state: child?.state });
                          }
                        }}
                      >
                        {child.name}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import ls from "local-storage";
import { checkSellerPermission, Constants, SELLER_ACCESS_PERMISSIONS } from "../utils/Constants.js";
import { MerchantRoutes, CustomerRoutes } from "../../Routes.js";
//icons
import {
  AiOutlineDashboard,
  AiOutlineShoppingCart,
  AiOutlineShop,
  AiOutlineSetting,
  AiOutlineQuestionCircle,
} from "react-icons/ai";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import { BsBoxSeam } from "react-icons/bs";
import { TbTruckDelivery, TbReportAnalytics } from "react-icons/tb";
import { RiBankLine } from "react-icons/ri";
import { ProductAddEligibilityPopup } from "../utils/ProductAddEligibilityPopup.js";

export const Sidebar = ({ selectedMenu }) => {
  const [showPrompt, setShowPrompt] = useState(false);

  let loggedUser = ls(Constants.localStorage.user);
  if (loggedUser) {
    loggedUser = JSON.parse(loggedUser);
  }

  const parentMenu = selectedMenu === null ? 0 : parseInt(selectedMenu);

  const setActiveMenu = (e, url) => {
    e.preventDefault();
    setTimeout(() => {
      document.getElementById("browser").href = url;
      document.getElementById("browser").click();
    }, 300);
  };

  function ordersRedirect(e, orderSubsection) {
    if (orderSubsection === "cancellation") {
      ls("orders_redirect", orderSubsection);
    }

    if (orderSubsection === "returnrefund") {
      ls("orders_redirect", orderSubsection);
    }

    setActiveMenu(e, MerchantRoutes.Orders);
  }

  if (selectedMenu !== 3.2) ls.remove("m-add-product");
  return (
    <>
      {showPrompt && (
        <ProductAddEligibilityPopup
          showPrompt={showPrompt}
          toggle={() => setShowPrompt(false)}
        />
      )}
      <div className="m-sidebar h-screen animate__animated animate__fadeInLeft">
        <a href="/" id="browser" className="hidden">
          for browser history
        </a>
        <div
          className={parentMenu === 0 ? "active" : ""}
          onClick={(e) => setActiveMenu(e, MerchantRoutes.Landing)}
        >
          <div>
            <AiOutlineDashboard />
            Dashboard
          </div>
        </div>
        {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.ORDERS) && 
        <div className={parentMenu === 1 ? "active parent" : ""}>
          <div onClick={(e) => setActiveMenu(e, MerchantRoutes.Orders)}>
            <AiOutlineShoppingCart />
            Orders
            <MdOutlineKeyboardArrowDown className="has-child caret-down" />
            <MdOutlineKeyboardArrowUp className="has-child caret-up" />
          </div>

          <ul>
            <li className={selectedMenu === 1.1 ? "orange-bg active-menu" : ""}>
              <span onClick={(e) => setActiveMenu(e, MerchantRoutes.Orders)}>
                My Orders
              </span>
            </li>
            <li className={selectedMenu === 1.2 ? "orange-bg active-menu" : ""}>
              <span onClick={(e) => ordersRedirect(e, "cancellation")}>
                Cancellation
              </span>
            </li>
            <li className={selectedMenu === 1.3 ? "orange-bg active-menu" : ""}>
              <span onClick={(e) => ordersRedirect(e, "returnrefund")}>
                Return/Refund
              </span>
            </li>
          </ul>
        </div>
        }
        {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.PRODUCTS) && 
        <div className={parentMenu === 2 ? "active parent" : ""}>
          <div>
            <BsBoxSeam />
            Products
            <MdOutlineKeyboardArrowDown className="has-child caret-down" />
            <MdOutlineKeyboardArrowUp className="has-child caret-up" />
          </div>

          <ul>
            <li className={selectedMenu === 2.1 ? "orange-bg active-menu" : ""}>
              <span onClick={(e) => setActiveMenu(e, MerchantRoutes.Products)}>
                My Products
              </span>
            </li>
            <li className={selectedMenu === 2.2 ? "orange-bg active-menu" : ""}>
              <span
                onClick={(e) => {
                  let profile_status = ls("merchant_setup");
                  if (profile_status === "Y") {
                    setActiveMenu(e, MerchantRoutes.AddProduct);
                  } else setShowPrompt(true);
                }}
              >
                Add Product
              </span>
            </li>
            <li className={selectedMenu === 2.3 ? "orange-bg active-menu" : ""}>
              <span
                onClick={(e) => setActiveMenu(e, MerchantRoutes.Categories)}
              >
                Categories
              </span>
            </li>
          </ul>
        </div>}
        {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.SHIPMENT) && 
        <div className={parentMenu === 3 ? "active " : ""}>
          <div
            onClick={(e) => setActiveMenu(e, MerchantRoutes.ShippingSettings)}
          >
            <TbTruckDelivery />
            Shipment Settings
          </div>
        </div>
        }
        {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.SHOP) && 
          <div className={parentMenu === 4 ? "active parent" : ""}>
            <div onClick={(e) => setActiveMenu(e, MerchantRoutes.ShopProfile)}>
              <AiOutlineShop />
              Shop
              <MdOutlineKeyboardArrowDown className="has-child caret-down" />
              <MdOutlineKeyboardArrowUp className="has-child caret-up" />
            </div>

            <ul>
              <li className={selectedMenu === 4.1 ? "orange-bg active-menu" : ""}>
                <span
                  onClick={(e) => setActiveMenu(e, MerchantRoutes.ShopProfile)}
                >
                  Shop Profile
                </span>
              </li>
              <li className={selectedMenu === 4.2 ? "orange-bg active-menu" : ""}>
                <span
                  onClick={(e) => setActiveMenu(e, MerchantRoutes.ShopRating)}
                >
                  Shop Rating
                </span>
              </li>

              <li className={selectedMenu === 4.3 ? "orange-bg active-menu" : ""}>
                <span
                  onClick={(e) =>
                    setActiveMenu(
                      e,
                      CustomerRoutes.ShopDetails + loggedUser.shop_slug + "/"
                    )
                  }
                >
                  View My Shop
                </span>
              </li>
              {!ls("sub-seller-permission") && <li className={selectedMenu === 4.4 ? "orange-bg active-menu" : ""}>
                <span
                  onClick={(e) => setActiveMenu(e, MerchantRoutes.SubAdminList)}
                >
                  Sub-Admin Setting
                </span>
              </li>}
            </ul>
          </div>
        }
        {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.FINANCE) && 
        <div className={parentMenu === 5 ? "active" : ""}>
          <div onClick={(e) => setActiveMenu(e, MerchantRoutes.Finance)}>
            <RiBankLine />
            Finance
          </div>
        </div>}
        {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.MARKETING) && 
          <div className={parentMenu === 6 ? "active" : ""}>
          <div className="flex">
            <TbReportAnalytics size={20} />
            Marketing Centre
            <MdOutlineKeyboardArrowDown size={20} className="has-child" />
          </div>
          <ul>
            <li className={selectedMenu === 6.1 ? "orange-bg active-menu" : ""}>
              <span
                onClick={(e) => setActiveMenu(e, MerchantRoutes.VoucherSeller)}
              >
                Vouchers
              </span>
            </li>
            <li className={selectedMenu === 6.2 ? "orange-bg active-menu" : ""}>
              <span onClick={(e) => setActiveMenu(e, MerchantRoutes.BannerAds)}>
                Banner Ads
              </span>
            </li>
            <li className={selectedMenu === 6.3 ? "orange-bg active-menu" : ""}>
              <span onClick={(e) => setActiveMenu(e, MerchantRoutes.GroupBuys)}>
                Group Buys
              </span>
            </li>
          </ul>
          </div>
        }
        {checkSellerPermission(SELLER_ACCESS_PERMISSIONS.SETTINGS) && 
          <div className={parentMenu === 7 ? "active" : ""}>
          <div onClick={(e) => setActiveMenu(e, MerchantRoutes.Settings)}>
            <AiOutlineSetting />
            Settings
          </div>
          </div>
        }
        <div className={parentMenu === 8 ? "active" : ""}>
          <div
            onClick={(e) =>
              setActiveMenu(
                e,
                MerchantRoutes.ContactUs.replace(":tab", "contact-us")
              )
            }
          >
            <AiOutlineQuestionCircle />
            Support
          </div>
        </div>
      </div>
    </>
  );
};

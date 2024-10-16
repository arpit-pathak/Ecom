import { Link, useNavigate } from "react-router-dom";
import ls from "local-storage";
import { USER_TYPE } from "../../../constants/general";

//images
import navbarVoucher from "../../../assets/navbar-voucher.png";
import messageNavbar from "../../../assets/msg-navbar.svg";
import faqNavbar from "../../../assets/faq_nav.svg";

//routes
import { CustomerRoutes, MerchantRoutes } from "../../../Routes";
import { useMediaQuery } from "@mui/material";

const NavHeader = ({ user, userType }) => {
  const isLargeScreen = useMediaQuery("(min-width: 1150px)");
  const navigate = useNavigate();

  const openChat = () => {
    let dataToPass = {
      userType: USER_TYPE[1],
      receiverType: USER_TYPE[2],
      buyerId: user?.user_id,
      shopSlug: "",
      sellerId: "",
      shopName: "",
    };

    ls("chatData", JSON.stringify(dataToPass));
    // setHasChatNotification(false);
    const newTab = window.open(CustomerRoutes.ChatScreen, "_blank");
    if (newTab) newTab.focus();
  };

  return (
    <div className="bg-gradient-to-r from-[#F5AB35] to-[#F59135] w-full h-auto flex flex-col md:flex-row justify-between p-2">
      {/* Left Section */}
      <div className="flex gap-2 items-center justify-center md:justify-start pl-4 sm:pl-8 md:pl-24 font-bold text-center md:text-left">
        <img
          src={navbarVoucher}
          alt="voucher-img"
          className="w-4 h-4 md:w-[17px] md:h-[15px] text-white"
        />
        <p className="text-black flex items-center w-auto md:w-[255px] h-[19px] text-xs md:text-sm whitespace-nowrap gap-2">
          SAME DAY DELIVERY, UPTO 50% OFF
          <span
            className="cp tex-sm font-bold text-white border-b-[1.5px] border-[#f5f5f5a5] pb-[1px] leading-none"
            onClick={() =>
              navigate(CustomerRoutes.ProductListing + `keyword=top-deals-all`)
            }
          >
            BUY NOW
          </span>
        </p>
      </div>

      {/* Right Section */}
      {isLargeScreen && (
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-center md:justify-end pr-4 sm:pr-8 md:pr-20 mt-2 md:mt-0">
          {/* Conditionally display links based on user existence */}
          {!userType && (
            <>
              {["Seller Center", "Sell on Ushop"].map((item, idx) => (
                <Link
                  to={
                    idx === 0 ? MerchantRoutes.Login : MerchantRoutes.Register
                  }
                  key={`${item}_${idx}`}
                  className="text-white text-xs cp hover:text-black"
                >
                  {item}
                </Link>
              ))}
            </>
          )}

          <Link
            onClick={openChat}
            target="_blank"
            className="text-white flex items-center gap-1 cp hover:text-black"
          >
            <img
              src={messageNavbar}
              alt={"message"}
              className="w-3 h-3 md:w-[13.3px] md:h-[13.3px]"
            />
            <span className="text-xs">{"Message"}</span>
          </Link>

          <Link
            to={CustomerRoutes.Help.replace(":tab", "contact-us")}
            target="_blank"
            className="text-white flex items-center gap-1 cp hover:text-black"
          >
            <img
              src={faqNavbar}
              alt={"faq"}
              className="w-3 h-3 md:w-[13.3px] md:h-[13.3px]"
            />
            <span className="text-xs">{"FAQ"}</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default NavHeader;

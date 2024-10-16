import { useEffect, useState } from "react";
import { ApiCalls, Apis } from "../../merchant/utils/ApiCalls";
import ls from "local-storage";
import { Constants } from "../../merchant/utils/Constants.js";
import notificationImg from "../../assets/notification.png";
import { USER_TYPE } from "../../constants/general.js";
import { useNavigate } from "react-router-dom";
import { CustomerRoutes, MerchantRoutes } from "../../Routes.js";
import { toast } from "react-toastify";

const NotificationPopupList = ({ usertype, closeNotificationPopup }) => {
  var user = ls(Constants.localStorage.user);
  if (user) user = JSON.parse(user);
  const navigate = useNavigate();
  const [notificationList, setNotificationList] = useState([]);

  useEffect(() => {
    ApiCalls(
      {},
      Apis.getNotifications + `?list_length=10&page=1`,
      "GET",
      {
        Authorization: "Bearer " + user.access,
      },
      processNotifList
    );
  }, []);

  const processNotifList = (res, api) => {
    if (res.data.result === "SUCCESS") {
      setNotificationList(res.data.data?.web_notification);
    }
  };

  const viewMore = () => {
    if (usertype === USER_TYPE.SELLER) navigate(MerchantRoutes.Notifications);
    else navigate(CustomerRoutes.Notifications);
  };

  const markAllRead = () => {
    const formData = new FormData();
    ApiCalls(
      formData,
      Apis.markAllRead,
      "POST",
      {
        Authorization: "Bearer " + user.access,
      },
      (res, api) => {
        if (res.data.result === "SUCCESS") toast.success(res.data.message);
        else toast.error(res.data.message);

        closeNotificationPopup()
      }
    );
  };

  return (
    <div className="absolute top-[40px] right-[-40px]">
      <div className="relative">
        <div
          className="w-0 h-0 border-l-[7px] border-r-[7px] border-l-transparent border-r-transparent 
        border-b-[10px] border-b-white absolute top-[-10px] right-[48px] z-10"
        ></div>

        <div
          className={`bg-white sm:w-[380px] ${
            notificationList.length > 0 ? "h-96" : "h-40"
          } shadow-md rounded-md pt-3`}
        >
          <div className="flex justify-between items-center px-5">
            <p className="text-black text-base">Notifications</p>
            {notificationList.length > 0 && (
              <p className="text-orangeButton text-xs cp" onClick={markAllRead}>
                Mark all as read
              </p>
            )}
          </div>

          <div className="bg-gray-300 h-[1px] w-full mb-2 px-5"></div>

          {notificationList.length > 0 ? (
            <div className="h-[310px] overflow-auto pl-5">
              {notificationList.map((notification, index) => {
                let msgs = notification.message.split(",");

                return (
                  <div key={index}
                   className={`flex gap-3 items-center pb-3 ${notification.read_status !== "y" && "bg-gray-200"}`}
                   onClick={()=>{
                    if (usertype === USER_TYPE.SELLER)
                      navigate(
                        MerchantRoutes.ArrangeShipping.replace(
                          ":orderNumber",
                          notification?.order_number
                        )
                      );
                   }}>
                    <img
                      alt="Notification"
                      src={notification?.thumbnail_img ?? notificationImg}
                      height={40}
                      width={40}
                    />
                    <div>
                      <p className="text-black text-xs">
                        <span className="font-bold">{msgs[0]}</span>
                        {msgs[1]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[200px] text-center text-sm text-black pt-10">
              No notifications yet.
            </div>
          )}

          {notificationList.length > 0 && (
            <div
              className="text-center text-xs cp w-full h-8 text-black mt-1"
              onClick={viewMore}
            >
              View More
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPopupList;

import React, { useState, useEffect } from "react";
import { ApiCalls } from "../../../merchant/utils/ApiCalls";
import notificationImg from "../../../assets/notification.png";
import Pagination from "../../../utils/Pagination/pagination.js";
import { MdDelete, MdNotifications } from "react-icons/md";
import { toast } from "react-toastify";
import { Apis } from "../../utils/ApiCalls";

export default function Notifications() {
  const user = JSON.parse(localStorage.getItem("customer"));
  const [notificationList, setNotificationList] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [entries, setEntries] = useState(10);

  useEffect(() => {
    getNotifications();
  }, [page]);

  const getNotifications = () => {
    ApiCalls(
      {},
      Apis.getNotifications + `?list_length=${entries}&page=${page}`,
      "GET",
      {
        Authorization: "Bearer " + user.access,
      },
      processNotifList
    );
  };

  const processNotifList = (res) => {
    if (res.data.result === "SUCCESS") {
      let rdata = res.data.data;

      //for pagination
      let pg = page;
      let nxtPageCount = rdata.total % entries;
      let currentPage = parseInt(rdata.total / entries);
      if (nxtPageCount >= 0 && currentPage !== pg - 1) pg += 1;

      setNotificationList(rdata?.web_notification);
      setPages(pg);
      setTotal(rdata?.total);
    }
  };

  const changeEntries = (e) => {
    setEntries(e.target.value);
    setPage(1);
  };

  const toPage = (page) => {
    setPage(page);
  };

  const deleteNotification = (id) => {
    const formData = new FormData();
    ApiCalls(
      formData,
      Apis.deleteNotification + `${id}/`,
      "DELETE",
      {
        Authorization: "Bearer " + user?.access,
      },
      (res, api) => {
        if (res.data.result === "SUCCESS") {
          getNotifications();
          toast.success(res.data.message);
        } else toast.error(res.data.message);
      }
    );
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
      }
    );
  };

  return (
    <React.Fragment>
      <div className="flex flex-col w-full border-[1px] border-grey-300 rounded-lg">
        <div className="flex justify-between px-8 items-center py-5">
          <p className="text-black font-semibold">All Notifications</p>
          {notificationList.length > 0 && (
            <button
              className="bg-orangeButton rounded-md px-3 py-1.5 text-white text-sm"
              onClick={markAllRead}
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="bg-gray-300 h-[1px] w-full mt-2 mb-4"></div>
        {notificationList.length > 0 ? (
          <>
            <div className="px-8">
              {notificationList.map((notification, index) => {
                let date = new Date(notification.created_date);

                return (
                  <div key={index}>
                    <div className="flex justify-between mb-3 items-center">
                      <div className="flex gap-3 items-center">
                        <img
                          src={notification?.thumbnail_img ?? notificationImg}
                          alt="notification"
                          height={50}
                          width={50}
                        />
                        <div>
                          <p className="text-sm mb-1 font-semibold">
                            {notification.message_title}
                          </p>
                          <p className="text-xs mb-2">{notification.message}</p>
                          <p className="text-xs mb-2 text-gray-300">
                            {date.toLocaleString("en-US")}
                          </p>
                        </div>
                      </div>
                      <button
                        className="!text-orangeButton rounded-md px-3 py-1.5 text-sm"
                        onClick={() =>
                          deleteNotification(notification.id_notification)
                        }
                      >
                        <MdDelete size={25} />
                      </button>
                    </div>
                    <div className="bg-gray-300 h-[0.5px] w-full mt-2 mb-4"></div>
                  </div>
                );
              })}
            </div>

            <Pagination
              entries={entries}
              changeEntries={changeEntries}
              toPage={toPage}
              pages={pages}
              page={page}
              total={total}
            />
          </>
        ) : (
          <div className="flex flex-col justify-center items-center w-full text-center mt-8 !border-0">
            <MdNotifications size={80}></MdNotifications>
            <p>No Notifications yet</p>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}

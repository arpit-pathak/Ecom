import { useState, useEffect, useRef } from "react";
import "./chat.css";
import { MerchantRoutes, CustomerRoutes } from "../../Routes";
import { Apis, BuyerApiCalls } from "../../customer/utils/ApiCalls";
import { ApiCalls, Apis as sellerApis } from "../../merchant/utils/ApiCalls";
import ls from "local-storage";
import { Link } from "react-router-dom";
import { MdSend, MdAttachFile } from "react-icons/md";
import InputEmoji from "react-input-emoji";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { USER_TYPE } from "../../constants/general";
import Logo from "../../assets/logo-white.svg";
import Loader, { PageLoader } from "../../utils/loader";
import { Constants } from "../../merchant/utils/Constants";
import { chatBaseUrl, WSUrl } from "../../apiUrls";
import { FaSearch, FaTimes, FaAngleLeft } from "react-icons/fa";
import { getCurrentDateForChat } from "../../Utils";

const CHAT_LIST_LENGTH = 20;

const ChatScreen = () => {
  // const { state } = useLocation();
  // const {
  //   userType,
  //   receiverType,
  //   buyerId,
  //   shopSlug,
  //   sellerId,
  //   shopName,
  //   buyerName,
  // } = state;

  const chatData = JSON.parse(ls("chatData"));
  const {
    userType,
    receiverType,
    buyerId,
    shopSlug,
    sellerId,
    shopName,
    buyerName,
  } = chatData;

  const [wsUrl, setWsUrl] = useState(WSUrl + `${shopSlug}_${buyerId}/`);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [msg, setMsg] = useState([]);
  const [prevChats, setPrevChats] = useState([]);
  const [chatPage, setChatPage] = useState(1);
  const [currentChatIndex, setCurrentChatIndex] = useState(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [currentShopSlug, setCurrentShopSlug] = useState(shopSlug);
  const [currentBuyerId, setCurrentBuyerId] = useState(buyerId);
  const [isChatSwitched, setIsChatSwitched] = useState(false);
  const [isScrollToBottom, setIsScrollToBottom] = useState(true);
  const [canLoadMore, setCanLoadMore] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [chatImage, setChatImage]= useState(null)
  const [isChatSearching, setIsChatSearching] = useState(false);
  const [isSearchValueAffected, setIsSearchValueAffected] = useState(false);
  const [isMobile, setIsMobile] = useState(null);
  const [isChatOpened, setIsChatOpened] = useState(false);

  let msgDates = [];

  const chatEndRef = useRef();
  const chatTopRef = useRef();

  const user =
    userType === USER_TYPE[1]
      ? JSON.parse(localStorage.getItem("customer"))
      : JSON.parse(ls(Constants.localStorage.user));
  if(user === null) window.location.replace(CustomerRoutes.Landing)

  const { sendMessage, lastMessage, readyState, sendJsonMessage } =
    useWebSocket(wsUrl, {
      queryParams: {
        token: user.access,
      },
      // onClose: (e) => console.log("closed ", wsUrl),
      // onOpen: (e) => console.log("opened ", wsUrl),
    });

  useEffect(() => {
    setIsPageLoading(true);

    if (window.innerWidth < 678) setIsMobile(true);
    else setIsMobile(false);
  }, []);

  useEffect(() => {
    //to scroll to bottom of screen on opening a chat
    if (isScrollToBottom) scrollToBottom();
  }, [msg]);

  useEffect(() => {
    //receive websocket msgs
    if (lastMessage !== null) {
      let newMessage = JSON.parse(lastMessage?.data);
      if (newMessage?.message_sender !== userType) {
        let msgs = [
          ...msg,
          {
            message_content: newMessage?.message,
            sent_by: receiverType,
            image: newMessage?.image ?? null
          },
        ];
        setMsg(msgs);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    //isNew is true if a new chat which is not in the prev chat list is initiated
    let isNew = prevChats[currentChatIndex]?.isNewChat;

    if (currentChatIndex !== null && canLoadMore && !isNew) loadOldChat();
    else  setIsChatLoading(false);
    
    if(isNew) {
      setMsg([])
      setCanLoadMore(false)
    }
  }, [currentChatIndex, chatPage]);

  useEffect(() => {
    setIsChatSearching(true)
    //list chats on search value change (also loads initial chat list on page load)
    const delayInputTimeoutId = setTimeout(() => {
      if (userType === USER_TYPE[1]) loadBuyerChats();
      else loadSellerChats();
    }, 2000);


    return () => clearTimeout(delayInputTimeoutId);
  }, [searchValue]);

  //api call to load buyer previously made chats list
  const loadBuyerChats = async () => {
    let fd = new FormData();
    fd.append("search", searchValue);

    BuyerApiCalls(
      fd,
      chatBaseUrl + Apis.buyerPrevChats,
      "POST",
      {
        Authorization: `Bearer ${user.access}`,
      },
      processChatList,
      null,
      null,
      null,
      null,
      true
    );
  };

  //api call to load seller previously made chats list
  const loadSellerChats = async () => {
    let fd = new FormData();
    fd.append("search", searchValue);

    ApiCalls(
      fd,
      chatBaseUrl + sellerApis.sellerPrevChats,
      "POST",
      {
        Authorization: `Bearer ${user.access}`,
      },
      processChatList,
      null,
      true
    );
  };

  const processChatList = (response, api) => {
    if (response.data.result === "SUCCESS") {
      const chats = response.data?.data?.users;
     
      let chatIndex;
      if (userType === USER_TYPE[2]) {
        if (currentBuyerId === "") chatIndex = null;
        else {
          chatIndex = chats.findIndex(
            (chat) => chat.user_id === parseInt(currentBuyerId)
          );
        }
      } else {
        if (currentShopSlug === "") chatIndex = null;
        else
          chatIndex = chats.findIndex(
            (chat) => chat.shop_slug === currentShopSlug
          );
      }

      if (chatIndex !== -1) {
        setPrevChats([...chats]);
        setCurrentChatIndex(chatIndex);
      } else {
        let finalArr = [...chats];
        if (searchValue === "") {
          let newChat;
          newChat = {
            last_message_datetime: "now",
            user_id: userType === USER_TYPE[1] ? sellerId : currentBuyerId,
            unread_count: 0,
            shop_slug: shopSlug,
            buyer_name: buyerName ?? "N/A",
            shop_name: shopName ?? "N/A",
            isNewChat: true,
          };
          finalArr = [newChat, ...chats];
          setCurrentChatIndex(0);
        }
        setPrevChats([...finalArr]);
      }
    } // else {}

    setIsChatSearching(false)
    setIsPageLoading(false);
  };

  //api call to load history of a chat
  const loadOldChat = async () => {
    setIsChatLoading(true);
    let fd = new FormData();
    fd.append("shop_slug", currentShopSlug);
    fd.append("buyer_user_id", currentBuyerId);
    fd.append("page", chatPage);
    fd.append("list_length", CHAT_LIST_LENGTH);

    ApiCalls(
      fd,
      chatBaseUrl + sellerApis.fetchOldMessages,
      "POST",
      {
        Authorization: `Bearer ${user.access}`,
      },
      (response, api) => {
        if (response.data.result === "SUCCESS") {
          let currentMsgs = response.data?.data.reverse();

          if (currentMsgs.length < CHAT_LIST_LENGTH) setCanLoadMore(false);

          if (currentMsgs.length === 0) {
            setIsChatLoading(false);
            return;
          }

          
          if (isChatSwitched) {
            setMsg([...currentMsgs]);
            setIsChatSwitched(false);
          } else setMsg([...currentMsgs, ...msg]);
        } // else {    }
        setIsChatLoading(false);
      },
      null,
      true
    );
  };

  useEffect(() => {
    if(chatImage !== null) sendChatMessage()
  }, [chatImage])

  //send message to websocket
  const sendChatMessage = () => {
    if(currentMessage.trim() !== "" || chatImage !== null){
      let msgs = [
        ...msg,
        {
          message_content: currentMessage,
          sent_by: userType,
          image: chatImage?.file ?? null,
        },
      ];

      sendMessage(
        JSON.stringify({
          message: currentMessage,
          image: chatImage?.file_name_original ?? "",
          video: "",
          message_sender: userType,
          receiver_id:
            userType === USER_TYPE[2]
              ? currentBuyerId
              : prevChats[currentChatIndex].user_id,
        })
      );

      setMsg(msgs);
      setCurrentMessage("");
      setChatImage(null);
    }
  };

  //on selecting a chat/switching to a chat from the chat list
  const callCurrentChat = (index) => {
    let chats = [...prevChats];
    chats[index] = { ...chats[index], unread_count: 0 };
    setPrevChats([...chats]);

    if (readyState === 1) sendJsonMessage("disconnect");

    let ss = userType === USER_TYPE[1] ? prevChats[index]?.shop_slug : shopSlug;

    let bid = userType === USER_TYPE[1] ? buyerId : prevChats[index]?.user_id;

    setCurrentShopSlug(ss);
    setCurrentBuyerId(bid);
    setWsUrl(WSUrl + `${ss}_${bid}/`);
    setIsChatSwitched(true);
    setMsg([])
    setIsChatLoading(true);
    setIsScrollToBottom(true);
    setCanLoadMore(true);
    setIsSearchValueAffected(false)
   
    setTimeout(() => {
      setCurrentChatIndex(index);
      setChatPage(1);
      if(isMobile) setIsChatOpened(true)
      if(isMobile && currentChatIndex === index) loadOldChat()

    }, 1000);
  };

  //to scroll to bottom of the chat on chat load
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  //load prev msgs on scrolling to top of chat
  const handleChatScroll = () => {
    if (chatTopRef.current.scrollTop === 0) {
      if (!isChatSwitched && !isSearchValueAffected) {
        setIsScrollToBottom(false);
        setTimeout(() => setChatPage((chatPage) => chatPage + 1), 500);
      }
    }
  };

  //set search value input
  const onSearchChange = (e) => {
    setSearchValue(e.target.value)
    setIsSearchValueAffected(true)
  }

  const handleImgPick = (e) => {
    if (e.target.files && e.target.files[0]) {
      var file = e.target.files[0];

      let fd = new FormData();
      fd.append("media_file", file);

      ApiCalls(
        fd,
        chatBaseUrl + sellerApis.uploadMedia,
        "POST",
        {
          Authorization: `Bearer ${user.access}`,
        },
        (response, api) => {
          let mediaData = response.data.data
          setChatImage({
            file_name_original: mediaData?.file_name_original,
            file: mediaData?.file,
          });
        },
        null,
        true)
    }
  };

  const chatListComp = () => {
    return (
      <div className="bg-white md:w-[400px] w-full overflow-y-auto">
        <div className="flex justify-center">
          <div className="h-10 w-[270px] max-sm:w-full mx-3 my-5 border border-grey4Border p-2 rounded-md flex gap-2 items-center">
            <FaSearch className="text-grey4Border" />
            <input
              type="text"
              placeholder="Search"
              className="border-none w-[240px]"
              value={searchValue}
              onChange={onSearchChange}
            />
            {searchValue !== "" && (
              <FaTimes
                className="cp text-grey4Border"
                onClick={(_) => setSearchValue("")}
              />
            )}
          </div>
        </div>
        {!isChatSearching ? (
          <>
            {prevChats.length > 0 ? (
              <>
                {prevChats?.map((chat, index) => {
                  let isTime = getCurrentDateForChat() === chat?.date_formatted;
                  return (
                    <div
                      key={index}
                      className={`px-3 py-2 cp ${
                        currentChatIndex === index ? "bg-[#FEF1E0]" : "bg-white"
                      }`}
                      onClick={() => callCurrentChat(index)}
                    >
                      <div className="flex justify-between mb-1">
                        <p className="font-semibold text-sm text-black">
                          {userType === USER_TYPE[1]
                            ? chat?.shop_name
                            : chat?.buyer_name ?? chat?.email}
                        </p>
                        <p className="text-grey4Border text-xs">
                          {(isTime
                            ? chat?.time_formatted
                            : chat?.date_formatted) ?? ""}
                        </p>
                      </div>
                      <div className="flex justify-between mb-2 gap-2">
                        <p className="text-xs">
                          {chat?.last_message_content?.substring(0, 50)}
                          ...
                        </p>
                        {chat?.unread_count !== 0 && (
                          <div className="h-4 w-4 !text-center bg-red-500 rounded-xl text-white">
                            <p className="text-xs">{chat?.unread_count}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}{" "}
              </>
            ) : (
              <p className="text-xs text-center text-grey4Border">
                No results found..
              </p>
            )}
          </>
        ) : (
          <div className="flex w-full justify-center">
            <div className="text-center">
              <Loader color="#F5AB35" />
              <p className="text-xs text-orangeButton">Loading..</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const conversationComp = () => {
    return (
      <div className="bg-grey6Border relative h-[92vh] w-full">
        <div
          className="overflow-y-auto h-[83vh]"
          id="chatbox"
          ref={chatTopRef}
          onScroll={handleChatScroll}
        >
          {isChatLoading ? (
            <div className="h-full flex items-center justify-center bg-slate-200">
              <Loader color="#F5AB35" />
            </div>
          ) : (
            <>
              {canLoadMore &&
                ((userType === USER_TYPE[2] && currentBuyerId !== "") ||
                  (userType === USER_TYPE[1] && currentShopSlug !== "")) && (
                  <p
                    className="text-xs text-orangeButton my-2 text-center cp underline"
                    onClick={handleChatScroll}
                  >
                    Load More..
                  </p>
                )}
              {msg.length > 0 ? (
                <>
                  {msg.map((item, index) => {
                    let isNewDate = false;
                    let dateToConsider = item?.date_formatted
                      ? getCurrentDateForChat() === item?.date_formatted
                        ? "Today"
                        : item?.date_formatted
                      : "Today";
                    if (!msgDates.includes(dateToConsider)) {
                      msgDates.push(dateToConsider);
                      isNewDate = true;
                    }
                    return (
                      <>
                        {isNewDate && (
                          <div className=" flex justify-center w-full">
                            <div className="rounded-md w-20 shadow-md bg-gray-50  p-2 my-2">
                              <p className="text-xs text-center text-grey4Border">
                                {dateToConsider}
                              </p>
                            </div>
                          </div>
                        )}
                        <div
                          className={`${
                            item?.sent_by === userType
                              ? "justify-end ml-20"
                              : "justify-start mr-20"
                          } flex p-2  mx-2 ${
                            index === msg.length - 1 ? "mb-3" : "mb-1"
                          }`}
                        >
                          <div
                            key={index}
                            className={`${
                              item.sent_by === userType
                                ? "bg-[#FEF1E0]"
                                : "bg-[#E0E7FE]"
                            }  p-2 text-justify rounded-md w-fit text-sm`}
                          >
                            <div className="flex px-2">
                              {/* text message */}
                              {item?.message_content !== "" && (
                                <p>{item?.message_content}</p>
                              )}

                              {/* image */}
                              {item?.image && (
                                <img
                                  alt=""
                                  className="h-40 w-40 rounded-md"
                                  src={item?.image}
                                />
                              )}

                              <br />
                            </div>
                            <div className="flex justify-end">
                              <p className="text-[10px] text-grey4Border">
                                {item?.time_formatted ?? "Now"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })}
                </>
              ) : (userType === USER_TYPE[2] && currentBuyerId !== "") ||
                (userType === USER_TYPE[1] && currentShopSlug !== "") ? (
                <p className="flex justify-center text-sm mt-10">
                  No data found
                </p>
              ) : null}
              <div ref={chatEndRef}></div>
            </>
          )}
        </div>
        {currentChatIndex != null && (
          <form class="w-full flex px-2 bg-white items-center absolute bottom-0 py-2">
            <div className="text-greyBorder bg-grey6Border h-8 w-[40px] rounded-[40px] relative cp">
              <input
                type="file"
                name="banner"
                id="banner"
                onChange={handleImgPick}
                accept=".png, .jpg, .jpeg"
                className="opacity-0 absolute !w-[40px]"
              />
              <MdAttachFile className="mt-2 mx-auto" />
            </div>
            <InputEmoji
              value={currentMessage}
              onChange={setCurrentMessage}
              cleanOnEnter
              onEnter={sendChatMessage}
              placeholder="Type your message.."
              fontSize="13px"
            />

            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                sendChatMessage();
              }}
              disabled={readyState !== ReadyState.OPEN}
              className="text-white bg-orangeButton disabled:bg-[#f5ab35a8] h-8 w-[40px] rounded-[40px] text-center"
            >
              <MdSend className="m-auto" />
            </button>
          </form>
        )}
      </div>
    );
  };


  return (
    <div className="h-screen">
      {isPageLoading ? (
        <PageLoader />
      ) : (
        <>
          <div className="w-full h-14 bg-orangeButton flex px-3 justify-between items-center shadow-md">
            {isMobile && isChatOpened ? (
              <div className="flex gap-2 items-center">
                <FaAngleLeft
                  className="cp text-white"
                  onClick={(_) => setIsChatOpened(false)}
                />
                <p className="font-semibold text-sm text-white">
                  {userType === USER_TYPE[1]
                    ? prevChats[currentChatIndex]?.shop_name
                    : prevChats[currentChatIndex]?.buyer_name ??
                      prevChats[currentChatIndex]?.email}
                </p>
              </div>
            ) : (
              <Link
                to={
                  ls("loggedUser")
                    ? MerchantRoutes.Landing
                    : CustomerRoutes.Landing
                }
                className="logo animate__animated animate__fadeInLeft"
              >
                <div className="logo animate__animated animate__fadeInLeft">
                  <img src={Logo} alt="" />
                </div>
              </Link>
            )}
          </div>
          <div className="h-[92vh] flex">
            {!isMobile ? chatListComp() : !isChatOpened ? chatListComp() : null}
            {!isMobile
              ? conversationComp()
              : isChatOpened
              ? conversationComp()
              : null}
          </div>
        </>
      )}
    </div>
  );

  
};

export default ChatScreen;

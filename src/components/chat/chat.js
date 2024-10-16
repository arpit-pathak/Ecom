import { useState, useEffect } from "react";
import "./chat.css";

import {
  faXmark,
  faAngleUp,
  faAngleDown,
} from "@fortawesome/free-solid-svg-icons";
import { MdSend, MdAttachFile } from "react-icons/md";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InputEmoji from "react-input-emoji";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { USER_TYPE } from "../../constants/general";

const WS_URL = "wss://stg-api.ushop.market/ws/chat/";

const ChatComponent = ({ closeChat, userToken, userType, receiverType, shopSlug, buyerId }) => {
  const [minimize, setMinimize] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [msg, setMsg] = useState([]);

  const { sendMessage, lastMessage, readyState } = useWebSocket(WS_URL +`${shopSlug}_${buyerId}/`, {
    queryParams: {
      token: userToken,
    },
  });

  useEffect(() => {
    if (lastMessage !== null) {
      let newMessage = JSON.parse(lastMessage?.data);
      let msgs = [...msg, { msg: newMessage?.message, sender: receiverType }];
      setMsg(msgs);
      updateScroll()
    }
  }, [lastMessage]);

  const minimizeChat = () => {
    setMinimize(!minimize);
  };

  const sendChatMessage = () => {
    let msgs = [...msg, { msg: currentMessage, sender: userType }];
    setMsg(msgs);
    setCurrentMessage("");
    sendMessage(
      JSON.stringify({
        message: currentMessage,
        image: "",
        video: "",
        sender_id: "1",
        receiver_id: "37",
      })
    );
    updateScroll()
  };

  function updateScroll(){
    console.log("updating scroll")
    var element = document.getElementById("chatbox");
    element.scrollTop = element.scrollHeight;
}

  return (
    <section
      className={`${
        userType === USER_TYPE[2] && "mr-11"
      } sticky float-right bottom-0 w-[400px] max-[400px]:w-full z-[101] shadow-lg `}
    >
      <header className="h-11 shadow-md bg-orangeButton w-full flex justify-between px-2 items-center">
        <p className="text-lg text-white">Chat</p>
        <div className="flex gap-2 text-white">
          <span onClick={minimizeChat} className="cp pr-2">
            <FontAwesomeIcon icon={minimize ? faAngleUp : faAngleDown} />
          </span>
          <span onClick={closeChat} className="cp pr-2">
            <FontAwesomeIcon icon={faXmark} />
          </span>
        </div>
      </header>
      {!minimize && (
        <div className="bg-white w-full h-[500px] relative">
          <div className="h-[450px] overflow-auto" id="chatbox">
            {msg.map((item, index) => {
              return (
                <>
                  <p
                    key={index}
                    className={`${
                      item.sender === userType
                        ? "float-right pr-2 pl-20"
                        : "pl-2 pr-20"
                    } text-justify`}
                  >
                    {item.sender}: {item.msg}
                  </p>
                  <br />
                </>
              );
            })}
          </div>
          <form class="rounded-xl w-full flex px-2 items-center absolute bottom-0 mb-2">
            <div className="text-greyBorder bg-grey6Border h-8 w-[40px] rounded-[40px]">
              <MdAttachFile className="mt-2 mx-auto" />
            </div>
            {/* <div className="flex gap-1 bg-[#F2F2F2]">
              <input
                type="text"
                //   id="chatInput"
                className="!h-[40px] !bg-transparent !border-0 !rounded-[40px]"
                placeholder="Enter your message..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
              />
            </div> */}
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
        </div>
      )}
    </section>
  );
};

export default ChatComponent;

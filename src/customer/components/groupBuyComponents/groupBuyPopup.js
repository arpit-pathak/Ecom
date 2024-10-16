import { useEffect, useState } from "react";
import {
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import { FaLink } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import fireImg from "../../../assets/seller/groupbuy/fire.png"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

const GroupBuyPopup = ({
  showGroupBuyPopup,
  closeShowGroupBuyPopup,
  product,
  groupBuyData,
  originalPrice,
  submitGroupBuy,
  isSoldOut
}) => {
  const [choice, setChoice] = useState("");
  const [possibleQuantities, setPossibleQuantities] = useState([]);
  const [qty, setQty] = useState(1);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const choice_name = ["Check Out Now", "Group Buy Price", "Special Deal Price"];
  const receive_date = new Date(groupBuyData.delivery_date);
  const formatted_receive_date = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(receive_date);

  useEffect(() => {
    let options = [];
    let maxQtySingleCustomer = 1

    if((groupBuyData?.success_target_qty - groupBuyData?.total_order_qty) > groupBuyData?.max_qty_single_customer)
      maxQtySingleCustomer = groupBuyData?.max_qty_single_customer;

    for (let i = 1; i <= maxQtySingleCustomer; i++) {
      options.push(i);
    }
    setPossibleQuantities([...options]);
  }, []);

  const handleBuyChoice = (choice) => {
    setChoice(choice);
    setShowShareOptions(false);
  };

  const handleSubmit = () => {
      if (choice !== 3) submitGroupBuy(choice,qty);
      else {
        if(groupBuyData?.total_order_qty <
          groupBuyData?.success_target_qty) setShowShareOptions(!showShareOptions);
        else submitGroupBuy(choice,qty)
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Product Link copied');
    setShowShareOptions(false);
  };

  return (
    <>
      <ToastContainer hideProgressBar={true} />
      {showGroupBuyPopup ? (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-slate-500 bg-opacity-50">
          <div className="relative">
            <div
              className={`w-[600px] max-sm:w-full sm:max-h-[700px] overflow-y-auto bg-white p-6 rounded-[4px] overflow-y-auto`}
            >
              <div className="bg-white rounded-full">
                <div className="flex justify-between h-20">
                  <img
                    src={product?.image}
                    alt=""
                    className="h-16 w-16 object-contain"
                  />
                  <p className="flex flex-col justify-center text-black sm:text-xl">
                    {product?.name}
                  </p>
                  <div className="w-16 flex justify-end">
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="cp"
                      onClick={closeShowGroupBuyPopup}
                    />
                  </div>
                </div>
                <div className="h-[1px] w-full bg-[#C5C5C5]"></div>

                {/* checkout now */}
                <div
                  className={`min-h-[90px] rounded-xl w-full border ${
                    choice === 1
                      ? "border-[#FF6B00] bg-[#FFF2DE]"
                      : isSoldOut ? "border-[#ececec] bg-white" :"border-[#C5C5C5] bg-white"
                  } mt-5 p-3 ${!isSoldOut && "cp"}`}
                  onClick={() => {
                    if(!isSoldOut) handleBuyChoice(1)
                  }}
                >
                  <div className="flex gap-2">
                    <p className={`${isSoldOut ? "text-[#acacac]":"text-[#3C3C3C]"} max-sm:text-sm mt-1`}>1.</p>
                    <div className="w-full">
                      <p className={`${isSoldOut ? "text-[#acacac]":"text-[#3C3C3C]"} max-sm:text-sm leading-loose font-semibold`}>
                       {isSoldOut ? "Sold Out" : "Check Out Now"}
                      </p>
                      <div className="flex w-full justify-between items-end">
                        <p className={`${isSoldOut ? "text-[#acacac]":"text-black"} text-sm max-sm:text-xs`}>
                          No discount. Select the date you want to receive.
                        </p>
                        {/* need to change price */}
                        <p className={`${isSoldOut ? "text-[#acacac]": "text-[#837277]"} font-semibold text-lg max-sm:text-sm whitespace-nowrap`}>
                          $ {originalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* group buy price */}
                <button
                  className={`rounded-xl w-full border ${
                    choice === 2
                      ? "border-[#FF6B00] bg-[#FFF2DE]"
                      : "border-[#C5C5C5] bg-white"
                  } mt-3 p-3`}
                  onClick={() => handleBuyChoice(2)}
                  disabled={
                    groupBuyData?.total_order_qty >=
                    groupBuyData?.success_target_qty
                  }
                >
                  <div className="flex gap-2 justify-start">
                    <p className="text-[#3C3C3C] mt-1 max-sm:text-sm">2.</p>
                    <div className="w-full text-start">
                      <p className="text-[#3C3C3C] leading-loose font-semibold max-sm:text-sm">
                        Group Buy Price
                      </p>
                      <div className="flex w-full justify-between items-end">
                        <p className="text-sm text-black w-3/4 max-sm:text-xs">
                          Instant $
                          {(
                            originalPrice - groupBuyData?.group_buy_price
                          ).toFixed(2)}{" "}
                          off as long as you join. You will be refunded with
                          your $
                          {(
                            groupBuyData.group_buy_price -
                            groupBuyData?.success_discount_price
                          ).toFixed(2)}{" "}
                          of savings if the target order is achieved.
                        </p>
                        <p className="text-[#F1595C] font-semibold text-lg max-sm:text-sm whitespace-nowrap">
                          $ {groupBuyData?.group_buy_price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>

                {/* special deal price */}
                <div
                  className={`rounded-xl w-full border ${
                    choice === 3
                      ? "border-[#FF6B00] bg-[#FFF2DE]"
                      : "border-[#C5C5C5] bg-white"
                  } mt-3 mb-5 p-3 cp`}
                  onClick={() => handleBuyChoice(3)}
                >
                  <div className="flex gap-2">
                    <p className="text-[#3C3C3C] mt-1 max-sm:text-sm">3.</p>
                    <div className="w-full">
                      <p className="text-[#3C3C3C] leading-loose font-semibold max-sm:text-sm">
                        Send Invites to Unlock Special Deal Price
                      </p>
                      <div className="flex w-full justify-between items-end">
                        <p className="text-sm text-black w-3/4 max-sm:text-xs">
                          {groupBuyData?.success_target_qty -
                            groupBuyData?.total_order_qty}{" "}
                          more orders to reach the target order & unlock the
                          Special Deal Price. Share the offer now!
                        </p>
                        <div className="flex gap-1 items-center">
                          <img
                            src={fireImg}
                            alt=""
                            height={20}
                            width={20}
                            className="object-contain mb-1"
                          />
                          <p className="text-[#F1595C] font-semibold text-lg max-sm:text-sm whitespace-nowrap">
                            $ {groupBuyData?.success_discount_price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-[#C5C5C5]"></div>

                {choice !== "" && (
                  <>
                    <p className="text-sm my-2">
                      Choice: {choice_name[choice - 1]}
                    </p>
                    {choice !== 1 && (
                      <p className="text-sm my-2">
                        Receive on:{" "}
                        {`${formatted_receive_date} (${groupBuyData.delivery_slot})`}
                      </p>
                    )}
                  </>
                )}

                <div className="flex justify-between items-center mt-3">
                  <div className="flex gap-2 items-center">
                    <p className="text-xs">Quantity</p>
                    <select
                      id="list-entry"
                      defaultValue={qty}
                      className="border border-[#C5C5C5] rounded-md px-[2px] text-xs"
                      onChange={(e) => setQty(e.target.value)}
                    >
                      {possibleQuantities.map((option) => {
                        return <option value={option}>{option}</option>;
                      })}
                    </select>
                  </div>
                  <div className="flex gap-2 items-center">
                    <p className="text-[#F1595C] font-semibold text-lg max-sm:text-sm whitespace-nowrap">
                      ${" "}
                      {choice === 1
                        ? originalPrice.toFixed(2)
                        : choice === 2
                        ? groupBuyData?.group_buy_price.toFixed(2)
                        : choice === 3
                        ? groupBuyData?.success_discount_price.toFixed(2)
                        : 0}
                    </p>
                    <button
                      className="h-8 px-4 max-sm:px-2 text-white text-center rounded-md bg-[#FF6B00] relative disabled:bg-[#E5E5E5] max-sm:text-xs"
                      onClick={handleSubmit}
                      disabled={choice === ""}
                    >
                      {choice === 2
                        ? "Join and checkout now"
                        : choice === 3
                        ? groupBuyData?.total_order_qty <
                          groupBuyData?.success_target_qty
                          ? "Share now"
                          : "Next"
                        : "Next"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* -bottom-[20px] -right-[70px] */}
            {showShareOptions && (
              <div className="absolute sm:-bottom-[20px] sm:-right-[70px] bottom-[60px] right-0 bg-[#F7F7F7] shadow-md p-[10px] rounded-xl z-100 flex items-center">
                {/* <div
                  className="absolute right-[50px] bottom-[50px] w-0 h-0 border-t-[13px] border-t-transparent 
             border-r-[13px] border-r-white"
                ></div> */}
                 <div
                  className="absolute w-0 h-0 right-[50px] bottom-[50px] max-sm:right-[70px] max-sm:-bottom-[14px] border-t-[13px] max-sm:border-t-white
                  sm:border-t-transparent  max-sm:border-l-[13px] max-sm:border-l-transparent  border-r-[13px] sm:border-r-white
                  max-sm:border-r-transparent sm:border-b-[13px] sm:border-b-transparent"
                ></div>
                <div className="w-[150px] sm:w-[30px] sm:py-1 items-center flex sm:flex-col flex-row gap-2">
                  <WhatsappShareButton
                    title="hey! Checkout this awesome product from uShop!"
                    windowWidth="900"
                    windowHeight="600"
                    url={window.location.href}
                    onClick={() => setShowShareOptions(false)}
                  >
                    <WhatsappIcon size={26} round={true} />
                  </WhatsappShareButton>
                  <TelegramShareButton
                    title="hey! Checkout this awesome product from uShop!"
                    url={window.location.href}
                    onClick={() => setShowShareOptions(false)}
                  >
                    <TelegramIcon size={26} round={true}></TelegramIcon>
                  </TelegramShareButton>
                  <TwitterShareButton
                    url={window.location.href}
                    onClick={() => setShowShareOptions(false)}
                  >
                    <TwitterIcon size={26} round={true} />
                  </TwitterShareButton>
                  <div
                    className="bg-[#D9D9D9] w-8 h-8 cp rounded-full flex justify-center items-center"
                    onClick={copyUrl}
                  >
                    <FaLink size={17} color="white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
};

export default GroupBuyPopup;

import { MdArrowForwardIos } from "react-icons/md";
import "./index.css";
import fireImg from "../../assets/seller/groupbuy/fire.png";
import { useEffect, useState } from "react";

const MobGroupBuyLabel = ({
  dealPrice,
  originalPrice,
  guaranteedPrice,
  remainingOrderQty,
  soldQty,
  maxCampaignQty,
  handleGetGroupBuy,
  campaignStatus,
  campaignDates,
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({});
  const [startDateFormatted, setStartDateFormatted] = useState("");

  useEffect(() => {
    let startDate = new Date(campaignDates?.startDate);
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    setIsStarted(!(today < startDate));
  }, []);

  const isEnabled = () => isStarted && campaignStatus;

  useEffect(()=>{
    if(!isStarted){
      let date = campaignDates?.startDate.split(" ")[0]
      let formattedDate = date.split("-").reverse().join("-")
      setStartDateFormatted(formattedDate)
    }
  },[isStarted])

  useEffect(() => {
    if (isStarted) {
      const timer = setTimeout(() => {
        setTimeLeft(calculateTimeLeft(campaignDates?.endDate));
      }, 1000);

      return () => clearTimeout(timer);
    }
  });

  const calculateTimeLeft = (targetDate) => {
    const difference = new Date(targetDate) - new Date();
    let timeLeft = {};

    if (difference > 0) {
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      timeLeft = {
        hours: hours < 10 ? `0${hours}` : hours,
        minutes: minutes < 10 ? `0${minutes}` : minutes,
        seconds: seconds < 10 ? `0${seconds}` : seconds,
      };
    }

    return timeLeft;
  };

  return (
    <div
      className={`relative groupbuyMobImgClass w-full px-3 h-28 ${
        isEnabled() && "cp"
      }`}
      onClick={() => {
        if (isEnabled()) handleGetGroupBuy();
      }}
    >
      {/* title */}
      <div className="flex pt-2 justify-between items-center w-full">
        <p className="text-white font-bold text-xs">Group Buy Deal</p>
        <p className="text-white font-bold text-xs">{soldQty} SOLD</p>
      </div>

      {/* progress bar */}
      <div className="flex items-start w-full gap-1 mt-4">
        <p className="text-white line-through font-bold text-xs mr-[2px] mt-[2px] whitespace-nowrap">
          $ {originalPrice.toFixed(2)}
        </p>
        <p className="gradient-text font-extrabold text-sm whitespace-nowrap">
          {dealPrice.toFixed(2)}
        </p>
        <div className="w-3/5 mt-[2px]">
          <div className="progress">
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${(soldQty / maxCampaignQty) * 100}%`,
                fontWeight: "500",
              }}
              aria-valuenow={soldQty}
              aria-valuemin="0"
              aria-valuemax={maxCampaignQty}
            >
              {soldQty === 0 ? "" : soldQty ?? 0}
            </div>
          </div>

          {soldQty < remainingOrderQty && (
            <p className="text-white text-center text-[10px]">
              {remainingOrderQty} Orders more to Unlock
            </p>
          )}
        </div>

        <div className="flex gap-[2px] items-center">
          <p className="gradient-text !font-extrabold whitespace-nowrap text-sm">
            {parseFloat(guaranteedPrice).toFixed(2).toString()}
          </p>
          <img
            src={fireImg}
            alt=""
            height={20}
            width={20}
            className="object-contain mb-1"
          />
        </div>
      </div>

      {/* timer */}
      <div className="absolute bottom-0 w-full h-6 left-0 bg-[#F9DBA4]">
        <div className="w-full text-black font-semibold flex items-center gap-2 flex justify-end pr-2 h-full">
          <p className="text-xs">{isStarted ? "ENDS IN" : "STARTS ON"} </p>
          {isStarted ? (
            <>
              <div className="bg-[#3B3B3B] px-1 h-4 rounded text-center text-white text-xs">
                {timeLeft?.hours ?? "00"}
              </div>
              <p>:</p>
              <div className="bg-[#3B3B3B] px-1 h-4 rounded text-center text-white text-xs">
                {timeLeft?.minutes ?? "00"}
              </div>
              <p>:</p>
              <div className="bg-[#3B3B3B] px-1 h-4 rounded text-center text-white text-xs">
                {timeLeft?.seconds ?? "00"}
              </div>
            </>
          ) : (
            <div className="bg-[#3B3B3B] px-2 h-4 rounded text-center text-white text-xs">
              {startDateFormatted}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobGroupBuyLabel;

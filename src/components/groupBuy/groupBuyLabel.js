import { MdArrowForwardIos } from "react-icons/md";
import "./index.css";
import fireImg from "../../assets/seller/groupbuy/fire.png";
import { useEffect, useState } from "react";

const GroupBuyLabel = ({
  dealPrice,
  originalPrice,
  guaranteedPrice,
  remainingOrderQty,
  soldQty,
  maxCampaignQty,
  from,
  handleGetGroupBuy,
  campaignStatus,
  campaignDates,
}) => {
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({});
  const [startDateFormatted, setStartDateFormatted] = useState("");

  useEffect(() => {
    if (from === "customer") {
      let startDate = new Date(campaignDates?.startDate);
      let today = new Date();
      today.setHours(0, 0, 0, 0);
      setIsStarted(!(today < startDate));
    }
  }, []);

  const isEnabled = () => from === "customer" && isStarted && campaignStatus;

  useEffect(()=>{
    if(!isStarted && from === "customer"){
      let date = campaignDates?.startDate.split(" ")[0]
      let formattedDate = date.split("-").reverse().join("-")
      setStartDateFormatted(formattedDate)
    }
  },[isStarted])

  useEffect(() => {
    if (from === "customer" && isStarted) {
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
      const  hours= Math.floor(difference / (1000 * 60 * 60));
      const minutes= Math.floor((difference / 1000 / 60) % 60);
      const seconds= Math.floor((difference / 1000) % 60);

      timeLeft = {
        hours: hours < 10 ? `0${hours}` : hours,
        minutes:  minutes < 10 ? `0${minutes}` : minutes,
        seconds: seconds < 10 ? `0${seconds}` : seconds,
      };
    }

    return timeLeft;
  };

  return (
    <div
      className={`relative groupbuyImgClass w-[550px] h-[300px] max-sm:w-full  ${
        isEnabled() && "cp"
      }`}
      onClick={() => {
        if (isEnabled()) handleGetGroupBuy();
      }}
    >
      {/* timer */}
      <div className="absolute top-[5px] w-[600px] h-[300px] max-sm:w-full">
        <div className="w-full pr-10 max-sm:pr-0 text-black font-semibold flex items-center gap-2 flex justify-center">
          <p>{isStarted ? "ENDS IN" : "STARTS ON"} </p>
          {isStarted ? (
            <>
              <div className="bg-[#3B3B3B] w-6 h-5 rounded text-center text-white text-sm">
                {timeLeft?.hours ?? "00"}
              </div>
              <p>:</p>
              <div className="bg-[#3B3B3B] w-6 h-5 rounded text-center text-white text-sm">
                {timeLeft?.minutes ?? "00"}
              </div>
              <p>:</p>
              <div className="bg-[#3B3B3B] w-6 h-5 rounded text-center text-white text-sm">
                {timeLeft?.seconds ?? "00"}
              </div>
            </>
          ) : (
            <div className="bg-[#3B3B3B] px-2 h-5 rounded text-center text-white text-sm">
              {startDateFormatted}
            </div>
          )}
        </div>
      </div>

      {/* white label */}
      <div className="absolute top-[60px] left-[25px] labelImg z-[20] w-[343px] h-[60px] max-sm:w-full max-sm:left-0">
        <div className="flex justify-center gap-3 items-center h-full">
          <div>
            <p className="text-[#CD770D] font-extrabold">EXCLUSIVE</p>
            <p className="text-[#CD770D] font-extrabold">group buy price</p>
          </div>
          <div
            className={`h-[35px] bg-[#F8D800] w-[100px] flex gap-2 items-center justify-center rounded-full border border-[#8B670A]
          border-[2px]`}
          >
            <p className="text-2xl text-[#5B4307] font-bold">GET</p>
            <MdArrowForwardIos size={20} className="text-[#5B4307]" />
          </div>
        </div>
      </div>

      {/* prices */}
      <div className="absolute flex top-[125px] left-[25px] gap-3 items-center">
        <p className="gradient-text text-[40px] max-sm:text-2xl">
          $ {parseFloat(guaranteedPrice).toFixed(2).toString()}
        </p>
        <p className="text-[#E8E8E8] line-through font-extrabold text-2xl max-sm:text-base">
          $ {parseFloat(originalPrice).toFixed(2).toString()}
        </p>
      </div>

      {/* progress bar */}
      <div
        className="absolute top-[200px] left-[25px] flex items-center gap-2 w-full max-sm:top-[180px] max-sm:left-1 
      max-sm:gap-1"
      >
        <p className="text-[#E8E8E8] font-bold text-lg max-sm:text-sm whitespace-nowrap">
          <span className="text-xs">$</span>  {parseFloat(originalPrice).toFixed(2).toString()}
        </p>
        <div className="w-3/5">
          <p className="text-white font-semibold text-sm italic mb-2 max-sm:text-xs text-center">
            Guaranteed group buy price: <span className="text-xs">$</span>
            {parseFloat(dealPrice).toFixed(2).toString()}
          </p>
          <div className="progress">
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                // width: "80%",
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
            <>
              {from !== "customer" ? (
                <div className="w-full flex flex-col items-end ">
                  <div
                    className="w-0 h-0 border-l-[7px] border-r-[7px] border-l-transparent border-r-transparent 
border-b-[10px] border-b-[#FFA626]"
                  ></div>
                  <p className="text-white text-[10px] text-right">
                    <span className="text-xs">{remainingOrderQty}</span> more
                    orders to go <br /> to purchase at Special Deal Price
                  </p>
                </div>
              ) : (
                <p className="text-white text-xs max-sm:text-[10px]">
                  {remainingOrderQty} more orders to go to purchase at Special
                  Deal Price
                </p>
              )}
            </>
          )}
        </div>

        <div className="">
          <p className="gradient-text text-[10px] text-center">
            Special Deal Price
          </p>
          <div className="flex gap-1 items-center">
            <p className="gradient-text text-lg !font-bold whitespace-nowrap max-sm:text-sm">
              <span className="text-xs">$</span>{" "}
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
      </div>
    </div>
  );
};

export default GroupBuyLabel;

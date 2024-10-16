import { useState } from 'react';
import '../css/navbar.css';
import { ProgressLabels } from './ProgressConstants.js';
import { useEffect } from 'react';
import { ORDER_CONSTANTS } from './order_status';
import ls from 'local-storage';
import { USER_TYPE } from './general';

export const ProgressNotifBanner = ({ progressStep, order }) => {
    
    const [cancelledBy, setCancelledBy] = useState("");
    const progressElem = ProgressLabels.find(elem => elem.id === progressStep)
    let userType = ls("loggedUser")

    useEffect(() => {
        let textToReturn = ""
        if (progressStep === ORDER_CONSTANTS.GENERALSTATUS_CANCELLED) {
            if (userType === USER_TYPE.SELLER) textToReturn = "(" + order?.seller_cancelled_text + ")"
            else if (userType === USER_TYPE.BUYER) textToReturn = "(" + order?.buyer_cancelled_text + ")"
        }
        setCancelledBy(textToReturn);
    }, [])


    return <div className="progress-notif-banner">
        <div className={progressElem.bgColor}>
            <tr className='flex items-center' >
                <td>
                    {progressElem.icon}
                </td>
                <td className="status-text" >
                    <p className='text-[14px] sm:text-[16px]'>
                        {progressElem.name} <span className='text-sm text-white italic'>{cancelledBy}</span>
                    </p>
                </td>
            </tr>
        </div>
    </div>;
}


export const ProgressTracker = ({ progressPath, isBuyer, order,viewDetail }) => {
    const INIT_DISPLAY_COUNT = 5;
    const [showMore, setShowMore] = useState(true);
    const actualLen = progressPath.length;
    const [progressPathToDisp, setProgressPathToDisp] = useState([]);
    let userType = ls("loggedUser")

    const getCancelledByText = () => {
        let textToReturn = ""
        if (userType === USER_TYPE.SELLER) textToReturn = "(" + order?.seller_cancelled_text + ")"
        else if (userType === USER_TYPE.BUYER) textToReturn = "(" + order?.buyer_cancelled_text + ")"

        return textToReturn;
    }

    const dashPath = (color) => {
        return <div className={`ml-3 ${color}`}>
            |<br />
            |<br />

            |
        </div>;
    }

    const LevelComponent = ({ isActive, isDashNeeded, currentElem, elem }) => {
        const reasonApplicable = [
          ORDER_CONSTANTS.GENERALSTATUS_ORDER_COLLECTION_FAILED,
          ORDER_CONSTANTS.GENERALSTATUS_ORDER_UNDELIVERED,
          ORDER_CONSTANTS.GENERALSTATUS_ORDER_DELIVERY_FAILED,
        ];

        return (
            <>
                <div>
                    <tr>
                        <div className="flex gap-3 items-start">
                            <td>
                                {isActive ? currentElem?.icon : currentElem?.inactiveIcon}
                            </td>
                            <div>
                                <p className="">
                                    {currentElem?.name}
                                </p>
                                {elem.status_id === ORDER_CONSTANTS.GENERALSTATUS_CANCELLED &&
                                    <p className='text-xs text-black italic'>{getCancelledByText()}</p>}
                                {reasonApplicable.includes(elem.status_id) && 
                                <p className='block w-[180px] text-[10px] text-black whitespace-pre-wrap'>(Reason: {elem?.remarks})</p>}
                                <p className="text-[14px] sm:text-[10px] text-slate-400">{elem.created_date}</p>
                            </div>
                        </div>
                    </tr>
                </div>
                {isDashNeeded && dashPath(elem?.created_date ? currentElem?.dashColor : "inactive-path-color")}
            </>
        );
    }

    const buildProgressTracker = () => {
      let len = progressPathToDisp.length;
      return (
        <div>
          {progressPathToDisp.map((elem, index) => {
            const currentElem = ProgressLabels.find(
              (e) => e.id === elem.status_id
            );
            return (
              <LevelComponent
                viewDetail={viewDetail}
                isActive={elem.created_date ? true : false}
                isDashNeeded={index + 1 !== len}
                elem={elem}
                currentElem={currentElem}
              />
            );
          })}
        </div>
      );
    };

    useEffect(() => {
        let progressValues = [];
        if (actualLen > INIT_DISPLAY_COUNT) progressValues = progressPath.slice(actualLen - 5, actualLen)
        else progressValues = progressPath

        setProgressPathToDisp(progressValues)
    }, [])

    useEffect(() => {
        if (progressPathToDisp.length) {
            let progressValues = [];

            if (!showMore) progressValues = progressPath
            else progressValues = progressPath.slice(actualLen - 5, actualLen)

            setProgressPathToDisp(progressValues)
        }
    }, [showMore])

    return (
      <>
        {viewDetail && (
          <div
            className={`text-[16px] whitespace-nowrap sm:text-[14px] font-medium bg-white w-[256px] 
                    ${viewDetail && "px-[14px] pt-[20px] sm:pb-[20px]"} sm:border border-gray-300 ml-[10px] rounded-md  
                    animate__animated ${isBuyer && "!ml-0"}`}
          >
            {actualLen > INIT_DISPLAY_COUNT && (
              <p
                className="text-sm text-[#f5ab35] flex justify-end mb-6 cp"
                onClick={(e) => setShowMore(!showMore)}
              >
                {showMore ? "Show more.." : "Show less.."}
              </p>
            )}

            {buildProgressTracker()}
          </div>
        )}
      </>
    );
}
import { ImCross } from "react-icons/im";
import { Modal } from "../components/GenericComponents";
import { useNavigate } from "react-router-dom";
import { CustomerRoutes } from "../../Routes";
import ls from "local-storage";
import { Constants } from "../../merchant/utils/Constants.js";
import AccSwitchPopup from "../../components/accountSwitch/AccSwitchPopup.js";
import { useEffect, useState } from "react";
import { ApiCalls, Apis } from "../../merchant/utils/ApiCalls.js";
import { USER_TYPE } from "../../constants/general";
import { PageLoader } from "../../utils/loader.js";

const PromptLoginPopup = ({
  isOpen,
  setIsOpen,
  loginText,
  signupText,
  loginClick,
  signupClick,
  additionalText,
  navigateTo //this is the route to navigate to on switch account handling 
}) => {
  const navigate = useNavigate();
  const [showSwitchPopup, setShowSwitchPopup] = useState(false); //controls the display of switch acc popup
  const [buyerData, setBuyerData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true); //show loader before confirming the background of current user (not logged in / logged in as seller)
  const [showLoginPopup, setShowLoginPopup] = useState(false); //controls the display of login prompt

  //merchant account details
  var seller = ls(Constants.localStorage.user);
  if (seller) seller = JSON.parse(seller);

  useEffect(() => {
    //if logged in as seller, check for their buyer account and show switch acc popup
    //else prompt login popup
    if (seller) switchToBuyer();
    else {
      setIsLoading(false)
      setShowLoginPopup(true)
    }
  }, []);

  const switchToBuyer = () => {
    ApiCalls(
      {},
      Apis.switchToBuyer,
      "GET",
      { Authorization: "Bearer " + seller?.access },
      (res, api) => {
        if (res.data.result === "SUCCESS") {
          let rdata = res.data.data;
          setBuyerData(rdata);
          setShowSwitchPopup(true);
          setShowLoginPopup(false)
        } else {
          setShowSwitchPopup(false);
          setShowLoginPopup(true)
        }

        setIsLoading(false)
      }
    );
  };

  const signup = () => {
    if (signupClick) signupClick();
    navigate(CustomerRoutes.SignUp);
  };

  const login = () => {
    if (loginClick) loginClick();
    navigate(CustomerRoutes.Login);
  };
  

  return (
    <>
      {isLoading ? (
        <PageLoader />
      ) : (
        <>
          {showSwitchPopup && (
            <AccSwitchPopup
              showSwitchPopup={showSwitchPopup}
              onClose={() => {
                setShowSwitchPopup(false)
                setIsOpen(false)
              }}
              userOldData={{ ...seller }}
              userNewData={{ ...buyerData }}
              switchingTo={USER_TYPE.BUYER}
              navigateTo={navigateTo}
            />
          )}  
          {showLoginPopup && (
            <Modal
              title=""
              open={isOpen}
              close={() => setIsOpen(false)}
              width="max-sm:w-11/12 w-[562px]"
            >
              <div className="w-full">
                <div className=" flex justify-between mb-4">
                  <div className="inline font-bold text-xl"></div>
                  <button
                    type="button"
                    className="inline"
                    onClick={() => setIsOpen(false)}
                  >
                    <ImCross></ImCross>
                  </button>
                </div>
                <div className="flex flex-col gap-[27px] sm:px-[30px] pb-[47px] pt-[10px]">
                  {additionalText}
                  <div className="flex flex-col items-center justify-center gap-6 p-7 border-2 shadow-md rounded-[6px] h-[164px]">
                    <p className="max-sm:text-lg text-2xl leading-9 text-center">
                      Returning Customer
                    </p>
                    <button
                      onClick={login}
                      className="flex items-center justify-center  text-darkOrange border max-sm:w-[180px] w-[400px] 
                max-sm:py-2 py-[13px] rounded-[6px] border-darkOrange font-medium whitespace-nowrap max-sm:text-xs"
                    >
                      {loginText ?? "LOGIN"}
                    </button>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-6 p-7 border-2 shadow-md rounded-[6px] h-[164px]">
                    <p className="max-sm:text-lg text-2xl leading-9 text-center">
                      New Customer
                    </p>
                    <button
                      onClick={signup}
                      className="flex items-center justify-center text-darkOrange border max-sm:w-[180px] w-[400px] 
                max-sm:py-2 py-[13px] rounded-[6px] border-darkOrange font-medium whitespace-nowrap max-sm:text-xs"
                    >
                      {signupText ?? "SIGN UP"}
                    </button>
                  </div>
                </div>
              </div>
            </Modal>)}
        </>
      )}
    </>
  );
};

export default PromptLoginPopup;

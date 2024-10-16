import { Links } from "../GenericSections";
import Navbar from "../../components/navbar/Navbar";
import { useEffect, useState } from "react";
import { MdAdd, MdRemove } from "react-icons/md";
import { isValidUrl } from "../../../utils/general";
import { CommonApis } from "../../../Utils";
import { PageLoader } from "../../../utils/loader";
import { ApiCalls } from "../../../merchant/utils/ApiCalls";
import Select from "react-select";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import { toast } from "react-toastify";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  PLATFORM_IMAGES,
  PLATFORM_PARAMS,
} from "../affiliateCommissions/AffiliateConstants";
import { useLocation, useNavigate } from "react-router-dom";
import ls from "local-storage";
import { domainUrl } from "../../../apiUrls";
import { useMediaQuery } from "@mui/material";

const AffiliateSignup = () => {
  const user = JSON.parse(localStorage.getItem("customer"));
  const navigate = useNavigate();

  const location = useLocation();

  const [platformLinks, setPlatformLinks] = useState(
    location.state?.platformLinks || {}
  );
  const [otherLinks, setOtherLinks] = useState([]);
  // const [setUpLater, setSetUpLater] = useState(false);
  // const [showBankForm, setShowBankForm] = useState(true);
  const [bankList, setBankList] = useState([]);
  const [isBankListLoading, setIsBankListLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [accNumber, setAccNumber] = useState("");
  const [bank, setBank] = useState("");
  const [currentOtherLink, setCurrentOtherLink] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [affiliateUsername, setAffiliateUsername] = useState("");
  const [showUsernameErr, setShowUsernameErr] = useState(false);

  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");

  useEffect(() => {
    if (Object.keys(platformLinks).length === 0) {
      let links = {};
      PLATFORM_PARAMS.forEach(
        (_, index) => (links[PLATFORM_PARAMS[index]] = "")
      );
      setPlatformLinks({ ...links });
    }
  }, []);

  useEffect(() => {
    ApiCalls({}, CommonApis.settings, "POST", {}, (res, api) => {
      let banks = res.data.data?.bank;
      banks = banks.map((e) => {
        return { ...e, value: e?.name, label: e?.name };
      });
      setBankList(banks);
      setIsBankListLoading(false);
    });
  }, []);

  const onChange = (e, index) => {
    e.preventDefault();

    let links = { ...platformLinks };
    links[PLATFORM_PARAMS[index]] = e.target.value;

    setPlatformLinks({ ...links });
  };

  const handleFieldChange = (e, type) => {
    switch (type) {
      case "fullName":
        setFullName(e.target.value);
        break;
      case "accNumber":
        setAccNumber(e.target.value);
        break;
      default:
        console.log("default case");
    }
  };

  const submitAffiliateAccount = () => {
    var formData = new FormData();

    if (affiliateUsername) {
      if (affiliateUsername.length < 5 || affiliateUsername.length > 26) {
        toast.error("Affiliate username should be between 5-26 characters");
        return;
      } else formData.append("affiliate_username", affiliateUsername);
    } else {
      toast.error("Affiliate username is required");
      return;
    }

    for (const key in platformLinks) {
      let link = platformLinks[key];
      if (link && link !== "" && isValidUrl(link)) {
        formData.append(key, link);
      }
    }

    if (otherLinks.length > 0) {
      let otherLink = "";
      otherLinks.forEach((olink) => {
        if (olink && olink !== "" && isValidUrl(olink)) {
          otherLink += olink + ",";
        }
      });

      otherLink = otherLink.substring(0, otherLink.length - 1);
      formData.append("other_link", otherLink);
    }

    let flen = Array.from(formData.keys()).length;
    if (flen === 0) {
      toast.error("Atleast one promotion platform link should be provided");
      return;
    }

    if (fullName) formData.append("full_name", fullName);
    if (bank) formData.append("bank_id", bank.id);
    if (accNumber) formData.append("account_number", accNumber);

    BuyerApiCalls(
      formData,
      Apis.createAffiliateAccount,
      "POST",
      {
        Authorization: `Bearer ${user.access}`,
      },
      (res, api) => {
        if (res.data.result === "SUCCESS") {
          toast.success(res.data.message);

          if (fullName && bank && accNumber) ls("isAffiliate", true);

          setTimeout(() => navigate(-1), 1000);
        } else {
          toast.error(res.data.message);
        }
      }
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* {isLargeScreen ? <NewNavbar /> : <Navbar />} */}
      <Navbar />
      {isBankListLoading ? (
        <PageLoader />
      ) : (
        <div className="pt-10 sm:pt-20 bg-white w-4/5 max-w-[1800px] mx-auto">
          <button
            onClick={(e) => navigate(-1)}
            className="whitespace-nowrap text-[14px]  text-orangeButton mb-5"
          >
            {"<"}&nbsp;Back
          </button>
          <p className="font-bold text-xl">uShop Affiliate Programme</p>
          <p className="text-lg mt-1 text-orangeButton">
            Creating Your uShop Affiliate Account
          </p>

          <>
            <p className="font-bold mt-10 sm:mt-20">
              Set up your personalised affiliate link
            </p>

            <div className="flex gap-4 sm:gap-10 items-center max-sm:flex-wrap">
              <div className="w-full sm:w-3/5">
                <div className="flex gap-1 my-4 items-center max-sm:flex-wrap">
                  <p>{domainUrl}</p>
                  <div className="h-12 rounded-md border border-orangeButton px-5 flex items-center w-full">
                    <input
                      type="text"
                      placeholder="e.g. caifangRECCS"
                      className="placeholder-orangeButton text-orangeButton w-full"
                      value={affiliateUsername}
                      onChange={(e) => {
                        let value = e.target.value;
                        setAffiliateUsername(value);
                        if (value.length >= 5 && value.length < 27)
                          setShowUsernameErr(false);
                      }}
                    />
                  </div>
                </div>
                {showUsernameErr && (
                  <p className="text-xs text-red-500">
                    Username should be between 5-26 characters
                  </p>
                )}
              </div>
              <button
                className="rounded w-28 bg-orangeButton py-2 text-white text-center disabled:opacity-50"
                onClick={() => {
                  if (
                    affiliateUsername.length > 4 &&
                    affiliateUsername.length < 27
                  )
                    setShowPreview(!showPreview);
                  else setShowUsernameErr(true);
                }}
                disabled={!affiliateUsername}
              >
                Preview
              </button>
            </div>

            {showPreview && (
              <div className="flex gap-5 sm:gap-10 items-center mt-12 sm:mt-5 max-sm:flex-wrap">
                <div className="sm:h-12 py-4 rounded-md border border-black px-2 sm:px-5 flex items-center w-full sm:w-3/5">
                  <input
                    type="text"
                    value={domainUrl + affiliateUsername}
                    className="w-full font-bold max-sm:text-sm"
                    disabled={true}
                  />
                </div>

                <div>
                  <p className="font-bold">
                    This will be permanent once confirmed.
                  </p>
                  <p className="text-sm italic max-sm:hidden">
                    Do check that you are satisfied with your link <br />
                    before clicking “Proceed” at the end of the page.
                  </p>
                  <p className="text-sm italic sm:hidden">
                    Do check that you are satisfied with your link before
                    clicking “Proceed” at the end of the page.
                  </p>
                </div>
              </div>
            )}
          </>
          <div className="border-[12px] border-solid border-greyDivider my-6 sm:my-12"></div>

          <>
            <p className="font-bold sm:mt-20">Your Promotion Platforms</p>
            {PLATFORM_PARAMS.map((platform, index) => {
              return (
                <div
                  className={`border border-[#4A4545] h-14 my-10 w-full rounded-md flex items-center ${
                    platform === "Ltk" ? "gap-2 sm:gap-5" : "gap-4 sm:gap-8"
                  } px-5`}
                  key={`platform${index}`}
                >
                  <img
                    src={PLATFORM_IMAGES[index]}
                    alt={platform}
                    height={35}
                    width={platform === "Ltk" ? 50 : 35}
                  />
                  <input
                    type="text"
                    name={platform}
                    id={platform}
                    className="w-full"
                    value={platformLinks[PLATFORM_PARAMS[index]]}
                    onChange={(e) => onChange(e, index)}
                  />
                </div>
              );
            })}

            <div className="border border-[#4A4545] min-h-14 my-10 w-full rounded-md py-5 px-5">
              <div className="flex items-center justify-between gap-4">
                <input
                  type="text"
                  placeholder="Any other links (Type and click ADD)"
                  name="others"
                  id="others"
                  value={currentOtherLink}
                  className="w-full"
                  onChange={(e) => setCurrentOtherLink(e.target.value)}
                />

                <div
                  className="flex gap-1 items-center cp w-[50px]"
                  onClick={(_) => {
                    if (isValidUrl(currentOtherLink)) {
                      setOtherLinks([...otherLinks, currentOtherLink]);
                    }
                    setCurrentOtherLink("");
                  }}
                >
                  <MdAdd size={20} />
                  <p className="text-sm">ADD</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 flex-wrap items-center justify-start">
                {otherLinks.map((olink, linkIndex) => {
                  return (
                    <div className="px-2 py-1 rounded-md text-center text-sm text-[#837277] bg-[#f8e1c0] flex gap-2 items-center">
                      {olink}
                      <FontAwesomeIcon
                        icon={faXmark}
                        className="cp"
                        onClick={() => {
                          let oLinks = [...otherLinks];
                          oLinks.splice(linkIndex, 1);
                          setOtherLinks(oLinks);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </>

          <div className="border-[12px] border-solid border-greyDivider my-6 sm:my-12"></div>

          <div className="mb-10">
            <p className="font-bold sm:mt-10 mb-5">
              Which account would you like to withdraw your commissions to?
            </p>
            <div className="flex justify-between items-center  mb-5">
              {/* <div
                className="flex gap-1 items-center cp"
                onClick={(e) => setShowBankForm(!showBankForm)}
              >
                {showBankForm ? <MdRemove size={20} /> : <MdAdd size={20} />}
                <p className="text-sm">ADD BANK ACCOUNT</p>
              </div> */}

              {/* <div className="flex gap-1 items-center cp">
                <input
                  type="checkbox"
                  id="setLater"
                  name="setLater"
                  value="setLater"
                  // onChange={(e) => setSetUpLater(e.target.checked)}
                />
                <label for="setLater" className="text-sm">
                  Set Up Later
                </label>
              </div> */}
            </div>

            {/* {showBankForm && ( */}
            <div className="">
              <input
                id="fullName"
                type="text"
                placeholder="Account Holder's Full Name"
                value={fullName}
                onChange={(e) => handleFieldChange(e, "fullName")}
                className="appearance-none w-full px-3 py-2 border border-black rounded-md mb-8
                                shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 sm:text-sm"
              />

              <Select
                id="bankList"
                name="bankList"
                options={bankList}
                placeholder="Bank Name"
                className="text-sm mb-8 border border-black rounded-md"
                onChange={(e) => {
                  setBank(e);
                }}
              />

              <input
                id="accNumber"
                type="number"
                value={accNumber}
                placeholder="Account Number"
                onChange={(e) => handleFieldChange(e, "accNumber")}
                className="appearance-none block w-full px-3 py-2 border border-black rounded-md shadow-sm placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-amber-300 sm:text-sm"
              />
            </div>
            {/* )} */}
          </div>

          <div className="border-[12px] border-solid border-greyDivider my-12"></div>

          <button
            className="rounded bg-orangeButton px-5 py-2 text-white float-right mb-20"
            onClick={submitAffiliateAccount}
          >
            Proceed {">>"}
          </button>
        </div>
      )}
      <Links />
    </div>
  );
};

export default AffiliateSignup;

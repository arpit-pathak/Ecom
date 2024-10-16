import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Links } from "../GenericSections";
import Navbar from "../../components/navbar/Navbar";
import Loader, { PageLoader } from "../../../utils/loader";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import { IoIosAddCircleOutline } from "react-icons/io";
import { CiCircleMinus } from "react-icons/ci";
import {
  PLATFORM_IMAGES,
  PLATFORM_PARAMS,
} from "../affiliateCommissions/AffiliateConstants";
import { isValidUrl } from "../../../utils/general";
import { MdAdd } from "react-icons/md";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FaRegCopy } from "react-icons/fa";
import Pagination from "../../../utils/Pagination/pagination";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { CustomerRoutes } from "../../../Routes";
import { useMediaQuery } from "@mui/material";

const statusClass =
  "rounded-full font-bold py-3 px-7 border text-sm text-center cp min-w-[140px]";
const confirmStatusClass = "bg-[#EAFAF3] text-[#176644] border-[#176644]";
const trackedStatusClass = "bg-[#F1F7FF] text-[#0C5CC2] border-[#0C5CC2]";
const rejectStatusClass = "bg-[#FFF2F2] text-[#EA6969] border-[#EA6969]";
const activeConfirmClass ="bg-[#176644] text-[#EAFAF3] border-[#176644]";
const activeTrackedClass = "bg-[#0C5CC2] text-[#F1F7FF] border-[#0C5CC2]";
const activeRejectClass = "bg-[#EA6969] text-[#FFF2F2] border-[#EA6969]";

const ViewAffiliateCommissions = () => {
  const user = JSON.parse(localStorage.getItem("customer"));

  const [affiliateData, setAffiliateData] = useState(null);
  const [isAffiliateDataLoading, setIsAffiliateDataLoading] = useState(true);
  const [platformLinks, setPlatformLinks] = useState({});
  const [showPlatformLinks, setShowPlatformLinks] = useState(false);
  const [currentOtherLink, setCurrentOtherLink] = useState("");
  const [otherLinks, setOtherLinks] = useState([]);
  const [isUrlCopied, setIsUrlCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("credit");
  const [isTransactionDataLoading, setIsTransactionDataLoading] =
    useState(true);
  const [currentStatus, setCurrentStatus] = useState("");
  const [transactionList, setTransactionList] = useState([]);
  const [selectedDate, setSelectedDate] = useState({ label: "", value: "" });
  const [monthOptions, setMonthOptions] = useState([]);
  const [datewiseTransList, setDatewiseTransList] = useState(null);
  const [err, setErr] = useState({});

  //pagination
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [entries, setEntries] = useState(10);

  const navigate = useNavigate();
  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");

  const onChange = (e, index) => {
    e.preventDefault();

    let links = { ...platformLinks };
    links[PLATFORM_PARAMS[index]] = e.target.value;

    setPlatformLinks({ ...links });
  };

  useEffect(() => {
    BuyerApiCalls(
      {},
      Apis.getAffiliateDetails,
      "GET",
      {
        Authorization: `Bearer ${user.access}`,
      },
      (res, api) => {
        if (res.data?.result === "SUCCESS") {
          setAffiliateData(res.data.data);

          let links = res.data.data?.user_detail?.promotion_platform;

          if (links?.other_link) {
            let olinks = links?.other_link?.split(",");
            setOtherLinks([...olinks]);
          }

          delete links["other_link"];
          setPlatformLinks({ ...links });
        } else {
          toast.error(res.data.message);
        }
        setIsAffiliateDataLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (monthOptions.length > 0) {
      let index = monthOptions.length - 1;
      let lastMonth = monthOptions[index];

      setSelectedDate(lastMonth);
    }
  }, [monthOptions]);

  useEffect(() => {
    getTransactionList();
  }, [page, entries, activeTab, currentStatus, selectedDate]);

  const getTransactionList = () => {
    setIsTransactionDataLoading(true);
    let url =
      Apis.getAffiliateTransactions +
      "?page=" +
      page +
      "&list_length=" +
      entries +
      "&transaction_type=" +
      activeTab +
      "&status=" +
      currentStatus +
      "&month=" +
      selectedDate?.value;

    BuyerApiCalls(
      {},
      url,
      "GET",
      {
        Authorization: `Bearer ${user.access}`,
      },
      (res, api) => {
        if (res.data?.result === "SUCCESS") {
          if (monthOptions.length === 0) {
            let monthValue = res.data.data?.date_filter?.month_date;
            let newMonths = [];
            newMonths = res.data.data?.date_filter?.month_dropdown.map(
              (item, index) => {
                return { label: item, value: monthValue[index] };
              }
            );
            setMonthOptions([...newMonths]);
          }

          let transList = res.data.data?.transaction_list;
          let newList = {};
          if (transList.length > 0) {
            transList.forEach((trans, idx) => {
              if (newList.hasOwnProperty(trans?.formatted_transaction_date)) {
                let data = [...newList[trans?.formatted_transaction_date]];
                data.push(trans);
                newList[trans?.formatted_transaction_date] = data;
              } else newList[trans?.formatted_transaction_date] = [trans];
            });
          }

          setDatewiseTransList({ ...newList });
          setTransactionList(res.data.data?.transaction_list);
          setPages(res.data.data?.total_pages);
          setTotal(res.data.data?.total_records);
        } else {
          toast.error(res.data.message);
        }
        setIsTransactionDataLoading(false);
      }
    );
  };

  const copyUrl = () => {
    setIsUrlCopied(true);
    navigator.clipboard.writeText(affiliateData?.user_detail?.affiliate_url);

    setTimeout(() => setIsUrlCopied(false), 1000);
  };

  const changeEntries = (e) => {
    setEntries(e.target.value);
    setPage(1);
  };

  const toPage = (page) => {
    setPage(page);
  };

  const updateTab = (tab) => {
    setActiveTab(tab);
    setCurrentStatus("");
    setPage(1);
  };

  const updateStatus = (status) => {
    setCurrentStatus(status);
    setPage(1);
  };

  const updateAffiliateDetails = () => {
    var formData = new FormData();
    
    let error = {...err}
    for (const key in platformLinks) {
      let link = platformLinks[key];
      if (link && link !== "") {
        if(isValidUrl(link)) {
          formData.append(key, link);
          if(error.hasOwnProperty(key)) delete error[key]
        }
        else error[key] = `Invalid URL`;
      }else{
        if(error.hasOwnProperty(key)) delete error[key]
      }
    }

    setErr({...error})

    let errLen = Object.keys(error).length;
    if (errLen > 0) return;

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
      {isAffiliateDataLoading ? (
        <PageLoader />
      ) : (
        <div className=" pt-20 bg-white w-4/5 max-w-[1800px] mx-auto">
          <button
            onClick={(e) => navigate(-1)}
            className="whitespace-nowrap text-[14px]  text-orangeButton mb-5"
          >
            {"<"}&nbsp;Back
          </button>
          <p className="font-bold text-xl">uShop Affiliate Programme</p>

          {/* platforms section  */}
          <>
            <div className="flex justify-between items-center mt-20">
              <div className="flex gap-3 items-center">
                <p className="font-bold">Your Promotion Platforms</p>
                {showPlatformLinks ? (
                  <CiCircleMinus
                    size={18}
                    className="cp"
                    onClick={() => setShowPlatformLinks(false)}
                  />
                ) : (
                  <IoIosAddCircleOutline
                    size={18}
                    className="cp"
                    onClick={() => setShowPlatformLinks(true)}
                  />
                )}
              </div>

              <p
                className="text-orangeButton text-sm underline cp"
                onClick={() => setShowPlatformLinks(!showPlatformLinks)}
              >
                Edit Details
              </p>
            </div>

            {showPlatformLinks ? (
              <>
                {PLATFORM_PARAMS.map((platform, index) => {
                  return (
                    <div className="my-10">
                      <div
                        className={`border border-[#4A4545] h-14 w-full rounded-md flex items-center ${
                          platform === "Ltk" ? "gap-5" : "gap-8"
                        } px-5`}
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
                      <p className="text-red-500 text-xs pl-20 mt-2">
                        {err[platform]}
                      </p>
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

                <div className="text-center">
                  <button
                    className="rounded-full bg-orangeButton py-3 sm:px-28 px-14  font-bold "
                    onClick={updateAffiliateDetails}
                  >
                    Update
                  </button>
                  <div className="h-[1px] w-full bg-grey4Border my-8"></div>
                </div>
              </>
            ) : (
              <div className="h-[1px] w-full bg-grey4Border my-8"></div>
            )}
          </>

          {/* affiliate link and redeem section  */}
          <>
            <p className="font-bold">Your personalised affiliate link</p>
            <div
              className={`border border-orangeButton h-14 my-5 w-full rounded-md flex items-center justify-between px-5`}
            >
              <input
                type="text"
                name="affiliateUrl"
                id="affiliateUrl"
                className="w-full"
                value={affiliateData?.user_detail?.affiliate_url}
                disabled={true}
              />
              {isUrlCopied ? (
                <div className="px-2 h-6 text-orangeButton text-sm pt-0.5">
                  Copied
                </div>
              ) : (
                <FaRegCopy
                  size={20}
                  className="cp text-black"
                  onClick={copyUrl}
                />
              )}
            </div>
            <div className="h-[140px] bg-[#f8e1c0] w-full rounded p-8 mt-2">
              <p className="font-bold">Available to redeem:</p>
              <div className="flex justify-between items-center gap-8">
                <p className="text-xl sm:text-3xl font-bold mt-4">
                  $ {affiliateData?.affiliate_earning?.available_earning}
                </p>
                <div
                  className="bg-white rounded-full font-bold py-2 px-4 cp"
                  onClick={() =>
                    navigate(CustomerRoutes.AffiliateRedeem, {
                      state: {
                        affiliateEarning: affiliateData?.affiliate_earning,
                        bankDetail: affiliateData?.bank_detail,
                      },
                    })
                  }
                >
                  Redeem
                </div>
              </div>
            </div>
            <div className="h-[1px] w-full bg-grey4Border my-8"></div>
          </>

          {/* my commissions section */}
          <>
            <p className="font-bold">My Commissions:</p>
            <div className="flex flex-col items-center gap-4 my-5">
              <p>Lifetime Earnings</p>
              <p className="text-xl sm:text-5xl font-bold mt-4">
                $ {affiliateData?.affiliate_earning?.lifetime_earning}
              </p>
              <div className="flex gap-14 items-center">
                <div className="flex flex-col gap-2">
                  <p>Available to redeem</p>
                  <p>Tracked</p>
                  <p>Redeemed</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p>
                    ${" "}
                    {affiliateData?.affiliate_earning?.available_earning ??
                      "433.48"}
                  </p>
                  <p>
                    {" "}
                    ${" "}
                    {affiliateData?.affiliate_earning?.total_tracked ?? "12.63"}
                  </p>
                  <p> $ {affiliateData?.affiliate_earning?.total_redeemed}</p>
                </div>
              </div>
            </div>
            <div className="w-full flex items-center gap-6 mt-12">
              <div className="w-1/2">
                <p
                  className={`text-center cp ${
                    activeTab !== "credit" ? "text-[#4A4545]" : "font-bold"
                  }`}
                  onClick={() => updateTab("credit")}
                >
                  Commissions In
                </p>
                <div
                  className={`h-[3px] w-full ${
                    activeTab === "credit"
                      ? "bg-orangeButton"
                      : "bg-grey4Border"
                  } my-3`}
                ></div>
              </div>
              <div className="w-1/2">
                <p
                  className={`text-center cp ${
                    activeTab !== "debit" ? "text-[#4A4545]" : "font-bold"
                  }`}
                  onClick={() => updateTab("debit")}
                >
                  Commissions Out
                </p>
                <div
                  className={`h-[3px] w-full ${
                    activeTab === "debit" ? "bg-orangeButton" : "bg-grey4Border"
                  } my-3`}
                ></div>
              </div>
            </div>

            <div className="w-full md:px-20 flex justify-between items-center gap-5 my-6">
              {/* <div className="bg-white rounded-full font-bold py-3 px-7 border text-sm border-grey4Border flex items-center gap-3 cp">
                Date <IoIosArrowDown size={20} />{" "}
              </div> */}
              <Select
                placeholder="Date"
                onChange={(e) => setSelectedDate(e)}
                value={{ label: selectedDate.label }}
                name="filterDate"
                options={monthOptions}
                className="min-w-[150px] h-[43px] text-ellipsis text-sm"
              />

              <div className="flex gap-10 items-center lg:px-14 max-sm:flex-wrap max-sm:gap-4">
                {activeTab === "credit" ? (
                  <>
                    <div
                      className={`${statusClass} ${
                        currentStatus === "verified"
                          ? activeConfirmClass
                          : confirmStatusClass
                      }`}
                      onClick={() => updateStatus("verified")}
                    >
                      Confirmed
                    </div>
                    <div
                      className={`${statusClass} ${
                        currentStatus === "pending"
                          ? activeTrackedClass
                          : trackedStatusClass
                      }`}
                      onClick={() => updateStatus("pending")}
                    >
                      Tracked
                    </div>
                    <div
                      className={`${statusClass} ${
                        currentStatus === "reject"
                          ? activeRejectClass
                          : rejectStatusClass
                      }`}
                      onClick={() => updateStatus("reject")}
                    >
                      Rejected
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={`${statusClass} ${
                        currentStatus === "paid"
                          ? activeConfirmClass
                          : confirmStatusClass
                      }`}
                      onClick={() => updateStatus("paid")}
                    >
                      Completed
                    </div>
                    <div
                      className={`${statusClass} ${
                        currentStatus === "pending"
                          ? activeTrackedClass
                          : trackedStatusClass
                      }`}
                      onClick={() => updateStatus("pending")}
                    >
                      Pending
                    </div>
                    <div
                      className={`${statusClass} ${
                        currentStatus === "reject"
                          ? activeRejectClass
                          : rejectStatusClass
                      }`}
                      onClick={() => updateStatus("reject")}
                    >
                      Failed
                    </div>
                  </>
                )}
              </div>
            </div>

            {isTransactionDataLoading ? (
              <div className="h-[500px] w-full text-center mt-14">
                <Loader width="30px" height="30px" color="#F5AB35" />
                <p className="text-orangeButton">Loading...</p>
              </div>
            ) : (
              <>
                {transactionList.length > 0 ? (
                  <div className="listing-page md:px-20 py-8 my-10">
                    <div className="h-[500px] overflow-y-auto">
                      {Object.keys(datewiseTransList).map((key) => {
                        return (
                          <div key={`transaction${key}`}>
                            <p className="text-[#4A4545]">{key}</p>
                            {datewiseTransList[key].map((transaction) => {
                              return (
                                <div className="px-12 flex items-center justify-between gap-4 py-6">
                                  <div>
                                    <p>
                                      {activeTab === "debit"
                                        ? transaction?.receipt
                                        : transaction?.seller_shop_name}
                                    </p>
                                    <p className="text-xs text-[#4A4545] mt-1">
                                      {transaction?.order_number}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <p className="font-bold mb-1">
                                      $ {transaction?.transaction_amount}
                                    </p>
                                    <div
                                      className={`px-5 text-xs ${
                                        activeTab === "credit"
                                          ? transaction?.status === "VERIFIED"
                                            ? confirmStatusClass
                                            : transaction?.status === "PENDING"
                                            ? trackedStatusClass
                                            : rejectStatusClass
                                          : transaction?.status === "PAID"
                                          ? confirmStatusClass
                                          : transaction?.status === "PENDING"
                                          ? trackedStatusClass
                                          : rejectStatusClass
                                      }`}
                                    >
                                      {activeTab === "credit"
                                        ? transaction?.status === "VERIFIED"
                                          ? "Confirmed"
                                          : transaction?.status === "PENDING"
                                          ? "Tracked"
                                          : "Rejected"
                                        : transaction?.status === "PAID"
                                        ? "Completed"
                                        : transaction?.status === "PENDING"
                                        ? "Pending"
                                        : "Failed"}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            <div className="h-[1px] w-full mt-6 mb-3 bg-[#4A4545]"></div>
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
                  </div>
                ) : (
                  <div className="h-[300px] w-full text-center mb-10">
                    <p className="mt-20">No data found..</p>
                    <div className="h-[1px] w-full mt-32 bg-[#4A4545]"></div>
                  </div>
                )}
              </>
            )}
          </>
        </div>
      )}
      <Links />
    </div>
  );
};

export default ViewAffiliateCommissions;

import { useNavigate } from "react-router-dom";
import Navbar from "../../Navbar";
import { MerchantRoutes } from "../../../../Routes";
import { BsChevronLeft } from "react-icons/bs";
import {
  FaCheckCircle,
  FaTrash,
  FaExclamationCircle,
  FaDownload,
} from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Constants } from "../../../utils/Constants";
import ls from "local-storage";
import { ApiCalls, Apis } from "../../../utils/ApiCalls";
import Loader from "../../../../utils/loader";
import { toast } from "react-toastify";

const MAX_LEN = 18,
  MIN_LEN = 6;

const BarcodeUpload = () => {
  const navigate = useNavigate();
  const divRef = useRef();
  let user = ls(Constants.localStorage.user);
  if (user) user = JSON.parse(user);

  const [barcodes, setBarcodes] = useState([]);
  const [barcodeErr, setBarcodeErr] = useState("");
  const [divOnFocus, setDivOnFocus] = useState(false);

  const [checkingBarcode, setCheckingBarcode] = useState(false);
  const [barcodeResult, setBarcodeResult] = useState(null);

  const [currentStep, setCurrentStep] = useState(1);

  //input from barcode scanner
  const [barcode, setBarcode] = useState('');
  const [enterKeyPressed, setEnterKeyPressed] = useState(false);
  const [isNotFocused, setIsNotFocused] = useState(true);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if the Enter key is pressed
      if (event.key === 'Enter' && isNotFocused) {
        console.log('Barcode scanned:', barcode);
        setEnterKeyPressed(true)
      } else {
        if(!isNaN(event.key) && isNotFocused){
          let newBarcode = barcode + event.key
          // Append the character to the barcode state
          setBarcode(newBarcode);
        }
      }
    };

    // Add the event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup the event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [barcode, isNotFocused]);


  useEffect(()=>{
    if(enterKeyPressed) {
      if (
        barcode.length >= MIN_LEN &&
        barcode.length <= MAX_LEN 
        // && !barcodes.includes(barcode)
      ) updateBarcodeList([barcode])
      else setBarcodeErr("Barcode length is not appropriate")
      
      setBarcode('');
      setEnterKeyPressed(false)
    }
  },[enterKeyPressed])

  const handleClickOutside = (e) => {
    try {
      if (divRef.current && !divRef.current?.contains(e.target)) {
        setDivOnFocus(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handlePaste = (e) => {
    let data = e.clipboardData.getData("text");

    if (data.includes(",")) {
      data = data.split(",");
      console.log("comma");
    } else if (data.includes("\n")) {
      data = data.split("\n");
      console.log("line breaks");
    } else if(data.length >= MIN_LEN && data.length<= MAX_LEN){
      data = [data]
      console.log("Single barcode")
    } else {
      setBarcodeErr("Barcodes should be either separated by comma / line breaks.")
      return;
    }

    let latestData = [];

    for (let i = 0; i < data.length; i++) {
      let currentBarcode = data[i].trim();
      if (
        currentBarcode.length >= MIN_LEN &&
        currentBarcode.length <= MAX_LEN
        // && !barcodes.includes(currentBarcode)
      ) {
        latestData.push(currentBarcode);
      }
    }
    updateBarcodeList(latestData)
  };

  const updateBarcodeList = (newData) => {
    let newList = [...barcodes, ...newData];
    if (newData.length > 100 || newList.length > 100) {
      setBarcodeErr("Maximum 100 barcodes only allowed at a time");
    } else if (newData.length === 0) {
      setBarcodeErr("Invalid barcodes");
    } else {
      setBarcodeErr("");
      setBarcodes(newList);
    }
  }

  const checkBarcodes = () => {
    setCheckingBarcode(true);
    setBarcodeErr("");
    var fd = new FormData();
    fd.append("barcodes", barcodes.toString());
    ApiCalls(
      fd,
      Apis.checkBarcodes,
      "POST",
      {
        Authorization: "Bearer " + user.access,
      },
      (response, apiUrl) => {
        setCheckingBarcode(false);
        if(response?.data?.result === "FAIL"){
          toast.error(response?.data?.errors[0])
          return;
        }
        setBarcodeResult(response?.data?.data);
        setCurrentStep(2);
      }
    );
  };

  const updateSingleBarcode = (e, index) => {
    let list = [...barcodes];
    list[index] = e.target.value;

    setBarcodes([...list]);
  };

  const deleteCode = (index) => {
    let list = barcodeResult?.found_barcodes;

    // let barcode = list[index]?.barcode;
    // let codeIndex = barcodes.findIndex((item) => item === barcode);
    // let barcodeList = [...barcodes];
    // barcodeList.splice(codeIndex, 1);
    // setBarcodes(barcodeList);

    list.splice(index, 1);
    let result = { ...barcodeResult, found_barcodes: list };
    setBarcodeResult(result);

    if(list.length === 0) setCurrentStep(1)
  };

  const handleSubmit = () => {
    var fd = new FormData();

    let codes = barcodeResult?.found_barcodes.map(item => item.barcode)
    fd.append("barcodes", codes.toString());
    ApiCalls(
      fd,
      Apis.barcodesToDraftListing,
      "POST",
      {
        Authorization: "Bearer " + user.access,
      },
      (response, apiUrl) => {
        if (response.data.result === "SUCCESS") {
          if (response.data.errors.length > 0) {
            toast.warning(
              "Few barcodes are not found. Please download the error log for details"
            );
          }
          toast.success(response.data.message);

          setTimeout(()=>{
            navigate(-1);
            navigate(-1)
          }, 1500)
        } else {
          toast.error(response.data.message);
        }
      }
    );
  };

  const downloadErrLog = () => {
    if (
      barcodeResult &&
      barcodeResult?.non_existent_barcodes &&
      barcodeResult?.non_existent_barcodes.length > 0
    ) {
      const content = barcodeResult?.non_existent_barcodes.toString();
      const blob = new Blob(["Barcodes not found: " + content], {
        type: "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "barcodes_error_log.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (
      barcodeResult &&
      barcodeResult?.non_existent_barcodes.length === 0
    ) {
      toast.error("No error log to download");
    }
  };

  return (
    <main className="app-merchant merchant-db">
      {/* navbar */}
      <Navbar theme="dashboard" />

      {/* breadcrumbs */}
      <div className="breadcrumbs">
        <div className="page-title flex flex-row items-center gap-[12px]">
          <button
            className=""
            onClick={() => navigate(MerchantRoutes.ProductQuickListing)}
          >
            <BsChevronLeft />
          </button>{" "}
          Barcode Upload
        </div>

        <ul>
          <li>
            <a href={MerchantRoutes.Landing}>Home {">"}</a>
          </li>
          <li>
            <a href={MerchantRoutes.Products}>My Products {">"}</a>
          </li>
          <li>
            <a href={MerchantRoutes.ProductQuickListing}>QuickListing {">"}</a>
          </li>
          <li> Barcode Upload</li>
        </ul>
      </div>

      <div className="flex">
        <div className="w-[300px] max-sm:hidden bg-[#fff5e7] pl-12 pt-10 pr-8 pb-40">
          <p className="font-bold mb-5 text-lg">QUICK LISTING</p>

          {/* enter barcode numbers step */}
          <div className="flex gap-3 items-center">
            <FaCheckCircle color="#F5AB35" size={35} />
            <p className="font-bold text-[15px]">1. ENTER BARCODE NUMBERS</p>
          </div>
          <div className="flex gap-10 ml-3">
            <div className="bg-orangeButton w-[1px] h-[330px] mb-6"></div>
            <ul className="text-sm mt-4 list-item list-disc">
              <li>6-18 digits</li>
              <li>Enter upto 100 barcodes</li>
            </ul>
          </div>

          {/* check barcode step */}
          <div className="flex gap-3 items-center">
            <FaCheckCircle color="#F5AB35" size={35} />
            <p className="font-bold text-[15px]">2. CHECK BARCODE</p>
          </div>
          <div className="flex gap-10 ml-3 mt-2">
            <div className="bg-orangeButton w-[1px] h-[360px] mb-3"></div>
            <ul className="text-sm list-item list-disc">
              <li>
                Check if your item is within uShop’s library of 10,000 product
                templates
              </li>
            </ul>
          </div>

          {/* listing generation step */}
          <div className="flex gap-3 items-center">
            <FaCheckCircle color="#F5AB35" size={35} />
            <p className="font-bold text-[15px]">3. LISTING GENERATION</p>
          </div>
        </div>

        <div className="w-3/4 bg-white pt-[84px] px-12">
          <div className="h-[410px]">
            <p>1. Enter Barcode Numbers</p>
            <div
              className="text-right w-full max-w-[1000px] text-orangeButton cp text-xs underline mt-1 pr-3"
              onClick={() => {
                setBarcodes([]);
                setBarcodeErr("");
                // setBarcodeResult(null);
                // setCurrentStep(1);
              }}
            >
              Clear All
            </div>
            <div
              className={`w-full max-w-[1000px] mt-1 border rounded-md px-3 pb-3 h-[200px] overflow-y-scroll
            cursor-text ${divOnFocus && "border-orangeButton"}`}
              onPaste={handlePaste}
              onClick={() => setDivOnFocus(true)}
              ref={divRef}
            >
              {barcodes.length === 0 ? (
                <p className="text-grey4Border text-sm mt-2">
                  Scan barcodes separated by line breaks <br />
                  (or) <br /> 
                   Copy & paste the barcodes separated by comma / line breaks..
                </p>
              ) : (
                <div className="flex gap-2 mt-4 flex-wrap items-center justify-start">
                  {barcodes.map((item, barcodeIndex) => {
                    return (
                      <div
                        className="px-2 py-2 rounded-md text-center text-sm text-black bg-[#fff5e7] flex gap-2 
                            items-center"
                        key={barcodeIndex}
                      >
                        <input
                          value={item}
                          disabled={checkingBarcode}
                          type="text"
                          id={`barcode${barcodeIndex}`}
                          className="!border-0 !p-0 !w-36 max-w-36"
                          onChange={(e) => updateSingleBarcode(e, barcodeIndex)}
                          onFocus={() => setIsNotFocused(false)}
                          onBlur={() => {
                            setIsNotFocused(true);
                            setBarcode("");
                          }}
                        />
                        <FontAwesomeIcon
                          icon={faXmark}
                          className="cp"
                          onClick={() => {
                            let barcodeList = [...barcodes];
                            barcodeList.splice(barcodeIndex, 1);
                            setBarcodes(barcodeList);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="text-red-500 text-xs mt-2">{barcodeErr}</p>

            <button
              className="bg-orangeButton rounded-md text-white h-[35px] px-7 mt-5 text-sm disabled:bg-amber-300"
              onClick={checkBarcodes}
              disabled={barcodes.length === 0}
            >
              Check Barcodes
            </button>
          </div>

          <div className="h-[360px] mb-16">
            <p className="mb-8">2. Check barcodes within Ushop library</p>
            {checkingBarcode ? (
              <div className="text-center w-full max-w-[1000px] my-8">
                <Loader color="#F5AB35" height="40px" width="40px" />
              </div>
            ) : (
              <>
                {currentStep > 1 ? (
                  <div className=" h-[300px] w-full max-w-[1000px] overflow-y-auto overflow-x-hidden">
                    <table className="w-full mr-10 text-[#837277] text-sm border border-grey4Border ">
                      <tbody>
                        {barcodeResult?.found_barcodes?.map((item, indx) => {
                          return (
                            <tr key={`code${indx}`}>
                              <td
                                width="15%"
                                className="text-center border border-grey4Border py-1"
                              >
                                {indx + 1}
                              </td>
                              <td
                                width="85%"
                                className=" border border-grey4Border"
                              >
                                <div className="flex items-center mx-3 w-full">
                                  <p className="!w-[250px] text-left ">{item?.barcode}</p>
                                  <div className="flex gap-1 items-center !w-56 text-left">
                                    <FaCheckCircle color="#03B5B0" />
                                    <p className="text-[#03B5B0] font-bold text-xs">
                                      VERIFIED
                                    </p>
                                  </div>
                                  <div className="w-full flex justify-between items-center pr-3">
                                    <p className="text-left">
                                      {item?.product_name}
                                    </p>
                                    <FaTrash
                                      className="w-8 cp text-right"
                                      onClick={() => deleteCode(indx)}
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {barcodeResult?.non_existent_barcodes?.length > 0 &&
                          barcodeResult?.non_existent_barcodes?.map(
                            (item, indx) => {
                              return (
                                <tr
                                  key={`code${
                                    indx + barcodeResult?.found_barcodes?.length
                                  }`}
                                >
                                  <td
                                    width="15%"
                                    className="text-center border border-grey4Border py-1"
                                  >
                                    {indx +
                                      1 +
                                      barcodeResult?.found_barcodes?.length}
                                  </td>
                                  <td
                                    width="85%"
                                    className=" border border-grey4Border"
                                  >
                                    <div className="flex items-center mx-3 w-full">
                                      <p className="w-44 pr-10">{item}</p>
                                      <div className="w-full text-left justify-start flex gap-1 items-center">
                                        <FaExclamationCircle color="#F14142" />
                                        <p className="text-[#F14142] font-bold text-xs text-left">
                                          ERROR: NO DATA
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              );
                            }
                          )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm w-full max-w-[1000px] text-grey4Border text-center">
                    No barcode checked yet
                  </p>
                )}
              </>
            )}
          </div>

          <div className="h-[220px]  w-full max-w-[1000px]">
            <div className="flex gap-10 items-start justify-center">
              <button
                className="bg-white border border-grey4Border h-[48px] text-center text-[#837277] rounded-md px-3 py-1"
                onClick={downloadErrLog}
                disabled={barcodeResult === null || currentStep === 1}
              >
                <div className="flex gap-2">
                  <FaDownload />
                  <p className="font-bold text-sm">
                    Download Error File (.txt)
                  </p>
                </div>
              </button>

              <div>
                <button
                  className="bg-orangeButton h-[48px] w-[150px] text-center text-white rounded-md px-8 py-1 disabled:bg-amber-300"
                  disabled={currentStep === 1}
                  onClick={handleSubmit}
                >
                  <p className="ext-sm">Proceed</p>
                </button>
                <p className="text-xs text-orangeButton italic w-[170px] mt-2">
                  The verified barcodes will be generated into product Drafts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BarcodeUpload;

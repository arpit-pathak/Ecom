import { useEffect, useRef, useState } from "react";
import { ApiCalls, Apis } from "../../../utils/ApiCalls";
import ls from "local-storage";
import { Constants } from "../../../utils/Constants.js";
import Navbar from "../../Navbar.js";
import { BsChevronLeft, BsQuestion } from "react-icons/bs";
import { useNavigate, useLocation } from "react-router";
import { MerchantRoutes } from "../../../../Routes";
import { MdClose, MdCalendarViewMonth, MdCheck } from "react-icons/md";
import DatePicker from "react-datepicker";
import Select from "react-select";
import addVariantImg from "../../../../assets/add-variant-img.svg";
import { toast } from "react-toastify";
import { getId } from "../../../../Utils";
import Loader, { PageLoader } from "../../../../utils/loader.js";
import PreviewSection from "./previewSection.js";

const campaignPeriodOptions = [
  { label: "1 Day", value: 1 },
  { label: "2 Days", value: 2 },
  { label: "3 Days", value: 3 },
  { label: "4 Days", value: 4 },
  { label: "5 Days", value: 5 },
  { label: "6 Days", value: 6 },
  { label: "7 Days", value: 7 },
];

const CreateGroupBuy = () => {
  let idProduct = getId(window.location.pathname);
  
  const {state} = useLocation()
  const { productId, productName, type } = state; // Read values passed on state

  const pageTitle = idProduct && type !=="relaunch" ? "Edit Group Buy" : "Create Group Buy";
  document.title = pageTitle + " | uShop";


  let user = ls(Constants.localStorage.user);
  if (user) user = JSON.parse(user);

  const navigate = useNavigate();
  const inputRef = useRef();

  const [currentStatus, setCurrentStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // section 1 variables
  const [campaignId, setCampaignId] = useState(null);

  const [isProductListOpen, setIsProductListOpen] = useState(false);
  const [productList, setProductList] = useState([]);
  const [prodSearch, setProdSearch] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [segregatedVariations, setSegregatedVariations] = useState([]);
  const [selectedVariations, setSelectedVariations] = useState([]);

  // section 2 variables
  const [groupBuyPrice, setGroupBuyPrice] = useState("");
  const [showGroupBuyDesc, setShowGroupBuyDesc] = useState(false);

  const [successDiscountPrice, setSuccessDiscountPrice] = useState("");
  const [showSuccessDiscountDesc, setShowSuccessDiscountDesc] = useState(false);

  const [priceConfirmation, setPriceConfirmation] = useState(false);

  // section 3 variables
  const [successTargetQty, setSuccessTargetQty] = useState("");
  const [showSuccessTargetDesc, setShowSuccessTargetDesc] = useState(false);

  const [maxCampaignQty, setMaxCampaignQty] = useState("");
  const [showMaxCampaignQtyDesc, setShowMaxCampaignQtyDesc] = useState(false);

  const [maxQtyForSingleUser, setMaxQtyForSingleUser] = useState("");

  //section 4 variables
  const [campaignStartDate, setCampaignStartDate] = useState(null);
  const [campaignPeriod, setCampaignPeriod] = useState(null);
  const [campaignEndDate, setCampaignEndDate] = useState(null);

  //section 5 variables
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [selectedTimeslotIndex, setSelectedTimeslotIndex] = useState(0);
  const [timeslots, setTimeslots] = useState([]);

  //preview
  const [showPreview, setShowPreview] = useState(false);
  const [priceToShow, setPriceToShow] = useState("");
  const [soldQty, setSoldQty] = useState(0);

  const [isPublishing, setIsPublishing] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);

  useEffect(() => {
    if (idProduct) setIsLoading(true);
    var fd = new FormData();
    ApiCalls(
      fd,
      Apis.getTimeslotsAndCampaignId,
      "GET",
      {
        Authorization: "Bearer " + user.access,
      },
      processResponse
    );
  }, []);

  useEffect(() => {
    if (prodSearch !== null) {
      const getData = setTimeout(() => {
        var fd = new FormData();
        fd.append("search", prodSearch);
        ApiCalls(
          fd,
          Apis.searchGroupBuyProducts,
          "POST",
          {
            Authorization: "Bearer " + user.access,
          },
          processResponse
        );
      }, prodSearch === "" ? 0 : 1000);

      return () => clearTimeout(getData);
    }
  }, [prodSearch]);

  useEffect(() => {
    if (isProductListOpen)
      document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
  }, [isProductListOpen]);

  useEffect(() => {
    if (campaignPeriod && campaignStartDate) {
      let startDate = new Date(campaignStartDate);
      let endDate = new Date(
        startDate.setDate(startDate.getDate() + (campaignPeriod?.value - 1))
      );
      setCampaignEndDate(new Date(endDate));
    }
  }, [campaignStartDate, campaignPeriod]);

  useEffect(() => {
    if (idProduct && timeslots.length > 0) {
      getGroupBuyDetail();
    }
  }, [timeslots]);

  useEffect(() => {
    if (productName) {
      setProdSearch(productName)
    }
  }, [productName]);

  const getGroupBuyDetail = () => {
    var fd = new FormData();

    ApiCalls(
      fd,
      Apis.getGroupBuy + idProduct + "/",
      "GET",
      {
        Authorization: "Bearer " + user.access,
      },
      processResponse
    );
  };

  const processResponse = (res, api) => {
    if (api === Apis.getTimeslotsAndCampaignId) {
      if (res.data.result === "SUCCESS") {
        setTimeslots(res.data.data?.time_slot);
        if (!idProduct || (idProduct &&  type === "relaunch")) setCampaignId(res.data.data?.groupbuy_campaign_id);
      }
      return;
    }

    if (api === Apis.searchGroupBuyProducts) {
      if (res.data.result === "SUCCESS") {
        let prods = res.data.data?.product_list?.products;
        setProductList(prods);
        if (prods.length > 0 && !productName) setIsProductListOpen(true);

        if(productName){
          let chosenProduct = prods.find(prod => prod?.id_product === productId && prod?.name === productName)
          setSelectedProduct({ ...chosenProduct });
          productSelection(chosenProduct)
        }
      }
    }

    if (api.includes(Apis.getGroupBuy)) {
      if (res.data.result === "SUCCESS") {
        let rdata = res.data.data.group_buy_detail;

        let prod = {
          id_product: rdata?.product_id,
          name: rdata?.product_id__name,
          cover_image: {
            list_img: rdata?.product_image,
          },
          variations: rdata?.product_variations,
          usual_price: rdata?.usual_price,
          available_shipping: rdata?.available_shipping ?? []
        };

        if(type !== "relaunch") setCampaignId(rdata?.campaign_label);
        setSelectedProduct({ ...prod });
        productSelection(prod);
        setGroupBuyPrice(rdata?.group_buy_price);
        setSuccessDiscountPrice(rdata?.success_discount_price);
        setSuccessTargetQty(rdata?.success_target_qty);
        setMaxCampaignQty(rdata?.max_campaign_qty);
        setMaxQtyForSingleUser(rdata?.max_qty_single_customer);
        setCurrentStatus(rdata?.status);
        setSoldQty(rdata?.group_buy_sold_qty)

        if(type !== "relaunch"){
          let parts = rdata?.start_datetime.split("-");
          setCampaignStartDate(new Date(parts[2], parts[1] - 1, parts[0]));

          parts = rdata?.delivery_date.split("-");
          setDeliveryDate(new Date(parts[2], parts[1] - 1, parts[0]));
        }
      

        let cpIndex = campaignPeriodOptions.findIndex(
          (item) => item.value === rdata?.campaign_period
        );
        setCampaignPeriod(campaignPeriodOptions[cpIndex]);       

        let tsIndex = timeslots.findIndex(
          (item) => item.id_slot === rdata?.time_slot_id
        );
        setSelectedTimeslotIndex(tsIndex);
      } else toast.error(res.data.message);

      setIsLoading(false);
    }
  };

  const handleClickOutside = (e) => {
    try {
      if (
        inputRef.current &&
        !inputRef.current?.contains(e.target) &&
        !selectedProduct
      ) {
        setIsProductListOpen(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const productSelection = (product) => {
    console.log("selected product ", product);
    setSelectedProduct(product);
    setIsProductListOpen(false);
    setProdSearch(null);

    let usualPrice = product?.usual_price;
    setPriceToShow(usualPrice);

    let varList = product?.variations;

    let newList = [],
      selList = [];
    varList.forEach((item) => {
      if (item.child.length > 0) {
        item.child.forEach((childItem) => {
          let img =
            childItem.image[0]?.img ?? item.image[0]?.list_img ?? addVariantImg;
          let newChildItem = {
            ...childItem,
            title: `${item.variation_value}, ${childItem.variation_value}`,
            displayImage: img,
          };
          newList.push(newChildItem);

          if (idProduct && childItem?.is_selected) selList.push(newChildItem);
        });
      } else {
        let img = item.image[0]?.list_img ?? addVariantImg;
        let newItem = {
          ...item,
          title: item.variation_value,
          displayImage: img,
        };
        if (newItem.title === null)
          newItem = { ...newItem, title: product?.name };

        newList.push(newItem);

        if (idProduct && item?.is_selected) {
          selList.push(newItem);
        }
      }
    });

    setSegregatedVariations([...newList]);

    if (idProduct) {
      setSelectedVariations([...selList]);

      if (selList.length > 0 && selList.length === newList.length)
        setIsAllSelected(true);
    }
  };

  const variationSelection = (variation) => {
    let selList = [...selectedVariations];
    if (selectedVariations.includes(variation)) {
      let index = selList.findIndex(
        (item) => item.id_product_variation === variation.id_product_variation
      );
      selList.splice(index, 1);
    } else selList.push(variation);

    if (selList.length === segregatedVariations.length) setIsAllSelected(true);
    else setIsAllSelected(false);

    setSelectedVariations([...selList]);
  };

  const tomorrow = () => {
    let today = new Date();
    return today.setDate(today.getDate() + 1);
  };

  const getMaxDate = () => {
    let date = new Date();
    return new Date(date.setMonth(date.getMonth() + 1));
  };

  const getMinDeliveryDate = () => {
    if (campaignEndDate) {
      let date = new Date(campaignEndDate);
      return date.setDate(date.getDate() + 1);
    }
    return null;
  };

  const getMaxdeliveryDate = () => {
    if (campaignEndDate) {
      let date = new Date(campaignEndDate);
      return new Date(date.setMonth(date.getMonth() + 1));
    }
    return null;
  };

  function convertDate(inputFormat) {
    function pad(s) {
      return s < 10 ? "0" + s : s;
    }
    var d = new Date(inputFormat);
    return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join("-");
  }

  const submitGroupBuy = (status) => {
    if (!selectedProduct) {
      toast.error("Please select a product");
      return;
    }

    if (segregatedVariations.length !== 0 && selectedVariations.length === 0) {
      toast.error("Please select atleast one product variation");
      return;
    }

    if (groupBuyPrice === "") {
      toast.error("Please enter group buy price");
      return;
    }

    if (successDiscountPrice === "") {
      toast.error("Please enter success discounted price");
      return;
    }

    if (!priceConfirmation) {
      toast.error("Please agree to the success discount price");
      return;
    }

    if (successTargetQty === "") {
      toast.error("Please enter success target quantity");
      return;
    }

    if (maxCampaignQty === "") {
      toast.error("Please enter maximum campaign quantity");
      return;
    }

    if (maxQtyForSingleUser <= 0) {
      toast.error("Please enter maximum quantity for single customer");
      return;
    }

    if (!campaignStartDate) {
      toast.error("Please select campaign start date");
      return;
    }

    if (!campaignPeriod) {
      toast.error("Please select campaign period");
      return;
    }

    if (!deliveryDate) {
      toast.error("Please select order delivery date");
      return;
    }

    if (selectedTimeslotIndex < 0) {
      toast.error("Please select one delivery timeslot");
      return;
    }

    if (status === "draft") setIsDrafting(true);
    else setIsPublishing(true);

    let product_variation_ids = selectedVariations.map(
      (item) => item.id_product_variation
    );
    let shippingId = timeslots[selectedTimeslotIndex].shipping_option_id;
    let timeslotId = timeslots[selectedTimeslotIndex].id_slot;

    var fd = new FormData();

    fd.append("product_id", selectedProduct?.id_product);
    fd.append("product_variation_id", product_variation_ids.toString());
    fd.append("group_buy_price", groupBuyPrice);
    fd.append("success_discount_price", successDiscountPrice);
    fd.append("success_target_qty", successTargetQty);
    fd.append("max_campaign_qty", maxCampaignQty);
    fd.append("max_qty_single_customer", maxQtyForSingleUser);
    fd.append("start_date", convertDate(campaignStartDate));
    fd.append("campaign_period", campaignPeriod.value);
    fd.append("delivery_date", convertDate(deliveryDate));
    fd.append("shipping_option_id", shippingId);
    fd.append("time_slot_id", timeslotId);
    fd.append("status", status);

    ApiCalls(
      fd,
      idProduct && type !== "relaunch" ? Apis.updateGroupBuy + idProduct + "/" : Apis.createGroupBuy,
      "POST",
      {
        Authorization: "Bearer " + user.access,
      },
      (res, api) => {
        if (res.data.result === "FAIL") {
          toast.error(res.data.message);
          stopLoader(status)         
        } else {
          toast.success(res.data.message);

          setTimeout(() => {
            stopLoader(status)
            navigate(MerchantRoutes.GroupBuys);
          }, 2000);
        }
      }
    );
  };

  const stopLoader = (status) => {
    if (status === "draft") setIsDrafting(false);
    else setIsPublishing(false);
  }

  return (
    <main className="app-merchant merchant-db">
      <Navbar theme="dashboard" />

      {isLoading ? (
        <PageLoader />
      ) : (
        <div className={`w-full sticky top-0 z-[5]`}>
          <div className="breadcrumbs">
            <div className="page-title flex flex-row items-center gap-[12px]">
              <button
                className=""
                onClick={() => navigate(MerchantRoutes.GroupBuys)}
              >
                <BsChevronLeft />
              </button>
              Group Buys
            </div>

            <ul>
              <li>
                <a href={MerchantRoutes.Landing}>Home {">"}</a>
              </li>
              <li>
                <a href={MerchantRoutes.GroupBuys}>Marketing Centre {">"}</a>
              </li>
              <li>
                <a href={MerchantRoutes.GroupBuys}>Group Buys {">"}</a>
              </li>
              <li className="text-orangeButton">Create</li>
            </ul>
          </div>

          <div className="px-14 bg-white pt-5 pb-32">
            {/* section 1 */}
            <>
              <p className="font-bold">1. Set Up Group Buy</p>

              {/* campaign id */}
              <div className="flex items-center mt-6 gap-5">
                <p className="min-w-36 w-2/5">a. Campaign ID</p>
                <p className="text-gray-500">{campaignId}</p>
              </div>

              {/* product list */}
              <div className="flex items-center mt-6 gap-5">
                <p className="min-w-36 w-2/5">b. Select Product*</p>

                <div
                  className="bg-white flex border border-gray-300 rounded-md items-center relative py-2 gap-2 
                max-w-[450px] w-1/2"
                >
                  <input
                    placeholder="Select from products added under My Products"
                    type="text"
                    className="!border-0 !w-full h-6 !px-2.5"
                    value={
                      selectedProduct
                        ? selectedProduct.name
                        : prodSearch === null
                        ? ""
                        : prodSearch
                    }
                    onClick={() => setProdSearch("")}
                    onChange={(e) => setProdSearch(e.target.value)}
                    disabled={idProduct ? true : false}
                  />

                  <MdClose
                    onClick={() => {
                      if (!idProduct) {
                        setIsProductListOpen(false);
                        setProdSearch(null);
                        setSelectedProduct(null);
                        setSegregatedVariations([]);
                        setSelectedVariations([]);
                        setIsAllSelected(false);
                        if (showPreview) setShowPreview(false);
                      }
                    }}
                    className="text-gray-400 cursor-pointer mr-3"
                  />

                  {isProductListOpen ? (
                    <div ref={inputRef}>
                      <div className="absolute right-1 top-11 w-full bg-white overflow-auto max-h-36 shadow-md py-2 z-10">
                        {productList.map((item, index) => {
                          return (
                            <div
                              className="flex gap-4 mb-2 items-center px-3 hover:bg-[#fae2bd] cp"
                              onClick={() => productSelection(item)}
                              key={index}
                            >
                              <img
                                src={item?.cover_image?.list_img}
                                alt="Product"
                                height={40}
                                width={40}
                                className="my-2"
                              />
                              <p className="text-sm" onClick={() => {}}>
                                {item?.name}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* variations section */}
              {selectedProduct && segregatedVariations.length > 0 && (
                <div className="flex mt-24 gap-5">
                  <p className="min-w-36 w-2/5 pr-5">
                    c. Select Product Variation(s) that will be included into
                    the Group Buy campaign*
                  </p>
                  <div className="max-w-[450px]">
                    {/* select all */}
                    <div className="flex gap-2">
                      <div
                        className={`border border-gray-300 h-5 w-5 cp text-white mb-7 ${
                          isAllSelected ? "bg-orangeButton" : "bg-white"
                        }`}
                        onClick={() => {
                          if (isAllSelected) setSelectedVariations([]);
                          else setSelectedVariations([...segregatedVariations]);
                          setIsAllSelected(!isAllSelected);
                        }}
                      >
                        <MdCheck size={20} />
                      </div>
                      <p>Select All</p>
                    </div>
                    <div className="grid grid-cols-2">
                      {segregatedVariations.map((variation, idx) => {
                        return (
                          <div className="flex gap-4 mr-10 mb-8" key={idx}>
                            <div
                              className={`border border-gray-300 h-5 !w-5 cp text-white ${
                                selectedVariations.includes(variation) ||
                                variation.is_selected
                                  ? "bg-orangeButton"
                                  : "bg-white"
                              }`}
                              onClick={() => variationSelection(variation)}
                            >
                              <MdCheck size={20} />
                            </div>
                            <div>
                              <p>{variation.title ?? ""}</p>
                              <img
                                className="w-[50px] mr-auto ml-auto block variant-img mt-2"
                                src={variation?.displayImage ?? addVariantImg}
                                alt=""
                              />{" "}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>

            {/* section 2 */}
            <>
              <p className="font-bold mt-10 mb-6">2. Campaign Prices</p>

              {/* section 2 description */}
              <ul className="list-disc text-justify ml-8 mb-10">
                <li className="mb-3">
                  This will be an umbrella set of prices applied to all the
                  Product Variations selected for the campaign.
                </li>
                <li className="mb-3">
                  uShop’s Group Buy is marketed to provide the best deal in town
                  so as to create a competitive edge for your campaigns. Other
                  Sellers are doing their part to maintain this edge. Do play
                  your part in the community to ensure that the Success
                  Discounted Price (P<sub>success</sub>) offered is the lowest
                  around during your campaign period.
                </li>
                <li className="mb-3">
                  The validity of the great deal will help you spread the brand
                  further because online shoppers would naturally check the
                  prices on other platforms.
                </li>
              </ul>

              {/* Usual Price */}
              <div className="flex items-center mt-10 gap-5">
                {/* usual price */}
                <p className="min-w-36 w-2/5">
                  a. Usual Price, P<sub>USUAL</sub>
                </p>
                <div className="flex w-[300px] justify-between items-center p-2">
                  <p className="text-gray-500">
                    {selectedProduct?.usual_price ?? ""}
                  </p>
                  <p className="text-gray-400">SGD</p>
                </div>
              </div>

              {/* group buy price */}
              <div className="flex items-center mt-6 gap-5">
                <div className="flex items-center min-w-36 w-2/5 gap-6">
                  <p>
                    b. Group Buy Price, P<sub>GB</sub>
                  </p>
                  <div
                    className="h-7 w-7 rounded-2xl bg-[#DEDBD2] flex justify-center items-center relative cp"
                    onMouseLeave={() => setShowGroupBuyDesc(false)}
                    onMouseOver={() => setShowGroupBuyDesc(true)}
                  >
                    <BsQuestion size={25} color="#737373" />
                    {showGroupBuyDesc && (
                      <div className="absolute w-72 bg-gray-200 rounded-md p-2 top-8 left-0 text-gray-500 text-xs mb-3 z-10">
                        <p className="font-bold">
                          Group Buy Price, (P<sub>GB</sub>)
                        </p>
                        <br />
                        <p>This is the guaranteed promotional price.</p>
                        <br />
                        <p>
                          i.e. Once a customer joins your Group Buy, they will
                          be purchasing the item from you at this price (P
                          <sub>GB</sub>) EVEN IF the Success Target quantity to
                          be sold is not achieved.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex w-[300px] justify-between items-center border border-gray-400 rounded-md pr-2 py-2">
                  <input
                    placeholder="Enter group buy price"
                    type="text"
                    className="!border-0 !h-6 !w-full"
                    value={groupBuyPrice}
                    onChange={(e) => setGroupBuyPrice(e.target.value)}
                  />
                  <p className="text-gray-400">SGD</p>
                </div>
              </div>

              {/* success discount price */}
              <div className="flex items-center mt-6 gap-5">
                <div className="flex items-center min-w-36 w-2/5 gap-6">
                  <p>
                    c. Success Discounted Price, P<sub>SUCCESS</sub>
                  </p>
                  <div
                    className="h-7 w-7 rounded-2xl bg-[#DEDBD2] flex justify-center items-center relative cp"
                    onMouseLeave={() => setShowSuccessDiscountDesc(false)}
                    onMouseOver={() => setShowSuccessDiscountDesc(true)}
                  >
                    <BsQuestion size={25} color="#737373" />
                    {showSuccessDiscountDesc && (
                      <div className="absolute w-72 bg-gray-200 rounded-md p-2 top-8 left-0 text-gray-500 text-xs mb-3 z-10">
                        <p className="font-bold">
                          Success Discounted Price, (P<sub>SUCCESS</sub>)
                        </p>
                        <br />
                        <p>
                          This is the special discounted price if the Success
                          Target quantity to be sold is achieved.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex w-[300px] justify-between items-center border border-gray-400 rounded-md pr-2 py-2">
                  <input
                    placeholder="Enter success discount price"
                    type="text"
                    className="!border-0 !h-6 !w-full"
                    value={successDiscountPrice}
                    onChange={(e) => setSuccessDiscountPrice(e.target.value)}
                  />
                  <p className="text-gray-400">SGD</p>
                </div>
              </div>

              <div className="flex mt-6">
                <p className="min-w-36 w-2/5 text-white"></p>
                <div className="flex gap-3 w-3/5 ml-10">
                  <input
                    type="checkbox"
                    id="priceConfirmation"
                    name="priceConfirmation"
                    value="priceConfirmation"
                    checked={priceConfirmation}
                    onChange={(e) => setPriceConfirmation(e.target.checked)}
                    className="h-7 !w-7 accent-orangeButton !text-white"
                  />
                  <label htmlFor="priceConfirmation">
                    <div>
                      <p className="text-black font-bold">
                        * I have check that this price (P<sub>SUCCESS</sub>) is
                        the lowest on major platforms^ during the campaign
                        period.
                      </p>
                      <p className="italic text-gray-400 text-sm mt-4">
                        ^ Includes, but not limited to, published prices on
                        Shopee, Lazada, Qoo10, Red Mart, Grab Mart/Food, Panda
                        Mart/Express, and Fairprice.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </>

            {/* section 3 */}
            <>
              <p className="font-bold mt-10 mb-6">3. Success Target Quantity</p>

              {/* success target quantity */}
              <div className="flex items-center mt-6 gap-5">
                <div className="flex items-center min-w-36 w-2/5 gap-6">
                  <p>a. Success Target Quantity*</p>
                  <div
                    className="h-7 w-7 rounded-2xl bg-[#DEDBD2] flex justify-center items-center relative cp"
                    onMouseLeave={() => setShowSuccessTargetDesc(false)}
                    onMouseOver={() => setShowSuccessTargetDesc(true)}
                  >
                    <BsQuestion size={25} color="#737373" />
                    {showSuccessTargetDesc && (
                      <div className="absolute w-72 bg-gray-200 rounded-md p-2 top-8 left-0 text-gray-500 text-xs mb-3 z-10">
                        <p className="font-bold">Success Target Quantity</p>
                        <br />
                        <p>
                          The minimum quantity to be purchased to trigger the
                          Success Discounted Price, P<sub>SUCCESS</sub> .
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className=" w-[300px] border border-gray-400 rounded-md pr-2 py-2">
                  <input
                    placeholder="Enter success target quantity"
                    type="number"
                    className="!border-0 !h-6 !w-full"
                    value={successTargetQty}
                    onChange={(e) => setSuccessTargetQty(e.target.value)}
                  />
                </div>
              </div>

              {/* maximum campaign quantity */}
              <div className="flex items-center mt-6 gap-5">
                <div className="flex items-center min-w-36 w-2/5 gap-6">
                  <p>b. Maximum Campaign Quantity*</p>
                  <div
                    className="h-7 w-7 rounded-2xl bg-[#DEDBD2] flex justify-center items-center relative cp"
                    onMouseLeave={() => setShowMaxCampaignQtyDesc(false)}
                    onMouseOver={() => setShowMaxCampaignQtyDesc(true)}
                  >
                    <BsQuestion size={25} color="#737373" />
                    {showMaxCampaignQtyDesc && (
                      <div className="absolute w-72 bg-gray-200 rounded-md p-2 top-8 left-0 text-gray-500 text-xs mb-3 z-10">
                        <p className="font-bold">Maximum Campaign Quantity</p>
                        <br />
                        <p>
                          Maximum units you will fulfil at P<sub>Success</sub>.
                          This caps the number of units you will commit to the
                          Group Buy.
                        </p>
                        <br />
                        <p>
                          Once this number of orders exceeds, the system will
                          end your campaign for you. No additional customers
                          will be allowed to join.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className=" w-[300px] border border-gray-400 rounded-md pr-2 py-2">
                  <input
                    placeholder="Enter maximum campaign quantity"
                    type="number"
                    className="!border-0 !h-6 !w-full"
                    value={maxCampaignQty}
                    onChange={(e) => setMaxCampaignQty(e.target.value)}
                  />
                </div>
              </div>

              {/* max qty single customer can purchase */}
              <div className="flex items-center mt-10 gap-5">
                <p className="min-w-36 w-2/5">
                  c. Maximum quantity a single customer can purchase
                </p>
                <div className="w-[300px] border border-gray-400 rounded-md pr-2 py-2">
                  <input
                    placeholder="> 0"
                    type="number"
                    className="!border-0 !h-6 !w-full"
                    value={maxQtyForSingleUser}
                    onChange={(e) => setMaxQtyForSingleUser(e.target.value)}
                  />
                </div>
              </div>
            </>

            {/* section 4 */}
            <>
              <p className="font-bold mt-10 mb-6">4. Campaign Period</p>

              {/* campaign start date */}
              <div className="flex items-center mt-10 gap-5">
                <p className="min-w-36 w-2/5">a. Start Date / Time *</p>

                <div className="flex items-center gap-5">
                  <div
                    id="date-picker"
                    className="w-[300px] flex flex-row justify-between pr-2 items-center"
                  >
                    <div className="customDatePickerWidth">
                      <DatePicker
                        selected={campaignStartDate}
                        dateFormat="d/M/yyyy"
                        onChange={(date) => setCampaignStartDate(date)}
                        width="100%"
                        minDate={tomorrow()}
                        maxDate={getMaxDate()}
                        placeholderText="Select campaign start date"
                      />
                    </div>
                    <MdCalendarViewMonth color="#828282" className="w-5" />
                  </div>
                  <p className="text-gray-500">
                    00:01 &nbsp;&nbsp; GMT+8 (Singapore)
                  </p>
                </div>
              </div>

              {/* campaign period */}
              <div className="flex items-center mt-10 gap-5">
                <p className="min-w-36 w-2/5">b. Campaign Period *</p>

                <Select
                  id="campaignPeriod"
                  name="campaignPeriod"
                  options={campaignPeriodOptions}
                  value={campaignPeriod}
                  placeholder="Select no. of days"
                  isDisabled={campaignStartDate === null}
                  onChange={(e) => setCampaignPeriod(e)}
                  className="w-[300px]"
                />
              </div>

              {/* campaign end date */}
              <div className="flex items-center mt-10 gap-5">
                <p className="min-w-36 w-2/5">c. End Date, Time</p>
                <p className="text-gray-500 ml-2">
                  {campaignEndDate
                    ? `${campaignEndDate.getDate()}/${
                        campaignEndDate.getMonth() + 1
                      }/${campaignEndDate.getFullYear()}`
                    : "DD MM YYYY"}
                  &nbsp;&nbsp;&nbsp;&nbsp; 23:59 &nbsp;&nbsp; GMT+8 (Singapore)
                </p>
              </div>
            </>

            {/* section 5 */}
            <>
              <p className="font-bold mt-10 mb-6">5. Delivery Settings</p>

              {/* delivery date */}
              <div className="flex items-center mt-10 gap-5">
                <p className="min-w-36 w-2/5">
                  a. Date customers will receive orders,{" "}
                  <span className="font-bold">D*</span>
                </p>

                <div
                  id="date-picker"
                  className="w-[300px] flex flex-row justify-between pr-2 items-center"
                >
                  <div className="customDatePickerWidth">
                    <DatePicker
                      selected={deliveryDate}
                      dateFormat="d/M/yyyy"
                      onChange={(date) => setDeliveryDate(date)}
                      width="100%"
                      minDate={getMinDeliveryDate()}
                      maxDate={getMaxdeliveryDate()}
                      disabled={campaignEndDate === null}
                      placeholderText="Enter order delivery date"
                    />
                  </div>
                  <MdCalendarViewMonth color="#828282" className="w-5" />
                </div>
              </div>

              {/* delivery option */}
              <div className="mt-6">
                <p className="min-w-36 w-2/5">b. Delivery Option</p>
                <p className="text-gray-400 italic mb-6">
                  Please select ONE only
                </p>

                {/* delivery options table */}
                <table
                  id="groupBuyTimeslotTable"
                  className="max-w-[1200px] w-full"
                >
                  <thead className="px-4">
                    <tr className="border-gray-300 border-b">
                      <td width="45%" className="pb-3">
                        <p className="w-[70%]">
                          Time Slots your customers will receive their orders
                        </p>
                      </td>
                      <td width="20%">Item packed by</td>
                      <td width="25%">Driver pick-up from you</td>
                      <td width="10%"></td>
                    </tr>
                  </thead>
                  <tbody>
                    {timeslots?.map((item, idx) => {
                      return (
                        <tr className="border-gray-300 border-b" key={idx}>
                          <td width="45%" className="py-3">
                            <div className="flex items-center">
                              <div className="text-white text-sm bg-[#4A5759] text-center p-2 mx-2 rounded w-48">
                                {item.shipping_option_id === 2 && (
                                  <>
                                    All Day Receiving
                                    <br />
                                  </>
                                )}
                                {item?.delivery_slot}
                              </div>
                              <img
                                alt="delivery-logo"
                                src={item?.shipping_logo}
                                width={60}
                                className="h-6"
                              />
                            </div>
                          </td>
                          <td width="25%">
                            <p className=" mr-8">
                              {item.shipping_option_id === 2 ? (
                                <>D-1,&nbsp; &nbsp; &nbsp;</>
                              ) : (
                                <>D,&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</>
                              )}

                              {item?.pickup_slot?.substring(
                                0,
                                item?.pickup_slot.indexOf("-")
                              )}
                            </p>
                          </td>
                          <td width="30%">
                            <div className="flex gap-5 items-center">
                              {item.shipping_option_id === 2 ? (
                                <>D-1,&nbsp; &nbsp; &nbsp;</>
                              ) : (
                                <>D,&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</>
                              )}
                              {item?.pickup_slot ?? ""}
                            </div>
                          </td>
                          <td width="10%">
                            <div
                              className={`h-8 w-8 mr-5 border border-orangeButton ${
                                selectedTimeslotIndex === idx
                                  ? "bg-orangeButton"
                                  : "bg-white"
                              }
                             rounded-full`}
                            >
                              <input
                                type="radio"
                                name="timeslot"
                                className="h-full w-full opacity-0"
                                value={item?.pickup_slot}
                                onChange={(e) => setSelectedTimeslotIndex(idx)}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <p className="italic mt-8">
                  D : Date your customers will receive their orders (i.e. 5a)
                </p>
                <p className="italic">D-1 : A day before D</p>
                <br />
                <p>
                  Details and rates of the various delivery options can be
                  checked under your{" "}
                  <span className="font-bold">Shipment Settings</span>
                </p>
              </div>
            </>

            {/* preview button */}
            <div className="text-center mt-10 w-full max-w-[1200px]">
              <button
                className="cp text-center rounded-md bg-[#f5ab35] text-sm text-white h-10 w-28 hover:bg-amber-500
                             disabled:opacity-50  disabled:cursor-default"
                disabled={
                  !selectedProduct ||
                  groupBuyPrice === "" ||
                  successDiscountPrice === "" ||
                  successTargetQty === "" ||
                  maxCampaignQty === ""
                }
                onClick={() => {
                  if (
                    selectedProduct &&
                    groupBuyPrice !== "" &&
                    successDiscountPrice !== "" &&
                    successTargetQty !== "" &&
                    maxCampaignQty !== ""
                  )
                    setShowPreview(!showPreview);
                }}
              >
                {showPreview ? "Hide Preview" : "Preview"}
              </button>
            </div>

            {showPreview && selectedProduct && (
              <PreviewSection
                product={selectedProduct}
                priceToShow={priceToShow}
                guaranteedPrice={successDiscountPrice}
                dealPrice={groupBuyPrice}
                successTargetQty={successTargetQty}
                maxCampaignQty={maxCampaignQty}
                soldQty={soldQty}
              />
            )}

            {(idProduct && (currentStatus === "draft" || type === "relaunch")) || !idProduct ? (
              <div className="flex justify-between w-full max-w-[1200px] mt-10">
                <button
                  className="cp text-center rounded-md bg-[#f5ab35] text-sm text-white h-10 w-28 hover:bg-amber-500
                             disabled:opacity-50  disabled:cursor-default"
                  onClick={() => submitGroupBuy("draft")}
                  disabled={isDrafting}
                >
                  {isDrafting ? <Loader /> : "Save as Draft"}
                </button>
                <button
                  className="cp text-center rounded-md bg-[#f5ab35] text-sm text-white h-10 w-20 hover:bg-amber-500
                             disabled:opacity-50  disabled:cursor-default"
                  onClick={() => submitGroupBuy("publish")}
                  disabled={isPublishing}
                >
                  {isPublishing ? <Loader /> : "Publish"}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </main>
  );
};

export default CreateGroupBuy;

import { useEffect, useRef, useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import DatePicker from "react-datepicker";
import { TfiCalendar } from "react-icons/tfi";
import { ApiCalls, Apis } from "../../utils/ApiCalls.js";
import { Modal } from "../../../customer/components/GenericComponents.js";
import { SHIPPING_TYPE } from "../../../constants/general.js";
import { CommonApis } from "../../../Utils.js";
import { toast } from "react-toastify";
import { IoCloseOutline } from "react-icons/io5";
import { FaCaretDown } from "react-icons/fa";
import { IoIosArrowRoundBack } from "react-icons/io";
import tickIcon from "../../../assets/orange-tick.svg";
import { MerchantRoutes } from "../../../Routes.js";

const contentClass = "text-sm text-black";
const labelClass = "text-sm font-normal text-[#828282] whitespace-nowrap";

export default function ConfirmOrderPopup({
  toggleConfirmOrder,
  closeConfirmOrderPopup,
  isSingleOrder,
  orderId,
  selectedOrders,
  processConfirmOrder,
  completeMassOrderConfirm,
  user,
  sellerDetail,
  userDetail,
  type,
  redeliveryFees,
}) {
  const [isConfirmOrder, setIsConfirmOrder] = useState(false);
  const [isConfirmOrderLoading, setIsConfirmOrderLoading] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [deliveryTimeSlots, setDeliveryTimeSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(-1);
  const [actualTimeSlot, setActualTimeSlot] = useState(-1);
  const [isMassConfirmingOrder, setIsMassConfirmingOrder] = useState(false);
  const [isDeliverySettingsShow, setIsDeliverySettingsShow] = useState(false);
  const [deliveryType, setDeliveryType] = useState(0);
  const [isPrevDate, setIsPrevDate] = useState(false);
  const [phList, setPhList] = useState([]);
  const [enabledDates, setEnabledDates] = useState([]);
  const [pickupDate, setPickupDate] = useState(
    new Date(sellerDetail?.pickup_date)
  );
  const [pickupAddressList, setPickupAddressList] = useState([]);
  const [showAddressList, setShowAddressList] = useState(false);
  const [selectedPickupAddressId, setSelectedPickupAddressId] = useState(null);
  const [currPickupAddress, setCurrPickupAddress] = useState(
    sellerDetail?.pickup_address
  );

  const [receiverName, setReceiverName] = useState(userDetail?.full_name);
  const [receiverContact, setReceiverContact] = useState(
    userDetail?.contact_number
  );
  const [ReceiverAddress, setReceiverAddress] = useState(
    userDetail?.address_details
  );
  const [ReceiverUnitNo, setReceiverUnitNo] = useState(userDetail?.unit_number);
  const [ReceiverPostalCode, setReceiverPostalCode] = useState(
    userDetail?.postal_code
  );

  const today = new Date();
  const minDate = new Date();
  const datePickerRef = useRef(null);
  minDate.setDate(today.getDate() + 2);

  useEffect(() => {
    ApiCalls({}, CommonApis.settings, "POST", {}, (res, api) => {
      let rdata = res.data.data;
      let phs = [
        ...rdata?.current_yr_ph_holidays,
        ...rdata?.next_yr_ph_holidays,
      ];
      setPhList(phs);
    });
  }, []);

  useEffect(() => {
    if (showAddressList) {
      ApiCalls(
        {},
        Apis.sellerPickup,
        "GET",
        { Authorization: "Bearer " + user.access },
        (res) => {
          if (res?.data?.result === "SUCCESS") {
            setPickupAddressList(res.data.data);
          }
        }
      );
    }
  }, [showAddressList]);

  useEffect(() => {
    if (sellerDetail?.shipping_id === 5 && phList.length > 0) {
      const today = new Date();

      const dates = [];
      dates[0] = new Date(today);
      dates[0].setDate(dates[0].getDate() + 1);
      dates[0] = checkForWeekend(dates[0]);

      dates[1] = new Date(dates[0]);
      dates[1].setDate(dates[0].getDate() + 1);
      dates[1] = checkForWeekend(dates[1]);

      dates[2] = new Date(dates[1]);
      dates[2].setDate(dates[1].getDate() + 1);
      dates[2] = checkForWeekend(dates[2]);

      setEnabledDates(dates);
    }
  }, [phList]);

  useEffect(() => {
    if (isSingleOrder) {
      onConfirmOrder();
    }
  }, []);

  const checkForWeekend = (date) => {
    let checkRequired = "";
    let day = date.getDay();

    //check if sunday
    if (day === 0) {
      checkRequired = "ph";
      date.setDate(date.getDate() + 1);
    }

    //check if saturday
    else if (day === 6) {
      checkRequired = "ph";
      date.setDate(date.getDate() + 2);
    }

    //check for PH
    else {
      let idx = 0;
      while (idx !== -1) {
        idx = phList.findIndex((item) => item?.date === getFormatDate(date));
        if (idx >= 0) {
          date.setDate(date.getDate() + 1);
          checkRequired = "weekend";
        }
      }
    }

    if (checkRequired !== "") checkForWeekend(date);

    return date;
  };

  const getFormatDate = (date) => {
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    return formattedDate;
  };

  const massConfirmationComplete = () => {
    setIsMassConfirmingOrder(false);
    closeConfirmOrderPopup();
    completeMassOrderConfirm();
  };

  const onMassConfirmOrder = async () => {
    setIsMassConfirmingOrder(true);

    for (var i = 0; i < selectedOrders.length; i++) {
      let fd = new FormData();
      fd.append("id_order", selectedOrders[i].order_id);
      await ApiCalls(
        fd,
        Apis.sellerOrderConfirm,
        "POST",
        { Authorization: "Bearer " + user.access },
        processConfirmOrder
      );

      if (i === selectedOrders.length - 1) {
        setTimeout(() => massConfirmationComplete(), 2000);
      }
    }
  };

  const onConfirmOrder = (e) => {
    setIsDeliverySettingsShow(true);

    setDeliveryType(sellerDetail.shipping_id);
    var selTimeSlot = sellerDetail.delivery_time;
    var selTimeSlotIndex = sellerDetail.available_timeslot.findIndex(
      (time) => selTimeSlot === time.delivery_slot
    );

    setDeliveryTimeSlots(sellerDetail.available_timeslot);
    setSelectedTimeSlot(selTimeSlotIndex);
    setActualTimeSlot(selTimeSlotIndex);

    //if delivery date is prev day, set current date as delivery date on change
    let isPrevDate = new Date(sellerDetail.delivery_date) < new Date();
    setIsPrevDate(isPrevDate);
    setDeliveryDate(
      isPrevDate ? new Date() : new Date(sellerDetail.delivery_date)
    );
  };

  const toggleDeliverySettings = (e) => {
    setIsDeliverySettingsShow((prev) => !prev);
    setIsConfirmOrder((prev) => !prev);
  };

  const onOrderConfirmed = (res, api) => {
    if (res.data?.result === "SUCCESS") processConfirmOrder(res, api);
    else toast.error(res.data.message);
    handleConfirmCancel();
  };

  const updateConfirmation = () => {
    setIsConfirmOrderLoading(true);

    let fd = new FormData();

    if (
      sellerDetail?.delivery_method !== "Instant Delivery" &&
      sellerDetail?.shipping_id !== 5
    ) {
      var delDate = new Date(sellerDetail.delivery_date);
      var formDeliveryDate = getFormatDate(deliveryDate);

      if (
        deliveryDate < delDate ||
        deliveryDate > delDate ||
        actualTimeSlot !== selectedTimeSlot
      ) {
        fd.append("time_slot_id", deliveryTimeSlots[selectedTimeSlot].id_slot);
        fd.append("delivery_date", formDeliveryDate);
      }
    }

    if (sellerDetail?.shipping_id === 5) {
      var pickDate = new Date(sellerDetail.pickup_date);

      var formPickupDate = getFormatDate(pickupDate);

      if (
        pickupDate < pickDate ||
        pickupDate > pickDate ||
        actualTimeSlot !== selectedTimeSlot
      ) {
        fd.append("time_slot_id", deliveryTimeSlots[selectedTimeSlot].id_slot);
        fd.append("pickup_date", formPickupDate);
      }
    }

    fd.append("id_order", orderId);

    ApiCalls(
      fd,
      Apis.sellerOrderConfirm,
      "POST",
      { Authorization: "Bearer " + user.access },
      onOrderConfirmed
    );
  };

  const handleEditUpdateConfirmation = () => {
    setIsConfirmOrderLoading(true);

    let fd = new FormData();
    fd.append("full_name", receiverName);
    fd.append("contact_number", receiverContact);
    fd.append("postal_code", ReceiverPostalCode);
    fd.append("address_details", ReceiverAddress);
    fd.append("unit_number", ReceiverUnitNo);

    if (selectedPickupAddressId) {
      fd.append("pickup_address_id", selectedPickupAddressId);
    }

    if (
      sellerDetail?.delivery_method !== "Instant Delivery" &&
      sellerDetail?.shipping_id !== 5
    ) {
      var delDate = new Date(sellerDetail.delivery_date);
      var formDeliveryDate = getFormatDate(deliveryDate);

      if (deliveryDate !== delDate || actualTimeSlot !== selectedTimeSlot) {
        fd.append("time_slot_id", deliveryTimeSlots[selectedTimeSlot].id_slot);
        fd.append("delivery_date", formDeliveryDate);
      }
    }

    if (sellerDetail?.shipping_id === 5) {
      var pickDate = new Date(sellerDetail.pickup_date);

      var formPickupDate = getFormatDate(pickupDate);

      if (
        pickupDate < pickDate ||
        pickupDate > pickDate ||
        actualTimeSlot !== selectedTimeSlot
      ) {
        fd.append("time_slot_id", deliveryTimeSlots[selectedTimeSlot].id_slot);
        fd.append("pickup_date", formPickupDate);
      }
    }

    fd.append("id_order", orderId);

    ApiCalls(
      fd,
      Apis.sellerOrderConfirm,
      "POST",
      { Authorization: "Bearer " + user.access },
      onOrderConfirmed
    );
  };

  const handleConfirmCancel = () => {
    setIsConfirmOrder(false);
    setIsConfirmOrderLoading(false);
    setIsDeliverySettingsShow(false);
    closeConfirmOrderPopup();
  };

  const disabledDates = (date) => {
    //prev logic to disable PH and sat, sun, mon -> removed due to us-926
    // const day = date.getDay();
    // if (day === 0 || day === 6 || day === 1) return false;
    // const datesToDisable = phList.map((item) => item?.date);
    // const formattedDate = getFormatDate(date)
    // return !datesToDisable.includes(formattedDate);

    //new logic to disable dates where non operating days are only disabled
    let days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    //return an array that contains the days of non operating days (nonOperatingDays)
    let nonOperatingDays = days.filter(
      (day) => !sellerDetail.operating_day.includes(day)
    );
    const dayOfWeek = (date.getDay() + 6) % 7;
    return !nonOperatingDays.includes(days[dayOfWeek]);
  };

  const handleAddressSelectDropdown = (id) => {
    // Find the address from the list where id_supplier matches the given id
    const selectedAddress = pickupAddressList.find(
      (address) => address.id_supplier === id
    );

    if (selectedAddress) {
      const newSelectedAddress = `${selectedAddress.pickup_address}, ${selectedAddress.pickup_postal_code}`;
      setCurrPickupAddress(newSelectedAddress);
      setSelectedPickupAddressId(id);
    }

    setShowAddressList(false);
  };

  return (
    <Modal
      width={(isConfirmOrder || isDeliverySettingsShow) && "w-5/12"}
      open={toggleConfirmOrder}
      children={
        !isDeliverySettingsShow && !isConfirmOrder && !isSingleOrder ? (
          <div>
            <p className="text-lg font-semibold mb-3">
              {type === "Confirm" ? "Order Confirmation" : "Reschedule Order"}
            </p>
            <hr />
            <p className="text-sm my-4 pr-7 mb-4">
              {type === "Confirm"
                ? isSingleOrder
                  ? "Are you sure to confirm this order ?"
                  : "By proceeding, you confirm that these orders can be accurately fulfilled (i.e. correct pickup address, items available etc.). Delivery will be matched and arranged accordingly. If you wish to review individual orders before confirming, please click on each order separately to check the details. Confirm Selected Orders For Delivery"
                : "Are you sure to reschedule the order ?"}
            </p>
            <div className="flex justify-end mt-10">
              <button
                className="cp text-center rounded-md bg-[#f5ab35] disabled:bg-[#FFD086] text-white h-8 w-28 mr-5 disabled:cursor-default"
                disabled={isMassConfirmingOrder}
                onClick={isSingleOrder ? onConfirmOrder : onMassConfirmOrder}
              >
                {isMassConfirmingOrder ? "Confirming.." : "Yes"}
              </button>
              <button
                className="cp text-center rounded-md border-[#f5ab35] disabled:border-[#FFD086] disabled:cursor-default
                            border-2 bg-white text-[#f5ab35] disabled:text-[#FFD086] h-8 w-28"
                disabled={isMassConfirmingOrder}
                onClick={closeConfirmOrderPopup}
              >
                No
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-svh">
            <div className="flex justify-between items-center">
              <p className="text-3xl font-medium mb-3">
                {type === "Confirm"
                  ? "Confirm Order Delivery"
                  : "Delivery Reschedule"}
              </p>
              <IoCloseOutline
                className="text-3xl cp"
                onClick={handleConfirmCancel}
                disabled={isConfirmOrderLoading}
              />
            </div>

            <hr />

            <>
              {isDeliverySettingsShow && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-end mt-2 mr-4">
                    {isDeliverySettingsShow && sellerDetail?.shipping_id !== 3 && (
                      <button onClick={toggleDeliverySettings}>
                        <p className="text-black text-sm font-medium">
                          + <span className="underline">Advance Edit</span>
                        </p>
                      </button>
                    )}
                  </div>
                  <div className="bg-[#F5F5F5] flex flex-col gap-3 mt-4 px-3 py-4 rounded-md">
                    <div className="flex gap-3">
                      <p className={labelClass}>Pickup Address :</p>
                      <p className={contentClass}>
                        {sellerDetail?.pickup_address}
                      </p>
                    </div>
                    <div className="flex gap-5 items-center">
                      <p className={labelClass}>Pickup Date & Time :</p>
                      {sellerDetail?.shipping_id === 5 ? (
                        <div
                          id="date-picker"
                          className="flex py-[6px] px-4 justify-between items-center w-full sm:w-[45%] !rounded-none bg-[#FFFFFF] border !border-[#E7E7E7]"
                          onClick={() => datePickerRef.current.setFocus()}
                        >
                          <DatePicker
                            ref={datePickerRef}
                            minDate={enabledDates[0]}
                            selected={pickupDate}
                            dateFormat="d/M/yyyy"
                            onChange={(date) => setPickupDate(date)}
                            placeholderText="Select Date"
                            className="w-[80%] sm:w-[60%]"
                            includeDates={enabledDates}
                          />
                          <TfiCalendar color="#828282" />
                        </div>
                      ) : (
                        <p className={contentClass}>
                          {sellerDetail?.pickup_date_formated}
                        </p>
                      )}
                      <p className={contentClass}>
                        {sellerDetail?.pickup_time}
                      </p>
                    </div>
                  </div>

                  <p className={labelClass}>To:</p>

                  <div className="bg-[#F5F5F5] flex flex-col gap-3 mt-4 px-3 py-4 rounded-md">
                    <div className="flex gap-3">
                      <p className={labelClass}>Receiver Address :</p>
                      <p className={contentClass}>
                        {userDetail?.address_details}
                      </p>
                    </div>
                    <div className="flex gap-5">
                      <p className={labelClass}>Receiver Name :</p>
                      <p className={contentClass}>{userDetail?.full_name}</p>
                    </div>
                    <div className="flex gap-5">
                      <p className={labelClass}>Receiver Number :</p>
                      <p className={contentClass}>
                        {userDetail?.contact_number}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between pr-10 gap-10">
                    <div className="flex flex-col flex-1 gap-3 my-4 mb-2">
                      <p className={labelClass}>Delivery Type</p>

                      {type === "Reschedule" ? (
                        <p className="w-full px-2 py-3 text-sm bg-[#E7E7E7] border border-[#E7E7E7]">
                          {sellerDetail?.delivery_method}
                        </p>
                      ) : (
                        <p className={contentClass}>
                          {sellerDetail?.delivery_method}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-1">
                      {type === "Reschedule" &&
                      (sellerDetail?.shipping_id === 1 ||
                        sellerDetail?.shipping_id === 4) ? (
                        <div className="flex flex-col gap-3 my-4 mb-2">
                          <p className={labelClass}>Delivery Date</p>
                          <div
                            id="date-picker"
                            className="flex px-5 py-[10px] justify-between items-center w-full !rounded-none"
                          >
                            <DatePicker
                              minDate={minDate}
                              selected={deliveryDate}
                              dateFormat="d/M/yyyy"
                              onChange={(date) => setDeliveryDate(date)}
                              placeholderText="Select Date"
                              filterDate={disabledDates}
                              className="w-[40%] md:w-[80%]"
                            />
                            <TfiCalendar color="#828282" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3 my-4 mb-2">
                          <p className={labelClass}>Delivery Date & Time</p>
                          <div className="flex gap-3 p-2">
                            <p className={contentClass}>
                              {sellerDetail?.delivery_date_end
                                ? sellerDetail?.delivery_date_formated +
                                  " to " +
                                  sellerDetail?.delivery_date_end
                                    ?.split("-")
                                    ?.reverse()
                                    ?.join("-")
                                : sellerDetail?.delivery_date_formated}
                            </p>
                            <p className={contentClass}>
                              {sellerDetail?.delivery_time}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {sellerDetail?.shipping_id !== 3 && (
                    <div className="flex justify-end">
                      <div>
                        <p className={`${labelClass} mt-4 mb-3`}>
                          Select Delivery Time
                        </p>
                        <div className="flex gap-3 flex-wrap mb-8">
                          {deliveryTimeSlots.map((time, index) => {
                            var selectedClass = "bg-[#f5ab35] text-white";
                            var otherClass =
                              "bg-white text-[#4F4F4F] border border-[#bdbdbd]";
                            var cssClass =
                              selectedTimeSlot === index
                                ? selectedClass
                                : otherClass;
                            return (
                              <div
                                key={index}
                                className={`text-center cp px-2 py-[5px] rounded text-[12px] ${cssClass}`}
                                onClick={() => setSelectedTimeSlot(index)}
                              >
                                {time.delivery_slot}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {type === "Reschedule" && (
                    <div className="">
                      <hr />

                      <div className="flex justify-between mt-4 w-full items-center">
                        <p className="text-left w-[45%] text-[#828282] text-base">
                          Re-delivery Fee:{" "}
                        </p>
                        <p className="text-left w-[45%] text-lg text-[#F2994A] font-semibold">
                          {"$ "} {redeliveryFees}
                        </p>
                      </div>

                      <div className="w-[50%] text-[#828282] text-sm my-2 flex flex-col gap-2">
                        <div>
                          <p>Note:</p>
                          <p className="">
                            Re-delivery fees will be debited from seller's
                            proceeds.
                          </p>
                        </div>

                        <p>
                          Sellers could communicate and arrange directly with
                          your buyers on who shall bear this portion.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isConfirmOrder && (
                <>
                  <div
                    className="flex justify-end mt-2 mr-4 cp"
                    onClick={toggleDeliverySettings}
                  >
                    <p className="flex gap-1 items-center">
                      <IoIosArrowRoundBack className="text-2xl" />{" "}
                      <span className="text-sm text-[#282828]">
                        Back to Order Delivery Details
                      </span>
                    </p>
                  </div>
                  <div className="bg-[#F5F5F5] flex flex-col gap-1 mt-4 px-3 py-4 rounded-md">
                    <div className="flex flex-col gap-1 mt-1 mb-2">
                      <p className={labelClass}>Pickup Address :</p>

                      <div className="relative cp">
                        <div
                          className="flex flex-row justify-between bg-[#FFFFFF] border border-[#E7E7E7] p-2"
                          onClick={() => {
                            setShowAddressList((prev) => !prev);
                          }}
                        >
                          <p className={contentClass}>{currPickupAddress}</p>
                          <FaCaretDown />
                        </div>

                        {showAddressList && (
                          <div className="absolute bg-[#FFFFFF] shadow-md rounded-md px-3 py-3 z-[51] overflow-y-auto top-9 w-full">
                            {pickupAddressList?.map((address, idx) => (
                              <div
                                key={`${address?.id_supplier}-${idx}`}
                                className="cp"
                                onClick={() => {
                                  handleAddressSelectDropdown(
                                    address.id_supplier
                                  );
                                }}
                              >
                                <div className="flex justify-between items-center py-2">
                                  <p
                                    className={`text-sm p-1 ${
                                      idx === selectedPickupAddressId
                                        ? "text-[#F5AB35]"
                                        : "text-black"
                                    } hover:text-[#F5AB35]`}
                                  >
                                    {address?.pickup_address}
                                    {", "}
                                    {address?.pickup_postal_code}
                                  </p>

                                  {idx === selectedPickupAddressId && (
                                    <img
                                      src={tickIcon}
                                      alt="tick-icon"
                                      className="w-7 p-1"
                                    />
                                  )}
                                </div>
                                <hr />
                              </div>
                            ))}

                            <div
                              className="text-[#282828] text-sm text-right p-1 mt-4 font-bold rounded-sm"
                              onClick={() => {
                                setShowAddressList((prev) => !prev);
                                window.open(
                                  MerchantRoutes.ShippingSettings,
                                  "_blank"
                                );
                              }}
                            >
                              + Add
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row gap-2 mt-2 items-center">
                      <p className={labelClass}>Pickup Date & Time :</p>
                      {sellerDetail?.shipping_id === 5 ? (
                        <div
                          id="date-picker"
                          className="flex py-[6px] px-4 justify-between items-center w-full sm:w-[45%] !rounded-none bg-[#FFFFFF] border !border-[#E7E7E7]"
                          onClick={() => datePickerRef.current.setFocus()}
                        >
                          <DatePicker
                            ref={datePickerRef}
                            minDate={enabledDates[0]}
                            selected={pickupDate}
                            dateFormat="d/M/yyyy"
                            onChange={(date) => setPickupDate(date)}
                            placeholderText="Select Date"
                            className="w-[80%] sm:w-[60%]"
                            includeDates={enabledDates}
                          />
                          <TfiCalendar color="#828282" />
                        </div>
                      ) : (
                        <p className={contentClass}>
                          {sellerDetail?.pickup_date_formated}
                        </p>
                      )}

                      <p className={contentClass}>
                        {sellerDetail?.pickup_time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-8 pt-3">
                    <div className="w-[45%]">
                      <label className="font-medium text-sm text-[#828282] align-left">
                        Receiver Name <span className="text-red-600">*</span>
                      </label>
                      <div className="form-group my-1">
                        <input
                          type="text"
                          id="pickup_contact_name_edit"
                          maxlength="100"
                          className="form-control !text-black border border-[#E7E7E7] w-full p-2"
                          value={receiverName}
                          onChange={(e) => {
                            setReceiverName(e.target.value);
                          }}
                        />
                        <p
                          className="text-red-600 form-error hidden"
                          id="contactNameErrorMsg"
                        >
                          {" "}
                          Please Enter a Contact Name{" "}
                        </p>
                      </div>
                    </div>

                    <div className="w-[45%]">
                      <label className="font-medium text-sm text-[#828282] align-left">
                        Receiver Phone Number{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="form-group my-1">
                        <input
                          type="text"
                          id="pickup_contact_number_edit"
                          className="form-control !text-black border border-[#E7E7E7] w-full p-2"
                          maxlenth="20"
                          required
                          value={receiverContact}
                          onChange={(e) => {
                            setReceiverContact(e.target.value);
                          }}
                        />
                        <p
                          className="text-red-600 form-error hidden align-left"
                          id="contactNumberErrorMsg_edit"
                        >
                          {" "}
                          Please enter a valid Phone Number{" "}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5">
                    <label
                      className="font-medium text-sm text-[#828282] align-left"
                      for="pickup_postal_edit"
                    >
                      Receiver Address <span className="text-red-600">*</span>
                    </label>
                    <div className="form-group my-3">
                      <input
                        type="text"
                        id="pickup_postal_edit"
                        className="form-control !text-black border border-[#E7E7E7] w-full p-2"
                        maxlenth="200"
                        required
                        value={ReceiverAddress}
                        onChange={(e) => {
                          setReceiverAddress(e.target.value);
                        }}
                      />
                      <p
                        className="text-red-600 form-error hidden align-left"
                        id="postalCodeErrorMsg_edit"
                      >
                        {" "}
                        Please enter a valid address
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-8 pt-3">
                    <div className="w-[45%]">
                      <label className="font-medium text-sm text-[#828282] align-left">
                        Receiver Unit Number
                      </label>
                      <div className="form-group my-1">
                        <input
                          type="text"
                          id="pickup_contact_name_edit"
                          maxlength="100"
                          className="form-control !text-black border border-[#E7E7E7] w-full p-2"
                          value={
                            ReceiverUnitNo === "null" ? "" : ReceiverUnitNo
                          }
                          onChange={(e) => {
                            setReceiverUnitNo(e.target.value);
                          }}
                        />
                      </div>
                    </div>

                    <div className="w-[45%]">
                      <label className="font-medium text-sm text-[#828282] align-left">
                        Receiver Unit Postal Code{" "}
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="form-group my-1">
                        <input
                          type="number"
                          id="pickup_contact_number_edit"
                          className="form-control !text-black border border-[#E7E7E7] w-full p-2"
                          maxlenth="20"
                          required
                          value={ReceiverPostalCode}
                          onChange={(e) => {
                            setReceiverPostalCode(e.target.value);
                          }}
                        />
                        <p
                          className="text-red-600 form-error hidden align-left"
                          id="contactNumberErrorMsg_edit"
                        >
                          {" "}
                          Please enter a valid postal Number{" "}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-8 pt-3">
                    <div className="w-[45%]">
                      <label className="font-medium text-sm text-[#828282] align-left">
                        Delivery Type
                      </label>
                      <p className="w-full p-2 text-sm bg-[#E7E7E7] border border-[#E7E7E7]">
                        {sellerDetail?.delivery_method}
                      </p>
                    </div>

                    <div className="w-[45%]">
                      <label className="font-medium text-sm text-[#828282] align-left">
                        Delivery Date
                      </label>

                      {sellerDetail?.shipping_id === 1 ||
                      sellerDetail?.shipping_id === 4 ? (
                        <div
                          id="date-picker"
                          className="flex p-2 justify-between items-center w-full !rounded-none"
                        >
                          <DatePicker
                            minDate={minDate}
                            selected={deliveryDate}
                            dateFormat="d/M/yyyy"
                            onChange={(date) => setDeliveryDate(date)}
                            placeholderText="Select Date"
                            filterDate={disabledDates}
                            className="w-[40%] md:w-[80%]"
                          />
                          <TfiCalendar color="#828282" />
                        </div>
                      ) : (
                        <>
                          <p
                            className={`${contentClass} bg-[#E7E7E7] border border-[#E7E7E7] p-2`}
                          >
                            {sellerDetail?.delivery_date_end
                              ? sellerDetail?.delivery_date_formated +
                                " to " +
                                sellerDetail?.delivery_date_end
                                  ?.split("-")
                                  ?.reverse()
                                  ?.join("-")
                              : sellerDetail?.delivery_date_formated}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* {sellerDetail?.shipping_id === 5 ? (
                    <>
                      <p className={`${labelClass} my-4 mb-2`}>
                        Select Pickup Date
                      </p>
                      <div
                        id="date-picker"
                        className="flex justify-between px-2 items-center py-2 w-max"
                      >
                        <DatePicker
                          minDate={enabledDates[0]}
                          selected={pickupDate}
                          dateFormat="d/M/yyyy"
                          onChange={(date) => setPickupDate(date)}
                          width="100%"
                          placeholderText="Select Date"
                          includeDates={enabledDates}
                        />
                        <MdCalendarViewMonth color="#828282" />
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-3 my-4 mb-2">
                      <p className={labelClass}>Pickup Date :</p>
                      <p className={contentClass}>
                        {sellerDetail?.pickup_date_formated}
                      </p>
                    </div>
                  )} */}
                  {/* <div className="flex gap-3 my-4 mb-2">
                    <p className={labelClass}>Pickup Time :</p>
                    <p className={contentClass}>{sellerDetail?.pickup_time}</p>
                  </div> */}
                  {/* <div className="flex flex-row gap-3 my-6">
                    <p className={labelClass}>Delivery Type :</p>
                    <p className={contentClass}>
                      {sellerDetail?.delivery_method}
                    </p>
                  </div> */}

                  {/* {sellerDetail?.shipping_id !== 5 ? (
                    <>
                      <p className={`${labelClass} my-4 mb-2`}>
                        Select Delivery Date
                      </p>
                      <div
                        id="date-picker"
                        className="flex justify-between px-2 items-center py-2 w-max"
                      >
                        <DatePicker
                          minDate={minDate}
                          selected={deliveryDate}
                          dateFormat="d/M/yyyy"
                          onChange={(date) => setDeliveryDate(date)}
                          width="100%"
                          placeholderText="Select Date"
                          filterDate={disabledDates}
                        />
                        <MdCalendarViewMonth color="#828282" />
                      </div>
                    </>
                  ) : (
                    <div className="flex gap-3 my-4 mb-2">
                      <p className={labelClass}>Delivery Date :</p>
                      <p className={contentClass}>
                        {sellerDetail?.delivery_date_end
                          ? sellerDetail?.delivery_date_formated +
                            " to " +
                            sellerDetail?.delivery_date_end
                              ?.split("-")
                              ?.reverse()
                              ?.join("-")
                          : sellerDetail?.delivery_date_formated}
                      </p>
                    </div>
                  )} */}

                  {sellerDetail?.shipping_id !== 3 && (
                    <div className="flex justify-end">
                      <div>
                        <p className={`${labelClass} mt-4 mb-3`}>
                          Select Delivery Time
                        </p>
                        <div className="flex gap-3 flex-wrap mb-12">
                          {deliveryTimeSlots.map((time, index) => {
                            var selectedClass = "bg-[#f5ab35] text-white";
                            var otherClass =
                              "bg-white text-[#4F4F4F] border border-[#bdbdbd]";
                            var cssClass =
                              selectedTimeSlot === index
                                ? selectedClass
                                : otherClass;
                            return (
                              <div
                                key={index}
                                className={`text-center cp px-2 py-[5px] rounded text-[12px] ${cssClass}`}
                                onClick={() => setSelectedTimeSlot(index)}
                              >
                                {time.delivery_slot}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-between mt-4">
                <button
                  className={`cp text-center rounded-md bg-[#f5ab35] text-white py-[6px]
                                ${
                                  isConfirmOrder
                                    ? "px-7"
                                    : type === "Confirm"
                                    ? "px-5"
                                    : "w-28"
                                } ml-auto mr-5 hover:bg-amber-500
                                disabled:opacity-50  disabled:cursor-default`}
                  onClick={
                    isConfirmOrder
                      ? handleEditUpdateConfirmation
                      : updateConfirmation
                  }
                  disabled={isConfirmOrderLoading}
                >
                  {type === "Confirm" ? "Confirm" : "Reschedule"}
                </button>
              </div>
            </>
          </div>
        )
      }
    />
  );
}

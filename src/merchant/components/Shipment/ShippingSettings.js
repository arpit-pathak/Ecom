import React from "react";
import ls from "local-storage";
import { Constants } from "../../utils/Constants.js";
import { MerchantRoutes } from "../../../Routes.js";
import { loginRequired } from "../../utils/Helper.js";
import { ApiCalls, Apis } from "../../utils/ApiCalls.js";
import { Timepicker } from "tw-elements";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";

// ui components
import Navbar from "../Navbar.js";
import { Sidebar } from "../Parts.js";
import Loader from "../../../utils/loader";
import { BsFillPencilFill } from "react-icons/bs";
// css
import "../../../css/navbar.css";
import "../../../css/merchant.css";

//accordion
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import { styled } from "@mui/material/styles";

// icons
import { IoLocationOutline } from "react-icons/io5";
import { BsCalendar4Week } from "react-icons/bs";
import LogoUParcel from "../../../assets/uParcel_Logo.svg";
import JTLogo from "../../../assets/seller/jtLogo.png";
import ShipmentToProdImg from "../../../assets/seller/shipment_to_prod.png";
import DeliveryOptionsInfoImg from "../../../assets/seller/deliver_options_info.png";

import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
  MdExpandMore,
  MdDeleteForever,
  MdOutlineClose,
  MdCalendarViewMonth,
} from "react-icons/md";
import { rgbToHex } from "@mui/system";

const MAX_DIGITS = 3;

// Custom Accordion created using MUI material
const Accordion = styled((props) => (
  <MuiAccordion
    disableGutters
    elevation={0}
    sx={{ "&:before": { display: "none" } }}
    square
    {...props}
  />
))(({ theme }) => ({}));

const AccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  border: "none",
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  border: "none",
}));

class ShippingSettings extends React.Component {
  constructor(props) {
    super(props);
    loginRequired(props.page);
    document.title = "Merchant | uShop";

    this.user = ls(Constants.localStorage.user);
    if (this.user) this.user = JSON.parse(this.user);

    this.ship_settings = ls("merchant-ship-settings");
    if (this.ship_settings === null)
      this.ship_settings = {
        // delivery options
        del_same_day: [],
        del_next_day: [],
        selected_options: [],
      };

    this.deliveryInfoChartRef = React.createRef(null);

    // list vars
    var page = ls("page");
    var entries = ls("entries");

    this.state = {
      page: page ? page : 1,
      entries: entries ? entries : 10,
      pages: 1,
      total: 0,

      updateSection_InstantDelivery: false,
      updateSection_NextDayDelivery: false,
      updateSection_SameDayDelivery: false,
      // updateSection_TimeslotBackground: false,

      selectedOperatingDays: [],
      selectedTimeslots: [],
      selected_nd_timeslots: [],
      selected_nd1_timeslots: [],

      perPage: 10,
      notification: null,

      expandPickUp: false,

      shipping_option_selection: "",
      shipping_option_pickup_slot: "",
      shipping_option_delivery_slot: "",

      timeSlots: [],
      timeSlotsNextDay: [], //all day receiving
      timeSlotND1: [], //enabled time slots
      deliveryFees: [],
      deliveryFeesNextDay: [],
      deliveryFeesInstant: [],
      deliveryFeesND1: [],
      isEnableSameDay: [],
      isEnableNextDay: [],
      instantDeliveryCutoff: "",
      instantDeliveryStart: "",
      instantHintMobile: false,
      sameDaySellerPay: [],
      nextDaySellerPay: [],
      nd1SellerPay: [],
      instSellerPay: [],

      ownerName: "",
      postalCode: "",
      astate: "",
      city: "",
      address: "",
      isPickup: "",
      ppostalCode: "",
      pastate: "",
      pcity: "",
      paddress: "",
      contactNumber: "",
      shop_url: "",
      full_address: "",
      full_pickup_address: "",
      accountType: "",
      individualName: "",
      individualNumber: "",
      businessName: "",
      businessUEN: "",
      addAddressModal: false,
      editAddressModal: false,
      addressOnly: "",
      unitNo: "",

      editPUD_hasUN: true,
      pickupUnitNumToggle: "",
      backend_error_msg: "",

      //free shipping data
      freeAboveValue: "",
      freeDeliveryStartDate: null,
      freeDeliveryLastDate: null,

      //min cart size data
      minCartValue: "",
      minCartToggle: "off",

      isExpanded: [false, false, false, false, false],

      shippingOptionIds: {},
      isJtAvailable: false,
    };
  }

  componentDidMount() {
    // for 12h-timepicker (start)
    const pickerInc_start = document.querySelector("#timepicker-12h-start");
    const timepickerMaxMin_start = new Timepicker(pickerInc_start, {
      format12: true,
      pointerEvents: "none",
      increment: true,
      defaultTime: "8:00 AM",
      minTime: "8:00 AM",
      maxTime: "9:00 PM",
      switchHourstoMinutesOnClick: true,
      iconSVG:
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#F5AB35"> <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg>',
      invalidLabel:
        "Invalid starting timing selected. Ensure that time interval of 15 minutes is adhered to.",
      closeModalOnMinutesClick: false, // disable to allow user to select AM/PM
    });
    if (timepickerMaxMin_start) ls("valid", "y");

    // for 12h-timepicker (cutoff)
    const pickerInc_cutoff = document.querySelector("#timepicker-12h-cutoff");
    const timepickerMaxMin_cutoff = new Timepicker(pickerInc_cutoff, {
      format12: true,
      pointerEvents: "none",
      increment: true,
      defaultTime: "8:00 AM",
      minTime: "8:00 AM",
      maxTime: "9:00 PM",
      switchHourstoMinutesOnClick: true,
      iconSVG:
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#F5AB35"> <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /> </svg>',
      invalidLabel:
        "Invalid cutoff timing selected. Ensure that time interval of 15 minutes is adhered to.",
      closeModalOnMinutesClick: false, // disable to allow user to select AM/PM
    });
    if (timepickerMaxMin_cutoff) ls("valid", "y");

    const disabledPicker_start = document.querySelector(
      "#timepicker-start-disabled"
    );
    const disabledPickerMaxMin_start = new Timepicker(disabledPicker_start, {
      format12: true,
      pointerEvents: "none",
    });
    const disabledPicker_cutoff = document.querySelector(
      "#timepicker-cutoff-disabled"
    );
    const disabledPickerMaxMin_cutoff = new Timepicker(disabledPicker_cutoff, {
      format12: true,
      pointerEvents: "none",
    });
    if (disabledPickerMaxMin_start) ls("valid", "y");
    if (disabledPickerMaxMin_cutoff) ls("valid", "y");

    // reset properties of timepicker on page load
    this.switchInstantDeliveryToggle();

    this.loadPickupDetails();

    this.loadSettings();

    var newAdd_checkbox = document.getElementById("newAddressDefault_checkbox");
    if (newAdd_checkbox) {
      if (ls("length_pickup") === 0) {
        newAdd_checkbox.checked = true;
        newAdd_checkbox.className = "col-span-1 py-8 pointer-disable";
      } else {
        newAdd_checkbox.className = "col-span-1 py-8";
      }
    }
  }

  loadPickupDetails = async (e) => {
    let fd = new FormData();

    this.setState({
      pickup_loading: true,
    });

    // calling GET Method of Seller Pickup List API
    await ApiCalls(
      fd,
      Apis.sellerPickup,
      "GET",
      { Authorization: "Bearer " + this.user.access },
      this.processResp,
      e ? e.target : null
    );

    // calling GET Method of Onboarding API for Individual/Business name
    await ApiCalls(
      fd,
      Apis.onboarding,
      "GET",
      { Authorization: "Bearer " + this.user.access },
      this.processResp,
      e ? e.target : null
    );
  };

  loadSettings = async (e) => {
    let fd = new FormData();

    // user must be a merchant
    fd.append("is_seller", "yes");

    // calling Shipment Settings API
    await ApiCalls(
      fd,
      Apis.shippingSettings,
      "POST",
      { Authorization: "Bearer " + this.user.access },
      this.processResponse,
      e ? e.target : null
    );
  };

  processResp = (res, api) => {
    var rdata = res.data;

    if (api === Apis.onboarding) {
      if (rdata.data.merchant_detail[0]["account_type"] === 0) {
        this.setState({
          pickup_full_name: rdata.data.merchant_detail[0]["individual_name"],
        });
      }

      if (rdata.data.merchant_detail[0]["account_type"] === 1) {
        this.setState({
          pickup_full_name: rdata.data.merchant_detail[0]["business_name"],
        });
      }
    }

    if (api.includes(Apis.sellerPickup)) {
      // if POST request is successful, then remove local storage for backend_error
      if (rdata.message.includes("successfully updated.")) {
        sessionStorage.removeItem("backend_error");
      }

      if (rdata.result === "SUCCESS") {
        var r = 0;

        if (
          rdata.message.includes("successfully retrieved.") ||
          rdata.message.includes("successfully added.")
        ) {
          sessionStorage.setItem("length_pickup", rdata.data.length);
          if (rdata.data.length >= 1) {
            for (r = 0; r < rdata.data.length; r++) {
              ls(`pickup_${r + 1}`, rdata.data[r]);
            }
          }

          this.setState({
            pickupLength: rdata.data.length,
            allPickupDetails: rdata.data,
            pickup_loading: false,
          });
        } else {
          if (rdata.data.length >= 1) {
            for (r = 0; r < rdata.data.length; r++) {
              ls(`pickup_${r + 1}`, rdata.data[r]);
            }
          }

          this.setState({
            allPickupDetails: rdata.data,
            pickup_loading: false,
          });
        }

        // Pre-processing to determine whether is_default record has unit number enabled or disabled
        setTimeout(() => {
          if (this.state.allPickupDetails) {
            this.state.allPickupDetails.forEach((obj) => {
              obj.is_default
                ? obj.unit_number
                  ? this.setState({
                      pickupUnitNumToggle: "on",
                    })
                  : this.setState({
                      pickupUnitNumToggle: "off",
                    })
                : ls("valid", "y");
            });
          }

          var nextDayIsEnabled = this.state.isEnableNextDay;
          var nextDayDelSwitch = document.getElementById(
            "nextDayDeliverySwitch"
          );
          if (
            nextDayDelSwitch &&
            nextDayDelSwitch.value === "on" &&
            nextDayIsEnabled === "y"
          ) {
            var display_nextday = document.getElementById(
              "nextday-delivery-display"
            );
            var disabled_nextday = document.getElementById(
              "nextday-delivery-disabled"
            );

            // ensure delivery fees table is shown
            if (display_nextday) display_nextday.style.display = "block";
            if (disabled_nextday) disabled_nextday.style.display = "none";
          }
        }, 300);
      } else {
        if (document.getElementById("backend_error_msg_display")) {
          this.setState({
            backend_error_msg: rdata.message,
          });
        }

        rdata.errors.forEach((value) => {
          sessionStorage.setItem("backend_error", value);
        });
      }
    }
  };

  processSaveResponse = (res, api) => {
    var rdata = res.data;
    if (
      rdata.result === "SUCCESS" &&
      rdata.errors &&
      rdata.errors.length === 0
    ) {
      toast.success(rdata.message);

      if (ls("merchant_setup") === "N") {
        ApiCalls(
          {},
          Apis.getProfileStatus,
          "GET",
          { Authorization: "Bearer " + this.user.access },
          (profileRes, api1) => {
            ls("merchant_setup", profileRes.data.data.profile_status ?? "N");
          }
        );
      }
    } else {
      rdata.errors.forEach((value) => {
        sessionStorage.setItem("backend_error", value);
      });

      toast.error(rdata.message);
    }
  };

  processResponse = (res, api) => {
    var rdata = res.data;

    let ids = {};
    rdata.data.shipping_available.forEach((item) => {
      if (item.id_shipping_option === 1)
        ids["SameDay"] = item.id_shipping_option;
      else if (item.id_shipping_option === 2 || item.id_shipping_option === 5)
        ids["3Days"] = item.id_shipping_option;
      else if (item.id_shipping_option === 3)
        ids["Instant"] = item.id_shipping_option;
      else if (item.id_shipping_option === 4)
        ids["NextDay1"] = item.id_shipping_option;
    });

    let sameDayIndex = rdata.data.shipping_available.findIndex(
      (item) => item?.id_shipping_option === 1
    );
    let nextDay1Index = rdata.data.shipping_available.findIndex(
      (item) => item?.id_shipping_option === 4
    );
    let nextDayIndex = rdata.data.shipping_available.findIndex(
      (item) => item?.id_shipping_option === 5 || item?.id_shipping_option === 2
    );
    let instantIndex = rdata.data.shipping_available.findIndex(
      (item) => item?.id_shipping_option === 3
    );

    var shipping_delivery_fee =
      rdata.data.shipping_available[sameDayIndex].delivery_fee;
    var nextDay1_delivery_fee =
      rdata.data.shipping_available[nextDay1Index].delivery_fee;

    var shipping_options_toSelect =
      rdata.data.shipping_available[sameDayIndex].time_slot;
    var shipping_options_ND1 =
      rdata.data.shipping_available[nextDay1Index].time_slot;
    var sameDay_isEnableVal =
      rdata.data.shipping_available[sameDayIndex].is_enable;
    var nd1_isEnableVal =
      rdata.data.shipping_available[nextDay1Index].is_enable;

    var shipping_option_pickup =
      shipping_options_toSelect[sameDayIndex].pickup_slot;
    var shipping_option_delivery =
      shipping_options_toSelect[sameDayIndex].delivery_slot;

    var i_del_msg = rdata.data.instant_delivery_message;

    if (rdata.result === "FAIL") {
      this.setState(
        {
          updateSection_InstantDelivery: false,
          updateSection_NextDayDelivery: false,
          updateSection_SameDayDelivery: false,
          // updateSection_TimeslotBackground: false,
        },
        () => {
          ls("merchant-shipping-settings", this.ship_settings);
        }
      );
    }

    let sd_sp = shipping_delivery_fee.map((item) => {
      return parseFloat(item.seller_pay).toFixed(2).toString();
    });

    let nd1_sp = nextDay1_delivery_fee.map((item) => {
      return parseFloat(item.seller_pay).toFixed(2).toString();
    });

    this.setState({
      first_shipping_option: JSON.parse(
        JSON.stringify(rdata.data.shipping_available[sameDayIndex].name)
      ),
      second_shipping_option: "Scheduled Delivery",
      shipping_option_selection: JSON.stringify(shipping_options_toSelect),
      shipping_option_pickup_slot: JSON.parse(
        JSON.stringify(shipping_option_pickup)
      ),
      shipping_option_delivery_slot: JSON.parse(
        JSON.stringify(shipping_option_delivery)
      ),

      timeSlots: shipping_options_toSelect,
      timeSlotND1: shipping_options_ND1,

      deliveryFees: shipping_delivery_fee,
      deliveryFeesND1: nextDay1_delivery_fee,
      isEnableSameDay: sameDay_isEnableVal,
      isEnableND1: nd1_isEnableVal,
      instant_del_msg: i_del_msg,

      sameDaySellerPay: sd_sp,
      nd1SellerPay: nd1_sp,

      shippingOptionIds: ids,
      isJtAvailable: nextDayIndex !== -1 ? true : false,
    });

    let inst_sp = rdata.data.shipping_available[instantIndex].delivery_fee.map(
      (item) => {
        return parseFloat(item.seller_pay).toFixed(2).toString();
      }
    );

    if (rdata.data.shipping_available[instantIndex]) {
      this.setState({
        deliveryFeesInstant:
          rdata.data.shipping_available[instantIndex].delivery_fee,
        isEnableInstant: rdata.data.shipping_available[instantIndex].is_enable,
        third_shipping_option: JSON.parse(
          JSON.stringify(rdata.data.shipping_available[instantIndex].name)
        ),
        instSellerPay: inst_sp,
      });
      if (rdata.data.shipping_available[instantIndex].is_enable === "y") {
        this.instantDeliveryToggle = "on";
        this.switchInstantDeliveryToggle();
      }
      if (
        rdata.data.shipping_available[instantIndex].cutoff_time &&
        rdata.data.shipping_available[instantIndex].start_time
      ) {
        this.setState({
          instantDeliveryStart:
            rdata.data.shipping_available[instantIndex].start_time,
          instantDeliveryCutoff:
            rdata.data.shipping_available[instantIndex].cutoff_time,
        });
      }
    }

    if (nextDayIndex !== -1) {
      var nextDay_delivery_fee =
        rdata.data.shipping_available[nextDayIndex].delivery_fee;
      var shipping_options_nextDay =
        rdata.data.shipping_available[nextDayIndex].time_slot;
      var nextDay_isEnableVal =
        rdata.data.shipping_available[nextDayIndex].is_enable;
      let nd_sp = nextDay_delivery_fee.map((item) => {
        return parseFloat(item.seller_pay).toFixed(2).toString();
      });
      this.setState({
        deliveryFeesNextDay: nextDay_delivery_fee,
        nextDaySellerPay: nd_sp,
        timeSlotsNextDay: shipping_options_nextDay,
        isEnableNextDay: nextDay_isEnableVal,
      });
    }

    if (rdata.data.other_detail === null) {
      var defaultList = [];
      this.setState({
        selectedOperatingDays: defaultList,
      });
    }

    if (
      rdata.data.other_detail.operating_day &&
      rdata.data.other_detail.operating_day.length > 0
    ) {
      var retrievedOperatingDays = rdata.data.other_detail.operating_day;

      this.setState({
        selectedOperatingDays: retrievedOperatingDays,
      });
    }

    setTimeout(() => {
      let timeslot_selections = [];
      let nd_timeslot_selections = [];
      let nd1_timeslot_selections = [];
      let nd_delivery_isEnable = "";
      let inst_delivery_isEnable = "";
      let sd_delivery_isEnable = "";
      let nd1_delivery_isEnable = "";

      this.state.timeSlots.forEach((item, key) => {
        timeslot_selections.push(item.is_selected);
        this.state.timeSlots[key].is_selected === "y"
          ? (this.sameDayDeliveryToggle = "on")
          : this.state.timeSlots[key].is_selected === "y" && ls("valid", "y");
      });

      this.state.timeSlotND1.forEach((item, key) => {
        nd1_timeslot_selections.push(item.is_selected);
      });

      nd_delivery_isEnable = this.state.isEnableNextDay;
      inst_delivery_isEnable = this.state.isEnableInstant;
      sd_delivery_isEnable = this.state.isEnableSameDay;
      nd1_delivery_isEnable = this.state.isEnableND1;

      this.setState({
        selectedTimeslots: timeslot_selections,
        selected_nd1_timeslots: nd1_timeslot_selections,
      });

      if (this.state.address === this.state.paddress) {
        this.setState({
          isPickup: "Yes",
        });
      } else {
        this.setState({
          isPickup: "No",
        });
      }

      this.state.timeSlotsNextDay.forEach((item, key) => {
        nd_timeslot_selections.push(item.is_select);

        // If radio button for timeslot is selected by user, then auto display delivery fees on page render
        this.state.timeSlotsNextDay[key].is_selected === "y"
          ? (this.nextDayDeliveryToggle = "on")
          : this.state.timeSlotsNextDay[key].is_selected !== "y" &&
            ls("valid", "y");
      });

      // Regardless of timeslot selections for next day delivery, toggle OFF section based on is_enable value
      if (nd_delivery_isEnable === "n") this.nextDayDeliveryToggle = "off";
      else this.nextDayDeliveryToggle = "on";

      if (inst_delivery_isEnable === "n") {
        this.instantDeliveryToggle = "off";
        this.switchInstantDeliveryToggle();
      }

      if (nd1_delivery_isEnable === "n") this.nd1DeliveryToggle = "off";
      else this.nd1DeliveryToggle = "on";

      if (sd_delivery_isEnable === "n") {
        this.sameDayDeliveryToggle = "off";
      } else this.sameDayDeliveryToggle = "on";

      this.setState({
        selected_nd_timeslots: nd_timeslot_selections,
      });

      let minCartSettings = rdata.data?.other_detail;
      console.log(minCartSettings)

      this.setState({
        minCartToggle: minCartSettings?.minimum_cart_status ?? "off",
        minCartValue: minCartSettings?.minimum_cart_size ?? "",
      })

      let freeShippingSetting = rdata.data?.other_detail?.free_shipping_setting;

      this.freeDeliveryToggle = freeShippingSetting?.free_shipping_status;
      this.freeDeliveryPeriodToggle =
        freeShippingSetting?.free_shipping_duration;
      this.setState({
        freeDeliveryStartDate: freeShippingSetting?.free_shipping_start_date
          ? new Date(freeShippingSetting?.free_shipping_start_date)
          : null,
        freeDeliveryLastDate: freeShippingSetting?.free_shipping_end_date
          ? new Date(freeShippingSetting?.free_shipping_end_date)
          : null,
        freeAboveValue: freeShippingSetting?.free_shipping_cart_amt ?? "",
      });
    }, 150);
  };

  handleChange = (event, which) => {
    this.setState({
      backend_error_msg: "",
    });

    if (which === "sameDayDeliveryToggle") {
      this.sameDayDeliveryToggle = event.target.checked ? "on" : "off";
      if (event.target.checked) {
        this.handleChange(event, "deliveryTimeslot1Selected");
        this.handleChange(event, "deliveryTimeslot2Selected");
        this.handleChange(event, "deliveryTimeslot3Selected");
      }
      return;
    }

    if (which === "instantDeliveryToggle") {
      this.instantDeliveryToggle = event.target.checked ? "on" : "off";

      setTimeout(() => {
        this.setState({ updateSection_InstantDelivery: true });
      }, 100);

      this.switchInstantDeliveryToggle();
      return;
    }

    if (which === "nextDayDeliveryToggle") {
      this.nextDayDeliveryToggle = event.target.checked ? "on" : "off";
      return;
    }

    if (which === "nd1DeliveryToggle") {
      this.nd1DeliveryToggle = event.target.checked ? "on" : "off";
      return;
    }

    var before_operatingDays = this.state.selectedOperatingDays;
    var after_operatingDays = before_operatingDays;

    if (which === "monday_toggle") {
      if (after_operatingDays.includes("mon")) {
        after_operatingDays = this.remove_op_day("mon", after_operatingDays);
        this.setState({
          selectedOperatingDays: after_operatingDays,
        });
        this.switchOperatingDayBackground("operating_day_toggle_monday", false);
      } else {
        after_operatingDays.push("mon");
        this.setState({
          selectedOperatingDays: after_operatingDays,
        });
        this.switchOperatingDayBackground("operating_day_toggle_monday", true);
      }
      return;
    }

    if (which === "tuesday_toggle") {
      if (after_operatingDays.includes("tue")) {
        after_operatingDays = this.remove_op_day("tue", after_operatingDays);
        this.setState({
          selectedOperatingDays: after_operatingDays,
        });
        this.switchOperatingDayBackground(
          "operating_day_toggle_tuesday",
          false
        );
      } else {
        after_operatingDays.push("tue");
        this.setState({
          selectedOperatingDays: after_operatingDays,
        });
        this.switchOperatingDayBackground("operating_day_toggle_tuesday", true);
      }
      return;
    }

    if (which === "wednesday_toggle") {
      if (after_operatingDays.includes("wed")) {
        after_operatingDays = this.remove_op_day("wed", after_operatingDays);
        this.setState({
          selectedOperatingDays: after_operatingDays,
        });
        this.switchOperatingDayBackground(
          "operating_day_toggle_wednesday",
          false
        );
      } else {
        after_operatingDays.push("wed");
        this.setState({
          selectedOperatingDays: after_operatingDays,
        });
        this.switchOperatingDayBackground(
          "operating_day_toggle_wednesday",
          true
        );
      }
      return;
    }

    if (which === "thursday_toggle") {
      if (after_operatingDays.includes("thu")) {
        after_operatingDays = this.remove_op_day("thu", after_operatingDays);
        this.setState({
          selectedOperatingDays: after_operatingDays,
        });
        this.switchOperatingDayBackground(
          "operating_day_toggle_thursday",
          false
        );
      } else {
        after_operatingDays.push("thu");
        this.setState({
          selectedOperatingDays: after_operatingDays,
        });
        this.switchOperatingDayBackground(
          "operating_day_toggle_thursday",
          true
        );
      }
      return;
    }

    if (which === "friday_toggle") {
      if (after_operatingDays.includes("fri")) {
        after_operatingDays = this.remove_op_day("fri", after_operatingDays);
        this.setState({
          selectedOperatingDays: after_operatingDays,
        });
        this.switchOperatingDayBackground("operating_day_toggle_friday", false);
      } else {
        after_operatingDays.push("fri");
        this.setState({
          selectedOperatingDays: after_operatingDays,
        });
        this.switchOperatingDayBackground("operating_day_toggle_friday", true);
      }
      return;
    }

    if (which === "saturday_toggle") {
      if (after_operatingDays.includes("sat")) {
        after_operatingDays = this.remove_op_day("sat", after_operatingDays);
        this.setState({
          selectedOperatingDays: after_operatingDays,
        });
        this.switchOperatingDayBackground(
          "operating_day_toggle_saturday",
          false
        );
      } else {
        after_operatingDays.push("sat");
        this.setState({
          selectedOperatingDays: after_operatingDays,
        });
        this.switchOperatingDayBackground(
          "operating_day_toggle_saturday",
          true
        );
      }
      return;
    }

    if (which === "sunday_toggle") {
      if (after_operatingDays.includes("sun")) {
        after_operatingDays = this.remove_op_day("sun", after_operatingDays);
        this.setState({
          selectedOperatingDays: after_operatingDays,
        });
        this.switchOperatingDayBackground("operating_day_toggle_sunday", false);
      } else {
        after_operatingDays.push("sun");
        this.setState({
          selectedOperatingDays: after_operatingDays,
        });
        this.switchOperatingDayBackground("operating_day_toggle_sunday", true);
      }
      return;
    }

    var updatedSelectedTimeslots_sd = [];
    var updatedTimeslots_sd = [];

    if (which === "deliveryTimeslot1Selected") {
      updatedSelectedTimeslots_sd = this.state.selectedTimeslots;
      if (event.target.checked) {
        updatedSelectedTimeslots_sd[0] = "y";
      } else {
        updatedSelectedTimeslots_sd[0] = "n";
      }
      updatedTimeslots_sd = this.state.timeSlots;
      updatedTimeslots_sd[0].is_selected = updatedSelectedTimeslots_sd[0];

      setTimeout(() => {
        this.setState({
          timeSlots: updatedTimeslots_sd,
          selectedTimeslots: updatedSelectedTimeslots_sd,
        });
      }, 200);
      return;
    }

    if (which === "deliveryTimeslot2Selected") {
      updatedSelectedTimeslots_sd = this.state.selectedTimeslots;
      if (event.target.checked) {
        updatedSelectedTimeslots_sd[1] = "y";
      } else {
        updatedSelectedTimeslots_sd[1] = "n";
      }
      updatedTimeslots_sd = this.state.timeSlots;
      updatedTimeslots_sd[1].is_selected = updatedSelectedTimeslots_sd[1];

      setTimeout(() => {
        this.setState({
          timeSlots: updatedTimeslots_sd,
          selectedTimeslots: updatedSelectedTimeslots_sd,
        });
      }, 200);
      return;
    }

    if (which === "deliveryTimeslot3Selected") {
      updatedSelectedTimeslots_sd = this.state.selectedTimeslots;
      if (event.target.checked) {
        updatedSelectedTimeslots_sd[2] = "y";
      } else {
        updatedSelectedTimeslots_sd[2] = "n";
      }
      updatedTimeslots_sd = this.state.timeSlots;
      updatedTimeslots_sd[2].is_selected = updatedSelectedTimeslots_sd[2];

      setTimeout(() => {
        this.setState({
          timeSlots: updatedTimeslots_sd,
          selectedTimeslots: updatedSelectedTimeslots_sd,
        });
      }, 200);
      return;
    }

    var updatedSelectedTimeslots_nd1 = [];
    var updatedTimeslots_nd1 = [];

    if (which === "deliveryTimeslotNd1Selected") {
      updatedSelectedTimeslots_nd1 = this.state.selected_nd1_timeslots;
      if (event.target.checked) {
        updatedSelectedTimeslots_nd1[0] = "y";
      } else {
        updatedSelectedTimeslots_nd1[0] = "n";
      }
      updatedTimeslots_nd1 = this.state.timeSlotND1;
      updatedTimeslots_nd1[0].is_selected = updatedSelectedTimeslots_nd1[0];

      setTimeout(() => {
        this.setState({
          timeSlotND1: updatedTimeslots_nd1,
          selected_nd1_timeslots: updatedSelectedTimeslots_nd1,
        });
      }, 200);
      return;
    }

    if (which === "deliveryTimeslotNd2Selected") {
      updatedSelectedTimeslots_nd1 = this.state.selected_nd1_timeslots;
      if (event.target.checked) {
        updatedSelectedTimeslots_nd1[1] = "y";
      } else {
        updatedSelectedTimeslots_nd1[1] = "n";
      }
      updatedTimeslots_nd1 = this.state.timeSlotND1;
      updatedTimeslots_nd1[1].is_selected = updatedSelectedTimeslots_nd1[1];
      setTimeout(() => {
        this.setState({
          timeSlotND1: updatedTimeslots_nd1,
          selected_nd1_timeslots: updatedSelectedTimeslots_nd1,
        });
      }, 200);
      return;
    }

    if (which === "deliveryTimeslotNd3Selected") {
      updatedSelectedTimeslots_nd1 = this.state.selected_nd1_timeslots;
      if (event.target.checked) {
        updatedSelectedTimeslots_nd1[2] = "y";
      } else {
        updatedSelectedTimeslots_nd1[2] = "n";
      }
      updatedTimeslots_nd1 = this.state.timeSlotND1;
      updatedTimeslots_nd1[2].is_selected = updatedSelectedTimeslots_nd1[2];

      setTimeout(() => {
        this.setState({
          timeSlotND1: updatedTimeslots_nd1,
          selected_nd1_timeslots: updatedSelectedTimeslots_nd1,
        });
      }, 200);
      return;
    }

    var updatedTimeslots = [];
    var updatedSelectedTimeslots_nd = [];

    if (which === "nextDayTimeslot1Selected") {
      if (event.target.checked) {
        updatedSelectedTimeslots_nd[0] = "y";
        updatedSelectedTimeslots_nd[1] = "n";
      }
      updatedTimeslots = this.state.timeSlotsNextDay;
      updatedTimeslots[0].is_selected = "y";
      updatedTimeslots[1].is_selected = "n";

      this.setState({
        timeSlotsNextDay: updatedTimeslots,
        selected_nd_timeslots: updatedSelectedTimeslots_nd,
      });
      return;
    }

    if (which === "nextDayTimeslot2Selected") {
      if (event.target.checked) {
        updatedSelectedTimeslots_nd[0] = "n";
        updatedSelectedTimeslots_nd[1] = "y";
      }

      updatedTimeslots = this.state.timeSlotsNextDay;
      updatedTimeslots[0].is_selected = "n";
      updatedTimeslots[1].is_selected = "y";

      this.setState({
        timeSlotsNextDay: updatedTimeslots,
        selected_nd_timeslots: updatedSelectedTimeslots_nd,
      });
      return;
    }

    if (which === "pickupUnitNumToggle") {
      event.target.checked
        ? this.setState({
            pickupUnitNumToggle: "on",
          })
        : this.setState({
            pickupUnitNumToggle: "off",
          });

      return;
    }

    if (which === "freeDeliveryToggle") {
      this.freeDeliveryToggle = event.target.checked ? "on" : "off";
      if (!event.target.checked) {
        this.freeDeliveryPeriodToggle = "off";
        this.setState({
          freeDeliveryStartDate: null,
          freeDeliveryLastDate: null,
          freeAboveValue: "",
        });
      }
    }

    if (which === "minCartToggle") {
      this.setState({
        minCartToggle: event.target.checked ? "on" : "off",
      });
      if (!event.target.checked) {
        this.setState({
          minCartValue: "",
        });
      }
    }

    if (which === "freeDeliveryPeriodToggle") {
      if (event.target.checked && this.freeDeliveryToggle === "on") {
        this.freeDeliveryPeriodToggle = "on";
      } else {
        this.freeDeliveryPeriodToggle = "off";
        this.setState({
          freeDeliveryStartDate: null,
          freeDeliveryLastDate: null,
        });
      }
    }

    ls("merchant-shipping-settings", this.ship_settings);
  };

  scrollToDeliveryInfo = () => {
    this.deliveryInfoChartRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  processCutOffTime = (selectedTime) => {
    var user_selection = Date.parse("01/01/2023 " + selectedTime);

    // Reset error messages related to instant delivery timing, if any
    if (document.getElementById("error_time_instant_delivery"))
      document.getElementById("error_time_instant_delivery").style.visibility =
        "hidden";

    // Case 1: Accept user selected time
    if (user_selection % 900 === 0) {
      this.setState({
        instantDeliveryCutoff: selectedTime,
      });
    }

    // Case 2: Test if 5 minute addition will fulfill criteria
    else {
      var concat_val = "";
      if ((user_selection + 300) % 900 === 0) {
        let dateObj = new Date(user_selection + 300000);
        let hour_val = dateObj.getHours();
        let min_val = dateObj.getUTCMinutes();
        if (min_val === 0) min_val = "00";

        if (hour_val < 12) {
          concat_val = hour_val + ":" + min_val + " AM";
        } else {
          if (hour_val === 12) {
            concat_val = hour_val + ":" + min_val + " PM";
          } else {
            concat_val = hour_val - 12 + ":" + min_val + " PM";
          }
        }

        document.getElementById("timeInput_cutoff").value = concat_val;

        this.setState({
          instantDeliveryCutoff:
            document.getElementById("timeInput_cutoff").value,
        });
      }

      // Case 3: Test if 5 minute deduction from user selected time will fulfill criteria
      else {
        if ((user_selection - 300) % 900 === 0) {
          let dateObj = new Date(user_selection - 300000);
          let hour_val = dateObj.getHours();
          let min_val = dateObj.getUTCMinutes();
          if (min_val === 0) min_val = "00";

          if (hour_val < 12) {
            concat_val = hour_val + ":" + min_val + " AM";
          } else {
            if (hour_val === 12) {
              concat_val = hour_val + ":" + min_val + " PM";
            } else {
              concat_val = hour_val - 12 + ":" + min_val + " PM";
            }
          }

          document.getElementById("timeInput_cutoff").value = concat_val;

          this.setState({
            instantDeliveryCutoff:
              document.getElementById("timeInput_cutoff").value,
          });
        }
      }
    }
  };

  processStartTime = (selectedTime) => {
    var user_selection = Date.parse("01/01/2023 " + selectedTime);

    // Reset error messages related to instant delivery timing, if any
    if (document.getElementById("error_time_instant_delivery"))
      document.getElementById("error_time_instant_delivery").style.visibility =
        "hidden";

    // Case 1: Accept user selected time
    if (user_selection % 900 === 0) {
      this.setState({
        instantDeliveryStart: selectedTime,
      });
    }

    // Case 2: Test if 5 minute addition will fulfill criteria
    else {
      var concat_val = "";
      if ((user_selection + 300) % 900 === 0) {
        let dateObj = new Date(user_selection + 300000);
        let hour_val = dateObj.getHours();
        let min_val = dateObj.getUTCMinutes();
        if (min_val === 0) min_val = "00";

        if (hour_val < 12) {
          concat_val = hour_val + ":" + min_val + " AM";
        } else {
          if (hour_val === 12) {
            concat_val = hour_val + ":" + min_val + " PM";
          } else {
            concat_val = hour_val - 12 + ":" + min_val + " PM";
          }
        }

        document.getElementById("timeInput_start").value = concat_val;

        this.setState({
          instantDeliveryStart:
            document.getElementById("timeInput_start").value,
        });
      }

      // Case 3: Test if 5 minute deduction from user selected time will fulfill criteria
      else {
        if ((user_selection - 300) % 900 === 0) {
          let dateObj = new Date(user_selection - 300000);
          let hour_val = dateObj.getHours();
          let min_val = dateObj.getUTCMinutes();
          if (min_val === 0) min_val = "00";

          if (hour_val < 12) {
            concat_val = hour_val + ":" + min_val + " AM";
          } else {
            if (hour_val === 12) {
              concat_val = hour_val + ":" + min_val + " PM";
            } else {
              concat_val = hour_val - 12 + ":" + min_val + " PM";
            }
          }

          document.getElementById("timeInput_start").value = concat_val;

          this.setState({
            instantDeliveryStart:
              document.getElementById("timeInput_start").value,
          });
        }
      }
    }
  };

  remove_op_day = (operating_day, operating_array) => {
    operating_array = operating_array.filter((i) => i !== operating_day);
    return operating_array;
  };

  render_buyerpayval = (
    buyerfee_display,
    item_index,
    uparcelfee_val,
    sellerfee_display,
    errorMsgDisplay,
    defTextColor,
    sp
  ) => {
    var display_buyer_fee = document.getElementsByClassName(buyerfee_display);

    // to display error message and prompt user to fix the error before saving settings
    var sellerFeeErrorMsg = document.getElementById(errorMsgDisplay);
    var computeBuyerFee = parseFloat(uparcelfee_val - sp).toFixed(2);

    display_buyer_fee[item_index].innerHTML = "$" + computeBuyerFee.toString();

    if (computeBuyerFee < 0) {
      display_buyer_fee[item_index].style.backgroundColor = "pink";
      display_buyer_fee[item_index].style.color = "black";
      sellerFeeErrorMsg.style.visibility = "visible";
      sellerFeeErrorMsg.style.display = "block";
    } else {
      display_buyer_fee[item_index].style.backgroundColor = "transparent";
      display_buyer_fee[item_index].style.color = defTextColor;
      sellerFeeErrorMsg.style.visibility = "hidden";
    }
    return;
  };

  savePickupInfo = (e, source) => {
    let fd = new FormData();
    // user must be a merchant
    fd.append("is_seller", "yes");
    fd.append("shop_url", this.state.shop_url);

    var validPickupDetails = true;

    var input_fullName = "";
    var input_phoneNumber = "";
    var input_postalCode = "";
    var input_address = "";
    var input_unitNo = "";

    // Step 1: Validate inputs provided (replace empty input with placeholder values retrieved from state)
    if (source === "edit") {
      input_fullName = document.getElementById("pickup_contact_name_edit");
      input_phoneNumber = document.getElementById("pickup_contact_number_edit");
      input_postalCode = document.getElementById("pickup_postal_edit");
      input_address = document.getElementById("pickup_detailed_address_edit");
      input_unitNo = document.getElementById("pickup_unit_no_edit");
      if (input_unitNo.value === "") {
        input_unitNo.value = input_unitNo.placeholder;
      } else {
        if (input_unitNo.value.trim() === "") {
          input_unitNo.value = "";
        }
      }
      if (input_fullName.value === "") {
        input_fullName.value = input_fullName.placeholder;
      }
      if (input_phoneNumber.value === "") {
        input_phoneNumber.value = input_phoneNumber.placeholder;
      }

      if (input_phoneNumber.value.length < 8) {
        document.getElementById("contactNumberErrorMsg_edit").style.visibility =
          "visible";
        document.getElementById("contactNumberErrorMsg_edit").style.display =
          "block";
        validPickupDetails = false;
      } else {
        document.getElementById("contactNumberErrorMsg_edit").style.visibility =
          "hidden";
        document.getElementById("contactNumberErrorMsg_edit").style.display =
          "none";
        validPickupDetails = true;
      }

      if (input_postalCode.value === "") {
        input_postalCode.value = input_postalCode.placeholder;
      }

      if (input_postalCode.value.length < 6) {
        document.getElementById("postalCodeErrorMsg_edit").style.visibility =
          "visible";
        document.getElementById("postalCodeErrorMsg_edit").style.display =
          "block";
        validPickupDetails = false;
      } else {
        document.getElementById("postalCodeErrorMsg_edit").style.visibility =
          "hidden";
        document.getElementById("postalCodeErrorMsg_edit").style.display =
          "none";
        validPickupDetails = true;
      }

      if (input_address.value === "") {
        input_address.value = input_address.placeholder;
      }
    } else {
      input_fullName = document.getElementById("pickup_contact_name_add");
      input_phoneNumber = document.getElementById("pickup_contact_number_add");
      input_postalCode = document.getElementById("pickup_postal_add");
      input_address = document.getElementById("pickup_detailed_address_add");
      input_unitNo = document.getElementById("pickup_unit_no_add");
      if (input_unitNo && input_unitNo.value === "") {
        input_unitNo.value = input_unitNo.placeholder;
      } else {
        if (input_unitNo.value.trim() === "") {
          input_unitNo.value = "";
        }
      }
      if (input_fullName.value === "") {
        // Case 1: User provided no input, so make use of placeholder as value
        input_fullName.value = input_fullName.placeholder;
      } else {
        if (input_fullName.value.trim() === "") {
          // Case 2: User entered spaces in input field for name
          document.getElementById("contactNameErrorMsg_add").style.visibility =
            "visible";
          document.getElementById("contactNameErrorMsg_add").style.display =
            "block";
          validPickupDetails = false;
        } else {
          // Case 3: User entered valid name that is different from placeholder
          document.getElementById("contactNameErrorMsg_add").style.visibility =
            "hidden";
          document.getElementById("contactNameErrorMsg_add").style.display =
            "none";
          validPickupDetails = true;
        }
      }

      if (input_phoneNumber.value.length < 8) {
        document.getElementById("contactNumberErrorMsg_add").style.visibility =
          "visible";
        document.getElementById("contactNumberErrorMsg_add").style.display =
          "block";
        validPickupDetails = false;
      } else {
        document.getElementById("contactNumberErrorMsg_add").style.visibility =
          "hidden";
        document.getElementById("contactNumberErrorMsg_add").style.display =
          "none";
        document.getElementById("contactNumberErrorMsg_edit").style.visibility =
          "hidden";
        document.getElementById("contactNumberErrorMsg_edit").style.display =
          "none";
        validPickupDetails = true;
      }

      if (input_postalCode.value.length < 6) {
        document.getElementById("postalCodeErrorMsg_add").style.visibility =
          "visible";
        document.getElementById("postalCodeErrorMsg_add").style.display =
          "block";
        validPickupDetails = false;
      } else {
        document.getElementById("postalCodeErrorMsg_add").style.visibility =
          "hidden";
        document.getElementById("postalCodeErrorMsg_add").style.display =
          "none";
        document.getElementById("postalCodeErrorMsg_edit").style.visibility =
          "hidden";
        document.getElementById("postalCodeErrorMsg_edit").style.display =
          "none";
        validPickupDetails = true;
      }

      if (input_address.value.trim().length === 0) {
        document.getElementById("addressErrorMsg_add").style.visibility =
          "visible";
        document.getElementById("addressErrorMsg_add").style.display = "block";
        validPickupDetails = false;
      } else {
        document.getElementById("addressErrorMsg_add").style.visibility =
          "hidden";
        document.getElementById("addressErrorMsg_add").style.display = "none";
        validPickupDetails = true;
      }
    }

    // Step 2: Save validated input to state
    this.setState({
      ownerName: input_fullName.value,
      contactNumber: input_phoneNumber.value,
      ppostalCode: input_postalCode.value,
      addressOnly: input_address.value,
      unitNo: input_unitNo.value,
    });

    // Step 3: Use values in state to invoke API for Onboarding (i.e. save to database)
    setTimeout(() => {
      fd.append("owner_name", this.state.ownerName);
      if (this.state.isPickup === "No") {
        fd.append("pickup_postal_code", this.state.ppostalCode);
        fd.append("pickup_state", "Singapore");
        fd.append("pickup_city", "Singapore");
        fd.append("pickup_address", this.state.addressOnly);

        if (this.state.unitNo.length > 0) {
          fd.append("unit_number", this.state.unitNo);
        }

        var fpu_address =
          this.state.addressOnly +
          ", " +
          this.state.pcity +
          " " +
          this.state.pastate +
          " " +
          this.state.ppostalCode;

        this.setState({
          full_pickup_address: fpu_address,
        });

        // reuse state for normal address fields
        fd.append("postal_code", this.state.ppostalCode);
        fd.append("state", "Singapore");
        fd.append("city", "Singapore");
        fd.append("address", this.state.addressOnly);
        fd.append("is_pickup_address", false);
      } else {
        fd.append("postal_code", this.state.ppostalCode);
        fd.append("state", "Singapore");
        fd.append("city", "Singapore");

        if (this.state.unitNo.length > 0) {
          fd.append("unit_number", this.state.unitNo);
        }

        fd.append("address", this.state.addressOnly);

        // match corresponding fields for pickup address
        fd.append("pickup_postal_code", this.state.ppostalCode);
        fd.append("pickup_state", "Singapore");
        fd.append("pickup_city", "Singapore");
        fd.append("pickup_address", this.state.addressOnly);
        fd.append("is_pickup_address", true);
      }

      // other required fields for API
      fd.append("owner_name", this.state.ownerName);
      fd.append("contact_number", this.state.contactNumber);
      fd.append("account_type", this.state.accountType);

      if (this.state.accountType === 0) {
        fd.append("name_field", this.state.individualName);
        fd.append("number_field", this.state.individualNumber);
      } else if (this.state.accountType === 1) {
        fd.append("name_field", this.state.businessName);
        fd.append("number_field", this.state.businessUEN);
      }

      if (validPickupDetails) {
        if (source === "add") {
          // if 1st pickup details record being added, set is_default of this record to true
          if (this.state.pickupLength && this.state.pickupLength === 0) {
            fd.append("is_default", "1");
          } else {
            var is_def_checked = document.getElementById(
              "newAddressDefault_checkbox"
            ).checked;
            if (is_def_checked) {
              fd.append("is_default", "1");
            } else {
              fd.append("is_default", "0");
            }
          }

          // use Apis.sellerPickup POST method to Add New Address (up to 3 in total)
          ApiCalls(
            fd,
            Apis.sellerPickup,
            "POST",
            {
              Authorization: "Bearer " + this.user.access,
            },
            this.processResp,
            e ? e.target : null
          );
        } else if (source === "edit") {
          // use Apis.sellerPickup POST method to Edit existing address
          ApiCalls(
            fd,
            Apis.sellerPickup + this.state.id_supplier + "/",
            "POST",
            {
              Authorization: "Bearer " + this.user.access,
            },
            this.processResp,
            e ? e.target : null
          );
        }
      }
    }, 300);

    // Step 4: Close modal for Add/Edit address (if pickup details are valid)
    if (validPickupDetails) {
      // Revert back to collapsed view with updated Pickup details retrieved from database
      setTimeout(() => {
        this.loadPickupDetails();
      }, 800);

      setTimeout(() => {
        // var anybackenderror = sessionStorage.getItem("backend_error");

        // if (anybackenderror) {
        //   alert("Encountered error: ", this.state.backend_error_msg);
        // } else {
        // Only close the modal if postal code provided is valid (w.r.t. URoute Lat/Long requirements)

        if (source === "add") {
          document.getElementById("modal-add-address").style.display = "none";
          document.getElementById("newAddressDefault_checkbox").checked = false;
          if (ls("length_pickup") === "3") {
            document.getElementById("div_add_address_prompt").style.display =
              "none";
          }
        }
        if (source === "edit") {
          document.getElementById("modal-edit-address").style.display = "none";
        }
        // }
        document.body.style.overflow = "scroll";
      }, 600);

      setTimeout(() => {
        this.togglePickupDetailsDisplay();
      }, 200);
    }
  };

  switchInstantDeliveryToggle = () => {
    var display_instant = document.getElementById("instant-delivery-display");
    var instantDeliveryPrompt = document.getElementById("instantDelPrompt");
    var instantDeliveryPromptMobile = document.getElementById(
      "instantDelPromptMobile"
    );

    var timepicker12h_start = document.getElementById("timepicker-12h-start");
    var disabledPicker_start = document.getElementById(
      "timepicker-start-disabled"
    );
    var instantTimeDiv_start = document.getElementById("instantTimeDiv_start");

    var timepicker12h_cutoff = document.getElementById("timepicker-12h-cutoff");
    var disabledPicker_cutoff = document.getElementById(
      "timepicker-cutoff-disabled"
    );
    var instantTimeDiv_cutoff = document.getElementById(
      "instantTimeDiv_cutoff"
    );

    if (this.instantDeliveryToggle === "on") {
      // show delivery fees table
      if (display_instant) display_instant.style.display = "block";
      // allow clickable time picker to be visible
      if (timepicker12h_start) {
        timepicker12h_start.hidden = false;
        instantTimeDiv_start.readOnly = false;
        instantTimeDiv_start.style.pointerEvents = "auto";
      }
      if (timepicker12h_cutoff) {
        timepicker12h_cutoff.hidden = false;
        instantTimeDiv_cutoff.readOnly = false;
        instantTimeDiv_cutoff.style.pointerEvents = "auto";
      }
      if (disabledPicker_start) disabledPicker_start.hidden = true;
      if (disabledPicker_cutoff) disabledPicker_cutoff.hidden = true;

      if (instantDeliveryPrompt) instantDeliveryPrompt.hidden = false;
      if (instantDeliveryPromptMobile)
        instantDeliveryPromptMobile.hidden = false;
    } else {
      // hide delivery fees table
      if (display_instant) display_instant.style.display = "none";

      // disable time picker clicks
      if (timepicker12h_start) {
        timepicker12h_start.hidden = true;
        disabledPicker_start.hidden = false;
      }
      if (timepicker12h_cutoff) {
        timepicker12h_cutoff.hidden = true;
        disabledPicker_cutoff.hidden = false;
      }
      if (disabledPicker_start) {
        instantTimeDiv_start.readOnly = true;
        instantTimeDiv_start.style.pointerEvents = "none";
        disabledPicker_start.hidden = false;
      }
      if (disabledPicker_cutoff) {
        instantTimeDiv_cutoff.readOnly = true;
        instantTimeDiv_cutoff.style.pointerEvents = "none";
        disabledPicker_cutoff.hidden = false;
      }
      if (instantDeliveryPrompt) instantDeliveryPrompt.hidden = true;
      if (instantDeliveryPromptMobile)
        instantDeliveryPromptMobile.hidden = true;
    }
  };

  switchOperatingDayBackground = (dayOfWeek, sel_value) => {
    var daySelected = document.getElementById(dayOfWeek);

    const Colors_BG = {
      unselected_col: "#efefef",
      // rgb(239, 239, 239)
      selected_col: "#f5ab351a",
      // rgba(245, 171, 53, 0.1)
    };

    var selectedColor = Colors_BG.selected_col;
    var unselectedColor = Colors_BG.unselected_col;

    if (daySelected) {
      var currentBG = daySelected.style.backgroundColor;

      if (currentBG) {
        var currentBG_hex = rgbToHex(currentBG);
      }
      if (!currentBG_hex) daySelected.style.backgroundColor = selectedColor;

      if (sel_value === true) {
        daySelected.style.backgroundColor = selectedColor;
      } else if (sel_value === false) {
        daySelected.style.backgroundColor = unselectedColor;
      }
    }
  };

  togglePickupDetailsDisplay = () => {
    var currentExpandState = this.state.expandPickUp;
    var collapsedDiv = document.getElementById("collapsed_pickup_div");
    var expandedDiv = document.getElementById("expanded_pickup_div");

    if (collapsedDiv || expandedDiv) {
      if (currentExpandState) {
        collapsedDiv.style.display = "block";
        collapsedDiv.style.visibility = "visible";
        expandedDiv.style.visibility = "hidden";
        expandedDiv.style.display = "none";
        this.setState({
          expandPickUp: false,
        });
      } else {
        collapsedDiv.style.display = "none";
        collapsedDiv.style.visibility = "hidden";
        expandedDiv.style.visibility = "visible";
        expandedDiv.style.display = "block";
        this.setState({
          expandPickUp: true,
        });
      }
    }
  };

  amendPickupDetailsDefault = (idx) => {
    this.setState({
      pickup_loading: true,
    });

    var pud_length = sessionStorage.getItem("length_pickup");
    var pud_length_int = parseInt(pud_length);

    for (var i = 0; i < pud_length_int; i++) {
      // setTimeout(() => {
      var pickupname = "pickup_" + (i + 1).toString();
      var details = ls(pickupname);

      // reset FD
      let fd = new FormData();
      // user must be a merchant
      fd.append("is_seller", "yes");
      fd.append("shop_url", this.state.shop_url);

      // Action 1: change is_default to false for unselected pickup details
      // For specified record, change is_default to true
      if (i === idx) {
        fd.append("owner_name", details.owner_name);
        fd.append("contact_number", details.contact_number);
        fd.append("pickup_address", details.pickup_address);
        fd.append("pickup_postal_code", details.pickup_postal_code);
        if (details.unit_number) fd.append("unit_number", details.unit_number);
        fd.append("is_default", "1");

        // use Apis.sellerPickup POST method to Edit is_default value of pickup
        ApiCalls(
          fd,
          Apis.sellerPickup + details.id_supplier + "/",
          "POST",
          {
            Authorization: "Bearer " + this.user.access,
          },
          this.processResp,
          null
        );
      }
      ls(pickupname, "");
    }

    setTimeout(() => {
      var anybackenderror = sessionStorage.getItem("backend_error");
      var backend_error_msg_display = document.getElementById(
        "backend_error_msg_display"
      );

      if (anybackenderror) {
        this.setState({
          backend_error_msg: sessionStorage.getItem("backend_error"),
        });

        backend_error_msg_display.scrollIntoView({ behavior: "smooth" });
        window.scrollBy(0, -300);

        setTimeout(() => {
          this.loadPickupDetails();
        }, 200);
      } else {
        this.setState({
          backend_error_msg: "",
        });

        setTimeout(() => {
          this.loadPickupDetails();
        }, 200);
        this.setState({
          pickup_loading: false,
        });

        setTimeout(() => {
          this.togglePickupDetailsDisplay();
        }, 200);
      }
    }, 200);
  };

  selectsDateRange = (dates) => {
    try {
      const [start, end] = dates;
      // Range from today to 6 months prior
      this.setState({
        freeDeliveryStartDate: start,
        freeDeliveryLastDate: end,
      });
    } catch (e) {
      console.log("Error message: " + e);
    }
  };

  changeExpansion = (index) => {
    let expansion = this.state.isExpanded;
    expansion[index] = !expansion[index];
    this.setState({
      isExpanded: expansion,
    });
  };

  displayWithoutTable = (deliveryOption) => {
    // value of shipping_option to correspond to the shipping_option list used in API
    if (deliveryOption === "SameDay") {
      let shipping_option = 1;

      return (
        <>
          {this.state.deliveryFees.map((item, idx) => (
            <div className="pl-3">
              <tr>
                <td>Weight (kg): </td>
                <td className="pl-4">{item.weight}</td>
              </tr>
              <tr>
                <td className="pr-2">uParcel Fee ($):</td>
                <td className="pl-4">
                  {parseFloat(item.uparcel_fee).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td>Seller Pay:</td>
                <td>
                  {" "}
                  <input
                    type="text"
                    value={"$" + this.state.sameDaySellerPay[idx]}
                    size="6"
                    className={`mobile_seller_pay_${shipping_option}[]`}
                    onChange={(e) => {
                      let sd_sp = this.state.sameDaySellerPay;
                      sd_sp[idx] = e.target.value.slice(1);
                      this.setState({ sameDaySellerPay: sd_sp }, () => {
                        this.render_buyerpayval(
                          `mobile_buyer_pay_${shipping_option}[]`,
                          `${idx}`,
                          item.uparcel_fee,
                          `mobile_seller_pay_${shipping_option}[]`,
                          "sellerInputErrorMsg_sd",
                          "black",
                          sd_sp[idx]
                        );
                      });
                    }}
                  ></input>
                </td>
              </tr>
              <tr>
                <td>Buyer Pay:</td>
                <div className="pl-4">
                  <td className={`mobile_buyer_pay_${shipping_option}[]`}>
                    {"$" +
                      (
                        parseFloat(item.uparcel_fee) -
                        parseFloat(this.state.sameDaySellerPay[idx])
                      )
                        .toFixed(2)
                        .toString()}
                  </td>
                </div>
              </tr>
              <p> &nbsp; </p>
            </div>
          ))}
        </>
      );
    } else if (deliveryOption === "NextDay") {
      let shipping_option = 2;

      return (
        <>
          {this.state.deliveryFeesNextDay.map((item, idx) => (
            <div className="pl-3">
              <tr>
                <td>Weight (kg): </td>
                <td className="pl-4">{item.weight}</td>
              </tr>
              <tr>
                <td className="pr-2">uParcel Fee ($):</td>
                <td className="pl-4">
                  {parseFloat(item.uparcel_fee).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td>Seller Pay:</td>
                <td>
                  {" "}
                  <input
                    type="text"
                    value={"$" + this.state.nextDaySellerPay[idx]}
                    size="6"
                    className={`mobile_seller_pay_${shipping_option}[]`}
                    onChange={(e) => {
                      let nd_sp = this.state.nextDaySellerPay;
                      nd_sp[idx] = e.target.value.slice(1);
                      this.setState({ nextDaySellerPay: nd_sp }, () => {
                        this.render_buyerpayval(
                          `mobile_buyer_pay_${shipping_option}[]`,
                          `${idx}`,
                          item.uparcel_fee,
                          `mobile_seller_pay_${shipping_option}[]`,
                          "sellerInputErrorMsg_nd",
                          "black",
                          nd_sp[idx]
                        );
                      });
                    }}
                  ></input>
                </td>
              </tr>
              <tr>
                <td>Buyer Pay:</td>
                <div className="pl-4">
                  <td className={`mobile_buyer_pay_${shipping_option}[]`}>
                    {"$" +
                      (
                        parseFloat(item.uparcel_fee) -
                        parseFloat(this.state.nextDaySellerPay[idx])
                      )
                        .toFixed(2)
                        .toString()}
                  </td>
                </div>
              </tr>
              <p> &nbsp; </p>
            </div>
          ))}
        </>
      );
    } else if (deliveryOption === "NextDay1") {
      let shipping_option = 4;

      return (
        <>
          {this.state.deliveryFeesND1.map((item, idx) => (
            <div className="pl-3">
              <tr>
                <td>Weight (kg): </td>
                <td className="pl-4">{item.weight}</td>
              </tr>
              <tr>
                <td className="pr-2">uParcel Fee ($):</td>
                <td className="pl-4">
                  {parseFloat(item.uparcel_fee).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td>Seller Pay:</td>
                <td>
                  <input
                    type="text"
                    value={"$" + this.state.nd1SellerPay[idx]}
                    size="6"
                    className={`mobile_seller_pay_${shipping_option}[]`}
                    onChange={(e) => {
                      let nd1_sp = this.state.nd1SellerPay;
                      nd1_sp[idx] = e.target.value.slice(1);
                      this.setState({ nd1SellerPay: nd1_sp }, () => {
                        this.render_buyerpayval(
                          `mobile_buyer_pay_${shipping_option}[]`,
                          `${idx}`,
                          item.uparcel_fee,
                          `mobile_seller_pay_${shipping_option}[]`,
                          "sellerInputErrorMsg_nd1",
                          "black",
                          nd1_sp[idx]
                        );
                      });
                    }}
                  ></input>
                </td>
              </tr>
              <tr>
                <td>Buyer Pay:</td>
                <div className="pl-4">
                  <td className={`mobile_buyer_pay_${shipping_option}[]`}>
                    {"$" +
                      (
                        parseFloat(item.uparcel_fee) -
                        parseFloat(this.state.nd1SellerPay[idx])
                      )
                        .toFixed(2)
                        .toString()}
                  </td>
                </div>
              </tr>
              <p> &nbsp; </p>
            </div>
          ))}
        </>
      );
    } else if (deliveryOption === "Instant") {
      let shipping_option = 3;

      return (
        <>
          {this.state.deliveryFeesInstant &&
            this.state.deliveryFeesInstant.map((item, idx) => (
              <div className="pl-3">
                <tr>
                  <td>Weight (kg): </td>
                  <td className="pl-4">{item.weight}</td>
                </tr>
                <tr>
                  <td className="pr-2">uParcel Fee ($):</td>
                  <td className="pl-4">
                    Base ${parseFloat(item.uparcel_fee).toFixed(0)} +{" "}
                    {parseFloat(item.per_km_charge).toFixed(2)}/km
                  </td>
                </tr>
                <tr>
                  <td>Seller Pay:</td>
                  <td>
                    <input
                      type="text"
                      value={"$" + this.state.instSellerPay[idx]}
                      size="6"
                      className={`mobile_seller_pay_${shipping_option}[]`}
                      onChange={(e) => {
                        let inst_sp = this.state.instSellerPay;
                        inst_sp[idx] = e.target.value.slice(1);
                        this.setState({ instSellerPay: inst_sp }, () => {
                          this.render_buyerpayval(
                            `mobile_buyer_pay_${shipping_option}[]`,
                            `${idx}`,
                            item.uparcel_fee,
                            `mobile_seller_pay_${shipping_option}[]`,
                            "sellerInputErrorMsg_inst",
                            "black",
                            inst_sp[idx]
                          );
                        });
                      }}
                    ></input>
                  </td>
                </tr>
                <tr>
                  <td>Buyer Pay:</td>
                  <div className="pl-4">
                    <td className={`mobile_buyer_pay_${shipping_option}[]`}>
                      {"$" +
                        (
                          parseFloat(item.uparcel_fee) -
                          parseFloat(this.state.instSellerPay[idx])
                        )
                          .toFixed(2)
                          .toString()}
                    </td>
                  </div>
                </tr>
                <p> &nbsp; </p>
              </div>
            ))}
        </>
      );
    }
  };

  renderDeliveryFees = (deliveryOptionValue) => {
    // value of shipping_option to correspond to the shipping_option list used in API
    if (deliveryOptionValue === "SameDay") {
      let shipping_option = this.state.shippingOptionIds?.[deliveryOptionValue];

      return (
        <>
          <meta />
          <div className="mt-10 table-container !p-0">
            <div
              className="mx-5 md:table-view hide-mobile"
              id="div_sameDay_fees"
            >
              <table
                id="table_sameDay_fees"
                ref={(table_ref) => {
                  this.setState.tableFeesRef = table_ref;
                }}
              >
                <thead>
                  <tr className="divide-x-2 divide-y-2 divide-gray border-2 border-gray text-lg">
                    <th width="20%" className="bg-gray-100" id="header_weight">
                      Weight
                    </th>
                    <th width="20%" className="bg-gray-100">
                      Shipping Fee
                    </th>
                    <th width="20%" className="bg-gray-100">
                      Seller Pay
                    </th>
                    <th width="20%" className="bg-gray-100">
                      Buyer Pay
                    </th>
                  </tr>
                </thead>

                <tbody className="font-normal">
                  {this.state.deliveryFees.map((item, idx) => {
                    let fee = parseFloat(item.uparcel_fee).toFixed(2);
                    return (
                      <tr
                        key={item.id_charge}
                        className="bg-white divide-x-2 divide-y-2 divide-gray border-2 border-gray text-center"
                      >
                        <td> {item.weight} kg </td>
                        <td> ${fee} </td>

                        <td>
                          <input
                            type="text"
                            value={"$" + this.state.sameDaySellerPay[idx]}
                            className={`seller_pay_${shipping_option}[]`}
                            onChange={(e) => {
                              let sd_sp = this.state.sameDaySellerPay;
                              sd_sp[idx] = e.target.value.slice(1);
                              this.setState({ sameDaySellerPay: sd_sp }, () => {
                                this.render_buyerpayval(
                                  `buyer_pay_${shipping_option}[]`,
                                  idx,
                                  item.uparcel_fee,
                                  `seller_pay_${shipping_option}[]`,
                                  "sellerInputErrorMsg_sd",
                                  "gray",
                                  sd_sp[idx]
                                );
                              });
                            }}
                          ></input>
                        </td>

                        <td className={`buyer_pay_${shipping_option}[]`}>
                          {"$" +
                            (fee - parseFloat(this.state.sameDaySellerPay[idx]))
                              .toFixed(2)
                              .toString()}{" "}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="hide-pc">
              {/* Display data without table if viewing on mobile */}
              {this.displayWithoutTable("SameDay")}
            </div>

            <p
              className="text-red-600 form-error hidden"
              id="sellerInputErrorMsg_sd"
            >
              {" "}
              Please enter a seller fee value lower than or equal to uParcel fee
              to save settings{" "}
            </p>
          </div>
        </>
      );
    } else if (deliveryOptionValue === "3Days") {
      let shipping_option = this.state.shippingOptionIds?.[deliveryOptionValue];

      return (
        <>
          <meta />
          <div className="mt-10 table-container w-full max-w-[1250px]">
            <div className="md:table-view hide-mobile">
              <table
                id="table_nextDay_fees"
                ref={(table_ref) => {
                  this.setState.tableFeesRef_nd = table_ref;
                }}
              >
                <thead>
                  <tr className="divide-x-2 divide-y-2 divide-gray border-2 border-gray text-lg">
                    <th width="20%" className="bg-gray-100" id="header_weight">
                      Weight
                    </th>
                    <th width="20%" className="bg-gray-100">
                      Shipping Fee
                    </th>
                    <th width="20%" className="bg-gray-100">
                      Seller Pay
                    </th>
                    <th width="20%" className="bg-gray-100">
                      Buyer Pay
                    </th>
                  </tr>
                </thead>

                <tbody className="font-normal">
                  {this.state.deliveryFeesNextDay.map((item, idx) => {
                    let fee = parseFloat(item.uparcel_fee).toFixed(2);
                    return (
                      <tr
                        key={item.id_charge}
                        className="bg-white divide-x-2 divide-y-2 divide-gray border-2 border-gray text-center"
                      >
                        <td> {item.weight} kg </td>
                        <td> ${fee} </td>

                        <td>
                          {" "}
                          <input
                            type="text"
                            value={"$" + this.state.nextDaySellerPay[idx]}
                            className={`seller_pay_${shipping_option}[]`}
                            onChange={(e) => {
                              let nd_sp = this.state.nextDaySellerPay;
                              nd_sp[idx] = e.target.value.slice(1);
                              this.setState({ nextDaySellerPay: nd_sp }, () => {
                                this.render_buyerpayval(
                                  `buyer_pay_${shipping_option}[]`,
                                  idx,
                                  item.uparcel_fee,
                                  `seller_pay_${shipping_option}[]`,
                                  "sellerInputErrorMsg_nd",
                                  "gray",
                                  nd_sp[idx]
                                );
                              });
                            }}
                          ></input>
                        </td>
                        <td className={`buyer_pay_${shipping_option}[]`}>
                          {" "}
                          {"$" +
                            (fee - parseFloat(this.state.nextDaySellerPay[idx]))
                              .toFixed(2)
                              .toString()}{" "}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="hide-pc">
              {/* Display data without table if viewing on mobile */}
              {this.displayWithoutTable("NextDay")}
            </div>

            <p
              className="text-red-600 form-error hidden"
              id="sellerInputErrorMsg_nd"
            >
              {" "}
              Please enter a seller fee value lower than or equal to uParcel fee
              to save settings{" "}
            </p>
          </div>
        </>
      );
    } else if (deliveryOptionValue === "NextDay1") {
      let shipping_option = this.state.shippingOptionIds?.[deliveryOptionValue];

      return (
        <>
          <meta />
          <div className="mt-10 table-container">
            <div className="md:table-view hide-mobile">
              <table
                id="table_nextDay1_fees"
                ref={(table_ref) => {
                  this.setState.tableFeesRef_nd1 = table_ref;
                }}
              >
                <thead>
                  <tr className="divide-x-2 divide-y-2 divide-gray border-2 border-gray text-lg">
                    <th width="20%" className="bg-gray-100" id="header_weight">
                      Weight
                    </th>
                    <th width="20%" className="bg-gray-100">
                      Shipping Fee
                    </th>
                    <th width="20%" className="bg-gray-100">
                      Seller Pay
                    </th>
                    <th width="20%" className="bg-gray-100">
                      Buyer Pay
                    </th>
                  </tr>
                </thead>

                <tbody className="font-normal">
                  {this.state.deliveryFeesND1.map((item, idx) => {
                    let fee = parseFloat(item.uparcel_fee).toFixed(2);
                    return (
                      <tr
                        key={item.id_charge}
                        className="bg-white divide-x-2 divide-y-2 divide-gray border-2 border-gray text-center"
                      >
                        <td> {item.weight} kg </td>
                        <td> ${fee} </td>

                        <td>
                          <input
                            type="text"
                            value={"$" + this.state.nd1SellerPay[idx]}
                            className={`seller_pay_${shipping_option}[]`}
                            onChange={(e) => {
                              let nd1_sp = this.state.nd1SellerPay;
                              nd1_sp[idx] = e.target.value.slice(1);
                              this.setState({ nd1SellerPay: nd1_sp }, () => {
                                this.render_buyerpayval(
                                  `buyer_pay_${shipping_option}[]`,
                                  `${idx}`,
                                  item.uparcel_fee,
                                  `seller_pay_${shipping_option}[]`,
                                  "sellerInputErrorMsg_nd1",
                                  "gray",
                                  nd1_sp[idx]
                                );
                              });
                            }}
                          ></input>
                        </td>
                        <td className={`buyer_pay_${shipping_option}[]`}>
                          {"$" +
                            (fee - parseFloat(this.state.nd1SellerPay[idx]))
                              .toFixed(2)
                              .toString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="hide-pc">
              {/* Display data without table if viewing on mobile */}
              {this.displayWithoutTable("NextDay1")}
            </div>

            <p
              className="text-red-600 form-error hidden"
              id="sellerInputErrorMsg_nd1"
            >
              {" "}
              Please enter a seller fee value lower than or equal to uParcel fee
              to save settings{" "}
            </p>
          </div>
        </>
      );
    } else if (deliveryOptionValue === "Instant") {
      let shipping_option = this.state.shippingOptionIds?.[deliveryOptionValue];
      return (
        <>
          <meta />
          <div className="mt-10 table-container">
            <div className="md:table-view hide-mobile">
              <table
                id="table_instant_fees"
                ref={(table_ref) => {
                  this.setState.tableFeesRef_inst = table_ref;
                }}
              >
                <thead>
                  <tr className="divide-x-2 divide-y-2 divide-gray border-2 border-gray text-lg">
                    <th width="20%" className="bg-gray-100" id="header_weight">
                      Weight
                    </th>
                    <th width="20%" className="bg-gray-100">
                      Shipping Fee
                    </th>
                    <th width="20%" className="bg-gray-100">
                      Seller Pay
                    </th>
                  </tr>
                </thead>
                {this.state.deliveryFeesInstant ? (
                  <tbody className="font-normal">
                    {this.state.deliveryFeesInstant.map((item, idx) => (
                      <tr
                        key={item.id_charge}
                        className="bg-white divide-x-2 divide-y-2 divide-gray border-2 border-gray text-center"
                      >
                        <td> {item.weight} kg </td>
                        <td>
                          {" "}
                          Base ${parseFloat(item.uparcel_fee).toFixed(0)} +{" "}
                          {parseFloat(item.per_km_charge).toFixed(2)}/km{" "}
                        </td>

                        <td>
                          <input
                            type="text"
                            value={"$" + this.state.instSellerPay[idx]}
                            className={`seller_pay_${shipping_option}[]`}
                            onChange={(e) => {
                              let inst_sp = this.state.instSellerPay;
                              inst_sp[idx] = e.target.value.slice(1);
                              this.setState({ instSellerPay: inst_sp }, () => {
                                this.render_buyerpayval(
                                  `buyer_pay_${shipping_option}[]`,
                                  `${idx}`,
                                  item.uparcel_fee,
                                  `seller_pay_${shipping_option}[]`,
                                  "sellerInputErrorMsg_inst",
                                  "gray",
                                  inst_sp[idx]
                                );
                              });
                            }}
                          ></input>
                        </td>

                        <td className={`buyer_pay_${shipping_option}[] hidden`}>
                          {" "}
                          {"$" +
                            (
                              parseFloat(item.uparcel_fee) -
                              parseFloat(this.state.instSellerPay[idx])
                            )
                              .toFixed(2)
                              .toString()}{" "}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <></>
                )}
              </table>
              {/* To display text retrieved from backend API (word for word --> replace static text below when API becomes available) */}
              <p className="mt-3 text-xs">{this.state.instant_del_msg} </p>
            </div>

            <div className="hide-pc">
              {/* Display data without table if viewing on mobile */}
              {this.displayWithoutTable("Instant")}
            </div>
            <p
              className="text-red-600 form-error hidden"
              id="sellerInputErrorMsg_inst"
            >
              {" "}
              Please enter a seller fee value lower than or equal to instant
              delivery base fee to save settings{" "}
            </p>
          </div>
        </>
      );
    }
  };

  renderDeliveryOptions = (optionSelected) => {
    if (optionSelected === "SameDay") {
      return (
        <>
          <div className="flex sm:gap-40 gap-14">
            <label className="relative inline-flex cursor-pointer">
              <div className="mb-7 mt-2">
                <div className="flex-auto capitalize font-bold text-black">
                  <h1>{this.state.first_shipping_option?.toUpperCase()}</h1>
                </div>
              </div>
              <div className="flex pl-12">
                <label className="switch">
                  <input
                    type="checkbox"
                    id="sameDayDeliverySwitch"
                    checked={this.sameDayDeliveryToggle === "on" ? true : false}
                    onChange={(e) =>
                      this.handleChange(e, "sameDayDeliveryToggle")
                    }
                  />
                  <span className="round bg-gray-400 slider"></span>
                </label>
              </div>
            </label>
            <p
              className="cp text-orangeButton underline text-sm mt-3"
              onClick={this.scrollToDeliveryInfo}
            >
              Check Info on Delivery Options
            </p>
          </div>

          <div className="w-4/5 max-lg:w-full">
            {/* <div className="flex justify-end gap-10 mb-3">
              <p className="font-bold text-black text-sm">
                Date to prepare order:
              </p>
              <p className="font-bold text-black text-sm">Day of order (D)</p>
            </div> */}

            <div className="flex justify-between gap-10 items-end">
              <p className="text-black text-sm w-[30%]">
                Time Slots your customers can choose to receive their orders
              </p>
              <div className="flex justify-end gap-10 mr-4">
                <p className="text-black text-sm mr-4 text-right">
                  Item packed by:
                </p>
                <p className="text-black text-sm">Driver pick-up</p>
              </div>
            </div>

            <div className="h-0.5 w-full bg-gray-200 my-2"></div>
            {this.state.timeSlots.map((item, key) => {
              return (
                <div className="flex justify-between gap-10 items-end my-4">
                  <div className="flex gap-10 items-center">
                    <div className="text-white text-sm bg-[#4A5759] text-center p-2 rounded">
                      {item?.delivery_slot}
                    </div>
                    {this.sameDayDeliveryToggle === "on" && (
                      <label className="switch !top-0">
                        <input
                          type="checkbox"
                          id={`deliveryTimeslot${key + 1}Selected`}
                          defaultChecked={
                            item?.is_selected === "y" ? true : false
                          }
                          onChange={(e) =>
                            this.handleChange(
                              e,
                              `deliveryTimeslot${key + 1}Selected`
                            )
                          }
                        />
                        <span className="slider round"></span>
                      </label>
                    )}
                  </div>
                  <div className="flex justify-end gap-6">
                    <p className="text-gray-400 text-sm mr-8">
                      {item?.pickup_slot.substring(
                        0,
                        item?.pickup_slot.indexOf("-")
                      )}
                      {/* {item?.cutoff_time ?? ""} */}
                    </p>
                    <p className="text-gray-400 text-sm">
                      T: {item?.pickup_slot ?? ""}
                    </p>
                  </div>
                </div>
              );
            })}
            <div className="flex justify-end text-sm">
              <span className="text-orangeButton font-bold">T </span> = Day
              order is placed
            </div>
          </div>
          <div className="grid-cols-2 gap-4 mb-5">
            <p
              className="text-red-600 form-error hidden"
              id="timeslotErrorMsg_sd"
            >
              You must select at least one Same Day Delivery timeslot
            </p>
          </div>
        </>
      );
    } else if (optionSelected === "NextDay1") {
      return (
        <>
          <form className="orange_default" id="nextday-delivery-form">
            <div className="flex items-center sm:gap-40 gap-14">
              <label className="relative inline-flex cursor-pointer items-center">
                <div className="font-bold text-black mt-5">
                  <h1>SCHEDULED DELIVERY</h1>
                </div>
                <div className="flex px-5">
                  <label className="switch">
                    <input
                      type="checkbox"
                      id="nd1SlotsSwitch"
                      checked={this.nd1DeliveryToggle === "on" ? true : false}
                      onChange={(e) =>
                        this.handleChange(e, "nd1DeliveryToggle")
                      }
                    />
                    <span className="round bg-gray-400 slider"></span>
                  </label>
                </div>
              </label>
              <p
                className="cp text-orangeButton underline text-sm mt-3"
                onClick={this.scrollToDeliveryInfo}
              >
                Check Info on Delivery Options
              </p>
            </div>

            <div className="w-4/5 max-lg:w-full mt-10">
              <div className="flex justify-between gap-10 items-end">
                <p className="text-black text-sm w-[30%]">
                  Time Slots your customers can choose to receive their orders
                </p>
                <div className="flex justify-end gap-6 mr-4">
                  <p className="text-black text-sm mr-4 text-right">
                    Item packed by:
                  </p>
                  <p className="text-black text-sm">Driver pick-up</p>
                </div>
              </div>

              <div className="h-0.5 w-full bg-gray-200 my-2"></div>
              {this.state.timeSlotND1.map((item, key) => {
                return (
                  <div className="flex justify-between gap-10 items-end my-4">
                    <div className="flex gap-10 items-center">
                      <div className="text-white text-sm bg-[#4A5759] text-center p-2 rounded">
                        {item?.delivery_slot}
                      </div>
                      {this.nd1DeliveryToggle === "on" ? (
                        <label className="switch !top-0">
                          <input
                            type="checkbox"
                            id={`deliveryTimeslotNd${key + 1}Selected`}
                            defaultChecked={
                              item?.is_selected === "y" ? true : false
                            }
                            onChange={(e) =>
                              this.handleChange(
                                e,
                                `deliveryTimeslotNd${key + 1}Selected`
                              )
                            }
                          />
                          <span className="slider round"></span>
                        </label>
                      ) : null}
                    </div>
                    <div className="flex justify-end gap-10">
                      <p className="text-gray-400 text-sm mr-8">
                        {item?.pickup_slot?.substring(
                          0,
                          item?.pickup_slot.indexOf("-")
                        )}
                        {/* {item?.cutoff_time} */}
                      </p>
                      <p className="text-gray-400 text-sm">
                        d: {item?.pickup_slot ?? ""}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-end text-sm">
                <span className="text-orangeButton font-bold">d </span> =
                Selected delivery date
              </div>
            </div>

            {this.nd1DeliveryToggle === "on" && (
              <>
                <div className="capitalize font-bold text-black mt-10">
                  <h2>Scheduled Delivery Fees Settings</h2>
                </div>

                {this.renderDeliveryFees("NextDay1")}
              </>
            )}
          </form>
          <p className="text-red-600 form-error hidden" id="error_overall_nd">
            Please select any one delivery method
          </p>
        </>
      );
    } else if (optionSelected === "Instant") {
      return (
        <>
          <div className="flex">
            <form id="instant-delivery-form">
              <div className="flex sm:gap-40 gap-14">
                <label className="relative inline-flex cursor-pointer">
                  <div className="flex-auto capitalize font-bold text-black pt-2">
                    <h1>{this.state.third_shipping_option?.toUpperCase()}</h1>
                  </div>
                  <div className="flex pl-10 ml-5 ">
                    <label className="switch">
                      <input
                        type="checkbox"
                        id="instantDeliverySwitch"
                        checked={
                          this.instantDeliveryToggle === "on" ? true : false
                        }
                        onChange={(e) =>
                          this.handleChange(e, "instantDeliveryToggle")
                        }
                      />
                      <span className="round bg-gray-400 slider"></span>
                    </label>
                  </div>
                </label>
                <p
                  className="cp text-orangeButton underline text-sm mt-3"
                  onClick={this.scrollToDeliveryInfo}
                >
                  Check Info on Delivery Options
                </p>
              </div>

              {/* The following sections will appear differently based on toggle for Instant Delivery */}
              <div className="mt-5">
                <div className="col-span-1 mr-5">
                  <div>
                    <div className="flex-auto capitalize font-bold text-black mt-10">
                      <h3>Store Opening Hour: </h3>
                    </div>
                    <div
                      className="flex"
                      id="instantTimeDiv_start"
                      hidden="true"
                    >
                      <div className="flex pt-2">
                        <div className="relative" id="timepicker-12h-start">
                          <input
                            type="text"
                            readOnly
                            onClick={(e) => {
                              e.target.nextElementSibling.click();
                            }}
                            className="block timepicker_input min-h-[auto] w-full rounded border-0 bg-transparent py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:peer-focus:text-primary [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                            onInput={() => {
                              this.processStartTime(
                                document.getElementById("timeInput_start").value
                              );
                            }}
                            value={
                              this.state.instantDeliveryStart
                                ? this.state.instantDeliveryStart
                                : ""
                            }
                            id="timeInput_start"
                          />
                        </div>
                        <div
                          className="relative text-gray-400 pointer-disable"
                          id="timepicker-start-disabled"
                          hidden="false"
                        >
                          <input
                            type="text"
                            className="block min-h-[auto] w-full rounded border-0 bg-transparent py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear"
                            id="timeInput_start"
                            value={
                              this.state.instantDeliveryStart
                                ? this.state.instantDeliveryStart
                                : ""
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3e Time picker for Last Timing to accept order */}
                  <div className="mt-10">
                    <div className="flex-auto capitalize font-bold text-black">
                      <h3>Store Closing Hour: </h3>
                    </div>
                    <div
                      className="flex"
                      id="instantTimeDiv_cutoff"
                      hidden="true"
                    >
                      <div className="flex pt-2">
                        <div className="relative" id="timepicker-12h-cutoff">
                          <input
                            type="text"
                            readOnly
                            onClick={(e) => {
                              e.target.nextElementSibling.click();
                            }}
                            className="block timepicker_input min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:peer-focus:text-primary [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                            onInput={() => {
                              this.processCutOffTime(
                                document.getElementById("timeInput_cutoff")
                                  .value
                              );
                            }}
                            value={
                              this.state.instantDeliveryCutoff
                                ? this.state.instantDeliveryCutoff
                                : ""
                            }
                            id="timeInput_cutoff"
                          />
                        </div>
                        <div
                          className="relative text-gray-400 pointer-disable"
                          id="timepicker-cutoff-disabled"
                          hidden="false"
                        >
                          <input
                            type="text"
                            className="block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear"
                            id="timeInput_cutoff"
                            value={
                              this.state.instantDeliveryCutoff
                                ? this.state.instantDeliveryCutoff
                                : ""
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* The following sections will only be visible to user if toggle for Instant Delivery is ON */}
                {/* 3f Editable Table for Delivery Fees Settings (Instant Delivery) */}
                <div className="hidden" id="instant-delivery-display">
                  <div className="capitalize font-bold text-black mt-12">
                    <h2>Instant Delivery Fees Settings</h2>
                  </div>

                  {this.renderDeliveryFees("Instant")}
                </div>
              </div>
            </form>
          </div>
        </>
      );
    } else if (optionSelected === "Free") {
      return (
        <div className="ml-5 flex flex-col">
          {/* min cart size */}
          <label className="relative inline-flex cursor-pointer">
            <div className="mb-2 mt-2">
              <div className="flex items-center gap-1 font-bold text-black">
                <h2 className="whitespace-nowrap">
                  Minimum Cart Size Settings
                </h2>
                {this.state.minCartToggle === "on" && (
                  <>
                  <span>$</span>
                  <input
                    type="number"
                    className="w-24"
                    placeholder="Minimum spending"
                    value={this.state.minCartValue}
                    disabled={this.state.minCartToggle === "off"}
                    onChange={(e) => {
                      if(e.target.value.length <= MAX_DIGITS){
                        this.setState({ minCartValue: e.target.value });
                      }
                    }}
                  />
                  </>
                )}
              </div>
            </div>
            <div className="flex pl-12 mt-2">
              <label className="switch">
                <input
                  type="checkbox"
                  id="freeDeliverySwitch"
                  checked={this.state.minCartToggle === "on" ? true : false}
                  onChange={(e) => this.handleChange(e, "minCartToggle")}
                />
                <span className="round bg-gray-400 slider"></span>
              </label>
            </div>
          </label>

          <p className="text-sm">
            Offers checkOut only with minimum spending of $ xxx (total product
            value excluding shipping fees)
          </p>
          <br />
          <p className="text-sm">
            * Buyer will not be able to checkOut if they purchase below the
            above amount.
          </p>
          <br />

          {/* free delivery */}
          <h1 className="font-bold cp">Free Delivery Settings</h1>
          <br />
          <label className="relative inline-flex cursor-pointer">
            <div className="mb-2 mt-2">
              <div className="flex items-center gap-1 font-bold text-black">
                <h1 className="whitespace-nowrap">
                  Offer Free Delivery above $
                </h1>
                <input
                  type="number"
                  className="w-24"
                  value={this.state.freeAboveValue}
                  disabled={this.freeDeliveryToggle === "off"}
                  onChange={(e) => {
                    if(e.target.value.length <= MAX_DIGITS){
                      this.setState({ freeAboveValue: e.target.value });
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex pl-12 mt-2">
              <label className="switch">
                <input
                  type="checkbox"
                  id="freeDeliverySwitch"
                  checked={this.freeDeliveryToggle === "on" ? true : false}
                  onChange={(e) => this.handleChange(e, "freeDeliveryToggle")}
                />
                <span className="round bg-gray-400 slider"></span>
              </label>
            </div>
          </label>
          <p className="text-sm">
            * Seller will bear all of the delivery fee if buyer purchase above
            this amount
          </p>

          <label className="relative inline-flex cursor-pointer mt-7">
            <div className="mb-2 mt-2">
              <div className="flex-auto text-black">
                <h1 className="whitespace-nowrap">
                  Free Delivery only for the below period
                </h1>
              </div>
            </div>
            <div className="flex pl-12">
              <label className="switch">
                <input
                  type="checkbox"
                  id="freeDeliveryPeriodSwitch"
                  checked={
                    this.freeDeliveryPeriodToggle === "on" ? true : false
                  }
                  onChange={(e) =>
                    this.handleChange(e, "freeDeliveryPeriodToggle")
                  }
                />
                <span className="round bg-gray-400 slider"></span>
              </label>
            </div>
          </label>
          <p className="text-sm">
            * If turned off, free delivery will be applied indefinitely
          </p>

          <div
            id="date-picker"
            className="flex flex-row justify-between pr-2 items-center mt-7 max-sm:w-full w-[300px]"
          >
            <div className="customDatePickerWidth">
              <DatePicker
                startDate={this.state.freeDeliveryStartDate}
                endDate={this.state.freeDeliveryLastDate}
                dateFormat="dd-MM-yyyy"
                selectsRange
                minDate={new Date()}
                onChange={this.selectsDateRange}
                width="100%"
                placeholderText="From Date - To Date"
                monthsShown={2}
                disabled={this.freeDeliveryPeriodToggle === "off"}
              />
            </div>
            <MdCalendarViewMonth color="#828282" className="w-6" />
          </div>
        </div>
      );
    } else if (optionSelected === "3Days") {
      return (
        <>
          <form className="orange_default" id="nextday-delivery-form">
            <div>
              <div className="flex items-center sm:gap-40 gap-14">
                <label className="relative inline-flex cursor-pointer items-center">
                  <div className="font-bold text-black mr-8">
                    <h1>3 - 5 DAYS DELIVERY</h1>
                  </div>
                  <div className="flex mb-5">
                    <label className="switch">
                      <input
                        type="checkbox"
                        id="nextDayTimeSlotsSwitch"
                        checked={
                          this.nextDayDeliveryToggle === "on" ? true : false
                        }
                        onChange={(e) =>
                          this.handleChange(e, "nextDayDeliveryToggle")
                        }
                      />
                      <span className="round bg-gray-400 slider"></span>
                    </label>
                  </div>
                </label>
                <p
                  className="cp text-orangeButton underline text-sm mt-3"
                  onClick={this.scrollToDeliveryInfo}
                >
                  Check Info on Delivery Options
                </p>
              </div>
            </div>{" "}
          </form>
          <div className="flex items-center gap-12 mr-4 mt-8">
            <p className="text-black text-sm">
              Sellers to select preferred pick-up window
            </p>
          </div>
          <div className="h-0.5 w-[300px] bg-gray-200 my-2"></div>
          {this.state.timeSlotsNextDay.map((item, key) => {
            return (
              <div className="flex items-center gap-20 my-3">
                <label
                  className="flex gap-4 items-center"
                  for={`radio_id${key + 1}`}
                >
                  <div className="py-1 px-3 bg-[#4A5759] text-center rounded-md text-white text-sm w-[200px]">
                    D -1 : {item?.pickup_slot}
                  </div>

                  <div className="md:px-10 radio_btn_parent">
                    <input
                      type="radio"
                      id={`radio_id${key + 1}`}
                      value=""
                      className="hidden_radio_btn peer"
                      name={`delivery_slot${key + 1}_radio`}
                      checked={
                        this.state.timeSlotsNextDay[key].is_selected === "y"
                          ? true
                          : false
                      }
                      onClick={(e) => {
                        if (this.nextDayDeliveryToggle === "on") {
                          this.handleChange(
                            e,
                            `nextDayTimeslot${key + 1}Selected`
                          );
                        }
                      }}
                    />
                    <div
                      className={`w-5 h-5 border rounded-full after:content-[''] 
                                after:bg-white after:rounded-full 
                               cursor-pointer ${
                                 this.nextDayDeliveryToggle === "off"
                                   ? "border-grey4Border peer-checked:bg-grey4Border"
                                   : "border-orangeButton peer-checked:bg-orange-300"
                               }`}
                      id={`radio_div${key + 1}`}
                    ></div>
                  </div>
                </label>
              </div>
            );
          })}

          {this.nextDayDeliveryToggle === "on" && (
            <>
              <div className="mb-4 font-bold text-black mt-12">
                <h2>3 - 5 Days Delivery Fees Setting</h2>
              </div>
              {this.renderDeliveryFees("3Days")}
            </>
          )}

          <p className="text-red-600 form-error hidden" id="error_overall_nd">
            Please select any one delivery method
          </p>
        </>
      );
    }
  };

  dataObtainedUserInput = async (e, viewDevice) => {
    // var merchantID = this.user.userstatus_id;
    // let shipping_option = [];
    // option values should be retrieved from the list "shipping_option"

    let id_charge_sd = [];
    let uparcelfee_sd = [];
    let buyerList_sd = [];
    let is_enable_sd = "";

    let id_charge_inst = [];
    let uparcelfee_inst = [];
    let buyerList_inst = [];
    let is_enable_inst = "";

    //all day
    let id_charge_nd = [];
    let uparcelfee_nd = [];
    let buyerList_nd = [];
    let is_enable_nd = "";

    //scheduled(same day)
    let id_charge_nd1 = [];
    let uparcelfee_nd1 = [];
    let buyerList_nd1 = [];
    let is_enable_nd1 = "";

    var seller_pay_list_sd;
    var seller_pay_list_nd;
    var seller_pay_list_inst;
    var seller_pay_list_nd1;

    if (viewDevice === "PC") {
      seller_pay_list_sd = document.getElementsByClassName(
        `seller_pay_${this.state.shippingOptionIds?.["SameDay"]}[]`
      );
      seller_pay_list_inst = document.getElementsByClassName(
        `seller_pay_${this.state.shippingOptionIds?.["Instant"]}[]`
      );
      seller_pay_list_nd = document.getElementsByClassName(
        `seller_pay_${this.state.shippingOptionIds?.["3Days"]}[]`
      );
      seller_pay_list_nd1 = document.getElementsByClassName(
        `seller_pay_${this.state.shippingOptionIds?.["NextDay1"]}[]`
      );
    } else if (viewDevice === "Mobile") {
      seller_pay_list_sd = document.getElementsByClassName(
        `mobile_seller_pay_${this.state.shippingOptionIds?.["SameDay"]}[]`
      );
      seller_pay_list_inst = document.getElementsByClassName(
        `mobile_seller_pay_${this.state.shippingOptionIds?.["Instant"]}[]`
      );
      seller_pay_list_nd = document.getElementsByClassName(
        `mobile_seller_pay_${this.state.shippingOptionIds?.["3Days"]}[]`
      );
      seller_pay_list_nd1 = document.getElementsByClassName(
        `mobile_seller_pay_${this.state.shippingOptionIds?.["NextDay1"]}[]`
      );
    }

    this.state.deliveryFees.map((item, idx) =>
      id_charge_sd.push(parseInt(item.id_charge))
    );
    this.state.deliveryFees.map((item, idx) =>
      uparcelfee_sd.push(parseFloat(item.uparcel_fee))
    );

    this.state.deliveryFeesInstant.map((item, idx) =>
      id_charge_inst.push(parseInt(item.id_charge))
    );
    this.state.deliveryFeesInstant.map((item, idx) =>
      uparcelfee_inst.push(parseFloat(item.uparcel_fee))
    );

    this.state.deliveryFeesNextDay.map((item, idx) =>
      id_charge_nd.push(parseInt(item.id_charge))
    );
    this.state.deliveryFeesNextDay.map((item, idx) =>
      uparcelfee_nd.push(parseFloat(item.uparcel_fee))
    );

    this.state.deliveryFeesND1.map((item, idx) =>
      id_charge_nd1.push(parseInt(item.id_charge))
    );
    this.state.deliveryFeesND1.map((item, idx) =>
      uparcelfee_nd1.push(parseFloat(item.uparcel_fee))
    );

    if (seller_pay_list_sd.length > 0) {
      for (let i = 0; i < id_charge_sd.length; i++) {
        buyerList_sd.push(
          parseFloat(uparcelfee_sd[i] - this.state.sameDaySellerPay[i])
        );
      }
    } else {
      for (let i = 0; i < id_charge_sd.length; i++) {
        let item = this.state.deliveryFees[i];
        let fee = parseFloat(item.uparcel_fee).toFixed(2);
        buyerList_sd.push((fee - this.state.sameDaySellerPay[i]).toFixed(2));
      }
    }

    // for instant delivery
    if (seller_pay_list_inst.length > 0) {
      for (let i = 0; i < id_charge_inst.length; i++) {
        buyerList_inst.push(
          parseFloat(uparcelfee_inst[i] - this.state.instSellerPay[i])
        );
      }
    } else {
      for (let i = 0; i < id_charge_inst.length; i++) {
        let item = this.state.deliveryFeesInstant[i];
        let fee = parseFloat(item.uparcel_fee).toFixed(2);
        buyerList_inst.push((fee - this.state.instSellerPay[i]).toFixed(2));
      }
    }

    // if (this.nextDayDeliveryToggle === "on") {
    if (seller_pay_list_nd.length > 0) {
      for (let i = 0; i < id_charge_nd.length; i++) {
        buyerList_nd.push(
          parseFloat(uparcelfee_nd[i] - this.state.nextDaySellerPay[i])
        );
      }
    } else {
      for (let i = 0; i < id_charge_nd.length; i++) {
        let item = this.state.deliveryFeesNextDay[i];
        let fee = parseFloat(item.uparcel_fee).toFixed(2);
        buyerList_nd.push((fee - this.state.nextDaySellerPay[i]).toFixed(2));
      }
    }

    //for scheduled(same day)
    if (seller_pay_list_nd1.length > 0) {
      for (let i = 0; i < id_charge_nd1.length; i++) {
        buyerList_nd1.push(
          parseFloat(uparcelfee_nd1[i] - this.state.nd1SellerPay[i])
        );
      }
    } else {
      for (let i = 0; i < id_charge_nd1.length; i++) {
        let item = this.state.deliveryFeesND1[i];
        let fee = parseFloat(item.uparcel_fee).toFixed(2);
        buyerList_nd1.push((fee - this.state.nd1SellerPay[i]).toFixed(2));
      }
    }

    // Payload to send to API
    if (this.sameDayDeliveryToggle === "on") is_enable_sd = "y";
    else is_enable_sd = "n";

    // to provide values for next day shipping even if user has disabled next day shipping
    if (this.nextDayDeliveryToggle === "on") is_enable_nd = "y";
    else is_enable_nd = "n";

    // to provide values for next day shipping even if user has disabled instant shipping
    if (this.instantDeliveryToggle === "on") is_enable_inst = "y";
    else is_enable_inst = "n";

    // to provide values for scheduled (same day) shipping even if user has disabled scheduled (same day) shipping
    if (this.nd1DeliveryToggle === "on") is_enable_nd1 = "y";
    else is_enable_nd1 = "n";

    //check
    this.ship_settings.selected_options = this.state.selectedTimeslots;

    var fd = new FormData();
    // user must be a merchant
    fd.append("is_seller", "yes");

    // operating days sent as array []
    var op_day_array = this.state.selectedOperatingDays;
    for (var itx = 0; itx < op_day_array.length; itx++) {
      if (
        ["mon", "tue", "wed", "thu", "fri", "sat", "sun"].includes(
          op_day_array[itx]
        )
      ) {
        fd.append("operating_day[]", op_day_array[itx]);
      }
    }

    if (op_day_array.length === 0) {
      this.setState({
        backend_error_msg:
          "Failed to save shipping settings. Please select at least one day of operation",
      });
    }

    // iterate through values obtained from user input, then relay to API
    var timeslots_length = this.state.selectedTimeslots.length;
    var selected_sd_timeslots_count = 0;
    var timeslotsnd1_length = this.state.selected_nd1_timeslots.length;
    var selected_nd1_timeslots_count = 0;

    let optionIdKeys = ["SameDay", "3Days", "Instant", "NextDay1"];

    for (let i = 0; i < optionIdKeys.length; i++) {
      let shipping_option = this.state.shippingOptionIds?.[optionIdKeys[i]];
      console.log(
        "shipping option ",
        optionIdKeys[i],
        this.state.shippingOptionIds
      );
      if (shipping_option) {
        fd.append("shipping_option[]", shipping_option);

        // to ensure same day shipment settings are only processed ONCE
        if (optionIdKeys[i] === "SameDay") {
          // always enable same day delivery
          fd.append(`is_enable_${shipping_option}[]`, is_enable_sd);

          for (let j = 0; j < timeslots_length; j++) {
            if (this.state.selectedTimeslots[j] === "y") {
              fd.append(`time_slot_${shipping_option}[]`, j + 1);
              selected_sd_timeslots_count += 1;
            }
          }

          for (let k = 0; k < id_charge_sd.length; k++) {
            fd.append(`id_charge_${shipping_option}[]`, id_charge_sd[k]);
            fd.append(
              `seller_pay_${shipping_option}[]`,
              this.state.sameDaySellerPay[k]
            );
            fd.append(`buyer_pay_${shipping_option}[]`, buyerList_sd[k]);
          }
        } else if (optionIdKeys[i] === "3Days") {
          let indxToAdd = [1, 2];

          if (shipping_option === 5) indxToAdd = [7, 8];
          // processing next day shipment settings
          fd.append(`is_enable_${shipping_option}[]`, is_enable_nd);

          // manual check for 2 radio buttons
          if (
            document.getElementById("radio_id1") &&
            document.getElementById("radio_id1").checked
          ) {
            fd.append(
              `time_slot_${shipping_option}[]`,
              indxToAdd[0] + timeslots_length
            );
          }
          if (
            document.getElementById("radio_id2") &&
            document.getElementById("radio_id2").checked
          ) {
            fd.append(
              `time_slot_${shipping_option}[]`,
              indxToAdd[1] + timeslots_length
            );
          }

          for (let k = 0; k < id_charge_nd.length; k++) {
            fd.append(`id_charge_${shipping_option}[]`, id_charge_nd[k]);
            fd.append(
              `seller_pay_${shipping_option}[]`,
              this.state.nextDaySellerPay[k]
            );
            fd.append(`buyer_pay_${shipping_option}[]`, buyerList_nd[k]);
          }
        } else if (optionIdKeys[i] === "Instant") {
          // processing instant shipment settings
          fd.append(`is_enable_${shipping_option}[]`, is_enable_inst);

          // Instant delivery cutoff time & start time
          fd.append("start_time", this.state.instantDeliveryStart);
          fd.append("cutoff_time", this.state.instantDeliveryCutoff);

          for (let k = 0; k < id_charge_inst.length; k++) {
            fd.append(`id_charge_${shipping_option}[]`, id_charge_inst[k]);
            fd.append(
              `seller_pay_${shipping_option}[]`,
              this.state.instSellerPay[k]
            );
            fd.append(`buyer_pay_${shipping_option}[]`, buyerList_inst[k]);
          }
        } else if (optionIdKeys[i] === "NextDay1") {
          // processing next day shipment settings
          fd.append(`is_enable_${shipping_option}[]`, is_enable_nd1);

          for (let j = 0; j < timeslotsnd1_length; j++) {
            console.log(this.state.selected_nd1_timeslots[j]);
            if (this.state.selected_nd1_timeslots[j] === "y") {
              fd.append(`time_slot_${shipping_option}[]`, j + 6);
              selected_nd1_timeslots_count += 1;
            }
          }
          for (let k = 0; k < id_charge_nd1.length; k++) {
            fd.append(`id_charge_${shipping_option}[]`, id_charge_nd1[k]);
            fd.append(
              `seller_pay_${shipping_option}[]`,
              this.state.nd1SellerPay[k]
            );
            fd.append(`buyer_pay_${shipping_option}[]`, buyerList_nd1[k]);
          }
        }
      }
    }

    if(this.state.minCartToggle === "on") {
      if(this.state.minCartValue !== "") {
        fd.append("minimum_cart_size", this.state.minCartValue);
      } else {
        toast.error(
          "Please enter amount below which checkOut is not available"
        );
        return;
      }
    }

    if (this.freeDeliveryToggle === "on") {
      if (this.state.freeAboveValue !== "")
        fd.append("free_shipping_cart_amt", this.state.freeAboveValue);
      else {
        toast.error(
          "Please enter amount above which free delivery is applicable"
        );
        return;
      }

      if (this.freeDeliveryPeriodToggle === "on") {
        if (
          this.state.freeDeliveryStartDate &&
          this.state.freeDeliveryLastDate
        ) {
          let startDate =
            this.state.freeDeliveryStartDate.getDate() +
            "-" +
            parseInt(
              this.state.freeDeliveryStartDate.getMonth() + 1
            ).toString() +
            "-" +
            this.state.freeDeliveryStartDate.getFullYear();

          let endDate =
            this.state.freeDeliveryLastDate.getDate() +
            "-" +
            parseInt(
              this.state.freeDeliveryLastDate.getMonth() + 1
            ).toString() +
            "-" +
            this.state.freeDeliveryLastDate.getFullYear();

          fd.append("free_shipping_start_date", startDate);
          fd.append("free_shipping_end_date ", endDate);
        } else {
          toast.error("Please select date range for free shipping");
          return;
        }
      }
    }

    setTimeout(() => {
      if (
        this.nextDayDeliveryToggle === "off" &&
        this.nd1DeliveryToggle === "off" &&
        this.sameDayDeliveryToggle === "off" &&
        this.instantDeliveryToggle === "off"
      ) {
        toast.error("Select atleast one delivery");
        return;
      }

      // validation if BOTH all day time slot radio button are NOT checked
      if (
        document.getElementById("radio_id1") &&
        !document.getElementById("radio_id1").checked &&
        document.getElementById("radio_id2") &&
        !document.getElementById("radio_id2").checked &&
        this.nextDayDeliveryToggle === "on"
      ) {
        toast.error(
          "Please select atleast one timeslot under All day receiving delivery"
        );
        return;
      }

      if (
        this.state.isJtAvailable &&
        selected_nd1_timeslots_count === 0 &&
        this.nd1DeliveryToggle === "on"
      ) {
        toast.error(
          "Please select a timeslot for Scheduled - Time slot enabled option"
        );
        return;
      }

      // validation if no same day time slots are selected (only display error message if next day delivery is toggled OFF)
      if (
        selected_sd_timeslots_count === 0 &&
        this.sameDayDeliveryToggle === "on"
      ) {
        toast.error("Please select at least one Same Day Delivery timeslot");
        return;
      }

      // validation for instant delivery timings provided
      var start_time_input = Date.parse(
        "01/01/2023 " + this.state.instantDeliveryStart
      );
      var end_time_input = Date.parse(
        "01/01/2023 " + this.state.instantDeliveryCutoff
      );
      if (end_time_input < start_time_input) {
        toast.error(
          " Please select a start time that is earlier than the cut-off time"
        );
        return;
      }

      for (let x = 0; x < buyerList_sd.length; x++) {
        // only check for scheduled - all day delivery fee validity if user has toggled it on
        // only check for scheduled - same day delivery fee validity if user has toggled it on
        if (
          parseFloat(buyerList_sd[x]) < 0 ||
          (this.nextDayDeliveryToggle === "on" &&
            parseFloat(buyerList_nd[x]) < 0) ||
          (this.nd1DeliveryToggle === "on" && parseFloat(buyerList_nd1[x]) < 0)
        ) {
          toast.error(
            "Please enter a seller fee value lower than or equal to uParcel fee to save settings"
          );
          return;
        }
      }

      for (let x = 0; x < buyerList_inst.length; x++) {
        // only check for instant delivery fee validity if user has toggled on
        if (
          this.instantDeliveryToggle === "on" &&
          parseFloat(buyerList_inst[x]) < 0
        ) {
          toast.error(
            "  Please enter a seller fee value lower than or equal to instant delivery base fee to save settings"
          );
          return;
        }
      }

      ApiCalls(
        fd,
        Apis.updateShippingSettings,
        "POST",
        { Authorization: "Bearer " + this.user.access },
        this.processSaveResponse,
        e ? e.target : null
      );
    }, 200);

    ls("merchant-shipping-settings", this.ship_settings);
  };

  deleteAddress = (idx) => {
    let fd = new FormData();
    ApiCalls(
      fd,
      Apis.deleteAddress + this.state.allPickupDetails[idx].id_supplier + "/",
      "DELETE",
      {
        Authorization: "Bearer " + this.user.access,
      },
      (res, api) => {
        console.log("delete address ", res.data.data);
        if (res.data.result === "SUCCESS") {
          toast.success(res.data.message);
          ApiCalls(
            fd,
            Apis.sellerPickup,
            "GET",
            { Authorization: "Bearer " + this.user.access },
            this.processResp
          );
        } else toast.error(res.data.message);
      },
      null
    );
  };

  // Render page
  render() {
    let mcClass = this.props.level === 1 ? "main-contents" : "main-contents ws";

    return (
      <main className="app-merchant merchant-db">
        <Navbar theme="dashboard" />
        <Sidebar selectedMenu={3} />
        {/* <ToastContainer /> */}
        <div className={mcClass}>
          <div className="breadcrumbs">
            <div className="page-title" id="header_page_title">
              Shipment Settings
            </div>
            <ul className="mt-2">
              <li>
                <a href={MerchantRoutes.Landing}>Home {">"}</a>
              </li>
              {/* <li>Shipment</li> */}
              {this.props.level > 0 && <li>Shipment</li>}
            </ul>
          </div>

          {/* 1 card aka listing-page for Pickup Details */}
          <div className="listing-page mt-3">
            <div className="body">
              <div className="px-5 py-5">
                <div className="col-span-5 pt-2">
                  <div className="flex-auto font-bold text-red-600">
                    <p id="backend_error_msg_display">
                      {this.state.backend_error_msg}
                    </p>
                  </div>
                  &nbsp;
                </div>
                <div className="grid grid-cols-5">
                  <div className="grid col-span-5">
                    <div className="col-span-2 pt-2">
                      <div className="capitalize font-bold">
                        {this.state.pickupLength < 3 ? (
                          <div className="grid col-span-1 xs:grid-cols-2 md:grid-cols-3">
                            <h1 className="xs:col-span-1 md:col-span-2">
                              Pickup Details
                            </h1>
                            <div
                              className="text_underline cursor-pointer align-right pl-5"
                              style={{ color: "#f5ab35" }}
                              id="div_add_address_prompt"
                            >
                              <span
                                className="capitalize flex-auto"
                                onClick={() => {
                                  this.setState({
                                    pickupUnitNumToggle: "off",
                                    contactNumber: "",
                                    ppostalCode: "",
                                    addressOnly: "",
                                    id_supplier: "",
                                  });
                                  setTimeout(() => {
                                    document.body.style.overflow = "hidden";
                                    document.getElementById(
                                      "modal-add-address"
                                    ).style.display = "block";
                                  }, 500);
                                }}
                              >
                                Add A New Address
                              </span>
                            </div>
                          </div>
                        ) : (
                          <h1 className="xs:col-span-1 md:col-span-2">
                            Pickup Details
                          </h1>
                        )}

                        {this.state.pickup_loading ? (
                          <div className="listing-page mt-3 text-center">
                            <Loader
                              color="#f5ab35"
                              height="45px"
                              width="45px"
                            />
                          </div>
                        ) : (
                          <div className="mt-3">
                            {this.state.pickupLength >= 1 ? (
                              <div className="body">
                                <div
                                  id="expanded_pickup_div"
                                  className="hidden"
                                >
                                  {this.state.pickupLength >= 2 ? (
                                    <div className="align-right">
                                      <MdOutlineKeyboardArrowUp
                                        size={35}
                                        className="accordion-icon"
                                        onClick={() =>
                                          this.togglePickupDetailsDisplay()
                                        }
                                        style={{ color: "#f5ab35" }}
                                      />
                                    </div>
                                  ) : (
                                    <></>
                                  )}

                                  {this.state.allPickupDetails &&
                                    this.state.allPickupDetails?.map(
                                      (obj, idx) => (
                                        <div className="px-5 py-5">
                                          <div className="md:pt-2">
                                            <IoLocationOutline
                                              size={30}
                                              style={
                                                obj.is_default
                                                  ? { color: "#f5ab35" }
                                                  : { color: "#9ca3af" }
                                              }
                                            />
                                            &nbsp;
                                            <div className="grid grid-cols-4">
                                              {/* #1 - header */}
                                              {obj.is_default ? (
                                                <div className="col-span-1">
                                                  <div className="pt-1">
                                                    <label
                                                      id="label_contact_name"
                                                      for="pickup_contact_name"
                                                      className="font-bold text-black"
                                                    >
                                                      Full Name
                                                    </label>
                                                  </div>
                                                  <div className="py-3">
                                                    <label
                                                      id="label_contact_number"
                                                      for="pickup_contact_number"
                                                      className="font-bold text-black"
                                                    >
                                                      Phone Number
                                                    </label>
                                                  </div>
                                                  <div>
                                                    <label
                                                      id="label_pickup_address"
                                                      for="pickup_address"
                                                      className="font-bold text-black"
                                                    >
                                                      Address
                                                    </label>
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="col-span-1">
                                                  <div className="pt-1">
                                                    <label
                                                      id="label_contact_name"
                                                      for="pickup_contact_name"
                                                      className="text-gray-400"
                                                    >
                                                      Full Name
                                                    </label>
                                                  </div>
                                                  <div className="py-3">
                                                    <label
                                                      id="label_contact_number"
                                                      for="pickup_contact_number"
                                                      className="text-gray-400"
                                                    >
                                                      Phone Number
                                                    </label>
                                                  </div>
                                                  <div>
                                                    <label
                                                      id="label_pickup_address"
                                                      for="pickup_address"
                                                      className="text-gray-400"
                                                    >
                                                      Address
                                                    </label>
                                                  </div>
                                                </div>
                                              )}

                                              {/* #2 - values */}
                                              <div className="ml-3 xs:col-span-2 md:col-span-1">
                                                <div className="pt-1">
                                                  <span className="text-gray-500">
                                                    <p>{obj.owner_name}</p>
                                                  </span>
                                                </div>
                                                <div className="py-3">
                                                  <span className="text-gray-500">
                                                    <p>{obj.contact_number}</p>
                                                  </span>
                                                </div>

                                                {obj.unit_number ? (
                                                  <div>
                                                    <span className="text-gray-500">
                                                      {obj.unit_number.indexOf(
                                                        "#"
                                                      ) > -1 ? (
                                                        <p>
                                                          {obj.pickup_address +
                                                            ", " +
                                                            obj.unit_number +
                                                            ", " +
                                                            obj.pickup_postal_code}
                                                        </p>
                                                      ) : (
                                                        <p>
                                                          {obj.pickup_address +
                                                            ", #" +
                                                            obj.unit_number +
                                                            ", " +
                                                            obj.pickup_postal_code}
                                                        </p>
                                                      )}
                                                    </span>
                                                  </div>
                                                ) : (
                                                  <div>
                                                    <span className="text-gray-500">
                                                      <p>
                                                        {obj.pickup_address +
                                                          ", " +
                                                          obj.pickup_postal_code}
                                                      </p>
                                                    </span>
                                                  </div>
                                                )}
                                              </div>

                                              {/* #3 - spacing */}
                                              <div className="hide-mobile">
                                                <div>&nbsp;</div>
                                              </div>

                                              {/* #4 - Edit Button */}
                                              {obj.is_default ? (
                                                <div className="col-span-1">
                                                  <div className="pt-1">
                                                    &nbsp;
                                                  </div>
                                                  <div className="flex gap-1 items-center justify-end">
                                                    <p className="text-sm font-semibold ">
                                                      Current Default
                                                    </p>
                                                    <button
                                                      className="h-8 w-8 rounded-3xl relative border border-[#828282] ml-2.5 float-left cp transition ease-[ease] duration-500"
                                                      type="button"
                                                      title="Edit"
                                                      onClick={() => {
                                                        this.setState({
                                                          pickup_full_name:
                                                            obj.owner_name,
                                                          contactNumber:
                                                            obj.contact_number,
                                                          ppostalCode:
                                                            obj.pickup_postal_code,
                                                          addressOnly:
                                                            obj.pickup_address,
                                                          id_supplier:
                                                            obj.id_supplier,
                                                        });
                                                        if (
                                                          this.state
                                                            .pickupUnitNumToggle ===
                                                          "on"
                                                        ) {
                                                          this.setState({
                                                            unitNo:
                                                              obj.unit_number,
                                                          });
                                                        } else {
                                                          this.setState({
                                                            unitNo: "",
                                                          });
                                                        }

                                                        setTimeout(() => {
                                                          document.body.style.overflow =
                                                            "hidden";
                                                          document.getElementById(
                                                            "modal-edit-address"
                                                          ).style.display =
                                                            "block";
                                                        }, 500);
                                                      }}
                                                    >
                                                      <BsFillPencilFill
                                                        color="#828282"
                                                        className="absolute text-sm m-auto inset-0"
                                                      />
                                                    </button>
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="col-span-1">
                                                  <div className="pt-1">
                                                    &nbsp;
                                                  </div>
                                                  <div className="flex gap-2 items-center justify-end">
                                                    {/* set as default */}
                                                    <button className="site-btn btn-default align-right">
                                                      <span
                                                        onClick={() => {
                                                          this.amendPickupDetailsDefault(
                                                            idx
                                                          );
                                                          if (
                                                            obj.unit_number &&
                                                            obj.unit_number
                                                              .length > 0
                                                          ) {
                                                            this.setState({
                                                              pickupUnitNumToggle:
                                                                "on",
                                                            });
                                                          } else {
                                                            this.setState({
                                                              pickupUnitNumToggle:
                                                                "off",
                                                              unitNo: "",
                                                            });
                                                          }
                                                        }}
                                                        className="text-center"
                                                      >
                                                        Set Default
                                                      </span>
                                                    </button>

                                                    {/* edit */}
                                                    <button
                                                      className="h-8 w-8 rounded-3xl relative border border-[#828282] float-left cp transition ease-[ease] duration-500"
                                                      type="button"
                                                      title="Edit"
                                                      onClick={() => {
                                                        this.setState({
                                                          pickup_full_name:
                                                            obj.owner_name,
                                                          contactNumber:
                                                            obj.contact_number,
                                                          ppostalCode:
                                                            obj.pickup_postal_code,
                                                          addressOnly:
                                                            obj.pickup_address,
                                                          id_supplier:
                                                            obj.id_supplier,
                                                        });
                                                        if (
                                                          this.state
                                                            .pickupUnitNumToggle ===
                                                          "on"
                                                        ) {
                                                          this.setState({
                                                            unitNo:
                                                              obj.unit_number,
                                                          });
                                                        } else {
                                                          this.setState({
                                                            unitNo: "",
                                                          });
                                                        }

                                                        setTimeout(() => {
                                                          document.body.style.overflow =
                                                            "hidden";
                                                          document.getElementById(
                                                            "modal-edit-address"
                                                          ).style.display =
                                                            "block";
                                                        }, 500);
                                                      }}
                                                    >
                                                      <BsFillPencilFill
                                                        color="#828282"
                                                        className="absolute text-sm m-auto inset-0"
                                                      />
                                                    </button>

                                                    {/* delete */}
                                                    <button
                                                      className="h-8 w-8 rounded-3xl relative border border-[#eb5757] mr-2.5 float-left cp transition ease-[ease] duration-500"
                                                      type="button"
                                                      title="Delete"
                                                      onClick={(e) => {
                                                        if (
                                                          window.confirm(
                                                            "Are you sure you want to delete this address?"
                                                          )
                                                        ) {
                                                          this.deleteAddress(
                                                            idx
                                                          );
                                                        }
                                                      }}
                                                    >
                                                      <MdDeleteForever
                                                        color="#eb5757"
                                                        className="absolute text-sm m-auto inset-0"
                                                      />
                                                    </button>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      )
                                    )}
                                </div>
                                <div id="collapsed_pickup_div">
                                  {this.state.pickupLength >= 2 ? (
                                    <div className="align-right">
                                      <MdOutlineKeyboardArrowDown
                                        size={35}
                                        className="accordion-icon"
                                        onClick={() =>
                                          this.togglePickupDetailsDisplay()
                                        }
                                        style={{ color: "#f5ab35" }}
                                      />
                                    </div>
                                  ) : (
                                    <></>
                                  )}

                                  {this.state.allPickupDetails &&
                                    this.state.allPickupDetails?.map(
                                      (obj, idx) => (
                                        <div className="px-5">
                                          {obj.is_default ? (
                                            <div className="md:pt-2 py-5">
                                              <IoLocationOutline
                                                size={30}
                                                style={{ color: "#f5ab35" }}
                                                className="mt-5"
                                              />
                                              &nbsp;
                                              <div className="grid grid-cols-2 hide-pc">
                                                {/* #1 - header */}
                                                <div className="col-span-1">
                                                  <div className="pt-1">
                                                    <label
                                                      id="label_contact_name"
                                                      for="pickup_contact_name"
                                                      className="font-bold text-black"
                                                    >
                                                      Full Name
                                                    </label>
                                                  </div>
                                                  <div className="py-3">
                                                    <label
                                                      id="label_contact_number"
                                                      for="pickup_contact_number"
                                                      className="font-bold text-black"
                                                    >
                                                      Phone Number
                                                    </label>
                                                  </div>
                                                  <div>
                                                    <label
                                                      id="label_pickup_address"
                                                      for="pickup_address"
                                                      className="font-bold text-black"
                                                    >
                                                      Address
                                                    </label>
                                                  </div>
                                                </div>

                                                {/* #2 - values */}
                                                {/* for mobile view -> col-span-1 of 2 */}
                                                <div className="ml-3 col-span-1">
                                                  <div className="pt-1">
                                                    <span className="text-gray-500">
                                                      <p>{obj.owner_name}</p>
                                                    </span>
                                                  </div>
                                                  <div className="py-3">
                                                    <span className="text-gray-500">
                                                      <p>
                                                        {obj.contact_number}
                                                      </p>
                                                    </span>
                                                  </div>

                                                  {obj.unit_number ? (
                                                    <div>
                                                      <span className="text-gray-500">
                                                        {obj.unit_number.indexOf(
                                                          "#"
                                                        ) > -1 ? (
                                                          <p>
                                                            {obj.pickup_address +
                                                              ", " +
                                                              obj.unit_number +
                                                              ", " +
                                                              obj.pickup_postal_code}
                                                          </p>
                                                        ) : (
                                                          <p>
                                                            {obj.pickup_address +
                                                              ", #" +
                                                              obj.unit_number +
                                                              ", " +
                                                              obj.pickup_postal_code}
                                                          </p>
                                                        )}
                                                      </span>
                                                    </div>
                                                  ) : (
                                                    <div>
                                                      <span className="text-gray-500">
                                                        <p>
                                                          {obj.pickup_address +
                                                            ", " +
                                                            obj.pickup_postal_code}
                                                        </p>
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>

                                                {/* #3 - Edit Button only visible if there is currently 1 pickup details record retrieved */}
                                                {this.state.pickupLength ===
                                                1 ? (
                                                  <div className="col-span-1">
                                                    <div className="pt-1">
                                                      &nbsp;
                                                    </div>
                                                    <div>
                                                      <button className="site-btn btn-default align-right">
                                                        <span
                                                          onClick={() => {
                                                            this.setState({
                                                              pickup_full_name:
                                                                obj.owner_name,
                                                              contactNumber:
                                                                obj.contact_number,
                                                              ppostalCode:
                                                                obj.pickup_postal_code,
                                                              addressOnly:
                                                                obj.pickup_address,
                                                              id_supplier:
                                                                obj.id_supplier,
                                                            });
                                                            if (
                                                              this.state
                                                                .pickupUnitNumToggle ===
                                                              "on"
                                                            ) {
                                                              this.setState({
                                                                unitNo:
                                                                  obj.unit_number,
                                                              });
                                                            } else {
                                                              this.setState({
                                                                unitNo: "",
                                                              });
                                                            }

                                                            setTimeout(() => {
                                                              document.body.style.overflow =
                                                                "hidden";
                                                              document.getElementById(
                                                                "modal-edit-address"
                                                              ).style.display =
                                                                "block";
                                                            }, 500);
                                                          }}
                                                        >
                                                          &nbsp;&nbsp;&nbsp;&nbsp;Edit&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                      </button>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <></>
                                                )}
                                              </div>
                                              <div className="grid grid-cols-4 hide-mobile">
                                                {/* #1 - header */}
                                                <div className="col-span-1">
                                                  <div className="pt-1">
                                                    <label
                                                      id="label_contact_name"
                                                      for="pickup_contact_name"
                                                      className="font-bold text-black"
                                                    >
                                                      Full Name
                                                    </label>
                                                  </div>
                                                  <div className="py-3">
                                                    <label
                                                      id="label_contact_number"
                                                      for="pickup_contact_number"
                                                      className="font-bold text-black"
                                                    >
                                                      Phone Number
                                                    </label>
                                                  </div>
                                                  <div>
                                                    <label
                                                      id="label_pickup_address"
                                                      for="pickup_address"
                                                      className="font-bold text-black"
                                                    >
                                                      Address
                                                    </label>
                                                  </div>
                                                </div>

                                                {/* #2 - values */}
                                                {/* for pc view -> col-span-2 */}
                                                <div className="ml-3 col-span-2">
                                                  <div className="pt-1">
                                                    <span className="text-gray-500">
                                                      <p>{obj.owner_name}</p>
                                                    </span>
                                                  </div>
                                                  <div className="py-3">
                                                    <span className="text-gray-500">
                                                      <p>
                                                        {obj.contact_number}
                                                      </p>
                                                    </span>
                                                  </div>

                                                  {obj.unit_number ? (
                                                    <div>
                                                      <span className="text-gray-500">
                                                        {obj.unit_number.indexOf(
                                                          "#"
                                                        ) > -1 ? (
                                                          <p>
                                                            {obj.pickup_address +
                                                              ", " +
                                                              obj.unit_number +
                                                              ", " +
                                                              obj.pickup_postal_code}
                                                          </p>
                                                        ) : (
                                                          <p>
                                                            {obj.pickup_address +
                                                              ", #" +
                                                              obj.unit_number +
                                                              ", " +
                                                              obj.pickup_postal_code}
                                                          </p>
                                                        )}
                                                      </span>
                                                    </div>
                                                  ) : (
                                                    <div>
                                                      <span className="text-gray-500">
                                                        <p>
                                                          {obj.pickup_address +
                                                            ", " +
                                                            obj.pickup_postal_code}
                                                        </p>
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>

                                                {/* #3 - spacing */}
                                                <div className="col-span-1">
                                                  <div className="pt-1">
                                                    &nbsp;
                                                  </div>
                                                  <div className="py-3">
                                                    &nbsp;
                                                  </div>
                                                  <div>&nbsp;</div>
                                                </div>

                                                {/* #4 - Edit Button only visible if there is currently 1 pickup details record retrieved */}
                                                {this.state.pickupLength ===
                                                1 ? (
                                                  <div className="col-span-1">
                                                    <div className="pt-1">
                                                      &nbsp;
                                                    </div>
                                                    <div>
                                                      <button className="site-btn btn-default align-right">
                                                        <span
                                                          onClick={() => {
                                                            this.setState({
                                                              pickup_full_name:
                                                                obj.owner_name,
                                                              contactNumber:
                                                                obj.contact_number,
                                                              ppostalCode:
                                                                obj.pickup_postal_code,
                                                              addressOnly:
                                                                obj.pickup_address,
                                                              id_supplier:
                                                                obj.id_supplier,
                                                            });
                                                            if (
                                                              this.state
                                                                .pickupUnitNumToggle ===
                                                              "on"
                                                            ) {
                                                              this.setState({
                                                                unitNo:
                                                                  obj.unit_number,
                                                              });
                                                            } else {
                                                              this.setState({
                                                                unitNo: "",
                                                              });
                                                            }

                                                            setTimeout(() => {
                                                              document.body.style.overflow =
                                                                "hidden";
                                                              document.getElementById(
                                                                "modal-edit-address"
                                                              ).style.display =
                                                                "block";
                                                            }, 500);
                                                          }}
                                                        >
                                                          &nbsp;&nbsp;&nbsp;&nbsp;Edit&nbsp;&nbsp;&nbsp;&nbsp;
                                                        </span>
                                                      </button>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  <></>
                                                )}
                                              </div>
                                            </div>
                                          ) : (
                                            <></>
                                          )}
                                        </div>
                                      )
                                    )}
                                </div>
                              </div>
                            ) : (
                              <></>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2 card aka page for Business Open Days */}
          <div className="listing-page mt-3">
            <div className="body">
              <div className="pl-5 py-5">
                <div className="grid lg:grid-cols5 md:grid-cols3 gap-4 mb-5">
                  <BsCalendar4Week size={28} className="mt-5" color="#f5ab35" />
                  <div className="grid grid-cols-2 lg:grid-cols-3">
                    <div className="font-bold pt-3">
                      <h1>Days of Operation</h1>
                    </div>
                  </div>

                  <div>
                    <div className="flex-auto text-gray-500">
                      <p>
                        Select the days that your shop will be open and able to
                        make deliveries below
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 xs:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    <div
                      className="timeslotDiv_toggle mr-5"
                      id={`operating_day_toggle_monday`}
                    >
                      <ul className="list-none">
                        <li>
                          <ul className="list-disc">
                            <li
                              className="deliveryTime_li cursor-pointer"
                              onClick={(e) =>
                                this.handleChange(e, "monday_toggle")
                              }
                            >
                              <label className="relative inline-flex">
                                <div>Monday</div>
                              </label>
                              <div className="radio_btn_parent align-right">
                                <input
                                  type="checkbox"
                                  value=""
                                  className="hidden_radio_btn peer"
                                  id={`monday_toggle`}
                                  checked={
                                    this.state.selectedOperatingDays.includes(
                                      "mon"
                                    )
                                      ? true
                                      : false
                                  }
                                  onChange={(e) =>
                                    this.handleChange(e, "monday_toggle")
                                  }
                                />
                                {this.state.selectedOperatingDays.includes(
                                  "mon"
                                )
                                  ? this.switchOperatingDayBackground(
                                      "operating_day_toggle_monday",
                                      true
                                    )
                                  : ls("valid", "y")}

                                <div
                                  align="right"
                                  className="w-9 h-5 bg-gray-200 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white 
                                                                after:content-[''] after:absolute after:top-[1.5px] after:right-[17.8px] after:bg-white after:border-gray-300 after:border 
                                                                after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-orange-300"
                                ></div>
                              </div>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                    <div
                      className="timeslotDiv_toggle mr-5"
                      id={`operating_day_toggle_tuesday`}
                    >
                      <ul className="list-none">
                        <li>
                          <ul className="list-disc">
                            <li
                              className="deliveryTime_li cursor-pointer"
                              onClick={(e) =>
                                this.handleChange(e, "tuesday_toggle")
                              }
                            >
                              <label className="relative inline-flex">
                                <div>Tuesday</div>
                              </label>
                              <div className="radio_btn_parent align-right">
                                <input
                                  type="checkbox"
                                  value=""
                                  className="hidden_radio_btn peer"
                                  id={`tuesday_toggle`}
                                  checked={
                                    this.state.selectedOperatingDays.includes(
                                      "tue"
                                    )
                                      ? true
                                      : false
                                  }
                                  onChange={(e) =>
                                    this.handleChange(e, "tuesday_toggle")
                                  }
                                />
                                {this.state.selectedOperatingDays.includes(
                                  "tue"
                                )
                                  ? this.switchOperatingDayBackground(
                                      "operating_day_toggle_tuesday",
                                      true
                                    )
                                  : ls("valid", "y")}

                                <div
                                  align="right"
                                  className="w-9 h-5 bg-gray-200 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white 
                                                                after:content-[''] after:absolute after:top-[1.5px] after:right-[17.8px] after:bg-white after:border-gray-300 after:border 
                                                                after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-orange-300"
                                ></div>
                              </div>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                    <div
                      className="timeslotDiv_toggle mr-5"
                      id={`operating_day_toggle_wednesday`}
                    >
                      <ul className="list-none">
                        <li>
                          <ul className="list-disc">
                            <li
                              className="deliveryTime_li cursor-pointer"
                              onClick={(e) =>
                                this.handleChange(e, "wednesday_toggle")
                              }
                            >
                              <label className="relative inline-flex">
                                <div>Wednesday</div>
                              </label>
                              <div className="radio_btn_parent align-right">
                                <input
                                  type="checkbox"
                                  value=""
                                  className="hidden_radio_btn peer"
                                  id={`wednesday_toggle`}
                                  checked={
                                    this.state.selectedOperatingDays.includes(
                                      "wed"
                                    )
                                      ? true
                                      : false
                                  }
                                  onChange={(e) =>
                                    this.handleChange(e, "wednesday_toggle")
                                  }
                                />
                                {this.state.selectedOperatingDays.includes(
                                  "wed"
                                )
                                  ? this.switchOperatingDayBackground(
                                      "operating_day_toggle_wednesday",
                                      true
                                    )
                                  : ls("valid", "y")}

                                <div
                                  align="right"
                                  className="w-9 h-5 bg-gray-200 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white 
                                                                after:content-[''] after:absolute after:top-[1.5px] after:right-[17.8px] after:bg-white after:border-gray-300 after:border 
                                                                after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-orange-300"
                                ></div>
                              </div>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                    <div
                      className="timeslotDiv_toggle mr-5"
                      id={`operating_day_toggle_thursday`}
                    >
                      <ul className="list-none">
                        <li>
                          <ul className="list-disc">
                            <li
                              className="deliveryTime_li cursor-pointer"
                              onClick={(e) =>
                                this.handleChange(e, "thursday_toggle")
                              }
                            >
                              <label className="relative inline-flex">
                                <div>Thursday</div>
                              </label>
                              <div className="radio_btn_parent align-right">
                                <input
                                  type="checkbox"
                                  value=""
                                  className="hidden_radio_btn peer"
                                  id={`thursday_toggle`}
                                  checked={
                                    this.state.selectedOperatingDays.includes(
                                      "thu"
                                    )
                                      ? true
                                      : false
                                  }
                                  onChange={(e) =>
                                    this.handleChange(e, "thursday_toggle")
                                  }
                                />
                                {this.state.selectedOperatingDays.includes(
                                  "thu"
                                )
                                  ? this.switchOperatingDayBackground(
                                      "operating_day_toggle_thursday",
                                      true
                                    )
                                  : ls("valid", "y")}

                                <div
                                  align="right"
                                  className="w-9 h-5 bg-gray-200 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white 
                                                                after:content-[''] after:absolute after:top-[1.5px] after:right-[17.8px] after:bg-white after:border-gray-300 after:border 
                                                                after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-orange-300"
                                ></div>
                              </div>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                    <div
                      className="timeslotDiv_toggle mr-5"
                      id={`operating_day_toggle_friday`}
                    >
                      <ul className="list-none">
                        <li>
                          <ul className="list-disc">
                            <li
                              className="deliveryTime_li cursor-pointer"
                              onClick={(e) =>
                                this.handleChange(e, "friday_toggle")
                              }
                            >
                              <label className="relative inline-flex">
                                <div>Friday</div>
                              </label>
                              <div className="radio_btn_parent align-right">
                                <input
                                  type="checkbox"
                                  value=""
                                  className="hidden_radio_btn peer"
                                  id={`friday_toggle`}
                                  checked={
                                    this.state.selectedOperatingDays.includes(
                                      "fri"
                                    )
                                      ? true
                                      : false
                                  }
                                  onChange={(e) =>
                                    this.handleChange(e, "friday_toggle")
                                  }
                                />
                                {this.state.selectedOperatingDays.includes(
                                  "fri"
                                )
                                  ? this.switchOperatingDayBackground(
                                      "operating_day_toggle_friday",
                                      true
                                    )
                                  : ls("valid", "y")}

                                <div
                                  align="right"
                                  className="w-9 h-5 bg-gray-200 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white 
                                                                after:content-[''] after:absolute after:top-[1.5px] after:right-[17.8px] after:bg-white after:border-gray-300 after:border 
                                                                after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-orange-300"
                                ></div>
                              </div>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                    <div
                      className="timeslotDiv_toggle mr-5"
                      id={`operating_day_toggle_saturday`}
                    >
                      <ul className="list-none">
                        <li>
                          <ul className="list-disc">
                            <li
                              className="deliveryTime_li cursor-pointer"
                              onClick={(e) =>
                                this.handleChange(e, "saturday_toggle")
                              }
                            >
                              <label className="relative inline-flex">
                                <div>Saturday</div>
                              </label>
                              <div className="radio_btn_parent align-right">
                                <input
                                  type="checkbox"
                                  value=""
                                  className="hidden_radio_btn peer"
                                  id={`saturday_toggle`}
                                  checked={
                                    this.state.selectedOperatingDays.includes(
                                      "sat"
                                    )
                                      ? true
                                      : false
                                  }
                                  onChange={(e) =>
                                    this.handleChange(e, "saturday_toggle")
                                  }
                                />
                                {this.state.selectedOperatingDays.includes(
                                  "sat"
                                )
                                  ? this.switchOperatingDayBackground(
                                      "operating_day_toggle_saturday",
                                      true
                                    )
                                  : ls("valid", "y")}

                                <div
                                  align="right"
                                  className="w-9 h-5 bg-gray-200 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white 
                                                                after:content-[''] after:absolute after:top-[1.5px] after:right-[17.8px] after:bg-white after:border-gray-300 after:border 
                                                                after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-orange-300"
                                ></div>
                              </div>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                    <div
                      className="timeslotDiv_toggle mr-5"
                      id={`operating_day_toggle_sunday`}
                    >
                      <ul className="list-none">
                        <li>
                          <ul className="list-disc">
                            <li
                              className="deliveryTime_li cursor-pointer"
                              onClick={(e) =>
                                this.handleChange(e, "sunday_toggle")
                              }
                            >
                              <label className="relative inline-flex">
                                <div>Sunday</div>
                              </label>
                              <div className="radio_btn_parent align-right">
                                <input
                                  type="checkbox"
                                  value=""
                                  className="hidden_radio_btn peer"
                                  id={`sunday_toggle`}
                                  checked={
                                    this.state.selectedOperatingDays.includes(
                                      "sun"
                                    )
                                      ? true
                                      : false
                                  }
                                  onChange={(e) =>
                                    this.handleChange(e, "sunday_toggle")
                                  }
                                />
                                {this.state.selectedOperatingDays.includes(
                                  "sun"
                                )
                                  ? this.switchOperatingDayBackground(
                                      "operating_day_toggle_sunday",
                                      true
                                    )
                                  : ls("valid", "y")}

                                <div
                                  align="right"
                                  className="w-9 h-5 bg-gray-200 rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white 
                                                                after:content-[''] after:absolute after:top-[1.5px] after:right-[17.8px] after:bg-white after:border-gray-300 after:border 
                                                                after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-orange-300"
                                ></div>
                              </div>
                            </li>
                          </ul>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 card aka listing-page for Delivery Details */}
          <div className="listing-page mt-3">
            <div className="body">
              <div className="px-12 pt-5 pb-10 mb-5">
                <div className="grid lg:grid-cols5 md:grid-cols3 gap-4 mb-5">
                  <div className="grid grid-cols-2 lg:grid-cols-3">
                    <div className="capitalize font-bold pt-3">
                      <h1>DELIVERY SETTINGS</h1>
                    </div>
                  </div>
                  <p>
                    <br />
                    There are 4 delivery options you can choose from. <br />
                    <br />
                    Please select the delivery type(s) suitable for your
                    products to minimise spoilage or unsuccessful deliveries.
                    <br /> <br />
                    Once saved, this Setting will be universally applied across
                    your shop. <br />
                    <br />
                    1. Same Day Delivery{" "}
                    <span className="ml-5 text-[#837277] text-xs">
                      : Same day order, same day receive. Delivered during
                      selected time slot.
                    </span>
                    <br />
                    2. Scheduled Delivery
                    <span className="ml-5 text-[#837277] text-xs">
                      : Able to select exact receiving date 14 days in advance.
                      Delivered during selected time slot.
                    </span>
                    <br />
                    3. Instant Delivery
                    <span className="ml-12 text-[#837277] text-xs">
                      : Agent will be sent immediately after order confirmation.{" "}
                    </span>
                    <br />
                    4. 3 - 5 Days Delivery
                    <span className="ml-5 text-[#837277] text-xs">
                      : Receiving date is an estimated window. Delivered any
                      time of the day.{" "}
                    </span>
                  </p>

                  <p className="text-xs mb-3">
                    Examples of products suitable for each type of delivery:
                    <br />
                    (for illustration, not limited to)
                  </p>

                  <img
                    src={ShipmentToProdImg}
                    alt="shipment-to-prod-mapping-sample"
                    className="max-w-[1000px] w-full"
                  />

                  <img
                    ref={this.deliveryInfoChartRef}
                    src={DeliveryOptionsInfoImg}
                    alt="delivery-options-info"
                    className="max-w-[1000px] w-full mt-12"
                  />
                </div>

                {/* info chart */}
                {/* <Accordion>
                  <AccordionSummary
                    expandIcon={<MdExpandMore size={25} />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                    className="font-bold"
                  >
                    This infochart provides an overview of how the delivery
                    options work.
                  </AccordionSummary>
                  <AccordionDetails>
                    <img
                      src={deliveryChart}
                      alt=""
                      className="xl:w-[922px] mt-10"
                    />
                  </AccordionDetails>
                </Accordion> */}

                <div className="mt-10"></div>

                {/* Same Day delivery */}
                <div className="rounded-md shadow-md bg-white mb-8 p-3 mt-10">
                  <Accordion expanded={this.state.isExpanded[1]}>
                    <AccordionSummary
                      expandIcon={<MdExpandMore size={25} />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                      className="font-bold cp"
                      onClick={() => this.changeExpansion(1)}
                    >
                      <div className="flex gap-20 items-center font-bold">
                        1. Same Day Delivery Settings
                        <div
                          className="logo-alt animate__animated animate__fadeInUp"
                          align="center"
                        >
                          <img src={LogoUParcel} alt="" className="!h-[30px]" />
                        </div>
                      </div>
                    </AccordionSummary>
                    <AccordionDetails>
                      {/* 3a unordered list for Delivery Detail Timeslots */}
                      <div className="grid lg:grid-cols5 md:grid-cols3 gap-4">
                        <div>{this.renderDeliveryOptions("SameDay")}</div>
                      </div>

                      {this.sameDayDeliveryToggle === "on" && (
                        <div className="pt-10">
                          <div className="capitalize font-bold text-black">
                            <h2>Same Day Delivery Fees Settings</h2>
                          </div>
                          {this.renderDeliveryFees("SameDay")}
                        </div>
                      )}
                      <div className="flex justify-end">
                        <button
                          className="mt-6 site-btn btn-default"
                          onClick={() => this.changeExpansion(1)}
                        >
                          <span className="button_text">Close</span>
                        </button>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                </div>

                {/* Scheduled delivery */}
                <div className="rounded-md shadow-md bg-white mb-8 p-3">
                  <Accordion expanded={this.state.isExpanded[2]}>
                    <AccordionSummary
                      expandIcon={<MdExpandMore size={25} />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                      className="font-bold cp"
                      onClick={() => this.changeExpansion(2)}
                    >
                      <div className="flex gap-20 items-center">
                        2. Scheduled Delivery Settings
                        <div
                          className="logo-alt animate__animated animate__fadeInUp"
                          align="center"
                        >
                          <img src={LogoUParcel} alt="" className="!h-[30px]" />
                        </div>
                      </div>
                    </AccordionSummary>
                    <AccordionDetails>
                      {this.renderDeliveryOptions("NextDay1")}
                      <div className="flex justify-end">
                        <button
                          className="mt-6 site-btn btn-default"
                          onClick={() => this.changeExpansion(2)}
                        >
                          <span className="button_text">Close</span>
                        </button>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                </div>

                {/* Instant delivery */}
                <div className="rounded-md shadow-md bg-white mb-8 p-3">
                  <Accordion expanded={this.state.isExpanded[0]}>
                    <AccordionSummary
                      expandIcon={<MdExpandMore size={25} />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                      className="font-bold cp"
                      onClick={() => this.changeExpansion(0)}
                    >
                      <div className="flex gap-28 items-center">
                        3. Instant Delivery Settings
                        <div
                          className="logo-alt animate__animated animate__fadeInUp"
                          align="center"
                        >
                          <img src={LogoUParcel} alt="" className="!h-[30px]" />
                        </div>
                      </div>
                    </AccordionSummary>
                    <AccordionDetails>
                      {this.renderDeliveryOptions("Instant")}
                      <div className="flex justify-end">
                        <button
                          className="mt-6 site-btn btn-default"
                          onClick={() => this.changeExpansion(0)}
                        >
                          <span className="button_text">Close</span>
                        </button>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                </div>

                {/* 3-5 days delivery */}
                {this.state.isJtAvailable && (
                  <div className="rounded-md shadow-md bg-white mb-8 p-3">
                    <Accordion expanded={this.state.isExpanded[3]}>
                      <AccordionSummary
                        expandIcon={<MdExpandMore size={25} />}
                        aria-controls="panel1-content"
                        id="panel1-header"
                        className="font-bold cp"
                        onClick={() => this.changeExpansion(3)}
                      >
                        <div className="flex gap-24 items-center">
                          4. 3 - 5 Days Delivery
                          <div
                            className="logo-alt animate__animated animate__fadeInUp"
                            align="center"
                          >
                            <img src={JTLogo} alt="" className="!h-[30px]" />
                          </div>
                        </div>
                      </AccordionSummary>
                      <AccordionDetails>
                        {this.renderDeliveryOptions("3Days")}
                        <div className="flex justify-end">
                          <button
                            className="mt-6 site-btn btn-default"
                            onClick={() => this.changeExpansion(3)}
                          >
                            <span className="button_text">Close</span>
                          </button>
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  </div>
                )}

                <div className="rounded-md shadow-md bg-white mb-8 p-3">
                  <Accordion expanded={this.state.isExpanded[4]}>
                    <AccordionSummary
                      expandIcon={<MdExpandMore size={25} />}
                      aria-controls="panel1-content"
                      id="panel1-header"
                      className="font-bold cp"
                      onClick={() => this.changeExpansion(4)}
                    >
                      {this.state.isJtAvailable
                        ? "5. Other Delivery Settings"
                        : "4. Other Delivery Settings"}
                    </AccordionSummary>
                    <AccordionDetails>
                      {this.renderDeliveryOptions("Free")}
                      <div className="flex justify-end">
                        <button
                          className="mt-6 site-btn btn-default"
                          onClick={() => this.changeExpansion(4)}
                        >
                          <span className="button_text">Close</span>
                        </button>
                      </div>
                    </AccordionDetails>
                  </Accordion>
                </div>

                <div className="grid md:grid-cols-4 xs:grid-cols-1 gap-4 mt-10">
                  <div className="md:col-span-3 xs:col-span-0">&nbsp;</div>
                  <div>
                    <div className="hide-mobile">
                      <button
                        className="mt-6 site-btn btn-default"
                        onClick={(e) => this.dataObtainedUserInput(e, "PC")}
                      >
                        <span className="button_text">
                          Save Shipping Settings
                        </span>
                      </button>
                    </div>

                    <div className="hide-pc grid grid-cols-5">
                      <div>&nbsp;</div>
                      <div className="col-span-3 mx-auto">
                        <button
                          className="mt-6 site-btn btn-default "
                          onClick={(e) =>
                            this.dataObtainedUserInput(e, "Mobile")
                          }
                        >
                          <span className="button_text">
                            Save Shipping Settings
                          </span>
                        </button>
                      </div>
                      <div>&nbsp;</div>
                    </div>
                  </div>
                  <div className="xs:col-span-0 md:col-span-1">&nbsp;</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="modal-add-address" className="modal hidden modal-addresses">
          <div className="modal-body animate__animated animate__fadeInDown">
            <h1>
              Add A New Address
              <MdOutlineClose
                onClick={() => {
                  document.getElementById("modal-add-address").style.display =
                    "none";
                  document.body.style.overflow = "scroll";
                }}
              />
            </h1>

            <div className="mt-5">
              <label
                for="pickup_contact_name_add"
                className="capitalize font-bold text-black-400 align-left"
              >
                Full Name
              </label>
              <div className="form-group my-3">
                <input
                  type="text"
                  id="pickup_contact_name_add"
                  maxlenth="100"
                  className="form-control text-left outline-0 text-black w-full"
                  required
                  value={this.state.pickup_full_name}
                  onChange={(e) => {
                    this.setState({
                      pickup_full_name: e.target.value,
                    });
                  }}
                ></input>
                <p
                  className="text-red-600 form-error hidden"
                  id="contactNameErrorMsg_add"
                >
                  {" "}
                  Please enter a Contact Name{" "}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <label
                for="pickup_contact_number_add"
                className="capitalize font-bold text-black-400 align-left"
              >
                Phone Number
              </label>
              <div className="form-group my-3">
                <input
                  type="text"
                  id="pickup_contact_number_add"
                  className="form-control"
                  maxlenth="20"
                  required
                  value={this.state.individualNumber}
                  onChange={(e) => {
                    this.setState({
                      individualNumber: e.target.value,
                    });
                  }}
                ></input>
                <p
                  className="text-red-600 form-error hidden"
                  id="contactNumberErrorMsg_add"
                >
                  {" "}
                  Please enter a valid Phone Number{" "}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <label
                className="capitalize font-bold text-black-400 align-left"
                for="pickup_postal_add"
              >
                Postal Code
              </label>
              <div className="form-group my-3">
                <input
                  type="number"
                  id="pickup_postal_add"
                  className="form-control"
                  maxlenth="200"
                  required
                ></input>
                <p
                  className="text-red-600 form-error hidden"
                  id="postalCodeErrorMsg_add"
                >
                  {" "}
                  Please enter a valid Postal Code
                </p>
              </div>
            </div>
            <div className="mt-5">
              <label
                className="capitalize font-bold text-black-400 align-left"
                for="pickup_detailed_address_add"
              >
                Detailed Address
              </label>
              <div className="form-group my-3">
                <input
                  type="text"
                  id="pickup_detailed_address_add"
                  className="form-control"
                  maxlenth="20"
                  required
                ></input>
                <p
                  className="text-red-600 form-error hidden"
                  id="addressErrorMsg_add"
                >
                  {" "}
                  Please enter a valid Address{" "}
                </p>
              </div>
            </div>
            <div className="mt-5">
              {/* Change label values based on state.pickupUnitNumToggle (i.e. whether toggle is checked or not) */}
              {/* For Add Address, default value is 'Disabled' */}
              {this.state.pickupUnitNumToggle === "on" ? (
                <label
                  className="capitalize font-bold text-black-400 align-left"
                  for="pickup_unit_no_add"
                >
                  Unit No
                  <span className="text-gray-400">&nbsp; (Enabled)</span>
                </label>
              ) : (
                <label
                  className="capitalize font-bold text-black-400 align-left"
                  for="pickup_unit_no_add"
                >
                  Unit No
                  <span className="text-gray-400">&nbsp; (Disabled)</span>
                </label>
              )}

              <div>
                <label className="switch mx-1">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      this.handleChange(e, "pickupUnitNumToggle")
                    }
                    id="selector_unit_no"
                  />
                  <span className="round bg-gray-400 slider"></span>
                </label>
              </div>

              <div className="form-group my-3">
                {this.state.pickupUnitNumToggle === "on" ? (
                  <input
                    type="text"
                    id="pickup_unit_no_add"
                    className="form-control"
                    maxlenth="20"
                    value={this.state.unitNo}
                    onChange={(e) => {
                      this.setState({
                        unitNo: e.target.value,
                      });
                    }}
                  ></input>
                ) : (
                  <input
                    type="text"
                    id="pickup_unit_no_add"
                    className="form-control"
                    maxlenth="0"
                    disabled={true}
                    style={{ "background-color": "#efefef" }}
                  ></input>
                )}
              </div>
            </div>
            <div className="grid grid-cols-8 mt-7">
              <input
                type="checkbox"
                id="newAddressDefault_checkbox"
                onChange={(e) => this.handleChange(e, "newAddress_checkbox")}
                className="col-span-1 py-8"
              />
              <div className="col-span-7">
                <p className="capitalize text-sm align-left ">
                  Set as default address
                </p>
              </div>
            </div>

            <div className="mt-10">
              <div className="my-3 grid grid-cols-2">
                <button
                  className="site-btn btn-border-primary align-left xs:mr-4 md:mr-10"
                  id="btn_add_address_cancel"
                  onClick={() => {
                    document.getElementById("modal-add-address").style.display =
                      "none";
                    document.body.style.overflow = "scroll";
                  }}
                >
                  <span
                    className="button_text xs:mx-2 md:mx-5"
                    id="label_add_address_save"
                  >
                    &nbsp;Cancel&nbsp;
                  </span>
                </button>
                <button
                  className="site-btn btn-default xs:ml-4 md:ml-10"
                  id="btn_add_address_save"
                  onClick={(e) => this.savePickupInfo(e, "add")}
                >
                  <span
                    className="button_text xs:mx-2 md:mx-5"
                    id="label_add_address_save"
                  >
                    &nbsp;Save&nbsp;
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div id="modal-edit-address" className="modal hidden modal-addresses">
          <div className="modal-body animate__animated animate__fadeInDown">
            <h1>
              Edit Address
              <MdOutlineClose
                onClick={() => {
                  document.getElementById("modal-edit-address").style.display =
                    "none";
                  document.body.style.overflow = "scroll";
                }}
              />
            </h1>

            <div className="pt-5">
              <label
                id="label_contact_name"
                for="pickup_contact_name_edit"
                className="capitalize font-bold text-black-400 align-left"
              >
                Full Name
              </label>
              <div className="form-group my-3">
                <input
                  type="text"
                  id="pickup_contact_name_edit"
                  maxlenth="100"
                  className="form-control text-left outline-0 text-black w-full"
                  value={this.state.pickup_full_name}
                  onChange={(e) => {
                    this.setState({
                      pickup_full_name: e.target.value,
                    });
                  }}
                ></input>
                <p
                  className="text-red-600 form-error hidden"
                  id="contactNameErrorMsg"
                >
                  {" "}
                  Please enter a Contact Name{" "}
                </p>
              </div>
            </div>
            <div className="pt-5">
              <label
                id="label_contact_number"
                for="pickup_contact_number_edit"
                className="capitalize font-bold text-black-400 align-left"
              >
                Phone Number
              </label>
              <div className="form-group my-3">
                <input
                  type="text"
                  id="pickup_contact_number_edit"
                  className="form-control"
                  maxlenth="20"
                  required
                  value={this.state.contactNumber}
                  onChange={(e) => {
                    this.setState({
                      contactNumber: e.target.value,
                    });
                  }}
                ></input>
                <p
                  className="text-red-600 form-error hidden align-left"
                  id="contactNumberErrorMsg_edit"
                >
                  {" "}
                  Please enter a valid Phone Number{" "}
                </p>
              </div>
            </div>
            <div className="pt-5">
              <label
                className="capitalize font-bold text-black-400 align-left"
                for="pickup_postal_edit"
              >
                Postal Code
              </label>
              <div className="form-group my-3">
                <input
                  type="number"
                  id="pickup_postal_edit"
                  className="form-control"
                  maxlenth="200"
                  required
                  value={this.state.ppostalCode}
                  onChange={(e) => {
                    this.setState({
                      ppostalCode: e.target.value,
                    });
                  }}
                ></input>
                <p
                  className="text-red-600 form-error hidden align-left"
                  id="postalCodeErrorMsg_edit"
                >
                  {" "}
                  Please enter a valid Postal Code
                </p>
              </div>
            </div>
            <div className="pt-5">
              <label
                className="capitalize font-bold text-black-400 align-left"
                for="pickup_detailed_address_edit"
              >
                Detailed Address
              </label>
              <div className="form-group my-3">
                <input
                  type="text"
                  id="pickup_detailed_address_edit"
                  className="form-control"
                  maxlenth="20"
                  required
                  value={this.state.addressOnly}
                  onChange={(e) => {
                    this.setState({
                      addressOnly: e.target.value,
                    });
                  }}
                ></input>
                <p
                  className="text-red-600 form-error hidden"
                  id="addressErrorMsg_edit"
                >
                  {" "}
                  Please enter a valid Address{" "}
                </p>
              </div>
            </div>
            <div className="pt-5">
              {/* Change label values based on state.pickupUnitNumToggle (i.e. whether toggle is checked or not) */}
              {this.state.pickupUnitNumToggle === "on" ? (
                <label
                  className="capitalize font-bold text-black-400 align-left"
                  for="pickup_unit_no_edit"
                >
                  Unit No
                  <span className="text-gray-400">&nbsp; (Enabled)</span>
                </label>
              ) : (
                <label
                  className="capitalize font-bold text-black-400 align-left"
                  for="pickup_unit_no_edit"
                >
                  Unit No
                  <span className="text-gray-400">&nbsp; (Disabled)</span>
                </label>
              )}

              <div>
                <label className="switch mx-1">
                  <input
                    type="checkbox"
                    checked={
                      this.state.pickupUnitNumToggle === "on" ? true : false
                    }
                    onChange={(e) =>
                      this.handleChange(e, "pickupUnitNumToggle")
                    }
                    id="selector_unit_no"
                  />
                  <span className="round bg-gray-400 slider"></span>
                </label>
              </div>

              <div className="form-group my-3">
                {this.state.pickupUnitNumToggle === "on" ? (
                  <input
                    type="text"
                    id="pickup_unit_no_edit"
                    className="form-control"
                    maxlenth="20"
                    value={this.state.unitNo}
                    onChange={(e) => {
                      this.setState({
                        unitNo: e.target.value,
                      });
                    }}
                  ></input>
                ) : (
                  <input
                    type="text"
                    id="pickup_unit_no_edit"
                    className="form-control"
                    maxlenth="0"
                    disabled={true}
                    value=""
                    style={{ "background-color": "#efefef" }}
                  ></input>
                )}
              </div>
            </div>

            <div className="mt-10">
              <div className="my-3 grid grid-cols-2">
                <button
                  className="site-btn btn-border-primary align-left xs:mr-4 md:mr-10"
                  onClick={
                    //     () => {
                    //     document.getElementById("modal-edit-address").style.display = "none";
                    // }

                    () => {
                      var input_fullName = document.getElementById(
                        "pickup_contact_name_edit"
                      );
                      var input_phoneNumber = document.getElementById(
                        "pickup_contact_number_edit"
                      );
                      var input_postalCode =
                        document.getElementById("pickup_postal_edit");
                      var input_address = document.getElementById(
                        "pickup_detailed_address_edit"
                      );
                      var input_unitNo = document.getElementById(
                        "pickup_unit_no_edit"
                      );

                      // reset all input placeholders
                      if (input_fullName) input_fullName.placeholder = "";
                      if (input_phoneNumber) input_phoneNumber.placeholder = "";
                      if (input_postalCode) input_postalCode.placeholder = "";
                      if (input_address) input_address.placeholder = "";
                      if (input_unitNo) input_unitNo.placeholder = "";

                      // reset all input values
                      if (input_fullName) input_fullName.value = "";
                      if (input_phoneNumber) input_phoneNumber.value = "";
                      if (input_postalCode) input_postalCode.value = "";
                      if (input_address) input_address.value = "";
                      if (input_unitNo) {
                        input_unitNo.value = "";
                      }
                    }
                  }
                >
                  <span className="button_text">Clear All</span>
                </button>
                <button
                  className="site-btn btn-default xs:ml-4 md:ml-10"
                  id="btn_edit_address_save"
                  onClick={(e) => this.savePickupInfo(e, "edit")}
                >
                  <span className="button_text" id="label_edit_address_save">
                    &nbsp;Save&nbsp;
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
}

export default ShippingSettings;

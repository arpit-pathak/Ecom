
import {
    TbCertificate,
} from 'react-icons/tb';

import pendingActiveIcon from "../assets/order/pending_active.svg"
import confirmOrderActiveIcon from "../assets/order/confirmed_active.svg"
import confirmOrderInactiveIcon from "../assets/order/confirmed_inactive.svg"
import deliveredActiveIcon from "../assets/order/delivered_active.svg"
import deliveredInactiveIcon from "../assets/order/delivered_inactive.svg"
import shippedActiveIcon from "../assets/order/shipped_active.svg"
import shippedInactiveIcon from "../assets/order/shipped_inactive.svg"
import refundRequestedIcon from "../assets/order/refund_requested.svg"
import refundAcceptedActiveIcon from "../assets/order/refund_approved.svg"
import refundCompleteActiveIcon from "../assets/order/refund_complete.svg"
import refundRejectedIcon from "../assets/order/refund_rejected.svg"
import collectionFailedActiveIcon from "../assets/order/failed_collection_delivery.svg"
import cancelledIcon from "../assets/order/cancelled.png";
import pendingPickupIcon from "../assets/order/pending_pickup.png";
import receivedIcon from "../assets/order/order_received.png"
import rescheduledIcon from "../assets/order/delivery_rescheduled.png"
import returnRequestedIcon from "../assets/order/return_requested.png"
import returnedIcon from "../assets/order/returned.png"
import returnRejectedIcon from "../assets/order/return_rejected.png"
import returnAcceptIcon from "../assets/order/return_approved.png"
import pendingPickupInactiveIcon from "../assets/order/pending_pickup_inactive.png";
import onDisputeIcon from "../assets/order/on_dispute.png";

import { ORDER_CONSTANTS } from './order_status';

export const ProgressLabels = [
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_PENDING_CONFIRMATION,
        name: "Pending Confirmation",
        bgColor: "banner-one",
        icon: <img src={pendingActiveIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <TbCertificate className="icon-one" />,
        dashColor: "path-color-one"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_ORDER_CONFIRMED,
        name: "Order Confirmed",
        bgColor: "banner-two",
        icon: <img src={confirmOrderActiveIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={confirmOrderInactiveIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-two"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_ORDER_SHIPPED,
        name: "Shipped",
        bgColor: "banner-three",
        icon: <img src={shippedActiveIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={shippedInactiveIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-three"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_DELIVERED,
        name: "Delivered",
        bgColor: "banner-four",
        icon: <img src={deliveredActiveIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={deliveredInactiveIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-delivered"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_CANCELLED,
        name: "Cancelled",
        bgColor: "banner-cancelled",
        icon: <img src={cancelledIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={cancelledIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-cancelled"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_ORDER_PENDING_PICKUP,
        name: "Pending Pickup",
        bgColor: "banner-received",
        icon: <img src={pendingPickupIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={pendingPickupInactiveIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-received"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_ORDER_RETURN_REQUESTED,
        name: "Return Requested",
        bgColor: "banner-return",
        icon: <img src={returnRequestedIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={returnRequestedIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-return"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_ORDER_COLLECTION_FAILED,
        name: "Collection Failed",
        bgColor: "banner-failed",
        icon: <img src={collectionFailedActiveIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={collectionFailedActiveIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-failed"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_ORDER_UNDELIVERED,
        name: "Undelivered",
        bgColor: "banner-failed",
        icon: <img src={collectionFailedActiveIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={collectionFailedActiveIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-failed"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_ORDER_DELIVERY_FAILED,
        name: "Delivery Failed",
        bgColor: "banner-failed",
        icon: <img src={collectionFailedActiveIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={collectionFailedActiveIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-failed"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_ORDER_RECEIVED,
        name: "Received",
        bgColor: "banner-received",
        icon: <img src={receivedIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={receivedIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-received"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_ORDER_DELIVERY_RESCHEDULED,
        name: "Delivery Rescheduled",
        bgColor: "banner-four",
        icon: <img src={rescheduledIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={rescheduledIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-rescheduled"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_RETURNED,
        name: "Returned",
        bgColor: "banner-return",
        icon: <img src={returnedIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={returnedIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-return"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_ORDER_REFUND_REQUESTED,
        name: "Refund Requested",
        bgColor: "banner-cancelled",
        icon: <img src={refundRequestedIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={refundRequestedIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-cancelled"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_ORDER_RETURN_REJECT,
        name: "Return Rejected",
        bgColor: "banner-return",
        icon: <img src={returnRejectedIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={returnRejectedIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-return"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_ORDER_RETURN_ACCEPTED,
        name: "Return Accepted",
        bgColor: "banner-return",
        icon: <img src={returnAcceptIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={returnAcceptIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-return"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_ORDER_REFUND_REJECT,
        name: "Refund Rejected",
        bgColor: "banner-cancelled",
        icon: <img src={refundRejectedIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={refundRejectedIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-cancelled"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_REFUNDED,
        name: "Refund Accepted",
        bgColor: "banner-refund-approved",
        icon: <img src={refundAcceptedActiveIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={refundAcceptedActiveIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-refund"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_ORDER_REFUND_COMPLETED,
        name: "Refund Complete",
        bgColor: "banner-refund-complete",
        icon: <img src={refundCompleteActiveIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={refundCompleteActiveIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-refund-complete"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_DISPUTE,
        name: "On Dispute",
        bgColor: "banner-dispute",
        icon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-dispute"
    },

    //new
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_ENROUTE_TO_HUB,
        name: "Enroute to Hub",
        bgColor: "banner-three",
        icon: <img src={shippedActiveIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={shippedActiveIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-three"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_ARRIVED_AT_HUB,
        name: "Arrived at Hub",
        bgColor: "banner-three",
        icon: <img src={shippedActiveIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={shippedActiveIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-three"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_RETURNED_TO_HUB,
        name: "Returned to Hub",
        bgColor: "returned-to-hub",
        icon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-dispute"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_SCHEDULED_RTS,
        name: "Scheduled RTS",
        bgColor: "banner-dispute",
        icon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-dispute"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_OUT_FOR_RTS,
        name: "Out for RTS",
        bgColor: "banner-dispute",
        icon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-dispute"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_FAILED_RTS,
        name: "Failed RTS",
        bgColor: "banner-dispute",
        icon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-dispute"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_PARCEL_DISPOSED,
        name: "Parcel Disposed",
        bgColor: "banner-dispute",
        icon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-dispute"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_PARCEL_LEAKAGE,
        name: "Parcel Leakage",
        bgColor: "banner-dispute",
        icon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-dispute"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_PARCEL_LOST,
        name: "Parcel Lost",
        bgColor: "banner-dispute",
        icon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-dispute"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_PARCEL_DAMAGED,
        name: "Parcel Damaged",
        bgColor: "banner-dispute",
        icon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={onDisputeIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-dispute"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_OUT_FOR_DELIVERY,
        name: "Out For Delivery",
        bgColor: "banner-three",
        icon: <img src={shippedActiveIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={shippedActiveIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-three"
    },
    {
        id: ORDER_CONSTANTS.GENERALSTATUS_PAID,
        name: "Paid",
        bgColor: "banner-refund-complete",
        icon: <img src={refundCompleteActiveIcon} className="h-7 w-7" alt={''} />,
        inactiveIcon: <img src={refundCompleteActiveIcon} className="h-7 w-7" alt={''} />,
        dashColor: "path-color-refund-complete"
    },
];
import { ORDER_CONSTANTS } from '../../../../../constants/order_status.js';

const cancelStatus = [
    ORDER_CONSTANTS.GENERALSTATUS_PENDING_CONFIRMATION,
    ORDER_CONSTANTS.GENERALSTATUS_ORDER_COLLECTION_FAILED,
    ORDER_CONSTANTS.GENERALSTATUS_ORDER_CONFIRMED,
    ORDER_CONSTANTS.GENERALSTATUS_DISPUTE,
    ORDER_CONSTANTS.GENERALSTATUS_ORDER_DELIVERY_FAILED
];

const confirmStatus = [
    ORDER_CONSTANTS.GENERALSTATUS_PENDING_CONFIRMATION,
    ORDER_CONSTANTS.GENERALSTATUS_ORDER_COLLECTION_FAILED,
    ORDER_CONSTANTS.GENERALSTATUS_ORDER_DELIVERY_FAILED,
]

const refundStatus = [
    ORDER_CONSTANTS.GENERALSTATUS_ORDER_RETURN_REQUESTED,
    ORDER_CONSTANTS.GENERALSTATUS_ORDER_RETURN_ACCEPTED,
    ORDER_CONSTANTS.GENERALSTATUS_ORDER_REFUND_REQUESTED,
]

const refundPaymentStatus = [
    ORDER_CONSTANTS.GENERALSTATUS_PAYMENT_AUTHORIZED,
    ORDER_CONSTANTS.GENERALSTATUS_PAID,
]

const disputePaymentStatus = [
    ORDER_CONSTANTS.GENERALSTATUS_PAYMENT_AUTHORIZED,
    ORDER_CONSTANTS.GENERALSTATUS_PAID,
]

const disputeStatus = [
    ORDER_CONSTANTS.GENERALSTATUS_CANCELLED,
    ORDER_CONSTANTS.GENERALSTATUS_ORDER_REFUND_COMPLETED,
]

const waybillExcludeStatus = [
    ORDER_CONSTANTS.GENERALSTATUS_CANCELLED
]


export const isRefundEligible = (order) => {
    return order ?
        (refundStatus.includes(order.delivery_status_id) &&
            refundPaymentStatus.includes(order.payment_status_id))
        : false;
};


export const isDisputeEligible = (order) => {
    return order ?
        (disputePaymentStatus.includes(order.payment_status_id) &&
            !disputeStatus.includes(order.delivery_status_id))
        : false;
};


export const isConfirmEligible = (order) => {
    return confirmStatus.includes(order.delivery_status_id);
};

export const isCancelEligible = (order) => {
    return cancelStatus.includes(order.delivery_status_id);
}

export const isManualRefundEligible = (order) => {
    return order.manual_refund === "Y";
}

export const isWaybillEligible = (order) => {
    return order ?
        (!waybillExcludeStatus.includes(order.delivery_status_id))
        : false;
};

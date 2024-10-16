import { useState } from "react";
import Select from "react-select";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls.js";
import { Modal } from '../GenericComponents.js';


export default function BuyerCancelOrderPopup({
    closeCancelOrderPopup,
    toggleCancelOrder,
    processCancelOrder,
    orderId,
    user,
}) {
    const [isCancelOrder, setIsCancelOrder] = useState(false)
    const [isCancelReasonsLoading, setIsCancelReasonsLoading] = useState(false)
    const [cancelReasons, setCancelReasons] = useState(false)
    const [selectedCancelReason, setSelectedCancelReason] = useState(null)
    const [cancelValidationMsg, setCancelValidationMsg] = useState("")
    const [cancelComment, setCancelComment] = useState("")
    const [isCancelOrderLoading, setIsCancelOrderLoading] = useState(false)


    const processCancelOrderReasons = (res, api) => {
        var cancelReasons = res.data.data.map(e => {
            return { ...e, value: e.reason, label: e.reason };
        })
        setIsCancelReasonsLoading(false)
        setCancelReasons(cancelReasons)
    }


    const onCancelOrder = () => {
        setIsCancelOrder(true)
        setIsCancelReasonsLoading(true)

        let fd = new FormData();

        BuyerApiCalls(
            fd,
            Apis.fetchCancelOrderReasons,
            "GET",
            { "Authorization": "Bearer " + user.access, },
            processCancelOrderReasons
        );
    }

    const onOrderCanceled = (res, api) => {
        handleCancelClose();
        processCancelOrder(res, api)
    }

    const updateCancellation = () => {
        if (selectedCancelReason) {
            setIsCancelOrderLoading(true)

            let fd = new FormData();

            fd.append("id_order", orderId);
            fd.append("cancel_reason_id", selectedCancelReason.id_cancellation);
            fd.append("remarks", cancelComment);

            BuyerApiCalls(
                fd,
                Apis.cancelOrder,
                "POST",
                { "Authorization": "Bearer " + user.access, },
                onOrderCanceled
            );
        } else {
            setCancelValidationMsg("Please select a reason")
        }
    }

    const handleCancelClose = () => {
        setIsCancelOrder(false)
        setCancelComment("")
        setCancelValidationMsg("")
        setIsCancelOrderLoading(false)
        closeCancelOrderPopup()
    }

    return (
        <>
            <Modal
                width={isCancelOrder && "w-5/12 max-sm:w-3/4"}
                open={toggleCancelOrder}
                children={!isCancelOrder ? <div>
                    <p className='text-lg font-semibold mb-3'>Order Cancellation</p>
                    <hr />
                    <p className='text-sm my-4 pr-7 mb-4'>Are you sure to cancel this order ?
                    </p>
                    <div className='flex justify-end mt-10'>
                        <button className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5'
                            onClick={onCancelOrder}>
                            Yes
                        </button>
                        <button className='cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35] h-8 w-20'
                            onClick={closeCancelOrderPopup}>
                            No
                        </button>
                    </div>
                </div> : <div>
                    <p className='text-lg font-semibold mb-3'>Cancel Delivery</p>
                    <hr />
                    {isCancelReasonsLoading ?
                        <div className='h-20 my-5'>
                            <Skeleton height={25} width={150} className='mb-4' />
                            <Skeleton height={16} width={200} />
                        </div> : <>
                            <p className='text-sm my-4 font-medium mb-2'>Select a reason for cancelling</p>
                            <Select id="cancelReasons" name="cancelReasons" options={cancelReasons}
                                placeholder="Select a reason"
                                onChange={e => {
                                    setSelectedCancelReason(e);
                                    setCancelValidationMsg("");
                                }
                                }
                            />

                            <p className='text-sm mb-3 font-medium mt-6'>Comments</p>
                            <textarea rows="4" value={cancelComment} id="orderComment"
                                className='w-full mb-12 text-sm border border-[#bdbdbd] rounded p-2'
                                onChange={(e) => setCancelComment(e.target.value)} />
                            <p className='text-red-600 mb-3 text-sm'>{cancelValidationMsg}</p>
                            <hr />
                            <div className='flex justify-end mt-4'>
                                <button
                                    className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5 hover:bg-amber-500
                             disabled:opacity-50  disabled:cursor-default'
                                    onClick={updateCancellation}
                                    disabled={isCancelReasonsLoading || isCancelOrderLoading}
                                >
                                    Cancel
                                </button>
                                <button className='cp text-center rounded-md border-[#f5ab35] border-2  disabled:border-[#FFD086]
                                disabled:cursor-default bg-white text-[#f5ab35] h-8 w-20'
                                    onClick={handleCancelClose}
                                    disabled={isCancelReasonsLoading || isCancelOrderLoading}
                                >
                                    Close
                                </button>
                            </div>
                        </>}
                </div>} />
        </>);
}
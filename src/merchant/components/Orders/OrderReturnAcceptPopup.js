import { useState, useEffect } from "react";
import 'react-loading-skeleton/dist/skeleton.css'
import { ApiCalls, Apis } from '../../utils/ApiCalls.js';
import { Modal } from '../../../customer/components/GenericComponents.js';

const contentClass = 'text-sm text-[#828282]';
const labelClass = 'text-sm font-semibold text-[#828282] whitespace-nowrap';

export default function ReturnAcceptOrderPopup({
    closeReturnAcceptOrderPopup,
    toggleReturnAcceptOrder,
    processReturnAcceptOrder,
    order,
    user,
    type
}) {
    const [isReturnAcceptOrderLoading, setIsReturnAcceptOrderLoading] = useState(false)
    const [isAcceptConfirmed, setIsAcceptConfirmed] = useState(false)
    const [refundAmt, setRefundAmt] = useState("Please enter amount")

    useEffect(()=>{
        setRefundAmt(order.formatted_total_paid)
    }, [order.formatted_total_paid])

    const onOrderReturnAccepted = (res, api) => {
        handleReturnAcceptClose();
        processReturnAcceptOrder(res, api)
    }

    const updateReturnAccept = () => {
        setIsReturnAcceptOrderLoading(true)

        let fd = new FormData();

        fd.append("id_order", order.id_order);
        if(parseFloat(order.formatted_total_paid) !== refundAmt){
            fd.append("partial_refund_amount", refundAmt)
        }

        ApiCalls(fd,
            Apis.acceptRefundRequest,
            "POST",
            { "Authorization": "Bearer " + user.access, },
            onOrderReturnAccepted
        );
    }

    const handleReturnAcceptClose = () => {
        setIsAcceptConfirmed(false)
        setIsReturnAcceptOrderLoading(false)
        closeReturnAcceptOrderPopup()
    }

    const openAcceptConfirm = () =>{
        setIsAcceptConfirmed(true)
    }

    const onChangeRefundAmt = (e) => {
        let value = e.target.value
        if(value <= parseFloat(order.formatted_total_paid))  setRefundAmt(value)
    }

    return (
        <>
            <Modal
                width="w-5/12"
                open={toggleReturnAcceptOrder}
                children={!isAcceptConfirmed ?
                    <div>
                        <p className='text-lg font-semibold mb-3'>Approve Refund</p>
                        <hr />

                        <div className="flex gap-3 my-4 mb-2">
                            <p className={labelClass}>Reason :</p>
                            <p className={contentClass}>{type=== "Return" ?
                            order?.buyer_return_request?.reason_id__reason :  order?.buyer_refund_request?.reason_id__reason}</p>
                        </div>
                        <div className="flex gap-3 my-4 mb-2">
                            <p className={labelClass}>Remarks :</p>
                            <p className={contentClass}>{(type=== "Return" ? 
                            order?.buyer_return_request?.remarks : order?.buyer_refund_request?.remarks) ?? "NA"}</p>
                        </div>



                        <p className='text-sm mt-8 mb-4'>Are you sure to proceed ?
                        </p>
                        <hr />
                        <div className='flex justify-end mt-4'>
                            <button
                                className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5 hover:bg-amber-500
                             disabled:opacity-50  disabled:cursor-default'
                                // onClick={updateReturnAccept}
                                onClick={openAcceptConfirm}
                            >
                                Yes
                            </button>
                            <button className='cp text-center rounded-md border-[#f5ab35] border-2 disabled:border-[#FFD086]
                                 disabled:cursor-default bg-white text-[#f5ab35] h-8 w-20'
                                onClick={handleReturnAcceptClose}
                            >
                                No
                            </button>
                        </div>

                    </div> :
                    <div>
                        <p className='text-lg font-semibold mb-3'>Approve Refund</p>
                        <hr />

                        <p className="text-sm font-semibold my-5">Offer full/partial refund</p>

                        <p className={labelClass}>Return & Refund Request</p>
                        <div className="flex my-5 gap-5">
                            <p className= 'text-sm text-[#828282] whitespace-nowrap'>Refund Amount</p>
                            <p className={labelClass}>$ {order.formatted_total_paid}</p>
                        </div>

                        <p className="text-sm font-semibold mt-11 mb-6">You may choose to offer partial refund</p>
                        <div className="flex my-5 gap-5 items-center">
                            <p className={labelClass}>Refund Amount</p>
                            <input
                                id="refundAmt"
                                name="refundAmt"
                                type="text"
                                value={refundAmt}
                                onChange={onChangeRefundAmt}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 sm:text-sm"
                            />
                        </div>

                        <hr />
                        <div className='flex justify-end mt-4'>
                            <button
                                className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5 hover:bg-amber-500
                             disabled:opacity-50  disabled:cursor-default font-sm'
                                onClick={updateReturnAccept}
                                disabled={isReturnAcceptOrderLoading}
                            >
                                Approve
                            </button>
                            <button className='cp text-center rounded-md border-[#f5ab35] border-2 disabled:border-[#FFD086]
                                 disabled:cursor-default bg-white text-[#f5ab35] h-8 w-20 font-sm'
                                onClick={handleReturnAcceptClose}
                                disabled={isReturnAcceptOrderLoading}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                }
            />
        </>);
}
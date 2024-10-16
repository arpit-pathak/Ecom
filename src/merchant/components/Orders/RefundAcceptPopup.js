import { useState } from "react";
import 'react-loading-skeleton/dist/skeleton.css'
import { ApiCalls, Apis } from '../../utils/ApiCalls.js';
import { Modal } from '../../../customer/components/GenericComponents.js';

const contentClass = 'text-sm text-[#828282]';
const labelClass = 'text-sm font-semibold text-[#828282] whitespace-nowrap';

export default function RefundAcceptOrderPopup({
    closeRefundAcceptOrderPopup,
    toggleRefundAcceptOrder,
    processRefundAcceptOrder,
    order,
    user,
}) {
    const [isRefundAcceptOrderLoading, setIsRefundAcceptOrderLoading] = useState(false)

    const onOrderRefundAccepted = (res, api) => {
        handleRefundAcceptClose();
        processRefundAcceptOrder(res, api)
    }

    const updateRefundAccept = () => {
        setIsRefundAcceptOrderLoading(true)

        let fd = new FormData();

        fd.append("id_order", order.id_order);

        ApiCalls(fd,
            Apis.acceptRefundRequest,
            "POST",
            { "Authorization": "Bearer " + user.access, },
            onOrderRefundAccepted
        );
    }

    const handleRefundAcceptClose = () => {
        setIsRefundAcceptOrderLoading(false)
        closeRefundAcceptOrderPopup()
    }

    return (
        <>
            <Modal
                width="w-5/12"
                open={toggleRefundAcceptOrder}
                children={
                    <div>
                        <p className='text-lg font-semibold mb-3'>Refund Request</p>
                        <hr />

                        <div className="flex gap-3 my-4 mb-2">
                            <p className={labelClass}>Reason :</p>
                            <p className={contentClass}>{order?.buyer_refund_request?.reason_id__reason}</p>
                        </div>
                        <div className="flex gap-3 my-4 mb-2">
                            <p className={labelClass}>Remarks :</p>
                            <p className={contentClass}>{order?.buyer_refund_request?.remarks ?? "NA"}</p>
                        </div>



                        <p className='text-sm mt-8 mb-4'>Are you sure to proceed ?
                        </p>
                        <hr />
                        <div className='flex justify-end mt-4'>
                            <button
                                className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5 hover:bg-amber-500
                             disabled:opacity-50  disabled:cursor-default'
                                onClick={updateRefundAccept}
                                disabled={isRefundAcceptOrderLoading}
                            >
                                Accept
                            </button>
                            <button className='cp text-center rounded-md border-[#f5ab35] border-2 disabled:border-[#FFD086]
                                 disabled:cursor-default bg-white text-[#f5ab35] h-8 w-20'
                                onClick={handleRefundAcceptClose}
                                disabled={isRefundAcceptOrderLoading}
                            >
                                Close
                            </button>
                        </div>

                    </div>
                }
            />
        </>);
}
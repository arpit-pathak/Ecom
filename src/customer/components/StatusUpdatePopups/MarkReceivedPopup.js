import { useState } from "react";
import 'react-loading-skeleton/dist/skeleton.css'
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls.js";
import { Modal } from '../GenericComponents.js';


export default function MarkReceivedOrderPopup({
    closeMarkReceivedOrderPopup,
    toggleMarkReceivedOrder,
    processMarkReceivedOrder,
    orderId,
    user,
}) {
    const [isMarkReceivedOrderLoading, setIsMarkReceivedOrderLoading] = useState(false)


    const onOrderMarkReceived = (res, api) => {
        setIsMarkReceivedOrderLoading(false)
        closeMarkReceivedOrderPopup()
        processMarkReceivedOrder(res, api)
    }

    const updateReceived = () => {
        setIsMarkReceivedOrderLoading(true)

        let fd = new FormData();

        fd.append("id_order", orderId);

        BuyerApiCalls(
            fd,
            Apis.markReceivedOrder,
            "POST",
            { "Authorization": "Bearer " + user.access, },
            onOrderMarkReceived
        );
    }

    return (
        <>
            <Modal
                width="w-5/12 max-sm:w-3/4"
                open={toggleMarkReceivedOrder}
                children={<div>
                    <p className='text-lg font-semibold mb-3'>Order Mark Received</p>
                    <hr />
                    <p className='text-sm my-4 pr-7 mb-4'>Are you sure to update this order status to received ?
                    </p>
                    <p className='text-xs font-bold mb-5'>Note: Cannot be returned once marked as received
                    </p>
                    <hr />
                    <div className='flex justify-end mt-5'>
                        <button className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 px-3 mr-5'
                        disabled={isMarkReceivedOrderLoading}
                            onClick={updateReceived}>
                            Mark Received
                        </button>
                        <button className='cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35] h-8 w-20'
                            onClick={closeMarkReceivedOrderPopup}
                            disabled={isMarkReceivedOrderLoading}>
                            Close
                        </button>
                    </div>
                </div>}
            />
        </>
    );
}
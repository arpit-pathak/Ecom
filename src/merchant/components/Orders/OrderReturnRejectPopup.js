import { useState } from "react";
import Select from "react-select";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { ApiCalls, Apis } from '../../utils/ApiCalls.js';
import { Modal } from '../../../customer/components/GenericComponents.js';

import addImageIcon from "../../../assets/seller/img_add.svg"
import {
    MdOutlineClose,
} from 'react-icons/md';

const contentClass = 'text-sm text-[#828282]';
const labelClass = 'w-16 text-sm font-semibold text-[#828282] whitespace-nowrap';

export default function ReturnRejectOrderPopup({
    closeReturnRejectOrderPopup,
    toggleReturnRejectOrder,
    processReturnRejectOrder,
    order,
    user,
    type
}) {
    const [isReturnRejectOrder, setIsReturnRejectOrder] = useState(false)
    const [isReturnRejectReasonsLoading, setIsReturnRejectReasonsLoading] = useState(false)
    const [returnRejectReasons, setReturnRejectReasons] = useState(false)
    const [selectedReturnRejectReason, setSelectedReturnRejectReason] = useState(null)
    const [returnRejectValidationMsg, setReturnRejectValidationMsg] = useState("")
    const [returnRejectComment, setReturnRejectComment] = useState("")
    const [isReturnRejectOrderLoading, setIsReturnRejectOrderLoading] = useState(false)
    const [proofImages, setProofImages] = useState([])


    const processReturnRejectOrderReasons = (res, api) => {
        var returnRejectReasons = res.data.data.map(e => {
            return { ...e, value: e.reason, label: e.reason };
        })
        setIsReturnRejectReasonsLoading(false)
        setReturnRejectReasons(returnRejectReasons)
    }


    const onReturnRejectOrder = () => {
        setIsReturnRejectOrder(true)
        setIsReturnRejectReasonsLoading(true)

        let fd = new FormData();

        ApiCalls(fd,
            Apis.fetchReturnRejectReasons,
            "GET",
            { "Authorization": "Bearer " + user.access, },
            processReturnRejectOrderReasons
        );
    }

    const onOrderReturnRejected = (res, api) => {
        handleReturnRejectClose();
        processReturnRejectOrder(res, api)
    }

    const updateReturnReject = () => {
        if (selectedReturnRejectReason && proofImages.length) {
            setIsReturnRejectOrderLoading(true)

            let fd = new FormData();

            let len = proofImages.length;
            fd.append("id_order", order.id_order);
            fd.append("reason_id", selectedReturnRejectReason.id_cancellation);
            fd.append("remarks", returnRejectComment);

            for (let i = 0; i < len; i++) {
                fd.append("product_image[]", proofImages[i].file);
            }

            ApiCalls(fd,
                Apis.rejectRefundRequest,
                "POST",
                { "Authorization": "Bearer " + user.access, },
                onOrderReturnRejected
            );
        } else {
            setReturnRejectValidationMsg("Reason and proof are mandatory")
        }
    }

    const handleReturnRejectClose = () => {
        setIsReturnRejectOrder(false)
        setReturnRejectComment("")
        setReturnRejectValidationMsg("")
        setIsReturnRejectOrderLoading(false)
        closeReturnRejectOrderPopup()
    }

    const handleImageSelection = (e) => {
        if (e.target.files && e.target.files[0]) {
            var imgFile = URL.createObjectURL(e.target.files[0]);
            var currFile = {
                file: e.target.files[0],
                img: imgFile
            }
            setProofImages([...proofImages, currFile]);
        }
    }

    const removeImage = (index) => {
        var images = proofImages;
        images.splice(index, 1);
        setProofImages([...images])
    }

    return (
        <>
            <Modal
                width="w-5/12"
                open={toggleReturnRejectOrder}
                children={!isReturnRejectOrder ? <div>
                    <p className='text-lg font-semibold mb-3'>Refund Reject</p>
                    <hr />
                    <div className="flex gap-3 my-4 mb-2">
                        <p className={labelClass}>Reason :</p>
                        <p className={contentClass}>{type=== "Return" ?
                            order?.buyer_return_request?.reason_id__reason :  
                            order?.buyer_refund_request?.reason_id__reason}</p>
                    </div>
                    <div className="flex gap-3 my-4 mb-2">
                        <p className={labelClass}>Remarks :</p>
                        <p className={contentClass}>{(type=== "Return" ? 
                            order?.buyer_return_request?.remarks : order?.buyer_refund_request?.remarks) ?? "NA"}</p>
                    </div>
                    <p className='text-sm my-4 pr-7 mb-4'>Are you sure to reject this request ?
                    </p>
                    <div className='flex justify-end mt-10'>
                        <button className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5'
                            onClick={onReturnRejectOrder}>
                            Yes
                        </button>
                        <button className='cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35] h-8 w-20'
                            onClick={closeReturnRejectOrderPopup}>
                            No
                        </button>
                    </div>
                </div> : <div>
                    <p className='text-lg font-semibold mb-3'>Refund Reject</p>
                    <hr />
                    <div className="flex gap-3 my-4 mb-2">
                        <p className={labelClass}>Reason :</p>
                        <p className={contentClass}>{type=== "Return" ?
                            order?.buyer_return_request?.reason_id__reason :  
                            order?.buyer_refund_request?.reason_id__reason}</p>
                    </div>
                    <div className="flex gap-3 my-4 mb-2">
                        <p className={labelClass}>Remarks :</p>
                        <p className={contentClass}>{(type=== "Return" ? 
                            order?.buyer_return_request?.remarks : order?.buyer_refund_request?.remarks) ?? "NA"}</p>
                    </div>
                    {isReturnRejectReasonsLoading ?
                        <div className='h-20 my-5'>
                            <Skeleton height={25} width={150} className='mb-4' />
                            <Skeleton height={16} width={200} />
                        </div> : <>
                            <p className='text-sm my-4 font-semibold text-[#828282] mb-2'>Select a reason for rejecting the request</p>
                            <Select id="returnRejectReasons" name="returnRejectReasons" options={returnRejectReasons}
                                placeholder="Select a reason"
                                onChange={e => {
                                    setSelectedReturnRejectReason(e);
                                    setReturnRejectValidationMsg("");
                                }
                                }
                            />

                            <p className='text-sm mb-3 font-semibold text-[#828282] mt-6'>Comments</p>
                            <textarea rows="4" value={returnRejectComment} id="orderComment"
                                className='w-full text-sm border border-[#bdbdbd] rounded p-2'
                                onChange={(e) => setReturnRejectComment(e.target.value)} />

                            <p className='text-sm mb-3 font-semibold text-[#828282] mt-6'>Attach Proof</p>
                            <div className="flex gap-2 flex-wrap">
                                {proofImages.map((item, index) => {
                                    return <div className="h-20 w-20 p-4 border relative">
                                        <img key={index} src={item.img} alt='' height="80px" width="80px" />
                                        <div className="absolute flex items-center justify-center h-4 w-4 
                                            bg-[#f5ab35] rounded-lg right-[-6px] top-[-7px]" onClick={(e) => removeImage(index)}>
                                            <MdOutlineClose color="white" size="12px" />
                                        </div>
                                    </div>;
                                })}

                                {proofImages.length < 5 ?
                                    <div className="h-20 w-20 relative border-2 border-dashed flex flex-col items-center justify-center cp"
                                    >
                                        <img src={addImageIcon} alt='' height="15px" width="15px" />
                                        <p className="text-[10px] text-[#f5ab35] mt-2">Add Image</p>
                                        <input type="file" className='opacity-0 absolute w-12 left-4 cp'
                                            onChange={handleImageSelection} />
                                    </div> : null}
                            </div>

                            <p className='text-red-600 my-3 text-xs'>{returnRejectValidationMsg}</p>
                            <hr />
                            <div className='flex justify-end mt-4'>
                                <button
                                    className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5 hover:bg-amber-500
                             disabled:opacity-50  disabled:cursor-default'
                                    onClick={updateReturnReject}
                                    disabled={isReturnRejectReasonsLoading || isReturnRejectOrderLoading}
                                >
                                    Submit
                                </button>
                                <button className='cp text-center rounded-md border-[#f5ab35] border-2 disabled:border-[#FFD086]
                                 disabled:cursor-default bg-white text-[#f5ab35] h-8 w-20'
                                    onClick={handleReturnRejectClose}
                                    disabled={isReturnRejectReasonsLoading || isReturnRejectOrderLoading}
                                >
                                    Close
                                </button>
                            </div>
                        </>}
                </div>} />
        </>);
}
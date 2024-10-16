import { useState } from "react";
import Select from "react-select";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls.js";
import { Modal } from '../GenericComponents.js';


export default function BuyerRefundReqPopup({
    closeRefundReqPopup,
    toggleRefundReq,
    processRefundReq,
    orderId,
    user,
}) {
    const [isRefundReq, setIsRefundReq] = useState(false)
    const [isRefundReqReasonsLoading, setIsRefundReqReasonsLoading] = useState(false)
    const [refundReqReasons, setRefundReqReasons] = useState(false)
    const [selectedRefundReqReason, setSelectedRefundReqReason] = useState(null)
    const [refundReqValidationMsg, setRefundReqValidationMsg] = useState("")
    const [refundReqComment, setRefundReqComment] = useState("")
    const [isRefundReqLoading, setIsRefundReqLoading] = useState(false)


    const processRefundReqReasons = (res, api) => {
        var refundReqReasons = res.data.data.map(e => {
            return { ...e, value: e.reason, label: e.reason };
        })
        setIsRefundReqReasonsLoading(false)
        setRefundReqReasons(refundReqReasons)
    }


    const onRefundReq = () => {
        setIsRefundReq(true)
        setIsRefundReqReasonsLoading(true)

        let fd = new FormData();

        BuyerApiCalls(
            fd,
            Apis.fetchRefundReqReasons,
            "GET",
            { "Authorization": "Bearer " + user.access, },
            processRefundReqReasons
        );
    }

    const onOrderRefundRequested = (res, api) => {
        handleRefundReqClose();
        processRefundReq(res, api)
    }

    const updateRefundReq = () => {
        if (selectedRefundReqReason) {
            setIsRefundReqLoading(true)

            let fd = new FormData();

            fd.append("id_order", orderId);
            fd.append("reason_id", selectedRefundReqReason.id_cancellation); //change id key
            fd.append("remarks", refundReqComment);

            BuyerApiCalls(
                fd,
                Apis.orderRefundRequest,
                "POST",
                { "Authorization": "Bearer " + user.access, },
                onOrderRefundRequested
            );
        } else {
            setRefundReqValidationMsg("Please select a reason")
        }
    }

    const handleRefundReqClose = () => {
        setIsRefundReq(false)
        setRefundReqComment("")
        setRefundReqValidationMsg("")
        setIsRefundReqLoading(false)
        closeRefundReqPopup()
    }

    return (
      <>
        <Modal
          width={isRefundReq && "w-5/12 max-sm:w-3/4"}
          open={toggleRefundReq}
          children={
            !isRefundReq ? (
              <div>
                <p className="text-lg font-semibold mb-3">Refund Request</p>
                <hr />
                <p className="text-sm my-4 pr-7 mb-4">
                  Are you sure to request refund for this order ?
                </p>
                <div className="flex justify-end mt-10">
                  <button
                    className="cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5"
                    onClick={onRefundReq}
                  >
                    Yes
                  </button>
                  <button
                    className="cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35] h-8 w-20"
                    onClick={closeRefundReqPopup}
                  >
                    No
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold mb-3">Refund Request</p>
                <hr />
                {isRefundReqReasonsLoading ? (
                  <div className="h-20 my-5">
                    <Skeleton height={25} width={150} className="mb-4" />
                    <Skeleton height={16} width={200} />
                  </div>
                ) : (
                  <>
                    <p className="text-sm my-4 font-medium mb-2">
                      Select a reason for refund request
                    </p>
                    <Select
                      id="refundReqReasons"
                      name="refundReqReasons"
                      options={refundReqReasons}
                      placeholder="Select a reason"
                      onChange={(e) => {
                        setSelectedRefundReqReason(e);
                        setRefundReqValidationMsg("");
                      }}
                    />

                    <p className="text-sm mb-3 font-medium mt-6">Comments</p>
                    <textarea
                      rows="4"
                      value={refundReqComment}
                      id="orderComment"
                      className="w-full mb-12 text-sm border border-[#bdbdbd] rounded p-2"
                      onChange={(e) => setRefundReqComment(e.target.value)}
                    />
                    <p className="text-red-600 mb-3 text-sm">
                      {refundReqValidationMsg}
                    </p>
                    <hr />
                    <div className="flex justify-end mt-4">
                      <button
                        className="cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5 hover:bg-amber-500
                             disabled:opacity-50  disabled:cursor-default"
                        onClick={updateRefundReq}
                        disabled={
                          isRefundReqReasonsLoading || isRefundReqLoading
                        }
                      >
                        Submit
                      </button>
                      <button
                        className="cp text-center rounded-md border-[#f5ab35] border-2  disabled:border-[#FFD086]
                                disabled:cursor-default bg-white text-[#f5ab35] h-8 w-20"
                        onClick={handleRefundReqClose}
                        disabled={
                          isRefundReqReasonsLoading || isRefundReqLoading
                        }
                      >
                        Close
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          }
        />
      </>
    );
}
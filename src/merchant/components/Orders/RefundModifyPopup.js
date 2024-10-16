import { useState, useEffect } from "react";
import 'react-loading-skeleton/dist/skeleton.css'
import { ApiCalls, Apis } from '../../utils/ApiCalls.js';
import { Modal } from '../../../customer/components/GenericComponents.js';

const contentClass = 'text-sm text-[#828282]';
const labelClass = 'w-16 text-sm font-semibold text-[#828282] whitespace-nowrap';

export default function RefundModifyOrderPopup({
    closeRefundModifyOrderPopup,
    toggleModifyOrder,
    processModifyOrder,
    order,
    user,
    type
}) {
    const [isModifyOrderLoading, setIsModifyOrderLoading] = useState(false)
    const [isAcceptModify, setIsAcceptModify] = useState(false)
    const [refundAmt, setRefundAmt] = useState("Please enter amount")
    const [isBuyerReturningItem, setIsBuyerReturningItem] = useState(false)


    useEffect(() => {
        setRefundAmt(parseFloat(order.formatted_total_paid))
    }, [order])


    const onModifyOrder = () => {
        setIsModifyOrderLoading(true)
        let fd = new FormData();

        fd.append("id_order", order.id_order);
        if (parseFloat(order.formatted_total_paid) !== refundAmt) {
            fd.append("partial_refund_amount", refundAmt)
        }

        ApiCalls(fd,
            Apis.acceptRefundRequest,
            "POST",
            { "Authorization": "Bearer " + user.access, },
            onOrderModifyed
        );
    }

    const onOrderModifyed = (res, api) => {
        handleModifyClose();
        processModifyOrder(res, api)
    }

    const handleModifyClose = () => {
        setIsModifyOrderLoading(false)
        setIsAcceptModify(false)
        closeRefundModifyOrderPopup()
    }

    const openAcceptModify = () => {
        setIsAcceptModify(true)
    }

    const onChangeRefundAmt = (e) => {
        let value = e.target.value
        if (value <= parseFloat(order.formatted_total_paid)) setRefundAmt(value)
    }

    const callOnChecked = (e) => {
        setIsBuyerReturningItem(e.target.checked)
    }

    return (
      <Modal
        width="max-sm:w-3/4 max-lg:w-1/2 w-[600px]"
        open={toggleModifyOrder}
        children={
          !isAcceptModify ? (
            <div>
              <p className="text-lg font-semibold mb-3">
                Modify Refund Request
              </p>
              <hr />
              <p className="font-semibold text-sm mt-4">
                Customer's return/refund request
              </p>

              <div className="flex gap-3 mt-4">
                <p className={labelClass}>Reason :</p>
                <p className={contentClass}>
                  {type === "Return"
                    ? order?.buyer_return_request?.reason_id__reason
                    : order?.buyer_refund_request?.reason_id__reason}
                </p>
              </div>
              <div className="flex gap-3">
                <p className={labelClass}>Remarks :</p>
                <p className={contentClass}>
                  {(type === "Return"
                    ? order?.buyer_return_request?.remarks
                    : order?.buyer_refund_request?.remarks) ?? "NA"}
                </p>
              </div>
              <div className="flex gap-3">
                <p className="w-28 text-sm font-semibold text-[#828282] whitespace-nowrap">
                  Refund Amount :
                </p>
                <p className={contentClass}>
                  {order?.formatted_total_paid ?? "NA"}
                </p>
              </div>
              <div className="flex gap-3">
                <p className="w-32 text-sm font-semibold text-[#828282] whitespace-nowrap">
                  Reject Date/Time :
                </p>
                <p className={contentClass}>
                  {(type === "Return"
                    ? order?.buyer_return_request?.created_date
                    : order?.buyer_refund_request?.created_date) ?? "NA"}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 mt-6">
                {type === "Return"
                  ? order?.buyer_return_request?.other_detail?.product_img?.map(
                      (item, index) => {
                        return (
                          <div className="h-20 w-20 p-4 border rounded-lg">
                            <img
                              key={index}
                              src={item.file_url}
                              alt=""
                              height="80px"
                              width="80px"
                            />
                          </div>
                        );
                      }
                    )
                  : order?.buyer_refund_request?.other_detail?.product_img?.map(
                      (item, index) => {
                        return (
                          <div className="h-20 w-20 p-4 border rounded-lg">
                            <img
                              key={index}
                              src={item.file_url}
                              alt=""
                              height="80px"
                              width="80px"
                            />
                          </div>
                        );
                      }
                    )}
              </div>

              <input
                type="checkbox"
                id="modifyRefund"
                name="modifyRefund"
                value={isBuyerReturningItem}
                onChange={callOnChecked}
                className="mt-6"
              />
              <label for="modifyRefund" className="text-sm my-4 mb-4 font-bold">
                Buyer has to return the item
              </label>
              <br></br>
              <div className="flex justify-end mt-10">
                <button
                  className="cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5
                    disabled:opacity-50  disabled:cursor-default"
                  disabled={!isBuyerReturningItem && isModifyOrderLoading}
                  onClick={
                    isBuyerReturningItem ? openAcceptModify : onModifyOrder
                  }
                >
                  Confirm
                </button>
                <button
                  className="cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35] h-8 w-20 disabled:border-[#FFD086]
                                 disabled:cursor-default"
                  disabled={!isBuyerReturningItem && isModifyOrderLoading}
                  onClick={closeRefundModifyOrderPopup}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold mb-3">
                Modify Refund Request
              </p>
              <hr />

              <p className="text-sm font-semibold my-5">
                Offer full/partial refund
              </p>

              <p className={labelClass}>Return & Refund Request</p>
              <div className="flex my-5 gap-5">
                <p className="text-sm text-[#828282] whitespace-nowrap">
                  Refund Amount
                </p>
                <p className={labelClass}>$ {order.formatted_total_paid}</p>
              </div>

              <p className="text-sm font-semibold mt-11 mb-6">
                You may choose to offer partial refund
              </p>
              <div className="flex my-5 gap-5 items-center">
                <p className="w-24 text-sm font-semibold text-[#828282] whitespace-nowrap">
                  Refund Amount
                </p>
                <input
                  id="refundAmt"
                  name="refundAmt"
                  type="text"
                  value={refundAmt}
                  onChange={onChangeRefundAmt}
                  className="appearance-none block w-full px-3 py-2 !w-[250px] border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 sm:text-sm"
                />
              </div>

              <hr />
              <div className="flex justify-end mt-4">
                <button
                  className="cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-24 mr-5 hover:bg-amber-500
                     disabled:opacity-50  disabled:cursor-default font-sm"
                  onClick={onModifyOrder}
                  disabled={isModifyOrderLoading}
                >
                  Approve
                </button>
                <button
                  className="cp text-center rounded-md border-[#f5ab35] border-2 disabled:border-[#FFD086]
                         disabled:cursor-default bg-white text-[#f5ab35] h-8 w-24 font-sm"
                  onClick={handleModifyClose}
                  disabled={isModifyOrderLoading}
                >
                  Close
                </button>
              </div>
            </div>
          )
        }
      />
    );
}
import { FormStyle, InputBoxStyle } from '../../../../styles/FormStyles';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useEffect, useState } from 'react';
import { MdOutlineClose } from 'react-icons/md';
import addImageIcon from '../../../../../assets/seller/img_add.svg';
import {
    ApiCalls, AdminApis, HttpStatus
} from '../../../../utils';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';

const labelClass = 'text-sm font-semibold text-[#828282] whitespace-nowrap';

export const CancelOrderForm = ({ onConfirm, onClose, cancelSlots }) => {
    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        onConfirm(formData);
    };

    return (
        <>
            <p className='text-lg font-semibold mb-3 text-left'>Cancel Order</p>
            <hr />
            <div className="py-2"></div>
            <form className={FormStyle.overall} onSubmit={handleSubmit}>
                {cancelSlots && (
                    <select
                        name="cancel_reason_id"
                        id="cancel_reason_id"
                        className="mt-1 block w-full py-2 my-4 px-16 rounded-md border border-gray-300 shadow-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-300"
                    >
                        {Object.entries(cancelSlots).map(([statusKey, statusValue]) => (
                            <option key={statusKey} value={statusValue.id_cancellation}>
                                {statusValue.reason}
                            </option>
                        ))}
                    </select>
                )}
                <textarea type="text" rows="4" name="remarks" id="remarks" placeholder='Remarks' className={InputBoxStyle} />
                <button data-modal-hide="popup-modal" type="submit" className="mb-2 text-white bg-yellow-500 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                    Confirm
                </button>
                <button onClick={onClose} data-modal-hide="popup-modal" type="button" className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                    Cancel
                </button>
            </form>
        </>
    );
};


export const RefundOrderForm = ({ onConfirm, status, onClose, orderDetails }) => {
    const [proofImages, setProofImages] = useState([])
    const handleSubmit = (event, action) => {
        event.preventDefault();
        const formData = new FormData(event.target.form);
        if (proofImages.length) {
            let len = proofImages.length;
            for (let i = 0; i < len; i++) {
                formData.append("product_image[]", proofImages[i].file);
            }
        }
        onConfirm(formData, action);
    };

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
        <form className={FormStyle.overall}>
            <div className='text-left'>
                {status === "approve" ? (
                    <>
                        <p className='text-lg font-semibold mb-3'>Approve Refund</p>
                        <hr />

                        <p className="text-sm font-semibold my-5">Offer full/partial refund</p>

                        <p className={labelClass}>Return & Refund Request</p>
                        <div className="flex my-5 gap-5">
                            <p className='text-sm text-[#828282] whitespace-nowrap'>Refund Amount:</p>
                            <p className={labelClass}>${orderDetails["Refund Amount"]}</p>
                        </div>

                        <p className="text-sm font-semibold mt-11 mb-6">You may choose to offer partial refund</p>
                        <div className="flex my-5 gap-5 items-center">
                            <p className={labelClass}>Refund Amount</p>
                            <input
                                id="partial_refund_amount"
                                name="partial_refund_amount"
                                type="text"
                                className={InputBoxStyle}
                            />
                        </div>
                        <hr />
                        <div className='mt-4 text-right'>
                            <button
                                type="submit"
                                className="mb-2 text-white bg-yellow-500 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
                                onClick={(event) => handleSubmit(event, "accept")} >
                                Approve
                            </button>
                            <button onClick={onClose} data-modal-hide="popup-modal" type="button" className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className='text-lg font-semibold mb-3'>Refund Reject</p>
                        <hr />
                        <p className='text-sm my-4 font-semibold text-[#828282] mb-2 pr-32'>Select a reason for rejecting the request</p>
                        <select
                            name="reason_id"
                            id="reason_id"
                            className={InputBoxStyle}
                        >
                            <option label="Product Damaged by Buyer" value="1">Product Damaged by Buyer</option>
                            <option label="Expired Product" value="5">Expired Product</option>
                        </select>

                        <p className='text-sm mb-3 font-semibold text-[#828282] mt-6'>Remarks</p>
                        <textarea type="text" rows="3" name="remarks" id="remarks" className={InputBoxStyle} />

                        <p className='text-sm mb-3 font-semibold text-[#828282] mt-6'>Attach Proof</p>
                        <div className="flex gap-2 flex-wrap mb-4">
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
                        <hr />
                        <div className='mt-4 text-right'>
                            <button
                                type="submit"
                                className="mb-2 text-white bg-yellow-500 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
                                onClick={(event) => handleSubmit(event, "reject")} >
                                Reject
                            </button>
                            <button onClick={onClose} data-modal-hide="popup-modal" type="button" className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </form>
    );
};

export const DisputeOrderForm = ({ onConfirm }) => {
    const handleSubmit = (event, action) => {
        event.preventDefault();
        const formData = new FormData(event.target.form);
        onConfirm(formData, action);
    };
    return (
        <>
            <p className='text-lg font-semibold mb-3 text-left'>Update Dispute</p>
            <hr />
            <div className="py-2"></div>
            <form className="w-full mr-32">
                <textarea type="text" rows="4" name="remarks" placeholder="Remarks" id="remarks" className={InputBoxStyle} />
                <button
                    type="submit"
                    className="mb-2 text-white bg-yellow-500 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
                    onClick={(event) => handleSubmit(event, "accept")} >
                    Accept
                </button>
            </form>
        </>
    );
};

export const ConfirmOrderForm = ({ onConfirm, onClose, orderDetails }) => {
    const auth = useAuth();
    const [change, setChange] = useState(false);
    const [deliveryDate, setDeliveryDate] = useState(new Date(orderDetails["Delivery Date"]));
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(-1);
    const [enabledDates, setEnabledDates] = useState([]);
    const [pickupDate, setPickupDate] = useState(new Date(orderDetails["Pickup Date"]));
    const [phList, setPhList] = useState([]);

    useEffect(()=>{
        if(orderDetails["Shipping ID"] === 5){
     ApiCalls(AdminApis.getPhList, "GET", {}, false, auth.token.access)
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
            let rdata = response.data.data;
            let phs = [
              ...rdata?.current_yr_ph_holidays,
              ...rdata?.next_yr_ph_holidays,
            ];
            setPhList(phs);
        }
      }).catch((error) => {
        showToast(error.response.data.message, "error")
      })
    }
    },[])

    useEffect(()=>{
        if (orderDetails["Shipping ID"] === 5 && phList.length > 0) {
          const today = new Date();
    
          const dates = [];
          dates[0] = new Date(today);
          dates[0].setDate(dates[0].getDate() + 1);
          dates[0] = checkForWeekend(dates[0])      
    
          dates[1] = new Date(dates[0]);
          dates[1].setDate(dates[0].getDate() + 1);
          dates[1] = checkForWeekend(dates[1])  
    
          dates[2] = new Date(dates[1]);
          dates[2].setDate(dates[1].getDate() + 1);
          dates[2] = checkForWeekend(dates[2])       
    
          setEnabledDates(dates)
        }
      },[phList])
    

      const checkForWeekend = (date) => {
        let checkRequired = "";
        let day = date.getDay()
    
        //check if sunday
        if(day === 0) {
          checkRequired = "ph";
          date.setDate(date.getDate() + 1);
        }
    
        //check if saturday
        else if(day === 6) {
          checkRequired = "ph"
          date.setDate(date.getDate() + 2);
        }
    
        //check for PH
        else{
          let idx = 0;
          while (idx !== -1) {
            idx = phList.findIndex((item) => item?.date === getFormatDate(date));
            if (idx >= 0) {
              date.setDate(date.getDate() + 1);
              checkRequired = "weekend"
            }
          }
        }
    
        if(checkRequired !== "") checkForWeekend(date)
    
        return date
      }
    
      const getFormatDate = (date) =>{
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
          return formattedDate;
      }

    const handleSubmit = (event) => {
        event.preventDefault();
        // if (selectedTimeSlot === -1 && change && orderDetails["Shipping ID"] !== 3) {
        //   toast.error("Please select a timeslot");
        //   return;
        // }
        const formData = new FormData(event.target);
        if (selectedTimeSlot >= 0) formData.append("time_slot_id", orderDetails["Timeslots"][selectedTimeSlot].id_slot);
        onConfirm(formData);
    };

    return (
      <>
        <p className="text-lg font-semibold mb-3 text-left">Confirm Order</p>
        <hr />
        {orderDetails && !change && (
          <div className="text-left">
            <div className="text-sm py-4 pr-32">
              <p>
                {orderDetails["Shipping ID"] === 5
                  ? "Pickup Date : "
                  : "Delivery Date: "}
                <span className="font-semibold">
                  {" "}
                  {orderDetails["Shipping ID"] === 5 ? (
                    orderDetails["Pickup Date"]
                  ) : (
                    <>
                      {orderDetails["Delivery Date End"]
                        ? orderDetails["Delivery Date"] +
                          " to " +
                          orderDetails["Delivery Date End"]
                        : orderDetails["Delivery Date"]}
                    </>
                  )}
                </span>
              </p>
              <p>
                Delivery Time:{" "}
                <span className="font-semibold">
                  {" "}
                  {orderDetails["Delivery Time"]}
                </span>
              </p>
              <p>
                Delivery Type:{" "}
                <span className="font-semibold">
                  {" "}
                  {orderDetails["Delivery Type"]}
                </span>
              </p>
            </div>
            {orderDetails["Delivery Type"] !== "Instant Delivery" && (
              <button
                className="mb-4 text-white bg-yellow-500 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
                onClick={() => setChange(true)}
              >
                Change
              </button>
            )}
          </div>
        )}
        <form className={FormStyle.overall} onSubmit={handleSubmit}>
          <div className="pt-4 text-right">
            {change && (
              <div className="text-left">
                <p className="text-sm font-medium mb-2">
                  {orderDetails["Shipping ID"] === 5
                    ? "Select Pickup Date"
                    : "Select Delivery Date"}
                </p>
                {orderDetails["Shipping ID"] === 5 ? (
                  <DatePicker
                    minDate={enabledDates[0]}
                    name="pickup_date"
                    selected={pickupDate}
                    dateFormat="yyyy-MM-dd"
                    onChange={(date) => setPickupDate(date)}
                    placeholderText="Pickup Date"
                    includeDates={enabledDates}
                    className={InputBoxStyle}
                  />
                ) : (
                  <DatePicker
                    minDate={new Date()}
                    name="delivery_date"
                    selected={deliveryDate}
                    className={InputBoxStyle}
                    placeholderText="Delivery Date"
                    onChange={(date) => setDeliveryDate(date)}
                    dateFormat="yyyy-MM-dd"
                  />
                )}

                <p className="text-sm font-medium mb-2">Select Delivery Time</p>
                <div className="flex gap-3 flex-wrap mb-12">
                  {orderDetails["Timeslots"].map((time, index) => {
                      var selectedClass = "bg-[#f5ab35] text-white";
                      var otherClass =
                        "bg-white text-[#828282] border border-[#bdbdbd]";
                      var cssClass =
                        selectedTimeSlot === index ? selectedClass : otherClass;
                      return (
                        <div
                          key={index}
                          className={`text-center cp p-2 rounded text-sm ${cssClass}`}
                          onClick={() => setSelectedTimeSlot(index)}
                        >
                          {time.delivery_slot}
                        </div>
                      );
                  })}
                </div>
              </div>
            )}
            <hr />
            <div className="mt-4">
              {change && (
                <button
                  onClick={() => setChange(false)}
                  className="mb-2 text-white bg-slate-300 hover:bg-gray-500 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="mb-2 text-white bg-yellow-500 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
              >
                Confirm
              </button>
              <button
                onClick={onClose}
                data-modal-hide="popup-modal"
                type="button"
                className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </>
    );

};

export const ManualRefundOrderForm = ({ onConfirm }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target.form);
    onConfirm(formData);
  };
  return (
    <>
      <p className="text-lg font-semibold mb-3 text-left">Refund</p>
      <hr />
      <div className="py-2"></div>
      <form className="w-full mr-32">
        <p className="text-sm font-semibold mb-6 text-left">
          You may choose to offer partial refund
        </p>
        <p className={`${labelClass} text-left`}>Refund Amount</p>
        <input
          id="partial_refund_amount"
          name="partial_refund_amount"
          type="text"
          className={InputBoxStyle}
        />
        <p className={`${labelClass} text-left mt-3`}>Remarks</p>
        <textarea
          type="text"
          rows="4"
          name="remarks"
          id="remarks"
          className={InputBoxStyle}
        />

        <button
          type="submit"
          className="mb-2 text-white bg-yellow-500 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
          onClick={(event) => handleSubmit(event)}
        >
          Submit
        </button>
      </form>
    </>
  );
};


export const SearchOrderForm = ({ onConfirm, onReset, orderStatus, timeSlot, selectedValues, paymentStatus, paymentType }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [deliveryDate, setDeliveryDate] = useState(null);
    const [isResetting, setIsResetting] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        if(!isResetting){
          const formData = new FormData(event.target);
          // if (startDate) formData.append("startDate", startDate);
          // if (endDate) formData.append("endDate", endDate);
          // if (deliveryDate) formData.append("deliveryDate", deliveryDate);
          onConfirm(formData);
        }else{
          setIsResetting(false)
        }
    };

    const handleReset = () => {
        setIsResetting(true)
        setStartDate(null);
        setEndDate(null);
        setDeliveryDate(null);
        const emptyFormData = new FormData();
        document.getElementById("searchForm").reset();
        onConfirm(emptyFormData);
        onReset(true);
    };

    return (
        <form id="searchForm" onSubmit={handleSubmit}>
            <h1 className="text-base font-semibold mb-2">Filters: </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                <input
                    type="text"
                    name="order_number"
                    id="order_number"
                    placeholder='Order Number'
                    className={InputBoxStyle}
                    defaultValue={selectedValues?.order_number}
                />
                <input
                    type="text"
                    name="tracking_number"
                    id="tracking_number"
                    placeholder='Tracking Number'
                    defaultValue={selectedValues?.tracking_number}
                    className={InputBoxStyle}
                />

                <select
                    name="delivery_status"
                    id="delivery_status"
                    defaultValue={selectedValues?.delivery_status}
                    className="mt-1 block w-full py-2 my-4 px-3 rounded-md border border-gray-300 shadow-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-300 capitalize"
                >
                    <option value="">All Order Status</option>
                    {orderStatus.map((status) => (
                        <option key={status?.general_status} value={status?.id_generalstatus}>
                            {status?.general_status}
                        </option>
                    ))}
                </select>
                <DatePicker
                    name="start_date"
                    selected={startDate}
                    className={InputBoxStyle}
                    placeholderText="Start Date"
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                    defaultValue={selectedValues?.start_date}
                />
                <DatePicker
                    name="end_date"
                    selected={endDate}
                    className={InputBoxStyle}
                    placeholderText="End Date"
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy-MM-dd"
                    defaultValue={selectedValues?.end_date}
                />
                <select
                    name="time_slot_id"
                    id="time_slot_id"
                    className={InputBoxStyle}
                    defaultValue={selectedValues?.time_slot_id}

                >
                    <option value="">All Timeslot</option>
                    {Object.entries(timeSlot).map(([slotKey, slotValue]) => (
                        <option key={slotKey} value={slotValue.id_slot}>
                            {slotValue.pickup_slot} to {slotValue.delivery_slot}
                        </option>
                    ))}
                </select>
                <input
                    type="email"
                    name="seller_email"
                    id="seller_email"
                    placeholder='Seller Email'
                    defaultValue={selectedValues?.seller_email}
                    className={InputBoxStyle}
                />
                <input
                    type="email"
                    name="buyer_email"
                    id="buyer_email"
                    placeholder='Buyer Email'
                    defaultValue={selectedValues?.buyer_email}
                    className={InputBoxStyle} />
                <DatePicker
                    name="delivery_date"
                    selected={deliveryDate}
                    className={InputBoxStyle}
                    placeholderText="Delivery Date"
                    onChange={(date) => setDeliveryDate(date)}
                    dateFormat="yyyy-MM-dd"
                    defaultValue={selectedValues?.delivery_date}
                />
                <input
                    type="text"
                    name="transaction_id"
                    id="transaction_id"
                    placeholder='Payment ID'
                    defaultValue={selectedValues?.transaction_id}
                    className={InputBoxStyle}
                />
                <select
                    name="payment_status"
                    id="payment_status"
                    defaultValue={selectedValues?.payment_status}
                    className="mt-1 block w-full py-2 my-4 px-3 rounded-md border border-gray-300 shadow-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-300 capitalize"
                >
                    <option value="">All Payment Status</option>
                    {paymentStatus.map((status) => (
                        <option key={status?.general_status} value={status?.id_generalstatus}>
                            {status?.general_status}
                        </option>
                    ))}
                </select>
                <select
                    name="payment_type"
                    id="payment_type"
                    defaultValue={selectedValues?.payment_type}
                    className="mt-1 block w-full py-2 my-4 px-3 rounded-md border border-gray-300 shadow-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-300 capitalize"
                >
                    <option value="">All Payment Type</option>
                    {paymentType.map((status) => (
                        <option key={status?.payment_type} value={status?.id_payment}>
                            {status?.payment_type}
                        </option>
                    ))}
                </select>
            </div>
            <button type="submit" className="mb-2 text-white bg-yellow-500 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                Search
            </button>
            <button className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                onClick={handleReset}
            >
                Reset
            </button>
        </form>
    );
};








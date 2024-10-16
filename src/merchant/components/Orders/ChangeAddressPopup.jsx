import React, { useState } from "react";
import { MdOutlineClose } from "react-icons/md";
import { ApiCalls, Apis } from "../../utils/ApiCalls";
import { Constants } from "../../utils/Constants";
import ls from "local-storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import successGif from "../../../assets/success.gif";
import { Modal } from "../../../customer/components/GenericComponents";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { AiFillWarning } from "react-icons/ai";

const ChangeAddressPopup = ({
  close,
  fullName,
  contact,
  postalCode,
  addressDetails,
  orderNumber,
  unitNumber,
}) => {
  const user = JSON.parse(ls(Constants.localStorage.user));
  const [name, setName] = useState(fullName);
  const [contactNumber, setContactNumber] = useState(contact);
  const [unitNo, setUnitNo] = useState(unitNumber);
  const [postalCodeNumber, setPostalCodeNumber] = useState(postalCode);
  const [addressDetail, setAddressDetail] = useState(addressDetails);
  const [isShowStatusPopup, setIsShowStatusPopup] = useState(false);
  const [reqResult, setReqResult] = useState("");
  const [popupMessage, setPopupMessage] = useState("");

  const handleAddressChange = () => {
    try {
      const formData = new FormData();
      formData.append("order_number", orderNumber);
      formData.append("full_name", name);
      formData.append("contact_number", contactNumber);
      formData.append("postal_code", postalCodeNumber);
      formData.append("address_details", addressDetail);
      formData.append("unit_number", unitNo);

      ApiCalls(
        formData,
        Apis.changeDeliveryAddress,
        "POST",
        {
          Authorization: "Bearer " + user.access,
        },
        (res) => {
          if (res?.data?.result === "SUCCESS") {
            setReqResult("SUCCESS");
            setPopupMessage(res?.data?.message);
          } else {
            setReqResult("ERROR");
            setPopupMessage(res?.data?.message);
          }

          // Show the status popup
          setIsShowStatusPopup(true);

          // Delay the close of the modal for 2 seconds to display the popup
          setTimeout(() => {
            setIsShowStatusPopup(false);
            close();
          }, 2000);
        }
      );
    } catch (error) {
      console.log(error);
      setReqResult("ERROR");
      setPopupMessage("An error occurred. Please try again later.");

      // Show the status popup
      setIsShowStatusPopup(true);

      // Delay the close of the modal for 2 seconds to display the popup
      setTimeout(() => {
        setIsShowStatusPopup(false);
        close();
      }, 2000);
    }
  };

  const requestStatusPopup = () => {
    return (
      <Modal
        width="w-4/12"
        open={isShowStatusPopup}
        children={
          <div>
            <span
              className="flex justify-end cp"
              onClick={() => setIsShowStatusPopup(false)}
            >
              <FontAwesomeIcon icon={faXmark} />
            </span>
            {reqResult === "SUCCESS" ? (
              <img src={successGif} alt="success-icon" className="modal-icon" />
            ) : (
              <AiFillWarning className="modal-icon" />
            )}
            <div className="poptitle font-medium text-center">
              {reqResult === "SUCCESS" ? (
                popupMessage
              ) : (
                <span>
                  <p className="text-base font-normal text-grey mt-2">
                    {`Error: ${popupMessage}`}
                  </p>
                </span>
              )}
            </div>
          </div>
        }
      />
    );
  };

  return (
    <div className="modal">
      <div className="modal-body !pt-4 !pb-7 !px-8 !w-[45%] animate__animated animate__fadeInDown">
        <h1 className="font-medium">
          Change of Shipping Address
          <MdOutlineClose onClick={close} />
        </h1>

        <div className="flex items-center justify-between gap-8 pt-5">
          <div className="flex-1">
            <label className="font-medium text-sm text-[#828282] align-left">
              Name <span className="text-red-600">*</span>
            </label>
            <div className="form-group my-3">
              <input
                type="text"
                id="pickup_contact_name_edit"
                maxlength="100"
                className="form-control text-left outline-0 !text-black w-full"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              ></input>
              <p
                className="text-red-600 form-error hidden"
                id="contactNameErrorMsg"
              >
                {" "}
                Please Enter a Contact Name{" "}
              </p>
            </div>
          </div>

          <div className="flex-1">
            <label className="font-medium text-sm text-[#828282] align-left">
              Phone Number <span className="text-red-600">*</span>
            </label>
            <div className="form-group my-3">
              <input
                type="text"
                id="pickup_contact_number_edit"
                className="form-control !text-black"
                maxlenth="20"
                required
                value={contactNumber}
                onChange={(e) => {
                  setContactNumber(e.target.value);
                }}
              ></input>
              <p
                className="text-red-600 form-error hidden align-left"
                id="contactNumberErrorMsg_edit"
              >
                {" "}
                Please enter a valid Phone Number{" "}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-5">
          <label
            className="font-medium text-sm text-[#828282] align-left"
            for="pickup_postal_edit"
          >
            Postal Code <span className="text-red-600">*</span>
          </label>
          <div className="form-group my-3">
            <input
              type="number"
              id="pickup_postal_edit"
              className="form-control !text-black"
              maxlenth="200"
              required
              value={postalCodeNumber}
              onChange={(e) => {
                setPostalCodeNumber(e.target.value);
              }}
            ></input>
            <p
              className="text-red-600 form-error hidden align-left"
              id="postalCodeErrorMsg_edit"
            >
              {" "}
              Please enter a valid Postal Code
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-8 pt-5">
          <div className="flex-1">
            <label
              className="font-medium text-sm text-[#828282] align-left"
              for="pickup_detailed_address_edit"
            >
              Building, Street and etc <span className="text-red-600">*</span>
            </label>
            <div className="form-group my-3">
              <input
                type="text"
                id="pickup_detailed_address_edit"
                className="form-control !text-black"
                maxlenth="20"
                required
                value={addressDetail}
                onChange={(e) => {
                  setAddressDetail(e.target.value);
                }}
              ></input>
              <p
                className="text-red-600 form-error hidden"
                id="addressErrorMsg_edit"
              >
                {" "}
                Please enter a valid Address{" "}
              </p>
            </div>
          </div>

          <div className="flex-1">
            <label
              className="font-medium text-sm text-[#828282] align-left"
              for="pickup_detailed_address_edit"
            >
              Unit Number (Optional)
            </label>
            <div className="form-group my-3">
              <input
                type="text"
                id="pickup_detailed_address_edit"
                className="form-control !text-black"
                maxlenth="20"
                required
                value={unitNo}
                onChange={(e) => {
                  setUnitNo(e.target.value);
                }}
              ></input>
              <p
                className="text-red-600 form-error hidden"
                id="addressErrorMsg_edit"
              >
                {" "}
                Please enter a valid unit number{" "}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <button
            className="btn-default xs:ml-4 md:ml-10 px-5 py-[5px] rounded"
            id="btn_edit_address_save"
            onClick={handleAddressChange}
          >
            Confirm
          </button>
        </div>

        {isShowStatusPopup && requestStatusPopup()}
      </div>
    </div>
  );
};

export default ChangeAddressPopup;

import React, { useEffect, useState } from "react";
import uuid from "react-uuid";
import AddEditAddressForm from "../formComponents//modalForms/AddEditAddressForm";
import { Modal } from "../GenericComponents";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import { useDispatch, useSelector } from "react-redux";
import { PopUpComponent } from "../GenericComponents";
import {
  setAddressToEdit,
  setAddresses,
  setWhichForm,
  setSelectedAddress,
} from "../../redux/reducers/addressReducer";

//icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { AiOutlinePlusCircle } from "react-icons/ai";
import { set } from "local-storage";

export default function ShippingAddressComponent() {
  const user = JSON.parse(localStorage.getItem("customer"));
  const [openModal, setOpenModal] = useState(false);
  const [openPopUp, setOpenPopUp] = useState(false);
  const [popupResult, setPopupResult] = useState(null);
  const [popupMessage, setPopupMessage] = useState(null);
  const addresses = useSelector((state) => state.address.addresses);
  const whichForm = useSelector((state) => state.address.whichForm);
  const selectedAddress = useSelector((state) => state.address.selectedAddress);
  const dispatch = useDispatch();

  const processRes = (res, api) => {
    if (api !== Apis.retrieveAddress) {
      res.result === "FAIL"
        ? setPopupResult("error")
        : setPopupResult("success");
      res.data && setPopupMessage(res.data.message);
      setOpenPopUp(true);

      BuyerApiCalls(
        {},
        Apis.retrieveAddress,
        "GET",
        {
          "Content-Type": "multipart/form-data",
          // eslint-disable-next-line
          Authorization: `Bearer ${user.access}`,
        },
        processRes
      );
    }

    if (api === Apis.retrieveAddress) {
      dispatch(setAddresses(res.data.data));
      setOpenModal(false);
    }
  };
  useEffect(() => {
    BuyerApiCalls(
      {},
      Apis.retrieveAddress,
      "GET",
      {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${user.access}`,
      },
      processRes
    );
  }, []);

  const addressHandler = (address) => {
    console.log(addresses.length);
    //if less than 5 addresses
    //allow user to add address
    //if there is address to edit, set the form to editaddress form
    if (addresses.length >= 5 && !address) {
      setPopupMessage("Maximum 5 addresses allowed");
    } else {
      if (address) {
        dispatch(setWhichForm("editAddress"));
        dispatch(setAddressToEdit(address));
      } else {
        dispatch(setWhichForm("addAddress"));
        dispatch(setAddressToEdit(null));
      }
      setOpenModal(true);
      return;
    }
    setPopupResult("error");
    setOpenPopUp(true);
  };
  const formatAddress = (unitNumber) => {
    return unitNumber.includes("#") ? unitNumber : `#${unitNumber}`;
  };
  const removeAddress = (address) => {
    dispatch(setWhichForm("removeAddress"));
    dispatch(setSelectedAddress(address));
    setOpenModal(true);
  };
  return (
    <React.Fragment>
      {openPopUp && (
        <PopUpComponent
          message={popupMessage}
          open={openPopUp}
          close={() => setOpenPopUp(false)}
          result={popupResult}
        ></PopUpComponent>
      )}
      <Modal open={openModal} width="562">
        {(whichForm === "addAddress" || whichForm === "editAddress") && (
          // props to handle error response from api call
          <AddEditAddressForm
            close={() => setOpenModal(false)}
            setPopUpMessage={setPopupMessage}
            setPopupResult={setPopupResult}
            setOpenPopUp={setOpenPopUp}
          ></AddEditAddressForm>
        )}
      </Modal>
      <div className="flex flex-col w-full md:basis-3/4 sm:border-[1px] rounded-[6px]  border-grey-300 px-4 py-4 ">
        <p className="text-[16px] font-bold mb-4 ">Address book</p>
        <button onClick={() => addressHandler()} className="text-left px-4 py-3 flex gap-4">+ New Address</button>
        <div className="flex gap-4 flex-wrap">
          <div className="hidden sm:flex items-center justify-center gap-[10px] w-[400px] h-[223px] bg-white border border-gray-300 shadow-md rounded-[6px] box-border">
            <button
              className="flex-col items-center justify-center text-[14px]"
              onClick={() => addressHandler()}
            >
              <div className="flex flex-wrap items-center">
                <AiOutlinePlusCircle
                  className="grow text-amber-500"
                  size={45}
                />
              </div>
              Add Address
            </button>
          </div>
          {addresses.map((address) => {
            return (
              <div
                className="flex relative flex-col items-start  w-[400px] h-[223px] bg-white border rounded-[6px] border-gray-300 shadow-md box-border"
                key={uuid()}
              >
                <div className="relative flex-col flex-1 px-4 py-5 capitalize text-[12px] text-normal">
                  <div className="flex gap-4 py-1">
                    <p className="font-medium text-[14px]">
                      {address.full_name}
                    </p>
                    <p className="rounded md:text-[10px] bg-paleOrange3 text-[#EF9F3E] px-2 py-1 h-[22px]">
                      {address.address_label}
                    </p>
                  </div>
                  <div className="flex gap-4 py-1">
                    <p>{address.address_details}</p>
                  </div>
                  {address.unit_number && (
                    <p>{formatAddress(address.unit_number)}</p>
                  )}
                  <p>Singapore {address.postal_code}</p>
                  <p>{address.contact_number}</p>

                  <div className="absolute bottom-5 flex gap-10 mt-2 underline text-amber-500">
                    <button onClick={() => addressHandler(address)}>
                      Edit
                    </button>
                    <button onClick={() => removeAddress(address)}>
                      Remove
                    </button>

                    {whichForm === "removeAddress" && (
                      <Modal open={openModal} width="562">
                        <div className="flex flex-col ">
                          <p className="text-[20px] font-semibold mb-3">
                            Address Deletion
                          </p>
                          <hr />
                          <p className="text-[14px] mt-2">
                            Are you sure you want to delete the following
                            address?
                          </p>
                          <div className="flex gap-2 max-w-[562px] font-semibold ">
                            <p className="text-[14px] ">
                              {selectedAddress?.address_details},
                            </p>
                            {selectedAddress?.unit_number && (
                              <p className="text-[14px] whitespace-nowrap ">
                                {formatAddress(selectedAddress?.unit_number)},
                              </p>
                            )}
                            <p className="text-[14px] whitespace-nowrap">
                              Singapore {selectedAddress?.postal_code}
                            </p>
                          </div>

                          <div className="flex justify-end mt-10">
                            <button
                              onClick={() =>
                                BuyerApiCalls(
                                  {},
                                  Apis.deleteAddress + `${address.id_address}/`,
                                  "DELETE",
                                  {
                                    "Content-Type": "multipart/form-data",
                                    Authorization: `Bearer ${user.access}`,
                                  },
                                  processRes
                                )
                              }
                              className="cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setOpenModal(false)}
                              className="cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35] h-8 w-20"
                            >
                              No
                            </button>
                          </div>
                        </div>
                      </Modal>
                    )}
                  </div>
                </div>

                {address.set_default === true ? (
                  <div>
                    <div className="absolute right-5 bottom-5 flex gap-10 underline text-black">
                      <p>Default</p>
                    </div>
                    <div className="absolute right-5 top-5 ">
                      <FontAwesomeIcon
                        icon={faCircleCheck}
                        className=" w-6 h-6"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </React.Fragment>
  );
}

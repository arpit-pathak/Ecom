import React, { useEffect, useState } from "react";
// images and icons
import { IoCloseOutline } from "react-icons/io5";
import tickIcon from "../../../../assets/orange-tick.svg";
import editIcon from "../../../../assets/edit.svg";
import { Apis, BuyerApiCalls } from "../../../utils/ApiCalls";
import { useParams } from "react-router-dom";
import { CustomerRoutes } from "../../../../Routes";
import { PopUpComponent } from "../../GenericComponents";

const ChangeAddressForm = ({ close, refetchAddress }) => {
  const params = useParams();
  const user = JSON.parse(localStorage.getItem("customer"));
  const [addresses, setAddresses] = useState([]);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState(null);
  const [addressStatusPopup, setAddressStatusPopup] = useState(false);
  const [addressStatusPopupMessage, setAddressStatusPopupMessage] =
    useState("");
  const [addressStatusPopupResult, setAddressStatusPopupResult] =
    useState(null);

  const handleAddressChange = () => {
    if (selectedDeliveryAddress !== null) {
      try {
        const formData = new FormData();
        formData.append("order_number", params.orderNumber);
        formData.append(
          "full_name",
          addresses[selectedDeliveryAddress]?.full_name
        );
        formData.append(
          "contact_number",
          addresses[selectedDeliveryAddress]?.contact_number
        );
        formData.append(
          "postal_code",
          addresses[selectedDeliveryAddress]?.postal_code
        );
        formData.append(
          "address_details",
          addresses[selectedDeliveryAddress]?.address_details
        );
        formData.append(
          "unit_number",
          addresses[selectedDeliveryAddress]?.unit_number
        );

        BuyerApiCalls(
          formData,
          Apis.changeBuyerOrderAddress,
          "POST",
          {
            Authorization: `Bearer ${user.access}`,
          },
          (response, api) => {
            if (response?.data?.result === "SUCCESS") {
              setAddressStatusPopupMessage(response?.data?.message);
              setAddressStatusPopupResult("success");
              refetchAddress();
            } else {
              setAddressStatusPopupMessage(response?.data?.message);
              setAddressStatusPopupResult("error");
              console.error("Failed to change the address", response);
            }
            setAddressStatusPopup(true);

            // Delay the close of the modal for 2 seconds to display the popup
            setTimeout(() => {
              close();
            }, 2000);
          }
        );
      } catch (error) {
        console.error("Error while changing address:", error);
        setAddressStatusPopupMessage(
          "An error occurred while changing the address."
        );
        setAddressStatusPopupResult("error");
        setAddressStatusPopup(true);
      }
    }
  };

  useEffect(() => {
    if (user) {
      BuyerApiCalls(
        {},
        Apis.retrieveAddress,
        "GET",
        {
          Authorization: `Bearer ${user.access}`,
        },
        (res, api) => {
          setAddresses(res?.data?.data);
        }
      );
    }
  }, []);

  return (
    <div className="w-full md:w-[635px] flex flex-col">
      <div className=" flex justify-between mb-4">
        <p className="inline font-bold text-base md:text-xl">
          Change of Delivery Address
        </p>

        <button
          type="button"
          className="inline"
          onClick={() => {
            close();
          }}
        >
          <IoCloseOutline className="text-[#444444] text-2xl" />
        </button>
      </div>

      <div className="border-b border-[#EAEAEA] w-full"></div>

      <div className="flex flex-col gap-4 h-full w-full overflow-auto mb-32 mt-4">
        {addresses.map((address, index) => (
          <div
            key={address.id_address}
            className={`border ${
              index === selectedDeliveryAddress
                ? "border-[#F5AB35]"
                : "border-[#EAEAEA]"
            } border-[#D1D5DB] p-3 flex flex-col gap-1 rounded cp`}
            onClick={() => setSelectedDeliveryAddress(index)}
          >
            <div className="flex justify-between">
              <div className="flex gap-1">
                <p className="text-base font-medium font-[Poppins] text-[#282828] max-[450px]:pr-2">
                  {address.address_details}
                </p>
                <p className="text-base font-medium font-[Poppins] text-[#282828] max-[450px]:pr-2">
                  {", "}
                  {address.postal_code}
                </p>
                {address.unit_number && (
                  <p className="text-base font-medium font-[Poppins] text-[#282828] max-[450px]:pr-2">
                    {", "}
                    {"#"}{address.unit_number}
                  </p>
                )}
              </div>
              {index === selectedDeliveryAddress && (
                <img src={tickIcon} alt="tick-icon" />
              )}
            </div>

            <div className="flex gap-5">
              <p className="text-base font-[Poppins] text-[#282828]">
                {address.full_name}
              </p>
              <p className="text-base font-[Poppins] text-[#282828]">
                {address.contact_number}
              </p>
            </div>

            {address.set_default && (
              <p className="text-sm font-[Poppins] font-medium flex justify-start pt-5 text-[#282828]">
                Default
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          className="flex py-2 px-[25px] gap-2 items-center"
          onClick={() => {
            window.open(CustomerRoutes.addressBook, "_blank");
            close();
          }}
        >
          <img src={editIcon} alt="edit-icon" />
          <p className="text-black text-sm font-medium underline">Edit</p>
        </button>

        <button
          className="text-white text-sm bg-[#F5AB35] rounded py-2 px-[25px]"
          onClick={handleAddressChange}
        >
          Confirm
        </button>
      </div>

      {addressStatusPopup && (
        <PopUpComponent
          open={addressStatusPopup}
          close={() => {
            setAddressStatusPopup(false);
          }}
          message={addressStatusPopupMessage}
          result={addressStatusPopupResult}
        />
      )}
    </div>
  );
};

export default ChangeAddressForm;

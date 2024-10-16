import { useState } from "react";
import { ImCross } from "react-icons/im";
import { useSelector, useDispatch } from "react-redux";
import {
  setAddressToEdit,
  setSelectedAddress,
  setWhichForm,
} from "../../../redux/reducers/addressReducer";
export default function ViewAddressForm({
  close,
  setOpenPopUp,
  setpopUpMessage,
}) {
  //selectedOption is the temp address that is selected
  //selectedAddress is the address that is selected (only when the form is submitted we will set the selectedOption to selectedAddress )
  const addresses = useSelector((state) => state.address.addresses);
  const selectedAddress = useSelector((state) => state.address.selectedAddress);
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState(
    selectedAddress ? selectedAddress : null
  );
  const submitForm = (event) => {
    event.preventDefault();
    dispatch(setSelectedAddress(selectedOption));
    close();
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <p className="inline font-bold text-xl">My Address</p>
        <button
          type="button"
          className="inline"
          onClick={() => {
            close();
          }}
        >
          <ImCross></ImCross>
        </button>
      </div>
      <form>
        {[...addresses]
          .sort((a, b) =>
            a.set_default === b.set_default ? 0 : a.set_default ? -1 : 1
          )
          .map((address, index) => {
            return (
              <div key={index} className="w-fit md:w-[502px]">
                <div class="border-b border-grey4border"></div>
                <div className="flex gap-5 w-full py-4">
                  <div>
                    <input
                      className="w-5 h-5 mt-1"
                      type="radio"
                      name="radioButton"
                      value={address.id_address}
                      onClick={() => setSelectedOption(address)}
                      onChange={() => setSelectedOption(address)}
                      checked={
                        address.id_address === selectedOption?.id_address
                      }
                    ></input>
                  </div>

                  <div className="flex flex-col w-full ">
                    <div className="flex justify-between pb-2">
                      <div className="flex gap-2">
                        <p className="font-bold">{address.full_name}</p>
                        <p className="text-gray-500">
                          {address.contact_number}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          dispatch(setWhichForm("editAddress"));
                          dispatch(setAddressToEdit(address));
                        }}
                        className="text-blue-500 font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="flex">
                      <p className="text-gray-500">{address.address_details}</p>
                      <p className="text-gray-500 inline">
                        {","} {address.unit_number}{" "}
                      </p>
                    </div>

                    <p className="text-gray-500">
                      {"S"}
                      {address.postal_code}
                    </p>

                    {address.set_default === true ? (
                      <p className="text-red-500 border border-red-500 w-fit px-1">
                        Default
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}

        <button
          onClick={() => {
            if (addresses.length < 5) {
              dispatch(setWhichForm("addAddress"));
            } else {
              close();
              setOpenPopUp(true);
              setpopUpMessage("Up to 5 addresses allowed");
            }
          }}
          className="w-fit border border-grey4Border px-2 py-1 hover:bg-gray-50 rounded mb-4 md:mb-0"
        >
          + add address
        </button>

        <div className="flex justify-end gap-10">
          <button
            type="button"
            className="border px-2 py-1 rounded-md w-[100px] h-[40px] font-semibold hover:bg-gray-50"
            onClick={() => close()}
          >
            cancel
          </button>
          <button
            onClick={(event) => {
              submitForm(event);
            }}
            type="submit"
            className="w-[100px] h-[40px] border px-2 py-1 rounded-md bg-orangeButton text-white font-semibold hover:bg-orange-400"
          >
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { BuyerApiCalls, Apis } from "../../../utils/ApiCalls";
import { Formik } from "formik";
import { ImCross } from "react-icons/im";
import { PopUpComponent } from "../../GenericComponents";
import "../../../../css/customer.css";
import { useSelector, useDispatch } from "react-redux";
import {
  setAddresses,
  setAddressToEdit,
  setWhichForm,
} from "../../../redux/reducers/addressReducer";

export default function AddEditAddressForm({
  close,
  setPopUpMessage,
  setPopupResult,
  setOpenPopUp,
}) {
  const selectedAddress = useSelector((state) => state.address.selectedAddress);
  const whichForm = useSelector((state) => state.address.whichForm);
  const addressToEdit = useSelector((state) => state.address.addressToEdit);
  const [isCheck, setIsCheck] = useState(false);

  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("customer"));
  const [label, setLabel] = useState("home");
  const checkboxRef = useRef();

  useEffect(() => {
    if (addressToEdit?.set_default === true) {
      setIsCheck(true);
    } else {
      setIsCheck(false);
    }
  }, [addressToEdit]);

  const processRes = (res, api) => {
    if (api !== Apis.retrieveAddress) {
      dispatch(setAddressToEdit(null));
      // dispatch(setAddresses())

      if (res.data) {
        setOpenPopUp(true);

        if (res.data.result === "FAIL") {
          setPopupResult("error");
        } else {
          setPopupResult("success");
          close();
        }

        setPopUpMessage(res.data.message);
      }

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
    }

    if (api === Apis.retrieveAddress) {
      if (res.data.data) {
        dispatch(setAddresses(res.data.data));
      }
    }
  };

  return (
    <Formik
      initialValues={
        addressToEdit
          ? {
              fullName: addressToEdit.full_name,
              phoneNumber: addressToEdit.contact_number,
              postalCode: addressToEdit.postal_code,
              building: addressToEdit.address_details,
              unitNumber: addressToEdit.unit_number,
              addressID: addressToEdit.id_address,
            }
          : {
              fullName: "",
              phoneNumber: "",
              postalCode: "",
              building: "",
              unitNumber: "",
            }
      }
      validate={(values) => {
        const errors = {};
        if (!values.fullName) {
          errors.fullName = "Required";
        }
        if (!values.building) {
          errors.building = "Required";
        }
        if (!values.phoneNumber) {
          errors.phoneNumber = "Required";
        } else if (!/^\d{8}$/.test(values.phoneNumber)) {
          errors.phoneNumber = "Phone number must have 8 digits.";
        }

        if (!values.postalCode) {
          errors.postalCode = "Required";
        }
        // if (!values.unitNumber) {
        //   errors.unitNumber = "Required";
        // }
        if(values.postalCode){
          const isAllNumbers = values.postalCode.split('').every((char) => !isNaN(char) && char !== ' ');
          if(!isAllNumbers) errors.postalCode = "Please enter a valid postal code"
        }

        return errors;
      }}
      onSubmit={(values, { setSubmitting }) => {
        console.log("submit");
        const formData = new FormData();

        formData.append("full_name", values.fullName);
        formData.append("contact_number", values.phoneNumber);
        formData.append("postal_code", values.postalCode);
        formData.append("address_details", values.building);
        if (values.unitNumber && !values.unitNumber.includes("#") && !values.unitNumber === "") {
          values.unitNumber = "#" + values.unitNumber;
        }
        formData.append("unit_number", values.unitNumber);
        formData.append("address_label", label);
        checkboxRef.current && checkboxRef.current.checked === true
          ? formData.append("set_default", true)
          : formData.append("set_default", false);

        whichForm === "editAddress"
          ? BuyerApiCalls(
              formData,
              Apis.editAddress + `${values.addressID}/`,
              "POST",
              {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${user.access}`,
              },
              processRes
            )
          : BuyerApiCalls(
              formData,
              Apis.addAddress,
              "POST",
              {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${user.access}`,
              },
              processRes
            );

        setSubmitting(false);
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
        /* and other goodies */
      }) => (
        <form onSubmit={handleSubmit} className="w-full md:w-[552px]">
          <div className=" flex justify-between mb-4">
            {whichForm === "editAddress" ? (
              <p className="inline font-bold text-xl">Update Address</p>
            ) : (
              <p className="inline font-bold text-xl">Add Address</p>
            )}

            <button
              type="button"
              className="inline"
              onClick={() => {
                dispatch(setAddressToEdit(null));
                close();
              }}
            >
              <ImCross></ImCross>
            </button>
          </div>
          <div className="flex flex-wrap flex-1  gap-4 py-2">
            <div className="flex flex-1 flex-col gap-3">
              <label htmlFor="fullName" className="text-sm">
                Full Name
                <p className="text-red-500 inline">*</p>
              </label>
              <div className="border-2 rounded">
                <input
                  className=" h-10 px-2 w-full "
                  type="text"
                  name="fullName"
                  maxLength="25"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.fullName}
                />
              </div>

              {errors.fullName && touched.fullName && (
                <p className="text-red-500 text-sm">{errors.fullName} </p>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <label htmlFor="phoneNumber" className="text-sm">
                Phone Number
                <p className="text-red-500 inline">*</p>
              </label>
              <div className="border-2 rounded">
                <input
                  className="h-10 px-2 w-full"
                  type="number"
                  name="phoneNumber"
                  onInput={(e) => (e.target.value = e.target.value.slice(0, 8))}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.phoneNumber}
                />
              </div>

              {errors.phoneNumber && touched.phoneNumber && (
                <p className="text-red-500 text-sm">{errors.phoneNumber} </p>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <label htmlFor="postalCode" className="text-sm">
              Postal Code
              <p className="text-red-500 inline">*</p>
            </label>
            <div className="border-2 rounded">
              <input
                className="h-10 px-2 w-full"
                // type="number"
                name="postalCode"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.postalCode}
                onInput={(e) => (e.target.value = e.target.value.slice(0, 6))}
              />
            </div>

            {errors.postalCode && touched.postalCode && (
              <p className="text-red-500 text-sm">{errors.postalCode}</p>
            )}
          </div>

          <div className="flex flex-1 flex-wrap gap-4 py-2 ">
            <div className="flex flex-1 flex-col gap-3">
              <label htmlFor="building" className="text-sm whitespace-nowrap">
                Building, Street and etc{" "}
                <p className="text-red-500 inline">*</p>
              </label>
              <div className="border-2 rounded">
                <input
                  className="h-10 px-2 w-full "
                  type="text"
                  name="building"
                  maxLength="50"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.building}
                />
              </div>
              {errors.building && touched.building && (
                <p className="text-red-500 text-sm">{errors.building}</p>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <label htmlFor="unitNumber" className="text-sm whitespace-nowrap">
                Unit Number <p className="inline text-slate-400">(optional)</p>
              </label>

              <div className="border-2 rounded">
                <input
                  className=" h-10 px-2 w-full"
                  type="text"
                  name="unitNumber"
                  maxLength="16"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.unitNumber}
                />
              </div>

              {errors.unitNumber && touched.unitNumber && (
                <p className="text-red-500 text-sm">{errors.unitNumber}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start gap-3">
            <p className="capitalize text-sm font-medium">Label As</p>
            <div className="flex items-start gap-3">
              <button
                type="button"
                className={`text-sm border w-[82px] h-[41px] rounded-[4px] ${
                  label === "home" ? "bg-orangeButton" : "bg-white"
                }`}
                onClick={() => setLabel("home")}
                value="home"
              >
                Home
              </button>
              <button
                type="button"
                className={`text-sm border w-[82px] h-[41px] rounded-[4px] ${
                  label === "work" ? "bg-orangeButton" : "bg-white"
                }`}
                onClick={() => setLabel("work")}
                value="work"
              >
                Work
              </button>
            </div>
          </div>
          {addressToEdit?.set_default !== true && (
            <div className="flex items-center gap-[23px] mt-[24px]">
              <input
                type="checkbox"
                name="checkbox"
                ref={checkboxRef}
                checked={isCheck}
                onChange={() => setIsCheck(!isCheck)}
              />

              <p className="capitalize text-sm">Set as default address</p>
            </div>
          )}

          <div className="grid justify-items-end">
            {addressToEdit ? (
              <div className="flex justify-end gap-10">
                {/* <button
                  className="border px-2 py-1 rounded-md w-[100px] h-[40px] font-semibold"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    close();
                    dispatch(setWhichForm("viewAddress"));
                    dispatch(setAddressToEdit(null));
                  }}
                >
                  Cancel
                </button> */}

                <button
                  className="w-[100px] h-[40px] border px-2 py-1 rounded-md bg-orangeButton text-white font-semibold"
                  type="submit"
                  disabled={isSubmitting}
                >
                  Confirm
                </button>
              </div>
            ) : (
              <button
                className="mt-6 px-2 py-2 bg-amber-500 text-white rounded"
                type="submit"
                disabled={isSubmitting}
              >
                Add Address
              </button>
            )}
          </div>
        </form>
      )}
    </Formik>
  );
}

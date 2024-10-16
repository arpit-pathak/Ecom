import Form from "../../../generic/Forms";
import { ApiCalls, AdminApis, HttpStatus } from "../../../../utils";
import { showToast } from "../../../generic/Alerts";
import { GridStyle } from "../../../../styles/FormStyles";
import useAuth from "../../../../hooks/UseAuth";
import { useEffect, useState } from "react";

const OTHERS_TEXT = "Others (please specify)" ;

export default function CustomerAddEditForm({
  onClose,
  countryData,
  findFromChoices,
  props,
  isEdit,
}) {
  const auth = useAuth();
  const [showOtherReasonField, setShowOtherReasonField] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("SG");
  const [selectedCountryCode, setSelectedCountryCode] = useState(props?.country_code ??"+65");

  let commonFields = [
    {
      name: "username",
      type: "text",
      label: "Username",
      validation: "required",
      defaultValue: props?.username ?? "",
    },
    {
      name: "contact_number",
      type: "fieldWithPrefix",
      label: "Contact Number",
      validation: "required",
      defaultValue: props?.contact_number ?? "",
    },
    {
      name: "email",
      type: "email",
      label: "Email ID",
      validation: "required",
      defaultValue: props?.email ?? "",
    },
    {
      name: "status_id",
      type: "select",
      label: "Status",
      options: [
        { value: "1", label: "Active" },
        { value: "2", label: "Inactive" },
        { value: "3", label: "Block" },
      ],
      defaultValue: props?.userstatus_id.toString() ?? "1",
    },
    {
      name: "email_subscription",
      type: "radio",
      label: "Email Subscription",
      label1: "Yes",
      value1: "y",
      label2: "No",
      value2: "n",
      defaultValue:  props?.email_subscription ?? "y"
    },
    {
      name: "sms_subscription",
      type: "radio",
      label: "SMS Subscription",
      label1: "Yes",
      value1: "y",
      label2: "No",
      value2: "n",
      defaultValue: props?.sms_subscription ?? "y"
    },
    {
      name: "find_from",
      type: "select",
      label: "Where did you hear about uShop?",
      options: findFromChoices,
      defaultValue: props?.find_from ? 
                      findFromChoices.find(elem => Object.values(elem).includes(props?.find_from)) ?
                      props?.find_from :OTHERS_TEXT 
                    : "", 
    },
  ];

  let formFields = [
    ...commonFields,
    {
      name: "remarks",
      type: "text",
      label: "Remarks",
      validation: "required",
      defaultValue:  !(findFromChoices.find(elem => Object.values(elem).includes(props?.find_from)))
             ? props?.find_from : "",
    },
  ];

  useEffect(()=>{
    if(isEdit && !(findFromChoices.find(elem => Object.values(elem).includes(props?.find_from)))) 
      setShowOtherReasonField(true)
  },[])

  const handleSelectChange = (e) => {
    e.preventDefault();
    const selectedValue = e.target.value;

    if (selectedValue === OTHERS_TEXT)
      setShowOtherReasonField(true);
    else setShowOtherReasonField(false);
  };

  const handleCountrySelection = (code) => {
    let selectedCode = countryData?.newCountryList.find(
      (item) => item.code === code
    );
    setSelectedCountryCode(selectedCode);
    setSelectedCountry(code);
  };

  const handleConfirmation = async (formData) => {
    formData.append("country_code", selectedCountryCode);

    if (isEdit) {
      await ApiCalls(
        AdminApis.editCustomer + `${props.id_user}/`,
        "POST",
        formData,
        false,
        auth.token.access
      )
        .then((response) => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            showToast(response.data.message, "success");
            onClose({ edit: true });
          }
        })
        .catch((error) => {
          showToast(error.response.data.message, "error");
        });
    } else {
      await ApiCalls(
        AdminApis.addCustomer,
        "POST",
        formData,
        false,
        auth.token.access
      )
        .then((response) => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            showToast(response.data.message, "success");
            onClose(true);
          }
        })
        .catch((error) => {
          showToast(error.response.data.message, "error");
        });
    }
  };

  return (
    <>
      <Form
        form={showOtherReasonField ? formFields : commonFields}
        styles={GridStyle}
        onCancel={() => (isEdit ? onClose({ edit: false }) : onClose(false))}
        onSubmit={handleConfirmation}
        confirmButtonText={isEdit ? "Update" : "Add"}
        validationRequired={true}
        handleSelectChange={handleSelectChange}
        countryHandler={{
          selectedCountry: selectedCountry,
          handleCountrySelection: handleCountrySelection,
          individualCountryList: countryData?.individualCountryList,
          customLabels: countryData?.customLabels,
        }}
      />
    </>
  );
}

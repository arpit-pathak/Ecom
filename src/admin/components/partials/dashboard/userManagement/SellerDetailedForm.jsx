import { ReverseStatusMapping, UserStatusChoices } from '../../../../utils';
import { Form, Button, DetailSection } from '../../../generic';
import { GridStyle } from '../../../../styles/FormStyles';

export default function SellerDetailedForm({ onClose, props }) {

  const personalDetails = [
    {
      name: "email",
      type: "email",
      label: "Email",
      disabled: '{true}',
      defaultValue: props?.email,
    },
    {
      name: "phone",
      type: "text",
      disabled: '{true}',
      label: "Phone Number",
      defaultValue: props?.contact_number,
    },
    {
      name: "status_id",
      type: "select",
      label: "Status",
      options: UserStatusChoices,
      disabled: '{true}',
      defaultValue: ReverseStatusMapping(props?.user_status),
    },
    {
      name: "find_from",
      type: "text",
      disabled: '{true}',
      label: "Find From",
      defaultValue: props?.find_from,
    },
  ];


  const bankDetails = [
    {
      name: "bank_name",
      type: "text",
      label: "Bank Name",
      disabled: '{true}',
      defaultValue: props?.bank_name,
    },
    {
      name: "account_number",
      type: "text",
      disabled: '{true}',
      label: "Bank Account Number",
      defaultValue: props?.account_number,
    },
  ];


  const pickupDetails = [
    {
      name: "pickup_address",
      type: "text",
      label: "Pickup Address",
      disabled: '{true}',
      defaultValue: props?.pickup_address,
    },
    {
      name: "pickup_city",
      type: "text",
      disabled: '{true}',
      label: "Pickup City",
      defaultValue: props?.pickup_city,
    },
    {
      name: "pickup_state",
      type: "text",
      disabled: '{true}',
      label: "Pickup State",
      defaultValue: props?.pickup_state,
    },
  ];

  const businessDetails = [
    {
      name: "business_name",
      type: "text",
      label: "Business Name",
      disabled: '{true}',
      defaultValue: props?.business_name,
    },
    {
      name: "uen_number",
      type: "text",
      disabled: '{true}',
      label: "Uen Number",
      defaultValue: props?.uen_number,

    },
  ];

  // const shippingOptions = [
  //   {
  //     name: "shipping_name",
  //     type: "text",
  //     label: "Shipping Name",
  //     disabled: '{true}',
  //     defaultValue: props?.shipping_name,
  //   },
  // ];

  const sellerSections = [
    {
      title: "Seller Details",
      form: <Form form={personalDetails} styles={GridStyle} needButtons={false} />
    },
    {
      title: "Bank Details",
      form: <Form form={bankDetails} styles={GridStyle} needButtons={false} />
    },
    {
      title: "Pickup Details",
      form: <Form form={pickupDetails} styles={GridStyle} needButtons={false} />
    },
    {
      title: "Business Details",
      form: <Form form={businessDetails} styles={GridStyle} needButtons={false} />
    },
    // {
    //   title: "Shipping Options",
    //   form: <Form form={shippingOptions} styles={GridStyle} needButtons={false} />
    // },
  ]

  return (
    <>
      {sellerSections.map((section, index) => (
        <DetailSection
          key={index}
          title={section.title}
          form={section.form}
        />
      ))}
      <Button
        onClick={() => onClose({ edit: "true" })}
        text="Back"
        type="cancel"
        py="2"
        px="3"
      />
    </>
  )

}

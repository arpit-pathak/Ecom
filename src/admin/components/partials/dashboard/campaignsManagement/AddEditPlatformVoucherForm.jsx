import Form from '../../../generic/Forms'
import { ApiCalls, AdminApis, HttpStatus } from '../../../../utils';
import { showToast } from '../../../generic/Alerts';
import { GridStyle } from '../../../../styles/FormStyles';
import useAuth from '../../../../hooks/UseAuth';


export default function AddEditPlatformVoucherForm({ onClose, props }) {
  const auth = useAuth();

  const formFields = [
    {
      name: "voucher_name",
      type: "text",
      label: "Voucher Name",
      defaultValue: props?.voucher_name ?? "",
      validation: "required",
    },
    {
      name: "voucher_code",
      type: "text",
      label: "Voucher Code",
      defaultValue: props?.voucher_code ?? "",
      validation: "required",
    },
    {
      name: "from_date",
      type: "datepicker",
      label: "From Date",
      defaultValue: props?.from_date ? new Date(props.from_date) : new Date(),
    },
    {
      name: "to_date",
      type: "datepicker",
      label: "To Date",
      defaultValue: props?.to_date ? new Date(props.to_date) : new Date(),
    },
    {
      name: "target_buyer",
      type: "select",
      label: "Target Buyer",
      options: [
        { value: "all_buyer ", label: "All Buyer" },
        { value: "new_buyer", label: "New Buyer" },
      ],
      defaultValue: props?.target_buyer ?? "all_buyer",
    },
    {
      name: "discount_type",
      type: "select",
      label: "Discount Type",
      options: [
        { value: "percentage", label: "Percentage" },
        { value: "fixed", label: "Fixed" },
      ],
      defaultValue: props?.discount_type ?? "percentage",
    },
    {
      name: "discount_type_amount",
      type: "number",
      validation: "required|min:0,num|max:100,num",
      label: "Discount Type Amount",
      defaultValue: props?.discount_type_amount ?? "",
    },
    {
      name: "usage_limit",
      type: "number",
      validation: "required|min:1,num",
      label: "Usage Limit",
      defaultValue: props?.usage_limit ?? "",
    },
    {
      name: "minimum_spend",
      type: "number",
      validation: "required|min:0,num",
      label: "Minimum Spend",
      defaultValue: props?.minimum_spend ?? "",
    },
    {
      name: "maximum_discount",
      type: "number",
      validation: "required|min:0,num",
      label: "Maximum Discount",
      defaultValue: props?.maximum_discount ?? "",
    },
    {
      name: "is_multiple_redeem",
      type: "switch",
      label: "Is Multiple Redeem",
      defaultValue: props?.is_multiple_redeem ?? "off",
    },
    {
      name: "usage_per_day",
      type: "number",
      validation: "min:0,num",
      label: "Usage Per Day",
      defaultValue: props?.usage_per_day ?? "",
    },
  ];

  /*
  * Should only perform API calls here and not in the generic form component
  * Since we want to keep the generic form component in a OCP(Open-closed Principle) state
  */
  const handleConfirmation = async (formData) => {
    let url = AdminApis.addVoucher;
    if (props?.id_voucher) {
      url = `${AdminApis.editVoucher}${props.id_voucher}/`
    }

    await ApiCalls(url, "POST", formData, false, auth.token.access)
      .then(response => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          showToast(response.data.message, "success", "add-platform")
          onClose({ update: true })
        }
      }).catch(error => {
        showToast(error.response.data.message, "error")
      });
  }

  return (
    <>
      <Form
        form={formFields}
        styles={GridStyle}
        onCancel={() => onClose({ update: false })}
        onSubmit={handleConfirmation}
        validationRequired={true}
      />
    </>
  )

}


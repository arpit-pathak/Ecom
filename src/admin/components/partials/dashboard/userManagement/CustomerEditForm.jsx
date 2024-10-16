import Form from '../../../generic/Forms'
import { ApiCalls, AdminApis, HttpStatus, ReverseStatusMapping } from '../../../../utils';
import { showToast } from '../../../generic/Alerts';
import { GridStyle } from '../../../../styles/FormStyles';
import useAuth from '../../../../hooks/UseAuth';

export default function CustomerEditForm({ onClose, props }) {
  const auth = useAuth()

  const formFields = [
    {
      name: "name",
      type: "text",
      disabled: '{true}',
      label: "Name",
      defaultValue: props?.name,
    },
    {
      name: "phone",
      type: "text",
      disabled: '{true}',
      label: "Phone Number",
      defaultValue: props?.contact_number,
    },
    {
      name: "email",
      type: "email",
      label: "Email",
      disabled: '{true}',
      defaultValue: props?.email,
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
      defaultValue: ReverseStatusMapping(props?.user_status),
    },
  ];


  /*
  * Should only perform API calls here and not in the generic form component
  * Since we want to keep the generic form component in a OCP(Open-closed Principle) state
  */
  const handleConfirmation = async (formData) => {
    formData.append("user_id", props.id_user);
    await ApiCalls(AdminApis.editCustomer, "POST", formData, false, auth.token.access)
      .then(response => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          showToast(response.data.message, "success")
          onClose({ edit: true });
        }
      }).catch(error => {
        showToast(error.response.data.message, "error")

      });
  };

  return (
    <>
      <Form form={formFields} styles={GridStyle} onCancel={() => onClose({ edit: "true" })} onSubmit={handleConfirmation} />
    </>
  )

}

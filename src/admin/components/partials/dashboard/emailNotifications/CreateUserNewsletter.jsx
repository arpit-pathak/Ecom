import { showToast } from "../../../generic/Alerts";
import { FormStyle } from "../../../../styles/FormStyles";
import { ApiCalls, AdminApis, HttpStatus } from "../../../../utils";
import { Form } from "../../../generic";
import useAuth from "../../../../hooks/UseAuth";

export default function CreateUserNewsletter({onClose,sendToChoices}) {
  const auth = useAuth();

  const newsletterFields = [
    {
      name: "send_to",
      type: "select",
      label: "Send To",
      options: sendToChoices,
      defaultValue: sendToChoices[0].value,
    },
    {
      name: "message_subject",
      type: "text",
      label: "Subject",
      validation: "required",
    },
    {
      name: "text_message",
      type: "richText",
      label: "Message",
      defaultValue: "",
    },
  ];

  const handleConfirmation = async (formData, editorData) => {
    let url = AdminApis.createUserNewsletter;
    formData.append("text_message", editorData);

    await ApiCalls(url, "POST", formData, false, auth.token.access)
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          showToast(response.data.message, "success", "add-category");
          onClose({ add: true });
        }
      })
      .catch((error) => {
        showToast(error.response.data.message, "error");
      });
  };

  return (
    <>
      <Form
        form={newsletterFields}
        styles={FormStyle}
        onCancel={() =>  onClose({ add: false })}
        onSubmit={handleConfirmation}
        validationRequired={true}
        confirmButtonText={"Create"}
      />
    </>
  );
}

import { showToast } from '../../../../generic/Alerts';
import { FormStyle } from '../../../../../styles/FormStyles';
import { ApiCalls, AdminApis, HttpStatus } from '../../../../../utils';
import { Form } from '../../../../generic';
import useAuth from '../../../../../hooks/UseAuth';
import { useEffect, useState } from 'react';

export default function AddEditFAQCategory({ onClose, props }) {
  const auth = useAuth();
  const [formFields, setFormFields] = useState([])

  useEffect(()=>{
    let currentFields = []
    if(!props?.parent_category_name){
      currentFields = [
        {
          name: "faq_type",
          type: "select",
          label: "FAQ Category",
          options: props?.faqTypes,
          defaultValue: props?.edit_data?.faq_type ?? props?.faqTypes[0]?.value,
        },
        {
          name: "name",
          type: "text",
          label: "Category Name",
          validation: "required",
          defaultValue: props.edit_data?.name ?? "",
        }
      ];
    }else{
      currentFields = [
        {
          name: "name",
          type: "text",
          label: "Category Name",
          validation: "required",
          defaultValue: props.edit_data?.name ?? "",
        }
      ];
    }
    setFormFields([...currentFields])
  },[])

  const handleConfirmation = async (formData) => {
    formData.set("name", formData.get("name").trim()) //Trim leading and trailing spaces
    let url = AdminApis.addFaqCategory

    if (props?.edit_data?.id_faq_category) {
      url = `${AdminApis.editFaqCategory}${parseInt(props?.edit_data.id_faq_category)}/` //Append id if editing mode
    }
    if (props?.id_faq_category) {
      formData.append("parent_id", parseInt(props.id_faq_category));
    }

    await ApiCalls(url, "POST", formData, false, auth.token.access)
      .then(response => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          showToast(response.data.message, "success", "add-faq-category")
          onClose({ add: true });
        }
      }).catch(error => {
        showToast(error.response.data.message, "error")
      });
  }

  return (
    <>
      <Form
        form={formFields}
        styles={FormStyle}
        onCancel={() => onClose({ add: false })}
        onSubmit={handleConfirmation}
        validationRequired={true}
        confirmButtonText={props.edit_data ? "Save" : "Create"}
      />
    </>
  );

}

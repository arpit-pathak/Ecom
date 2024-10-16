import { showToast } from '../../../generic/Alerts';
import { FormStyle } from '../../../../styles/FormStyles';
import { ApiCalls, AdminApis, HttpStatus } from '../../../../utils';
import { Form } from '../../../generic';
import useAuth from '../../../../hooks/UseAuth';

export default function AddEditCategory({ onClose, props }) {
  const auth = useAuth();

  const category = [
    {
      name: "name",
      type: "text",
      label: "Category Name",
      validation: "required",
      defaultValue: props.edit_data?.name ?? "",
    },
    {
      name: "category_image",
      type: "file",
      style: "mb-4 relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary",
      current_image: { "img_url": props.edit_data?.img_url ?? undefined },
    },
  ];

  const handleConfirmation = async (formData) => {
    formData.set("name", formData.get("name").trim()) //Trim leading and trailing spaces
    const categoryNames = ["main_category_name", "second_category_name", "third_category_name"];
    let url = AdminApis.addCategory

    if (props.edit_data?.id_category) {
      url = `${AdminApis.editCategory}${parseInt(props.edit_data.id_category)}/` //Append id if editing mode
    }

    if (props?.id_category) {
      formData.append("parent_id", parseInt(props.id_category));
    }

    for (const category of categoryNames) {
      const value = props?.[category] || props?.edit_data?.[category];
      if (value) {
        formData.append(category, value);
      }
    }

    await ApiCalls(url, "POST", formData, false, auth.token.access)
      .then(response => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          showToast(response.data.message, "success", "add-category")
          onClose({ add: true });
        }
      }).catch(error => {
        showToast(error.response.data.message, "error")
      });
  }

  return (
    <>
      <Form form={category} styles={FormStyle} onCancel={() => onClose({ add: false })} onSubmit={handleConfirmation} validationRequired={true} confirmButtonText={props.edit_data ? "Save" : "Create"} />
    </>
  )

}

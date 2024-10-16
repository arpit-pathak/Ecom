import { showToast } from '../../../generic/Alerts';
import { FormStyle } from '../../../../styles/FormStyles';
import { ApiCalls, AdminApis, HttpStatus, GeneralStatusChoices, ReverseStatusMapping, LanguageChoices } from '../../../../utils';
import { Form } from '../../../generic';
import useAuth from '../../../../hooks/UseAuth';

export default function AddEditBlogCategory({ onClose, props }) {
    const auth = useAuth();

    const formFields = [
        {
            name: "name",
            type: "text",
            label: "Category Name",
            validation: "required",
            defaultValue: props?.name ?? "",
        },
        {
            name: "lang_code",
            type: "select",
            label: "Language",
            options: LanguageChoices,
            defaultValue: props?.lang_code,
        },
        {
            name: "status_id",
            type: "select",
            label: "Status",
            options: GeneralStatusChoices,
            defaultValue: ReverseStatusMapping(props?.general_status),
        },
        {
            name: "meta_title",
            type: "text",
            label: "Meta Title",
            defaultValue: props?.meta_title ?? "",
        },
        {
            name: "meta_description",
            type: "text",
            label: "Meta Description",
            defaultValue: props?.meta_description ?? "",
        }
    ];

    const handleConfirmation = async (formData) => {
        const url = props?.id_category ? `${AdminApis.editBlogCategory}${props.id_category}/` : AdminApis.addBlogCategory;

        await ApiCalls(url, "POST", formData, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    showToast(response.data.message, "success", "add-edit-blog-category")
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
            />
        </>
    )
}


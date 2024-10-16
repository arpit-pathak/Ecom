import { showToast } from '../../../generic/Alerts';
import { FormStyle } from '../../../../styles/FormStyles';
import { ApiCalls, AdminApis, HttpStatus, GeneralStatusChoices, ReverseStatusMapping } from '../../../../utils';
import { Form } from '../../../generic';
import useAuth from '../../../../hooks/UseAuth';

export default function AddEditBlog({ onClose, props, categories }) {
    const auth = useAuth();

    const formFields = [
        {
            name: "title",
            type: "text",
            label: "Title",
            validation: "required",
            defaultValue: props?.title ?? "",
        },
        {
            name: "category_id",
            type: "select",
            label: "Category",
            options: categories,
            defaultValue: props?.category_id,
        },
        {
            name: "status_id",
            type: "select",
            label: "Status",
            options: GeneralStatusChoices,
            defaultValue: ReverseStatusMapping(props?.general_status),
        },
        {
            name: "thumbnail_img",
            type: "file",
            style: "mb-4 relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary",
            current_image: { "img_url": props?.thumb_img_850X410 ?? undefined },
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
        },
        {
            name: "blog_detail",
            type: "richText",
            label: "Blog Details",
            defaultValue: props?.blog_detail ?? "",
        },
    ];

    const handleConfirmation = async (formData, editorData) => {
        const url = props?.id_blog ? `${AdminApis.editBlog}${props.id_blog}/` : AdminApis.addBlog;
        formData.append("blog_detail", editorData);

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


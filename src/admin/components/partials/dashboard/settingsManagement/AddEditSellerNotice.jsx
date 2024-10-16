import { showToast } from '../../../generic/Alerts';
import { FormStyle } from '../../../../styles/FormStyles';
import { ApiCalls, AdminApis, HttpStatus } from '../../../../utils';
import { Form } from '../../../generic';
import useAuth from '../../../../hooks/UseAuth';

export default function AddEditSellerNotice({ onClose, props }) {
    const auth = useAuth();

    const formFields = [
        {
            name: "message_title",
            type: "text",
            label: "Message Title",
            defaultValue: props?.message_title,
            validation: "required",
        },
        {
            name: "message",
            type: "textarea",
            label: "Message",
            row: 5,
            defaultValue: props?.message,
            validation: "required",
        },
        {
            name: "start_date",
            type: "datepicker",
            label: "Start Date",
            defaultValue: props?.start_date ? new Date(props.start_date) : new Date(),
            date_format: "yyyy-MM-dd"
        },
        {
            name: "end_date",
            type: "datepicker",
            label: "End Date",
            defaultValue: props?.end_date ? new Date(props.end_date) : new Date(),
            date_format: "yyyy-MM-dd"
        },
    ];

    const handleConfirmation = async (formData) => {
        const url = props?.id_notification ? `${AdminApis.sellerNoticeUpdate}${props?.id_notification}/`
            : AdminApis.sellerNoticeAdd;

        await ApiCalls(url, "POST", formData, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    showToast(response.data.message, "success", "add-edit-notice")
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


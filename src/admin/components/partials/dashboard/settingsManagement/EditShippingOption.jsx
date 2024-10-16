import Form from '../../../generic/Forms'
import { ApiCalls, AdminApis, HttpStatus, GeneralStatusChoices } from '../../../../utils';
import { showToast } from '../../../generic/Alerts';
import { FormStyle } from '../../../../styles/FormStyles';
import useAuth from '../../../../hooks/UseAuth';

export default function EditShippingOption({ onClose, props }) {
    const auth = useAuth();

    const formFields = [
        {
            name: "name",
            type: "text",
            label: "Shipping Name",
            defaultValue: props?.name,
            validation: "required",
        },
        {
            name: "description",
            type: "text",
            label: "Shipping Description",
            defaultValue: props?.description,
            validation: "required",
        },
        {
            name: "status_id",
            type: "select",
            label: "Status",
            options: GeneralStatusChoices,
            defaultValue: props?.status_id,
        },
    ];

    const handleConfirmation = async (formData) => {
        let url = AdminApis.shippingOptionsList;
        if (props?.id_shipping_option) {
            url = `${AdminApis.shippingOptionsList}${props.id_shipping_option}/`
        }
        await ApiCalls(url, "POST", formData, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    showToast(response.data.message, "success", "shipping-options-success")
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
                onCancel={() => onClose({ update: false })}
                onSubmit={handleConfirmation}
                validationRequired={true} />
        </>
    )

}


import { showToast } from '../../../generic/Alerts';
import { FormStyle } from '../../../../styles/FormStyles';
import { ApiCalls, AdminApis, HttpStatus } from '../../../../utils';
import { Form } from '../../../generic';
import useAuth from '../../../../hooks/UseAuth';

export default function AddEditProhibitedKeyword({
    onClose, props
}) {
    const auth = useAuth();

    const formFields = [
        {
            name: "keyword",
            type: "text",
            label: "Keyword",
            validation: "required",
            defaultValue: props?.keyword,
        },
    ];

    const handleConfirmation = async (formData) => {
       
        const url = props?.id_keyword ? `${AdminApis.prohibitedKeywordEdit}${props?.id_keyword}/`
            : `${AdminApis.prohibitedKeywordAdd}`;

        await ApiCalls(url, "POST", formData, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    showToast(response.data.message, "success", "add-edit-prohibited-keyword")
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


import { showToast } from '../../../generic/Alerts';
import { FormStyle } from '../../../../styles/FormStyles';
import { ApiCalls, AdminApis, HttpStatus, ToggleVisibility } from '../../../../utils';
import { Form } from '../../../generic';
import useAuth from '../../../../hooks/UseAuth';
import { useEffect } from 'react';

export default function AddEditReason({
    onClose, props, options, parentList
}) {
    const auth = useAuth();

    const formFields = [
        {
            name: "slug",
            type: "select",
            label: "User Type",
            options: [
                { value: "buyer", label: "Buyer" },
                { value: "seller", label: "Seller" },
                { value: "ushop", label: "uShop" },
            ],
            defaultValue: props?.reason_for
        },
        {
            name: "reason_type",
            type: "select",
            label: "Reason Type",
            options: options,
            defaultValue: props?.reason_type
        },
        {
            name: "parent_reason",
            type: "select",
            label: "Parent Reason",
            options: [
                { value: "", label: "Select Option" },
                ...parentList
            ],
            defaultValue: props?.parent_id,
        },
        {
            name: "reason",
            type: "text",
            label: "Reason",
            validation: "required",
            defaultValue: props?.reason,
        },
        {
            name: "description",
            type: "text",
            label: "Description",
            defaultValue: props?.description,
        },
    ];

    const handleConfirmation = async (formData) => {
        let slug = formData.get("slug")
        let reason_type = formData.get("reason_type")
        let parent_id = formData.get("parent_reason")
        if (parent_id) {
            formData.append("parent_id", parent_id)
        }
        const url = props?.id_cancellation ? `${AdminApis.cancelReasonsEdit}${slug}/${reason_type}/${props?.id_cancellation}/`
            : `${AdminApis.cancelReasonsAdd}${slug}/${reason_type}/`;

        await ApiCalls(url, "POST", formData, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    showToast(response.data.message, "success", "add-edit-reason")
                    onClose({ add: true });
                }
            }).catch(error => {
                showToast(error.response.data.message, "error")
            });
    }

    const handleSelectChange = (e) => {
        e.preventDefault();
        const selectedValue = e.target.value;
        const selectedId = e.target.id;
        const reasonType = document.getElementById("reason_type");
        const userType = document.getElementById("slug");
        const parentReason = document.getElementById("parent_reason");
        const parentLabel = document.getElementById("label_parent_reason");

        const shouldToggleVisibility = () => {
            return (
                (selectedId === "reason_type" && selectedValue === "order-return" && userType.value === "buyer") ||
                (selectedId === "slug" && selectedValue === "buyer" && reasonType.value === "order-return") ||
                (selectedId === "parent_reason")
            );
        };

        ToggleVisibility(parentReason, shouldToggleVisibility());
        ToggleVisibility(parentLabel, shouldToggleVisibility());
    };

    useEffect(() => {
        const parentReason = document.getElementById("parent_reason");
        const parentLabel = document.getElementById("label_parent_reason");
        if (props?.reason_type === "order-cancel") {
            ToggleVisibility(parentReason, false)
            ToggleVisibility(parentLabel, false)
        }
    }, [props?.reason_type]);

    return (
        <>
            <Form
                form={formFields}
                styles={FormStyle}
                onCancel={() => onClose({ add: false })}
                onSubmit={handleConfirmation}
                validationRequired={true}
                handleSelectChange={handleSelectChange}
            />
        </>
    )
}


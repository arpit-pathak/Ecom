import { showToast } from '../../../generic/Alerts';
import { FormStyle } from '../../../../styles/FormStyles';
import { ApiCalls, AdminApis, HttpStatus, ReverseStatusMapping } from '../../../../utils';
import { Form } from '../../../generic';
import useAuth from '../../../../hooks/UseAuth';
import { useState } from 'react';
import { PageLoader } from '../../../../../utils/loader';

export default function AddEditBanner({ onClose, props }) {
    const auth = useAuth();
    const [isLoading, setIsLoading] = useState(false)

    const formFields = [
        {
            name: "title",
            type: "select",
            label: "Title",
            //List of banners already linked to customer frontend
            options: [
                { value: "Promotion Banner", label: "Promotion Banner" },
                { value: "Home Page: Banner 1", label: "Home Page: Banner 1" },
                { value: "Home Page: Banner 2", label: "Home Page: Banner 2" },
                { value: "Home Page: Banner 3", label: "Home Page: Banner 3" },
                { value: "Home Page: Banner 4", label: "Home Page: Banner 4" },
                { value: "Product Page: Banner 1", label: "Product Page: Banner 1" },
                { value: "Product Page: Banner 2", label: "Product Page: Banner 2" },
                { value: "Product Page: Banner 3", label: "Product Page: Banner 3" },
            ],
            defaultValue: props?.title,
        },
        {
            name: "banner_type",
            type: "select",
            label: "Banner For",
            options: [
                { value: "customer", label: "Customer" },
                { value: "seller", label: "Seller" },
            ],
            defaultValue: props?.banner_type ?? "customer",
        },
        {
            name: "content_url",
            type: "text",
            label: "Content Url",
            defaultValue: props?.content_url ?? "",
        },
        {
            name: "banner_image",
            type: "file",
            style: "relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary",
            current_image: { "img_url": props?.image_url },
            downloadType: "web"
        },
        {
            name: "mobile_banner_image",
            type: "file",
            style: "relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary",
            current_image: { "img_url": props?.mobile_image_url },
            title: "Upload Image for Mobile",
            downloadType: "mobile"
        },
        {
            name: "banner_description",
            type: "textarea",
            label: "Banner Description",
            row: 5,
            defaultValue: props?.banner_description ?? "",
        },
        {
            name: "status",
            type: "select",
            label: "Status",
            options: [
                { value: "1", label: "Active" },
                { value: "2", label: "Inactive" },
            ],
            defaultValue: ReverseStatusMapping(props?.status),
        },
        {
            name: "start_date",
            type: "datepicker",
            label: "From Date",
            defaultValue: props?.start_date ? new Date(props.start_date) : new Date(),
        },
        {
            name: "end_date",
            type: "datepicker",
            label: "To Date",
            defaultValue: props?.end_date ? new Date(props.end_date) : new Date(),
        },
    ];

    const handleConfirmation = async (formData) => {
        setIsLoading(true)
        let url = AdminApis.addBanner

        if (props?.id_banner) {
            url = `${AdminApis.editBanner}${props.id_banner}/` //Append id if editing mode
        }

        await ApiCalls(url, "POST", formData, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    showToast(response.data.message, "success", "add-edit-banner")
                    onClose({ add: true });
                }
                setIsLoading(false)
            }).catch(error => {
                showToast(error.response.data.message, "error")
                setIsLoading(false)
            });
    }

    const downloadBanner = (type) => {
      var link = document.createElement("a");
      link.href = type === "mobile" ? props.mobile_image_url : props?.image_url;
      link.target = "_blank";
      link.download = "banner_image.jpg";
      link.click();
    };

    return (
      <>
        {isLoading ? (
          <PageLoader />
        ) : (
          <Form
            form={formFields}
            styles={FormStyle}
            onCancel={() => onClose({ add: false })}
            onSubmit={handleConfirmation}
            downloadBanner={downloadBanner}
            checkUpdate={true}
          />
        )}
      </>
    );
}


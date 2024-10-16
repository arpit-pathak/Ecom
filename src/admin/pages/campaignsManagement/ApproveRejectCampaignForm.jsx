import { ApiCalls, AdminApis, HttpStatus, GeneralStatus, CommonStrings, ConvertStringToDate } from '../../utils';
import { showToast } from '../../components/generic/Alerts';
import { FormStyle } from '../../styles/FormStyles';
import { Form } from '../../components/generic';
import { useLocation, useNavigate } from 'react-router-dom';
import PageLayoutHOC from '../PageLayoutHOC';
import useAuth from '../../hooks/UseAuth';

const ApproveRejectCampaignForm = () => {
    const location = useLocation();
    const state = location.state;
    const navigate = useNavigate();
    const auth = useAuth();

    const formFields = [
        {
            name: "placement",
            type: "text",
            label: "Placement",
            disabled: true,
            defaultValue: state.placement ?? CommonStrings.NONE,

        },
        {
            name: "banner_image",
            type: "image",
            label: "Banner Image",
            imageUrl: state.banner_url ?? null,
        },
        {
            name: "add_remarks",
            type: "textarea",
            label: "Additional Remarks",
            disabled: true,
            row: 5,
            defaultValue: state.add_remarks ?? CommonStrings.NONE,

        },
        {
            name: "campaign_slots",
            type: "text",
            label: "Selected Campaign Slots",
            disabled: true,
            defaultValue: state?.campaign_detail?.campaign_slot?.toString() ?? ""
        },
    ];

    const handleReject = async () => {
        const formData = new FormData();
        formData.append("campaign_id", state.id_campaign);
        formData.append("user_id", auth.user.user_id);
        await ApiCalls(AdminApis.approveRejectCampaign, "POST", formData, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    showToast(response.data.message, "success")
                }
            }).catch(error => {
                if (error.response.status === HttpStatus.HTTP_403_FORBIDDEN) {
                    showToast(CommonStrings.ACTION_NO_PERMISSION, "error")
                } else {
                    showToast(error.response.data.message, "error")
                }
            });
    }

    /*
    * Should only perform API calls here and not in the generic form component
    * Since we want to keep the generic form component in a OCP(Open-closed Principle) state
    */
    const handleConfirmation = async () => {
        const formData = new FormData();
        formData.append("campaign_id", state.id_campaign);
        formData.append("approve", GeneralStatus.GENERALSTATUS_APPROVE);
        formData.append("user_id", auth.user.user_id);
        await ApiCalls(AdminApis.approveRejectCampaign, "POST", formData, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    showToast(response.data.message, "success")
                }
            }).catch(error => {
                if (error.response.status === HttpStatus.HTTP_403_FORBIDDEN) {
                    showToast(CommonStrings.ACTION_NO_PERMISSION, "error")
                } else {
                    showToast(error.response.data.message, "error")
                }
            });
    }

    const downloadBanner = () => {
            var link = document.createElement('a');
            link.href = state.org_file_url;
            link.target = "_blank";
            link.download = "banner_image.jpg"
            link.click();
      };

    return (
        <>
            <div className="min-h-screen text-gray-900 bg-white">
                <main className="px-4 pt-4 pb-4 mx-auto sm:px-6 lg:px-8">
                    <Form form={formFields}
                        styles={FormStyle}
                        onCancel={handleReject}
                        onSubmit={handleConfirmation}
                        confirmButtonText="Approve"
                        backButtonText="Reject"
                        onBack={() => navigate(-1)}
                        cancelButton={true}
                        downloadBanner={downloadBanner}
                    />
                </main>
            </div>
        </>
    )

}
export default PageLayoutHOC(ApproveRejectCampaignForm);


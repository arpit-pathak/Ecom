import { useState, useEffect, useCallback } from 'react'
import {
    ApiCalls, AdminApis, HttpStatus, PageTitles, ConvertStringToDate
} from '../../../../utils';
import { FormStyle } from '../../../../styles/FormStyles';
import Form from '../../../generic/Forms'
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';

const WebAnnouncementForm = () => {
    const auth = useAuth();
    const [details, setDetails] = useState([]);

    const getData = useCallback(async () => {
        await ApiCalls(AdminApis.webAnnouncementList, "GET", null, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    const webDetails = response.data.data
                    const startDate = ConvertStringToDate(webDetails.web_announcement_start_date)
                    const endDate = ConvertStringToDate(webDetails.web_announcement_end_date)
                    const webMsg = webDetails.web_announcement_msg
                    const status = webDetails.web_announcement_status
                    const formFields = [
                        {
                            name: "web_announcement_msg",
                            type: "textarea",
                            row: 4,
                            label: "Announcement Message",
                            defaultValue: webMsg,
                        },
                        {
                            name: "start_date",
                            type: "datepicker",
                            label: "Start Date",
                            defaultValue: startDate ? new Date(startDate) : new Date(),
                        },
                        {
                            name: "end_date",
                            type: "datepicker",
                            label: "End Date",
                            defaultValue: endDate ? new Date(endDate) : new Date(),
                        },
                        {
                            name: "web_announcement_status",
                            type: "select",
                            label: "Announcement Status",
                            options: [
                                { value: 'y', label: "Active" },
                                { value: 'n', label: "Inactive" },
                            ],
                            defaultValue: status,
                        },
                    ];
                    setDetails(formFields)

                }
            }).catch(error => {
                showToast(error.response.data.message, "error", "web-announcement-error")
            });
    }, [auth]);

    useEffect(() => {
        getData();
    }, [getData]);

    const handleSubmit = async (formData) => {
        await ApiCalls(AdminApis.webAnnouncementUpdate, "POST", formData, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    showToast(response.data.message, "success", "web-announcement-update")
                } else {
                    showToast(response.data.message, "error", "web-announcement-update")
                }
            }).catch(error => {
                showToast(error.response.data.message, "error")
            });
    }

    return (
        <>
            <div className="min-h-screen text-gray-900 bg-white">
                <main className="px-4 pt-4 mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-xl font-bold mb-4">{PageTitles.WEB_ANNOUNCEMENT}</h1>
                    {details &&
                        <Form
                            form={details}
                            styles={FormStyle}
                            onSubmit={handleSubmit}
                            backButton={false}
                            confirmButtonText="Update"
                        />
                    }
                </main>
            </div>
        </>
    );
}
export default WebAnnouncementForm;


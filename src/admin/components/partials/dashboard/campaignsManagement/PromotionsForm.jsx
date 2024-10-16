import { useState, useEffect, useCallback } from 'react'
import {
    ApiCalls, AdminApis, HttpStatus, PageTitles, ConvertStringToDate
} from '../../../../utils';
import { FormStyle } from '../../../../styles/FormStyles';
import Form from '../../../generic/Forms'
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';

const PromotionsForm = () => {
    const auth = useAuth();
    const [details, setDetails] = useState([]);

    const getData = useCallback(async () => {
        await ApiCalls(AdminApis.getPromotions, "GET", null, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    const promotiondetails = response.data.data
                    const startDate = ConvertStringToDate(promotiondetails.web_promotion_start_date)
                    const endDate = ConvertStringToDate(promotiondetails.web_promotion_end_date)
                    const promotionExpiryDays = promotiondetails.web_promotion_day_expiry
                    const promotionAmount = promotiondetails.web_promotion_amount
                    const promotionUserCount = promotiondetails.web_promotion_user_count

                    const formFields = [
                        {
                            name: "web_promotion_day_expiry",
                            type: "text",
                            label: "Wallet credit expire (in days)",
                            defaultValue: promotionExpiryDays,
                        },
                        {
                            name: "web_promotion_amount",
                            type: "text",
                            label: "Wallet credit amount (in $)",
                            defaultValue: promotionAmount,
                        },                        
                        {
                            name: "web_promotion_user_count",
                            type: "text",
                            label: "Number of Users",
                            defaultValue: promotionUserCount,
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
                    ];
                    setDetails(formFields)

                }
            }).catch(error => {
                showToast(error.response.data.message, "error", "web-promotions-error")
            });
    }, [auth]);

    useEffect(() => {
        getData();
    }, [getData]);

    const handleSubmit = async (formData) => {
        await ApiCalls(AdminApis.updatePromotion, "POST", formData, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    showToast(response.data.message, "success", "web-promotions-update")
                }
            }).catch(error => {
                showToast(error.response.data.message, "error")
            });
    }

    return (
        <>
            <div className="min-h-screen text-gray-900 bg-white">
                <main className="px-4 pt-4 mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-xl font-bold mb-4">{PageTitles.PROMOTIONS}</h1>
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
export default PromotionsForm;


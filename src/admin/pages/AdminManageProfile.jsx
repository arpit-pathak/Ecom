import { showToast } from '../components/generic/Alerts';
import { Form, DetailSection } from '../components/generic';
import { useState, useEffect } from 'react'
import { FormStyle } from '../styles/FormStyles';
import PageLayoutHOC from './PageLayoutHOC';
import { PageTitles, AdminApis, ApiCalls, HttpStatus, LoginAndPwStrings, CommonStrings } from '../utils'
import useAuth from '../hooks/UseAuth';
import Modal from '../components/generic/Modal';

const AdminManageProfile = () => {
    const auth = useAuth();
    const [adminDetails, setAdminDetails] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        //Fetch data on first load with useEffect
        const getData = async () => {
            const formData = new FormData();
            formData.append("user_id", auth.user.user_id);
            await ApiCalls(AdminApis.profileList, "POST", formData, false, auth.token.access)
                .then((response) => {
                    if (response.status === HttpStatus.HTTP_200_OK) {
                        const profileList = response.data.data
                        const details = [
                            {
                                name: "name",
                                type: "text",
                                label: "Name",
                                defaultValue: profileList[0].name,

                            },
                            {
                                name: "surname",
                                type: "text",
                                label: "Surname",
                                defaultValue: profileList[0].surname,

                            },
                            {
                                name: "email",
                                type: "email",
                                label: "Email",
                                defaultValue: auth.user.email,

                            },
                            {
                                name: "qrcode",
                                type: "image",
                                label: " 2FA Login QR Code",
                                imageUrl: profileList[0].qrcode,
                                alt: " 2FA Login QR Code",
                                height: "130px",
                                width: "130px"

                            },
                        ];
                        setAdminDetails(details)
                    }
                }).catch((error) => {
                    showToast(error.response.data.message, "error")
                })
        };
        getData();
    }, [auth.token.access, auth.user.user_id, auth.user.email]);

    const changePassword = [
        {
            name: "old_password",
            type: "password",
            label: "Current Password",
            defaultValue: "",
            validation: "required",
        },
        {
            name: "password",
            type: "password",
            label: "New Password",
            defaultValue: "",
            validation: ['required', { regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d#$@!%&*?]{8,}$/ }],
            customMessage: { regex: LoginAndPwStrings.PASSWORD_REQ }

        },
        {
            name: "new_password",
            type: "password",
            label: "Confirm Password",
            defaultValue: "",
            validation: "required",

        },
    ];

    const handleDetailUpdates = async (formData) => {
        formData.append("user_id", auth.user.user_id);
        await ApiCalls(AdminApis.profileUpdate, "POST", formData, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    showToast(response.data.message, "success", "profile-update")
                }
            }).catch(error => {
                showToast(error.response.data.message, "error")
            });
    };

    const handleChangePassword = async (formData) => {
        formData.append("user_id", auth.user.user_id);
        var new_password = formData.get("new_password");
        var password = formData.get("password");

        if (password !== new_password) {
            showToast(LoginAndPwStrings.PASSWORD_NOT_MATCH, "info")
            return;
        }
        await ApiCalls(AdminApis.profileUpdatePassword, "POST", formData, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    showToast(response.data.message, "success", "password-update")
                }
            }).catch(error => {
                showToast(error.response.data.message, "error")
            });
    };

    const handleClickEvent = () => {
        setIsOpen(false)
        auth.logoutUser()
    }

    return (
        <>
            {isOpen ? <Modal
                confirm={handleClickEvent}
                open={isOpen} onClose={handleClickEvent}
                title={CommonStrings.PROFILE_UPDATED}
                confirmText={CommonStrings.OK}
            />
                : null
            }
            {adminDetails.length > 0 && (
                <>
                    <DetailSection
                        title={PageTitles.MY_PROFILE}
                        form={<Form form={adminDetails} onSubmit={handleDetailUpdates} styles={FormStyle} backButton={false} confirmButtonText="Update" />}
                    />

                    <DetailSection
                        title={PageTitles.CHANGE_PASSWORD}
                        form={<Form form={changePassword} onSubmit={handleChangePassword} styles={FormStyle} backButton={false} confirmButtonText="Update" validationRequired={true} />}
                    />
                </>
            )}
        </>
    );
}
export default PageLayoutHOC(AdminManageProfile);
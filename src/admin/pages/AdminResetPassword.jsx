import { useState, useEffect, useRef } from "react";
import { AdminApis, HttpStatus, ApiCalls, LoginAndPwStrings } from '../utils';
import { showToast, ToastContainerWrapper } from '../components/generic/Alerts';
import { useNavigate } from "react-router-dom";
import { AdminRoutes } from '../../Routes';
import SimpleReactValidator from "simple-react-validator";
import logo from "../../assets/logo-white.svg";
import { useLocation } from 'react-router-dom';
import jwt_decode from "jwt-decode";

const AdminResetPassword = () => {
    const location = useLocation();
    const [newPassword, setPassword] = useState("");
    const [confirmPassword, setNewPassword] = useState("");
    const [tokenExpire, setTokenExpire] = useState(false);
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");
    const [, forceUpdate] = useState();
    const simpleValidator = useRef(new SimpleReactValidator({ autoForceUpdate: { forceUpdate: forceUpdate } }));
    let navigate = useNavigate();

    //Check if reset token has expire and show 404 page 
    useEffect(() => {
        const payload = jwt_decode(token)
        const currentTime = Date.now().valueOf() / 1000;

        if (currentTime > payload.exp) {
            setTokenExpire(true)
        }
        return () => { };
    }, [token])


    if (!token) {
        setTokenExpire(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (simpleValidator.current.allValid()) {
            if (newPassword === confirmPassword) {
                const userData = jwt_decode(token)

                const formData = new FormData();
                formData.append("new_password", confirmPassword);
                formData.append("email", userData.email);
                formData.append("token", token)

                await ApiCalls(AdminApis.resetPassword, "POST", formData, false)
                    .then(response => {
                        if (response.status === HttpStatus.HTTP_200_OK) {
                            showToast(response.data.message, "sucess")
                            setTimeout(() => { //Cause is happening too fast?
                                navigate(AdminRoutes.Login)
                            }, 2000);
                        }
                    }).catch(error => {
                        showToast(error.response.data.message, "error")

                    });
            } else {
                showToast(LoginAndPwStrings.PASSWORD_NOT_MATCH, "info")
            }
        } else {
            simpleValidator.current.showMessages(true);
            forceUpdate(1);
        }
    }

    return (
        <>

            {/* Start - Background Design  */}
            <div className="h-screen w-full min-h-full flex flex-col justify-center sm:px-6 lg:px-8 bg-darkOrange">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <img
                        className="mx-auto h-12 w-auto"
                        src={logo}
                        alt="Logo"
                    />
                </div>
                {/* End - Background Design  */}

                {/* Start - Card Design */}
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        {/* End - Card Design */}

                        {tokenExpire ?
                            <>
                                <div className="text-center text-red-600">
                                    Token has already expired
                                </div>

                                <button
                                    className="w-full flex justify-center mt-5 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-amber-400 hover:bg-amber-500"
                                    onClick={() => navigate(AdminRoutes.Login)}
                                >
                                    Back To Login
                                </button>
                            </>

                            :
                            < form className="space-y-6 my-6" onSubmit={handleSubmit}>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400  focus:outline-none focus:ring-2 focus:ring-amber-300 sm:text-sm"
                                />
                                {simpleValidator.current.message("password", newPassword, ["required",
                                    {
                                        regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d#$@!%&*?]{8,}$/,
                                    },],
                                    {
                                        className: "text-red-600 form-error",
                                        messages: {
                                            regex: LoginAndPwStrings.PASSWORD_REQ,
                                        },
                                    })}

                                <label htmlFor="password" className="block text-sm font-medium text-gray-700"> Confirm Password </label>
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400  focus:outline-none focus:ring-2 focus:ring-amber-300 sm:text-sm"
                                />

                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-amber-400 hover:bg-amber-500"
                                >
                                    Reset Password
                                </button>
                            </form>
                        }
                    </div>
                </div>
            </div >
            <ToastContainerWrapper />
        </>
    );

};
export default AdminResetPassword
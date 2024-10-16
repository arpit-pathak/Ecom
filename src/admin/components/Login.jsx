import { AdminRoutes } from '../../Routes';
import VerifyOtp from "./VerifyOtp";
import { useState } from "react";
import { ApiCalls, AdminApis, HttpStatus } from '../utils';
import { showToast, ToastContainerWrapper } from '../components/generic/Alerts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
  const [loginSuccess, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [userToken, setUserToken] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  function togglePasswordVisibility() {
    setIsPasswordVisible((prevState) => !prevState);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setEmail(e.target.email.value);
    //Call backend API to verify login credentials
    await ApiCalls(AdminApis.login, "POST", formData, false)
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          setUserToken(response.data.data.user_token)
          showToast("Login Success!", "success")
          setSuccess(true)
        }
      }).catch((error) => {
        showToast(error.response.data.message, "error")
      });
  }

  return (
    <>
      {loginSuccess
        ? <VerifyOtp email={email} token={userToken} from="Login" />
        :
        <>
          {/* Start - Login Form */}
          <form className="space-y-4 my-4" onSubmit={handleSubmit}>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400  focus:outline-none focus:ring-2 focus:ring-amber-300 sm:text-sm"
            />

            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="flex justify-end items-center relative">
              <input
                id="password"
                name="password"
                type={isPasswordVisible ? "text" : "password"}
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400  focus:outline-none focus:ring-2 focus:ring-amber-300 sm:text-sm"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-600"
                onClick={togglePasswordVisibility}
              >
                {isPasswordVisible ? (
                  <FontAwesomeIcon icon={faEyeSlash} />
                ) : (
                  <FontAwesomeIcon icon={faEye} />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a
                  href={AdminRoutes.ForgotPassword}
                  className="font-medium text-amber-600 hover:text-amber-500"
                >
                  <u>Forgot Password?</u>
                </a>
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-amber-400 hover:bg-amber-500"
            >
              Login
            </button>
          </form>
          {/* End - Login Form */}
        </>
      }
      <ToastContainerWrapper />
    </>
  );
};
export default Login
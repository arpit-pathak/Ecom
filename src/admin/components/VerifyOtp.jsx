import { useNavigate } from "react-router-dom";
import { AdminRoutes } from '../../Routes';
import { ApiCalls, AdminApis, HttpStatus } from '../utils';
import localStorage from 'local-storage';
import { showToast, ToastContainerWrapper } from '../components/generic/Alerts';
import jwt_decode from "jwt-decode";
import useAuth from "../hooks/UseAuth";

const VerifyOtp = (props) => {
  const auth = useAuth();
  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", props?.email);
    formData.append("user_token", props?.token);
    formData.append("otp", e.target.otp.value);

    await ApiCalls(AdminApis.verifyOTP, 'POST', formData, false).then((response) => {
      if (response.status === HttpStatus.HTTP_200_OK) {
        auth.setAuthTokens(response.data.data.token);
        const userData = jwt_decode(response.data.data.token.access)
        auth.setUser(userData);
        auth.setPermissions(response.data.data.permissions);
        localStorage.set("authTokens", JSON.stringify(response.data.data.token));
        localStorage.set("user", userData);
        localStorage.set("permissions", JSON.stringify(response.data.data.permissions));
        showToast(response.data.data.message, "success")
        navigate(AdminRoutes.Landing)
      }
    }).catch((error) => {
      showToast(error.response.data.message, "error")
    });
  }

  return (
    <>
      {/* Start - OTP Form */}
      <form className="my-4 space-y-4" onSubmit={handleSubmit}>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
          OTP Verification
        </label>
        <input
          id="otp"
          name="otp"
          type="text"
          placeholder="Enter 6 digit OTP"
          maxLength="6"
          required
          className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-300 sm:text-sm"
        />

        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-amber-400 hover:bg-amber-500"
        >
          Submit
        </button>
      </form>
      {/* End - OTP Form */}
      <ToastContainerWrapper />
    </>
  )
};
export default VerifyOtp
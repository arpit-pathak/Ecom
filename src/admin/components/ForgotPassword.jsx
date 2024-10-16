import { useState } from "react";
import Modal from "./generic/Modal";
import { ApiCalls, AdminApis, LoginAndPwStrings, CommonStrings } from '../utils';
import { ToastContainerWrapper } from '../components/generic/Alerts';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmail(e.target.email.value)
    setIsOpen(true)
  }

  const handleConfirmation = async () => {
    const formData = new FormData();
    formData.append("email", email);
    setIsOpen(false)

    await toast.promise(
      ApiCalls(AdminApis.forgotPassword, "POST", formData, false),
      {
        pending: {
          render() {
            setIsLoading(true)
            return "Loading..."
          },
        },
        success: {
          render({ data }) {
            setIsLoading(false);
            return data.data.message
          },
        },
        error: {
          render({ data }) {
            setIsLoading(false);
            return data.response.data.message
          },
        },
      },
    )
  };

  return (
    <>
      {isOpen ? <Modal
        confirm={handleConfirmation}
        open={isOpen} onClose={() => setIsOpen(false)}
        title={LoginAndPwStrings.FORGET_TITLE}
        confirmText={CommonStrings.CONFIRM_YES}
        cancelText={CommonStrings.CONFIRM_NO}
      />
        : null
      }
      <>
        <form className="space-y-4 my-6" onSubmit={handleSubmit}>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 sm:text-sm"
          />
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-amber-400 hover:bg-amber-500"
            disabled={isLoading}
          >
            Submit
          </button>
        </form>
      </>
      <ToastContainerWrapper />
    </>
  );
};
export default ForgotPassword
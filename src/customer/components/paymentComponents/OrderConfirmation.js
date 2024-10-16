import { useLocation } from "react-router-dom";
import { CustomerRoutes } from "../../../Routes";
import { Links } from "../GenericSections";
import Navbar from "../../components/navbar/Navbar";
import SuccessIcon from "../../../assets/buyer//payment-success.svg";
import { useSelector } from "react-redux";
const OrderConfirmationPage = () => {
  const { state } = useLocation();
  const selectedAddress = state?.shipping_address_details;

  const getPaymentDate = () => {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    const seconds = String(currentDate.getSeconds()).padStart(2, "0");

    const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    return formattedDate;
  };

  return (
    <div className="overflow-hidden w-full">
      <Navbar />
      <div className="flex justify-center items-center py-14 w-full">
        <div className="payment-success py-10 lg:px-[50px] md:px-[50px] px-10 w-[95%] md:w-[80%] xl:w-[41%]">
          <div className="flex gap-2 items-center justify-center mb-5">
            <img src={SuccessIcon} alt="success-icon" />
            <h2 className="text-black text-center text-2xl font-poppins font-medium leading-[39.969px]">
              Payment Success!
            </h2>
          </div>

          {selectedAddress && (
            <div className="w-full flex flex-col gap-2 text-left bg-[#FFFFFF] border border-[#EDEDED] py-4 pl-4 mb-5">
              <p className="text-sm text-[#828282]">Delivery To:</p>
              <p className="text-sm text-[#282828] font-poppins font-medium">
                {selectedAddress?.complete_address}
              </p>
              <p className="flex gap-5 text-sm text-[#282828] font-medium font-poppins">
                <span>{selectedAddress?.full_name}</span>
                <span>{selectedAddress?.contact_number}</span>
              </p>
            </div>
          )}

          <div className="info flex justify-between">
            <span>Order ID</span>
            <span>{state?.payment_ref}</span>
          </div>
          <div className="info flex justify-between">
            <span>Payment Time</span>
            <span>{getPaymentDate()}</span>
          </div>
          <div className="info flex justify-between">
            <span>Payment Method</span>
            <span>Credit Card</span>
          </div>
          <div className="info flex justify-between">
            <span>Amount</span>
            <span>${state?.payment_amt}</span>
          </div>

          <div className="text-right mt-4">
            <button
              className="bg-[#f3a429] rounded-[4px] text-white px-[12px] py-2 text-sm"
              onClick={() => {
                sessionStorage.setItem("SPK", "");
                sessionStorage.setItem("payment_order_id", "");
                sessionStorage.setItem("payment_order_num", "");
                sessionStorage.setItem("payment_order_amt", "");
                sessionStorage.setItem("client_secret", "");
                window.location.replace(
                  CustomerRoutes.ViewOrder.replace(
                    ":tab",
                    "pending-confirmation"
                  )
                );
              }}
            >
              Visit My Orders
            </button>
          </div>
        </div>
      </div>

      <Links />
    </div>
  );
};

export default OrderConfirmationPage;

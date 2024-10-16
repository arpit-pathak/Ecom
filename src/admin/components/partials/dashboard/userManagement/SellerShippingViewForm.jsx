import { Form, Button } from "../../../generic";
import { GridStyle } from "../../../../styles/FormStyles";
import { ApiCalls, AdminApis, HttpStatus, Messages } from "../../../../utils";
import { useCallback, useEffect, useState } from "react";
import { showToast } from "../../../generic/Alerts";
import useAuth from "../../../../hooks/UseAuth";

const days = [
  { value: "mon", label: "Monday" },
  { value: "tue", label: "Tuesday" },
  { value: "wed", label: "Wednesday" },
  { value: "thu", label: "Thursday" },
  { value: "fri", label: "Friday" },
  { value: "sat", label: "Saturday" },
  { value: "sun", label: "Sunday" },
];

export default function ViewSellerShipping({ onClose, sellerId }) {
  const auth = useAuth();
  const [operatingDays, setOperatingDays] = useState([]);
  const [shippingData, setShippingData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getData = useCallback(async () => {
    setIsLoading(true);
    await ApiCalls(
      AdminApis.viewSellerShipping + sellerId + "/",
      "GET",
      {},
      false,
      auth.token.access
    )
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          setOperatingDays(response.data.data?.other_detail?.operating_day);
          setShippingData(response.data.data?.shipping_available.filter((item) => item.is_enable === "y"));
        }
        setIsLoading(false);
      })
      .catch((error) => {
        showToast(error.response.data.message, "error");
        setIsLoading(false);
      });
  }, [auth]);

  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <>
      {isLoading ? (
        <div>{Messages.LOADING}</div>
      ) : (
        <>
          <div className="mb-5">
            <p className="font-bold my-5 text-lg">Shipment Settings</p>
            <p className="font-semibold mb-4 mt-8">Days of Operation :</p>
            <div className="flex gap-3 flex-wrap items-center w-full mb-8">
              {operatingDays?.length > 0 ? <>{operatingDays?.map((day) => {
                let dayIndex = days.findIndex((item) => item.value === day);
                return (
                  <div className="rounded-lg px-3 py-2 text-center bg-[#f5ab35] text-white mb-3">
                    {days[dayIndex]?.label}
                  </div>
                );
              })}</>: <p>No days found</p>}
            </div>

            <p className="font-semibold mb-4 mt-8">
              Available Delivery Options :
            </p>
            <div className="mb-8">
              {shippingData.length > 0 ? <>{shippingData
                .map((shipping, index) => {
                  return (
                    <div className="mt-8">
                      <p className="text-sm font-bold mb-5">
                        {index + 1}. {shipping?.name}
                      </p>

                      <p className="text-sm font-bold mb-3 ml-5">
                        i. Available Timeslots
                      </p>
                      {shipping?.id_shipping_option !== 3 ? (
                        <div className="flex items-center gap-3 flex-wrap ml-5">
                          {shipping.time_slot
                            ?.filter((item) => item.is_selected === "y")
                            .map((timeslot) => {
                              return (
                                <div className="rounded-lg px-3 py-2 w-[200px] text-center border border-orangeButton text-orangeButton mb-7">
                                  {timeslot?.delivery_slot}
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="ml-5">
                          <p className="text-sm font-bold mb-3 ml-5">
                            Start Time:{" "}
                            <span className="text-orangeButton">
                              {shipping?.start_time}
                            </span>
                          </p>
                          <p className="text-sm font-bold mb-6 ml-5">
                            End Time:{" "}
                            <span className="text-orangeButton">
                              {shipping?.cutoff_time}
                            </span>
                          </p>
                        </div>
                      )}

                      <p className="text-sm font-bold mb-3 ml-5 mt-4">
                        ii. Delivery Fees
                      </p>
                      <div className="overflow-x-auto pb-4 my-5 ml-5">
                        <table className="min-w-full my-2 text-left text-sm font-light border border-collapse border-gray-300">
                          <thead className="border-b font-medium dark:border-neutral-500 bg-gray-100">
                            {shipping?.id_shipping_option !== 3 ? (
                              <tr>
                                <th
                                  scope="col"
                                  className="py-2 border-r px-2 text-center"
                                >
                                  Weight
                                </th>
                                <th
                                  scope="col"
                                  className="py-2 border-r px-2 text-center"
                                >
                                  uParcel Fee
                                </th>
                                <th
                                  scope="col"
                                  className="py-2 border-r px-2 text-center"
                                >
                                  Seller Pay
                                </th>
                                <th
                                  scope="col"
                                  className="py-2 border-r px-2 text-center"
                                >
                                  Buyer Pay
                                </th>
                              </tr>
                            ) : (
                              <tr>
                                <th
                                  scope="col"
                                  className="py-2 border-r px-2 text-center"
                                >
                                  Weight
                                </th>
                                <th
                                  scope="col"
                                  className="py-2 border-r px-2 text-center"
                                >
                                  uParcel Fee
                                </th>
                                <th
                                  scope="col"
                                  className="py-2 border-r px-2 text-center"
                                >
                                  Seller Pay
                                </th>
                              </tr>
                            )}
                          </thead>
                          <tbody>
                            {shipping?.delivery_fee.map((rate, index) => (
                              <>
                                {shipping?.id_shipping_option !== 3 ? (
                                  <tr
                                    key={index}
                                    className="border-b font-normal text-center"
                                  >
                                    <td className="py-2 border-r px-2">
                                      {rate.weight}KG
                                    </td>
                                    <td className="py-2 border-r px-2">
                                      ${rate.uparcel_fee}
                                    </td>
                                    <td className="py-2 border-r px-2">
                                      ${rate.seller_pay}
                                    </td>
                                    <td className="py-2 border-r px-2">
                                      ${rate.buyer_pay}
                                    </td>
                                  </tr>
                                ) : (
                                  <tr
                                    key={index}
                                    className="border-b font-normal text-center"
                                  >
                                    <td className="py-2 border-r px-2">
                                      {rate.weight}KG
                                    </td>
                                    <td className="py-2 border-r px-2">
                                      Base ${rate.uparcel_fee} +{" "}
                                      {rate.per_km_charge}/km
                                    </td>
                                    <td className="py-2 border-r px-2">
                                      ${rate.seller_pay}
                                    </td>
                                  </tr>
                                )}
                              </>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <hr />
                    </div>
                  );
                })}</>:<p>No options available at the moment</p>}
            </div>
          </div>
          <Button
            onClick={() => onClose({ edit: "true" })}
            text="Back"
            type="cancel"
            py="2"
            px="3"
          />
        </>
      )}
    </>
  );
}

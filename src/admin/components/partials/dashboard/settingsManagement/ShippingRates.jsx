import { useEffect, useState, useCallback } from 'react'
import { ApiCalls, AdminApis, HttpStatus } from '../../../../utils';
import { showToast } from '../../../generic/Alerts';
import Button from '../../../generic/Buttons';
import useAuth from '../../../../hooks/UseAuth';

export default function ShippingRates({ onClose, shippingID }) {
    const auth = useAuth();
    const [shippingRates, setShippingRates] = useState([]);
    const [formData, setFormData] = useState({});

    const getShippingRates = useCallback(async () => {
        let url = AdminApis.shippingRatesList;
        if (shippingID) {
            url = `${AdminApis.shippingRatesList}${shippingID}/`
        }
        await ApiCalls(url, "GET", null, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    setShippingRates(response.data.data)
                }
            }).catch(error => {
                showToast(error.response.data.message, "error")
            });
    }, [auth, shippingID]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        let url = AdminApis.shippingRatesUpdate;
        if (shippingID) {
            url = `${AdminApis.shippingRatesUpdate}${shippingID}/`
        }
        let formData = new FormData();
        const data = new FormData(e.target);
        for (let [key, value] of data) {
            if (key === "id_charge") {
                formData.append("id_charge[]", value);
            }
            if (key === "uparcel_charge") {
                formData.append("uparcel_charge[]", value);
            }
            if (key === "per_km_charge") {
                formData.append("per_km_charge[]", value);
            }
        }

        await ApiCalls(url, "POST", formData, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    setShippingRates(response.data.data)
                    showToast(response.data.message, "success")
                }
            }).catch(error => {
                showToast(error.response.data.message, "error")
            });
    }

    useEffect(() => {
        getShippingRates();
    }, [getShippingRates]);

    return (
      <>
        {shippingRates && (
          <>
            <form onSubmit={handleSubmit}>
              <div className="overflow-x-auto py-4">
                <table className="min-w-full my-2 text-left text-sm font-light border border-collapse border-gray-300">
                  <thead className="border-b font-medium dark:border-neutral-500 bg-gray-100">
                    <tr>
                      <th scope="col" className="py-2 border-r px-2">
                        ID
                      </th>
                      <th scope="col" className="py-2 border-r px-2">
                        Weight
                      </th>
                      <th scope="col" className="py-2 border-r px-2">
                        Charge
                      </th>
                      {shippingID === 3 && (
                        <th scope="col" className="py-2 border-r px-2">
                          Per Km Charge
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {shippingRates.map((rate, index) => (
                      <tr key={index} className="border-b font-normal">
                        <td className="py-2 border-r px-2">{rate.id_charge}</td>
                        <td className="py-2 border-r px-2">{rate.weight}KG</td>
                        <td className="py-2 border-r px-2">
                          <input
                            type="hidden"
                            name="id_charge"
                            defaultValue={rate.id_charge}
                          />
                          <div className="relative flex flex-wrap items-stretch">
                            <span className="flex items-center whitespace-nowrap rounded-l border border-r-0 border-solid border-neutral-300 px-3 py-[0.25rem] text-center text-base font-normal leading-[1.6] text-neutral-700 dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200">
                              $
                            </span>
                            <input
                              type="text"
                              defaultValue={rate.uparcel_charge}
                              name="uparcel_charge"
                              onChange={handleInputChange}
                              className="relative m-0 block w-[1px] min-w-0 flex-auto border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary"
                            />
                            <span className="flex items-center whitespace-nowrap rounded-r border border-l-0 border-solid border-neutral-300 px-3 py-[0.25rem] text-center text-base font-normal leading-[1.6] text-neutral-700 dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200">
                              SGD
                            </span>
                          </div>
                        </td>
                        {shippingID === 3 && (
                          <td className="py-2 border-r px-2">
                            <div className="relative flex flex-wrap items-stretch">
                              <span className="flex items-center whitespace-nowrap rounded-l border border-r-0 border-solid border-neutral-300 px-3 py-[0.25rem] text-center text-base font-normal leading-[1.6] text-neutral-700 dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200">
                                $
                              </span>
                              <input
                                type="text"
                                defaultValue={rate.per_km_charge}
                                name="per_km_charge"
                                onChange={handleInputChange}
                                className="relative m-0 block w-[1px] min-w-0 flex-auto border border-solid border-neutral-300 bg-transparent bg-clip-padding px-3 py-[0.25rem] text-base font-normal leading-[1.6] text-neutral-700 outline-none transition duration-200 ease-in-out focus:z-[3] focus:border-primary focus:text-neutral-700 focus:shadow-[inset_0_0_0_1px_rgb(59,113,202)] focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200 dark:focus:border-primary"
                              />
                              <span className="flex items-center whitespace-nowrap rounded-r border border-l-0 border-solid border-neutral-300 px-3 py-[0.25rem] text-center text-base font-normal leading-[1.6] text-neutral-700 dark:border-neutral-600 dark:text-neutral-200 dark:placeholder:text-neutral-200">
                                SGD
                              </span>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-4 py-2">
                <Button
                  onClick={() => onClose({ edit: "false" })}
                  text="Back"
                  type="cancel"
                  py="2"
                  px="3"
                />
                <Button text="Update" type="submit" py="2" px="3" />
              </div>
            </form>
          </>
        )}
      </>
    );

}


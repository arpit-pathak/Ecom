import { useState, useEffect, useCallback } from "react";
import Table from "../Table";
import { ApiCalls, AdminApis, HttpStatus, Messages } from "../../../../utils";
import { Button } from "../../../generic";
import { showToast } from "../../../generic/Alerts";
import useAuth from "../../../../hooks/UseAuth";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { InputBoxStyle } from "../../../../styles/FormStyles";
import Loader from "../../../../../utils/loader";

const PublicHolidaysTable = () => {
  const auth = useAuth();
  let titleText = "Public Holidays";
  const [currentYearPH, setCurrentYearPH] = useState(null);
  const [nextYearPH, setNextYearPH] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const getData = useCallback(async () => {
    let url = AdminApis.publicHolidaysList;
    await ApiCalls(url, "GET", {}, false, auth.token.access)
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          setCurrentYearPH(response.data.data.current_yr_ph_holidays);
          setNextYearPH(response.data.data.next_yr_ph_holidays);
        }
      })
      .catch((error) => {
        showToast(
          error.response.data.message,
          "error",
          "prohibited-keywords-error"
        );
      });
  }, [auth]);

  useEffect(() => {
    getData();
  }, [getData]);

  const handleDateChange = (selectedDate, index, type) => {
    const formattedDate = selectedDate.toISOString().split("T")[0];
    if (type === "cy") {
      setCurrentYearPH((prevData) =>
        prevData.map((item, i) =>
          i === index ? { ...item, date: formattedDate } : item
        )
      );
    }
    if (type === "ny") {
      setNextYearPH((prevData) =>
        prevData.map((item, i) =>
          i === index ? { ...item, date: formattedDate } : item
        )
      );
    }
  };

  const handleNameChange = (e, index, type) => {
    setTimeout(() => {
      if (type === "cy") {
        setCurrentYearPH((prevData) =>
          prevData.map((item, i) =>
            i === index ? { ...item, ph_name: e.target.value } : item
          )
        );
      }
      if (type === "ny") {
        setNextYearPH((prevData) =>
          prevData.map((item, i) =>
            i === index ? { ...item, ph_name: e.target.value } : item
          )
        );
      }
    }, 2000);
  };

  const currentYearColumns = [
    {
      Header: "Date",
      accessor: "date",
      Cell: ({ cell }) => (
        <DatePicker
          name={`cy_date_${cell.row.index}`}
          id={`cy_date_${cell.row.index}`}
          key={`cy_date_${cell.row.index}`}
          minDate={new Date(new Date().getFullYear(), 0, 1)}
          selected={new Date(cell.value)}
          onChange={(date) => handleDateChange(date, cell.row.index, "cy")}
          className={`text-sm text-gray-500 whitespace-normal ${InputBoxStyle}`}
          dateFormat={"yyyy-MM-dd"}
        />
      ),
    },
    {
      Header: "Public Holiday",
      accessor: "ph_name",
      Cell: ({ cell }) => (
        <input
          type="text"
          id={`cy_ph_name_${cell.row.index}`}
          name={`cy_ph_name_${cell.row.index}`}
          key={`cy_ph_name_${cell.row.index}`}
          defaultValue={cell.value}
          onChange={(e) => handleNameChange(e, cell.row.index, "cy")}
          className={`text-sm text-gray-500 whitespace-normal ${InputBoxStyle}`}
        />
      ),
    },
  ];

  const nextYearColumns = [
    {
      Header: "Date",
      accessor: "date",
      Cell: ({ cell }) => (
        <DatePicker
          name={`ny_date_${cell.row.index}`}
          id={`ny_date_${cell.row.index}`}
          key={`ny_date_${cell.row.index}`}
          minDate={new Date(new Date().getFullYear() + 1, 0, 1)}
          selected={new Date(cell.value)}
          onChange={(date) => handleDateChange(date, cell.row.index, "ny")}
          className={`text-sm text-gray-500 whitespace-normal ${InputBoxStyle}`}
          dateFormat={"yyyy-MM-dd"}
        />
      ),
    },
    {
      Header: "Public Holiday",
      accessor: "ph_name",
      Cell: ({ cell }) => (
        <input
          type="text"
          name={`ny_ph_name_${cell.row.index}`}
          id={`ny_ph_name_${cell.row.index}`}
          key={`ny_ph_name_${cell.row.index}`}
          defaultValue={cell.value}
          onChange={(e) => handleNameChange(e, cell.row.index, "ny")}
          className={`text-sm text-gray-500 whitespace-normal ${InputBoxStyle}`}
        />
      ),
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsUpdating(true)

    const data = new FormData(e.target);

    let cyList = [],
      nyList = [];
    let newData = {};

    for (let [key, value] of data) {
      let actualKey = "";
      if (key.includes("date")) actualKey = "date";
      else actualKey = "ph_name";

      newData[actualKey] = value;
      if (key.includes("cy") && actualKey === "ph_name") {
        cyList.push(newData);
        newData = {};
      }
      if (key.includes("ny") && actualKey === "ph_name") {
        nyList.push(newData);
        newData = {};
      }
    }

    // console.log("cyList", cyList);
    // console.log("nylist ", nyList);

    const formData = new FormData();
    formData.append("current_yr_ph_holidays", JSON.stringify(cyList));
    formData.append("next_yr_ph_holidays", JSON.stringify(nyList));

    await ApiCalls(
      AdminApis.updatePublicHolidaysList,
      "POST",
      formData,
      false,
      auth.token.access
    )
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          showToast(response.data.message, "success", "update-public-holidays");
          getData();
        }
        setIsUpdating(false);
      })
      .catch((error) => {
        showToast(error.response.data.message, "error");
        setIsUpdating(false);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="min-h-screen text-gray-900 bg-white">
        <main className="px-4 pt-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between mb-4">
            <h1 className="text-xl font-semibold">{titleText}</h1>
            <div className="flex flex-col lg:flex-row md:flex-row items-center justify-end space-x-2 flex-grow">
              <Button
                text={
                  isUpdating ? <Loader height="15px" width="15px" /> : "Update"
                }
                type="confirm"
                py="2"
                px={isUpdating ? "8" : "4"}
              />
            </div>
          </div>
          {currentYearPH && nextYearPH ? (
            <div className="flex items-center justify-between gap-10 w-full max-sm:flex-wrap">
              <div className="w-1/2 border border-grey-500 rounded-md p-2">
                <p className="font-bold text-center">Current Year PH</p>
                <Table
                  columns={currentYearColumns}
                  data={currentYearPH}
                  fetchData={getData}
                  defaultSearch={false}
                  pagination={false}
                />
              </div>
              <div className="w-1/2 border border-grey-500 rounded-md p-2">
                <p className="font-bold text-center">Next Year PH</p>
                <Table
                  columns={nextYearColumns}
                  data={nextYearPH}
                  fetchData={getData}
                  defaultSearch={false}
                  pagination={false}
                />
              </div>
            </div>
          ) : (
            <div>{Messages.LOADING}</div>
          )}
        </main>
      </div>
    </form>
  );
};
export default PublicHolidaysTable;

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Table from "../Table";
import {
  ApiCalls,
  AdminApis,
  HttpStatus,
  Messages,
  buildQueryParams,
  UserPermissions,
  CommonStrings,
} from "../../../../utils";
import Button from "../../../generic/Buttons";
import { showToast } from "../../../generic/Alerts";
import useAuth from "../../../../hooks/UseAuth";
import { trimName } from "../../../../../utils/general";
import { NewsletterSearchForm } from "./NewsletterForm";
import CreateUserNewsletter from "./CreateUserNewsletter";

const UserNewsletterTable = () => {
  const [displayComponent, setDisplayComponent] = useState("TABLE");
  const [tableData, setTableData] = useState({
    data: null,
    pageCount: 0,
  });
  let componentToDisplay = null;
  const auth = useAuth();
  const searchRef = useRef({});
  const [sendToChoices, setSendToChoices] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const hasAddPermission = auth.checkPermission([
    UserPermissions.newsletter_add,
  ]);

  //Handle onClick create newsletter
  const createNewsletter = () => {
    if (hasAddPermission) {
      setDisplayComponent("CREATE_NEWSLETTER");
    } else showToast(CommonStrings.ACTION_NO_PERMISSION, "error");
  };

  const getData = useCallback(
    async (page, records, searchForm) => {
      const params = buildQueryParams(page, records);

      if (searchForm) {
        for (const [key, value] of searchForm.entries()) {
          if (value !== "") {
            searchRef.current[key] = value;
            params[key] = value;
          }
        }
      } else {
        for (const [key, value] of Object.entries(searchRef.current)) {
          console.log("else ", key, value);
          if (value !== "") {
            params[key] = value;
          }
        }
      }
      console.log(params);

      await ApiCalls(
        AdminApis.userNewsletterList,
        "GET",
        params,
        false,
        auth.token.access
      )
        .then((response) => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            setTableData((prevState) => ({
              ...prevState,
              data: response.data.data.user_newsletter,
              pageCount: response.data.total_pages,
            }));

            if (sendToChoices.length === 0) {
              let data = [];
              for (const [key, value] of Object.entries(
                response.data.data?.send_to
              )) {
                data.push({ label: value, value: key });
              }
              setSendToChoices(data);
            }

            if (statusList.length === 0) {
              let data = [];
              for (const [key, value] of Object.entries(
                response.data.data?.status
              )) {
                data.push({ label: value, value: key });
              }
              setStatusList(data);
            }
          }
        })
        .catch((error) => {
          showToast(
            error.response.data.message,
            "error",
            "user-newsletter-error"
          );
        });
    },
    [auth]
  );

  useEffect(() => {
    getData();
  }, [getData]);

  const columns = useMemo(
    () => [
      // {
      //   Header: "Type",
      //   accessor: 'newsletter_type',
      // },
      {
        Header: "Sent To",
        accessor: "newsletter_send_to",
      },
      {
        Header: "Subject",
        accessor: "message_subject",
        Cell: ({ cell: { value } }) => trimName(value, 200),
      },
      {
        Header: "Created On",
        accessor: "created_date",
        Cell: ({ cell: { value } }) => (
          <div className="text-sm text-gray-500 whitespace-normal">
            {value}
          </div>
        ),
      },
      // {
      //     Header: "Is Promotional",
      //     accessor: "is_promotional",
      //     Cell: ({ cell: { value } }) => (
      //       <div className="text-sm text-gray-500 text-center">{value === "y" ? "Yes" : "No"}</div>
      //     ),
      //   },
      //   {
      //     Header: "Total Received",
      //     accessor: 'ttl_rec',
      //   },
      {
        Header: "Total Sent",
        accessor: "ttl_sent",
      },
      {
        Header: "Total Pending",
        accessor: "ttl_pending",
      },
      {
        Header: "Added By",
        accessor: "added_by",
      },
      {
        Header: "Status",
        accessor: "status",
      },
    ],
    []
  );

  const getDataWithSearchForm = (formData) => {
    getData(null, null, formData);
  };

  const handleReset = () => {
    searchRef.current = {};
  };

  const addCloseHandler = (props) => {
    if (props) {
      getData();
    }
    setDisplayComponent("TABLE");
  };

  switch (displayComponent) {
    case "CREATE_NEWSLETTER":
      componentToDisplay = (
        <CreateUserNewsletter
          onClose={addCloseHandler}
          sendToChoices={sendToChoices}
        />
      );
      break;
    default:
      componentToDisplay = (
        <>
          <NewsletterSearchForm
            onConfirm={getDataWithSearchForm}
            onReset={handleReset}
            sendToChoices={sendToChoices}
            statusList={statusList}
          />
          <div className="flex flex-col lg:flex-row md:flex-row items-center justify-end space-x-2 flex-grow">
            <Button
              text="Create Newsletter"
              type="add"
              onClick={createNewsletter}
              py="2"
              px="4"
            />
          </div>
          {tableData.data ? (
            <Table
              columns={columns}
              data={tableData.data}
              fetchData={getData}
              numOfPages={tableData.pageCount}
              defaultSearch={false}
            />
          ) : (
            <div>{Messages.LOADING}</div>
          )}
        </>
      );
  }

  return (
    <>
      <div className="min-h-screen text-gray-900 bg-white">
        <main className="px-4 pt-4 mx-auto sm:px-6 lg:px-8">
          {componentToDisplay}
        </main>
      </div>
    </>
  );
};
export default UserNewsletterTable;

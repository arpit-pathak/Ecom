import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import Table, { SelectColumnFilter, StatusPill } from "../../Table";
import {
  ApiCalls,
  AdminApis,
  HttpStatus,
  PageTitles,
  Messages,
  UserStatusChoices,
} from "../../../../../utils";
import { Button } from "../../../../generic";
import { showToast } from "../../../../generic/Alerts";
import useAuth from "../../../../../hooks/UseAuth";
import { useNavigate } from "react-router-dom";
import { AdminRoutes } from "../../../../../../Routes";

const AffiliateUserTable = () => {
  const [tableData, setTableData] = useState({
    data: null,
    pageCount: 0,
  });

  const filtersRef = useRef({
    status: null,
  });
  const auth = useAuth();
  const navigate = useNavigate();


  const getData = useCallback(
    async (page, records, search = null) => {
      const formData = new FormData();

      let pg = 1, rec = 10;
      if(page) pg= page;
      if(records) rec = records;

      let url = AdminApis.getAffiliateUserList +"?page="+ pg +"&records=" + rec;
      
      if (search) {
        url += "&search=" + search
      }

      if (filtersRef.current.status) {
        url += "&status_id=" + filtersRef.current.status
      }

      await ApiCalls(
        url,
        "GET",
        formData,
        false,
        auth.token.access
      )
        .then((response) => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            setTableData((prevState) => ({
              ...prevState,
              data: response.data.data.records,
              pageCount: response.data.data.total_pages,
            }));
          }
        })
        .catch((error) => {
          showToast(error.response.data.message, "error");
        });
    },
    [auth]
  );

  //Fetch data on first load with useEffect
  useEffect(() => {
    getData();
  }, [getData]);


  const columns = useMemo(
    () => [
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Email",
        accessor: "email",
      },
      {
        Header: "Country Code",
        accessor: "country_code",
      },
      {
        Header: "Contact Number",
        accessor: "contact_number",
      },
      {
        Header: "Affiliate URL",
        accessor: "affiliate_url",
      },
      {
        Header: "Available Earning",
        accessor: "available_affiliate_earning",
      },
      {
        Header: "Status",
        accessor: "user_status",
        Cell: StatusPill,
        Filter: ({ column }) => (
          <SelectColumnFilter
            column={column}
            choices={UserStatusChoices}
            initialValue={filtersRef.current.status}
            onFilterChange={(filterValue) => {
              filtersRef.current.status = filterValue;
              getData();
            }}
          />
        ),
      },
      {
        Header: "Action",
        Cell: (props) => (
            <Button
              text="Wallet"
              onClick={() => {
                navigate(AdminRoutes.ManageAffiliateWallet.replace(":affiliateUserId", props.row.original?.id_user))
              }}
              type="view"
              px="4"
            />
        ),
      },
    ],
    [getData]
  );

  return (
    <>
      <div className="min-h-screen text-gray-900 bg-white">
        <main className="px-4 pt-4 pb-4 mx-auto sm:px-6 lg:px-8">
            <h1 className="text-xl font-semibold mb-5">{PageTitles.AFFILIATE_USERS}</h1>
          {tableData.data ? (
            <Table
              columns={columns}
              data={tableData.data}
              fetchData={getData}
              numOfPages={tableData.pageCount}
              onSearchChange={(searchValue) => {
                getData(undefined, undefined, searchValue);
              }}
            />
          ) : (
            <div>{Messages.LOADING}</div>
          )}
        </main>
      </div>
    </>
  );
};

export default AffiliateUserTable;

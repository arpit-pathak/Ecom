import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import Table, { SelectColumnFilter, StatusPill } from '../Table'
import {
  ApiCalls, AdminApis, HttpStatus, DateConverter, UserPermissions, CommonStrings,
  PageTitles, Messages, GeneralStatusChoices, buildQueryParams
} from '../../../../utils';
import { AdminRoutes } from '../../../../../Routes';
import { useNavigate } from "react-router-dom";
import Button from '../../../generic/Buttons';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';

//Static Contents Table
const StaticContentsTable = () => {
  const [tableData, setTableData] = useState({
    data: null,
    pageCount: 0
  });
  const filtersRef = useRef({
    status: null
  });
  const navigate = useNavigate();
  const auth = useAuth();
  const hasEditPermission = auth.checkPermission([UserPermissions.static_contents_edit, UserPermissions.web_contents_edit]);

  //Handle onClick Update
  const onEditHandler = useCallback(async (obj) => {
    navigate(AdminRoutes.ManageStaticContents + "/" + obj.id_staticcontents, { state: obj });
  }, [navigate]);


  //Function to get Static Contents list
  const getData = useCallback(async (page, records, search = null) => {
    const params = buildQueryParams(page, records, search);

    if (filtersRef.current.status) {
      params.status = filtersRef.current.status;
    }

    await ApiCalls(AdminApis.staticContentsList, "GET", params, false, auth.token.access)
      .then(response => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          setTableData(prevState => ({
            ...prevState,
            data: response.data.data.records,
            pageCount: response.data.data.total_pages
          }));
        }
      }).catch(error => {
        showToast(error.response.data.message, "error", "static-contents")
      });
  }, [auth]);


  useEffect(() => {
    getData();
  }, [getData]);

  const columns = useMemo(() => [
    {
      Header: "Title",
      accessor: 'title',
    },
    {
      Header: "Short Description",
      accessor: 'short_description',
      Cell: ({ cell: { value } }) => (
        <a href={value} className="text-sm whitespace-normal">{value}</a>
      ),
    },
    {
      Header: "Status",
      accessor: 'status_name',
      Cell: StatusPill,
      Filter: ({ column }) => (
        <SelectColumnFilter
          column={column}
          choices={GeneralStatusChoices}
          initialValue={filtersRef.current.status}
          onFilterChange={filterValue => {
            filtersRef.current.status = filterValue;
            getData();
          }}
        />
      ),
    },
    {
      Header: "Created On",
      accessor: "created_date",
      Cell: ({ cell: { value } }) => (
        <div className="text-sm text-gray-500 whitespace-normal">{DateConverter(value)}</div>
      )
    },
    {
      Header: "Modified On",
      accessor: 'modified_date',
      Cell: ({ cell: { value } }) => (
        <div className="text-sm text-gray-500 whitespace-normal">{DateConverter(value)}</div>
      ),
    },
    {
      Header: "Last Modified By",
      accessor: 'name',
    },
    {
      Header: "Action",
      Cell: (props) => (
        <Button
          text="Edit"
          onClick={() =>
            hasEditPermission ? onEditHandler(props.row.original) : showToast(CommonStrings.ACTION_NO_PERMISSION, "error")
          }
          type="edit"
        />
      ),
    },
  ], [onEditHandler, hasEditPermission, getData])

  return (
    <>
      <div className="min-h-screen text-gray-900 bg-white">
        <main className="px-4 pt-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between mb-4">
            <h1 className="text-xl font-semibold">{PageTitles.STATIC_CONTENTS}</h1>

          </div>
          {tableData.data ? (
            <Table
              columns={columns}
              data={tableData.data}
              fetchData={getData}
              numOfPages={tableData.pageCount}
              onSearchChange={searchValue => {
                getData(undefined, undefined, searchValue)
              }}
            />
          ) : (
            <h1>{Messages.LOADING}</h1>
          )}
        </main>
      </div>
    </>
  );
}
export default StaticContentsTable;


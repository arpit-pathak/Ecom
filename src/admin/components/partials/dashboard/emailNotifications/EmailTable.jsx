import { useMemo, useState, useEffect, useCallback } from 'react'
import Table from '../Table'
import { AdminRoutes } from '../../../../../Routes';
import { useNavigate } from "react-router-dom";
import {
  ApiCalls, AdminApis, HttpStatus, DateConverter, PageTitles,
  Messages, CommonStrings, UserPermissions, buildQueryParams
} from '../../../../utils';
import Button from '../../../generic/Buttons';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';

const EmailTable = () => {
  const [tableData, setTableData] = useState({
    data: null,
    pageCount: 0
  });
  const navigate = useNavigate();
  const auth = useAuth();
  const hasEditPermission = auth.checkPermission([UserPermissions.email_notifications_edit, UserPermissions.email_templates_edit]);

  //Handle onClick Update
  const onEditHandler = useCallback(async (obj) => {
    navigate(AdminRoutes.ManageEmail + "/" + obj.id_email, { state: obj });
  }, [navigate]);

  const getData = useCallback(async (page, records, search = null) => {
    const params = buildQueryParams(page, records, search);

    await ApiCalls(AdminApis.emailList, "GET", params, false, auth.token.access)
      .then(response => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          setTableData(prevState => ({
            ...prevState,
            data: response.data.data.records,
            pageCount: response.data.data.total_pages
          }));
        }
      }).catch(error => {
        showToast(error.response.data.message, "error", "email-template-error")
      });
  }, [auth.token.access]); // Only depend on the auth token

  useEffect(() => {
    getData();
  }, [getData]);

  const columns = useMemo(() => [
    {
      Header: "Email Title",
      accessor: 'title',
    },
    {
      Header: "Created On",
      accessor: "created_date",
      Cell: ({ cell: { value } }) => (
        <div className="text-sm text-gray-500 whitespace-normal">{DateConverter(value)}</div>
      ),
    },
    {
      Header: "Modified On",
      accessor: 'modified_date',
      Cell: ({ cell: { value } }) => (
        <div className="text-sm text-gray-500 whitespace-normal">{DateConverter(value)}</div>
      ),
    },
    {
      Header: "Action",
      Cell: (props) => (
        <Button
          text="Edit"
          onClick={() => hasEditPermission ? onEditHandler(props.row.original) : showToast(CommonStrings.ACTION_NO_PERMISSION, "error")}
          type="edit"
        />
      ),
    },
  ], [onEditHandler, hasEditPermission])


  return (
    <>
      <div className="min-h-screen text-gray-900 bg-white">
        <main className="px-4 pt-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between mb-4">
            <h1 className="text-xl font-semibold">{PageTitles.EMAIL_TEMPLATES}</h1>
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
            <div>{Messages.LOADING}</div>
          )}
        </main>
      </div>
    </>
  );
}
export default EmailTable;


import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import Table, { SelectColumnFilter, StatusPill } from '../Table'
import AdminAddEditForm from './AdminAddEditForm';
import {
  ApiCalls, AdminApis, HttpStatus, DateConverter,
  PageTitles, Messages, UserStatusChoices, CommonStrings
} from '../../../../utils';
import { Modal, Button } from '../../../generic';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';
import { toast } from 'react-toastify';
import { UserStatus } from '../../../../../constants/general.js';

const AdminTable = () => {
  const [displayComponent, setDisplayComponent] = useState("TABLE");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [tableData, setTableData] = useState({
    data: null,
    pageCount: 0
  });
  const filtersRef = useRef({
    status: null
  })
  const addAdmin = () => setDisplayComponent("ADD_ADMIN");
  const auth = useAuth();
  const userIDRef = useRef(null);

  let componentToDisplay = null;

  //Handle onClick Update
  const onClickHandler = async (obj) => {
    setEditData(obj);
    setDisplayComponent("EDIT_ADMIN");
  };

  const onCloseHandler = async (props) => {
    if (props) getData();
    setDisplayComponent("TABLE");
  }

  const getData = useCallback(async (page, records, search = null) => {
    const formData = new FormData();

    if (page) {
      formData.append("page", page);
    }
    if (records) {
      formData.append("records", records);
    }
    if (search) {
      formData.append("search", search);
    }
    if (filtersRef.current.status) {
      formData.append("status_id", filtersRef.current.status);
    }

    await ApiCalls(AdminApis.adminList, "POST", formData, false, auth.token.access)
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          setTableData(prevState => ({
            ...prevState,
            data: response.data.data.records,
            pageCount: response.data.data.total_pages
          }));
        }
      }).catch((error) => {
        showToast(error.response.data.message, "error")
      })
  }, [auth]);

  useEffect(() => {
    getData();
  }, [getData]);

  const columns = useMemo(() => [
    {
      Header: "Name",
      accessor: 'name',
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Status",
      accessor: 'user_status',
      Cell: StatusPill,
      Filter: ({ column }) => (
        <SelectColumnFilter
          column={column}
          choices={UserStatusChoices}
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
        <>
          <Button
            text="Edit"
            onClick={() =>
              onClickHandler(props.row.original)}
            type="edit"
          />
          <Button
            text="Delete"
            onClick={() => {
              userIDRef.current = props.row.original.id_user;
              setIsDeleteOpen(true);
            }}
            type="delete"
          />
        </>
      ),
    },
  ], [getData])


  switch (displayComponent) {
    case "ADD_ADMIN":
      componentToDisplay = (
        <AdminAddEditForm onClose={onCloseHandler} />
      );
      break;
    case "EDIT_ADMIN":
      componentToDisplay = (
        <AdminAddEditForm onClose={onCloseHandler} props={editData} />
      );
      break;
    default:
      componentToDisplay = (
        <>
          <div className="flex justify-between mb-4">
            <h1 className="text-xl font-semibold">{PageTitles.ADMIN}</h1>
            <Button
              text="Add Administrator"
              onClick={addAdmin}
              type="add"
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
              onSearchChange={searchValue => {
                getData(undefined, undefined, searchValue)
              }}
            />
          ) : (
            <div>{Messages.LOADING}</div>
          )}
        </>
      );
  }

  const deleteConfirmation = async () => {
    const formData = new FormData();
    formData.append("id_user", userIDRef.current);
    formData.append("status_id", UserStatus.USERSTATUS_DELETE);
    await toast.promise(
      ApiCalls(AdminApis.updateAdmin, "POST", formData, false, auth.token.access),
      {
        pending: {
          render() {
            return "Loading..."
          },
        },
        success: {
          render({ data }) {
            setIsDeleteOpen(false);
            getData();
            return data.data.message
          },
        },
        error: {
          render({ data }) {
            if (data.response.data.message) {
              return data.response.data.message
            } else {
              return CommonStrings.COMMON_ERROR
            }
          },
        },
      },
    )
  }


  return (
    <>
      {isDeleteOpen ? <Modal
        confirm={deleteConfirmation}
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={CommonStrings.DELETE_TITLE}
        confirmText={CommonStrings.CONFIRM_YES}
        cancelText={CommonStrings.CONFIRM_NO}
      />
        : null
      }
      <div className="min-h-screen text-gray-900 bg-white">
        <main className="px-4 mb-4 pt-4 mx-auto sm:px-6 lg:px-8">
          {componentToDisplay}
        </main>
      </div>
    </>
  );
}
export default AdminTable;


import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import Table, { SelectColumnFilter, StatusPill } from '../Table'
import {
  ApiCalls, AdminApis, HttpStatus, DateConverter, GeneralStatusChoices,
  PageTitles, Messages, UserPermissions, CommonStrings, buildQueryParams
} from '../../../../utils';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';
import AddEditBanner from './AddEditBanner';
import { Modal, Button } from '../../../generic';

const BannersTable = () => {
  const auth = useAuth();
  const [displayComponent, setDisplayComponent] = useState("TABLE");
  const [tableData, setTableData] = useState({
    data: null,
    pageCount: 0
  });
  const filtersRef = useRef({
    status: null
  })
  const [editData, setEditData] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const bannerIDRef = useRef(null);
  const hasEditPermission = auth.checkPermission([UserPermissions.campaigns_edit, UserPermissions.banner_edit]);
  const hasAddPermission = auth.checkPermission([UserPermissions.campaigns_add, UserPermissions.banner_add]);
  const hasDeletePermission = auth.checkPermission([UserPermissions.campaigns_delete, UserPermissions.banner_delete]);
  let componentToDisplay = null;

  const addCloseHandler = (props) => {
    if (props) {
      getData();
    }
    setDisplayComponent("TABLE");
  }

  //Function to get FAQ list
  const getData = useCallback(async (page, records, search) => {
    const params = buildQueryParams(page, records, search);
    if (filtersRef.current.status) {
      params.status = filtersRef.current.status;
    }

    await ApiCalls(AdminApis.bannerList, "GET", params, false, auth.token.access)
      .then(response => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          setTableData(prevState => ({
            ...prevState,
            data: response.data.data.records,
            pageCount: response.data.data.total_pages
          }));
        }
      }).catch(error => {
        showToast(error.response.data.message, "error", "faq-contents")
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
      Header: "For",
      accessor: 'banner_type',
      Cell: ({ cell: { value } }) => (
        <span className="capitalize">{value}</span>
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
      Header: "Start Date",
      accessor: "start_date",
      Cell: ({ cell: { value } }) => (
        <div className="text-sm text-gray-500 whitespace-normal">{DateConverter(value)}</div>
      )
    },
    {
      Header: "End Date",
      accessor: 'end_date',
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
        <>
          <Button
            text="Edit"
            onClick={() => {
              if (hasEditPermission) {
                setEditData(props.row.original);
                setDisplayComponent("EDIT_BANNER");
              } else {
                showToast(CommonStrings.ACTION_NO_PERMISSION, "error")
              }
            }}
            type="edit"
          />
          <Button
            text="Delete"
            onClick={() => {
              if (hasDeletePermission) {
                bannerIDRef.current = props.row.original.id_banner;
                setIsOpen(true);
              } else {
                showToast(CommonStrings.ACTION_NO_PERMISSION, "error")
              }
            }}
            type="delete"
          />
        </>
      ),
    },
  ], [hasEditPermission, hasDeletePermission, getData])

  switch (displayComponent) {
    case "ADD_BANNER":
      componentToDisplay = (
        <AddEditBanner onClose={addCloseHandler} />
      );
      break;
    case "EDIT_BANNER":
      componentToDisplay = (
        <AddEditBanner onClose={addCloseHandler} props={editData} />
      );
      break;
    default:
      componentToDisplay = (
        <>
          <div className="flex justify-between mb-4">
            <h1 className="text-xl font-semibold">{PageTitles.BANNERS}</h1>
            <div className="flex flex-col items-end">
              <Button
                text="Add Banner"
                type="add"
                onClick={() => hasAddPermission ? setDisplayComponent("ADD_BANNER") : showToast(CommonStrings.ACTION_NO_PERMISSION, "error")}
                py="2"
                px="4"
              />
            </div>
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

        </>
      );
  }


  const handleConfirmation = async () => {
    const formData = new FormData();
    formData.append("id_banner", bannerIDRef.current);
    await ApiCalls(AdminApis.deleteBanner, "POST", formData, false, auth.token.access)
      .then(response => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          showToast(response.data.message, "success", "delete-faq")
          setIsOpen(false);
          getData();
        }
      }).catch(error => {
        showToast(error.response.data.message, "error")
      });
  }


  return (
    <>
      {isOpen ? <Modal
        confirm={handleConfirmation}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={CommonStrings.DELETE_TITLE}
        confirmText={CommonStrings.CONFIRM_YES}
        cancelText={CommonStrings.CONFIRM_NO}
      />
        : null
      }
      <div className="min-h-screen text-gray-900 bg-white">
        <main className="px-4 pt-4 pb-4 mx-auto sm:px-6 lg:px-8">
          {componentToDisplay}
        </main>
      </div>
    </>
  );
}
export default BannersTable;


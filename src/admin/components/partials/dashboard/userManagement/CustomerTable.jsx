import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import Table, { SelectColumnFilter, StatusPill } from '../Table'
import {
  ApiCalls, AdminApis, HttpStatus, DateConverter, UserStatusChoices,
  PageTitles, Messages, CommonStrings, UserPermissions
} from '../../../../utils';
import { Modal, Button } from '../../../generic';
import { showToast } from '../../../generic/Alerts';
import { toast } from 'react-toastify';
import useAuth from '../../../../hooks/UseAuth';
import CustomerAddEditForm from './AddEditCustomerForm';
import { Countries } from '../../../../utils/Constants';
import { getKeyByValue } from '../../../../utils/Utils';
import Loader from '../../../../../utils/loader';
import CustomerWalletTable from './CustomerWalletTable';

const CustomerTable = () => {
  const [editTable, setEditTable] = useState(false);
  const [addTable, setAddTable] = useState(false);
  const [walletTable, setWalletTable] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [countryData, setCountryData] = useState({});
  const [findFromChoices, setFindFromChoices] = useState([]);
  const [tableData, setTableData] = useState({
    data: null,
    pageCount: 0
  });
  const filtersRef = useRef({
    status: null,
    cashback: "all"
  })
  const auth = useAuth();
  const userIDRef = useRef(null);
  const userDataRef = useRef(null);
  const hasEditPermission = auth.checkPermission([UserPermissions.user_management_edit, UserPermissions.customers_edit]);
  const hasDownloadPermission = auth.checkPermission([UserPermissions.user_management_download, UserPermissions.customers_download]);
  const [isDownloading, setIsDownloading] = useState(false);

  //Handle onClick Update
  const onClickHandler = async (obj) => {
    setEditData(obj);
    setEditTable(true);
  };

  //Handle CSV Download
  const onDownloadHandler = async () => {
    setIsDownloading(true)
//
    let endpoint = AdminApis.customerCSV
    if (filtersRef.current.cashback === "y") {
      endpoint += "?cashback=y"
    }

    await ApiCalls(endpoint, "GET", null, true, auth.token.access)
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          const fileUrl = response.data.data.file_url;
          if (fileUrl) {
            window.location.href = fileUrl
          }
          if (response.data.result === "FAIL") {
            showToast(response.data.message, "error")
          }
        }
        setIsDownloading(false)
      }).catch((error) => {
        showToast(error.response.data.message, "error")
        setIsDownloading(false)
      })
  };

  //Fetch data on first load with useEffect
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
    if (filtersRef.current.cashback) {
      formData.append("cashback", filtersRef.current.cashback);
    }
    await ApiCalls(AdminApis.customerList, "POST", formData, false, auth.token.access)
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

  const getCommonData = async () => {
    const formData = new FormData();
   
    await ApiCalls(AdminApis.generalSetting, "GET", formData, false)
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          let tempCountryList = response.data.data.country ?? []; 
          let individualCountryList = [];
          let newCountryList = tempCountryList.map(country => {
            let currentCode = getKeyByValue(Countries,country.name);
            individualCountryList.push(currentCode)
            return {...country, "code" :currentCode}
          })

          let initialCustomLabels = {}
          let customLabels = newCountryList.reduce(
            (accumulator, currentValue) => {
              return {...accumulator, [currentValue.code] : currentValue.phone_code}
            },
            initialCustomLabels
          )

          setCountryData({
            customLabels: customLabels,
            individualCountryList: individualCountryList,
            newCountryList:newCountryList
          });

          let find_from = response.data.data.find_from ?? [];
          let findFromList = find_from.map(item => {
            return { label: item, value: item };
          });
          setFindFromChoices(findFromList);
        }
      })
      .catch((error) => {
        showToast(error.response.data.message, "error");
      });
  };

  const onEditHandler = async (reply) => {
    if (reply.edit) getData();
    setEditTable(false)
  }

  useEffect(() => {
    getData();
  }, [getData]);

  useEffect(()=>{
    getCommonData()
  },[])

  const columns = useMemo(() => [
    {
      Header: "Name",
      accessor: 'username',
    },
    {
      Header: "Phone Number",
      accessor: 'contact_number',
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Cashback",
      accessor: "total_cashback",
      Filter: ({ column }) => (
        <SelectColumnFilter
          column={column}
          all={false}
          choices={[
            { "value": "all", "label": "All", },
            { "value": "y", "label": "Yes", },
          ]}
          initialValue={filtersRef.current.cashback}
          onFilterChange={filterValue => {
            filtersRef.current.cashback = filterValue;
            getData();
          }}
        />
      ),
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
      Header: "Last Login",
      accessor: 'last_login',
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
            onClick={() => hasEditPermission ? onClickHandler(props.row.original) : showToast(CommonStrings.ACTION_NO_PERMISSION, "error")}
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
           <Button
            text="Wallet Transaction"
            onClick={() => {
              userDataRef.current = {
                buyerId: props.row.original.id_user,
                name: props.row.original.name ?? "N/A",
                email: props.row.original.email ?? "",
                contact_number: props.row.original.contact_number ?? "N/A",
              };
             
              setWalletTable(true);
            }}
            type="transparent-green"
          />
        </>
      ),
    },
  ], [hasEditPermission, getData])

  const deleteConfirmation = async () => {
    const formData = new FormData();
    formData.append("user_id", userIDRef.current);
    await toast.promise(
      ApiCalls(AdminApis.deleteUser + "buyer/", "POST", formData, false, auth.token.access),
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

  const addCustomerHandler = () => {
    setAddTable(true)
  }

  const onAddFormCloseHandler = (isRefresh) =>{
    setAddTable(false)
    if(isRefresh) getData();
  }

  return (
    <>
      {isDeleteOpen ? (
        <Modal
          confirm={deleteConfirmation}
          open={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          title={CommonStrings.DELETE_TITLE}
          confirmText={CommonStrings.CONFIRM_YES}
          cancelText={CommonStrings.CONFIRM_NO}
        />
      ) : null}
      <div className="min-h-screen text-gray-900 bg-white">
        <main className="px-4 pt-4 mx-auto sm:px-6 lg:px-8">
          {editTable ? (
            <CustomerAddEditForm
              countryData={countryData}
              onClose={onEditHandler}
              findFromChoices={findFromChoices}
              props={editData}
              isEdit={true}
            />
          ) : (
            <>
              {addTable ? (
                <CustomerAddEditForm
                  countryData={countryData}
                  onClose={onAddFormCloseHandler}
                  findFromChoices={findFromChoices}
                  isEdit={false}
                />
              ) : (
                <>
                  {walletTable ? (
                    <CustomerWalletTable user={userDataRef.current} onClose={() => setWalletTable(false)} />
                  ) : (
                    <>
                      <div className="flex items-center justify-between space-x-2">
                        <h1 className="text-xl font-semibold">
                          {PageTitles.CUSTOMERS}
                        </h1>
                        <div className="flex gap-4">
                          <Button
                            onClick={() => addCustomerHandler()}
                            text="Add Customer"
                            type="add"
                            py="2"
                            px="4"
                          />
                          <Button
                            onClick={() =>
                              hasDownloadPermission
                                ? onDownloadHandler()
                                : showToast(
                                    CommonStrings.ACTION_NO_PERMISSION,
                                    "error"
                                  )
                            }
                            text={
                              isDownloading ? (
                                <Loader height="15px" width="15px" />
                              ) : (
                                "Download CSV"
                              )
                            }
                            type="download"
                            py="2"
                            px={isDownloading ? "12" : "4"}
                            showIcon={!isDownloading}
                          />
                        </div>
                      </div>
                      <div className="mt-6 bg-grey-200">
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
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}
export default CustomerTable;


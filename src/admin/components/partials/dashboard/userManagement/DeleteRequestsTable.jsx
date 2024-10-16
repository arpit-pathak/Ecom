import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import Table, { SelectColumnFilter } from '../Table'
import {
    ApiCalls, AdminApis, HttpStatus, DateConverter,
    PageTitles, Messages, CommonStrings
} from '../../../../utils';
import { Modal, Button } from '../../../generic';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';

const DeleteRequestsTable = () => {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [tableData, setTableData] = useState({
        data: null,
        pageCount: 0
    });
    const filtersRef = useRef({
        usertype_id: null,
    });
    const userIDRef = useRef(null);
    const auth = useAuth();

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
        if (filtersRef.current.usertype_id) {
            formData.append("usertype_id", filtersRef.current.usertype_id);
        }
        await ApiCalls(AdminApis.deleteRequestList, "POST", formData, false, auth.token.access)
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
            Header: "Phone Number",
            accessor: 'user_id__contact_number'           
        },
        {
            Header: "Email",
            accessor: "user_id__email",
        },
        {
            Header: "Usertype",
            accessor: "user_type",
            Filter: () => (
                <SelectColumnFilter
                    column={{ id: "usertype_id", render: "Usertype:" }}
                    choices={[
                        { "value": 1, "label": "Customers" },
                        { "value": 2, "label": "Sellers" },
                    ]}
                    initialValue={filtersRef.current.usertype_id}
                    onFilterChange={filterValue => {
                        filtersRef.current.usertype_id = filterValue;
                        getData();
                    }}
                    custom={true}
                />
            ),
        },
        {
            Header: "Inquiry Type",
            accessor: "inquiry_type",
        },
        {
            Header: "Created On",
            accessor: "created_date",
            Cell: ({ cell: { value } }) => (
                <div className="text-sm text-gray-500 whitespace-normal">{DateConverter(value)}</div>
            ),
        },
        {
            Header: "Action",
            Cell: (props) => (
                <>
                    <Button
                        text="Delete"
                        onClick={() => {
                            userIDRef.current = props.row.original.id_contactus;
                            setIsDeleteOpen(true);
                        }}
                        type="delete"
                    />
                </>
            ),
        },
    ], [getData])

    const handleConfirmation = async () => {
    //   showToast("Loading...", "warning", "delete-user")

      await ApiCalls(
        AdminApis.deleteRequestUpdate + userIDRef.current + "/",
        "DELETE",
        {},
        false,
        auth.token.access
      )
        .then((response) => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            showToast(response.data.message, "success", "delete-user");
            setIsDeleteOpen(false);
            getData();
          }
        })
        .catch((error) => {
          showToast(error.response.data.message, "error");
        });
    };


    return (
        <>
            {isDeleteOpen ? <Modal
                confirm={handleConfirmation}
                open={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                title={CommonStrings.DELETE_TITLE}
                confirmText={CommonStrings.CONFIRM_YES}
                cancelText={CommonStrings.CONFIRM_NO}
            />
                : null
            }
            <div className="min-h-screen text-gray-900 bg-white">
                <main className="px-4 pt-4 mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between space-x-2">
                        <h1 className="text-xl font-semibold">{PageTitles.USER_DELETE_REQUEST}</h1>
                    </div>
                    <div className="mt-6 bg-grey-200">
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
                    </div>
                </main>
            </div>
        </>
    );
}
export default DeleteRequestsTable;


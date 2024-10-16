import { useMemo, useState, useEffect, useCallback } from 'react'
import Table, { StatusPill } from '../Table'
import {
    ApiCalls, AdminApis, HttpStatus, DateConverter,
    Messages, buildQueryParams, PageTitles
} from '../../../../utils';
import { Button } from '../../../generic';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';
import AddEditSellerNotice from './AddEditSellerNotice';

const SellerNoticeTable = () => {
    const [displayComponent, setDisplayComponent] = useState("TABLE");
    const [tableData, setTableData] = useState({
        data: null,
        pageCount: 0
    });
    const [editData, setEditData] = useState({});
    const auth = useAuth();
    let componentToDisplay = null;

    const getData = useCallback(async (page, records, search = null) => {
        const params = buildQueryParams(page, records, search);

        await ApiCalls(AdminApis.sellerNoticeList, "GET", params, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    setTableData(prevState => ({
                        ...prevState,
                        data: response.data.data.records,
                        pageCount: response.data.data.total_pages
                    }));
                }
            }).catch(error => {
                showToast(error.response.data.message, "error", "seller-notice-error")
            });
    }, [auth]);

    const onClose = () => {
        setDisplayComponent("TABLE")
        getData();
    }

    useEffect(() => {
        getData();
    }, [getData]);

    const columns = useMemo(() => [
        {
            Header: "Message Title",
            accessor: 'message_title',
        },
        {
            Header: "Message",
            accessor: 'message',
            Cell: ({ cell: { value } }) => {
                // Truncate the text to the first 100 characters
                const truncatedText = value.length > 100 ? value.substring(0, 100) + '...' : value;

                return (
                    <div className="text-sm whitespace-normal">{truncatedText}</div>
                )
            },
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
            Header: "Status",
            accessor: 'status_name',
            Cell: StatusPill,
        },
        {
            Header: "Action",
            Cell: (props) => (
                <>
                    <Button
                        text="Edit"
                        onClick={() => {
                            setEditData(props.row.original);
                            setDisplayComponent("EDIT_NOTICE")
                        }}
                        type="edit"
                    />
                </>
            ),
        },
    ], [])

    switch (displayComponent) {
        case "EDIT_NOTICE":
            componentToDisplay = (
                <AddEditSellerNotice onClose={onClose} props={editData} />
            );
            break;
        case "ADD_NOTICE":
            componentToDisplay = (
                <AddEditSellerNotice onClose={onClose} />
            );
            break;
        default:
            componentToDisplay = (
                <>
                    <div className="flex justify-between mb-4">
                        <h1 className="text-xl font-semibold">{PageTitles.SELLER_NOTICE}</h1>
                        <div className="flex flex-col lg:flex-row md:flex-row items-center justify-end space-x-2 flex-grow">
                            <Button
                                text="Add Notice"
                                type="add"
                                onClick={() => setDisplayComponent("ADD_NOTICE")}
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
                        <div>{Messages.LOADING}</div>
                    )}
                </>
            )
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
}
export default SellerNoticeTable;


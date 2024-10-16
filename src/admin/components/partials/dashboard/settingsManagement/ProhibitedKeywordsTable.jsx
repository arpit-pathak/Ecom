import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import Table from '../Table'
import {
    ApiCalls, AdminApis, HttpStatus, DateConverter, CommonStrings,
    Messages, buildQueryParams
} from '../../../../utils';
import { Modal, Button } from '../../../generic';
import { showToast } from '../../../generic/Alerts';
import { toast } from 'react-toastify';
import useAuth from '../../../../hooks/UseAuth';
import { useNavigate } from "react-router-dom";
import AddEditProhibitedKeyword from './AddEditProhibitedKeyword';

const ProhibitedKeywordsTable = () => {
    const [displayComponent, setDisplayComponent] = useState("TABLE");
    const [tableData, setTableData] = useState({
        data: null,
        pageCount: 0
    });
    const [editData, setEditData] = useState({});
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const auth = useAuth();
    const keywordIDRef = useRef(null);
    const navigate = useNavigate();
    let componentToDisplay = null;
    let titleText = "Prohibited Keywords";

    const getData = useCallback(async (page, records, search = null) => {
        const params = buildQueryParams(page, records, search);
        let url = AdminApis.prohibitedKeywordsList;
        await ApiCalls(url, "GET", params, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    setTableData(prevState => ({
                        ...prevState,
                        data: response.data.data.records,
                        pageCount: response.data.total_pages
                    }));
                }
            }).catch(error => {
                showToast(error.response.data.message, "error", "prohibited-keywords-error")
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
            Header: "Keyword",
            accessor: "keyword",
            Cell: ({ cell: { value } }) => (
                <div className="text-sm text-gray-500 whitespace-normal">{value}</div>
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
                        onClick={() => {
                            setEditData(props.row.original);
                            setDisplayComponent("EDIT_KEYWORD")
                        }}
                        type="edit"
                    />
                    <Button
                        text="Delete"
                        onClick={() => {
                            keywordIDRef.current = props.row.original.id_keyword
                            setIsDeleteOpen(true);
                        }}
                        type="delete"
                    />
                </>
            ),
        },
    ], [getData, navigate])

    switch (displayComponent) {
        case "EDIT_KEYWORD":
            componentToDisplay = (
                <AddEditProhibitedKeyword onClose={onClose} props={editData} />
            );
            break;
        case "ADD_KEYWORD":
            componentToDisplay = (
                <AddEditProhibitedKeyword onClose={onClose} />
            );
            break;
        default:
            componentToDisplay = (
                <>
                    <div className="flex justify-between mb-4">
                        <h1 className="text-xl font-semibold">{titleText}</h1>
                        <div className="flex flex-col lg:flex-row md:flex-row items-center justify-end space-x-2 flex-grow">                                                
                            <Button
                                text="Add Keyword"
                                type="add"
                                onClick={() => setDisplayComponent("ADD_KEYWORD")}
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


    const handleDelete = async () => {
        const formData = new FormData();
        formData.append("id_keyword", keywordIDRef.current);
        await toast.promise(
            ApiCalls(AdminApis.prohibitedKeywordDelete, "DELETE", formData, false, auth.token.access),
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
                        return data.data.message
                    },
                },
            },
        )
    }



    return (
        <>
            {isDeleteOpen ? <Modal
                confirm={handleDelete}
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
                    {componentToDisplay}
                </main>
            </div>
        </>
    );
}
export default ProhibitedKeywordsTable;


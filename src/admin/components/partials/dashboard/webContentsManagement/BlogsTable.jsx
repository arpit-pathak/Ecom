import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import Table, { SelectColumnFilter, StatusPill } from '../Table'
import {
    ApiCalls, AdminApis, HttpStatus, DateConverter, PageTitles, GeneralStatusChoices,
    Messages, UserPermissions, CommonStrings, buildQueryParams
} from '../../../../utils';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';
import AddEditBlog from './AddEditBlog';
import { Button } from '../../../generic';

const BlogsTable = () => {
    const auth = useAuth();
    const [displayComponent, setDisplayComponent] = useState("TABLE");
    const [tableData, setTableData] = useState({
        data: null,
        pageCount: 0
    });
    const [editData, setEditData] = useState({});
    const filtersRef = useRef({
        status: null,
        category_type: null
    });
    const [categoryChoices, setCategoryChoices] = useState([]);
    const hasEditPermission = auth.checkPermission([UserPermissions.blog_categories_edit, UserPermissions.web_contents_edit]);
    const hasAddPermission = auth.checkPermission([UserPermissions.blog_categories_add, UserPermissions.web_contents_add]);
    let componentToDisplay = null;

    const addCloseHandler = (props) => {
        if (props) {
            getData();
        }
        setDisplayComponent("TABLE");
    }


    const getData = useCallback(async (page, records, search = null) => {
        const params = buildQueryParams(page, records, search);

        if (filtersRef.current.status) {
            params.status = filtersRef.current.status;
        }

        if (filtersRef.current.category_type) {
            params.category_type = filtersRef.current.category_type;
        }

        await ApiCalls(AdminApis.blogList, "GET", params, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    setTableData(prevState => ({
                        ...prevState,
                        data: response.data.data,
                        pageCount: response.data.total_pages
                    }));
                    // Check if categoryChoices is empty before setting it
                    if (categoryChoices.length === 0) {
                        setCategoryChoices(response.data.category_choices);
                    }
                }
            }).catch(error => {
                showToast(error.response.data.message, "error", "blog-contents")
            });
    }, [auth.token.access]); // Only depend on the auth token


    useEffect(() => {
        getData();
    }, [getData]);

    const columns = useMemo(() => [
        {
            Header: "Title",
            accessor: 'title',
        },
        {
            Header: "Category",
            accessor: 'category_name',
            Filter: ({ column }) => (
                <SelectColumnFilter
                    column={column}
                    choices={categoryChoices}
                    initialValue={filtersRef.current.category_type}
                    onFilterChange={filterValue => {
                        filtersRef.current.category_type = filterValue;
                        getData();
                    }}
                />
            ),
            Cell: ({ cell: { value } }) => (
                <span className="capitalize">{value}</span>
            )
        },
        {
            Header: "Status",
            accessor: 'general_status',
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
            Header: "Action",
            Cell: (props) => (
                <>
                    <Button
                        text="Edit"
                        onClick={() => {
                            if (hasEditPermission) {
                                setEditData(props.row.original);
                                setDisplayComponent("EDIT_BLOG");
                            } else {
                                showToast(CommonStrings.ACTION_NO_PERMISSION, "error")
                            }
                        }}
                        type="edit"
                    />
                </>
            ),
        },
    ], [hasEditPermission, getData, categoryChoices])

    switch (displayComponent) {
        case "ADD_BLOG":
            componentToDisplay = (
                <AddEditBlog onClose={addCloseHandler} categories={categoryChoices} />
            );
            break;
        case "EDIT_BLOG":
            componentToDisplay = (
                <AddEditBlog onClose={addCloseHandler} props={editData} categories={categoryChoices} />
            );
            break;
        default:
            componentToDisplay = (
                <>
                    <div className="flex justify-between mb-4">
                        <h1 className="text-xl font-semibold">{PageTitles.BLOGS}</h1>
                        <div className="flex flex-col items-end">
                            <Button
                                text="Add Blog"
                                type="add"
                                onClick={() => hasAddPermission ? setDisplayComponent("ADD_BLOG") : showToast(CommonStrings.ACTION_NO_PERMISSION, "error")}
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

    return (
        <>
            <div className="min-h-screen text-gray-900 bg-white">
                <main className="px-4 pt-4 pb-4 mx-auto sm:px-6 lg:px-8">
                    {componentToDisplay}
                </main>
            </div>
        </>
    );
}
export default BlogsTable;

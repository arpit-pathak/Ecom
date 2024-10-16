import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import Table, { SelectColumnFilter, StatusPill } from '../Table'
import {
    ApiCalls, AdminApis, HttpStatus, DateConverter, PageTitles, GeneralStatusChoices, LanguageChoices,
    Messages, UserPermissions, CommonStrings, buildQueryParams
} from '../../../../utils';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';
import AddEditBlogCategory from './AddEditBlogCategory';
import { Button } from '../../../generic';

const BlogsCategoryTable = () => {
    const auth = useAuth();
    const [displayComponent, setDisplayComponent] = useState("TABLE");
    const [tableData, setTableData] = useState({
        data: null,
        pageCount: 0
    });
    const [editData, setEditData] = useState({});
    const filtersRef = useRef({
        status: null,
        language: null
    });
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

        if (filtersRef.current.language) {
            params.language = filtersRef.current.language;
        }

        await ApiCalls(AdminApis.blogCategoryList, "GET", params, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    setTableData(prevState => ({
                        ...prevState,
                        data: response.data.data,
                        pageCount: response.data.total_pages
                    }));
                }
            }).catch(error => {
                showToast(error.response.data.message, "error", "blogcat-contents")
            });
    }, [auth]);


    useEffect(() => {
        getData();
    }, [getData]);

    const columns = useMemo(() => [
        {
            Header: "Name",
            accessor: 'name',
            Filter: ({ column }) => (
                <SelectColumnFilter
                    column={column}
                    choices={LanguageChoices}
                    initialValue={filtersRef.current.language}
                    onFilterChange={filterValue => {
                        filtersRef.current.language = filterValue;
                        getData();
                    }}
                />
            ),
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
                                setDisplayComponent("EDIT_BLOG_CATEGORY");
                            } else {
                                showToast(CommonStrings.ACTION_NO_PERMISSION, "error")
                            }
                        }}
                        type="edit"
                    />
                </>
            ),
        },
    ], [hasEditPermission, getData])

    switch (displayComponent) {
        case "ADD_BLOG_CATEGORY":
            componentToDisplay = (
                <AddEditBlogCategory onClose={addCloseHandler} />
            );
            break;
        case "EDIT_BLOG_CATEGORY":
            componentToDisplay = (
                <AddEditBlogCategory onClose={addCloseHandler} props={editData} />
            );
            break;
        default:
            componentToDisplay = (
                <>
                    <div className="flex justify-between mb-4">
                        <h1 className="text-xl font-semibold">{PageTitles.BLOG_CATEGORY}</h1>
                        <div className="flex flex-col items-end">
                            <Button
                                text="Add Blog Category"
                                type="add"
                                onClick={() => hasAddPermission ? setDisplayComponent("ADD_BLOG_CATEGORY") : showToast(CommonStrings.ACTION_NO_PERMISSION, "error")}
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
export default BlogsCategoryTable;


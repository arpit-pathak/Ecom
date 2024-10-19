import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import Table, { DragDropTable, SelectColumnFilter, StatusPill } from '../Table'
import {
    ApiCalls, AdminApis, HttpStatus, DateConverter, PageTitles, GeneralStatusChoices,
    Messages, UserPermissions, CommonStrings, buildQueryParams
} from '../../../../utils';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';
import AddEditFAQ from './AddEditFAQ';
import { Modal, Button } from '../../../generic';
import { Link } from 'react-router-dom';

const FAQTable = () => {
    const auth = useAuth();
    const [displayComponent, setDisplayComponent] = useState("TABLE");
    const [tableData, setTableData] = useState({
        data: [],
        pageCount: 0
    });
    const [editData, setEditData] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [faqChoices, setFaqChoices] = useState([]);
    const [faqCategories, setFaqCategories] = useState([]);
    const [faqSubCategories, setFaqSubCategories] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const faqIDRef = useRef(null);
    const filtersRef = useRef({
        faqType: null,
        status: null
    });
    const hasEditPermission = auth.checkPermission([UserPermissions.faq_edit, UserPermissions.web_contents_edit]);
    const hasAddPermission = auth.checkPermission([UserPermissions.faq_add, UserPermissions.web_contents_add]);
    const hasDeletePermission = auth.checkPermission([UserPermissions.faq_delete, UserPermissions.web_contents_delete]);
    let componentToDisplay = null;

    const addCloseHandler = (props) => {
        if (props) {
            getData();
        }
        setDisplayComponent("TABLE");
    }

    //Function to get FAQ list
    const getData = useCallback(async (page, records, search = null) => {
        const params = buildQueryParams(page, records, search);

        if (filtersRef.current.faqType) {
            params.faq_type = filtersRef.current.faqType;
        }

        if (filtersRef.current.status) {
            params.status = filtersRef.current.status;
        }

        if (filtersRef.current.faqCategory) {
            params.category_slug = filtersRef.current.faqCategory;
        }

        if (filtersRef.current.faqSubcategory) {
            params.category_slug = filtersRef.current.faqSubcategory;
        }

        await ApiCalls(AdminApis.faqList, "GET", params, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    setTableData(prevState => ({
                        ...prevState,
                        data: response.data.data.records,
                        pageCount: response.data.data.total_pages
                    }));
                    // Check if faqChoices is empty before setting it
                    if (faqChoices.length === 0) {
                        let choices = response.data.data.faq_choices.map(
                          (item) => {
                            return { label: item[1], value: item[0] };
                          }
                        );
                        setFaqChoices(choices);   
                        setCategoryList(response.data.data.faq_categories)                     
                    }
                }
            }).catch(error => {
                showToast(error.response.data.message, "error", "faq-contents")
            });
    }, [auth.token.access]); // Only depend on the auth token


    useEffect(() => {
        getData();
    }, [getData]);

    const columns = useMemo(
      () => [
        {
          Header: "",
          accessor: "dragHandler",
        },
        {
          Header: "Question",
          accessor: "question",
        },
        {
          Header: "For",
          accessor: "faq_type",
          Filter: ({ column }) => (
            <SelectColumnFilter
              column={column}
              choices={faqChoices}
              initialValue={filtersRef.current.faqType}
              onFilterChange={(filterValue) => {
                filtersRef.current.faqType = filterValue;
                filtersRef.current.faqCategory = null;
                filtersRef.current.faqSubcategory = null;
                setFaqCategories([]);
                setFaqSubCategories([]);
                if (
                  categoryList?.[filterValue] &&
                  categoryList?.[filterValue].length > 0
                ) {
                  let cats = categoryList?.[filterValue].map((item) => {
                    return { ...item, label: item?.name, value: item?.slug };
                  });
                  setFaqCategories(cats);
                }
                getData();
              }}
            />
          ),
          Cell: ({ cell: { value } }) => (
            <span className="capitalize">{value}</span>
          ),
        },
        {
          Header: "Category",
          accessor: "faq_category_name",
          Cell: ({ cell: { value } }) => (
            <span className="capitalize">{value ?? ""}</span>
          ),
          Filter: ({ column }) => (
            <SelectColumnFilter
              column={column}
              choices={faqCategories}
              initialValue={filtersRef.current.faqCategory}
              onFilterChange={(filterValue) => {
                filtersRef.current.faqCategory = filterValue;
                filtersRef.current.faqSubcategory = null;
                setFaqSubCategories([]);

                let indx = faqCategories.findIndex(
                  (item) => item?.name === filterValue
                );
                if (indx > -1) {
                  let subcats = faqCategories[indx]?.sub_categories?.map(
                    (item) => {
                      return {
                        ...item,
                        label: item?.name,
                        value: item?.slug,
                      };
                    }
                  );
                  setFaqSubCategories(subcats);
                }

                getData();
              }}
            />
          ),
        },
        {
          Header: "SubCategory",
          accessor: "faq_sub_category_name",
          Cell: ({ cell: { value } }) => (
            <span className="capitalize">{value ?? ""}</span>
          ),
          Filter: ({ column }) => (
            <SelectColumnFilter
              column={column}
              choices={faqSubCategories}
              initialValue={filtersRef.current.faqSubcategory}
              onFilterChange={(filterValue) => {
                filtersRef.current.faqSubcategory = filterValue;
                getData();
              }}
            />
          ),
        },
        {
          Header: "FAQ URL",
          accessor: "faq_url",
          Cell: ({ cell: { value } }) => (
            <Link className="text-blue-500 underline" to={value} target="_blank">{value ?? ""}</Link>
          ),
        },
        {
          Header: "Status",
          accessor: "status",
          Cell: StatusPill,
          Filter: ({ column }) => (
            <SelectColumnFilter
              column={column}
              choices={GeneralStatusChoices}
              initialValue={filtersRef.current.status}
              onFilterChange={(filterValue) => {
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
            <div className="text-sm text-gray-500 whitespace-normal">
              {DateConverter(value)}
            </div>
          ),
        },
        {
          Header: "Modified On",
          accessor: "modified_date",
          Cell: ({ cell: { value } }) => (
            <div className="text-sm text-gray-500 whitespace-normal">
              {DateConverter(value)}
            </div>
          ),
        },
        {
          Header: "Last Modified By",
          accessor: "name",
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
                    setDisplayComponent("EDIT_FAQ");
                  } else {
                    showToast(CommonStrings.ACTION_NO_PERMISSION, "error");
                  }
                }}
                type="edit"
              />
              <Button
                text="Delete"
                onClick={() => {
                  if (hasDeletePermission) {
                    faqIDRef.current = props.row.original.id_faq;
                    setIsOpen(true);
                  } else {
                    showToast(CommonStrings.ACTION_NO_PERMISSION, "error");
                  }
                }}
                type="delete"
              />
            </>
          ),
        },
      ],
      [hasEditPermission, hasDeletePermission, faqChoices, getData]
    );

    const sortDataUpdate = async (newData, pageIndex, pageSize) =>{
        const formData = new FormData();

        for(let i =0; i < newData.length; i++){
            formData.append("order_list[]", i+1);
            formData.append("id_list[]", newData[i].id_faq);
        }
        formData.append("current_page", pageIndex);
        formData.append("paging", pageSize);
        await ApiCalls(AdminApis.sortFaq, "POST", formData, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    showToast(response.data.message, "success", "sort-faq")
                    setIsOpen(false);
                    setTableData(prevState => ({
                        ...prevState,
                        data: newData
                    }));
                }
            }).catch(error => {
                showToast(error.response.data.message, "error")
            });
    }

    switch (displayComponent) {
        case "ADD_FAQ":
            componentToDisplay = (
              <AddEditFAQ
                onClose={addCloseHandler}
                choices={faqChoices}
              />
            );
            break;
        case "EDIT_FAQ":
            componentToDisplay = (
              <AddEditFAQ
                onClose={addCloseHandler}
                props={editData}
                choices={faqChoices}
              />
            );
            break;
        default:
            componentToDisplay = (
              <>
                <div className="flex justify-between mb-4">
                  <h1 className="text-xl font-semibold">{PageTitles.FAQ}</h1>
                  <div className="flex flex-col items-end">
                    <Button
                      text="Add FAQ"
                      type="add"
                      onClick={() =>
                        hasAddPermission
                          ? setDisplayComponent("ADD_FAQ")
                          : showToast(
                              CommonStrings.ACTION_NO_PERMISSION,
                              "error"
                            )
                      }
                      py="2"
                      px="4"
                    />
                  </div>
                </div>

                {tableData.data ? (
                  <DragDropTable
                    columns={columns}
                    data={tableData.data}
                    fetchData={getData}
                    sortDataUpdate={sortDataUpdate}
                    numOfPages={tableData.pageCount}
                    idAccessor="id_faq"
                    onSearchChange={(searchValue) => {
                      getData(undefined, undefined, searchValue);
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
        formData.append("id_faq", faqIDRef.current);
        await ApiCalls(AdminApis.deleteFaq, "POST", formData, false, auth.token.access)
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
export default FAQTable;

import {
    ApiCalls, AdminApis, HttpStatus, DateConverter, buildQueryParams,
    Messages, UserPermissions, CommonStrings
  } from '../../../../../utils';
  import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
  import { showToast } from '../../../../generic/Alerts';
  import { AdminRoutes } from '../../../../../../Routes';
  import { useNavigate, useLocation } from "react-router-dom";
  import useAuth from '../../../../../hooks/UseAuth';
  import { Modal, Button } from '../../../../generic';
  import Table, { DragDropTable, SelectColumnFilter } from '../../Table'
  import AddEditFAQCategory from './AddEditFAQCategory';
  
  const ProductCategory = () => {
    const [displayComponent, setDisplayComponent] = useState("TABLE");
    const [tableData, setTableData] = useState({
      data: null,
      pageCount: 0
    });
    const filtersRef = useRef({
      categoryLevel: null,
    });
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [editData, setEditData] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const { id_faq_category, parent_category_name } = location.state || {};
    const hasEditPermission = auth.checkPermission([UserPermissions.products_edit, UserPermissions.products_categories_edit]);
    const hasAddPermission = auth.checkPermission([UserPermissions.products_add, UserPermissions.products_categories_add]);
    const hasDeletePermission = auth.checkPermission([UserPermissions.products_delete, UserPermissions.products_categories_delete]);
    const faqCategoryIDRef = useRef(null);
    const [faqTypes, setFaqTypes] = useState([]);

    let componentToDisplay = null;
    let buttonText = "Add Parent Category";
    let titleText = "FAQ Categories";
  
    if (parent_category_name) {
      buttonText = "Add Sub Category";
      titleText = parent_category_name;
    }
    
    //Function to get all category list
    const getData = useCallback(async (
      page,
      records,
      search,
      parent_id = id_faq_category,
    ) => {
      const params = buildQueryParams(page, records, search);
      let url = AdminApis.faqCategoryList
      if (parent_id) {
        url += parent_id;
      }
      if (filtersRef.current.categoryLevel) {
        params.category_level = filtersRef.current.categoryLevel;
      }
      await ApiCalls(url, "GET", params, false, auth.token.access)
        .then(response => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            const categoryList = response.data.data.records;
            setTableData(prevState => ({
              ...prevState,
              data: categoryList,
              pageCount: response.data.data.total_pages
            }));

            setFaqTypes(response.data.data.faq_choices)
          }
        }).catch(error => {
          showToast(error.response.message, "error", "product-category")
        });
    }, [auth.token.access, id_faq_category]);
  
    const addCloseHandler = (props) => {
      if (props) {
        getData();
      }
      setDisplayComponent("TABLE");
    }  
  
    useEffect(() => {
      getData();
    }, [getData]);
  
    const columns = useMemo(() => [
      {
        Header: "",
        accessor: "dragHandler",
      },
      {
        Header: "Parent Category",
        accessor: 'name',
        Filter: () => (
          <SelectColumnFilter
            column={{ id: "CategoryLevel", render: "Category" }}
            choices={[
              { "value": "1", "label": "Main Category", },
              { "value": "2", "label": "Sub Category", },
            ]}
            initialValue={filtersRef.current.categoryLevel}
            onFilterChange={filterValue => {
              filtersRef.current.categoryLevel = filterValue;
              getData();
            }}
            custom={true}
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
                  setDisplayComponent("EDIT_FAQ_CATEGORY");
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
                  faqCategoryIDRef.current = props.row.original.id_faq_category;
                  setIsOpen(true);
                } else {
                  showToast(CommonStrings.ACTION_NO_PERMISSION, "error")
                }
              }}
              type="delete"
            />
            {!parent_category_name && <Button
                text="Subcategories"
                type="view"
                onClick={() => {
                    let stateObj = {
                        parent_category_name: props.row.original?.name,
                        id_faq_category: props.row.original?.id_faq_category
                    }
                    navigate(AdminRoutes.ManageFAQCategories + props.row.original.id_faq_category, { state: stateObj })
                }}
            />}
          </>
        )
      },
    ], [navigate, hasEditPermission, hasDeletePermission, getData])
  
    const sortDataUpdate = async (newData, pageIndex, pageSize) =>{
      const formData = new FormData();

      for(let i =0; i < newData.length; i++){
          formData.append("order_list[]", i+1);
          formData.append("id_list[]", newData[i].id_faq_category);
      }
      formData.append("current_page", pageIndex);
      formData.append("paging", pageSize);
      await ApiCalls(AdminApis.sortFaqCategoryList, "POST", formData, false, auth.token.access)
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
      case "ADD_FAQ_CATEGORY":
        componentToDisplay = (
          <AddEditFAQCategory onClose={addCloseHandler} props={{
            id_faq_category: id_faq_category,
            parent_category_name: parent_category_name,
            faqTypes: faqTypes
          }}
          />
        );
        break;
      case "EDIT_FAQ_CATEGORY":
        componentToDisplay = (
          <AddEditFAQCategory onClose={addCloseHandler} props={{
            id_faq_category: id_faq_category,
            parent_category_name: parent_category_name,
            edit_data: editData,
            faqTypes: faqTypes
          }}
          />
        );
        break;
      
      default:
        componentToDisplay = (
          <>
            <h1 className="text-xl font-semibold">{titleText}</h1>
            <div className="flex flex-col lg:flex-row justify-between lg:items-center my-4 space-y-2 lg:space-y-0">
              {parent_category_name &&
                <Button
                  onClick={() => navigate(-1)}
                  text="Back"
                  type="cancel"
                  py="2"
                  px="4"
                />
  
              }
              <div className="flex flex-col lg:flex-row md:flex-row items-center justify-end space-x-2 flex-grow">
                <Button
                  text={buttonText}
                  type="add"
                  onClick={() => hasAddPermission ? setDisplayComponent("ADD_FAQ_CATEGORY") : showToast(CommonStrings.ACTION_NO_PERMISSION, "error")}
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
                idAccessor="id_faq_category"
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
  
    const handleDelete = async () => {
      const formData = new FormData();
      let url = AdminApis.deleteFaqCategory + faqCategoryIDRef.current +"/"
      await ApiCalls(url, "DELETE", formData, false, auth.token.access)
        .then(response => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            showToast(response.data.message, "success", "delete-faq-cat")
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
          confirm={handleDelete}
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
  export default ProductCategory;
  
  
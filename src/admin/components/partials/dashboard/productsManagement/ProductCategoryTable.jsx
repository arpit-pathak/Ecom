import {
  ApiCalls, AdminApis, HttpStatus, DateConverter, buildQueryParams,
  Messages, UserPermissions, CommonStrings
} from '../../../../utils';
import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import { showToast } from '../../../generic/Alerts';
import { AdminRoutes } from '../../../../../Routes';
import AddEditCategory from './AddEditCategory';
import UploadCategory from './UploadCategory';
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from '../../../../hooks/UseAuth';
import { Modal, Button } from '../../../generic';
import Table, { SelectColumnFilter } from '../Table'
import Loader from '../../../../../utils/loader';

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
  const { id_category, main_category_name, second_category_name, third_category_name } = location.state || {};
  const hasEditPermission = auth.checkPermission([UserPermissions.products_edit, UserPermissions.products_categories_edit]);
  const hasAddPermission = auth.checkPermission([UserPermissions.products_add, UserPermissions.products_categories_add]);
  const hasDeletePermission = auth.checkPermission([UserPermissions.products_delete, UserPermissions.products_categories_delete]);
  const categoryIDRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  let componentToDisplay = null;
  let buttonText = "Add Main Category";
  let titleText = "All Categories";

  if (main_category_name) {
    buttonText = "Add Sub Category";
    titleText = main_category_name;
  }
  if (second_category_name) {
    buttonText = "Add Third Category";
    titleText = second_category_name;
  }

  //Function to get all category list
  const getData = useCallback(async (
    page,
    records,
    search,
    parent_id = id_category,
  ) => {
    const params = buildQueryParams(page, records, search);
    if (parent_id) {
      params.parent_id = parent_id;
    }
    if (filtersRef.current.categoryLevel) {
      params.category_level = filtersRef.current.categoryLevel;
    }
    await ApiCalls(AdminApis.categoryList, "GET", params, false, auth.token.access)
      .then(response => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          const categoryList = response.data.data.records;
          setTableData(prevState => ({
            ...prevState,
            data: categoryList,
            pageCount: response.data.data.total_pages
          }));
        }
      }).catch(error => {
        showToast(error.response.message, "error", "product-category")
      });
  }, [auth.token.access, id_category]);

  const addCloseHandler = (props) => {
    if (props) {
      getData();
    }
    setDisplayComponent("TABLE");
  }

  //Handle CSV Download
  const onDownloadHandler = async () => {
    setIsDownloading(true)
    await ApiCalls(AdminApis.downloadCategory, "GET", null, true, auth.token.access)
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


  useEffect(() => {
    getData();
  }, [getData]);

  const columns = useMemo(() => [
    //Multiple Edit?
    // {
    //   Header: "Check Box",
    //   Cell: (props) => (
    //     <input
    //       type="checkbox"
    //       name="check_box"
    //       className='w-4 h-4'
    //     />
    //   ),
    // },
    {
      Header: "Main Category",
      accessor: 'main_category_name',
      Filter: () => (
        <SelectColumnFilter
          column={{ id: "CategoryLevel", render: "Category" }}
          choices={[
            { "value": "1", "label": "Main Category", },
            { "value": "2", "label": "Sub Category", },
            { "value": "3", "label": "3rd Category", },
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
      Header: "Sub Category",
      accessor: 'second_category_name',

    },
    {
      Header: "3rd Category",
      accessor: 'third_category_name',
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
                setDisplayComponent("EDIT_CATEGORY");
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
                categoryIDRef.current = props.row.original.id_category;
                setIsOpen(true);
              } else {
                showToast(CommonStrings.ACTION_NO_PERMISSION, "error")
              }
            }}
            type="delete"
          />
          {props.row.original.third_category_name !== null ? (
            null
          ) : props.row.original.second_category_name !== null ? (
            <Button
              text="3rdCategories"
              type="view"
              onClick={() => {
                const stateObj = {
                  main_category_name: props.row.original.main_category_name,
                  second_category_name: props.row.original.second_category_name,
                  third_category_name: props.row.original.third_category_name,
                  id_category: props.row.original.id_category,
                  parent_id: props.row.original.parent_id
                }
                navigate(AdminRoutes.ManageProductCategories + "/" + props.row.original.id_category, { state: stateObj })
              }}
            />
          ) : (
            <Button
              text="Subcategories"
              type="view"
              onClick={() => {
                const stateObj = {
                  main_category_name: props.row.original.main_category_name,
                  second_category_name: props.row.original.second_category_name,
                  third_category_name: props.row.original.third_category_name,
                  id_category: props.row.original.id_category,
                  parent_id: props.row.original.parent_id
                }
                navigate(AdminRoutes.ManageProductCategories + "/" + props.row.original.id_category, { state: stateObj })
              }}
            />
          )}
        </>
      )
    },
  ], [navigate, hasEditPermission, hasDeletePermission, getData])

  switch (displayComponent) {
    case "ADD_CATEGORY":
      componentToDisplay = (
        <AddEditCategory onClose={addCloseHandler} props={{
          id_category: id_category,
          main_category_name: main_category_name,
          second_category_name: second_category_name,
          third_category_name: third_category_name
        }}
        />
      );
      break;
    case "EDIT_CATEGORY":
      componentToDisplay = (
        <AddEditCategory onClose={addCloseHandler} props={{
          id_category: id_category,
          main_category_name: main_category_name,
          second_category_name: second_category_name,
          third_category_name: third_category_name,
          edit_data: editData
        }}
        />
      );
      break;
    case "UPLOAD_CATEGORY":
      componentToDisplay = (
        <UploadCategory onClose={addCloseHandler} />
      );
      break;
    default:
      componentToDisplay = (
        <>
          <h1 className="text-xl font-semibold">{titleText}</h1>
          <div className="flex flex-col lg:flex-row justify-between lg:items-center my-4 space-y-2 lg:space-y-0">
            {main_category_name &&
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
                onClick={() => setDisplayComponent("UPLOAD_CATEGORY")}
                text="Upload Categories"
                type="upload"
                py="2"
                px="4"
              />
              <Button
                onClick={() => onDownloadHandler()}
                text={isDownloading ? <Loader height="15px" width="15px" /> : "Download Categories" } 
                type="download"
                py="2"
                px={isDownloading ? "16":"4"}
                showIcon={!isDownloading}
              />
              <Button
                text={buttonText}
                type="add"
                onClick={() => hasAddPermission ? setDisplayComponent("ADD_CATEGORY") : showToast(CommonStrings.ACTION_NO_PERMISSION, "error")}
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

  const handleDelete = async () => {
    const formData = new FormData();
    if (categoryIDRef.current) formData.append("id_category", parseInt(categoryIDRef.current));
    await ApiCalls(AdminApis.deleteCategory, "POST", formData, false, auth.token.access)
      .then(response => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          showToast(response.data.message, "success", "delete-cat")
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


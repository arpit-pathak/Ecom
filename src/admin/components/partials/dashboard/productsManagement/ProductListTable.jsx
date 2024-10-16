import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import Table, { SelectColumnFilter } from '../Table'
import { ApiCalls, AdminApis, HttpStatus, Messages, buildQueryParams, CommonStrings, UserPermissions } from '../../../../utils';
import { showToast } from '../../../generic/Alerts';
import { ORDER_CONSTANTS } from '../../../../../constants/order_status.js';
import useAuth from '../../../../hooks/UseAuth';
import {
    SearchProductsForm,
} from './ProductsForm';
import { CustomerRoutes, AdminRoutes } from '../../../../../Routes.js';
import { Modal, Button } from '../../../generic';
import { InputBoxStyle } from '../../../../styles/FormStyles';
import { toast } from 'react-toastify';
import ViewProductDetail from './ViewProductDetail.jsx';

const DelistForm = ({ onConfirm }) => {
    const handleSubmit = (event, action) => {
        event.preventDefault();
        const formData = new FormData(event.target.form);
        onConfirm(formData, action);
    };
    return (
        <>
            <p className='text-lg font-semibold mb-3 text-left pr-32'>{CommonStrings.UPDATE_STATUS}</p>
            <hr />
            <div className="py-2"></div>
            <form className="w-full">
                <select
                    name="status_id"
                    id="status_id"
                    className={InputBoxStyle}
                >
                    <option label="Active" value={ORDER_CONSTANTS.GENERALSTATUS_ACTIVE}>Active</option>
                    <option label="Delist" value={ORDER_CONSTANTS.GENERALSTATUS_DELISTED}>Delist</option>
                </select>
                <button
                    type="submit"
                    className="mb-2 text-white bg-yellow-500 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
                    onClick={(event) => handleSubmit(event, "accept")} >
                    Update
                </button>
            </form>
        </>
    );
};

const ProductListTable = () => {
    const [tableData, setTableData] = useState({
        data: null,
        pageCount: 0
    });
    const filtersRef = useRef({
        status: ORDER_CONSTANTS.GENERALSTATUS_ACTIVE
    })
    const searchRef = useRef({}); //To store search form data for pagination
    const auth = useAuth();
    const productIDRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    let componentToDisplay = null;
    const [displayComponent, setDisplayComponent] = useState("TABLE");
    const [productId, setProductId] = useState("");
    const [isDelete, setIsDelete] = useState(false)
    const [isRecommended, setIsRecommended] = useState(false)
    const productStatusRef = useRef(null);

    const hasDeletePermission = auth.checkPermission([UserPermissions.products_delete, UserPermissions.campaigns_delete]);

    //Fetch data on first load with useEffect
    const getData = useCallback(async (page, records, search, searchForm) => {
        const params = buildQueryParams(page, records, search);
        if (filtersRef.current.status) {
            params.status_id = filtersRef.current.status;
        }

        if (searchForm) {
            for (const [key, value] of searchForm.entries()) {

                if (value !== '') {
                    searchRef.current[key] = value;

                    if (key === "filter_created_date") {
                        const filterList = value.split(',');
                        const dateArray = filterList.map(date => {
                            const dateObject = new Date(date);
                            return dateObject.toLocaleDateString('en-GB');
                        });
                        params["filter_created_date[]"] = dateArray;
                    }
                    else if (key === "product_rating") {
                        const splitValue = value.split('-');
                        params["filter_product_rating[]"] = splitValue;

                    }
                    else if(key === "prohibited_list"){
                        if(value === "prohibited_list"){
                            params["prohibited_list"] = "Y";
                            delete params.status_id;
                        }
                    }
                    else {
                        params[key] = value;
                    }
                }
            }
        } else {
            for (const [key, value] of Object.entries(searchRef.current)) {
                if (value !== '') {
                    if (key === "filter_created_date") {
                        const filterList = value.split(',');
                        const dateArray = filterList.map(date => {
                            const dateObject = new Date(date);
                            return dateObject.toLocaleDateString('en-GB');
                        });
                        params["filter_created_date[]"] = dateArray;
                    }
                    else if (key === "product_rating") {
                        const splitValue = value.split('-');
                        params["filter_product_rating[]"] = splitValue;

                    }
                    else {
                        params[key] = value;
                    }
                }
            }
        }

        await ApiCalls(AdminApis.prdouctList, "GET", params, false, auth.token.access)
            .then((response) => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    let products = []
                    if (response.data.data.products) {
                        products = response.data.data.products
                    }
                    setTableData(prevState => ({
                        ...prevState,
                        data: products,
                        pageCount: response.data.data.pages
                    }));
                }
            }).catch((error) => {
                showToast(error.response.data.message, "error")
            })
    }, [auth]);

    useEffect(() => {
        getData();
    }, [getData]);

    const columns = useMemo(
      () => [
        {
          Header: "Shop Name",
          accessor: "shop_name",
        },
        {
          Header: "Email",
          accessor: "seller_email",
        },
        {
          Header: "Product Name",
          accessor: "name",
          Cell: (props) => (
            <>
              <div className="text-sm text-gray-500 whitespace-normal underline">
                <a
                  href={CustomerRoutes.ProductDetails + props.row.original.slug}
                >
                  {props.row.original.name}
                </a>
              </div>
            </>
          ),
        },
        {
          Header: "Product ID",
          accessor: "id_product",
        },
        {
          Header: "Product Category",
          accessor: "product_category_name",
        },
        {
          Header: "Product Rating",
          accessor: "avg_rating",
        },
        {
          Header: "Created Date",
          accessor: "created_date",
        },
        {
          Header: "No. of Purchases",
          accessor: "sales_count",
          Filter: () => (
            <SelectColumnFilter
              column={{ id: "StatusFilter", render: "Status" }}
              choices={[
                {
                  value: ORDER_CONSTANTS.GENERALSTATUS_ACTIVE,
                  label: "Active",
                },
                {
                  value: ORDER_CONSTANTS.GENERALSTATUS_DELISTED,
                  label: "Delist",
                },
              ]}
              initialValue={filtersRef.current.status}
              onFilterChange={(filterValue) => {
                filtersRef.current.status = filterValue;
                getData();
              }}
              custom={true}
              all={false}
            />
          ),
        },
        {
          Header: "Status",
          accessor: "product_status",
        },
        {
          Header: "Action",
          Cell: (props) => (
            <>
              <Button
                text="View"
                onClick={() => {
                  setProductId(props.row.original.id_product);
                  setDisplayComponent("VIEW_PRODUCT");
                }}
                type="view"
              />
              <Button
                text="Edit"
                onClick={() => {
                  setProductId(props.row.original.id_product);
                  setDisplayComponent("EDIT_PRODUCT");
                }}
                type="edit"
              />
              <Button
                text="Update"
                onClick={() => {
                  productIDRef.current = props.row.original.id_product;
                  setIsOpen(true);
                }}
                type="transparent-blue"
              />
               <Button
                text="Delete"
                onClick={() => {
                  if (hasDeletePermission) {
                    productIDRef.current = props.row.original.id_product;
                    setIsDelete(true);
                  } else {
                    showToast(CommonStrings.ACTION_NO_PERMISSION, "error");
                  }
                }}
                type="delete"
              />
               <Button
                text={props.row.original.ushop_recommended === "n" ?"Recommend" : "Unrecommend"}
                onClick={() => {
                    productIDRef.current = props.row.original.id_product;
                    productStatusRef.current = props.row.original.ushop_recommended === "n" ? "recommended" : "unrecommended";
                    setIsRecommended(true);                 
                }}
                type="transparent-green"
                px={2}
                showIcon={true}
              />
            </>
          ),
        },
      ],
      [getData]
    );

    const getDataWithSearchForm = (formData) => {
        getData(null, null, null, formData);
    }

    const handleReset = () => {
        searchRef.current = {};
    }

    const handleConfirmation = async (formData, _) => {
        let url = AdminApis.sellerProductUpdate;
        if (productIDRef.current) {
            url = AdminApis.sellerProductUpdate + productIDRef.current + "/"
        }
        await toast.promise(
            ApiCalls(url, "POST", formData, false, auth.token.access),
            {
                pending: {
                    render() {
                        return "Loading..."
                    },
                },
                success: {
                    render({ data }) {
                        setIsOpen(false);
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

    const handleDeleteConfirmation = async () => {
      let url = AdminApis.deleteProductDetails +  productIDRef.current + "/";
      await ApiCalls(url, "DELETE", {}, false, auth.token.access)
        .then(response => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            showToast(response.data.message, "success", "delete-faq")
            setIsDelete(false);
            getData();
          }
        }).catch(error => {
          showToast(error.response.data.message, "error")
        });
    }

    const addAsRecommended = async () => {
      let url = AdminApis.sellerProductUpdate +  productIDRef.current + "/";
      var formData = new FormData()
      formData.append('update_part', 'ushop_recommended')
      await ApiCalls(url, "POST", formData, false, auth.token.access)
        .then(response => {
          if (response.status === HttpStatus.HTTP_200_OK) {
            showToast(response.data.message, "success", "recommend-prod")
            setIsRecommended(false);
            getData();
          }
        }).catch(error => {
          showToast(error.response.data.message, "error")
        });
    }

    return (
      <>
        {isDelete && (
          <Modal
            confirm={handleDeleteConfirmation}
            open={isDelete}
            onClose={() => setIsDelete(false)}
            title={CommonStrings.DELETE_TITLE}
            confirmText={CommonStrings.CONFIRM_YES}
            cancelText={CommonStrings.CONFIRM_NO}
          />
        )}
        {isOpen && (
          <Modal
            open={isOpen}
            onClose={() => setIsOpen(false)}
            form={<DelistForm onConfirm={handleConfirmation} />}
          />
        )}
        {isRecommended && (
          <Modal
            confirm={addAsRecommended}
            open={isRecommended}
            onClose={() => setIsRecommended(false)}
            title={CommonStrings.RECOMMENDED_TITLE + productStatusRef.current + "?"}
            confirmText={CommonStrings.CONFIRM_YES}
            cancelText={CommonStrings.CONFIRM_NO}
          />
        )}
        {displayComponent === "VIEW_PRODUCT" ? (
          <ViewProductDetail
            onClose={() => setDisplayComponent("TABLE")}
            productId={productId}
            isEdit={false}
          />
        ) : displayComponent === "EDIT_PRODUCT" ? (
          <ViewProductDetail
            onClose={() => setDisplayComponent("TABLE")}
            productId={productId}
            isEdit={true}
          />
        ) : (
          <div className="min-h-screen text-gray-900 bg-white">
            <main className="px-4 pt-4 pb-4 mx-auto sm:px-6 lg:px-8">
              <SearchProductsForm
                onConfirm={getDataWithSearchForm}
                onReset={handleReset}
              />
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
            </main>
          </div>
        )}
      </>
    );
}
export default ProductListTable;


import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import Table, { SelectColumnFilter, StatusPill } from '../Table'
import SellerAddEditForm from './SellerAddEditForm';
import SellerDetailedForm from './SellerDetailedForm';
import SellerProducts from './SellerProducts';
import {
  ApiCalls, AdminApis, HttpStatus, DateConverter, PageTitles,
  Messages, CommonStrings, UserPermissions, UserStatusChoices
} from '../../../../utils';
import { Modal, Button } from '../../../generic';
import { showToast } from '../../../generic/Alerts';
import { toast } from 'react-toastify';
import useAuth from '../../../../hooks/UseAuth';
import { Countries } from '../../../../utils/Constants';
import { getKeyByValue } from '../../../../utils/Utils';
import ViewSellerShipping from './SellerShippingViewForm';
import SellerWalletDetails from './SellerWalletDetails';

const SellerTable = () => {
  const [displayComponent, setDisplayComponent] = useState("TABLE");
  const [sellerData, setSellerData] = useState({});
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [countryData, setCountryData] = useState({});
  const [findFromChoices, setFindFromChoices] = useState([]);  
  const [tableData, setTableData] = useState({
    data: null,
    pageCount: 0
  });
  const [isFeaturedOpen, setIsFeaturedOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [sellerId, setSellerId] = useState("");
  const [sellerWalletData, setSellerWalletData] = useState({});

  const filtersRef = useRef({
    status: null
  })
  const auth = useAuth();
  const hasEditPermission = auth.checkPermission([UserPermissions.user_management_edit, UserPermissions.sellers_edit]);
  const hasWalletViewPermission = auth.checkPermission([
    UserPermissions.finance_view,
    UserPermissions.user_management_view,
    UserPermissions.seller_wallet,
  ]);
  const userIDRef = useRef(null);
  let componentToDisplay = null;

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

    await ApiCalls(AdminApis.merchantList, "POST", formData, false, auth.token.access)
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

  const onCloseHandler = async (isRefresh) => {
    setDisplayComponent("TABLE");
    if(isRefresh) getData();
  }

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

  //Fetch data on first load with useEffect
  useEffect(() => {
    getData();
  }, [getData]);

  useEffect(()=>{
    getCommonData()
  },[])

  const addSellerHandler = () => {
    setDisplayComponent("ADD_SELLER")
  }

  const onAddFormCloseHandler = (isRefresh) =>{
    setDisplayComponent("TABLE")
    if(isRefresh) getData()
  }
  
  const columns = useMemo(() => [
    {
      Header: "Shop Name",
      accessor: 'name',
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
      Header: "Is Featured",
      accessor: 'is_featured',
    },
    {
      Header: "Action",
      Cell: (props) => (
        <>
          <Button
            text="View"
            onClick={() => {
              setSellerData(props.row.original);
              setDisplayComponent("VIEW_SELLER");
            }}
            type="view"
          />
          <Button
            text="Products"
            onClick={() => {
              setSellerData(props.row.original);
              setDisplayComponent("VIEW_PRODUCTS");
            }}
            type="transparent-yellow"
          />
          <Button
            text="Edit"
            onClick={() => {
              if (hasEditPermission) {
                setSellerData(props.row.original);
                setDisplayComponent("EDIT_TABLE");
              } else {
                showToast(CommonStrings.ACTION_NO_PERMISSION, "error")
              }
            }}
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
            text={props.row.original?.is_featured === "no" ? "Featured" : "Unfeatured"}
            onClick={() => {
              setCurrentUser({
                userId: props.row.original?.id_user,
               featureStatus: props.row.original?.is_featured === "no" ? "featured" : "unfeatured"
              })
              setIsFeaturedOpen(true)
            }}
            type="transparent-blue"
          />
          <Button
            text="Shipment"
            onClick={() => {
              setSellerId(props.row.original?.id_user);
              setDisplayComponent("VIEW_SHIPMENT");
            }}
            type="transparent-red"
          />
          {hasWalletViewPermission && <Button
            text="Wallet"
            onClick={() => {
              setSellerWalletData({
                email: props.row.original?.email ?? "N/A",
                business_name: props.row.original?.business_name ?? "N/A",
                id: props.row.original?.id_user,
              });
                setDisplayComponent("VIEW_WALLET");
            }}
            type="transparent-yellow"
          />}
        </>
      ),
    },
  ], [getData, hasEditPermission])

  switch (displayComponent) {
    case "VIEW_SELLER":
      componentToDisplay = (
        <SellerDetailedForm onClose={() => setDisplayComponent("TABLE")} props={sellerData} />
      );
      break;
    case "EDIT_TABLE":
      componentToDisplay = (
        <SellerAddEditForm
          onClose={onCloseHandler}
          props={sellerData}
          countryData={countryData}
          findFromChoices={findFromChoices}
          isEdit={true}
        />
      );
      break;
    case "VIEW_PRODUCTS":
      componentToDisplay = (
        <SellerProducts onClose={onCloseHandler} props={sellerData} />
      );
      break;
    case "ADD_SELLER":
      componentToDisplay = (
        <SellerAddEditForm
          countryData={countryData}
          onClose={onAddFormCloseHandler}
          findFromChoices={findFromChoices}
          isEdit={false}
        />
      );
      break;
    case "VIEW_SHIPMENT":
      componentToDisplay = (
        <ViewSellerShipping onClose={onCloseHandler} sellerId={sellerId} />
      );
      break;
    case "VIEW_WALLET":
      componentToDisplay = (
        <SellerWalletDetails onClose={() => setDisplayComponent("TABLE")} sellerWalletData={sellerWalletData} />
      );
    break;
    default:
      componentToDisplay = (
        <>
          <div className="flex justify-between mb-4">
            <h1 className="text-xl font-semibold">{PageTitles.SELLERS}</h1>
            <Button
              onClick={() => addSellerHandler()}
              text="Add Seller"
              type="add"
              py="2"
              px="4"
            />
          </div>
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
        </>
      );
  }

  const deleteConfirmation = async () => {
    const formData = new FormData();
    formData.append("user_id", userIDRef.current);
    await toast.promise(
      ApiCalls(AdminApis.deleteUser + "seller/", "POST", formData, false, auth.token.access),
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
  
  const featureStatusUpdate = async () => {
    let url = AdminApis.markSellerFeatureStatus + currentUser?.userId +"/"+currentUser?.featureStatus;

    const formData = new FormData();
    await toast.promise(
      ApiCalls(url, "GET", formData, false, auth.token.access),
      {
        pending: {
          render() {
            return "Loading..."
          },
        },
        success: {
          render({ data }) {
            setIsFeaturedOpen(false);
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

  return (
    <>
      {isDeleteOpen ? <Modal
        confirm={deleteConfirmation}
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={CommonStrings.DELETE_TITLE}
        confirmText={CommonStrings.CONFIRM_YES}
        cancelText={CommonStrings.CONFIRM_NO}
      />
        : null
      }
      {isFeaturedOpen ? <Modal
        confirm={featureStatusUpdate}
        open={isFeaturedOpen}
        onClose={() => setIsFeaturedOpen(false)}
        title={CommonStrings.FEATURED_TITLE+ " " + currentUser.featureStatus + " ?"}
        confirmText={CommonStrings.CONFIRM_YES}
        cancelText={CommonStrings.CONFIRM_NO}
      />
        : null
      }
      {displayComponent === "VIEW_SELLER" ? (
        <SellerDetailedForm onClose={() => setDisplayComponent("TABLE")} props={sellerData} />
      ) : (
        <div className="min-h-screen text-gray-900 bg-white">
          <main className="px-4 pt-4 pb-4 mx-auto sm:px-6 lg:px-8">
            {componentToDisplay}
          </main>
        </div>
      )}
    </>
  );
}

export default SellerTable;


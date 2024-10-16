import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import Table, { SelectColumnFilter, StatusPill } from '../Table'
import AddEditPlatformVoucherForm from './AddEditPlatformVoucherForm';
import {
  ApiCalls, AdminApis, HttpStatus, DateConverter,
  GeneralStatusChoices, PageTitles, Messages, CommonStrings, UserPermissions
} from '../../../../utils';
import { showToast } from '../../../generic/Alerts';
import { Modal, Button } from '../../../generic';
import useAuth from '../../../../hooks/UseAuth';

const PlatformVoucherTable = () => {
  const [displayComponent, setDisplayComponent] = useState("TABLE");
  const [editData, setEditData] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const addPromoCode = () => setDisplayComponent("ADD_PLATFORM_VOUCHER");
  const auth = useAuth();
  const voucherIDRef = useRef(null);
  const [tableData, setTableData] = useState({
    data: null,
    pageCount: 0
  });
  const filtersRef = useRef({
    status: null
  });
  const hasEditPermission = auth.checkPermission([UserPermissions.campaigns_edit, UserPermissions.platform_vouchers_edit]);
  const hasAddPermission = auth.checkPermission([UserPermissions.campaigns_add, UserPermissions.platform_vouchers_add]);
  const hasDeletePermission = auth.checkPermission([UserPermissions.campaigns_delete, UserPermissions.platform_vouchers_delete]);
  let componentToDisplay = null;

  const onClickHandler = async (obj) => {
    setEditData(obj);
    setDisplayComponent("EDIT_PLATFORM_VOUCHER");
  };

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

    if (filtersRef.current.status) {
      formData.append("status", filtersRef.current.status);
    }

    await ApiCalls(AdminApis.voucherList, "POST", formData, false, auth.token.access)
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

  const onEditHandler = async (props) => {
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
      Header: "Name",
      accessor: 'voucher_name',
    },
    {
      Header: "Code",
      accessor: 'voucher_code',
    },
    {
      Header: "Amount",
      accessor: 'discount_type_amount',
    },
    {
      Header: "Target Buyer",
      accessor: 'target_buyer',
    },
    {
      Header: "Usage Limit",
      accessor: 'usage_limit',
    },
    {
      Header: "Usage Count",
      accessor: 'usage_amount',
    },
    {
      Header: "Min Spend",
      accessor: 'minimum_spend',
    },
    {
      Header: "Max Discount",
      accessor: 'maximum_discount',
    },
    {
      Header: "Status",
      accessor: 'status_name',
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
      accessor: "from_date",
      Cell: ({ cell: { value } }) => (
        <div className="text-sm text-gray-500 whitespace-normal">{DateConverter(value, "Only Date")}</div>
      ),
    },
    {
      Header: "Expired On",
      accessor: 'to_date',
      Cell: ({ cell: { value } }) => (
        <div className="text-sm text-gray-500 whitespace-normal">{DateConverter(value, "Only Date")}</div>
      ),
    },
    {
      Header: "Action",
      Cell: (props) => (
        <>
          <Button
            text="Edit"
            onClick={() =>
              hasEditPermission ? onClickHandler(props.row.original) : showToast(CommonStrings.ACTION_NO_PERMISSION, "error")
            }
            type="edit"
          />
          <Button
            text="Delete"
            onClick={() => {
              if (hasDeletePermission) {
                voucherIDRef.current = props.row.original.id_voucher;
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
  ], [hasEditPermission, hasDeletePermission, getData])


  switch (displayComponent) {
    case "ADD_PLATFORM_VOUCHER":
      componentToDisplay = (
        <AddEditPlatformVoucherForm onClose={onEditHandler} />
      );
      break;
    case "EDIT_PLATFORM_VOUCHER":
      componentToDisplay = (
        <AddEditPlatformVoucherForm onClose={onEditHandler} props={editData} />
      );
      break;
    default:
      componentToDisplay = (
        <>
          <div className="flex justify-between mb-4">
            <h1 className="text-xl font-semibold">{PageTitles.PLATFORM_VOUCHERS}</h1>
            <Button
              text="Add Platform Voucher"
              onClick={() =>
                hasAddPermission ? addPromoCode() : showToast(CommonStrings.ACTION_NO_PERMISSION, "error")
              }
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
              onSearchChange={searchValue => {
                getData(undefined, undefined, searchValue)
              }}

            />
          ) : (
            <div>{Messages.LOADING}</div>
          )}
        </>
      );
  }

  const handleConfirmation = async () => {
    const formData = new FormData();
    formData.append("id_voucher", voucherIDRef.current);
    await ApiCalls(AdminApis.deleteVoucher, "POST", formData, false, auth.token.access)
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
        <main className="px-4 pt-4 mx-auto sm:px-6 lg:px-8">
          {componentToDisplay}
        </main>
      </div>
    </>
  );
}
export default PlatformVoucherTable;


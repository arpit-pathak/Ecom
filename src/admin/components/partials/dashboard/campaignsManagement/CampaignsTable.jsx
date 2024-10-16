import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import Table, { SelectColumnFilter, StatusPill } from '../Table'
import {
  ApiCalls, AdminApis, HttpStatus,
  PageTitles, Messages, UserPermissions, buildQueryParams, CommonStrings
} from '../../../../utils';
import { Modal, Button } from '../../../generic';
import { useNavigate } from "react-router-dom";
import { AdminRoutes } from '../../../../../Routes';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';

const CampaignTable = () => {
  const [tableData, setTableData] = useState({
    data: null,
    pageCount: 0
  });
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const campaignIDRef = useRef(null);
  const auth = useAuth();
  const hasDeletePermission = auth.checkPermission([UserPermissions.campaigns_delete, UserPermissions.campaigns_delete]);

  const onClickHandler = useCallback(async (obj) => {
    navigate(AdminRoutes.ManageCampaigns + "/" + obj.id_campaign, { state: obj });
  }, [navigate]);

  //Fetch data on first load with useEffect
  const getData = useCallback(async (page, records, search) => {
    const params = buildQueryParams(page, records, search);
    await ApiCalls(AdminApis.campaignList, "GET", params, false, auth.token.access)
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

  useEffect(() => {
    getData();
  }, [getData]);

  const columns = useMemo(() => [
    {
      Header: "Placement",
      accessor: 'placement',
    },
    {
      Header: "Status",
      accessor: 'status_name',
      Cell: StatusPill,
      Filter: SelectColumnFilter,
    },
    {
      Header: "Start Date",
      accessor: "start_date",
      Cell: ({ cell: { value } }) => (
        <div className="text-sm text-gray-500 whitespace-normal">{value}</div>
      ),
    },
    {
      Header: "End Date",
      accessor: 'end_date',
      Cell: ({ cell: { value } }) => (
        <div className="text-sm text-gray-500 whitespace-normal">{value}</div>
      ),
    },
    {
      Header: "Created Date",
      accessor: 'created_date',
      Cell: ({ cell: { value } }) => (
        <div className="text-sm text-gray-500 whitespace-normal">{value}</div>
      ),
    },
    {
      Header: "Action",
      Cell: (props) => (
        <>
          <Button
            text="View"
            onClick={() => onClickHandler(props.row.original)}
            type="view"
          />
          <Button
            text="Delete"
            onClick={() => {
              if (hasDeletePermission) {
                campaignIDRef.current = props.row.original.id_campaign;
                setIsOpen(true);
              } else {
                showToast(CommonStrings.ACTION_NO_PERMISSION, "error")
              }
            }}
            type="delete"
          />
        </>

      ),
    },
  ], [onClickHandler, hasDeletePermission])

  const handleConfirmation = async () => {
    const formData = new FormData();
    formData.append("id_campaign", campaignIDRef.current);
    await ApiCalls(AdminApis.deleteCampaign, "POST", formData, false, auth.token.access)
      .then(response => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          showToast(response.data.message, "success", "delete-campaign")
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
          <div className="flex justify-between mb-4">
            <h1 className="text-xl font-semibold">{PageTitles.CAMPAIGNS_REQUEST}</h1>
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
        </main>
      </div>
    </>
  );
}
export default CampaignTable;


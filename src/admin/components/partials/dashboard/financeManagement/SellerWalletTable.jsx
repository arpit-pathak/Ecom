import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import Table from '../Table'
import {
    ApiCalls, AdminApis, HttpStatus, ConvertDateToString,
    Messages, CommonStrings, UserPermissions, buildQueryParams
} from '../../../../utils';
import { Modal, Button } from '../../../generic';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';
import { toast } from 'react-toastify';
import {
    WithdrawForm, WalletSearchForm
} from './SellerForm';
import Loader from '../../../../../utils/loader';

const SellerWalletTable = () => {
    const [tableData, setTableData] = useState({
        data: null,
        pageCount: 0
    });
    const [isWithdraw, setIsWithdrawOpen] = useState(false);
    const withdrawRef = useRef({
        transactionID: null,
        userID: null,
    });
    const auth = useAuth();
    const searchRef = useRef({}); //To store search form data for pagination
    const hasEditPermission = auth.checkPermission([UserPermissions.finance_edit, UserPermissions.seller_wallet_edit]);
    const hasDownloadPermission = auth.checkPermission([UserPermissions.finance_download, UserPermissions.seller_wallet_download]);
    const [isDownloading, setIsDownloading] = useState(false);

    const getData = useCallback(async (page, records, searchForm) => {
        const params = buildQueryParams(page, records);

        if (searchForm) {
            for (const [key, value] of searchForm.entries()) {
                if (value !== '') {
                    searchRef.current[key] = value;
                    if (key === "transaction_date") {
                        const formattedDateValue = ConvertDateToString(value);
                        params[key] = formattedDateValue;
                    } else {
                        params[key] = value;
                    }
                }
            }
        } else {
            for (const [key, value] of Object.entries(searchRef.current)) {
                if (value !== '') {
                    if (key === "transaction_date") {
                        const formattedDateValue = ConvertDateToString(value);
                        params[key] = formattedDateValue;
                    } else {
                        params[key] = value;
                    }
                }
            }
        }

        await ApiCalls(AdminApis.sellerWalletList, "GET", params, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    setTableData(prevState => ({
                        ...prevState,
                        data: response.data.data.transaction_list,
                        pageCount: response.data.total_pages
                    }));
                }
            }).catch(error => {
                showToast(error.response.data.message, "error", "seller-wallet-error")
            });
    }, [auth]);

    useEffect(() => {
        getData();
    }, [getData]);

    const columns = useMemo(() => [
        {
            Header: "Seller Email",
            accessor: 'email',
        },
        {
            Header: "Seller Business Name",
            accessor: 'name',
        },
        {
            Header: "Transaction Amount",
            accessor: 'transaction_amount',
        },
        {
            Header: "Remaining Credit",
            accessor: 'remaining_credit',
        },
        {
            Header: "Transaction Receipt",
            accessor: 'receipt',
        },
        {
            Header: "Transaction Status",
            accessor: 'status',
        },
        {
            Header: "Type",
            accessor: 'transaction_type',
        },
        {
            Header: "Transaction Date",
            accessor: 'transaction_date',
        },
        {
            Header: "Action",
            Cell: (props) => {
                if (props.row.original.status === "PENDING") {
                    return <>
                        <Button
                            text="Update"
                            onClick={() => {
                                if (hasEditPermission) {
                                    withdrawRef.current.transactionID = props.row.original.id_transaction;
                                    withdrawRef.current.userID = props.row.original.user_id;
                                    setIsWithdrawOpen(true);
                                } else {
                                    showToast(CommonStrings.ACTION_NO_PERMISSION, "error")
                                }
                            }}
                            type="transparent-blue"
                        />
                    </>
                }
            },
        },
    ], [hasEditPermission])

    //Handle CSV Download
    const onDownloadHandler = async () => {
        setIsDownloading(true)
        await ApiCalls(AdminApis.sellerWalletExport, "GET", null, true, auth.token.access)
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

    const handleWithdraw = async (formData, action) => {
        if (withdrawRef.current.transactionID) formData.append("transaction_id", withdrawRef.current.transactionID);
        if (withdrawRef.current.userID) formData.append("user_id", withdrawRef.current.userID);
        formData.append("status", action);

        await toast.promise(
            ApiCalls(AdminApis.sellerWalletWithdraw, "POST", formData, false, auth.token.access),
            {
                pending: {
                    render() {
                        return "Loading..."
                    },
                },
                success: {
                    render({ data }) {
                        setIsWithdrawOpen(false);
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

    const getDataWithSearchForm = (formData) => {
        getData(null, null, formData);
    }

    const handleReset = () => {
        searchRef.current = {};
    }

    return (
        <>
            {isWithdraw ? <Modal
                open={isWithdraw}
                onClose={() => setIsWithdrawOpen(false)}
                title="Withdraw Confirmation"
                form={<WithdrawForm onConfirm={handleWithdraw} />}
            />
                : null
            }
            <div className="min-h-screen text-gray-900 bg-white">
                <main className="px-4 pt-4 mx-auto sm:px-6 lg:px-8">
                    <WalletSearchForm onConfirm={getDataWithSearchForm} onReset={handleReset} />
                    <div className="flex items-center justify-end space-x-2 mb-4">
                        <Button
                            onClick={() => hasDownloadPermission ? onDownloadHandler() : showToast(CommonStrings.ACTION_NO_PERMISSION, "error")}
                            text={isDownloading ? <Loader height="15px" width="15px" /> : "Download CSV" } 
                            type="download"
                            py="2"
                            px={isDownloading ? "12":"4"}
                            showIcon={!isDownloading}
                        />
                    </div>
                    {tableData.data ? (
                        <Table
                            columns={columns}
                            data={tableData.data}
                            fetchData={getData}
                            numOfPages={tableData.pageCount}
                            defaultSearch={false}
                        />
                    ) : (
                        <div>{Messages.LOADING}</div>
                    )}
                </main>
            </div>
        </>
    );
}
export default SellerWalletTable;


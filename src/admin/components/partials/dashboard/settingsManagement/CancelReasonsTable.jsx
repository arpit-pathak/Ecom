import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import Table, { StatusPill, SelectColumnFilter } from '../Table'
import {
    ApiCalls, AdminApis, HttpStatus, DateConverter, CommonStrings,
    Messages, buildQueryParams, GeneralStatusChoices
} from '../../../../utils';
import { FormStyle, InputBoxStyle } from '../../../../styles/FormStyles';
import { Modal, Button } from '../../../generic';
import { showToast } from '../../../generic/Alerts';
import { toast } from 'react-toastify';
import useAuth from '../../../../hooks/UseAuth';
import { useNavigate, useLocation } from "react-router-dom";
import AddEditReason from './AddEditReason';
import { AdminRoutes } from '../../../../../Routes';

const ReasonStatusForm = ({ onConfirm, onClose }) => {
    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        onConfirm(formData);
    };

    return (
        <>
            <p className='text-lg font-semibold mb-3 text-left'>Update Status</p>
            <hr />
            <div className="py-2"></div>
            <form className={FormStyle.overall} onSubmit={handleSubmit}>
                <select
                    name="status_id"
                    id="status_id"
                    className={InputBoxStyle}
                >
                    {GeneralStatusChoices && GeneralStatusChoices.map((option, i) => (
                        <option key={i} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <button data-modal-hide="popup-modal" type="submit" className="mb-2 text-white bg-yellow-500 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                    Confirm
                </button>
                <button onClick={onClose} data-modal-hide="popup-modal" type="button" className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                    Cancel
                </button>
            </form>
        </>
    );
};

let options = [
    { value: "order-return", label: "Order Return/Refund" },
    { value: "order-cancel", label: "Order Cancel" },
]

const CancelReasonsTable = () => {
    const [displayComponent, setDisplayComponent] = useState("TABLE");
    const [tableData, setTableData] = useState({
        data: null,
        pageCount: 0
    });
    const [editData, setEditData] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const auth = useAuth();
    const reasonIDRef = useRef(null);
    const filtersRef = useRef({
        slug: "buyer",
        reason_type: "order-return",
        status: null,
    });
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state || {};
    const parentsListRef = useRef([]);
    let componentToDisplay = null;
    let titleText = "Cancel Reasons";

    if (locationState.parent_id) {
        titleText = "Sub Reasons For: " + locationState.parent_reason_name;
    }

    const getData = useCallback(async (page, records, search = null) => {
        const params = buildQueryParams(page, records, search);
        let url = AdminApis.cancelReasonsList;
        if (filtersRef.current.status) {
            params.status_id = filtersRef.current.status;
        }
        if (filtersRef.current.slug) {
            url += `${filtersRef.current.slug}`;
        }
        if (filtersRef.current.reason_type) {
            url += `/${filtersRef.current.reason_type}`;
        }
        if (locationState.parent_id) {
            params.parent_id = locationState.parent_id;
        }
        await ApiCalls(url, "GET", params, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    parentsListRef.current = response.data.parent_list;
                    setTableData(prevState => ({
                        ...prevState,
                        data: response.data.data,
                        pageCount: response.data.total_pages
                    }));
                }
            }).catch(error => {
                showToast(error.response.data.message, "error", "cancel-reasons-error")
            });
    }, [auth, locationState.parent_id]);

    const onClose = () => {
        setDisplayComponent("TABLE")
        getData();
    }

    useEffect(() => {
        getData();
    }, [getData]);

    const columns = useMemo(() => [
        {
            Header: "Reason",
            accessor: 'reason',
            Filter: () => (
                <SelectColumnFilter
                    column={{ id: "Slug", render: "Usertype:" }}
                    choices={[
                        { "value": "buyer", "label": "Buyer" },
                        { "value": "seller", "label": "Seller" },
                        { "value": "ushop", "label": "uShop" },
                    ]}
                    initialValue={filtersRef.current.slug}
                    onFilterChange={filterValue => {
                        filtersRef.current.slug = filterValue;
                        getData();
                    }}
                    custom={true}
                    all={false}
                />
            ),
        },
        {
            Header: "Reason For",
            accessor: 'reason_for',
            Filter: () => (
                <SelectColumnFilter
                    column={{ id: "ReasonType", render: "Reasontype:" }}
                    choices={options}
                    initialValue={filtersRef.current.reason_type}
                    onFilterChange={filterValue => {
                        filtersRef.current.reason_type = filterValue;
                        getData();
                    }}
                    custom={true}
                    all={false}
                />
            ),
        },
        {
            Header: "Reason Type",
            accessor: 'reason_type',
            Cell: ({ cell: { value } }) => (
                value === "order-return" ? "Order Return/Refund" : "Order Cancel"
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
            Header: "Modified On",
            accessor: 'modified_date',
            Cell: ({ cell: { value } }) => (
                <div className="text-sm text-gray-500 whitespace-normal">{DateConverter(value)}</div>
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
            Header: "Action",
            Cell: (props) => (
                <>
                    <Button
                        text="Edit"
                        onClick={() => {
                            setEditData(props.row.original);
                            setDisplayComponent("EDIT_REASON")
                        }}
                        type="edit"
                    />
                    <Button
                        text="Update"
                        type="transparent-blue"
                        onClick={() => {
                            reasonIDRef.current = props.row.original.id_cancellation
                            setIsOpen(true);
                        }}
                    />
                    <Button
                        text="Delete"
                        onClick={() => {
                            reasonIDRef.current = props.row.original.id_cancellation
                            setIsDeleteOpen(true);
                        }}
                        type="delete"
                    />
                    {!locationState.parent_id && props.row.original.reason_type !== "order-cancel" && !props.row.original.parent_id &&
                        <Button
                            text="SubReasons"
                            type="view"
                            onClick={() => {
                                const stateObj = {
                                    parent_id: props.row.original.id_cancellation,
                                    parent_reason_type: props.row.original.reason_type,
                                    parent_user_type: props.row.original.reason_for,
                                    parent_reason_name: props.row.original.reason,
                                }
                                navigate(AdminRoutes.ManageCancelReasons + "/" + props.row.original.id_cancellation, { state: stateObj })
                            }}
                        />
                    }
                </>
            ),
        },
    ], [getData, navigate, locationState.parent_id])

    switch (displayComponent) {
        case "EDIT_REASON":
            componentToDisplay = (
                <AddEditReason onClose={onClose} props={editData} options={options} parentList={parentsListRef.current} />
            );
            break;
        case "ADD_REASON":
            componentToDisplay = (
                <AddEditReason onClose={onClose} options={options} parentList={parentsListRef.current} />
            );
            break;
        default:
            componentToDisplay = (
                <>
                    <div className="flex justify-between mb-4">
                        <h1 className="text-xl font-semibold">{titleText}</h1>
                        <div className="flex flex-col lg:flex-row md:flex-row items-center justify-end space-x-2 flex-grow">
                            {locationState.parent_id &&
                                <Button
                                    text="Back"
                                    type="cancel"
                                    onClick={() => navigate(-1)}
                                    py="2"
                                    px="4"
                                />
                            }
                            <Button
                                text="Add Reason"
                                type="add"
                                onClick={() => setDisplayComponent("ADD_REASON")}
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
                        <div>{Messages.LOADING}</div>
                    )}
                </>
            )
    }

    const handleConfirmation = async (formData) => {
        formData.append("id_cancellation", reasonIDRef.current);
        await toast.promise(
            ApiCalls(AdminApis.cancelReasonsUpdate, "POST", formData, false, auth.token.access),
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

    const handleDelete = async () => {
        const formData = new FormData();
        formData.append("id_cancellation", reasonIDRef.current);
        formData.append("status_id", 10);
        await toast.promise(
            ApiCalls(AdminApis.cancelReasonsUpdate, "POST", formData, false, auth.token.access),
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
                        return data.data.message
                    },
                },
            },
        )
    }



    return (
        <>
            {isOpen ? <Modal
                open={isOpen}
                onClose={() => setIsOpen(false)}
                form={<ReasonStatusForm
                    onConfirm={handleConfirmation}
                    onClose={() => setIsOpen(false)}
                />}
            />
                : null
            }
            {isDeleteOpen ? <Modal
                confirm={handleDelete}
                open={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
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
export default CancelReasonsTable;


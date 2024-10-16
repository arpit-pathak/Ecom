import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { ApiCalls, AdminApis, HttpStatus, buildQueryParams, Messages, CommonStrings } from '../../../../utils';
import Table, { SelectColumnFilter } from '../Table'
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';
import { ORDER_CONSTANTS } from '../../../../../constants/order_status.js';
import { Modal, Button } from '../../../generic';
import { InputBoxStyle } from '../../../../styles/FormStyles';
import { toast } from 'react-toastify';

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

export default function SellerProducts({ onClose, props }) {
    const auth = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [tableData, setTableData] = useState({
        data: null,
        pageCount: 0
    });
    const filtersRef = useRef({
        status: ORDER_CONSTANTS.GENERALSTATUS_ACTIVE
    })
    const productIDRef = useRef(null);

    const getData = useCallback(async (page, records, search = null) => {
        const params = buildQueryParams(page, records, search);
        let url = AdminApis.sellerProductsList;
        if (filtersRef.current.status) {
            params.status_id = filtersRef.current.status;
        }
        if (props?.seller_id) {
            url = AdminApis.sellerProductsList + props.seller_id + "/list/"
        }
        await ApiCalls(url, "GET", params, false, auth.token.access)
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
    }, [auth, props?.seller_id]);

    useEffect(() => {
        getData();
    }, [getData]);


    const columns = useMemo(() => [
        {
            Header: "Product ID",
            accessor: 'id_product',
        },
        {
            Header: "Product Name",
            accessor: 'name',
            Filter: () => (
                <SelectColumnFilter
                    column={{ id: "StatusFilter", render: "Status" }}
                    choices={[
                        { "value": ORDER_CONSTANTS.GENERALSTATUS_ACTIVE, "label": "Active", },
                        { "value": ORDER_CONSTANTS.GENERALSTATUS_DELISTED, "label": "Delist", },
                    ]}
                    initialValue={filtersRef.current.status}
                    onFilterChange={filterValue => {
                        filtersRef.current.status = filterValue;
                        getData();
                    }}
                    custom={true}
                    all={false}
                />
            ),

        },
        {
            Header: "Product SKU",
            Cell: (props) => (
                <>
                    {props.row.original.variations?.sku &&
                        props.row.original.variations?.sku
                    }
                </>
            ),
        },
        {
            Header: "Action",
            Cell: (props) => (
                <>
                    <Button
                        text="Update"
                        onClick={() => {
                            productIDRef.current = props.row.original.id_product;
                            setIsOpen(true);
                        }}
                        type="transparent-blue"
                    />
                </>
            ),
        },
    ], [getData])

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

    return (
        <>
            {isOpen ? <Modal
                open={isOpen}
                onClose={() => setIsOpen(false)}
                form={<DelistForm onConfirm={handleConfirmation} />}
            />
                : null
            }
            <Button
                onClick={onClose}
                text="Back"
                type="cancel"
                py="2"
                px="3"
            />
            <div className='pb-4'></div>
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

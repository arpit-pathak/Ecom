import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import Table, { StatusPill } from '../Table'
import {
    ApiCalls, AdminApis, HttpStatus, DateConverter, PageTitles,
    Messages, buildQueryParams
} from '../../../../utils';
import Button from '../../../generic/Buttons';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';
import ShippingRates from './ShippingRates';
import EditShippingOption from './EditShippingOption';

const ShippingOptionsTable = () => {
    const [displayComponent, setDisplayComponent] = useState("TABLE");
    const [tableData, setTableData] = useState({
        data: null,
        pageCount: 0
    });
    const auth = useAuth();
    const shippingIDRef = useRef(null);
    let componentToDisplay = null;
    const pageTitle = useRef(PageTitles.SHIPPING_OPTIONS);

    const getData = useCallback(async (page, records, search = null) => {
        const params = buildQueryParams(page, records, search);
        await ApiCalls(AdminApis.shippingOptionsList, "GET", params, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    setTableData(prevState => ({
                        ...prevState,
                        data: response.data.data,
                        pageCount: response.data.total_pages
                    }));
                }
            }).catch(error => {
                showToast(error.response.data.message, "error", "shipping-options-error")
            });
    }, [auth]);

    const onClose = () => {
        pageTitle.current = PageTitles.SHIPPING_OPTIONS
        setDisplayComponent("TABLE")
        getData();
    }

    useEffect(() => {
        getData();
    }, [getData]);

    const columns = useMemo(() => [
        {
            Header: "Shipping Name",
            accessor: 'name',
        },
        {
            Header: "Description",
            accessor: 'description',
        },
        {
            Header: "Status",
            accessor: 'general_status',
            Cell: StatusPill
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
            Header: "Action",
            Cell: (props) => (
                <>
                    <Button
                        text="Rates"
                        type="view"
                        onClick={() => {
                            shippingIDRef.current = props.row.original.id_shipping_option
                            pageTitle.current = PageTitles.SHIPPING_RATES + ": " + props.row.original.name
                            setDisplayComponent("SHIPPING_RATES")
                        }}
                    />
                    <Button
                        text="Edit"
                        onClick={() => {
                            shippingIDRef.current = props.row.original
                            setDisplayComponent("EDIT_SHIPPING_OPTION")
                        }}
                        type="edit"
                    />
                </>
            ),
        },
    ], [])

    switch (displayComponent) {
        case "EDIT_SHIPPING_OPTION":
            componentToDisplay = (
                <EditShippingOption onClose={onClose} props={shippingIDRef.current} />
            );
            break;
        case "SHIPPING_RATES":
            componentToDisplay = (
                <ShippingRates onClose={onClose} shippingID={shippingIDRef.current} />
            );
            break;
        default:
            componentToDisplay = (
                <>
                    {
                        tableData.data ? (
                            <Table
                                columns={columns}
                                data={tableData.data}
                                fetchData={getData}
                                numOfPages={tableData.pageCount}
                                defaultSearch={false}
                            />
                        ) : (
                            <div>{Messages.LOADING}</div>
                        )
                    }
                </>
            )
    }


    return (
        <>
            <div className="min-h-screen text-gray-900 bg-white">
                <main className="px-4 pt-4 mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-xl font-bold mb-1">{pageTitle.current}</h1>
                    {componentToDisplay}
                </main>
            </div>
        </>
    );
}
export default ShippingOptionsTable;


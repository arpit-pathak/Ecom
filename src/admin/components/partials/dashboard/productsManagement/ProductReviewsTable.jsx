import { useMemo, useState, useEffect, useCallback } from 'react'
import Table, { StatusPill } from '../Table'
import { ApiCalls, AdminApis, HttpStatus, PageTitles, Messages, buildQueryParams } from '../../../../utils';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';
import { CustomerRoutes } from '../../../../../Routes.js';


const ProductReviewsTable = () => {
    const [tableData, setTableData] = useState({
        data: null,
        pageCount: 0
    });
    const auth = useAuth();

    //Fetch data on first load with useEffect
    const getData = useCallback(async (page, records, search) => {
        const params = buildQueryParams(page, records, search);
        await ApiCalls(AdminApis.productReviewList, "GET", params, false, auth.token.access)
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
            Header: "Seller Business Name",
            accessor: 'seller_business_name',
        },
        {
            Header: "Seller Name",
            accessor: 'seller_individual_name',
        },
        {
            Header: "Product Name",
            accessor: 'name',
            Cell: (props) => (
                <>
                    <div className="text-sm text-gray-500 whitespace-normal underline">
                        <a href={CustomerRoutes.ProductDetails + props.row.original.slug}>
                            {props.row.original.name}
                        </a>
                    </div>
                </>
            ),
        },
        {
            Header: "Status",
            accessor: 'status_name',
            Cell: StatusPill,
        },
        {
            Header: "Rating",
            accessor: 'avg_rating',
        }
    ], [])

    return (
        <>
            <div className="min-h-screen text-gray-900 bg-white">
                <main className="px-4 pt-4 pb-4 mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between mb-4">
                        <h1 className="text-xl font-semibold">{PageTitles.PRODUCTS_REVIEWS}</h1>
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
export default ProductReviewsTable;


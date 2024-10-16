import { useState, useEffect, useCallback } from 'react'
import {
    ApiCalls, AdminApis, HttpStatus
} from '../../../../utils';
import { showToast } from '../../../generic/Alerts';
import useAuth from '../../../../hooks/UseAuth';
import { useParams, useNavigate } from "react-router-dom";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Form, Button } from '../../../generic';
import { GridStyle, FormStyle } from '../../../../styles/FormStyles';
import { ORDER_CONSTANTS } from '../../../../../constants/order_status.js';
import { CustomerRoutes } from '../../../../../Routes.js';


function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                children
            )}
        </div>
    );
}


const OrderDetail = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const { slug } = useParams();
    const [value, setValue] = useState(0);
    const [orderInfo, setOrderInfo] = useState({
        orderDetails: [],
        statusHistory: [],
        buyerDetails: [],
        sellerDetails: [],
        productDetails: [],
        shippingDetails: [],
        paymentStatusHistory: [],
        refundDetails:[],
    });


    const handleTabChange = (_, newValue) => {
        setValue(newValue);
    };

    const getData = useCallback(async () => {
        const formData = new FormData();
        if (slug) {
            formData.append("id_order", slug);
        }

        await ApiCalls(AdminApis.orderDetails, "POST", formData, false, auth.token.access)
            .then(response => {
                if (response.status === HttpStatus.HTTP_200_OK) {
                    let orderDetails = response.data.data;
                    let orderStatus = orderDetails.order_delivery;
                    if (orderDetails.delivery_status_id === ORDER_CONSTANTS.GENERALSTATUS_CANCELLED) {
                        orderStatus += " (" + orderDetails.admin_cancelled_text + ")";
                    }
                    const newOrderDetails = [
                        {
                            name: "id_order",
                            type: "text",
                            label: "Order ID",
                            disabled: '{true}',
                            defaultValue: orderDetails.id_order,
                        },
                        {
                            name: "order_number",
                            type: "text",
                            label: "Order Number",
                            disabled: '{true}',
                            defaultValue: orderDetails.order_number,
                        },
                        {
                            name: "order_status",
                            type: "text",
                            label: "Order Status",
                            disabled: '{true}',
                            defaultValue: orderStatus,
                        },
                        {
                            name: "created_date",
                            type: "text",
                            label: "Created Date",
                            disabled: '{true}',
                            defaultValue: orderDetails.created_date,
                        },
                        {
                            name: "created_date_formated",
                            type: "text",
                            label: "Created Datetime",
                            disabled: '{true}',
                            defaultValue: orderDetails.created_date_formated,
                        },
                        {
                            name: "order_payment",
                            type: "text",
                            label: "Payment Status",
                            disabled: '{true}',
                            defaultValue: orderDetails.order_payment,
                        },
                        {
                            name: "payment_type",
                            type: "text",
                            label: "Payment Type",
                            disabled: '{true}',
                            defaultValue: orderDetails.payment_type,
                        },
                        {
                            name: "order_total_weight",
                            type: "text",
                            label: "Total Weight",
                            disabled: '{true}',
                            defaultValue: orderDetails.order_total_weight,
                        },
                        {
                            name: "order_total",
                            type: "text",
                            label: "Order Total",
                            disabled: '{true}',
                            defaultValue: orderDetails.formatted_order_total,
                        },
                        {
                            name: "total_discount",
                            type: "text",
                            label: "Total Discount",
                            disabled: '{true}',
                            defaultValue: orderDetails.formatted_total_discount,
                        },
                        {
                            name: "formatted_applied_cashback",
                            type: "text",
                            label: "Applied Cashback",
                            disabled: '{true}',
                            defaultValue: orderDetails.formatted_applied_cashback,
                        },
                        {
                            name: "total_shipping",
                            type: "text",
                            label: "Total Shipping",
                            disabled: '{true}',
                            defaultValue: orderDetails.formatted_total_shipping,
                        },
                        {
                            name: "total_paid",
                            type: "text",
                            label: "Total Paid",
                            disabled: '{true}',
                            defaultValue: orderDetails.formatted_total_paid,
                        },
                        {
                            name: "tracking_number",
                            type: "hyperLink",
                            label: "Tracking Number",
                            url: orderDetails?.tracking_url,
                            defaultValue: orderDetails.tracking_number,
                        },
                        {
                            name: "stripe_payment_intent",
                            type: "text",
                            label: "Stripe Payment ID",
                            disabled: '{true}',
                            defaultValue: orderDetails.stripe_payment_intent,
                        }
                    ];
                    setOrderInfo(prevState => ({
                        ...prevState,
                        orderDetails: newOrderDetails
                    }));

                    setOrderInfo(prevState => ({
                        ...prevState,
                        statusHistory: orderDetails.order_status
                    }));

                    setOrderInfo(prevState => ({
                        ...prevState,
                        paymentStatusHistory: orderDetails?.payment_status
                    }));

                    const newRefundDetail = [
                      {
                        name: "total_refund_amount",
                        type: "text",
                        label: "Refund Amount",
                        disabled: "{true}",
                        defaultValue:
                          orderDetails?.refund_detail?.total_refund_amount ??
                          "0.00",
                      },
                      {
                        name: "reason",
                        type: "textarea",
                        label: "Reason",
                        disabled: "{true}",
                        defaultValue:
                          orderDetails?.refund_detail?.reason ?? "N/A",
                      },
                      {
                        name: "remarks",
                        type: "textarea",
                        label: "Remarks",
                        disabled: "{true}",
                        defaultValue:
                          orderDetails?.refund_detail?.remarks ?? "N/A",
                      },
                    ];
                    setOrderInfo(prevState => ({
                        ...prevState,
                        refundDetails: newRefundDetail
                    }));

                    const newBuyerDetails = [
                        {
                            name: "buyer_user_id",
                            type: "text",
                            label: "Buyer ID",
                            disabled: '{true}',
                            defaultValue: orderDetails.buyer_user_id,
                        },
                        {
                            name: "buyer_name",
                            type: "text",
                            label: "Buyer Name",
                            disabled: '{true}',
                            defaultValue: orderDetails.buyer_name,
                        },
                        {
                            name: "buyer_email",
                            type: "text",
                            label: "Buyer Email",
                            disabled: '{true}',
                            defaultValue: orderDetails.buyer_email,
                        },
                        {
                            name: "buyer_contact_number",
                            type: "text",
                            label: "Buyer Contact Number",
                            disabled: '{true}',
                            defaultValue: orderDetails.buyer_contact_number,
                        },
                        {
                            name: "billing_address_details",
                            type: "text",
                            label: "Billing Address",
                            disabled: '{true}',
                            defaultValue: orderDetails.billing_address.address_details,
                        },
                        {
                            name: "postal_code",
                            type: "text",
                            label: "Postal Code",
                            disabled: '{true}',
                            defaultValue: orderDetails.billing_address.postal_code,
                        },
                        {
                            name: "unit_number",
                            type: "text",
                            label: "Unit Number",
                            disabled: '{true}',
                            defaultValue: orderDetails.billing_address.unit_number,
                        }
                    ];

                    setOrderInfo(prevState => ({
                        ...prevState,
                        buyerDetails: newBuyerDetails
                    }));

                    const newSellerDetails = [
                        {
                            name: "seller_id",
                            type: "text",
                            label: "Seller ID",
                            disabled: '{true}',
                            defaultValue: orderDetails.seller_detail.seller_id,
                        },
                        {
                            name: "business_name",
                            type: "text",
                            label: "Business Name",
                            disabled: '{true}',
                            defaultValue: orderDetails.seller_detail.business_name,
                        },
                        {
                            name: "email",
                            type: "text",
                            label: "Email",
                            disabled: '{true}',
                            defaultValue: orderDetails.seller_detail.email,
                        },
                        {
                            name: "name",
                            type: "text",
                            label: "Name",
                            disabled: '{true}',
                            defaultValue: orderDetails.seller_detail.individual_name,
                        },
                        {
                            name: "shop_name",
                            type: "text",
                            label: "Shop Name",
                            disabled: '{true}',
                            defaultValue: orderDetails.seller_detail.shop_name,
                        },

                    ];

                    setOrderInfo(prevState => ({
                        ...prevState,
                        sellerDetails: newSellerDetails
                    }));

                    setOrderInfo(prevState => ({
                        ...prevState,
                        productDetails: orderDetails.product_item
                    }));

                    const newShippingDetails = [
                      {
                        name: "shipping_address_id",
                        type: "text",
                        label: "Shipping Address ID",
                        disabled: "{true}",
                        defaultValue: orderDetails.shipping_address_id,
                      },
                      {
                        name: "shipping_address_name",
                        type: "text",
                        label: "Name",
                        disabled: "{true}",
                        defaultValue: orderDetails.shipping_address.full_name,
                      },
                      {
                        name: "contact_number",
                        type: "text",
                        label: "Contact Number",
                        disabled: "{true}",
                        defaultValue:
                          orderDetails.shipping_address.contact_number,
                      },
                      {
                        name: "shipping_address_details",
                        type: "text",
                        label: "Shipping Address",
                        disabled: "{true}",
                        defaultValue:
                          orderDetails.shipping_address.address_details,
                      },
                      {
                        name: "postal_code",
                        type: "text",
                        label: "Postal Code",
                        disabled: "{true}",
                        defaultValue: orderDetails.shipping_address.postal_code,
                      },
                      {
                        name: "unit_number",
                        type: "text",
                        label: "Unit Number",
                        disabled: "{true}",
                        defaultValue: orderDetails.shipping_address.unit_number,
                      },
                      {
                        name: "delivery_date",
                        type: "text",
                        label: "Delivery Date",
                        disabled: "{true}",
                        defaultValue: orderDetails.seller_detail
                          .delivery_date_end
                          ? orderDetails.seller_detail.delivery_date +
                            " to " +
                            orderDetails.seller_detail.delivery_date_end
                          : orderDetails.seller_detail.delivery_date,
                      },
                      {
                        name: "delivery_datetime_formated",
                        type: "text",
                        label: "Delivery Datetime",
                        disabled: "{true}",
                        defaultValue:
                          orderDetails.seller_detail.delivery_datetime_formated,
                      },
                      {
                        name: "delivery_method",
                        type: "text",
                        label: "Delivery Type",
                        disabled: "{true}",
                        defaultValue:
                          orderDetails.seller_detail.delivery_method,
                      },
                      {
                        name: "delivery_remark",
                        type: "text",
                        label: "Delivery Remark",
                        disabled: "{true}",
                        defaultValue:
                          orderDetails.seller_detail.delivery_remark,
                      },
                      {
                        name: "delivery_time",
                        type: "text",
                        label: "Delivery Time",
                        disabled: "{true}",
                        defaultValue: orderDetails.seller_detail.delivery_time,
                      },
                      {
                        name: "pickup_date",
                        type: "text",
                        label: "Pickup Date",
                        disabled: "{true}",
                        defaultValue: orderDetails.seller_detail.pickup_date,
                      },
                      {
                        name: "pickup_time",
                        type: "text",
                        label: "Pickup Time",
                        disabled: "{true}",
                        defaultValue: orderDetails.seller_detail.pickup_time,
                      },
                      {
                        name: "pickup_address",
                        type: "textarea",
                        label: "Pickup Address",
                        disabled: "{true}",
                        defaultValue: orderDetails.seller_detail.pickup_address,
                      },
                    ];

                    setOrderInfo(prevState => ({
                        ...prevState,
                        shippingDetails: newShippingDetails
                    }));
                }
            }
            // }).catch(error => {
            //     showToast(error.response.data.message, "error", "order-detail-error")
            // }
            );
    }, [slug, auth]);


    useEffect(() => {
        getData();
    }, [getData]);

    return (
        <>
            <div className="min-h-screen text-gray-900 bg-white pb-4">
                <main className="p-4 mx-auto sm:px-6 lg:px-8">
                    <div className="flex items-end">
                        <Button
                            onClick={() => navigate(-1)}
                            text="Back"
                            type="cancel"
                            py="2"
                            px="4"
                        />
                    </div>
                    <div className="flex items-center mt-4">
                        <Box sx={{ width: '100%' }}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Tabs value={value} onChange={handleTabChange} aria-label="basic tabs example">
                                    <Tab label="Order Details" {...a11yProps(0)} />
                                    <Tab label="Buyer Details" {...a11yProps(1)} />
                                    <Tab label="Seller Details" {...a11yProps(2)} />
                                    <Tab label="Product Details" {...a11yProps(3)} />
                                    <Tab label="Shipping Details" {...a11yProps(4)} />
                                    <Tab label="Refund Details" {...a11yProps(5)} />
                                </Tabs>
                            </Box>
                            {orderInfo.orderDetails &&
                                <CustomTabPanel value={value} index={0}>
                                    <div>
                                        <Form form={orderInfo.orderDetails} styles={GridStyle} needButtons={false} />
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                <div className="w-full border-t border-gray-300"></div>
                                            </div>
                                            <div className="relative flex justify-start">
                                                <span className="pr-3 bg-white text-sm font-medium text-gray-900">Order Status History</span>
                                            </div>
                                        </div>
                                        {orderInfo.statusHistory &&
                                            <div className="overflow-x-auto py-4">
                                                <table className="min-w-full my-2 text-left text-sm font-light border border-collapse border-gray-300">
                                                    <thead className="border-b font-medium dark:border-neutral-500 bg-gray-100">
                                                        <tr>
                                                            <th scope="col" className="py-2 border-r px-2">Order Status</th>
                                                            <th scope="col" className="py-2 border-r px-2">Datetime</th>
                                                            <th scope="col" className="py-2 border-r px-2">Remarks</th>
                                                            <th scope="col" className="py-2 border-r px-2">Signature Image</th>
                                                            <th scope="col" className="py-2 px-2">Parcel Image</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orderInfo.statusHistory.map((status, index) => (
                                                            <tr key={index} className="border-b font-normal">
                                                                <td className="py-2 border-r px-2">{status?.status_id__general_status}</td>
                                                                <td className="py-2 border-r px-2">{status?.created_date}</td>
                                                                <td className="py-2 border-r px-2">{status?.remarks}</td>
                                                                <td className="py-2 border-r px-2">
                                                                    {status?.signature_img &&
                                                                        < img src={status?.signature_img} alt={`sign ${index}`} className="max-h-32" />
                                                                    }
                                                                </td>
                                                                <td className="py-2 border-r px-2">
                                                                    {status.parcel_img &&
                                                                        <img src={status.parcel_img} alt={`parcel ${index}`} className="max-h-32" />
                                                                    }
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        }

                                        <div className="relative mt-4">
                                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                                <div className="w-full border-t border-gray-300"></div>
                                            </div>
                                            <div className="relative flex justify-start">
                                                <span className="pr-3 bg-white text-sm font-medium text-gray-900">Payment Status History</span>
                                            </div>
                                        </div>
                                        {orderInfo.paymentStatusHistory &&
                                            <div className="overflow-x-auto py-4">
                                                <table className="min-w-full my-2 text-left text-sm font-light border border-collapse border-gray-300">
                                                    <thead className="border-b font-medium dark:border-neutral-500 bg-gray-100">
                                                        <tr>
                                                            <th scope="col" className="py-2 border-r px-2">Payment Status</th>
                                                            <th scope="col" className="py-2 border-r px-2">Datetime</th>
                                                            <th scope="col" className="py-2 border-r px-2">Remarks</th>
                                                            <th scope="col" className="py-2 border-r px-2">Signature Image</th>
                                                            <th scope="col" className="py-2 px-2">Parcel Image</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orderInfo.paymentStatusHistory.map((status, index) => (
                                                            <tr key={index} className="border-b font-normal">
                                                                <td className="py-2 border-r px-2">{status?.status_id__general_status}</td>
                                                                <td className="py-2 border-r px-2">{status?.created_date}</td>
                                                                <td className="py-2 border-r px-2">{status?.remarks}</td>
                                                                <td className="py-2 border-r px-2">
                                                                    {status?.signature_img &&
                                                                        < img src={status?.signature_img} alt={`sign ${index}`} className="max-h-32" />
                                                                    }
                                                                </td>
                                                                <td className="py-2 border-r px-2">
                                                                    {status.parcel_img &&
                                                                        <img src={status.parcel_img} alt={`parcel ${index}`} className="max-h-32" />
                                                                    }
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        }
                                    </div>
                                </CustomTabPanel>
                            }
                            {orderInfo.buyerDetails &&
                                <CustomTabPanel value={value} index={1}>
                                    <Form form={orderInfo.buyerDetails} styles={GridStyle} needButtons={false} />
                                </CustomTabPanel>
                            }
                            {orderInfo.sellerDetails &&
                                <CustomTabPanel value={value} index={2}>
                                    <Form form={orderInfo.sellerDetails} styles={GridStyle} needButtons={false} />
                                </CustomTabPanel>
                            }
                            {orderInfo.productDetails &&
                                <CustomTabPanel value={value} index={3}>
                                    <div className="overflow-x-auto py-4">
                                        <table className="min-w-full my-2 text-left text-sm font-light border border-collapse border-gray-300">
                                            <thead className="border-b font-medium dark:border-neutral-500 bg-gray-100">
                                                <tr>
                                                    <th scope="col" className="py-2 border-r px-2">Product ID</th>
                                                    <th scope="col" className="py-2 border-r px-2">Original Price</th>
                                                    <th scope="col" className="py-2 border-r px-2">Unit Price</th>
                                                    <th scope="col" className="py-2 border-r px-2">Quantity</th>
                                                    <th scope="col" className="py-2 border-r px-2">Dimensions</th>
                                                    <th scope="col" className="py-2 border-r px-2">Product Name</th>
                                                    <th scope="col" className="py-2 border-r px-2">Product Weight</th>
                                                    <th scope="col" className="py-2 px-2">Product Image</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orderInfo.productDetails.map((product, index) => (
                                                    <tr key={index} className="border-b font-normal">
                                                        <td className="py-2 border-r px-2">{product?.id_product}</td>
                                                        <td className="py-2 border-r px-2">{product?.original_price}</td>
                                                        <td className="py-2 border-r px-2">{product?.unit_price}</td>
                                                        <td className="py-2 border-r px-2">{product?.quantity}</td>
                                                        <td className="py-2 border-r px-2">
                                                            L: {product.prod_dim?.length} <br />
                                                            W: {product.prod_dim?.width} <br />
                                                            B: {product.prod_dim?.height}
                                                        </td>
                                                        <td className="py-2 border-r px-2 underline">
                                                            <a href={CustomerRoutes.ProductDetails + product?.product_detail?.slug}>
                                                                {product?.product_detail?.name}
                                                            </a>
                                                        </td>
                                                        <td className="py-2 border-r px-2"> {product?.product_detail?.weight} </td>
                                                        <td className="py-2 border-r px-2">
                                                            {product?.thumbnail_img &&
                                                                <img src={product?.thumbnail_img} alt={product?.product_detail?.name} className="max-h-32" />
                                                            }
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CustomTabPanel>
                            }
                            {orderInfo.shippingDetails &&
                                <CustomTabPanel value={value} index={4}>
                                    <Form form={orderInfo.shippingDetails} styles={GridStyle} needButtons={false} />
                                </CustomTabPanel>
                            }
                            {orderInfo.refundDetails &&
                                <CustomTabPanel value={value} index={5}>
                                    <Form form={orderInfo.refundDetails} styles={FormStyle} needButtons={false} />
                                </CustomTabPanel>
                            }
                        </Box>
                    </div>
                </main>
            </div>
        </>
    );
}
export default OrderDetail;


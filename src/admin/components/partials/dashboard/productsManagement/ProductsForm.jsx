import { InputBoxStyle } from '../../../../styles/FormStyles';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState } from 'react';

export const SearchProductsForm = ({ onConfirm, onReset }) => {
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        if (startDate && endDate) {
            formData.append("filter_created_date", dateRange)
        }
        onConfirm(formData);
    };

    const handleReset = () => {
        setDateRange([null, null]);
        const emptyFormData = new FormData();
        document.getElementById("searchForm").reset();
        onConfirm(emptyFormData);
        onReset(true);
    };

    return (
        <form id="searchForm" className='pb-4' onSubmit={handleSubmit}>
            <h1 className="text-base font-semibold mb-2">Filters: </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <input type="text" name="product_name" id="product_name" placeholder='Product Name' className={InputBoxStyle} />
                <input type="text" name="seller_shop_name" id="seller_shop_name" placeholder='Shop Name' className={InputBoxStyle} />
                {/* <input type="text" name="product_id" id="product_id" placeholder='Product ID' className={InputBoxStyle} /> */}
                <input type="text" name="category_id" id="category_id" placeholder='Category Name' className={InputBoxStyle} />
                <select
                    name="product_rating"
                    id="product_rating"
                    className={InputBoxStyle}
                >
                    <option value="">All rating </option>
                    <option value="0-1">0 to 1 stars</option>
                    <option value="1-2">1 to 2 stars</option>
                    <option value="2-3">2 to 3 stars</option>
                    <option value="3-4">3 to 4 stars</option>
                    <option value="4-5">4 to 5 stars</option>
                </select>
                <DatePicker
                    id="date_range"
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    className={InputBoxStyle}
                    placeholderText="Created Date Range"
                    onChange={(update) => {
                        setDateRange(update);
                    }}
                    isClearable={true}
                    dateFormat="dd/MM/yyyy"
                />
                 <select
                    name="prohibited_list"
                    id="prohibited_list"
                    className={InputBoxStyle}
                >
                     <option hidden>List type</option>
                    <option value="prohibited_list">Prohibited List</option>                    
                </select>
            </div>
            <button type="submit" className="mb-2 text-white bg-yellow-500 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2">
                Search
            </button>
            <button className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                onClick={handleReset}
            >
                Reset
            </button>
        </form>
    );
};
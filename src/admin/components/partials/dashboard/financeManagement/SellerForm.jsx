import { FormStyle, InputBoxStyle } from '../../../../styles/FormStyles';
import DatePicker from "react-datepicker";
import { useState } from 'react';
import { TransactionStatusChoices } from '../../../../utils';

export const WithdrawForm = ({ onConfirm }) => {
    const handleSubmit = (event, action) => {
        event.preventDefault();
        const formData = new FormData(event.target.form);
        onConfirm(formData, action);
    };

    return (
        <form className={FormStyle.overall}>
            <button
                type="submit"
                className="mb-2 text-white bg-yellow-500 hover:bg-yellow-700 focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2"
                onClick={(event) => handleSubmit(event, "paid")} >
                Approve
            </button>
            <button
                type="submit"
                className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                onClick={(event) => handleSubmit(event, "reject")} >
                Reject
            </button>
        </form>
    );
};


export const WalletSearchForm = ({ onConfirm, onReset }) => {
    const [transactionDate, setTransactionDate] = useState(null);

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        if (transactionDate) formData.append("transaction_date", transactionDate);
        onConfirm(formData);
    };

    const handleReset = () => {
        setTransactionDate(null);
        const emptyFormData = new FormData();
        document.getElementById("searchForm").reset();
        onConfirm(emptyFormData);
        onReset(true);
    };

    return (
        <form id="searchForm" onSubmit={handleSubmit}>
            <h1 className="text-base font-semibold mb-2">Filters: </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                <input type="text" name="seller_name" id="seller_name" placeholder='Seller Name' className={InputBoxStyle} />
                <input type="email" name="seller_email" id="seller_email" placeholder='Seller Email' className={InputBoxStyle} />

                <select
                    name="transaction_status"
                    id="transaction_status"
                    className="mt-1 block w-full py-2 my-4 px-3 rounded-md border border-gray-300 shadow-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-300 capitalize"
                >
                    <option value="">All Transaction Status</option>
                    {TransactionStatusChoices.map((option, i) => (
                        <option key={i} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <DatePicker
                    name="transaction_date"
                    selected={transactionDate}
                    className={InputBoxStyle}
                    placeholderText="Transaction Date"
                    onChange={(date) => setTransactionDate(date)}
                    dateFormat="dd/MM/yyyy"
                />

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


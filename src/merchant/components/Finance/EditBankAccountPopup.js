

import { useEffect, useState } from "react";
import 'react-loading-skeleton/dist/skeleton.css'
import { ApiCalls, Apis } from '../../utils/ApiCalls.js';
import { Modal } from '../../../customer/components/GenericComponents.js';
import { CommonApis } from "../../../Utils.js";
import Select from "react-select";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const labelClass = 'text-sm font-semibold w-64 mt-2';

const customStyles = {
    menu: (provided, state) => ({
      ...provided,
      zIndex: 2000, // Set the z-index to ensure it appears above other elements
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 2000, // Also set z-index for the portal container
    }),
  };

export default function EditBankAccountPopup({
    closeBankAccountPopup,
    toggleBankAccountPopup,
    processEditBankAccount,
    user,
    bankDetails
}) {
    const [isBankAccountEditing, setIsBankAccountEditing] = useState(false)
    const [fullName, setFullName] = useState("")
    const [accNumber, setAccNumber] = useState("")
    const [bank, setBank] = useState("")
    const [nameErr, setNameErr] = useState("");
    const [accNumErr, setAccNumErr] = useState("");
    const [bankErr, setBankErr] = useState("");
    const [bankList, setBankList] = useState([]);
    const [isBankListLoading, setIsBankListLoading] = useState(true);

    useEffect(() => {
        ApiCalls({},
            CommonApis.settings,
            "POST",
            {},
            (res, api) => {
                let banks = res.data.data?.bank;
                banks = banks.map(e => {
                    return { ...e, value: e?.name, label: e?.name };
                })
                setBankList(banks);
                setIsBankListLoading(false);

                setFullName(bankDetails.full_name);
                setAccNumber(bankDetails.account_number);
                setBank({
                    value: bankDetails?.bank_id__bank_name, label: bankDetails?.bank_id__bank_name,
                    name: bankDetails?.bank_id__bank_name, id: bankDetails?.bank_id
                })
            }
        );
    }, [bankDetails])

    const onBankAccountEdited = (res, api) => {
        handleRefundAcceptClose();
        processEditBankAccount(res, api)
    }

    const updateRefundAccept = () => {
        let len = 0;
        if (!fullName) {
            len++;
            setNameErr("Full Name is mandatory")
        }
        if (!bank) {
            len++
            setBankErr("Bank name is mandatory")
        }
        if (!accNumber) {
            len++;
            setAccNumErr("Account number is mandatory")
        }

        if (len === 0) {
            setIsBankAccountEditing(true)

            let fd = new FormData();

            fd.append("bank_id", bank.id);
            fd.append("full_name", fullName);
            fd.append("account_number", accNumber);

            ApiCalls(fd,
                Apis.bankDetails,
                "POST",
                { "Authorization": "Bearer " + user.access, },
                onBankAccountEdited
            );
        }
    }

    const handleRefundAcceptClose = () => {
        setIsBankAccountEditing(false)
        closeBankAccountPopup()
    }

    const handleFieldChange = (e, type) => {
        switch (type) {
            case 'fullName':
                setFullName(e.target.value);
                setNameErr("");
                break;
            case 'accNumber':
                setAccNumber(e.target.value);
                setAccNumErr("");
                break;
            default: console.log("default case")
        }
    }

    return (
        <>
            <Modal
                width="w-5/12"
                open={toggleBankAccountPopup}
                children={isBankListLoading ?
                    <div className='h-20 my-5'>
                        <Skeleton height={25} width={150} className='mb-4' />
                        <Skeleton height={16} width={200} />
                    </div> :
                    <div>
                        <p className='text-lg font-semibold mb-3'>Edit Bank Account</p>
                        <hr />

                        <div className="flex gap-1 my-4 mb-2">
                            <p className={labelClass}>Account Holder's Full Name</p>
                            <div className="w-full">
                                <input
                                    id="fullName"
                                    type="text"
                                    placeholder="Full Name"
                                    value={fullName}
                                    onChange={(e) => handleFieldChange(e, "fullName")}
                                    className="appearance-none w-full px-3 py-2 border border-gray-300 rounded-md 
                                shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 sm:text-sm"
                                />
                                <p className="mt-1 text-[#EB5757] text-xs">{nameErr}</p>
                            </div>
                        </div>

                        <div className="flex gap-1 my-4 mb-2">
                            <p className={labelClass}>Bank Name</p>
                            <div className="w-full">

                                <Select id="bankList" name="bankList" options={bankList}
                                    placeholder="Bank Name" className="text-sm"
                                    value={bank}
                                    styles={customStyles}
                                    menuPortalTarget={document.body}
                                    onChange={e => {
                                        setBank(e);
                                        setBankErr("")
                                    }}
                                />
                                <p className="mt-1 text-[#EB5757] text-xs">{bankErr}</p>
                            </div>
                        </div>

                        <div className="flex gap-1 my-4 mb-8">
                            <p className={labelClass}>Account Number</p>
                            <div className="w-full">
                                <input
                                    id="accNumber"
                                    type="text"
                                    value={accNumber}
                                    placeholder="Account Number"
                                    onChange={(e) => handleFieldChange(e, "accNumber")}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 sm:text-sm"
                                />
                                <p className="mt-1 text-[#EB5757] text-xs">{accNumErr}</p>
                            </div>
                        </div>

                        <hr />
                        <div className='flex justify-end mt-4'>
                            <button
                                className='cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5 hover:bg-amber-500
                             disabled:opacity-50  disabled:cursor-default'
                                onClick={updateRefundAccept}
                                disabled={isBankAccountEditing}
                            >
                                Edit
                            </button>
                            <button className='cp text-center rounded-md border-[#f5ab35] border-2 disabled:border-[#FFD086]
                                 disabled:cursor-default bg-white text-[#f5ab35] h-8 w-20'
                                onClick={handleRefundAcceptClose}
                                disabled={isBankAccountEditing}
                            >
                                Close
                            </button>
                        </div>

                    </div>
                }
            />
        </>);
}
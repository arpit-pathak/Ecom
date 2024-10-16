import { useState } from "react";
import "react-loading-skeleton/dist/skeleton.css";
import { ApiCalls, Apis } from "../../utils/ApiCalls.js";
import { Modal } from "../../../customer/components/GenericComponents.js";
import { BiCloudUpload } from "react-icons/bi";
import { Link } from "react-router-dom";
import { BsQuestion } from "react-icons/bs";

const labelClass = "text-sm font-semibold w-64 mt-2";

export default function WithdrawalPopup({
  closeWithdrawalPopup,
  toggleWithdrawalPopup,
  processWithdrawal,
  user,
  balance,
  isVerified,
}) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmt, setWithdrawAmt] = useState();
  const [withdrawAmtErr, setWithdrawAmtErr] = useState("");
  const [file, setFile] = useState("");
  const [err, setErr] = useState("");
  const [showBankDocInfo, setShowBankDocInfo] = useState(false);

  const fileSelection = (e) => {
    if (e.target.files && e.target.files[0]) {
      var file = e.target.files[0];
      setFile(file);
      setErr("");
    }
  };

  const onWithdrawal = (res, api) => {
    handleWithdrawalClose();
    processWithdrawal(res, api, withdrawAmt);
  };

  const updateWithdrawal = () => {
    if(!isVerified && !file){
        setErr("Please attach valid bank document")
        return;
    }

    if (!withdrawAmt) {
      setWithdrawAmtErr("Amount is mandatory");
      return;
    }

    if (parseFloat(withdrawAmt) > parseFloat(balance)) {
      setWithdrawAmtErr("Withdraw amount cannot be greater than your balance.");
      return;
    }

    setIsWithdrawing(true);

    let fd = new FormData();

    fd.append("withdraw_amount", withdrawAmt);

    if(!isVerified) fd.append("bank_document", file)

    ApiCalls(
      fd,
      Apis.earnings,
      "POST",
      { Authorization: "Bearer " + user.access },
      onWithdrawal
    );
  };

  const handleWithdrawalClose = () => {
    setIsWithdrawing(false);
    closeWithdrawalPopup();
  };

  const handleFieldChange = (e) => {
    setWithdrawAmt(e.target.value);
    setWithdrawAmtErr("");
  };

  return (
    <>
      <Modal
        width="w-5/12"
        open={toggleWithdrawalPopup}
        children={
          <div>
            <p className="text-lg font-semibold mb-3">Withdraw</p>
            <hr />
            
            {!isVerified && (
              <>
                <div className="flex items-center gap-2 mb-2 mt-4">
                  <p className="text-sm font-semibold">Bank Document</p>
                  <div
                    className="h-4 w-4 rounded-2xl bg-[#DEDBD2] flex justify-center items-center relative cp"
                    onMouseLeave={() => setShowBankDocInfo(false)}
                    onMouseOver={() => setShowBankDocInfo(true)}
                  >
                    <BsQuestion size={25} color="#737373" />
                    {showBankDocInfo && (
                      <div className="absolute z-50 w-72 bg-gray-200 rounded-md p-2 top-8 left-0 text-gray-500 text-xs mb-3 z-10">
                        <p>
                          Please upload a supporting bank statement that matches
                          the registered Company Name on ACRA
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className=" flex flex-col h-40 items-center justify-center border border-amber-500
                     border-dashed relative	w-full"
                >
                  <BiCloudUpload size={55} />
                  <p className="cp z-2">
                    {file ? file.name : "Drag and drop here or "}
                    {!file && (
                      <Link to="" className="text-blue-600">
                        Browse
                      </Link>
                    )}
                  </p>
                  <input
                    type="file"
                    id="bankDocument"
                    name="bankDocument"
                    accept=".pdf"
                    onChange={fileSelection}
                    className="cp absolute bottom-8 opacity-0"
                  />
                </div>
                <p className="text-red-500 text-xs my-3">{err}</p>
              </>
            )}

            <div className="flex gap-1 mt-5 mb-8">
              <p className={labelClass}>Amount to withdraw</p>
              <div className="w-full">
                <input
                  id="bank"
                  type="text"
                  value={withdrawAmt}
                  onChange={handleFieldChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300 sm:text-sm"
                />
                <p className="mt-1 text-[#EB5757] text-xs">{withdrawAmtErr}</p>
              </div>
            </div>

            <hr />
            <div className="flex justify-end mt-4">
              <button
                className="cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5 hover:bg-amber-500
                             disabled:opacity-50  disabled:cursor-default text-sm"
                onClick={updateWithdrawal}
                disabled={isWithdrawing}
              >
                Withdraw
              </button>
              <button
                className="cp text-center rounded-md border-[#f5ab35] border-2 disabled:border-[#FFD086]
                                 disabled:cursor-default bg-white text-[#f5ab35] h-8 w-20 text-sm"
                onClick={handleWithdrawalClose}
                disabled={isWithdrawing}
              >
                Close
              </button>
            </div>
          </div>
        }
      />
    </>
  );
}

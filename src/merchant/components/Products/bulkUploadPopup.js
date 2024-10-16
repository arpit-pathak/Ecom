import { useState } from "react";
import { Modal } from "../../../customer/components/GenericComponents.js";
import { BiCloudUpload } from "react-icons/bi";
import { ApiCalls, Apis } from "../../utils/ApiCalls.js";
import ls from "local-storage";
import { Constants } from "../../utils/Constants.js";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import Loader from "../../../utils/loader.js";

export default function BulkUploadPopup({
  showPopup,
  closePopup,
  onSubmitBulkUpload,
  isSubmittingBulkUpload
}) {
  let user = ls(Constants.localStorage.user);
  if (user) user = JSON.parse(user);
  const [file, setFile] = useState("");
  const [err, setErr] = useState("");

  const imgSelection = (e) => {
    if (e.target.files && e.target.files[0]) {
      var file = e.target.files[0];
      setFile(file);
      setErr("")
    }
  };

  const downloadSampleExcel = async () => {
    var fd = new FormData();
    await ApiCalls(
      fd,
      Apis.downloadSampleExcel,
      "GET",
      {
        Authorization: "Bearer " + user.access,
      },
      (res, api) => {
        if (res.data.result === "SUCCESS") {
          var pom = document.createElement("a");
          pom.href = res.data.data.file_url;
          pom.click();
        } else {
          toast.error(res.data.message);
        }
      }
    );
  };

  const onSubmit = () => {
    if(file !== ""){
      setErr("")
      onSubmitBulkUpload(file)
    }else setErr("Please upload a file")
  }

  return (
    <>
      <Modal
        width="w-[500px] max-sm:w-3/4"
        open={showPopup}
        children={
          <div>
            <div className="flex justify-between">
              <p className="text-lg font-semibold mb-3">Product Bulk Upload</p>
              <FontAwesomeIcon
                className="cp"
                icon={faXmark}
                onClick={closePopup}
              />
            </div>
            <hr />
            <p
              className="text-orangeButton underline text-xs float-right cp mt-1 mb-4"
              onClick={downloadSampleExcel}
            >
              Download Sample
            </p>
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
                id="image"
                name="image"
                accept=".xlsx,.csv,.xls"
                onChange={imgSelection}
                className="cp absolute bottom-8 opacity-0"
              />
            </div>
            <p className="text-red-500 text-xs my-3">{err}</p>
            <hr />
            <div className="flex justify-end mt-5">
              <button
                className="cp text-center rounded-md bg-[#f5ab35] text-white px-4 h-8 w-24"
                onClick={onSubmit}
                disabled={isSubmittingBulkUpload}
              >                
                {isSubmittingBulkUpload ? <Loader height="20px" width="20px" /> : <p className="!pt-0">Submit</p>}
              </button>
            </div>
          </div>
        }
      />
    </>
  );
}

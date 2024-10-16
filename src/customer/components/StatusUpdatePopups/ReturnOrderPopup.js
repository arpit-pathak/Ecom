import { useState } from "react";
import Select from "react-select";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls.js";
import { Modal } from "../GenericComponents.js";
import addImageIcon from "../../../assets/seller/img_add.svg";
import { MdOutlineClose } from "react-icons/md";

export default function BuyerReturnOrderPopup({
  closeReturnOrderPopup,
  toggleReturnOrder,
  processReturnOrder,
  orderId,
  user,
}) {
  const [isReturnOrder, setIsReturnOrder] = useState(false);
  const [isReturnReasonsLoading, setIsReturnReasonsLoading] = useState(false);
  const [returnReasons, setReturnReasons] = useState(false);
  const [selectedReturnReason, setSelectedReturnReason] = useState(null);
  const [returnValidationMsg, setReturnValidationMsg] = useState("");
  const [returnComment, setReturnComment] = useState("");
  const [isReturnOrderLoading, setIsReturnOrderLoading] = useState(false);
  const [proofImages, setProofImages] = useState([]);
  const [isReturnSubReasonsLoading, setIsReturnSubReasonsLoading] =
    useState(false);
  const [returnSubReasons, setReturnSubReasons] = useState(false);
  const [selectedReturnSubReason, setSelectedReturnSubReason] = useState(null);

  const processReturnOrderReasons = (res, api) => {
    var returnReasons = res.data.data.map((e) => {
      return { ...e, value: e.reason, label: e.reason };
    });
    setIsReturnReasonsLoading(false);
    setReturnReasons(returnReasons);
  };

  const onReturnOrder = () => {
    setIsReturnOrder(true);
    setIsReturnReasonsLoading(true);

    let fd = new FormData();

    BuyerApiCalls(
      fd,
      Apis.fetchReturnOrderReasons,
      "GET",
      { Authorization: "Bearer " + user.access },
      processReturnOrderReasons
    );
  };

  const fetchReturnOrderSubReasons = (parent) => {

    let fd = new FormData();

    BuyerApiCalls(
      fd,
      Apis.fetchReturnOrderReasons + `?parent_id=${parent.id_cancellation}`,
      "GET",
      { Authorization: "Bearer " + user.access },
      processReturnOrderSubReasons
    );
  };

  const processReturnOrderSubReasons = (res, api) => {
    var returnSubReasons = res.data.data.map((e) => {
      return { ...e, value: e.reason, label: e.reason };
    });
    setReturnSubReasons(returnSubReasons);
  };

  const onOrderReturned = (res, api) => {
    handleReturnClose();
    processReturnOrder(res, api);
  };

  const updateReturn = () => {
    if (!selectedReturnReason) {
      setReturnValidationMsg("Reason is mandatory");
      return;
    }
    console.log(selectedReturnSubReason, !selectedReturnSubReason ? true : false)
    if (selectedReturnReason.has_child === "y" && !selectedReturnSubReason) {
      setReturnValidationMsg("Sub reason is mandatory");
      return;
    }
    if (proofImages.length === 0) {
      setReturnValidationMsg("Proof is mandatory");
      return;
    }
   
    setIsReturnOrderLoading(true);
    setReturnValidationMsg("");
    let fd = new FormData();

    let len = proofImages.length;
    fd.append("id_order", orderId);
    
    fd.append("remarks", returnComment);
    if (selectedReturnReason.has_child === "y") fd.append("reason_id", selectedReturnSubReason.id_cancellation);
    else fd.append("reason_id", selectedReturnReason.id_cancellation);

    for (let i = 0; i < len; i++) {
      fd.append("product_image[]", proofImages[i].file);
    }

    BuyerApiCalls(
      fd,
      Apis.orderReturnRequest,
      "POST",
      {
        Authorization: "Bearer " + user.access,
        "Content-Type": "multipart/form-data",
      },
      onOrderReturned
    );
  };

  const handleReturnClose = () => {
    setIsReturnOrder(false);
    setReturnComment("");
    setReturnValidationMsg("");
    setIsReturnOrderLoading(false);
    closeReturnOrderPopup();
  };

  const handleImageSelection = (e) => {
    if (e.target.files && e.target.files[0]) {
      var imgFile = URL.createObjectURL(e.target.files[0]);
      var currFile = {
        file: e.target.files[0],
        img: imgFile,
      };
      setProofImages([...proofImages, currFile]);
    }
  };

  const removeImage = (index) => {
    var images = proofImages;
    images.splice(index, 1);
    setProofImages([...images]);
  };

  return (
    <>
      <Modal
        width={isReturnOrder && "w-5/12 max-sm:w-3/4"}
        open={toggleReturnOrder}
        children={
          !isReturnOrder ? (
            <div>
              <p className="text-lg font-semibold mb-3">Return Order</p>
              <hr />
              <p className="text-sm my-4 pr-7 mb-4">
                Are you sure to return this order ?
              </p>
              <div className="flex justify-end mt-10">
                <button
                  className="cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5"
                  onClick={onReturnOrder}
                >
                  Yes
                </button>
                <button
                  className="cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35] h-8 w-20"
                  onClick={closeReturnOrderPopup}
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-lg font-semibold mb-3">Return Order</p>
              <hr />
              {isReturnReasonsLoading || isReturnSubReasonsLoading ? (
                <div className="h-20 my-5">
                  <Skeleton height={25} width={150} className="mb-4" />
                  <Skeleton height={16} width={200} />
                </div>
              ) : (
                <>
                  <p className="text-sm my-4 font-medium mb-2">
                    Select a reason for returning
                  </p>
                  <Select
                    id="returnReasons"
                    name="returnReasons"
                    options={returnReasons}
                    placeholder="Select a reason"
                    onChange={(e) => {
                      setSelectedReturnReason(e);
                      setReturnValidationMsg("");
                      if (e.has_child === "y") fetchReturnOrderSubReasons(e);
                    }}
                  />

                  {selectedReturnReason &&
                    selectedReturnReason.has_child === "y" && (
                      <Select
                        id="returnSubReasons"
                        name="returnSubReasons"
                        options={returnSubReasons}
                        className="mt-6"
                        placeholder="Select a sub reason"
                        onChange={(e) => {
                            setSelectedReturnSubReason(e)
                        }}
                      />
                    )}

                  <p className="text-sm mb-3 font-medium mt-6">Comments</p>
                  <textarea
                    rows="4"
                    value={returnComment}
                    id="orderComment"
                    className="w-full text-sm border border-[#bdbdbd] rounded p-2"
                    onChange={(e) => setReturnComment(e.target.value)}
                  />

                  <p className="text-sm mb-3 font-medium mt-6">Attach Proof</p>
                  <div className="flex gap-2 flex-wrap">
                    {proofImages.map((item, index) => {
                      return (
                        <div
                          key={index}
                          className="h-20 w-20 p-4 border relative"
                        >
                          <img
                            src={item.img}
                            alt=""
                            height="80px"
                            width="80px"
                          />
                          <div
                            className="absolute flex items-center justify-center h-4 w-4 
                                            bg-[#f5ab35] rounded-lg right-[-6px] top-[-7px]"
                            onClick={(e) => removeImage(index)}
                          >
                            <MdOutlineClose color="white" size="12px" />
                          </div>
                        </div>
                      );
                    })}

                    {proofImages.length < 5 ? (
                      <div className="h-20 w-20 relative border-2 border-dashed flex flex-col items-center justify-center cp">
                        <img
                          src={addImageIcon}
                          alt=""
                          height="15px"
                          width="15px"
                        />
                        <p className="text-[10px] text-[#f5ab35] mt-2">
                          Add Image
                        </p>
                        <input
                          type="file"
                          className="opacity-0 absolute w-12 left-4 cp"
                          onChange={handleImageSelection}
                        />
                      </div>
                    ) : null}
                  </div>

                  <p className="text-red-600 my-3 text-xs">
                    {returnValidationMsg}
                  </p>
                  <hr />
                  <div className="flex justify-end mt-4">
                    <button
                      className="cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5 hover:bg-amber-500
                             disabled:opacity-50  disabled:cursor-default"
                      onClick={updateReturn}
                      disabled={
                        isReturnReasonsLoading ||
                        isReturnOrderLoading ||
                        isReturnSubReasonsLoading
                      }
                    >
                      Return
                    </button>
                    <button
                      className="cp text-center rounded-md border-[#f5ab35] border-2  disabled:border-[#FFD086]
                                disabled:cursor-default bg-white text-[#f5ab35] h-8 w-20"
                      onClick={handleReturnClose}
                      disabled={
                        isReturnReasonsLoading ||
                        isReturnOrderLoading ||
                        isReturnSubReasonsLoading
                      }
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        }
      />
    </>
  );
}

import { useState } from "react";
import 'react-loading-skeleton/dist/skeleton.css'
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls.js";
import { Modal } from '../GenericComponents.js';
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import galleryIcon from "../../../assets/buyer/gallery.svg";
import addImageIcon from "../../../assets/seller/img_add.svg"
import {
    MdOutlineClose,
} from 'react-icons/md';
import {
    FaStar
} from 'react-icons/fa';
import Loader from "../../../utils/loader.js";
import { CustomerRoutes } from "../../../Routes.js";
import { fileSizeCheck } from "../../../merchant/utils/Helper.js";
import { Constants } from "../../utils/Constants.js";

export default function RateReviewPopup({
    closePopup,
    togglePopup,
    process,
    order,
    user,
    productIndex
}) {
    const [isUpdatingReview, setIsUpdatingReview] = useState(false)
    const [review, setReview] = useState("")
    const [reviewErr, setReviewErr] = useState("");
    const [proofImages, setProofImages] = useState([])
    const [proofVideos, setProofVideos] = useState([]);
    const [starRate, setStarRate] = useState(0);
    const [starRateErr, setStarRateErr] = useState("");
    const [title, setTitle] = useState("");
    const [titleErr, setTitleErr] = useState("");
    const [mediaErr, setMediaErr] = useState("");

    const onAddReview = (res, api) => {
        setIsUpdatingReview(false);

        if (res.data.result === "SUCCESS") {
          closePopup();
        }
        process(res, api);
    }

    const updateReceived = () => {
        let errLen = 0;
        if (!title) {
            errLen++;
            setTitleErr("Title is mandatory")
        }
        if (!review) {
            errLen++;
            setReviewErr("Review is mandatory")
        }
         if (starRate <= 0) {
            errLen++;
            setStarRateErr("Rating is mandatory")
        }
        if (errLen > 0) return;

        setIsUpdatingReview(true)

        let fd = new FormData();

        let len_images = proofImages.length;
        let video_len = proofVideos.length;

        fd.append("order_id", order?.id_order);
        fd.append("product_id", order?.product_item[productIndex]?.id_product);
        fd.append("rate ", starRate);
        fd.append("title ", title);
        fd.append("description", review);
        for (let i = 0; i < len_images; i++) {
            fd.append("rating_img[] ", proofImages[i].file);
        }

        for (let i = 0; i < video_len; i++) {
          fd.append("rating_video[] ", proofVideos[i].file);
        }

        BuyerApiCalls(
            fd,
            Apis.productRating,
            "POST",
            { "Authorization": "Bearer " + user.access, },
            onAddReview
        );
    }

    const handleImageSelection = (e) => {
      const mediaFile = e.target?.files[0];
      if (!mediaFile) return;

      const isImage = mediaFile.type.startsWith("image/");
      const isVideo = mediaFile.type.startsWith("video/");
      const maxFileSize = isImage
        ? Constants.MediaSizeLimit.img_max_size
        : Constants.MediaSizeLimit.vid_max_size;

      if (!maxFileSize) return;

      if (!fileSizeCheck(mediaFile, maxFileSize)) {
        setMediaErr(`${isImage ? "Image" : "Video"} max limit ${maxFileSize} MB`);
        return;
      } else {
        setMediaErr("");
      }

      const fileUrl = URL.createObjectURL(mediaFile);
      const currFile = {
        file: mediaFile,
        [isImage ? "img" : "vid"]: fileUrl,
      };

      if (isImage) {
        setProofImages([...proofImages, currFile]);
      } else if (isVideo) {
        setProofVideos([...proofVideos, currFile]);
      }
    };

    const removeImage = (index) => {
        var images = proofImages;
        images.splice(index, 1);
        setProofImages([...images])
    }

    const removeVideo = (index) => {
      var videos = proofVideos;
      videos.splice(index, 1);
      setProofVideos([...videos]);
    };

    const updateRating = (rating) => {
        setStarRate(rating)
        setStarRateErr("")
    }

    return (
        <>
            <Modal
                width="max-[500px]:w-full w-[500px]"
                open={togglePopup}
                children={<div>
                    <div className="flex justify-between mb-6 items-center w-full">
                        <p className='text-lg font-semibold'>Write review</p>
                        <span className="cp"
                            onClick={closePopup}>
                            <FontAwesomeIcon icon={faXmark} />
                        </span>
                    </div>
                    <div className="flex mb-1 gap-3">
                        <div className="h-16 w-16 rounded-md border flex items-center justify-center border-[#bdbdbd]">
                            <img src={order?.product_item[productIndex]?.thumbnail_img ?? galleryIcon} alt=""
                                height="56px" width="56px" />
                        </div>
                        <div>
                            <p className="text-sm">{order?.product_item[productIndex]?.product_detail?.name ?? "N/A"}</p>
                            <div className="flex gap-1 flex-row mt-1">
                                <FaStar style={{ color: starRate > 0 ? "#f5ab35" : "#e5e7eb" }}
                                    onClick={(_) => updateRating(1)}
                                    className="cp" />
                                <FaStar style={{ color: starRate > 1 ? "#f5ab35" : "#e5e7eb" }}
                                    onClick={(_) => updateRating(2)}
                                    className="cp" />
                                <FaStar style={{ color: starRate > 2 ? "#f5ab35" : "#e5e7eb" }}
                                    onClick={(_) => updateRating(3)}
                                    className="cp" />
                                <FaStar style={{ color: starRate > 3 ? "#f5ab35" : "#e5e7eb" }}
                                    onClick={(_) => updateRating(4)}
                                    className="cp" />
                                <FaStar style={{ color: starRate > 4 ? "#f5ab35" : "#e5e7eb" }}
                                    onClick={(_) => updateRating(5)}
                                    className="cp" />
                            </div>
                        </div>
                    </div>
                    <p className="mb-4 text-[#EB5757] text-xs">{starRateErr}</p>

                    <input type="text" name="review_title" id="orderComment"
                        value={title}
                        onChange={e => {
                            setTitle(e.target.value);
                            setTitleErr("");
                        }}
                        placeholder='Review Title'
                        className="mb-1 w-full px-3 py-3 text-xs border border-[#bdbdbd] rounded-md placeholder-gray-400 
                            placeholder-text-xs"
                    />
                    <p className="mb-5 text-[#EB5757] text-xs">{titleErr}</p>

                    <textarea rows="6" value={review} id="orderComment"
                        placeholder="Please write product review here"
                        className='w-full text-sm border border-[#bdbdbd] rounded p-2'
                        onChange={(e) => {
                            setReview(e.target.value);
                            setReviewErr("");
                        }} />
                    <p className="mb-3 text-[#EB5757] text-xs">{reviewErr}</p>

              <div className="flex gap-2 mb-5">
                {proofImages.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className="h-16 w-16 border relative rounded-md border-[#bdbdbd] flex justify-center items-center"
                    >
                      <img src={item.img} alt="" height="56px" width="56px" />
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

                {proofVideos.map((item, index) => {
                  return (
                    <div
                      key={index}
                      className="h-16 w-16 border relative rounded-md border-[#bdbdbd] flex justify-center items-center"
                    >
                      <video src={item.vid} alt="" height="56px" width="56px" />
                      <div
                        className="absolute flex items-center justify-center h-4 w-4 
                                            bg-[#f5ab35] rounded-lg right-[-6px] top-[-7px]"
                        onClick={(e) => removeVideo(index)}
                      >
                        <MdOutlineClose color="white" size="12px" />
                      </div>
                    </div>
                  );
                })}
                {proofImages.length + proofVideos.length < 5 ? (
                  <div className="flex flex-col">
                    <label
                      className="h-16 w-16 relative border border-[#bdbdbd] rounded flex flex-col
                              items-center justify-center cp"
                    >
                      <img
                        src={addImageIcon}
                        alt=""
                        height="15px"
                        width="15px"
                      />
                      <p className="text-[10px] text-[#f5ab35] mt-2">
                        Add Media
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          handleImageSelection(e);
                        }}
                      />
                    </label>
                    <p className="mb-1 text-[#EB5757] text-[10px]">
                      {mediaErr}
                    </p>
                  </div>
                ) : null}
              </div>

              <p className="text-xs text-[#282828] mb-12">
                By submitting review you give us consent to publish and process
                personal information in accordance with
                <span
                  className="text-xs text-[#f5ab35] cp"
                  onClick={() =>
                    window.open(
                      CustomerRoutes.FooterPages.replace(
                        ":slug",
                        "terms-conditions"
                      ),
                      "_blank"
                    )
                  }
                >
                  {" "}
                  Terms of Use
                </span>{" "}
                and
                <span
                  className="text-xs text-[#f5ab35] cp"
                  onClick={() =>
                    window.open(
                      CustomerRoutes.FooterPages.replace(
                        ":slug",
                        "privacy-policy"
                      ),
                      "_blank"
                    )
                  }
                >
                  {" "}
                  Privacy Policy
                </span>
              </p>
              <div className="flex justify-between mt-5 gap-4 mx-5">
                <button
                  className="cp max-[500px]:text-xs text-sm w-1/2 text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35] h-8"
                  onClick={closePopup}
                  disabled={isUpdatingReview}
                >
                  Cancel
                </button>

                <button
                  className="cp max-[500px]:text-xs text-sm w-1/2 text-center rounded-md bg-[#f5ab35] text-white h-8 px-3"
                  disabled={isUpdatingReview}
                  onClick={updateReceived}
                >
                  {isUpdatingReview ? <Loader /> : "Submit Review"}
                </button>
              </div>
            </div>
          }
        />
      </>
    );
}
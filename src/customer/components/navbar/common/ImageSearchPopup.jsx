import React, { useEffect, useRef, useState } from "react";
import { fileSizeCheck } from "../../../../merchant/utils/Helper";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CustomerRoutes } from "../../../../Routes";
import { setSearchedImageFile } from "../../../redux/reducers/categoryReducer";

// images and icons
import imageUpload from "../../../../assets/buyer/image-search-upload-icon.svg";
import errorImage from "../../../../assets/buyer/error-upload-img-search.svg";
import { BiUpArrow } from "react-icons/bi";

const ImageSearchPopup = ({ setImageSearchOpen, initialImageFile = null }) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState("idle"); // 'idle', 'failed', 'success'
  const [searchLimit, setSearchLimit] = useState(
    Number(localStorage.getItem("imageSearchLimit")) || 5
  );
  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle image upload through file input or paste event
  const handleImageUpload = (file) => {
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      setImageFile(file);
      setStatus("success");
      performSearch(file);
    } else {
      setStatus("failed");
    }
  };

  // Perform search after successful upload
  const performSearch = (file) => {
    if (searchLimit > 0) {
      setSearchLimit((prev) => prev - 1);
      localStorage.setItem("imageSearchLimit", searchLimit - 1);
      dispatch(setSearchedImageFile(file));
      navigate(CustomerRoutes.ProductListing + `keyword=image-search`);
      setImageSearchOpen((prev) => !prev);
    } else {
      toast.error("Search limit reached. Please try again later.", {
        position: "top-right",
      });
    }
  };

  // Event handler for file input change
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!fileSizeCheck(file, 10)) {
      toast.error("Image size cannot exceed 10 MB", {
        position: "top-right",
      });
      return;
    }
    handleImageUpload(file);
  };

  // Handle image paste event
  const handleImagePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (!fileSizeCheck(blob, 10)) {
          toast.error("Image size cannot exceed 10 MB", {
            position: "top-right",
          });
          return;
        }
        handleImageUpload(blob);
      }
    }
  };

  // Handle drag over event
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (!fileSizeCheck(file, 10)) {
      toast.error("Image size cannot exceed 10 MB", {
        position: "top-right",
      });
      return;
    }
    handleImageUpload(file);
  };

  // Open file input when the button is clicked
  const handleUploadClick = (e) => {
    e.preventDefault();
    fileInputRef.current.click();
  };

  // Retry uploading if it failed
  const handleRetryUpload = (e) => {
    e.preventDefault();
    setStatus("idle"); // Reset status to idle
    setUploadedImage(null); // Clear the uploaded image
    fileInputRef.current.value = null; // Reset file input
    handleUploadClick(e);
  };

  // Get button text based on current status
  const getButtonText = () => {
    if (status === "failed") return "Re-upload";
    return "Upload photo";
  };

  // Get button style based on current status
  const getButtonStyle = () => {
    if (status === "failed") return "text-black bg-[#F5AB35]";
    return "text-[#F5AB35] border border-[#F5AB35]";
  };

  useEffect(() => {
    // Set an interval to reset the imageSearchLimit every hour (3600000 ms = 1 hour)
    const resetLimitInterval = setInterval(() => {
      localStorage.setItem("imageSearchLimit", 5);
      setSearchLimit(5); // Reset state to 5
    }, 3600000); // todo: change to 3600000 after staging test

    // Cleanup
    return () => clearInterval(resetLimitInterval);
  }, []);

  useEffect(() => {
    // If initialImageFile is provided, directly upload it
    if (initialImageFile) {
      handleImageUpload(initialImageFile);
    }
  }, [initialImageFile]);

  // Render content based on current status
  const renderContent = () => {
    if (status === "idle" && !uploadedImage) {
      return (
        <>
          <img
            src={imageUpload}
            alt="upload"
            className="w-[29%] h-[39%] pointer-events-none"
          />
          <p className="text-[#999999] text-sm">
            Copy your image here
          </p>
        </>
      );
    }
    if (status === "failed") {
      return (
        <>
          <img
            src={errorImage}
            alt="upload failed"
            className="w-[29%] h-[39%] pointer-events-none"
          />
          <p className="text-red-500 text-sm">Upload failed</p>
          <p className="text-[#999999] text-sm">
            Copy your image here or drag and drop
          </p>
        </>
      );
    }
  };

  return (
    <div
      className="absolute flex flex-col top-16 right-[-10px] w-[80%] md:w-[55%] lg:max-w-[45%] lg:min-w-[255px] 2xl:w-[35%] h-fit bg-white rounded border border-[#E7E7E7] z-30 px-4 pt-4 pb-5 gap-3"
      onPaste={handleImagePaste}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="relative">
        <BiUpArrow className="absolute top-[-32px] right-2 text-[#E7E7E7] text-xl" />
      </div>

      <div
        className={`w-full h-fit flex flex-col items-center border border-dotted border-[#E5E5E5] gap-1 ${
          !uploadedImage ? "py-8" : ""
        }`}
      >
        {renderContent()}
      </div>

      {status !== "success" && (
        <button
          className={`${getButtonStyle()} py-2 rounded`}
          onClick={status === "failed" ? handleRetryUpload : handleUploadClick}
        >
          {getButtonText()}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePhotoUpload}
      />
    </div>
  );
};

export default ImageSearchPopup;

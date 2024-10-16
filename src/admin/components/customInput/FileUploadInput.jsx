import { useState } from "react";
import Button from "../generic/Buttons";
import { showToast, ToastContainerWrapper } from "../generic/Alerts";

const FileUploadInput = ({
  name,
  style,
  current_image,
  onFileChange,
  title,
}) => {
  const [selectedImage, setSelectedImage] = useState();

  // This function will be triggered when the file field change
  const imageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
        let file = e.target.files[0];
      if (title === "Upload Image for Mobile") {
        const BANNER_HEIGHT = 456,
          BANNER_WIDTH = 1000;
        var imgFile = URL.createObjectURL(file);
        const img = new Image();
        img.src = imgFile;
        img.onload = () => {
          if (img.height < BANNER_HEIGHT && img.width < BANNER_WIDTH) {
            showToast("File size should be atleast 1000px x 456px", "error");
          } else handleFile(file)
        };
      } else handleFile(file)
    }
  };

  const handleFile = (file) => {
    setSelectedImage(file);
    const event = {
      target: {
        name: name,
        value: file,
      },
    };
    onFileChange(event);
  }

  // This function will be triggered when the "Remove This Image" button is clicked
  const removeSelectedImage = () => {
    setSelectedImage(null);
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = null;
    }
  };

  return (
    <>
      <label
        htmlFor={name}
        className="my-2 block text-sm font-medium text-gray-700"
      >
        {title ?? "Upload Image"}
      </label>
      <input
        type="file"
        name={name}
        accept="image/*"
        className={style}
        onChange={imageChange}
      />

      {selectedImage && (
        <>
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Test"
            className="mb-2 mt-2"
          />
          <Button
            onClick={removeSelectedImage}
            text="Remove This Image"
            type="delete"
            py="2"
          />
        </>
      )}

      {current_image.img_url && (
        <>
          <label
            htmlFor={current_image}
            className="my-2 block text-sm font-medium text-gray-700"
          >
            Current Image
          </label>
          <img
            name="current_image"
            src={current_image.img_url}
            alt="Preview"
            onError={(e) => {
              e.target.style.display = "none"; // Hide the image if it fails to load
            }}
            onLoad={(e) => {
              e.target.style.display = "block"; // Show the image if it loads successfully
            }}
          />
        </>
      )}
      <ToastContainerWrapper />
    </>
  );
};

export default FileUploadInput;

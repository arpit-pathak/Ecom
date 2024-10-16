import React, { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";

//images and icons
import ls from "local-storage";
import camera from "../../../../assets/camera-nav.svg";
import search from "../../../../assets/search-nav.svg";

import {
  setMainCategoryID,
  setSubCategoryName,
} from "../../../redux/reducers/categoryReducer";
import { CustomerRoutes } from "../../../../Routes";
import ImageSearchPopup from "./ImageSearchPopup";

const SearchBar = ({
  setPrevSearch,
  prevSearch,
  searchValue,
  setSearchValue,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isImageSearchOpen, setImageSearchOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const user = JSON.parse(localStorage.getItem("customer"));

  // Postal code state
  const [postalValue, setPostalValue] = useState("");

  // Screen size detection using media query (1024px is the breakpoint for mobile and web views)
  const isLargeScreen = useMediaQuery("(min-width: 1025px)");
  // Reference to the file input
  const fileInputRef = useRef(null);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    sessionStorage.setItem("searchValue", searchValue);

    if (searchValue.trim() !== "") {
      let prevValues = [...prevSearch];

      if (!prevValues.includes(searchValue)) {
        setPrevSearch((prevState) => [...prevState, searchValue]);
      }
    }

    // Setting past 5 search values for recommended product list
    let prevSearchValues = ls("past5Search");
    let currentValues = [];

    if (prevSearchValues) {
      prevSearchValues = JSON.parse(prevSearchValues);
      if (!prevSearchValues.includes(searchValue)) {
        if (prevSearchValues.length >= 5) prevSearchValues.splice(0, 1);
        currentValues = [...prevSearchValues, searchValue];
      }
    } else {
      currentValues = [searchValue];
    }

    ls("past5Search", JSON.stringify(currentValues));

    // Dispatch actions and navigate to product listing
    dispatch(setMainCategoryID(""));
    dispatch(setSubCategoryName(""));
    navigate(
      CustomerRoutes.ProductListing +
        `keyword=${searchValue}&postal_code=${postalValue}`
    );
  };

  // Handle input change
  const handleChange = (event) => {
    setSearchValue(event.target.value);
  };

  // Handle "Enter" keypress for form submission
  const handleKeyDown = (event) => {
    if (event.key === "Enter") handleSubmit(event);
  };

  const handleImageSearchClick = () => {
    if (user) {
      if (!isLargeScreen) {
        // For mobile screens, open the file input directly
        fileInputRef.current.click();
      } else {
        setImageSearchOpen((prev) => !prev);
      }
    } else navigate(CustomerRoutes.Login);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setImageSearchOpen(true);
  };

  return (
    <form
      className="flex items-center w-full md:w-auto mb-2"
      onSubmit={handleSubmit}
    >
      <div
        className={`w-full ${
          isLargeScreen
            ? "xl:w-[600px] 2xl:w-[819px] xl:h-[46px]"
            : "w-[100%] h-[42px] lg:h-[46px]"
        } flex rounded-sm items-center border border-[#66666670] relative`}
      >
        <input
          type="text"
          placeholder={
            isLargeScreen
              ? "Hi, what would you like to have today?"
              : "Search Ushop"
          }
          className="w-full text-[#666666] p-2"
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <div
          className="pr-4 flex items-center cp"
          onClick={handleImageSearchClick}
        >
          <img src={camera} height={"27px"} width={"24px"} alt="camera-icon" />
        </div>
        {isImageSearchOpen && (
          <ImageSearchPopup
            setImageSearchOpen={setImageSearchOpen}
            initialImageFile={imageFile}
          />
        )}

        {/* in case of mobile screen no need to show upload popup */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <button
        type="submit"
        className={`cp flex items-center justify-center ${
          isLargeScreen ? "w-[64px]" : ""
        }`}
      >
        <img
          src={search}
          alt="search"
          className={isLargeScreen ? "lg:h-14" : "h-12"}
        />
      </button>
    </form>
  );
};

export default SearchBar;

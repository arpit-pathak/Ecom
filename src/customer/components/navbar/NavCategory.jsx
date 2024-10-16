import React, { useEffect, useState } from "react";

// Images
import allCategories from "../../../assets/buyer/list-check 1.svg";
import foodLogo from "../../../assets/buyer/food-beverage.svg";
import beauty from "../../../assets/buyer/beauty.svg";
import home from "../../../assets/buyer/home-accessory.svg";
import health from "../../../assets/buyer/health.svg";
import pets from "../../../assets/buyer/pet.svg";
import kids from "../../../assets/buyer/kids.svg";
import stationary from "../../../assets/buyer/stationary.svg";
import fashion from "../../../assets/buyer/fashion.svg";
import NavCategoriesDropdown from "./NavCategoriesDropdown";
import { Link, useNavigate } from "react-router-dom";
import { CustomerRoutes } from "../../../Routes";
import { Apis, BuyerApiCalls } from "../../utils/ApiCalls";
import NavSubCategoriesDropdown from "./NavSubCategoriesDropdown";
import { useDispatch } from "react-redux";
import {
  setCategories,
  setCategoryGroups,
  setMainCategory,
  setMainCategoryID,
  setSubCategoryName,
} from "../../redux/reducers/categoryReducer";
import { useMediaQuery } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const categoryList = [
  { categoryName: "Food & Beverage", logo: foodLogo, slug: "food-beverage" },
  { categoryName: "Beauty", logo: beauty, slug: "beauty" },
  { categoryName: "Home-Living", logo: home, slug: "home-living" },
  { categoryName: "Health", logo: health, slug: "health" },
  { categoryName: "Pets", logo: pets, slug: "pets" },
  { categoryName: "Toys-Kids-Babies", logo: kids, slug: "toys-kids-babies" },
  { categoryName: "Stationery", logo: stationary, slug: "stationery" },
  {
    categoryName: "Fashion-Accessories",
    logo: fashion,
    slug: "fashion-accessories",
  },
];

const CategoryItem = ({ logo, categoryName, slug, CategoryId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        dispatch(setMainCategoryID(CategoryId));
        dispatch(setMainCategory(categoryName));
        dispatch(setSubCategoryName(categoryName));
        navigate(CustomerRoutes.CategoryProductListing + slug + "/");
      }}
      className="flex flex-col lg:flex-row text-black items-center justify-center gap-[1px] md:gap-1 lg:gap-[1px] 2xl:gap-2 cp hover:bg-[#F7F7F7] p-1 md:p-2 lg:p-1"
    >
      <img
        src={logo}
        alt={categoryName}
        className="w-[32px] h-[32px] md:w-[64px] lg:w-auto"
      />
      <p className="text-[12px] md:text-[22px] lg:text-[12px] xl:text-[15px] font-medium text-wrap text-center">
        {categoryName}
      </p>
    </div>
  );
};

const NavCategory = ({ SetIsCategoryDropdownOpen, isCategoryDropdownOpen }) => {
  const [showAllCategoriesDropdown, setShowAllCategoriesDropdown] =
    useState(false);
  const [showSubCategories, SetShowSubCategories] = useState(false);
  // const [categoryGroups, setCategoryGroups] = useState([]);
  // const [categories, setCategories] = useState([]);
  // const categoryGroups = useSelector((state) => state.category.categoryGroups);
  // const categories = useSelector((state) => state.category.categories);
  const [selectedCategoryData, setSelectedCategoryData] = useState([]);
  const user = JSON.parse(localStorage.getItem("customer"));
  const isLargeScreen = useMediaQuery("(min-width: 1150px)");

  const dispatch = useDispatch();

  useEffect(() => {
    BuyerApiCalls(
      {},
      Apis.NavbarCategoryList,
      "GET",
      user
        ? {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.access}`,
          }
        : {},
      (res) => {
        dispatch(setCategoryGroups(res.data?.data?.category_group));
      }
    );

    BuyerApiCalls(
      {},
      Apis.footerCategoryList + "?list_length=100",
      "GET",
      user
        ? {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.access}`,
          }
        : {},
      (res) => {
        dispatch(setCategories(res.data?.data?.categories));
      }
    );
  }, []);

  return (
    <div className="flex justify-center items-center gap-1 xl:gap-10 p-2 md:p-0 lg:p-2">
      <div
        className={`flex flex-col relative hover:bg-[#F7F7F7] ${showAllCategoriesDropdown ? "bg-[#F7F7F7]" : ""} py-1 px-[3px]`}
      >
        {isLargeScreen && (
          <div
            className="flex gap-1 items-center justify-center rounded cp z-50 py-1 px-[22px]"
            onClick={() => {
              setShowAllCategoriesDropdown((prev) => !prev);
            }}
          >
            <img src={allCategories} alt="All-categories" />
            <p className="text-[12px] 2xl:text-[15px] font-semibold">
              All Categories
            </p>
          </div>
        )}

        {showAllCategoriesDropdown && (
          <NavCategoriesDropdown
            SetShowSubCategories={SetShowSubCategories}
            setSelectedCategoryData={setSelectedCategoryData}
          />
        )}

        {showAllCategoriesDropdown && showSubCategories && (
          <NavSubCategoriesDropdown
            categories={selectedCategoryData}
            setShowAllCategoriesDropdown={setShowAllCategoriesDropdown}
          />
        )}
      </div>

      {isLargeScreen ? (
        <div className="flex items-center justify-center max-[500px]:pr-4 gap-3 md:gap-8 md:mt-1 lg:gap-3 xl:gap-6">
          {categoryList.map((cat) => (
            <CategoryItem
              key={cat.categoryName}
              logo={cat.logo}
              categoryName={cat.categoryName}
              slug={cat.slug}
              CategoryId={cat.id_category}
            />
          ))}
        </div>
      ) : (
        <div className="hide-scrollbar w-full flex flex-row overflow-y-auto gap-9 scroll-smooth">
          {categoryList.map((cat) => (
            <div key={cat.id_category}>
              <CategoryItem
                key={cat.categoryName}
                logo={cat.logo}
                categoryName={cat.categoryName}
                slug={cat.slug}
                CategoryId={cat.id_category}
              />
            </div>
          ))}
        </div>
      )}

      {showAllCategoriesDropdown && (
        <div
          className="fixed inset-0 top-[232px] bg-black bg-opacity-30 z-40"
          onClick={() => setShowAllCategoriesDropdown((prev) => !prev)}
        ></div>
      )}
    </div>
  );
};

export default NavCategory;

import React from "react";
import { useDispatch } from "react-redux";
import {
  setMainCategory,
  setMainCategoryID,
  setSubCategoryName,
} from "../../redux/reducers/categoryReducer";
import { useNavigate } from "react-router-dom";
import { CustomerRoutes } from "../../../Routes";

const NavSubCategoriesDropdown = ({
  categories,
  setShowAllCategoriesDropdown,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Sort categories based on the length of the child array in descending order
  const sortedCategories = [...categories].sort(
    (a, b) => b.child.length - a.child.length
  );

  // Calculate the number of columns dynamically
  const numberOfColumns = Math.min(5, sortedCategories.length);
  const gridTemplateColumns = `repeat(${numberOfColumns}, minmax(0, 1fr))`;

  return (
    <div
      className="absolute z-50 top-[38px] 2xl:top-[43px] left-[174px] bg-[#FCFCFC] p-6 shadow-lg border border-gray-200"
      style={{
        width: `calc(${numberOfColumns} * 190px)`,
        maxWidth: "920px",
        minWidth: "250px",
      }}
    >
      <div className="grid gap-4" style={{ gridTemplateColumns }}>
        {sortedCategories.map((category) => (
          <div key={category.id_category} className="mb-4 cp">
            <p
              className="text-sm leading-[18px] font-thin mb-2 text-[#999999] hover:text-[#F5AB35] hover:bg-[#F7F7F7]"
              onClick={() => {
                dispatch(setMainCategoryID(category?.id_category));
                dispatch(setMainCategory(category?.name));
                dispatch(setSubCategoryName(category?.name));
                navigate(
                  CustomerRoutes.CategoryProductListing + category?.slug + "/"
                );
                setShowAllCategoriesDropdown((prev) => !prev);
              }}
            >
              {category.name}
            </p>
            <ul className="space-y-2 text-[#333333]">
              {category.child.map((item, itemIndex) => (
                <li
                  key={`sub-cat-${itemIndex}`}
                  className="text-xs leading-4 p-[1px] hover:text-[#F5AB35] hover:bg-[#F7F7F7]"
                  onClick={() => {
                    dispatch(setMainCategoryID(item?.id_category));
                    dispatch(setMainCategory(item?.name));
                    dispatch(setSubCategoryName(item?.name));
                    navigate(
                      CustomerRoutes.CategoryProductListing + item.slug + "/"
                    );
                    setShowAllCategoriesDropdown((prev) => !prev);
                  }}
                >
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavSubCategoriesDropdown;

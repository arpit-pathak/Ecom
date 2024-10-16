import { PiForkKnifeLight, PiDressLight, PiCar } from "react-icons/pi";
import { TbSofa } from "react-icons/tb";
import { CgGames } from "react-icons/cg";
import { MdOutlinePhonelink } from "react-icons/md";
import { BiBook } from "react-icons/bi";
import { useState } from "react";
import { useSelector } from "react-redux";

const allCategoriesList = [
  {
    name: "Food & Beverage",
    imageIcon: <PiForkKnifeLight />,
  },
  {
    name: "Home & Care",
    imageIcon: <TbSofa />,
  },
  {
    name: "Style",
    imageIcon: <PiDressLight />,
  },
  {
    name: "To Relax",
    imageIcon: <CgGames />,
  },
  {
    name: "Electronics",
    imageIcon: <MdOutlinePhonelink />,
  },
  {
    name: "Bookstore",
    imageIcon: <BiBook />,
  },
  {
    name: "Automobiles",
    imageIcon: <PiCar />,
  },
];

const NavCategoriesDropdown = ({
  SetShowSubCategories,
  setSelectedCategoryData,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("");
   const categoryGroups = useSelector((state) => state.category.categoryGroups);
   const categories = useSelector((state) => state.category.categories);

  const handleGroupClick = (selectedCat) => {
    if (selectedCategory === selectedCat) {
      // If the same category is clicked, toggle the dropdown visibility
      SetShowSubCategories((prev) => !prev);
    } else {
      // If a different category is clicked, update the content and ensure the dropdown is visible
      SetShowSubCategories(true);
      setSelectedCategory(selectedCat);

      const selectedCategoryObjectGroup = categoryGroups.find(
        (category) => category.category_group === selectedCat
      );

      const matchedCategories = selectedCategoryObjectGroup.category
        .map((cat) => categories.filter((c) => c.slug === cat.slug))
        .flat();

      if (matchedCategories) {
        setSelectedCategoryData(matchedCategories);
      } else {
        setSelectedCategoryData([]);
      }
    }
  };

  return (
    <div className="z-50 absolute top-[38px] 2xl:top-[43px] bg-[#FCFCFC] flex shadow-lg border border-gray-200">
      <div className="w-[170px] h-[296px] flex flex-col justify-center gap-2 pt-2 pb-2">
        {allCategoriesList.map((item) => (
          <div
            className={`flex cp gap-2 p-2 items-center h-[40px] ${
              selectedCategory === item.name
                ? "text-[#F5AB35] bg-[#F7F7F7]"
                : "hover:text-[#F5AB35] hover:bg-[#F7F7F7]"
            }`}
            onClick={() => handleGroupClick(item.name)}
          >
            <div className="!w-5 ">{item.imageIcon}</div>
            <p className="text-sm whitespace-nowrap">{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NavCategoriesDropdown;

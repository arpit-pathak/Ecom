import "../../css/customer.css";
import { Link } from "react-router-dom";
import { CustomerRoutes } from "../../Routes";
import { useDispatch } from "react-redux";
import {
  setMainCategory,
  setMainCategoryID,
  setSubCategoryName,
} from "../redux/reducers/categoryReducer";

export default function FooterCategories({ categories }) {
  const dispatch = useDispatch();

  return (
    <div className="my-4 capitalize  overflow-x-auto">
      <h2 className="md:text-[14px] py-2 font-bold leading-6 ">Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4 min-w-full">
        {categories.length > 0 &&
          categories.map((category, indx) => (
            <div
              className="flex flex-col w-1/5 gap-2 min-w-[150px] "
              key={`footer1${indx}`}
            >
              <Link
                to={CustomerRoutes.CategoryProductListing + category?.slug + "/"}
                onClick={() => {
                  dispatch(setMainCategoryID(category?.id_category));
                  dispatch(setMainCategory(category?.name));
                  dispatch(setSubCategoryName(category?.name));
                }}
                className="text-[12px] font-semibold text-black hover:text-orangeButton"
              >
                {category?.name}
              </Link>

              <div className="flex gap-1 flex-wrap text-[12px] ">
                {category?.child &&
                  category?.child.map((childCategories, index) => {
                    return (
                      <div key={`footer3${index}`}>
                        <Link
                          to={
                            CustomerRoutes.CategoryProductListing +
                            childCategories.slug + "/"
                          }
                          onClick={() => {
                            dispatch(
                              setMainCategoryID(childCategories?.id_category)
                            );
                            dispatch(setMainCategory(childCategories?.name));
                            dispatch(setSubCategoryName(childCategories?.name));
                          }}
                          className="text-black hover:text-orangeButton"
                        >
                          {childCategories?.name}
                        </Link>
                        {index !== category.child.length - 1 && (
                          <div className="border-[0.5px] border-slate-400 "></div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

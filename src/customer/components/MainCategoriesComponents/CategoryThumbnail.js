import React, { useEffect } from "react";
import { CustomerRoutes } from "../../../Routes";
import { useDispatch } from "react-redux";
import {
  setMainCategory,
  setSubCategoryName,
  setMainCategoryID,
} from "../../redux/reducers/categoryReducer";
import { Link } from "react-router-dom";
import { MdOutlineBrokenImage } from "react-icons/md";
import ls from "local-storage";

export default function CategoryThumbnail(props) {
  const dispatch = useDispatch();
  const showBrokenImage = (e) => {
    var targetParent = e.target.parentElement;
    targetParent.lastChild.classList.remove("hidden");
    var target = e.target;
    target.style.display = "none";
  };

  useEffect(()=>{
    ls("cat_detail", null)
  },[])

  const displayCategories = (props) => {
    return (
      <div className="flex flex-col items-center relative text-center gap-2 md:h-[240px]">
        {/* most right category border not displaying -> mr-2  */}
        <div className="flex items-center justify-center md:w-full md:h-[142px] border border-slate-200 hover:border-slate-300 hover:drop-shadow-md">
          {props.image_url ? (
            <div className="flex flex-col justify-center items-center">
            <img
              src={props.image_url}
              loading="lazy"
              className="w-[100px] h-[100px] sm:w-[140px] sm:h-[140px]"
              alt=""
              onError={(e) => showBrokenImage(e)}
            ></img>
              {/* {props.name ? (
            <p className="block sm:hidden font-medium text-black break-words m-0 text-center mx-auto  text-[12px] md:text-[14px]">
              {props.name}
            </p>
          ) : (
            <div className="w-full h-6 skeleton-bg"></div>
          )} */}
            </div>
          ) : (
            <div className="w-full h-full skeleton-bg-borderless"></div>
          )}

          <MdOutlineBrokenImage className="hidden w-full h-full text-slate-300 " />
        </div>

        <div className="sm:block text-center items-center flex-wrap w-[100px] h-fit mb-7">
          {props.name ? (
            <p className="font-semibold text-black break-words m-0 text-center mx-auto  text-[12px] md:text-[16px]">
              {props.name}
            </p>
          ) : (
            <div className="w-full h-6 skeleton-bg"></div>
          )}
        </div>
      </div>
    );
  };

  if (props) {
    return (
      <Link
        to={CustomerRoutes.CategoryProductListing + props.slug +"/"}
        onClick={() => {
          ls("cat_detail", props);
          // dispatch(setMainCategoryID(props.id_category));
          // dispatch(setMainCategory(props.name));
          // dispatch(setSubCategoryName(props.name));
        }}
      >
        {displayCategories(props)}
      </Link>
    );
  } else {
    return <div></div>;
  }
}

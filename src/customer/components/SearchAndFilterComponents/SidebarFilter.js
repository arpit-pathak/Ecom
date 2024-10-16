import React, { useState, useEffect, useContext, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { CustomerRoutes } from "../../../Routes";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import ls from "local-storage";

import { useSelector, useDispatch } from "react-redux";
import {
  setMainCategoryID,
  setSubCategoryName,
} from "../../redux/reducers/categoryReducer";

import { productContext } from "../../pages/ProductListing";
import { CheckBox } from "../GenericComponents";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const ratingOptions = [
  {
    label: "5 star only",
    value: "5",
  },
  {
    label: "4 star and more",
    value: "4",
  },
  {
    label: "3 star and more",
    value: "3",
  },
  {
    label: "2 star and more",
    value: "2",
  },
  {
    label: "1 star and more",
    value: "1",
  },
];

export default function SideBarfilter({filterData}) {
  const categoryID = useSelector((state) => state.category.mainCategoryID);
  const dispatch = useDispatch();
  const { addToFilterData } = useContext(productContext);
  const [secondLayerActiveID, setsecondLayerActiveID] = useState(null);
  const [thirdLayerActiveIndex, setThirdLayerActiveID] = useState(null);
  const [secondLayerData, setsecondLayerData] = useState([]);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState("");
  //append the parent id and the childs
  const [childList, setChildList] = useState([]);
  const [parentList, setParentList] = useState([]);
  const [brandList, setBrandList] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [viewMoreCategoryPage, setCategoryPage] = useState(1);
  const [selectedRating, setSelectedRating] = useState(0);
  const [viewMoreCategory, setViewMoreCategory] = useState(true);
  const [totalCategoryPages, setTotalCategoryPages] = useState(1);
  const [currentCategoryId, setCategoryId] = useState(1);
  const [isMobile, setIsMobile] = useState(null);

  const initialCategoryList = useRef([]);
  const params = useParams();

  useEffect(() => {
    let isMob = ls("isMobile")
    setIsMobile(isMob)

    if (params["slug"] === "search") {
      initialCategoryList.current = [];
      dispatch(setSubCategoryName(""));
      setCategoryPage(1);
      setsecondLayerActiveID(null);
      setThirdLayerActiveID(null);
    }

    if (!secondLayerActiveID && !isMob)  getCategoryOptions(2, false);

    getShippingOptions();
    getBrandList();
    //either set to layer 1 or first item of layer 2
    if (sessionStorage.getItem("fromUrl")) {
      setsecondLayerActiveID(sessionStorage.getItem("fromUrl").toString());
      sessionStorage.removeItem("fromUrl");
    }

    return () => {
      // on returning from prod detail page, this is removing the set category id; so commented
      // dispatch(setMainCategoryID(""));
    };
  }, [params]);

  useEffect(() => {
    if(isMobile){

    //set category
    if (filterData?.secondLayerData?.length > 0) {
      let secondLData = filterData?.secondLayerData;

      setsecondLayerData(secondLData);
      setsecondLayerActiveID(filterData?.secondLayerId);
      setThirdLayerActiveID(filterData?.thirdLayerId);
      setParentList(filterData?.parentList);
      if (filterData?.secondLayerId) {
        setIsOpen(true);
        let categoryId = new FormData();
        // categoryId.append("parent_cat", filterData?.secondLayerId);

        let endpoint =  Apis.filteredCategoryList + "?parent_cat=" + filterData?.secondLayerId
        BuyerApiCalls(
          categoryId,
          endpoint,
          "GET",
          {},
          processResponse,
          3,
          filterData?.secondLayerId
        );
      }
    } else getCategoryOptions(2, true);

    //setting shipping
    setSelectedShipping(filterData?.shipping_id);

    //setting price
    let price = filterData?.price_range;
    if (price) {
      let prices = price.split(",");
      setMinPrice(parseInt(prices[0]));
      setMaxPrice(parseInt(prices[1]));
    }

    //setting star rating
    if(filterData?.star_rating){
      handleRatingChange(filterData?.star_rating, true);
    }
    
    //setting brand 
    setSelectedBrand(filterData?.brand_id);
  }
  },[isMobile])

  useEffect(() => {}, [childList, parentList, minPrice, maxPrice]);

  const getShippingOptions = () => {
    const formData = new FormData();
    BuyerApiCalls(formData, Apis.shippingOptions, "GET", {}, processResponse);
  };

  const getCategoryOptions = (layer, isMob) => {
    const formData = new FormData();
    // formData.append("list_length", "5");
    // formData.append("page", 1);
    let endpoint = Apis.filteredCategoryList + "?list_length=5&page=1";
    let parent_category =
      "slug" in params && params["slug"] !== "search" && !isMob
        ? params["slug"]
        : categoryID;
    if (parent_category) endpoint += "&parent_cat=" + parent_category
    // formData.append("parent_cat", parent_category);
    BuyerApiCalls(
      formData,
      endpoint,
      "GET",
      {},
      processResponse,
      layer
    );
    setCategoryPage((prevPage) => prevPage + 1);
  };

  const getBrandList = () => {
    const formData = new FormData();
    formData.append("search", "");
    formData.append("list_length", "20");

    let brandUrl = Apis.brandList + "?list_length=20&search="
    BuyerApiCalls(formData, brandUrl, "GET", {}, processResponse);
  };

  const processResponse = (res, api, layer, parent_id_category) => {
    if (api === Apis.shippingOptions) {
      setShippingOptions(res.data.data.shipping_options);
      return;
    }

    //check if the child is retrieve already or not (parent_id called)
    if (api.includes(Apis.filteredCategoryList)) {
      var resCategories = res.data.data.categories;
      if (res.data.data.category_id) {
        setCategoryId(res.data.data.category_id.toString())
        // if(!isMobile) addToFilterData("category_id", res.data.data.category_id.toString());
      }
      if (initialCategoryList.current.length === 0)
        setTotalCategoryPages(res.data.data.pages);

      //third layer child
      if (
        parent_id_category &&
        layer === 3 &&
        !parentList.includes(parent_id_category.toString())
      ) {
        //not called -> add the child to the child list
        setChildList([
          ...childList,
          {
            id: parent_id_category,
            child: resCategories,
          },
        ]);
        return;
      } else if (layer === 2 && viewMoreCategory) {
        if (
          resCategories.length !== 0 &&
          initialCategoryList.current.length === 0
        ) {
          initialCategoryList.current = resCategories;
          setsecondLayerData(resCategories);
        } else if (
          resCategories.length !== 0 &&
          initialCategoryList.current.length !== 0
        ) {
          const tempArr = [...secondLayerData, ...resCategories];
          setsecondLayerData(tempArr);

          if (viewMoreCategoryPage === totalCategoryPages)
            setViewMoreCategory(false);
        } else setViewMoreCategory(false);

        return;
      } else if (layer === 2 && !viewMoreCategory) {
        setsecondLayerData(initialCategoryList.current);
        setCategoryPage((prevPage) => prevPage + 1);
        setViewMoreCategory(true);
        return;
      }
    }

    if (api.includes(Apis.brandList)) {
      var resBrands = res.data.data.brand_list;
      setBrandList(resBrands);
    }
  };

  //1.update the filterData upon click
  //2.retrieve the 3rd layer category list and display on the sidebar
  const sidebarFilterHandler = (e,layer) => {
    // Api call 2nd layer (VIEW MORE)
    if (layer === 2) {
      let formData = new FormData();
      formData.append("list_length", "5");
      formData.append("page", viewMoreCategoryPage);
      let endpoint = Apis.filteredCategoryList + "?list_length=5&page=" + viewMoreCategoryPage;

      if (!secondLayerActiveID) {
        let parent_category =
          "slug" in params && params["slug"] !== "search"
            ? params["slug"]
            : categoryID;
        if (parent_category) endpoint += "&parent_cat=" + parent_category
        // formData.append("parent_cat", parent_category);
      }

      BuyerApiCalls(
        formData,
        endpoint,
        "GET",
        {},
        processResponse,
        layer
      );
      return;
    }

    // Api call 3rd layer
    if (e.currentTarget.getAttribute("has_child") === "true" && layer === 3) {
      if (!parentList.includes(e.target.id.toString())) {
        let categoryId = new FormData();
        // categoryId.append("parent_cat", e.target.id);
        let endpoint =  Apis.filteredCategoryList + "?parent_cat=" + e.target.id 
        BuyerApiCalls(
          categoryId,
          endpoint,
          "GET",
          {},
          processResponse,
          layer,
          e.target.id
        );
        //add parent id to the state, so it wont call the parent_id again
        setParentList([...parentList, e.target.id]);
      }

      return;
    }
  };

  const toggleArrow = (e) => {
    if (e.target.id.toString() === secondLayerActiveID) {
      setIsOpen(!isOpen);
    } else {
      setIsOpen(true);
    }
  };

  const handleRatingChange = (value, onLoad) => {
    setSelectedRating(value);
    if (!isMobile) addToFilterData("star_rating", value);

    var ele = document.getElementsByName("ratingGroup");
    if (value === 0)
      for (var i = 0; i < ele.length; i++) ele[i].checked = false;

    if (onLoad) {
      ele.forEach((item) => {
        if (item.id === value.toString()) item.checked = true;
      });
    }
  };

  const handleCheckboxClear = (id) => {
    var ele = document.getElementsByName(id);
    for (var i = 0; i < ele.length; i++) ele[i].checked = false;
  };

  const applyPrice = (e) => {
    e.preventDefault();

    if (maxPrice !== "" || minPrice !== "") {
      var priceRange = "";
      priceRange = `${minPrice},${maxPrice}`;
      if(!isMobile) addToFilterData("price_range", priceRange);
    }
  };

  const clearFilters = () => {
    addToFilterData("all", "");
    setSelectedShipping("");
    setMinPrice("");
    setMaxPrice("");
    handleRatingChange(0);
    handleCheckboxClear("brandCheckBox");
    handleCheckboxClear("shippingCheckBox");
    setSelectedBrand("");
    setsecondLayerActiveID(null);
    setThirdLayerActiveID(null);
    dispatch(setSubCategoryName(""));
    dispatch(setMainCategoryID(""));
  };

  const applyFilters = () => {
    var priceRange = "";
    if (maxPrice !== "" && minPrice !== "")  priceRange = `${minPrice},${maxPrice}`;

   let filterToApply = {
     category_id: currentCategoryId,
     shipping_id: selectedShipping,
     star_rating: selectedRating,
     brand_id: selectedBrand,
     price_range: priceRange,
     secondLayerActiveID: secondLayerActiveID,
     thirdLayerActiveID: thirdLayerActiveIndex,
     secondLayerData: secondLayerData
   };
   addToFilterData("apply_all", filterToApply)
  }

  const closeFilterModal = () => {
    let paramValues = {
      secondLayerActiveID: secondLayerActiveID,
      thirdLayerActiveID: thirdLayerActiveIndex,
      secondLayerData: secondLayerData
    }
    addToFilterData("closeFilter", paramValues)
  }

  return (
    <React.Fragment>
      <div className="md:flex md:w-[220px] h-fit md:border-[1px] border-gray-300 rounded-[5px] gap-10 p-[15px]">
        <div className="">
          {!isMobile ? (
            <div className="flex justify-end">
              <button
                onClick={clearFilters}
                className="flex text-sm py-1 px-2 bg-orangeButton text-white justify-center rounded-[4px] mb-3"
              >
                Clear All
              </button>
            </div>
          ) : (
            <div className=" flex gap-2 items-center">
               <span
                className="flex justify-end cp mb-4"
                onClick={closeFilterModal}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="text-sm mt-1" />
              </span>
              <p className="text-lg mb-3">Search Filters</p>
            </div>
          )}
          <div className="flex flex-col flex-wrap w-full gap-[12px]">
            <p className="font-poppins font-medium text-[16px] leading-5 text-gray-700">
              Category
            </p>

            <div className="">
              {/*second layer*/}
              {secondLayerData?.map((category, index) => {
                //if the category has the child attribute as true -> triangle toogle icon
                if (category.has_child.toString() === "true") {
                  return (
                    <div key={index}>
                      <div className={`flex flex-1 py-2`}>
                        <Link
                          to={CustomerRoutes.CategoryProductListing + category.slug + "/"}
                          style={{
                            color:
                              secondLayerActiveID ===
                              category.id_category.toString()
                                ? "#FA9103"
                                : "black",
                          }}
                          key={index}
                          className="flex flex-1 font-poppins font-normal text-[14px] leading-6 justify-between"
                          id={category.id_category}
                          has_child={category.has_child.toString()}
                          onClick={(e) => {
                            sidebarFilterHandler(e, 3);
                            setsecondLayerActiveID(
                              category.id_category.toString()
                            );
                            setThirdLayerActiveID(null);
                            toggleArrow(e);
                            setCategoryId(category.id_category.toString());
                            // if (!isMobile) {
                              // dispatch(setSubCategoryName(category.name));
                              // addToFilterData(
                              //   "category_id",
                              //   category.id_category.toString()
                              // );
                            // }
                          }}
                        >
                          {category.name}
                          {secondLayerActiveID ===
                            category.id_category.toString() && isOpen ? (
                            <FontAwesomeIcon
                              className="w-[10px] pointer-events-none"
                              icon={faChevronRight}
                              rotation={90}
                            />
                          ) : (
                            <FontAwesomeIcon
                              className="w-[10px] pointer-events-none"
                              icon={faChevronRight}
                            />
                          )}
                        </Link>
                      </div>

                      {secondLayerActiveID ===
                        category.id_category.toString() &&
                        isOpen &&
                        childList
                          ?.filter(
                            (obj) => obj.id === category.id_category.toString()
                          )
                          ?.map((child) => {
                            return child.child?.map((obj, index) => {
                              return (
                                <div key={index} className="pl-2 mb-1">
                                  <Link
                                    to={
                                      CustomerRoutes.CategoryProductListing + obj.slug + "/"
                                    }
                                    key={index}
                                    style={{
                                      color:
                                        thirdLayerActiveIndex ===
                                        obj.id_category
                                          ? "#FA9103"
                                          : "black",
                                    }}
                                    id={index}
                                    className="font-poppins text-[14px] leading-6 "
                                    onClick={() => {
                                      // dispatch(setSubCategoryName(obj.name));
                                      setThirdLayerActiveID(obj.id_category);
                                      setCategoryId(obj.id_category.toString());
                                      // if (!isMobile) {
                                      //   addToFilterData(
                                      //     "category_id",
                                      //     obj.id_category.toString()
                                      //   );
                                      // }
                                    }}
                                  >
                                    {obj.name}
                                  </Link>
                                </div>
                              );
                            });
                          })}
                    </div>
                  );
                } else {
                  return (
                    <div key={index} className="flex flex-1 py-2">
                      <Link
                        to={CustomerRoutes.CategoryProductListing + category.slug + "/"}
                        style={{
                          color:
                            secondLayerActiveID?.toString() ===
                            category.id_category?.toString()
                              ? "#FA9103"
                              : "black",
                        }}
                        className="flex flex-1 font-poppins font-normal text-[14px] leading-6 justify-between"
                        id={category.id_category}
                        onClick={(e) => {
                          setCategoryId(category.id_category.toString());
                          // if (!isMobile) {
                          //   dispatch(setSubCategoryName(category.name));
                          //   addToFilterData(
                          //     "category_id",
                          //     category.id_category.toString()
                          //   );
                          // }
                          setsecondLayerActiveID(
                            category.id_category.toString()
                          );
                          sidebarFilterHandler(e);
                        }}
                      >
                        {category.name}
                      </Link>
                    </div>
                  );
                }
              })}

              {viewMoreCategory &&
                viewMoreCategoryPage <= totalCategoryPages && (
                  <button
                    className="flex text-left w-fit h-[18px] items-center gap-[10px] text-xs font-bold mt-2"
                    onClick={(e) => {
                      setCategoryPage((prevState) => prevState + 1);
                      sidebarFilterHandler(e, 2);
                    }}
                  >
                    View More
                    <FontAwesomeIcon
                      className="w-[10px]"
                      icon={faChevronRight}
                      rotation={90}
                    />
                  </button>
                )}
              {!viewMoreCategory && (
                <button
                  className="flex text-left w-fit h-[18px] items-center gap-[10px] text-xs font-semibold mt-2"
                  onClick={(e) => {
                    setCategoryPage(1);
                    sidebarFilterHandler(e, 2);
                  }}
                >
                  View Less
                  <FontAwesomeIcon
                    className="w-[10px]"
                    icon={faChevronRight}
                    rotation={270}
                  />
                </button>
              )}
            </div>
          </div>

          <div className="md:w-48 h-0 border border-gray-300 my-5"></div>

          <div className="flex flex-col flex-wrap w-full gap-[12px]">
            <p className="font-poppins font-medium text-[16px] leading-5 text-gray-600">
              Shipping Option
            </p>
            <form className="grid divide-y-2 h-full">
              <CheckBox
                selectedShipping={selectedShipping}
                setSelectedShipping={setSelectedShipping}
                shippingOptions={shippingOptions}
                addToFilterData={addToFilterData}
                isMobile={isMobile}
                //if object pass setFilters
                //if single variable then pass setSelectedShippung
                //after setstate then refresh list by calling loadproduct
                //pass loadProduct
              ></CheckBox>
            </form>
          </div>

          <div className="md:w-48 h-0 border border-gray-300 my-5"></div>

          {/*price range section */}
          <div>
            <form className="flex flex-col flex-wrap w-full gap-[18px]">
              <h3 className="font-poppins font-medium text-[16px] leading-[21px] text-gray-600">
                Price Range
              </h3>
              <div className="flex gap-2 w-full">
                <div className="border border-solid rounded-[2px] border-gray-300 w-full ">
                  <input
                    className=" h-fit px-2 w-full"
                    id="minPrice"
                    type="number"
                    placeholder="MIN"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                    }}
                  />
                </div>
                <div className="border border-solid rounded-[2px] border-gray-300 w-full ">
                  <input
                    className=" h-fit px-2 w-full"
                    id="maxPrice"
                    type="number"
                    placeholder="MAX"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                    }}
                  />
                </div>
              </div>
              {!isMobile && (
                <button
                  onClick={applyPrice}
                  className="flex text-sm py-2 bg-orangeButton text-white justify-center rounded-[4px]"
                >
                  Apply
                </button>
              )}
            </form>
          </div>

          <div className="md:w-48 h-0 border border-gray-300 my-5"></div>

          <div className="flex flex-col flex-wrap w-full gap-[18px]">
            <div className="flex justify-between">
              <p className="font-poppins font-medium text-[16px] leading-[21px] text-gray-600">
                Star Ratings
              </p>
              {selectedRating !== 0 && (
                <p
                  className="text-orangeButton text-xs cp"
                  onClick={(_) => handleRatingChange(0)}
                >
                  Clear
                </p>
              )}
            </div>

            <form className="grid divide-y-2 h-full">
              <div className="flex flex-col gap-[8px] font-poppins font-normal text-sm leading-5 text-gray-600">
                {ratingOptions?.map((item, index) => (
                  <label key={index} className="flex gap-[10px]">
                    <input
                      type="radio"
                      name="ratingGroup"
                      id={item.value}
                      onChange={(_) => handleRatingChange(item.value)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </form>
          </div>

          <div className="md:w-48 h-0 border border-gray-300 my-5"></div>

          <div className="flex flex-col flex-wrap w-full gap-[18px]">
            <p className="font-poppins font-medium text-[16px] leading-[21px] text-gray-600">
              Brand
            </p>
            <form className="grid divide-y-2 h-full">
              <CheckBox
                selectedBrand={selectedBrand}
                brandOptions={brandList}
                setSelectedBrand={setSelectedBrand}
                addToFilterData={addToFilterData}
                isMobile={isMobile}
              ></CheckBox>
            </form>
          </div>

          {isMobile && (
            <div className="flex gap-4">
              <button
                onClick={clearFilters}
                className="flex w-1/2 text-sm py-2 mt-5 bg-orangeButton text-white justify-center rounded-[4px]"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="flex w-1/2 text-sm py-2 mt-5 bg-orangeButton text-white justify-center rounded-[4px]"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}

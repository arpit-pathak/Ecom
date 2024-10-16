import { useEffect, useState, useRef } from "react";
import { ApiCalls, AdminApis, HttpStatus, Messages } from "../../../../utils";
import useAuth from "../../../../hooks/UseAuth";
import { InputBoxStyle } from "../../../../styles/FormStyles";
import { RichTextEditor } from "../../../customInput";
import { showToast } from "../../../generic/Alerts";
import { Button } from "../../../generic";

const hoverOrangeClass = "transition text-left hover:text-[#F5AB35]";

const EditProductDataForm = ({ product, isEdit }) => {
  const auth = useAuth();
  const editorRef = useRef(null); // create a ref to the editor instance

  const [prodName, setProdName] = useState(product?.name);
  const [brand, setBrand] = useState(product?.brand_name);

  //selections
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [hasMoreCat1, setHasMoreCat1] = useState(true);
  const [category1, setCategory1] = useState([]);
  const [category1Page, setCategory1Page] = useState(1);

  //cat 2
  const [hasMoreCat2, setHasMoreCat2] = useState(true);
  const [category2, setCategory2] = useState([]);
  const [category2Page, setCategory2Page] = useState(1);

  //cat 3
  const [hasMoreCat3, setHasMoreCat3] = useState(true);
  const [category3, setCategory3] = useState([]);
  const [category3Page, setCategory3Page] = useState(1);

  useEffect(() => {
    preloadCategories(product?.categories);
    setSelectedCategory(product?.categories);
  }, []);

  async function loadCategory(level, page, parent_id, refresh) {
    let url =
      AdminApis.categoryList +
      "?parent_id=" +
      parent_id +
      "&category_level=" +
      (level + 1) +
      "&page=" +
      page +
      "&records=10";
    await ApiCalls(url, "GET", {}, false, auth.token.access)
      .then((response) => {
        if (response.status !== 200) {
          console.log("error fetch category");
          return;
        }
        const ldata = response.data.data;
        if (ldata.records.length === 0) {
          if (level === 0) setHasMoreCat1(false);
          if (level === 1) setHasMoreCat2(false);
          if (level === 2) setHasMoreCat3(false);
          if (ldata.records.length === 0) return;
        }

        const firstCategory = ldata.records[0];
        if (firstCategory.parent_id === null) {
          if (ldata.records.length > 0) {
            const ncat = refresh ? [] : category1;
            if (ldata.records.length < 10) setHasMoreCat1(false);
            setCategory1([...ncat, ...ldata.records]);
          }
        } else {
          if (level === 0 && parent_id === firstCategory.parent_id) {
            const ncat = refresh ? [] : category1;
            if (ldata.records.length < 10) setHasMoreCat1(false);
            setCategory1([...ncat, ...ldata.records]);
          }
          if (level === 1 && parent_id === firstCategory.parent_id) {
            const ncat = refresh ? [] : category2;
            if (ldata.records.length < 10) setHasMoreCat2(false);
            setCategory2([...ncat, ...ldata.records]);
          }
          if (level === 2 && parent_id === firstCategory.parent_id) {
            const ncat = refresh ? [] : category3;
            if (ldata.records.length < 10) setHasMoreCat3(false);
            setCategory3([...ncat, ...ldata.records]);
          }
        }
      })
      .catch((error) => {
        console.log(error.response.data.message);
      });
  }

  const preloadCategories = async (selCat) => {
    await loadCategory(0, category1Page, "", true);
    if (selCat.length > 0) {
      await loadCategory(1, category2Page, selCat[0].id_category, true);
    }

    if (selCat.length > 1) {
      await loadCategory(2, category3Page, selCat[1].id_category, true);
    }
  };

  const handleProductDataConfirmation = async () => {
    let editorData;
    if (editorRef.current !== null) {
      editorData = editorRef.current.getData();
    }

    let formData = new FormData();
    formData.append("product_name", prodName);
    formData.append("product_desc", editorData);
    formData.append("brand", brand);
    formData.append(
      "category_id",
      selectedCategory[selectedCategory.length - 1].id_category
    );

    let url = AdminApis.editProductDetails + product?.id_product + "/";
    await ApiCalls(url, "POST", formData, false, auth.token.access)
      .then((response) => {
        if (response.status === HttpStatus.HTTP_200_OK) {
          showToast(response.data.message, "success", "edit-product-details");
        }
      })
      .catch((error) => {
        showToast(error.response.data.message, "error");
      });
  };

  return (
    <div className="px-4">
      {/* categories section */}
      <div className="mb-3">
        <p className="text-sm text-gray-700 mb-1">Category</p>
        <div className="boxshadow grid grid-cols-3 text-[18px] text-[#4F4F4F] font-medium w-full mb-[50px]">
          <div className="py-[20px] overflow-y-auto flex flex-col gap-[20px] h-[250px] bg-white">
            {category1.map((val, idx) => {
              return (
                <button
                  type="button"
                  key={idx + "category1"}
                  className={`${hoverOrangeClass} 
                                ${
                                  selectedCategory[0] &&
                                  val.id_category ===
                                    selectedCategory[0].id_category
                                    ? "text-[#F5AB35]"
                                    : ""
                                } px-[25px]`}
                  //   onClick={() => {
                  //     const updatedSelected = [...selectedCategory];
                  //     updatedSelected[0] = val;
                  //     updatedSelected[1] = null;
                  //     updatedSelected[2] = null;
                  //     setSelectedCategory(updatedSelected);

                  //     //reset category 2
                  //     setCategory2Page(1);
                  //     setCategory2([]);

                  //     //reset category 3
                  //     setCategory3Page(1);
                  //     setCategory3([]);

                  //     //then load cat 2
                  //     loadCategory(1, category2Page, val.id_category, true);
                  //   }}
                >
                  {val.name}
                </button>
              );
            })}

            {hasMoreCat1 && (
              <>
                <button
                  type="button"
                  className={`${hoverOrangeClass} text-sm px-[25px]`}
                  onClick={() => {
                    const cpage = category1Page + 1;
                    setCategory1Page(cpage);
                    loadCategory(0, cpage, "", false);
                  }}
                >
                  Load More..
                </button>
              </>
            )}
          </div>
          <div className="py-[20px] overflow-y-auto flex flex-col gap-[20px] h-[250px]">
            {category2.map((val, idx) => {
              return (
                <button
                  type="button"
                  key={idx + "category2"}
                  className={`${hoverOrangeClass} 
                                ${
                                  selectedCategory[1] &&
                                  val.id_category ===
                                    selectedCategory[1].id_category
                                    ? "text-[#F5AB35]"
                                    : ""
                                } px-[25px]`}
                  onClick={() => {
                    // const updatedSelected = [...selectedCategory];
                    // updatedSelected[1] = val;
                    // updatedSelected[2] = null;
                    // setSelectedCategory(updatedSelected);
                    // //reset category 3
                    // setCategory3Page(1);
                    // setCategory3([]);
                    // //then load cat 2
                    // loadCategory(2, category3Page, val.id_category, true);
                  }}
                >
                  {val.name}
                </button>
              );
            })}

            {hasMoreCat2 && selectedCategory[0] && (
              <>
                <button
                  type="button"
                  className={`${hoverOrangeClass} text-sm px-[25px]`}
                  onClick={() => {
                    const cpage = category2Page + 1;
                    setCategory2Page(cpage);
                    loadCategory(
                      1,
                      cpage,
                      selectedCategory[1].id_category,
                      false
                    );
                  }}
                >
                  Load More..
                </button>
              </>
            )}
          </div>
          <div className="py-[20px] overflow-y-auto flex flex-col gap-[20px] h-[250px]">
            {category3.map((val, idx) => {
              return (
                <button
                  type="button"
                  key={idx + "category2"}
                  className={`${hoverOrangeClass} 
                                ${
                                  selectedCategory[2] &&
                                  val.id_category ===
                                    selectedCategory[2].id_category
                                    ? "text-[#F5AB35]"
                                    : ""
                                } px-[25px]`}
                  onClick={() => {
                    // const updatedSelected = [...selectedCategory];
                    // updatedSelected[2] = val;
                    // setSelectedCategory(updatedSelected);
                  }}
                >
                  {val.name}
                </button>
              );
            })}

            {hasMoreCat3 && selectedCategory[1] && (
              <>
                <button
                  type="button"
                  className={`${hoverOrangeClass} text-sm px-[25px]`}
                  onClick={() => {
                    const cpage = category3Page + 1;
                    setCategory3Page(cpage);
                    loadCategory(
                      2,
                      cpage,
                      selectedCategory[2].id_category,
                      false
                    );
                  }}
                >
                  Load More..
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* prod name & brand */}
      <div className="sm:grid grid-cols-2 gap-4 py-2">
        {/* prod name */}
        <div>
          <label
            htmlFor="name"
            className="my-2 block text-sm font-medium text-gray-700"
            id={`label_name`}
          >
            Product Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            disabled={isEdit ? false : true}
            defaultValue={prodName}
            className={InputBoxStyle}
            onChange={(e) => setProdName(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="brand_name"
            className="my-2 block text-sm font-medium text-gray-700"
            id={`label_brand_name`}
          >
            Brand
          </label>
          <input
            type="text"
            name="brand_name"
            id="brand_name"
            disabled={isEdit ? false : true}
            defaultValue={brand}
            className={InputBoxStyle}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
      </div>

      {/* product images */}
      <div className="mb-5">
        <p className="text-sm text-gray-700 mb-1">Product Images</p>
        <div className="flex gap-4 flex-wrap">
          {product?.image_media.map((image) => {
            return <img src={image?.img} alt="" height={130} width={130} />;
          })}
        </div>
      </div>

      {/* product video */}
      <div className="mb-5">
        <p className="text-sm text-gray-700 mb-1">Cover Video</p>
        <video
          controls
          width="400"
          height="300"
          src={product?.image_video[0]?.vdo}
        />
      </div>

      {/* prod description */}
      <div className="mb-5">
        <p className="text-sm text-gray-700 mb-1">Product Description</p>
        <RichTextEditor
          data={product?.description}
          onEditorInstance={(editor) => (editorRef.current = editor)}
          disabled={isEdit ? false : true}
        />
      </div>

      {/* tags */}
      <div className="mb-5">
        <p className="text-sm text-gray-700 mb-1">Tags</p>
        {product?.tags?.length === 0 ? (
          <p>No tags found</p>
        ) : (
          <div className="flex gap-2 mt-4 flex-wrap items-center justify-start">
            {product.tags.map((item, tagIndex) => {
              return (
                <div
                  key={tagIndex}
                  className="px-2 py-1 rounded-md text-center text-sm text-black bg-[#e7e7e7] flex gap-2 items-center"
                >
                  {item}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* save button */}
      {isEdit && (
        <div className="flex justify-end py-2">
          <Button
            type="confirm"
            text="Save"
            py="2"
            px="3"
            onClick={handleProductDataConfirmation}
          />
        </div>
      )}
    </div>
  );
};

export default EditProductDataForm;

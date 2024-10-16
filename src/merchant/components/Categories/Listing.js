import { useState, useEffect } from "react";
import "./component.css";
import ls from "local-storage";
import { Constants, Media_Size_Limit } from "../../utils/Constants.js";
import { ApiCalls, Apis } from "../../utils/ApiCalls.js";
import { MerchantRoutes } from "../../../Routes.js";
import { useNavigate } from "react-router-dom";

//ui components
import Navbar from "../../components/Navbar.js";
import PopupMessage from "../../components/PopupMessage.js";
import { Sidebar } from "../../components/Parts.js";

//icons
import { TbError404 } from "react-icons/tb";
import { BiSort } from "react-icons/bi";
import {
  BsEye,
  BsPlusCircle,
  BsPatchCheckFill,
  BsFillQuestionCircleFill,
  BsFillPencilFill,
} from "react-icons/bs";
import { TfiDropbox } from "react-icons/tfi";
import { MdDeleteForever, MdOutlineClose } from "react-icons/md";
import { loginRequired } from "../../utils/Helper";
import Pagination from "../../../utils/Pagination/pagination.js";

/*
-missing upload category image 
-confirm if category image field is to be added in category table
-bulk function
-preview
-adjust sequence
*/

export default function Categories({ page, level }) {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [items, setItems] = useState([]);
  const [popupDict, setPopupDict] = useState(null);
  const [apiError, setApiError] = useState(ls("apiError"));
  const [categoryID, setCategoryID] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageURL, setSelectedImageURL] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [errObj, setErrObj] = useState({
    category_name: "",
    category_image: "",
  });
  const [selectedEditImage, setSelectedEditImage] = useState(null);

  //pagination
  const [entries, setEntries] = useState(10);
  const [CurrPage, setCurrPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const emptyErrObj = {
    category_name: "",
    category_image: "",
  };

  loginRequired(page);
  document.title = "Merchant | uShop";

  let user = ls(Constants.localStorage.user);
  if (user) user = JSON.parse(user);

  //load publishing key
  useEffect(() => {
    loadItems();
  }, [CurrPage]);

  let notificationClass = "notification mt-4";
  let notificationIcon = null;
  if (notification !== null) {
    if (notification.result === "success")
      notificationIcon = <BsPatchCheckFill />;
    if (notification.result === "warning")
      notificationIcon = <BsFillQuestionCircleFill />;
    notificationClass += " " + notification.result;
  }

  const renderSkeletonTable = () => {
    const fillers = [0, 1, 2, 3, 4, 5];
    return (
      <>
        {fillers.map((itm, idx) => (
          <tr key={idx}>
            <td>
              <div className="skeleton-ui skeleton-checkbox"></div>
            </td>
            <td>
              <div className="skeleton-ui skeleton-full"></div>
            </td>
            <td>
              <div className="skeleton-ui skeleton-full"></div>
            </td>
            <td>
              <div className="skeleton-ui skeleton-full"></div>
            </td>
            <td>
              <div className="skeleton-ui skeleton-full"></div>
            </td>
          </tr>
        ))}
      </>
    );
  };

  const renderItems = () => {
    return (
      <>
        {items.map((item, i) => (
          <tr key={item.id_category}>
            <td>
              <div className="custom-checkbox">
                <input id={"select-" + i} type="checkbox" />
                <span className="checkmark"></span>
              </div>
            </td>
            <td>
              <div className=" flex gap-2">
                <div className=" flex-none">
                  <img src={item.image_url} alt="" />
                </div>
                <div className=" flex-1 w-3/4">{item.name}</div>
              </div>
            </td>
            <td>{item.product_count}</td>
            <td>
              <label className="switch">
                <input
                  type="checkbox"
                  id="variantsSwitch"
                  defaultChecked={item.status_id === 1 ? true : false}
                  onChange={(e) => switchChange(e, item.id_category)}
                />
                <span className="slider round"></span>
              </label>
            </td>
            <td>
              <div className="flex flex-wrap ">
                {/* <div className="flex gap-1"> */}
                <button
                  className="actions mb-2"
                  type="button"
                  title="Edit"
                  // onClick={(e) => editItem(item)}
                  onClick={(e) => {
                    setIsEdit(true);
                    setCategoryID(item.id_category);
                    setCategoryName(item.name);
                    setSelectedImageURL(item.image_url);
                  }}
                >
                  <BsFillPencilFill />
                </button>

                <button
                  className="actions danger mb-2"
                  type="button"
                  title="Delete"
                  onClick={(e) => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this category?"
                      )
                    ) {
                      deleteItem(item, e);
                    }
                  }}
                >
                  <MdDeleteForever />
                </button>
                {/* </div> */}
                <button
                  onClick={() =>
                    navigate(
                      MerchantRoutes.AddProdToCategory.replace(
                        ":categoryId",
                        item.id_category
                      ),
                      {
                        state: {
                          category: item,
                        },
                      }
                    )
                  }
                  className="px-3 py-1 rounded-md text-white text-sm bg-orangeButton flex gap-1 items-center w-28"
                >
                  <BsPlusCircle /> Products
                </button>
              </div>
            </td>
          </tr>
        ))}
      </>
    );
  };

  const deleteItem = async (item) => {
    let fd = new FormData();
    fd.append("category_id", item.id_category);
    ApiCalls(
      fd,
      Apis.deleteCategory,
      "POST",
      {
        Authorization: "Bearer " + user.access,
      },
      processResponse,
      null
    );
  };

  const noItems = () => {
    return (
      <>
        <tr>
          <td colSpan={5}>
            <div className="noItems">
              <TfiDropbox />

              <span>No categories added yet</span>
            </div>
          </td>
        </tr>
      </>
    );
  };

  const processResponse = (res, api) => {
    var rdata = res.data;

    if (rdata.result === "FAIL") {
      setNotification({
        result: "warning",
        message: rdata.message,
      });
      return;
    }
    if ([Apis.addCategory, Apis.deleteCategory].indexOf(api) > -1) {
      setShowAddModal(false);
      setNotification({
        result: "success",
        message: rdata.message,
      });
      //setLoading(true);
      loadItems(null);
      return;
    }
    if (api === Apis.updateCategoryStatus) {
      setNotification({
        result: "success",
        message: rdata.message,
      });
      return;
    }

    if (rdata.data.categories && rdata.data.categories.length >= 0)
      setItems(rdata.data.categories);
    //no need to display notification
    //setNotification({
    //    result: "success",
    //    message: rdata.message
    //});
    const pages = rdata.data.pages;
    const total = rdata.data.total;

    setTotal(total ?? 0);
    setPages(pages ?? 1);
    setLoading(false);
  };

  const loadItems = async (e) => {
    let fd = new FormData();
    fd.append("is_seller", "yes");
    fd.append("list_length", entries);
    fd.append("page", CurrPage);
    await ApiCalls(
      fd,
      Apis.listCategory,
      "POST",
      {
        Authorization: "Bearer " + user.access,
      },
      processResponse,
      e ? e.target : null
    );
  };

  function selectImage(id) {
    var fileInput = document.getElementById(id);
    fileInput.click();
  }

  function fileSizeCheck(file) {
    const mb = 1024 * 1024;
    var fileSize = (file.size / mb).toFixed(2);
    if (fileSize <= Media_Size_Limit.img_max_size) return true;
    else return false;
  }

  function ImageSelection(e) {
    let newErrObj = { ...errObj };
    if (e.target.files && e.target.files[0]) {
      var imgFile = e.target.files[0];

      //file size check
      let isFileSizeMatching = fileSizeCheck(imgFile);
      const CATEGORY_IMG_HEIGHT = 113,
        CATEGORY_IMG_WIDTH = 111;
      if (isFileSizeMatching) {
        //file dimension check
        var imgFileURL = URL.createObjectURL(imgFile);
        const img = new Image();
        img.src = imgFileURL;
        img.onload = () => {
          if (
            img.height === CATEGORY_IMG_HEIGHT &&
            img.width === CATEGORY_IMG_WIDTH
          ) {
            isEdit ? setSelectedEditImage(imgFile) : setSelectedImage(imgFile);

            setSelectedImageURL(imgFileURL);
            newErrObj.category_image = "";
          } else {
            console.log("IMAGE HEIGHT AND WIDTH");
            newErrObj.category_image =
              "Image height and width does not match requirements";
          }
          setErrObj(newErrObj);
        };
      } //ELSE file size TOO BIG
      else {
        newErrObj.category_image = "Image size needs to be under 2MB";
        setErrObj(newErrObj);
      }
    }
  }

  const validateFields = () => {
    let isFilledUp = true;
    let newErrObj = { ...errObj }; // Create a copy of the existing errObj
    // if (!selectedImage && !selectedImageURL) {
    //   isFilledUp = false;
    //   newErrObj.category_image = "Category image is required.";
    // } else {
    //   newErrObj.category_image = ""; // Clear the error message if selectedImage is present
    // }

    let name = document.getElementById("category_name").value;
    if (name === null || (name + "").trim() === "") {
      isFilledUp = false;
      newErrObj.category_name = "Category name is required.";
    } else {
      newErrObj.category_name = ""; // Clear the error message if category_name is present
    }
    setCategoryName(name);
    setErrObj(newErrObj);
    return isFilledUp;
  };

  const addCategory = async (e) => {
    setCategoryName(document.getElementById("category_name").value);
    const isValid = validateFields();

    if (isValid) {
      let fd = new FormData();
      fd.append("category_name", categoryName);
      fd.append(
        "category_image",
        isEdit ? selectedEditImage ?? selectedImageURL : selectedImage
      );

      if (isEdit) {
        await ApiCalls(
          fd,
          Apis.editCategory + categoryID + "/",
          "POST",
          {
            Authorization: "Bearer " + user.access,
          },
          processResponse,
          e ? e.target : null
        );
      } else {
        await ApiCalls(
          fd,
          Apis.addCategory,
          "POST",
          {
            Authorization: "Bearer " + user.access,
          },
          processResponse,
          e ? e.target : null
        );
      }

      setIsEdit(false);
      if (!isEdit) {
        setSelectedImage(null);
        setSelectedImageURL(null);
      }
    }
  };

  const removeImage = async (e) => {
    setSelectedImage(null);
    setSelectedImageURL(null);
    const fileInput = document.getElementById("category_image");
    if (fileInput) {
      fileInput.value = ""; // Clear the file input value
    }
  };

  const switchChange = async (e, id) => {
    let val = e.target.checked ? "on" : "off";
    let fd = new FormData();
    fd.append("category_id", id);
    fd.append("status", val);
    await ApiCalls(
      fd,
      Apis.updateCategoryStatus,
      "POST",
      {
        Authorization: "Bearer " + user.access,
      },
      processResponse,
      e ? e.target : null
    );
  };

  const togglePop = (msgHead, msg, result) => {
    if (msgHead !== "") {
      setPopupDict({
        header: msgHead,
        message: msg,
        result: result,
      });
    } else {
      setPopupDict(null);
    }
  };

  if (apiError !== null) ls.remove("apiError");
  let mcClass = level === 1 ? "main-contents" : "main-contents ws";

  return (
    <main className="app-merchant merchant-db">
      <Navbar theme="dashboard" />
      <Sidebar selectedMenu={2.3} />
      <div className={mcClass}>
        <div className="breadcrumbs">
          <div className="page-title">Categories</div>
          <ul>
            <li>
              <a href={MerchantRoutes.Landing}>Home {">"}</a>
            </li>
            <li>Categories</li>
          </ul>
        </div>
        <div className="listing-page mt-5">
          <div className="body pt-3">
            {notification !== null ? (
              <>
                <div
                  className={notificationClass}
                  onClick={(e) => setNotification(null)}
                >
                  {notificationIcon}
                  {notification.message}
                </div>
              </>
            ) : (
              <></>
            )}

            {showAddModal && (
              <>
                <div id="modal-add" className="modal">
                  <div className="modal-body animate__animated animate__fadeInDown">
                    <h1>
                      Add Category
                      <MdOutlineClose
                        onClick={(e) => {
                          setShowAddModal(false);
                          setSelectedImage(null);
                          setSelectedImageURL(null);
                          setErrObj(emptyErrObj);
                        }}
                      />
                    </h1>

                    <section>
                      <div className="modal-field">
                        <label>Category Name</label>
                        <input
                          type={"text"}
                          id="category_name"
                          onChange={validateFields}
                        />
                        <p className="mb-8 text-[#EB5757] text-xs">
                          {errObj.category_name}
                        </p>
                      </div>
                    </section>

                    <div className="modal-field">
                      <label>Category Image</label>
                      <div>
                        <div className="relative">
                          <input
                            type="file"
                            name="category_image"
                            id="category_image"
                            onChange={(e) => {
                              ImageSelection(e);
                            }}
                            accept=".png, .jpg, .jpeg"
                            className="opacity-0 absolute !w-full"
                          />
                          {selectedImageURL ? (
                            <div className="flex gap-5">
                              <img src={selectedImageURL} alt="" />
                              <MdOutlineClose
                                onClick={removeImage}
                                color="black"
                                size="20px"
                              />
                            </div>
                          ) : (
                            <button
                              className="!w-full flex gap-2 px-4 h-11
                          items-center cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35]"
                              onClick={() => selectImage("category_image")}
                            >
                              <>
                                <BsPlusCircle />
                                Upload PNG/JPEG File
                              </>
                            </button>
                          )}
                        </div>
                        <p className="category-tool-tips mt-3">
                          (Image dimensions : 111 x 113, File size : Under 2MB)
                        </p>
                        {/* <p className="mb-8 text-[#EB5757] text-xs">
                          {errObj.category_image}
                        </p> */}
                      </div>
                    </div>
                    <div>
                      <button
                        className="site-btn btn-border-primary mr-2"
                        onClick={(e) => {
                          setShowAddModal(false);
                          setSelectedImage(null);
                          setSelectedImageURL(null);
                          setErrObj(emptyErrObj);
                        }}
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        className="site-btn btn-default mr-2"
                        onClick={(e) => addCategory()}
                        type="button"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {isEdit && (
              <>
                <div id="modal-add" className="modal">
                  <div className="modal-body animate__animated animate__fadeInDown">
                    <h1>
                      Edit Category
                      <MdOutlineClose
                        onClick={(e) => {
                          setIsEdit(false);
                          setSelectedImageURL(null);
                          setSelectedEditImage(null);
                          setErrObj(emptyErrObj);
                        }}
                      />
                    </h1>

                    <section>
                      <div className="modal-field">
                        <label>Category Name</label>
                        <input
                          value={categoryName}
                          type={"text"}
                          id="category_name"
                          onChange={validateFields}
                        />
                        <p className="mb-8 text-[#EB5757] text-xs">
                          {errObj.category_name}
                        </p>
                      </div>
                    </section>

                    <div className="modal-field">
                      <label>Category Image</label>
                      <div>
                        <div className="relative">
                          <input
                            type="file"
                            name="category_image"
                            id="category_image"
                            onChange={(e) => {
                              ImageSelection(e);
                            }}
                            accept=".png, .jpg, .jpeg"
                            className="opacity-0 absolute !w-full"
                          />
                          {selectedImageURL ? (
                            <div className="flex gap-5">
                              <img src={selectedImageURL} alt="" />
                              <MdOutlineClose
                                onClick={removeImage}
                                color="black"
                                size="20px"
                              />
                            </div>
                          ) : (
                            <button
                              className="!w-full flex gap-2 px-4 h-11
                          items-center cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35]"
                              onClick={() => selectImage("category_image")}
                            >
                              <>
                                <BsPlusCircle />
                                Upload PNG/JPEG File
                              </>
                            </button>
                          )}
                        </div>
                        <p className="category-tool-tips mt-3">
                          (Image dimensions : 111 x 113, File size : Under 2MB)
                        </p>
                        <p className="mb-8 text-[#EB5757] text-xs">
                          {errObj.category_image}
                        </p>
                      </div>
                    </div>
                    <div>
                      <button
                        className="site-btn btn-border-primary mr-2"
                        onClick={(e) => setIsEdit(false)}
                        type="button"
                      >
                        Cancel
                      </button>
                      <button
                        className="site-btn btn-default mr-2"
                        onClick={(e) => addCategory()}
                        type="button"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="table-container">
              <div className="grid max-lg:grid-cols-1 max-xl:grid-cols-2 mb-4 pt-2 pb-2">
                <div></div>

                {/* buttons*/}
                <div className="table-options-right">
                  <div
                    className="site-btn btn-default max-md:mb-2"
                    onClick={(e) => setShowAddModal(true)}
                    alt="Add New Category"
                  >
                    <span>
                      <BsPlusCircle /> Add Category
                    </span>
                  </div>
                  <div
                    className="site-btn btn-border-primary mr-2 max-md:mb-2"
                    href="#"
                    alt="Add New Category"
                  >
                    <span>
                      <BiSort /> Adjust Sequence
                    </span>
                  </div>
                  <div
                    className="site-btn btn-border-primary mr-2 max-md:mb-2"
                    href="#"
                    alt="Add New Category"
                  >
                    <span>
                      <BsEye /> Preview
                    </span>
                  </div>
                </div>
              </div>
              <div className="scrollable-table">
                <table>
                  <thead>
                    <tr>
                      <td width="5%">
                        <div className="custom-checkbox">
                          <input id="selectAll" type="checkbox" />
                          <span className="checkmark"></span>
                        </div>
                      </td>
                      <td width="40%">Display Name</td>
                      <td width="20%">Product(s)</td>
                      <td>Display On/Off</td>
                      <td width="20%">Actions</td>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <>{renderSkeletonTable()}</>
                    ) : (
                      <>
                        {items !== null && items.length > 0 ? (
                          <>{renderItems()}</>
                        ) : (
                          <>{noItems()}</>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                entries={entries}
                changeEntries={(e) => {
                  setCurrPage(1);
                  setEntries(e.target.value);
                }}
                toPage={(curr) => setCurrPage(curr)}
                pages={pages}
                page={CurrPage}
                total={total}
              />
            </div>
          </div>
        </div>
      </div>

      {popupDict !== null ? (
        <PopupMessage
          toggle={togglePop}
          header={popupDict.header}
          message={popupDict.message}
        />
      ) : null}
      {apiError !== null ? (
        <div className="api-error" onClick={() => setApiError(null)}>
          <TbError404 />
          <div className="message">
            {apiError.message}. Click here to reload page.
          </div>
        </div>
      ) : (
        <></>
      )}
    </main>
  );
}

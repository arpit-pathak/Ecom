import { useLocation, useNavigate } from "react-router-dom";
import { MerchantRoutes } from "../../../Routes";
import { BsChevronLeft } from "react-icons/bs";
import { useState } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import {
  MdOutlineRefresh,
  MdImage,
  MdOutlineBrokenImage,
} from "react-icons/md";
import { ApiCalls, Apis } from "../../utils/ApiCalls.js";
import { useEffect } from "react";
import Pagination from "../Ui/Pagination/index.js";
import { Constants } from "../../utils/Constants.js";
import ls from "local-storage";
import Loader from "../../../utils/loader.js";
import { BsPatchCheckFill, BsFillQuestionCircleFill } from "react-icons/bs";

const AddProdToCategory = () => {
  const { state } = useLocation();
  const { category } = state;
  const navigate = useNavigate();

  let user = ls(Constants.localStorage.user);
  if (user) user = JSON.parse(user);

  const [currentTab, setCurrentTab] = useState("add");
  const [sortPrice, setSortPrice] = useState("");
  const [sortStock, setSortStock] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState(10);
  const [productsSelected, setProductsSelected] = useState([]);
  const [pages, setPages] = useState(1);
  const perPage = 10;
  const [total, setTotal] = useState(0);
  const [notification, setNotification] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [search, setSearch] = useState("");
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [page]);

  useEffect(() => {
    if (search === "") {
      if (page !== 1) setPage(1);
      else loadProducts();
    }
  }, [search]);

  useEffect(() => {
    if (page !== 1) setPage(1);
    else loadProducts();
  }, [currentTab, entries, sortPrice, sortStock, isAvailable]);

  const updateTab = (tab) => {
    setCurrentTab(tab);
    setSortPrice("");
    setSortStock("");
    toPage(1);
  };

  const checkbox_mirror_action = (e, id) => {
    let isRemoval = false;
    setTimeout(() => {
      if (
        id === "div_mirror_one" &&
        document.getElementById("mirror-two").checked !==
          document.getElementById("mirror-one").checked
      ) {
        document.getElementById("mirror-two").click();
      }

      if (
        id === "div_mirror_two" &&
        document.getElementById("mirror-two").checked !==
          document.getElementById("mirror-one").checked
      ) {
        document.getElementById("mirror-one").click();
      }

      if (document.getElementById("mirror-two").checked) {
        document.getElementById("mirror-two-label").innerText = "Deselect All";
      } else {
        document.getElementById("mirror-two-label").innerText = "Select All";
        isRemoval = true;
      }

      var pi_checkbox = document.getElementsByClassName(
        "product-item-checkbox"
      );
      for (let i = 0; i < pi_checkbox.length; i++) {
        if (
          pi_checkbox[i].checked !==
          document.getElementById("mirror-one").checked
        ) {
          pi_checkbox[i].click();
        }
      }

      if (isRemoval) setProductsSelected([]);
    }, 200);
  };

  const sortItemsByPrice = () => {
    setSortPrice(sortPrice === "" || sortPrice === "desc" ? "asc" : "desc");
    setSortStock("");
  };

  const sortItemsByStock = () => {
    setSortStock(sortStock === "" || sortStock === "desc" ? "asc" : "desc");
    setSortPrice("");
  };

  const noProduct = () => {
    const contents = (
      <div className="flex flex-col items-center gap-3 mt-4">
        <div>No Available Data</div>
        <div
          className="p-2 text-center rounded-md cp text-sm w-32 bg-orangeButton"
          onClick={(e) => loadProducts(e)}
        >
          <span className="flex gap-1 items-center justify-center text-white">
            <MdOutlineRefresh />
            <span>Reload</span>
          </span>
        </div>
      </div>
    );
    return (
      <>
        <tr>
          <td colSpan={8}>{contents}</td>
        </tr>
      </>
    );
  };

  const toPage = (page) => {
    setPage(page);
    setLoading(true);
    setProductsSelected([]);
  };

  const changeEntries = (e) => {
    setEntries(e.target.value);
    setPage(1);
    setLoading(true);
    setProductsSelected([]);
  };

  const displayMirrors_toggle = (action) => {
    if (action === "ON") {
      document.getElementById("mirror-two-label").innerText = "Deselect All";

      if (document.getElementById("mirror-two").checked !== true) {
        document.getElementById("mirror-one").checked = true;
        document.getElementById("mirror-two").checked = true;
      }
    }

    if (action === "OFF") {
      document.getElementById("mirror-two-label").innerText = "Select All";

      if (document.getElementById("mirror-two").checked === true) {
        document.getElementById("mirror-one").checked = false;
        document.getElementById("mirror-two").checked = false;
      }
    }
  };

  const handleSelected = (e, productItem) => {
    var currentlySelectedProducts = [...productsSelected];

    const foundElem = currentlySelectedProducts.findIndex(
      (ele) => ele.id_product === productItem.id_product
    );
    if (foundElem >= 0) {
      var productsAfterDeselection = currentlySelectedProducts.filter(
        (ele) => ele.id_product !== productItem.id_product
      );
      setProductsSelected(productsAfterDeselection);
    } else {
      var newlySelectedProducts = [];
      newlySelectedProducts = currentlySelectedProducts;
      newlySelectedProducts.push(productItem);
      setProductsSelected(newlySelectedProducts);
    }

    setTimeout(() => {
      if (productsSelected.length === 0) {
        displayMirrors_toggle("OFF");
      } else if (productsSelected.length === products.length) {
        displayMirrors_toggle("ON");
      } else if (
        productsSelected.length !== products.length &&
        document.getElementById("mirror-one").checked
      ) {
        displayMirrors_toggle("OFF");
      }
    }, 300);
  };

  const showBrokenImage = (e) => {
    var targetParent = e.target.parentElement;
    targetParent.lastChild.classList.remove("hidden");
  };

  const renderSkeletonTable = () => {
    var fillers = [0, 1, 2];
    return (
      <>
        {fillers.map((itm, i) => (
          <tr key={i}>
            <td>
              <div className="skeleton-ui skeleton-checkbox"></div>
            </td>
            <td>
              <div className=" inline-block w-full">
                <div className=" float-left">
                  <div className="skeleton-ui skeleton-img"></div>
                </div>
                <div className=" float-left w-2/3">
                  <div className="skeleton-ui skeleton-action"></div>
                  <div className="skeleton-ui skeleton-action"></div>
                </div>
              </div>
            </td>
            <td>
              <div className="skeleton-ui skeleton-action"></div>
            </td>
            <td>
              <div className="skeleton-ui skeleton-action"></div>
            </td>
            <td>
              <div className="skeleton-ui skeleton-action"></div>
            </td>
            <td>
              <div className="skeleton-ui skeleton-action"></div>
            </td>
            <td>
              <div className="skeleton-ui skeleton-action"></div>
            </td>
            <td>
              <div className="skeleton-ui skeleton-action"></div>
            </td>
          </tr>
        ))}
      </>
    );
  };

  const loadProducts = async (e) => {
    console.log("isAvailable", isAvailable ? "y" : "n");
    var fd = new FormData();
    fd.append("page", page);
    fd.append("list_length", entries);
    if (currentTab === "add") fd.append("category_id", category.id_category);
    fd.append("search", search);
    fd.append("available", isAvailable ? "y" : "n");

    //uncomment after confirming with curb
    // if (sortPrice !== "") {
    //   fd.append("sortBy", "price");
    //   fd.append("orderBy", sortPrice);
    // }
    // if (sortStock !== "") {
    //   fd.append("sortBy", "stock");
    //   fd.append("orderBy", sortStock);
    // }

    await ApiCalls(
      fd,
      Apis.listProducts,
      "POST",
      {
        Authorization: "Bearer " + user.access,
      },
      processRes,
      e ? e.target : null
    );
  };

  const processRes = (res, api) => {
    var rdata = res.data;

    if (rdata.result === "FAIL") {
      setNotification({
        result: "warning",
        message: rdata.message,
      });
      return;
    }

    if (api === Apis.listProducts) {
      setLoading(false);
      setPages(rdata.data.pages);
      setTotal(rdata.data.total);
      setProductsSelected([]);

      if (currentTab === "add") setProducts([...rdata.data.products]);
      else {
        let prods = rdata.data.products.filter(
          (item) => item.category_id !== category.id_category
        );
        setProducts(prods);
      }
    }
  };

  const processSelectedAction = async () => {
    setIsProcessing(true);
    var fd = new FormData();
    fd.append("category_id", category.id_category);

    for (let i = 0; i < productsSelected.length; i++) {
      fd.append("product_id[]", productsSelected[i].id_product);
    }

    await ApiCalls(
      fd,
      Apis.tagProdsToCategory,
      currentTab === "add" ? "DELETE" : "POST",
      {
        Authorization: "Bearer " + user.access,
      },
      processTagResult
    );
  };

  const processTagResult = (res, api) => {
    var rdata = res.data;
    if (rdata.result === "FAIL") {
      setNotification({
        result: "warning",
        message: rdata.message,
      });
      setIsProcessing(false);
      return;
    }

    setProductsSelected([]);
    setIsProcessing(false);
    setNotification({ message: rdata.message, result: "success" });
    setTimeout(() => {
      loadProducts();
      setNotification(null);
    }, 1000);
  };

  const onChangeAvailable = (e) => {
    setIsAvailable(e.target.checked);
  };

  let notificationClass = "notification";
  let notificationIcon = null;
  if (notification !== null) {
    if (notification.result === "success")
      notificationIcon = <BsPatchCheckFill />;
    if (notification.result === "warning")
      notificationIcon = <BsFillQuestionCircleFill />;
    notificationClass += " " + notification.result;
  }

  return (
    <main className="app-merchant merchant-db">
      <div className="breadcrumbs">
        <div className="page-title flex flex-row items-center gap-[12px]">
          <button
            className=""
            onClick={() => navigate(MerchantRoutes.Categories)}
          >
            <BsChevronLeft />
          </button>
          <p className="font-bold text-lg">{category.name}</p>
        </div>

        <ul>
          <li>
            <a href={MerchantRoutes.Landing}>Home {">"}</a>
          </li>
          <li>
            <a href={MerchantRoutes.Products}>Category {">"}</a>
          </li>
          <li>
            <a href={MerchantRoutes.Products}>Add Products</a>
          </li>
        </ul>
      </div>
      <div className="mt-3 px-[65px] w-full">
        <div className="mt-5 p-[20px] bg-white">
          <div className="flex justify-between items-center w-full mb-11">
            <div className="flex gap-2">
              <input
                className="!w-[300px]"
                type="text"
                placeholder="Search products"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div
                className="site-btn btn-default"
                onClick={(_) => {
                  if (page !== 1) setPage(1);
                  else loadProducts();
                }}
              >
                <span className="button__text">Search</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <input
                id="available"
                name="available"
                type="checkbox"
                className="align-middle"
                value={isAvailable}
                onChange={onChangeAvailable}
              />
              <label
                for="available"
                className="text-sm text-[#828282] whitespace-nowrap"
              >
                Show available products only
              </label>
            </div>
          </div>

          <ul className="tabs my-4 flex gap-6">
            <li
              onClick={(e) => updateTab("add")}
              className={currentTab === "add" ? "text-orangeButton cp" : "cp"}
            >
              Added Products
            </li>
            <li
              onClick={(e) => updateTab("remove")}
              className={
                currentTab === "remove" ? "text-orangeButton cp" : "cp"
              }
            >
              Products To Add
            </li>
          </ul>
          <div className="border"></div>

          <div className=" listing-page !p-0">
            {notification !== null && (
              <>
                <div
                  className={notificationClass}
                  onClick={(e) => setNotification(null)}
                >
                  {notificationIcon}
                  {notification.message}
                </div>
              </>
            )}
            <Pagination
              entries={entries}
              changeEntries={changeEntries}
              toPage={toPage}
              perPage={perPage}
              pages={pages}
              page={page}
              total={total}
            />

            <div className="scrollable-table ">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#fff2e3] h-12">
                    <td width="5%">
                      <div
                        className="custom-checkbox"
                        onClick={(e) =>
                          checkbox_mirror_action(e, "div_mirror_one")
                        }
                      >
                        <input id="mirror-one" type="checkbox" />
                        <span className="checkmark"></span>
                      </div>
                    </td>
                    <td width="40%">Products</td>
                    <td width="25%">SKU</td>
                    <td width="15%" className="cp" onClick={sortItemsByPrice}>
                      <div className="flex gap-1 items-center justify-center">
                        Price
                        {sortPrice === "" ? (
                          <FaSort />
                        ) : (
                          <>
                            {sortPrice === "asc" ? (
                              <FaSortUp />
                            ) : (
                              <FaSortDown />
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td width="15%" className="cp" onClick={sortItemsByStock}>
                      <div className="flex gap-1 items-center justify-center">
                        Stock{" "}
                        {sortStock === "" ? (
                          <FaSort />
                        ) : (
                          <>
                            {sortStock === "asc" ? (
                              <FaSortUp />
                            ) : (
                              <FaSortDown />
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <>{renderSkeletonTable()}</>
                  ) : (
                    <>
                      {products !== null && products.length > 0 ? (
                        <>
                          {products.map((item, i) => {
                            let sku = "";
                            item.variation_list.forEach((e) => {
                              if (e.sku) sku += e.sku + ",";
                            });
                            sku = sku.substring(0, sku.length - 1);
                            return (
                              <tr key={item.id_product} className="h-16">
                                <td>
                                  <div
                                    className="custom-checkbox"
                                    onClick={(e) => handleSelected(e, item)}
                                  >
                                    <input
                                      id={"select-" + i}
                                      type="checkbox"
                                      className="product-item-checkbox"
                                    />
                                    <span className="checkmark"></span>
                                  </div>
                                </td>
                                <td>
                                  <div className="col-product">
                                    <div className="img">
                                      {item.cover_image !== null ? (
                                        <>
                                          <img
                                            src={item?.cover_image?.list_img}
                                            alt=""
                                            loading="lazy"
                                            onError={(e) => showBrokenImage(e)}
                                          />
                                        </>
                                      ) : (
                                        <>
                                          {" "}
                                          <MdImage />
                                        </>
                                      )}

                                      <MdOutlineBrokenImage className="hidden broken-img" />
                                    </div>
                                    <div className="name">{item.name}</div>
                                  </div>
                                </td>
                                <td>{sku}</td>
                                <td className="text-center">{item.price}</td>
                                <td className="text-center">{item.stock}</td>
                              </tr>
                            );
                          })}
                        </>
                      ) : (
                        <>{noProduct()}</>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            <table>
              <tfoot className="margins-footer">
                <tr className="margins-footer">
                  <td width="5%">
                    <div
                      className="custom-checkbox"
                      onClick={(e) =>
                        checkbox_mirror_action(e, "div_mirror_two")
                      }
                    >
                      <input id="mirror-two" type="checkbox" />
                      <span className="checkmark"></span>
                    </div>
                  </td>

                  <td width="15%">
                    <div id="mirror-two-label"> Select All </div>
                  </td>

                  <td width="28%">&nbsp;</td>

                  <td width="20%">
                    {productsSelected.length}
                    {productsSelected.length === 1
                      ? " product selected"
                      : " products selected"}
                  </td>

                  <td width="16%">&nbsp;</td>
                  <td width="32%">
                    {currentTab === "add" ? (
                      <div
                        className="site-btn btn-default px-2 mx-2"
                        id="btn_madd_remove"
                        onClick={(e) => processSelectedAction(e)}
                      >
                        {isProcessing && currentTab === "add" ? (
                          <Loader />
                        ) : (
                          <span className="button__text">Remove</span>
                        )}
                      </div>
                    ) : (
                      <div
                        className="site-btn btn-default mx-2"
                        id="btn_mass_add"
                        onClick={(e) => processSelectedAction(e)}
                      >
                        {isProcessing && currentTab === "remove" ? (
                          <Loader />
                        ) : (
                          <span className="button__text">Add</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td>&nbsp;</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AddProdToCategory;

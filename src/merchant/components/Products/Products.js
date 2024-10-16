import React from "react";
import ls from "local-storage";
//import srv from 'simple-react-validator';
import { Constants } from "../../utils/Constants.js";
import { MerchantRoutes, CustomerRoutes } from "../../../Routes.js";
import { ApiCalls, Apis } from "../../utils/ApiCalls.js";
import withRouter, { isBtnLoading, numberAbbr } from "../../../Utils.js";
import { toast } from "react-toastify";
import axios from "axios";
import { baseUrl } from "../../../apiUrls";
import InfiniteScroll from "react-infinite-scroll-component";

//ui components
import Navbar from "../../components/Navbar.js";
import PopupMessage from "../../components/PopupMessage.js";
import { Sidebar } from "../../components/Parts.js";

//icons
import { TbError404 } from "react-icons/tb";
import {
  MdOutlineGridView,
  MdFormatListBulleted,
  MdDeleteForever,
  MdOutlineRefresh,
  MdImage,
  MdOutlineBrokenImage,
} from "react-icons/md";
import {
  BsHeart,
  BsEye,
  BsFillPencilFill,
  BsThreeDotsVertical,
  BsPlusCircle,
  BsThreeDots, 

  //notification icons
  BsPatchCheckFill,
  BsFillQuestionCircleFill,
} from "react-icons/bs";

import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { loginRequired } from "../../utils/Helper.js";
import { ProductAddEligibilityPopup } from "../../utils/ProductAddEligibilityPopup.js";
import BulkUploadPopup from "./bulkUploadPopup.js";
import BulkUpdatePopup from "./bulkUpdatePopup.js";
import { Modal } from "../../../customer/components/GenericComponents.js";

/*
Pointers
-section below tabs missing > upload product process, batch tools, add new product
-checkbox function
-more button > Duplicate, Live Preview, Start Ads
*/
class Products extends React.Component {
  constructor(props) {
    super(props);
    loginRequired(props.page);
    document.title = "Merchant | uShop";

    this.user = ls(Constants.localStorage.user);
    if (this.user) this.user = JSON.parse(this.user);

    //list vars
    var page = ls("page");
    var entries = ls("entries");
    var tableView = ls("tableView");

    //list filters
    this.filters = {
      page: "product-list",
      id_category: null,
      category_name: "",
      product_name: "",
      sku: "",
      tab: "",
      sortVariation: "",
      sortStock: "",
      sortSales: "",
    };

    if (ls("soldout-page") === "dashboard") {
      this.filters.tab = "soldout";
      ls.remove("soldout-page");
    } else {
      var lf = ls("list-filters");
      if (lf && lf.page === "product-list") this.filters = lf;
      if (lf && lf.page !== "product-list") ls.remove("list-filters");
    }

    this.state = {
      tableView: tableView ? tableView : "list",
      loading: true,
      page: page ? page : 1,
      entries: entries ? entries : 10,
      pages: 1,
      total: 0,

      totalAll: 0,
      totalSoldOut: 0,
      totalDelisted: 0,
      totalDraft: 0,
      totalLive: 0,
      totalViolation: 0,

      perPage: 10,
      products: [],
      category: [],
      notification: null,
      productsSelected: [],
      isMassActionLoading: false,
      massActionPromises: [],

      showMoreSKU: [],
      showMoreVariations: [],
      skuCount: [],
      variationCount: [],
      showPrompt: false,

      showBulkUploadPopup: false,
      isSubmittingBulkUpload: false,
      showBulkUpdatePopup: false,
      isSubmittingBulkUpdate: false,

      isShowDeletePopup : false,
      prodToDelete: null,
      isDeleting: false
    };
  }

  async componentDidMount() {
    //await this.loadCategory();
    await this.loadTabTotals();
    await this.loadProducts();

    //set filters
    if (this.filters.id_category !== null) {
      document.getElementById("category_id").value = this.filters.id_category;
    }
    if (this.filters.product_name !== "") {
      document.getElementById("product_name").value = this.filters.product_name;
    }
    if (this.filters.sku !== "") {
      document.getElementById("sku").value = this.filters.sku;
    }
  }

  //loadCategory = async (e) => {
  //    await ApiCalls(null, Apis.listCategory, 'POST', {
  //        "Authorization": "Bearer " + this.user.access,
  //    }, this.processRes, (e) ? e.target : null);
  //}

  loadTabTotals = async (e) => {
    if (e && isBtnLoading(e.target)) {
      return;
    }
    await ApiCalls(
      null,
      Apis.tabTotals,
      "GET",
      {
        Authorization: "Bearer " + this.user.access,
      },
      this.processRes,
      e ? e.target : null
    );
  };

  loadProducts = async (e) => {
    if (e && isBtnLoading(e.target)) {
      return;
    }

    var fd = new FormData();
    fd.append("page", this.state.page);
    fd.append("list_length", this.state.entries);
    if (this.filters.id_category !== null) {
      fd.append("category_id", this.filters.id_category);
      fd.append("category_name", this.filters.category_name);
    }
    if (this.filters.product_name !== "")
      fd.append("product_name", this.filters.product_name);
    if (this.filters.sku !== "") fd.append("sku", this.filters.sku);
    if (this.filters.tab !== "") fd.append("tab", this.filters.tab);
    if (this.filters.sortVariation !== "") {
      fd.append("sortBy", "variation");
      fd.append("orderBy", this.filters.sortVariation);
    }
    if (this.filters.sortSales !== "") {
      fd.append("sortBy", "sales");
      fd.append("orderBy", this.filters.sortVariation);
    }
    if (this.filters.sortStock !== "") {
      fd.append("sortBy", "stock");
      fd.append("orderBy", this.filters.sortStock);
    }

    await ApiCalls(
      fd,
      Apis.listProducts,
      "POST",
      {
        Authorization: "Bearer " + this.user.access,
      },
      this.processRes,
      e ? e.target : null
    );
  };

  loadTab = (whichTab) => {
    this.filters.tab = whichTab;
    this.toPage(1);
  };

  processRes = async(res, api, isRefreshed) => {
    if (isRefreshed) {
      console.log("refreshed");
      this.forceUpdate();
      return;
    }

    var rdata = res.data;
    // console.log("api: ", api);
    // console.log(rdata);
    if (api === Apis.productBulkUpload) {
      this.setState({
        isSubmittingBulkUpload: false,
        showBulkUploadPopup: false,
      });
    }
    if (api === Apis.productBulkUpdate) {
      this.setState({
        isSubmittingBulkUpdate: false,
        showBulkUpdatePopup: false,
      });
    }

    if(api === Apis.productBatchUpdate){
      this.setState({
        isMassActionLoading: false,
      });
    }

    if (rdata.result === "FAIL") {
      //this.props.setError("Error found: " + rdata.message, 2);
      this.setState({
        notification: {
          message: "Error found: " + rdata.message,
          result: "danger",
        },
      });
      this.setState({
        notification: {
          result: "warning",
          message: rdata.message,
        },
      });     
      return;
    }

    //if (api === Apis.listCategory) {
    if (api === Apis.searchCategory) {
      if (rdata.data.length > 0)
        this.setState({
          category: rdata.data,
        });
    }

    if (api === Apis.listProducts) {
      ls("list-filters", this.filters);
      let showSku = [],
        showVariation = [],
        skus = [],
        variations = [];
      rdata.data.products.forEach((elem) => {
        showSku.push(false);
        showVariation.push(false);
        skus.push(3);
        variations.push(3);
      });

      // let rdata = res.data.data;
      let newData = [];
      if (!Array.isArray(rdata)) {
        if (this.state.page !== 1)
          newData = [...this.state.products, ...rdata.data.products];
        else newData = [...rdata.data.products];
      }

      setTimeout(() => {
        this.setState({
          loading: false,
          pages: rdata.data.pages,
          total: rdata.data.total,
          products: newData,
          productsSelected: [],
          showMoreSKU: showSku,
          showMoreVariations: showVariation,
          variationCount: variations,
          skuCount: skus,
        });
      }, 400);
    }

    if (api === Apis.tabTotals) {
      this.setState({
        totalAll: rdata.data.all,
        totalDraft: rdata.data.drafts,
        totalLive: rdata.data.live,
        totalDelisted: rdata.data.delisted,
        totalViolation: rdata.data.violation,
        totalSoldOut: rdata.data.soldout,
      });
    }

    if (api === Apis.deleteProduct) {
      this.setState(
        {
          notification: { message: rdata.message, result: "success" },
          isShowDeletePopup: false,
          isDeleting: false,
          page: 1,
        },
        async () => {
          await this.loadProducts();
          await this.loadTabTotals();
        }
      );
    }

    if (api.indexOf(Apis.updateProductStatus) > -1) {
      this.setState(
        {
          notification: {
            message: "Product status is updated.",
            result: "success",
          },
        },
        async () => {
          await this.loadProducts();
          await this.loadTabTotals();
        }
      );
    }

    if (api === Apis.duplicateProduct) {
      let duplicatedProd = res.data.data?.product_detail;
      this.editProduct(duplicatedProd);
    }

    if (api === Apis.productBulkUpload || api === Apis.productBulkUpdate) {
      this.setState(
        {
          notification: {
            message: rdata.message,
            result: "success",
          },
        },
        async () => {
          await this.loadProducts();
          await this.loadTabTotals();
        }
      );

      if (res.data.data?.file_url) {
        var pom = document.createElement("a");
        pom.href = res.data.data?.file_url;
        pom.click();
      }
    }

    if(api === Apis.productBatchUpdate){
      toast.success(rdata.message)
          this.toPage(1)
          await this.loadTabTotals();
          this.displayMirrors_toggle("OFF");
          this.checkbox_mirror_action(null, "div_mirror_one");
      }
  };

  showBrokenImage = (e) => {
    var targetParent = e.target.parentElement;
    targetParent.lastChild.classList.remove("hidden");
  };

  //table
  toPage = (page) => {
    ls("page", page);
    this.setState(
      {
        page: page,
        loading: true,
        productsSelected: [],
      },
      () => {
        this.loadProducts();
      }
    );
  };

  changeEntries = (e) => {
    ls("entries", e.target.value);
    ls("page", 1);
    this.setState(
      {
        entries: e.target.value,
        page: 1,
        loading: true,
        productsSelected: [],
      },
      () => {
        this.loadProducts();
      }
    );
  };

  setProductFilter = (e, field) => {
    let val = e.target.value;
    //if (field === 'category_id') this.filters.id_category = val;
    if (field === "product_name") this.filters.product_name = val;
    if (field === "sku") this.filters.sku = val;
  };

  clearFilters = () => {
    this.filters.id_category = null;
    this.filters.product_name = "";
    this.filters.sku = "";
    this.filters.category_name = "";

    document.getElementById("category_id").value = "";
    document.getElementById("product_name").value = "";
    document.getElementById("sku").value = "";

    this.toPage(1);
  };

  sortItemsBy = (val) => {
    if (val === "variation") {
      this.filters.sortVariation =
        this.filters.sortVariation === "" ||
        this.filters.sortVariation === "desc"
          ? "asc"
          : "desc";
      this.filters.sortSales = "";
      this.filters.sortStock = "";
    }

    if (val === "stock") {
      this.filters.sortStock =
        this.filters.sortStock === "" || this.filters.sortStock === "desc"
          ? "asc"
          : "desc";
      this.filters.sortSales = "";
      this.filters.sortVariation = "";
    }

    if (val === "sales") {
      this.filters.sortSales =
        this.filters.sortSales === "" || this.filters.sortSales === "desc"
          ? "asc"
          : "desc";
      this.filters.sortVariation = "";
      this.filters.sortStock = "";
    }
    ls("list-filters", this.filters);
    this.setState({ loading: true }, () => {
      this.toPage(0);
    });
  };

  isStatus = (status, whichStatus) => {
    let res = false;
    let statuses = ls("settings");
    if (statuses) statuses = JSON.parse(statuses).general_statuses;
    if (statuses && statuses.length > 0) {
      statuses.forEach((el) => {
        if (el.id === status && el.name.toLowerCase().indexOf(whichStatus) > -1)
          res = true;
      });
    }
    return res;
  };

  editProduct = (item) => {
    if (isNaN(item.id_product)) {
      this.props.setError(
        "Invalid product. Please check with an admin for more info."
      );
      return;
    }
    let updateurl = MerchantRoutes.EditProduct.replace(
      ":idProduct",
      item.id_product
    );
    this.props.navigate(updateurl);
  };

  updateStatus = async (item, toStatus) => {
    let statuses = ls("settings");
    if (statuses) statuses = JSON.parse(statuses).general_statuses;
    if (statuses.length > 0) {
      statuses.forEach((el) => {
        if (el.name.toLowerCase().indexOf(toStatus) > -1) toStatus = el.id;
      });
    }

    if (isNaN(toStatus)) {
      this.setState({
        notification: {
          message: "Unable to proceed with the action. Please try again.",
          result: "warning",
        },
      });
      return;
    }

    var fd = new FormData();
    fd.append("status_id", toStatus);
    await ApiCalls(
      fd,
      Apis.updateProductStatus + item.id_product + "/",
      "POST",
      {
        Authorization: "Bearer " + this.user.access,
      },
      this.processRes,
      null
    );
  };

  deleteProduct = async (item, e) => {
    this.setState({isDeleting: true})
    var fd = new FormData();
    fd.append("id_product", item.id_product);
    await ApiCalls(
      fd,
      Apis.deleteProduct,
      "POST",
      {
        Authorization: "Bearer " + this.user.access,
      },
      this.processRes,
      e ? e.target : null
    );
  };

  getStatus = (toStatus) => {
    let statuses = ls("settings");
    if (statuses) statuses = JSON.parse(statuses).general_statuses;
    if (statuses.length > 0) {
      statuses.forEach((el) => {
        if (el.name.toLowerCase().indexOf(toStatus) > -1) toStatus = el.id;
      });
    }

    if (isNaN(toStatus)) {
      this.setState({
        notification: {
          message: "Unable to proceed with the action. Please try again.",
          result: "warning",
        },
      });
      return null;
    }
    return toStatus;
  };

  massStatusUpdate = async(e, status) => {
    this.setState({isMassActionLoading: true})
    let toStatus = this.getStatus(status);
    var fd = new FormData();

    for (let i = 0; i < this.state.productsSelected.length; i++) {
      fd.append("product_id[]", this.state.productsSelected[i].id_product);
    }

    if( status !== "delete") fd.append("status_id", toStatus)
    
    await ApiCalls(
      fd,
      Apis.productBatchUpdate,
      status === "delete" ? "DELETE" : "POST",
      {
        Authorization: "Bearer " + this.user.access,
      },
      this.processRes,
      e ? e.target : null
    );
  };

  setShowMoreSKU = (index) => {
    let showSku = [...this.state.showMoreSKU];
    showSku[index] = !showSku[index];

    let skus = [...this.state.skuCount];
    if (skus[index] === 3)
      skus[index] = this.state.products[index].variation_list.length;
    else skus[index] = 3;

    this.setState({ showMoreSKU: showSku, skuCount: skus });
  };

  setShowMoreVariations = (index) => {
    let showVariations = [...this.state.showMoreVariations];
    showVariations[index] = !showVariations[index];

    let variations = [...this.state.variationCount];
    if (variations[index] === 3)
      variations[index] = this.state.products[index].variation_list.length;
    else variations[index] = 3;

    this.setState({
      showMoreVariations: showVariations,
      variationCount: variations,
    });
  };

  createDuplicate = async (prodId) => {
    var fd = new FormData();
    fd.append("id_product", prodId);
    await ApiCalls(
      fd,
      Apis.duplicateProduct,
      "POST",
      {
        Authorization: "Bearer " + this.user.access,
      },
      this.processRes
    );
  };

  callAddProduct = () => {
    let profile_status = ls("merchant_setup");
    if (profile_status === "Y") {
      this.props.navigate(MerchantRoutes.AddProduct);
    } else {
      this.setState({ showPrompt: true });
    }
  };

  showBulkUpload = () => {
    this.setState({ showBulkUploadPopup: true });
  };

  onSubmitBulkUpload = async (file) => {
    this.setState({ isSubmittingBulkUpload: true });
    var fd = new FormData();
    fd.append("product_file", file);
    await ApiCalls(
      fd,
      Apis.productBulkUpload,
      "POST",
      {
        Authorization: "Bearer " + this.user.access,
      },
      this.processRes
    );
  };

  fetchMoreData = () => {
    if (this.state.products.length < this.state.total) {
      let currentPage = this.state.page + 1;
      this.setState({ page: currentPage, loading: true }, () => {
        this.loadProducts();
      });
    }
  };

  showBulkUpdate = () => {
    this.setState({ showBulkUpdatePopup: true });
  };

  onSubmitBulkUpdate = async (file) => {
    this.setState({ isSubmittingBulkUpdate: true });
    var fd = new FormData();
    fd.append("product_file", file);
    await ApiCalls(
      fd,
      Apis.productBulkUpdate,
      "POST",
      {
        Authorization: "Bearer " + this.user.access,
      },
      this.processRes
    );
  };

  renderDeletePopup = () => {
    return (
      <Modal
        width={"w-5/12"}
        open={this.state.isShowDeletePopup}
        children={
          <div>
            <p className="text-lg font-semibold mb-3">Delete Product</p>
            <hr />
            <p className="text-sm my-4 pr-7 mb-4">
              Are you sure to delete this product ?
            </p>
            <div className="flex justify-end mt-10">
              <button
                className="cp text-center rounded-md bg-[#f5ab35] text-white h-8 w-20 mr-5 disabled:opacity-50  disabled:cursor-default"
                disabled={this.state.isDeleting}
                onClick={()=>this.deleteProduct(this.state.prodToDelete)}
              >
                Yes
              </button>
              <button
                className="cp text-center rounded-md border-[#f5ab35] border-2 bg-white text-[#f5ab35] h-8 w-20 disabled:opacity-50  disabled:cursor-default"
                onClick={()=>{this.setState({isShowDeletePopup : false})}}
                disabled={this.state.isDeleting}
              >
                No
              </button>
            </div>
          </div>
        }
      />
    );
  };

  renderProducts = () => {
    return (
      <>
        {this.state.tableView === "list" ? (
          <>
            {this.state.products.map((item, i) => (
              <tr key={item.id_product}>
                <td>
                  <div
                    className="custom-checkbox"
                    onClick={(e) => this.handleSelected(e, item)}
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
                    <div className="flex gap-10">
                      <div className="img">
                        {item.cover_image !== null ? (
                          <>
                            <img
                              src={item.cover_image.list_img}
                              alt=""
                              loading="lazy"
                              onError={(e) => this.showBrokenImage(e)}
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
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1">
                          <BsHeart /> {numberAbbr(item.count_wish)}
                        </span>
                        <span className="flex items-center gap-1">
                          <BsEye /> {numberAbbr(item.count_view)}
                        </span>
                      </div>
                    </div>
                    <div className="desc !ml-0">
                      <div
                        className="name"
                        onClick={(e) => this.editProduct(item)}
                      >
                        {item.name}
                      </div>
                      <div className="!text-sm !font-semibold">
                        {this.filters.tab === "" &&
                          item.status === 9 &&
                          "Status: Delisted"}
                        {this.filters.tab === "" &&
                          item.status === 6 &&
                          "Status: Draft"}
                      </div>
                      {/* <div>Parent SKU: {item.parent_sku}</div> */}
                    </div>
                  </div>
                </td>
                <td>{item.category_name}</td>
                <td>
                  {item.variation_list.length > 0 ? (
                    <>
                      {item.variation_list
                        .slice(0, this.state.skuCount[i])
                        .map((variation, v) => (
                          <div key={v} className="mb-1">
                            {variation.sku}
                          </div>
                        ))}
                      {item.variation_list.filter((item) => item.sku !== null)
                        .length > 3 && (
                        <p
                          className="text-orangeButton text-xs underline cp"
                          onClick={() => this.setShowMoreSKU(i)}
                        >
                          {this.state.showMoreSKU[i] ? "-less" : "+more"}
                        </p>
                      )}
                    </>
                  ) : (
                    <>N.A.</>
                  )}
                </td>
                <td>
                  {item.variation_list.length > 0 ? (
                    <>
                      {item.variation_list
                        .slice(0, this.state.variationCount[i])
                        .map((variation, v) => (
                          <div key={v} className="mb-1">
                            {variation.variation_value}
                          </div>
                        ))}
                      {item.variation_list.filter(
                        (item) => item.variation_value !== null
                      ).length > 3 && (
                        <p
                          className="text-orangeButton text-xs underline cp"
                          onClick={() => this.setShowMoreVariations(i)}
                        >
                          {this.state.showMoreVariations[i] ? "-less" : "+more"}
                        </p>
                      )}
                    </>
                  ) : (
                    <>N.A.</>
                  )}
                </td>
                <td>{item.stock}</td>
                <td>{item.sales}</td>
                <td>
                  <button
                    className="actions"
                    type="button"
                    title="Edit"
                    onClick={(e) => this.editProduct(item)}
                  >
                    <BsFillPencilFill />
                  </button>

                  <button
                    className="actions danger"
                    type="button"
                    title="Delete"
                    onClick={(e) => {
                      // if (
                      //   window.confirm(
                      //     "Are you sure you want to delete this product?"
                      //   )
                      // ) {
                      //   this.deleteProduct(item, e);
                      // }
                      this.setState({isShowDeletePopup: true, prodToDelete: item})
                    }}
                  >
                    <MdDeleteForever />
                  </button>

                  <div
                    className="actions more"
                    type="button"
                    title="More Action"
                  >
                    <BsThreeDotsVertical />

                    <ul className="more-actions">
                      {/*draft status actions*/}
                      {this.isStatus(item.status, "draft") && (
                        <>
                          <li>
                            <button
                              type="button"
                              onClick={(e) => {
                                if (
                                  window.confirm(
                                    "Are you sure you want to publish this product?"
                                  )
                                ) {
                                  this.updateStatus(item, "active");
                                }
                              }}
                            >
                              Publish
                            </button>
                            <div></div>
                          </li>
                        </>
                      )}
                      {this.isStatus(item.status, "active") && (
                        <>
                          <li>
                            <button
                              type="button"
                              onClick={() => {
                                localStorage.setItem(
                                  "productID",
                                  item.id_product
                                );
                                window.open(CustomerRoutes.Preview, "_blank");
                              }}
                            >
                              Live Preview
                            </button>
                            <div></div>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={() =>
                                this.createDuplicate(item.id_product)
                              }
                            >
                              Duplicate
                            </button>
                            <div></div>
                          </li>
                          <li>
                            <button
                              type="button"
                              onClick={(e) => {
                                if (
                                  window.confirm(
                                    "Are you sure you want to delist this product?"
                                  )
                                ) {
                                  this.updateStatus(item, "delist");
                                }
                              }}
                            >
                              Delist
                            </button>
                            <div></div>
                          </li>
                          {/* <li>
                                        <button type='button'>Start Ads</button>
                                        <div></div>
                                    </li> */}
                        </>
                      )}

                      {/* delist status actions */}
                      {this.isStatus(item.status, "delisted") && (
                        <li>
                          <button
                            type="button"
                            onClick={(e) => {
                              if (
                                window.confirm(
                                  "Are you sure you want to publish this product?"
                                )
                              ) {
                                this.updateStatus(item, "active");
                              }
                            }}
                          >
                            Publish
                          </button>
                          <div></div>
                        </li>
                      )}
                    </ul>
                  </div>
                </td>
              </tr>
            ))}
          </>
        ) : (
          <>
            {this.state.products.map((item, i) => (
              <div className="grid-item" key={item.id_product}>
                <div className="img">
                  {item.cover_image !== null ? (
                    <>
                      <img
                        src={item.cover_image.list_img}
                        alt=""
                        loading="lazy"
                        onError={(e) => this.showBrokenImage(e)}
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
                <div className="content">
                  <div
                    className="title"
                    onClick={(e) => this.editProduct(item)}
                  >
                    {item.name === null || item.name === ""
                      ? "N.A."
                      : item.name}
                  </div>
                  <div className="price_stock">
                    <span title={"$" + item.price}>${item.price}</span>
                    <span>Stock {item.stock}</span>
                  </div>
                  <div className="view_sales">
                    <div>
                      <span>
                        <BsHeart /> {numberAbbr(item.count_wish)}
                      </span>
                      <span>
                        <BsEye /> {numberAbbr(item.count_view)}
                      </span>
                    </div>
                    <div>Sales {numberAbbr(item.sales)}</div>
                  </div>
                  <div className="border skeleton"></div>

                  <div className="buttons">
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        className="actions"
                        type="button"
                        title="Edit"
                        onClick={(e) => this.editProduct(item)}
                      >
                        <BsFillPencilFill />
                      </div>

                      <div className="actions" type="button">
                        <BsThreeDots />

                        <ul className="more-actions">
                          {/*draft status actions*/}
                          {this.isStatus(item.status, "draft") && (
                            <>
                              <li>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    if (
                                      window.confirm(
                                        "Are you sure you want to publish this product?"
                                      )
                                    ) {
                                      this.updateStatus(item, "active");
                                    }
                                  }}
                                >
                                  Publish
                                </button>
                                <div></div>
                              </li>
                            </>
                          )}

                          {this.isStatus(item.status, "active") && (
                            <>
                              <li>
                                <button
                                  type="button"
                                  onClick={() => {
                                    //save to localstorage
                                    localStorage.setItem(
                                      "preview_slug",
                                      item.slug
                                    );
                                    window.open(
                                      CustomerRoutes.Preview,
                                      "_blank"
                                    );
                                  }}
                                >
                                  Live Preview
                                </button>
                                <div></div>
                              </li>
                              <li>
                                <button
                                  type="button"
                                  onClick={() =>
                                    this.createDuplicate(item.id_product)
                                  }
                                >
                                  Duplicate
                                </button>
                                <div></div>
                              </li>
                              <li>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    if (
                                      window.confirm(
                                        "Are you sure you want to delist this product?"
                                      )
                                    ) {
                                      this.updateStatus(item, "delist");
                                    }
                                  }}
                                >
                                  Delist
                                </button>
                                <div></div>
                              </li>
                              {/* <li>
                                <button type="button">Start Ads</button>
                                <div></div>
                              </li> */}
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                    <div className="separator"></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </>
    );
  };

  noProduct = () => {
    const contents = (
      <div className="no-data col-span-5">
        <div>No Available Data</div>
        <div>
          <div className="btn site-btn" onClick={(e) => this.loadProducts(e)}>
            <span className="button__text">
              <MdOutlineRefresh />
              <span>Reload</span>
            </span>
          </div>
        </div>
      </div>
    );
    return (
      <>
        {this.state.tableView === "list" ? (
          <>
            <tr>
              <td colSpan={8}>{contents}</td>
            </tr>
          </>
        ) : (
          <>{contents}</>
        )}
      </>
    );
  };

  renderSkeletonTable = () => {
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

  renderSkeletonGrid = () => {
    var fillers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    return (
      <>
        {fillers.map((item, i) => (
          <div className="grid-item" key={i}>
            <div className="img">
              <MdImage />
            </div>
            <div className="content">
              <div className="skeleton-ui skeleton-title"></div>
              <div className="skeleton-ui skeleton-full"></div>
              <div className="skeleton-ui skeleton-full"></div>
            </div>
          </div>
        ))}
      </>
    );
  };

  switchView = (e) => {
    setTimeout(() => {
      this.setState(
        {
          tableView: this.state.tableView === "list" ? "grid" : "list",
        },
        () => {
          ls("tableView", this.state.tableView);
        }
      );
    }, 400);
  };

  closeNotification = (e) => {
    this.setState({ notification: null });
  };

  searchCategory = async (e) => {
    let searched = e.target.value;
    console.log("searching for: ", searched);
    if (searched.length < 3) return;

    //call api
    var fd = new FormData();
    fd.append("category_name", searched);
    await ApiCalls(
      fd,
      Apis.searchCategory,
      "POST",
      {
        Authorization: "Bearer " + this.user.access,
      },
      this.processRes,
      e ? e.target : null
    );
  };

  selectCategory = (cat) => {
    this.filters.id_category = cat.id_category;
    this.filters.category_name = cat.name;
    document.getElementById("category_id").value = cat.name;
    //then clear cats
    this.setState({ category: [] });
  };

  checkbox_mirror_action = (e, id) => {
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

      if (isRemoval) this.setState({ productsSelected: [] });
    }, 200);
  };

  displayMirrors_toggle = (action) => {
    if (action === "ON") {
      document.getElementById("mirror-two-label").innerText = "Deselect All";

      if (document.getElementById("mirror-two").checked !== true) {
        document.getElementById("mirror-one").checked = true;
        document.getElementById("mirror-two").checked = true;
      }
    }

    if (action === "OFF") {
      if(document.getElementById("mirror-two-label")){
      document.getElementById("mirror-two-label").innerText = "Select All";

      if (document.getElementById("mirror-two").checked === true) {
        document.getElementById("mirror-one").checked = false;
        document.getElementById("mirror-two").checked = false;
      }
    }
    }
  };

  handleSelected = (e, productItem) => {
    var currentlySelectedProducts = [];
    currentlySelectedProducts = this.state.productsSelected;

    const foundElem = currentlySelectedProducts.findIndex(
      (ele) => ele.id_product === productItem.id_product
    );
    if (foundElem >= 0) {
      var productsAfterDeselection = currentlySelectedProducts.filter(
        (ele) => ele.id_product !== productItem.id_product
      );
      this.setState({ productsSelected: productsAfterDeselection });
    } else {
      var newlySelectedProducts = [];
      newlySelectedProducts = currentlySelectedProducts;
      newlySelectedProducts.push(productItem);
      this.setState({ productsSelected: newlySelectedProducts });
    }

    setTimeout(() => {
      if (this.state.productsSelected.length === 0) {
        this.displayMirrors_toggle("OFF");
      } else if (
        this.state.productsSelected.length === this.state.products.length
      ) {
        this.displayMirrors_toggle("ON");
      } else if (
        this.state.productsSelected.length !== this.state.products.length &&
        document.getElementById("mirror-one").checked
      ) {
        this.displayMirrors_toggle("OFF");
      }
    }, 300);
  };

  body = () => {
    let notificationClass = "notification";
    let notificationIcon = null;
    if (this.state.notification !== null) {
      if (this.state.notification.result === "success")
        notificationIcon = <BsPatchCheckFill />;
      if (this.state.notification.result === "warning")
        notificationIcon = <BsFillQuestionCircleFill />;
      notificationClass += " " + this.state.notification.result;
    }

    return (
      <>
        <div className="listing-page my-5">
          <div
            id="filters"
            className="grid lg:grid-cols-5 md:grid-cols-3 gap-4 mb-5"
          >
            <div className="search_cat">
              {/*
        <select onChange={e => this.setProductFilter(e, 'category_id')} id='category_id'>
            <option value=''>Category</option>
            {this.state.category.length > 0 && <>
                {this.state.category.map((item, idx) => <option key={idx} value={item.id_category}>
                    {item.name}</option>
                )}
            </>}
        </select>
        */}
              <input
                type={"text"}
                id="category_id"
                placeholder="Category"
                onChange={(e) => this.searchCategory(e)}
              />
              {this.state.category.length > 0 ? (
                <>
                  <ul>
                    {this.state.category.map((ctm, c) => (
                      <li key={c} onClick={(e) => this.selectCategory(ctm)}>
                        {ctm.name}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>

            <div className="">
              <input
                type={"text"}
                id="product_name"
                placeholder="Product Name"
                onChange={(e) => this.setProductFilter(e, "product_name")}
              />
            </div>

            <div className="">
              <input
                type={"text"}
                id="sku"
                placeholder="SKU"
                onChange={(e) => this.setProductFilter(e, "sku")}
              />
            </div>

            <div className="">
              <div
                className="site-btn btn-default"
                onClick={(e) => this.toPage(1)}
              >
                <span className="button__text">Search</span>
              </div>
            </div>
            <div className="">
              <div
                className="site-btn btn-border-primary"
                onClick={(e) => this.clearFilters()}
              >
                <span className="button__text">Reset</span>
              </div>
            </div>
          </div>

          <div className="body">
            <ul className="tabs mb-4">
              <li
                onClick={(e) => this.loadTab("")}
                className={this.filters.tab === "" ? "active" : ""}
              >
                All
                <span className="count"> ({this.state.totalAll})</span>
                <div className="border"></div>
              </li>
              <li
                onClick={(e) => this.loadTab("live")}
                className={this.filters.tab === "live" ? "active" : ""}
              >
                Live <span className="count"> ({this.state.totalLive})</span>
                <div className="border"></div>
              </li>
              <li
                onClick={(e) => this.loadTab("soldout")}
                className={this.filters.tab === "soldout" ? "active" : ""}
              >
                Sold Out{" "}
                <span className="count">({this.state.totalSoldOut})</span>
                <div className="border"></div>
              </li>
              <li
                onClick={(e) => this.loadTab("violation")}
                className={this.filters.tab === "violation" ? "active" : ""}
              >
                Violation{" "}
                <span className="count">({this.state.totalViolation})</span>
                <div className="border"></div>
              </li>
              <li
                onClick={(e) => this.loadTab("draft")}
                className={this.filters.tab === "draft" ? "active" : ""}
              >
                Draft <span className="count">({this.state.totalDraft})</span>
                <div className="border"></div>
              </li>
              <li
                onClick={(e) => this.loadTab("delisted")}
                className={this.filters.tab === "delisted" ? "active" : ""}
              >
                Delisted{" "}
                <span className="count">({this.state.totalDelisted})</span>
                <div className="border"></div>
              </li>
            </ul>

            {this.state.notification !== null ? (
              <>
                <div
                  className={notificationClass}
                  onClick={(e) => this.closeNotification(e)}
                >
                  {notificationIcon}
                  {this.state.notification.message}
                </div>
              </>
            ) : (
              <></>
            )}

            <div className="table-container">
              <div className="mb-4 pt-2 pb-2">
                {/* buttons*/}
                <div className="flex gap-2 items-center justify-end">
                  <div
                    className="table-view"
                    onClick={(e) => this.switchView(e)}
                  >
                    <div
                      id="view-list"
                      className={
                        this.state.tableView === "list" ? "selected" : ""
                      }
                      data-selected="0"
                    >
                      <MdFormatListBulleted />
                    </div>
                    <div
                      id="view-grid"
                      className={
                        this.state.tableView === "grid" ? "selected" : ""
                      }
                      data-selected="1"
                    >
                      <MdOutlineGridView />
                    </div>

                    <span
                      className="switch"
                      style={{
                        left: this.state.tableView === "list" ? "3px" : "45px",
                      }}
                    >
                      {this.state.tableView === "list" ? (
                        <>
                          <MdFormatListBulleted />
                        </>
                      ) : (
                        <>
                          <MdOutlineGridView />
                        </>
                      )}
                    </span>
                  </div>

                  <div
                    className="site-btn btn-default flex flex-row gap-2 items-center w-28"
                    onClick={this.callAddProduct}
                  >
                    <BsPlusCircle />
                    <p>Add New</p>
                  </div>
                  <div
                    className="site-btn btn-default flex flex-row gap-2 items-center w-28"
                    onClick={() =>{
                      this.filters.tab = ""
                      ls("list-filters", this.filters)
                      this.props.navigate(MerchantRoutes.ProductQuickListing)
                    }
                    }
                  >
                    <BsPlusCircle />
                    <p>Quick List</p>
                  </div>
                  <div>
                    <div
                      className="site-btn btn-default flex flex-row gap-1 items-center w-28"
                      onClick={this.showBulkUpdate}
                    >
                      Bulk Update
                    </div>
                  </div>

                  <div>
                    <div
                      className="site-btn btn-default flex flex-row gap-1 items-center w-24"
                      onClick={this.showBulkUpload}
                    >
                      Bulk Add
                    </div>
                  </div>
                </div>
              </div>
              {/* below div classname - scrollable-table ; removed to avoid internal scrolling
              removed "grid-height" class also for grid section */}
              <div className="!mb-20">
                {this.state.tableView === "list" ? (
                  <InfiniteScroll
                    dataLength={this.state.products.length}
                    next={this.fetchMoreData}
                    hasMore={this.state.products.length < this.state.total}
                    loader={<h4 className="text-center">Loading...</h4>}
                    scrollThreshold="60px"
                    endMessage={
                      <p className="text-center text-sm mt-3">
                        No more data to load.
                      </p>
                    }
                  >
                    <table>
                      <thead>
                        <tr>
                          <td width="5%">
                            <div
                              className="custom-checkbox"
                              onClick={(e) =>
                                this.checkbox_mirror_action(e, "div_mirror_one")
                              }
                            >
                              <input id="mirror-one" type="checkbox" />
                              <span className="checkmark"></span>
                            </div>
                          </td>
                          <td width="15%">Product Name</td>
                          <td width="10%">Category</td>
                          <td width="10%">SKU</td>
                          <td width="10%">Variation</td>
                          <td
                            width="5%"
                            className="withSort"
                            onClick={(e) => this.sortItemsBy("stock")}
                          >
                            Stock
                            {this.filters.sortStock === "" ? (
                              <FaSort />
                            ) : (
                              <>
                                {this.filters.sortStock === "asc" ? (
                                  <FaSortUp />
                                ) : (
                                  <FaSortDown />
                                )}
                              </>
                            )}
                          </td>
                          {/*<td width="5%" className='withSort' onClick={e => this.sortItemsBy("sales")}>*/}
                          <td width="5%">
                            Sales
                            {/*
                                {(this.filters.sortSales === "") ? <FaSort /> : <>
                                    {(this.filters.sortSales === "asc") ? <FaSortUp /> : <FaSortDown />}
                                </>}
                                */}
                          </td>
                          <td width="10%">Actions</td>
                        </tr>
                      </thead>
                      <tbody>
                        {/* {this.state.loading ? (
                            <>{this.renderSkeletonTable()}</>
                          ) : (
                            <> */}
                        {this.state.products !== null &&
                        this.state.products.length > 0 ? (
                          <>{this.renderProducts()}</>
                        ) : (
                          <>{this.noProduct()}</>
                        )}
                        {/* </>
                          )} */}
                      </tbody>
                    </table>
                  </InfiniteScroll>
                ) : (
                  <InfiniteScroll
                    dataLength={this.state.products.length}
                    next={this.fetchMoreData}
                    hasMore={this.state.products.length < this.state.total}
                    loader={<h4 className="text-center">Loading...</h4>}
                    scrollThreshold="10px"
                    endMessage={
                      <p className="text-center text-sm mt-3">
                        No more data to load.
                      </p>
                    }
                  >
                    <div className="grid grid-cols-5 gap-5 pt-2 pl-2 pr-2">
                      {/* {this.state.loading ? (
                          <>{this.renderSkeletonGrid()}</>
                        ) : (
                          <> */}
                      {this.state.products.length > 0 ? (
                        <>{this.renderProducts()}</>
                      ) : (
                        <>{this.noProduct()}</>
                      )}
                      {/* </>
                        )} */}
                    </div>
                  </InfiniteScroll>
                )}
              </div>
            </div>
            {this.state.products.length > 0 && <table>
              <tfoot className="!px-5 fixed bottom-[1px] bg-white mr-[45px]">
                <tr className="margins-footer">
                  <td width="5%">
                    <div
                      className="custom-checkbox"
                      onClick={(e) =>
                        this.checkbox_mirror_action(e, "div_mirror_two")
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
                    {this.state.productsSelected.length}
                    {this.state.productsSelected.length === 1
                      ? " product selected"
                      : " products selected"}
                  </td>

                  <td width="16%">&nbsp;</td>
                  <td width="16%">
                    <div className="flex gap-2">
                      {(this.filters.tab === "" ||
                        this.filters.tab === "live") && (
                        <div
                          className="site-btn btn-default px-2 mx-2"
                          id="btn_madd_delist"
                          onClick={(e) => this.massStatusUpdate(e, "delist")}
                        >
                          <span className="button__text">Delist</span>
                        </div>
                      )}
                      {(this.filters.tab === "draft" ||
                        this.filters.tab === "delisted" ||
                        this.filters.tab === "") && (
                        <div
                          className="site-btn btn-default mx-2"
                          id="btn_mass_publish"
                          onClick={(e) => this.massStatusUpdate(e, "active")}
                        >
                          <span className="button__text">Publish</span>
                        </div>
                      )}
                      {(this.filters.tab === "draft" ||
                        this.filters.tab === "delisted" ||
                        this.filters.tab === "live" ||
                        this.filters.tab === "soldout" ||
                        this.filters.tab === "violation") && (
                        <div
                          className="site-btn btn-default mx-2"
                          id="btn_mass_publish"
                          onClick={(e) => this.massStatusUpdate(e, "delete")}
                        >
                          <span className="button__text">Delete</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>&nbsp;</td>
                </tr>
              </tfoot>
            </table>}
          </div>
        </div>
      </>
    );
  };

  togglePop = (msgHead, msg, result) => {
    this.setState({
      popupSeen: !this.state.popupSeen,
      popupHead: msgHead,
      popupMsg: msg,
      popupResult: result,
    });
  };

  //render page
  render() {
    var apiError = ls("apiError");
    if (apiError != null) ls.remove("apiError");
    let mcClass = this.props.level === 1 ? "main-contents" : "main-contents ws";
    return (
      <main className="app-merchant merchant-db">
        <Navbar theme="dashboard" />
        <Sidebar selectedMenu={2.1} />
        <div className={mcClass}>
          <div className="breadcrumbs">
            <div className="page-title">My Products</div>
            <ul>
              <li>
                <a href={MerchantRoutes.Landing}>Home {">"}</a>
              </li>
              <li>My Products</li>
            </ul>
          </div>

          {this.body()}
        </div>

        {/* <ToastContainer
          autoClose={1000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          position={toast.POSITION.BOTTOM_RIGHT}
        /> */}

        {this.state.popupSeen ? (
          <PopupMessage
            toggle={this.togglePop}
            header={this.state.popupHead}
            message={this.state.popupMsg}
          />
        ) : null}
        {this.state.showPrompt && (
          <ProductAddEligibilityPopup
            toggle={() => this.setState({ showPrompt: false })}
            showPrompt={this.state.showPrompt}
          />
        )}

        {this.state.showBulkUploadPopup && (
          <BulkUploadPopup
            showPopup={this.state.showBulkUploadPopup}
            closePopup={() => {
              this.setState({ showBulkUploadPopup: false });
            }}
            onSubmitBulkUpload={this.onSubmitBulkUpload}
            isSubmittingBulkUpload={this.state.isSubmittingBulkUpload}
          />
        )}

        {this.state.showBulkUpdatePopup && (
          <BulkUpdatePopup
            showPopup={this.state.showBulkUpdatePopup}
            closePopup={() => {
              this.setState({ showBulkUpdatePopup: false });
            }}
            onSubmitBulkUpdate={this.onSubmitBulkUpdate}
            isSubmittingBulkUpdate={this.state.isSubmittingBulkUpdate}
          />
        )}

        {this.state.isShowDeletePopup && this.renderDeletePopup()}

        {apiError ? (
          <div
            className="api-error"
            onClick={() => this.setState({ userJwt: true })}
          >
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
}
export default withRouter(Products);

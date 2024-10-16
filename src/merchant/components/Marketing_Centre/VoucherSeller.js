import React from "react";
import ls from "local-storage";
import { Constants } from "../../utils/Constants.js";
import { MerchantRoutes } from "../../../Routes.js";
import { loginRequired } from "../../utils/Helper.js";
import withRouter from "../../../Utils.js";

import Navbar from "../Navbar.js";
import { Sidebar } from "../Parts.js";
import "../../../css/merchant.css";

import { ApiCalls, Apis } from "../../utils/ApiCalls.js";
import Pagination from "../../../utils/Pagination/pagination.js";

//icons
import { PageLoader } from "../../../utils/loader.js";
import { FaSearch } from "react-icons/fa";
import { BsFillPencilFill } from "react-icons/bs";
import { MdDeleteForever } from "react-icons/md";

import { Modal } from "../../../customer/components/GenericComponents.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import successGif from "../../../assets/success.gif";

class VoucherSeller extends React.Component {
  constructor(props) {
    super(props);
    loginRequired(props.page);
    document.title = "Merchant | uShop";

    this.user = ls(Constants.localStorage.user);
    if (this.user) this.user = JSON.parse(this.user);

    this.state = {
      loading: true,

      //pagination variables
      page: 1,
      entries: 10,
      pages: 1,
      total: 0,

      perPage: 10,
      voucherDetails: [],
      keyMetrics: [],
      currentTab: "Active",

      showMsg: false,
      showDeleteConfirmation: false,
      deletingID: "",

      searchInput: "",
    };
  }

  editProduct = (item) => {
    if (isNaN(item.id_voucher)) {
      this.props.setError(
        "Invalid product. Please check with an admin for more info."
      );
      return;
    }
    let updateurl = MerchantRoutes.EditVoucher.replace(
      ":idVoucher",
      item.id_voucher
    );

    this.props.navigate(updateurl, {
      state: {
        voucherData: item,
        isEdit: true,
      },
    });
    //window.location.replace(updateurl);
  };

  deleteVoucher = async (e) => {
    var fd = new FormData();
    ApiCalls(
      fd,
      Apis.deleteVoucher + this.state.deletingID + "/",
      "DELETE",
      {
        Authorization: "Bearer " + this.user.access,
      },
      this.processRes,
      e ? e.target : null
    );
    this.setState({ showDeleteConfirmation: false, showMsg: true });
  };

  processVoucherData = (res, api) => {
    var rdata = res.data;
    if (rdata.result === "SUCCESS") {
      let pg = this.state.page;
      let nxtPageCount = rdata.data.total_records % this.state.entries;
      let currentPage = parseInt(rdata.data.total_records / this.state.entries);
      if (nxtPageCount >= 0 && currentPage !== pg - 1) pg += 1;

      this.setState({
        loading: false,
        voucherDetails: rdata.data.voucher_list,
        keyMetrics: rdata.data.key_metrics,
        total: rdata.data.total_records,
        pages: pg,
      });
    }
  };

  loadVouchers = async (e) => {
    this.setState({ loading: true });
    var fd = new FormData(); 
    
    fd.append("voucher_identifier_variable", this.state.searchInput)
    fd.append("voucher_identifier", "name")
    fd.append("status", this.state.currentTab.toLowerCase())


    ApiCalls(
      fd,
      Apis.listVouchers,
      "POST",
      {
        Authorization: "Bearer " + this.user.access,
      },
      this.processVoucherData
    );
  };

  componentDidMount = () => {
    //fetch voucher data on load
    this.loadVouchers();
  };

  loadTab = (whichTab) => {
    this.setState({
      currentTab: whichTab,
    });
    this.toPage(1);
  };

  toPage = (page) => {
    this.setState(
      {
        page: page,
      },
      () => {
        this.loadVouchers();
      }
    );
  };

  changeEntries = (e) => {
    this.setState(
      {
        page: 1,
        entries: e.target.value,
      },
      () => {
        this.loadVouchers();
      }
    );
  };

  msgPopUp = () => {
    return (
      <Modal
        width="w-4/12"
        open={this.state.showMsg}
        children={
          <div>
            <span
              className="flex justify-end cp"
              onClick={() => {
                this.setState({ showMsg: false });
                setTimeout(() => window.location.reload(), 100);
              }}
            >
              <FontAwesomeIcon icon={faXmark} />
            </span>
            <img src={successGif} alt="" className="modal-icon" />
            <div className="poptitle font-medium text-center">
              <span>
                Voucher successfully deleted
                {/* <p className="text-base font-normal text-grey mt-2">
                  {`Error: ${this.state.message.message}`}
                </p> */}
              </span>
            </div>
          </div>
        }
      />
    );
  };

  deletePopUp = () => {
    return (
      <Modal
        width={"w-4/12"}
        open={this.state.showDeleteConfirmation}
        children={
          <div>
            <p className="text-lg font-semibold mb-3">Delete Confirmation</p>
            <hr />
            <p className="text-sm my-4 pr-7 mb-4">
              {"Are you sure to you want to delete this voucher?"}
            </p>
            <div className="flex justify-end mt-10">
              <button
                className="cp text-center rounded-md bg-[#f5ab35] disabled:bg-[#FFD086] text-white h-8 w-28 mr-5 disabled:cursor-default"
                //disabled={isMassConfirmingOrder}
                onClick={() => this.deleteVoucher()}
              >
                Yes{" "}
              </button>
              <button
                className="cp text-center rounded-md border-[#f5ab35] disabled:border-[#FFD086] disabled:cursor-default
                            border-2 bg-white text-[#f5ab35] disabled:text-[#FFD086] h-8 w-28"
                //disabled={isMassConfirmingOrder}
                onClick={() => this.setState({ showDeleteConfirmation: false })}
              >
                No
              </button>
            </div>
          </div>
        }
      ></Modal>
    );
  };

  render() {
    let mcClass = this.props.level === 1 ? "main-contents" : "main-contents ws";

    return (
      <main className="app-merchant merchant-db">
        <Navbar theme="dashboard" />
        <Sidebar selectedMenu={6.1} />
        <div className={mcClass}>
          {/* Page title */}
          <div className="breadcrumbs">
            <div className="page-title !pb-0">Vouchers</div>
            <ul>
              <li>
                <a href={MerchantRoutes.Landing}>Home {">"}</a>
              </li>
              {this.props.level > 0 && (
                <li className="font">Marketing Centre {">"}</li>
              )}
              {this.props.level > 0 && <li>Vouchers</li>}
            </ul>
          </div>

          {this.state.loading ? (
            <PageLoader />
          ) : (
            <div className="listing-page my-5 !pr-0 pl-11">
              <div className="flex flex-col">
                {/* Key Metrics */}
                <div className="p-4 bg-white mb-4 pb-8 mr-5 h-11/12">
                  <p className="font-semibold mt-3">Key Metrics</p>
                  <p className="text-xs mb-8 text-[#828282]">
                    (Data from {this.state?.keyMetrics?.start_date ?? "0"} to{" "}
                    {this.state?.keyMetrics?.end_date ?? "0"} GMT+8)
                  </p>
                  <div className="flex">
                    <div className="border-r w-1/3">
                      <div className="flex gap-1 mb-6">
                        <p className="text-sm font-semibold">
                          Sales earned from vouchers
                        </p>
                      </div>
                      <p className="text-xl font-semibold my-3">
                        ${this.state?.keyMetrics?.total_sales ?? "0"}
                      </p>
                      {/* <div className="flex">
                        <p className="text-xs">Vs previous 7 days</p>
                        <p className="text-xs text-[#f5ab35] ml-1">0.00%</p>
                      </div> */}
                    </div>

                    <div className="border-r w-1/3 ml-10">
                      <div className="flex gap-1 mb-6">
                        <p className="text-sm font-semibold">
                          Orders that used vouchers
                        </p>
                      </div>
                      <p className="text-xl font-semibold my-3">
                        {this.state.keyMetrics?.total_order ?? "0"}
                      </p>
                      {/* <div className="flex">
                        <p className="text-xs">Vs previous 7 days</p>
                        <p className="text-xs text-[#f5ab35] ml-1">0.00%</p>
                      </div> */}
                    </div>

                    <div className="border-r w-1/3 ml-10">
                      <div className="flex gap-1 mb-6">
                        <p className="text-sm font-semibold">
                          Usage Rate with vouchers
                        </p>
                      </div>
                      <p className="text-xl font-semibold my-3">
                        {this.state.keyMetrics?.usage_rate ?? "0.00"}%
                      </p>
                      {/* <div className="flex">
                        <p className="text-xs">Vs previous 7 days</p>
                        <p className="text-xs text-[#f5ab35] ml-1">0.00%</p>
                      </div> */}
                    </div>
                  </div>
                </div>

                {/* My vouchers */}
                <div className="p-4 bg-white mr-5 mb-5">
                  <div className="flex justify-between mb-6">
                    <p className="font-semibold mt-3">My vouchers</p>
                    <div className="flex w-1/2 justify-end gap-1">
                      <a
                        className="site-btn btn-default mt-3"
                        href={MerchantRoutes.AddVoucherSeller}
                        alt="Add New Voucher"
                      >
                        <span>Create</span>
                      </a>
                    </div>
                  </div>

                  <Pagination
                    entries={this.state.entries}
                    changeEntries={this.changeEntries}
                    toPage={this.toPage}
                    pages={this.state.pages}
                    page={this.state.page}
                    total={this.state.total}
                  />

                  {/* tabs section */}
                  <ul className="tabs mb-4 !p-0">
                    <li
                      onClick={(e) => this.loadTab("Active")}
                      id="Active"
                      className={
                        this.state.currentTab === "Active" ? "active" : ""
                      }
                    >
                      Active
                      <div className="border"></div>
                    </li>
                    <li
                      onClick={(e) => this.loadTab("Inactive")}
                      id="Inactive"
                      className={
                        this.state.currentTab === "Inactive" ? "active" : ""
                      }
                    >
                      Inactive
                      <div className="border"></div>
                    </li>
                  </ul>
                  <div className="flex">
                    <div className="searchBarWithImage h-8">
                      <input
                        type="text"
                        placeholder="Voucher Name"
                        id="searchBarInput"
                        width="auto"
                        className="h-[38px]"
                        value={this.state.searchInput}
                        onChange={e => this.setState({searchInput: e.target.value})}
                      />
                      <FaSearch className="searchBarImage cp" onClick={()=>this.toPage(1)} />
                    </div>
                  </div>
                  <div className="overflow-y-scroll overflow-x-hidden resize-y my-6">
                    <table id="financeTable">
                      <thead className="px-4">
                        <tr>
                          <td width="20%" className="text-center">
                            Voucher Name
                          </td>
                          <td width="15%" className="text-center">
                            Voucher Type
                          </td>
                          <td width="20%" className="text-center">
                            Target Buyer
                          </td>
                          <td width="15%" className="text-center">
                            Discount Amount
                          </td>
                          <td width="10%" className="text-center">
                            Usage Quantity
                          </td>
                          <td width="7%" className="text-center">
                            Usage
                          </td>
                          <td width="12%" className="text-center">
                            Actions
                          </td>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.voucherDetails.length === 0 ? (
                          <tr>
                            <td></td>
                            <td></td>
                            <td width="15%" className="text-center">
                              No data found
                            </td>
                            <td></td>
                            <td></td>
                          </tr>
                        ) : (
                          <>
                            {this.state.voucherDetails.map((item, index) => {
                              return (
                                <tr key={index}>
                                  <td width="20%" className="text-center">
                                    {item?.voucher_name ?? ""}
                                  </td>
                                  <td width="15%" className="text-center">
                                    {item?.voucher_type ?? "N/A"}
                                  </td>
                                  <td width="20%" className="text-center">
                                    {item?.target_buyer ?? "N/A"}
                                  </td>
                                  <td width="15%" className="text-center">
                                    {item?.discount_type_amount ?? "N/A"}
                                  </td>
                                  <td width="15%" className="text-center">
                                    {item?.usage_limit ?? "N/A"}
                                  </td>
                                  <td width="7%" className="text-center">
                                    {item?.usage_quantity ?? "N/A"}
                                  </td>
                                  <td width="8%" className="text-center">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div
                                        className="actions"
                                        type="button"
                                        title="Edit"
                                        onClick={(e) => this.editProduct(item)}
                                      >
                                        <BsFillPencilFill />
                                      </div>

                                      <button
                                        className="actions danger"
                                        type="button"
                                        title="Delete"
                                        onClick={(e) => {
                                            this.setState({
                                              showDeleteConfirmation: true,
                                              deletingID: item.id_voucher,
                                            });
                                        }}
                                      >
                                        <MdDeleteForever />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {this.state.showMsg && this.msgPopUp()}
        {this.state.showDeleteConfirmation && this.deletePopUp()}
      </main>
    );
  }
}

export default withRouter(VoucherSeller);

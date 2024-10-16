import React from "react";
import ls from "local-storage";
import { Constants } from "../../utils/Constants.js";
import { MerchantRoutes } from "../../../Routes.js";
import { loginRequired } from "../../utils/Helper.js";
import { ApiCalls, Apis } from "../../utils/ApiCalls.js";
import withRouter from "../../../Utils.js";
import Select from "react-select";

import { AiFillWarning } from "react-icons/ai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import successGif from "../../../assets/success.gif";
import verifiedBadge from "../../../assets/seller/verified_badge.png"
import {
  FaSearch,
  FaAngleRight,
  // FaDownload
} from "react-icons/fa";

import Navbar from "../Navbar.js";
import { Sidebar } from "../Parts.js";
import "../../../css/merchant.css";
import { Modal } from "../../../customer/components/GenericComponents.js";

import pending from "../../../assets/seller/pending.svg";
// import accDel from "../../../assets/seller/accountDel.svg";
// import download from '../../../assets/seller/bx_download.svg'
import { PageLoader } from "../../../utils/loader.js";
import Pagination from "../../../utils/Pagination/pagination.js";
import AddBankAccountPopup from "./AddBankAccountPopup.js";
import EditBankAccountPopup from "./EditBankAccountPopup.js";
import WithdrawalPopup from "./WithdrawalPopup.js";

const options = [
  { label: "Order ID", value: "Order ID" },
  { label: "Product", value: "Product" },
];
class Finance extends React.Component {
  constructor(props) {
    super(props);
    loginRequired(props.page);
    document.title = "Merchant | uShop";

    this.user = ls(Constants.localStorage.user);
    if (this.user) this.user = JSON.parse(this.user);

    this.state = {
      currentTab: "complete",
      isIncomeDataLoading: false,
      incomeData: null,
      bankDetails: null,
      isShowMsg: false,
      message: "",
      invoiceList: [],
      filterValue: "",

      //pagination variables
      page: 1,
      entries: 10,
      pages: 1,
      total: 0,

      //popup variables
      showAddPopup: false,
      showEditPopup: false,
      showWithdrawPopup: false,
    };
  }

  processEarnings = (res, api) => {
    var rdata = res.data.data;

    if (this.state.currentTab === "taxInvoices") {
      this.setState({
        invoiceList: rdata.invoice_list,
        isIncomeDataLoading: false,
        total: rdata.total_records,
        pages: rdata?.total_pages,
      });
    } else {
      this.setState({
        incomeData: rdata,
        isIncomeDataLoading: false,
        total: rdata.total_records,
        pages: rdata?.total_pages,
      });
    }
  };

  loadEarnings = () => {
    this.setState({
      isIncomeDataLoading: true,
    });

    if (this.state.currentTab === "taxInvoices") {
      ApiCalls(
        {},
        Apis.invoiceList,
        "GET",
        {
          Authorization: "Bearer " + this.user.access,
        },
        this.processEarnings
      );
    } else {
      let fetchEarnings
      
      fetchEarnings =
        Apis.earnings +
        `?page=${this.state.page}&status=${this.state.currentTab}`;

        if (
          this.state.currentTab !== "pending" &&
          this.state.filterValue !== ""
        ) {
          fetchEarnings += `&search=${this.state.filterValue}`;
        }
      ApiCalls(
        {},
        fetchEarnings,
        "GET",
        {
          Authorization: "Bearer " + this.user.access,
        },
        this.processEarnings
      );
    }
  };

  componentDidMount = () => {
    if (!this.state.bankDetails) {
      ApiCalls(
        {},
        Apis.bankDetails,
        "GET",
        {
          Authorization: "Bearer " + this.user.access,
        },
        (res2, api) => {
          this.setState({
            bankDetails: res2.data.data.bank_detail,
          });
        }
      );
    }
    setTimeout(() => this.loadEarnings(), 2000);
  };

  loadTab = (selectedTab) => {
    this.setState(
      {
        currentTab: selectedTab,
        page: 1,
        filterValue: ""
      },
      () => {
        this.loadEarnings();
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
        this.loadEarnings();
      }
    );
  };

  toPage = (page) => {
    this.setState(
      {
        page: page,
      },
      () => {
        this.loadEarnings();
      }
    );
  };

  closeAddPopup = () => {
    this.setState({
      showAddPopup: false,
    });
  };

  openAddPopup = () => {
    this.setState({
      showAddPopup: true,
    });
  };

  closeEditPopup = () => {
    this.setState({
      showEditPopup: false,
    });
  };

  openEditPopup = () => {
    this.setState({
      showEditPopup: true,
    });
  };

  closeWithdrawPopup = () => {
    this.setState({
      showWithdrawPopup: false,
    });
  };

  openWithdrawPopup = () => {
    this.setState({
      showWithdrawPopup: true,
    });
  };

  processBankAccount = (res, api) => {
    this.setState({
      isShowMsg: true,
      message: res.data,
      bankDetails: res.data.data?.bank_detail ?? null,
    });

    setTimeout(() => this.setState({ isShowMsg: false, message: "" }), 2000);
  };

  processWithdrawal = (res, api, withdrawAmt) => {
    let currentBalance = this.state.incomeData?.remaining_credit;
    if(res.data.result === "SUCCESS") {
      currentBalance = parseFloat(this.state.incomeData?.remaining_credit) - parseFloat(withdrawAmt)
    }

    this.setState({
      isShowMsg: true,
      message: res.data,
      incomeData : {...this.state.incomeData, remaining_credit: currentBalance}
    });

    setTimeout(() => this.setState({ isShowMsg: false, message: "" }), 2000);
  };

  msgPopup = () => {
    return (
      <Modal
        width="w-4/12"
        open={this.state.isShowMsg}
        children={
          <div>
            <span
              className="flex justify-end cp"
              onClick={() => this.setState({ isShowMsg: false })}
            >
              <FontAwesomeIcon icon={faXmark} />
            </span>
            {this.state.message.result === "SUCCESS" ? (
              <img src={successGif} alt="" className="modal-icon" />
            ) : (
              <AiFillWarning className="modal-icon" />
            )}
            <div className="poptitle font-medium text-center">
              {this.state.message.result === "SUCCESS" ? (
                this.state.message.message
              ) : (
                <span>
                  Error processing
                  <p className="text-base font-normal text-grey mt-2">
                    {`Error: ${this.state.message.message}`}
                  </p>
                </span>
              )}
            </div>
          </div>
        }
      />
    );
  };

  render() {
    let mcClass = this.props.level === 1 ? "main-contents" : "main-contents ws";

    return (
      <main className="app-merchant merchant-db">
        <Navbar theme="dashboard" />
        <Sidebar selectedMenu={5} />
        <div className={mcClass}>
          <div className="breadcrumbs">
            <div className="page-title !pb-0">Income Overview</div>
            <ul>
              <li>
                <a href={MerchantRoutes.Landing}>Home {">"}</a>
              </li>
              {this.props.level > 0 && <li className="font-bold">Finance</li>}
            </ul>
          </div>

          {this.state.isIncomeDataLoading ? (
            <PageLoader />
          ) : (
            <div className="listing-page my-5 !pr-0 pl-11">
              {/* <div className="flex"> */}
              <div className="flex flex-col">
                {/* Income overview section */}
                <div className="p-4 bg-white mb-4 pb-8 mr-5 h-11/12">
                  <p className="font-semibold mb-6 mt-3">Income Overview</p>
                  <p className="text-sm mb-8 text-[#828282]">
                    {this.state?.incomeData?.display_date ?? ""} (This Month)
                  </p>
                  <div className="flex">
                    <div className="border-r w-1/3">
                      <div className="flex gap-1 mb-6">
                        <p className="text-sm font-semibold">Withdrawal</p>
                        <img src={pending} alt="" />
                      </div>
                      <p className="text-sm mb-2">Total</p>
                      <p className="text-xl font-semibold mt-3">
                        ${this.state?.incomeData?.pending_amt ?? "0.0"}
                      </p>
                    </div>

                    <div className="border-r w-1/3 ml-5">
                      <div className="flex gap-1 mb-6">
                        <p className="text-sm font-semibold">Earned</p>
                        <img src={pending} alt="" />
                      </div>
                      <p className="text-sm mb-2">Total</p>
                      <p className="text-xl font-semibold mt-3">
                        ${this.state.incomeData?.remaining_credit ?? "0.0"}
                      </p>
                    </div>

                    <div className="border-r w-1/3 ml-5">
                      <div className="flex gap-1 mb-6">
                        <p className="text-sm font-semibold">Deductions</p>
                        <img src={pending} alt="" />
                      </div>
                      <p className="text-sm mb-2">Total</p>
                      <p className="text-xl font-semibold mt-3">
                        ${this.state.incomeData?.debit_amt ?? "0.0"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Income details section */}
                <div className="p-4 bg-white mr-5 mb-5">
                  <div className="flex justify-between mb-6">
                    <p className="font-semibold mt-3">Income Details</p>
                    {this.state.currentTab === "complete" ||
                    this.state.currentTab === "deduct" ? (
                      <div className="flex w-1/2 justify-end gap-1">
                        <Select
                          id="financeSelect"
                          name="financeSelect"
                          options={options}
                          placeholder="Order ID"
                          onChange={() => {}}
                          className="text-sm w-1/3 h-8"
                        />
                        <div className="searchBarWithImage h-8">
                          <input
                            placeholder="Input Order ID"
                            type="text"
                            id="searchBarInput"
                            width="auto"
                            className="h-[38px]"
                            value={this.state.filterValue}
                            onChange={(e) =>
                              this.setState({ filterValue: e.target.value })
                            }
                          />
                          <FaSearch
                            className="searchBarImage cp"
                            onClick={() => this.toPage(1)}
                          />
                        </div>
                      </div>
                    ) : null}
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
                      onClick={(e) => this.loadTab("pending")}
                      id="Pending"
                      className={
                        this.state.currentTab === "pending" ? "active" : ""
                      }
                    >
                      Withdrawal
                      <div className="border"></div>
                    </li>
                    <li
                      onClick={(e) => this.loadTab("complete")}
                      className={
                        this.state.currentTab === "complete" ? "active" : ""
                      }
                    >
                      Earned
                      <div className="border"></div>
                    </li>
                    <li
                      onClick={(e) => this.loadTab("deduct")}
                      className={
                        this.state.currentTab === "deduct" ? "active" : ""
                      }
                    >
                      Deductions
                      <div className="border"></div>
                    </li>
                    <li
                      onClick={(e) => this.loadTab("taxInvoices")}
                      className={
                        this.state.currentTab === "taxInvoices" ? "active" : ""
                      }
                    >
                      Tax Invoices
                      <div className="border"></div>
                    </li>
                  </ul>

                  <div className="overflow-y-scroll overflow-x-hidden resize-y mb-6">
                    <table id="financeTable">
                      <thead className="px-4">
                        {this.state.currentTab === "taxInvoices" ? (
                          <tr>
                            <td width="40%" className="text-center">
                              Period of Tax Invoice
                            </td>
                            <td width="20%" className="text-center">
                              Date of Invoice
                            </td>
                            <td width="20%" className="text-center">
                              Amount
                            </td>
                            <td width="20%" className="text-center">
                              Actions
                            </td>
                          </tr>
                        ) : (
                          <tr>
                            {this.state.currentTab !== "pending" && (
                              <td width="20%" className="text-center">
                                Order
                              </td>
                            )}
                            <td width="20%" className="text-center">
                              Receipt
                            </td>
                            <td width="15%" className="text-center">
                              Type
                            </td>
                            <td width="15%" className="text-center">
                              Fee
                            </td>
                            <td width="15%" className="text-center">
                              Status
                            </td>
                            <td width="15%" className="text-center">
                              {this.state.currentTab === "deduct"
                                ? "Deducted Amount"
                                : "Payout Amount"}
                            </td>
                          </tr>
                        )}
                      </thead>
                      <tbody>
                        {this.state.total === 0 ? (
                          <tr>
                            {this.state.currentTab !== "taxInvoices" && (
                              <td></td>
                            )}
                            <td></td>
                            <td width="15%" className="text-center">
                              No data found
                            </td>
                            <td></td>
                            <td></td>
                          </tr>
                        ) : (
                          <>
                            {this.state.currentTab === "taxInvoices" ? (
                              <>
                                {this.state.invoiceList?.map((item) => {
                                  return (
                                    <tr>
                                      <td width="40%" className="text-center">
                                        {item?.invoice_period ?? "N/A"}
                                      </td>
                                      <td width="20%" className="text-center">
                                        {item?.invoice_date ?? "N/A"}
                                      </td>
                                      <td width="20%" className="text-center">
                                        {item?.total_amount ?? "N/A"}
                                      </td>
                                      <td width="20%" className="text-center">
                                        <a
                                          href={item?.invoice_url}
                                          target="blank"
                                        >
                                          Download
                                        </a>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </>
                            ) : (
                              <>
                                {this.state.incomeData?.transaction_list?.map(
                                  (item) => {
                                    return (
                                      <tr>
                                        {this.state.currentTab !==
                                          "pending" && (
                                          <td
                                            width="20%"
                                            className="text-center"
                                          >
                                            {item?.order_number ?? ""}
                                          </td>
                                        )}
                                        <td width="20%" className="text-center">
                                          {item?.receipt ?? "N/A"}
                                        </td>
                                        <td width="15%" className="text-center">
                                          {item?.transaction_type ?? "N/A"}
                                        </td>
                                        <td width="15%" className="text-center">
                                          {item?.transaction_fee ?? "N/A"}
                                        </td>
                                        <td width="15%" className="text-center">
                                          {item?.status ?? "N/A"}
                                        </td>
                                        <td width="15%" className="text-center">
                                          {item?.credit_amount ?? "N/A"}
                                        </td>
                                      </tr>
                                    );
                                  }
                                )}
                              </>
                            )}
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* balance section */}
                <div className="p-4 bg-white mb-4 mr-5 h-11/12">
                  <p className="font-semibold mb-6 mt-3 mb-6">Balance</p>
                  <div className="flex justify-between">
                    <div className="w-1/3">
                      <p className="text-sm font-semibold mb-6">
                        Seller Balance
                      </p>
                      <div className="flex gap-4 mb-6 items-center">
                        <p className="text-xl font-semibold">
                          ${this.state.incomeData?.remaining_credit ?? "0.0"}
                        </p>
                        <button
                          className="cp text-center rounded-md bg-[#f5ab35] text-sm text-white h-8 w-20 hover:bg-amber-500
                             disabled:opacity-50  disabled:cursor-default"
                          onClick={this.openWithdrawPopup}
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>

                    <div className="w-1/3 ml-5">
                      <div className="flex gap-6 mb-4">
                        <p className="text-sm font-semibold">My Bank Account</p>
                        {this.state.bankDetails && (
                          <div
                            className="flex items-center cp"
                            onClick={this.openEditPopup}
                          >
                            <p className="text-[#2F80ED] text-xs">Edit</p>
                            <FaAngleRight color="#2F80ED" />
                          </div>
                        )}
                      </div>
                      {this.state.bankDetails ? (
                        <div className="flex xs:flex-col sm:flex-col md:flex-row items-center gap-3">
                          <div className="flex items-center gap-1">
                            <img
                              className="w-[60px]"
                              src={this.state.bankDetails?.bank_id__bank_logo}
                              alt="bank_logo"
                            />
                            <p className="text-xs text-[#828282]">
                              {this.state.bankDetails?.bank_id__bank_name}{" "}
                              &nbsp;&nbsp;{" "}
                              {this.state.bankDetails?.masked_account_number}
                            </p>
                          </div>
                          {this.state.bankDetails.is_verified && (
                            <img
                              src={verifiedBadge}
                              alt="verified-badge"
                              width="75px"
                              height="50px"
                            />
                          )}
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-2 cp"
                          onClick={this.openAddPopup}
                        >
                          <p className="text-[#f5ab35] text-xs">
                            Add a Bank Account
                          </p>
                          <FaAngleRight color="#f5ab35" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* income statements section */}
              {/* <div className="p-4 bg-white mb-4 w-1/5 h-11/12">
                                <p>Income Statements</p>
                                <div className="flex items-center my-2">
                                    <p className="text-[#828282] underline text-xs">More</p>
                                    <FaAngleRight color="#f5ab35" />
                                </div>

                                <div className="flex justify-between my-2">
                                    <p className="text-[#4F4F4F] text-xs">1 - Sept - 30 Sept 2022</p>
                                    <img src={download} alt="" />
                                </div>
                                <hr />
                            </div>
                        </div> */}
            </div>
          )}
        </div>

        {/* add bank account poup */}
        {this.state.showAddPopup && (
          <AddBankAccountPopup
            toggleBankAccountPopup={this.state.showAddPopup}
            closeBankAccountPopup={this.closeAddPopup}
            processAddBankAccount={this.processBankAccount}
            user={this.user}
          />
        )}

        {/* edit bank account poup */}
        {this.state.showEditPopup && (
          <EditBankAccountPopup
            toggleBankAccountPopup={this.state.showEditPopup}
            closeBankAccountPopup={this.closeEditPopup}
            processEditBankAccount={this.processBankAccount}
            user={this.user}
            bankDetails={this.state.bankDetails}
          />
        )}

        {/* seller withdrawal popup */}
        {this.state.showWithdrawPopup && (
          <WithdrawalPopup
            toggleWithdrawalPopup={this.state.showWithdrawPopup}
            closeWithdrawalPopup={this.closeWithdrawPopup}
            processWithdrawal={this.processWithdrawal}
            user={this.user}
            balance={this.state.incomeData?.remaining_credit}
            isVerified={this.state.bankDetails?.is_verified}
          />
        )}
        {this.state.isShowMsg && this.msgPopup()}
      </main>
    );
  }
}

export default withRouter(Finance);

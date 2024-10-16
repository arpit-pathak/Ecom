import { Sidebar } from "../../Parts";
import Navbar from "../../Navbar.js";
import { MerchantRoutes } from "../../../../Routes.js";
import Select from "react-select";
import { Chart, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ApiCalls, Apis } from "../../../utils/ApiCalls";
import ls from "local-storage";
import { Constants, GROUPBUY_STATUSES } from "../../../utils/Constants.js";
import Pagination from "../../../../utils/Pagination/pagination.js";
import { faSort, faRepeat } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BsFillPencilFill } from "react-icons/bs";
import { MdDeleteForever } from "react-icons/md";
import { toast } from "react-toastify";
import "./index.css"
import { PageLoader } from "../../../../utils/loader.js";

Chart.register(ArcElement, Tooltip, Legend, Title);
Chart.defaults.plugins.tooltip.backgroundColor = "rgb(0, 0, 156)";
Chart.defaults.plugins.legend.position = "bottom";
Chart.defaults.plugins.legend.title.display = true;
Chart.defaults.plugins.legend.title.color = "black";
Chart.defaults.font.size = "13px";
Chart.defaults.font.weight = "bold";

const GroupBuys = ({ level }) => {
  let mcClass = level === 1 ? "main-contents" : "main-contents ws";
  let user = ls(Constants.localStorage.user);
  if (user) user = JSON.parse(user);

  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState("publish");
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState(10);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [groupBuyList, setGroupBuyList] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState({label: "", value: ""});
  const [monthOptions, setMonthOptions] = useState([]);
  const [dateOrder, setDateOrder] = useState("desc");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getGroupBuyList()
  }, [page, selectedMonth, dateOrder, currentTab]);

  const getGroupBuyList = () => {
   setIsLoading(true)
    var fd = new FormData();

    fd.append("status", currentTab);
    fd.append("page", page);
    fd.append("list_length", entries);
    fd.append("month", selectedMonth?.value);
    fd.append("date_order", dateOrder);

    ApiCalls(
      fd,
      Apis.getGroupBuyList,
      "POST",
      {
        Authorization: "Bearer " + user.access,
      },
      (res, api) => {
        if (res.data.result === "SUCCESS") {
          setGroupBuyList(res.data.data?.group_buy_list);
          setResult(res.data.data);

          if(monthOptions.length === 0) {
            let monthValue = res.data.data?.month_date;
            let newMonths = [];
            newMonths = res.data.data?.month_dropdown.map((item, index) => {
              return { label: item, value: monthValue[index] };
            });
            setMonthOptions([...newMonths]);
          }

          Chart.defaults.plugins.legend.title.text = `Total : ${res.data.data?.total_campaigns}`;

          setTotal(res.data.data.total);
          setPages(res.data.data.pages);
        } else toast.error(res.data?.message);

        setIsLoading(false)
      }
    );
  }

  useEffect(() => {
    if (monthOptions.length > 0) {
      let index = monthOptions.length - 1;
      let lastMonth = monthOptions[index];

      setSelectedMonth(lastMonth);
    }
  }, [monthOptions]);

  const loadTab = (selectedTab) => {
    setCurrentTab(selectedTab);
    setPage(1);
  };

  const toPage = (page) => {
    setPage(page);
  };

  const changeEntries = (e) => {
    setEntries(e.target.value);
    setPage(1);
  };

  const updateSort = () => {
    if (dateOrder === "asc") setDateOrder("desc");
    else setDateOrder("asc");
  };

  const deleteGroupBuy = (index) => {
    var fd= new FormData();

    ApiCalls(
      fd,
      Apis.deleteGroupBuy + groupBuyList[index].id_product_group_buy + "/",
      "DELETE",
      {
        Authorization: "Bearer " + user.access,
      },
      (res, api) => {
        if(res.data.result === "SUCCESS") {
          toast.success(res.data.message)
          getGroupBuyList()
        }
      })
  }

  return (
    <main className="app-merchant merchant-db">
      <Navbar theme="dashboard" />
      <Sidebar selectedMenu={6.3} />
      {isLoading ? <PageLoader /> : <div className={mcClass}>
        {/* Page title */}
        <div className="breadcrumbs">
          <div className="page-title !pb-0 !font-bold">
            Group Buys Campaigns
          </div>
          <ul>
            <li>
              <a href={MerchantRoutes.Landing}>Home {">"}</a>
            </li>
            {level > 0 && <li className="font">Marketing Centre {">"}</li>}
            {level > 0 && <li>Group Buys Campaigns</li>}
          </ul>
        </div>

        <div className="listing-page my-5 !pr-0 pl-11">
          <div className="flex flex-col">
            {/* Key Metrics */}
            <div className="p-4 bg-white mb-4 pb-8 mr-5 h-11/12">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Group Buy Key Metrics</p>
                  <p className="text-xs mt-1 text-[#828282]">
                    ({result?.month_range} GMT +8)
                  </p>
                </div>
                <Select
                  placeholder="Select month"
                  onChange={(e) => setSelectedMonth(e)}
                  value={{label: selectedMonth.label}}
                  name="groupBuyMonth"
                  options={monthOptions}
                  className="min-w-[250px] h-[43px] text-ellipsis text-sm"
                />
              </div>

              <div className="flex justify-between mt-10 items-center font-medium">
                <p className="text-ellipsis w-1/3">
                  Number of Group Buy Campaigns hosted (Completed)
                </p>
                <p className="w-1/3 text-center">Sales from Campaigns</p>
                <p className="w-1/3 text-center">Total Orders</p>
              </div>

              <div className="flex justify-between items-center ">
                <div className="w-1/3">
                  {result?.success_target === 0 &&
                  result?.unsuccess_target === 0 ? (
                    <p className="text-center">No campaigns hosted</p>
                  ) : (
                    <Doughnut
                      data={{
                        labels: [
                          `Reached Success Target : ${result?.success_target}`,
                          `Not reach Success Target : ${result?.unsuccess_target}`,
                        ],
                        datasets: [
                          {
                            data: [
                              // 40, 30
                              result?.success_target,
                              result?.unsuccess_target,
                            ],
                            backgroundColor: ["#EA9000", "#02B5B0"],
                            borderWidth: 1,
                            radius: "60%",
                          },
                        ],
                      }}
                    />
                  )}
                </div>
                <div className="h-52 w-[1px] bg-gray-300 mr-5"></div>
                <div className="w-1/3">
                  <div className="h-32 flex flex-col justify-center items-center">
                    <p className="font-[1000] text-2xl">
                      $ {result?.group_buy_total_sales ?? 0.0}
                    </p>
                    <p className="text-xs">SGD</p>
                  </div>
                </div>
                <div className="h-52 w-[1px] bg-gray-300 mr-5"></div>
                <div className="w-1/3">
                  <div className="h-32 flex flex-col justify-center items-center">
                    <p className="font-[1000] text-2xl">
                      {result?.group_buy_sold_qty ?? 0}
                    </p>
                    <p className="text-xs">Units Sold</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white my-10 pb-8 mr-5 h-11/12">
              <p className="font-bold text-lg">My Group Buys</p>
              <div className="text-right">
                <button
                  className="cp text-center rounded-md bg-[#f5ab35] text-sm text-white h-8 w-20 hover:bg-amber-500
                             disabled:opacity-50  disabled:cursor-default"
                  onClick={() => navigate(MerchantRoutes.CreateGroupBuy,
                    {
                      state: {
                        productId: null,
                        productName: null,
                      },
                    })}
                >
                  Create
                </button>
              </div>
              <Pagination
                entries={entries}
                pages={pages}
                page={page}
                changeEntries={changeEntries}
                toPage={toPage}
                total={total}
              />

              {/* tabs section */}
              <ul className="tabs mb-4 !p-0">
                <li
                  onClick={(e) => loadTab("publish")}
                  id={GROUPBUY_STATUSES.PUBLISH}
                  className={currentTab === "publish" ? "active" : ""}
                >
                  Active
                  <div className="border"></div>
                </li>
                <li
                  onClick={(e) => loadTab("draft")}
                  id={GROUPBUY_STATUSES.DRAFT}
                  className={currentTab === "draft" ? "active" : ""}
                >
                  Draft
                  <div className="border"></div>
                </li>
                <li
                  onClick={(e) => loadTab("complete")}
                  id={GROUPBUY_STATUSES.COMPLETE}
                  className={currentTab === "complete" ? "active" : ""}
                >
                  Completed
                  <div className="border"></div>
                </li>
              </ul>

              <div className="overflow-y-scroll overflow-x-hidden resize-y mb-6">
                <table id="financeTable">
                  <thead className="text-center">
                    <tr>
                      <td width="45%">
                        PRODUCT
                      </td>
                      <td width="15%">
                        <div className="flex gap-4 items-center">
                          DATES
                          <div>
                            <FontAwesomeIcon
                              icon={faSort}
                              className="cp"
                              onClick={updateSort}
                            />
                          </div>
                        </div>
                      </td>
                      <td width="40%">
                        STATUS
                      </td>
                    </tr>
                  </thead>
                  <tbody className="!pl-8">
                    {groupBuyList.length === 0 ? (
                      <tr>
                        <td></td>
                        <td width="15%" className="text-center">
                          No data found
                        </td>
                        <td></td>
                      </tr>
                    ) : (
                      <>
                        {groupBuyList.map((groupBuy, index) => {
                          return (
                            <tr>
                              {/* product col */}
                              <td
                                width="45%"
                                className="cp"
                                onClick={() =>
                                  navigate(
                                    MerchantRoutes.EditGroupBuy.replace(
                                      ":idGroupBuy",
                                      groupBuy.id_product_group_buy
                                    ),
                                    {
                                      state: {
                                        productId: null,
                                        productName: null,
                                      },
                                    }
                                  )
                                }
                              >
                                <div className="mx-2">
                                  <p className="font-bold text-sm mb-1 w-24">
                                    {groupBuy?.campaign_label}
                                  </p>
                                  <div className="flex gap-5">
                                    <img
                                      alt="prod"
                                      src={groupBuy?.product_image}
                                      className="h-20 w-20"
                                    />
                                    <div>
                                      <p className="mb-3 italic">
                                        {groupBuy?.product_id__name}
                                      </p>
                                      {/* <div className="flex gap-1">
                                        <div>
                                          <p>Usual Price</p>
                                          <p>Group Buy Price</p>
                                          <p>Success Discounted Price</p>
                                        </div>
                                        <div>
                                          <p>
                                            : $
                                            {
                                              groupBuy?.usual_price.split(
                                                "-"
                                              )[0]
                                            }
                                          </p>
                                          <p>: ${groupBuy?.group_buy_price}</p>
                                          <p>
                                            : $
                                            {groupBuy?.success_discount_price}
                                          </p>
                                        </div>
                                      </div> */}
                                      <p className="mb-0">
                                        Usual Price :{" "}
                                        <span className="font-bold">
                                          ${groupBuy?.usual_price}
                                        </span>
                                      </p>
                                      <p className="mb-0">
                                        Group Buy Price :{" "}
                                        <span className="font-bold">
                                          ${groupBuy?.group_buy_price}
                                        </span>
                                      </p>
                                      <p>
                                        Success Discounted Price : $
                                        <span className="font-bold">
                                          {groupBuy?.success_discount_price}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* date col */}
                              <td width="15%">
                                <div>
                                  <p className="font-extrabold text-sm mb-1">
                                    Start Date
                                  </p>
                                  <p>{groupBuy?.start_datetime}</p>
                                  <p className="font-extrabold text-sm mb-1 mt-5 text-[#BDB3B6]">
                                    End Date
                                  </p>
                                  <p className="text-[#BDB3B6]">
                                    {groupBuy?.end_datetime}
                                  </p>
                                </div>
                              </td>

                              {/* status col */}
                              <td width="40%">
                                <div>
                                  <div className="flex justify-between items-center mb-3">
                                    <div
                                      className={`h-[26px] w-32 rounded-2xl pt-[2px] text-white text-center 
                                    ${
                                      groupBuy?.status ===
                                      GROUPBUY_STATUSES.LIVE
                                        ? "bg-orangeButton"
                                        : "bg-[#BDB3B6]"
                                    }`}
                                    >
                                      {groupBuy?.status ===
                                      GROUPBUY_STATUSES.LIVE
                                        ? GROUPBUY_STATUSES.LIVE
                                        : groupBuy?.status}
                                    </div>
                                    <div className="flex gap-1">
                                      {groupBuy.status ===
                                        GROUPBUY_STATUSES.DRAFT && (
                                        <button
                                          className="actions"
                                          type="button"
                                          title="Edit"
                                          onClick={(_) =>
                                            navigate(
                                              MerchantRoutes.EditGroupBuy.replace(
                                                ":idGroupBuy",
                                                groupBuy.id_product_group_buy
                                              ),
                                              {
                                                state: {
                                                  productId: null,
                                                  productName: null,
                                                },
                                              }
                                            )
                                          }
                                        >
                                          <BsFillPencilFill />
                                        </button>
                                      )}

                                      {groupBuy.status ===
                                        GROUPBUY_STATUSES.COMPLETE && (
                                        <button
                                          className="actions danger"
                                          type="button"
                                          title="Re-launch"
                                          onClick={(_) => navigate(
                                            MerchantRoutes.EditGroupBuy.replace(
                                              ":idGroupBuy",
                                              groupBuy.id_product_group_buy
                                            ),
                                            {
                                              state: {
                                                productId: null,
                                                productName: null,
                                                type: "relaunch"
                                              },
                                            }
                                          )}
                                        >
                                          <FontAwesomeIcon
                                            icon={faRepeat}
                                            className="cp"
                                          />
                                        </button>
                                      )}

                                      {groupBuy.status !==
                                        GROUPBUY_STATUSES.LIVE && (
                                        <button
                                          className="actions danger"
                                          type="button"
                                          title="Delete"
                                          onClick={(_) => {
                                            if (
                                              window.confirm(
                                                "Are you sure you want to delete this group buy?"
                                              )
                                            ) {
                                              deleteGroupBuy(index);
                                            }
                                          }}
                                        >
                                          <MdDeleteForever />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div
                                    className={`ml-4 flex ${
                                      groupBuy?.status ===
                                      GROUPBUY_STATUSES.LIVE
                                        ? "text-black"
                                        : "text-[#837277]"
                                    }`}
                                  >
                                    <div className="w-28">
                                      <p className="mb-2">
                                        <span className="font-bold">Sold</span>
                                        /Target
                                      </p>
                                      <p>Sales of Orders</p>
                                    </div>

                                    <div className="w-8">
                                      <p className="mb-2"> : </p>
                                      <p> : </p>
                                    </div>

                                    <div>
                                      <p className="mb-2">
                                        <span className="font-bold">
                                          {groupBuy?.status ===
                                          GROUPBUY_STATUSES.LIVE
                                            ? groupBuy?.group_buy_sold_qty
                                            : "--"}
                                        </span>
                                        / {groupBuy?.max_campaign_qty} qty
                                      </p>
                                      <p>
                                        <span className="font-bold">
                                          {groupBuy?.status ===
                                          GROUPBUY_STATUSES.LIVE
                                            ? groupBuy?.group_buy_total_sales
                                            : "--"}{" "}
                                        </span>
                                        sgd
                                      </p>
                                    </div>
                                  </div>

                                  {groupBuy?.status ===
                                    GROUPBUY_STATUSES.LIVE && (
                                    <div className="flex gap-2 w-full mt-5">
                                      <p className="font-bold text-xs">
                                        GP: ${groupBuy?.group_buy_price}
                                      </p>

                                      <div className="max-w-[300px] w-1/2 relative">
                                        {/* <ProgressBar
                                          // now={40}
                                          now={groupBuy?.group_buy_sold_qty}
                                          max={groupBuy?.max_campaign_qty}
                                          label={groupBuy?.group_buy_sold_qty}
                                          // label={`40 orders`}
                                          className=""
                                        /> */}
                                        <div className="progress">
                                          <div
                                            className="progress-bar"
                                            role="progressbar"
                                            style={{
                                              width: `${
                                                (groupBuy?.group_buy_sold_qty /
                                                  groupBuy?.max_campaign_qty) *
                                                100
                                              }%`,
                                            }}
                                            aria-valuenow={
                                              groupBuy?.group_buy_sold_qty
                                            }
                                            aria-valuemin={0}
                                            aria-valuemax={
                                              groupBuy?.max_campaign_qty
                                            }
                                          >
                                            {groupBuy?.group_buy_sold_qty}
                                          </div>
                                        </div>
                                        <div className="flex flex-col items-end my-2">
                                          <div className="h-3 w-[1px] bg-red-500"></div>
                                          <div className="font-bold text-xs text-red-500 absolute -right-6 top-10">
                                            {groupBuy?.max_campaign_qty} orders
                                          </div>
                                        </div>
                                      </div>

                                      <p className="font-bold text-xs w-16">
                                        ${groupBuy?.success_discount_price}
                                      </p>
                                    </div>
                                  )}
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
      </div>}
    </main>
  );
};

export default GroupBuys;

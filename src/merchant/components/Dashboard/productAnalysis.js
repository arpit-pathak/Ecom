import { useEffect, useState } from "react";
import Select from "react-select";
import { ApiCalls, Apis } from "../../utils/ApiCalls.js";
import ls from "local-storage";
import { Constants } from "../../utils/Constants.js";
import { PRODUCT_FILTERS, PRODUCT_SUB_FILTERS } from "./constants.js";
import { useNavigate } from "react-router-dom";
import { MerchantRoutes } from "../../../Routes.js";
import InfiniteScroll from "react-infinite-scroll-component";
import { toast } from "react-toastify";

const options = [
  { label: "Past Month", value: "1_month" },
  { label: "Past 2 Months", value: "2_month" },
  { label: "Past 3 Months", value: "3_month" },
];

const ProductAnalysis = ({
  title,
  filter,
  accessors,
  isSubFilter,
  isViewMore,
  isBold,
  fifthCol,
  duration,
  selectedSubFilter,
}) => {
  let user = ls(Constants.localStorage.user);
  if (user) user = JSON.parse(user);
  const navigate = useNavigate();

  const [selectedPeriod, setSelectedPeriod] = useState(
    isViewMore ? duration : options[0]
  );
  const [total, setTotal] = useState(0);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const listLength = isViewMore ? 10 : 5;
  const [subFilter, setSubFilter] = useState(
    isSubFilter
      ? selectedSubFilter
        ? selectedSubFilter
        : PRODUCT_SUB_FILTERS.AMOUNT
      : ""
  );
  const [initialLoad, setInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    let url =
      Apis.productAnalysisData +
      "?page=" +
      page +
      "&list_length=" +
      listLength +
      "&duration=" +
      selectedPeriod?.value +
      "&filter_type=" +
      filter +
      "&sub_filter_type=" +
      subFilter;

    ApiCalls(
      {},
      url,
      "GET",
      {
        Authorization: "Bearer " + user.access,
      },
      (res, api) => {
        if (res.data.result === "SUCCESS") {
          let rdata = res.data.data;
          let newData = [];

          if (page !== 1) newData = [...data, ...rdata.products];
          else newData = [...rdata.products];

          setData(isViewMore ? newData : rdata?.products);
          setTotal(rdata?.total ?? 0);

          setInitialLoad(false);
        } else toast.error(res.data.message);

        setIsLoading(false);
      }
    );
  }, [subFilter, selectedPeriod, page]);

  const handleAction = (item) => {
    if (
      filter === PRODUCT_FILTERS.HIGHEST_SALE ||
      filter === PRODUCT_FILTERS.HIGHEST_VIEW
    ) {
      navigate(MerchantRoutes.CreateGroupBuy, {
        state: {
          productId: item[accessors?.productId],
          productName: item[accessors?.name],
        },
      });
    } else {
      navigate(
        MerchantRoutes.EditProduct.replace(
          ":idProduct",
          item[accessors?.productId]
        )
      );
    }
  };

  const handleViewMore = () => {
    navigate(MerchantRoutes.ProductAnalysis.replace(":type", filter), {
      state: {
        subFilter: isSubFilter ? subFilter : "",
        duration: selectedPeriod,
      },
    });
  };

  function fetchMoreData() {
    if (data.length < total && !initialLoad) {
      let currentPage = page + 1;
      setPage(currentPage);
    }
  }

  const body = () => {
    return (
      <table id="financeTable" className="ml-2 mt-2">
        <thead className="px-4">
          <tr>
            <td width="2%"></td>
            <td width="30%">Product Name</td>
            <td width="10%" className="text-center">
              Price
            </td>
            <td width="10%" className="text-center">
              Stock
            </td>
            <td width="10%" className="text-center">
              Sales
            </td>
            <td width="10%" className="text-center">
              {fifthCol}
            </td>
            <td width="30%" className="text-center">
              Actions
            </td>
          </tr>
        </thead>
        <tbody>
          {!isViewMore && isLoading ? (
            <tr>
              <td></td>
              <td></td>
              <td></td>
              <td width="15%" className="text-center">
                <p className="text-orangeButton font-semibold">Loading...</p>
              </td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          ) : (
            <>
              {total === 0 ? (
                <tr>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td width="15%" className="text-center">
                    No data found
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ) : (
                <>
                  {data?.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td width="2%">{index + 1}.</td>
                        <td width="30%">
                          <div className="flex items-center gap-3">
                            <img
                              src={item[accessors?.image]}
                              alt=""
                              className="w-12 h-12"
                            />
                            <p
                              className={`underline ${
                                isBold?.includes("name") && "font-bold"
                              }`}
                            >
                              {item[accessors?.name] ?? "NA"}
                            </p>
                          </div>
                        </td>
                        <td width="10%" className="text-center">
                          <p
                            className={`${
                              isBold?.includes("price") && "font-bold"
                            }`}
                          >
                            {item[accessors?.price] ?? "NA"}
                          </p>
                        </td>
                        <td width="10%" className="text-center">
                          <p
                            className={`${
                              isBold?.includes("stock") && "font-bold"
                            }`}
                          >
                            {item[accessors?.stock] ?? "NA"}
                          </p>
                        </td>
                        <td width="10%" className="text-center">
                          <p
                            className={`${
                              isBold?.includes("sales") && "font-bold"
                            }`}
                          >
                            {item[accessors?.sales] ?? "NA"}
                          </p>
                        </td>
                        <td width="10%" className="text-center">
                          <p
                            className={`${
                              isBold?.includes("salesQty") && "font-bold"
                            }`}
                          >
                            {item[accessors?.salesQty] ?? "NA"}
                          </p>
                        </td>
                        <td width="30%" className="text-center">
                          <button
                            className="cp text-center rounded-md bg-[#f5ab35] text-sm text-white h-8 px-3 hover:bg-amber-500"
                            onClick={() => handleAction(item)}
                          >
                            {filter === PRODUCT_FILTERS.HIGHEST_SALE ||
                            filter === PRODUCT_FILTERS.HIGHEST_VIEW
                              ? "Create Campaign"
                              : "Edit Product"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </>
          )}
        </tbody>
      </table>
    );
  };

  return (
    <div className="mt-10 p-2 shadow-md rounded-md bg-white">
      <div className="flex justify-between items-center">
        <p className="font-bold text-sm">{title}</p>

        {isSubFilter && (
          <div className="flex items-center gap-2">
            <div
              className="flex gap-2 items-center cp"
              onClick={() => {
                setSubFilter(PRODUCT_SUB_FILTERS.AMOUNT);
                setPage(1);
              }}
            >
              <p className="font-bold text-orangeButton text-sm">Amount</p>
              <div
                className={`w-4 h-4 rounded-full border border-orangeButton cp ${
                  subFilter === PRODUCT_SUB_FILTERS.AMOUNT
                    ? "bg-orangeButton"
                    : "bg-white"
                }`}
              ></div>
            </div>
            <div
              className="flex gap-2 items-center cp"
              onClick={() => {
                setSubFilter(PRODUCT_SUB_FILTERS.QTY);
                setPage(1);
              }}
            >
              <p className="font-bold text-orangeButton text-sm">Quantity</p>
              <div
                className={`w-4 h-4 rounded-full border border-orangeButton cp ${
                  subFilter === PRODUCT_SUB_FILTERS.QTY
                    ? "bg-orangeButton"
                    : "bg-white"
                }`}
              ></div>{" "}
            </div>
          </div>
        )}

        <Select
          onChange={(e) => {
            setSelectedPeriod(e);
            setPage(1);
          }}
          value={{ label: selectedPeriod.label }}
          name="highestSalesPeriod"
          options={options}
          className="h-[43px] text-ellipsis text-sm"
        />
      </div>

      {!isViewMore ? (
        body()
      ) : (
        <InfiniteScroll
          dataLength={data.length}
          next={fetchMoreData}
          hasMore={data.length < total}
          scrollThreshold="0px"
          loader={
            <p className="w-full text-center text-orangeButton my-3 font-semibold">
              Loading...
            </p>
          }
          endMessage={
            <p className="text-center text-sm mt-3">No more data to load.</p>
          }
        >
          {body()}
        </InfiniteScroll>
      )}

      {!isViewMore && total > 5 && (
        <p
          className="italic my-4 text-[#757575] text-center cp"
          onClick={handleViewMore}
        >
          VIEW MORE..
        </p>
      )}
    </div>
  );
};

export default ProductAnalysis;

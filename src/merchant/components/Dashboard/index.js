import ProductAnalysis from "./productAnalysis";
import { PRODUCT_FILTERS, PRODUCT_ANALYSIS_PARAMS } from "./constants.js";

const ProdAnalysisWrapper = () => {
  return (
    <div>
      <ProductAnalysis
        title={PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.HIGHEST_SALE]?.title}
        filter={PRODUCT_FILTERS.HIGHEST_SALE}
        isSubFilter={
          PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.HIGHEST_SALE]?.isSubFilter
        }
        isViewMore={false}
        accessors={
          PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.HIGHEST_SALE]?.accessors
        }
        isBold={PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.HIGHEST_SALE]?.isBold}
        fifthCol={
          PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.HIGHEST_SALE]?.fifthCol
        }
      />

      <ProductAnalysis
        title={PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.HIGHEST_VIEW]?.title}
        filter={PRODUCT_FILTERS.HIGHEST_VIEW}
        isSubFilter={
          PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.HIGHEST_VIEW]?.isSubFilter
        }
        isViewMore={false}
        accessors={
          PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.HIGHEST_VIEW]?.accessors
        }
        isBold={PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.HIGHEST_VIEW]?.isBold}
        fifthCol={
          PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.HIGHEST_VIEW]?.fifthCol
        }
      />

      <ProductAnalysis
        title={PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.HIGHEST_REFUND]?.title}
        filter={PRODUCT_FILTERS.HIGHEST_REFUND}
        isSubFilter={
          PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.HIGHEST_REFUND]?.isSubFilter
        }
        isViewMore={false}
        accessors={
          PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.HIGHEST_REFUND]?.accessors
        }
        isBold={PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.HIGHEST_REFUND]?.isBold}
        fifthCol={
          PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.HIGHEST_REFUND]?.fifthCol
        }
      />

      <ProductAnalysis
        filter={PRODUCT_FILTERS.SLOWEST_SALE}
        title={PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.SLOWEST_SALE]?.title}
        isSubFilter={
          PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.SLOWEST_SALE]?.isSubFilter
        }
        isViewMore={false}
        accessors={
          PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.SLOWEST_SALE]?.accessors
        }
        isBold={PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.SLOWEST_SALE]?.isBold}
        fifthCol={
          PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.SLOWEST_SALE]?.fifthCol
        }
      />

      <ProductAnalysis
        filter={PRODUCT_FILTERS.LOW_INVENTORY}
        title={PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.LOW_INVENTORY]?.title}
        isSubFilter={
          PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.LOW_INVENTORY]?.isSubFilter
        }
        isViewMore={false}
        accessors={
          PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.LOW_INVENTORY]?.accessors
        }
        isBold={PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.LOW_INVENTORY]?.isBold}
        fifthCol={
          PRODUCT_ANALYSIS_PARAMS[PRODUCT_FILTERS.LOW_INVENTORY]?.fifthCol
        }
      />
    </div>
  );
};

export default ProdAnalysisWrapper;

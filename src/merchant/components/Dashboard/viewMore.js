import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../Navbar";
import { PRODUCT_ANALYSIS_PARAMS } from "./constants.js";
import { BsChevronLeft } from "react-icons/bs";
import ProductAnalysis from "./productAnalysis.js";

const ProductAnalysisViewMore = () => {
  const params = useParams();
  const { type } = params;

  const {state} = useLocation();
  const {subFilter, duration} = state;

  const navigate = useNavigate();

  return (
    <>
      <main className="app-merchant merchant-db">
        <Navbar theme="dashboard" />
        <div className="px-8 bg-white listing-page">
          <button
            className="flex items-center gap-1 mt-8"
            onClick={() => navigate(-1)}
          >
            <BsChevronLeft />
            Back
          </button>

          <div className="my-10 w-full max-w-[1500px]">
            <ProductAnalysis
              title={PRODUCT_ANALYSIS_PARAMS[type]?.title}
              filter={type}
              isSubFilter={PRODUCT_ANALYSIS_PARAMS[type]?.isSubFilter}
              isViewMore={true}
              accessors={PRODUCT_ANALYSIS_PARAMS[type]?.accessors}
              isBold={PRODUCT_ANALYSIS_PARAMS[type]?.isBold}
              fifthCol={PRODUCT_ANALYSIS_PARAMS[type]?.fifthCol}
              selectedSubFilter={subFilter}
              duration={duration}
            />
          </div>
        </div>
      </main>
    </>
  );
};

export default ProductAnalysisViewMore;

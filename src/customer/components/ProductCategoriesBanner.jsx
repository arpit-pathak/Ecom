import freshFood from "../../assets/buyer/fresh-food.svg";
import freshFoodText from "../../assets/buyer/Fresh-Food-text.svg";
import beautyPharmacy from "../../assets/buyer/beauty-pharmacy.svg";
import beautyPharmacyText from "../../assets/buyer/Beauty-&-Pharmacy-text.svg";
import partyBeverage from "../../assets/buyer/party-beverage.svg";
import partyBeverageText from "../../assets/buyer/Party-&-Beverage-text.svg";
import mumBabies from "../../assets/buyer/mummies-babies.svg";
import mumBabiesText from "../../assets/buyer/Mummies-Babies-text.svg";
import { Apis, BuyerApiCalls } from "../utils/ApiCalls";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomerRoutes } from "../../Routes";
import { useDispatch } from "react-redux";
import { setMainCategory, setSubCategoryName } from "../redux/reducers/categoryReducer";

const ExploreNowBtn = ({ slug, CatName }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <div
      className="bg-[#F5AB35] cp z-10 font-semibold text-white text-xs md:text-sm px-1 md:px-3 py-[5px] md:py-[10px] w-fit ml-2 md:ml-6 lg:ml-9 mb-3 lg:mb-6 rounded-sm"
      onClick={() => {
        dispatch(setMainCategory(CatName));
        dispatch(setSubCategoryName(CatName));
        navigate(CustomerRoutes.CategoryProductListing + slug + "/");
      }}
    >
      Explore now
    </div>
  );
};

const ProductCategoriesBanner = () => {
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    BuyerApiCalls({}, Apis.LandingCategoryCards, "GET", {}, (res) => {
      if (res.data) {
        setCategoryData(res.data.data?.category_group);
      }
    });
  }, []);

  return (
    <div className="flex items-center">
      <div className="flex-1">
        <div className="bg-[#F0E1D0] h-fit flex flex-col relative rounded mb-3">
          <div className="flex flex-col pl-4 md:pl-6 lg:pl-9 pt-4 pb-[66px] md:pb-[156px]">
            <img
              src={freshFoodText}
              alt="title"
              className="h-[21px] md:h-[43px] lg:h-[35px] w-[81px] md:w-[161px] lg:[w-131px]"
            />
            <p className="font-times text-xs leading-[10px] md:text-sm">
              Treat Yourself a better way
            </p>
          </div>
          <ExploreNowBtn slug={"fresh-food"} CatName={"Fresh Food"} />

          <img
            src={freshFood}
            alt="fresh-food-img"
            className=" w-[120px] h-[100px] md:w-[233px] md:h-[193px] lg:w-[276px] lg:h-[229px] absolute right-0 top-12 md:top-[85px] lg:top-[55px] xl:top-5"
          />
        </div>

        <div className="bg-[#F2E1DF] h-fit flex flex-col relative rounded">
          <div className="flex flex-col pl-4 md:pl-6 lg:pl-9 pt-5 pb-[108px] md:pb-[233px] lg:pb-[227px]">
            <img
              src={partyBeverageText}
              alt="title"
              className="h-[21px] w-[125px] md:h-[41px] lg:h-[35px] md:w-[248px] lg:w-[202px]"
            />
            <p className="font-times text-xs leading-[10px] md:text-sm">
              Share joy with friends at present
            </p>
          </div>
          <ExploreNowBtn slug={"party-beverage"} CatName={"Party & Beverage"} />

          <img
            src={partyBeverage}
            alt="party-img"
            className="absolute w-[110px] h-[120px] md:w-[209px] lg:w-[288px] md:h-[229px] lg:h-[277px] right-[1px] md:right-[5px]
            xl:right-[20px] bottom-0"
          />
        </div>
      </div>

      <div className="flex-1 pl-3">
        <div className="bg-[#E2E2EA] h-fit flex flex-col relative rounded mb-3">
          <div className="flex flex-col pl-4 md:pl-6 lg:pl-9 pt-5 pb-[110px] md:pb-[239px] lg:pb-[227px]">
            <img
              src={beautyPharmacyText}
              alt="title"
              className="h-[21px] w-[142px] md:h-[41px] lg:h-[35px] md:w-[284px] lg:w-[231px]"
            />
            <p className="font-times text-xs leading-[10px] md:text-sm">
              Meet a brighter self
            </p>
          </div>
          <ExploreNowBtn
            slug={"beauty-pharmacy"}
            CatName={"Beauty & Pharmacy"}
          />

          <img
            src={beautyPharmacy}
            alt="beauty-img"
            className="w-[125px] h-[135px] md:w-[234px] lg:w-[266px] md:h-[249px] lg:h-[272px] absolute right-0 bottom-0"
          />
        </div>

        <div className="bg-[#F0EADA] h-fit flex flex-col relative rounded">
          <div className="flex flex-col pl-4 md:pl-9 pt-5 md:pt-5 pb-[70px] md:pb-[160px] lg:pb-[152px]">
            <img
              src={mumBabiesText}
              alt="title"
              className="h-[21px] w-[123px] md:h-[35px] md:w-[199px]"
            />
            <p className="font-times text-xs leading-[10px] md:text-sm">
              Guard every little miracle
            </p>
          </div>
          <ExploreNowBtn slug={"mummies-babies"} CatName={"Mummies Babies"} />

          <img
            src={mumBabies}
            alt="baby-img"
            className="w-[105px] h-[112px] md:w-[196px] lg:w-[241px] md:h-[210px] lg:h-[258px] absolute right-1 md:right-2 lg:right-10 bottom-0"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductCategoriesBanner;

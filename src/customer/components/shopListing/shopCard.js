import { useParams, useNavigate } from "react-router-dom";
import { CustomerRoutes } from "../../../Routes";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import PromptLoginPopup from "../../utils/PromptLoginPopup";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setPrevUrl } from "../../redux/reducers/prevUrlReducer";

const ShopCard = ({ shop, from }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const params = useParams();
  const { slug } = params;
  const user = JSON.parse(localStorage.getItem("customer"));

  const [isOpen, setIsOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(shop?.is_follow === "Y");

  const followHandler = (sellerId) => {
    if (user) {
      const formData = new FormData();
      formData.append("id_merchant", sellerId);
      BuyerApiCalls(
        formData,
        Apis.followUnfollowSeller,
        "POST",
        {
          Authorization: `Bearer ${user.access}`,
        },
        (res, api) => {
          if (res.data.message === "Buyer successfully followed the seller.") {
            setIsFollowing(true);
          } else {
            setIsFollowing(false);
          }
        }
      );
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div
      className="my-3 w-full max-w-[1500px] bg-white shadow-md hover:shadow-xl px-4 flex py-6 hover:border
    hover:border-grey4Border items-center justify-between flex-wrap"
    >
      <div
        className="flex gap-2 mb-2 cp"
        onClick={() =>
          navigate(CustomerRoutes.ShopDetails + shop?.shop_slug + "/")
        }
      >
        <img src={shop?.shop_logo} alt="Shop Logo" height={60} width={60} />
        <div>
          <p className="font-semibold text-black mb-1">{shop?.shop_name}</p>
          <p className="text-xs mb-2">{shop?.shop_url}</p>
          <p className="text-xs text-gray-400">
            <span className="text-orangeButton">{shop?.followers}</span>{" "}
            Followers
          </p>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <div
          className="flex items-center mb-2 cp"
          onClick={() =>
            navigate(CustomerRoutes.ShopDetails + shop?.shop_slug + "/")
          }
        >
          <div className="bg-gray-300 h-12 w-[1px] mr-2"></div>
          <div className="flex flex-col items-center mr-2">
            <p className="text-orangeButton font-semibold">{shop?.products}</p>
            <p className="text-[11px] text-gray-400">Products</p>
          </div>
          <div className="bg-gray-300 h-12 w-[1px] mr-2"></div>
          <div className="flex flex-col items-center mr-2">
            <p className="text-orangeButton font-semibold">{shop?.ratings}</p>
            <p className="text-[11px] text-gray-400">Ratings</p>
          </div>
          <div className="bg-gray-300 h-12 w-[1px] mr-2"></div>
          <div className="flex flex-col items-center mr-2">
            <p className="text-orangeButton font-semibold">
              {shop?.response_rate}
            </p>
            <p className="text-[11px] text-gray-400 text-center">
              Response Rate
            </p>
          </div>
          <div className="bg-gray-300 h-12 w-[1px] mr-2"></div>
          <div className="flex flex-col items-center mr-2">
            <p className="text-orangeButton font-semibold">
              {shop?.response_time}
            </p>
            <p className="text-[11px] text-gray-400 text-center">
              Response Time
            </p>
          </div>
        </div>

        {from !== "products" && (
          <div className="flex flex-col">
            <button
              className="border border-gray-300 w-24 py-1 bg-white text-xs mb-2"
              onClick={() =>
                navigate(CustomerRoutes.ShopDetails + shop?.shop_slug + "/")
              }
            >
              VIEW SHOP
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => followHandler(shop?.id_merchant)}
                className={`flex justify-center items-center w-24 py-1 gap-1 border rounded-[2px] border-gray-300 bg-white text-xs`}
              >
                <p className="whitespace-nowrap">
                  {isFollowing ? "UNFOLLOW" : "+ FOLLOW"}
                </p>
              </button>
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <PromptLoginPopup
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          loginText="LOGIN AND FOLLOW"
          signupText="SIGN UP AND FOLLOW"
          navigateTo={CustomerRoutes.ShopList.replace(":slug", slug)}
          loginClick={() => {
            dispatch(
              setPrevUrl(CustomerRoutes.ShopList.replace(":slug", slug))
            );
            followHandler(shop?.id_merchant);
          }}
          signupClick={() => followHandler(shop?.id_merchant)}
        />
      )}
    </div>
  );
};

export default ShopCard;

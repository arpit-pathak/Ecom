import {
  PinterestIcon,
  PinterestShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterIcon,
  TwitterShareButton,
  WhatsappIcon,
  WhatsappShareButton,
} from "react-share";
import { AiOutlineHeart } from "react-icons/ai";

import instant from "../../../../assets/buyer/deliveryOptionIcon1.png";
import sameday from "../../../../assets/buyer/deliveryOptionIcon2.png";
import nextday from "../../../../assets/buyer/deliveryOptionIcon3.png";
import { BsHandbag } from "react-icons/bs";
import "./index.css";
import GroupBuyLabel from "../../../../components/groupBuy/groupBuyLabel.js";

const PreviewSection = ({
  product,
  priceToShow,
  guaranteedPrice,
  dealPrice,
  successTargetQty,
  soldQty,
  maxCampaignQty
}) => {

  return (
    <section className="w-full max-w-[1200px] mb-[32px] border rounded-md border-[#837277] md-[1200px]:px-16 px-8 my-12">
      <div className="flex-col md:flex md:flex-row md:h-fit py-8 gap-12">
        <div className="flex md:flex-col md:w-[400px] md:h-[544px] md:gap-5">
          <img
            src={product?.cover_image?.list_img}
            alt=""
            className="py-2 w-[400px] h-[400px] rounded-[5px] object-contain"
          />
          <div className="hidden md:flex md:justify-between ">
            <div className="flex gap-4 items-center">
              <p>Share</p>
              <WhatsappShareButton
                title="hey! Checkout this awesome product from uShop!"
                windowWidth="900"
                windowHeight="600"
              >
                <WhatsappIcon size={26} round={true} />
              </WhatsappShareButton>
              <TelegramShareButton title="hey! Checkout this awesome product from uShop!">
                <TelegramIcon size={26} round={true}></TelegramIcon>
              </TelegramShareButton>
              <TwitterShareButton>
                <TwitterIcon size={26} round={true} />
              </TwitterShareButton>
              <PinterestShareButton>
                <PinterestIcon size={26} round={true}></PinterestIcon>
              </PinterestShareButton>
            </div>

            <div className="flex">
              <AiOutlineHeart size={25} className="text-amber-500" />
              <p className="pl-2">Favourite</p>
              <p className="w-[30px]">0</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-wrap gap-4 w-fill h-fill mt-4 md:mt-0">
          <p className="md:text-2xl font-semibold text-poppins text-[14px] capitalize">
            {product?.name}
          </p>
          <p className="flex gap-[10px] text-orangeButton text-2xl font-semibold leading-6 text-poppins">
            {priceToShow}
          </p>

          {/* group buy */}
          <GroupBuyLabel
            dealPrice={dealPrice}
            originalPrice={priceToShow}
            guaranteedPrice={guaranteedPrice}
            remainingOrderQty={successTargetQty}
            soldQty={soldQty}
            maxCampaignQty={maxCampaignQty}
          />

          {/* variation section */}
          <div className="flex flex-col">
            <div className="flex flex-col gap-2">
              <p>
                {product?.variations.find(
                  (variation) => variation.variation_name !== null
                )?.variation_name ?? null}
              </p>

              <div className="flex gap-[12px] ">
                {product?.variations
                  ? product?.variations
                      .filter(
                        (variation) =>
                          variation.parent_id === null &&
                          variation.variation_value !== null
                      )
                      .map((variation, index) => {
                        return (
                          <div className="flex flex-col gap-2 capitalize">
                            {/* layer 1 */}
                            <div key={index} className="flex items-center">
                              <div
                                id={variation.id_product_variation}
                                className={`${
                                  index === 0 ? "bg-orangeButton" : "bg-white"
                                } border-[0.5px] px-1 border-greyBorder rounded-[2px] min-w-[66px] w-fit h-7 
                                  text-greyBorder font-normal text-[12px] leading-[18px] capitalize text-center pt-1`}
                              >
                                {variation.variation_value}
                              </div>
                            </div>
                          </div>
                        );
                      })
                  : null}
              </div>

              {/* second layer variation */}
              <p>
                {
                  product?.variations.find(
                    (variation) => variation?.child.length > 0
                  )?.child[0]?.variation_name
                }
              </p>
              <div className="flex gap-[12px] ">
                {product?.variations
                  ? product?.variations.map((variation, index) => {
                      return (
                        <div className="flex gap-[12px] capitalize">
                          {variation.child.map((childVariation, childIndex) => {
                            return (
                              <div key={index} className="flex items-center">
                                <div
                                  id={childVariation.id_product_variation}
                                  className={`${
                                    childIndex === 0 && index === 0
                                      ? "bg-orangeButton"
                                      : "bg-white"
                                  } border-[0.5px] border-greyBorder rounded-[2px] min-w-[66px] w-fit h-7 
                                          text-greyBorder font-normal text-[12px] leading-[18px] capitalize px-2
                                          pt-1 text-center`}
                                >
                                  {childVariation.variation_value}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })
                  : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[14px] leading-[21px] font-medium">
              Quantity
            </label>

            <div className="flex items-center gap-5">
              <div className="flex gap-[5px] justify-between items-center border-[0.5px] p-[5px] rounded-[4px] w-[95px] h-[32px] border-solid border-gray-400">
                <div className="flex w-6 h-6 bg-orangeButton items-center justify-center rounded-[2px]">
                  <div className="text-center text-white mx-auto">-</div>
                </div>

                <div className="flex items-center">
                  <p className="text-[14px] font-normal text-center">1</p>
                </div>
                <div className="flex w-6 h-6 bg-orangeButton items-center justify-center rounded-[2px]">
                  <div className="text-center text-white mx-auto">+</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 ">
            <label className="textNormal font-medium">
              Available Delivery Options
            </label>
            <div className="flex gap-4">
              {product?.available_shipping.includes(3) && (
                <div className="flex gap-4">
                  <img src={instant} className="h-12 w-10" alt=""></img>
                </div>
              )}
              {product?.available_shipping.includes(1) && (
                <div className="flex gap-4">
                  <img src={sameday} className="h-12 w-12" alt=""></img>
                </div>
              )}
              {product?.available_shipping.includes(2) && (
                <div className="flex gap-4">
                  <img src={nextday} className="h-12 w-10" alt=""></img>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-4 mt-2">
            <div className="max-sm:hidden flex">
              <div
                id="buyNow"
                className="text-center border-[1px] px-6 py-2 bg-orangeButton rounded-[4px] text-white text-[14px] 
              font-medium leading-6 min-w-[120px] h-[45px]"
              >
                Buy now
              </div>
            </div>
            <div className="max-sm:hidden flex">
              <div
                id="addToCart"
                className="flex gap-[10px] items-center border-2 px-6 py-2 border-orangeButton text-orangeButton font-medium rounded-[4px] min-w-[160px] h-[45px]"
              >
                <BsHandbag />
                Add to cart
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreviewSection;

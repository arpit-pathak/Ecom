import SEOComponent from "../../../utils/seo";
import { domainUrl } from "../../../apiUrls";
import { CustomerRoutes } from "../../../Routes";
import { BsArrowRight } from "react-icons/bs";

const BecomeASeller = () => {
  return (
    <>
      <SEOComponent
        title="Become Seller"
        description="Become Seller"
        ogTitle="Become Seller"
        ogDescription="Become Seller"
      />
      <div className="flex flex-col">
        <div className="relative">
          <div className="w-full pt-[38%] md:pt-[28.8%]">
            <img
              src="https://ushopweb.s3.ap-southeast-1.amazonaws.com/static-contents/Top-Banner.png"
              alt="becomeSellerHeaderImg"
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
          </div>
          <div className="absolute bottom-[4%] sm:bottom-[7%] xl:bottom-[8%] 2xl:bottom-[10%] left-[1%] sm:left-[8%] 2xl:left-[9%]">
            <p>
              <a
                href={`${domainUrl}seller/signup/`}
                className="text-center text-[10px] sm:text-[20px] xl:text-[35px] 2xl:text-[40px] leading-[45px] py-1 sm:py-2 2xl:py-3 px-3 sm:px-5 xl:px-8 2xl:px-10 text-white font-bold 
              bg-[#EA9000] rounded-md"
              >
                GET STARTED
              </a>
            </p>
          </div>
        </div>
        <div className="mx-28 mt-24 max-sm:mt-14">
          <p className="text-[#283167] font-bold text-3xl font-playfair">
            Let <span className="text-[#F5AD45]">uShop</span> <br /> remove your{" "}
            <br /> delivery worries.
          </p>
          <p className="mt-8 text-[#283167] font-playfair text-3xl">
            Built to sell <span className="italic underline">& fulfil</span>
          </p>
        </div>

        <div className="flex flex-col items-center text-[15px] justify-center mt-20 text-[#283167] max-sm:mx-12 max-sm:mt-14">
          <img
            src="https://ushopweb.s3.ap-southeast-1.amazonaws.com/static-contents/how-uShop-works-Summary.png"
            width="400"
            height="250"
          />

          <div className="text-center">
            <p>You only have to click confirm & pack the items.</p>
            <p className="my-2">
              The rest of how to deliver, will be taken care for you
            </p>
            <div className="flex justify-center max-sm:gap-1 gap-3 text-[#F5AD45] text-xs font-bold">
              <p>Island-wide</p>
              <div className="h-4 w-[1px] bg-[#F5AD45]"></div>
              <p>Flat-rate</p>
              <div className="h-4 w-[1px] bg-[#F5AD45]"></div>
              <p>Various delivery options</p>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center">
          <img
            src="https://ushopweb.s3.ap-southeast-1.amazonaws.com/static-contents/How-uShop-works.png"
            className="max-sm:w-full lg:max-w-[850px] my-20 max-sm:my-12"
          />
        </div>

        <div className="sm:mx-44 text-[#283167] mx-8 pb-20">
          <p className="text-xl sm:text-3xl font-bold">
            1. A range of delivery options
          </p>
          <div className="flex justify-between mt-3 text-justify sm:gap-20 gap-10 max-sm:flex-wrap">
            <div className="w-full sm:w-1/2 text-sm">
              <p>
                Simply switch on the delivery types that fit your operations, or
                delivery services you would like to include to boost your online
                competitiveness.
                <br />
                <br />
                No coding required.
              </p>
              <img
                alt=""
                className="my-3"
                width="400px"
                height="380px"
                src="https://ushopweb.s3.ap-southeast-1.amazonaws.com/static-contents/checkout.png"
              />
              <p>
                Your customers can choose the delivery date / time slot when
                they check out
              </p>
            </div>
            <div className="w-full sm:w-1/2 mt-[100px] max-sm:mt-0">
              <div className="flex gap-5 mb-5">
                <div className="h-6 w-6 max-sm:h-3 max-sm:w-3 mt-2">
                  <div className="rounded-full h-6 w-6 max-sm:h-3 max-sm:w-3 bg-[#283167]"></div>
                </div>
                <div className="text-[#283167]">
                  <p>Same Day</p>
                  <div className="flex gap-3 justify-between items-end text-sm ">
                    <p className="text-sm font-bold mt-2 w-4/5">
                      Your customers can receive their orders from you on the
                      same day. <br />
                      <br />
                      Delivered within specific time slots.
                    </p>
                    <p>$3.00 ^</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-5 mb-5">
                <div className="h-6 w-6 max-sm:h-3 max-sm:w-3 mt-2">
                  <div className="rounded-full h-6 w-6 max-sm:h-3 max-sm:w-3 bg-[#283167]"></div>
                </div>
                <div className="text-[#283167]">
                  <p>Scheduled</p>
                  <div className="flex gap-3 justify-between items-end text-sm ">
                    <p className="text-sm font-bold mt-2 w-4/5">
                      Your customers can pre-order 14days in advance and select
                      the actual date they want to receive the items.
                    </p>
                    <p>$3.00 ^</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-5 mb-5">
                <div className="h-6 w-6 max-sm:h-3 max-sm:w-3 mt-2">
                  <div className="rounded-full h-6 w-6 max-sm:h-3 max-sm:w-3 bg-[#283167]"></div>
                </div>
                <div className="text-[#283167]">
                  <p>Instant</p>
                  <div className="flex gap-3 justify-between items-end text-sm ">
                    <p className="text-sm font-bold mt-2 w-4/5">
                      Your customer’s orders will be processed for delivery upon
                      checking out.
                    </p>
                    <p>$3.00 ^</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-5 mb-5">
                <div className="h-6 w-6 max-sm:h-3 max-sm:w-3 mt-2">
                  <div className="rounded-full h-6 w-6 max-sm:h-3 max-sm:w-3 bg-[#283167]"></div>
                </div>
                <div className="text-[#283167]">
                  <p>3 - 5 Days</p>
                  <div className="flex gap-3 justify-between items-end text-sm ">
                    <p className="text-sm font-bold mt-2 w-4/5">
                      Actual receiving date uncertain, but will be delivered
                      within a window
                    </p>
                    <p>$1.50 ^</p>
                  </div>
                </div>
              </div>

              <p className="italic text-sm ml-10">
                ^ Minimum delivery rates to Seller, i.e. “Seller Portion”
              </p>
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-100 py-16 flex justify-center">
          <div className="flex flex-col  max-sm:mx-5">
            <p className="font-bold">People also viewed</p>
            <a
              className="bg-white border border-gray-200 flex justify-between gap-10 items-center 
            sm:w-[600px] w-full p-6 my-2 !text-black"
              href={CustomerRoutes.HelpWithId.replace(
                ":tab",
                "sellers-partners"
              ).replace(":slug", "what-are-the-delivery-rates")}
            >
              <p>What are the delivery rates?</p>
              <BsArrowRight size={20} />
            </a>

            <a
              className="bg-white border border-gray-200 flex justify-between gap-10 items-center 
            sm:w-[600px] w-full p-6 my-2 !text-black"
              href={CustomerRoutes.HelpWithId.replace(
                ":tab",
                "sellers-partners"
              ).replace(
                ":slug",
                "what-are-the-order-cut-off-timings-my-customers-can-last-place-their-orders-for-same-day-delivery"
              )}
            >
              <p className="w-9/12">
                What are the order cut-off timings my customers can last place
                their orders for Same Day delivery?
              </p>
              <BsArrowRight size={20} />
            </a>

            <a
              className="bg-white border border-gray-200 flex justify-between gap-10 items-center 
            sm:w-[600px] w-full p-6 my-2 !text-black"
              href={CustomerRoutes.HelpWithId.replace(
                ":tab",
                "sellers-partners"
              ).replace(
                ":slug",
                "how-should-i-arrange-my-operation-s-timing-to-pack-for-delivery"
              )}
            >
              <p>
                How should I arrange my operation’s timing to pack for delivery?
              </p>
              <BsArrowRight size={20} />
            </a>
          </div>
        </div>

        <div className="sm:mx-44 mx-8 py-20">
          <p className="text-xl sm:text-3xl font-bold text-[#283167] mb-1">
            2. Do you face these <br /> &nbsp; &nbsp;fulfilment issues?
          </p>
          <p className="text-xl sm:text-3xl font-bold text-[#F5AD45]">
            &nbsp; &nbsp;Try uShop as a solution
          </p>
          <img
            className="mt-8"
            src="https://ushopweb.s3.ap-southeast-1.amazonaws.com/static-contents/Comparison-Chart.png"
            alt="comparison-chart"
          />
        </div>

        <div className="lg:mx-44 sm:mx-20 mx-8">
          <p className="text-xl sm:text-3xl font-bold text-[#283167] mb-1">
            3. Why online stores need <br /> &nbsp; &nbsp;Same Day Delivery?
          </p>
          <p className="text-[#283167] text-sm pl-5 my-4">
            Shopping is inherently{" "}
            <span className="font-bold text-[#F5AD45]">impulsive</span>.
          </p>
          <p className="text-[#283167] text-sm pl-5 my-4">
            Use uShop to make shopping on your <br /> online shop almost like
            they’re in-stores.
          </p>

          <div className="flex max-sm:mx-10 justify-between items-center max-md:flex-wrap">
            <div className=" my-10">
              <div className="flex gap-2 items-center">
                <img
                  src="https://ushopweb.s3.ap-southeast-1.amazonaws.com/static-contents/Group-40509.png"
                  height={135}
                  width={135}
                />
                <p className="font-playfair mt-1">days wait</p>
              </div>
              <p className="text-sm text-center my-3">
                compete with <br /> physical stores’ <br /> “Same Day” receive
              </p>
            </div>

            <div className="flex flex-col items-center mt-6 my-10">
              <img
                src="https://ushopweb.s3.ap-southeast-1.amazonaws.com/static-contents/58.png"
                height={80}
                width={80}
              />
              <p className="text-sm text-center my-3 ">
                online shoppers will check out <br /> more items at stores that
                offer <br /> Same Day delivery
              </p>
              <p className="text-xs">Amazon, 2023</p>
            </div>

            <div className="flex flex-col items-center my-10">
              <p className="text-5xl font-playfair">
                9 <span className="text-sm">out of</span> 10
              </p>
              <p className="text-sm text-center my-3">
                online shoppers are willing to pay <br /> for Same Day services
              </p>
              <p className="text-xs">PwC, 2020</p>
            </div>
          </div>
        </div>

        <div className="lg:mx-44 sm:mx-20 mx-8 my-12">
          <p className="text-xl sm:text-3xl font-bold text-[#283167] mb-1">
            4. Online businesses <br /> &nbsp;&nbsp;&nbsp; use{" "}
            <span className="text-[#F5AD45]">uShop</span> because...
          </p>

          <div className="max-w-[900px] w-full pb-12">
            <div className="ml-10 mt-10">
              <p className="font-playfair text-6xl">01</p>
              <div className="flex gap-12 max-sm:gap-6 my-2">
                <div className="w-[400px]">
                  <p className="font-bold">Order Today, Receive Today:</p>
                </div>
                <p className="text-[#283167] w-full text-justify">
                  Able to close sales from last-minute crowd using existing
                  staff and stocks.
                </p>
              </div>
              <div className="h-[1px] bg-[#283167] w-full my-4"></div>
            </div>

            <div className="ml-10">
              <p className="font-playfair text-6xl">02</p>
              <div className="flex gap-12 max-sm:gap-6 my-2">
                <div className="w-[400px]">
                  <p className="font-bold">Clear date of receiving:</p>
                </div>
                <p className="text-[#283167] text-justify w-full">
                  Customers already indicated in the platform's calendar while
                  ordering. There is no extra admin work on your end, and
                  customers are also happier with fewer uncertainties regarding
                  when they will expect their online orders
                </p>
              </div>
              <div className="h-[1px] bg-[#283167] w-full my-4"></div>
            </div>

            <div className="ml-10">
              <p className="font-playfair text-6xl">03</p>
              <div className="flex gap-12 max-sm:gap-6 my-2">
                <div className="w-[400px]">
                  <p className="font-bold">
                    Island-wide delivery at single flat rate:
                  </p>
                </div>
                <p className="text-[#283167] text-justify w-full">
                  Easier cost planning
                </p>
              </div>
              <div className="h-[1px] bg-[#283167] w-full my-4"></div>
            </div>

            <div className="ml-10">
              <p className="font-playfair text-6xl">04</p>
              <div className="flex gap-12 max-sm:gap-6 my-2">
                <div className="w-[400px]">
                  <p className="font-bold">No sales commisions:</p>
                </div>
                <p className="text-[#283167] text-justify w-full">
                  No annual subscription, no additional sales commissions. Read
                  about transaction fee.
                </p>
              </div>
              <div className="h-[1px] bg-[#283167] w-full my-4"></div>
            </div>

            <div className="ml-10">
              <p className="font-playfair text-6xl">05</p>
              <div className="flex gap-12 max-sm:gap-6 my-2">
                <div className="w-[400px]">
                  <p className="font-bold">More options for your customers:</p>
                </div>
                <p className="text-[#283167] text-justify w-full">
                  You also gain another partner who would help you promote your
                  products.
                </p>
              </div>
              <div className="h-[1px] bg-[#283167] w-full my-4"></div>
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-100 py-16 flex justify-center">
          <div className="flex flex-col  max-sm:mx-5">
            <p className="font-bold">People also viewed</p>
            <a
              className="bg-white border border-gray-200 flex justify-between gap-10 items-center 
            sm:w-[600px] w-full p-6 my-2 !text-black"
              href={CustomerRoutes.HelpWithId.replace(
                ":tab",
                "sellers-partners"
              ).replace(":slug", "what-are-the-commissions-rate")}
            >
              <p>What are the commissions rate?</p>
              <BsArrowRight size={20} />
            </a>

            <a
              className="bg-white border border-gray-200 flex justify-between gap-10 items-center 
            sm:w-[600px] w-full p-6 my-2 !text-black"
              href={CustomerRoutes.HelpWithId.replace(
                ":tab",
                "sellers-partners"
              ).replace(":slug", "why-do-i-need-a-transaction-rate")}
            >
              <p>Why do I need a transaction rate?</p>
              <BsArrowRight size={20} />
            </a>
          </div>
        </div>

        <div className="bg-white mx-auto block py-20 flex justify-center gap-8">
          <a
            className="bg-[#F5AD45] px-10 py-4 text-lg max-sm:text-sm text-center text-white rounded-md font-bold"
            href={`${domainUrl}seller/signup/`}
          >
            GET STARTED
          </a>
          <p className="text-[#F5AD45] text-sm">
            Create your <br /> business account <br /> now. It’s free.
          </p>
        </div>
      </div>
    </>
  );
};

export default BecomeASeller;

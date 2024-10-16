import SEOComponent from "../../../utils/seo";
import { domainUrl } from "../../../apiUrls";

const OldBecomeASeller = () => {
  return (
    <>
      <SEOComponent
        title="Become Seller"
        description="Become Seller"
        ogTitle="Become Seller"
        ogDescription="Become Seller"
      />
      <div className="flex flex-col">
        <p>
          <img
            src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/becomeSellerHeaderImg.png"
            alt="becomeSellerHeaderImg"
            className="!h-80 !w-full object-cover"
          />
        </p>
        <div className="absolute flex flex-col space-y-10 top-40 mx-[80px]">
          <div className="text-[43px] font-bold">
            <p>Become A Seller On</p>
            <p className="text-amber-400">uShop</p>
          </div>
          <p>
            <a
              href={`${domainUrl}seller/signup/`}
              className="w-[174px] h-[44px] text-center py-2 px-5  text-white text-[16px] font-medium bg-[#F5AB35] rounded-[4px]"
            >
              Start Selling&nbsp;
            </a>
          </p>
        </div>
        <div className="flex flex-col space-y-5 items-center text-center mt-[61px] mb-[60px]">
          <p className="font-bold text-[32px]">Why Sell On uShop?</p>
          <p className="text-[14px]">
            uShop Offers You A Quick-marketplace to sell your products with
            faster delivery modes and lower commission rate
          </p>
        </div>
        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:justify-center mx-[50px] mb-[-150px]">
          <div className="relative w-full lg:w-1/3 flex flex-col items-center">
            <div className="top-0 border-[18px] shadow-lg rounded-full w-[160px] h-[160px] flex items-center justify-center z-20">
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/whySellOnUshopImg1.svg"
                alt="whySellOnUshopImgIcon"
                className="w-full h-full p-10"
              />
            </div>
            <div
              className="relative shadow-lg flex flex-row w-[348px] h-[300px] top-[-60px] justify-around z-10 bg-white
        border-transparent rounded-lg"
            >
              <div className="flex flex-col items-center text-center px-10 py-20 gap-4">
                <p className="font-bold text-[16px]">Receive Faster Payments</p>
                <p className="text-[14px]">
                  With a faster delivery, you can get a faster payment. You may
                  request for cash withdrawal anytime from your wallet and they
                  will be paid to you within 1-3 working days.
                </p>
              </div>
            </div>
            <div className="w-[398px] z-0">
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/whySellVector.svg"
                alt="whySellVectorIcon"
                className="relative w-full top-[-220px]"
              />
            </div>
          </div>
          <div className="relative w-full lg:w-1/3 flex flex-col items-center">
            <div
              className="top-0 border-[18px] shadow-lg rounded-full bg-white w-[160px] h-[160px] flex items-center 
        justify-center border-amber-400 z-20"
            >
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/whySellOnUshopImg2.svg"
                alt="whySellOnUshopImgIcon"
                className="w-full h-full p-10"
              />
            </div>
            <div
              className="relative shadow-lg flex flex-row w-[348px] h-[300px] top-[-30px]  justify-around z-10 bg-white 
        border-transparent rounded-lg"
            >
              <div className="flex flex-col items-center text-center px-10 py-20 gap-4">
                <p className="font-bold text-[16px]">Reach More Customers</p>
                <p className="text-[14px]">
                  We do the marketing and you focus on your selling. Our
                  quick-commerce platform will help you capture more customer
                  sales with a faster mode of delivery.
                </p>
              </div>
            </div>
            <div className="relative w-[398px] z-0 top-[-355px]">
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/whySellVector2.svg"
                alt="whySellVector2"
                className="relative w-full"
              />
            </div>
          </div>
          <div className="relative w-full lg:w-1/3 flex flex-col items-center">
            <div
              className="top-0 border-[18px] shadow-lg rounded-full  w-[160px] h-[160px] flex items-center justify-center 
        z-20"
            >
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/whySellOnUshopImg3.svg"
                alt="whySellOnUshopImg3Icon"
                className="w-full h-full p-10"
              />
            </div>
            <div
              className="relative shadow-lg flex flex-row w-[348px] h-[300px] top-[-60px]  justify-around z-10 
        bg-white border-transparent rounded-lg"
            >
              <div className="flex flex-col items-center text-center px-10 py-20 gap-4">
                <p className="font-bold text-[16px]">Faster Delivery Model</p>
                <p className="text-[14px]">
                  SAME DAY or IMMEDIATE DELIVERY We take care of the delivery
                  process for you. From posting the package for delivery all the
                  way to delivered, you and your buyer will get the status
                  updates.
                </p>
              </div>
            </div>
            <div className="w-[398px] z-0">
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/whySellVector.svg"
                alt="whySellVectorIcon"
                className="relative w-full top-[-220px]"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col p-10 space-y-5 items-center bg-gray-100">
          <p className="font-medium text-[32px] mb-[80px]">
            How To Sell Your Product On uShop
          </p>
          <div className="flex flex-col items-start md:flex-row">
            <p>
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/sellStepsUshopImg1.png"
                alt="sellStepsUshopImg1"
              />
            </p>
            <div className="flex flex-col items-start pl-20 text-center space-y-5">
              <p className="text-xl font-bold">Become An Ushop Seller</p>
              <p>Sign-up and register for a uShop Seller Account</p>
              <p>
                <a
                  href={`${domainUrl}seller/signup/`}
                  className="flex flex-row w-max py-2 px-4 border rounded-md border-orangeButton text-orangeButton"
                >
                  Start Selling&nbsp;
                </a>
              </p>
            </div>
          </div>
          <p>
            <img
              src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/sellStepsUshopFlowLine1.png"
              alt="sellStepsUshopFlowLine1"
            />
          </p>
          <div className="flex flex-col items-center md:flex-row">
            <div className="flex flex-col items-start pr-20 text-center space-y-5">
              <p className="text-xl font-bold">List Your Products</p>
              <p className="text-left">
                Complete your Profile, Shipment Settings, Finance Settings and
                start adding&nbsp;
                <br />
                your products for sale.
              </p>
              <p>
                <a
                  href={`${domainUrl}seller/signup/`}
                  className="flex flex-row w-max py-2 px-4 border rounded-md border-orangeButton text-orangeButton"
                >
                  Start Selling&nbsp;
                </a>
              </p>
            </div>
            <p>
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/sellStepsUshopImg2.png"
                alt="sellStepsUshopImg2"
              />
            </p>
          </div>
          <p>
            <img
              src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/sellStepsUshopFlowLine2.png"
              alt="sellStepsUshopFlowLine2"
            />
          </p>
          <div className="flex flex-col items-center md:flex-row">
            <p>
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/sellStepsUshopImg3.png"
                alt="sellStepsUshopImg3"
              />
            </p>
            <div className="flex flex-col items-start pl-20 text-center space-y-5">
              <p className="text-xl font-bold">Delivering Your Product</p>
              <p className="text-left">
                Receive orders from your buyers and confirm. Next, proceed to
                pack and&nbsp;
                <br />
                then hand-over to the deliveryman.
              </p>
              <p>
                <a
                  href={`${domainUrl}seller/signup/`}
                  className="flex flex-row w-max py-2 px-4 border rounded-md border-orangeButton text-orangeButton"
                >
                  Start Selling&nbsp;
                </a>
              </p>
            </div>
          </div>
          <p>
            <img
              src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/sellStepsUshopFlowLine1.png"
              alt="sellStepsUshopFlowLine1"
            />
          </p>
          <div className="flex flex-col  items-center md:flex-row">
            <div className="flex flex-col items-start pr-20 text-center space-y-5">
              <p className="text-xl font-bold">Get Paid For Your Sales</p>
              <p className="text-left">
                Once the order is delivered to your buyer and updated in the
                system, your&nbsp;
                <br />
                payment will be credited to your wallet within 10 days.
              </p>
              <p>
                <a
                  href={`${domainUrl}seller/signup/`}
                  className="flex flex-row w-max py-2 px-4 border rounded-md border-orangeButton text-orangeButton"
                >
                  Start Selling&nbsp;
                </a>
              </p>
            </div>
            <p>
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/sellStepsUshopImg4.png"
                alt="sellStepsUshopImg4"
              />
            </p>
          </div>
        </div>
        <div className="p-10 space-y-5 items-center md:flex md:flex-col">
          <p className="text-[32px] font-bold">Why Become A Seller On Ushop?</p>
          <div className="flex flex-row space-x-3 text-center justify-between ">
            <div className="flex flex-col items-center space-y-5 bg-white p-10 shadow-md flex-1">
              <p className="text-[16px]">Get More Customers</p>
              <hr className="border-b border-amber-400 w-1/2" />
              <p className="text-[12px]">
                We focus on the marketing for you and you can focus on building
                your products for sale.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-5 bg-white p-10 shadow-md flex-1">
              <p className="text-[16px]">Low Starting Cost</p>
              <hr className="border-b border-amber-400 w-1/2" />
              <p className="text-[12px]">
                Not sure of your product potential yet? List on uShop, as there
                is no starting cost. Simply list your products on our website
                and start selling. We don’t charge anything until there’s a
                sale.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-5 bg-white p-10 shadow-md flex-1">
              <p className="text-[16px]">Unbeatable Reach</p>
              <hr className="border-b border-amber-400 w-1/2" />
              <p className="text-[12px]">
                You can now provide your buyers a faster delivery method and
                they can get their products within the same day. Finding a
                suitable delivery provider will never be a problem for you as we
                integrate it directly with your orders.
              </p>
            </div>
          </div>
        </div>
        <div className="relative flex items-center h-[300px] p-5 bg-[#FFE2BE] md:flex-row">
          <div
            className="flex flex-col items-center text-center pl-20 md:items-start md:text-start 
                                md:w-3/4 space-y-5"
          >
            <p className="text-[32px] font-bold uppercase">
              Start your
              <span className="text-amber-400">ushop seller</span>
              Journey
            </p>
            <p className="text-[16px]">
              Why wait? Try on uShop to get faster sales and turnover.
              <br />
              Remember there’s no cost to it until you have a sale!
            </p>
            <div>
              <a
                href={`${domainUrl}seller/signup/`}
                className="flex flex-row w-max py-2 px-4 border rounded-md border-orangeButton 
                                            text-white bg-orangeButton "
              >
                Start Selling&nbsp;
              </a>
            </div>
          </div>
          <p>
            <img
              src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/startSellingOnUshopTruckImg.png"
              alt="startSellingOnUshopTruckImg"
            />
          </p>
        </div>
        <div className="flex flex-col items-start p-10">
          <p className="text-[32px] font-medium">Common Questions</p>

          <p classname="text-[32px] font-medium">
            &nbsp;
        </p>
         <p>
            <meta charset="utf-8" />1.What are the <span className = "whitepace-pre-wrap">
              Fees which uShop sellers will need to pay?</span>
        </p>
       <p>
            &nbsp;
        </p>
        <p>
            To use uShop, the fees to consider are only the:&nbsp;
        </p>
        <p>
            <meta charset="utf-8" /><span className = "whitepace-pre-wrap">a. Transaction Fee, and</span><br />
            <span className = "whitepace-pre-wrap">b. Seller’s portion of Delivery Fee</span>
        </p>
        <p>
            &nbsp;
        </p>
        <p>
            <meta charset="utf-8" />2. How is Transaction Fee Computed?
        </p>
        <p>
            &nbsp;
        </p>
        <p>
            <meta charset="utf-8" /><span className = "whitepace-pre-wrap">
              There are no registration fee or monthly recurring subscription to list on uShop.</span><br />
            <span className = "whitepace-pre-wrap">
              Only when a successful sale is transacted, a flat transaction fee of 5% will apply.</span><br />
            <span className = "whitepace-pre-wrap">
              This gives you unlimited listing server space, payment gateway for Masters/ Visa / &amp; Amex/ Gpay / ApplePay, direct porting of confirmed orders to the drivers for pickup, and other e-commerce platform function &amp; services.&nbsp;</span><br />
            &nbsp;
        </p>
        <p>
            <meta charset="utf-8" /><span className = "whitepace-pre-wrap">Here’s an example of the Transaction Fee</span>
        </p>
        <p>
            &nbsp;
        </p>
        <p>
            <img src="https://ushopweb.s3.ap-southeast-1.amazonaws.com/static-contents/shipping-logo/transaction_fee.png" width="622" height="160" />
        </p>
        <p>
            <meta charset="utf-8" /><span className = "whitepace-pre-wrap">The 5% Transaction Fee already includes the 9% GST.</span><br />
            <span className = "whitepace-pre-wrap">There will be no further deduction from the Take Home sum.</span>
        </p>
        <p>
            &nbsp;
        </p>
        <p>
            <span className = "whitepace-pre-wrap">3. What are the Delivery Options?</span>
        </p>
        <p>
            &nbsp;
        </p>
        <p>
            <meta charset="utf-8" /><span className = "whitepace-pre-wrap">There are 4 delivery options on uShop. Sellers are free to select whichever delivery options, 1 or more, to activate under Shipment Settings that is best fitting for your operations. e.g. To (i) match your store / warehouse’s opening days &amp; hours, or (ii) when your product will be ready to be picked up.</span><br />
            <br />
            <span className = "whitepace-pre-wrap">Once the Setting is saved, it will be applied universally across all your products.</span><br />
            <br />
            <span className = "whitepace-pre-wrap">When an order is confirmed, a notification will be sent to the following to alert you to prepare for pick-up on the:</span><br />
            <span className = "whitepace-pre-wrap">(a) uShop Dashboard &gt; Orders , as well as</span><br />
            <span className = "whitepace-pre-wrap">(b) emailed to the shop profile’s email</span>
        </p>
        <p>
            &nbsp;
        </p>
        <p>
            <img src="https://ushopweb.s3.ap-southeast-1.amazonaws.com/static-contents/shipping-logo/delivery-options-chart.png" width="652" height="818" />
        </p>
        <p>
            &nbsp;
        </p>
        <p>
            <meta charset="utf-8" /><span className = "whitepace-pre-wrap">
              For your confirmed orders, the (i) Date customer will receive, (ii) Time for Item to be packed by, and (iii) Time window when the driver will arrive to pickup will be tabulated in your Order list so as to assist your fulfilment operations.</span>
        </p>
        <p>
            &nbsp;
        </p>
        <p>
            <span className = "whitepace-pre-wrap">4. What are the Delivery Rates?</span>
        </p>
        <p>
            &nbsp;
        </p>
        <p>
            Our delivery rates starts from :
        </p>
        <p>
            &nbsp;
        </p>
        <p>
            $3.40 for J&amp;T Express 3 Days Delivery
        </p>
        <p>
            $8.50 for uParcel's Same Day Delivery/Scheduled Delivery
        </p>
        <p>
            $8+$0.35/km for uParcel's Instant Delivery
        </p>
        <p>
            &nbsp;
        </p>
        <p>
            5. Who pays the Delivery Fees during checkout of the Orders?
        </p>
        <p>
            &nbsp;
        </p>
        <p>
            <meta charset="utf-8" /><span className = "whitepace-pre-wrap">One of the special feature of uShop, is that Sellers can have full control of how much your portion of Delivery fees will be. Hence providing greater cost-planning control.</span>
        </p>
        <p>
            &nbsp;
        </p>
        <p>
            <meta charset="utf-8" /><span className = "whitepace-pre-wrap">You can set to cover a flat amount across (e.g. $3.99), or customise it as you deemed suitable. Do note there’s a minimum fee of $3 for uParcel’s Instant/Same Day/Scheduled and $1.50 for J&amp;T Express’s 3 Days delivery.&nbsp;</span>
        </p>
        <p>
            &nbsp;
        </p>
        <p>
            <span className = "whitepace-pre-wrap">5. What happends if there is a mixed cart of items from my shop that sells both time-sensitive and non time-sensitive products?</span>
        </p>
        <p>
            &nbsp;
        </p>
        <p>
            <meta charset="utf-8" /><span className = "whitepace-pre-wrap">As long as there is one time-sensitive item, whole cart will only be delivered using time-sensitive settings.</span>
        </p>
        <p>
            &nbsp;
        </p>
        <p>
            <img src="https://ushopweb.s3.ap-southeast-1.amazonaws.com/static-contents/shipping-logo/time_sensitive_Delivery.png" width="709" height="256" />
        </p>
        </div>
      </div>
    </>
  );
};

export default OldBecomeASeller;

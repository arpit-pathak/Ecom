import SEOComponent from "../../../utils/seo";
import { domainUrl } from "../../../apiUrls";

const AboutUsComponent = () => {
  return (
    <>
      <SEOComponent
        title="About Us"
        description="About Us"
        ogTitle="About Us"
        ogDescription="About Us"
      />
      <div className="flex flex-col">
        <div className="relative h-full">
          <p>
            <img
              src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/aboutPageHeaderImg.png"
              alt="aboutPageHeaderImg"
              className="w-full"
            />
          </p>
          <p className="absolute text-4xl md:text-7xl  font-bold top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white">
            About <span className="text-amber-400">Ushop</span>
          </p>
        </div>
        <div className="flex p-10 my-5 space-y-5 items-center justify-center md:flex-row gap-5">
          <div className="flex flex-col text-center md:text-start md:w-96 space-y-2 pr-14">
            <p className="text-amber-400 font-bold uppercase text-lg">
              Shop with us
            </p>
            <p className="capitalize text-2xl font-semibold">
              Shop from our platfrom and get the product delivered
            </p>
            <p className="text-sm">
              Check out and get it within the Same Day or Faster
            </p>
          </div>
          <div className="flex flex-col p-5 justify-center items-center space-y-5 shadow-md md:w-1/5 min-[1000px]:h-[400px]">
            <p>
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/valueOneIcon.png"
                alt="valueOneIcon"
              />
            </p>
            <p className="text-center font-bold ">Our Purpose</p>
            <p className="text-center">
              With technology, we aim to become the revolutional Quick Commerce
              platform that provide Same Day or Faster deliveries for our
              customers’ orders
            </p>
          </div>
          <div className="flex flex-col p-5 justify-center items-center space-y-5 shadow-md md:w-1/5 min-[1000px]:h-[400px]">
            <p>
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/valueTwoIcon.png"
                alt="valueTwoIcon"
              />
            </p>
            <p className="text-center font-bold ">Our Vision</p>
            <p className="text-center">
              Our vision is for all buyers to get their orders within the
              shortest time and for sellers to achieve a faster turnover
            </p>
          </div>
          <div className="flex flex-col p-5 justify-center items-center space-y-5 shadow-md md:w-1/5 min-[1000px]:h-[400px]">
            <p>
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/valueThreeIcon.png"
                alt="valueThreeIcon"
              />
            </p>
            <p className="text-center font-bold ">Our Purpose</p>
            <p className="text-center">
              We position to be the lowest cost Quick-Commerce platform that
              offers Same Day or Faster delivery for a huge range of products in
              Asia.
            </p>
          </div>
        </div>
        <div className="bg-[#FFF4E3] w-full md:h-96 flex items-center mb-8">
          <div className="flex flex-col gap-6 relative w-full items-center justify-center">
            <div className="text-center text-4xl font-['Poppins'] font-semibold  text-[#333333] mx-auto">
              Who we are engaged with...
            </div>
            <div className="text-center text-base font-['Poppins'] tracking-[0.17] leading-9 text-[#767676] self-stretch h-3/5 w-[880px] mx-auto">
              We are partnered with uParcel, the top same day delivery provider
              in Singapore which is also wholly run by us! uParcel covers same
              day island wide delivery in Singapore for over 500 local brands!
            </div>
            <p>
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/uparcelLogo.svg"
                alt="uparcelLogo"
                className="w-40 h-14"
              />
            </p>
          </div>
        </div>
        <div className="bg-[#F5AB35] flex flex-row relative items-center py-12 justify-evenly gap-5">
          <p className="w-2/5 lg:ml-20 ml-5">
            <img
              src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/boss.svg"
              alt="boss"
              className="max-w-[350px] w-full max-h-[350px]"
            />
          </p>
          <div className="self-start flex flex-col justify-start gap-2 relative h-80 items-stretch w-3/5 mr-20">
            <p>
              <img
                src="https://file.rendit.io/n/Rg9tgbeRlujrONHM5AX2.svg"
                className=" self-start relative w-12 mb-7 "
                alt=""
              />
            </p>
            <div className="text-xl font-['Poppins'] font-light leading-7 text-white mb-16 relative">
              Why need to wait for a few days when you can get it today. We aim
              to provide our buyers with a faster way to receive their orders.
            </div>
            <div className="whitespace-nowrap text-xl sm:text-2xl font-['Poppins'] leading-9 capitalize text-white mr-28 relative">
              William, Head of Operations, uParcel
            </div>
            <p>
              <img
                src="https://file.rendit.io/n/2s9XbqkyGmjlKNByCPU8.svg"
                className=" self-start relative w-10 ml-auto"
                alt=""
              />
            </p>
          </div>
        </div>
        <div className="w-fill h-[368px] mx-20 my-16 bg-amber-50">
          <div className="flex flex-col mx-20 my-24">
            <div className="flex gap-6 items-center">
              <p className="text-9xl">‘’</p>
              <div className="text-center">
                <p>
                  My first order arrived today in perfect condition. Bought a
                  mobile phone to be delivered by 2pm in the afternoon and
                  received it right on time. Such great service. Will buy again
                  in the future!
                </p>
              </div>
            </div>
            <p className="self-end">-Lee Ann</p>
            <div className="flex justify-between">
              <button className="capitalize border-2 border-[#FF9019] text-[#FF9019] font-semibold px-4 py-2 rounded-2xl">
                Leave Us A Review
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-center space-x-24 mb-8 p-12">
          <div className="flex flex-col items-center">
            <p>
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/Support.svg"
                alt="Support"
              />
            </p>
            <p className="text-center font-bold p-2">uShop Guarantee</p>
            <p className="text-center ">
              Up to 7 days return/refund policy&nbsp;
              <br />
              available for your peace of mind.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p>
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/Account.svg"
                alt="Account"
              />
            </p>
            <p className="text-center font-bold p-2">Personal Account</p>
            <p className="text-center">
              With big discounts, free delivery&nbsp;
              <br />
              and a dedicated support specialist.
            </p>
          </div>
          <div className="flex flex-col items-center">
            <p>
              <img
                src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/Saving.svg"
                alt="Saving"
              />
            </p>
            <p className="text-center font-bold p-2">Amazing Savings</p>
            <p className="text-center">
              Up to 70% off new products, you can&nbsp;
              <br />
              be sure of the best price.
            </p>
          </div>
        </div>
        <div className="relative mb-10">
          <p>
            <img
              src="https://ushopwebsite.s3.ap-southeast-1.amazonaws.com/static-contents/becomeSellerHeaderImg.png"
              alt="becomeSeller"
            />
          </p>
          <div className="absolute flex flex-col left-20 bottom-32 text-5xl font-bold">
            Interested In Selling On{" "}
            <span className="text-amber-400">uShop?</span>
          </div>
          <p>
            <a
              href={`${domainUrl}page/become-seller/`}
              className="absolute left-20 bottom-12 border-2 border-transparent bg-orangeButton px-4 py-2 mt-4 rounded 
            text-white font-medium capitalize"
            >
              Learn More&nbsp;
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default AboutUsComponent;

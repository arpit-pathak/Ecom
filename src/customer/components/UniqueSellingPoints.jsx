import onDemandCommerce from "../../assets/buyer/on-demand-ecommerce.svg";
import citywideSameDay from "../../assets/buyer/city-wide-same-day.svg";
import securePayments from "../../assets/buyer/secure-payments.svg";
import authenticatedSellers from "../../assets/buyer/authenticated-sellers.svg";

const sellingPointsData = [
  {
    img: onDemandCommerce,
    text: "On-demand Commerce",
  },
  {
    img: citywideSameDay,
    text: "Citywide Same Day",
  },
  {
    img: securePayments,
    text: "Secure Payments",
  },
  {
    img: authenticatedSellers,
    text: "Authenticated Seller",
  },
];

const UniqueSellingPoints = () => {
  return (
    <div className="flex gap-5 md:gap-20 lg:gap-28 xl:gap-48 px-2 py-5 items-center justify-center">
      {sellingPointsData.map((item, idx) => (
        <div
          key={`selling-point-${idx}`}
          className="flex flex-col gap-2 lg:flex-row items-center"
        >
          <img src={item.img} alt={`img-${idx + 1}`} className="w-[25px] h-[20px] lg:w-[44px] lg:h-[34px]" />
          <p className="text-black text-xs md:text-base leading-[15px] md:leading-[22px] pl-3 md:font-semibold">
            {item.text}
          </p>
        </div>
      ))}
    </div>
  );
};

export default UniqueSellingPoints;

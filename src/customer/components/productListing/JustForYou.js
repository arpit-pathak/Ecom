import { Link } from "react-router-dom";
import instant from "../../../assets/buyer/deliveryOptionIcon1.png";
import sameday from "../../../assets/buyer/deliveryOptionIcon2.png";
import nextday from "../../../assets/buyer/deliveryOptionIcon3.png";
import starIcon from "../../../assets/buyer/starIcon.png";
import productImg1 from "../../../assets/buyer/productImg1.png";

export default function JustForYou() {
  return (
    <div className="m-5 hidden">
      {/*remove 'hidden' from classname of the first div to show the component */}
      <div className="flex flex-row justify-between ">
        <p className="font-bold uppercase ">Just for you</p>
      </div>
      <div className="h-[2px] w-16 bg-amber-500 mb-4"></div>
      {/* you can use map function and pass array of object to it to avoid repetition of codes */}
      <div className="flex">
        <div className="grid grid-cols-1 bg-slate-200  w-fit h-fit mx-1 ">
          <img
            src={productImg1}
            className="bg-contain w-40 h-full"
            alt=""
          ></img>
          <div className="mx-2 grid">
            <p className="mt-2">iphone 13</p>
            <p className="my-1 text-amber-500 font-bold text-lg">$1200.00</p>
            <div className="flex justify-items-center items-center gap-4 my-2">
              <img src={instant} className="h-10 w-fit" alt=""></img>
              <img src={sameday} className="h-10 w-fit" alt=""></img>
              <img src={nextday} className="h-10 w-fit" alt=""></img>
            </div>
            <div className="flex gap-2 mb-2">
              <img src={starIcon} alt="" className="w-4 h-4"></img>
              <p className="text-sm">1.23</p>
              <p className="text-sm text-slate-400">60 ratings</p>
            </div>
            <Link
              to="/"
              className="bg-amber-500 text-white text-center px-2 py-1 mb-2
                    rounded-lg w-full"
            >
              View detail
            </Link>
          </div>
        </div>
        {/*copy paste */}
        <div className="grid grid-cols-1 bg-slate-200  w-fit h-fit mx-1 ">
          <img
            src={productImg1}
            className="bg-contain w-40 h-full"
            alt=""
          ></img>
          <div className="mx-2 grid">
            <p className="mt-2">iphone 13</p>
            <p className="my-1 text-amber-500 font-bold text-lg">$1200.00</p>
            <div className="flex justify-items-center items-center gap-4 my-2">
              <img src={instant} className="h-10 w-fit" alt=""></img>
              <img src={sameday} className="h-10 w-fit" alt=""></img>
              <img src={nextday} className="h-10 w-fit" alt=""></img>
            </div>
            <div className="flex gap-2 mb-2">
              <img src={starIcon} alt="" className="w-4 h-4"></img>
              <p className="text-sm">1.23</p>
              <p className="text-sm text-slate-400">60 ratings</p>
            </div>
            <Link
              to="/"
              className="bg-amber-500 text-white text-center px-2 py-1 mb-2
                    rounded-lg w-full"
            >
              View detail
            </Link>
          </div>
        </div>
        {/*copy paste */}
        <div className="grid grid-cols-1 bg-slate-200  w-fit h-fit mx-1 ">
          <img
            src={productImg1}
            className="bg-contain w-40 h-full"
            alt=""
          ></img>
          <div className="mx-2 grid">
            <p className="mt-2">iphone 13</p>
            <p className="my-1 text-amber-500 font-bold text-lg">$1200.00</p>
            <div className="flex justify-items-center items-center gap-4 my-2">
              <img src={instant} className="h-10 w-fit" alt=""></img>
              <img src={sameday} className="h-10 w-fit" alt=""></img>
              <img src={nextday} className="h-10 w-fit" alt=""></img>
            </div>
            <div className="flex gap-2 mb-2">
              <img src={starIcon} alt="" className="w-4 h-4"></img>
              <p className="text-sm">1.23</p>
              <p className="text-sm text-slate-400">60 ratings</p>
            </div>
            <Link
              to="/"
              className="bg-amber-500 text-white text-center px-2 py-1 mb-2
                    rounded-lg w-full"
            >
              View detail
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

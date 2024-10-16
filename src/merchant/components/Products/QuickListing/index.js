import { useNavigate } from "react-router-dom";
import Navbar from "../../Navbar";
import { MerchantRoutes } from "../../../../Routes";
import { BsChevronLeft } from "react-icons/bs";
import quickListSampleImg from "../../../../assets/seller/quickList/quickListSample.png";
import { FaCheckCircle } from "react-icons/fa";
import uploadIcon from "../../../../assets/seller/quickList/uploadIcon.png";
import barcodeIcon from "../../../../assets/seller/quickList/barcodeIcon.png";

const QuickListing = () => {
  const navigate = useNavigate();

  return (
    <>
      <main className="app-merchant merchant-db">
        <Navbar theme="dashboard" />
        <div className="breadcrumbs">
          <div className="page-title flex flex-row items-center gap-[12px]">
            <button
              className=""
              onClick={() => navigate(MerchantRoutes.Products)}
            >
              <BsChevronLeft />
            </button>{" "}
            Quick Listing
          </div>

          <ul>
            <li>
              <a href={MerchantRoutes.Landing}>Home {">"}</a>
            </li>
            <li>
              <a href={MerchantRoutes.Products}>My Products {">"}</a>
            </li>
            <li>Quick Listing</li>
          </ul>
        </div>

        <div className="!bg-white mx-16 my-12">
          <div className="w-full border border-dashed border-orangeButton rounded-md bg-white px-8 py-8">
            <div className="flex flex-col justify-center items-center">
              <div className="flex gap-8 justify-center items-center max-sm:flex-wrap">
                <img src={quickListSampleImg} alt="quick-list-sample" />
                <div className="flex flex-col gap-1">
                  <div className="flex gap-1 items-center">
                    <FaCheckCircle color="#F5AB35" />
                    <p className="font-bold text-sm">Product Category</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <FaCheckCircle color="#F5AB35" />
                    <p className="font-bold text-sm">Standard Images</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <FaCheckCircle color="#F5AB35" />
                    <p className="font-bold text-sm">Product Name</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <FaCheckCircle color="#F5AB35" />
                    <p className="font-bold text-sm">Description</p>
                  </div>
                  <div className="flex gap-1 items-center">
                    <FaCheckCircle color="#F5AB35" />
                    <p className="font-bold text-sm">Brand</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center my-8">
                <img
                  src={uploadIcon}
                  alt="upload"
                  className="mb-2 h-[75px] w-[75px]"
                />
                <img
                  src={barcodeIcon}
                  alt="barcode"
                  className="h-[90px] w-[167px]"
                />
              </div>

              <div className="cp bg-orangeButton rounded-md sm:w-64 w-48 py-2 flex flex-col items-center text-white
               mt-4 max-sm:text-sm" onClick={()=>navigate(MerchantRoutes.BarcodeUpload)}>
                <p className="font-bold">Start Quick Listing</p>
                <p className="italic">by barcode no.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default QuickListing;

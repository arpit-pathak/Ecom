
import Website from "../../../assets/buyer/affiliate/website.svg";
import Youtube from "../../../assets/buyer/affiliate/youtube.svg";
import Tiktok from "../../../assets/buyer/affiliate/tiktok.svg";
import Instagram from "../../../assets/buyer/affiliate/insta.svg";
import Ltk from "../../../assets/buyer/affiliate/ltk.svg";
import { Modal } from "../GenericComponents";


export const PLATFORM_IMAGES = [Website, Youtube, Tiktok, Instagram, Ltk];

export const PLATFORM_PARAMS = [
  "website_link",
  "youtube_link",
  "ticktok_link",
  "insta_link",
  "ltk_link",
];

export const PLATFORMS = {
  "website_link" : "Website", 
  "youtube_link" :"Youtube",
  "ticktok_link" : "Tiktok", 
  "insta_link" :"Instagram", 
  "ltk_link" :"Ltk"
};


export const AffiliateInfoModal = ({showModal, setShowModal}) => {
  return (
    <Modal
      open={showModal}
      width="w-[500px] min-w-[400px]"
      children={
        <div>
          <p className="font-bold">Info</p>
          <div className="my-3 h-[1px] bg-grey4Border w-full "></div>
          <p className="mb-5 text-sm">
            Please fill up your personal details to proceed with Affiliate
            Programme
          </p>
          <p className="mb-6 text-sm">
            Personal details can be updated under: <br />
            <span className="font-bold">
              My Account {">"} Personal Details {">"} Edit Details
            </span>
          </p>
          <div className="my-4 h-[1px] bg-grey4Border w-full"></div>
          <div className="flex justify-end">
            <button
              className="bg-orangeButton text-white px-6 py-1 rounded-md"
              onClick={() => setShowModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      }
    />
  );
};
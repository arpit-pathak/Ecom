import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BsChevronRight, BsChevronLeft, BsStarFill } from "react-icons/bs";
import { MdThumbUp, MdThumbDown } from "react-icons/md";
import ProductSlider from "./ProductSlider";
import ProductReview from "./ProductReview";
import { RatingBar } from "../../components/GenericComponents";
import reviewRatingVerified from "../../../assets/buyer/review_rating_verified.svg";
import { Apis, BuyerApiCalls } from "../../utils/ApiCalls";
import axios from "axios";
import { CiPlay1 } from "react-icons/ci";

function ProductReviewRating({
  productDetail
}) {
  //pagination
  const [perPage, setPerPage] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [buttons, setButtons] = useState([]);


  //review data
  const [reviewData, setReviewData] = useState(null);
  const [reviewList, setReviewList] = useState([]);
  const [ratingTotal, setRatingTotal] = useState(0);

  const videoRefs_thumbnails = useRef([]);
  const videoRefs_list = useRef([]);

  //fetch reviews
  useEffect(() => {
    if (productDetail) {
      let formData = new FormData();
      // formData.append("product_slug", productDetail.slug);
      // formData.append("list_length", perPage);
      // formData.append("page", currentPage);

      let prodReviewEndpoint = Apis.productReview + "?list_length=" + perPage + "&page=" + currentPage + "&product_slug=" + productDetail.slug
      let endpoints = [prodReviewEndpoint];
     
      axios.all(
        endpoints.map((endpoint) =>
          BuyerApiCalls(formData, endpoint, "GET", {}, processRes)
        )
      );
    }
  }, [productDetail, currentPage, perPage]);

  useEffect(() => {
    generatePaginations();
  }, [currentPage]);

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  //funcs
  function processRes(
    response,
    apiUrl,
  ) {
    const d = response.data.data;
    //console.log("response api data: ", d);

    //product rating 
    if (d.product_rating) {
      //console.log("test: ", d.product_review);
      //console.log("test: ", d.product_rating);
      setReviewList([...d.product_review]);
      setReviewData(d.product_rating);
      setTotalPages(Math.ceil(d.review_count / perPage));

      const drating = d.product_rating;
      setRatingTotal(drating.one_start_count + drating.two_start_count + drating.three_start_count + drating.four_start_count + drating.five_start_count);
      generatePaginations();
    }
  }

  const handleVideoClick = (index, videoRefs) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      } else if (video.mozRequestFullScreen) {
        // Firefox
        video.mozRequestFullScreen();
      } else if (video.webkitRequestFullscreen) {
        // Chrome, Safari and Opera
        video.webkitRequestFullscreen();
      } else if (video.msRequestFullscreen) {
        // IE/Edge
        video.msRequestFullscreen();
      }
    }
  };

  function generatePaginations() {
    const maxPagesToShow = 5; // Maximum number of pages to show

    // Calculate the left and right segments
    let leftSegmentStart = Math.max(currentPage - 2, 1);
    let rightSegmentEnd = Math.min(currentPage + 2, totalPages);

    // Ensure that the segments do not go beyond the total pages
    if (rightSegmentEnd - leftSegmentStart + 1 < maxPagesToShow) {
      if (currentPage <= 2) {
        rightSegmentEnd = Math.min(leftSegmentStart + maxPagesToShow - 1, totalPages);
      } else if (currentPage >= totalPages - 1) {
        leftSegmentStart = Math.max(rightSegmentEnd - maxPagesToShow + 1, 1);
      }
    }
    const pageButtons = [];
    for (let i = leftSegmentStart; i <= rightSegmentEnd; i++) {
      pageButtons.push(
        <button key={i} type="button"
          onClick={() => setCurrentPage(i)}
          className={`text-[16px] font-medium rounded-[5px] border-[1px]
border-[#E0E0E0] h-[32px] w-[32px] justify-center flex-col 
items-center transition hover:bg-[#F5AB35] hover:text-white ${currentPage === (i) ? 'bg-[#F5AB35] text-white' : 'text-[#333]'} p-[10px]`}>{i}</button>
      );
    }
    setButtons(pageButtons);
  }
  return (
    <>
      <div className="pt-[32px] pb-[60px]">
        {/* header */}
        <div className="flex flex-row items-center justify-between text-[18px] font-semibold mb-[40px]">
          <label className=" uppercase">Review & Ratings</label>
          {/* <button type="button" className="text-[16px] text-[#F5AB35] flex flex-row items-center">
            View all
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 15L12.5 10L7.5 5" stroke="#F5AB35" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button> */}
        </div>

        {/* contents */}
        {reviewData?.review_count === 0 ? (
          <p>There are no reviews yet</p>
        ) : (
       <div className="lg:flex lg:flex-row gap-[30px] items-start">
          {/* ratings */}
          <div className="flex flex-row items-center gap-[50px] shrink-0 mb-[20px] lg:mb-0">
            <div>
              <div className="flex flex-row gap-[10px] text-[38px] font-medium items-center">
                {reviewData ? <>{reviewData.avg_rating}</> : <>0.00</>}
                <svg xmlns="http://www.w3.org/2000/svg" width="35" height="36" viewBox="0 0 35 36" fill="none">
                  <path d="M3.96168 12.4137L12.6399 11.1164L16.5193 3.02698C16.6252 2.80549 16.7996 2.6262 17.0149 2.51721C17.5549 2.24299 18.2112 2.47151 18.4812 3.02698L22.3606 11.1164L31.0388 12.4137C31.2781 12.4489 31.4968 12.5649 31.6643 12.7407C31.8668 12.9547 31.9784 13.2427 31.9745 13.5413C31.9707 13.8399 31.8517 14.1248 31.6438 14.3332L25.365 20.6297L26.8484 29.5207C26.8832 29.7276 26.8609 29.9403 26.7842 30.1347C26.7074 30.3292 26.5792 30.4977 26.4141 30.621C26.249 30.7444 26.0536 30.8177 25.85 30.8326C25.6465 30.8475 25.4429 30.8035 25.2625 30.7055L17.5002 26.5078L9.73804 30.7055C9.52613 30.8215 9.28003 30.8602 9.04419 30.818C8.44947 30.7125 8.04956 30.1324 8.1521 29.5207L9.6355 20.6297L3.35669 14.3332C3.18579 14.161 3.073 13.936 3.03882 13.6899C2.94654 13.0746 3.36353 12.5051 3.96168 12.4137Z" fill="#F2C94C" />
                </svg>
              </div>
              <div className="text-[#828282] text-[14px] ">
                {reviewData ? reviewData.review_count : 0} Review(s)
              </div>
            </div>

            <div>
              <RatingBar index={5} reviewTotal={ratingTotal} reviewCounts={reviewData ? reviewData.five_start_count : 0}></RatingBar>
              <RatingBar index={4} reviewTotal={ratingTotal} reviewCounts={reviewData ? reviewData.four_start_count : 0}></RatingBar>
              <RatingBar index={3} reviewTotal={ratingTotal} reviewCounts={reviewData ? reviewData.three_start_count : 0}></RatingBar>
              <RatingBar index={2} reviewTotal={ratingTotal} reviewCounts={reviewData ? reviewData.two_start_count : 0}></RatingBar>
              <RatingBar index={1} reviewTotal={ratingTotal} reviewCounts={reviewData ? reviewData.one_start_count : 0}></RatingBar>
            </div>
          </div>

          {/* rating list */}
          <div className=" w-full">
            <label className="text-[18px] font-medium mb-[30px] block">Reviews with Images</label>
            {/* images - missing in api product/reviews */}
            {(reviewData?.review_images && reviewData?.review_images.length > 0) && <>
              <div className="flex flex-row items-center gap-[11px] mb-[35px]">
                {reviewData?.review_images.slice(0, 10).map((val, idx) => {
                   return val.media_type === "video" ? (
                     <div
                       className="relative h-[66px] w-[66px] cursor-pointer"
                       onClick={() =>
                         handleVideoClick(idx, videoRefs_thumbnails)
                       }
                     >
                       <CiPlay1
                         className="absolute top-1/2 left-1/2 transform
                       -translate-x-1/2 -translate-y-1/2 z-10 text-white"
                       />
                       <video
                         className={`bg-slate-500 h-full w-full rounded-[5px]`}
                         key={`reviewimgs-${idx}`}
                         alt=""
                         ref={(el) => (videoRefs_thumbnails.current[idx] = el)}
                       >
                         <source src={val.thumbnail_img} type="video/mp4" />
                         Your browser does not support the video.
                       </video>
                     </div>
                   ) : (
                     <img
                       className={`bg-slate-500 h-[66px] w-[66px] rounded-[5px]`}
                       alt=""
                       src={val.thumbnail_img}
                       key={`reviewimgs-${idx}`}
                     />
                   );
                })}

                {/* show more popup */}
                {/* <div className=" bg-slate-500 h-[66px] w-[66px] rounded-[5px] relative">
                <button className="text-[20px] font-medium text-center h-full w-full text-white">+30</button>
              </div> */}
              </div>
            </>}

            {/* list reviews max 2 and show drop down */}
            <div className="reviews-list">
              {/* loop here */}
              {(reviewList && reviewList.length > 0) && <>
                {reviewList.map((val, idx) => {
                  return (
                    <div
                      key={`review-items-${idx}`}
                      className="flex flex-col gap-[20px]"
                    >
                      <div className="review-header flex flex-row gap-[25px] text-[16px] font-medium">
                        <div className="rh-rating flex flex-row gap-[5px] items-center p-[5px] bg-[#219653] text-[14px] font-medium text-white rounded-[10px]">
                          {val.rating}
                          <div className="star-icon">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="13"
                              height="14"
                              viewBox="0 0 13 14"
                              fill="none"
                            >
                              <g clip-path="url(#clip0_417_20957)">
                                <path
                                  d="M1.47215 4.50003L4.69549 4.03157L6.13641 1.11038C6.17576 1.0304 6.24051 0.965654 6.32049 0.926299C6.52107 0.827275 6.76482 0.909795 6.86512 1.11038L8.30604 4.03157L11.5294 4.50003C11.6182 4.51272 11.6995 4.55462 11.7617 4.6181C11.8369 4.69539 11.8783 4.79939 11.8769 4.90722C11.8755 5.01506 11.8313 5.11792 11.7541 5.19319L9.42195 7.46692L9.97293 10.6776C9.98585 10.7523 9.97759 10.8291 9.94907 10.8993C9.92056 10.9695 9.87294 11.0304 9.81161 11.0749C9.75029 11.1194 9.6777 11.1459 9.6021 11.1513C9.5265 11.1567 9.45089 11.1408 9.38387 11.1054L6.50076 9.58958L3.61766 11.1054C3.53895 11.1473 3.44754 11.1613 3.35994 11.146C3.13904 11.1079 2.99051 10.8985 3.02859 10.6776L3.57957 7.46692L1.24744 5.19319C1.18396 5.13099 1.14207 5.04974 1.12938 4.96087C1.0951 4.7387 1.24998 4.53304 1.47215 4.50003Z"
                                  fill="white"
                                />
                              </g>
                              <defs>
                                <clipPath id="clip0_417_20957">
                                  <rect
                                    width="13"
                                    height="13"
                                    fill="white"
                                    transform="matrix(-1 0 0 1 13 0.017334)"
                                  />
                                </clipPath>
                              </defs>
                            </svg>
                          </div>
                        </div>

                        {val.title}
                      </div>

                      <div className="review-body">
                        <div className="review-text text-[14px] text-[#4F4F4F] mb-[20px]">
                          {val.description}
                        </div>

                        {/* review images */}
                        {val.images && val.images.length > 0 && (
                          <>
                            <div className="review-images flex flex-row gap-[11px] mb-[20px]">
                              {val.images.map((valimg, idx) => {
                                return valimg.media_type === "video" ? (
                                  <div
                                    className="relative h-[66px] w-[66px] cursor-pointer"
                                    onClick={() =>
                                      handleVideoClick(idx, videoRefs_list)
                                    }
                                  >
                                    <CiPlay1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 text-white" />

                                    <video
                                      className={`bg-slate-500 h-full w-full rounded-[5px]`}
                                      key={`reviewimgs-${idx}`}
                                      ref={(el) =>
                                        (videoRefs_list.current[idx] = el)
                                      }
                                    >
                                      <source
                                        src={valimg.thumbnail_img}
                                        type="video/mp4"
                                      />
                                      Your browser does not support the video.
                                    </video>
                                  </div>
                                ) : (
                                  <img
                                    alt=""
                                    key={`reviewimgs-${idx}`}
                                    src={`${valimg.thumbnail_img}`}
                                    className=" bg-slate-500 h-[66px] w-[66px] rounded-[5px]"
                                  />
                                );
                              })}
                            </div>
                          </>
                        )}

                        <div className="review-name-date-buttons flex flex-row items-center justify-between">
                          <div className="review-name-date flex flex-row items-center gap-[5px] text-[12px] font-medium text-[#828282]">
                            <span className="review-buyer">{val.rate_by}</span>
                            {/* <span className="review-certified-buyer flex flex-row items-center gap-[5px]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                              <path d="M8.38055 14.7374H7.67055L6.00055 13.0174H3.53055L3.00055 12.5174V10.0974L1.31055 8.37737V7.66737L3.00055 5.94737V3.51737L3.53055 3.01737H6.00055L7.67055 1.30737H8.38055L10.1005 3.01737H12.5305L13.0305 3.50737V5.94737L14.7405 7.66737V8.37737L13.0005 10.0974V12.5174L12.5005 13.0174H10.1005L8.38055 14.7374ZM6.73055 10.4974H7.44055L11.2105 6.72737L10.5005 6.01737L7.09055 9.43737L5.71055 8.05737L5.00055 8.76737L6.73055 10.4974Z" fill="#828282" />
                            </svg>
                            Certified Buyer,
                          </span> */}
                            <span>- {val.created_date}</span>
                          </div>

                          {/* <div className="review-thumbs flex flex-row items-center gap-[20px] text-[12px] text-[#4F4F4F]">
                          <button type="button" className="flex flex-row items-center gap-[5px]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                              <g clip-path="url(#clip0_417_21005)">
                                <path d="M10.9333 1.734L6.32492 6.35067C6.01659 6.659 5.84159 7.084 5.84159 7.52567L5.84159 15.8507C5.84159 16.7673 6.59159 17.5173 7.50825 17.5173L14.9999 17.5173C15.6666 17.5173 16.2666 17.1173 16.5249 16.509L19.2416 10.1673C19.9499 8.51733 18.7416 6.684 16.9499 6.684L12.2416 6.684L13.0333 2.86733C13.1166 2.45067 12.9916 2.02567 12.6916 1.72567C12.1999 1.24233 11.4166 1.24233 10.9333 1.734ZM2.49992 17.5173C3.41659 17.5173 4.16659 16.7673 4.16659 15.8507L4.16659 9.184C4.16659 8.26733 3.41659 7.51733 2.49992 7.51733C1.58325 7.51733 0.833255 8.26733 0.833255 9.184L0.833254 15.8507C0.833254 16.7673 1.58325 17.5173 2.49992 17.5173Z" fill="#828282" />
                              </g>
                              <defs>
                                <clipPath id="clip0_417_21005">
                                  <rect width="20" height="20" fill="white" transform="translate(20 20.0173) rotate(-180)" />
                                </clipPath>
                              </defs>
                            </svg>

                            20
                          </button>
                          <button type="button" className="flex flex-row items-center gap-[5px]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                              <g clip-path="url(#clip0_417_21011)">
                                <path d="M9.06675 18.3007L13.6751 13.684C13.9834 13.3757 14.1584 12.9507 14.1584 12.509L14.1584 4.184C14.1584 3.26733 13.4084 2.51733 12.4917 2.51733L5.00008 2.51733C4.33341 2.51733 3.73341 2.91733 3.47508 3.52567L0.758412 9.86733C0.050079 11.5173 1.25841 13.3507 3.05008 13.3507H7.75841L6.96675 17.1673C6.88341 17.584 7.00841 18.009 7.30841 18.309C7.80008 18.7923 8.58341 18.7923 9.06675 18.3007ZM17.5001 2.51733C16.5834 2.51733 15.8334 3.26733 15.8334 4.184L15.8334 10.8507C15.8334 11.7673 16.5834 12.5173 17.5001 12.5173C18.4167 12.5173 19.1667 11.7673 19.1667 10.8507V4.184C19.1667 3.26733 18.4167 2.51733 17.5001 2.51733Z" fill="#BDBDBD" />
                              </g>
                              <defs>
                                <clipPath id="clip0_417_21011">
                                  <rect width="20" height="20" fill="white" transform="translate(0 0.017334)" />
                                </clipPath>
                              </defs>
                            </svg>

                            20
                          </button>
                        </div> */}
                        </div>
                      </div>
                      <div className="divider-bar h-[1px] w-full bg-[#BDBDBD] mb-[30px]"></div>
                    </div>
                  );
                })}
              </>}
            </div>

            {/* pagination and length */}
            <div className="flex flex-row justify-between items-center">
              <div className="per-page flex flex-row gap-[12px] items-center">
                <select onChange={(e) => setPerPage(e.target.value)}
                  value={perPage}
                  className="text-[16px] text-[#4F4F4F] px-[10px] py-[5px] border-[#E0E0E0] border-[1px] rounded-[5px]">
                  <option value={2}>2</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                </select>
                <label className="text-[14px] text-[#828282]">Per Page</label>
              </div>

              {/* back next */}
              <div className="flex flex-row items-center gap-[18px]">
                {currentPage > 1 && <>
                  <button type="button" className="" onClick={() => prevPage()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                      <path d="M10.666 13.3508L5.33268 8.0175L10.666 2.68416" stroke="#4F4F4F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                </>}

                {buttons}

                {currentPage < totalPages && <>
                  <button type="button" onClick={() => nextPage()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
                      <path d="M5.33398 2.68408L10.6673 8.01742L5.33398 13.3507" stroke="#4F4F4F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </button>
                </>}

              </div>
            </div>
          </div>
        </div>)}
      </div>
    </>
  );
}
export default ProductReviewRating;

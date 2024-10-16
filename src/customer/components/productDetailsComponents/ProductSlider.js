import React, { useEffect, useState, useRef } from "react";
import ImgError from '../../../assets/seller/img_error.png';
import {
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";

function ProductSlider(media) {
  const [showLeftSlider, setShowLeftSlider] = useState(true);
  const [showRightSlider, setShowRightSlider] = useState(true);
  const [currentImage, setCurrentImage] = useState(null);
  const [mediaArr, setMediaArr] = useState([]);
  const [displayVideo,setVideo] = useState(null)

  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const minSwipeDistance = 50 
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVideoPresent, setIsVideoPresent] = useState(false);

  const videoRef = useRef(null);
  const slideLeft = () => {
    document.getElementById("slider").scrollLeft -= 500;
    setShowLeftSlider(false);
    setShowRightSlider(true);
  };
  const slideRight = () => {
    document.getElementById("slider").scrollLeft += 500;
    setShowRightSlider(false);
    setShowLeftSlider(true);
  };
  const imageCss =
    "h-[112.84px] w-[110.3px] box-border border-transparent hover:border hover:border-orangeButton";

  useEffect(() => {
    //if there is image(s), set the image 
    if( Object.keys(media["media"]).length > 0){
      setMediaArr([...media["media"]])
    }
    
    Object.keys(media["media"]).length > 0 && setMediaArr([...media["media"]]);
   if(media?.video && Object.keys(media["video"])!==undefined) {
      setVideo(media["video"]) 
      setIsVideoPresent(true);
    }
    // Object.keys
    //if there isnt any video, display the first image
   (media.video===undefined || media.video===null) && setCurrentImage(media["activeImage"] ?? media["media"][0]?.img);
  }, [media]);

  const onTouchStart = (e) => {
    setTouchEnd(null) // otherwise the swipe is fired even with usual touch events
    setTouchStart(e.targetTouches[0].clientX)
  }
  
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX)
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      if (isVideoPresent && displayVideo) {
        setVideo(null);
        setCurrentImage(mediaArr[0]?.img);
        document.getElementById("slider").scrollLeft += 100;
      } else if (currentIndex < mediaArr.length - 1) {
        setCurrentIndex((idx) => idx + 1);
        setCurrentImage(mediaArr[currentIndex + 1]?.img);
        document.getElementById("slider").scrollLeft += 100;
      }
    } else if (distance < -minSwipeDistance) {
      if (currentIndex > 0) {
        setCurrentIndex((idx) => idx - 1);
        setCurrentImage(mediaArr[currentIndex - 1]?.img);
        document.getElementById("slider").scrollLeft -= 100;
      } else if (currentIndex === 0 && isVideoPresent) {
        setVideo(media["video"]);
      }
    }
  };

  // if theres video -> display the video
  // if there isnt video -> display the image

  return (
    <div className="flex flex-col gap-5">
      <div
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {displayVideo ? (
          <video
            onMouseEnter={() => setVideo(media.video)}
            className="py-2 w-[400px] h-[400px] rounded-[5px]"
            controls
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
          >
            <source src={displayVideo.vdo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : currentImage ? (
          <img
            src={currentImage}
            alt=""
            className="py-2 w-[400px] h-[400px] rounded-[5px]"
          ></img>
        ) : (
          // <MdOutlineBrokenImage className="py-2 w-[499px] h-[400px] rounded-[5px]"></MdOutlineBrokenImage>
          <>
            <img
              src={ImgError}
              alt=""
              className="py-2 w-[400px] rounded-[5px] mx-auto block"
            />
          </>
        )}
      </div>

      <div className="relative md:flex md:flex-col md:w-[400px] ">
        {showLeftSlider && (
          <MdChevronLeft
            size={50}
            onClick={slideLeft}
            className="absolute opacity-50 hover:opacity-100 hover:cursor-pointer h-full left-0 bg-gray-200 z-10 w-[26.6px]"
          />
        )}

        <div
          id="slider"
          className="relative flex flex-row items-center overflow-x-hidden "
        >
          {media?.video && Object.keys(media?.video).length !== 0 && (
            <video
              ref={videoRef}
              onMouseEnter={() => {
                setVideo(media.video);
                videoRef.current.play();
                setCurrentImage(null);
              }}
              onMouseLeave={() => videoRef.current.pause()}
              className={imageCss}
              controls
              autoPlay
              loop
              playsInline
              muted
              preload="yes"
            >
              <source src={media.video.vdo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}

          <div className="flex w-full gap-4">
            {mediaArr &&
              mediaArr.length > 0 &&
              mediaArr.map((image, index) => {
                return (
                  <img
                    src={image?.img}
                    onMouseEnter={() => {
                      setCurrentImage(image?.img);
                      setVideo(null);
                    }}
                    alt=""
                    className={imageCss}
                    key={`img${index}`}
                  ></img>
                );
              })}
          </div>
        </div>
        {showRightSlider && (
          <MdChevronRight
            size={50}
            onClick={slideRight}
            className="absolute top-0 right-0 opacity-50 hover:opacity-100 hover:cursor-pointer h-full bg-gray-200 z-10 w-[26.6px]"
          />
        )}
      </div>
    </div>
  );
}
export default ProductSlider;

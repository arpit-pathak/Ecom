import React from "react";
import starIcon from "../assets/buyer/starIcon.png";
function RatingBar(props) {

  return (
    <div className="flex space-x-2 items-center">
      <p>{props.index}</p>
      <img src={starIcon} />
      <div className="bg-gray-200 h-2 w-[200px]  rounded-md"></div>
      {/* <div
        className={"bg-green-400 h-2  w-" + props.score + "/5  rounded-md"}
      ></div> */}
      <p>{props.reviews}</p>
    </div>
  );
}
export default RatingBar;


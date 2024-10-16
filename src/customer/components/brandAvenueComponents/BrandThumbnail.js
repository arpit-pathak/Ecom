import React from "react";
import { Link } from "react-router-dom";

function BrandThumbnail(props) {
  return (
    <Link to="" >
    <div className="flex flex-col my-2 m-5 items-center hover:border-t hover:border-amber-400">
      <img src={props.logo} alt=''/>  
    </div>
    </Link>
  );
}
export default BrandThumbnail;

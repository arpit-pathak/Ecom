import React from "react";
import { Links } from "../components/GenericSections";
import Navbar from "../components/navbar/Navbar";
import ushopBlogsHeaderImg from "../../assets/buyer/ushopBlogsHeaderImg.png";
import UshopBlog from "../components/footerComponents/blog/UshopBlog";
import { HeaderBanner } from "../components/GenericComponents";
import { useMediaQuery } from "@mui/material";

function UshopBlogsScreen() {
  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");
  return (
    <div className="min-h-screen flex flex-col">
      {/* {isLargeScreen ? <NewNavbar /> : <Navbar />} */}
      <Navbar />
      <HeaderBanner
        image={ushopBlogsHeaderImg}
        firstText="USHOP"
        secondText="BLOGS"
      />
      <UshopBlog />
      <Links />
    </div>
  );
}
export default UshopBlogsScreen;

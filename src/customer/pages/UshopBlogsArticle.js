import React from "react";
import { Links } from "../components/GenericSections";
import Navbar from "../components/navbar/Navbar";

import BlogArticle from "../components/footerComponents/blog/BlogArticle";
import { useMediaQuery } from "@mui/material";
function UshopBlogsScreen() {
  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");
  return (
    <div className="min-h-screen flex flex-col">
      {/* {isLargeScreen ? <NewNavbar /> : <Navbar />} */}
      <Navbar />
      <BlogArticle />
      <Links />
    </div>
  );
}
export default UshopBlogsScreen;

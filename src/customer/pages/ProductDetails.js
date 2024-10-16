import React from "react";
import { Links } from "../components/GenericSections";
import Navbar from "../components/navbar/Navbar";
import ProductConfiguration from "../components/productDetailsComponents/ProductConfiguration";
import { useMediaQuery } from "@mui/material";

function ProductDetailsScreen() {
  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");
  return (
    <div className="min-h-screen flex flex-col">
      {/* {isLargeScreen ? <NewNavbar /> : <Navbar />} */}
      <Navbar />
      <ProductConfiguration />
      <Links />
    </div>
  );
}
export default ProductDetailsScreen;

import React from "react";
import { Links } from "../components/GenericSections";
import Navbar from "../components/navbar/Navbar";
import { toggleSideBar } from "../utils/ToggleSideBar";
import MyCart from "../components/cartComponents/MyCart";
import { SideNav } from "../components/GenericComponents";
import { useMediaQuery } from "@mui/material";

function MyCartScreen() {
  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");
  return (
    <div className="min-h-screen flex flex-col">
      {/* {isLargeScreen ? <NewNavbar /> : <Navbar toggleSidebar={toggleSideBar} />} */}
      <Navbar />
      <SideNav toggleSideBar={toggleSideBar}></SideNav>

      <div className="hidden md:flex"></div>
      <div className="flex flex-col p-4 md:px-20 grow">
        <MyCart />
      </div>
      <Links />
    </div>
  );
}
export default MyCartScreen;

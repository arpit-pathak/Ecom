import React from "react";
import { Links } from "../../components/GenericSections";
import Navbar from "../../components/navbar/Navbar";
import SideBar from "../../components/accountDetailsComponents/Sidebar";
import Notifications from "../../components/accountDetailsComponents/Notifications";
import { useMediaQuery } from "@mui/material";

export default function ViewNotifications() {
  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");
  return (
    <div className="min-h-screen flex flex-col">
      {/* {isLargeScreen ? <NewNavbar /> : <Navbar />} */}
      <Navbar />
      <div className="md:mx-20">
        <div className="hidden sm:flex flex-cols-2 gap-8 py-4 ">
          <div className="flex flex-col w-[280px] divide-y-2 px-4" />
          <div className="flex flex-col basis-3/4 ">
            <p className="font-bold text-xl">Notifications</p>
          </div>
        </div>

        <div className="flex md:gap-[22px] py-4 ">
          <SideBar></SideBar>
          <Notifications />
        </div>
      </div>
      <Links></Links>
    </div>
  );
}

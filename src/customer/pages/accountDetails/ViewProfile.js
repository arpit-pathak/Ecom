import React, { useEffect, useState } from "react";
import Profile from "../../components/accountDetailsComponents/Profile";
import SideBar from "../../components/accountDetailsComponents/Sidebar";
import { Links } from "../../components/GenericSections";
import Navbar from "../../components/navbar/Navbar";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import ls from "local-storage";
import { useMediaQuery } from "@mui/material";

export default function ViewProfile() {
  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");
  const user = JSON.parse(localStorage.getItem("customer"));
  const [profile, setProfile] = useState(null);
  const [profilePic, setProfilePic] = useState();
  const processRes = (res, api) => {
    if (api === Apis.retrieveProfile) {
      setProfile(res.data.data);
      ls("isAffiliate", res.data.data?.is_affiliate);
      ls("isAffiliateNameAvailable", res.data.data?.full_name ? true : false);
      ls("promoPlatforms", res.data.data?.promotion_platform);

      return;
    }
  };
  useEffect(() => {
    BuyerApiCalls(
      {},
      Apis.retrieveProfile,
      "GET",
      {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${user.access}`,
      },
      processRes
    );
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      {/* {isLargeScreen ? (
        <NewNavbar />
      ) : (
        <Navbar profilePic={profilePic ? profilePic : null} />
      )} */}
      <Navbar />
      <div></div>
      <div className="md:mx-20">
        <div className="hidden md:flex md:flex-cols-2 gap-8 py-4 ">
          <div className="flex flex-col w-[250px] divide-y-2 mx-4" />
          <div className="flex flex-col basis-3/4 ">
            <p className="font-bold  text-[14px] md:text-[20px]">My Account</p>
          </div>
        </div>
        <div className="flex md:gap-[22px] py-4 ">
          <SideBar></SideBar>
          {profile && (
            <Profile
              profile={profile}
              setProfile={setProfile}
              setProfilePic={setProfilePic}
            ></Profile>
          )}
        </div>
      </div>
      <Links></Links>
    </div>
  );
}

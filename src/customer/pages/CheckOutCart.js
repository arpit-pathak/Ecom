import React from "react";
import { Links } from "../components/GenericSections";
import Navbar from "../components/navbar/Navbar";
import CheckOutCart from "../components/cartComponents/CheckOutCart";
function CheckOutCartScreen() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="px-4 md:px-20">
        <CheckOutCart />
      </div>
      <Links />
    </div>
  );
}
export default CheckOutCartScreen;

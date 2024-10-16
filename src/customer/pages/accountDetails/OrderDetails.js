import { Links } from "../../components/GenericSections";
import Navbar from "../../components/navbar/Navbar";
import React from "react";
import OrderDetailsComponent from "../../components/accountDetailsComponents/OrderDetails";

export default function OrderDetails() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <OrderDetailsComponent></OrderDetailsComponent>
      <Links></Links>
    </div>
  );
}

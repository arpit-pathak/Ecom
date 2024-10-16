import React from "react";
import { LogoNav } from "../components/GenericComponents";
import { Links, CommonBackground } from "../components/GenericSections";
import ForgotForm from "../../merchant/components/FormForgot";
import background from "../../assets/bg-landing.png";

export default function ForgotPasswordCustomer() {
  return (
    <div className="min-h-screen flex flex-col">
      <LogoNav />
      <section
        className="landing-login"
        style={{ backgroundImage: `url(${background})` }}
      >
        <CommonBackground>
          <ForgotForm />
        </CommonBackground>
        <Links />
      </section>
    </div>
  );
}

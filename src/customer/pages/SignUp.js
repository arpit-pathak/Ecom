import React from "react";
import { Links, CommonBackground } from "../components/GenericSections";
import SignUpForm from "../components/formComponents/forms/FormSignUp";
//css (reuse merchant)
import "../../css/animate.min.css";
import background from "../../assets/bg-landing.png";

export default function SignUp() {
  return (
    <div className="min-h-screen flex flex-col">
      <section
        className="landing-login"
        style={{ backgroundImage: `url(${background})` }}
      >
        <CommonBackground>
          <SignUpForm />
        </CommonBackground>
        <Links />
      </section>
    </div>
  );
}

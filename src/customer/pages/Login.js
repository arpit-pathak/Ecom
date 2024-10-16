import React from "react";
import { Links, CommonBackground } from "../components/GenericSections";
import LoginForm from "../components/formComponents/forms/FormLogin";

//css (reuse merchant)
import "../../css/animate.min.css";
import background from "../../assets/bg-landing.png";
import "../../css/navbar.css";

export default function LoginScreen() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col flex-wrap">
        <section
          className="landing-login"
          style={{ backgroundImage: `url(${background})` }}
        >
          <CommonBackground>
            <LoginForm />
          </CommonBackground>
          <Links />
        </section>
      </div>
    </div>
  );
}

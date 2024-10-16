import React from "react"
import { Link, useNavigate } from "react-router-dom";
import './css/404.css';
import { CustomerRoutes } from "./Routes"
//import LogoNav from "./customer/components/LogoNav"
//import background from './assets/bg-landing.png';
//import { Card } from "@mui/material"

export default function PageNotFound() {
    const navigate = useNavigate();
    const goBack = () => {
        navigate(-1);
    }
    return (
        < >
            {/*
            <LogoNav></LogoNav>
            <section className='landing-login h-screen w-screen grid justify-items-center' style={{ backgroundImage: `url(${background})` }}>
                <Card className="self-center w-2/6 h-1/3 text-center">
                    <p className="text-8xl mt-1 md:text-8xl sm:text-4xl"> 404</p>
                    <p className="text-4xl md:text-4xl sm:text-2xl">Page not found</p>
                    <p className="py-2">We are sorry, the page you requested could not be found</p>
                    <p className="pb-4">Please go back to the main page</p>
                    <Link onClick={goBack} to={CustomerRoutes.Landing} className="text-black text-2xl border-2 rounded-lg bg-amber-400 px-4 py-1">back</Link>
                </Card>
            </section>
            */}

            <div id='page404'>
                <div>
                    <div className="starsec"></div>

                    {/*
                      <div className="starthird"></div>
                <div className="starfourth"></div>
                <div className="starfifth"></div>
         */}
                </div>

                <div className="lamp__wrap">
                    <div className="lamp">
                        <div className="cable"></div>
                        <div className="cover"></div>
                        <div className="in-cover">
                            <div className="bulb"></div>
                        </div>
                        <div className="light"></div>
                    </div>
                </div>

                <section className="error">
                    <div className="error__content">
                        <div className="error__message message">
                            <h1 className="message__title">Page Not Found</h1>
                            <p className="message__text">We're sorry, the page you were looking for isn't found here. The link you followed may either be broken or no longer exists. Please try again, or take a look at our.</p>
                        </div>
                        <div className="error__nav e-nav">

                            <Link onClick={goBack} to={CustomerRoutes.Landing} className="e-nav__link"></Link>
                        </div>
                    </div>
                </section>
            </div>

        </>
    )
}
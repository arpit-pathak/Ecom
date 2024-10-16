import React, { useState, useEffect } from "react";
import { Links } from "../components/GenericSections";
import Navbar from "../components/navbar/Navbar";
import { BuyerApiCalls, Apis } from "../utils/ApiCalls";
import parse from "html-react-parser";
import { useParams } from "react-router-dom";

import AboutUsComponent from "../components/footerComponents/aboutUs";
import BecomeASeller from "../components/footerComponents/becomeSeller";
import SEOComponent from "../../utils/seo";
import { useMediaQuery } from "@mui/material";

function FooterLinkComponent() {
  const [content, setContent] = useState(null);
  const params = useParams();
  const { slug } = params;

  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");

  const processResponse = (res) => {
    setContent(res.data.data);
  };

  useEffect(() => {
    if (slug !== "about-us" && slug !== "become-seller") {
      BuyerApiCalls(
        { slug: slug },
        Apis.staticPages,
        "GET",
        {},
        processResponse,
        null
      );
    }
  }, [slug]);

  return (
    <>
      <SEOComponent
        title={content?.static_content?.meta_title}
        description={content?.static_content?.meta_description}
        ogTitle={content?.static_content?.meta_title}
        ogDescription={content?.static_content?.meta_description}
      />
      <div className="min-h-screen flex flex-col">
        {/* {isLargeScreen ? <NewNavbar /> : <Navbar />} */}
        <Navbar />
        <div className="flex flex-col">
          {slug === "about-us" ? (
            <AboutUsComponent />
          ) : (
            <>
              {slug === "become-seller" ? (
                <BecomeASeller />
              ) : (
                <>
                  {content &&
                    content.static_content &&
                    content.static_content.description &&
                    parse(content.static_content.description)}
                </>
              )}
            </>
          )}
        </div>
        <Links />
      </div>
    </>
  );
}

export default FooterLinkComponent;

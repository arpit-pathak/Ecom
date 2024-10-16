import React,  { useEffect, useState } from "react";
import { Links } from "../../components/GenericSections";
import Navbar from "../../components/navbar/Navbar";
import { CustomerRoutes } from "../../../Routes";
//icons
import { BiPackage, BiGift } from "react-icons/bi";
import {
  RiSecurePaymentLine,
  RiCustomerService2Fill,
  RiFileList3Line,
  RiShoppingBasket2Line,
} from "react-icons/ri";
import { BsChatLeft, BsArrowLeft } from "react-icons/bs";
import { FaRegHandshake } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";

//images
import HelpScreenBgHeaderImg from "../../../assets/buyer/HelpScreenBgHeaderImg.png";
import ContactUsComp from "../../components/footerComponents/faq/ContactUsComponent";
import ContentSection from "../../components/footerComponents/faq/ContentSection";
import { BuyerApiCalls, Apis } from "../../utils/ApiCalls";
import { PageLoader } from "../../../utils/loader";
import { useMediaQuery } from "@mui/material";

const formLabelSvgClass = "text-black";

const TabValues = [
  {
    icon: <BiPackage />,
    text: "Return & Refund",
    url: "return-refund",
  },
  {
    icon: <RiSecurePaymentLine />,
    text: "Payments",
    url: "payments",
  },
  {
    icon: <RiCustomerService2Fill />,
    text: "Contact Us",
    url: "contact-us",
  },
  {
    icon: <BsChatLeft />,
    text: "General",
    url: "general",
  },
  {
    icon: <BiGift />,
    text: "Vouchers & Rewards",
    url: "vouchers-rewards",
  },
  {
    icon: <RiFileList3Line />,
    text: "Orders & Shipping",
    url: "orders-shipping",
  },
  {
    icon: <FaRegHandshake />,
    text: "Sellers & Partners",
    url: "sellers-partners",
  },
  {
    icon: <RiShoppingBasket2Line />,
    text: "Shop with uShop",
    url: "shop-with-uShop",
  },
];

export default function FaqComp() {
  const navigate = useNavigate();
  // const isLargeScreen = useMediaQuery("(min-width: 1150px)");
  const { tab, slug } = useParams();
  const [faq, setFaq] = useState(null);
  const [activeTab, setActiveTab] = useState(TabValues[2]);
  const [searchInput, setSearchInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [faqCategories, setFaqCategories] = useState([]);
  const [showSubSection, setShowSubSection] = useState(
    new Array(TabValues.length).fill(false)
  );
  const [filteredFaq, setFilteredFaq] = useState([]);
  const [currentSubCategory, setCurrentSubCategory] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    let tabIndex = TabValues.findIndex((item) => item.url === tab);
    setActiveTab(TabValues[tabIndex]);
  }, [tab]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFaq();
  };

  const setTab = (tab) => {
    setSearchInput("");
    setActiveTab(tab);
    setFilteredFaq([]);
    let sections = new Array(TabValues.length).fill(false);
    setShowSubSection([...sections]);
    setCurrentCategory(null)
    setCurrentSubCategory(null)
    navigate(CustomerRoutes.Help.replace(":tab", tab.url));
  };

  const processRes = (res) => {
    setFaq(res.data.data?.user_faq ?? []);
    setFilteredFaq(res.data.data?.user_faq ?? []);
    setFaqCategories(res.data.data?.faq_category);
    setIsLoading(false);
  };

  const fetchFaq = () => {
    let formData = new FormData();
    formData.append("faq_type", activeTab?.url ?? "contact us");
    formData.append("search", searchInput ?? "");
    BuyerApiCalls(formData, Apis.retreiveFaq, "POST", {}, processRes);
  };

  useEffect(() => {
    setIsLoading(true);
    fetchFaq();
  }, [activeTab]);

  const handleSubsections = (e, index) => {
    e.preventDefault();
    let id = faqCategories[index]?.id_faq_category;
    filterCategories(id);
    setCurrentSubCategory(null);
    setCurrentCategory(id);
    let sections = [...showSubSection];
    for(let i = 0; i < sections.length; i++){
      if(i === index)  sections[i] = !sections[i];
      else  sections[i] = false;
    }
       setShowSubSection([...sections]);
  };

  const filterCategories = (id) => {
    let currentFaqs = faq.filter((item) => item?.faq_category_parent_id === id);
    setFilteredFaq([...currentFaqs]);
  };

  const filterSubcategories = (id) => {
    let currentFaqs = faq.filter((item) => item?.faq_category_id === id);
    setFilteredFaq([...currentFaqs]);
    setCurrentSubCategory(id);
  };

  return (
    <React.Fragment>
      {/* {isLargeScreen ? <NewNavbar /> : <Navbar />} */}
      <Navbar />
      <div className="flex flex-col space-y-5 items-center">
        {/* Generic section */}
        <div className="flex flex-col">
          <div className="relative w-full">
            <img src={HelpScreenBgHeaderImg} alt="" />

            <div className="flex flex-col space-y-2 md:space-y-5 items-center justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <p className="capitalize text-xs md:text-xl font-bold">
                Hi How Can We Help You?
              </p>
              <form className="flex justify-between items-center bg-white w-full gap-2 pl-4 border-transparent rounded h-7 md:h-10">
                <div className="flex items-center gap-2">
                  <img
                    src="https://file.rendit.io/n/gkdIFv0ZDznIrlhsyx5D.svg"
                    className="min-w-0 relative w-3"
                    alt=""
                  />

                  <input
                    className="text-xs md:text-xl"
                    type="text"
                    id="query"
                    name="query"
                    value={searchInput}
                    placeholder="Search for Queries"
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <button
                  className="text-xs md:text-xl bg-[#f5ab35] h-full px-4 border-r-transparent rounded items-end"
                  onClick={handleSearch}
                >
                  Search
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-row py-4 px-16">
            <div
              onClick={() => setTab(TabValues[2])}
              className="flex text-black items-center cp"
            >
              <BsArrowLeft className="mr-2" />
              Back To Help Centre
            </div>
          </div>

          <div className="justify-between bg-gray-100 md:flex flex-row px-16">
            {TabValues.map((button) => (
              <div
                className={`flex items-center py-2 py-4 text-black hover:text-amber-500 cp 
                ${activeTab?.text === button?.text ? "!text-amber-500" : ""}`}
                onClick={() => setTab(button)}
              >
                {button.icon}
                <div className="whitespace-nowrap text-sm ml-1">
                  {button.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* tab content */}
        {isLoading ? (
          <PageLoader />
        ) : (
          <>
            {activeTab?.text === "Contact Us" ? (
              <ContactUsComp />
            ) : (
              <div className="pb-8 w-full flex gap-8  px-16 max-w-[1440px]">
                <div className="w-1/3 max-w-64">
                  {/* setFilteredFaq */}
                  <div
                    className="font-bold mt-2 cp"
                    onClick={(e) => {
                      setCurrentCategory(null);
                      setCurrentSubCategory(null);
                      setFilteredFaq([...faq]);
                    }}
                  >
                    {activeTab?.text}
                  </div>
                  {faqCategories?.map((category, index) => {
                    return (
                      <div>
                        <div className="font-bold mt-2 cp text-sm">
                          <div
                            className="flex items-center justify-between"
                            onClick={(e) => handleSubsections(e, index)}
                          >
                            <p
                              className={`${
                                currentCategory === category?.id_faq_category
                                  ? "text-orangeButton"
                                  : "text-black"
                              }`}
                            >
                              {category?.name}
                            </p>
                            {showSubSection[index] ? (
                              <BsChevronUp className={`${formLabelSvgClass}`} />
                            ) : (
                              <BsChevronDown
                                className={`${formLabelSvgClass}`}
                              />
                            )}
                          </div>
                        </div>
                        {showSubSection[index] &&
                          category?.sub_categories?.map((subCategory) => {
                            return (
                              <div
                                className={`mt-2 cp text-sm ${
                                  currentSubCategory ===
                                  subCategory?.id_faq_category
                                    ? "text-orangeButton"
                                    : "text-black"
                                }`}
                                onClick={(e) =>
                                  filterSubcategories(
                                    subCategory?.id_faq_category
                                  )
                                }
                              >
                                {subCategory?.name}
                              </div>
                            );
                          })}
                      </div>
                    );
                  })}
                </div>
                <div className="w-full">
                  {filteredFaq ? (
                    filteredFaq.length > 0 ? (
                      filteredFaq.map((item, index) => (
                        <ContentSection
                          question={item.question}
                          answer={item.answer}
                          id={index}
                          isExpanded={slug ? item?.slug === slug : false}
                        />
                      ))
                    ) : (
                      <p className="text-center my-10">No FAQs found</p>
                    )
                  ) : null}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Links />
    </React.Fragment>
  );
}

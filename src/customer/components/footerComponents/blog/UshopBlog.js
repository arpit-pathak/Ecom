import React from "react";
import { useState, useEffect } from "react";
import { BuyerApiCalls, Apis } from "../../../utils/ApiCalls";
import { NavLink } from "react-router-dom";
import { CustomerRoutes } from "../../../../Routes";
import { useParams } from 'react-router-dom';

//Components
import {
  GraySearchBar,
  BlogThumbNail,
  OrangeHyperlink,
  PageNavigator,
} from "../../GenericComponents";
//assets
import adBannerImgSm2 from "../../../../assets/buyer/adBannerImgSm2.png";

function UshopBlog() {
  const [blogs, setBlogs] = useState([])
  const [category, setCategory] = useState([])
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { category_slug } = useParams();
  let isFirstCategoryRendered = false;


  const processCategory = (res) => {
    setCategory(res.data.data)
    setPageCount(res.data.total_pages);
  };

  const handlePaginaton = (page) => {
    var formData = new FormData();
    if (page) {
      setCurrentPage(page);
      // formData.append("page", page);
    }
    if (category_slug) {
      let blogListEndpoint = Apis.blogList + "?category_slug=" + category_slug;
      if (page) {
        blogListEndpoint += "&page=" + page;
      }
      // formData.append("category_slug", category_slug);
      BuyerApiCalls(formData, blogListEndpoint, "GET", {}, processResponse, null);
    } else {     
      BuyerApiCalls({ "page": page }, Apis.blogCategory, "GET", {}, processCategory, null)
    }
  };

  const processResponse = (res) => {
    const blogsData = res.data.data;
    setPageCount(res.data.total_pages);
    setBlogs(blogsData)
  };

  useEffect(() => {
    var formData = new FormData();
    if (category_slug) {
      let endpoint =  Apis.blogList + "?category_slug="+category_slug
      // formData.append("category_slug", category_slug);
      BuyerApiCalls(formData, endpoint, "GET", {}, processResponse, null);
    }
    BuyerApiCalls({}, Apis.blogCategory, "GET", {}, processCategory, null);

  }, [category_slug]);

  const handleSearch = (searchValue) => {
    var formData = new FormData();
    if (category_slug) {
      let endpoint =  Apis.blogList + "?category_slug=" + category_slug + "&search=" + searchValue
      // formData.append("category_slug", category_slug);
      // formData.append("search", searchValue);
      BuyerApiCalls(formData, endpoint, "GET", {}, processResponse, null);
    } else {
      BuyerApiCalls({ "search": searchValue }, Apis.blogCategory, "GET", {}, processCategory, null);
    }
  }


  return (
    <>
      <div className="flex flex-col p-10 space-y-10">
        {/* Medium screen layout */}
        <div className="space-y-10 md:flex md:flex-col">
          <div className="flex flex-row justify-between">
            <div className="flex flex-wrap gap-5">
              <NavLink
                to={CustomerRoutes.UshopBlogs}
                className={({ isActive }) =>
                  `py-2 px-5 border rounded-md ${isActive ? 'border-amber-400 bg-amber-400 text-white' : 'border-amber-400 text-black hover:text-amber-500'
                  }`
                }
              >
                All
              </NavLink>
              {category && category.map((item, index) => {
                return (
                  <NavLink
                    key={index}
                    to={`${CustomerRoutes.UshopBlogs}${item.slug}/`}
                    className={({ isActive }) =>
                      `py-2 px-5 border rounded-md ${isActive ? 'border-amber-400 bg-amber-400 text-white' : 'border-amber-400 text-black hover:text-amber-500'
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                )
              })}
            </div>
            <GraySearchBar
              placeholder="Search For Queries"
              onSearchChange={searchValue => {
                handleSearch(searchValue);
              }}
            />
          </div>

          {category_slug ? (
            <>
              {blogs && blogs.length === 0 ? (
                <p className="text-center">No blogs found...</p>
              ) : (
                <div key={category_slug} className="flex flex-col space-y-5">
                  <div className="flex flex-row justify-between mb-4">
                    <p className="uppercase font-bold">{blogs[0].category_id__name}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    {blogs && blogs.map((item, index) => (
                      < BlogThumbNail
                        key={index}
                        img={item.thumb_img_310X160}
                        title={item.title}
                        date={item.created_date}
                        tag={item.category_id__name}
                        slug={item.slug}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {category && category.map((item, index) => {
                const categoryBlogs = item.blog.filter(blog => blog !== null);

                if (!categoryBlogs.length) {
                  return null; // Skip categories without blogs
                }
                const firstBlog = categoryBlogs[0]; // Get the first available blog

                if (firstBlog && !isFirstCategoryRendered) {
                  isFirstCategoryRendered = true;
                  return (
                    <div key={index} className="flex flex-col space-y-5">
                      <div className="flex flex-row justify-between mb-4">
                        <p className="uppercase font-bold">{firstBlog.category_id__name}</p>
                        <div className="hidden md:block">
                          <OrangeHyperlink text={`for more ${firstBlog.category_id__name}`} 
                          link={`${CustomerRoutes.UshopBlogs}${item.slug}/`} />
                          {/* /${firstBlog.category_id} */}
                        </div>
                      </div>
                      <div className="flex flex-row w-full space-x-5">
                        <div className="w-1/2 ">
                          <BlogThumbNail
                            img={firstBlog.thumb_img_620X410}
                            title={firstBlog.title}
                            date={firstBlog.created_date}
                            tag={firstBlog.category_id__name}
                            slug={firstBlog.slug}
                          />
                        </div>
                        <div className="grid grid-cols-2 w-1/2 gap-5">
                          {item.blog.map((blogItem, index) => {
                            if (index > 0 && index < 4) { // Condition for skipping the first enlarged item
                              return (
                                <BlogThumbNail
                                  key={index}
                                  img={blogItem.thumb_img_310X160}
                                  title={blogItem.title}
                                  date={blogItem.created_date}
                                  tag={blogItem.category_id__name}
                                  slug={blogItem.slug}
                                />
                              );
                            } else {
                              return null;
                            }
                          })}
                        </div>
                      </div>
                      <div className="md:hidden flex justify-center">
                        <OrangeHyperlink text={`for more ${firstBlog.category_id__name}`} 
                        link={`${CustomerRoutes.UshopBlogs}${firstBlog.category_id__name}/`} />
                        {/* /${firstBlog.category_id} */}
                      </div>
                    </div>
                  )
                } else {
                  const otherFirstBlog = categoryBlogs[0];

                  if (otherFirstBlog) {
                    return (
                      <div key={otherFirstBlog.category_id__name} className="flex flex-col space-y-5">
                        <div className="flex flex-row justify-between mb-4">
                          <p className="uppercase font-bold">{otherFirstBlog.category_id__name}</p>
                          <div className="hidden md:block">
                            <OrangeHyperlink text={`for more ${otherFirstBlog.category_id__name}`} 
                            link={`${CustomerRoutes.UshopBlogs}${item.slug}/`} />
                            {/* /${otherFirstBlog.category_id} */}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-5 md:flex md:flex-row md:w-full md:space-x-5">
                          {categoryBlogs.map((blogItem, index) => {
                            return (
                              < BlogThumbNail
                                key={index}
                                img={blogItem.thumb_img_305X240}
                                title={blogItem.title}
                                date={blogItem.created_date}
                                tag={blogItem.category_id__name}
                                slug={blogItem.slug}
                              />
                            );
                          })}
                        </div>
                        <div className="md:hidden flex justify-center">
                          <OrangeHyperlink text={`for more ${otherFirstBlog.category_id__name}`} 
                          link={`${CustomerRoutes.UshopBlogs}${otherFirstBlog.category_id__name}/`} />
                          {/* /${otherFirstBlog.category_id} */}
                        </div>
                      </div>
                    )
                  }
                }
              })}
            </>
          )}

          {pageCount > 1 && (
            <div className="flex flex-row justify-center">
              <PageNavigator pageCount={pageCount} currentPage={currentPage} onPageChange={handlePaginaton} />
            </div>
          )}

          {/* <div className="flex flex-col items-center justify-center">
            <img src={adBannerImgSm2} alt="test" className="w-full" />
          </div> */}
        </div>
      </div>
    </>
  );
}

export default UshopBlog;
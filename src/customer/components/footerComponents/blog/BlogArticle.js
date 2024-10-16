import React from "react";
import {
  ArticleThumbnail,
  HorizontalDivider,
  OrangeHyperlink,
  ArticleImageThumbnail,
} from "../../GenericComponents";
import {
  BsArrowLeft,
} from "react-icons/bs";

import { useNavigate } from "react-router-dom";
import { BuyerApiCalls, Apis } from "../../../utils/ApiCalls";
import { useParams } from 'react-router-dom';
import { useState, useEffect } from "react";
import { CustomerRoutes } from "../../../../Routes";
import { Helmet } from 'react-helmet-async';
import parse from 'html-react-parser';


function BlogArticle() {
  const navigate = useNavigate();
  const [blogDetail, setBlogDetail] = useState([])
  const [relatedBlogs, setRelatedBlogs] = useState([])
  const [featureBlogs, setFeatureBlogs] = useState([])

  const { slug } = useParams();

  const processResponse = (res) => {
    setBlogDetail(res.data.data)
    setRelatedBlogs(res.data.related_blogs)
    setFeatureBlogs(res.data.featured_blogs)
  };

  useEffect(() => {
    if (slug) {
      BuyerApiCalls({}, `${Apis.blogDetail}${slug}/`, "GET", {}, processResponse, null);
    }
  }, [slug]);

  return (
    <>
      {blogDetail && (
        <Helmet>
          <title>{blogDetail.meta_title}</title>
          <meta name="description" content={blogDetail.meta_description} />
          <link rel="canonical" href={`${CustomerRoutes.UshopBlogs}${slug}/`} />
          <meta property="og:title" content={blogDetail?.meta_title} />
          <meta property="og:description" content={blogDetail?.meta_description} />
        </Helmet>
      )}
      <div className="flex flex-col p-10 space-y-5">
        <button className="flex flex-start items-center text-black font-bold" onClick={() => navigate(-1)}>
          <BsArrowLeft />
          <span className="ml-2">Back</span>
        </button>

        <div className="flex flex-col md:flex-row space-x-5 ">
          <div className=" md:w-3/4 pb-5">
            <div className="flex flex-col space-y-5">
              {blogDetail && (
                <>
                  <img src={blogDetail.thumb_img_850X410} alt={blogDetail.title} />
                  <div className="flex flex-row justify-between">
                    <p className="w-4/5 font-bold">
                      {blogDetail.title}
                    </p>
                    <p className="text-gray-500">{blogDetail.created_date}</p>
                  </div>
                  {blogDetail.blog_detail ? (
                    parse(blogDetail.blog_detail)
                  ) : (
                    <p>There is no blog description to display...</p>
                  )}
                </>
              )}
              <div className="flex flex-col space-y-5">
                <div className="flex flex-row justify-between">
                  <p className="text-2xl uppercase font-bold">related articles</p>
                  {relatedBlogs && relatedBlogs.length > 0 &&
                    <OrangeHyperlink text="For More Articles" 
                    link={`${CustomerRoutes.UshopBlogs}${blogDetail?.category_id__slug}/`} />
                  }
                </div>
                <div className="flex flex-row justify-between space-x-5">
                  {relatedBlogs && relatedBlogs.map((item, index) => (
                    index < 3 && (
                      <ArticleImageThumbnail
                        img={item.thumb_img_310X160}
                        title={item.title}
                        date={item.created_date}
                        slug={item.slug}
                      />
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-200  h-min p-5 space-y-5 rounded-xl md:w-1/4">
            <p className="text-xl font-bold">Featured</p>
            {featureBlogs && featureBlogs.map((item, index) => (
              index < 3 && (
                <>
                  <ArticleThumbnail
                    title={item.title}
                    date={item.created_date}
                    slug={item.slug}
                  />
                  <HorizontalDivider />{" "}
                </>
              )
            ))}


          </div>
        </div>
      </div >
    </>
  );
}

export default BlogArticle;

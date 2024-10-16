import { Helmet } from "react-helmet-async";

const SEOComponent = ({
  title,
  description,
  ogTitle,
  ogDescription,
  isProduct,
  productMeta,
}) => {
  return (
    <>
      {isProduct ? (
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} data-rh="true" />
          <meta property="og:title" content={ogTitle} data-rh="true" />
          <meta
            property="og:description"
            content={ogDescription}
            data-rh="true"
          />
          <meta property="og:url" content={productMeta["og:url"]} data-rh="true" />
          <meta property="og:image" content={productMeta["og:image"]} data-rh="true" />
          <meta
            property="product:brand"
            content={productMeta["product:brand"]}
            data-rh="true"
          />
          <meta
            property="product:availability"
            content={productMeta["product:availability"]}
            data-rh="true"
          />
          <meta property="product:condition" content="new" data-rh="true" />
          <meta
            property="product:price:amount"
            content={productMeta["product:price:amount"]}
            data-rh="true"
          />
          <meta
            property="product:price:currency"
            content={productMeta["product:price:currency"]}
            data-rh="true"
          />
          <meta property="product:retailer_item_id" content={productMeta["product:retailer_item_id"]} data-rh="true" />
          {/* <meta property="product:item_group_id" content="fb_tshirts" data-rh="true" /> */}
        </Helmet>
      ) : (
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} data-rh="true" />
          <meta property="og:title" content={ogTitle} data-rh="true" />
          <meta
            property="og:description"
            content={ogDescription}
            data-rh="true"
          />
          <meta property="og:image" content="" />
        </Helmet>
      )}
    </>
  );
};

export default SEOComponent;

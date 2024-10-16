
import { Constants } from "../../utils/Constants";
export default function SellerProducts({
  productCategories,
  activeNavLink,
  setActiveNavLink,
}) {
  return (
    <nav className="">
      <div className="flex flex-auto justify-start capitalize gap-10 text-[12px] sm:text-[16px] flex-wrap">
        {/* {sellerProductListing?.map((product, index) => {
          return (
            <li className="">
              <Link
                to={product.name}
                style={{
                  color: activeNavLinks === index ? "orange" : "black",
                }}
                onClick={() => setActiveNavLinks(index)}
                className={linkCss}
              >
                {product.name}
              </Link>
            </li>
          );
        })} */}
        <button
          className={`${
            activeNavLink === Constants.sellerButtonLinks.home
              ? "border-b-2 border-orangeButton"
              : null
          } px-2 py-1`}
          onClick={() => setActiveNavLink(Constants.sellerButtonLinks.home)}
        >
          Home
        </button>
        <button
          className={`${
            activeNavLink === Constants.sellerButtonLinks.onSale
              ? "border-b-2 border-orangeButton"
              : null
          } px-2 py-1`}
          onClick={() => {
            setActiveNavLink(Constants.sellerButtonLinks.onSale);
          }}
        >
          On Sale
        </button>
        {productCategories?.map((category, index) => {
          return (
            <button
              className={`${
                activeNavLink === category.name
                  ? "border-b-2 border-orangeButton"
                  : null
              } px-2 py-1`}
              onClick={() => {
                setActiveNavLink(index);
              }}
            >
              {category.name}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

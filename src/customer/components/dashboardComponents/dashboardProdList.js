import React, { useEffect, useState } from "react";
import NewProductCard from "../productDetailsComponents/NewProductCard";
import cartIcon from "../../../assets/buyer/product/cart-newproducts.png";

function DashboardProdList({ prods, title }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setProducts(prods);
  }, [prods]);

  return (
    <>
      {products.length > 0 ? (
        <section className="flex flex-col mt-10">
          <div className="pl-1 flex gap-1 items-center">
            <img src={cartIcon} alt="cart-icon" />
            <p className="font-bold text-[12px] md:text-[16px]">{title}</p>
          </div>
          <div
            className="grid grid-cols-6 max-[1500px]:grid-cols-5 max-lg:grid-cols-3 max-md:grid-cols-3 max-sm:grid-cols-2 
            mb-[30px]"
          >
            <NewProductCard products={products} setProducts={setProducts} />
          </div>
        </section>
      ) : null}
    </>
  );
}
export default DashboardProdList;

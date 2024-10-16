export const PRODUCT_FILTERS = {
  HIGHEST_SALE: "highest_sale",
  SLOWEST_SALE: "slowest_sale",
  LOW_INVENTORY: "low_inventory",
  HIGHEST_VIEW: "highest_view",
  HIGHEST_REFUND: "highest_refund",
};

export const PRODUCT_SUB_FILTERS = {
  AMOUNT: "amount",
  QTY: "qty",
};

export const PRODUCT_ANALYSIS_PARAMS = {
  highest_sale: {
    title: "Products with highest total sales amount / sales quantity",
    isSubFilter: true,
    accessors: {
      name: "product_id__name",
      price: "price",
      stock: "stock",
      sales: "sales_price",
      salesQty: "sales_count",
      image: "product_image",
      productId: "product_id",
    },
    isBold: ["sales", "salesQty"],
    fifthCol: "Sale Qty",
  },
  highest_view: {
    title: "Products with highest page viewership",
    isSubFilter: false,
    accessors: {
      name: "name",
      price: "product_price_range",
      stock: "total_stock",
      sales: "sales_price",
      salesQty: "view_count",
      image: "product_image",
      productId: "id_product",
    },
    isBold: ["salesQty"],
    fifthCol: "Views",
  },
  highest_refund: {
    title: "Products with highest refund amount",
    isSubFilter: false,
    accessors: {
      name: "product_id__name",
      price: "price",
      stock: "stock",
      sales: "sales_price",
      salesQty: "refund_amount",
      image: "product_image",
      productId: "product_id",
    },
    isBold: ["salesQty"],
    fifthCol: "Refund Amt",
  },
  slowest_sale: {
    title: "Slowest moving products by sales amount / sale quantity",
    isSubFilter: true,
    accessors: {
      name: "product_id__name",
      price: "price",
      stock: "stock",
      sales: "sales_price",
      salesQty: "sales_count",
      image: "product_image",
      productId: "product_id",
    },
    isBold: ["sales", "salesQty"],
    fifthCol: "Sale Qty",
  },
  low_inventory: {
    title: "Low inventory items",
    isSubFilter: false,
    accessors: {
      name: "product_id__name",
      price: "price",
      stock: "stock",
      sales: "sales_price",
      salesQty: "",
      image: "product_image",
      productId: "product_id",
    },
    isBold: ["stock"],
    fifthCol: "",
  },
};

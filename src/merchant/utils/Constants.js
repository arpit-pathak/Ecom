import ls from "local-storage";
import { MerchantRoutes } from "../../Routes";

export var Constants = {
  userType: 2,
  localStorage: {
    resetUtype: "reset-utype",
    resetDetails: "reset-details",
    fromPage: "from-page",
    user: "user",
    ruser: "reset-user",
    ruserToken: "reset-token",
  },
  inDashboard: [
    "dashboard",
    "my-products",
    "add-product",
    "edit-product",
    "category-listing",
  ],
};

export const Waybill = {
  single: 0,
  multiple: 1,
};

export const PRODUCT_STATUSES = {
  ACTIVE: 1,
  DRAFT: 6,
};

export const GROUPBUY_STATUSES = {
  LIVE: "Live",
  DRAFT: "Draft",
  COMPLETE: "Complete",
  PUBLISH: "Publish",
};

export const Media_Size_Limit = {
  img_max_size: 4.0,
  vid_max_size: 7.0,
};

export const SELLER_ACCESS_PERMISSIONS = {
  ORDERS: "orders",
  PRODUCTS: "products",
  SHIPMENT: "shipment-settings",
  SHOP: "shop",
  FINANCE: "finance",
  MARKETING: "marketing-centre",
  SETTINGS: "settings",
};

//EditProduct,ArrangeShipping,EditVoucher,AddProdToCategory,EditGroupBuy,SubAdminDetails,SubAdminUpdate

export const checkSellerPermission = (requiredPermission) => {
  const permissions = ls("sub-seller-permission");

  if (permissions) {
    if (permissions.includes(requiredPermission)) return true;
    else return false;
  } else return true;
};

export function SELLER_ROUTE_PERMISSIONS() {
  const permissionObject = {};

  //product routes
  permissionObject[MerchantRoutes.Products] = SELLER_ACCESS_PERMISSIONS.PRODUCTS
  permissionObject[MerchantRoutes.AddProduct] = SELLER_ACCESS_PERMISSIONS.PRODUCTS
  permissionObject[MerchantRoutes.EditProduct] = SELLER_ACCESS_PERMISSIONS.PRODUCTS
  permissionObject[MerchantRoutes.Categories] = SELLER_ACCESS_PERMISSIONS.PRODUCTS
  permissionObject[MerchantRoutes.AddProdToCategory] = SELLER_ACCESS_PERMISSIONS.PRODUCTS
  permissionObject[MerchantRoutes.ProductQuickListing] = SELLER_ACCESS_PERMISSIONS.PRODUCTS
  permissionObject[MerchantRoutes.BarcodeUpload] = SELLER_ACCESS_PERMISSIONS.PRODUCTS

  //order routes
  permissionObject[MerchantRoutes.Orders] = SELLER_ACCESS_PERMISSIONS.ORDERS
  permissionObject[MerchantRoutes.ArrangeShipping] = SELLER_ACCESS_PERMISSIONS.ORDERS
  permissionObject[MerchantRoutes.Cancellation] = SELLER_ACCESS_PERMISSIONS.ORDERS
  permissionObject[MerchantRoutes.ReturnRefund] = SELLER_ACCESS_PERMISSIONS.ORDERS
  permissionObject[MerchantRoutes.OrderDetail] = SELLER_ACCESS_PERMISSIONS.ORDERS

  //shipment setting routes
  permissionObject[MerchantRoutes.ShippingSettings] = SELLER_ACCESS_PERMISSIONS.SHIPMENT

  //shop routes
  permissionObject[MerchantRoutes.ShopProfile] = SELLER_ACCESS_PERMISSIONS.SHOP
  permissionObject[MerchantRoutes.ShopRating] = SELLER_ACCESS_PERMISSIONS.SHOP
  permissionObject[MerchantRoutes.SubAdminList] = "Restricted"
  permissionObject[MerchantRoutes.CreateSubAdmin] = "Restricted"
  permissionObject[MerchantRoutes.SubAdminDetails] = "Restricted"
  permissionObject[MerchantRoutes.SubAdminUpdate] = "Restricted"

  //finance routes
  permissionObject[MerchantRoutes.Finance] = SELLER_ACCESS_PERMISSIONS.FINANCE

  //settings routes
  permissionObject[MerchantRoutes.Settings] = SELLER_ACCESS_PERMISSIONS.SETTINGS

  //marketing center routes
  permissionObject[MerchantRoutes.VoucherSeller] = SELLER_ACCESS_PERMISSIONS.MARKETING
  permissionObject[MerchantRoutes.AddVoucherSeller] = SELLER_ACCESS_PERMISSIONS.MARKETING
  permissionObject[MerchantRoutes.EditVoucher] = SELLER_ACCESS_PERMISSIONS.MARKETING
  permissionObject[MerchantRoutes.BannerAds] = SELLER_ACCESS_PERMISSIONS.MARKETING
  permissionObject[MerchantRoutes.GroupBuys] = SELLER_ACCESS_PERMISSIONS.MARKETING
  permissionObject[MerchantRoutes.CreateGroupBuy] = SELLER_ACCESS_PERMISSIONS.MARKETING
  permissionObject[MerchantRoutes.EditGroupBuy] = SELLER_ACCESS_PERMISSIONS.MARKETING


  console.log(permissionObject);

  return permissionObject;
};

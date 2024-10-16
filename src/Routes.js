var baseUrl = "/seller/";
var adminBaseUrl = "/admin";
var customerBaseUrl = "/";
export var MerchantRoutes = {
  Development: baseUrl + "development/",
  Landing: baseUrl,
  Login: baseUrl + "login/",
  Register: baseUrl + "signup/",
  Products: baseUrl + "products/",
  AddProduct: baseUrl + "products/add/",
  EditProduct: baseUrl + "products/update/:idProduct/",
  Categories: baseUrl + "categories/",
  Orders: baseUrl + "orders/",
  ArrangeShipping: baseUrl + "orders/detail/:orderNumber/",
  Cancellation: baseUrl + "orders/cancellation/",
  OrderDetail: baseUrl + "order/detail/",
  ReturnRefund: baseUrl + "orders/return_refund/",
  ShippingSettings: baseUrl + "shipping/setting/",
  ShopProfile: baseUrl + "shop/profile/",
  ShopRating: baseUrl + "shop/rating/",
  VoucherSeller: baseUrl + "marketing-centre/vouchers/",
  AddVoucherSeller: baseUrl + "marketing-centre/vouchers/add/",
  EditVoucher: baseUrl + "marketing-centre/vouchers/update/:idVoucher/",
  BannerAds: baseUrl + "marketing-centre/bannerAds/",
  Settings: baseUrl + "settings/",
  Finance: baseUrl + "finance/",
  ContactUs: "/help/seller/:tab/",  
  AddProdToCategory: baseUrl + ":categoryId/addProduct/",
  ChatScreen: baseUrl+ "chats/",
  Notifications: baseUrl+ "notifications/",
  GroupBuys: baseUrl + "marketing-centre/group-buys/",
  CreateGroupBuy: baseUrl + "marketing-centre/group-buy/create/",
  EditGroupBuy: baseUrl + "marketing-centre/group-buy/edit/:idGroupBuy/",
  ProductAnalysis: baseUrl + "product-analysis/:type/",
  ProductQuickListing: baseUrl + "products/quick-listing/",
  BarcodeUpload: baseUrl + "products/barcode-upload/",
  SubAdminList: baseUrl + "shop/sub-admins/",
  CreateSubAdmin: baseUrl+"shop/sub-admins/create/",
  SubAdminDetails: baseUrl+"shop/sub-admins/:id/",
  SubAdminUpdate: baseUrl + "shop/sub-admins/update/:id/",
  NoAccess: baseUrl + "access-denied/",
};

export var CustomerRoutes = {
  Landing: customerBaseUrl,
  AffiliateLanding: customerBaseUrl,
  Login: customerBaseUrl + "login/",
  SignUp: customerBaseUrl + "signup/",
  addressBook: customerBaseUrl + "user/shipping-address/",
  //product
  ProductListing: customerBaseUrl + "search?",
  CategoryProductListing: customerBaseUrl + "category/",
  ProductDetails: customerBaseUrl + "product/",
  NewProductListing: customerBaseUrl + "new-products/",
  RecommendedProductListing: customerBaseUrl + "recommended-products/",

  //wishlist
  Wishlist: customerBaseUrl + "wishlist/",
  //cart
  MyCart: customerBaseUrl + "my-cart/",
  CheckOutCart: customerBaseUrl + "check-out-cart/",
  //payment
  OrderPayment: customerBaseUrl + "payment/",
  OrderConfirmation: customerBaseUrl +"order-confirmation/",
  //user
  ViewProfile: customerBaseUrl + "user/profile/",
  ShippingAddress: customerBaseUrl + "user/shipping-address/",
  PaymentCard: customerBaseUrl + "user/payment-card/",
  ViewOrder: customerBaseUrl + "user/orders/:tab/",
  ViewOrderDetails: customerBaseUrl + "user/order/",
  ViewCashback: customerBaseUrl + "user/cashback/",
  ViewVoucher: customerBaseUrl + "user/vouchers/",
  ViewNotifcation: customerBaseUrl + "user/notifications/",
  Preview: customerBaseUrl + "preview/",
  AffiliateSignUp: customerBaseUrl + "affiliate-signup/",
  ViewAffiliateCommissions: customerBaseUrl + "affiliate-commissions/",
  AffiliateRedeem : customerBaseUrl + "affiliate-redeem/",
  //footers
  FooterPages: customerBaseUrl+ "page/:slug/",
  UshopBlogs: customerBaseUrl + "blog/",
  UshopBlogsCategory: customerBaseUrl + "blog/:category_slug/",
  UshopBlogsArticle: customerBaseUrl + "blog/article/:slug/",
  //voucher section
  UshopVoucher: customerBaseUrl + "voucher/",

  //reuse for customer and merchant
  ForgotPassword: customerBaseUrl + "forgot-password/",
  ResetPassword: customerBaseUrl + "reset-password/",
  ResetPasswordOtp: customerBaseUrl + "reset-password-otp/",
  ChangePassword: customerBaseUrl + "change-password/",
  //seller
  // ShopDetails: customerBaseUrl + "shop-details/",
  ShopDetails: customerBaseUrl + "shop/",
  Chat: customerBaseUrl+ "chat/lobby/",
  ChatScreen: customerBaseUrl+ "chats/",
  Help: customerBaseUrl + "help/:tab/",
  HelpWithId: customerBaseUrl + "help/:tab/:slug/",

  ShopList: customerBaseUrl + "shop-list/:slug/",
  Notifications: customerBaseUrl+ "notifications/",
  GroupBuyAll: customerBaseUrl + "group-buy/all/",

};

export var AdminRoutes = {
  Landing: adminBaseUrl,
  Login: adminBaseUrl + "/login",
  ForgotPassword: adminBaseUrl + "/forgot-password",
  ResetPassword: adminBaseUrl + "/reset-password",

  //Dashboard
  ManageCustomer: adminBaseUrl + "/manage-customer",
  ManageSeller: adminBaseUrl + "/manage-seller",
  ManageAdmin: adminBaseUrl + "/manage-admin",
  ManageDeleteRequests: adminBaseUrl + "/manage-delete-requests",

  ManageProductCategories: adminBaseUrl + "/product-categories",
  SubProductCategories: adminBaseUrl + "/product-categories/:slug",
  ManageProductReviews: adminBaseUrl + "/product-reviews",
  ManageProductList: adminBaseUrl + "/product-list",

  ManageOrders: adminBaseUrl + "/orders",
  ManageOrderDetails: adminBaseUrl + "/orders/:slug",
  ManageLateOrders: adminBaseUrl + "/orders-reports",

  ManageSellerWallet: adminBaseUrl + "/finance-seller-requests",
  ManageTaxInvoices: adminBaseUrl + "/finance-tax-invoices-dn",
  ManageMerchantWalletSummary : adminBaseUrl + "/finance-merchant-wallet-summary",

  ManageEmail: adminBaseUrl + "/email",
  EditEmailTemplate: adminBaseUrl + "/email/:slug",
  ManageNewsletter: adminBaseUrl + "/email/newsletter",

  //Settings
  ManageShippingOptions: adminBaseUrl + "/settings-shipping-options",
  ManageWebAnnouncement: adminBaseUrl + "/settings-web-announcement",
  ManageCancelReasons: adminBaseUrl + "/settings-cancel-reasons",
  ManageSubCancelReasons: adminBaseUrl + "/settings-cancel-reasons/:slug",
  ManageSellerNotice: adminBaseUrl + "/settings-seller-notice",
  ManageProhibitedKeywords: adminBaseUrl + "/settings-prohibited-keywords",
  ManagePublicHolidays: adminBaseUrl + "/settings-public-holidays",

  ManagePlatformVouchers: adminBaseUrl + "/campaigns-voucher",
  ManageStaticContents: adminBaseUrl + "/web-contents-static",
  EditStaticContents: adminBaseUrl + "/web-contents-static/:slug",
  ManageCampaigns: adminBaseUrl + "/campaigns-requests",
  ManageCampaignsDetails: adminBaseUrl + "/campaigns-requests/:slug",
  ManageFAQ: adminBaseUrl + "/web-contents-faq",
  ManageFAQCategories: adminBaseUrl + "/web-contents-faq-categories/",
  ManageBanners: adminBaseUrl + "/campaigns-banners",
  ManageBlogs: adminBaseUrl + "/web-contents-blogs",
  ManageBlogCategories: adminBaseUrl + "/web-contents-blog-categories",
  ManageFAQSubCategories: adminBaseUrl + "/web-contents-faq-categories/:slug",

  ManageProfile: adminBaseUrl + "/profile",
  ManagePromotions: adminBaseUrl + "/campaigns-web-promotions",

  ManageAffiliateUsers : adminBaseUrl + "/manage-affiliate-users/",
  ManageAffiliateWallet : adminBaseUrl + "/manage-affiliate-wallet/:affiliateUserId/",

};

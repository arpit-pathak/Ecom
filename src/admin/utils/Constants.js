import { adminUrl, baseUrl } from "../../apiUrls"

const adminEndPoints = {
    //Authentication & Authorization
    login: 'login/',
    sendOTP: 'send-otp/',
    verifyOTP: 'verify-otp/',
    forgotPassword: 'forgot-password/',
    resetPassword: 'reset-password/',

    //User Management 
    customerList: 'users/customer/list/',
    customerCSV: 'users/customer/csv/export/',
    customerWalletList: 'users/customer/wallet/',
    merchantList: 'users/seller/list/',
    adminList: 'subadmin/list/',
    addAdmin: 'subadmin/add/',
    editAdmin: 'subadmin/edit/',
    updateAdmin: 'subadmin/update-status/',
    editCustomer: 'users/customer/edit/',
    editSeller: 'users/seller/edit/',
    deleteRequestList: 'users/delete/request/list/',
    deleteRequestUpdate: 'users/delete/request/',
    deleteUser: 'users/delete/',
    deleteRequestDelete: 'users/delete/request/delete/',
    sellerProductsList: 'products/seller/',
    sellerProductUpdate: 'products/update/',
    addCustomer: 'users/customer/add/',
    addSeller: 'users/seller/add/',
    markSellerFeatureStatus : "users/seller/",
    viewSellerShipping : "users/seller/shipping/setting/",
    getSellerWalletData : "users/seller/wallet/",
    getAffiliateUserList: "users/affiliate/list/",
    getAffiliateTransactionList: "users/affiliate/wallet/",
    manageAffiliateWithdraw: "users/affiliate/wallet/withdraw/",

    //Product Management
    categoryList: 'category/list/',
    addCategory: 'category/add/',
    editCategory: 'category/edit/',
    deleteCategory: 'category/delete-category/',
    downloadCategory: 'category/csv/export/',
    uploadCategory: 'category/csv/upload/',
    productReviewList: 'products/list-reviews/',
    prdouctList: 'products/list/',
    viewProduct: 'products/detail/',
    editProductShipping: 'products/edit/shipping/',
    editProductDetails: 'products/edit/',
    deleteProductDetails: 'products/delete/',

    //Orders Management
    orderList: 'user/order/list/',
    orderDetails: 'user/order/detail/',
    orderCancel: 'user/order/cancel/',
    orderExport: 'user/order/export/',
    orderRefund: 'user/order/refund/request/',
    orderReturn: 'user/order/return/request/',
    orderDispute: 'user/order/dispute/request/',
    orderConfirm: 'user/order/confirm/',
    orderManualRefund: 'user/order/refund/',
    orderPrintWaybill: 'user/order/generate/waybill/',

    //Email Management
    emailList: 'notification-template/email/list/',
    emailUpdate: 'notification-template/email/update/',
    userNewsletterList: 'newsletter/list/',
    createUserNewsletter: 'newsletter/create/',

    //Campaigns Management
    voucherList: 'voucher/list/',
    addVoucher: 'voucher/add/',
    editVoucher: 'voucher/edit/',
    deleteVoucher: 'voucher/delete-voucher/',

    campaignList: 'campaign/list/',
    approveRejectCampaign: 'campaign/update-status/',
    deleteCampaign: 'campaign/delete/',

    bannerList: 'campaign/list-banners/',
    addBanner: 'campaign/add-banner/',
    editBanner: 'campaign/edit-banner/',
    deleteBanner: 'campaign/delete-banner/',

    getPromotions : 'settings/web/promotion/',
    updatePromotion : 'settings/web/promotion/update/',

    //Web Contents Management
    staticContentsList: 'web-contents/list-static/',
    editStaticContents: 'web-contents/edit-static/',

    faqList: 'web-contents/list-faq/',
    editFaq: 'web-contents/edit-faq/',
    addFaq: 'web-contents/add-faq/',
    deleteFaq: 'web-contents/delete-faq/',
    sortFaq: 'web-contents/faq/sorting/faq/',

    blogList: 'blog/list/',
    editBlog: 'blog/edit/',
    addBlog: 'blog/add/',

    blogCategoryList: 'blog/category/list/',
    editBlogCategory: 'blog/category/edit/',
    addBlogCategory: 'blog/category/add/',

    faqCategoryList: 'web-contents/faq/category/list/',
    addFaqCategory: 'web-contents/faq/category/add/',
    editFaqCategory: 'web-contents/faq/category/edit/',
    deleteFaqCategory: 'web-contents/faq/category/delete/',
    sortFaqCategoryList: 'web-contents/faq/sorting/category/',

    //Finance Management
    sellerWalletList: 'user/wallet/seller/',
    sellerWalletWithdraw: 'user/wallet/seller/withdrawal/',
    sellerWalletExport: 'user/wallet/seller/withdrawal/export/',
    taxInvoice: 'user/wallet/seller/tax-invoice/',
    merchantWalletReportDownload: 'users/seller/csv/export/',


    //Settings Management
    shippingOptionsList: 'settings/shipping/options/',
    shippingRatesList: 'settings/shipping/rate/',
    shippingRatesUpdate: 'settings/shipping/rate/update/',
    webAnnouncementList: 'settings/web/announcement/',
    webAnnouncementUpdate: 'settings/web/announcement/update/',
    cancelReasonsList: 'reason/list/',
    cancelReasonsUpdate: 'reason/update-status/',
    cancelReasonsAdd: 'reason/add/',
    cancelReasonsEdit: 'reason/edit/',
    sellerNoticeList: 'settings/user/web/notification/',
    sellerNoticeAdd: 'settings/user/create/notification/',
    sellerNoticeUpdate: 'settings/user/update/notification/',
    prohibitedKeywordsList: 'prohibited/keyword/list/',
    prohibitedKeywordAdd: 'prohibited/keyword/add/',
    prohibitedKeywordEdit: 'prohibited/keyword/edit/',
    prohibitedKeywordDelete: 'prohibited/keyword/delete/',
    publicHolidaysList: 'settings/manage/ph/holidays/',
    updatePublicHolidaysList: 'settings/manage/ph/holidays/update/',


    //Profile Management
    profileList: 'profile/list-profile/',
    profileUpdate: 'profile/update-profile/',
    profileUpdatePassword: 'profile/update-password/',

    //Utils
    imageUpload: 'image-upload/',
    generalSetting: 'general/setting/',
    getPhList: 'settings/manage/ph/holidays/',
};

const ushopEndPoints = {
    refreshToken: 'token-refresh/',
    verifyToken: 'token-verify/',
}

export const AdminApis = Object.entries(adminEndPoints).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: `${adminUrl}${value}` }),
    {}
);

export const UShopApis = Object.entries(ushopEndPoints).reduce(
    (acc, [key, value]) => ({ ...acc, [key]: `${baseUrl}${value}` }),
    {}
);

export const HttpStatus = {
    HTTP_400_BAD_REQUEST: 400,
    HTTP_401_UNAUTHORIZED: 401,
    HTTP_200_OK: 200,
    HTTP_403_FORBIDDEN: 403
}

export const UserType = {
    ADMIN: 3,
    SUPERADMIN: 4,
}

export const GeneralStatusChoices = [
    { "value": "1", "label": "Active", },
    { "value": "2", "label": "Inactive", },
]

export const LanguageChoices = [
    { "value": "en-us", "label": "English" },
    { "value": "zh", "label": "Chinese" },
]

export const UserStatusChoices = [
    { "value": "1", "label": "Active", },
    { "value": "2", "label": "Inactive", },
    { "value": "3", "label": "Block", },
    { "value": "4", "label": "Delete", },
    { "value": "5", "label": "Banned", },
]

export const TransactionStatusChoices = [
    { "value": "pending", "label": "Pending", },
    { "value": "verified", "label": "Verified", },
    { "value": "paid", "label": "Paid", },
    { "value": "reject", "label": "Reject", },
]

export const UserPermissions = {
    dashboard_view: 'dashboard.view',

    //Web Contents
    web_contents_view: 'web_contents.view',
    web_contents_edit: 'web_contents.edit',
    web_contents_add: 'web_contents.add',
    web_contents_delete: 'web_contents.delete',
    static_contents_view: 'static_contents.view',
    static_contents_edit: 'static_contents.edit',
    faq_view: 'faq.view',
    faq_edit: 'faq.edit',
    faq_add: 'faq.add',
    faq_delete: 'faq.delete',
    blogs_view: 'blogs.view',
    blogs_edit: 'blogs.edit',
    blogs_add: 'blogs.add',
    blog_categories_view: 'blog_categories.view',
    blog_categories_edit: 'blog_categories.edit',
    blog_categories_add: 'blog_categories.add',

    //Products
    products_view: 'products.view',
    products_edit: 'products.edit',
    products_add: 'products.add',
    products_delete: 'products.delete',
    products_categories_view: 'product_categories.view',
    products_categories_edit: 'product_categories.edit',
    products_categories_add: 'product_categories.add',
    products_categories_delete: 'product_categories.delete',
    products_reviews_view: 'product_reviews.view',

    //Orders
    orders_view: 'orders.view',
    orders_refund: 'orders.refund',
    order_list_view: 'order_list.view',
    order_list_refund: 'order_list.refund',

    //Campaigns
    campaigns_view: 'campaigns.view',
    campaigns_edit: 'campaigns.edit',
    campaigns_add: 'campaigns.add',
    campaigns_delete: 'campaigns.delete',
    platform_vouchers_view: 'platform_vouchers.view',
    platform_vouchers_edit: 'platform_vouchers.edit',
    platform_vouchers_add: 'platform_vouchers.add',
    platform_vouchers_delete: 'platform_vouchers.delete',
    campaigns_request_view: 'campaigns_request.view',
    campaigns_request_delete: 'campaigns_request.delete',
    campaigns_request_edit: 'campaigns_request.edit',
    banner_view: 'banner.view',
    banner_edit: 'banner.edit',
    banner_add: 'banner.add',
    banner_delete: 'banner.delete',
    web_promotion_view: 'web_promotion.view',
    web_promotion_edit: 'web_promotion.edit',

    //Finance
    finance_view: 'finance.view',
    finance_download: 'finance.download',
    finance_edit: 'finance.edit',
    seller_wallet: 'seller_wallet.view',
    seller_wallet_download: 'seller_wallet.download',
    seller_wallet_edit: 'seller_wallet.edit',
    seller_invoice_view: 'seller_invoice.view',
    seller_invoice_delete: 'seller_invoice.delete',

    //User Management
    user_management_view: 'user_management.view',
    user_management_edit: 'user_management.edit',
    user_management_delete: 'user_management.delete',
    user_management_download: 'user_management.download',
    customers_view: 'customers.view',
    customers_edit: 'customers.edit',
    customers_delete: 'customers.delete',
    customers_download: 'customers.download',
    sellers_view: 'sellers.view',
    sellers_edit: 'sellers.edit',
    sellers_delete: 'sellers.delete',
    delete_requests_view: 'user_delete_requests.view',
    affiliate_users_view: 'affiliate.view',
    affiliate_wallet_view: 'affiliate.wallet.list',
    affiliate_wallet_withdraw: 'affiliate.wallet.withdraw',

    //Email Notifications
    email_notifications_view: 'email_notifications.view',
    email_notifications_edit: 'email_notifications.edit',
    email_templates_view: 'email_templates.view',
    email_templates_edit: 'email_templates.edit',
    newsletter_view: 'newsletter.view',
    newsletter_add : 'newsletter.add',

    //Settings
    settings_view: 'settings.view',
    web_notification_view: 'web_notification.view',
    shipping_options_view: 'shipping_options.view',
    web_announcement_view: 'web_announcement.view',
    cancel_reasons_view: 'cancel_reasons.view',
    prohibited_keywords_view: 'prohibited_keywords.view',
    ph_holidays_view: 'manage_ph_holidays.view'
}


export const Countries = {
  AF: "Afghanistan",
  AL: "Albania",
  DZ: "Algeria",
  AS: "American Samoa",
  AD: "Andorra",
  AO: "Angola",
  AI: "Anguilla",
  AG: "Antigua and Barbuda",
  AR: "Argentina",
  AM: "Armenia",
  AW: "Aruba",
  AU: "Australia",
  AT: "Austria",
  AZ: "Azerbaijan",
  BS: "Bahamas",
  BH: "Bahrain",
  BD: "Bangladesh",
  BB: "Barbados",
  BY: "Belarus",
  BE: "Belgium",
  BZ: "Belize",
  BJ: "Benin",
  BM: "Bermuda",
  BT: "Bhutan",
  BO: "Bolivia, Plurinational State of",
  BA: "Bosnia and Herzegovina",
  BW: "Botswana",
  BR: "Brazil",
  IO: "British Indian Ocean Territory",
  BG: "Bulgaria",
  BF: "Burkina Faso",
  BI: "Burundi",
  KH: "Cambodia",
  CM: "Cameroon",
  CA: "Canada",
  CV: "Cape Verde",
  KY: "Cayman Islands",
  CF: "Central African Republic",
  TD: "Chad",
  CL: "Chile",
  CN: "China",
  CO: "Colombia",
  KM: "Comoros",
  CG: "Congo",
  CD: "Democratic Republic of the Congo",
  CK: "Cook Islands",
  CR: "Costa Rica",
  CI: "Côte d'Ivoire",
  HR: "Croatia",
  CU: "Cuba",
  CW: "Curaçao",
  CY: "Cyprus",
  CZ: "Czech Republic",
  DK: "Denmark",
  DJ: "Djibouti",
  DM: "Dominica",
  DO: "Dominican Republic",
  EC: "Ecuador",
  EG: "Egypt",
  SV: "El Salvador",
  GQ: "Equatorial Guinea",
  ER: "Eritrea",
  EE: "Estonia",
  ET: "Ethiopia",
  FK: "Falkland Islands (Malvinas)",
  FO: "Faroe Islands",
  FJ: "Fiji",
  FI: "Finland",
  FR: "France",
  PF: "French Polynesia",
  GA: "Gabon",
  GM: "Gambia",
  GE: "Georgia",
  DE: "Germany",
  GH: "Ghana",
  GI: "Gibraltar",
  GR: "Greece",
  GL: "Greenland",
  GD: "Grenada",
  GU: "Guam",
  GT: "Guatemala",
  GG: "Guernsey",
  GN: "Guinea",
  GW: "Guinea-Bissau",
  HT: "Haiti",
  HN: "Honduras",
  HK: "Hong Kong",
  HU: "Hungary",
  IS: "Iceland",
  IN: "India",
  ID: "Indonesia",
  IR: "Iran, Islamic Republic of",
  IQ: "Iraq",
  IE: "Ireland",
  IM: "Isle of Man",
  IL: "Israel",
  IT: "Italy",
  JM: "Jamaica",
  JP: "Japan",
  JE: "Jersey",
  JO: "Jordan",
  KZ: "Kazakhstan",
  KE: "Kenya",
  KI: "Kiribati",
  KP: "North Korea",
  KR: "South Korea",
  KW: "Kuwait",
  KG: "Kyrgyzstan",
  LA: "Lao People's Democratic Republic",
  LV: "Latvia",
  LB: "Lebanon",
  LS: "Lesotho",
  LR: "Liberia",
  LY: "Libya",
  LI: "Liechtenstein",
  LT: "Lithuania",
  LU: "Luxembourg",
  MO: "Macao",
  MK: "Republic of Macedonia",
  MG: "Madagascar",
  MW: "Malawi",
  MY: "Malaysia",
  MV: "Maldives",
  ML: "Mali",
  MT: "Malta",
  MH: "Marshall Islands",
  MQ: "Martinique",
  MR: "Mauritania",
  MU: "Mauritius",
  MX: "Mexico",
  FM: "Micronesia, Federated States of",
  MD: "Republic of Moldova",
  MC: "Monaco",
  MN: "Mongolia",
  ME: "Montenegro",
  MS: "Montserrat",
  MA: "Morocco",
  MZ: "Mozambique",
  MM: "Myanmar",
  NA: "Namibia",
  NR: "Nauru",
  NP: "Nepal",
  NL: "Netherlands",
  NZ: "New Zealand",
  NI: "Nicaragua",
  NE: "Niger",
  NG: "Nigeria",
  NU: "Niue",
  NF: "Norfolk Island",
  MP: "Northern Mariana Islands",
  NO: "Norway",
  OM: "Oman",
  PK: "Pakistan",
  PW: "Palau",
  PS: "Palestinian Territory",
  PA: "Panama",
  PG: "Papua New Guinea",
  PY: "Paraguay",
  PE: "Peru",
  PH: "Philippines",
  PN: "Pitcairn",
  PL: "Poland",
  PT: "Portugal",
  PR: "Puerto Rico",
  QA: "Qatar",
  RO: "Romania",
  RU: "Russia",
  RW: "Rwanda",
  KN: "Saint Kitts and Nevis",
  LC: "Saint Lucia",
  WS: "Samoa",
  SM: "San Marino",
  ST: "Sao Tome and Principe",
  SA: "Saudi Arabia",
  SN: "Senegal",
  RS: "Serbia",
  SC: "Seychelles",
  SL: "Sierra Leone",
  SG: "Singapore",
  SX: "Sint Maarten",
  SK: "Slovakia",
  SI: "Slovenia",
  SB: "Solomon Islands",
  SO: "Somalia",
  ZA: "South Africa",
  SS: "South Sudan",
  ES: "Spain",
  LK: "Sri Lanka",
  SD: "Sudan",
  SR: "Suriname",
  SZ: "Swaziland",
  SE: "Sweden",
  CH: "Switzerland",
  SY: "Syria",
  TW: "Taiwan",
  TJ: "Tajikistan",
  TZ: "Tanzania",
  TH: "Thailand",
  TG: "Togo",
  TK: "Tokelau",
  TO: "Tonga",
  TT: "Trinidad and Tobago",
  TN: "Tunisia",
  TR: "Turkey",
  TM: "Turkmenistan",
  TC: "Turks and Caicos Islands",
  TV: "Tuvalu",
  UG: "Uganda",
  UA: "Ukraine",
  AE: "United Arab Emirates",
  GB: "United Kingdom",
  US: "United States",
  UY: "Uruguay",
  UZ: "Uzbekistan",
  VU: "Vanuatu",
  VE: "Venezuela, Bolivarian Republic of",
  VN: "Viet Nam",
  VI: "Virgin Islands",
  YE: "Yemen",
  ZM: "Zambia",
  ZW: "Zimbabwe",
};
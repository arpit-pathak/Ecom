import axios from "axios";
import { baseUrl } from "../../apiUrls";
import ls from "local-storage";

// export var baseUrl = "http://127.0.0.1:8000/api/";
// export var baseUrl = "https://stg-api.ushop.market/api/";
export var Apis = {
  paymentProcess: "cart/stripe/payment/process/",
  updateOrder: "cart/stripe/payment/update/order/",
  getPaymentStatus: "cart/order/payment/status/",
  //sign up
  signup: "signup/",
  socialSignup: "social-signup/",
  bindUser: "user/bind-account/",
  //OTP
  sendOtp: "sendotp/",
  verifyOtp: "verify-sendotp/",
  //login
  login: "login/",
  socialSLogin: "social-login/",
  //invalid token
  tokenRefresh: "token-refresh/",

  getNotifications: "user/buyer/notification/list/",
  markAllRead: "user/buyer/notification/read/all/",
  deleteNotification: "user/buyer/notification/delete/",

  //products categories & listing
  mainCategory: "top-category/",
  categoryList: "category/list/",
  footerCategoryList: "category/list_footer",
  NavbarCategoryList: "category/group/header/",
  LandingCategoryCards: "category/group/landing/",
  filteredCategoryList: "category/filter/",
  productDetail: "product/detail/",
  product: "seller/product/details/",
  reviewRating: "review-rating/",
  listReviewRating: "list-review-rating/",
  productList: "product/list/",
  productReview: "product/review/",
  addToWishlist: "buyer/wishlist/product/add/",
  removeFromWishlist: "buyer/wishlist/product/delete/",
  retrieveWishlist: "buyer/wishlist/",
  topBrands: "brand/top/",
  brandList: "brand/list/",
  notifyProduct: "product/availability/notify/",
  sameShopProducts: "product/list/same_shop/",
  relatedProducts: "product/list/related/",
  featuredShops: "featured/shop/",
  groupBuyList: "product/group/buy/",
  recommendedProdList: "product/list/recommended_product/",

  //seller
  sellerDetail: "buyer/seller/detail/",
  followUnfollowSeller: "buyer/seller/follow-unfollow/",
  sellerProductListing: "buyer/seller/list/product/",
  sellerTopProducts: "buyer/seller/top/product/",
  shopList: "shop/list/",
  sellerOnSaleProducts: "buyer/seller/sale/product/",
  switchToSeller: "user/switch/seller/",

  //cart
  retrieveCart: "cart/detail/",
  addToCart: "cart/add/",
  clearItem: "cart/item-clear/",
  decreaseQuantity: "cart/item-decrement/",
  clearCart: "cart/clear/",
  checkoutCart: "cart/checkout/",
  retrieveTimeSlot: "cart/checkout/timeslot/",
  checkoutUpdateCart: "cart/checkout/update/",

  //voucher
  retrieveUshopVoucher: "buyer/ushop/voucher/",
  retrieveShopVoucher: "buyer/shop/voucher/",
  claimUshopVoucher: "buyer/claim/ushop/voucher/",
  retrieveAllVouchers: "buyer/voucher/list/",

  //order & payment
  createOrder: "cart/create-order/",
  orderPayment: "order-payment/",
  retrieveOrder: "buyer/order/list/",
  orderDetails: "buyer/order/detail/",
  cancelOrder: "buyer/order/cancel/",
  orderReceived: "buyer/order/received/",
  fetchCancelOrderReasons: "buyer/order-cancel/reason/",
  orderReturnRequest: "buyer/order/request/return/",
  fetchReturnOrderReasons: "buyer/order-return/reason/",
  orderRefundRequest: "buyer/order/request/refund/",
  fetchRefundReqReasons: "buyer/order-refund/reason/",
  markReceivedOrder: "buyer/order/received/",
  downloadReceipt: "buyer/order/invoice/",

  //product rate from order
  productRating: "buyer/order/product/rate/",

  //wallet
  retrieveWalletTransactions: "user/wallet",

  //banners
  banners: "banner/",
  shippingOptions: "shipping/list/",

  //address
  retrieveAddress: "user/list-addresses/",
  addAddress: "user/add-address/",
  editAddress: "user/edit-address/",
  deleteAddress: "user/delete-address/",
  changeBuyerOrderAddress: "buyer/order/address/change/",

  //profile
  retrieveProfile: "user/view-profile/",
  editProfile: "user/edit-profile/",
  uploadProfileImg: "user/upload/profile/photo/",
  editPassword: "user/change-password/",
  deleteAccount: "user/account/delete/request/buyer/",

  //affiliate program
  createAffiliateAccount: "affiliate/detail/",
  getAffiliateDetails: "affiliate/detail/",
  getAffiliateTransactions: "affiliate/commission/",
  withdrawAffiliateCommission: "affiliate/withdraw/request/",

  //FAQ
  retreiveFaq: "faq/",
  staticPages: "static-pages/",
  contactUs: "contact-us/",

  //Blogs
  blogCategory: "blog/category/list/",
  blogList: "blog/list/",
  blogDetail: "blog/detail/",

  //payment
  paymentMethod: "user/payment/method/",

  //chat
  buyerPrevChats: "chat/buyer/message/",
};

//common API calls
export function BuyerApiCalls(
  formData,
  apiUrl,
  method,
  headers,
  processResponse,
  layer,
  parent_id,
  seller_id,
  timeslot_id,
  isChat
) {
  let axiosConfig = {
    url: isChat ? apiUrl : baseUrl + apiUrl,
    headers: headers ? headers : null,
    method: method,
  };
  if (method === "GET") {
    axiosConfig.params = formData;
  } else {
    axiosConfig.data = formData;
  }

  return axios(axiosConfig)
    .then((response) => {
      if (response && apiUrl !== Apis.tokenRefresh) {
        processResponse(
          response,
          apiUrl,
          layer,
          parent_id,
          seller_id,
          timeslot_id
        );
      } else if (apiUrl === Apis.tokenRefresh) {
        var user = localStorage.getItem("customer");
        user = JSON.parse(user);
        user.access = response.data.access;
        localStorage.setItem("customer", JSON.stringify(user));
        document.location.reload();
      }
    })

    .catch((error) => {
      if (error.response) {
        if (error.response.status === 500) {
          // alert("An error has occured. Please try again later.");
        }
        if (apiUrl === Apis.tokenRefresh) {
          if (error.response.status === 401 || error.response.status === 400) {
            //logout
            document.location.reload();
            return;
          }
        }

        if (error.response.status === 401) {
          const user = JSON.parse(localStorage.getItem("customer"));
          //call token-refresh
          if (user) {
            var fd = new FormData();
            fd.append("refresh", user.refresh);
            BuyerApiCalls(fd, Apis.tokenRefresh, "POST", {}, processResponse);
          }
        }
      }

      // if (error.response.status === 500) {
      //   processResponse(data, apiUrl, parent_id);
      // }
      processResponse(error, apiUrl, parent_id);
    });
}

export function PaymentApi(
  formData,
  apiUrl,
  method,
  headers,
  processResponse,
  paymentMethod
) {
  return axios({
    url: baseUrl + apiUrl,
    method: method,
    data: formData,
    headers: headers ? headers : null,
  })
    .then((response) => {
      if (response) {
        processResponse(response, apiUrl, paymentMethod);
      }
    })

    .catch((error) => {
      if (error.response) {
        if (error.response.status === 500) {
          alert("An error has occured. Please try again later.");
        }
        if (error.response.status === 401) {
          const user = JSON.parse(localStorage.getItem("customer"));
          //call token-refresh
          if (user) {
            var fd = new FormData();
            fd.append("refresh", user.refresh);
            BuyerApiCalls(fd, Apis.tokenRefresh, "POST", {}, processResponse);
          }
        }
      }
    });
}

export async function RegisterApi(formData, apiUrl, headers, processResponse) {
  return await axios
    .post(baseUrl + apiUrl, formData)
    .then((res) => {
      processResponse(res, apiUrl);
    })
    .catch((error) => {
      if (error.response.status === 500) {
        alert("An error has occured. Please try again later.");
      }
    });
}

//login API
export function LoginApi(formData, apiUrl, headers) {
  return axios
    .post(baseUrl + apiUrl, formData)
    .then((res) => {
      if (res.data.errors.length === 0) {
        localStorage.setItem("customer", JSON.stringify(res.data.data));
        localStorage.setItem("imageSearchLimit", 5);
        ls(
          "buyerAddress",
          res.data.data?.user_address
            ? res.data.data?.user_address?.address_details
            : null
        );
        ls("addressPrompt", res.data.data?.user_address ? true : false);
        // window.location = CustomerRoutes.Landing  ;
      } else {
        return res.data.errors;
      }
    })
    .catch((err) => {
      return err;
    });
}

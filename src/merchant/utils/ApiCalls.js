import axios from "axios";
import { isBtnLoading } from "../../Utils";
import ls from "local-storage";
import { Constants } from "../utils/Constants.js";
import { MerchantRoutes } from "../../Routes";
import { baseUrl } from "../../apiUrls";

//var baseUrl = "http://127.0.0.1:8000/api/";
//var baseUrl = 'https://stg-api.ushop.market/api/';
export var Apis = {
  login: "login/",
  socialSLogin: "social-login/",
  signup: "signup/",
  socialSignup: "social-signup/",
  bindUser: "user/bind-account/",
  sendOtp: "sendotp/",
  verifyOtp: "verify-sendotp/",
  switchToBuyer: "user/switch/buyer/",

  //invalid token
  tokenRefresh: "token-refresh/",

  //after registration
  onboarding: "seller/onboarding/",

  //get profile status for product adding permission
  getProfileStatus: "seller/profile/validate",
  getNotifications: "user/seller/notification/list/",
  markAllRead: "user/seller/notification/read/all/",
  deleteNotification: "user/seller/notification/delete/",

  //categories
  listCategory: "seller/product/category/list/",
  searchCategory: "seller/product/category/search/",
  addCategory: "seller/product/category/add/",
  deleteCategory: "seller/product/category/delete/",
  editCategory: "seller/product/category/edit/",
  categorySearch: "seller/product/category/trail/",

  //products
  listShipping: "seller/product/list-shipping-options/",
  listProducts: "seller/product/list/",
  tagProdsToCategory: "seller/product/category/tagging/",

  sellerOrderList: "seller/order/list/",
  sellerOrderDetail: "seller/order/detail/",
  sellerOrderConfirm: "seller/order/confirm/",
  sellerOrderCancel: "seller/order/cancel/",

  sellerOrderExportSummary: "seller/order/summary/export/",
  sellerOrderExportDetail: "seller/order/detail/export/",
  sellerDownloadWaybill: "seller/order/generate/waybill/",
  fetchReturnRejectReasons: "seller/order-return/reason/",
  fetchRefundRejectReasons: "seller/order-refund/reason/",
  rejectReturnRequest: "seller/order/return/request/reject/",
  acceptReturnRequest: "seller/order/return/request/accept/",
  rejectRefundRequest: "seller/order/refund/request/reject/",
  acceptRefundRequest: "seller/order/refund/request/accept/",

  checkBarcodes: "seller/product/search-barcodes/",
  barcodesToDraftListing: "seller/product/barcode-to-draft-listings/",

  //shipment settings
  shippingSettings: "seller/shipping/setting/",
  updateShippingSettings: "seller/shipping/setting/update/",
  sellerPickup: "seller/pickup/address/",
  deleteAddress: "seller/pickup/address/delete/",
  changeDeliveryAddress: "seller/order/address/change/",

  product: "seller/product/details/",
  productDetail: "seller/product/add-details/",
  updateProductStatus: "seller/product/update-status/",
  deleteProduct: "seller/product/delete/",
  duplicateProduct: "seller/product/duplicate/",
  downloadSampleExcel: "seller/product/bulk/upload/",
  productBulkUpload: "seller/product/bulk/upload/",
  exportSellerProductList: "seller/product/export/",
  productBulkUpdate: "seller/product/bulk/update/",
  productBatchUpdate: "seller/product/batch/update/",

  productVariation: "seller/product/variation/",
  deleteProductMedia: "seller/product/media/delete/",
  productOptions: "seller/product/optional-details/",
  shippingDetail: "seller/product/shipping-details/",
  tabTotals: "seller/product/list-total/",

  //test//cart
  addCart: "cart/add/",
  clearItemCart: "cart/item-clear/",
  clearCart: "cart/clear/",
  decrementItemCart: "cart/decrement/",
  detailCart: "cart/detail/",

  //profile
  retrieveProfile: "user/profile/view/",
  fetchCancelOrderReasons: "seller/order-cancel/reason/",

  //shop
  shopProfile: "seller/shop/profile/",
  shopRating: "seller/shop/rating/",
  
  //sub seller
  getSubAdminList: "sub-seller/account/list/",
  deleteSubAdminUser: "sub-seller/account/delete/",
  createSubAdmin : "sub-seller/account/create/",
  updateSubAdminStatus: "sub-seller/account/status/",
  updateSubAdminDetails : "sub-seller/account/update/",

  //vouchers
  listVouchers: "seller/list-shop-voucher/",
  addVoucher: "seller/add-shop-voucher/",
  updateVoucher: "seller/edit-shop-voucher/",
  deleteVoucher: "seller/voucher/delete/",

  //setting
  settings: "seller/setting/",
  changePassword: "user/change-password/",
  reqDeleteAccount: "user/account/delete/request/seller/",

  //finance
  earnings: "seller/earning/",
  bankDetails: "seller/bank/details/",
  invoiceList: "user/seller/invoice/list/",

  //banner ads
  listBannerAds: "seller/request-campaign/list/",
  addBannerAd: "seller/request-campaign/add/",

  //dashboard
  dashboardData: "seller/dashboard/",
  productAnalysisData: "seller/dashboard/product/analysis/",

  //chat
  sellerPrevChats: "chat/seller/message/",
  fetchOldMessages: "chat/message/history/",
  uploadMedia: "chat/upload/media/",


  //group buy
  getTimeslotsAndCampaignId: "seller/group/buy/product/timeslots/", //to get timeslots and campaign id
  searchGroupBuyProducts: "seller/group/buy/product/search/",
  createGroupBuy: "seller/group/buy/product/create/",
  getGroupBuyList: "seller/group/buy/product/list/",
  deleteGroupBuy : "seller/group/buy/product/delete/",
  getGroupBuy : "seller/group/buy/product/detail/",
  updateGroupBuy: "seller/group/buy/product/update/",
};

var fd = new FormData();
fd.append("shipping_option[]", 1);
export function ApiCalls(formData, apiUrl, method, headers, processRes, btn, isChat) {
  var user = ls(Constants.localStorage.user);

  return axios({
    url: isChat ? apiUrl : baseUrl + apiUrl,
    method: method,
    data: formData,
    headers: headers ? headers : null,
  })
    .then(function (response) {
      if (processRes && apiUrl !== Apis.tokenRefresh) {
        processRes(response, apiUrl);
      } else if (apiUrl === Apis.tokenRefresh) {
        user = JSON.parse(user);
        console.log("old details: ", user);

        const refreshedUser = { ...user };
        refreshedUser.access = response.data.access;
        refreshedUser.refresh = response.data.refresh;
        console.log("new details: ", refreshedUser);

        ls(Constants.localStorage.user, JSON.stringify(refreshedUser));
        setTimeout(() => {
          document.location.reload();
        }, 200);
      }

      if (btn) isBtnLoading(btn, false);
    })
    .catch(function (error) {
      if (error.response) {
        if (error.response.status === 500) {
          alert("An error has occured. Please try again later.");
        }

        if (apiUrl === Apis.tokenRefresh) {
          if (error.response.status === 400 || error.response.status === 401) {
            //logout
            ls.clear();
            document.location.replace(MerchantRoutes.Landing);
            return;
          }
        }

        if (error.response.status === 401) {
          //call token-refresh
          if (user) {
            user = JSON.parse(user);
            var fd = new FormData();
            fd.append("refresh", user.refresh);
            ApiCalls(fd, Apis.tokenRefresh, "POST", {}, processRes, btn);
          }

          // list shipping settings
          if (apiUrl === Apis.shippingSettings) {
            ApiCalls(fd, Apis.shippingSettings, "GET", headers, processRes);
          }

          // update shipping settings
          if (apiUrl === Apis.updateShippingSettings) {
            ApiCalls(
              fd,
              Apis.updateShippingSettings,
              "POST",
              headers,
              processRes
            );
          }
        }
      }
      if (btn) isBtnLoading(btn, false);
    });
}

import "./App.css";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./customer/components/GenericComponents";
import PageNotFound from "./PageNotFound";

//Merchant pages
import {
  AuthSellerRoutes,
  AuthSellerLoginRoutes,
} from "./merchant/utils/SellerPrivateRoutes";
import SellerLanding from "./merchant/pages/Login";
import SellerDashboard from "./merchant/pages/Dashboard";
import SellerProduct from "./merchant/components/Products/Products";
import SellerAddProduct from "./merchant/components/Products/Add";
import SellerCategory from "./merchant/components/Categories/Listing";
import ForgotPassword from "./ForgotPassword";
import SellerShippingSettings from "./merchant/components/Shipment/ShippingSettings";
import SellerOrders from "./merchant/components/Orders/MyOrders";
import SellerShippingArrangement from "./merchant/components/Orders/ArrangeShipment";
import UshopVoucher from "./customer/pages/UshopVoucher";
import VoucherSeller from "./merchant/components/Marketing_Centre/VoucherSeller";
import AddVoucherSeller from "./merchant/components/Marketing_Centre/AddVoucher";
import BannerAds from "./merchant/components/Marketing_Centre/BannerAds";

//Admin Pages
import * as AdminPages from "./admin/pages/";

//Customer pages
import {
  AuthBuyerRoutes,
  AuthBuyerLoginRoutes,
} from "./customer/utils/BuyerPrivateRoutes";
import Login from "./customer/pages/Login";
import SignUp from "./customer/pages/SignUp";
import Home from "./customer/pages/Home";
import MyCart from "./customer/pages/MyCart";
import Wishlist from "./customer/components/Wishlist/Wishlist";
import CheckOutCart from "./customer/pages/CheckOutCart";
import UshopBlogs from "./customer/pages/UshopBlogs";
import UshopBlogsArticle from "./customer/pages/UshopBlogsArticle";
import ViewProfile from "./customer/pages/accountDetails/ViewProfile";
import ShippingAddress from "./customer/pages/accountDetails/ShippingAddress";
import AddPaymentCard from "./customer/pages/accountDetails/PaymentCard";
import ViewOrder from "./customer/pages/accountDetails/ViewOrders";
import OrderDetails from "./customer/pages/accountDetails/OrderDetails";
import ViewVouchers from "./customer/pages/accountDetails/ViewVouchers";
import ViewNotifications from "./customer/pages/accountDetails/ViewNotification";
import ShopDetail from "./customer/pages/ShopDetails";
import ProductListing from "./customer/pages/ProductListing";
import ProductDetailsScreen from "./customer/pages/ProductDetails";
import ViewuWallet from "./customer/pages/accountDetails/ViewWallet";
import FaqComp from "./customer/pages/FAQ/FaqComp";

//routes
import { MerchantRoutes, CustomerRoutes, AdminRoutes } from "./Routes";
import RequiredAdminAuth from "./admin/utils/AdminPrivateRoutes";
import VariationSection from "./merchant/components/Products/Variation";
import Shop from "./merchant/components/Shop/Shop";
import Settings from "./merchant/components/Settings";
import Finance from "./merchant/components/Finance";
import ShopRating from "./merchant/components/Shop/ShopRating";
import AddProdToCategory from "./merchant/components/Categories/AddProdToCategory";
import ChatScreen from "./components/chat/chatScreen";
import FooterLinkComponent from "./customer/pages/FooterLinkComponent";

import { HelmetProvider } from 'react-helmet-async';
import ShopList from "./customer/components/shopListing/shopList";
import Notifications from "./components/notifications/notifications";
import NewPaymentElement from "./customer/components/paymentComponents/newPaymentForm";
import GroupBuys from "./merchant/components/Marketing_Centre/GroupBuys";
import CreateGroupBuy from "./merchant/components/Marketing_Centre/GroupBuys/createGroupBuy";
import GroupBuyAll from "./customer/components/groupBuyComponents/groupBuyAll";
import ProductAnalysisViewMore from "./merchant/components/Dashboard/viewMore";
import OrderConfirmationPage from "./customer/components/paymentComponents/OrderConfirmation";
import QuickListing from "./merchant/components/Products/QuickListing";
import BarcodeUpload from "./merchant/components/Products/QuickListing/barcodeUpload";
import AffiliateSignUp from "./customer/components/affiliateCommissions/AffiliateSignup";
import ViewAffiliateCommissions from "./customer/components/affiliateCommissions/ViewAffiliateCommissions";
import AffiliateHandler from "./customer/pages/AffiliateHandler";
import AffiliateRedeem from "./customer/components/affiliateCommissions/AffiliateRedeem";
import SubAdminList from "./merchant/components/Shop/SubAdmin";
import CreateUpdateSubAdmin from "./merchant/components/Shop/SubAdmin/CreateUpdateSubAdmin";
import AccessDenied from "./merchant/pages/AccessDenied";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const helmetContext = {};

  return (
    <React.Fragment>
      <HelmetProvider context={helmetContext}>
        <ScrollToTop />
        <ToastContainer />
        <Routes>
          {/* Customer Routes */}
          <Route path={CustomerRoutes.Landing} element={<Home />} />
          <Route
            path={CustomerRoutes.AffiliateLanding + ":slug"}
            element={<AffiliateHandler />}
          />
          <Route element={<AuthBuyerLoginRoutes />}>
            <Route path={CustomerRoutes.SignUp} element={<SignUp />} />
            <Route path={CustomerRoutes.Login} element={<Login />} />
          </Route>
          <Route
            path={CustomerRoutes.ProductListing}
            element={<ProductListing />}
          />
          <Route
            path={CustomerRoutes.CategoryProductListing + ":slug"}
            element={<ProductListing />}
          />
          <Route
            path={CustomerRoutes.NewProductListing}
            element={<Wishlist />}
          />
          <Route
            path={CustomerRoutes.RecommendedProductListing}
            element={<Wishlist />}
          />
          <Route
            path={CustomerRoutes.ProductDetails + ":slug"}
            element={<ProductDetailsScreen />}
          />
          {/* <Route path={CustomerRoutes.ShopDetails} element={<ShopDetail />} /> */}
          <Route
            path={CustomerRoutes.ShopDetails + ":slug"}
            element={<ShopDetail />}
          />

          <Route path={CustomerRoutes.ShopList} element={<ShopList />} />
          <Route
            path={CustomerRoutes.Preview}
            element={<ProductDetailsScreen />}
          ></Route>

          <Route
            path={CustomerRoutes.FooterPages}
            element={<FooterLinkComponent />}
          />
          <Route path={CustomerRoutes.HelpWithId} element={<FaqComp />} />
          <Route path={CustomerRoutes.Help} element={<FaqComp />} />

          <Route
            path={CustomerRoutes.UshopBlogs}
            element={<UshopBlogs key={0} />}
          />
          <Route
            path={CustomerRoutes.UshopBlogsCategory}
            element={<UshopBlogs key={1} />}
          />
          <Route
            path={CustomerRoutes.UshopBlogsArticle}
            element={<UshopBlogsArticle />}
          />

          <Route path={CustomerRoutes.Wishlist} element={<Wishlist />} />
          <Route path={CustomerRoutes.MyCart} element={<MyCart />} />

          <Route
            path={CustomerRoutes.GroupBuyAll}
            element={<GroupBuyAll />}
          ></Route>

          <Route element={<AuthBuyerRoutes />}>
            <Route
              path={CustomerRoutes.OrderPayment}
              element={<NewPaymentElement />}
            />

            <Route
              path={CustomerRoutes.OrderConfirmation}
              element={<OrderConfirmationPage />}
            />

            <Route
              path={CustomerRoutes.CheckOutCart}
              element={<CheckOutCart />}
            />
            <Route
              path={CustomerRoutes.ViewProfile}
              element={<ViewProfile />}
            />
            <Route
              path={CustomerRoutes.ShippingAddress}
              element={<ShippingAddress />}
            />
            <Route
              path={CustomerRoutes.PaymentCard}
              element={<AddPaymentCard />}
            />
            <Route
              path={CustomerRoutes.ViewOrder}
              element={<ViewOrder />}
            ></Route>
            <Route
              path={CustomerRoutes.ViewOrderDetails + ":orderNumber"}
              element={<OrderDetails />}
            ></Route>
            <Route
              path={CustomerRoutes.ViewCashback}
              element={<ViewuWallet></ViewuWallet>}
            ></Route>
            <Route
              path={CustomerRoutes.AffiliateSignUp}
              element={<AffiliateSignUp />}
            ></Route>
            <Route
              path={CustomerRoutes.ViewAffiliateCommissions}
              element={<ViewAffiliateCommissions />}
            ></Route>
            <Route
              path={CustomerRoutes.AffiliateRedeem}
              element={<AffiliateRedeem />}
            ></Route>
            <Route
              path={CustomerRoutes.ViewVoucher}
              element={<ViewVouchers />}
            ></Route>
            <Route
              path={CustomerRoutes.UshopVoucher}
              element={<UshopVoucher />}
            ></Route>
            <Route
              path={CustomerRoutes.ViewNotifcation}
              element={<ViewNotifications />}
            ></Route>
            <Route
              path={CustomerRoutes.ChatScreen}
              element={<ChatScreen />}
            ></Route>
          </Route>

          {/* Merchant Routes */}
          {/* for testing/development modules */}
          <Route element={<AuthSellerLoginRoutes />}>
            <Route
              path={MerchantRoutes.Login}
              element={<SellerLanding page="login" level={1} />}
            />

            <Route
              path={MerchantRoutes.Register}
              element={<SellerLanding page="register" level={1} />}
            />
          </Route>

          <Route element={<AuthSellerRoutes />}>
            <Route
              path={MerchantRoutes.Development}
              element={<VariationSection />}
            />

            <Route
              path={MerchantRoutes.Landing}
              element={<SellerDashboard page="dashboard" level={1} />}
            />
            <Route
              path={MerchantRoutes.Products}
              element={<SellerProduct page="My-Products" level={1} />}
            />
            <Route
              path={MerchantRoutes.AddProduct}
              element={<SellerAddProduct page="Add-Product" level={2} />}
            />
            <Route
              path={MerchantRoutes.EditProduct}
              element={<SellerAddProduct page="Edit-Product" level={2} />}
            />
            <Route
              path={MerchantRoutes.ProductQuickListing}
              element={<QuickListing page="Quick-List-Product" level={2} />}
            />
            <Route
              path={MerchantRoutes.BarcodeUpload}
              element={<BarcodeUpload page="Barcode-Upload" level={2} />}
            />
            <Route
              path={MerchantRoutes.Categories}
              element={<SellerCategory page="Category-Listing" level={1} />}
            />
            <Route
              path={MerchantRoutes.Orders}
              element={<SellerOrders page="Orders" level={1} />}
            />
            <Route
              path={MerchantRoutes.ArrangeShipping}
              element={<SellerShippingArrangement page="Arrange Shipment" />}
            />

            <Route
              path={MerchantRoutes.ShippingSettings}
              element={
                <SellerShippingSettings page="Shipping-Settings" level={1} />
              }
            />

            <Route
              path={MerchantRoutes.ShopProfile}
              element={<Shop page="Shop-Profile" level={1} />}
            />

            <Route
              path={MerchantRoutes.ShopRating}
              element={<ShopRating page="Shop-Rating" level={1} />}
            />

            <Route
              path={MerchantRoutes.SubAdminList}
              element={<SubAdminList page="Sub-Admins" level={1} />}
            />

            <Route
              path={MerchantRoutes.CreateSubAdmin}
              element={
                <CreateUpdateSubAdmin page="Create-Sub-Admins" level={1} />
              }
            />

            <Route
              path={MerchantRoutes.SubAdminDetails}
              element={
                <CreateUpdateSubAdmin page="Sub-Admin-detail" level={1} />
              }
            />

            <Route
              path={MerchantRoutes.SubAdminUpdate}
              element={
                <CreateUpdateSubAdmin page="Sub-Admin-update" level={1} />
              }
            />

            <Route
              path={MerchantRoutes.VoucherSeller}
              element={<VoucherSeller page="Voucher" level={1} />}
            />

            <Route
              path={MerchantRoutes.AddVoucherSeller}
              element={<AddVoucherSeller page="Add-Voucher" level={1} />}
            />

            <Route
              path={MerchantRoutes.EditVoucher}
              element={<AddVoucherSeller page="Edit-Voucher" level={1} />}
            />

            <Route
              path={MerchantRoutes.BannerAds}
              element={<BannerAds page="Banner-Ads" level={1} />}
            />

            <Route
              path={MerchantRoutes.GroupBuys}
              element={<GroupBuys page="Group-Buys" level={1} />}
            />

            <Route
              path={MerchantRoutes.CreateGroupBuy}
              element={<CreateGroupBuy page="Create-Group-Buys" level={1} />}
            />

            <Route
              path={MerchantRoutes.EditGroupBuy}
              element={<CreateGroupBuy page="Edit-Group-Buys" level={1} />}
            />

            <Route
              path={MerchantRoutes.Settings}
              element={<Settings page="Settings" level={1} />}
            />

            <Route
              path={MerchantRoutes.Finance}
              element={<Finance page="finance" level={1} />}
            />

            <Route
              path={MerchantRoutes.ProductAnalysis}
              element={<ProductAnalysisViewMore page="product-analysis" />}
            />

            <Route
              path={MerchantRoutes.AddProdToCategory}
              element={<AddProdToCategory />}
            />
            <Route
              path={MerchantRoutes.ChatScreen}
              element={<ChatScreen />}
            ></Route>
            <Route
              path={MerchantRoutes.Notifications}
              element={<Notifications />}
            />

            <Route path={MerchantRoutes.NoAccess} element={<AccessDenied />} />
          </Route>
          <Route
            path={CustomerRoutes.ForgotPassword}
            element={<ForgotPassword page="forgot-password" />}
          />
          <Route
            path={CustomerRoutes.ResetPassword}
            element={<ForgotPassword page="reset-password" />}
          />
          <Route
            path={CustomerRoutes.ResetPasswordOtp}
            element={<ForgotPassword page="reset-password-otp" />}
          />
          <Route
            path={CustomerRoutes.ChangePassword}
            element={<ForgotPassword page="change-password" />}
          />
          <Route path={MerchantRoutes.ContactUs} element={<FaqComp />} />
          <Route path="*" element={<PageNotFound />} />

          {/* Start -- Admin Routes */}
          <Route element={<RequiredAdminAuth />}>
            <Route
              path={AdminRoutes.Landing}
              element={<AdminPages.AdminDashboard page="home" />}
            />
            <Route
              path={AdminRoutes.ManageCustomer}
              element={
                <AdminPages.AdminManageCustomer page="manage-customer" />
              }
            />
            <Route
              path={AdminRoutes.ManageSeller}
              element={<AdminPages.AdminManagerSeller page="manage-seller" />}
            />
            <Route
              path={AdminRoutes.ManageAdmin}
              element={<AdminPages.AdminManageAdmin page="manage-admin" />}
            />
            <Route
              path={AdminRoutes.ManageDeleteRequests}
              element={
                <AdminPages.AdminManageDeleteRequests page="manage-delete-requests" />
              }
            />
            <Route
              path={AdminRoutes.ManageAffiliateUsers}
              element={
                <AdminPages.AdminManageAffiliateUsers page="manage-affiliagte-users" />
              }
            />
            <Route
              path={AdminRoutes.ManageAffiliateWallet}
              element={
                <AdminPages.AdminManageAffiliateWallet page="manage-affiliagte-wallet" />
              }
            />
            <Route
              path={AdminRoutes.ManageProductCategories}
              element={
                <AdminPages.AdminManageProduct
                  page="product-categories"
                  key={0}
                />
              }
            />
            <Route
              path={AdminRoutes.SubProductCategories}
              element={
                <AdminPages.AdminManageProduct
                  page="product-categories"
                  key={1}
                />
              }
            />
            <Route
              path={AdminRoutes.ManageProductReviews}
              element={
                <AdminPages.AdminManageProductReview page="product-reviews" />
              }
            />
            <Route
              path={AdminRoutes.ManageProductList}
              element={
                <AdminPages.AdminManageProductList page="product-list" />
              }
            />
            <Route
              path={AdminRoutes.ManageOrders}
              element={<AdminPages.AdminManageOrder page="manage-order" />}
            />
            <Route
              path={AdminRoutes.ManageLateOrders}
              element={
                <AdminPages.AdminManageLateOrder page="manage-late-order" />
              }
            />
            <Route
              path={AdminRoutes.ManageOrderDetails}
              element={
                <AdminPages.AdminManageOrderDetails page="manage-order-details" />
              }
            />
            <Route
              path={AdminRoutes.ManageSellerWallet}
              element={
                <AdminPages.AdminManageSellerWallet page="finance-seller-requests" />
              }
            />
            <Route
              path={AdminRoutes.ManageTaxInvoices}
              element={
                <AdminPages.AdminManageTaxInvoices page="finance-tax-invoices" />
              }
            />
            <Route
              path={AdminRoutes.ManageMerchantWalletSummary}
              element={
                <AdminPages.AdminMerchantWalletReport page="finance-merchant-wallet-summary" />
              }
            />
            <Route
              path={AdminRoutes.ManageEmail}
              element={<AdminPages.AdminManageEmail page="email" />}
            />
            <Route
              path={AdminRoutes.EditEmailTemplate}
              element={<AdminPages.AdminEditEmailTemplate page="email-edit" />}
            />
            <Route
              path={AdminRoutes.ManageNewsletter}
              element={
                <AdminPages.AdminManageNewsletter page="user-newsletter" />
              }
            />

            <Route
              path={AdminRoutes.ManagePlatformVouchers}
              element={
                <AdminPages.AdminManagePlatformVoucher page="campaigns-voucher" />
              }
            />
            <Route
              path={AdminRoutes.ManageCampaigns}
              element={
                <AdminPages.AdminManageCampaigns page="campaigns-request" />
              }
            />
            <Route
              path={AdminRoutes.ManageCampaignsDetails}
              element={
                <AdminPages.AdminApproveRejectCampaigns page="campaigns-request-details" />
              }
            />
            <Route
              path={AdminRoutes.ManageBanners}
              element={
                <AdminPages.AdminManageBanners page="campaigns-banners" />
              }
            />

            <Route
              path={AdminRoutes.ManagePromotions}
              element={
                <AdminPages.AdminManagePromotions page="campaigns-promotions" />
              }
            />

            <Route
              path={AdminRoutes.ManageStaticContents}
              element={
                <AdminPages.AdminManageStaticContents page="web-contents-static" />
              }
            />
            <Route
              path={AdminRoutes.EditStaticContents}
              element={
                <AdminPages.AdminEditStaticContent page="web-contents-static-edit" />
              }
            />
            <Route
              path={AdminRoutes.ManageFAQ}
              element={<AdminPages.AdminManageFAQ page="web-contents-faq" />}
            />
            <Route
              path={AdminRoutes.ManageFAQCategories}
              element={
                <AdminPages.AdminManageFAQCategories page="web-contents-faq-categories" />
              }
            />
            <Route
              path={AdminRoutes.ManageFAQSubCategories}
              element={
                <AdminPages.AdminManageFAQCategories page="web-contents-faq-sub-categories" />
              }
            />
            <Route
              path={AdminRoutes.ManageBlogs}
              element={
                <AdminPages.AdminManageBlogs page="web-contents-blogs" />
              }
            />
            <Route
              path={AdminRoutes.ManageBlogCategories}
              element={
                <AdminPages.AdminManageBlogCategories page="web-contents-blog-categories" />
              }
            />
            <Route
              path={AdminRoutes.ManageShippingOptions}
              element={
                <AdminPages.AdminManageShippingOptions page="settings-shipping-options" />
              }
            />
            <Route
              path={AdminRoutes.ManageCancelReasons}
              element={
                <AdminPages.AdminManageCancelReasons
                  page="settings-cancel-reasons"
                  key={0}
                />
              }
            />
            <Route
              path={AdminRoutes.ManageSubCancelReasons}
              element={
                <AdminPages.AdminManageCancelReasons
                  page="settings-cancel-reasons"
                  key={1}
                />
              }
            />
            <Route
              path={AdminRoutes.ManageWebAnnouncement}
              element={
                <AdminPages.AdminManageAnnouncement page="settings-web-announcement" />
              }
            />
            <Route
              path={AdminRoutes.ManageSellerNotice}
              element={
                <AdminPages.AdminManageSellerNotice page="settings-seller-notice" />
              }
            />
            <Route
              path={AdminRoutes.ManageProfile}
              element={
                <AdminPages.AdminManageProfile page="settings-profile" />
              }
            />
            <Route
              path={AdminRoutes.ManageProhibitedKeywords}
              element={
                <AdminPages.AdminManageProhibitedKeywords page="settings-prohibited-keywords" />
              }
            />
            <Route
              path={AdminRoutes.ManagePublicHolidays}
              element={
                <AdminPages.AdminManagePublicHolidays page="settings-public-holidays" />
              }
            />
          </Route>
          <Route
            path={AdminRoutes.Login}
            element={<AdminPages.AdminLanding page="login" />}
          />
          <Route
            path={AdminRoutes.ForgotPassword}
            element={<AdminPages.AdminLanding page="forgot-password" />}
          />
          <Route
            path={AdminRoutes.ResetPassword}
            element={<AdminPages.AdminResetPassword />}
          />
          {/* End -- Admin Routes */}
        </Routes>
      </HelmetProvider>
    </React.Fragment>
  );
}

export default App;

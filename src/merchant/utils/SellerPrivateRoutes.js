import ls from "local-storage";
import { USER_TYPE } from "../../constants/general";
import { Navigate, Outlet } from "react-router-dom";
import { CustomerRoutes, MerchantRoutes } from "../../Routes";
import { checkSellerPermission, SELLER_ROUTE_PERMISSIONS } from "./Constants";
import AccessDenied from "../pages/AccessDenied";

export const AuthSellerRoutes = () => {
  let userType = ls("loggedUser");

  //sub seller account access check
  let currentPath = window.location.pathname;
  const obj = SELLER_ROUTE_PERMISSIONS();

  return userType === USER_TYPE.SELLER ? (
    !obj[currentPath] || (obj[currentPath] && checkSellerPermission(obj[currentPath])) ? (
      <Outlet />
    ) : (
      <AccessDenied />
    )
  ) : userType === USER_TYPE.BUYER ? (
    <Navigate to={CustomerRoutes.Landing} />
  ) : (
    <Navigate to={MerchantRoutes.Login} />
  );
};

export const AuthSellerLoginRoutes = () => {
  let userType = ls("loggedUser");

  return !userType ? <Outlet /> : <Navigate to={CustomerRoutes.Landing} />;
};

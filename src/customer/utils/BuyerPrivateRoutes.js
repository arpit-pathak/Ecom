import ls from "local-storage";
import { USER_TYPE } from "../../constants/general";
import { Navigate, Outlet } from "react-router-dom";
import { CustomerRoutes, MerchantRoutes } from "../../Routes";

export const AuthBuyerRoutes = () => {
  let userType = ls("loggedUser");
  return userType === USER_TYPE.BUYER ? (
    <Outlet />
  ) : userType === USER_TYPE.SELLER ? (
    <Navigate to={MerchantRoutes.Landing} />
  ) : (
    <Navigate to={CustomerRoutes.Login} replace />
  );
};

export const AuthBuyerLoginRoutes = () => {
  let userType = ls("loggedUser");

  return !userType ? (
    <Outlet />
  ) : userType === USER_TYPE.BUYER ? (
    <Navigate to={CustomerRoutes.Landing} />
  ) : (
    <Navigate to={MerchantRoutes.Landing} />
  );
};

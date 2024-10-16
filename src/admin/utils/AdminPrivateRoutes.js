import { Navigate, Outlet } from 'react-router-dom'
import { AdminRoutes, CustomerRoutes } from '../../Routes';
import useAuth from '../hooks/UseAuth';
import { USER_TYPE } from "../../constants/general.js";

//If user is not authenticated, redirect to admin login. Private Routes 
const AdminPrivateRoutes = () => {
    let { token } = useAuth();
    let user = localStorage.getItem("loggedUser");

    return (
        <>
            {
                //If user already logged in as seller or buyer, redirect to home page instead if trying to access admin login page
                USER_TYPE.BUYER == user || USER_TYPE.SELLER == user ? <Navigate to={CustomerRoutes.Landing} /> :
                    token ? <Outlet /> : <Navigate to={AdminRoutes.Login} />
            }
        </>
    )
}
export default AdminPrivateRoutes
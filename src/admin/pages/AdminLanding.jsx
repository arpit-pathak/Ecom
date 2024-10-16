import {Login,ForgotPassword} from "../components";
import { AdminRoutes } from '../../Routes';
import { useLocation } from "react-router-dom";
import logo from "../../assets/logo-white.svg";

const AdminLanding = () => {
    const location = useLocation();

    const componentMap = {
        [AdminRoutes.Login]: Login,
        [AdminRoutes.ForgotPassword]: ForgotPassword,
    };
      
    function renderComponent(param) {
        const Component = componentMap[param] || null;
        return Component ? <Component /> : null;
    };
      
    return(
        <>
            {/* Start - Background Design  */}
            <div className="h-screen w-full min-h-full flex flex-col justify-center sm:px-6 lg:px-8 bg-darkOrange">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <img
                        className="mx-auto h-12 w-auto"
                        src={logo}
                        alt="Logo"
                    />
                </div>
                {/* End - Background Design  */}

                {/* Start - Card Design */}
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        {/*Render Child Form Component Accordingly */}
                        {renderComponent(location.pathname)}
                    </div>
                </div>
                {/* End - Card Design */}
            </div>
        </>
    )
    

};
export default AdminLanding
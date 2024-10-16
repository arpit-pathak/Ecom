import { useState, useEffect } from 'react';
import { Sidebar, Header } from '../components/partials'
import { Messages, CommonStrings } from '../utils';
import useAuth from '../hooks/UseAuth';
import Modal from '../components/generic/Modal';
import { useNavigate } from 'react-router-dom';
import { AdminRoutes } from '../../Routes';
import { showToast, ToastContainerWrapper } from '../components/generic/Alerts';

// Higher order component that adds a page layout
const PageLayoutHOC = (WrappedComponent) => {
    const PageLayout = () => {
        const [sidebarOpen, setSidebarOpen] = useState(false);
        const [isOpen, setIsOpen] = useState(false);
        const auth = useAuth();
        const navigate = useNavigate();

        const handleConfirmation = () => {
            auth.updateToken()
            auth.setExpiration(false)
            setIsOpen(false)
            showToast(Messages.SESSION_RESET_SUCCESS, "success", "session-reset")
        }

        const handleOnClose = () => {
            setIsOpen(false)
            auth.logoutUser()
            navigate(AdminRoutes.Login)
        }

        useEffect(() => {
            setIsOpen(auth.expiration);
        }, [auth.expiration])

        return (
            <>
                {isOpen && (
                    <Modal
                        confirm={handleConfirmation}
                        open={isOpen} onClose={handleOnClose}
                        title={CommonStrings.SESSION_EXPIRED}
                        confirmText={CommonStrings.RESET}
                        cancelText={CommonStrings.CANCEL}
                    />
                )}
                <div className="flex h-screen overflow-hidden">
                    {/* Sidebar */}
                    <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                    {/* Content area */}
                    <div className="relative flex flex-col flex-1 overflow-x-hidden overflow-y-auto bg-slate-200">

                        {/*  Site header */}
                        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

                        <main >
                            {/* Main Content */}
                            <div className="w-full px-4 py-8 mx-auto sm:px-6 lg:px-4 max-w-9xl ">
                                <WrappedComponent />
                            </div>
                        </main>
                    </div>
                </div>
                <ToastContainerWrapper />
            </>
        );
    };
    return PageLayout;
}
export default PageLayoutHOC;
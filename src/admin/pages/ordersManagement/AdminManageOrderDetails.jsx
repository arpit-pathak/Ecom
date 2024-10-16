import OrderDetail from '../../components/partials/dashboard/ordersManagement/OrderDetail'
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageOrderDetails = () => {

    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.orders_view,
            UserPermissions.order_list_view
        ]}>
            <OrderDetail />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageOrderDetails);
import OrdersTable from '../../components/partials/dashboard/ordersManagement/OrdersTable'
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageOrders = () => {

    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.orders_view,
            UserPermissions.order_list_view
        ]}>
            <OrdersTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageOrders);
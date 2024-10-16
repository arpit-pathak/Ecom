import OrdersLateTable from '../../components/partials/dashboard/ordersManagement/OrdersLateTable'
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageLateOrders = () => {

    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.orders_view,
            UserPermissions.order_list_view
        ]}>
            <OrdersLateTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageLateOrders);
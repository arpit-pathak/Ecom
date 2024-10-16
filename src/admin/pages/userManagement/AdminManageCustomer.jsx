
import CustomerTable from '../../components/partials/dashboard/userManagement/CustomerTable';
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageCustomer = () => {
  return (
    <PermissionWrapper requiredPermissions={[
      UserPermissions.user_management_view,
      UserPermissions.customers_view,
    ]}>
      <CustomerTable />
    </PermissionWrapper>
  );
}

export default PageLayoutHOC(AdminManageCustomer);
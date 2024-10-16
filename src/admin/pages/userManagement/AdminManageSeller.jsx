import SellerTable from '../../components/partials/dashboard/userManagement/SellerTable';
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageSeller = () => {
  return (
    <PermissionWrapper requiredPermissions={[
      UserPermissions.user_management_view,
      UserPermissions.sellers_view,
    ]}>
      <SellerTable />
    </PermissionWrapper>
  );
}

export default PageLayoutHOC(AdminManageSeller);
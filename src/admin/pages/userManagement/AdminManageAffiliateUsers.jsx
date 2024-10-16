import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';
import AffiliateUserTable from '../../components/partials/dashboard/userManagement/Affiliate/AffiliateUserTable';

const AdminManageAffiliateUsers = () => {
  return (
    <PermissionWrapper requiredPermissions={[
      UserPermissions.user_management_view,
      UserPermissions.affiliate_users_view,
    ]}>
      <AffiliateUserTable />
    </PermissionWrapper>
  );
}

export default PageLayoutHOC(AdminManageAffiliateUsers);
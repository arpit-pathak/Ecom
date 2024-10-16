import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';
import AffiliateWalletTable from '../../components/partials/dashboard/userManagement/Affiliate/AffiliateWalletTable';

const AdminManageAffiliateWallet = () => {
  return (
    <PermissionWrapper requiredPermissions={[
      UserPermissions.user_management_view,
      UserPermissions.affiliate_wallet_view
    ]}>
      <AffiliateWalletTable />
    </PermissionWrapper>
  );
}

export default PageLayoutHOC(AdminManageAffiliateWallet);
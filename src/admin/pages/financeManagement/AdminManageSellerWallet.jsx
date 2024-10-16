import SellerWalletTable from '../../components/partials/dashboard/financeManagement/SellerWalletTable';
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageSellerWallet = () => {

    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.finance_view,
            UserPermissions.seller_wallet
        ]}>
            <SellerWalletTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageSellerWallet);
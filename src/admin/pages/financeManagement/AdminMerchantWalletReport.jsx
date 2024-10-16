import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';
import MerchantWalletReport from '../../components/partials/dashboard/financeManagement/MerchantWalletReport';

const AdminMerchantWalletReport = () => {

    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.finance_view,
            UserPermissions.sellers_view
        ]}>
            <MerchantWalletReport />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminMerchantWalletReport);
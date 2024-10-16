
import PageLayoutHOC from '../PageLayoutHOC';
import PlatformVoucherTable from '../../components/partials/dashboard/campaignsManagement/PlatformVoucherTable'
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManagePlatformVoucher = () => {
    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.campaigns_view,
            UserPermissions.platform_vouchers_view
        ]}>
            <PlatformVoucherTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManagePlatformVoucher);
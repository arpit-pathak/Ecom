import SellerNoticeTable from '../../components/partials/dashboard/settingsManagement/SellerNoticeTable'
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageSellerNotice = () => {

    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.settings_view,
            UserPermissions.web_notification_view
        ]}>
            <SellerNoticeTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageSellerNotice);
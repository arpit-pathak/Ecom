import CancelReasonsTable from '../../components/partials/dashboard/settingsManagement/CancelReasonsTable'
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageCancelReasons = () => {

    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.settings_view,
            UserPermissions.cancel_reasons_view
        ]}>
            <CancelReasonsTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageCancelReasons);
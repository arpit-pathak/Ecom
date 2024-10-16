
import DeleteRequestsTable from '../../components/partials/dashboard/userManagement/DeleteRequestsTable';
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageDeleteRequests = () => {
    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.user_management_view,
            UserPermissions.delete_requests_view,
        ]}>
            <DeleteRequestsTable />
        </PermissionWrapper>
    );
}

export default PageLayoutHOC(AdminManageDeleteRequests);
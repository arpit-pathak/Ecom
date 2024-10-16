import AdminTable from '../../components/partials/dashboard/userManagement/AdminTable';
import PageLayoutHOC from '../PageLayoutHOC';
import { UserType } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageAdmin = () => {
    return (
        <PermissionWrapper requiredPermissions={[UserType.SUPERADMIN]}>
            <AdminTable />
        </PermissionWrapper>
    );
}

export default PageLayoutHOC(AdminManageAdmin);
import StaticContentsTable from '../../components/partials/dashboard/webContentsManagement/StaticContentsTable'
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageStaticContents = () => {
    return (
        <PermissionWrapper requiredPermissions={[UserPermissions.web_contents_view,UserPermissions.static_contents_view]}>
            <StaticContentsTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageStaticContents);
import BlogsTable from '../../components/partials/dashboard/webContentsManagement/BlogsTable'
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageBlog = () => {
    return (
        <PermissionWrapper requiredPermissions={[UserPermissions.web_contents_view, UserPermissions.blogs_view]}>
            <BlogsTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageBlog);
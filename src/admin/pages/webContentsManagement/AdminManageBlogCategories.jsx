import BlogsCategoryTable from '../../components/partials/dashboard/webContentsManagement/BlogsCategoryTable'
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageBlogCategories = () => {
    return (
        <PermissionWrapper requiredPermissions={[UserPermissions.web_contents_view, UserPermissions.blog_categories_view]}>
            <BlogsCategoryTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageBlogCategories);
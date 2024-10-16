import FAQCategoriesTable from '../../components/partials/dashboard/webContentsManagement/FAQCategories/FAQCategoriesTable'
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageFAQCategories = () => {
    return (
        <PermissionWrapper requiredPermissions={[UserPermissions.web_contents_view, UserPermissions.faq_view]}>
            <FAQCategoriesTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageFAQCategories);
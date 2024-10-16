import FAQTable from '../../components/partials/dashboard/webContentsManagement/FAQTable'
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageFAQ = () => {
    return (
        <PermissionWrapper requiredPermissions={[UserPermissions.web_contents_view, UserPermissions.faq_view]}>
            <FAQTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageFAQ);
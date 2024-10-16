import ProhibitedKeywordsTable from '../../components/partials/dashboard/settingsManagement/ProhibitedKeywordsTable';
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageProhibitedKeywords = () => {
    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.settings_view,
            UserPermissions.prohibited_keywords_view
        ]}>
            <ProhibitedKeywordsTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageProhibitedKeywords);
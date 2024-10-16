import WebAnnouncementForm from '../../components/partials/dashboard/settingsManagement/WebAnnouncementForm'
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageAnnouncement = () => {

    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.settings_view,
            UserPermissions.web_announcement_view
        ]}>
            <WebAnnouncementForm />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageAnnouncement);
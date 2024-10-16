
import EmailTable from '../../components/partials/dashboard/emailNotifications/EmailTable';
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';


const AdminManageEmail = () => {
  return (
    <PermissionWrapper requiredPermissions={[UserPermissions.email_notifications_view, UserPermissions.email_templates_view]}>
      <EmailTable />
    </PermissionWrapper>
  );
}
export default PageLayoutHOC(AdminManageEmail);
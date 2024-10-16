import PageLayoutHOC from "../PageLayoutHOC";
import { UserPermissions } from "../../utils";
import { PermissionWrapper } from "../../components";
import UserNewsletterTable from "../../components/partials/dashboard/emailNotifications/UserNewsletterTable";

const AdminManageNewsletter = () => {
  return (
    <PermissionWrapper
      requiredPermissions={[
        UserPermissions.email_notifications_view,
        UserPermissions.newsletter_view,
      ]}
    >
      <UserNewsletterTable />
    </PermissionWrapper>
  );
};
export default PageLayoutHOC(AdminManageNewsletter);

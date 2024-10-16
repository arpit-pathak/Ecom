
import PageLayoutHOC from '../PageLayoutHOC';
import CampaignsTable from '../../components/partials/dashboard/campaignsManagement/CampaignsTable'
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageCampaigns = () => {
    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.campaigns_view,
            UserPermissions.campaigns_request_view
        ]}>
            <CampaignsTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageCampaigns);
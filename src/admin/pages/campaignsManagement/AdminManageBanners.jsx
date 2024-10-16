import PageLayoutHOC from '../PageLayoutHOC';
import BannersTable from '../../components/partials/dashboard/campaignsManagement/BannersTable'
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageBanners = () => {
    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.campaigns_view,
            UserPermissions.banner_view
        ]}>
            <BannersTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageBanners);
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';
import PromotionsForm from '../../components/partials/dashboard/campaignsManagement/PromotionsForm';

const AdminManagePromotions = () => {
    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.campaigns_view,
            UserPermissions.banner_view
        ]}>
            <PromotionsForm />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManagePromotions);
import ShippingOptionsTable from '../../components/partials/dashboard/settingsManagement/ShippingOptionsTable'
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManageShippingOptions = () => {

    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.settings_view,
            UserPermissions.shipping_options_view
        ]}>
            <ShippingOptionsTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageShippingOptions);
import PublicHolidaysTable from '../../components/partials/dashboard/settingsManagement/PublicHolidaysTable';
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';

const AdminManagePublicHolidays = () => {
    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.settings_view,
            UserPermissions.ph_holidays_view
        ]}>
            <PublicHolidaysTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManagePublicHolidays);
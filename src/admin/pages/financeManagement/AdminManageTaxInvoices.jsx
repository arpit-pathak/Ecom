import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';
import TaxInvoicesTable from '../../components/partials/dashboard/financeManagement/TaxInvoicesTable';

const AdminManageTaxInvoices = () => {

    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.finance_view,
            UserPermissions.seller_invoice_view
        ]}>
            <TaxInvoicesTable />
        </PermissionWrapper>
    );
}
export default PageLayoutHOC(AdminManageTaxInvoices);
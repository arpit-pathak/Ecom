import ProductListTable from '../../components/partials/dashboard/productsManagement/ProductListTable';
import PageLayoutHOC from '../PageLayoutHOC';
import { UserPermissions } from '../../utils';
import { PermissionWrapper } from '../../components';


const AdminManageProductList = () => {
    return (
        <PermissionWrapper requiredPermissions={[
            UserPermissions.products_view,
        ]}>
            <ProductListTable />
        </PermissionWrapper>
    )
}
export default PageLayoutHOC(AdminManageProductList);